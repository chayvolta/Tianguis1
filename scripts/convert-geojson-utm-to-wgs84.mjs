// Script ES Modules para convertir todos los GeoJSON de UTM (EPSG:32614) a WGS84 (EPSG:4326)
// Requiere: npm install @turf/projection glob fs-extra

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { toWgs84 } from '@turf/projection';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIRS = [
  path.join(__dirname, '../public/data/Polygons'),
  path.join(__dirname, '../public/data/Points'),
];

async function convertFile(filePath) {
  const data = await fs.readJson(filePath);
  if (!data || !data.features) return;
  // Detect UTM by CRS
  const crs = data.crs && data.crs.properties && data.crs.properties.name;
  if (!crs || !crs.includes('32614')) return; // Only convert UTM 14N
  // Convert all features
  const converted = {
    ...data,
    crs: undefined, // Remove CRS
    features: data.features.map(f => ({
      ...f,
      geometry: toWgs84(f.geometry, { from: 'EPSG:32614' }),
    })),
  };
  // Write to new file (overwrite original)
  await fs.writeJson(filePath, converted, { spaces: 2 });
  console.log('Converted:', filePath);
}

async function main() {
  for (const dir of INPUT_DIRS) {
    const files = await glob(path.join(dir, '*.geojson'));
    for (const file of files) {
      await convertFile(file);
    }
  }
}

main().catch(console.error);
