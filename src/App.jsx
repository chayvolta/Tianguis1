import { useEffect, useRef, useState, useCallback } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useGeoJSON } from './hooks/useGeoJSON';
import { useHashState } from './hooks/useHashState';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Timeline from './components/Timeline';
import DetailCard from './components/DetailCard';
import Map, { flyToSite, resetMapView, toggle3D } from './components/Map';
import MapControls from './components/MapControls';
import BasemapControls from './components/BasemapControls';
import LayerControls from './components/LayerControls';
import LoginModal from './components/Auth/LoginModal';
import UserMenu from './components/Auth/UserMenu';
import CheckinModal from './components/Checkin/CheckinModal';
import ProfileModal from './components/Profile/ProfileModal';

/**
 * Main App content component
 * Orchestrates all components and manages app logic
 */
function AppContent() {
  const {
    allFeatures,
    filteredFeatures,
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
  } = useAppContext();

  const { data: geoJsonData, loading, error } = useGeoJSON();
  const { siteId: hashSiteId, writeHashSiteId, clearHash } = useHashState();
  const { isAuthenticated } = useAuth();
  const mapRef = useRef(null);
  const [is3DMode, setIs3DMode] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Load GeoJSON data
  useEffect(() => {
    if (geoJsonData.length > 0) {
      setAllFeatures(geoJsonData);
      setFilteredIds(geoJsonData.map((f) => f.id));
    }
  }, [geoJsonData, setAllFeatures, setFilteredIds]);

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

  // Handle reset view
  const handleResetView = useCallback(() => {
    if (mapRef.current) {
      resetMapView(mapRef.current, allFeatures, filteredFeatures.map((f) => f.id));
    }
  }, [allFeatures, filteredFeatures]);

  // Handle basemap switch
  const handleSwitchBasemap = useCallback(
    (basemap) => {
      setCurrentBasemap(basemap);
    },
    [setCurrentBasemap]
  );

  // Status text
  const statusText = loading
    ? 'Cargando GeoJSON…'
    : error
    ? 'Error al cargar'
    : `Sitios: ${filteredFeatures.length}/${allFeatures.length}`;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando datos…</div>
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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header 
        statusText={statusText}
        authSlot={
          isAuthenticated ? (
            <UserMenu onOpenProfile={() => setShowProfileModal(true)} />
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition"
            >
              Iniciar Sesión
            </button>
          )
        }
      />

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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Main layout */}
      <main className="flex-1 flex flex-col md:flex-row gap-3 p-3 overflow-hidden">
        {/* Left panel - Timeline or Card */}
        <section
          className="w-[38%] min-w-[340px] bg-white border border-gray-200 rounded-2xl shadow-custom overflow-hidden flex flex-col md:w-[38%] max-md:w-full max-md:h-[52%]"
          aria-label="Panel de sitios"
        >
          {isCardVisible ? (
            <DetailCard 
              feature={selectedFeature} 
              onClose={handleCloseCard}
              onOpenCheckin={() => setShowCheckinModal(true)}
              onOpenLogin={() => setShowLoginModal(true)}
            />
          ) : (
            <Timeline onSelectSite={handleSelectSite} />
          )}
        </section>

        {/* Right panel - Map */}
        <section
          className="flex-1 border border-gray-200 rounded-2xl overflow-hidden relative shadow-custom bg-gray-200 max-md:h-[48%]"
          aria-label="Mapa 3D"
        >
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
          <LayerControls
            layers={layers}
            onToggle={toggleLayer}
          />

          {/* Map hint */}
          <div className="absolute left-3 bottom-3 text-xs text-[#0f172a] bg-white/85 border border-[rgba(15,23,42,0.1)] px-2.5 py-2 rounded-lg backdrop-blur-sm">
            Tip: arrastra con botón derecho (o Ctrl+drag) para rotar. Shift+drag
            para pitch.
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
