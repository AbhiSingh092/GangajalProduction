import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from '../utils/cloudinary';

interface ImageUpload {
  category: string;
  url: string;
  publicId: string;
}

const categories = ['product', 'fashion', 'event', 'travel', 'commercial'];

export default function AdminUpload() {
  const [uploads, setUploads] = useState<ImageUpload[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    try {
      const newUploads: ImageUpload[] = [];
      
      for (const file of acceptedFiles) {
        const result = await uploadImage(file, selectedCategory);
        newUploads.push({
          category: selectedCategory,
          url: result.url,
          publicId: result.publicId
        });
      }

      setUploads(prev => [...prev, ...newUploads]);

      // Create a formatted string of URLs for easy copying
      const urlsList = newUploads
        .map(upload => `'${upload.url}'`)
        .join(',\n');

      // Copy to clipboard
      await navigator.clipboard.writeText(urlsList);
      alert('URLs copied to clipboard! You can now paste these into your code.');

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Check console for details.');
    } finally {
      setIsUploading(false);
    }
  }, [selectedCategory]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Image Upload</h1>
        
        {/* Category Selection */}
        <div className="mb-6">
          <label className="block text-white mb-2">Select Category:</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full max-w-xs px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-10 rounded-lg text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 hover:border-amber-500/50'}
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <p className="text-amber-500">Uploading...</p>
          ) : isDragActive ? (
            <p className="text-amber-500">Drop the files here...</p>
          ) : (
            <p className="text-gray-400">Drag & drop images here, or click to select files</p>
          )}
        </div>

        {/* Uploads List */}
        {uploads.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Recent Uploads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploads.map((upload, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded">
                  <p className="text-amber-500 font-semibold mb-2">
                    {upload.category.charAt(0).toUpperCase() + upload.category.slice(1)}
                  </p>
                  <img
                    src={upload.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-48 object-cover rounded mb-2"
                  />
                  <p className="text-gray-400 text-sm break-all">{upload.url}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}