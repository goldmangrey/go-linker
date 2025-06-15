import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import ImageCropper from '../components/ImageCropper';
import CoverCropper from '../components/CoverCropper';
import BlockRenderer from "../components/BlockRenderer";
import AddBlockModal from '../components/AddBlockModal';
import AdminPanel from '../components/AdminPanel'; // Убедитесь, что импорт AdminPanel есть

const DashboardPage = () => {
    const [user, setUser] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logoUrl, setLogoUrl] = useState(null);
    const [coverUrl, setCoverUrl] = useState(null);
    const [orgName, setOrgName] = useState('');
    const [orgAddress, setOrgAddress] = useState('');
    const [rawLogoImage, setRawLogoImage] = useState(null);
    const [rawCoverImage, setRawCoverImage] = useState(null);
    const [showCoverEditor, setShowCoverEditor] = useState(false);
    const [showLogoEditor, setShowLogoEditor] = useState(false);
    const navigate = useNavigate();
    const [slug, setSlug] = useState('');
    const [showAddBlock, setShowAddBlock] = useState(false);
    const [showProfile, setShowProfile] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                navigate('/signin');
                return;
            }

            const docRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setUser({ uid: firebaseUser.uid, ...data });

                // Если это не админ, загружаем его блоки
                if (data.role !== 'admin') {
                    const blocksRef = collection(db, 'users', firebaseUser.uid, 'blocks');
                    const blocksQuery = query(blocksRef, orderBy('order'));
                    const blocksSnap = await getDocs(blocksQuery);
                    const loadedBlocks = blocksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setBlocks(loadedBlocks);

                    if (data.slug) setSlug(data.slug);
                    if (data.showProfile !== undefined) setShowProfile(data.showProfile);
                    if (data.coverUrl) setCoverUrl(data.coverUrl);
                    if (data.logoUrl) setLogoUrl(data.logoUrl);
                    if (data.orgName) setOrgName(data.orgName);
                    if (data.orgAddress) setOrgAddress(data.orgAddress);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/signin');
    };

    // --- Все остальные хендлеры (handleLogoChange, handleCoverChange и т.д.) остаются без изменений ---
    // --- Копипаст не требуется, они уже включены в финальный код ниже ---

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setRawLogoImage(reader.result);
            setShowLogoEditor(false);
        };
        reader.readAsDataURL(file);
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setRawCoverImage(reader.result);
            setShowCoverEditor(false);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadLogo = async (croppedDataUrl) => {
        if (!croppedDataUrl || !user) return;
        const storage = getStorage();
        const storageRef = ref(storage, `logos/${user.uid}`);
        await uploadString(storageRef, croppedDataUrl, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);
        await setDoc(doc(db, 'users', user.uid), { logoUrl: downloadURL }, { merge: true });
        setLogoUrl(downloadURL);
    };

    const handleUploadCover = async (croppedDataUrl) => {
        if (!croppedDataUrl || !user) return;
        const storage = getStorage();
        const storageRef = ref(storage, `covers/${user.uid}`);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            await uploadString(storageRef, base64, 'data_url');
            await new Promise((res) => setTimeout(res, 500));
            const downloadURL = await getDownloadURL(storageRef);
            await setDoc(doc(db, 'users', user.uid), { coverUrl: downloadURL }, { merge: true });
            setCoverUrl(downloadURL);
        };
        reader.readAsDataURL(croppedDataUrl);
    };

    const handleDeleteCover = async () => {
        if (!user) return;
        const storage = getStorage();
        const storageRef = ref(storage, `covers/${user.uid}`);
        await deleteObject(storageRef).catch(() => {});
        await setDoc(doc(db, 'users', user.uid), { coverUrl: '' }, { merge: true });
        setCoverUrl(null);
        setShowCoverEditor(false);
    };

    const handleDeleteLogo = async () => {
        if (!user) return;
        const storage = getStorage();
        const storageRef = ref(storage, `logos/${user.uid}`);
        await deleteObject(storageRef).catch(() => {});
        await setDoc(doc(db, 'users', user.uid), { logoUrl: '' }, { merge: true });
        setLogoUrl(null);
        setShowLogoEditor(false);
    };

    const handleDeleteBlock = async (index) => {
        const block = blocks[index];
        if (!block.id) return;
        await deleteDoc(doc(db, 'users', user.uid, 'blocks', block.id));
        setBlocks(blocks.filter((_, i) => i !== index));
    };

    const handleMoveBlock = async (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= blocks.length) return;

        const newBlocks = [...blocks];
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

        const reordered = newBlocks.map((block, idx) => ({ ...block, order: idx }));
        setBlocks(reordered);

        for (const block of reordered) {
            if (block.id) {
                await setDoc(doc(db, 'users', user.uid, 'blocks', block.id), { order: block.order }, { merge: true });
            }
        }
    };

    const handleUpdateBlock = async (updatedBlock) => {
        await setDoc(doc(db, 'users', user.uid, 'blocks', updatedBlock.id), updatedBlock);
        setBlocks((prev) => prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)));
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black text-white">
                <p className="text-lg animate-pulse">Загрузка...</p>
            </div>
        );
    }

    // --- ГЛАВНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ ---
    return (
        <div className="min-h-screen w-full bg-gray-100 flex justify-center items-start overflow-auto">
            <div className={`w-full bg-white min-h-screen shadow-xl ${user?.role === 'admin' ? 'sm:max-w-5xl' : 'sm:max-w-sm'}`}>
                {/* Общая шапка для всех */}
                <div className="bg-black text-white flex items-center justify-between px-4 py-3 z-20 relative">
                    <h1 className="text-lg font-bold flex-shrink-0">Go-Link</h1>
                    <button onClick={handleLogout} className="text-sm underline flex-shrink-0">Выйти</button>
                </div>

                {/* --- УСЛОВНЫЙ РЕНДЕРИНГ: АДМИН ИЛИ ПОЛЬЗОВАТЕЛЬ --- */}
                {user?.role === 'admin' ? (
                    // --- ВИД ДЛЯ АДМИНИСТРАТОРА ---
                    <div className="p-4">
                        <AdminPanel />
                    </div>
                ) : (
                    // --- ВИД ДЛЯ ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ ---
                    <>
                        <div className="text-center bg-gray-800 text-white py-2">
                            <a
                                href={`/u/${slug || ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm underline transition ${
                                    slug ? 'text-lime-400 hover:text-lime-300' : 'text-gray-500 pointer-events-none'
                                }`}
                            >
                                {slug ? `go-link.kz/u/${slug}` : 'Ссылка не задана'}
                            </a>
                        </div>

                        {showProfile && (
                            <>
                                <div className="relative h-36 w-full">
                                    {coverUrl ? <img src={coverUrl} alt="Обложка" className="absolute inset-0 object-cover w-full h-full" /> : <div className="absolute inset-0 bg-gradient-to-r from-lime-500 to-green-800"></div>}
                                    <button onClick={() => setShowCoverEditor(true)} className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Изменить</button>
                                </div>
                                <div className="relative -mt-10 mb-3 text-center">
                                    <div onClick={() => setShowLogoEditor(true)}>
                                        {logoUrl ? <img src={logoUrl} alt="Лого" className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-white cursor-pointer"/> : <div className="w-20 h-20 mx-auto rounded-full border-4 border-gray-300 flex items-center justify-center text-xs text-gray-400 bg-white/40 cursor-pointer">your logo</div>}
                                    </div>
                                    <input value={orgName} onChange={(e) => setOrgName(e.target.value)} onBlur={async () => await setDoc(doc(db, 'users', user.uid), { orgName }, { merge: true })} placeholder="Название организации" className="mt-2 text-center w-full text-lg font-semibold border-b border-transparent focus:border-gray-300 focus:outline-none"/>
                                    <input value={orgAddress} onChange={(e) => setOrgAddress(e.target.value)} onBlur={async () => await setDoc(doc(db, 'users', user.uid), { orgAddress }, { merge: true })} placeholder="Адрес организации" className="text-center w-full text-sm border-b border-transparent focus:border-gray-300 focus:outline-none"/>
                                </div>
                            </>
                        )}

                        <div className="text-center mb-4">
                            <button onClick={async () => { const updated = !showProfile; setShowProfile(updated); await setDoc(doc(db, 'users', user.uid), { showProfile: updated }, { merge: true }); }} className="text-sm text-gray-500 underline">
                                {showProfile ? 'Скрыть профиль' : 'Показать профиль'}
                            </button>
                        </div>

                        <div className="px-4 pb-20">
                            <BlockRenderer blocks={blocks} editable onDelete={handleDeleteBlock} onMove={handleMoveBlock} onUpdate={handleUpdateBlock} />
                            <div className="py-10 text-center">
                                <button onClick={() => setShowAddBlock(true)} className="bg-black text-white px-6 py-3 rounded-full shadow-lg">Добавить блок</button>
                            </div>
                        </div>
                    </>
                )}

                {/* Модальные окна остаются общими */}
                {rawLogoImage && <ImageCropper image={rawLogoImage} onCancel={() => setRawLogoImage(null)} onCropDone={async (cropped) => { setRawLogoImage(null); await handleUploadLogo(cropped); }} />}
                {rawCoverImage && <CoverCropper image={rawCoverImage} onCancel={() => setRawCoverImage(null)} onCropDone={async (cropped) => { setRawCoverImage(null); await handleUploadCover(cropped); }} />}
                {showCoverEditor && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-4 space-y-4 w-72">
                            <h3 className="text-center font-medium">Обложка</h3>
                            <button onClick={() => document.getElementById('cover-upload').click()} className="w-full py-2 bg-lime-500 text-white rounded">{coverUrl ? 'Заменить' : 'Загрузить'}</button>
                            {coverUrl && <button onClick={handleDeleteCover} className="w-full py-2 bg-red-500 text-white rounded">Удалить</button>}
                            <button onClick={() => setShowCoverEditor(false)} className="w-full py-2 bg-gray-200 rounded">Отмена</button>
                            <input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                        </div>
                    </div>
                )}
                {showLogoEditor && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-4 space-y-4 w-72">
                            <h3 className="text-center font-medium">Логотип</h3>
                            <button onClick={() => document.getElementById('logo-upload-btn').click()} className="w-full py-2 bg-lime-500 text-white rounded">{logoUrl ? 'Заменить' : 'Загрузить'}</button>
                            {logoUrl && <button onClick={handleDeleteLogo} className="w-full py-2 bg-red-500 text-white rounded">Удалить</button>}
                            <button onClick={() => setShowLogoEditor(false)} className="w-full py-2 bg-gray-200 rounded">Отмена</button>
                            <input id="logo-upload-btn" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                        </div>
                    </div>
                )}
                {showAddBlock && <AddBlockModal user={user} onClose={() => setShowAddBlock(false)} onAdd={async (block) => { const ref = collection(db, 'users', user.uid, 'blocks'); const newBlock = { ...block, order: blocks.length }; const docRef = await addDoc(ref, newBlock); setBlocks((prev) => [...prev, { ...newBlock, id: docRef.id }]); }}/>}
            </div>
        </div>
    );
};

export default DashboardPage;
