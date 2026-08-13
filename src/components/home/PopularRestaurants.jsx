import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getFeaturedRestaurants, getFavorites, toggleFavorite } from '../../services/api';

// ✅ CORRECTION
const API_URL = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : 'http://localhost:8000/api';

const PopularRestaurants = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const demoRestaurants = [
    {
      id: 1,
      name: "La Maison Dorée",
      cuisine_type: "Française • Gastronomique",
      rating: 4.9,
      review_count: 127,
      price_range: "15 000 - 25 000 FCFA",
      image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
      distance: "1.2 km",
      address: "Cotonou",
      is_open: true
    },
    {
      id: 2,
      name: "Le Jardin Secret",
      cuisine_type: "Africaine • Traditionnelle",
      rating: 4.8,
      review_count: 98,
      price_range: "8 000 - 15 000 FCFA",
      image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
      distance: "2.5 km",
      address: "Abomey-Calavi",
      is_open: true
    },
    {
      id: 3,
      name: "Ocean View Restaurant",
      cuisine_type: "Fruits de mer • Méditerranéen",
      rating: 4.7,
      review_count: 156,
      price_range: "12 000 - 20 000 FCFA",
      image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
      distance: "0.8 km",
      address: "Cotonou",
      is_open: false
    },
    {
      id: 4,
      name: "Chez Maman Bénin",
      cuisine_type: "Béninoise • Maquis",
      rating: 4.6,
      review_count: 203,
      price_range: "5 000 - 10 000 FCFA",
      image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
      distance: "3.1 km",
      address: "Abomey-Calavi",
      is_open: true
    },
  ];

  // Fonction pour récupérer les photos des restaurants
  const fetchPhotosForRestaurants = async (restaurantsList) => {
    const restaurantsWithPhotos = await Promise.all(
      restaurantsList.map(async (resto) => {
        try {
          const response = await fetch(`${API_URL}/restaurateur/restaurants/${resto.id}/photos`);
          if (response.ok) {
            const photos = await response.json();
            return { ...resto, photos };
          }
          return { ...resto, photos: [] };
        } catch (error) {
          return { ...resto, photos: [] };
        }
      })
    );
    return restaurantsWithPhotos;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getFeaturedRestaurants();
        let restaurantsData = data && data.length > 0 ? data : demoRestaurants;
        
        // Charger les photos pour chaque restaurant
        const restaurantsWithPhotos = await fetchPhotosForRestaurants(restaurantsData);
        setRestaurants(restaurantsWithPhotos);
      } catch (error) {
        console.error('Erreur:', error);
        const restaurantsWithPhotos = await fetchPhotosForRestaurants(demoRestaurants);
        setRestaurants(restaurantsWithPhotos);
      }
      
      if (isAuthenticated && token) {
        try {
          const favData = await getFavorites(token);
          setFavorites(favData.map(r => r.id));
        } catch (error) {
          console.error('Erreur favoris:', error);
        }
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [isAuthenticated, token]);

  const handleToggleFavorite = async (restaurantId, e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour ajouter des favoris');
      return;
    }

    const isFavorite = favorites.includes(restaurantId);
    
    try {
      await toggleFavorite(restaurantId, token);
      if (isFavorite) {
        setFavorites(favorites.filter(id => id !== restaurantId));
      } else {
        setFavorites([...favorites, restaurantId]);
      }
    } catch (error) {
      alert('Erreur lors de la modification des favoris');
    }
  };

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  // Fonction pour obtenir l'URL de l'image
  const getImageUrl = (restaurant) => {
    // Si le restaurant a des photos uploadées, utiliser la première
    if (restaurant.photos && restaurant.photos.length > 0) {
      // ✅ CORRECTION : Utiliser l'URL de l'API
      return `${API_URL.replace('/api', '')}${restaurant.photos[0].image_url}`;
    }
    // Sinon utiliser l'image par défaut
    return restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-2xl h-64 sm:h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-gray-800">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-10"
        >
          <div>
            <h2 className={`font-display text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-darkText'} mb-1 sm:mb-2`}>
              Restaurants populaires
            </h2>
            <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Les meilleures adresses sélectionnées pour vous
            </p>
          </div>
          <button 
            onClick={() => navigate('/search')}
            className="text-primary-500 font-medium hover:text-primary-600 transition flex items-center gap-2 text-sm sm:text-base"
          >
            Voir tout →
          </button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {restaurants.map((restaurant, index) => {
            const isFavorite = favorites.includes(restaurant.id);
            const imageUrl = getImageUrl(restaurant);
            
            return (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => handleRestaurantClick(restaurant.id)}
                className={`group relative rounded-2xl overflow-hidden shadow-card cursor-pointer border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}
              >
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium backdrop-blur-sm ${
                      restaurant.is_open 
                        ? 'bg-green-500/90 text-white' 
                        : 'bg-gray-500/90 text-white'
                    }`}>
                      {restaurant.is_open ? 'Ouvert' : 'Fermé'}
                    </span>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleToggleFavorite(restaurant.id, e)}
                    className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                      isFavorite 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/90 text-gray-600 hover:bg-white'
                    }`}
                  >
                    {isFavorite ? (
                      <FaHeart className="text-base sm:text-lg" />
                    ) : (
                      <FaRegHeart className="text-base sm:text-lg" />
                    )}
                  </motion.button>
                </div>
                
                <div className="p-3 sm:p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-display font-semibold text-sm sm:text-base ${isDark ? 'text-white' : 'text-darkText'} group-hover:text-primary-500 transition-colors`}>
                      {restaurant.name}
                    </h3>
                    <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                      isDark ? 'bg-gray-700' : 'bg-primary-50'
                    }`}>
                      <FaStar className="text-yellow-400 text-[10px] sm:text-sm" />
                      <span className={`text-[10px] sm:text-sm font-medium ${isDark ? 'text-white' : 'text-darkText'}`}>
                        {restaurant.rating || 0}
                      </span>
                      <span className={`text-[8px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        ({restaurant.review_count || 0})
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {restaurant.cuisine_type || 'Cuisine variée'}
                  </p>
                  
                  <div className={`flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-primary-500 text-[10px] sm:text-xs" />
                      <span>{restaurant.distance || '0 km'}</span>
                    </div>
                    <span className="font-medium text-primary-500">{restaurant.price_range || ''}</span>
                    <span className="text-[10px] sm:text-xs truncate max-w-[80px] sm:max-w-[100px]">{restaurant.address || ''}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularRestaurants;