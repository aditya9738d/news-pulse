import React from 'react';

export default function TopBar({ lastUpdated, onRefresh, isRefreshing, onMenuToggle }) {
  const getTimeAgo = () => {
    if (!lastUpdated) return 'Never';
    const diff = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <header style={styles.topbar}>
      {/* Hamburger menu button for mobile */}
      <button
        onClick={onMenuToggle}
        className="menu-toggle-btn"
        style={styles.menuToggleBtn}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div style={styles.right}>
        {/* Last Updated */}
        <div style={styles.lastUpdated}>
          <div style={{
            ...styles.statusDot,
            backgroundColor: lastUpdated ? '#10b981' : '#64748b',
            boxShadow: lastUpdated ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none',
          }} />
          <span>Last updated: {getTimeAgo()}</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            ...styles.refreshBtn,
            opacity: isRefreshing ? 0.6 : 1,
          }}
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={isRefreshing ? { animation: 'spin 1s linear infinite' } : {}}
          >
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
          {isRefreshing ? 'Refreshing...' : 'Refresh News'}
        </button>

      </div>
    </header>
  );
}

const styles = {
  topbar: {
    height: 'var(--topbar-height)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    position: 'relative',
    zIndex: 40,
  },
  menuToggleBtn: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-tertiary)',
    border: 'none',
    color: 'var(--text-primary)',
    padding: '0.4rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginLeft: 'auto',
  },
  lastUpdated: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'var(--accent-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '600',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
};
