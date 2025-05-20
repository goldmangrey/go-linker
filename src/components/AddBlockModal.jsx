import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase/firebase';

const AddBlockModal = ({ onClose, onAdd }) => {
    const [buttonType, setButtonType] = useState('whatsapp');
    const [label, setLabel] = useState('Открыть');
    const [color, setColor] = useState('#25D366');

    const [type, setType] = useState('');
    const [number, setNumber] = useState('');
    const [products, setProducts] = useState([{ name: '', imageUrl: '', price: '' }]);
    const uploadImageToStorage = async (file) => {
        const uid = auth.currentUser?.uid;
        if (!uid || !file) return '';

        const storage = getStorage();
        const fileRef = ref(storage, `products/${uid}/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        return downloadURL;
    };

    const handleAddProduct = () => {
        setProducts([...products, { name: '', imageUrl: '', price: '' }]);
    };

    const handleChangeProduct = async (index, field, value) => {
        const updated = [...products];
        if (field === 'image') {
            const file = value.target.files[0];
            if (file) {
                const imageUrl = await uploadImageToStorage(file);
                updated[index]['imageUrl'] = imageUrl;
            }
        } else {
            updated[index][field] = value;
        }
        setProducts(updated);
    };


    const handleSubmit = () => {
        if (type === 'whatsapp') {
            onAdd({
                type: buttonType,
                number,
                label,
                color,
                link: buttonType === '2gis' ? number : ''
            });
        } else if (type === 'catalog') {
            onAdd({ type, products });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg space-y-4 w-[90%] max-w-md">
                <h2 className="text-lg font-semibold text-center">Добавить блок</h2>

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                >
                    <option value="">Выберите тип</option>
                    <option value="whatsapp">Кнопка</option>
                    <option value="catalog">Каталог</option>
                </select>

                {type === 'whatsapp' && (
                    <div className="space-y-2">
                        <select
                            value={buttonType}
                            onChange={(e) => setButtonType(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="whatsapp">WhatsApp</option>
                            <option value="2gis">2ГИС</option>
                        </select>

                        <input
                            type="text"
                            placeholder={buttonType === 'whatsapp' ? 'Номер телефона' : 'Ссылка на 2ГИС'}
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
                    </div>
                )}


                {type === 'catalog' && (
                    <div className="space-y-2">
                        {products.map((p, i) => (
                            <div key={i} className="space-y-1 border p-2 rounded">
                                <input
                                    type="text"
                                    placeholder="Название"
                                    value={p.name}
                                    onChange={(e) => handleChangeProduct(i, 'name', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleChangeProduct(i, 'image', e)}
                                    className="w-full border rounded px-2 py-1"
                                />
                                {p.imageUrl && (
                                    <img src={p.imageUrl} alt="preview" className="w-full h-24 object-cover rounded mt-1" />
                                )}

                                <input
                                    type="number"
                                    placeholder="Цена"
                                    value={p.price}
                                    onChange={(e) => handleChangeProduct(i, 'price', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </div>
                        ))}
                        <button
                            onClick={handleAddProduct}
                            className="text-sm text-lime-600 underline"
                        >
                            + Добавить товар
                        </button>
                    </div>
                )}

                <div className="flex justify-between">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 px-4 py-2 rounded"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-lime-500 text-white px-4 py-2 rounded"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBlockModal;
