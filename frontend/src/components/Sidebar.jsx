import React from 'react';

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
    if (name.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return '#6366f1';
}

const NAV_ITEMS = [
  { id: 'timeline', label: 'Timeline', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )},
  { id: 'clusters', label: 'Clusters', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  )},
  { id: 'sources', label: 'Sources', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  )},
  { id: 'ingest', label: 'Ingest Jobs', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
    </svg>
  )},
  { id: 'settings', label: 'Settings', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )},
];

export default function Sidebar({ sources, selectedSources, onToggle, totalArticles, sourceCount, isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`} style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="var(--accent-primary)" stroke="var(--accent-glow)" strokeWidth="1"/>
              </svg>
            </div>
            <div style={styles.brandTitle}>News Pulse</div>
          </div>
          <button onClick={onClose} className="sidebar-close-btn" style={styles.closeBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

      <nav style={styles.nav}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            style={{
              ...styles.navItem,
              ...(item.id === 'timeline' ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={styles.divider} />

      <div style={styles.sourcesSection}>
        <div style={styles.sectionLabel}>Sources</div>
        {sources.map(src => {
          const color = getSourceColor(src.name);
          const isSelected = selectedSources.has(src.name);
          return (
            <label key={src.name} style={styles.sourceRow}>
              <div style={styles.sourceLeft}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(src.name)}
                  style={{ display: 'none' }}
                />
                <div style={{
                  ...styles.checkbox,
                  backgroundColor: isSelected ? color : 'transparent',
                  borderColor: isSelected ? color : 'var(--text-muted)',
                }}>
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div style={{ ...styles.sourceDot, backgroundColor: color }} />
                <span style={styles.sourceName}>{src.name}</span>
              </div>
              <span style={{ ...styles.sourceCount, color }}>{src.articleCount}</span>
            </label>
          );
        })}
      </div>

      <div style={styles.totalSection}>
        <div style={styles.totalLabel}>Total Articles</div>
        <div style={styles.totalNumber}>{totalArticles}</div>
        <div style={styles.totalSub}>Across {sourceCount} sources</div>
      </div>
    </aside>
    </>
  );
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    minWidth: 'var(--sidebar-width)',
    height: '100vh',
    position: 'sticky',
    top: 0,
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    overflowY: 'auto',
    zIndex: 50,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.25rem 1rem',
  },
  closeBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '0.4rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  brandSub: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    marginTop: '1px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '0.5rem 0.75rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
    width: '100%',
  },
  navItemActive: {
    background: 'rgba(99, 102, 241, 0.12)',
    color: 'var(--accent-glow)',
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    opacity: 0.8,
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    margin: '0.5rem 1.25rem',
  },
  sourcesSection: {
    padding: '0.5rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  sectionLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    marginBottom: '0.4rem',
  },
  sourceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.4rem 0',
    cursor: 'pointer',
    userSelect: 'none',
  },
  sourceLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
    flexShrink: 0,
  },
  sourceDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  sourceName: {
    fontSize: '0.82rem',
    color: 'var(--text-primary)',
    fontWeight: '500',
  },
  sourceCount: {
    fontSize: '0.82rem',
    fontWeight: '700',
  },
  totalSection: {
    marginTop: 'auto',
    padding: '1.25rem',
    borderTop: '1px solid var(--border)',
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    marginBottom: '0.35rem',
  },
  totalNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1',
  },
  totalSub: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
};
