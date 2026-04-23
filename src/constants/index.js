// App constants
export const GEOJSON_URL = '/data/PVF/14Sitios_.geojson';

// Map configuration
export const MAP_CONFIG = {
  center: [-99.909, 16.8478],
  zoom: 14.2,
  pitch: 55,
  bearing: 24,
  terrainExaggeration: 1.35,
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
