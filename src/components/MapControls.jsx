import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * MapControls component - 3D toggle and overview buttons
 * Memoized for performance
 */
const MapControls = memo(({ is3d, onToggle3D, onResetView }) => {
  return (
    <div className="absolute right-5 bottom-28 flex flex-col gap-2 z-10 max-md:right-3 max-md:bottom-[calc(env(safe-area-inset-bottom)+5.25rem)]">
      <button
        onClick={onToggle3D}
        className={`
          w-11 h-11 flex items-center justify-center rounded-2xl border cursor-pointer transition shadow-xl backdrop-blur-xl
          ${is3d 
            ? 'border-amber-200 bg-amber-300 text-stone-950' 
            : 'border-white/25 bg-stone-950/65 text-white hover:bg-white/20'
          }
        `}
        title="Alternar vista 3D (pitch)"
        aria-label="Alternar vista 3D"
        aria-pressed={is3d}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l9 12-9 6-9-6 9-12z"/>
          <path d="M12 15l9-6"/>
          <path d="M12 15v6"/>
          <path d="M3 9l9 6"/>
        </svg>
      </button>

      <button
        onClick={onResetView}
        className="w-11 h-11 flex items-center justify-center rounded-2xl border border-white/25 bg-stone-950/65 text-white cursor-pointer hover:bg-white/20 transition shadow-xl backdrop-blur-xl"
        title="Volver a vista general"
        aria-label="Volver a vista general"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l8-8 8 8"/>
          <path d="M5 10v10h12V10"/>
          <path d="M9 20v-6h4v6"/>
        </svg>
      </button>
    </div>
  );
});

MapControls.displayName = 'MapControls';

MapControls.propTypes = {
  is3d: PropTypes.bool.isRequired,
  onToggle3D: PropTypes.func.isRequired,
  onResetView: PropTypes.func.isRequired,
};

export default MapControls;
