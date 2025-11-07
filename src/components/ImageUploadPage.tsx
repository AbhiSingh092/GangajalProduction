import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from '../utils/cloudinary';
import { useCategoryImages } from '../hooks/useCategoryImages';

interface UploadedImage {
  url: string;
  name: string;
  category: string;
}

const CATEGORIES = [
  { id: 'product', name: 'Product Photography' },
  { id: 'fashion', name: 'Fashion & Portrait' },
  { id: 'event', name: 'Event Coverage' },
  { id: 'travel', name: 'Travel & Lifestyle' },
  { id: 'commercial', name: 'Commercial' }
];

export default function ImageUploadPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addImageToCategory } = useCategoryImages();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedCategory) {
      setError('Please select a category first');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      console.log('Starting upload for files:', acceptedFiles.map(f => f.name));
      
      for (const file of acceptedFiles) {
        try {
          console.log('Uploading file:', file.name);
          const url = await uploadImage(file);
          console.log('Successfully uploaded:', file.name);
          
          addImageToCategory(selectedCategory, url);
          setUploadedImages(prev => [...prev, {
            url,
            name: file.name,
            category: selectedCategory
          }]);
        } catch (err) {
          console.error('Error uploading file:', file.name, err);
          setError(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error('Upload process error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [selectedCategory]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif']
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upload Images</h1>
        
        {/* Category Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg text-center transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-amber-500 text-black'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 mb-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-amber-500 bg-amber-500/10' : 'border-gray-600 hover:border-amber-500/50'}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="text-amber-500">Uploading...</div>
          ) : isDragActive ? (
            <p>Drop the images here...</p>
          ) : (
            <div>
              <p className="mb-2">Drag & drop images here, or click to select files</p>
              <p className="text-sm text-amber-500">
                Uploading to: {CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Uploaded Images by Category */}
        {CATEGORIES.map(category => {
          const categoryImages = uploadedImages.filter(img => img.category === category.id);
          if (categoryImages.length === 0) return null;

          return (
            <div key={category.id} className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryImages.map((image, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="font-medium mb-2 truncate">{image.name}</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={image.url}
                          readOnly
                          className="flex-1 bg-gray-900 rounded px-3 py-1 text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(image.url)}
                          className="bg-amber-500 text-black px-3 py-1 rounded hover:bg-amber-600 text-sm"
                        >
                          Copy URL
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}