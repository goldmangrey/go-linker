import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import BlockRenderer from '../components/BlockRenderer';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const PublicPage = () => {
    const { slug } = useParams();
    const [userData, setUserData] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [blocks, setBlocks] = useState([]);
    const [showProfile, setShowProfile] = useState(true);

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
                    // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
                    // Мы объединяем ID пользователя (uid) с остальными данными его профиля.
                    setUserData({ uid, ...userSnap.data() });

                    if (userSnap.data().showProfile !== undefined) {
                        setShowProfile(userSnap.data().showProfile);
                    }

                    const blocksRef = collection(db, 'users', uid, 'blocks');
                    const blocksSnap = await getDocs(query(blocksRef, orderBy('order')));
                    const loadedBlocks = blocksSnap.docs.map(doc => ({id: doc.id, ...doc.data()})); // Также добавил ID для блоков
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
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-500">
                Профиль не найден
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="flex items-center justify-center h-screen bg-white text-gray-400">
                Загрузка...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-800">
            {/* Обложка + логотип */}
            {showProfile && (
                <>
            <div className="relative h-40 sm:h-48 bg-gray-200">
                {userData.coverUrl && (
                    <img
                        src={userData.coverUrl}
                        alt="Cover"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-x-0 bottom-[-48px] flex justify-center">
                    <img
                        src={userData.logoUrl || '/assets/yourlogo.png'}
                        alt="Logo"
                        className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                    />
                </div>
            </div>


            {/* Название и адрес */}
                    <div className="text-center mt-14 px-4">
                        <h1 className="text-xl font-bold">{userData.orgName || 'Название'}</h1>
                        <p className="text-sm text-gray-500">{userData.orgAddress || 'Адрес'}</p>
                    </div>

        </>
    )}
            {/* Контент */}
            <div className="mt-6 px-4 pb-10">
                <BlockRenderer blocks={blocks} ownerId={userData?.uid} />
            </div>
        </div>
    );

};

export default PublicPage;
