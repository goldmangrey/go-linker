import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

const EditBouquetModal = ({ initialData, onClose, onSave }) => {
    const [loading, setLoading] = useState(true);

    const [whatsappNumber, setWhatsappNumber] = useState(initialData.whatsappNumber || '');

    // --- НОВОЕ: Состояние для цен доставки ---
    const [deliveryOptions, setDeliveryOptions] = useState(
        initialData.deliveryOptions || {
            delivery: 2500,
            pickup: 0,
        }
    );

    useEffect(() => {
        const fetchFlowers = async () => {
            setLoading(true);
            try {
                const flowersQuery = query(collection(db, 'master_flowers'), where('isActive', '==', true), orderBy('name'));
                const flowersSnap = await getDocs(flowersQuery);
                setMasterFlowers(flowersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Ошибка загрузки справочников:", error);
            }
            setLoading(false);
        };
        fetchFlowers();
    }, []);









    // --- НОВОЕ: Функция для обновления цен доставки ---
    const handleDeliveryChange = (option, value) => {
        setDeliveryOptions(prev => ({
            ...prev,
            [option]: Number(value)
        }));
    };

    const handleSaveClick = () => {
        onSave({
            flowers: selectedFlowers,
            wrappings: selectedWrappings,
            whatsappNumber: whatsappNumber,
            deliveryOptions: deliveryOptions // --- НОВОЕ: Передаем опции доставки
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-lg p-6 relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-black">✕</button>
                <h2 className="text-lg font-semibold mb-4">Настройка конструктора букета</h2>

                {loading ? <p>Загрузка ассортимента...</p> : (
                    <>
                        {/* ... разделы ЦВЕТЫ и УПАКОВКИ остаются без изменений ... */}

                        {/* --- НОВЫЙ РАЗДЕЛ: Настройка доставки --- */}
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