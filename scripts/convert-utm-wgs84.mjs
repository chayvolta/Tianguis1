import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import proj4 from 'proj4';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define UTM Zone 14N and WGS84
proj4.defs('EPSG:32614', '+proj=utm +zone=14 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

function convertCoordinates(coords, depth = 0) {
  if (depth === 0) {
    // coords is [lng, lat, elev] in UTM
    const [easting, northing, elevation] = coords;
    const [lng, lat] = proj4('EPSG:32614', 'EPSG:4326', [easting, northing]);
    return elevation ? [lng, lat, elevation] : [lng, lat];
  }
  return coords.map(c => convertCoordinates(c, depth - 1));
}

function convertGeometry(geometry) {
  if (!geometry) return geometry;
  const coordDepths = {
    Point: 0,
    LineString: 1,
    Polygon: 2,
    MultiPoint: 1,
    MultiLineString: 2,
    MultiPolygon: 3,
  };
  const depth = coordDepths[geometry.type];
  return {
    ...geometry,
    coordinates: convertCoordinates(geometry.coordinates, depth),
  };
}

async function convertFile(filePath) {
  const data = await fs.readJson(filePath);
  if (!data || !data.features) {
    console.log('✗ No features:', filePath);
    return;
  }

  // Convert all features
  const converted = {
    type: 'FeatureCollection',
    name: data.name || path.basename(filePath, '.geojson'),
    features: data.features.map(f => ({
      ...f,
      geometry: convertGeometry(f.geometry),
    })),
  };

  // Write back to file (overwrite)
  await fs.writeJson(filePath, converted, { spaces: 2 });
  console.log('✓ Converted:', path.basename(filePath));
}

async function processDir(dirPath) {
  const entries = await fs.readdir(dirPath);
  for (const entry of entries) {
    if (entry.endsWith('.geojson')) {
      const fullPath = path.join(dirPath, entry);
      try {
        await convertFile(fullPath);
      } catch (error) {
        console.error('✗ Error:', entry, '-', error.message);
      }
    }
  }
}

async function main() {
  const polygonsDir = path.join(__dirname, '../public/data/Polygons');
  const pointsDir = path.join(__dirname, '../public/data/Points');

  console.log('Converting Polygons...');
  await processDir(polygonsDir);
  
  console.log('\nConverting Points...');
  await processDir(pointsDir);
  
  console.log('\n✓ All conversions complete!');
}

main().catch(console.error);
