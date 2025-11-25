import { useState, useEffect, useRef } from 'react';
import { LogOut, Upload, Trash2 } from 'lucide-react';

interface AdminPanelProps {
  onLogout: () => void;
}

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('product');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['product', 'fashion', 'event', 'travel', 'commercial'];

  // Load portfolio items function (accessible throughout component)
  const loadItems = async () => {
    setIsLoadingItems(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setLoadError('No authentication token found');
        setIsLoadingItems(false);
        return;
      }
      console.log('[AdminPanel] Loading portfolio items from Cloudinary...');
      const res = await fetch('/api/admin/portfolio', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        let errData: any = {};
        try {
          const loadErrorText = await res.text();
          if (loadErrorText.trim()) {
            errData = JSON.parse(loadErrorText);
          }
        } catch (e) {
          console.warn('Failed to parse error response:', e);
        }
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      
      const loadResponseText = await res.text();
      if (!loadResponseText.trim()) {
        throw new Error('Empty response from server');
      }
      const data = JSON.parse(loadResponseText);
      console.log('[AdminPanel] Loaded from Cloudinary:', data.length, 'items');
      setItems(Array.isArray(data) ? data : []);
      setLoadError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load items from Cloudinary';
      console.error('[AdminPanel] Load error:', message);
      setLoadError(message);
      setItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  // Load portfolio items on mount
  useEffect(() => {
    loadItems();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`File too large! Size: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed: 10MB. Please compress your image.`);
        e.target.value = ''; // Clear the input
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedFile) {
      alert('Please fill in all required fields and select an image');
      return;
    }

    setIsLoading(true);
    try {
      // Upload file with metadata to Cloudinary (permanent storage!)
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', category);
      formData.append('title', title);
      formData.append('description', description);

      console.log('[handleAddItem] Uploading file:', selectedFile.name, selectedFile.type);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        let errData: any = {};
        try {
          const uploadErrorText = await uploadRes.text();
          if (uploadErrorText.trim()) {
            errData = JSON.parse(uploadErrorText);
          }
        } catch (e) {
          console.warn('Failed to parse upload error response:', e);
        }
        throw new Error(errData.details || errData.error || `Upload failed: HTTP ${uploadRes.status}`);
      }

      const uploadResponseText = await uploadRes.text();
      if (!uploadResponseText.trim()) {
        throw new Error('Empty response from upload server');
      }
      const uploadData = JSON.parse(uploadResponseText);
      console.log('[handleAddItem] Upload success:', uploadData.secure_url);
      
      if (!uploadData.secure_url) {
        throw new Error('No image URL returned from upload');
      }
      
      const imageUrl = uploadData.secure_url;

      // Success! Image with metadata is already stored in Cloudinary
      // No need for separate portfolio/add call since Cloudinary IS our database
      console.log('[AdminPanel] Upload successful, image stored in Cloudinary:', imageUrl);

      // Clear form
      setTitle('');
      setSelectedFile(null);
      setFilePreview('');
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Refresh the items list from Cloudinary
      await loadItems();
      
      // Force refresh the main website cache (for production)
      try {
        // Trigger a cache refresh on the main portfolio API
        fetch('/api/portfolio', { 
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' }
        }).catch(() => {}); // Silent fail - this is just for cache refresh
      } catch (e) {
        // Silent fail - cache refresh is optional
      }
      
      setSuccessMessage(`✅ Image uploaded successfully! "${title}" is now live on your portfolio website.`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[handleAddItem] Error:', message);
      alert('Error: ' + message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Delete this portfolio item?')) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/admin/portfolio/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete item');

      setItems(items.filter(item => item.id !== id));
      setSuccessMessage('Item deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Portfolio Manager</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {successMessage && (
          <div className="bg-green-900/50 border border-green-700 rounded p-4 mb-6">
            <p className="text-green-200">{successMessage}</p>
          </div>
        )}

        {loadError && (
          <div className="bg-red-900/50 border border-red-700 rounded p-4 mb-6">
            <p className="text-red-200">{loadError}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Add Item Form */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Add Portfolio Item
              </h2>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Item title"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500"
                    disabled={isLoading}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Upload Image/Video *</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500 file:bg-amber-500 file:text-black file:font-semibold file:border-0 file:px-3 file:py-1 file:rounded cursor-pointer"
                    disabled={isLoading}
                  />
                  {filePreview && (
                    <div className="mt-3">
                      {selectedFile?.type.startsWith('video') ? (
                        <video src={filePreview} className="w-full h-32 object-cover rounded" controls />
                      ) : (
                        <img src={filePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 text-black font-semibold py-2 rounded-lg transition-colors"
                >
                  {isLoading ? 'Adding...' : 'Add Item'}
                </button>
              </form>
            </div>
          </div>

          {/* Items List */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Portfolio Items ({items.length})</h2>

              {isLoadingItems ? (
                <p className="text-gray-400 text-center py-8">Loading items...</p>
              ) : items.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No portfolio items yet. Add one to get started!</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="bg-gray-700 rounded p-4 flex gap-4">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23444" width="80" height="80"/%3E%3Ctext x="50" y="50" dominant-baseline="middle" text-anchor="middle" fill="%23888" font-size="12"%3ENo image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-400">{item.category}</p>
                        {item.description && (
                          <p className="text-sm text-gray-300 mt-1">{item.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={isLoading}
                        className="text-red-400 hover:text-red-300 disabled:text-gray-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
