import { Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute'
import GalleryPage from "./pages/GalleryPage";
import ProfilePage from './pages/ProfilePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <main>
        <Routes>
          {/* public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />

          <Route path="/gallery/:secretLink" element={<GalleryPage />} />

          {/* protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </main>

      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
export default App;