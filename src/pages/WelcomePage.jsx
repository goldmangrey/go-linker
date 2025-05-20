import React from 'react';
import { useNavigate } from 'react-router-dom';
import StarsBackground from '../components/StarsBackground';

const WelcomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="relative h-screen w-full bg-black text-white flex items-center justify-center px-6 overflow-hidden">
            <StarsBackground />

            <div className="text-center max-w-xs w-full z-10">
                {/* Логотип / название */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-lime-400">Go-Link</h1>
                    <p className="text-xs tracking-widest text-gray-400 mt-2">LINK BUILDER</p>
                </div>

                {/* Текст */}
                <h2 className="text-xl font-semibold mb-2">Создай свой мини-сайт</h2>
                <p className="text-sm text-gray-400 mb-8">Просто, быстро и бесплатно.</p>

                {/* Кнопки */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-lime-400 text-black font-semibold py-3 rounded-full hover:bg-lime-500 transition"
                    >
                        Начать
                    </button>
                    <button
                        onClick={() => navigate('/signin')}
                        className="border border-lime-400 text-lime-400 font-semibold py-3 rounded-full hover:bg-lime-500 hover:text-black transition"
                    >
                        Войти
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
