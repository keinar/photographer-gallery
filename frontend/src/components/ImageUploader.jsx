import { useState } from "react";
import api from '../services/api';

function ImageUploader({ galleryId, onUploadSuccess }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!files || files.length === 0) {
            setError('Please select files to upload.');
            return;
        }

        setLoading(true);
        setError(null);

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
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err) {
            console.error('Error uploading images:', err);
            const message = err.response?.data?.message || 'Failed to upload images. Please try again.';
            setError(message);
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem', border: '1px dashed #ccc', padding: '0.5rem' }}>
            <h4>Upload Images</h4>
            <input
                type="file"
                multiple
                onChange={handleFileChange}
            />
            <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Images'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
}

export default ImageUploader;