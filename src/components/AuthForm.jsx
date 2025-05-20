import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const AuthForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Неверный логин или пароль');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-green-800 px-6">
            <div className="w-full max-w-sm space-y-6 text-white">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-lime-400">Sign in</h1>
                    <p className="text-sm text-gray-300">Добро пожаловать!</p>
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <div className="space-y-4">
                    <InputField icon={<FaEnvelope />} value={email} onChange={setEmail} placeholder="Email" />
                    <InputField icon={<FaLock />} value={password} onChange={setPassword} placeholder="Password" type="password" />
                </div>

                <button onClick={handleLogin} className="bg-lime-400 text-black font-semibold w-full py-3 rounded-lg hover:bg-lime-500 transition">
                    SIGN IN
                </button>

                <p className="text-center text-sm text-gray-300">
                    Нет аккаунта? <a href="/signup" className="text-lime-400 font-semibold">Регистрация</a>
                </p>
            </div>
        </div>
    );
};

const InputField = ({ icon, value, onChange, placeholder, type = "text" }) => (
    <div className="flex items-center bg-black/30 backdrop-blur rounded-lg px-4 py-3">
        <div className="mr-2 text-gray-400">{icon}</div>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-transparent outline-none w-full text-white"
        />
    </div>
);

export default AuthForm;
