import React from 'react';

const CATEGORIES = ['All Topics', 'Politics', 'Technology', 'Economy', 'World', 'Sports'];

const CATEGORY_DOT_COLORS = {
  Politics: 'var(--cat-politics)',
  Technology: 'var(--cat-technology)',
  Economy: 'var(--cat-economy)',
  World: 'var(--cat-world)',
  Sports: 'var(--cat-sports)',
  General: 'var(--cat-general)',
};

export default function TopicTimeline({ timeline, selectedCategory, onCategoryChange, onSelectCluster, activeClusterId }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Active Topic Activity</h2>
            <p style={styles.subtitle}>Click on a bar to explore articles in that cluster</p>
          </div>
        </div>
        <div style={styles.emptyState}>
          <p>No clusters found. Try refreshing the news feed.</p>
        </div>
      </div>
    );
  }

  // Filter by category and sort by importance
  const categoryFiltered = selectedCategory === 'All Topics'
    ? timeline
    : timeline.filter(t => t.category === selectedCategory);

  const filtered = [...categoryFiltered]
    .sort((a, b) => b.articleCount - a.articleCount); // Biggest clusters first

  // Calculate time bounds — use a fixed 3-day window with right-side padding
  const now = Date.now();
  const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
  const rightPadding = 12 * 60 * 60 * 1000; 
  const minTime = threeDaysAgo;
  const maxTime = now + rightPadding;
  const totalDuration = maxTime - minTime;

  const ticks = [];
  for (let d = 0; d <= 3; d++) {
    const tickTime = threeDaysAgo + d * 24 * 60 * 60 * 1000;
    if (now - tickTime < 18 * 60 * 60 * 1000) continue;
    ticks.push(new Date(tickTime));
  }
  const todayStr = new Date(now).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  ticks.push({ date: new Date(now), label: `${todayStr} (Today)` });

  return (
    <div className="timeline-wrapper animate-fade-in" style={styles.wrapper}>
      <div className="timeline-header" style={styles.header}>
        <div>
          <h2 style={styles.title}>Active Topic Activity</h2>
          <p style={styles.subtitle}>Click on a bar to explore articles in that cluster</p>
        </div>
        <div className="timeline-filter-row" style={styles.filterRow}>
          <div className="timeline-category-pills" style={styles.categoryPills}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                style={{
                  ...styles.pill,
                  ...(selectedCategory === cat ? styles.pillActive : {}),
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={styles.timeRange}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Last 3 Days</span>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="timeline-chart-area" style={styles.chartArea}>
        <div className="timeline-rows" style={styles.rows}>
          {filtered.map((item, idx) => {
            const startTime = new Date(item.start).getTime();
            const endTime = new Date(item.end).getTime();
            const startPct = ((startTime - minTime) / totalDuration) * 100;
            const endPct = ((endTime - minTime) / totalDuration) * 100;
            const timeSpanPct = endPct - startPct;

            const minWidth = 6 + Math.min(item.articleCount * 1.5, 20);
            let widthPct = Math.max(timeSpanPct, minWidth);

            let barLeft;
            if (timeSpanPct < minWidth) {
              const centerPct = startPct + timeSpanPct / 2;
              barLeft = centerPct - minWidth / 2;
            } else {
              barLeft = startPct;
            }

            if (barLeft < 0) barLeft = 0;
            if (barLeft + widthPct > 100) {
              barLeft = 100 - widthPct;
              if (barLeft < 0) {
                barLeft = 0;
                widthPct = 100;
              }
            }

            const isActive = activeClusterId === item.clusterId;
            const dotColor = CATEGORY_DOT_COLORS[item.category] || CATEGORY_DOT_COLORS.General;
            const barClass = `bar-${item.category.toLowerCase()}`;

            const startDate = new Date(item.start);
            const endDate = new Date(item.end);
            const startStr = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const endStr = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const barLabel = startStr === endStr ? startStr : `${startStr} – ${endStr}`;

            return (
              <div
                key={item.clusterId}
                className="timeline-row"
                style={{
                  ...styles.row,
                  ...(idx % 2 === 0 ? {} : { background: 'rgba(255,255,255,0.015)' }),
                }}
              >
                {/* Label column */}
                <div className="timeline-label-col" style={styles.labelCol}>
                  <div style={{ ...styles.dot, backgroundColor: dotColor }} />
                  <div>
                    <div style={styles.clusterName}>{item.label}</div>
                    <div style={styles.clusterMeta}>{item.articleCount} articles</div>
                  </div>
                </div>

                {/* Bar column */}
                <div className="timeline-bar-col" style={styles.barCol}>
                  <button
                    onClick={() => onSelectCluster(item.clusterId)}
                    className={barClass}
                    style={{
                      ...styles.bar,
                      left: `${barLeft}%`,
                      width: `${widthPct}%`,
                      ...(isActive ? styles.barActive : {}),
                    }}
                    title={item.label}
                  >
                    <span className="line-clamp-1" style={styles.barText}>{barLabel}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis ticks */}
        <div className="timeline-xaxis" style={styles.xAxis}>
          <div className="timeline-xaxis-spacer" style={styles.xAxisSpacer} />
          <div className="timeline-xaxis-track" style={styles.xAxisTrack}>
            {ticks.map((tick, idx) => {
              const tickDate = tick instanceof Date ? tick : tick.date;
              const tickLabel = tick.label || tickDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              const pct = ((tickDate.getTime() - minTime) / totalDuration) * 100;
              return (
                <div
                  key={idx}
                  style={{
                    ...styles.tick,
                    left: `${Math.min(Math.max(pct, 0), 100)}%`,
                    ...(tick.label && tick.label.includes('(Today)') ? { color: 'var(--accent-green)', fontWeight: '700' } : {}),
                  }}
                >
                  {tickLabel}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    flexShrink: 0, 
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
    gap: '1rem',
    background: 'var(--bg-secondary)',
    borderTopLeftRadius: '11px',
    borderTopRightRadius: '11px',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '0.15rem',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  categoryPills: {
    display: 'flex',
    gap: '0.25rem',
    background: 'var(--bg-tertiary)',
    padding: '0.2rem',
    borderRadius: '8px',
  },
  pill: {
    padding: '0.4rem 0.85rem',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.78rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  pillActive: {
    background: 'var(--accent-primary)',
    color: 'white',
    fontWeight: '600',
  },
  timeRange: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    fontSize: '0.78rem',
    fontWeight: '500',
  },
  chartArea: {
    padding: '0.5rem 0 0 0',
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '320px',
    overflowY: 'auto',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    height: '50px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    flexShrink: 0,
  },
  labelCol: {
    width: '240px',
    minWidth: '240px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0 1.25rem',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  clusterName: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
  },
  clusterMeta: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    marginTop: '1px',
  },
  barCol: {
    flex: 1,
    position: 'relative',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    height: '28px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0.75rem',
    transition: 'all 0.2s',
    outline: 'none',
    minWidth: '60px',
  },
  barActive: {
    boxShadow: '0 0 0 2px white, 0 0 16px rgba(99, 102, 241, 0.4)',
    transform: 'scaleY(1.15)',
    zIndex: 2,
  },
  barText: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'white',
    whiteSpace: 'nowrap',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },
  xAxis: {
    display: 'flex',
    borderTop: '1px solid var(--border)',
    padding: '0.6rem 0',
    background: 'var(--bg-secondary)',
    borderBottomLeftRadius: '11px',
    borderBottomRightRadius: '11px',
  },
  xAxisSpacer: {
    width: '240px',
    minWidth: '240px',
  },
  xAxisTrack: {
    flex: 1,
    position: 'relative',
    height: '24px',
  },
  tick: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  emptyState: {
    padding: '3rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
};
