/**
 * Utility functions for the geoportal application
 */

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export const escapeHtml = (str) => {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

/**
 * Groups array items by a key function
 * @param {Array} arr - Array to group
 * @param {Function} keyFn - Function that returns the grouping key
 * @returns {Object} Grouped object
 */
export const groupBy = (arr, keyFn) => {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
};

/**
 * Picks the first available label from feature properties
 * @param {Object} props - Feature properties
 * @param {number} idx - Fallback index
 * @returns {string} Label
 */
export const pickLabel = (props, idx) => {
  const candidates = [
    props.Nombre,
    props.name,
    props.NOMBRE,
    props.Name,
    props.title,
  ]
    .filter(Boolean)
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);

  return candidates[0] || `Sitio ${idx + 1}`;
};

/**
 * Gets the first 2D coordinate from a Point or MultiPoint geometry
 * @param {Object} geom - GeoJSON geometry
 * @returns {Array|null} [lon, lat] or null
 */
export const getFirstCoord2D = (geom) => {
  if (!geom) return null;

  const clean = (c) => (Array.isArray(c) ? [Number(c[0]), Number(c[1])] : null);

  if (geom.type === 'Point') return clean(geom.coordinates);
  if (geom.type === 'MultiPoint') return clean(geom.coordinates?.[0]);

  return null;
};

/**
 * Calculates bounding box from an array of coordinates
 * @param {Array} coords - Array of [lon, lat] coordinates
 * @returns {Array|null} [[minX, minY], [maxX, maxY]] or null
 */
export const getBounds = (coords) => {
  if (!coords || coords.length === 0) return null;

  let minX = coords[0][0],
    minY = coords[0][1],
    maxX = coords[0][0],
    maxY = coords[0][1];

  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  return [
    [minX, minY],
    [maxX, maxY],
  ];
};

/**
 * Generates a placeholder image URL based on a seed string
 * @param {string} seed - Seed string
 * @param {string} [size='400/300'] - Image size
 * @param {number} [salt=0] - Salt to vary the image for the same seed
 * @returns {string} Image URL
 */
export const getPlaceholderImage = (seed, size = '400/300', salt = 0) => {
  const seedValue = seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${seedValue + salt}/${size}`;
};

/**
 * Returns detailed mock data for a site
 * @param {Object} feature - The site feature
 * @returns {Object} Site details (images, description, etc.)
 */
export const getSiteDetails = (feature) => {
  const siteName = feature?.properties?.__label || 'Sitio';
  const folder = feature?.properties?.__folder || 'Acapulco';

  // Generate 3 variations of images
  const images = [
    getPlaceholderImage(siteName, '800/600', 0),
    getPlaceholderImage(siteName, '800/600', 100),
    getPlaceholderImage(siteName, '800/600', 200),
  ];

  // Mock description in Spanish
  const description = `
    <p><strong>${siteName}</strong> es un punto de interés destacado en la zona de ${folder}.</p>
    <p>Este lugar ofrece una vista privilegiada y es parte del patrimonio cultural y turístico de Acapulco. Ideal para visitar en familia y conocer más sobre la historia local.</p>
    <p>Cuenta con acceso facilitado y cercanía a otros puntos turísticos importantes. Se recomienda llevar ropa cómoda y cámara fotográfica para capturar los hermosos paisajes que ofrece este sitio.</p>
  `;

  return {
    images,
    description,
    imagesCount: images.length,
  };
};
