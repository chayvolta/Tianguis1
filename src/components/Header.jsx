import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Header component - top navigation bar
 * Memoized to prevent unnecessary re-renders
 */
const Header = memo(({ statusText, authSlot }) => {
  return (
    <header className="relative z-50 h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-[rgba(242,233,216,0.85)] backdrop-blur-[10px]">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_0_4px_rgba(2,47,42,0.12)]" />
        <div>
          <div className="font-extrabold tracking-tight">
            Acapulco Histórico
          </div>
          <div className="text-xs text-gray-600">
            Explora 15 sitios históricos
          </div>
        </div>
      </div>

      {/* Right side - status + auth */}
      <div className="flex items-center gap-3">
        {/* Status pill */}
        <span className="hidden sm:inline-block text-xs text-primary bg-[rgba(2,47,42,0.08)] border border-[rgba(2,47,42,0.18)] px-2.5 py-2 rounded-full">
          {statusText}
        </span>

        {/* Auth slot (UserMenu or Login button) */}
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
