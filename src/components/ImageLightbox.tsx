import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Share2 } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function ImageLightbox({ images, currentIndex, onClose, onNext, onPrev }: ImageLightboxProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = images[currentIndex];
  }, [currentIndex, images]);

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swiped left - next image
      onNext();
    }
    if (touchStart - touchEnd < -75) {
      // Swiped right - previous image
      onPrev();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, onNext, onPrev]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Beautiful Photography',
          text: 'Check out this amazing photo!',
          url: images[currentIndex],
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(images[currentIndex]);
      alert('Image URL copied to clipboard!');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `gangajal-photo-${currentIndex + 1}.jpg`;
    link.click();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header Controls */}
      <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 flex justify-between items-center z-10">
        <div className="text-white/80 text-xs md:text-sm font-medium px-2 py-1 bg-black/50 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-1.5 md:p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors active:scale-95"
          >
            {isZoomed ? <ZoomOut className="w-4 h-4 md:w-5 md:h-5" /> : <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 md:p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors active:scale-95"
          >
            <Share2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="hidden md:block p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors active:scale-95"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 md:p-2 bg-amber-500 hover:bg-amber-600 rounded-full text-black transition-colors active:scale-95"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Navigation Buttons - Hidden on mobile (swipe instead) */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={onNext}
            className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10 active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          className={`max-w-full max-h-full object-contain transition-all duration-300 touch-manipulation ${
            isZoomed ? 'scale-150 md:scale-150' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsZoomed(!isZoomed)}
          onLoad={() => setImageLoaded(true)}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        />
      </div>

      {/* Thumbnail Navigation - Horizontal scroll on mobile */}
      {images.length > 1 && (
        <div className="absolute bottom-2 md:bottom-4 left-0 right-0 px-2 md:px-4">
          <div className="flex gap-2 max-w-screen-lg mx-auto overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {images.slice(Math.max(0, currentIndex - 2), Math.min(images.length, currentIndex + 3)).map((img, idx) => {
              const actualIndex = Math.max(0, currentIndex - 2) + idx;
              return (
                <button
                  key={actualIndex}
                  onClick={() => {
                    const diff = actualIndex - currentIndex;
                    if (diff > 0) {
                      for (let i = 0; i < diff; i++) onNext();
                    } else if (diff < 0) {
                      for (let i = 0; i < -diff; i++) onPrev();
                    }
                  }}
                  className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded overflow-hidden border-2 transition-all snap-center active:scale-95 ${
                    actualIndex === currentIndex ? 'border-amber-500 scale-110' : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover pointer-events-none" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}