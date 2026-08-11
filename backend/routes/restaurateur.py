from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy import func
import os
import shutil
import uuid

from database import get_db
from models import User, Restaurant, Review, Favorite, RestaurantPhoto
from schemas import RestaurantCreate, RestaurantResponse, PhotoResponse
from auth import get_current_user

router = APIRouter(prefix="/api/restaurateur", tags=["restaurateur"])
router = APIRouter(prefix="/api/restaurateur", tags=["restaurateur"])

# ============================================
# DEVENIR RESTAURATEUR
# ============================================

@router.post("/become")
def become_restaurateur(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Devenir restaurateur"""
    if current_user.is_restaurateur:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous êtes déjà restaurateur"
        )
    
    current_user.is_restaurateur = True
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Vous êtes maintenant restaurateur !"}

# ============================================
# AJOUTER UN RESTAURANT
# ============================================

@router.post("/restaurants", response_model=RestaurantResponse)
def create_restaurant(
    restaurant: RestaurantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ajouter un nouveau restaurant"""
    
    if not current_user.is_restaurateur:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez être restaurateur pour ajouter un restaurant"
        )
    
    if current_user.restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous avez déjà un restaurant"
        )
    
    db_restaurant = Restaurant(
        owner_id=current_user.id,
        name=restaurant.name,
        address=restaurant.address,
        latitude=restaurant.latitude,
        longitude=restaurant.longitude,
        cuisine_type=restaurant.cuisine_type,
        price_range=restaurant.price_range,
        image_url=restaurant.image_url,
        description=restaurant.description,
        phone=restaurant.phone,
        whatsapp=restaurant.whatsapp,
        opening_hours=restaurant.opening_hours,
        services=restaurant.services,
        ambiance=restaurant.ambiance
    )
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    
    current_user.restaurant_id = db_restaurant.id
    db.commit()
    
    return db_restaurant

# ============================================
# MODIFIER UN RESTAURANT
# ============================================

@router.put("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
def update_restaurant(
    restaurant_id: int,
    restaurant_data: RestaurantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Modifier un restaurant"""
    
    db_restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    
    if not db_restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant non trouvé ou vous n'êtes pas le propriétaire"
        )
    
    for key, value in restaurant_data.dict().items():
        setattr(db_restaurant, key, value)
    
    db.commit()
    db.refresh(db_restaurant)
    
    return db_restaurant

# ============================================
# SUPPRIMER UN RESTAURANT
# ============================================

@router.delete("/restaurants/{restaurant_id}")
def delete_restaurant(
    restaurant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Supprimer un restaurant"""
    
    db_restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    
    if not db_restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant non trouvé ou vous n'êtes pas le propriétaire"
        )
    
    db.delete(db_restaurant)
    current_user.restaurant_id = None
    db.commit()
    
    return {"message": "Restaurant supprimé avec succès"}

# ============================================
# MES RESTAURANTS
# ============================================

@router.get("/restaurants", response_model=List[RestaurantResponse])
def get_my_restaurants(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupérer mes restaurants"""
    
    if not current_user.is_restaurateur:
        return []
    
    restaurants = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).all()
    
    return restaurants

# ============================================
# AJOUTER UNE PHOTO
# ============================================

@router.post("/restaurants/{restaurant_id}/photos", response_model=PhotoResponse)
async def add_photo(
    restaurant_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ajouter une photo au restaurant"""
    
    db_restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    
    if not db_restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant non trouvé"
        )
    
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/restaurants/{unique_filename}"
    
    os.makedirs("uploads/restaurants", exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    photo = RestaurantPhoto(
        restaurant_id=restaurant_id,
        image_url=f"/uploads/restaurants/{unique_filename}"
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    
    return photo

# ============================================
# SUPPRIMER UNE PHOTO
# ============================================

@router.delete("/photos/{photo_id}")
def delete_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Supprimer une photo"""
    
    photo = db.query(RestaurantPhoto).filter(
        RestaurantPhoto.id == photo_id
    ).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo non trouvée"
        )
    
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == photo.restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas le propriétaire"
        )
    
    db.delete(photo)
    db.commit()
    
    return {"message": "Photo supprimée avec succès"}

# ============================================
# STATISTIQUES
# ============================================

@router.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtenir les statistiques du restaurateur"""
    
    if not current_user.restaurant_id:
        return {
            "has_restaurant": False,
            "message": "Vous n'avez pas encore de restaurant"
        }
    
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == current_user.restaurant_id
    ).first()
    
    review_count = db.query(Review).filter(
        Review.restaurant_id == restaurant.id
    ).count()
    
    return {
        "has_restaurant": True,
        "restaurant_id": restaurant.id,
        "restaurant_name": restaurant.name,
        "rating": restaurant.rating,
        "review_count": review_count,
        "created_at": restaurant.created_at
    }

@router.get("/status")
def get_restaurateur_status(
    current_user: User = Depends(get_current_user)
):
    """Vérifier le statut de restaurateur"""
    return {
        "is_restaurateur": current_user.is_restaurateur,
        "restaurant_id": current_user.restaurant_id,
        "email": current_user.email,
        "name": current_user.name
    }

from datetime import datetime, timedelta
from sqlalchemy import func

# ============================================
# TABLEAU DE BORD - STATISTIQUES
# ============================================

@router.get("/dashboard/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtenir les statistiques complètes du tableau de bord"""
    
    print(f"📊 Dashboard stats pour: {current_user.email}")
    print(f"📊 is_restaurateur: {current_user.is_restaurateur}")
    print(f"📊 restaurant_id: {current_user.restaurant_id}")
    
    if not current_user.is_restaurateur:
        return {
            "has_restaurant": False,
            "message": "Vous n'êtes pas restaurateur",
            "user_status": {
                "is_restaurateur": False,
                "email": current_user.email,
                "name": current_user.name
            }
        }
    
    if not current_user.restaurant_id:
        return {
            "has_restaurant": False,
            "message": "Vous n'avez pas encore de restaurant",
            "user_status": {
                "is_restaurateur": True,
                "email": current_user.email,
                "name": current_user.name
            }
        }
    
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == current_user.restaurant_id
    ).first()
    
    if not restaurant:
        return {
            "has_restaurant": False,
            "message": "Restaurant non trouvé"
        }
    
    # Statistiques de base
    total_reviews = db.query(Review).filter(
        Review.restaurant_id == restaurant.id
    ).count()
    
    # Moyenne des notes
    avg_rating = db.query(func.avg(Review.rating)).filter(
        Review.restaurant_id == restaurant.id
    ).scalar() or 0
    
    # Nombre de favoris
    total_favorites = db.query(Favorite).filter(
        Favorite.restaurant_id == restaurant.id
    ).count()
    
    # Répartition des notes
    rating_distribution = db.query(
        Review.rating,
        func.count(Review.id)
    ).filter(
        Review.restaurant_id == restaurant.id
    ).group_by(Review.rating).all()
    
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for rating, count in rating_distribution:
        distribution[rating] = count
    
    # Derniers avis
    latest_reviews = db.query(Review).filter(
        Review.restaurant_id == restaurant.id
    ).order_by(Review.created_at.desc()).limit(5).all()
    
    reviews_data = []
    for r in latest_reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        reviews_data.append({
            "id": r.id,
            "user_name": user.name if user else "Utilisateur",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    
    return {
        "has_restaurant": True,
        "restaurant": {
            "id": restaurant.id,
            "name": restaurant.name,
            "address": restaurant.address,
            "image_url": restaurant.image_url,
            "rating": restaurant.rating,
            "price_range": restaurant.price_range
        },
        "stats": {
            "total_reviews": total_reviews,
            "avg_rating": round(avg_rating, 1),
            "total_favorites": total_favorites,
            "rating_distribution": distribution
        },
        "recent_reviews": reviews_data
    }

@router.get("/dashboard/activity")
def get_dashboard_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtenir l'activité récente du restaurant"""
    
    if not current_user.restaurant_id:
        return {"activities": []}
    
    now = datetime.utcnow()
    last_7_days = now - timedelta(days=7)
    
    activities = []
    
    # Nouveaux avis
    new_reviews = db.query(Review).filter(
        Review.restaurant_id == current_user.restaurant_id,
        Review.created_at >= last_7_days
    ).order_by(Review.created_at.desc()).limit(10).all()
    
    for r in new_reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        activities.append({
            "type": "review",
            "message": f"📝 {user.name if user else 'Un utilisateur'} a laissé un avis de {r.rating} étoiles",
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    
    # Nouveaux favoris
    new_favorites = db.query(Favorite).filter(
        Favorite.restaurant_id == current_user.restaurant_id,
        Favorite.created_at >= last_7_days
    ).order_by(Favorite.created_at.desc()).limit(10).all()
    
    for f in new_favorites:
        user = db.query(User).filter(User.id == f.user_id).first()
        activities.append({
            "type": "favorite",
            "message": f"❤️ {user.name if user else 'Un utilisateur'} a ajouté votre restaurant aux favoris",
            "created_at": f.created_at.isoformat() if f.created_at else None
        })
    
    activities.sort(key=lambda x: x["created_at"] or "", reverse=True)
    
    return {"activities": activities[:20]}

# ============================================
# PHOTOS DES RESTAURANTS
# ============================================

@router.post("/restaurants/{restaurant_id}/photos")
async def upload_photo(
    restaurant_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ajouter une photo à un restaurant"""
    
    # Vérifier que le restaurant appartient à l'utilisateur
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    
    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant non trouvé ou vous n'êtes pas le propriétaire"
        )
    
    # Vérifier le type de fichier
    allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Type de fichier non autorisé. Utilisez JPG, PNG, WEBP ou GIF."
        )
    
    # Créer un nom unique pour le fichier
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/restaurants/{unique_filename}"
    
    # Sauvegarder le fichier
    os.makedirs("uploads/restaurants", exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Créer l'entrée dans la base de données
    photo = RestaurantPhoto(
        restaurant_id=restaurant_id,
        image_url=f"/uploads/restaurants/{unique_filename}"
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    
    return {
        "id": photo.id,
        "image_url": photo.image_url,
        "created_at": photo.created_at,
        "message": "Photo ajoutée avec succès"
    }

@router.delete("/photos/{photo_id}")
def delete_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Supprimer une photo"""
    
    photo = db.query(RestaurantPhoto).filter(
        RestaurantPhoto.id == photo_id
    ).first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo non trouvée")
    
    # Vérifier que le restaurant appartient à l'utilisateur
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == photo.restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    
    if not restaurant:
        raise HTTPException(
            status_code=403,
            detail="Vous n'êtes pas le propriétaire de ce restaurant"
        )
    
    # Supprimer le fichier
    file_path = photo.image_url.lstrip('/')
    if os.path.exists(file_path):
        os.remove(file_path)
    
    db.delete(photo)
    db.commit()
    
    return {"message": "Photo supprimée avec succès"}

@router.get("/restaurants/{restaurant_id}/photos")
def get_restaurant_photos(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    """Récupérer toutes les photos d'un restaurant"""
    
    photos = db.query(RestaurantPhoto).filter(
        RestaurantPhoto.restaurant_id == restaurant_id
    ).order_by(RestaurantPhoto.created_at.desc()).all()
    
    return photos