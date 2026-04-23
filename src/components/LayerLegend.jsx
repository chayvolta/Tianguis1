import { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLayerData } from '../hooks/useLayerData';

const LayerLegend = memo(({ visibleLayers, onToggle }) => {
  const { layers, loading } = useLayerData();
  const [isOpen, setIsOpen] = useState(false);
  const activeContextLayers = layers.filter((layer) => visibleLayers.includes(layer.id)).length;

  return (
    <div className="absolute bottom-20 left-5 z-10 w-[270px] text-white max-lg:left-3 max-md:w-[min(280px,calc(100%-88px))]">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/20 bg-stone-950/75 px-3 py-2.5 text-left shadow-2xl backdrop-blur-xl"
        aria-expanded={isOpen}
      >
        <span>
          <span className="block text-[9px] font-bold uppercase tracking-[0.24em] text-amber-200">
            Simbologia
          </span>
          <span className="text-xs font-black">
            {activeContextLayers + 1} capas activas
          </span>
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-base">
          {isOpen ? '-' : '+'}
        </span>
      </button>

      <div
        className={`mt-2 max-h-[46vh] overflow-y-auto rounded-3xl border border-white/20 bg-stone-950/72 p-3 shadow-2xl backdrop-blur-xl ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="mb-2.5 flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-amber-200">
              Simbologia
            </p>
            <h3 className="mt-0.5 text-sm font-black">Capas</h3>
          </div>
          <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-stone-100">
            14Sitios_
          </span>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white/10 px-3 py-3 text-center text-xs text-stone-200">
            Cargando capas PVF...
          </div>
        ) : (
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-rose-200/20 bg-rose-500/15 px-2.5 py-2 transition hover:bg-rose-500/25">
              <input
                type="checkbox"
                checked={visibleLayers.includes('sites')}
                onChange={() => onToggle('sites')}
                className="h-3.5 w-3.5 cursor-pointer rounded border-white/40 bg-transparent text-rose-500"
              />
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-rose-200/20">
                14
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-black">14 sitios prioritarios</span>
                <span className="mt-0.5 block text-[11px] leading-tight text-stone-200 max-lg:hidden">
                  Unicos puntos que abren ficha y ruta en Google Maps.
                </span>
              </span>
            </label>

            {layers.map((layer) => (
              <label
                key={layer.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.08] px-2.5 py-2 transition hover:bg-white/15"
              >
                <input
                  type="checkbox"
                  checked={visibleLayers.includes(layer.id)}
                  onChange={() => onToggle(layer.id)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-white/40 bg-transparent"
                />
                <span
                  className={`shrink-0 ${layer.type === 'Lines' ? 'h-1.5 w-7 rounded-full' : 'h-3.5 w-3.5 rounded-full ring-2 ring-white/10'}`}
                  style={{ backgroundColor: layer.color }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold">{layer.name}</span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-stone-300 max-lg:hidden">
                    {layer.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

LayerLegend.displayName = 'LayerLegend';

LayerLegend.propTypes = {
  visibleLayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default LayerLegend;
