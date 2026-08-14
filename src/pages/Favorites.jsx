import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaHeart, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

const Favorites = () => {
  const { token } = useAuth();
  const { isDark } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${API_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (restaurantId) => {
    try {
      const response = await fetch(`${API_URL}/favorites/${restaurantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFavorites(favorites.filter(r => r.id !== restaurantId));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return (
      <AnimatedBackground>
        <Navbar />
        <main className="pt-24 pb-12 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chargement des favoris...</p>
          </div>
        </main>
        <Footer />
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className={`font-display text-3xl font-bold ${isDark ? 'text-white' : 'text-darkText'}`}>
                Mes favoris
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {favorites.length} restaurants sauvegardés
              </p>
            </div>
          </div>

          {favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <FaHeart className={`text-6xl mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <h2 className={`text-2xl font-display mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Aucun favori
              </h2>
              <p className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Commencez à sauvegarder vos restaurants préférés
              </p>
              <Link to="/search">
                <button className="mt-6 bg-primary-500 text-white px-6 py-2 rounded-full hover:bg-primary-600 transition">
                  Découvrir des restaurants
                </button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="relative">
                    <img 
                      src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'} 
                      alt={restaurant.name} 
                      className="w-full h-48 object-cover" 
                    />
                    <button
                      onClick={() => removeFavorite(restaurant.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition"
                    >
                      <FaTrash className="text-red-500" />
                    </button>
                  </div>
                  <div className="p-5">
                    <Link to={`/restaurant/${restaurant.id}`}>
                      <h3 className={`font-display font-semibold text-lg ${isDark ? 'text-white' : 'text-darkText'} hover:text-primary-500 transition`}>
                        {restaurant.name}
                      </h3>
                    </Link>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {restaurant.cuisine_type}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <FaStar className="text-yellow-400" />
                        <span>{restaurant.rating || 0}</span>
                      </div>
                      <span className="font-medium text-primary-500">{restaurant.price_range}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default Favorites;