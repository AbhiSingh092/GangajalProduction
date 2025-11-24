import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Verify password with server
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        let data = {};
        try {
          const loginErrorText = await res.text();
          if (loginErrorText.trim()) {
            data = JSON.parse(loginErrorText);
          }
        } catch (e) {
          console.warn('Failed to parse login error response:', e);
        }
        throw new Error(data.error || 'Invalid password');
      }

      const loginResponseText = await res.text();
      if (!loginResponseText.trim()) {
        throw new Error('Empty response from login server');
      }
      const data = JSON.parse(loginResponseText);
      // Store token in localStorage for future requests
      localStorage.setItem('admin_token', data.token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-500 p-3 rounded-full">
              <Lock className="w-6 h-6 text-black" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Portal</h1>
          <p className="text-gray-400 text-center mb-6">Enter admin password to manage portfolio</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Admin Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 pr-12 rounded-lg bg-gray-700 text-white border border-gray-600 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-amber-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 text-black font-semibold py-2 rounded-lg transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}