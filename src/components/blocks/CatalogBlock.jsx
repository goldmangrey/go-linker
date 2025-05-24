import React, { useState } from 'react';
import EditCatalogModal from '../EditCatalogModal';

const CatalogBlock = ({ block, editable = false, onEdit }) => {
    const [showEditor, setShowEditor] = useState(false);
    const products = block.products || [];
    const title = block.title || 'Хиты продаж';
    const whatsappNumber = block.whatsappNumber || '';

    const openWhatsapp = (product) => {
        const base = `https://wa.me/${whatsappNumber}`;
        const text = `?text=Здравствуйте, интересует товар: ${encodeURIComponent(product.name)}`;
        window.open(base + text, '_blank');
    };

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


            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {products.map((product, idx) => (
                    <div
                        key={idx}
                        className="relative bg-white rounded-2xl overflow-hidden shadow-xl transform transition hover:scale-[1.02]"
                    >
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-40 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
                            <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                            <p className="text-xs text-gray-200">{product.price} ₸</p>
                            <button
                                onClick={() => openWhatsapp(product)}
                                className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white text-xs py-1 rounded shadow"
                            >
                                Купить
                            </button>

                        </div>
                    </div>
                ))}
            </div>

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
