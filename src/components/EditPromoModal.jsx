import React, { useState } from 'react';

const EditPromoModal = ({ block, onClose, onSave }) => {
    const colorStyles = {
        yellow: 'bg-yellow-400',
        red: 'bg-red-400',
        green: 'bg-green-400',
        blue: 'bg-blue-400',
        gray: 'bg-gray-400',
    };
    const [text, setText] = useState(block.text || '');
    const [date, setDate] = useState(block.expiresAt || '');
    const [link, setLink] = useState(block.link || '');
    const [color, setColor] = useState(block.color || 'yellow');

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg w-full max-w-md space-y-4">
                <h2 className="text-center font-bold">Редактировать акцию</h2>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Описание акции"
                    rows={3}
                    className="w-full border px-2 py-1 rounded"
                />

                <div className="flex gap-2">
                    <input
                        type="date"
                        value={date.split('T')[0]}
                        onChange={(e) => {
                            const time = date.split('T')[1] || '12:00';
                            setDate(`${e.target.value}T${time}`);
                        }}
                        className="w-1/2 border px-2 py-1 rounded"
                    />
                    <input
                        type="time"
                        value={date.split('T')[1] || '12:00'}
                        onChange={(e) => {
                            const d = date.split('T')[0] || new Date().toISOString().split('T')[0];
                            setDate(`${d}T${e.target.value}`);
                        }}
                        className="w-1/2 border px-2 py-1 rounded"
                    />
                </div>

                <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Ссылка (необязательно)"
                    className="w-full border px-2 py-1 rounded"
                />
                <div>
                    <label className="block text-sm font-medium mb-1">Цвет блока:</label>
                    <div className="flex gap-2">


                        {['yellow', 'green', 'red', 'blue', 'gray'].map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={`w-6 h-6 rounded-full border-2 ${
                                    color === c ? 'ring-2 ring-black' : 'ring-1 ring-gray-200'
                                } ${colorStyles[c]}`}
                                title={c}
                            />
                        ))}

                    </div>
                </div>

                <div className="flex justify-between">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Отмена</button>
                    <button
                        onClick={() => onSave({ text, expiresAt: date, link, color })}
                        className="bg-lime-500 text-white px-4 py-2 rounded"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPromoModal;
