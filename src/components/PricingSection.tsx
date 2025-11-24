import { useState } from 'react';
import { ArrowRight, Calendar, Clock, MapPin, Users, Camera, Video, Star } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string[];
  popular?: boolean;
  description: string;
  includes: {
    photos?: number;
    videos?: number;
    editing: boolean;
    prints?: number;
  };
}

export default function PricingSection() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const packages: Package[] = [
    {
      id: 'basic',
      name: 'Basic Package',
      price: '₹15,000',
      duration: '4 Hours',
      description: 'Perfect for small events and intimate gatherings',
      features: [
        'Professional photographer',
        'High-resolution digital photos',
        'Basic editing included',
        'Online gallery access',
        '48-hour delivery'
      ],
      includes: {
        photos: 100,
        editing: true,
        prints: 20
      }
    },
    {
      id: 'premium',
      name: 'Premium Package',
      price: '₹35,000',
      duration: '8 Hours',
      description: 'Complete coverage for weddings and major events',
      popular: true,
      features: [
        'Two professional photographers',
        'Unlimited high-resolution photos',
        'Advanced editing & retouching',
        'Cinematic highlights video',
        'Premium online gallery',
        'Same-day preview delivery',
        '50 printed photos included'
      ],
      includes: {
        photos: 500,
        videos: 1,
        editing: true,
        prints: 50
      }
    },
    {
      id: 'luxury',
      name: 'Luxury Package',
      price: '₹75,000',
      duration: 'Full Day',
      description: 'Ultimate photography experience with premium services',
      features: [
        'Team of 3 professional photographers',
        'Unlimited photos & videos',
        'Drone photography included',
        'Professional editing suite',
        'Multiple cinematic videos',
        'Premium album creation',
        'Instant social media delivery',
        '100 premium prints',
        'Personal photography consultation'
      ],
      includes: {
        photos: 1000,
        videos: 3,
        editing: true,
        prints: 100
      }
    }
  ];

  const handleBooking = (packageId: string) => {
    setSelectedPackage(packageId);
    // Here you would typically integrate with a booking system
    const message = `Hi! I'm interested in booking the ${packages.find(p => p.id === packageId)?.name}. Can you provide more details?`;
    const whatsappUrl = `https://wa.me/+919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">
            Photography Packages
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose the perfect package for your special moments. All packages include professional editing and high-quality deliverables.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-gray-800 rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                pkg.popular 
                  ? 'border-amber-500 shadow-2xl shadow-amber-500/20' 
                  : 'border-gray-700 hover:border-amber-500/50'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="font-playfair text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>
                <div className="text-4xl font-bold text-amber-500 mb-2">{pkg.price}</div>
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{pkg.duration}</span>
                </div>
              </div>

              {/* Package Includes */}
              <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Includes:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {pkg.includes.photos && (
                    <div className="text-gray-300">📸 {pkg.includes.photos}+ Photos</div>
                  )}
                  {pkg.includes.videos && (
                    <div className="text-gray-300">🎥 {pkg.includes.videos} Video{pkg.includes.videos > 1 ? 's' : ''}</div>
                  )}
                  {pkg.includes.editing && (
                    <div className="text-gray-300">✨ Professional Editing</div>
                  )}
                  {pkg.includes.prints && (
                    <div className="text-gray-300">🖼️ {pkg.includes.prints} Prints</div>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBooking(pkg.id)}
                className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black'
                    : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 hover:border-amber-500'
                }`}
              >
                Book This Package
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <h3 className="font-playfair text-2xl font-bold text-white mb-6 text-center">
            Additional Services
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="text-white font-semibold mb-2">Drone Photography</h4>
              <p className="text-gray-400 text-sm">Aerial shots from ₹5,000</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="text-white font-semibold mb-2">Live Streaming</h4>
              <p className="text-gray-400 text-sm">From ₹8,000 per event</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="text-white font-semibold mb-2">Extra Photographer</h4>
              <p className="text-gray-400 text-sm">₹3,000 per photographer</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="text-white font-semibold mb-2">Destination Shoots</h4>
              <p className="text-gray-400 text-sm">Travel costs apply</p>
            </div>
          </div>
        </div>

        {/* Booking CTA */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Capture Your Moments?</h3>
          <p className="text-gray-400 mb-8">Book a free consultation to discuss your photography needs</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const whatsappUrl = `https://wa.me/+919876543210?text=${encodeURIComponent('Hi! I would like to schedule a free photography consultation.')}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
              Schedule Free Consultation
            </button>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black font-semibold px-8 py-4 rounded-full transition-all"
            >
              Get Custom Quote
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}