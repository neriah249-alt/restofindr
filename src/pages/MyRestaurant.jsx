import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaEdit, FaTrash, FaPlus, FaStar, FaMapMarkerAlt, FaPhone, 
  FaWhatsapp, FaClock, FaImage, FaSpinner
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import PhotoManager from '../components/restaurant/PhotoManager';

// ✅ CORRECTION : Utilisation de la variable d'environnement
const API_URL = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : 'http://localhost:8000/api';

const MyRestaurant = () => {
  const { token, user } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  const fetchMyRestaurant = async () => {
    try {
      const response = await fetch(`${API_URL}/restaurateur/restaurants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setRestaurant(data[0]);
        } else {
          setError('Vous n\'avez pas encore de restaurant');
        }
      } else {
        setError('Erreur lors du chargement');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer votre restaurant ? Cette action est irréversible.')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/restaurateur/restaurants/${restaurant.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showToast('✅ Restaurant supprimé avec succès', 'success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <AnimatedBackground>
        <Navbar />
        <main className="pt-24 pb-12 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chargement...</p>
          </div>
        </main>
        <Footer />
      </AnimatedBackground>
    );
  }

  if (error) {
    return (
      <AnimatedBackground>
        <Navbar />
        <main className="pt-24 pb-12 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className={`text-2xl font-display ${isDark ? 'text-white' : 'text-darkText'} mb-2`}>
              {error}
            </h2>
            <Link to="/become-restaurateur">
              <button className="bg-primary-500 text-white px-6 py-2 rounded-xl hover:bg-primary-600 transition">
                Ajouter mon restaurant
              </button>
            </Link>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl shadow-2xl p-6 sm:p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            {/* En-tête */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div>
                <h1 className={`font-display text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-darkText'}`}>
                  Mon restaurant
                </h1>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Gérez votre restaurant et ses photos
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/become-restaurateur">
                  <button className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition flex items-center gap-2 text-sm">
                    <FaEdit /> Modifier
                  </button>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>

            {/* Informations du restaurant */}
            {restaurant && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nom</div>
                    <div className={`font-medium text-lg ${isDark ? 'text-white' : 'text-darkText'}`}>
                      {restaurant.name}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cuisine</div>
                    <div className={`font-medium text-lg ${isDark ? 'text-white' : 'text-darkText'}`}>
                      {restaurant.cuisine_type}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Prix</div>
                    <div className={`font-medium text-lg text-primary-500`}>
                      {restaurant.price_range}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Note</div>
                    <div className={`font-medium text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-darkText'}`}>
                      <FaStar className="text-yellow-400" />
                      {restaurant.rating || 0} ({restaurant.review_count || 0} avis)
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} md:col-span-2`}>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Adresse</div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-darkText'}`}>
                      <FaMapMarkerAlt className="inline text-primary-500 mr-2" />
                      {restaurant.address}
                    </div>
                  </div>
                </div>

                {/* ========================================== */}
                {/* 📸 SECTION PHOTOS - AJOUTÉE ICI */}
                {/* ========================================== */}
                <div className={`mt-6 p-6 rounded-2xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h2 className={`font-display text-xl font-bold ${isDark ? 'text-white' : 'text-darkText'} mb-4 flex items-center gap-2`}>
                    <FaImage className="text-primary-500" />
                    📸 Photos du restaurant
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                    Ajoutez des photos pour montrer votre restaurant aux clients.
                  </p>
                  <PhotoManager restaurantId={restaurant.id} />
                </div>

                {/* Bouton pour voir le restaurant */}
                <div className="mt-6">
                  <Link to={`/restaurant/${restaurant.id}`}>
                    <button className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition">
                      Voir mon restaurant
                    </button>
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default MyRestaurant;