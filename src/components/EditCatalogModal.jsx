import React, { useState } from 'react';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase/firebase';
import ProductCropper from './ProductCropper';

const EditCatalogModal = ({ block, onClose, onSave }) => {
    const [products, setProducts] = useState(block.products || []);
    const [title, setTitle] = useState(block.title || '');
    const [whatsappNumber, setWhatsappNumber] = useState(block.whatsappNumber || '');
    const [layout, setLayout] = useState(block.layout || 'grid');
    const [buttonColor, setButtonColor] = useState(block.buttonColor || 'bg-green-500');
    const [cropIndex, setCropIndex] = useState(null);
    const [rawImage, setRawImage] = useState(null);
    const [loadingStates, setLoadingStates] = useState(new Array(products.length).fill(false));

    const handleAddProduct = () => {
        setProducts([...products, { name: '', price: '', imageUrl: '' }]);
        setLoadingStates([...loadingStates, false]);
    };

    const handleChange = (index, field, value) => {
        const updated = [...products];
        updated[index][field] = value;
        setProducts(updated);
    };

    const handleDeleteProduct = (index) => {
        const updated = [...products];
        const loading = [...loadingStates];
        updated.splice(index, 1);
        loading.splice(index, 1);
        setProducts(updated);
        setLoadingStates(loading);
    };

    const uploadImage = async (base64, index) => {
        const uid = auth.currentUser?.uid;
        if (!uid || !base64) return;

        const loadingCopy = [...loadingStates];
        loadingCopy[index] = true;
        setLoadingStates(loadingCopy);

        const storage = getStorage();
        const fileRef = ref(storage, `products/${uid}/${Date.now()}.jpg`);
        await uploadString(fileRef, base64, 'data_url');
        const url = await getDownloadURL(fileRef);

        const updated = [...products];
        updated[index].imageUrl = url;
        setProducts(updated);

        loadingCopy[index] = false;
        setLoadingStates([...loadingCopy]);
    };

    const handleSave = () => {
        if (loadingStates.includes(true)) {
            alert('😢 Пожалуйста, подождите — загружается фото товара...');
            return;
        }
        onSave({ products, title, whatsappNumber, layout, buttonColor });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg space-y-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="relative">
                    <h2 className="text-lg font-bold text-center">Редактировать каталог</h2>
                    <button
                        onClick={onClose}
                        className="absolute top-0 right-0 text-xl text-gray-500 hover:text-black"
                    >
                        ✕
                    </button>
                </div>

                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Заголовок каталога"
                    className="w-full border rounded px-2 py-1"
                />

                <input
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Номер WhatsApp (например, 77081234567)"
                    className="w-full border rounded px-2 py-1"
                />

                <div className="space-y-1">
                    <label className="block text-sm font-medium">Режим отображения:</label>
                    <select
                        value={layout}
                        onChange={(e) => setLayout(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                    >
                        <option value="grid">Сетка (вниз)</option>
                        <option value="scroll">Скролл (вбок)</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium">Цвет кнопки «Купить»:</label>
                    <div className="flex flex-wrap gap-2">
                        {['bg-green-500', 'bg-blue-500', 'bg-orange-500', 'bg-rose-500', 'bg-gray-800'].map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setButtonColor(color)}
                                className={`w-6 h-6 rounded-full border-2 ${color} ${buttonColor === color ? 'ring-2 ring-black' : ''}`}
                                title={color}
                            />
                        ))}
                    </div>
                </div>

                {products.map((p, i) => (
                    <div key={i} className="border p-2 rounded space-y-1">
                        <input
                            value={p.name}
                            onChange={(e) => handleChange(i, 'name', e.target.value)}
                            placeholder="Название"
                            className="w-full border rounded px-2 py-1"
                        />
                        <input
                            type="number"
                            value={p.price}
                            onChange={(e) => handleChange(i, 'price', e.target.value)}
                            placeholder="Цена"
                            className="w-full border rounded px-2 py-1"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                setCropIndex(i);
                                setRawImage(URL.createObjectURL(e.target.files[0]));
                            }}
                            className="w-full"
                        />
                        {loadingStates[i] && (
                            <p className="text-sm text-yellow-600 animate-pulse">Загрузка изображения...</p>
                        )}
                        {p.imageUrl && !loadingStates[i] && (
                            <img
                                src={p.imageUrl}
                                alt="preview"
                                className="w-full h-24 object-cover rounded"
                            />
                        )}
                        <button
                            onClick={() => handleDeleteProduct(i)}
                            className="w-full bg-red-500 text-white rounded py-1 text-sm"
                        >
                            Удалить товар
                        </button>
                    </div>
                ))}

                <button onClick={handleAddProduct} className="text-lime-600 underline text-sm">
                    + Добавить товар
                </button>

                <div className="flex justify-between pt-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Отмена</button>
                    <button
                        onClick={handleSave}
                        className="bg-lime-500 text-white px-4 py-2 rounded"
                    >
                        Сохранить
                    </button>
                </div>
            </div>

            {rawImage && cropIndex !== null && (
                <ProductCropper
                    image={rawImage}
                    onCancel={() => {
                        setRawImage(null);
                        setCropIndex(null);
                    }}
                    onCropDone={(cropped) => {
                        uploadImage(cropped, cropIndex);
                        setRawImage(null);
                        setCropIndex(null);
                    }}
                />
            )}
        </div>
    );
};

export default EditCatalogModal;
