import logo from '../logo.png';
import { useState, useEffect } from 'react';
interface HeaderProps {
  activeSection: string;
}

export default function Header({ activeSection }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'shoots', label: 'Shoots' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => scrollToSection('home')}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden bg-transparent">
            <img src={logo} alt="Gangajal Production" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-playfair">Gangajal Production</h1>
            <p className="text-xs text-amber-500">Photography & Videography</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`text-sm font-medium transition-all duration-300 hover:text-amber-500 relative ${
                activeSection === item.id ? 'text-amber-500' : 'text-white'
              }`}
            >
              {item.label}
              {activeSection === item.id && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-500"></span>
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={() => scrollToSection('contact')}
          className="hidden md:block bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105"
        >
          Get Started
        </button>
      </div>
    </header>
  );
}
