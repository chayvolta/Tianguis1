// App constants
export const GEOJSON_URL = '/data/sitios.geojson';

// Map configuration
export const MAP_CONFIG = {
  center: [-99.912, 16.853], // Acapulco
  zoom: 11.6,
  pitch: 58,
  bearing: 18,
  terrainExaggeration: 1.5,
};

// Basemap options
export const BASEMAPS = {
  SATELLITE: 'satellite',
  STREETS: 'streets',
};

// Animation duration
export const ANIMATION_DURATION = 450;

// Accessibility
export const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
