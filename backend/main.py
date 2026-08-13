from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
import time

load_dotenv()

from database import engine, Base
from routes import auth, restaurants, restaurateur, favorites, search

# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Fonction pour initialiser la base de données avec retry
def init_database(max_retries=3, delay=3):
    """Tente de créer les tables avec des tentatives"""
    for attempt in range(max_retries):
        try:
            logger.info(f"🔄 Tentative {attempt + 1}/{max_retries} de connexion à Supabase...")
            Base.metadata.create_all(bind=engine)
            logger.info("✅ Tables créées/vérifiées avec succès !")
            return True
        except Exception as e:
            logger.warning(f"⚠️ Erreur: {e}")
            if attempt < max_retries - 1:
                logger.info(f"⏳ Nouvelle tentative dans {delay} secondes...")
                time.sleep(delay)
            else:
                logger.error("❌ Échec de connexion à la base de données après plusieurs tentatives")
                logger.info("⚠️ L'API démarre quand même, mais certaines fonctionnalités seront limitées")
                return False
    return False

# Initialisation de la base de données
init_database()

app = FastAPI(
    title="RestoGo Bénin API",
    description="API pour la plateforme de découverte de restaurants",
    version="1.0.0"
)

# ============================================
# 🔧 CORS - CORRECT (autorise tout le monde)
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # ← TRÈS IMPORTANT
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# 📍 ROUTES
# ============================================
app.include_router(auth.router)
app.include_router(restaurants.router)
app.include_router(restaurateur.router)
app.include_router(favorites.router)
app.include_router(search.router)

# ============================================
# 🏠 ENDPOINTS DE BASE
# ============================================
@app.get("/")
def root():
    return {"message": "RestoGo Bénin API", "status": "running"}

@app.get("/health")
def health_check():
    """Vérifie l'état de l'API et de la base de données"""
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "healthy", "database": "disconnected", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)