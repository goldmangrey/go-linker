import React, { useState } from 'react';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase/firebase';
import ProductCropper from './ProductCropper';

const EditGalleryModal = ({ block, onClose, onSave }) => {
    const [images, setImages] = useState(block.images || []);
    const [rawImage, setRawImage] = useState(null);

    const uploadImage = async (base64) => {
        const uid = auth.currentUser?.uid;
        if (!uid || !base64) return;
        const storage = getStorage();
        const fileRef = ref(storage, `gallery/${uid}/${Date.now()}.jpg`);
        await uploadString(fileRef, base64, 'data_url');
        const url = await getDownloadURL(fileRef);
        setImages((prev) => [...prev, url]);
    };

    const handleDelete = (index) => {
        const updated = [...images];
        updated.splice(index, 1);
        setImages(updated);
    };

    const moveImage = (from, to) => {
        if (to < 0 || to >= images.length) return;
        const updated = [...images];
        const temp = updated[from];
        updated[from] = updated[to];
        updated[to] = temp;
        setImages(updated);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-bold text-center">Редактировать баннер</h2>

                {images.map((url, i) => (
                    <div key={i} className="relative border rounded overflow-hidden">
                        <img src={url} alt="" className="w-full h-36 object-cover" />
                        <div className="flex justify-between px-2 py-1 bg-white">
                            <button
                                onClick={() => moveImage(i, i - 1)}
                                disabled={i === 0}
                                className="text-sm text-gray-600"
                            >⬅</button>
                            <button
                                onClick={() => moveImage(i, i + 1)}
                                disabled={i === images.length - 1}
                                className="text-sm text-gray-600"
                            >➡</button>
                            <button
                                onClick={() => handleDelete(i)}
                                className="text-sm text-red-600"
                            >Удалить</button>
                        </div>
                    </div>
                ))}

                {images.length < 5 && (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            setRawImage(URL.createObjectURL(e.target.files[0]));
                        }}
                        className="w-full"
                    />
                )}

                <div className="flex justify-between">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Отмена</button>
                    <button
                        onClick={() => onSave({ images })}
                        className="px-4 py-2 bg-lime-500 text-white rounded"
                    >
                        Сохранить
                    </button>
                </div>
            </div>

            {rawImage && (
                <ProductCropper
                    image={rawImage}
                    aspect={3 / 1}
                    onCancel={() => {
                        setRawImage(null);
                    }}
                    onCropDone={(cropped) => {
                        uploadImage(cropped);
                        setRawImage(null);
                    }}
                />
            )}
        </div>
    );
};

export default EditGalleryModal;
