import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

function GalleryPage() {
    const { secretLink } = useParams();
    const [gallery, setGallery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = '/api';

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const response = await api.get(
                    `/galleries/public/${secretLink}`);
                setGallery(response.data);
            } catch (err) {
                console.error('Error fetching gallery:', err);
                toast.error('Gallery not found or invalid link.');
                setError('Gallery not found or invalid link.');
            } finally {
                setLoading(false);
            }
        };
        if (secretLink) {
            fetchGallery();
        }
    }, [secretLink]);

    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    if (loading) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p className="text-xl text-gray-600">Loading gallery...</p>
          </div>
        );
    }
    if (error) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p className="text-xl text-red-600">{error}</p>
          </div>
        );
    }
    if (!gallery) {
        return null;
    }

    return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {capitalizeFirstLetter(gallery.title)}
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              For {capitalizeFirstLetter(gallery.clientName) || 'our valued client'}
            </p>
          </div>
          
          {gallery.images.length > 0 && (
            <a 
              href={`${API_URL}/galleries/public/${secretLink}/download`}
              download
              className="w-full sm:w-auto flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-150"
            >
              Download All ({gallery.images.length})
            </a>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {gallery.images.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">Images are not ready yet. Please check back later.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.images.map((image) => (
              <div key={image._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {image.resourceType === 'video' ? (
                    <video 
                        src={image.url} 
                        alt={image.fileName} 
                        controls 
                        className="w-full h-64 object-cover" 
                    />
                ) : (
                    <img 
                        src={image.url} 
                        alt={image.fileName} 
                        className="w-full h-64 object-cover" 
                    />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default GalleryPage;