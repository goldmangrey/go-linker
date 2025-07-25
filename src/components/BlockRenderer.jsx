import React from 'react';
import WhatsappBlock from './blocks/WhatsappBlock';
import CatalogBlock from './blocks/CatalogBlock';
import PromoBlock from './blocks/PromoBlock';
import GalleryBlock from './blocks/GalleryBlock';
import BouquetBlock from './blocks/BouquetBlock';

const BlockRenderer = ({ blocks, editable = false, onDelete, onMove, onUpdate, ownerId }) => {
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
                            onDelete={() => onDelete(index)}
                            onMove={(dir) => onMove(index, dir)}
                            onEdit={onUpdate}
                            ownerId={ownerId}
                        />

                    )}

                    {block.type === 'promo' && (
                        <PromoBlock
                            block={block}
                            editable={editable}
                            onEdit={onUpdate}
                            onDelete={() => onDelete(index)}
                            onMove={(dir) => onMove(index, dir)}
                        />
                    )}
                    {block.type === 'bouquet' && (
                        <BouquetBlock
                            block={block}
                            editable={editable}
                            onUpdate={onUpdate}
                            onDelete={() => onDelete(index)}
                            onMove={(dir) => onMove(index, dir)}
                            ownerId={ownerId}
                        />
                    )}
                    {block.type === 'gallery' && (
                        <GalleryBlock
                            block={block}
                            editable={editable}
                            onEdit={onUpdate}
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
