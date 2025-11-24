import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';

export default function AdminPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (has valid token)
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // Optionally verify token with server (not required for simple setup)
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return isLoggedIn ? (
    <AdminPanel onLogout={() => setIsLoggedIn(false)} />
  ) : (
    <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />
  );
}
