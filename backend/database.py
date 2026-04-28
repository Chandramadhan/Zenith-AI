import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Use Environment Variable or fallback to local SQLite
raw_url = os.getenv("DATABASE_URL")

if not raw_url or raw_url.strip() == "":
    print("DEBUG: DATABASE_URL is empty, using SQLite.")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./zenith.db"
else:
    # Clean the URL (remove quotes, whitespace, and fix prefix)
    SQLALCHEMY_DATABASE_URL = raw_url.strip().strip("'").strip('"')
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Masked logging for debugging
    try:
        parts = SQLALCHEMY_DATABASE_URL.split("@")
        if len(parts) > 1:
            creds = parts[0].split("://")[1].split(":")
            user = creds[0]
            host = parts[1].split(":")[0]
            print(f"DEBUG: Connecting to host: {host} with user: {user}")
    except:
        print("DEBUG: Could not parse URL for masked logging.")

# Final validation - if it doesn't start with a valid scheme, fallback
if not any(SQLALCHEMY_DATABASE_URL.startswith(s) for s in ["postgresql", "sqlite", "postgres"]):
    print(f"DEBUG: Invalid scheme in DATABASE_URL, using SQLite. URL starts with: {SQLALCHEMY_DATABASE_URL[:10]}...")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./zenith.db"

# SQLite requires 'check_same_thread', PostgreSQL does not
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Use pool_pre_ping for better connection handling on Render
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
