from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://mystorage_user:mystorage_password@db:5432/mystorage_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()