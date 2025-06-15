import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, doc, updateDoc, Timestamp, query, orderBy } from 'firebase/firestore';

// Этот компонент мы создадим на следующем шаге.
// Пока он будет вызывать ошибку, это нормально.
import DirectoryManager from './DirectoryManager';

// Компонент для карточки со статистикой
const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full mr-4">{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    </div>
);

// Компонент для управления пользователями (вынесли из основной логики)
const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [days, setDays] = useState(30);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, 'users'), orderBy('orgName'));
                const querySnapshot = await getDocs(q);
                setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                setMessage('Ошибка загрузки: ' + error.message);
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const stats = useMemo(() => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        const totalUsers = users.filter(u => u.role !== 'admin').length;
        const activeSubscriptions = users.filter(u => u.subscriptionExpiresAt && u.subscriptionExpiresAt.toDate() > now).length;
        const newUsersLast7Days = users.filter(u => u.createdAt && u.createdAt.toDate() > sevenDaysAgo).length;
        return { totalUsers, activeSubscriptions, newUsersLast7Days };
    }, [users]);

    const handleGrantSubscription = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        const userRef = doc(db, 'users', selectedUser.id);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(days, 10));
        try {
            await updateDoc(userRef, { subscriptionExpiresAt: Timestamp.fromDate(futureDate) });
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, subscriptionExpiresAt: Timestamp.fromDate(futureDate) } : u));
            setMessage(`Подписка для ${selectedUser.email} успешно продлена.`);
            setSelectedUser(null);
        } catch (error) {
            setMessage('Ошибка обновления: ' + error.message);
        }
        setActionLoading(false);
    };

    const getSubscriptionStatus = (user) => {
        if (!user.subscriptionExpiresAt) return <span className="text-xs text-gray-500">Нет</span>;
        const expires = user.subscriptionExpiresAt.toDate();
        const now = new Date();
        if (expires < now) return <span className="text-xs font-semibold text-red-600">Истекла</span>;
        const diffDays = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) return <span className="text-xs font-semibold text-yellow-600">{expires.toLocaleDateString()}</span>;
        return <span className="text-xs text-green-600">{expires.toLocaleDateString()}</span>;
    };

    if (loading) return <div className="text-center p-10">Загрузка данных...</div>;

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard title="Всего пользователей" value={stats.totalUsers} icon="👥" />
                <StatCard title="Активные подписки" value={stats.activeSubscriptions} icon="✅" />
                <StatCard title="Новые за 7 дней" value={stats.newUsersLast7Days} icon="🚀" />
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Пользователи</h3>
                {message && <p className="text-sm my-2 p-2 bg-yellow-100 rounded">{message}</p>}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2">Организация</th>
                            <th className="p-2">Подписка до</th>
                            <th className="p-2 text-right">Действия</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {users.filter(u => u.role !== 'admin').map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="p-2">
                                    <p className="font-medium">{user.orgName}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </td>
                                <td className="p-2">{getSubscriptionStatus(user)}</td>
                                <td className="p-2 text-right">
                                    <button onClick={() => setSelectedUser(user)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">Продлить</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold">Продление подписки</h3>
                        <p className="mt-1">для <span className="font-bold">{selectedUser.orgName}</span></p>
                        <div className="flex items-center gap-2 mt-4">
                            <span>Продлить на:</span>
                            <input type="number" value={days} onChange={(e) => setDays(e.target.value)} className="w-24 border rounded px-2 py-1"/>
                            <span>дней</span>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-gray-200 rounded text-sm">Отмена</button>
                            <button onClick={handleGrantSubscription} disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded text-sm disabled:bg-green-300">{actionLoading ? '...' : 'Выдать'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// Основной компонент админ-панели
const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users');

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManager />;
            case 'directories':
                return <DirectoryManager />;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Панель администратора</h2>

            <div className="border-b mb-4">
                <nav className="flex space-x-4">
                    <button onClick={() => setActiveTab('users')} className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'users' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500'}`}>
                        Пользователи
                    </button>
                    <button onClick={() => setActiveTab('directories')} className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'directories' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500'}`}>
                        Справочники
                    </button>
                </nav>
            </div>

            <div>{renderContent()}</div>
        </div>
    );
};

export default AdminPanel;

