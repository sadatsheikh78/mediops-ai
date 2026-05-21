import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Default to SQLite local database file for development ease
# If DATABASE_URL environment variable is provided (e.g. on PostgreSQL deployment), use it instead.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mediops.db")

# Create SQL Alchemy Engine
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
