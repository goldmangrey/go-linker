import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { wrappings as masterWrappings } from '../../data/wrappings';

const EditBouquetModal = ({ initialData, onClose, onSave }) => {
    // Состояние для мастер-листа цветов из Firestore
    const [masterFlowers, setMasterFlowers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Состояния для данных, которые редактируются в этом блоке
    const [selectedFlowers, setSelectedFlowers] = useState(initialData.flowers || []);
    const [selectedWrappings, setSelectedWrappings] = useState(initialData.wrappings || []);
    const [whatsappNumber, setWhatsappNumber] = useState(initialData.whatsappNumber || '');

    // Добавлено: состояние для опций доставки
    const [deliveryOptions, setDeliveryOptions] = useState(
        initialData.deliveryOptions || { delivery: 2500, pickup: 0 }
    );

    // Загрузка мастер-листа цветов при открытии модального окна
    useEffect(() => {
        const fetchFlowers = async () => {
            setLoading(true);
            try {
                const flowersQuery = query(collection(db, 'master_flowers'), where('isActive', '==', true), orderBy('name'));
                const flowersSnap = await getDocs(flowersQuery);
                setMasterFlowers(flowersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Ошибка загрузки справочника цветов (возможно, нужно создать индекс в Firestore):", error);
            }
            setLoading(false);
        };
        fetchFlowers();
    }, []);

    // Функции для управления выбором и ценами цветов
    const toggleFlower = (flower) => {
        const isSelected = selectedFlowers.some(sf => sf.id === flower.id);
        if (isSelected) {
            setSelectedFlowers(prev => prev.filter(sf => sf.id !== flower.id));
        } else {
            // При добавлении цветка используем его мастер-цену по умолчанию
            setSelectedFlowers(prev => [...prev, { ...flower }]);
        }
    };

    const updateFlowerPrice = (id, price) => {
        setSelectedFlowers(prev => prev.map(f => f.id === id ? { ...f, price: Number(price) || 0 } : f));
    };

    // Функции для управления выбором и ценами упаковок
    const toggleWrapping = (wrapping) => {
        const isSelected = selectedWrappings.some(sw => sw.id === wrapping.id);
        if (isSelected) {
            setSelectedWrappings(prev => prev.filter(sw => sw.id !== wrapping.id));
        } else {
            // При добавлении упаковки используем её мастер-цену по умолчанию
            setSelectedWrappings(prev => [...prev, { ...wrapping }]);
        }
    };

    const updateWrappingPrice = (id, price) => {
        setSelectedWrappings(prev => prev.map(w => w.id === id ? { ...w, price: Number(price) || 0 } : w));
    };

    // Добавлено: функция для обновления цен доставки
    const handleDeliveryChange = (option, value) => {
        setDeliveryOptions(prev => ({
            ...prev,
            [option]: Number(value) || 0
        }));
    };

    // Сохранение всех изменений
    const handleSaveClick = () => {
        onSave({
            flowers: selectedFlowers,
            wrappings: selectedWrappings,
            whatsappNumber: whatsappNumber,
            deliveryOptions: deliveryOptions // Добавлено
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-lg p-6 relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-black">✕</button>
                <h2 className="text-lg font-semibold mb-4">Настройка конструктора букета</h2>

                {loading ? <p>Загрузка ассортимента...</p> : (
                    <>
                        {/* Раздел ЦВЕТЫ */}
                        <div className="mb-6">
                            <h3 className="text-base font-medium mb-2">Выберите цветы, доступные в этом блоке</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {masterFlowers.map((flower) => {
                                    const activeItem = selectedFlowers.find(sf => sf.id === flower.id);
                                    return (
                                        <div key={flower.id} className={`border p-2 rounded-lg text-sm flex flex-col items-center text-center transition-all ${activeItem ? 'border-green-500 bg-green-50' : ''}`}>
                                            <img src={flower.imageUrl} alt={flower.name} className="w-16 h-16 object-contain mb-1"/>
                                            <label className="flex items-center gap-2 font-medium">
                                                <input type="checkbox" checked={!!activeItem} onChange={() => toggleFlower(flower)}/>
                                                {flower.name}
                                            </label>
                                            {activeItem && (
                                                <div className="mt-2 w-full">
                                                    <label className="text-xs text-gray-600">Цена (₸)</label>
                                                    <input type="number" className="w-full mt-1 border px-2 py-1 text-sm rounded text-center" value={activeItem.price} onChange={(e) => updateFlowerPrice(flower.id, e.target.value)} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Раздел УПАКОВКИ */}
                        <div className="mb-6">
                            <h3 className="text-base font-medium mb-2">Выберите упаковки</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {masterWrappings.map((wrapping) => {
                                    const activeItem = selectedWrappings.find(sw => sw.id === wrapping.id);
                                    return (
                                        <div key={wrapping.id} className={`border p-2 rounded-lg text-sm flex flex-col items-center text-center transition-all ${activeItem ? 'border-green-500 bg-green-50' : ''}`}>
                                            <img src={wrapping.imageUrl} alt={wrapping.name} className="w-16 h-16 object-contain mb-1"/>
                                            <label className="flex items-center gap-2 font-medium">
                                                <input type="checkbox" checked={!!activeItem} onChange={() => toggleWrapping(wrapping)}/>
                                                {wrapping.name}
                                            </label>
                                            {activeItem && (
                                                <div className="mt-2 w-full">
                                                    <label className="text-xs text-gray-600">Цена (₸)</label>
                                                    <input type="number" className="w-full mt-1 border px-2 py-1 text-sm rounded text-center" value={activeItem.price} onChange={(e) => updateWrappingPrice(wrapping.id, e.target.value)} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Раздел Настройка доставки */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-base font-medium mb-2">Настройка доставки</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Стоимость доставки (₸)</label>
                                    <input
                                        type="number"
                                        className="w-full mt-1 border px-2 py-1 text-sm rounded"
                                        value={deliveryOptions.delivery}
                                        onChange={(e) => handleDeliveryChange('delivery', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Стоимость самовывоза (₸)</label>
                                    <input
                                        type="number"
                                        className="w-full mt-1 border px-2 py-1 text-sm rounded"
                                        value={deliveryOptions.pickup}
                                        onChange={(e) => handleDeliveryChange('pickup', e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Обычно 0, если самовывоз бесплатный.</p>
                                </div>
                            </div>
                        </div>

                        {/* Раздел WhatsApp */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-sm font-medium mb-2">Номер для заказов WhatsApp</h3>
                            <input type="tel" className="w-full border px-2 py-1 text-sm rounded" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))} placeholder="Например: 77083180696"/>
                            <p className="text-xs text-gray-500 mt-1">Введите номер телефона без "+", пробелов и скобок.</p>
                        </div>
                    </>
                )}

                <div className="text-right mt-6">
                    <button onClick={handleSaveClick} className="bg-green-600 text-white px-5 py-2 rounded text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400" disabled={loading}>
                        💾 Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    );
};
export default EditBouquetModal;