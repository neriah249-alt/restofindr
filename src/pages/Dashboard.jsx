import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaStar, FaHeart, FaComment, FaUsers, FaChartLine, 
  FaStore, FaEdit, FaTrash, FaPlus, FaEye, FaArrowUp,
  FaArrowDown, FaClock, FaUser, FaUtensils, FaCalendar,
  FaSpinner, FaShare, FaWhatsapp, FaPhone, FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const API_URL = 'http://localhost:8000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Charger les données
  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      // Statistiques
      const statsResponse = await fetch(`${API_URL}/restaurateur/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        setError('Erreur de chargement des statistiques');
        showToast('Erreur de chargement des statistiques', 'error');
      }
      
      // Activités
      const activityResponse = await fetch(`${API_URL}/restaurateur/dashboard/activity`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivities(activityData.activities || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les données');
      showToast('Impossible de charger les données', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Supprimer le restaurant
  const handleDeleteRestaurant = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre restaurant ? Cette action est irréversible.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/restaurateur/restaurants/${stats.restaurant.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showToast('✅ Restaurant supprimé avec succès', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const data = await response.json();
        showToast(data.detail || 'Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      showToast('Erreur de connexion au serveur', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Partager le restaurant
  const handleShareRestaurant = () => {
    const url = `${window.location.origin}/restaurant/${stats?.restaurant?.id}`;
    if (navigator.share) {
      navigator.share({
        title: stats?.restaurant?.name,
        text: `Découvrez ${stats?.restaurant?.name} sur RestoGo Bénin !`,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('🔗 Lien copié dans le presse-papiers !', 'success');
    }
  };

  // Ouvrir WhatsApp
  const handleWhatsApp = () => {
    const phone = stats?.restaurant?.phone || '22900000000';
    const message = `Bonjour, je viens de RestoGo Bénin. Je souhaiterais avoir plus d'informations sur votre restaurant "${stats?.restaurant?.name}".`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    showToast('💬 Ouverture de WhatsApp...', 'info');
  };

  // Ouvrir Google Maps
  const handleGoogleMaps = () => {
    if (stats?.restaurant) {
      const { latitude, longitude, name } = stats.restaurant;
      if (latitude && longitude) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
        showToast('🗺️ Ouverture de Google Maps...', 'info');
      } else {
        showToast('📍 Coordonnées non disponibles', 'warning');
      }
    }
  };

  // Voir les avis
  const handleViewReviews = () => {
    navigate(`/restaurant/${stats?.restaurant?.id}#reviews`);
    showToast('📝 Chargement des avis...', 'info');
  };

  if (loading) {
    return (
      <AnimatedBackground>
        <Navbar />
        <main className="pt-24 pb-12 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chargement du tableau de bord...</p>
          </div>
        </main>
        <Footer />
      </AnimatedBackground>
    );
  }

  // Cas 1 : Utilisateur non restaurateur
  if (!user?.is_restaurateur) {
    return (
      <AnimatedBackground>
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🔑</div>
              <h2 className={`text-2xl font-display ${isDark ? 'text-white' : 'text-darkText'} mb-2`}>
                Vous n'êtes pas restaurateur
              </h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6 max-w-md mx-auto`}>
                Devenez restaurateur pour ajouter votre restaurant et accéder aux statistiques.
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="bg-primary-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-600 transition"
              >
                Devenir restaurateur
              </button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </AnimatedBackground>
    );
  }

  // Cas 2 : Restaurateur sans restaurant
  if (stats?.has_restaurant === false) {
    return (
      <AnimatedBackground>
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🍽️</div>
              <h2 className={`text-2xl font-display ${isDark ? 'text-white' : 'text-darkText'} mb-2`}>
                Vous n'avez pas encore de restaurant
              </h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6 max-w-md mx-auto`}>
                Ajoutez votre restaurant pour commencer à recevoir des avis et des clients.
              </p>
              <Link to="/become-restaurateur">
                <button className="bg-primary-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-600 transition">
                  Ajouter mon restaurant
                </button>
              </Link>
            </motion.div>
          </div>
        </main>
        <Footer />
      </AnimatedBackground>
    );
  }

  // Cas 3 : Dashboard complet
  return (
    <AnimatedBackground>
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* En-tête avec actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          >
            <div>
              <h1 className={`font-display text-3xl font-bold ${isDark ? 'text-white' : 'text-darkText'}`}>
                📊 Tableau de bord
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {stats?.restaurant?.name ? `Gérez votre restaurant "${stats.restaurant.name}"` : 'Gérez votre restaurant'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={fetchDashboardData}
                disabled={isRefreshing}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {isRefreshing ? <FaSpinner className="animate-spin" /> : <FaChartLine />}
                {isRefreshing ? 'Actualisation...' : 'Actualiser'}
              </button>
              <Link to="/become-restaurateur">
                <button className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition flex items-center gap-2 text-sm">
                  <FaEdit /> Modifier
                </button>
              </Link>
            </div>
          </motion.div>

          {error && (
            <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-500'}`}>
              {error}
            </div>
          )}

          {/* Statistiques avec animations au survol */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg cursor-pointer transition-all duration-200`}
              onClick={handleViewReviews}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                  <FaStar />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.stats?.avg_rating || 0}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Note moyenne</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg cursor-pointer transition-all duration-200`}
              onClick={handleViewReviews}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FaComment />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.stats?.total_reviews || 0}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avis reçus</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg cursor-pointer transition-all duration-200`}
              onClick={() => navigate('/favorites')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                  <FaHeart />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.stats?.total_favorites || 0}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Favoris</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg cursor-pointer transition-all duration-200`}
              onClick={handleViewReviews}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                  <FaChartLine />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.stats?.total_reviews || 0}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total avis</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
          >
            <button
              onClick={handleShareRestaurant}
              className={`p-3 rounded-xl ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 text-sm`}
            >
              <FaShare className="text-primary-500" /> Partager
            </button>
            <button
              onClick={handleWhatsApp}
              className={`p-3 rounded-xl ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 text-sm`}
            >
              <FaWhatsapp className="text-green-500" /> WhatsApp
            </button>
            <button
              onClick={handleGoogleMaps}
              className={`p-3 rounded-xl ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 text-sm`}
            >
              <FaMapMarkerAlt className="text-primary-500" /> Localisation
            </button>
            <button
              onClick={handleViewReviews}
              className={`p-3 rounded-xl ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 text-sm`}
            >
              <FaComment className="text-blue-500" /> Avis
            </button>
            <button
              onClick={handleDeleteRestaurant}
              disabled={isDeleting}
              className={`p-3 rounded-xl ${isDark ? 'bg-gray-800 hover:bg-red-900/30' : 'bg-white hover:bg-red-50'} shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 text-sm text-red-500 disabled:opacity-50`}
            >
              {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </motion.div>

          {/* Activités récentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <h3 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-darkText'} mb-4 flex items-center gap-2`}>
              <FaClock /> Activités récentes
            </h3>
            {activities.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {activities.map((activity, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-all duration-200`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      activity.type === 'review' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {activity.type === 'review' ? <FaStar /> : <FaHeart />}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        {activity.message}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {activity.created_at ? new Date(activity.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        }) : 'Récemment'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Aucune activité récente
              </p>
            )}
          </motion.div>

        </div>
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default Dashboard;