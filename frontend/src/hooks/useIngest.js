import { useState, useCallback, useEffect, useRef } from 'react';
import { triggerIngest, getIngestStatus } from '../lib/api.js';

export function useIngest(onComplete) {
  const [status, setStatus] = useState('idle'); // idle, running, completed, failed
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);

  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const trigger = useCallback(async () => {
    clearPolling();
    setStatus('running');
    setError(null);

    try {
      const { jobId } = await triggerIngest();
      
      pollIntervalRef.current = setInterval(async () => {
        try {
          const job = await getIngestStatus(jobId);
          if (job.status === 'completed') {
            clearPolling();
            setStatus('completed');
            if (onComplete) onComplete();
          } else if (job.status === 'failed') {
            clearPolling();
            setStatus('failed');
            setError(job.error || 'Ingestion pipeline failed');
          }
        } catch (err) {
          clearPolling();
          setStatus('failed');
          setError(err.message || 'Error checking ingestion status');
        }
      }, 2000);
    } catch (err) {
      setStatus('failed');
      setError(err.message || 'Failed to trigger ingestion');
    }
  }, [clearPolling, onComplete]);

  useEffect(() => {
    return () => clearPolling();
  }, [clearPolling]);

  return {
    trigger,
    status,
    error,
    isLoading: status === 'running'
  };
}
