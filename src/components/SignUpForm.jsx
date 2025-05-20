import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const SignUpForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [orgAddress, setOrgAddress] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;
            let slug = orgName.toLowerCase().replace(/\s+/g, '-');
            let finalSlug = slug;
            let index = 1;

            while (true) {
                const slugSnap = await getDoc(doc(db, 'slugs', finalSlug));
                if (!slugSnap.exists()) break;
                finalSlug = `${slug}-${index++}`;
            }


            await setDoc(doc(db, 'users', uid), {
                email,
                orgName,
                orgAddress,
                logoUrl: '/assets/yourlogo.png',
                coverUrl: '',
                slug: finalSlug // ✅ ключ должен быть slug
            });


            await setDoc(doc(db, 'slugs', finalSlug), {
                uid
            });

            navigate('/dashboard');
        } catch (error) {
            console.error('Ошибка регистрации:', error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-green-800 px-6">
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 text-white">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-lime-400">Sign Up</h1>
                    <p className="text-sm text-gray-300">Введите данные вашей организации</p>
                </div>

                <input
                    type="text"
                    placeholder="Название организации"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur text-white outline-none"
                    required
                />

                <input
                    type="text"
                    placeholder="Адрес организации"
                    value={orgAddress}
                    onChange={(e) => setOrgAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur text-white outline-none"
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur text-white outline-none"
                    required
                />

                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black/30 backdrop-blur text-white outline-none"
                    required
                />

                <button
                    type="submit"
                    className="w-full py-3 bg-lime-400 text-black font-semibold rounded-lg hover:bg-lime-500 transition"
                >
                    Зарегистрироваться
                </button>
            </form>
        </div>
    );
};

export default SignUpForm;
