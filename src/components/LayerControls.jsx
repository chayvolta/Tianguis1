import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * LayerControls component - toggles for map layers visibility
 */
const LayerControls = memo(({ layers, onToggle }) => {
  return (
    <div className="absolute bottom-20 right-2 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 min-w-[160px]">
      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
        Capas
      </h4>
      <div className="flex flex-col gap-2">
        {layers.map((layer) => (
          <label
            key={layer.id}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={layer.visible}
              onChange={() => onToggle(layer.id)}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary focus:ring-offset-0"
            />
            <span className="flex items-center gap-1.5 text-sm text-gray-700 group-hover:text-gray-900">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: layer.color }}
              />
              {layer.name}
            </span>
          </label>
        ))}
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
