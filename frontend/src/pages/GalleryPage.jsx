import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const GalleryStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    padding: '1rem',
};

const ImageStyle = {
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
};

function GalleryPage() {
    const { secretLink } = useParams();
    const [gallery, setGallery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const response = await api.get(
                    `/galleries/public/${secretLink}`);
                setGallery(response.data);
            } catch (err) {
                console.error('Error fetching gallery:', err);
                setError('Gallery not found or invalid link.');
            } finally {
                setLoading(false);
            }
        };
        if (secretLink) {
            fetchGallery();
        }
    }, [secretLink]);

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading gallery...</div>;
    }
    if (error) {
        return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
    }

    if (!gallery) {
        return null;
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
    <div style={{ padding: '1rem' }}>
      <h2>{capitalizeFirstLetter(gallery.title)}</h2>
      <p>For {capitalizeFirstLetter(gallery.clientName) || 'our valued client'}</p>

      <hr />

      <div style={GalleryStyle}>
        {gallery.images.length === 0 ? (
          <p>Images are not ready yet. Please check back later.</p>
        ) : (
          gallery.images.map((image) => (
            <div key={image._id}>
              <img src={image.url} alt={image.fileName} style={ImageStyle} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GalleryPage;