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
    <div className="absolute left-3 top-28 flex flex-col gap-2 z-10">
      <button
        onClick={() => onSwitch(BASEMAPS.SATELLITE)}
        className={`
          px-3 py-2.5 rounded-lg border bg-white cursor-pointer transition
          ${isSatellite
            ? 'bg-primary border-primary text-white font-bold hover:bg-primary-light hover:border-primary-light'
            : 'border-gray-300 text-gray-900 hover:border-primary/35'
          }
        `}
        title="Vista satelital"
        aria-label="Cambiar a vista satelital"
        aria-pressed={isSatellite}
      >
        Satélite
      </button>

      <button
        onClick={() => onSwitch(BASEMAPS.STREETS)}
        className={`
          px-3 py-2.5 rounded-lg border bg-white cursor-pointer transition
          ${!isSatellite
            ? 'bg-primary border-primary text-white font-bold hover:bg-primary-light hover:border-primary-light'
            : 'border-gray-300 text-gray-900 hover:border-primary/35'
          }
        `}
        title="Vista de calles"
        aria-label="Cambiar a vista de calles"
        aria-pressed={!isSatellite}
      >
        Calles
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
