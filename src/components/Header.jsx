import { memo } from 'react';
import PropTypes from 'prop-types';

const Header = memo(({ statusText, authSlot }) => {
  return (
    <header className="relative z-50 flex h-20 items-center justify-between border-b border-white/10 bg-stone-950/90 px-5 text-white shadow-2xl backdrop-blur-xl max-md:h-[4.5rem] max-md:px-3">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 via-orange-400 to-amber-200 font-black text-stone-950 shadow-[0_14px_40px_rgba(251,146,60,0.35)]">
          14
        </div>
        <div>
          <div className="text-lg font-black tracking-tight">
            Acapulco Historico
          </div>
          <div className="text-xs font-medium uppercase tracking-[0.22em] text-amber-100/75">
            Geoportal PVF
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-amber-200/25 bg-amber-100/10 px-3 py-2 text-xs font-bold text-amber-100 sm:inline-block">
          {statusText}
        </span>
        {authSlot}
      </div>
    </header>
  );
});

Header.displayName = 'Header';

Header.propTypes = {
  statusText: PropTypes.string.isRequired,
  authSlot: PropTypes.node,
};

export default Header;
