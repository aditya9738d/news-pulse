import { useState, useEffect } from 'react';
import { fetchClusterDetails } from '../lib/api.js';

export function useCluster(clusterId) {
  const [cluster, setCluster] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clusterId) {
      setCluster(null);
      return;
    }

    let active = true;
    async function loadDetails() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchClusterDetails(clusterId);
        if (active) {
          setCluster(data.cluster);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Error loading cluster details');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDetails();
    return () => {
      active = false;
    };
  }, [clusterId]);

  return { cluster, loading, error };
}
