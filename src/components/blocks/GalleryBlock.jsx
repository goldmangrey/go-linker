import React, { useState, useEffect } from 'react';
import EditGalleryModal from '../EditGalleryModal';

const GalleryBlock = ({ block, editable = false, onEdit }) => {
    const [showEditor, setShowEditor] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const images = block.images || [];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className="relative rounded-xl overflow-hidden h-[33vh] w-full shadow-lg">
            {editable && (
                <div className="absolute top-2 left-2 z-10">
                    <button
                        onClick={() => setShowEditor(true)}
                        className="bg-lime-600 text-white text-xs px-3 py-1 rounded shadow hover:bg-lime-700"
                    >
                        ✏️ Редактировать
                    </button>
                </div>
            )}


            <div className="w-full h-full">
                {images.map((url, idx) => (
                    <img
                        key={idx}
                        src={url}
                        alt=""
                        className={`w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-1000 ${idx === activeIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
                    />
                ))}
            </div>

            {showEditor && (
                <EditGalleryModal
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

export default GalleryBlock;
