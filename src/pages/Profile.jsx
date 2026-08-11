import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import { FaUser, FaEnvelope, FaHeart, FaUtensils, FaStore, FaSignOutAlt, FaMapMarkerAlt } from 'react-icons/fa';

const API_URL = 'http://localhost:8000/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleBecomeRestaurateur = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_URL}/restaurateur/become`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Vous êtes maintenant restaurateur !');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage('❌ ' + (data.detail || 'Erreur lors de la demande'));
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Initiales de l'utilisateur
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const userInitials = getInitials(user?.name);

  return (
    <AnimatedBackground>
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            {/* En-tête avec avatar initiales */}
            <div className="bg-primary-500 px-8 py-12 text-center">
              {/* Avatar avec initiales */}
              <div className="w-32 h-32 rounded-full border-4 border-white mx-auto mb-4 flex items-center justify-center bg-white text-primary-500 text-5xl font-bold">
                {userInitials}
              </div>
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <p className="text-white/80">{user?.email}</p>
              {user?.is_restaurateur && (
                <span className="inline-block mt-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  🍽️ Restaurateur
                </span>
              )}
            </div>

            {/* Informations */}
            <div className="p-8 space-y-6">
              {message && (
                <div className={`p-3 rounded-xl text-center ${
                  message.includes('✅') 
                    ? 'bg-green-50 dark:bg-green-900/50 text-green-500 dark:text-green-300' 
                    : 'bg-red-50 dark:bg-red-900/50 text-red-500 dark:text-red-300'
                }`}>
                  {message}
                </div>
              )}

              <div className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <FaUser className="text-primary-500" />
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nom</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-darkText'}`}>{user?.name}</div>
                </div>
              </div>

              <div className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <FaEnvelope className="text-primary-500" />
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-darkText'}`}>{user?.email}</div>
                </div>
              </div>

              {user?.is_restaurateur && (
                <div className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <FaMapMarkerAlt className="text-primary-500" />
                  <div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Statut</div>
                    <div className={`font-medium text-green-500`}>🍽️ Restaurateur</div>
                  </div>
                </div>
              )}

              <div className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <FaHeart className="text-red-500" />
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Favoris</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-darkText'}`}>0 restaurants</div>
                </div>
              </div>

              <div className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <FaUtensils className="text-primary-500" />
                <div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Restaurants visités</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-darkText'}`}>0 restaurants</div>
                </div>
              </div>

              {/* Bouton Devenir restaurateur */}
              {!user?.is_restaurateur && (
                <button
                  onClick={handleBecomeRestaurateur}
                  disabled={loading}
                  className="w-full bg-primary-500 text-white py-4 rounded-xl font-medium hover:bg-primary-600 transition flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <FaStore />
                  {loading ? 'Chargement...' : 'Devenir restaurateur'}
                </button>
              )}

              {user?.is_restaurateur && (
                <button
                  onClick={() => navigate('/become-restaurateur')}
                  className="w-full bg-green-500 text-white py-4 rounded-xl font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <FaStore />
                  Gérer mon restaurant
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-4 rounded-xl font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                <FaSignOutAlt /> Se déconnecter
              </button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default Profile;