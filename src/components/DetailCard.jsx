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
        className="max-h-[calc(100vh-10rem)] overflow-hidden rounded-[32px] border border-white/30 bg-[#fffaf0] shadow-[0_24px_80px_rgba(15,23,42,0.35)] max-xl:max-h-[calc(100vh-11rem)] max-md:max-h-[72vh] max-md:rounded-b-none max-md:rounded-t-[30px]"
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
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-stone-950/70 text-xl leading-none text-white shadow-lg backdrop-blur transition hover:bg-rose-600"
            aria-label="Cerrar detalles"
            title="Cerrar detalles"
          >
            x
          </button>
        </div>

        <div className="max-h-[calc(100vh-24rem)] overflow-y-auto px-5 pb-5 max-xl:max-h-[calc(100vh-24rem)] max-md:max-h-[calc(72vh-13rem)] max-md:px-4">
          <div className="-mt-2 mb-3 flex items-center justify-between gap-3">
            <span className="rounded-full bg-stone-950 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-amber-100">
              Sitio {siteNumber}
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
              14Sitios_
            </span>
          </div>

          <h2 className="text-2xl font-black leading-tight tracking-tight text-stone-950 max-md:text-xl">
            {siteName}
          </h2>

          <div
            className="mt-3 space-y-2 text-sm leading-relaxed text-stone-700 max-md:line-clamp-4"
            dangerouslySetInnerHTML={{ __html: details.description }}
          />

          {coords && (
            <div className="mt-4 rounded-2xl border border-stone-200 bg-white/65 p-3 text-xs font-semibold text-stone-600">
              Coordenadas: {coords[1].toFixed(5)}, {coords[0].toFixed(5)}
            </div>
          )}

          <div className="sticky bottom-0 -mx-5 mt-4 grid grid-cols-2 gap-3 bg-gradient-to-t from-[#fffaf0] via-[#fffaf0] to-transparent px-5 pb-1 pt-5 max-md:-mx-4 max-md:px-4">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white no-underline shadow-lg transition hover:-translate-y-0.5 hover:bg-stone-800"
              aria-label={`Como llegar a ${siteName}`}
            >
              Como llegar
            </a>

            <button
              onClick={() => (isAuthenticated ? onOpenCheckin?.(feature) : onOpenLogin?.())}
              disabled={isVisited}
              className={`rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition ${
                isVisited
                  ? 'cursor-not-allowed border border-emerald-300 bg-emerald-100 text-emerald-800'
                  : 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 text-white hover:-translate-y-0.5'
              }`}
              aria-label={isVisited ? 'Ya visitado' : 'Hacer check-in'}
            >
              {isVisited ? 'Ya visitado' : 'Hacer check-in'}
            </button>
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
