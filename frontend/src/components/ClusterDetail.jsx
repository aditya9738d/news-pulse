import React, { useState } from 'react';
import { useCluster } from '../hooks/useClusters.js';

const SOURCE_COLORS = {
  'BBC': '#ef4444',
  'BBC News': '#ef4444',
  'NPR': '#3b82f6',
  'Reuters': '#f97316',
  'The Guardian': '#10b981',
  'TechCrunch': '#a855f7',
  'Al Jazeera': '#f59e0b',
};

function getSourceColor(name) {
  for (const [key, color] of Object.entries(SOURCE_COLORS)) {
    if (name?.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return '#6366f1';
}

function getSourceInitial(name) {
  if (!name) return '?';
  const words = name.split(' ');
  return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
}

export default function ClusterDetail({ clusterId, onClose }) {
  const { cluster, loading, error } = useCluster(clusterId);
  const [showAll, setShowAll] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState({});

  const toggleExpand = (id) => {
    setExpandedArticles(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!clusterId) return null;

  const articles = cluster?.articles || [];
  const displayArticles = showAll ? articles : articles.slice(0, 4);

  return (
    <div style={styles.panel} className="detail-panel animate-slide-right">
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>
            {loading ? 'Loading...' : cluster?.label}
            <span style={styles.activeDot} />
          </h3>
          {!loading && cluster && (
            <p style={styles.meta}>
              {cluster.articleCount} articles • {cluster.activeDays} {cluster.activeDays === 1 ? 'day' : 'days'} active
            </p>
          )}
        </div>
        <button onClick={onClose} style={styles.closeBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div style={styles.body}>
        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <span>Loading articles...</span>
          </div>
        )}

        {error && (
          <div style={styles.errorState}>⚠️ {error}</div>
        )}

        {!loading && !error && (
          <div style={styles.articleList}>
            {displayArticles.map(article => {
              const color = getSourceColor(article.source);
              const initials = getSourceInitial(article.source);
              const isExpanded = !!expandedArticles[article.id];
              const hasBody = !!article.body && article.body.trim().length > 0;

              return (
                <div key={article.id} style={styles.articleCard}>
                  <div style={styles.articleRow}>
                    <div style={{ ...styles.avatar, backgroundColor: `${color}20`, color }}>
                      {initials}
                    </div>
                    <div style={styles.articleContent}>
                      <div style={styles.articleMeta}>
                        <span style={styles.sourceName}>{article.source}</span>
                        <span style={styles.articleTime}>
                          {new Date(article.published_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.articleTitle}
                      >
                        {article.title}
                      </a>
                      {article.summary && !isExpanded && (
                        <p className="line-clamp-2" style={styles.articleSummary}>
                          {article.summary}
                        </p>
                      )}
                      {isExpanded && hasBody && (
                        <div style={styles.articleBody}>
                          {article.body}
                        </div>
                      )}
                      <div style={styles.articleActions}>
                        {hasBody && (
                          <button
                            onClick={() => toggleExpand(article.id)}
                            className="action-btn"
                          >
                            {isExpanded ? 'Show Less' : 'View More'}
                          </button>
                        )}
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-article-link"
                        >
                          View Article
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && articles.length > 4 && (
        <div style={styles.footer}>
          <button
            onClick={() => setShowAll(!showAll)}
            style={styles.viewAllBtn}
          >
            {showAll ? 'Show Less' : `View All ${articles.length} Articles`}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  panel: {
    width: 'var(--detail-panel-width)',
    minWidth: 'var(--detail-panel-width)',
    height: 'calc(100vh - var(--topbar-height))',
    position: 'sticky',
    top: 'var(--topbar-height)',
    background: 'var(--bg-secondary)',
    borderLeft: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.25rem',
    borderBottom: '1px solid var(--border)',
    gap: '0.5rem',
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    lineHeight: '1.3',
  },
  activeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    flexShrink: 0,
    boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)',
  },
  meta: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: 'none',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '0',
  },
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '2rem',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid var(--bg-tertiary)',
    borderTopColor: 'var(--accent-primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorState: {
    padding: '2rem',
    textAlign: 'center',
    color: '#ef4444',
    fontSize: '0.85rem',
  },
  articleList: {
    display: 'flex',
    flexDirection: 'column',
  },
  articleCard: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--border)',
    transition: 'background 0.15s',
  },
  articleRow: {
    display: 'flex',
    gap: '0.75rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  articleContent: {
    flex: 1,
    minWidth: 0,
  },
  articleBody: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
    marginTop: '0.5rem',
    whiteSpace: 'pre-wrap',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    maxHeight: '260px',
    overflowY: 'auto',
  },
  articleActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '0.6rem',
  },
  articleMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  sourceName: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
  },
  articleTime: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  articleTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: '1.35',
    display: 'block',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
  articleSummary: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    marginTop: '0.25rem',
  },
  footer: {
    padding: '1rem 1.25rem',
    borderTop: '1px solid var(--border)',
  },
  viewAllBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    width: '100%',
    padding: '0.65rem',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--accent-primary)',
    color: 'white',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};
