import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ShootCategories from './components/ShootCategories';
import About from './components/About';
import InquiryForm from './components/InquiryForm';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AdminPortal from './components/AdminPortal';


function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isUploadPage, setIsUploadPage] = useState(false);

  useEffect(() => {
    // Check if URL has /upload
    setIsUploadPage(window.location.pathname === '/upload');
    
    // Listen for navigation
    const handleLocation = () => {
      setIsUploadPage(window.location.pathname === '/upload');
    };
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isUploadPage) return;
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
  }, [isUploadPage]);

  if (isUploadPage) {
    return <AdminPortal />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header activeSection={activeSection} />
      <Hero />
      <ShootCategories />
      <About />
      <InquiryForm />
      <Footer />
      <WhatsAppButton />
      
      {/* Admin Portal Link */}
      <div className="fixed bottom-4 left-4 z-50">
        <a
          href="/upload"
          className="bg-amber-500 text-black px-4 py-2 rounded-full hover:bg-amber-600 transition-colors"
        >
          Admin Portal
        </a>
      </div>
    </div>
  );
}

export default App;
