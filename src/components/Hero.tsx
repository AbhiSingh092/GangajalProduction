import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  const slides = [
    {
      image: 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Cinematic Storytelling',
      subtitle: 'Capturing moments that last forever'
    },
    {
      image: 'https://images.pexels.com/photos/1115680/pexels-photo-1115680.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Fashion & Portrait',
      subtitle: 'Where elegance meets artistry'
    },
    {
      image: 'https://images.pexels.com/photos/2747446/pexels-photo-2747446.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Event Photography',
      subtitle: 'Your special moments, our passion'
    }
  ];

  useEffect(() => {
    setFadeIn(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const scrollToShoot = () => {
    document.getElementById('shoots')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transform scale-110 transition-transform duration-[5000ms]"
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: currentSlide === index ? 'scale(100%)' : 'scale(110%)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>
      ))}

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <div className={`transition-all duration-1000 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-6 text-white">
            {slides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl text-amber-500 mb-4 font-light">
            {slides[currentSlide].subtitle}
          </p>
          <p className="text-2xl md:text-3xl text-white/90 mb-12 font-playfair italic">
            Where Every Frame Speaks Emotion.
          </p>
          <button
            onClick={scrollToShoot}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105"
          >
            Explore Our Work
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToShoot}>
          <ChevronDown className="w-8 h-8 text-amber-500" />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === index ? 'bg-amber-500 w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
