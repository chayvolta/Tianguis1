import { useState, useEffect } from 'react';

/**
 * Custom hook for loading GeoJSON layers from Points and Polygons folders
 * Generates descriptions based on layer names and organizes them alphabetically
 */
export const useLayerData = () => {
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Description mapping for layer names
  const getDescription = (filename) => {
    const descriptionMap = {
      'BH_recorridos': 'Recorridos históricos de la Bahía',
      'estacionamientos': 'Estacionamientos disponibles',
      'Paradas de consumo y servicios': 'Paradas de consumo y servicios',
      'Sanitarios': 'Sanitarios públicos',
      'Atractivos_turi': 'Atractivos turísticos',
      'Edificios_Historicos': 'Edificios históricos',
      'Equipamiento Cultural': 'Equipamiento cultural',
      'Espacios_publicos': 'Espacios públicos',
      'Playas': 'Playas y playas accesibles',
      'Poligonal_Bahia_Historica': 'Polígono de la Bahía Histórica',
    };
    return descriptionMap[filename] || filename.replace(/_/g, ' ');
  };

  // Get color for layer type with tourist-friendly vibrant colors
  const getLayerColor = (type) => {
    const colorMap = {
      Points: '#E74C3C',      // Vibrant red for points
      Polygons: '#3498DB',    // Vibrant blue for polygons
    };
    return colorMap[type] || '#999999';
  };

  useEffect(() => {
    const loadLayers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Point layers
        const pointLayers = [
          'BH_recorridos',
          'estacionamientos',
          'Paradas de consumo y servicios',
          'Sanitarios',
        ];

        // Polygon layers
        const polygonLayers = [
          'Atractivos_turi',
          'Edificios_Historicos',
          'Equipamiento Cultural',
          'Espacios_publicos',
          'Playas',
          'Poligonal_Bahia_Historica',
        ];

        const loadedLayers = [];

        // Load and verify point layers
        for (const layerName of pointLayers) {
          try {
            const response = await fetch(`/data/Points/${layerName}.geojson`);
            if (response.ok) {
              loadedLayers.push({
                id: `points-${layerName}`,
                name: layerName,
                type: 'Points',
                description: getDescription(layerName),
                visible: false,
                color: getLayerColor('Points'),
                path: `/data/Points/${layerName}.geojson`,
                sortKey: `0-${layerName}`, // 0 for Points, alphabetical after
              });
            }
          } catch (err) {
            console.warn(`Failed to load point layer: ${layerName}`, err);
          }
        }

        // Load and verify polygon layers
        for (const layerName of polygonLayers) {
          try {
            const response = await fetch(`/data/Polygons/${layerName}.geojson`);
            if (response.ok) {
              loadedLayers.push({
                id: `polygons-${layerName}`,
                name: layerName,
                type: 'Polygons',
                description: getDescription(layerName),
                visible: false,
                color: getLayerColor('Polygons'),
                path: `/data/Polygons/${layerName}.geojson`,
                sortKey: `1-${layerName}`, // 1 for Polygons, alphabetical after
              });
            }
          } catch (err) {
            console.warn(`Failed to load polygon layer: ${layerName}`, err);
          }
        }

        // Sort by type first, then alphabetically
        loadedLayers.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

        setLayers(loadedLayers);
      } catch (err) {
        console.error('Error loading layers:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLayers();
  }, []);

  return { layers, loading, error };
};
