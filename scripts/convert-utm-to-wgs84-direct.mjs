import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
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
  try {
    const data = await fs.readJson(filePath);
    if (!data || !data.features) return;

    // Check if it's in UTM (by CRS)
    const crs = data.crs && data.crs.properties && data.crs.properties.name;
    const isUTM = crs && crs.includes('32614');
    
    // Check if coordinates look like UTM (large values like 40xxxx.x)
    const firstFeature = data.features[0];
    let coordsLookLikeUTM = false;
    if (firstFeature && firstFeature.geometry && firstFeature.geometry.coordinates) {
      const coords = firstFeature.geometry.coordinates;
      const flatCoords = JSON.stringify(coords).match(/\d{6,}/g); // 6+ digit numbers typical of UTM
      if (flatCoords) {
        const firstCoord = parseFloat(flatCoords[0]);
        coordsLookLikeUTM = firstCoord > 100000; // UTM coords are typically > 100000
      }
    }

    if (!isUTM && !coordsLookLikeUTM) {
      console.log('⊘ Skipped (already WGS84 or unknown):', path.basename(filePath));
      return;
    }
    
    console.log('→ Processing:', path.basename(filePath));

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
  } catch (error) {
    console.error('✗ Error converting', filePath, ':', error.message);
  }
}

async function main() {
  const dirs = [
    path.join(__dirname, '../public/data/Polygons'),
    path.join(__dirname, '../public/data/Points'),
  ];

  for (const dir of dirs) {
    const files = await glob(path.join(dir, '*.geojson'));
    for (const file of files) {
      await convertFile(file);
    }
  }
  console.log('\n✓ Conversion complete!');
}

main().catch(console.error);
