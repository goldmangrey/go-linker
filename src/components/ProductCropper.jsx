import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../components/cropImageHelper';

const ProductCropper = ({ image, onCancel, onCropDone }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCrop = async () => {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        onCropDone(croppedImage);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 w-[90vw] max-w-md space-y-4">
                <h2 className="text-center font-bold">Обрезать изображение</h2>
                <div className="relative w-full h-64 bg-gray-100">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>
                <div className="flex justify-between">
                    <button onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded">Отмена</button>
                    <button onClick={handleCrop} className="bg-lime-500 text-white px-4 py-2 rounded">Обрезать</button>
                </div>
            </div>
        </div>
    );
};

export default ProductCropper;
