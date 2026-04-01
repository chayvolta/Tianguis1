import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// Create context
const AppContext = createContext(null);

/**
 * App state provider - manages global application state
 * Following single source of truth and separation of concerns principles
 */
export const AppProvider = ({ children }) => {
  const [allFeatures, setAllFeatures] = useState([]);
  const [filteredIds, setFilteredIds] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [currentBasemap, setCurrentBasemap] = useState('satellite');
  const [staticLayers, setStaticLayers] = useState([
    { id: 'sites', name: 'Sitios', visible: true, color: '#e6281a' },
    { id: 'cip-limite', name: 'Límite CIP', visible: false, color: '#ff0000' },
    { id: 'senderos-paz', name: 'Senderos de Paz', visible: false, color: '#39ff14' },
  ]);
  const [dynamicLayers, setDynamicLayers] = useState([]);
  const [externalFeature, setExternalFeature] = useState(null);

  // Combine static and dynamic layers
  const layers = useMemo(() => [...staticLayers, ...dynamicLayers], [staticLayers, dynamicLayers]);

  // Toggle layer visibility
  const toggleLayer = useCallback((layerId) => {
    // Check if it's a dynamic layer
    const isDynamic = layerId.startsWith('points-') || layerId.startsWith('polygons-');
    
    if (isDynamic) {
      setDynamicLayers((prev) =>
        prev.map((layer) =>
          layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
        )
      );
    } else {
      setStaticLayers((prev) =>
        prev.map((layer) =>
          layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
        )
      );
    }
  }, []);

  // Memoized selected feature
  const selectedFeature = useMemo(() => {
    return allFeatures.find((f) => f.id === selectedId) || null;
  }, [allFeatures, selectedId]);

  // Memoized filtered features
  const filteredFeatures = useMemo(() => {
    return allFeatures.filter((f) => filteredIds.includes(f.id));
  }, [allFeatures, filteredIds]);

  // Select site by ID
  const selectSite = useCallback((id) => {
    setSelectedId(id);
    setIsCardVisible(true);
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setIsCardVisible(false);
  }, []);

  // Open a feature in the central DetailCard (from external layer clicks)
  const openFeatureCard = useCallback((feature) => {
    setExternalFeature(feature);
    setIsCardVisible(true);
  }, []);

  // Context value with memoization to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      // State
      allFeatures,
      filteredFeatures,
      filteredIds,
      selectedId,
      selectedFeature,
      isCardVisible,
      currentBasemap,

      // Actions
      setAllFeatures,
      setFilteredIds,
      selectSite,
      clearSelection,
      openFeatureCard,
      setExternalFeature,
      setCurrentBasemap,
      layers,
      toggleLayer,
      staticLayers,
      dynamicLayers,
      setDynamicLayers,
      // External feature that may be opened from map popups
      externalFeature,
    }),
    [
      allFeatures,
      filteredFeatures,
      filteredIds,
      selectedId,
      selectedFeature,
      isCardVisible,
      currentBasemap,
      selectSite,
      clearSelection,
      openFeatureCard,
      setExternalFeature,
      staticLayers,
      dynamicLayers,
      toggleLayer,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access app context
 * Throws error if used outside provider (fail fast principle)
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

