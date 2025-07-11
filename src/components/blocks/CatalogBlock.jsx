import React, { useState } from 'react';
import EditCatalogModal from '../EditCatalogModal';
import { db } from '../../firebase/firebase'; // 1. Импортируем
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const CatalogBlock = ({ block, editable = false, onEdit, ownerId }) => { // 2. Принимаем ownerId
    const [showEditor, setShowEditor] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);
    const products = block.products || [];
    const title = block.title || 'Хиты продаж';
    const whatsappNumber = block.whatsappNumber || '';
    const buttonColor = block.buttonColor || 'bg-green-500';
    const layout = block.layout || 'grid';
    const [orderingProductId, setOrderingProductId] = useState(null); // 3. Состояние для загрузки
    const handleOrder = async (product) => {
        if (!whatsappNumber || !ownerId) return;

        setOrderingProductId(product.id);

        const orderData = {
            items: [{ name: product.name, quantity: 1, price: product.price }],
            totalPrice: product.price,
            customerPhone: whatsappNumber.replace(/\D/g, ''),
            status: 'new',
            createdAt: Timestamp.now()
        };

        try {
            const ordersRef = collection(db, 'users', ownerId, 'orders');
            await addDoc(ordersRef, orderData);

            const message = `Здравствуйте! Хочу заказать «${product.name}» за ${product.price} ₸`;
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
        } catch (error) {
            console.error("Ошибка при создании заказа из каталога:", error);
            alert("Не удалось создать заказ. Попробуйте снова.");
        } finally {
            setOrderingProductId(null);
        }
    };
    const openWhatsapp = (product) => {
        const base = `https://wa.me/${whatsappNumber}`;
        const message = `Здравствуйте! Хочу заказать букет «${product.name}» за ${product.price} ₸%0AФото: ${product.imageUrl}`;
        const text = `?text=${encodeURIComponent(message)}`;
        window.open(base + text, '_blank');
    };



    const visibleProducts = layout === 'grid' ? products.slice(0, visibleCount) : products;

    return (
        <div className="relative border rounded-xl p-4 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
                {editable && (
                    <button
                        onClick={() => setShowEditor(true)}
                        className="bg-lime-600 text-white text-xs px-3 py-1 rounded shadow hover:bg-lime-700"
                    >
                        ✏️ Редактировать каталог
                    </button>
                )}
                <h3 className="text-xl font-bold">{title}</h3>
            </div>

            {layout === 'scroll' ? (
                <div className="flex space-x-4 overflow-x-auto pb-2">
                    {products.map((product, idx) => (
                        <div
                            key={idx}
                            className="w-40 sm:min-w-[150px] bg-white rounded-2xl overflow-hidden shadow-xl flex-shrink-0 transform transition hover:scale-[1.02]"
                        >

                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-40 object-cover"

                            />
                            <div className="p-3">
                                <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                                <p className="text-xs text-gray-600">{product.price} ₸</p>
                                <button
                                    onClick={() => handleOrder(product)}
                                    disabled={orderingProductId === product.id}
                                    className={`mt-2 w-full ${buttonColor} text-white text-xs py-1 rounded shadow disabled:bg-gray-400`}
                                >
                                    {orderingProductId === product.id ? '...' : 'Купить'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {visibleProducts.map((product, idx) => (
                            <div
                                key={idx}
                                className="relative bg-white rounded-2xl overflow-hidden shadow-xl transform transition hover:scale-[1.02]"
                            >
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-60 object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
                                    <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                                    <p className="text-xs text-gray-200">{product.price} ₸</p>
                                    <button
                                        onClick={() => openWhatsapp(product)}
                                        className={`mt-2 w-full ${buttonColor} text-white text-xs py-1 rounded shadow`}
                                    >
                                        Купить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {products.length > visibleCount && (
                        <div className="text-center mt-4">
                            <button
                                onClick={() => setVisibleCount(visibleCount + 6)}
                                className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded"
                            >
                                Показать ещё
                            </button>
                        </div>
                    )}
                </>
            )}

            {showEditor && (
                <EditCatalogModal
                    block={block}
                    onClose={() => setShowEditor(false)}
                    onSave={(updatedBlock) => {
                        const fullBlock = { ...block, ...updatedBlock };
                        onEdit && onEdit(fullBlock);
                        setShowEditor(false);
                    }}
                />
            )}
        </div>
    );
};

export default CatalogBlock;
