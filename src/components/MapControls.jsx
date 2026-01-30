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
          px-3 py-2.5 rounded-lg border bg-white cursor-pointer transition
          ${is3d 
            ? 'bg-primary border-primary text-white font-bold hover:bg-primary-light hover:border-primary-light' 
            : 'border-gray-300 text-gray-900 hover:border-primary/35'
          }
        `}
        title="Alternar vista 3D (pitch)"
        aria-label="Alternar vista 3D"
        aria-pressed={is3d}
      >
        3D
      </button>

      <button
        onClick={onResetView}
        className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 cursor-pointer hover:border-primary/35 transition"
        title="Re-encuadrar a todos los sitios"
        aria-label="Centrar vista del mapa"
      >
        Centrar vista
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
