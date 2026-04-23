import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { GEOJSON_URL } from '../constants';
import { pickLabel } from '../utils';

/**
 * Custom hook for loading and processing GeoJSON data
 * Encapsulates data fetching logic following separation of concerns
 */
export const useGeoJSON = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both GeoJSON and Info CSV
        const [geoResponse, csvResponse] = await Promise.all([
          fetch(GEOJSON_URL, { cache: 'no-store' }),
          fetch('/assets/info/acapulco_bahia_historica_cards_simple.csv', { cache: 'no-store' })
        ]);

        if (!geoResponse.ok) throw new Error(`Failed to load GeoJSON: ${geoResponse.status}`);
        if (!csvResponse.ok) throw new Error(`Failed to load CSV: ${csvResponse.status}`);

        const json = await geoResponse.json();
        const csvText = await csvResponse.text();

        // Parse CSV
        const parsedCsv = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        const infoMap = new Map();
        parsedCsv.data.forEach(row => {
          if (row.id) infoMap.set(Number(row.id), row.descripcion_completa);
        });

        if (!json || json.type !== 'FeatureCollection') {
          throw new Error('Invalid GeoJSON: not a FeatureCollection');
        }

        // Process and normalize features
        const features = (json.features || [])
          .filter(
            (f) =>
              f &&
              f.geometry &&
              (f.geometry.type === 'Point' || f.geometry.type === 'MultiPoint')
          )
          .map((f, idx) => {
            const props = f.properties || {};
            const label = pickLabel(props, idx);
            const siteId = Number(props.id);
            const folder = 'Bahía Histórica';
            const description = infoMap.get(siteId) || '';

            return {
              ...f,
              id: siteId, // Use the ID from properties as the feature ID
              properties: {
                ...props,
                __label: label,
                __folder: folder,
                __siteNumber: idx + 1,
                __description: description
              },
            };
          });

        console.log('GeoJSON loaded:', features.length, 'features');
        setData(features);
      } catch (err) {
        console.error('Error loading GeoJSON:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};
