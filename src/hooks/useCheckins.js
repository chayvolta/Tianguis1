import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for managing user check-ins
 */
export const useCheckins = () => {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's checkins
  const fetchCheckins = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCheckins(data || []);
    } catch (err) {
      console.error('Error fetching checkins:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load checkins when user changes
  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  // Check if site has been visited
  const hasVisited = useCallback(
    (siteId) => {
      return checkins.some((c) => c.site_id === siteId);
    },
    [checkins]
  );

  // Get IDs of visited sites
  const visitedSiteIds = checkins.map((c) => c.site_id);

  // Create a new check-in
  const checkin = useCallback(
    async (siteId, siteName, photoUrl = null, qrValidated = false) => {
      if (!user) {
        throw new Error('Debes iniciar sesión para hacer check-in');
      }

      // Check if already visited
      if (hasVisited(siteId)) {
        throw new Error('Ya visitaste este sitio');
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('checkins')
          .insert({
            user_id: user.id,
            site_id: siteId,
            site_name: siteName,
            photo_url: photoUrl,
            qr_validated: qrValidated,
            points_earned: qrValidated ? 15 : 10, // Bonus for QR validation
          })
          .select()
          .single();

        if (error) throw error;

        // Add to local state
        setCheckins((prev) => [data, ...prev]);
        
        return data;
      } catch (err) {
        console.error('Checkin error:', err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, hasVisited]
  );

  return {
    checkins,
    visitedSiteIds,
    loading,
    error,
    checkin,
    hasVisited,
    refetch: fetchCheckins,
  };
};

export default useCheckins;
