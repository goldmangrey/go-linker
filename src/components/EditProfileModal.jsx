import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import ImageCropper from './ImageCropper';
import CoverCropper from './CoverCropper';

const EditProfileModal = ({ block, onClose, onSave }) => {
    const [orgName, setOrgName] = useState(block.orgName || '');
    const [orgAddress, setOrgAddress] = useState(block.orgAddress || '');
    const [logoUrl, setLogoUrl] = useState(block.logoUrl || '');
    const [coverUrl, setCoverUrl] = useState(block.coverUrl || '');
    const [rawLogo, setRawLogo] = useState(null);
    const [rawCover, setRawCover] = useState(null);
    const [loading, setLoading] = useState(false);

    const uploadBase64 = async (dataUrl, path) => {
        const uid = auth.currentUser?.uid;
        if (!uid) return '';
        const storage = getStorage();
        const fileRef = ref(storage, `profile/${uid}/${path}`);
        await uploadString(fileRef, dataUrl, 'data_url');
        await new Promise((res) => setTimeout(res, 600));
        return await getDownloadURL(fileRef);
    };

    const handleSave = async () => {
        setLoading(true);
        const finalBlock = {
            ...block,
            orgName,
            orgAddress,
            logoUrl,
            coverUrl,
        };
        onSave(finalBlock);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-bold text-center">Редактировать профиль</h2>

                <input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Название организации"
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    value={orgAddress}
                    onChange={(e) => setOrgAddress(e.target.value)}
                    placeholder="Адрес"
                    className="w-full border rounded px-3 py-2"
                />

                <div>
                    <label className="block mb-1 font-medium text-sm">Логотип</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => setRawLogo(reader.result);
                            reader.readAsDataURL(file);
                        }}
                        className="w-full"
                    />
                    {logoUrl && (
                        <img src={logoUrl} alt="logo" className="w-20 h-20 object-cover mx-auto mt-2 rounded-full border" />
                    )}
                </div>

                <div>
                    <label className="block mb-1 font-medium text-sm">Обложка</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => setRawCover(reader.result);
                            reader.readAsDataURL(file);
                        }}
                        className="w-full"
                    />
                    {coverUrl && (
                        <img src={coverUrl} alt="cover" className="w-full h-24 object-cover mt-2 rounded" />
                    )}
                </div>

                <div className="flex justify-between pt-2">
                    <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Отмена</button>
                    <button
                        onClick={handleSave}
                        className="bg-lime-500 text-white px-4 py-2 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </div>

            {rawLogo && (
                <ImageCropper
                    image={rawLogo}
                    onCancel={() => setRawLogo(null)}
                    onCropDone={async (dataUrl) => {
                        setRawLogo(null);
                        const url = await uploadBase64(dataUrl, 'logo');
                        setLogoUrl(url);
                    }}
                />
            )}

            {rawCover && (
                <CoverCropper
                    image={rawCover}
                    onCancel={() => setRawCover(null)}
                    onCropDone={async (dataUrl) => {
                        setRawCover(null);
                        const url = await uploadBase64(dataUrl, 'cover');
                        setCoverUrl(url);
                    }}
                />
            )}
        </div>
    );
};

export default EditProfileModal;
