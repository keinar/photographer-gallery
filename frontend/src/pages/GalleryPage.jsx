import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

function GalleryPage() {
    const { secretLink } = useParams();
    const [gallery, setGallery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for Lightbox (Modal)
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const API_URL = '/api'; 

    /**
     * Helper to inject Cloudinary optimization transformations.
     * f_auto: automatic format selection (WebP, AVIF, etc.)
     * q_auto: automatic quality compression
     */
    const getOptimizedUrl = (url, resourceType, isThumbnail = false) => {
        if (!url || !url.includes('cloudinary.com')) return url;

        let transformations = 'f_auto,q_auto';
        
        // Add width limit for grid thumbnails to save more bandwidth
        if (isThumbnail && resourceType === 'image') {
            transformations += ',w_500,c_scale';
        }

        return url.replace('/upload/', `/upload/${transformations}/`);
    };

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const response = await api.get(`/galleries/public/${secretLink}`);
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

    useEffect(() => {
        if (gallery && gallery.title) {
            document.title = `${capitalizeFirstLetter(gallery.title)} | Photographer Gallery`;
        } else {
            document.title = 'Photographer Gallery';
        }

        return () => {
            document.title = 'Photographer Gallery';
        };
    }, [gallery]);

    const openModal = (media) => {
        setSelectedMedia(media);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedMedia(null);
        setIsModalOpen(false);
    };

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
      {/* Header Section */}
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

      {/* Gallery Grid */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {gallery.images.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">Images are not ready yet. Please check back later.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.images.map((image) => (
              <div 
                key={image._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition hover:scale-105 duration-200"
                onClick={() => openModal(image)}
              >
                {image.resourceType === 'video' ? (
                    <video 
                        src={getOptimizedUrl(image.url, 'video', true)} 
                        className="w-full h-64 object-cover" 
                        muted 
                        onMouseOver={event => event.target.play()}
                        onMouseOut={event => event.target.pause()}
                    />
                ) : (
                    <img 
                        src={getOptimizedUrl(image.url, 'image', true)} 
                        alt={image.fileName} 
                        loading="lazy"
                        className="w-full h-64 object-cover" 
                    />
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {isModalOpen && selectedMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-4xl font-light hover:text-gray-300 z-50 focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>

            {/* Media Content - High Quality optimized */}
            {selectedMedia.resourceType === 'video' ? (
              <video 
                src={getOptimizedUrl(selectedMedia.url, 'video')} 
                controls 
                autoPlay 
                className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl" 
              />
            ) : (
              <img 
                src={getOptimizedUrl(selectedMedia.url, 'image')} 
                alt={selectedMedia.fileName} 
                className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl" 
              />
            )}

            {/* Caption/Filename */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white text-sm bg-black bg-opacity-50 inline-block px-4 py-1 rounded-full">
                    {selectedMedia.fileName}
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryPage;