from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import os
from dotenv import load_dotenv

from database import get_db
from models import User
from schemas import UserCreate, UserLogin, UserResponse, Token, ForgotPassword, ResetPassword
from auth import (
    authenticate_user, 
    create_access_token, 
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user
)
from email_service import send_reset_password_email

load_dotenv()
router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Vérifier si l'utilisateur existe déjà
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà utilisé"
        )
    
    # Créer le nouvel utilisateur
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        is_restaurateur=False  # Ajouté pour correspondre au modèle
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(
    user: UserLogin, 
    db: Session = Depends(get_db)
):
    # Authentifier l'utilisateur
    db_user = authenticate_user(db, user.email, user.password)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # ✅ DURÉES PROLONGÉES
    if user.remember_me:
        # 1 AN si "Se souvenir de moi" est coché
        access_token_expires = timedelta(days=365)
        print(f"🔑 Token valable 365 jours pour {user.email}")
    else:
        # 7 JOURS par défaut (au lieu de 30 minutes)
        access_token_expires = timedelta(days=7)
        print(f"🔑 Token valable 7 jours pour {user.email}")
    
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.post("/forgot-password")
def forgot_password(
    data: ForgotPassword, 
    db: Session = Depends(get_db)
):
    """Demander un lien de réinitialisation de mot de passe"""
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return {"message": "Si cet email existe, un lien de réinitialisation a été envoyé"}
    
    # Générer un token de réinitialisation
    reset_token = secrets.token_urlsafe(32)
    
    # Sauvegarder le token dans la base de données
    user.reset_token = reset_token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=24)
    db.commit()
    
    # Créer le lien de réinitialisation
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    reset_link = f"{frontend_url}/reset-password/{reset_token}"
    
    print(f"🔗 Lien de réinitialisation: {reset_link}")
    
    # Envoyer l'email
    email_sent = send_reset_password_email(
        to_email=user.email,
        reset_link=reset_link,
        name=user.name
    )
    
    if email_sent:
        return {
            "message": "Un lien de réinitialisation a été envoyé à votre email",
            "reset_link": reset_link
        }
    else:
        return {
            "message": "Un lien de réinitialisation a été envoyé à votre email",
            "reset_link": reset_link,
            "warning": "Email non envoyé (configuration manquante)"
        }

@router.post("/reset-password")
def reset_password(
    data: ResetPassword,
    db: Session = Depends(get_db)
):
    """Réinitialiser le mot de passe avec un token"""
    user = db.query(User).filter(
        User.reset_token == data.token,
        User.reset_token_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lien invalide ou expiré"
        )
    
    user.password_hash = get_password_hash(data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    return {"message": "Mot de passe réinitialisé avec succès"}

# ============================================
# ✅ ROUTE GOOGLE - VERSION CORRIGÉE
# ============================================
@router.post("/google")
def google_login(data: dict, db: Session = Depends(get_db)):
    """Connexion avec Google (Firebase)"""
    print("🔵 === DEBUT google_login ===")
    print(f"🔵 Données reçues: {data}")
    try:
        email = data.get("email")
        name = data.get("name", email)
        firebase_uid = data.get("firebase_uid")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email requis"
            )
        if not firebase_uid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="firebase_uid requis"
            )

        user = db.query(User).filter(User.email == email).first()

        if not user:
            user = User(
                name=name,
                email=email,
                password_hash=get_password_hash(firebase_uid[:72]),
                is_restaurateur=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # ✅ 365 JOURS pour Google
        access_token_expires = timedelta(days=365)
        print(f"🔑 Token Google valable 365 jours pour {user.email}")
        
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )

        return {"access_token": access_token, "token_type": "bearer"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERREUR dans google_login: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )