import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { query, queryOne } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

const CATEGORY_KEYWORDS = {
  Politics: ['election', 'senate', 'congress', 'vote', 'biden', 'trump', 'government', 'law', 'political', 'legislation', 'democrat', 'republican', 'parliament', 'minister', 'president', 'policy', 'governor'],
  Technology: ['ai', 'tech', 'software', 'startup', 'robot', 'cyber', 'data', 'cloud', 'digital', 'algorithm', 'machine learning', 'computing', 'app', 'silicon', 'innovation', 'agentic'],
  Economy: ['economy', 'market', 'stock', 'gdp', 'inflation', 'trade', 'bank', 'finance', 'tax', 'revenue', 'fund', 'invest', 'layoff', 'recession', 'monetary', 'fiscal', 'debt'],
  World: ['war', 'conflict', 'middle east', 'ukraine', 'russia', 'crimea', 'korea', 'congo', 'ebola', 'china', 'india', 'global', 'international', 'foreign', 'nation', 'country', 'displaced', 'refugee', 'treaty', 'diplomacy', 'territory'],
  Sports: ['sport', 'cup', 'match', 'league', 'championship', 'player', 'team', 'game', 'olympic', 'football', 'cricket', 'tennis', 'basketball', 'score', 'tournament', 'athlete'],
};

function inferCategory(label) {
  if (!label) return 'General';
  const lower = label.toLowerCase();
  let bestCategory = 'General';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  return bestCategory;
}

// ─── In-memory jobs tracking ────────────────────────────────────────
const jobs = new Map();
let activeJob = null;
let lastIngestCompletedAt = null;

// ─── GET /clusters ──────────────────────────────────────────────────
app.get('/clusters', async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT c.id, c.label, 
             count(a.id) AS article_count, 
             min(a.published_at) AS earliest_at, 
             max(a.published_at) AS latest_at,
             group_concat(DISTINCT a.source) AS sources
      FROM clusters c
      JOIN articles a ON a.cluster_id = c.id
      WHERE a.published_at >= datetime('now', '-3 days')
      GROUP BY c.id
      ORDER BY article_count DESC
    `);

    res.json({
      clusters: rows.map(r => {
        const sourcesList = r.sources ? Array.from(new Set(r.sources.split(','))) : [];
        const start = new Date(r.earliest_at);
        const end = new Date(r.latest_at);
        const activeDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

        return {
          id: r.id,
          label: r.label,
          category: inferCategory(r.label),
          articleCount: r.article_count,
          sourceCount: sourcesList.length,
          sources: sourcesList,
          activeDays,
          timeRange: {
            start: r.earliest_at,
            end: r.latest_at,
          }
        };
      })
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /clusters/:id ─────────────────────────────────────────────
app.get('/clusters/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const cluster = await queryOne('SELECT * FROM clusters WHERE id = ?', [id]);
    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' });
    }

    const articles = await query(`
      SELECT id, title, source, published_at, summary, url, body
      FROM articles
      WHERE cluster_id = ? AND published_at >= datetime('now', '-3 days')
      ORDER BY published_at DESC
    `, [id]);

    const sourcesList = Array.from(new Set(articles.map(a => a.source)));
    const start = articles.length ? new Date(articles[articles.length - 1].published_at) : new Date();
    const end = articles.length ? new Date(articles[0].published_at) : new Date();
    const activeDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    res.json({
      cluster: {
        id: cluster.id,
        label: cluster.label,
        category: inferCategory(cluster.label),
        articleCount: articles.length,
        sourceCount: sourcesList.length,
        activeDays,
        articles: articles
      }
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /timeline ──────────────────────────────────────────────────
app.get('/timeline', async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT c.id, c.label, 
             count(a.id) AS article_count, 
             min(a.published_at) AS earliest_at, 
             max(a.published_at) AS latest_at,
             group_concat(DISTINCT a.source) AS sources
      FROM clusters c
      JOIN articles a ON a.cluster_id = c.id
      WHERE a.published_at >= datetime('now', '-3 days')
      GROUP BY c.id
      ORDER BY article_count DESC
    `);

    const maxCount = rows.reduce((max, r) => Math.max(max, r.article_count || 0), 0);

    const timeline = rows.map(r => {
      const sourcesList = r.sources ? Array.from(new Set(r.sources.split(','))) : [];
      const start = new Date(r.earliest_at);
      const end = new Date(r.latest_at);
      const activeDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

      return {
        clusterId: r.id,
        label: r.label,
        category: inferCategory(r.label),
        start: r.earliest_at,
        end: r.latest_at,
        articleCount: r.article_count,
        sourceCount: sourcesList.length,
        activeDays,
        intensity: maxCount > 0 ? (r.article_count || 0) / maxCount : 0,
        sources: sourcesList,
      };
    });

    res.json({ timeline });
  } catch (err) {
    next(err);
  }
});

// ─── GET /sources ───────────────────────────────────────────────────
app.get('/sources', async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT source AS name, count(*) AS article_count
      FROM articles
      WHERE published_at >= datetime('now', '-3 days')
      GROUP BY source
      ORDER BY article_count DESC
    `);
    res.json({ sources: rows.map(r => ({ name: r.name, articleCount: r.article_count })) });
  } catch (err) {
    next(err);
  }
});

// ─── GET /stats ─────────────────────────────────────────────────────
app.get('/stats', async (req, res, next) => {
  try {
    const row = await queryOne(`
      SELECT count(*) AS total_articles, count(DISTINCT source) AS source_count
      FROM articles
      WHERE published_at >= datetime('now', '-3 days')
    `);
    let lastUpdatedVal = lastIngestCompletedAt ? lastIngestCompletedAt.toISOString() : null;
    if (!lastUpdatedVal) {
      const latestArticleRow = await queryOne(`
        SELECT max(published_at) AS latest_at FROM articles
      `);
      if (latestArticleRow?.latest_at) {
        lastUpdatedVal = new Date(latestArticleRow.latest_at).toISOString();
      }
    }

    res.json({
      totalArticles: row?.total_articles || 0,
      sourceCount: row?.source_count || 0,
      lastUpdated: lastUpdatedVal,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /ingest/trigger ───────────────────────────────────────────
app.post('/ingest/trigger', (req, res) => {
  if (activeJob && activeJob.status === 'running') {
    return res.status(429).json({ error: 'An ingestion pipeline is already running. Please wait.' });
  }

  const jobId = uuidv4();
  const job = {
    id: jobId,
    status: 'running',
    startedAt: new Date(),
    completedAt: null,
    error: null
  };
  jobs.set(jobId, job);
  activeJob = job;

  // Spawn Python pipeline
  const scraperDir = path.resolve(__dirname, '../../scraper');
  const process = spawn(config.pythonPath, ['main.py'], { cwd: scraperDir });

  let stderr = '';
  process.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  process.on('error', (err) => {
    job.completedAt = new Date();
    job.status = 'failed';
    job.error = err.message;
    console.error(`Pipeline job ${jobId} failed to spawn: ${err.message}`);
  });

  process.on('close', (code) => {
    job.completedAt = new Date();
    if (code === 0) {
      job.status = 'completed';
      lastIngestCompletedAt = new Date();
    } else {
      job.status = 'failed';
      job.error = stderr || `Exit code ${code}`;
      console.error(`Pipeline job ${jobId} failed: ${job.error}`);
    }
  });

  res.json({ jobId, status: 'running' });
});

// ─── GET /ingest/status/:jobId ──────────────────────────────────────
app.get('/ingest/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// ─── Global Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
