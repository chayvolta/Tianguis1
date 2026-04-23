import { useState, useEffect } from 'react';

const PVF_LAYERS = [
  {
    filename: 'Ruta',
    name: 'Ruta peatonal',
    type: 'Lines',
    description: 'Recorrido sugerido entre los sitios prioritarios',
    color: '#f59e0b',
    visible: true,
    sortKey: '0-Ruta',
  },
  {
    filename: 'Playas',
    name: 'Playas cercanas',
    type: 'Points',
    description: 'Referencias costeras cercanas al circuito',
    color: '#0284c7',
    visible: false,
    sortKey: '1-Playas',
  },
  {
    filename: 'estacionamientos',
    name: 'Estacionamientos',
    type: 'Points',
    description: 'Apoyo de movilidad para llegar al circuito',
    color: '#334155',
    visible: false,
    sortKey: '2-Estacionamientos',
  },
  {
    filename: 'Sanitarios',
    name: 'Sanitarios',
    type: 'Points',
    description: 'Servicios publicos de apoyo al visitante',
    color: '#16a34a',
    visible: false,
    sortKey: '3-Sanitarios',
  },
];

/**
 * Loads the supporting PVF GeoJSON layers.
 * Detail cards are intentionally reserved for /data/PVF/14Sitios_.geojson.
 */
export const useLayerData = () => {
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLayers = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadedLayers = [];

        for (const layer of PVF_LAYERS) {
          try {
            const path = `/data/PVF/${layer.filename}.geojson`;
            const response = await fetch(path);

            if (response.ok) {
              loadedLayers.push({
                ...layer,
                id: `pvf-${layer.filename.toLowerCase()}`,
                path,
              });
            }
          } catch (err) {
            console.warn(`Failed to load PVF layer: ${layer.filename}`, err);
          }
        }

        loadedLayers.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
        setLayers(loadedLayers);
      } catch (err) {
        console.error('Error loading PVF layers:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLayers();
  }, []);

  return { layers, loading, error };
};
