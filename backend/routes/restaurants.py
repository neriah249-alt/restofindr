from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from math import radians, sin, cos, sqrt, asin
from datetime import datetime

from database import get_db
from models import Restaurant, Review, User
from schemas import RestaurantResponse, ReviewCreate, ReviewResponse, UserResponse
from auth import get_current_user

router = APIRouter(prefix="/api/restaurants", tags=["restaurants"])

# ============================================
# ROUTES SPÉCIFIQUES (AVANT la route générique)
# ============================================

@router.get("/search", response_model=List[RestaurantResponse])
def search_restaurants(
    q: str = Query(..., min_length=1),
    city: Optional[str] = None,
    cuisine: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant).filter(
        Restaurant.name.ilike(f"%{q}%") |
        Restaurant.cuisine_type.ilike(f"%{q}%") |
        Restaurant.description.ilike(f"%{q}%") |
        Restaurant.address.ilike(f"%{q}%")
    )
    if city:
        query = query.filter(Restaurant.address.ilike(f"%{city}%"))
    if cuisine:
        query = query.filter(Restaurant.cuisine_type.ilike(f"%{cuisine}%"))
    restaurants = query.limit(50).all()
    return restaurants

@router.get("/featured", response_model=List[RestaurantResponse])
def get_featured_restaurants(
    limit: int = 6,
    db: Session = Depends(get_db)
):
    restaurants = db.query(Restaurant).order_by(
        Restaurant.rating.desc()
    ).limit(limit).all()
    return restaurants

@router.get("/suggestions")
def get_suggestions(
    q: str = Query(..., min_length=1),
    limit: int = 10,
    db: Session = Depends(get_db)
):
    suggestions = db.query(Restaurant).filter(
        Restaurant.name.ilike(f"%{q}%")
    ).limit(limit).all()
    
    result = []
    for r in suggestions:
        result.append({
            "id": r.id,
            "name": r.name,
            "cuisine": r.cuisine_type,
            "address": r.address
        })
    
    return result

@router.get("/nearby")
def get_nearby_restaurants(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = 10,
    db: Session = Depends(get_db)
):
    restaurants = db.query(Restaurant).all()
    
    nearby = []
    for r in restaurants:
        if r.latitude is None or r.longitude is None:
            continue
        distance = calculate_distance(lat, lng, r.latitude, r.longitude)
        if distance <= radius:
            nearby.append({
                "restaurant": r,
                "distance": round(distance, 1)
            })
    
    nearby.sort(key=lambda x: x["distance"])
    return nearby

# ============================================
# ROUTE GÉNÉRIQUE (APRÈS les routes spécifiques)
# ============================================

@router.get("/", response_model=List[RestaurantResponse])
def get_restaurants(
    skip: int = 0,
    limit: int = 100,
    city: Optional[str] = None,
    cuisine: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant)
    if city:
        query = query.filter(Restaurant.address.ilike(f"%{city}%"))
    if cuisine:
        query = query.filter(Restaurant.cuisine_type.ilike(f"%{cuisine}%"))
    restaurants = query.offset(skip).limit(limit).all()
    return restaurants

@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant non trouvé")
    return restaurant

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c

# ============================================
# BUDGET INTELLIGENT
# ============================================

def get_price_range_category(price_range):
    """
    Catégoriser le prix pour une meilleure compréhension
    """
    if not price_range:
        return "unknown"
    
    # Extraire les nombres de la chaîne
    import re
    numbers = re.findall(r'\d+', price_range)
    if len(numbers) >= 2:
        min_price = int(numbers[0])
        max_price = int(numbers[1])
        
        if max_price <= 5000:
            return "budget"
        elif max_price <= 10000:
            return "moyen"
        elif max_price <= 20000:
            return "premium"
        else:
            return "luxe"
    return "unknown"

def estimate_budget(price_range, nb_personnes=2):
    """
    Estimer le budget total pour un nombre de personnes
    """
    if not price_range:
        return None
    
    import re
    numbers = re.findall(r'\d+', price_range)
    if len(numbers) >= 2:
        min_price = int(numbers[0])
        max_price = int(numbers[1])
        avg_price = (min_price + max_price) / 2
        return round(avg_price * nb_personnes)
    return None

@router.get("/budget-estimate")
def get_budget_estimate(
    restaurant_id: int,
    nb_personnes: int = 2,
    db: Session = Depends(get_db)
):
    """
    Estimer le budget pour un restaurant
    """
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant non trouvé")
    
    budget = estimate_budget(restaurant.price_range, nb_personnes)
    category = get_price_range_category(restaurant.price_range)
    
    # Détails des plats suggérés
    suggested_dishes = []
    if category == "budget":
        suggested_dishes = ["Plat local", "Grillade", "Fast food"]
    elif category == "moyen":
        suggested_dishes = ["Plat traditionnel", "Poisson grillé", "Pizza"]
    elif category == "premium":
        suggested_dishes = ["Filet de bœuf", "Fruits de mer", "Plat gastronomique"]
    elif category == "luxe":
        suggested_dishes = ["Menu dégustation", "Homard", "Caviar"]
    
    return {
        "restaurant_id": restaurant.id,
        "restaurant_name": restaurant.name,
        "price_range": restaurant.price_range,
        "category": category,
        "budget_par_personne": round(budget / nb_personnes) if budget else None,
        "budget_total": budget,
        "nb_personnes": nb_personnes,
        "suggested_dishes": suggested_dishes,
        "message": f"Avec {budget} FCFA pour {nb_personnes} personnes, vous pouvez manger chez {restaurant.name}"
    }


# ============================================
# AVIS ET NOTATIONS
# ============================================

@router.get("/{restaurant_id}/reviews", response_model=List[ReviewResponse])
def get_reviews(
    restaurant_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Récupérer tous les avis d'un restaurant"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant non trouvé")
    
    reviews = db.query(Review).filter(
        Review.restaurant_id == restaurant_id
    ).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    
    return reviews

@router.post("/{restaurant_id}/reviews", response_model=ReviewResponse)
def create_review(
    restaurant_id: int,
    review: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ajouter un avis sur un restaurant"""
    
    # Vérifier si le restaurant existe
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant non trouvé")
    
    # Vérifier si l'utilisateur a déjà donné un avis
    existing = db.query(Review).filter(
        Review.restaurant_id == restaurant_id,
        Review.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Vous avez déjà donné un avis pour ce restaurant"
        )
    
    # Créer l'avis
    db_review = Review(
        restaurant_id=restaurant_id,
        user_id=current_user.id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    
    # Mettre à jour la note moyenne du restaurant
    all_reviews = db.query(Review).filter(Review.restaurant_id == restaurant_id).all()
    
    # ✅ CORRECTION : Gérer le cas où il n'y a pas d'avis
    if all_reviews:
        avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
        restaurant.rating = round(avg_rating, 1)
        restaurant.review_count = len(all_reviews)
    else:
        restaurant.rating = float(review.rating)
        restaurant.review_count = 1
    
    db.commit()
    db.refresh(db_review)
    
    return db_review

@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Supprimer un avis"""
    
    db_review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == current_user.id
    ).first()
    
    if not db_review:
        raise HTTPException(
            status_code=404, 
            detail="Avis non trouvé ou vous n'êtes pas l'auteur"
        )
    
    restaurant_id = db_review.restaurant_id
    
    db.delete(db_review)
    
    # Mettre à jour la note moyenne
    all_reviews = db.query(Review).filter(Review.restaurant_id == restaurant_id).all()
    if all_reviews:
        avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
        restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
        restaurant.rating = round(avg_rating, 1)
        restaurant.review_count = len(all_reviews)
    else:
        restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
        restaurant.rating = 0
        restaurant.review_count = 0
    
    db.commit()
    
    return {"message": "Avis supprimé avec succès"}

@router.get("/user/reviews")
def get_user_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupérer tous les avis de l'utilisateur"""
    
    reviews = db.query(Review).filter(
        Review.user_id == current_user.id
    ).order_by(Review.created_at.desc()).all()
    
    return reviews

@router.post("/{restaurant_id}/reservation")
def create_reservation(
    restaurant_id: int,
    reservation_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Créer une demande de réservation"""
    
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant non trouvé")
    
    # Générer le message WhatsApp
    phone = restaurant.whatsapp or restaurant.phone or "22900000000"
    message = f"""🍽️ *Demande de réservation - RestoGo Bénin*

📅 Date: {reservation_data.get('date', 'Non spécifiée')}
⏰ Heure: {reservation_data.get('time', 'Non spécifiée')}
👥 Personnes: {reservation_data.get('guests', 1)}
👤 Nom: {current_user.name}
📧 Email: {current_user.email}
📱 Téléphone: {reservation_data.get('phone', 'Non spécifié')}

📝 Message: {reservation_data.get('message', 'Aucun message')}

🔗 Restaurant: {restaurant.name}
📍 Adresse: {restaurant.address}

---
*Ce message a été envoyé via RestoGo Bénin*"""
    
    whatsapp_url = f"https://wa.me/{phone}?text={requests.utils.quote(message)}"
    
    return {
        "success": True,
        "whatsapp_url": whatsapp_url,
        "message": "Demande de réservation prête à être envoyée",
        "restaurant_name": restaurant.name,
        "phone": phone
    }