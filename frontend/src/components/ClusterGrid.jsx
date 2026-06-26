import React from 'react';

const CATEGORY_ICONS = {
  Politics: '🏛️',
  Technology: '💻',
  Economy: '📈',
  World: '🌍',
  Sports: '⚽',
  General: '📰',
};

const CATEGORY_BORDER_COLORS = {
  Politics: 'rgba(249,115,22,0.3)',
  Technology: 'rgba(99,102,241,0.3)',
  Economy: 'rgba(239,68,68,0.3)',
  World: 'rgba(16,185,129,0.3)',
  Sports: 'rgba(168,85,247,0.3)',
  General: 'rgba(59,130,246,0.3)',
};

export default function ClusterGrid({ clusters, onSelectCluster, activeClusterId }) {
  if (!clusters || clusters.length === 0) return null;

  // Show top 6 clusters
  const topClusters = clusters.slice(0, 6);

  return (
    <div style={styles.wrapper} className="animate-fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>Top Clusters</h2>
        <button style={styles.viewAll}>
          View all clusters
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <div className="cluster-grid" style={styles.grid}>
        {topClusters.map((cluster, idx) => {
          const icon = CATEGORY_ICONS[cluster.category] || CATEGORY_ICONS.General;
          const badgeClass = `badge-${cluster.category.toLowerCase()}`;
          const borderColor = CATEGORY_BORDER_COLORS[cluster.category] || CATEGORY_BORDER_COLORS.General;
          const isActive = activeClusterId === cluster.id;

          return (
            <div
              key={cluster.id}
              style={{
                ...styles.card,
                borderColor: isActive ? 'var(--accent-primary)' : borderColor,
                animationDelay: `${idx * 0.05}s`,
                boxShadow: isActive ? '0 0 20px rgba(99, 102, 241, 0.2)' : 'none',
              }}
              className="cluster-card animate-fade-in"
            >
              <div className="cluster-card-top" style={styles.cardTop}>
                <span className="cluster-card-icon" style={styles.icon}>{icon}</span>
                <div className="cluster-card-title-row" style={styles.cardTitleRow}>
                  <h3 className="line-clamp-1 cluster-card-title" style={styles.cardTitle}>{cluster.label}</h3>
                  <span className={`${badgeClass} cluster-card-badge`} style={styles.badge}>{cluster.category}</span>
                </div>
              </div>

              <p className="line-clamp-2 cluster-card-desc" style={styles.cardDesc}>
                Syndicated across {cluster.sourceCount} source{cluster.sourceCount !== 1 ? 's' : ''} ({cluster.articleCount} total article{cluster.articleCount !== 1 ? 's' : ''}).
              </p>

              <div className="cluster-card-stats" style={styles.stats}>
                <div className="cluster-card-stat" style={styles.stat}>
                  <div className="cluster-card-stat-value" style={styles.statValue}>{cluster.articleCount}</div>
                  <div className="cluster-card-stat-label" style={styles.statLabel}>Articles</div>
                </div>
                <div className="cluster-card-stat" style={styles.stat}>
                  <div className="cluster-card-stat-value" style={styles.statValue}>{cluster.sourceCount}</div>
                  <div className="cluster-card-stat-label" style={styles.statLabel}>Sources</div>
                </div>
                <div className="cluster-card-stat" style={styles.stat}>
                  <div className="cluster-card-stat-value" style={styles.statValue}>{cluster.activeDays} {cluster.activeDays === 1 ? 'day' : 'days'}</div>
                  <div className="cluster-card-stat-label" style={styles.statLabel}>Active</div>
                </div>
              </div>

              <button
                onClick={() => onSelectCluster(cluster.id)}
                style={styles.viewBtn}
                className="cluster-card-view-btn"
              >
                View Details
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: '0.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  viewAll: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'none',
    border: 'none',
    color: 'var(--accent-glow)',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  card: {
    background: 'var(--bg-card)',
    borderRadius: '12px',
    border: '1px solid',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    transition: 'all 0.2s',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  icon: {
    fontSize: '1.5rem',
    lineHeight: '1',
    flexShrink: 0,
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-tertiary)',
    borderRadius: '8px',
  },
  cardTitleRow: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: '0.92rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.3',
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.65rem',
    fontWeight: '600',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    marginTop: '0.3rem',
  },
  cardDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
  },
  stats: {
    display: 'flex',
    gap: '1rem',
    borderTop: '1px solid var(--border)',
    paddingTop: '0.75rem',
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  statLabel: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem',
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    width: '100%',
    padding: '0.6rem',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(99, 102, 241, 0.12)',
    color: 'var(--accent-glow)',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};
