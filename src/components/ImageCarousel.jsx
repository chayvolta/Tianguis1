import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Image Carousel Component
 * Displays a list of images with navigation and expand capability
 */
const ImageCarousel = ({ images, alt, onExpand }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const currentImage = images[currentIndex];

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-[200px] mb-4 bg-gray-100 rounded-xl overflow-hidden group shrink-0">
      {/* Main Image - Click to Expand */}
      <div 
        className="w-full h-full cursor-zoom-in"
        onClick={() => onExpand(currentIndex)}
        role="button"
        aria-label="Ver imagen en pantalla completa"
      >
        <img
          src={currentImage}
          alt={`${alt} - Imagen ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Navigation Buttons (only if multiple images) */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Imagen anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Siguiente imagen"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1 rounded-full bg-black/20 backdrop-blur-sm">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Ir a imagen ${idx + 1}`}
                aria-current={idx === currentIndex}
              />
            ))}
          </div>

          {/* Expand Icon Hint */}
          <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/30 text-white flex items-center justify-center backdrop-blur-sm transition opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10 pointer-events-none">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <polyline points="15 3 21 3 21 9"/>
               <polyline points="9 21 3 21 3 15"/>
               <line x1="21" y1="3" x2="14" y2="10"/>
               <line x1="3" y1="21" x2="10" y2="14"/>
             </svg>
          </div>
        </>
      )}
    </div>
  );
};

ImageCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  alt: PropTypes.string.isRequired,
  onExpand: PropTypes.func.isRequired,
};

export default ImageCarousel;
