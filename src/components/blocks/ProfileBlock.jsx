import React from 'react';

const ProfileBlock = ({ block, editable = false, onEdit }) => {
    const {
        coverUrl,
        logoUrl,
        orgName = 'Название организации',
        orgAddress = 'Адрес организации'
    } = block;

    return (
        <div className="relative border rounded-lg overflow-hidden shadow bg-white">
            {/* Обложка */}
            <div className="relative h-36 w-full">
                {coverUrl ? (
                    <img src={coverUrl} alt="Обложка" className="absolute inset-0 object-cover w-full h-full" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-lime-500 to-green-800" />
                )}
            </div>

            {/* Логотип + название */}
            <div className="relative -mt-10 mb-3 text-center px-3">
                <div>
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt="Лого"
                            className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-white shadow"
                        />
                    ) : (
                        <div className="w-20 h-20 mx-auto rounded-full border-4 border-gray-300 flex items-center justify-center text-xs text-gray-400 bg-white/40">
                            your logo
                        </div>
                    )}
                </div>
                <h2 className="mt-2 text-lg font-semibold">{orgName}</h2>
                <p className="text-sm text-gray-600">{orgAddress}</p>

                {editable && (
                    <button
                        onClick={() => onEdit && onEdit(block)}
                        className="mt-2 bg-black text-white text-xs px-3 py-1 rounded"
                    >
                        ✏️ Редактировать профиль
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProfileBlock;
