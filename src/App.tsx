import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ShootCategories from './components/ShootCategories';
import About from './components/About';
import InquiryForm from './components/InquiryForm';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

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
    </div>
  );
}

export default App;
