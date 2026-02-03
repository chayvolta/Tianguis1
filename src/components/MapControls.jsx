import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * MapControls component - 3D toggle and reset view buttons
 * Memoized for performance
 */
const MapControls = memo(({ is3d, onToggle3D, onResetView }) => {
  return (
    <div className="absolute left-3 top-3 flex flex-col gap-2 z-10">
      <button
        onClick={onToggle3D}
        className={`
          w-10 h-10 flex items-center justify-center rounded-lg border bg-white cursor-pointer transition shadow-md
          ${is3d 
            ? 'border-gray-400 bg-gray-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        title="Alternar vista 3D (pitch)"
        aria-label="Alternar vista 3D"
        aria-pressed={is3d}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
          <path d="M12 3l9 12-9 6-9-6 9-12z"/>
          <path d="M12 15l9-6"/>
          <path d="M12 15v6"/>
          <path d="M3 9l9 6"/>
        </svg>
      </button>

      <button
        onClick={onResetView}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white cursor-pointer hover:border-gray-400 transition shadow-md"
        title="Re-encuadrar a todos los sitios"
        aria-label="Centrar vista del mapa"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
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
