import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Модальное окно для управления товаром
const ItemModal = ({ item, onClose, onSave, userId }) => {
    const [name, setName] = useState(item?.name || '');
    const [price, setPrice] = useState(item?.price || 0);
    const [costPrice, setCostPrice] = useState(item?.costPrice || 0);
    const [stockQuantity, setStockQuantity] = useState(item?.stockQuantity || 0);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(item?.imageUrl || null);
    const [uploading, setUploading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        let imageUrl = item?.imageUrl || '';

        if (imageFile) {
            const storage = getStorage();
            // Путь теперь привязан к ID пользователя
            const storageRef = ref(storage, `users/${userId}/inventory/${Date.now()}-${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        onSave({ name, price, costPrice, stockQuantity, imageUrl });
        setUploading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{item ? 'Редактировать' : 'Добавить'} товар</h3>
                <div className="space-y-4">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" className="w-full border p-2 rounded" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Цена продажи (₸)" className="w-full border p-2 rounded" required />
                        <input type="number" value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} placeholder="Себестоимость (₸)" className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="text-sm">Остаток на складе (шт):</label>
                        <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(Number(e.target.value))} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <p className="text-sm mb-1">Изображение:</p>
                        <input type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className="text-sm" />
                        {imagePreview && <img src={imagePreview} alt="preview" className="w-20 h-20 mt-2 object-contain border rounded"/>}
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded text-sm">Отмена</button>
                    <button type="submit" disabled={uploading} className="px-4 py-2 bg-green-600 text-white rounded text-sm">{uploading ? 'Сохранение...' : 'Сохранить'}</button>
                </div>
            </form>
        </div>
    );
};

// Основной компонент для управления складом
const InventoryManager = ({ userId }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    // Коллекция теперь находится внутри документа пользователя
    const collectionRef = collection(db, 'users', userId, 'inventory');

    const fetchData = useCallback(async () => {
        setLoading(true);
        const q = query(collectionRef, orderBy('name'));
        const snapshot = await getDocs(q);
        setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
    }, [collectionRef]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async (itemData) => {
        if (currentItem) {
            await updateDoc(doc(collectionRef, currentItem.id), itemData);
        } else {
            await addDoc(collectionRef, { ...itemData, createdAt: new Date() });
        }
        fetchData();
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Удалить этот товар со склада?")) {
            await deleteDoc(doc(collectionRef, id));
            fetchData();
        }
    };

    const openModal = (item = null) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    if (loading) return <p>Загрузка склада...</p>;

    return (
        <div>
            <button onClick={() => openModal()} className="mb-4 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">+ Добавить товар на склад</button>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2">Название</th>
                        <th className="p-2">Цена продажи</th>
                        <th className="p-2">Себестоимость</th>
                        <th className="p-2">Остаток</th>
                        <th className="p-2 text-right">Действия</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {items.map(item => (
                        <tr key={item.id} className={`${(item.stockQuantity || 0) <= 10 ? 'bg-orange-50' : ''}`}>
                            <td className="p-2 font-medium flex items-center gap-3">
                                <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-contain rounded bg-gray-50 p-1"/>
                                {item.name}
                            </td>
                            <td className="p-2">{item.price} ₸</td>
                            <td className="p-2">{item.costPrice || 0} ₸</td>
                            <td className="p-2 font-semibold">{(item.stockQuantity || 0)} шт.</td>
                            <td className="p-2 text-right">
                                <button onClick={() => openModal(item)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded mr-2">Ред.</button>
                                <button onClick={() => handleDelete(item.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Удалить</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <ItemModal item={currentItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} userId={userId} />}
        </div>
    );
};

export default InventoryManager;
