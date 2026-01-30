import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { useCheckins } from '../../hooks/useCheckins';

/**
 * Check-in Modal Component - confirms site visit
 */
const CheckinModal = memo(({ isOpen, onClose, feature, onLoginRequired }) => {
  const { isAuthenticated } = useAuth();
  const { checkin, hasVisited, loading } = useCheckins();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !feature) return null;

  const siteName = feature.properties.__label;
  const siteId = feature.id;
  const alreadyVisited = hasVisited(siteId);

  const handleCheckin = async () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    try {
      setError(null);
      await checkin(siteId, siteName);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {success ? (
          // Success state
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">🎉</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¡Check-in Exitoso!
            </h3>
            <p className="text-gray-600 mb-4">
              Has registrado tu visita a <strong>{siteName}</strong>
            </p>
            <div className="flex items-center justify-center gap-2 text-lg font-bold text-primary">
              <span>+10</span>
              <span className="text-sm font-normal text-gray-500">puntos</span>
            </div>
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition"
            >
              ¡Genial!
            </button>
          </div>
        ) : alreadyVisited ? (
          // Already visited state
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">✅</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Ya Visitaste Este Sitio
            </h3>
            <p className="text-gray-600 mb-4">
              Registraste tu visita a <strong>{siteName}</strong> anteriormente.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cerrar
            </button>
          </div>
        ) : (
          // Checkin prompt
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">📍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¿Estás en {siteName}?
            </h3>
            <p className="text-gray-600 mb-4">
              Confirma tu visita y gana <strong>10 puntos</strong>.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCheckin}
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg hover:bg-primary-light transition disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Hacer Check-in'}
              </button>
            </div>

            {!isAuthenticated && (
              <p className="mt-4 text-xs text-gray-500">
                Necesitas iniciar sesión para registrar tu visita
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

CheckinModal.displayName = 'CheckinModal';

CheckinModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  feature: PropTypes.object,
  onLoginRequired: PropTypes.func,
};

export default CheckinModal;
