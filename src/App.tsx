import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ShootCategories from './components/ShootCategories';
import PricingSection from './components/PricingSection';
import TestimonialsSection from './components/TestimonialsSection';
import About from './components/About';
import InquiryForm from './components/InquiryForm';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AdminPortal from './components/AdminPortal';


function App() {
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === '/admin') return;
      
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
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/admin/*" element={<AdminPortal />} />
      <Route
        path="/*"
        element={
          <div className="min-h-screen bg-black text-white">
            <Header activeSection={activeSection} />
            <Hero />
            <ShootCategories />
            <PricingSection />
            <TestimonialsSection />
            <About />
            <InquiryForm />
            <Footer />
            <WhatsAppButton />
          </div>
        }
      />
    </Routes>
  );
}

export default App;
