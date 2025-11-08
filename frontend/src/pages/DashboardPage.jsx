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

  return (
    <div>
      <h1>Welcome to your Dashboard, {user ? user.name : 'Guest'}!</h1>
      <p>This page is protected.</p>
      <button onClick={handleLogout}>Logout</button>
      <hr/>
      <section>
        <h2>Create New Gallery</h2>
        <form onSubmit={handleCreateGallery}>
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Client Name: (Optional)</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Gallery'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      </section>
        <hr/>
        <section>
            <h2>Your Galleries</h2>
            {listLoading && <p>Loading galleries...</p>}
            {!listLoading && galleries.length === 0 && <p>No galleries found.</p>}
            
            <div style={{display: 'flex', flexDirection:'column', gap: '1rem'}}>
                {!listLoading && galleries.map((gallery) => (
                    <div key={gallery._id} style={{ border: '1px solid black', padding: '1rem' }}>
                        <h3>{gallery.title}</h3>
                        <p>Client: {gallery.clientName || 'N/A'}</p>
                        <p>Images: {gallery.images.length}</p>
                        <p>Link: {gallery.secretLink}</p>

                        <ImageUploader 
                            galleryId={gallery._id} 
                            onUploadSuccess={fetchGalleries} 
                        />
                    </div>
                ))}
            </div>
        </section>
    </div>
  );
}

export default DashboardPage;