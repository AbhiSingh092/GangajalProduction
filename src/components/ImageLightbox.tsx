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

  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = images[currentIndex];
  }, [currentIndex, images]);

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
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="text-white/80 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-8">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          className={`max-w-full max-h-full object-contain transition-all duration-300 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsZoomed(!isZoomed)}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-screen-lg overflow-x-auto px-4">
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
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  actualIndex === currentIndex ? 'border-amber-500 scale-110' : 'border-white/30 hover:border-white/60'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}