import { memo, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * LayerControls component - toggles for map layers visibility
 * Collapsible to save space
 */
const LayerControls = memo(({ layers, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`absolute bottom-20 right-2 z-10 transition-all duration-300 ease-in-out flex flex-col items-end gap-2`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-10 h-10 flex items-center justify-center rounded-lg border bg-white cursor-pointer transition shadow-md
          ${isExpanded ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-400'}
        `}
        title="Capas"
        aria-label="Ver capas"
        aria-expanded={isExpanded}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
      </button>

      {/* Collapsible Content */}
      <div 
        className={`
          bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden transition-all duration-300 origin-bottom-right
          ${isExpanded ? 'opacity-100 scale-100 max-h-[300px] w-[180px] p-3' : 'opacity-0 scale-95 max-h-0 w-0 p-0 border-0'}
        `}
      >
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 whitespace-nowrap">
          Capas
        </h4>
        <div className="flex flex-col gap-2 min-w-[150px]">
          {layers.map((layer) => (
            <label
              key={layer.id}
              className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 p-1 rounded"
            >
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={() => onToggle(layer.id)}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary focus:ring-offset-0 cursor-pointer"
              />
              <span className="flex items-center gap-1.5 text-sm text-gray-700 group-hover:text-gray-900 truncate">
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: layer.color }}
                />
                {layer.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
});

LayerControls.displayName = 'LayerControls';

LayerControls.propTypes = {
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      visible: PropTypes.bool.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default LayerControls;
