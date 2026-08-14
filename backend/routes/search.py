from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
import re
import json
from sqlalchemy import func, or_

from database import get_db
from models import Restaurant
from schemas import RestaurantResponse

router = APIRouter(prefix="/api/search", tags=["search"])

# Mots-clés et synonymes pour l'analyse
KEYWORDS = {
    "cuisine": {
        "italien": ["italien", "pizza", "pasta", "spaghetti", "tiramisu"],
        "français": ["français", "francaise", "bistro", "gastronomique"],
        "africain": ["africain", "africaine", "maquis", "togolais", "sénégalais"],
        "béninois": ["béninois", "beninois", "beninoise", "locale"],
        "asiatique": ["asiatique", "chinois", "japonais", "sushi", "thai"],
        "fastfood": ["fast food", "burger", "pizza rapide", "sandwich"],
        "fruits de mer": ["fruits de mer", "poisson", "crabe", "crevette", "homard"],
        "végétarien": ["végétarien", "vegetarien", "vegan", "sans viande"],
    },
    "ambiance": {
        "romantique": ["romantique", "amoureux", "couple", "intime", "anniversaire"],
        "calme": ["calme", "tranquille", "silencieux", "paisible"],
        "festif": ["festif", "fete", "soiree", "ambiance", "musique", "surprise"],
        "chic": ["chic", "classe", "luxe", "élégant", "raffiné"],
        "familial": ["familial", "famille", "enfant", "groupe"],
        "détendu": ["détendu", "detendu", "relax", "casual"],
        "vue mer": ["vue mer", "plage", "ocean", "bord de mer", "fidjrosse"],
    },
    "prix": {
        "budget": ["pas cher", "bon marché", "économique", "moins de 5000", "5000"],
        "moyen": ["moyen", "5000-10000", "10000", "correct"],
        "premium": ["cher", "premium", "10000-20000", "20000", "gastronomique"],
        "luxe": ["très cher", "luxe", "plus de 20000"],
    },
    "distance": {
        "proche": ["proche", "près", "pres", "a cote", "pas loin", "5 min"],
        "moyen": ["moyenne distance", "10 min", "15 min"],
        "loin": ["loin", "distance", "20 min", "30 min"],
    }
}

def analyze_search_query(query: str) -> Dict[str, Any]:
    """
    Analyser une requête de recherche conversationnelle
    """
    query_lower = query.lower()
    result = {
        "original": query,
        "cuisine": [],
        "ambiance": [],
        "price": None,
        "distance": None,
        "keywords": [],
        "nb_personnes": 2,
        "budget_total": None
    }
    
    # Extraire le nombre de personnes
    personnes_match = re.search(r'(\d+)\s*(personnes|pers|personne|p)', query_lower)
    if personnes_match:
        result["nb_personnes"] = int(personnes_match.group(1))
    
    # Extraire le budget total
    budget_match = re.search(r'(\d+)\s*(fcfa|f cfa|francs)', query_lower)
    if budget_match:
        result["budget_total"] = int(budget_match.group(1))
    
    # Analyser les catégories
    for category, items in KEYWORDS.items():
        if category == "cuisine":
            for cuisine, keywords in items.items():
                if any(kw in query_lower for kw in keywords):
                    result["cuisine"].append(cuisine)
                    result["keywords"].append(cuisine)
        elif category == "ambiance":
            for ambiance, keywords in items.items():
                if any(kw in query_lower for kw in keywords):
                    result["ambiance"].append(ambiance)
                    result["keywords"].append(ambiance)
        elif category == "prix":
            for price, keywords in items.items():
                if any(kw in query_lower for kw in keywords):
                    result["price"] = price
        elif category == "distance":
            for distance, keywords in items.items():
                if any(kw in query_lower for kw in keywords):
                    result["distance"] = distance
    
    return result

def get_price_range_category(price_range):
    """Catégoriser le prix"""
    if not price_range:
        return "unknown"
    numbers = re.findall(r'\d+', price_range)
    if len(numbers) >= 2:
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

# ============================================
# ✅ ROUTE SIMPLE (pour la recherche de base)
# ============================================
@router.get("/")
def simple_search(
    q: str = "",
    db: Session = Depends(get_db)
):
    """
    Recherche simple par nom ou cuisine
    """
    print(f"🔍 Recherche simple: '{q}'")
    
    if not q:
        return []
    
    results = db.query(Restaurant).filter(
        or_(
            Restaurant.name.ilike(f"%{q}%"),
            Restaurant.cuisine_type.ilike(f"%{q}%"),
            Restaurant.description.ilike(f"%{q}%")
        )
    ).filter(Restaurant.is_active == True).limit(20).all()
    
    print(f"🔍 Résultats trouvés: {len(results)}")
    
    return [
        {
            "id": r.id,
            "name": r.name,
            "cuisine_type": r.cuisine_type,
            "rating": r.rating,
            "review_count": r.review_count,
            "price_range": r.price_range,
            "address": r.address,
            "image_url": r.image_url,
            "is_open": getattr(r, 'is_open', True),
            "latitude": getattr(r, 'latitude', None),
            "longitude": getattr(r, 'longitude', None),
        }
        for r in results
    ]

# ============================================
# ✅ ROUTE CONVERSATIONNELLE (existante)
# ============================================
@router.get("/conversational")
def search_conversational(
    query: str = Query(..., description="Recherche en langage naturel"),
    db: Session = Depends(get_db)
):
    """
    Recherche conversationnelle avancée
    """
    # Analyser la requête
    analysis = analyze_search_query(query)
    print(f"🔍 Analyse de la recherche: {analysis}")
    
    # Construire la requête SQL
    db_query = db.query(Restaurant)
    
    # Filtrer par cuisine
    if analysis["cuisine"]:
        cuisine_filters = []
        for cuisine in analysis["cuisine"]:
            cuisine_filters.append(Restaurant.cuisine_type.ilike(f"%{cuisine}%"))
        if cuisine_filters:
            db_query = db_query.filter(or_(*cuisine_filters))
    
    # Filtrer par ambiance (corrigé)
    if analysis["ambiance"]:
        ambiance_filters = []
        for ambiance in analysis["ambiance"]:
            # ✅ CORRECTION : Utiliser func.array_to_string pour les tableaux
            ambiance_filters.append(func.array_to_string(Restaurant.ambiance, ',').ilike(f"%{ambiance}%"))
            ambiance_filters.append(Restaurant.description.ilike(f"%{ambiance}%"))
        if ambiance_filters:
            db_query = db_query.filter(or_(*ambiance_filters))
    
    # Filtrer par prix
    if analysis["price"]:
        if analysis["price"] == "budget":
            db_query = db_query.filter(Restaurant.price_range.ilike("%0 - 5 000%"))
        elif analysis["price"] == "moyen":
            db_query = db_query.filter(Restaurant.price_range.ilike("%5 000 - 10 000%"))
        elif analysis["price"] == "premium":
            db_query = db_query.filter(
                Restaurant.price_range.ilike("%10 000 - 15 000%") | 
                Restaurant.price_range.ilike("%15 000 - 20 000%")
            )
        elif analysis["price"] == "luxe":
            db_query = db_query.filter(Restaurant.price_range.ilike("%20 000%"))
    
    # Exécuter la requête
    results = db_query.limit(20).all()
    
    # Calculer le score de pertinence
    scored_results = []
    for r in results:
        score = 0
        if analysis["cuisine"] and any(c in (r.cuisine_type or "").lower() for c in analysis["cuisine"]):
            score += 30
        if analysis["ambiance"]:
            if r.ambiance:
                for a in analysis["ambiance"]:
                    if any(a in (amb or "").lower() for amb in r.ambiance):
                        score += 20
            if r.description and any(a in r.description.lower() for a in analysis["ambiance"]):
                score += 10
        if analysis["price"]:
            price_cat = get_price_range_category(r.price_range)
            if price_cat == analysis["price"]:
                score += 25
        if r.rating and r.rating >= 4.5:
            score += 10
        elif r.rating and r.rating >= 4.0:
            score += 5
        
        scored_results.append({
            "restaurant": r,
            "score": score,
            "match_cuisine": any(c in (r.cuisine_type or "").lower() for c in analysis["cuisine"]) if analysis["cuisine"] else False,
            "match_ambiance": any(a in (r.ambiance or []) for a in analysis["ambiance"]) if analysis["ambiance"] else False,
            "match_price": get_price_range_category(r.price_range) == analysis["price"] if analysis["price"] else False
        })
    
    # Trier par score
    scored_results.sort(key=lambda x: x["score"], reverse=True)
    
    # Préparer la réponse
    response = {
        "query": query,
        "analysis": analysis,
        "results": [],
        "total": len(scored_results),
        "message": ""
    }
    
    for item in scored_results[:10]:
        r = item["restaurant"]
        response["results"].append({
            "id": r.id,
            "name": r.name,
            "cuisine_type": r.cuisine_type,
            "rating": r.rating,
            "price_range": r.price_range,
            "address": r.address,
            "image_url": r.image_url,
            "score": item["score"],
            "match_cuisine": item["match_cuisine"],
            "match_ambiance": item["match_ambiance"],
            "match_price": item["match_price"],
            "is_open": getattr(r, 'is_open', True),
            "review_count": r.review_count
        })
    
    # Générer un message personnalisé
    if len(scored_results) == 0:
        response["message"] = "Désolé, je n'ai trouvé aucun restaurant correspondant à votre recherche. Essayez avec d'autres critères."
    elif len(scored_results) <= 3:
        response["message"] = f"✨ J'ai trouvé {len(scored_results)} restaurant qui correspond à votre recherche."
    else:
        response["message"] = f"✨ J'ai trouvé {len(scored_results)} restaurants qui correspondent à votre recherche. Voici les meilleurs."
    
    return response