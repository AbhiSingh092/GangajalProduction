import { useState, useEffect } from 'react';
import { Camera, Video, Sparkles, Plane, Briefcase, X, Image, Film } from 'lucide-react';
import { fetchImagesByCategory } from '../utils/cloudinary';
import CloudinaryImage from './CloudinaryImage';

interface Category {
  id: string;
  title: string;
  icon: any;
  description: string;
  images: string[];
  mediaTypes: { type: 'photo' | 'video'; label: string }[];
}

export default function ShootCategories() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryImages, setCategoryImages] = useState<{ [key: string]: string[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      console.log('Starting image load...');
      // Fetch all categories in parallel for better performance
      const [productImages, fashionImages, eventImages, travelImages, commercialImages] = await Promise.all([
        fetchImagesByCategory('product'),
        fetchImagesByCategory('fashion'),
        fetchImagesByCategory('event'),
        fetchImagesByCategory('travel'),
        fetchImagesByCategory('commercial')
      ]);

      console.log('Images loaded:', {
        product: productImages?.length || 0,
        fashion: fashionImages?.length || 0,
        event: eventImages?.length || 0,
        travel: travelImages?.length || 0,
        commercial: commercialImages?.length || 0
      });

      setCategoryImages({
        product: productImages,
        fashion: fashionImages,
        event: eventImages,
        travel: travelImages,
        commercial: commercialImages
      });
    } catch (error) {
      console.error('Error loading images:', error);
      // Show the error in the UI for testing purposes
      const errorElement = document.createElement('div');
      errorElement.style.position = 'fixed';
      errorElement.style.bottom = '20px';
      errorElement.style.right = '20px';
      errorElement.style.backgroundColor = 'red';
      errorElement.style.color = 'white';
      errorElement.style.padding = '10px';
      errorElement.style.borderRadius = '5px';
      errorElement.textContent = 'Error loading images. Check console for details.';
      document.body.appendChild(errorElement);
      setTimeout(() => errorElement.remove(), 5000);
    } finally {
      console.log('Image loading completed');
      setIsLoading(false);
    }
  };

  // Load images on mount
  useEffect(() => {
    loadImages();
  }, []);

  // Refresh images every 5 minutes
  useEffect(() => {
    const intervalId = setInterval(loadImages, 300000); // 5 minutes
    return () => clearInterval(intervalId);
  }, []);

  const categories: Category[] = [
    {
      id: 'product',
      title: 'Product Photography',
      icon: Camera,
      description: 'Stunning product shots that make your brand stand out',
      // Paste your product image URLs in this array
      images: [
        // Example: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/your-image-id',
        
        'https://res.cloudinary.com/dbz9tnzid/image/upload/v1762544224/bzqkrmqfazwbkyeunrvd.jpg',
        ...categoryImages['product'] || []
      ],
      mediaTypes: [
        { type: 'photo', label: 'Product Photos' },
        { type: 'video', label: '360° Product Videos' }
      ]
    },
    {
      id: 'fashion',
      title: 'Fashion & Portrait',
      icon: Sparkles,
      description: 'Elegant fashion photography and captivating portraits',
      // Paste your fashion image URLs in this array
      images: [
        'https://res.cloudinary.com/dbz9tnzid/image/upload/v1762795741/nlfthjhsdboulynmemnz.jpg',
        'https://res.cloudinary.com/dbz9tnzid/image/upload/v1762795837/tciqulmmiqecnaud7jsn.jpg',
        'https://res.cloudinary.com/dbz9tnzid/image/upload/v1762795863/xujusmvpnc5xmbcn5akh.jpg',
        'https://res.cloudinary.com/dbz9tnzid/image/upload/v1762795881/nwvloyhj35rr1nybm2ra.jpg',
        'https://res.cloudinary.com/dbz9tnzid/image/upload/v1762795902/jpag4bbj2ppbgojiw5ox.jpg',
        // Example: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/your-fashion-image',
        ...categoryImages['fashion'] || []
      ],
      mediaTypes: [
        { type: 'photo', label: 'Fashion Photography' },
        { type: 'video', label: 'Portrait Reels' }
      ]
    },
    {
      id: 'event',
      title: 'Event Coverage',
      icon: Video,
      description: 'Capturing unforgettable moments at your special events',
      // Paste your event image URLs in this array
      images: [
        // Example: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/your-event-image',
        ...categoryImages['event'] || []
      ],
      mediaTypes: [
        { type: 'photo', label: 'Event Photography' },
        { type: 'video', label: 'Event Cinematography' }
      ]
    },
    {
      id: 'travel',
      title: 'Travel & Lifestyle',
      icon: Plane,
      description: 'Documenting journeys and authentic lifestyle moments',
      // Paste your travel image URLs in this array
      images: [
        'https://res.cloudinary.com/dbz9tnzid/image/upload/v1762545478/kilxffw8rf2fzgk5lzms.jpg',
        'https://res.cloudinary.com/dbz9tnzid/image/upload/v1762545478/kilxffw8rf2fzgk5lzms.jpg',
        // Example: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/your-travel-image',
        ...categoryImages['travel'] || []
      ],
      mediaTypes: [
        { type: 'photo', label: 'Travel Photography' },
        { type: 'video', label: 'Travel Documentaries' }
      ]
    },
    {
      id: 'commercial',
      title: 'Commercial',
      icon: Briefcase,
      description: 'Professional content for brands and businesses',
      // Paste your commercial image URLs in this array
      images: [
        // Example: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/your-commercial-image',
        // Add your commercial image URLs here, for example:
        // 'https://res.cloudinary.com/dbz9tnzid/image/upload/v1234567890/your-commercial-image1.jpg',
        // 'https://res.cloudinary.com/dbz9tnzid/image/upload/v1234567890/your-commercial-image2.jpg',
        ...categoryImages['commercial'] || []
      ],
      mediaTypes: [
        { type: 'photo', label: 'Commercial Shoots' },
        { type: 'video', label: 'Brand Videos' }
      ]
    }
  ];

  return (
    <section id="shoots" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">
            Our Expertise
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From products to portraits, we bring your vision to life with cinematic precision
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-500 hover:scale-105"
                onClick={() => setSelectedCategory(category)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                <div className="h-80 transition-transform duration-700 group-hover:scale-110 overflow-hidden">
                  {isLoading ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 animate-pulse flex items-center justify-center">
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  ) : category.images[0] ? (
                    <CloudinaryImage
                      src={category.images[0]}
                      alt={category.title}
                      width={640}
                      className="w-full h-full object-cover transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">Image not available</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="font-playfair text-2xl font-bold text-white">
                      {category.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm">{category.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedCategory && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="max-w-6xl w-full bg-gray-900 rounded-2xl overflow-hidden">
            <div className="relative">
              <button
                onClick={() => setSelectedCategory(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors"
              >
                <X className="w-6 h-6 text-black" />
              </button>
              <div className="p-8">
                <h3 className="font-playfair text-3xl font-bold text-white mb-2">
                  {selectedCategory.title}
                </h3>
                <p className="text-gray-400 mb-6">{selectedCategory.description}</p>

                <div className="mb-8">
                  <h4 className="text-amber-500 font-semibold mb-4">Available Formats</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedCategory.mediaTypes.map((media, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 hover:border-amber-500/60 transition-colors"
                      >
                        {media.type === 'photo' ? (
                          <Image className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Film className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="text-sm text-white">{media.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedCategory.images.map((image, index) => (
                    <div
                      key={index}
                      className="h-64 rounded-lg overflow-hidden group cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 animate-pulse flex items-center justify-center">
                          <span className="text-gray-400">Loading...</span>
                        </div>
                      ) : image ? (
                        <CloudinaryImage
                          src={image}
                          alt={`${selectedCategory.title} ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                          <span className="text-gray-400">Image not available</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
