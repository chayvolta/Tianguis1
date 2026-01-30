import { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';

/**
 * User Menu Component - shows in header when logged in
 */
const UserMenu = memo(({ onOpenProfile }) => {
  const { user, profile, isAuthenticated, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse border border-gray-400 opacity-50" title="Cargando usuario..." />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Usuario';
  const initials = displayName.slice(0, 2).toUpperCase();
  const points = profile?.total_points || 0;

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-black/5 transition"
        aria-label="Menú de usuario"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {initials}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-gray-900 text-sm font-medium leading-tight">
            {displayName}
          </span>
          <span className="text-gray-600 text-xs leading-tight">
            {points} pts
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[1000]">
            {/* Header con botón cerrar */}
            <div className="px-4 py-2 border-b border-gray-100 relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
                aria-label="Cerrar menú"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            <button
              onClick={() => {
                onOpenProfile?.();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <span>👤</span>
              Mi Perfil
            </button>

            <button
              onClick={() => {
                onOpenProfile?.();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <span>🏆</span>
              Mis Badges ({profile?.badges?.length || 0})
            </button>

            <hr className="my-1 border-gray-100" />

            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <span>🚪</span>
              Cerrar Sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
});

UserMenu.displayName = 'UserMenu';

UserMenu.propTypes = {
  onOpenProfile: PropTypes.func,
};

export default UserMenu;
