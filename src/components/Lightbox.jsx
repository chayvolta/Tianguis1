import { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Lightbox Component
 * Displays images in full screen with navigation
 */
const Lightbox = ({ isOpen, images, currentIndex, onIndexChange, onClose }) => {
  // Handle navigation
  const handlePrev = (e) => {
    e?.stopPropagation();
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, currentIndex, images]); // Added dependencies for nav

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Vista detallada de imagen"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white z-[101] p-2 transition-colors"
        aria-label="Cerrar"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Navigation - Left */}
      {images.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-[101] p-4 transition-all hover:scale-110"
          aria-label="Anterior"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Main Content */}
      <div 
        className="relative max-w-full max-h-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage}
          alt={`Imagen ${currentIndex + 1}`}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded shadow-2xl"
        />
        
        {/* Counter */}
        {images.length > 1 && (
          <div className="mt-4 text-white/80 font-medium text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Navigation - Right */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-[101] p-4 transition-all hover:scale-110"
          aria-label="Siguiente"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  );
};

Lightbox.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  images: PropTypes.arrayOf(PropTypes.string),
  currentIndex: PropTypes.number,
  onIndexChange: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

export default Lightbox;
