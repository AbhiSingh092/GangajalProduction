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
      console.log('[AdminPanel] Using token:', token ? 'Token found' : 'No token');
      const res = await fetch('/api/admin/portfolio?' + Date.now(), {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('[AdminPanel] Response status:', res.status);
      console.log('[AdminPanel] Response ok:', res.ok);
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
      // No file size limit for production use
      console.log(`Selected file: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

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
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      const isLargeFile = fileSizeMB > 4; // Use direct upload for files > 4MB
      
      console.log(`[handleAddItem] File size: ${fileSizeMB.toFixed(2)}MB, using ${isLargeFile ? 'DIRECT' : 'SERVER'} upload`);

      let uploadData: any;

      if (isLargeFile) {
        // DIRECT UPLOAD to Cloudinary (bypasses Vercel 4.5MB limit)
        console.log('[handleAddItem] Getting upload signature...');
        const sigRes = await fetch('/api/upload-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, title, description })
        });

        if (!sigRes.ok) {
          throw new Error('Failed to get upload signature');
        }

        const sigData = await sigRes.json();
        console.log('[handleAddItem] Got signature, uploading directly to Cloudinary...');

        // Determine resource type
        const isVideo = selectedFile.type.startsWith('video/');
        const resourceType = isVideo ? 'video' : 'image';

        // Upload directly to Cloudinary
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', selectedFile);
        cloudinaryFormData.append('api_key', sigData.api_key);
        cloudinaryFormData.append('timestamp', sigData.timestamp);
        cloudinaryFormData.append('signature', sigData.signature);
        cloudinaryFormData.append('folder', sigData.folder);
        cloudinaryFormData.append('public_id', sigData.public_id);
        cloudinaryFormData.append('tags', sigData.tags);
        cloudinaryFormData.append('context', sigData.context);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/${resourceType}/upload`;
        const cloudRes = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: cloudinaryFormData
        });

        if (!cloudRes.ok) {
          const errText = await cloudRes.text();
          throw new Error(`Cloudinary upload failed: ${errText}`);
        }

        uploadData = await cloudRes.json();
        console.log('[handleAddItem] Direct upload success:', uploadData.secure_url);
      } else {
        // REGULAR upload through our API (for small files)
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
        uploadData = JSON.parse(uploadResponseText);
        console.log('[handleAddItem] Upload success:', uploadData.secure_url);
      }
      
      if (!uploadData.secure_url) {
        throw new Error('No image URL returned from upload');
      }
      
      const imageUrl = uploadData.secure_url;

      // Success! Image with metadata is already stored in Cloudinary
      // No need for separate portfolio/add call since Cloudinary IS our database
      console.log('[AdminPanel] Upload successful for category:', category);
      console.log('[AdminPanel] Image stored in Cloudinary:', imageUrl);
      console.log('[AdminPanel] Full upload data:', uploadData);
      
      // Special debugging for travel and commercial categories
      if (category === 'travel' || category === 'commercial') {
        console.log(`[AdminPanel] ✅ ${category.toUpperCase()} category upload completed:`, {
          title: title,
          category: category,
          imageUrl: imageUrl,
          description: description
        });
      }

      // Clear form
      setTitle('');
      setSelectedFile(null);
      setFilePreview('');
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Wait a moment for Cloudinary to index the new upload
      console.log('[AdminPanel] Waiting for Cloudinary to index new upload...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      // Refresh the items list from Cloudinary
      console.log('[AdminPanel] Refreshing admin panel items list...');
      await loadItems();
      
      // Force refresh the main website cache (for production)
      try {
        // Trigger a cache refresh on the main portfolio API
        console.log('[AdminPanel] Triggering website cache refresh...');
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

  const handleDeleteItem = async (item: any) => {
    if (!confirm(`Delete "${item.title}"? This will permanently remove it from Cloudinary.`)) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      console.log('[Delete] Attempting to delete item:', {
        title: item.title,
        public_id: item.public_id,
        category: item.category
      });
      
      const res = await fetch('/api/admin/portfolio', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ public_id: item.public_id })
      });

      console.log('[Delete] Response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[Delete] Error response:', errorText);
        
        let errorMessage = 'Unknown error';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorText;
        } catch (e) {
          errorMessage = errorText || `HTTP ${res.status}`;
        }
        
        throw new Error(`Delete failed: ${errorMessage}`);
      }

      const responseText = await res.text();
      console.log('[Delete] Success response:', responseText);

      // Refresh the list from Cloudinary
      await loadItems();
      setSuccessMessage(`✅ "${item.title}" deleted successfully from portfolio!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[Delete] Full error:', err);
      alert('Delete Error: ' + errorMessage);
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
                    {categories.map(cat => {
                      // Map categories to user-friendly display names
                      const displayNames = {
                        'product': 'Product Photography',
                        'fashion': 'Fashion Photography', 
                        'event': 'Event Photography',
                        'travel': 'Travel & Lifestyle',
                        'commercial': 'Commercial Photography'
                      };
                      return (
                        <option key={cat} value={cat}>
                          {displayNames[cat as keyof typeof displayNames] || cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      );
                    })}
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
                        onClick={() => handleDeleteItem(item)}
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
