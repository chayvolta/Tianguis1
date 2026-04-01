import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLayerData } from '../hooks/useLayerData';

/**
 * LayerLegend component - displays dynamic GeoJSON layers as an expanded legend panel
 * Shows Points and Polygons organized alphabetically with descriptions
 */
const LayerLegend = memo(({ visibleLayers, onToggle }) => {
  const { layers, loading } = useLayerData();
  const [groupedLayers, setGroupedLayers] = useState({ Points: [], Polygons: [] });

  // Group and organize layers
  useEffect(() => {
    const grouped = { Points: [], Polygons: [] };
    
    layers.forEach((layer) => {
      const type = layer.type;
      if (grouped[type]) {
        grouped[type].push(layer);
      }
    });

    // Sort each group alphabetically
    grouped.Points.sort((a, b) => a.name.localeCompare(b.name));
    grouped.Polygons.sort((a, b) => a.name.localeCompare(b.name));

    setGroupedLayers(grouped);
  }, [layers]);

  return (
    <div 
      className="absolute left-3 bottom-24 z-10 bg-white rounded-lg shadow-lg p-4 w-[300px] border border-gray-200"
    >
      <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-primary/20 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        Lugares Turísticos
      </h3>

      {loading ? (
        <div className="text-xs text-gray-500 text-center py-2">Cargando lugares...</div>
      ) : (
        <div className="space-y-3.5 overflow-y-auto max-h-[450px]">
          {/* Capas Estáticas */}
          <div>
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: '#FF0000' }}></span>
              Límites y Rutas
            </h4>
            <div className="space-y-1.5 ml-2">
              {/* Sitios */}
              <label className="flex items-start gap-2 cursor-pointer group hover:bg-red-50 p-1.5 rounded transition">
                <input
                  type="checkbox"
                  checked={visibleLayers.includes('sites')}
                  onChange={() => onToggle('sites')}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-600 focus:ring-offset-0 cursor-pointer mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">
                    📍 Sitios
                  </div>
                  <div className="text-xs text-gray-500 leading-tight mt-0.5">
                    Lugares históricos
                  </div>
                </div>
              </label>

              {/* CIP Límite */}
              <label className="flex items-start gap-2 cursor-pointer group hover:bg-red-50 p-1.5 rounded transition">
                <input
                  type="checkbox"
                  checked={visibleLayers.includes('cip-limite')}
                  onChange={() => onToggle('cip-limite')}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-600 focus:ring-offset-0 cursor-pointer mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">
                    🏛️ Límite CIP
                  </div>
                  <div className="text-xs text-gray-500 leading-tight mt-0.5">
                    Polígono histórico
                  </div>
                </div>
              </label>

              {/* Senderos de Paz */}
              <label className="flex items-start gap-2 cursor-pointer group hover:bg-green-50 p-1.5 rounded transition">
                <input
                  type="checkbox"
                  checked={visibleLayers.includes('senderos-paz')}
                  onChange={() => onToggle('senderos-paz')}
                  className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-600 focus:ring-offset-0 cursor-pointer mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">
                    🚶 Senderos de Paz
                  </div>
                  <div className="text-xs text-gray-500 leading-tight mt-0.5">
                    Rutas turísticas
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Points Section */}
          {groupedLayers.Points.length > 0 && (
            <div className="border-t border-gray-200 pt-3">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E74C3C' }}></span>
                Puntos de Interés
              </h4>
              <div className="space-y-1.5 ml-2">
                {groupedLayers.Points.map((layer) => (
                  <label
                    key={layer.id}
                    className="flex items-start gap-2 cursor-pointer group hover:bg-red-50 p-1.5 rounded transition"
                  >
                    <input
                      type="checkbox"
                      checked={visibleLayers.includes(layer.id)}
                      onChange={() => onToggle(layer.id)}
                      className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-600 focus:ring-offset-0 cursor-pointer mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 truncate">
                        📍 {layer.name.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-500 leading-tight mt-0.5">
                        {layer.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Polygons Section */}
          {groupedLayers.Polygons.length > 0 && (
            <div className={groupedLayers.Points.length > 0 ? 'border-t border-gray-200 pt-3' : ''}>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3498DB' }}></span>
                Áreas de Interés
              </h4>
              <div className="space-y-1.5 ml-2">
                {groupedLayers.Polygons.map((layer) => (
                  <label
                    key={layer.id}
                    className="flex items-start gap-2 cursor-pointer group hover:bg-blue-50 p-1.5 rounded transition"
                  >
                    <input
                      type="checkbox"
                      checked={visibleLayers.includes(layer.id)}
                      onChange={() => onToggle(layer.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600 focus:ring-offset-0 cursor-pointer mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 truncate">
                        🗺️ {layer.name.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-500 leading-tight mt-0.5">
                        {layer.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

LayerLegend.displayName = 'LayerLegend';

LayerLegend.propTypes = {
  visibleLayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default LayerLegend;
