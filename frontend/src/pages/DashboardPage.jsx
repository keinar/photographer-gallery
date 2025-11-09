import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import api from '../services/api';
import { useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const fetchGalleries = async () => {
    setListLoading(true);
    try {
        const response = await api.get('/galleries');
        setGalleries(response.data);
    } catch (err) {
        console.error('Error fetching galleries:', err);
        alert('Failed to load galleries. Please try again.');
    } finally {
        setListLoading(false);
    }
  };

    useEffect(() => {
        fetchGalleries();
    }, []);

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  const handleCreateGallery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const response = await api.post('/galleries', {
            title,
            clientName
        });
        alert('Gallery created successfully!');
        setTitle('');
        setClientName('');
        fetchGalleries();
    } catch (err) {
        console.error('Error creating gallery:', err);
        const message = err.response?.data?.message || 'Failed to create gallery. Please try again.';
        setError(message);
        alert(message);
    } finally {
        setLoading(false);
    }
};

const handleDeleteGallery = async (galleryId, galleryTitle) => {
    if (!window.confirm(`Are you sure you want to delete the gallery "${galleryTitle}"? This action cannot be undone.`)) {
        return;
    }

    try {
        await api.delete(`/galleries/${galleryId}`);
        alert('Gallery deleted successfully!');
        fetchGalleries();
    } catch (err) {
        console.error('Error deleting gallery:', err);
        const message = err.response?.data?.message || 'Failed to delete gallery. Please try again.';
        alert(message);
    }
};

const handleDeleteImage = async (galleryId, imagePublicId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete the image "${fileName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        await api.delete(`/galleries/${galleryId}/image`, { data: { publicId: imagePublicId } });
        alert('Image deleted successfully!');
        fetchGalleries();
    } catch (err) {
        console.error('Error deleting image:', err);
        const message = err.response?.data?.message || 'Failed to delete image. Please try again.';
        alert(message);
    }
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <div>
      <h1>Welcome to your Dashboard, {user ? user.name : 'Guest'}!</h1>
      <button onClick={handleLogout}>Logout</button>
      <hr /> 
      <section>
        <h2>Create New Gallery</h2>
        <form onSubmit={handleCreateGallery}>
          <div>
            <label>Gallery Title: </label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label>Client Name (Optional): </label>
            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Gallery'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      </section>
      <hr />

      <section>
        <h2>Your Galleries</h2>
        {listLoading && <p>Loading galleries...</p>}
        {!listLoading && galleries.length === 0 && <p>You haven't created any galleries yet.</p>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!listLoading && galleries.map((gallery) => (
            <div key={gallery._id} style={{ border: '1px solid black', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{capitalizeFirstLetter(gallery.title)}</h3>
                <button 
                  onClick={() => handleDeleteGallery(gallery._id, gallery.title)}
                  style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '0.5rem', cursor: 'pointer' }}
                >
                  Delete Gallery
                </button>
              </div>
              <p>Client: {capitalizeFirstLetter(gallery.clientName) || 'N/A'}</p>
              <p>Link: <a href={`/gallery/${gallery.secretLink}`}>{gallery.secretLink}</a></p>
              
              <ImageUploader 
                galleryId={gallery._id} 
                onUploadSuccess={fetchGalleries}
              />
              
              <div style={{ marginTop: '1rem' }}>
                <h4>Images ({gallery.images.length})</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {gallery.images.map((image) => (
                    <div key={image._id} style={{ position: 'relative', border: '1px solid #ddd', padding: '4px', borderRadius: '4px' }}>
                      <img 
                        src={image.url} 
                        alt={image.fileName} 
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                      />
                      <button
                        onClick={() => handleDeleteImage(gallery._id, image.public_id, image.fileName)}
                        style={{
                          position: 'absolute',
                          top: '0',
                          right: '0',
                          background: 'rgba(255, 0, 0, 0.7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          lineHeight: '20px',
                          textAlign: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;