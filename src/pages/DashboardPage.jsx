import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import ImageCropper from '../components/ImageCropper';
import CoverCropper from '../components/CoverCropper';
import BlockRenderer from "../components/BlockRenderer";
import AddBlockModal from '../components/AddBlockModal';


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
                const blocksRef = collection(db, 'users', firebaseUser.uid, 'blocks');
                const blocksSnap = await getDocs(blocksRef);
                const loadedBlocks = blocksSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

                setBlocks(loadedBlocks);
                setUser({ ...firebaseUser, ...data });
                if (data.slug) setSlug(data.slug);
                if (data.slug) {
                    setSlug(data.slug);
                    console.log('Загружен slug:', data.slug);
                }

                if (data.coverUrl) setCoverUrl(data.coverUrl);
                if (data.orgName) setOrgName(data.orgName);
                if (data.orgAddress) setOrgAddress(data.orgAddress);
                setLoading(false); // ✅ переместили внутрь блока
            } else {
                // fallback, если нет данных
                setUser(firebaseUser);
                setLoading(false);
            }


        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/signin');
    };

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

// Добавим небольшую задержку (100-200 мс)
            await new Promise((res) => setTimeout(res, 500));

            const downloadURL = await getDownloadURL(storageRef);

            await setDoc(doc(db, 'users', user.uid), { coverUrl: downloadURL }, { merge: true });
            setCoverUrl(downloadURL);
        };
        reader.readAsDataURL(croppedDataUrl); // преобразует Blob → base64
        const downloadURL = await getDownloadURL(storageRef);
        await setDoc(doc(db, 'users', user.uid), { coverUrl: downloadURL }, { merge: true });
        setCoverUrl(downloadURL);
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
    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black text-white">
                <p className="text-lg animate-pulse">Загрузка...</p>
            </div>
        );
    }
    const handleDeleteBlock = async (index) => {
        const block = blocks[index];
        if (!block.id) return;
        await deleteDoc(doc(db, 'users', user.uid, 'blocks', block.id));
        setBlocks(blocks.filter((_, i) => i !== index));
    };

    const handleMoveBlock = async (index, direction) => {
        const newBlocks = [...blocks];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

        // Переставляем
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

        // Обновляем порядок в памяти
        const reordered = newBlocks.map((block, i) => ({
            ...block,
            order: i
        }));
        setBlocks(reordered);

        // Сохраняем порядок в Firestore
        for (const block of reordered) {
            await setDoc(doc(db, 'users', user.uid, 'blocks', block.id), block);
        }
    };

    const handleUpdateBlock = async (updatedBlock) => {
        await setDoc(doc(db, 'users', user.uid, 'blocks', updatedBlock.id), updatedBlock);
        setBlocks((prev) =>
            prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b))
        );
    };


    return (
        <div className="min-h-screen w-full bg-black flex justify-center items-start overflow-auto pt-6">
            <div className="w-full sm:max-w-sm bg-white min-h-screen shadow-xl overflow-hidden relative">

                <div className="bg-black text-white flex items-center px-4 py-3 z-20 relative">
                    <h1 className="text-lg font-bold flex-shrink-0">Go-Link</h1>

                    <div className="flex-grow text-center">
                        <a
                            href={`https://go-linker.netlify.app/u/${slug || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm underline transition ${
                                slug ? 'text-lime-400 hover:text-lime-300' : 'text-gray-500 pointer-events-none'
                            }`}
                        >
                            {slug ? `/u/${slug}` : 'Загрузка...'}
                        </a>
                    </div>


                    <button onClick={handleLogout} className="text-sm underline flex-shrink-0">Выйти</button>
                </div>


                {/*<div className="relative h-36 w-full">*/}
                {/*    {coverUrl ? (*/}
                {/*        <img src={coverUrl} alt="Обложка" className="absolute inset-0 object-cover w-full h-full" />*/}
                {/*    ) : (*/}
                {/*        <div className="absolute inset-0 bg-gradient-to-r from-lime-500 to-green-800"></div>*/}
                {/*    )}*/}
                {/*    <button*/}
                {/*        onClick={() => setShowCoverEditor(true)}*/}
                {/*        className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded"*/}
                {/*    >*/}
                {/*        Изменить обложку*/}
                {/*    </button>*/}
                {/*</div>*/}

                {/*<div className="relative -mt-10 mb-3 text-center">*/}
                {/*    <div onClick={() => setShowLogoEditor(true)}>*/}
                {/*        {logoUrl ? (*/}
                {/*            <img*/}
                {/*                src={logoUrl}*/}
                {/*                alt="Лого"*/}
                {/*                className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-white cursor-pointer"*/}
                {/*            />*/}
                {/*        ) : (*/}
                {/*            <div className="w-20 h-20 mx-auto rounded-full border-4 border-gray-300 flex items-center justify-center text-xs text-gray-400 bg-white/40 cursor-pointer">*/}
                {/*                your logo*/}
                {/*            </div>*/}
                {/*        )}*/}
                {/*    </div>*/}
                {/*    <h2 className="mt-2 text-lg font-semibold">{orgName || 'Название организации'}</h2>*/}
                {/*    <p className="text-sm text-gray-600">{orgAddress || 'Адрес организации'}</p>*/}
                {/*</div>*/}

                <div className="px-4">
                    <div className="space-y-4">
                        <BlockRenderer
                            blocks={blocks}
                            editable
                            onDelete={handleDeleteBlock}
                            onMove={handleMoveBlock}
                            onUpdate={handleUpdateBlock}
                        />


                    </div>

                    <div className="py-10 text-center">
                        <button
                            onClick={() => setShowAddBlock(true)}
                            className="bg-black text-white px-6 py-3 rounded-full shadow-lg"
                        >
                            Добавить блок
                        </button>
                    </div>
                    {slug && (
                        <p className="text-center text-sm text-gray-500 mt-6">
                            Ваша ссылка: <a href={`https://go-linker.netlify.app/u/${slug}`} className="text-lime-600 underline">go-linker.netlify.app/u/{slug}</a>
                        </p>
                    )}
                </div>

                {rawLogoImage && (
                    <ImageCropper
                        image={rawLogoImage}
                        onCancel={() => setRawLogoImage(null)}
                        onCropDone={async (croppedDataUrl) => {
                            setRawLogoImage(null);
                            await handleUploadLogo(croppedDataUrl);
                        }}
                    />
                )}

                {rawCoverImage && (
                    <CoverCropper
                        image={rawCoverImage}
                        onCancel={() => setRawCoverImage(null)}
                        onCropDone={async (croppedDataUrl) => {
                            setRawCoverImage(null);
                            await handleUploadCover(croppedDataUrl);
                        }}
                    />
                )}

                {showCoverEditor && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-4 space-y-4 w-72">
                            <h3 className="text-center font-medium">Изменить обложку</h3>
                            {coverUrl ? (
                                <>
                                    <button
                                        onClick={() => document.getElementById('cover-upload').click()}
                                        className="w-full py-2 bg-lime-500 text-white rounded"
                                    >
                                        Заменить фото
                                    </button>
                                    <button
                                        onClick={handleDeleteCover}
                                        className="w-full py-2 bg-red-500 text-white rounded"
                                    >
                                        Удалить обложку
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => document.getElementById('cover-upload').click()}
                                        className="w-full py-2 bg-lime-500 text-white rounded"
                                    >
                                        Загрузить фото
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setShowCoverEditor(false)}
                                className="w-full py-2 bg-gray-200 rounded"
                            >
                                Отмена
                            </button>
                            <input
                                id="cover-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCoverChange}
                            />
                        </div>
                    </div>
                )}

                {showLogoEditor && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-4 space-y-4 w-72">
                            <h3 className="text-center font-medium">Изменить логотип</h3>
                            {logoUrl ? (
                                <>
                                    <button
                                        onClick={() => document.getElementById('logo-upload-btn').click()}
                                        className="w-full py-2 bg-lime-500 text-white rounded"
                                    >
                                        Заменить логотип
                                    </button>
                                    <button
                                        onClick={handleDeleteLogo}
                                        className="w-full py-2 bg-red-500 text-white rounded"
                                    >
                                        Удалить логотип
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => document.getElementById('logo-upload-btn').click()}
                                        className="w-full py-2 bg-lime-500 text-white rounded"
                                    >
                                        Загрузить логотип
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setShowLogoEditor(false)}
                                className="w-full py-2 bg-gray-200 rounded"
                            >
                                Отмена
                            </button>
                            <input
                                id="logo-upload-btn"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoChange}
                            />
                        </div>
                    </div>
                )}
            </div>
            {showAddBlock && (
                <AddBlockModal
                    onClose={() => setShowAddBlock(false)}
                    onAdd={async (block) => {
                        const ref = collection(db, 'users', user.uid, 'blocks');
                        const order = blocks.length;
                        const newBlock = { ...block, order };
                        const docRef = await addDoc(ref, newBlock);
                        setBlocks((prev) => [...prev, { ...newBlock, id: docRef.id }]);
                    }}
                />

            )}

        </div>
    );
};

export default DashboardPage;