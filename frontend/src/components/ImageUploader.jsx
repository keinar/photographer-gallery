import { useState } from "react";
import api from '../services/api';
import { toast } from 'react-toastify';

function ImageUploader({ galleryId, onUploadSuccess }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!files || files.length === 0) {
            toast.error('Please select files to upload.');
            return;
        }

        setLoading(true);

        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }

        try {
            const response = await api.post(
                `/galleries/${galleryId}/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            alert(response.data.message);
            setLoading(false);
            setFiles(null);
            e.target.reset();
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err) {
            console.error('Error uploading images:', err);
            const message = err.response?.data?.message || 'Failed to upload images. Please try again.';
            toast.error(message);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Upload More Images</h4>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <input
                    type="file"
                    id="imageUploadInput"
                    multiple
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
          "
                />
                <button
                    type="submit"
                    id="uploadButton"
                    disabled={loading}
                    className="mt-2 sm:mt-0 w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline disabled:bg-gray-400">
                    {loading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
        </form>
    );
}

export default ImageUploader;