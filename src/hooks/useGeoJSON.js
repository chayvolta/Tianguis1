import { useState, useEffect } from 'react';
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

        const response = await fetch(GEOJSON_URL, { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(
            `Failed to load GeoJSON: ${response.status} ${response.statusText}`
          );
        }

        const json = await response.json();

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
            const folder = String(props.folders || 'Sin carpeta').trim() || 'Sin carpeta';

            return {
              ...f,
              id: idx,
              properties: {
                ...props,
                __label: label,
                __folder: folder,
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
