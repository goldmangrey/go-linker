import React, { useEffect, useState } from 'react';
import BouquetPreview from '../bouquet/BouquetPreview';
import EditBouquetModal from '../bouquet/EditBouquetModal';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase'; // 1. Импортируем db

const QUICK_ADD_IDS = ['roses', 'euro']; // ID красной и белой розы из flowers.js
const BouquetBlock = ({ block, onUpdate, editable, ownerId }) => {
    const bouquetData = block?.data || {};

    const [flowers, setFlowers] = useState(bouquetData.flowers || []);
    const [wrappings, setWrappings] = useState(bouquetData.wrappings || []);
    const [selected, setSelected] = useState(bouquetData.selected || {});
    const [wrapping, setWrapping] = useState(bouquetData.wrapping || null);
    const [editOpen, setEditOpen] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);

    useEffect(() => {
        const newData = block?.data || {};
        setFlowers(newData.flowers || []);
        setWrappings(newData.wrappings || []);
        setSelected(newData.selected || {});
        setWrapping(newData.wrapping || null);
    }, [block.data]);

    const increaseFlower = (f) => {
        setSelected((prev) => ({
            ...prev,
            [f.id]: (prev[f.id] || 0) + 1,
        }));
    };

    const decreaseFlower = (f) => {
        setSelected((prev) => {
            const current = prev[f.id] || 0;
            if (current <= 1) {
                const { [f.id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [f.id]: current - 1 };
        });
    };
    const setQuantity = (f, amount) => {
        setSelected((prev) => ({
            ...prev,
            [f.id]: amount,
        }));
    };
    const total =
        Object.entries(selected).reduce((sum, [id, count]) => {
            const f = flowers.find((f) => f.id === id);
            return sum + (f?.price || 0) * count;
        }, 0) + (wrapping?.price || 0);

    const handleSaveChanges = (dataFromModal) => {
        // dataFromModal теперь содержит полные, готовые к сохранению данные
        const newBlockData = {
            ...bouquetData,
            flowers: dataFromModal.flowers,
            wrappings: dataFromModal.wrappings,
            whatsappNumber: dataFromModal.whatsappNumber
        };

        if (onUpdate) {
            onUpdate({ ...block, data: newBlockData });
        }

        setEditOpen(false);
    };
    // Код после изменений
    const handleOrderClick = async () => {
        const whatsAppNumber = block.data?.whatsappNumber;
        if (!whatsAppNumber || !ownerId) return;

        setIsOrdering(true);

        // Формируем состав заказа
        const items = Object.entries(selected).map(([id, count]) => {
            const flower = flowers.find((f) => f.id === id);
            return { name: flower?.name || 'Неизвестный цветок', quantity: count, price: flower?.price || 0 };
        });

        if (wrapping) {
            items.push({ name: wrapping.name, quantity: 1, price: wrapping.price });
        }

        // Создаем объект заказа
        const orderData = {
            items,
            totalPrice: total,
            customerPhone: whatsAppNumber.replace(/\D/g, ''),
            status: 'new',
            createdAt: Timestamp.now()
        };

        // 1. СНАЧАЛА формируем сообщение и НЕМЕДЛЕННО открываем WhatsApp
        let message = "Здравствуйте! Хочу заказать букет:\n\n";
        items.forEach(item => {
            message += `- ${item.name} × ${item.quantity}\n`;
        });
        message += `\n*Итого: ${total} ₸*`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${whatsAppNumber}?text=${encodedMessage}`, '_blank');

        // 2. ПОТОМ сохраняем заказ в базу данных
        try {
            const ordersRef = collection(db, 'users', ownerId, 'orders');
            await addDoc(ordersRef, orderData);
            // Заказ успешно сохранен в фоне

        } catch (error) {
            console.error("Ошибка при создании заказа в фоне:", error);
            // Здесь можно добавить логику для отправки отчета об ошибке,
            // но для пользователя процесс уже прошел успешно.
        } finally {
            setIsOrdering(false);
        }
    };
    return (
        <div className="p-4 bg-white rounded-xl border">
            <h2 className="text-lg font-semibold mb-2">💐 Собери свой букет</h2>

            {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ: Контейнер для цветов с горизонтальным скроллом --- */}
            {flowers.length > 0 ? (
                <div className="flex overflow-x-auto space-x-4 pb-3 mb-2">
                    {flowers.map((f) => (
                        <div key={f.id} className={`w-32 shrink-0 border rounded-lg p-2 flex flex-col items-center text-center transition-all ${selected[f.id] ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                            <img src={f.imageUrl} alt={f.name} className="w-16 h-16 object-contain mb-1" />
                            <span className="text-sm font-medium h-10 flex items-center">{f.name}</span>
                            <span className="text-xs text-gray-600 mb-2">{f.price} ₸</span>

                            {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ: Новый блок кнопок --- */}
                            {QUICK_ADD_IDS.includes(f.id) && (selected[f.id] || 0) > 0 && (                                <div className="flex items-center justify-center gap-2 my-2">
                                    <button onClick={() => setQuantity(f, 51)} className="text-xs border rounded-full px-3 py-1 text-gray-700 hover:bg-gray-100 font-semibold">51 шт</button>
                                    <button onClick={() => setQuantity(f, 101)} className="text-xs border rounded-full px-3 py-1 text-gray-700 hover:bg-gray-100 font-semibold">101 шт</button>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-auto">
                                <button onClick={() => decreaseFlower(f)} className="bg-gray-200 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center text-lg">−</button>
                                <span className="px-1 text-base font-semibold w-5 text-center">{selected[f.id] || 0}</span>
                                <button onClick={() => increaseFlower(f)} className="bg-gray-200 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center text-lg">+</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 mb-4">Цветы для этого блока не выбраны. Нажмите "Редактировать блок", чтобы добавить их.</p>
            )}

            {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ: Контейнер для упаковок с горизонтальным скроллом --- */}
            {wrappings.length > 0 && (
                <div className="border-t pt-3 mt-3">
                    <p className="text-sm font-medium mb-2">Выберите упаковку:</p>
                    <div className="flex overflow-x-auto space-x-3 pb-2">
                        {wrappings.map((w) => (
                            <button key={w.id} onClick={() => setWrapping(w)} className={`shrink-0 border rounded-lg p-2 text-sm flex items-center gap-2 transition-all ${wrapping?.id === w.id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                                <img src={w.imageUrl} alt={w.name} className="w-10 h-10 object-contain" />
                                <span className="font-medium">{w.name} – {w.price} ₸</span>
                            </button>
                        ))}
                        <button onClick={() => setWrapping(null)} className={`shrink-0 border rounded-lg px-3 py-2 text-sm transition-all ${!wrapping ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                            Без упаковки
                        </button>
                    </div>
                </div>
            )}

            {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ: Условный рендеринг предпросмотра --- */}
            {(Object.keys(selected).length > 0 || wrapping) ? (
                <BouquetPreview
                    selected={selected}
                    flowers={flowers}
                    selectedWrapping={wrapping?.id}
                    wrappings={wrappings}
                    onClear={() => {
                        setSelected({});
                        setWrapping(null);
                    }}
                />
            ) : (
                <div className="mt-6 text-center p-8 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-500">Добавьте цветы или выберите упаковку, чтобы увидеть предпросмотр.</p>
                </div>
            )}

            <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold mb-1">Состав букета:</h3>
                {Object.keys(selected).length === 0 ? (
                    <p className="text-sm text-gray-500">Цветы не выбраны</p>
                ) : (
                    <ul className="text-sm list-disc list-inside">
                        {Object.entries(selected).map(([id, count]) => {
                            const f = flowers.find((f) => f.id === id);
                            return f ? <li key={id}>{f.name} × {count} = {f.price * count} ₸</li> : null;
                        })}
                    </ul>
                )}
                {wrapping && <p className="text-sm mt-1">Упаковка: {wrapping.name} – {wrapping.price} ₸</p>}
                <p className="mt-2 font-semibold">Итого: {total} ₸</p>
            </div>
            {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ: Кнопка заказа --- */}
            {block.data?.whatsappNumber && Object.keys(selected).length > 0 && (
                <div className="mt-6 border-t pt-4">
                    <button
                        onClick={handleOrderClick}
                        disabled={isOrdering}
                        className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                        {isOrdering ? 'Создание заказа...' : 'Заказать через WhatsApp'}
                    </button>
                </div>
            )}
            {editable && (
                <div className="mt-4">
                    <button onClick={() => setEditOpen(true)} className="text-blue-600 text-sm underline">
                        ✏️ Редактировать блок
                    </button>
                </div>
            )}

            {editOpen && (
                <EditBouquetModal
                    initialData={{
                        flowers,
                        wrappings,
                        whatsappNumber: bouquetData.whatsappNumber
                    }}
                    onClose={() => setEditOpen(false)}
                    onSave={handleSaveChanges}
                />
            )}
        </div>
    );
};

export default BouquetBlock;