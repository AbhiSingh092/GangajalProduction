import { useState, useEffect } from 'react';
import { isAuthenticated, logout } from '../utils/auth';
import AdminLogin from './AdminLogin';
import ImageUploadPage from './ImageUploadPage';

export default function AdminPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div>
      {/* Admin Header */}
      <div className="bg-gray-900 py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Admin Portal</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.location.href = '/'}
            className="text-gray-300 hover:text-white transition-colors"
          >
            View Website
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <ImageUploadPage />
    </div>
  );
}