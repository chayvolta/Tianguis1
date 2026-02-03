import { memo, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getFirstCoord2D, getSiteDetails } from '../utils';
import { useAuth } from '../context/AuthContext';
import { useCheckins } from '../hooks/useCheckins';
import ImageCarousel from './ImageCarousel';
import Lightbox from './Lightbox';

/**
 * DetailCard component - displays detailed information about selected site
 * Following component composition and single responsibility principles
 */
const DetailCard = memo(({ feature, onClose, onOpenCheckin, onOpenLogin }) => {
  const { isAuthenticated } = useAuth();
  const { hasVisited } = useCheckins();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Memoize details calculation
  const details = useMemo(() => getSiteDetails(feature), [feature]);
  
  if (!feature) return null;

  const isVisited = hasVisited(feature.id);
  const siteName = feature.properties.__label;
  const coords = getFirstCoord2D(feature.geometry);

  const googleMapsUrl = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`
    : '#';

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleExpandImage = (index) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div 
        className="flex-1 p-4 overflow-y-auto bg-white flex flex-col"
        onKeyDown={handleKeyDown}
        role="region"
        aria-label="Detalles del sitio"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="self-end w-8 h-8 border-none bg-black/10 rounded-full text-2xl leading-none cursor-pointer hover:bg-black/20 transition flex items-center justify-center mb-2"
          aria-label="Cerrar detalles"
          title="Cerrar detalles"
        >
          ×
        </button>

        {/* Image Carousel */}
        <ImageCarousel 
          images={details.images}
          alt={siteName}
          onExpand={handleExpandImage}
        />

        {/* Kicker */}
        <div className="text-[11px] text-gray-600 uppercase tracking-wider">
          Ficha
        </div>

        {/* Title */}
        <h2 className="text-base font-black mt-1.5">
          {siteName}
        </h2>

        {/* Description - Rich Text from Mock Data */}
        <div 
          className="text-sm text-gray-600 mt-3 leading-relaxed space-y-2"
          dangerouslySetInnerHTML={{ __html: details.description }}
        />

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-4">
          {/* Google Maps - Prominent */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white text-sm font-medium no-underline transition-all hover:bg-primary-light shadow-md"
            aria-label={`Cómo llegar a ${siteName}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5-2.5 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Cómo llegar
          </a>

          {/* Check-in Button */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                onOpenCheckin?.(feature);
              } else {
                onOpenLogin?.();
              }
            }}
            disabled={isVisited}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all shadow-md ${
              isVisited
                ? 'bg-green-100 text-green-700 border-2 border-green-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
            }`}
            aria-label={isVisited ? 'Ya visitado' : 'Hacer check-in'}
          >
            {isVisited ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                ✓ Ya visitado
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Hacer Check-in
              </>
            )}
          </button>

          {/* Social Links - Compact Row */}
          <div className="flex items-center gap-2">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs no-underline transition-all hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs no-underline transition-all hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>

            {/* Website */}
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs no-underline transition-all hover:border-primary hover:text-primary hover:bg-[rgba(17,140,140,0.05)]"
              aria-label="Sitio Web"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              Web
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox for viewing images */}
      <Lightbox 
        isOpen={lightboxOpen}
        images={details.images}
        currentIndex={selectedImageIndex}
        onIndexChange={setSelectedImageIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
});

DetailCard.displayName = 'DetailCard';

DetailCard.propTypes = {
  feature: PropTypes.shape({
    id: PropTypes.number.isRequired,
    geometry: PropTypes.object.isRequired,
    properties: PropTypes.shape({
      __label: PropTypes.string.isRequired,
      __folder: PropTypes.string.isRequired,
    }).isRequired,
  }),
  onClose: PropTypes.func.isRequired,
  onOpenCheckin: PropTypes.func,
  onOpenLogin: PropTypes.func,
};

export default DetailCard;
