from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Charger les variables du fichier .env en local
load_dotenv()

# Récupérer DATABASE_URL depuis l'environnement
DATABASE_URL = os.getenv("DATABASE_URL")

# Vérification obligatoire
if not DATABASE_URL:
    raise RuntimeError(
        "❌ DATABASE_URL n'est pas définie. "
        "Ajoute-la dans Render > Environment Variables."
    )

# Afficher uniquement l'hôte pour faciliter le diagnostic
# Le mot de passe n'est jamais affiché
try:
    db_host = DATABASE_URL.split("@")[-1].split("/")[0]
    print(f"🔗 DATABASE HOST: {db_host}")
except Exception:
    print("⚠️ Impossible de lire l'hôte de DATABASE_URL")

# Créer le moteur SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

# Créer une session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base pour les modèles
Base = declarative_base()


# Dépendance pour obtenir une session de base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()