import hashlib
from datetime import datetime, timezone
import feedparser
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from models import Article
import config
from newspaper import Article as NewsArticle
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_url_hash(url: str) -> str:
    return hashlib.sha256(url.encode("utf-8")).hexdigest()

def clean_html(html_content: str) -> str:
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, "html.parser")
    return soup.get_text(separator=" ").strip()

def parse_published_date(entry) -> datetime:
    for field in ["published_parsed", "updated_parsed"]:
        parsed = getattr(entry, field, None)
        if parsed:
            return datetime(*parsed[:6], tzinfo=timezone.utc)
    return datetime.now(timezone.utc)

def fetch_feed_articles(source: str, feed_url: str) -> list[dict]:
    articles = []
    try:
        feed = feedparser.parse(feed_url)
        for entry in feed.entries:
            url = getattr(entry, "link", None)
            title = getattr(entry, "title", None)
            if not url or not title:
                continue

            summary = clean_html(getattr(entry, "summary", "") or getattr(entry, "description", ""))
            pub_date = parse_published_date(entry)

            articles.append({
                "url": url,
                "url_hash": get_url_hash(url),
                "title": clean_html(title),
                "summary": summary,
                "source": source,
                "published_at": pub_date
            })
    except Exception as e:
        print(f"Error fetching feed {source} ({feed_url}): {e}")
    return articles

def fetch_single_article_body(url: str, timeout: int = 7) -> tuple[str, str | None]:
    try:
        article = NewsArticle(url, keep_article_html=False, request_timeout=timeout)
        article.download()
        article.parse()
        text = article.text.strip()
        if text and len(text) > 50:
            return url, text
        return url, None
    except Exception as e:
        print(f"[WARN] Body extraction failed for {url}: {str(e)[:40]}")
        return url, None

def scrape_and_save_articles(db: Session) -> int:
    all_new_articles = []
    seen_hashes = set()
    
    # 1. Fetch feeds and filter duplicates
    for source, url in config.RSS_FEEDS.items():
        feed_articles = fetch_feed_articles(source, url)
        for art_data in feed_articles:
            h = art_data["url_hash"]
            if h in seen_hashes:
                continue

            # Deduplication check against DB
            exists = db.query(Article).filter(Article.url_hash == h).first()
            if not exists:
                all_new_articles.append(art_data)
                seen_hashes.add(h)
                
    if not all_new_articles:
        return 0

    # 2. Parallel fetching of article bodies
    print(f"Spawning 8 parallel workers to fetch body texts for {len(all_new_articles)} new articles...")
    body_map = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        future_to_url = {
            executor.submit(fetch_single_article_body, item['url']): item['url'] 
            for item in all_new_articles
        }
        for future in as_completed(future_to_url):
            url, body_text = future.result()
            if body_text:
                body_map[url] = body_text

    # 3. Create models and save to database
    for item in all_new_articles: 
        body_text = body_map.get(item['url'])
        article = Article(
            url=item['url'],
            url_hash=item['url_hash'],
            title=item['title'],
            summary=item['summary'],
            body=body_text or item['summary'],
            source=item['source'],
            published_at=item['published_at']
        )
        db.add(article)

    db.commit()
    return len(all_new_articles)
