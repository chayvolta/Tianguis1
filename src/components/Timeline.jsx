import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAppContext } from '../context/AppContext';
import { groupBy } from '../utils';
import TimelineItem from './TimelineItem';

/**
 * Timeline component - displays grouped list of historical sites
 * Grouping and sorting logic is handled here for separation of concerns
 */
const Timeline = memo(({ onSelectSite }) => {
  const { filteredFeatures, selectedId } = useAppContext();

  // Group and sort features
  const groupedFeatures = useMemo(() => {
    const sorted = [...filteredFeatures].sort((a, b) =>
      a.properties.__label.localeCompare(b.properties.__label, 'es', {
        sensitivity: 'base',
      })
    );

    const grouped = groupBy(sorted, (f) => f.properties.__folder);

    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0], 'es'));
  }, [filteredFeatures]);

  if (filteredFeatures.length === 0) {
    return (
      <div className="p-3 text-gray-600">
        Sin resultados.
      </div>
    );
  }

  return (
    <div className="p-3 overflow-auto flex-1">
      {groupedFeatures.map(([folder, items]) => (
        <div key={folder}>
          {/* Section header - sticky */}
          <div className="sticky top-0 z-10 bg-gradient-to-b from-white from-70% to-transparent py-2.5 pb-2.5 text-xs text-gray-600 tracking-wide">
            {folder.toUpperCase()}
          </div>

          {/* Items */}
          {items.map((feature) => (
            <TimelineItem
              key={feature.id}
              feature={feature}
              isActive={feature.id === selectedId}
              onSelect={onSelectSite}
            />
          ))}
        </div>
      ))}
    </div>
  );
});

Timeline.displayName = 'Timeline';

Timeline.propTypes = {
  onSelectSite: PropTypes.func.isRequired,
};

export default Timeline;
