import React, { useState } from 'react';

const EditButtonModal = ({ block, onClose, onSave }) => {
    const [type, setType] = useState(block.type || 'whatsapp');
    const [label, setLabel] = useState(block.label || 'Открыть');
    const [number, setNumber] = useState(block.number || '');
    const [color, setColor] = useState(block.color || '#25D366');
    const [link, setLink] = useState(block.link || '');

    const handleSave = () => {
        onSave({
            ...block,
            type,
            number,
            label,
            color,
            link: type === '2gis' ? number : '',
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg space-y-4 w-full max-w-md">
                <h2 className="text-lg font-bold text-center">Редактировать кнопку</h2>

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="2gis">2ГИС</option>
                </select>

                <input
                    type="text"
                    placeholder={type === '2gis' ? 'Ссылка на 2ГИС' : 'Номер телефона'}
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                />

                <input
                    type="text"
                    placeholder="Текст кнопки"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                />

                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 rounded"
                />

                <div className="flex justify-between pt-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Отмена</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-lime-500 text-white rounded">Сохранить</button>
                </div>
            </div>
        </div>
    );
};

export default EditButtonModal;
