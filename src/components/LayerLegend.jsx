import { memo } from 'react';
import PropTypes from 'prop-types';
import { useLayerData } from '../hooks/useLayerData';

const LayerLegend = memo(({ visibleLayers, onToggle }) => {
  const { layers, loading } = useLayerData();

  return (
    <div className="absolute bottom-24 left-5 z-10 w-[320px] rounded-[28px] border border-white/20 bg-stone-950/70 p-4 text-white shadow-2xl backdrop-blur-xl max-md:bottom-20 max-md:left-3 max-md:w-[calc(100%-24px)]">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-200">
            Capas PVF
          </p>
          <h3 className="mt-1 text-base font-black">Contexto del recorrido</h3>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-stone-100">
          Cards: 14Sitios_
        </span>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white/10 px-3 py-4 text-center text-xs text-stone-200">
          Cargando capas PVF...
        </div>
      ) : (
        <div className="space-y-2.5">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-rose-200/20 bg-rose-500/15 p-3 transition hover:bg-rose-500/25">
            <input
              type="checkbox"
              checked={visibleLayers.includes('sites')}
              onChange={() => onToggle('sites')}
              className="mt-1 h-4 w-4 cursor-pointer rounded border-white/40 bg-transparent text-rose-500"
            />
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-rose-500 ring-4 ring-rose-200/20" />
            <span className="min-w-0">
              <span className="block text-sm font-black">14 sitios prioritarios</span>
              <span className="mt-0.5 block text-xs leading-snug text-stone-200">
                Unicos puntos que abren ficha, check-in y ruta en Google Maps.
              </span>
            </span>
          </label>

          {layers.map((layer) => (
            <label
              key={layer.id}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.08] p-3 transition hover:bg-white/15"
            >
              <input
                type="checkbox"
                checked={visibleLayers.includes(layer.id)}
                onChange={() => onToggle(layer.id)}
                className="mt-1 h-4 w-4 cursor-pointer rounded border-white/40 bg-transparent"
              />
              <span
                className={`mt-1 shrink-0 ${layer.type === 'Lines' ? 'h-1 w-6 rounded-full' : 'h-3 w-3 rounded-full ring-4 ring-white/10'}`}
                style={{ backgroundColor: layer.color }}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{layer.name}</span>
                <span className="mt-0.5 block text-xs leading-snug text-stone-300">
                  {layer.description}
                </span>
              </span>
            </label>
          ))}
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
