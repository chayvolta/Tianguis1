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
  const popupRef = useRef(null);
  const loadedSourcesRef = useRef(new Set());
  const {
    allFeatures,
    filteredIds,
    selectedId,
    currentBasemap,
    layers,
    dynamicLayers,
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
      'bottom-right'
    );

    map.on('load', () => {
      // Keep a custom icon available for future symbol layers.
      const svgString = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path fill='#e11d48' stroke='white' stroke-width='2' d='M12 2 L22 22 L2 22 Z'/></svg>`;
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

        map.addLayer({
          id: 'sites-points',
          type: 'circle',
          source: 'sites',
          paint: {
            'circle-radius': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              13,
              9,
            ],
            'circle-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#f97316',
              '#e11d48',
            ],
            'circle-stroke-color': '#fff7ed',
            'circle-stroke-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              4,
              2,
            ],
            'circle-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              1.0,
              0.92,
            ],
            'circle-blur': 0.05,
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
            'text-size': 13,
            'text-offset': [0, 1.35],
            'text-anchor': 'top',
            'text-optional': true,
          },
          paint: {
            'text-color': '#111827',
            'text-halo-color': 'rgba(255,247,237,0.95)',
            'text-halo-width': 1.5,
          },
        });

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

  // Sync Popup with selectedId
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // cleanup previous popup
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    if (selectedId === null) return;

    // Find feature
    const feature = allFeatures.find((f) => f.id === selectedId);
    if (!feature) return;

    const coords = getFirstCoord2D(feature.geometry);
    if (!coords) return;

    const label = feature.properties.__label;
    const folder = feature.properties.__folder;

    // Create custom popup content
    // Create custom popup content - Minimal Design
    const popupContent = `
      <div class="popup-card w-[220px] bg-white p-3.5 flex items-start gap-3 rounded-xl font-sans">
        <div class="shrink-0 mt-0.5 text-primary bg-primary/10 p-1.5 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-sm text-gray-900 leading-tight mb-0.5 break-words">${escapeHtml(label)}</h3>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">${escapeHtml(folder)}</p>
        </div>
      </div>
    `;

    // Create and add popup
    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      offset: 14,
      maxWidth: 'none', // Allow flex width
      className: 'custom-popup'
    })
      .setLngLat(coords)
      .setHTML(popupContent)
      .addTo(map);

    popupRef.current = popup;

  }, [selectedId, allFeatures]);

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
      
      if (layer.id === 'sites') {
        // Toggle sites layer visibility
        if (map.getLayer('sites-points')) {
          map.setLayoutProperty('sites-points', 'visibility', visibility);
        }
        if (map.getLayer('sites-labels')) {
          map.setLayoutProperty('sites-labels', 'visibility', visibility);
        }
      } else if (layer.id.startsWith('pvf-')) {
        // Handle dynamic layers
        const pointLayerId = `${layer.id}-points`;
        const lineLayerId = `${layer.id}-line`;
        const fillLayerId = `${layer.id}-fill`;

        if (map.getLayer(pointLayerId)) {
          map.setLayoutProperty(pointLayerId, 'visibility', visibility);
        }
        if (map.getLayer(lineLayerId)) {
          map.setLayoutProperty(lineLayerId, 'visibility', visibility);
        }
        if (map.getLayer(fillLayerId)) {
          map.setLayoutProperty(fillLayerId, 'visibility', visibility);
        }
      }
    });
  }, [layers]);

  // Supporting PVF layers are visual context only; they never open DetailCard.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    dynamicLayers.forEach((layer) => {
      const sourceId = layer.id;
      
      // 1. Add source if it doesn't exist
      if (!map.getSource(sourceId)) {
        try {
          map.addSource(sourceId, {
            type: 'geojson',
            data: layer.path,
          });
          console.log(`Added source: ${sourceId}`);
        } catch (err) {
          console.error(`Error adding source ${sourceId}:`, err);
        }
      }

      if (layer.type === 'Points') {
        const pointLayerId = `${sourceId}-points`;
        if (!map.getLayer(pointLayerId)) {
          try {
            map.addLayer({
              id: pointLayerId,
              type: 'circle',
              source: sourceId,
              layout: {
                visibility: layer.visible ? 'visible' : 'none',
              },
              paint: {
                'circle-radius': 6,
                'circle-color': layer.color,
                'circle-stroke-color': '#fff7ed',
                'circle-stroke-width': 1.5,
                'circle-opacity': 0.82,
              },
            });
            console.log(`Added point layer: ${pointLayerId}`);
          } catch (err) {
            console.error(`Error adding point layer ${pointLayerId}:`, err);
          }
          map.on('mouseenter', pointLayerId, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', pointLayerId, () => {
            map.getCanvas().style.cursor = '';
          });
        }
      } else if (layer.type === 'Lines') {
        const lineLayerId = `${sourceId}-line`;
        if (!map.getLayer(lineLayerId)) {
          try {
            map.addLayer({
              id: lineLayerId,
              type: 'line',
              source: sourceId,
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
                visibility: layer.visible ? 'visible' : 'none',
              },
              paint: {
                'line-color': layer.color,
                'line-width': 5,
                'line-opacity': 0.9,
                'line-dasharray': [0.5, 1.4],
              },
            });
            console.log(`Added line layer: ${lineLayerId}`);
          } catch (err) {
            console.error(`Error adding line layer ${lineLayerId}:`, err);
          }
        }
      } else {
        const fillLayerId = `${sourceId}-fill`;
        if (!map.getLayer(fillLayerId)) {
          try {
            map.addLayer({
              id: fillLayerId,
              type: 'fill',
              source: sourceId,
              layout: {
                visibility: layer.visible ? 'visible' : 'none',
              },
              paint: {
                'fill-color': layer.color,
                'fill-opacity': 0.24,
              },
            });
            console.log(`Added fill layer: ${fillLayerId}`);
          } catch (err) {
            console.error(`Error adding fill layer ${fillLayerId}:`, err);
          }
        }

        const lineLayerId = `${sourceId}-line`;
        if (!map.getLayer(lineLayerId)) {
          try {
            map.addLayer({
              id: lineLayerId,
              type: 'line',
              source: sourceId,
              layout: {
                visibility: layer.visible ? 'visible' : 'none',
              },
              paint: {
                'line-color': layer.color,
                'line-width': 2,
              },
            });
          } catch (err) {
            console.error(`Error adding polygon outline ${lineLayerId}:`, err);
          }
        }
      }

      loadedSourcesRef.current.add(sourceId);
    });
  }, [dynamicLayers]);

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
  // Popup is now managed by Map component state
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
