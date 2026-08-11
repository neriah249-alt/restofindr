from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Restaurant, Favorite
from schemas import RestaurantResponse
from auth import get_current_user

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

@router.post("/{restaurant_id}")
def add_to_favorites(
    restaurant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ajouter un restaurant aux favoris"""
    
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant non trouvé"
        )
    
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()
    
    if existing:
        return {"message": "Déjà dans les favoris", "is_favorite": True}
    
    favorite = Favorite(
        user_id=current_user.id,
        restaurant_id=restaurant_id
    )
    db.add(favorite)
    db.commit()
    
    return {"message": "Ajouté aux favoris", "is_favorite": True}

@router.delete("/{restaurant_id}")
def remove_from_favorites(
    restaurant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retirer un restaurant des favoris"""
    
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant non trouvé dans les favoris"
        )
    
    db.delete(favorite)
    db.commit()
    
    return {"message": "Retiré des favoris", "is_favorite": False}

@router.get("/", response_model=List[RestaurantResponse])
def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupérer tous les favoris de l'utilisateur"""
    
    favorites = db.query(Restaurant).join(
        Favorite, Favorite.restaurant_id == Restaurant.id
    ).filter(
        Favorite.user_id == current_user.id
    ).all()
    
    return favorites

@router.get("/check/{restaurant_id}")
def check_favorite(
    restaurant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vérifier si un restaurant est dans les favoris"""
    
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()
    
    return {"is_favorite": favorite is not None}