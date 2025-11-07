import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ShootCategories from './components/ShootCategories';
import About from './components/About';
import InquiryForm from './components/InquiryForm';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ImageUploader from './components/ImageUploader';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'shoots', 'about', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header activeSection={activeSection} />
      <Hero />
      <ShootCategories />
      <About />
      <InquiryForm />
      <Footer />
      <WhatsAppButton />
      {/* Temporarily add ImageUploader - remove after uploading images */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={() => document.getElementById('uploader')?.classList.toggle('hidden')}
          className="bg-amber-500 text-black px-4 py-2 rounded-full hover:bg-amber-600"
        >
          Toggle Uploader
        </button>
      </div>
      <div id="uploader" className="hidden fixed inset-0 bg-black/90 z-50 overflow-auto pt-20">
        <ImageUploader />
      </div>
    </div>
  );
}

export default App;
