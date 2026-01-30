import { memo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { useCheckins } from '../../hooks/useCheckins';

/**
 * Profile Modal - Gamification Dashboard
 */
const ProfileModal = memo(({ isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const { checkins } = useCheckins();

  if (!isOpen) return null;

  // Calculos de progreso
  const totalSites = 15;
  const visitedCount = checkins.length;
  const progressPercentage = Math.round((visitedCount / totalSites) * 100);
  const totalPoints = profile?.total_points || 0;
  
  // Determinar Nivel
  let level = 'Explorador Novato';
  if (visitedCount >= 3) level = 'Aventurero';
  if (visitedCount >= 10) level = 'Historiador';
  if (visitedCount >= 15) level = 'Maestro de Acapulco';

  // Badges de Fauna de Acapulco
  const allBadges = [
    { id: 'erizo_mar', name: 'Erizo de Mar', icon: '🦔', req: 3, description: 'Visita 3 sitios históricos' },
    { id: 'zanate', name: 'Zanate', icon: '🐦‍⬛', req: 5, description: 'Visita 5 sitios históricos' },
    { id: 'iguana', name: 'Iguana', icon: '🦎', req: 10, description: 'Visita 10 sitios históricos' },
    { id: 'jaguar', name: 'Jaguar', icon: '🐆', req: 15, description: 'Completa todos los sitios' },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header con Gradiente */}
        <div className="relative bg-gradient-to-r from-primary to-primary-dark p-6 text-white overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full p-2 transition"
          >
            ✕
          </button>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Grande */}
            <div className="w-24 h-24 rounded-full bg-white text-primary flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white/30">
              {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">{profile?.display_name || user?.email}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10">
                  {level}
                </span>
                <span className="px-3 py-1 bg-yellow-400/20 text-yellow-100 rounded-full text-sm font-medium backdrop-blur-sm border border-yellow-400/30">
                  {totalPoints} pts
                </span>
              </div>
            </div>
          </div>

          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-8">
          
          {/* Barra de Progreso */}
          <section>
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-lg font-bold text-gray-800">Tu Progreso</h3>
              <span className="text-sm font-medium text-primary">
                {visitedCount} de {totalSites} sitios
              </span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-primary transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </section>

          {/* Badges Grid */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Medallas</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {allBadges.map((badge) => {
                const isUnlocked = visitedCount >= badge.req;
                return (
                  <div 
                    key={badge.id}
                    className={`
                      relative p-4 rounded-xl border text-center transition-all duration-300
                      ${isUnlocked 
                        ? 'bg-gradient-to-b from-yellow-50 to-white border-yellow-200 shadow-sm scale-100' 
                        : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
                      }
                    `}
                  >
                    <div className="text-4xl mb-2 filter drop-shadow-sm">{badge.icon}</div>
                    <div className="font-bold text-sm text-gray-800 leading-tight mb-1">{badge.name}</div>
                    <div className="text-xs text-gray-500">{badge.description}</div>
                    
                    {isUnlocked && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        ¡GANADO!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Historial (Bitácora) */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Bitácora de Viaje</h3>
            {checkins.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">Aún no has visitado ningún sitio.</p>
                <p className="text-sm text-gray-400 mt-1">¡Ve al mapa y haz check-in!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkins.map((checkin) => (
                  <div key={checkin.id} className="flex items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{checkin.site_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(checkin.created_at).toLocaleDateString()} • +{checkin.points_earned} pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
});

ProfileModal.displayName = 'ProfileModal';

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProfileModal;
