import { useState, useEffect } from 'react';
import { Camera, Video, Sparkles, Plane, Briefcase, X, Image, Film } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import VideoPlayer from './VideoPlayer';

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
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      // Fetch portfolio items from server with cache-busting for production
      console.log('[ShootCategories] Fetching portfolio items from /api/portfolio');
      const res = await fetch('/api/portfolio?' + new Date().getTime(), {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      // Check if response is actually JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const text = await res.text();
      if (!text.trim()) {
        throw new Error('Empty response from server');
      }
      
      const items = JSON.parse(text);
      console.log('[ShootCategories] Received', items?.length || 0, 'items:', items);
      
      // Group items by category
      const imagesByCategory: { [key: string]: string[] } = {
        product: [],
        fashion: [],
        event: [],
        travel: [],
        commercial: []
      };
      
      items.forEach((item: any) => {
        console.log(`[ShootCategories] Processing item: "${item.title}" - Category: "${item.category}"`);
        
        const itemCategory = item.category?.toLowerCase()?.trim();
        let targetCategory = null;
        
        // Match category more flexibly
        if (itemCategory === 'product' || itemCategory?.includes('product')) {
          targetCategory = 'product';
        } else if (itemCategory === 'fashion' || itemCategory?.includes('fashion') || itemCategory?.includes('portrait')) {
          targetCategory = 'fashion';
        } else if (itemCategory === 'event' || itemCategory?.includes('event') || itemCategory?.includes('wedding')) {
          targetCategory = 'event';
        } else if (itemCategory === 'travel' || itemCategory?.includes('travel') || itemCategory?.includes('lifestyle')) {
          targetCategory = 'travel';
        } else if (itemCategory === 'commercial' || itemCategory?.includes('commercial') || itemCategory?.includes('business')) {
          targetCategory = 'commercial';
        }
        
        if (targetCategory && imagesByCategory[targetCategory]) {
          imagesByCategory[targetCategory].push(item.imageUrl);
          console.log(`[ShootCategories] ✅ Added "${item.title}" to ${targetCategory} category`);
        } else {
          console.warn(`[ShootCategories] ❌ Could not categorize: "${item.category}" for item: "${item.title}"`);
          // Add to uncategorized or first available category as fallback
          imagesByCategory['product'].push(item.imageUrl);
        }
      });
      
      console.log('[ShootCategories] Final grouped images by category:', imagesByCategory);
      setCategoryImages(imagesByCategory);
    } catch (error) {
      console.error('[ShootCategories] Error loading images:', error);
      // Fallback to empty arrays on error
      setCategoryImages({
        product: [],
        fashion: [],
        event: [],
        travel: [],
        commercial: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load images on mount
  useEffect(() => {
    loadImages();
  }, []);

  // Listen for admin changes (uploads/deletes) via localStorage key so gallery refreshes automatically
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'bidi:mediaUpdated') {
        loadImages();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Refresh images every 5 minutes
  useEffect(() => {
    const intervalId = setInterval(loadImages, 300000); // 5 minutes
    return () => clearInterval(intervalId);
  }, []);

  const openLightbox = (images: string[], index: number) => {
    // Filter out videos for lightbox (lightbox is for images only)
    const imageUrls = images.filter(url => !url.match(/\.(mp4|webm|ogg)$/i));
    setLightboxImages(imageUrls);
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setLightboxImages([]);
    setLightboxIndex(0);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  const categories: Category[] = [
    {
      id: 'product',
      title: 'Product Photography',
      icon: Camera,
      description: 'Stunning product shots that make your brand stand out',
      // Paste your product image URLs in this array
      images: [
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
          {/* Refresh button removed for production UI */}
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From products to portraits, we bring your vision to life with cinematic precision
          </p>
        </div>
      
        {/* Debug panel removed from production UI */}

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
                    category.images[0].match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={category.images[0]}
                        controls
                        className="w-full h-full object-cover rounded-2xl"
                        style={{ background: '#222' }}
                      />
                    ) : (
                      <img
                        src={category.images[0]}
                        alt={category.title}
                        className="w-full h-full object-cover"
                      />
                    )
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedCategory.images.map((mediaUrl, index) => (
                    <div
                      key={index}
                      className="relative h-64 rounded-xl overflow-hidden group bg-gray-700"
                    >
                      {isLoading ? (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 animate-pulse flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : mediaUrl ? (
                        mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                          <VideoPlayer
                            src={mediaUrl}
                            title={`${selectedCategory.title} Video ${index + 1}`}
                            className="w-full h-full"
                          />
                        ) : (
                          <div
                            className="relative w-full h-full cursor-pointer"
                            onClick={() => openLightbox(selectedCategory.images.filter(url => !url.match(/\.(mp4|webm|ogg)$/i)), selectedCategory.images.filter(url => !url.match(/\.(mp4|webm|ogg)$/i)).indexOf(mediaUrl))}
                          >
                            <img
                              src={mediaUrl}
                              alt={`${selectedCategory.title} ${index + 1}`}
                              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                                <Image className="w-6 h-6 text-gray-800" />
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                          <span className="text-gray-400">Media not available</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* View All Button */}
                {selectedCategory.images.length > 6 && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => {
                        const imageUrls = selectedCategory.images.filter(url => !url.match(/\.(mp4|webm|ogg)$/i));
                        if (imageUrls.length > 0) {
                          openLightbox(imageUrls, 0);
                        }
                      }}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold px-8 py-3 rounded-full transition-all transform hover:scale-105"
                    >
                      View All {selectedCategory.images.filter(url => !url.match(/\.(mp4|webm|ogg)$/i)).length} Photos
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {showLightbox && lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </section>
  );
}
