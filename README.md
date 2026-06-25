# News Pulse — Topic-Clustered News Timeline

News Pulse is a full-stack system that pulls live articles from news RSS feeds, automatically groups related articles into topic clusters, and displays them as a visual timeline.

---

## 🚀 Deliverables & Live Links
- **Live Frontend URL:** `https://pulse.adityagaur.me`
- **Live Backend API URL:** `https://pulse.adityagaur.me/api`
- **Video Walkthrough (Required):** `[https://youtu.be/xOqJpD9j7wM]`

---

## Project Structure

- [`/scraper`](file:///c:/Users/adity/Documents/Xpo_Tech/scraper) — Python pipeline for RSS ingestion, page-scraping, and topic clustering.
- [`/backend`](file:///c:/Users/adity/Documents/Xpo_Tech/backend) — Express.js REST API serving clusters, articles, and timeline data.
- [`/frontend`](file:///c:/Users/adity/Documents/Xpo_Tech/frontend) — Next.js / React dashboard displaying the interactive timeline and cluster explorer.

---

## Key Architectural Highlights

To ensure high reliability, fast ingestion, and a premium user experience, the system implements several production-grade upgrades:

1. **Database Layer (SQLite)**: Switched to a zero-configuration local **SQLite** database (`newspulse.db` at the project root) for absolute simplicity of local setup, while utilizing SQLAlchemy ORM to remain fully compatible with PostgreSQL.
2. **Multi-Threaded Ingestion Engine**: Spawns a Python `ThreadPoolExecutor` with **8 concurrent workers** using `newspaper3k` to fetch full web page article bodies in parallel. If a site blocks scraping or times out, the pipeline gracefully falls back to the original RSS summary without crashing.
3. **Ingestion Mutex Lock**: The backend Express API implements an in-memory lock (`activeJob` check) on `POST /ingest/trigger` to prevent overlapping parallel scraper runs from conflicting and causing database write locks.
4. **Collision-Free Lane Packing**: The React timeline component dynamically calculates relative percentages to stack overlapping topic clusters into separate vertical lanes, completely preventing visual clutter or overlaps.
5. **Stale Feed Filtering**: Restricts timeline and cluster queries to the **last 3 days** (dynamically adjustable) to filter out old feed items, keeping the timeline layout highly relevant and readable.
6. **Full Article Body Drawer**: The inline article details panel includes a **"View More"** expanding button to reveal the scraped article text formatted nicely with source external links.
7. **Responsive Mobile Sizing**: Fully responsive layout featuring a hamburger drawer menu for mobile, a 2-column stacked clusters grid, and an adjustable, scrollable mobile Gantt chart with fixed height constraints and vertical scrollable rows.

---

## Part 1: Python Scraper & Topic Clustering

### Topic Grouping Approach
- **Algorithm**: Keyword-Overlap Grouping (Option A) with **Union-Find Transitive Grouping**.
- **Process**: 
  1. Tokenizes the headline and summary of each article, lowercase them, and strip standard common stop words (e.g., "the", "and", "under").
  2. Runs a pairwise similarity check. If two articles share a set threshold of keywords, they are marked as connected.
  3. Uses a Union-Find data structure to group connected articles together into single cluster sets.
  4. Auto-generates labels by picking the top 3 most frequent words shared across the cluster.
- **Why we chose this**: It is lightweight, fast, fully deterministic, and has zero heavy external ML dependencies (like scikit-learn). This makes the system portable, easy to set up, and reliable to run in lightweight EC2 or serverless environments.

### Parameter Thresholds Selection
- **Minimum Overlapping Words (`MIN_OVERLAP_WORDS`)**: Set to `4`. This ensures that random, coincidental word matches do not group unrelated articles.
- **Overlap Ratio Threshold (`OVERLAP_RATIO_THRESHOLD`)**: Set to `0.3` (30%). Calculated as `shared_words / min(length_1, length_2)`. This normalizes word count comparison for shorter titles, ensuring that a match requires a high density of overlap relative to the shorter text length.

### Limitations
- **Lack of Semantic Understanding**: Since it is purely word-based, synonyms or paraphrases (e.g., "Equity Market Plunges" vs. "Stock Shares Drop") will share very few words and fail to cluster, while articles sharing generic words (e.g. "highway", "police", "arrest" from unrelated local accidents) may get false-clustered.
- **No Stemming**: Words like "vote", "voted", and "voting" are treated as completely different terms, reducing overlap detection for related stories.

### RSS Feeds Used
We parse from 5 major public RSS feeds to ensure high feed format variance coverage:
- BBC News (`https://feeds.bbci.co.uk/news/rss.xml`)
- CNN (`http://rss.cnn.com/rss/edition.rss`)
- Al Jazeera (`https://www.aljazeera.com/xml/rss/all.xml`)
- TechCrunch (`https://techcrunch.com/feed/`)
- Reuters (`https://feeds.reuters.com/reuters/topNews`)

---

## Part 2: Node.js Backend API

The Express server manages the SQLite connection, job logs, and exposes the REST API endpoints required by the frontend dashboard:

| Endpoint | Method | Purpose | Response Format |
|---|---|---|---|
| `GET /api/clusters` | GET | List of topic clusters with label, article count, and earliest/latest dates. | `[{ "id", "label", "articleCount", "earliestAt", "latestAt" }]` |
| `GET /api/clusters/:id` | GET | Full details for a single cluster, including its member articles sorted chronologically. | `{ "id", "label", "articles": [{ "id", "title", "url", "source", "publishedAt" }] }` |
| `GET /api/timeline` | GET | Timeline data containing clusters formatted with start/end millisecond timestamps, category, and article count. | `[{ "clusterId", "label", "start", "end", "articleCount", "category" }]` |
| `POST /api/ingest/trigger` | POST | Triggers the python pipeline asynchronously as a subprocess. Returns a unique job ID. | `{ "jobId", "status": "running" }` |
| `GET /api/ingest/status/:jobId` | GET | Status polling endpoint for checking if the triggered job is running, completed, or failed. | `{ "id", "status": "running"|"completed"|"failed", "error" }` |

---

## Part 3: Next.js / React Frontend Timeline

The frontend is a premium single-page Next.js dashboard featuring:

1. **Interactive Gantt Timeline**: Plots clusters on a horizontal time axis using a custom SVG container with responsive packing. Each cluster spans from its earliest to latest article, representing its active chronological lifecycle window.
2. **Filters & Category Pills**: Users can toggle between categories (Politics, Technology, Economy, etc.) and filter clusters based on specific news sources (BBC, Al Jazeera, etc.) from the sidebar.
3. **Cluster Detail Panel**: Clicking on any block in the timeline or grid card slides open an inline details drawer containing the articles under that topic, sorted chronologically with links to original pages and "View More" summaries.
4. **Ingestion Trigger Control**: A "Refresh News" button triggers the pipeline, displays a spinning loader, polls the status, and updates the timeline reactively when done.

---

## Getting Started (Local Development)

### Prerequisites
- Node.js (v20+ or v24 LTS)
- Python (v3.12 or v3.14)

### 1. Scraper Configuration
```bash
cd scraper
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```
Copy `.env.example` to `.env` and set `DATABASE_URL` if needed (defaults to SQLite: `sqlite:///../newspulse.db`). 

To run the ingestion pipeline manually once:
```bash
python main.py
```

### 2. Backend API Setup
```bash
cd ../backend
npm install
```
Copy `.env.example` to `.env` (defaults to local SQLite `DATABASE_URL=../newspulse.db`).
Start the development server:
```bash
npm run dev
```

### 3. Frontend Next.js Setup
```bash
cd ../frontend
npm install
```
Copy `.env.example` to `.env.local` pointing to the local API: `NEXT_PUBLIC_API_URL=http://localhost:4001/api`.
Start the Next.js dev server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Production Deployment (AWS EC2)

The application is deployed on an Ubuntu EC2 instance using Nginx as a reverse proxy, PM2 for process management, and SQLite.

### PM2 Process Status
The Express backend is managed using PM2:
```bash
pm2 start src/index.js --name news-pulse-api
```
The scraper runs on a cron job or is triggered on-demand via the Express process spawn.
