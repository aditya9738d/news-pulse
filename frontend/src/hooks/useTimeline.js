import { useState, useEffect, useCallback } from 'react';
import { fetchTimeline, fetchClusters, fetchSources, fetchStats } from '../lib/api.js';

export function useTimeline() {
  const [timeline, setTimeline] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedSources, setSelectedSources] = useState(new Set());
  const [stats, setStats] = useState({ totalArticles: 0, sourceCount: 0, lastUpdated: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [timelineData, clusterData, sourceData, statsData] = await Promise.all([
        fetchTimeline(),
        fetchClusters(),
        fetchSources(),
        fetchStats(),
      ]);

      setTimeline(timelineData.timeline || []);
      setClusters(clusterData.clusters || []);
      setSources(sourceData.sources || []);
      setStats(statsData);

      // Select all sources by default
      const allSourceNames = (sourceData.sources || []).map(s => s.name);
      setSelectedSources(prev => prev.size === 0 ? new Set(allSourceNames) : prev);
    } catch (err) {
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const toggleSource = useCallback((source) => {
    setSelectedSources(prev => {
      const next = new Set(prev);
      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }
      return next;
    });
  }, []);

  // Filter timeline by selected sources
  const filteredTimeline = timeline.filter(item => {
    if (selectedSources.size === 0) return false;
    return item.sources?.some(src => selectedSources.has(src));
  });

  // Filter clusters by selected sources
  const filteredClusters = clusters.filter(item => {
    if (selectedSources.size === 0) return false;
    return item.sources?.some(src => selectedSources.has(src));
  });

  return {
    timeline: filteredTimeline,
    clusters: filteredClusters,
    sources,
    selectedSources,
    stats,
    loading,
    error,
    refresh: loadAll,
    toggleSource,
  };
}
