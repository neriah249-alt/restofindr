// src/services/api.js
const API_URL =
    import.meta.env.VITE_API_URL ?
    `${import.meta.env.VITE_API_URL}/api` :
    'http://localhost:8000/api';

// ============================================
// RESTAURANTS
// ============================================

export const getFeaturedRestaurants = async() => {
    try {
        const response = await fetch(`${API_URL}/restaurants/featured`);
        if (!response.ok) throw new Error('Erreur de chargement');
        return await response.json();
    } catch (error) {
        console.error('Erreur getFeaturedRestaurants:', error);
        return [];
    }
};

export const getRestaurants = async(params = {}) => {
    try {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_URL}/restaurants?${query}`);
        if (!response.ok) throw new Error('Erreur de chargement');
        return await response.json();
    } catch (error) {
        console.error('Erreur getRestaurants:', error);
        return [];
    }
};

export const searchRestaurants = async(query, filters = {}) => {
    try {
        const params = new URLSearchParams({ q: query, ...filters });
        const response = await fetch(`${API_URL}/restaurants/search?${params}`);
        if (!response.ok) throw new Error('Erreur de recherche');
        return await response.json();
    } catch (error) {
        console.error('Erreur searchRestaurants:', error);
        return [];
    }
};

export const getRestaurantById = async(id) => {
    try {
        const response = await fetch(`${API_URL}/restaurants/${id}`);
        if (!response.ok) throw new Error('Restaurant non trouvé');
        return await response.json();
    } catch (error) {
        console.error('Erreur getRestaurantById:', error);
        return null;
    }
};

// ============================================
// FAVORIS
// ============================================

export const getFavorites = async(token) => {
    try {
        const response = await fetch(`${API_URL}/favorites`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erreur de chargement des favoris');
        return await response.json();
    } catch (error) {
        console.error('Erreur getFavorites:', error);
        return [];
    }
};

export const toggleFavorite = async(restaurantId, token) => {
    try {
        // Vérifier d'abord si déjà en favori
        const checkResponse = await fetch(`${API_URL}/favorites/check/${restaurantId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const checkData = await checkResponse.json();
        const isFavorite = checkData.is_favorite;

        const method = isFavorite ? 'DELETE' : 'POST';

        const response = await fetch(`${API_URL}/favorites/${restaurantId}`, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Erreur de modification');
        return await response.json();
    } catch (error) {
        console.error('Erreur toggleFavorite:', error);
        throw error;
    }
};

export const checkFavorite = async(restaurantId, token) => {
    try {
        const response = await fetch(`${API_URL}/favorites/check/${restaurantId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return false;
        const data = await response.json();
        return data.is_favorite;
    } catch (error) {
        console.error('Erreur checkFavorite:', error);
        return false;
    }
};