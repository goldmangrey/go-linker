import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { doc, collection, query, orderBy, getDocs, updateDoc } from 'firebase/firestore';

const OrderDetailModal = ({ order, user, onClose, onSave }) => {
    const [notes, setNotes] = useState(order.notes || '');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Загрузка истории изменений для этого заказа
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user || !order) return;
            const historyRef = collection(db, 'users', user.uid, 'orders', order.id, 'history');
            const q = query(historyRef, orderBy('changedAt', 'desc'));
            const historySnap = await getDocs(q);
            setHistory(historySnap.docs.map(doc => doc.data()));
        };
        fetchHistory();
    }, [user, order]);

    const handleSaveNotes = async () => {
        setLoading(true);
        try {
            const orderRef = doc(db, 'users', user.uid, 'orders', order.id);
            await updateDoc(orderRef, { notes });
            onSave({ ...order, notes }); // Обновляем данные в родительском компоненте
            onClose();
        } catch (error) {
            console.error("Ошибка при сохранении заметок:", error);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Детали заказа #{order.id.slice(-6)}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Основная информация */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong className="block text-gray-500">Статус:</strong> <span className="font-semibold">{order.status}</span></div>
                        <div><strong className="block text-gray-500">Сумма:</strong> <span className="font-semibold">{order.totalPrice} ₸</span></div>
                        <div><strong className="block text-gray-500">Флорист:</strong> <span className="font-semibold">{order.floristName || 'Не назначен'}</span></div>
                        <div><strong className="block text-gray-500">Клиент (WA):</strong> <span className="font-semibold">{order.customerPhone}</span></div>
                    </div>

                    {/* Состав заказа */}
                    <div>
                        <h3 className="font-semibold mb-1">Состав заказа:</h3>
                        <ul className="list-disc list-inside pl-2 text-sm space-y-1 bg-gray-50 p-3 rounded-md">
                            {order.items.map((item, index) => <li key={index}>{item.name} x {item.quantity}</li>)}
                        </ul>
                    </div>

                    {/* Заметки */}
                    <div>
                        <h3 className="font-semibold mb-1">Заметки для флориста:</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="3"
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm"
                            placeholder="Например: Клиент просил не звонить, добавить открытку..."
                        />
                    </div>

                    {/* История */}
                    <div>
                        <h3 className="font-semibold mb-1">История изменений:</h3>
                        <div className="text-xs text-gray-500 space-y-1">
                            {history.length > 0 ? history.map((entry, i) => (
                                <p key={i}>{entry.changedAt.toDate().toLocaleString()}: Статус изменен на "{STATUSES[entry.status]?.title || entry.status}"</p>
                            )) : <p>Нет истории изменений.</p>}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 text-right">
                    <button onClick={handleSaveNotes} disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 text-sm disabled:bg-gray-400">
                        {loading ? 'Сохранение...' : 'Сохранить заметки'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Добавляем объект статусов для корректного отображения в истории
const STATUSES = {
    new: { title: 'Новый' },
    inProgress: { title: 'В работе' },
    completed: { title: 'Выполнен' },
    cancelled: { title: 'Отменен' }
};

export default OrderDetailModal;
