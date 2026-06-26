import os
from dotenv import load_dotenv

# Load environment variables from .env and .env.local files, overriding inherited values
load_dotenv(override=True)
if os.path.exists('.env.local'):
    load_dotenv('.env.local', override=True)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables.")

# RSS Feeds to scrape
RSS_FEEDS = {
    "Reuters": "https://feeds.reuters.com/reuters/topNews",
    "BBC News": "https://feeds.bbci.co.uk/news/rss.xml",
    "CNN": "http://rss.cnn.com/rss/edition.rss",
    "Al Jazeera": "https://www.aljazeera.com/xml/rss/all.xml",
    "TechCrunch": "https://techcrunch.com/feed/"
}

# Clustering Configurations
MIN_OVERLAP_WORDS = 4
OVERLAP_RATIO_THRESHOLD = 0.3
