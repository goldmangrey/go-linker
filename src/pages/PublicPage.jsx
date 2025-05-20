import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import BlockRenderer from '../components/BlockRenderer';
import { collection, getDocs } from 'firebase/firestore';

const PublicPage = () => {
    const { slug } = useParams();
    const [userData, setUserData] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [blocks, setBlocks] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const slugRef = doc(db, 'slugs', slug);
                const slugSnap = await getDoc(slugRef);

                if (!slugSnap.exists()) {
                    setNotFound(true);
                    return;
                }

                const uid = slugSnap.data().uid;
                const userRef = doc(db, 'users', uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const user = userSnap.data();
                    setUserData(user);

                    const blocksRef = collection(db, 'users', uid, 'blocks');
                    const blocksSnap = await getDocs(blocksRef);
                    const loadedBlocks = blocksSnap.docs.map(doc => doc.data());
                    setBlocks(loadedBlocks);
                } else {
                    setNotFound(true);
                }

            } catch (err) {
                console.error('Ошибка при загрузке страницы:', err);
                setNotFound(true);
            }
        };

        fetchUser();
    }, [slug]);

    if (notFound) {
        return <div className="text-center text-red-500 mt-10">Страница не найдена</div>;
    }

    if (!userData) {
        return <div className="text-center text-white mt-10">Загрузка...</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            {userData.coverUrl ? (
                <img src={userData.coverUrl} alt="Cover" className="w-full h-40 object-cover" />
            ) : (
                <div className="w-full h-40 bg-gradient-to-r from-lime-500 to-green-700" />
            )}

            <div className="relative -mt-10">
                {userData.logoUrl ? (
                    <img
                        src={userData.logoUrl}
                        alt="Logo"
                        className="w-20 h-20 rounded-full border-4 border-white object-cover"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-full border-4 border-white bg-white/20 text-xs text-white flex items-center justify-center">
                        no logo
                    </div>
                )}
            </div>

            <div className="mt-4 text-center">
                <h1 className="text-2xl font-bold">{userData.orgName}</h1>
                <p className="text-sm text-gray-400">{userData.orgAddress}</p>
            </div>

            {/* ⬇ Тут позже будут блоки ⬇ */}
            <div className="w-full max-w-sm mt-8 px-4 space-y-4">
                <BlockRenderer blocks={blocks} />
            </div>

        </div>
    );
};

export default PublicPage;
