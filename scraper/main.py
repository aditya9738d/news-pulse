import sys
from db import engine, SessionLocal, Base
import models
from scraper import scrape_and_save_articles
from clusterer import cluster_articles

def run_pipeline():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Ingesting news from RSS feeds...")
        new_count = scrape_and_save_articles(db)
        print(f"Scraped {new_count} new articles.")

        print("Clustering articles into topics...")
        cluster_articles(db)
        print("Pipeline execution completed successfully.")
    except Exception as e:
        print(f"Pipeline error: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_pipeline()
