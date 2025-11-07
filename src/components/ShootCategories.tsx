import { useState } from 'react';
import { Camera, Video, Sparkles, Plane, Briefcase, X, Image, Film } from 'lucide-react';
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

  const categories: Category[] = [
    {
      id: 'product',
      title: 'Product Photography',
      icon: Camera,
      description: 'Stunning product shots that make your brand stand out',
      images: [
        'https://res.cloudinary.com/dbz9tnzid/image/upload/v1762524478/pmy0vynnyqjavbfvrror.jpg',
        'https://res.cloudinary.com/dbz9tnzid/image/upload/v1762524478/pmy0vynnyqjavbfvrror.jpg',
        'https://res.cloudinary.com/dbz9tnzid/image/upload/v1762524478/pmy0vynnyqjavbfvrror.jpg'
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
      images: [
        'src/pic4.jpg',
        'src/pic5.jpg',
        'src/pic6.jpg'
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
      images: [
        'src/pic8.jpg',
        'src/pic8.jpg',
        'src/pic10.jpg'
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
      images: [
        'src/image/pic5.jpg',
        'src/image/pic5.jpg',
        'src/image/pic6.jpg'
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
      images: [
        'src/image/pic8.jpg',
        'src/image/pic9.png',
        'src/image/pic10.jpg'
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
                  {category.images[0] ? (
                    <CloudinaryImage
                      src={category.images[0]}
                      alt={category.title}
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
                      {image ? (
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
