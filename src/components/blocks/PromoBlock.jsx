import React, { useState, useEffect } from 'react';
import EditPromoModal from '../EditPromoModal';

const PromoBlock = ({ block, editable = false, onEdit }) => {
    const [showEditor, setShowEditor] = useState(false);
    const [remaining, setRemaining] = useState('');

    const colorMap = {
        yellow: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-400',
            text: 'text-yellow-800'
        },
        red: {
            bg: 'bg-red-50',
            border: 'border-red-400',
            text: 'text-red-800'
        },
        green: {
            bg: 'bg-green-50',
            border: 'border-green-400',
            text: 'text-green-800'
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-400',
            text: 'text-blue-800'
        },
        gray: {
            bg: 'bg-gray-100',
            border: 'border-gray-300',
            text: 'text-gray-800'
        }
    };

    const theme = colorMap[block.color] || colorMap.yellow;

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const expires = new Date(block.expiresAt);
            const diff = expires - now;

            if (diff <= 0) {
                setRemaining('Акция завершена');
            } else {
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                const seconds = Math.floor((diff / 1000) % 60);
                let urgent = '';
                if (diff < 3600000) urgent = '🔥 ';
                if (diff < 300000) urgent = '⏰ ';
                setRemaining(`${urgent}${hours}ч ${minutes}м ${seconds}с`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [block.expiresAt]);

    return (
        <div className={`relative border-l-4 ${theme.border} ${theme.bg} p-4 rounded shadow`}>
            {editable && (
                <button
                    onClick={() => setShowEditor(true)}
                    className="absolute top-2 right-2 bg-yellow-400 text-white text-xs px-3 py-1 rounded shadow hover:bg-yellow-500"
                >
                    ✏️ Редактировать
                </button>
            )}

            <p className={`text-lg font-semibold ${theme.text}`}>{block.text}</p>

            {block.link && (
                <a
                    href={block.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-blue-600 underline"
                >
                    Подробнее →
                </a>
            )}

            <p
                className={`text-sm mt-1 ${
                    remaining.includes('⏰')
                        ? 'text-red-600 animate-pulse'
                        : remaining.includes('🔥')
                            ? 'text-orange-600'
                            : theme.text
                }`}
            >
                До конца акции: {remaining}
            </p>

            {showEditor && (
                <EditPromoModal
                    block={block}
                    onClose={() => setShowEditor(false)}
                    onSave={(updated) => {
                        const fullBlock = { ...block, ...updated };
                        onEdit && onEdit(fullBlock);
                        setShowEditor(false);
                    }}
                />
            )}
        </div>
    );
};

export default PromoBlock;