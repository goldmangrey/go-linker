import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase/firebase';
import ProductCropper from './ProductCropper';

const AddBlockModal = ({ onClose, onAdd }) => {
    const [buttonType, setButtonType] = useState('whatsapp');
    const [label, setLabel] = useState('Открыть');
    const [color, setColor] = useState('#25D366');

    const [type, setType] = useState('');
    const [rawImage, setRawImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);

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
            onAdd({ type, products, order: 9999 }); // временное значение
        } else if (type === 'gallery') {
            if (loading || images.length === 0) {
                alert('😢 Пожалуйста, дождитесь загрузки фото баннера');
                return;
            }
            onAdd({ type: 'gallery', images, order: 9999 });
        } else if (type === 'promo') {
            onAdd({ type: 'promo', text: 'Новая акция!', expiresAt: '', order: 9999 });
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
                    <option value="gallery">Баннер</option>
                    <option value="promo">Акция</option>

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

                {type === 'gallery' && (
                    <div className="space-y-2">
                        {images.length < 1 && (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setRawImage(URL.createObjectURL(e.target.files[0]));
                                }}
                                className="w-full"
                            />
                        )}

                        {loading && (
                            <p className="text-center text-yellow-600 animate-pulse text-sm">⏳ Загрузка баннера...</p>
                        )}

                        {!loading && images.length === 0 && (
                            <p className="text-center text-gray-400 text-sm">😢 Баннер ещё не загружен</p>
                        )}

                        {images[0] && (
                            <img
                                src={images[0]}
                                alt=""
                                className="w-full h-32 object-cover rounded"
                            />
                        )}
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
            {rawImage && (
                <ProductCropper
                    image={rawImage}
                    aspect={3 / 1}
                    onCancel={() => {
                        setRawImage(null);
                    }}
                    onCropDone={async (cropped) => {
                        const uid = auth.currentUser?.uid;
                        if (!uid) return;

                        setLoading(true);
                        const storage = getStorage();
                        const fileRef = ref(storage, `gallery/${uid}/${Date.now()}.jpg`);
                        await uploadString(fileRef, cropped, 'data_url');
                        const url = await getDownloadURL(fileRef);
                        setImages((prev) => [...prev, url]);
                        setLoading(false);
                        setRawImage(null);
                    }}
                />
            )}

        </div>
    );
};

export default AddBlockModal;
