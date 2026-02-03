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
  const [showTip, setShowTip] = useState(false);

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
          {/* Map hint */}
          <div className="absolute left-3 bottom-3 z-10 flex flex-col items-start gap-2">
             {/* Info Button */}
            <button
              onClick={() => setShowTip(!showTip)}
              className={`
                w-8 h-8 flex items-center justify-center rounded-lg border bg-white cursor-pointer transition shadow-sm
                ${showTip ? 'bg-primary border-primary text-white' : 'border-gray-300 text-gray-600 hover:text-gray-900'}
              `}
              title={showTip ? "Ocultar ayuda" : "Mostrar ayuda de navegación"}
              aria-label="Ayuda de navegación"
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
                text-xs text-[#0f172a] bg-white/95 border border-gray-200 px-3 py-2.5 rounded-lg backdrop-blur-sm shadow-lg max-w-[200px] transition-all duration-300 origin-bottom-left
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
