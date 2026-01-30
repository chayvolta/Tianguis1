import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAppContext } from '../context/AppContext';
import { MAP_CONFIG, PREFERS_REDUCED_MOTION } from '../constants';
import { getFirstCoord2D, getBounds, escapeHtml } from '../utils';

/**
 * Map component - MapLibre GL map with 3D terrain
 * Encapsulates all map-related logic following separation of concerns
 * Accepts ref as a prop to expose map instance to parent
 */
const Map = ({ onSiteSelect, ref }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const {
    allFeatures,
    filteredIds,
    selectedId,
    currentBasemap,
    layers,
  } = useAppContext();

  // Debug logs
  useEffect(() => {
    console.log('Map component - allFeatures:', allFeatures.length);
    console.log('Map component - filteredIds:', filteredIds.length);
  }, [allFeatures, filteredIds]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Map style with dual sources
    const style = {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        satellite: {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: 'Esri, Maxar, Earthstar Geographics',
        },
        streets: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [
        { id: 'satellite-layer', type: 'raster', source: 'satellite' },
        {
          id: 'streets-layer',
          type: 'raster',
          source: 'streets',
          layout: { visibility: 'none' },
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style,
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      pitch: MAP_CONFIG.pitch,
      bearing: MAP_CONFIG.bearing,
      antialias: true,
    });

    // Add navigation controls
    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );

    map.on('load', () => {
      // Create monument icon - Simplified larger triangle
      const svgString = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path fill='#e6281a' stroke='white' stroke-width='2' d='M12 2 L22 22 L2 22 Z'/></svg>`;
      const img = new Image(24, 24);

      img.onload = () => {
        console.log('Monument icon loaded');
        map.addImage('monument', img);

        // Add terrain
        map.addSource('terrain', {
          type: 'raster-dem',
          tiles: [
            'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
          ],
          encoding: 'terrarium',
          tileSize: 256,
          maxzoom: 15,
        });

        map.setTerrain({ source: 'terrain', exaggeration: MAP_CONFIG.terrainExaggeration });

        // Add GeoJSON source
        map.addSource('sites', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: allFeatures },
        });

        console.log('Added sites source with features:', allFeatures.length);

        // TEMPORARY: Use circles instead of symbols for debugging
        map.addLayer({
          id: 'sites-points',
          type: 'circle',
          source: 'sites',
          paint: {
            'circle-radius': 8,
            'circle-color': '#e6281a',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              1.0,
              0.85,
            ],
          },
        });

        console.log('Added sites-points layer');

        // Add labels layer
        map.addLayer({
          id: 'sites-labels',
          type: 'symbol',
          source: 'sites',
          minzoom: 13,
          layout: {
            'text-field': ['get', '__label'],
            'text-font': ['Open Sans Regular'],
            'text-size': 12,
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
            'text-optional': true,
          },
          paint: {
            'text-color': '#0F172A',
            'text-halo-color': 'rgba(255,255,255,0.9)',
            'text-halo-width': 1.2,
          },
        });

        // Add CIP Limite layer (hidden by default)
        map.addSource('cip-limite', {
          type: 'geojson',
          data: '/data/cip_limite.geojson',
        });

        map.addLayer({
          id: 'cip-limite-fill',
          type: 'fill',
          source: 'cip-limite',
          layout: {
            visibility: 'none',
          },
          paint: {
            'fill-color': '#ff0000',
            'fill-opacity': 0.1,
          },
        });

        map.addLayer({
          id: 'cip-limite-line',
          type: 'line',
          source: 'cip-limite',
          layout: {
            visibility: 'none',
          },
          paint: {
            'line-color': '#ff0000',
            'line-width': 8,
          },
        });

        // Add Senderos de Paz layer (hidden by default)
        map.addSource('senderos-paz', {
          type: 'geojson',
          data: '/data/senderos_paz.geojson',
        });

        map.addLayer({
          id: 'senderos-paz-line',
          type: 'line',
          source: 'senderos-paz',
          layout: {
            visibility: 'none',
          },
          paint: {
            'line-color': '#39ff14',
            'line-width': 3,
            'line-dasharray': [2, 1],
          },
        });

        console.log('Added CIP and Senderos layers');

        // Fit to all sites
        fitToAllSites(map, allFeatures, filteredIds);

        // Click handler
        map.on('click', 'sites-points', (e) => {
          const feature = e.features && e.features[0];
          if (!feature) return;
          
          // Select the site in the app
          onSiteSelect(feature.id);
          
          // Animate to the site location
          flyToSite(map, feature);
        });

        // Cursor handlers
        map.on('mouseenter', 'sites-points', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'sites-points', () => {
          map.getCanvas().style.cursor = '';
        });
      };

      img.src = 'data:image/svg+xml,' + encodeURIComponent(svgString);
    });

    mapRef.current = map;
    
    // Expose map to parent component via ref
    if (ref) {
      if (typeof ref === 'function') {
        ref(map);
      } else {
        ref.current = map;
      }
    }
    
    console.log('Map initialized successfully');

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update map source when features change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      console.log('Map not ready for source update');
      return;
    }
    if (allFeatures.length === 0) {
      console.log('No features to update');
      return;
    }

    const updateSource = () => {
      const source = map.getSource('sites');
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: allFeatures,
        });
        console.log('Map source updated with', allFeatures.length, 'features');
        
        // Also fit bounds to show all markers
        const coords = allFeatures
          .map((f) => getFirstCoord2D(f.geometry))
          .filter(Boolean);
        if (coords.length > 0) {
          const bounds = getBounds(coords);
          if (bounds) {
            map.fitBounds(bounds, {
              padding: 70,
              duration: PREFERS_REDUCED_MOTION ? 0 : 650,
              pitch: MAP_CONFIG.pitch,
            });
          }
        }
      } else {
        console.log('Sites source not found, retrying in 500ms...');
        setTimeout(updateSource, 500);
      }
    };

    if (map.isStyleLoaded()) {
      updateSource();
    } else {
      map.once('idle', updateSource);
    }
  }, [allFeatures]);

  // Update selected feature state
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getSource('sites')) return;

    // Clear all selections
    allFeatures.forEach((f) => {
      map.setFeatureState({ source: 'sites', id: f.id }, { selected: false });
    });

    // Set new selection
    if (selectedId !== null) {
      map.setFeatureState(
        { source: 'sites', id: selectedId },
        { selected: true }
      );
    }
  }, [selectedId, allFeatures]);

  // Toggle layer visibility when layers state changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    layers.forEach((layer) => {
      const visibility = layer.visible ? 'visible' : 'none';
      
      if (layer.id === 'cip-limite') {
        // Update visibility
        if (map.getLayer('cip-limite-fill')) {
          map.setLayoutProperty('cip-limite-fill', 'visibility', visibility);
          // Force paint properties updates
          map.setPaintProperty('cip-limite-fill', 'fill-color', '#ff0000');
          map.setPaintProperty('cip-limite-fill', 'fill-opacity', 0.1);
        }
        if (map.getLayer('cip-limite-line')) {
          map.setLayoutProperty('cip-limite-line', 'visibility', visibility);
          // Force paint properties updates
          map.setPaintProperty('cip-limite-line', 'line-color', '#ff0000');
          map.setPaintProperty('cip-limite-line', 'line-width', 8);
        }
      } else if (layer.id === 'senderos-paz') {
        if (map.getLayer('senderos-paz-line')) {
          map.setLayoutProperty('senderos-paz-line', 'visibility', visibility);
          // Force paint properties updates
          map.setPaintProperty('senderos-paz-line', 'line-color', '#39ff14');
          map.setPaintProperty('senderos-paz-line', 'line-width', 3);
        }
      }
    });
  }, [layers]);

  // Update filter
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const filterExpr = ['in', ['id'], ['literal', filteredIds]];
    if (map.getLayer('sites-points')) map.setFilter('sites-points', filterExpr);
    if (map.getLayer('sites-labels')) map.setFilter('sites-labels', filterExpr);
  }, [filteredIds]);

  // Handle basemap switch
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (currentBasemap === 'satellite') {
      map.setLayoutProperty('satellite-layer', 'visibility', 'visible');
      map.setLayoutProperty('streets-layer', 'visibility', 'none');
    } else {
      map.setLayoutProperty('satellite-layer', 'visibility', 'none');
      map.setLayoutProperty('streets-layer', 'visibility', 'visible');
    }
  }, [currentBasemap]);

  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0"
      role="region"
      aria-label="Mapa interactivo"
    />
  );
};

Map.propTypes = {
  onSiteSelect: PropTypes.func.isRequired,
  ref: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
};


// Helper function to fit map to all sites
function fitToAllSites(map, allFeatures, filteredIds) {
  if (!map || !map.isStyleLoaded()) return;

  const coords = allFeatures
    .filter((f) => filteredIds.includes(f.id))
    .map((f) => getFirstCoord2D(f.geometry))
    .filter(Boolean);

  if (coords.length === 0) return;

  const bounds = getBounds(coords);
  if (!bounds) return;

  map.fitBounds(bounds, {
    padding: 70,
    duration: PREFERS_REDUCED_MOTION ? 0 : 650,
    pitch: MAP_CONFIG.pitch,
  });
}

export default Map;

// Export fly to site function for use in main app
export const flyToSite = (map, feature) => {
  console.log('flyToSite called with:', { map: !!map, feature: !!feature });
  if (!map || !feature) return;

  const coords = getFirstCoord2D(feature.geometry);
  console.log('Flying to coords:', coords);
  if (!coords) return;

  const camera = {
    center: coords,
    zoom: Math.max(map.getZoom(), 16),
    pitch: Math.max(map.getPitch(), MAP_CONFIG.pitch),
    bearing: map.getBearing(),
  };

  if (PREFERS_REDUCED_MOTION) {
    map.jumpTo(camera);
  } else {
    map.flyTo({
      ...camera,
      speed: 1.15,
      curve: 1.35,
      essential: true,
    });
  }

  // Show popup
  new maplibregl.Popup({ closeButton: false, closeOnClick: true, offset: 12 })
    .setLngLat(coords)
    .setHTML(
      `<strong>${escapeHtml(feature.properties.__label)}</strong><div style="font-size:12px;opacity:.8">${escapeHtml(feature.properties.__folder)}</div>`
    )
    .addTo(map);
};

// Export reset view function
export const resetMapView = (map, allFeatures, filteredIds) => {
  fitToAllSites(map, allFeatures, filteredIds);
};

// Export toggle 3D function
export const toggle3D = (map) => {
  if (!map) return;

  const is3d = map.getPitch() > 5;

  if (is3d) {
    map.easeTo({
      pitch: 0,
      bearing: 0,
      duration: PREFERS_REDUCED_MOTION ? 0 : 450,
    });
    return false;
  } else {
    map.easeTo({
      pitch: MAP_CONFIG.pitch,
      bearing: MAP_CONFIG.bearing,
      duration: PREFERS_REDUCED_MOTION ? 0 : 450,
    });
    return true;
  }
};
