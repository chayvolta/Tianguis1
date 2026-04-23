import { memo, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getFirstCoord2D, getSiteDetails } from '../utils';
import { useAuth } from '../context/AuthContext';
import { useCheckins } from '../hooks/useCheckins';
import ImageCarousel from './ImageCarousel';
import Lightbox from './Lightbox';

const DetailCard = memo(({ feature, onClose, onOpenCheckin, onOpenLogin }) => {
  const { isAuthenticated } = useAuth();
  const { hasVisited } = useCheckins();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const details = useMemo(() => getSiteDetails(feature), [feature]);

  if (!feature) return null;

  const isVisited = hasVisited(feature.id);
  const siteName = feature.properties.__label;
  const siteNumber = feature.properties.__siteNumber || feature.id;
  const coords = getFirstCoord2D(feature.geometry);

  const googleMapsUrl = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`
    : '#';

  return (
    <>
      <article
        className="max-h-[calc(100vh-10rem)] overflow-hidden rounded-[32px] border border-white/30 bg-[#fffaf0] shadow-[0_24px_80px_rgba(15,23,42,0.35)] max-xl:max-h-[calc(100vh-11rem)] max-md:max-h-[56dvh] max-md:rounded-[24px]"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="region"
        aria-label="Detalles del sitio prioritario"
      >
        <div className="relative">
          <ImageCarousel
            images={details.images}
            alt={siteName}
            onExpand={(index) => {
              setSelectedImageIndex(index);
              setLightboxOpen(true);
            }}
          />
          <div className="absolute left-1/2 top-2 hidden h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/70 max-md:block" />
          <button
            onClick={onClose}
            className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-stone-950/70 text-white shadow-lg backdrop-blur transition hover:bg-primary max-md:h-8 max-md:w-8"
            aria-label="Cerrar detalles"
            title="Cerrar detalles"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" className="max-md:w-4 max-md:h-4">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="max-h-[calc(100vh-24rem)] overflow-y-auto px-5 pb-5 max-xl:max-h-[calc(100vh-24rem)] max-md:max-h-[calc(56dvh-11rem)] max-md:px-3 max-md:pb-3">
          <div className="-mt-2 mb-3 flex items-center justify-between gap-3 max-md:mb-2">
            <span className="rounded-full bg-stone-950 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-secondary max-md:px-2.5 max-md:py-1 max-md:text-[10px] max-md:tracking-[0.16em]">
              Sitio {siteNumber}
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500 max-md:text-[10px] max-md:tracking-[0.14em]">
              Bahía Histórica de Acapulco
            </span>
          </div>

          <h2 className="text-2xl font-black leading-tight tracking-tight text-stone-950 max-md:text-lg">
            {siteName}
          </h2>

          <div
            className="mt-3 space-y-1 text-sm leading-relaxed text-stone-700 text-justify max-md:mt-2 max-md:text-[13px] max-md:leading-snug"
            dangerouslySetInnerHTML={{ __html: details.description }}
          />

          {coords && (
            <div className="mt-4 rounded-2xl border border-stone-200 bg-white/65 p-3 text-xs font-semibold text-stone-600 max-md:mt-3 max-md:rounded-xl max-md:p-2 max-md:text-[11px]">
              Coordenadas: {coords[1].toFixed(5)}, {coords[0].toFixed(5)}
            </div>
          )}

          <div className="sticky bottom-0 -mx-5 mt-4 grid grid-cols-1 gap-3 bg-gradient-to-t from-[#fffaf0] via-[#fffaf0] to-transparent px-5 pb-1 pt-5 max-md:-mx-3 max-md:mt-3 max-md:gap-2 max-md:px-3 max-md:pt-4">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white no-underline shadow-lg transition hover:-translate-y-0.5 hover:bg-stone-800 max-md:rounded-xl max-md:px-3 max-md:py-2.5 max-md:text-xs"
              aria-label={`Como llegar a ${siteName}`}
            >
              Como llegar
            </a>
          </div>
        </div>
      </article>

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
      __siteNumber: PropTypes.number,
    }).isRequired,
  }),
  onClose: PropTypes.func.isRequired,
  onOpenCheckin: PropTypes.func,
  onOpenLogin: PropTypes.func,
};

export default DetailCard;
