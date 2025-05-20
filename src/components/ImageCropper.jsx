import React, { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImageHelper';

const ImageCropper = ({ image, onCancel, onCropDone }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleDone = async () => {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        const reader = new FileReader();
        reader.onloadend = () => {
            onCropDone(reader.result); // base64 для дальнейшей загрузки
        };
        reader.readAsDataURL(croppedImage);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="relative w-[300px] h-[300px] bg-white rounded-lg overflow-hidden">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>

            <div className="absolute bottom-10 flex gap-4">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Отмена</button>
                <button onClick={handleDone} className="px-4 py-2 bg-lime-500 text-white rounded">Загрузить</button>
            </div>
        </div>
    );
};

export default ImageCropper;
