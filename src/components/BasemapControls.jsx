import { memo } from 'react';
import PropTypes from 'prop-types';
import { BASEMAPS } from '../constants';

/**
 * BasemapControls component - switch between satellite and streets
 * Memoized for performance
 */
const BasemapControls = memo(({ currentBasemap, onSwitch }) => {
  const isSatellite = currentBasemap === BASEMAPS.SATELLITE;

  return (
    <div className="absolute right-5 top-6 flex flex-col gap-2 z-10 max-md:right-3 max-md:top-4">
      <button
        onClick={() => onSwitch(BASEMAPS.SATELLITE)}
        className={`
          w-11 h-11 flex items-center justify-center rounded-2xl border cursor-pointer transition shadow-xl backdrop-blur-xl
          ${isSatellite
            ? 'border-sky-200 bg-sky-100 text-stone-950'
            : 'border-white/25 bg-stone-950/65 text-white hover:bg-white/20'
          }
        `}
        title="Vista satelital"
        aria-label="Cambiar a vista satelital"
        aria-pressed={isSatellite}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="13 2 13 9 20 9"/>
          <path d="M13 2v7.375l2.64 2.64"/>
          <circle cx="10" cy="14" r="9"/>
        </svg>
      </button>

      <button
        onClick={() => onSwitch(BASEMAPS.STREETS)}
        className={`
          w-11 h-11 flex items-center justify-center rounded-2xl border cursor-pointer transition shadow-xl backdrop-blur-xl
          ${!isSatellite
            ? 'border-sky-200 bg-sky-100 text-stone-950'
            : 'border-white/25 bg-stone-950/65 text-white hover:bg-white/20'
          }
        `}
        title="Vista de calles"
        aria-label="Cambiar a vista de calles"
        aria-pressed={!isSatellite}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
         <line x1="3" y1="9" x2="21" y2="9"/>
         <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
      </button>
    </div>
  );
});

BasemapControls.displayName = 'BasemapControls';

BasemapControls.propTypes = {
  currentBasemap: PropTypes.string.isRequired,
  onSwitch: PropTypes.func.isRequired,
};

export default BasemapControls;
