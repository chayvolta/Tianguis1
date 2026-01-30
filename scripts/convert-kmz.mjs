// Script to convert KMZ files to GeoJSON
import JSZip from 'jszip';
import { kml } from '@tmcw/togeojson';
import { readFileSync, writeFileSync } from 'fs';
import { DOMParser } from '@xmldom/xmldom';

async function convertKmzToGeojson(kmzPath, outputPath) {
  console.log(`Converting ${kmzPath}...`);
  
  // Read KMZ file (it's a ZIP)
  const kmzData = readFileSync(kmzPath);
  const zip = await JSZip.loadAsync(kmzData);
  
  // Find the KML file inside
  const kmlFile = Object.keys(zip.files).find(name => name.endsWith('.kml'));
  if (!kmlFile) {
    throw new Error('No KML file found in KMZ');
  }
  
  // Extract KML content
  const kmlContent = await zip.files[kmlFile].async('string');
  
  // Parse KML to GeoJSON
  const parser = new DOMParser();
  const kmlDoc = parser.parseFromString(kmlContent, 'text/xml');
  const geojson = kml(kmlDoc);
  
  // Write GeoJSON
  writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
  console.log(`✅ Created ${outputPath}`);
  console.log(`   Features: ${geojson.features.length}`);
}

// Convert both files
const basePath = '../';
const publicData = './public/data/';

await convertKmzToGeojson(
  basePath + 'CIP ACAPULCO-COYUCA.kmz',
  publicData + 'cip_limite.geojson'
);

await convertKmzToGeojson(
  basePath + 'Senderos de paz_07_01_2026.kmz',
  publicData + 'senderos_paz.geojson'
);

console.log('\n✅ All conversions complete!');
