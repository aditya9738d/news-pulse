from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import config

# Create SQLAlchemy engine
engine = create_engine(config.DATABASE_URL, echo=False, pool_pre_ping=True)

# Create Session local class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Modern SQLAlchemy 2.0 DeclarativeBase
class Base(DeclarativeBase):
    pass

def get_db():
    """Dependency helper to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
