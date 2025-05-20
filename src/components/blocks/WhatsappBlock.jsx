import React, { useState } from 'react';
import EditButtonModal from '../EditButtonModal';

const WhatsappBlock = ({ block, editable = false, onUpdate }) => {
    const {
        type = 'whatsapp',
        number = '',
        label = 'Открыть',
        color = '#25D366',
        link = ''
    } = block;

    const url = type === 'whatsapp' ? `https://wa.me/${number}` : link || '#';

    const [showEditor, setShowEditor] = useState(false);

    return (
        <div className="relative border rounded-lg p-3 bg-white shadow text-center">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-block py-3 px-6 rounded text-white font-semibold shadow"
                style={{ backgroundColor: color }}
            >
                {label}
            </a>

            {editable && (
                <div className="mt-2 text-right">
                    <button
                        onClick={() => setShowEditor(true)}
                        className="bg-black text-white text-xs px-3 py-1 rounded"
                    >
                        ✏️ Редактировать кнопку
                    </button>
                </div>
            )}

            {showEditor && (
                <EditButtonModal
                    block={block}
                    onClose={() => setShowEditor(false)}
                    onSave={(updatedBlock) => {
                        onUpdate && onUpdate(updatedBlock);
                        setShowEditor(false);
                    }}
                />
            )}
        </div>
    );
};

export default WhatsappBlock;
