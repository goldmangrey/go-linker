import React, { useState, useEffect, useCallback } from 'react'; // 1. Добавили useCallback
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

const ItemManager = ({ collectionName, title }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    // 2. Обернули fetchData в useCallback
    const fetchData = useCallback(async () => {
        setLoading(true);
        const q = query(collection(db, collectionName), orderBy('name'));
        const querySnapshot = await getDocs(q);
        setItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
    }, [collectionName]); // Указали зависимость для useCallback

    useEffect(() => {
        fetchData();
    }, [fetchData]); // 3. Теперь зависимость useEffect - это сама функция fetchData

    const handleSave = async (itemData) => {
        if (currentItem) {
            const itemRef = doc(db, collectionName, currentItem.id);
            await updateDoc(itemRef, itemData);
        } else {
            await addDoc(collection(db, collectionName), itemData);
        }
        fetchData();
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить этот элемент?")) {
            await deleteDoc(doc(db, collectionName, id));
            fetchData();
        }
    };

    const openModal = (item = null) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    if (loading) return <p>Загрузка...</p>;

    return (
        <div>
            <button onClick={() => openModal()} className="mb-4 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                + Добавить {title}
            </button>
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100">
                <tr>
                    <th className="p-2">Изображение</th>
                    <th className="p-2">Название</th>
                    <th className="p-2">Цена (₸)</th>
                    <th className="p-2">Статус</th>
                    <th className="p-2 text-right">Действия</th>
                </tr>
                </thead>
                <tbody className="divide-y">
                {items.map(item => (
                    <tr key={item.id}>
                        <td className="p-2"><img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-contain rounded bg-gray-50 p-1"/></td>
                        <td className="p-2 font-medium">{item.name}</td>
                        <td className="p-2">{item.price}</td>
                        <td className="p-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {item.isActive ? 'Активен' : 'Скрыт'}
                                </span>
                        </td>
                        <td className="p-2 text-right">
                            <button onClick={() => openModal(item)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded mr-2">Ред.</button>
                            <button onClick={() => handleDelete(item.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Удалить</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {isModalOpen && <ItemModal item={currentItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} collectionName={collectionName} />}
        </div>
    );
};

// ... (код ItemModal и DirectoryManager остается без изменений) ...

const ItemModal = ({ item, onClose, onSave, collectionName }) => {
    const [name, setName] = useState(item?.name || '');
    const [price, setPrice] = useState(item?.price || 0);
    const [isActive, setIsActive] = useState(item?.isActive === undefined ? true : item.isActive);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(item?.imageUrl || null);
    const [uploading, setUploading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        let imageUrl = item?.imageUrl || '';

        if (imageFile) {
            const storage = getStorage();
            const storageRef = ref(storage, `directories/${collectionName}/${Date.now()}-${imageFile.name}`);
            await uploadString(storageRef, imagePreview, 'data_url');
            imageUrl = await getDownloadURL(storageRef);
        }

        onSave({ name, price, isActive, imageUrl });
        setUploading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{item ? 'Редактировать' : 'Добавить'} элемент</h3>
                <div className="space-y-4">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" className="w-full border p-2 rounded" required />
                    <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Цена" className="w-full border p-2 rounded" required />
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                        <span>Активен (виден пользователям)</span>
                    </label>
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

const DirectoryManager = () => {
    return (
        <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Управление справочниками</h3>
            <ItemManager collectionName="master_flowers" title="цветок" />
        </div>
    );
};

export default DirectoryManager;
