import { useState } from 'react';
import { uploadImage } from '../utils/cloudinary';

export default function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError(null);
    
    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      
      setUploadedUrls(prev => [...prev, ...urls]);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">Image Uploader</h2>
      
      {/* Upload button */}
      <div className="mb-6">
        <label className="block">
          <span className="sr-only">Choose files</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-amber-500 file:text-black
              hover:file:bg-amber-600
              disabled:opacity-50 disabled:cursor-not-allowed
              cursor-pointer"
          />
        </label>
      </div>

      {/* Loading state */}
      {uploading && (
        <div className="mb-4 text-amber-500">
          Uploading... Please wait.
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 text-red-500">
          {error}
        </div>
      )}

      {/* Uploaded URLs */}
      {uploadedUrls.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Uploaded Images:</h3>
          <div className="space-y-3">
            {uploadedUrls.map((url, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 bg-gray-800 p-3 rounded"
              >
                <img 
                  src={url} 
                  alt={`Uploaded ${index + 1}`}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 truncate">
                  <p className="text-sm text-gray-400 truncate">{url}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(url)}
                  className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-600 transition-colors"
                >
                  Copy URL
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}