import re
from collections import Counter
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from models import Article, Cluster
import config

STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
    "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
    "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into",
    "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
    "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's",
    "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs",
    "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
    "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
    "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
    "yourselves", "says", "new", "will", "first", "two", "three", "also", "one", "us", "uk", "years"
}

class UnionFind:
    def __init__(self, elements):
        self.parent = {el: el for el in elements}
        self.size = {el: 1 for el in elements} # Track tree sizes

    def find(self, el):
        path = []
        while self.parent[el] != el:
            path.append(el)
            el = self.parent[el]
        for node in path:
            self.parent[node] = el
        return el

    def union(self, el1, el2):
        root1 = self.find(el1)
        root2 = self.find(el2)
        if root1 != root2:
            # Attach the smaller tree to the larger tree
            if self.size[root1] < self.size[root2]:
                root1, root2 = root2, root1
            self.parent[root2] = root1
            self.size[root1] += self.size[root2]

def get_keywords(text: str) -> set[str]:
    if not text:
        return set()
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    return {w for w in words if w not in STOP_WORDS}

def generate_cluster_label(articles: list[Article], art_keywords: dict) -> str:
    word_counter = Counter()
    for art in articles:
        # Re-use the already computed keyword sets to eliminate redundant tokenization
        word_counter.update(art_keywords.get(art.id, set()))

    common_words = [word for word, _ in word_counter.most_common(3)]
    if not common_words:
        return "General News"
    return " ".join(common_words).title()

def cluster_articles(db: Session):
    articles = db.query(Article).all()
    if not articles:
        return

    # Clear existing clusters and associations (No early commit: kept in single transaction)
    db.query(Cluster).delete()
    for art in articles:
        art.cluster_id = None

    # Calculate significant word sets once
    art_keywords = {}
    for art in articles:
        combined = f"{art.title} {art.summary or ''}"
        art_keywords[art.id] = get_keywords(combined)

    # Initialize Union-Find with elements
    uf = UnionFind([art.id for art in articles])

    # Pairwise comparison
    n = len(articles)
    for i in range(n):
        for j in range(i + 1, n):
            art1 = articles[i]
            art2 = articles[j]
            words1 = art_keywords[art1.id]
            words2 = art_keywords[art2.id]
            
            if not words1 or not words2:
                continue

            shared = words1.intersection(words2)
            if len(shared) >= config.MIN_OVERLAP_WORDS:
                min_len = min(len(words1), len(words2))
                if (len(shared) / min_len) >= config.OVERLAP_RATIO_THRESHOLD:
                    uf.union(art1.id, art2.id)

    # Group article IDs by root parent
    groups = {}
    for art in articles:
        root = uf.find(art.id)
        groups.setdefault(root, []).append(art)

    # Create new clusters and assign articles
    for group_articles in groups.values():
        # Handle string date vs. datetime objects safely to prevent timeline sorting bugs
        dates = []
        for art in group_articles:
            dt = art.published_at
            if isinstance(dt, str):
                try:
                    clean_dt = dt.replace('Z', '+00:00') if dt.endswith('Z') else dt
                    dt = datetime.fromisoformat(clean_dt)
                except Exception:
                    pass
            dates.append(dt)
        earliest = min(dates)
        latest = max(dates)
        
        cluster_id = uuid.uuid4()
        cluster = Cluster(
            id=cluster_id,
            label=generate_cluster_label(group_articles, art_keywords),
            article_count=len(group_articles),
            earliest_at=earliest,
            latest_at=latest
        )
        db.add(cluster)
        
        for art in group_articles:
            art.cluster_id = cluster_id

    db.commit()
