import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="bg-white w-full max-w-xs rounded-3xl overflow-hidden shadow-xl flex flex-col">

                {/* Верхняя часть: логотип */}
                <div className="flex flex-col items-center justify-center py-10 px-6">
                    <img
                        src="/assets/logo.svg" // замени на свою иконку или текст
                        alt="logo"
                        className="h-14 w-14 mb-4"
                    />
                    <h1 className="text-3xl font-bold text-black">Go-Link</h1>
                    <p className="text-xs tracking-[0.2em] text-gray-500 mt-1">LINK BUILDER</p>
                </div>

                {/* Нижняя часть: Welcome (половина экрана) */}
                <div className="bg-lime-400 flex-1 min-h-[50vh] px-6 py-8 text-center rounded-t-3xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-black mb-2">Добро пожаловать</h2>
                        <p className="text-sm text-black">
                            Создай свой мини-сайт за 1 минуту. <br /> Просто и бесплатно.
                        </p>
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={() => navigate('/signin')}
                            className="bg-black text-white px-5 py-2 rounded-full font-semibold hover:scale-105 transition"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-white text-black px-5 py-2 rounded-full font-semibold hover:scale-105 transition"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
