'use client';

import React, { useState, useEffect } from 'react';
import { useTimeline } from '../hooks/useTimeline.js';
import { useIngest } from '../hooks/useIngest.js';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import TopicTimeline from '../components/TopicTimeline.jsx';
import ClusterGrid from '../components/ClusterGrid.jsx';
import ClusterDetail from '../components/ClusterDetail.jsx';

export default function Home() {
  const {
    timeline,
    clusters,
    sources,
    selectedSources,
    stats,
    loading,
    error,
    refresh,
    toggleSource,
  } = useTimeline();

  const {
    trigger,
    error: ingestError,
    isLoading: isRefreshing,
  } = useIngest(refresh);

  const [activeClusterId, setActiveClusterId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-layout" style={styles.appLayout}>
      <Sidebar
        sources={sources}
        selectedSources={selectedSources}
        onToggle={toggleSource}
        totalArticles={stats.totalArticles}
        sourceCount={stats.sourceCount}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Area (TopBar + Content + optional Detail) */}
      <div className="main-column" style={styles.mainColumn}>
        <TopBar
          lastUpdated={stats.lastUpdated}
          onRefresh={trigger}
          isRefreshing={isRefreshing}
          onMenuToggle={() => setIsSidebarOpen(true)}
        />

        <div className="content-row" style={styles.contentRow}>
          <div className="scroll-area" style={styles.scrollArea}>
            {(error || ingestError) && (
              <div style={styles.errorBanner}>
                ⚠️ {error || ingestError}
              </div>
            )}

            {/* Loading skeleton */}
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.skeletonBar} />
                <div style={styles.skeletonBar} />
                <div style={styles.skeletonBar} />
              </div>
            ) : (
              <>
                {/* Topic Timeline */}
                <TopicTimeline
                  timeline={timeline}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  onSelectCluster={setActiveClusterId}
                  activeClusterId={activeClusterId}
                />

                {/* Top Clusters Grid */}
                <ClusterGrid
                  clusters={clusters}
                  onSelectCluster={setActiveClusterId}
                  activeClusterId={activeClusterId}
                />
              </>
            )}
          </div>

          {/* Detail Panel (conditional) */}
          {activeClusterId && (
            <ClusterDetail
              clusterId={activeClusterId}
              onClose={() => setActiveClusterId(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  appLayout: {
    display: 'flex',
    height: '100vh',
    maxHeight: '100vh',
    background: 'var(--bg-primary)',
    overflow: 'hidden',
  },
  mainColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxHeight: '100vh',
    minWidth: 0,
    overflow: 'hidden',
  },
  contentRow: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    height: 'calc(100vh - var(--topbar-height))',
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    height: '100%',
  },
  errorBanner: {
    padding: '0.75rem 1rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#f87171',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '2rem 0',
  },
  skeletonBar: {
    height: '140px',
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};
