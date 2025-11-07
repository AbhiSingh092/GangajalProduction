import { useState } from 'react';
import { login } from '../utils/auth';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (login(username, password)) {
      onLoginSuccess();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-900 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Admin Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 rounded border border-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 px-4 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 rounded border border-gray-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 px-4 py-2 text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 text-black py-2 px-4 rounded hover:bg-amber-600 transition-colors font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}