import { useEffect, useState } from 'react';
import { fetchMediaByCategory, deleteResources } from '../utils/cloudinary';
import CloudinaryImage from './CloudinaryImage';

const CATEGORIES = ['product', 'fashion', 'event', 'travel', 'commercial'];

interface MediaItem {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video' | string;
}

export default function AdminDashboard() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (cat: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMediaByCategory(cat);
      // Map to useful fields
      const mapped: MediaItem[] = data.map((r: any) => ({
        public_id: r.public_id,
        secure_url: r.secure_url,
        resource_type: r.resource_type
      }));

      // Apply ordering from localStorage if exists
      const saved = localStorage.getItem(`bidi:order:${cat}`);
      if (saved) {
        try {
          const order: string[] = JSON.parse(saved);
          mapped.sort((a, b) => (order.indexOf(a.public_id) - order.indexOf(b.public_id)));
        } catch (e) {
          // ignore parse error
        }
      }

      setItems(mapped);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(category);
  }, [category]);

  const handleDelete = async (publicId: string, resourceType: string) => {
    if (!confirm('Delete this media? This action cannot be undone.')) return;
    try {
      setLoading(true);
      await deleteResources([publicId], resourceType === 'video' ? 'video' : 'image');
      setItems((s) => s.filter((i) => i.public_id !== publicId));
    } catch (err) {
      alert('Delete failed. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const arr = [...items];
    const [item] = arr.splice(index, 1);
    arr.splice(to, 0, item);
    setItems(arr);
    // persist order
    localStorage.setItem(`bidi:order:${category}`, JSON.stringify(arr.map(i => i.public_id)));
  };

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

        <div className="mb-4 flex gap-3">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded ${category === c ? 'bg-amber-500 text-black' : 'bg-gray-800'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && <div className="mb-4">Loading...</div>}
        {error && <div className="mb-4 text-red-400">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it, idx) => (
            <div key={it.public_id} className="bg-gray-800 rounded overflow-hidden p-2">
              <div className="h-48 mb-2 overflow-hidden bg-black rounded">
                {it.resource_type === 'video' ? (
                  <video src={it.secure_url} controls className="w-full h-full object-cover" />
                ) : (
                  <CloudinaryImage src={it.secure_url} alt={it.public_id} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm truncate max-w-[60%]">{it.public_id}</div>
                <div className="flex gap-2">
                  <button onClick={() => move(idx, -1)} className="px-2 py-1 bg-gray-700 rounded">↑</button>
                  <button onClick={() => move(idx, 1)} className="px-2 py-1 bg-gray-700 rounded">↓</button>
                  <button onClick={() => handleDelete(it.public_id, it.resource_type)} className="px-2 py-1 bg-red-600 rounded">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button onClick={() => load(category)} className="px-4 py-2 bg-amber-500 rounded text-black">Refresh</button>
        </div>
      </div>
    </div>
  );
}
