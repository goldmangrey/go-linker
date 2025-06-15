import React from 'react';

const BouquetPreview = ({ selected, flowers, selectedWrapping, wrappings, onClear }) => {
    const wrapperImg = selectedWrapping ? wrappings.find((w) => w.id === selectedWrapping)?.imageUrl : null;


    const selectedFlowers = Object.entries(selected).flatMap(([id, count]) => {
        const flower = flowers.find((f) => f.id === id);
        return flower ? Array(count).fill(flower.imageUrl) : [];
    });

    return (
        <div className="mt-6">
            <h2 className="text-center text-base font-semibold mb-2">Предварительный вид</h2>

            {Object.keys(selected).length > 0 && (
                <div className="flex justify-center mb-2">
                    <button
                        onClick={onClear}
                        className="text-sm text-red-600 border border-red-400 px-2 py-1 rounded hover:bg-red-50 transition"
                    >
                        Очистить букет ✕
                    </button>
                </div>
            )}

            <div className="relative h-[260px] pt-6 w-full max-w-[300px] mx-auto bg-white rounded-lg shadow-sm flex items-end justify-center overflow-hidden">
                {/* Упаковка задний план */}
                {wrapperImg && (
                    <img
                        src={wrapperImg}
                        alt="Упаковка"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 z-0"
                    />
                )}

                {/* Цветы */}
                {selectedFlowers.map((img, i) => {
                    const maxOffset = 40;
                    const maxAngle = 35;
                    const direction = i % 2 === 0 ? -1 : 1;
                    const half = Math.floor(selectedFlowers.length / 2);
                    const relativeIndex = i <= half ? i : selectedFlowers.length - i;
                    const angle = direction * Math.min(maxAngle, relativeIndex * 6);
                    const offsetX = direction * Math.min(maxOffset, 1 + relativeIndex * 1);
                    const offsetY = Math.min(i * 5, 20);

                    return (
                        <img
                            key={i}
                            src={img}
                            alt={`Цветок ${i}`}
                            className="absolute w-20 z-20 transition-transform duration-500"
                            style={{
                                bottom: 85 + offsetY,
                                left: `calc(50% + ${offsetX}px)`,
                                transform: `translateX(-50%) rotate(${angle}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        />
                    );
                })}

                {/* Упаковка передний план */}
                {wrapperImg && (
                    <img
                        src={wrapperImg}
                        alt="Упаковка"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 z-50 pointer-events-none"
                    />
                )}
            </div>
        </div>
    );
};

export default BouquetPreview;
