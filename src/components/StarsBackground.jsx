// src/components/StarsBackground.jsx

import React from 'react';

const StarsBackground = () => {
    return (
        <div className="absolute inset-0 z-0">
            <div className="w-full h-full opacity-30 animate-pulse bg-[radial-gradient(#60ff6a_0.5px,transparent_1px)] bg-[length:20px_20px]" />
        </div>
    );
};

export default StarsBackground;
