from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from database import engine, Base
from routes import auth, restaurants, restaurateur, favorites, search

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RestoGo Bénin API",
    description="API pour la plateforme de découverte de restaurants",
    version="1.0.0"
)

# CORS pour la production
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", ""),
    "https://restogo-benin.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router)
app.include_router(restaurants.router)
app.include_router(restaurateur.router)
app.include_router(favorites.router)
app.include_router(search.router)

@app.get("/")
def root():
    return {"message": "RestoGo Bénin API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)