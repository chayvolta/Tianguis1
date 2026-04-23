import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAppContext } from '../context/AppContext';
import { MAP_CONFIG, PREFERS_REDUCED_MOTION } from '../constants';
import { getFirstCoord2D, getBounds, escapeHtml, getAllCoords } from '../utils';

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
  const layerBoundsRef = useRef({});
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

    map.on('load', () => {
      // Cargar SVGs personalizados como imágenes
      const iconDefs = [
        { name: 'estacionamiento', url: '/assets/estacionamiento.svg' },
        { name: 'playas', url: '/assets/Playas.svg' },
        { name: 'wc', url: '/assets/wc.svg' },
      ];

      let loadedIcons = 0;
      iconDefs.forEach(({ name, url }) => {
        const img = new window.Image(48, 48);
        img.onload = () => {
          map.addImage(name, img, { pixelRatio: 2 });
          loadedIcons++;
          if (loadedIcons === iconDefs.length) {
            // Cuando todos los íconos estén listos, continuar con el resto
            setupMap();
          }
        };
        img.onerror = () => {
          console.error('No se pudo cargar el ícono', name, url);
          loadedIcons++;
          if (loadedIcons === iconDefs.length) setupMap();
        };
        img.src = url;
      });

      function setupMap() {
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

        map.addLayer({
          id: 'sites-numbers',
          type: 'symbol',
          source: 'sites',
          layout: {
            'text-field': ['to-string', ['get', '__siteNumber']],
            'text-font': ['Open Sans Bold'],
            'text-size': 11,
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': 'rgba(0,0,0,0.18)',
            'text-halo-width': 0.8,
          },
        });

        // Add labels layer
        map.addLayer({
          id: 'sites-labels',
          type: 'symbol',
          source: 'sites',
          minzoom: 15.2,
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
      }
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
              padding: getFitPadding(),
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
        if (map.getLayer('sites-numbers')) {
          map.setLayoutProperty('sites-numbers', 'visibility', visibility);
        }
        if (map.getLayer('sites-labels')) {
          map.setLayoutProperty('sites-labels', 'visibility', visibility);
        }
      } else if (layer.id.startsWith('pvf-')) {
        // Handle dynamic layers
        const pointLayerId = `${layer.id}-points`;
        const labelLayerId = `${layer.id}-labels`;
        const glowLayerId = `${layer.id}-glow`;
        const lineLayerId = `${layer.id}-line`;
        const fillLayerId = `${layer.id}-fill`;

        if (map.getLayer(pointLayerId)) {
          map.setLayoutProperty(pointLayerId, 'visibility', visibility);
        }
        if (map.getLayer(labelLayerId)) {
          map.setLayoutProperty(labelLayerId, 'visibility', visibility);
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

          // Pre-calculate bounds for this layer when data arrives
          map.on('sourcedata', (e) => {
            if (e.sourceId === sourceId && e.isSourceLoaded) {
              const source = map.getSource(sourceId);
              const data = source.serialize().data;
              if (data && typeof data !== 'string') {
                const coords = [];
                (data.features || []).forEach((f) => coords.push(...getAllCoords(f.geometry)));
                if (coords.length > 0) {
                  layerBoundsRef.current[sourceId] = getBounds(coords);
                }
              }
            }
          });

          console.log(`Added source: ${sourceId}`);
        } catch (err) {
          console.error(`Error adding source ${sourceId}:`, err);
        }
      }

      if (layer.type === 'Points') {
        const pointLayerId = `${sourceId}-points`;
        const labelLayerId = `${sourceId}-labels`;
        
        // Determine if we should use an icon
        const iconName = layer.icon ? layer.icon.split('/').pop().replace('.svg', '').toLowerCase() : null;

        if (!map.getLayer(pointLayerId)) {
          try {
            const beforeSites = map.getLayer('sites-points') ? 'sites-points' : undefined;
            
            if (iconName) {
              // Use symbol layer for icons
              map.addLayer({
                id: pointLayerId,
                type: 'symbol',
                source: sourceId,
                layout: {
                  visibility: layer.visible ? 'visible' : 'none',
                  'icon-image': iconName,
                  'icon-size': 1.1,
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true,
                },
                paint: {
                  'icon-opacity': 0.95,
                }
              }, beforeSites);
            } else {
              // Use circle layer as fallback
              map.addLayer({
                id: pointLayerId,
                type: 'circle',
                source: sourceId,
                layout: {
                  visibility: layer.visible ? 'visible' : 'none',
                },
                paint: {
                  'circle-radius': 8,
                  'circle-color': layer.color,
                  'circle-stroke-color': '#fff',
                  'circle-stroke-width': 2,
                  'circle-opacity': 0.9,
                  'circle-blur': 0.1,
                },
              }, beforeSites);
            }

            // Click handler for service points
            map.on('click', pointLayerId, (e) => {
              const feature = e.features && e.features[0];
              if (!feature) return;
              const coords = getFirstCoord2D(feature.geometry);
              if (coords) {
                map.flyTo({ center: coords, zoom: 16, duration: 1000 });
                showServicePopup(map, feature, coords);
              }
            });

            map.on('mouseenter', pointLayerId, () => {
              map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', pointLayerId, () => {
              map.getCanvas().style.cursor = '';
            });

            console.log(`Added point layer: ${pointLayerId} (icon: ${iconName || 'none'})`);
          } catch (err) {
            console.error(`Error adding point layer ${pointLayerId}:`, err);
          }

          if (sourceId === 'pvf-playas' && !map.getLayer(labelLayerId)) {
            try {
              const beforeSites = map.getLayer('sites-points') ? 'sites-points' : undefined;
              map.addLayer({
                id: labelLayerId,
                type: 'symbol',
                source: sourceId,
                minzoom: 12.5,
                layout: {
                  visibility: layer.visible ? 'visible' : 'none',
                  'text-field': [
                    'coalesce',
                    ['get', 'NOMBRE'],
                    ['get', 'Nombre'],
                    ['get', 'name'],
                    'Playa',
                  ],
                  'text-font': ['Open Sans Bold'],
                  'text-size': 12,
                  'text-offset': [0, 1.15],
                  'text-anchor': 'top',
                  'text-optional': true,
                },
                paint: {
                  'text-color': '#e0f2fe',
                  'text-halo-color': 'rgba(8, 47, 73, 0.88)',
                  'text-halo-width': 1.5,
                },
              }, beforeSites);
              console.log(`Added beach label layer: ${labelLayerId}`);
            } catch (err) {
              console.error(`Error adding beach label layer ${labelLayerId}:`, err);
            }
          }
        }
      } else if (layer.type === 'Lines') {
        const lineLayerId = `${sourceId}-line`;
        if (!map.getLayer(lineLayerId)) {
          try {
            const beforeSites = map.getLayer('sites-points') ? 'sites-points' : undefined;
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
            }, beforeSites);

            // Click handler for lines
            map.on('click', lineLayerId, (e) => {
              const feature = e.features && e.features[0];
              const coords = [e.lngLat.lng, e.lngLat.lat];
              map.flyTo({ center: coords, zoom: 16, duration: 1000 });
              showServicePopup(map, feature, coords);
            });

            map.on('mouseenter', lineLayerId, () => {
              map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', lineLayerId, () => {
              map.getCanvas().style.cursor = '';
            });

            console.log(`Added line layer: ${lineLayerId}`);
          } catch (err) {
            console.error(`Error adding line layer ${lineLayerId}:`, err);
          }
        }
      } else {
        const fillLayerId = `${sourceId}-fill`;
        const lineLayerId = `${sourceId}-line`;

        if (!map.getLayer(fillLayerId)) {
          try {
            const beforeSites = map.getLayer('sites-points') ? 'sites-points' : undefined;
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
            }, beforeSites);
            
            // Click handler for fill
            map.on('click', fillLayerId, (e) => {
              const feature = e.features && e.features[0];
              const coords = [e.lngLat.lng, e.lngLat.lat];
              map.flyTo({ center: coords, zoom: 16, duration: 1000 });
              showServicePopup(map, feature, coords);
            });

            console.log(`Added fill layer: ${fillLayerId}`);
          } catch (err) {
            console.error(`Error adding fill layer ${fillLayerId}:`, err);
          }
        }

        if (!map.getLayer(lineLayerId)) {
          try {
            const beforeSites = map.getLayer('sites-points') ? 'sites-points' : undefined;
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
            }, beforeSites);
          } catch (err) {
            console.error(`Error adding polygon outline ${lineLayerId}:`, err);
          }
        }
      }

      loadedSourcesRef.current.add(sourceId);
    });
  }, [dynamicLayers]);

  // Handle basemap switch
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const filterExpr = ['in', ['id'], ['literal', filteredIds]];
    if (map.getLayer('sites-points')) map.setFilter('sites-points', filterExpr);
    if (map.getLayer('sites-numbers')) map.setFilter('sites-numbers', filterExpr);
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

  // Zoom to fit all visible layers when visibility changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Use a small delay to ensure source data is loaded for newly enabled layers
    const timer = setTimeout(() => {
      const visibleLayers = layers.filter((l) => l.visible);
      const allCoords = [];

      visibleLayers.forEach((layer) => {
        if (layer.id === 'sites') {
          const coords = allFeatures
            .filter((f) => filteredIds.includes(f.id))
            .map((f) => getFirstCoord2D(f.geometry))
            .filter(Boolean);
          allCoords.push(...coords);
        } else if (layerBoundsRef.current[layer.id]) {
          const [[minX, minY], [maxX, maxY]] = layerBoundsRef.current[layer.id];
          allCoords.push([minX, minY], [maxX, maxY]);
        }
      });

      if (allCoords.length > 0) {
        const bounds = getBounds(allCoords);
        if (bounds) {
          map.fitBounds(bounds, {
            padding: getFitPadding(),
            duration: PREFERS_REDUCED_MOTION ? 0 : 1000,
            pitch: map.getPitch(),
          });
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [layers, filteredIds, allFeatures]);

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
    padding: getFitPadding(),
    duration: PREFERS_REDUCED_MOTION ? 0 : 650,
    pitch: MAP_CONFIG.pitch,
  });
}

function getFitPadding() {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return { top: 110, right: 56, bottom: 170, left: 28 };
  }

  if (typeof window !== 'undefined' && window.innerWidth < 1280) {
    return { top: 120, right: 90, bottom: 110, left: 90 };
  }

  return { top: 120, right: 110, bottom: 90, left: 360 };
}

// Helper function for service popups
function showServicePopup(map, feature, coords) {
  const name =
    feature.properties.NOMBRE ||
    feature.properties.Nombre ||
    feature.properties.name ||
    feature.properties.label ||
    'Servicio';
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`;

  new maplibregl.Popup({ offset: 15, className: 'service-popup' })
    .setLngLat(coords)
    .setHTML(`
      <div class="p-3.5 bg-white rounded-xl shadow-xl min-w-[180px]">
        <h3 class="font-black text-stone-900 text-sm mb-3 leading-tight">${escapeHtml(name)}</h3>
        <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" 
           class="flex items-center justify-center gap-2 w-full bg-stone-950 text-white text-[11px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl hover:bg-primary transition-colors no-underline">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          Cómo llegar
        </a>
      </div>
    `)
    .addTo(map);
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
    offset: getFlyOffset(),
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

export const resetMapView = (map, allFeatures, filteredIds) => {
  fitToAllSites(map, allFeatures, filteredIds);
};

function getFlyOffset() {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return [0, -120];
  }

  if (typeof window !== 'undefined' && window.innerWidth < 1280) {
    return [0, -40];
  }

  return [-120, 0];
}

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
