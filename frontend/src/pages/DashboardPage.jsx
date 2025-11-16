import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import api from '../services/api';
import { useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [galleries, setGalleries] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const fetchGalleries = async () => {
    setListLoading(true);
    try {
      const response = await api.get('/galleries');
      setGalleries(response.data);
    } catch (err) {
      console.error('Error fetching galleries:', err);
      toast.error('Failed to load galleries. Please try again.');
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
    toast.dismiss();

    try {
      const response = await api.post('/galleries', {
        title,
        clientName
      });
      toast.success('Gallery created successfully!');
      setTitle('');
      setClientName('');
      fetchGalleries();
    } catch (err) {
      console.error('Error creating gallery:', err.response.data);
      // Check if this is a Zod validation error
      if (err.response?.data?.errors) {
        // Get the first error message from the Zod array
        const zodErrorMessage = err.response.data.errors[0].message;
        toast.error(zodErrorMessage);
      } else {
        // Fallback for other types of errors
        const message = err.response?.data?.message || 'Failed to create gallery. Please try again.';
        toast.error(message);
      }
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
      toast.success('Gallery deleted successfully!');
      fetchGalleries();
    } catch (err) {
      console.error('Error deleting gallery:', err);
      const message = err.response?.data?.message || 'Failed to delete gallery. Please try again.';
      toast.error(message);
    }
  };

  const handleDeleteImage = async (galleryId, imagePublicId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete the image "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/galleries/${galleryId}/image`, { data: { publicId: imagePublicId } });
      toast.success('Image deleted successfully!');
      fetchGalleries();
    } catch (err) {
      console.error('Error deleting image:', err);
      const message = err.response?.data?.message || 'Failed to delete image. Please try again.';
      toast.error(message);
    }
  };

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to your Dashboard, {user ? user.name : 'Guest'}!</h1>
        <div className="flex gap-4">
          <Link
            to="/profile"
            id="editProfileButton"
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-md shadow-sm"
          >
            Edit Profile
          </Link>
          <button
            id="logoutButton"
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
          >
            Logout
          </button>
        </div>
      </header>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-5">Create New Gallery</h2>
            <form onSubmit={handleCreateGallery} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Gallery Title</label>
                <input
                  type="text"
                  id="galleryTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                  Client Name (Optional)
                </label>
                <input
                  type="text"
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <button
                type="submit"
                id="createGalleryButton"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Gallery'}
              </button>
            </form>
          </div>
        </aside>

        <main className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-5">Your Galleries</h2>
            {listLoading && <p>Loading galleries...</p>}
            {!listLoading && galleries.length === 0 && <p>You haven't created any galleries yet.</p>}

            <div className="space-y-6">
              {!listLoading && galleries.map((gallery) => (
                <div key={gallery._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{gallery.title}</h3>
                    <button
                      id={`deleteGalleryButton-${gallery._id}`}
                      onClick={() => handleDeleteGallery(gallery._id, gallery.title)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded-md focus:outline-none"
                    >
                      Delete Gallery
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium" id={`clientName-${gallery._id}`}>Client:</span> {gallery.clientName || 'N/A'}</p>
                    <p><span className="font-medium" id={`publicLink-${gallery._id}`}>Public Link:</span>
                      <a href={`/gallery/${gallery.secretLink}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                        /gallery/{gallery.secretLink}
                      </a>
                    </p>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Images ({gallery.images.length})</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {gallery.images.map((image) => (
                        <div key={image._id} className="relative group">
                          <img
                            id={`image-${image._id}`}
                            src={image.url}
                            alt={image.fileName}
                            className="w-full h-20 sm:h-24 object-cover rounded-md"
                          />
                          <button
                            id={`deleteImageButton-${image._id}`}
                            onClick={() => handleDeleteImage(gallery._id, image.public_id, image.fileName)}
                            className="absolute top-0 right-0 m-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold opacity-50 group-hover:opacity-100 transition-opacity"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <ImageUploader
                    galleryId={gallery._id}
                    onUploadSuccess={fetchGalleries}
                  />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;