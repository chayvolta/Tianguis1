import { memo } from 'react';
import PropTypes from 'prop-types';
import { PREFERS_REDUCED_MOTION } from '../constants';

/**
 * TimelineItem component - individual site in the timeline
 * Memoized for performance optimization
 */
const TimelineItem = memo(({ feature, isActive, onSelect }) => {
  const handleClick = () => {
    onSelect(feature.id);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(feature.id);
    }
  };

  return (
    <div
      className={`
        flex gap-2.5 p-2.5 border rounded-xl bg-white mb-2.5 cursor-pointer 
        transition-all duration-75 ease-out
        hover:-translate-y-px hover:border-primary/35
        ${isActive ? 'border-[rgba(231,111,81,0.6)] shadow-[0_0_0_4px_rgba(231,111,81,0.14)]' : 'border-gray-200'}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Ver sitio ${feature.properties.__label}`}
      aria-pressed={isActive}
    >
      {/* Dot indicator */}
      <div
        className={`
          w-2.5 h-2.5 rounded-full mt-1.5
          ${isActive
            ? 'bg-highlight shadow-[0_0_0_4px_rgba(231,111,81,0.14)]'
            : 'bg-accent shadow-[0_0_0_4px_rgba(27,127,140,0.12)]'
          }
        `}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-extrabold truncate">
          {feature.properties.__label}
        </div>
        <div className="text-xs text-gray-600 mt-0.5">
          Sitio histórico · Cronología{' '}
          <span className="opacity-90">[POR CONFIRMAR]</span>
        </div>
      </div>
    </div>
  );
});

TimelineItem.displayName = 'TimelineItem';

TimelineItem.propTypes = {
  feature: PropTypes.shape({
    id: PropTypes.number.isRequired,
    properties: PropTypes.shape({
      __label: PropTypes.string.isRequired,
      __folder: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default TimelineItem;
