import { useState, useEffect, useCallback } from 'react';

/**
 * Read site ID from hash
 */
function readHashSiteId() {
  const hash = (window.location.hash || '').replace('#', '');
  const match = hash.match(/site=(\d+)/);
  return match ? Number(match[1]) : null;
}

/**
 * Custom hook for managing hash-based routing (#site=ID)
 * Implements deep linking functionality following URL-as-state principle
 */
export const useHashState = () => {
  const [siteId, setSiteId] = useState(() => readHashSiteId());

  // Write site ID to hash
  const writeHashSiteId = useCallback((id) => {
    const nextHash = `#site=${id}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }
  }, []);

  // Clear hash
  const clearHash = useCallback(() => {
    if (window.location.hash) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  }, []);

  // Listen to hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setSiteId(readHashSiteId());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return {
    siteId,
    writeHashSiteId,
    clearHash,
  };
};

