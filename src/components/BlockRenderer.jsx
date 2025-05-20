import React from 'react';
import WhatsappBlock from './blocks/WhatsappBlock';
import CatalogBlock from './blocks/CatalogBlock';

const BlockRenderer = ({ blocks, editable = false, onDelete, onMove, onUpdate }) => {
    return (
        <div className="space-y-4">
            {blocks.map((block, index) => (
                <div key={block.id || index} className="relative group">
                    {block.type === 'whatsapp' && (
                        <WhatsappBlock
                            block={block}
                            editable={editable}
                            onUpdate={(updatedBlock) => onUpdate && onUpdate(updatedBlock)}
                        />
                    )}


                    {block.type === 'catalog' && (
                        <CatalogBlock
                            block={block}
                            editable={editable}
                            onUpdate={(updatedProducts) =>
                                onUpdate && onUpdate(block, updatedProducts)
                            }
                        />
                    )}

                    {editable && (
                        <div className="absolute top-0 right-0 flex gap-1 p-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                                onClick={() => onMove(index, -1)}
                                className="bg-gray-200 text-xs px-2 py-1 rounded"
                                disabled={index === 0}
                            >
                                ↑
                            </button>
                            <button
                                onClick={() => onMove(index, 1)}
                                className="bg-gray-200 text-xs px-2 py-1 rounded"
                                disabled={index === blocks.length - 1}
                            >
                                ↓
                            </button>
                            <button
                                onClick={() => onDelete(index)}
                                className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default BlockRenderer;
