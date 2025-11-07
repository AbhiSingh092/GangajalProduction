import { Camera, Mail, Phone, MapPin, Instagram, Facebook, Youtube, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-amber-500/20 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-black" />
              </div>
              <h3 className="font-playfair text-xl font-bold text-white">Gangajal Production</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Creating timeless memories through the lens. Professional photography and videography services for all your special moments.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400 hover:text-amber-500 transition-colors">
                <Mail className="w-4 h-4" />
                <span className="text-sm">gangajalproduction@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 hover:text-amber-500 transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+91 8506096176</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 hover:text-amber-500 transition-colors">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Delhi,India</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/gangajal_production?igsh=MWY4enc3bnE0N3QzYQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <Instagram className="w-5 h-5 text-black" />
              </a>
              <a
                href="https://www.facebook.com/share/1GsiF1hjmF/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <Facebook className="w-5 h-5 text-black" />
              </a>
              {/* <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <Youtube className="w-5 h-5 text-black" />
              </a> */}
              {/* <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <Twitter className="w-5 h-5 text-black" />
              </a> */}
            </div>
          </div>
        </div>

        <div className="border-t border-amber-500/20 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Gangajal Production. All rights reserved. Crafted with passion.
          </p>
        </div>
      </div>
    </footer>
  );
}
