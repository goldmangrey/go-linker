import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsappBlock = ({ block }) => {
    const number = block.number || '';
    return (
        <a
            href={`https://wa.me/${number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white flex items-center justify-center px-4 py-3 rounded-lg shadow"
        >
            <FaWhatsapp className="text-xl mr-2" />
            <span className="font-semibold">Написать в WhatsApp</span>
        </a>
    );
};

export default WhatsappBlock;
