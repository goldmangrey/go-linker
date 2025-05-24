import React, { useState } from 'react';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase/firebase';
import ProductCropper from './ProductCropper';

const EditCatalogModal = ({ block, onClose, onSave }) => {
    const [products, setProducts] = useState(block.products || []);
    const [title, setTitle] = useState(block.title || '');
    const [whatsappNumber, setWhatsappNumber] = useState(block.whatsappNumber || '');
    const [cropIndex, setCropIndex] = useState(null);
    const [rawImage, setRawImage] = useState(null);

    const handleAddProduct = () => {
        setProducts([...products, { name: '', price: '', imageUrl: '' }]);
    };

    const handleChange = (index, field, value) => {
        const updated = [...products];
        updated[index][field] = value;
        setProducts(updated);
    };

    const handleDeleteProduct = (index) => {
        const updated = [...products];
        updated.splice(index, 1);
        setProducts(updated);
    };

    const uploadImage = async (base64, index) => {
        const uid = auth.currentUser?.uid;
        if (!uid || !base64) return;
        const storage = getStorage();
        const fileRef = ref(storage, `products/${uid}/${Date.now()}.jpg`);
        await uploadString(fileRef, base64, 'data_url');
        const url = await getDownloadURL(fileRef);

        const updated = [...products];
        updated[index].imageUrl = url;
        setProducts(updated);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg space-y-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-bold text-center">Редактировать каталог</h2>

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
                        {p.imageUrl && (
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
                        onClick={() => onSave({ products, title, whatsappNumber })}
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
