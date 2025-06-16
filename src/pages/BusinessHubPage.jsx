import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, getDocs, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import OrderDetailModal from '../components/OrderDetailModal';
import InventoryManager from '../components/InventoryManager'; // 1. Импортируем новый компонент

// --- Helper Components & Constants ---

const STATUSES = {
    new: { title: 'Новые', color: 'bg-blue-500', next: 'inProgress' },
    inProgress: { title: 'В работе', color: 'bg-yellow-500', next: 'completed' },
    completed: { title: 'Выполненные', color: 'bg-green-600', next: null },
    cancelled: { title: 'Отмененные', color: 'bg-red-500', next: null }
};

const StatCard = ({ title, value, subtext }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
    </div>
);

const OrderCard = ({ order, onStatusChange, onAssignFlorist, florists, onCardClick }) => {
    const statusInfo = STATUSES[order.status] || { title: 'Неизвестно', color: 'bg-gray-400' };
    const canBeChanged = order.status === 'new' || order.status === 'inProgress';

    const handleButtonClick = (e, action) => {
        e.stopPropagation();
        action();
    };

    return (
        <div onClick={() => onCardClick(order)} className="bg-white p-4 rounded-lg shadow border flex flex-col space-y-3 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <span className="font-bold text-gray-800">Заказ #{order.id.slice(-6)}</span>
                    <p className="text-xs text-gray-400">{order.createdAt.toDate().toLocaleString()}</p>
                </div>
                <span className={`text-xs text-white ${statusInfo.color} px-2 py-1 rounded-full`}>{statusInfo.title}</span>
            </div>
            <div className="text-sm text-gray-700 space-y-1 flex-grow">
                <p><strong>Сумма:</strong> {order.totalPrice} ₸</p>
                <p><strong>Клиент:</strong> {order.customerPhone}</p>
            </div>
            <div>
                <label className="text-xs font-medium text-gray-500">Флорист:</label>
                <select value={order.floristName || ''} onClick={(e) => e.stopPropagation()} onChange={(e) => onAssignFlorist(order.id, e.target.value)} className="mt-1 w-full text-sm border-gray-300 rounded-md shadow-sm" disabled={!canBeChanged}>
                    <option value="">Не назначен</option>
                    {florists.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                </select>
            </div>
            <div className="flex gap-2 mt-2">
                {statusInfo.next && <button onClick={(e) => handleButtonClick(e, () => onStatusChange(order.id, statusInfo.next))} className={`w-full text-sm text-white py-2 rounded-lg transition ${statusInfo.next === 'inProgress' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-600'}`}>{statusInfo.next === 'inProgress' ? 'Взять в работу' : 'Завершить'} &rarr;</button>}
                {canBeChanged && <button onClick={(e) => handleButtonClick(e, () => onStatusChange(order.id, 'cancelled'))} className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-lg">Отменить</button>}
            </div>
        </div>
    );
};

// --- Main Page Component ---

const BusinessHubPage = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [florists, setFlorists] = useState([]);
    const [newFloristName, setNewFloristName] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('orders'); // State for active tab
    const navigate = useNavigate();

    const fetchData = useCallback(async (uid) => {
        setLoading(true);
        try {
            const ordersRef = collection(db, 'users', uid, 'orders');
            const qOrders = query(ordersRef, orderBy('createdAt', 'desc'));
            const ordersSnapshot = await getDocs(qOrders);
            setOrders(ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const floristsRef = collection(db, 'users', uid, 'florists');
            const qFlorists = query(floristsRef, orderBy('name'));
            const floristsSnapshot = await getDocs(qFlorists);
            setFlorists(floristsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                fetchData(firebaseUser.uid);
            } else {
                navigate('/signin');
            }
        });
        return () => unsubscribe();
    }, [navigate, fetchData]);

    const handleStatusChange = async (orderId, newStatus) => {
        setOrders(currentOrders => currentOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        const orderRef = doc(db, 'users', user.uid, 'orders', orderId);
        await updateDoc(orderRef, { status: newStatus });
        const historyRef = collection(orderRef, 'history');
        await addDoc(historyRef, { status: newStatus, changedAt: Timestamp.now() });
    };

    const handleAssignFlorist = async (orderId, floristName) => {
        setOrders(orders => orders.map(o => o.id === orderId ? { ...o, floristName } : o));
        await updateDoc(doc(db, 'users', user.uid, 'orders', orderId), { floristName });
    };

    const handleAddFlorist = async (e) => {
        e.preventDefault();
        if (!newFloristName.trim() || !user) return;
        const newFlorist = { name: newFloristName.trim() };
        const docRef = await addDoc(collection(db, 'users', user.uid, 'florists'), newFlorist);
        setFlorists([...florists, { id: docRef.id, ...newFlorist }]);
        setNewFloristName('');
    };

    const handleUpdateOrder = (updatedOrder) => {
        setOrders(currentOrders => currentOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    };

    const groupedOrders = useMemo(() => orders.reduce((acc, order) => {
        (acc[order.status] = acc[order.status] || []).push(order);
        return acc;
    }, {}), [orders]);

    const stats = useMemo(() => {
        const total = orders.length;
        if (total === 0) return { completed: 0, cancelledRate: '0%', florists: [] };
        const completed = groupedOrders['completed']?.length || 0;
        const cancelled = groupedOrders['cancelled']?.length || 0;
        const floristPerf = (groupedOrders['completed'] || []).reduce((acc, order) => {
            const florist = order.floristName || 'Не назначен';
            acc[florist] = (acc[florist] || 0) + 1;
            return acc;
        }, {});
        return {
            completed,
            cancelledRate: total > 0 ? ((cancelled / total) * 100).toFixed(0) + '%' : '0%',
            florists: Object.entries(floristPerf).sort(([,a],[,b]) => b-a),
        };
    }, [orders, groupedOrders]);

    if (loading) {
        return <div className="h-screen flex items-center justify-center"><p>Загрузка...</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">Центр управления</h1>
                    <button onClick={() => navigate('/dashboard')} className="text-sm text-blue-600 hover:underline">&larr; Вернуться в Dashboard</button>
                </div>
                {/* Tab Navigation */}
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t">
                    <div className="flex space-x-4">
                        <button onClick={() => setActiveTab('orders')} className={`py-3 px-1 text-sm font-medium ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Заказы</button>
                        <button onClick={() => setActiveTab('inventory')} className={`py-3 px-1 text-sm font-medium ${activeTab === 'inventory' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Склад</button>
                        <button onClick={() => setActiveTab('stats')} className={`py-3 px-1 text-sm font-medium ${activeTab === 'stats' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Статистика</button>
                    </div>
                </nav>
            </header>
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Conditional Rendering based on activeTab */}
                {activeTab === 'orders' && (
                    <section id="orders-board">
                        <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
                            {Object.keys(STATUSES).map(statusKey => (
                                <div key={statusKey} className="flex-1">
                                    <h2 className={`text-lg font-semibold mb-3 ${STATUSES[statusKey].color.replace('bg-', 'text-')}`}>{STATUSES[statusKey].title} ({groupedOrders[statusKey]?.length || 0})</h2>
                                    <div className="space-y-4 bg-gray-200/60 p-3 rounded-lg min-h-[200px]">
                                        {(groupedOrders[statusKey] || []).map(order => <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} onAssignFlorist={handleAssignFlorist} florists={florists} onCardClick={setSelectedOrder} />)}
                                        {(!groupedOrders[statusKey] || groupedOrders[statusKey].length === 0) && <div className="text-center text-gray-400 pt-10">Пусто</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {activeTab === 'inventory' && (
                    <section id="inventory-management" className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">Управление складом</h2>
                        {user && <InventoryManager userId={user.uid} />}
                    </section>
                )}
                {activeTab === 'stats' && (
                    <section id="stats">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">Статистика</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Выполнено заказов" value={stats.completed} />
                            <StatCard title="Отменено заказов" value={stats.cancelledRate} />
                        </div>
                        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
                            <p className="text-sm text-gray-500 mb-2">Рейтинг флористов (по вып. заказам)</p>
                            {stats.florists.length > 0 ? (
                                <ul className="text-sm space-y-1">
                                    {stats.florists.map(([name, count]) => <li key={name} className="flex justify-between"><span>{name}</span><span className="font-bold">{count}</span></li>)}
                                </ul>
                            ) : <p className="text-sm text-gray-400">Нет данных</p>}
                        </div>
                        <section id="florists" className="mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
                            <h2 className="text-lg font-semibold mb-3 text-gray-700">Флористы</h2>
                            <form onSubmit={handleAddFlorist} className="flex gap-2">
                                <input value={newFloristName} onChange={(e) => setNewFloristName(e.target.value)} type="text" placeholder="Имя нового флориста" className="flex-grow border-gray-300 rounded-md shadow-sm"/>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Добавить</button>
                            </form>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {florists.map(f => <span key={f.id} className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded-full">{f.name}</span>)}
                            </div>
                        </section>
                    </section>
                )}
            </main>
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    user={user}
                    onClose={() => setSelectedOrder(null)}
                    onSave={handleUpdateOrder}
                />
            )}
        </div>
    );
};

export default BusinessHubPage;
