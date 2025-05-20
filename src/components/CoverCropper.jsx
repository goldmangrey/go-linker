import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImageHelper';

const CoverCropper = ({ image, onCancel, onCropDone }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleDone = async () => {
        const croppedFile = await getCroppedImg(image, croppedAreaPixels, 'cover.jpg');
        onCropDone(croppedFile);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="relative w-[350px] h-[180px] bg-white rounded overflow-hidden">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={3 / 1}
                    cropShape="rect"
                    showGrid={true}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>

            <div className="absolute bottom-10 flex gap-4">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Отмена</button>
                <button onClick={handleDone} className="px-4 py-2 bg-lime-500 text-white rounded">Сохранить</button>
            </div>
        </div>
    );
};

export default CoverCropper;
