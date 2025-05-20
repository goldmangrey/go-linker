import EditCatalogModal from "../EditCatalogModal";
import {useState} from "react";

const CatalogBlock = ({ block, editable = false, onUpdate }) => {
    const [showEditor, setShowEditor] = useState(false);
    const products = block.products || [];

    return (
        <div className="relative border rounded-lg p-3 bg-white shadow">
            {editable && (
                <div className="flex justify-between mb-2">
                    <button
                        onClick={() => setShowEditor(true)}
                        className="bg-lime-600 text-white text-xs px-3 py-1 rounded"
                    >
                        ✏️ Редактировать каталог
                    </button>
                </div>
            )}

            <h3 className="text-lg font-bold mb-2">Хиты продаж</h3>

            <div className="flex space-x-4 overflow-x-auto pb-2">
                {products.map((product, idx) => (
                    <div
                        key={idx}
                        className="min-w-[150px] bg-lime-100 p-3 rounded-lg shadow flex-shrink-0"
                    >
                        <img src={product.imageUrl} alt={product.name} className="rounded w-full h-24 object-cover mb-2" />
                        <h4 className="text-sm font-semibold">{product.name}</h4>
                        <p className="text-xs text-gray-600">{product.price} ₸</p>
                        <button className="mt-2 w-full bg-black text-white py-1 rounded text-sm">Купить</button>
                    </div>
                ))}
            </div>

            {showEditor && (
                <EditCatalogModal
                    block={block}
                    onClose={() => setShowEditor(false)}
                    onSave={onUpdate}
                />
            )}
        </div>
    );

};

export default CatalogBlock;
