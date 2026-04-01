// Script para verificar si los GeoJSON están en WGS84 (EPSG:4326)
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIRS = [
  path.join(__dirname, '../public/data/Polygons'),
  path.join(__dirname, '../public/data/Points'),
];

function isLonLat(coord) {
  // Espera [lon, lat] en rango razonable
  return (
    Array.isArray(coord) &&
    typeof coord[0] === 'number' &&
    typeof coord[1] === 'number' &&
    coord[0] > -180 && coord[0] < 180 &&
    coord[1] > -90 && coord[1] < 90
  );
}

async function checkFile(filePath) {
  const data = await fs.readJson(filePath);
  if (!data || !data.features) return { filePath, ok: false, reason: 'No features' };
  // Check CRS
  if (data.crs && data.crs.properties && data.crs.properties.name && !data.crs.properties.name.includes('4326')) {
    return { filePath, ok: false, reason: 'CRS not 4326' };
  }
  // Check first coordinate
  const geom = data.features[0]?.geometry;
  if (!geom) return { filePath, ok: false, reason: 'No geometry' };
  let coord = null;
  if (geom.type === 'Point') coord = geom.coordinates;
  else if (geom.type === 'Polygon') coord = geom.coordinates[0][0];
  else if (geom.type === 'MultiPolygon') coord = geom.coordinates[0][0][0];
  if (!isLonLat(coord)) return { filePath, ok: false, reason: 'Coords not lon/lat' };
  return { filePath, ok: true };
}

async function main() {
  let allOk = true;
  for (const dir of INPUT_DIRS) {
    const files = await glob(path.join(dir, '*.geojson'));
    for (const file of files) {
      const res = await checkFile(file);
      if (!res.ok) {
        console.log('❌', path.basename(file), '-', res.reason);
        allOk = false;
      } else {
        console.log('✅', path.basename(file));
      }
    }
  }
  if (allOk) {
    console.log('\nTodos los archivos están en WGS84 (EPSG:4326) y tienen coordenadas válidas.');
  } else {
    console.log('\nAlgunos archivos NO están en WGS84 o tienen coordenadas inválidas.');
  }
}

main().catch(console.error);
