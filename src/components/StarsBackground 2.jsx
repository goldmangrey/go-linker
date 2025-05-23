import React from 'react';

const StarsBackground = () => {
    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="w-full h-full animate-pulse opacity-50 bg-[radial-gradient(#60ff6a_1px,transparent_1px)] bg-[length:20px_20px]" />
        </div>
    );
};

export default StarsBackground;
