from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Lire l'URL de la base de données depuis .env
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:MOT_DE_PASSE@localhost:5432/restogo")

# Créer le moteur SQLAlchemy
engine = create_engine(DATABASE_URL)

# Créer une session locale
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base pour les modèles
Base = declarative_base()

# Dépendance pour obtenir la base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()