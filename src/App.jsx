import { useEffect, useRef, useState, useCallback } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { useGeoJSON } from './hooks/useGeoJSON';
import { useHashState } from './hooks/useHashState';
import { useLayerData } from './hooks/useLayerData';
import ErrorBoundary from './components/ErrorBoundary';
import DetailCard from './components/DetailCard';
import Map, { flyToSite, resetMapView, toggle3D } from './components/Map';
import MapControls from './components/MapControls';
import BasemapControls from './components/BasemapControls';
import LayerLegend from './components/LayerLegend';
import LoginModal from './components/Auth/LoginModal';
import CheckinModal from './components/Checkin/CheckinModal';

/**
 * Main App content component
 * Orchestrates all components and manages app logic
 */
function AppContent() {
  const {
    allFeatures,
    selectedFeature,
    isCardVisible,
    currentBasemap,
    layers,
    toggleLayer,
    setAllFeatures,
    setFilteredIds,
    selectSite,
    clearSelection,
    setCurrentBasemap,
    setDynamicLayers,
  } = useAppContext();

  const { data: geoJsonData, loading, error } = useGeoJSON();
  const { layers: layerDataList } = useLayerData();
  const { siteId: hashSiteId, writeHashSiteId, clearHash } = useHashState();
  const mapRef = useRef(null);
  const [is3DMode, setIs3DMode] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Load GeoJSON data
  useEffect(() => {
    if (geoJsonData.length > 0) {
      setAllFeatures(geoJsonData);
      setFilteredIds(geoJsonData.map((f) => f.id));
    }
  }, [geoJsonData, setAllFeatures, setFilteredIds]);

  // Load dynamic layers
  useEffect(() => {
    if (layerDataList.length > 0) {
      setDynamicLayers(layerDataList);
    }
  }, [layerDataList, setDynamicLayers]);

  // Handle deep linking
  useEffect(() => {
    if (hashSiteId !== null && allFeatures.length > 0) {
      const feature = allFeatures.find((f) => f.id === hashSiteId);
      if (feature) {
        selectSite(hashSiteId);
        // Fly to site after a short delay to ensure map is loaded
        setTimeout(() => {
          if (mapRef.current) {
            flyToSite(mapRef.current, feature);
          }
        }, 500);
      }
    }
  }, [hashSiteId, allFeatures, selectSite]);

  // Handle site selection
  const handleSelectSite = useCallback(
    (id) => {
      console.log('handleSelectSite called with id:', id);
      console.log('mapRef.current:', mapRef.current);
      selectSite(id);
      writeHashSiteId(id);

      // Fly to site on map
      const feature = allFeatures.find((f) => f.id === id);
      console.log('Found feature:', feature);
      if (feature && mapRef.current) {
        flyToSite(mapRef.current, feature);
      }
    },
    [selectSite, writeHashSiteId, allFeatures]
  );

  // Handle close card
  const handleCloseCard = useCallback(() => {
    clearSelection();
    clearHash();
  }, [clearSelection, clearHash]);

  // Handle 3D toggle
  const handleToggle3D = useCallback(() => {
    if (mapRef.current) {
      const newIs3D = toggle3D(mapRef.current);
      setIs3DMode(newIs3D);
    }
  }, []);

  const handleResetView = useCallback(() => {
    if (mapRef.current) {
      resetMapView(mapRef.current, allFeatures, allFeatures.map((f) => f.id));
    }
  }, [allFeatures]);

  // Handle basemap switch
  const handleSwitchBasemap = useCallback(
    (basemap) => {
      setCurrentBasemap(basemap);
    },
    [setCurrentBasemap]
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-stone-700">Cargando circuito patrimonial...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen h-[100dvh] flex flex-col bg-[#111827]">
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Checkin Modal */}
      <CheckinModal
        isOpen={showCheckinModal}
        onClose={() => setShowCheckinModal(false)}
        feature={selectedFeature}
        onLoginRequired={() => {
          setShowCheckinModal(false);
          setShowLoginModal(true);
        }}
      />

      {/* Main layout */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Detail Card - Floating */}
        {isCardVisible && selectedFeature && (
          <div className="absolute top-5 right-5 z-20 w-[390px] max-xl:w-[360px] max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:w-auto">
            <DetailCard 
              feature={selectedFeature}
              onClose={handleCloseCard}
              onOpenCheckin={() => setShowCheckinModal(true)}
              onOpenLogin={() => setShowLoginModal(true)}
            />
          </div>
        )}

        {/* Map - Full Screen */}
        <section
          className="flex-1 overflow-hidden relative bg-stone-950"
          aria-label="Mapa 3D"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-stone-950/55 to-transparent" />
          <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[260px] rounded-2xl border border-white/15 bg-stone-950/55 px-3.5 py-3 text-white shadow-xl backdrop-blur-xl max-md:left-3 max-md:right-[4.5rem] max-md:top-3 max-md:max-w-none max-md:px-3 max-md:py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-amber-200">
              Circuito PVF
            </p>
            <h1 className="mt-1 text-base font-black leading-tight tracking-tight max-md:text-sm">
              14 sitios prioritarios
            </h1>
            <p className="mt-1 text-[11px] leading-snug text-stone-100/80 max-md:hidden">
              Cards solo en 14Sitios_. Capas auxiliares como contexto.
            </p>
          </div>

          <Map
            onSiteSelect={handleSelectSite}
            ref={mapRef}
          />

          {/* Map controls */}
          <MapControls
            is3d={is3DMode}
            onToggle3D={handleToggle3D}
            onResetView={handleResetView}
          />

          {/* Basemap controls */}
          <BasemapControls
            currentBasemap={currentBasemap}
            onSwitch={handleSwitchBasemap}
          />

          {/* Layer controls */}
          <LayerLegend
            visibleLayers={layers.filter((l) => l.visible).map((l) => l.id)}
            onToggle={toggleLayer}
          />

          {/* Map hint */}
          {/* Map hint */}
          <div className="absolute left-5 bottom-5 z-10 flex flex-col items-start gap-2 max-md:left-3 max-md:bottom-3">
             {/* Info Button */}
            <button
              onClick={() => setShowTip(!showTip)}
              className={`
                w-10 h-10 flex items-center justify-center rounded-2xl border cursor-pointer transition shadow-lg backdrop-blur-xl
                ${showTip ? 'bg-amber-400 border-amber-200 text-stone-950' : 'border-white/25 bg-stone-950/55 text-white hover:bg-white/20'}
              `}
              title={showTip ? "Ocultar ayuda" : "Mostrar ayuda de navegación"}
              aria-label="Ayuda de navegacion"
              aria-expanded={showTip}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>

            {/* Tip Content */}
            <div 
              className={`
                text-xs text-stone-100 bg-stone-950/80 border border-white/20 px-3 py-2.5 rounded-2xl backdrop-blur-xl shadow-lg max-w-[220px] transition-all duration-300 origin-bottom-left
                ${showTip ? 'opacity-100 scale-100' : 'opacity-0 scale-95 hidden'}
              `}
            >
              <p className="leading-relaxed">
                <strong>Rotar:</strong> Clic derecho + arrastrar<br/>
                <strong>Inclinar:</strong> Shift + arrastrar
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * Root App component with providers
 * Following component composition and provider pattern
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
