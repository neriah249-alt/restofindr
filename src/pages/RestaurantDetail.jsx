import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaStar, FaMapMarkerAlt, FaPhone, FaWhatsapp, FaClock, 
  FaHeart, FaRegHeart, FaArrowLeft, FaShare, FaUtensils,
  FaWifi, FaParking, FaSnowflake, FaMusic, FaLeaf, FaCar,
  FaUsers, FaGlassCheers, FaDollarSign, FaRoute,
  FaCalendarCheck
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import ReviewsSection from '../components/restaurant/ReviewsSection';
import ReservationModal from '../components/restaurant/ReservationModal';
import PhotoManager from '../components/restaurant/PhotoManager';

const API_URL = 'http://localhost:8000/api';

// Icônes des services
const serviceIcons = {
  'Parking': <FaParking />,
  'WiFi': <FaWifi />,
  'Climatisation': <FaSnowflake />,
  'Terrasse': <FaLeaf />,
  'Musique Live': <FaMusic />,
  'Livraison': <FaCar />,
  'À emporter': <FaUtensils />,
};

// Icônes des ambiances
const ambianceIcons = {
  'Romantique': <FaHeart className="text-red-400" />,
  'Calme': <FaLeaf className="text-green-400" />,
  'Festif': <FaGlassCheers className="text-yellow-400" />,
  'Détendu': <FaUsers className="text-blue-400" />,
  'Classe': <FaDollarSign className="text-purple-400" />,
  'Familial': <FaUsers className="text-orange-400" />,
};

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [showReservation, setShowReservation] = useState(false);

  const demoRestaurant = {
    id: parseInt(id) || 1,
    name: "La Maison Dorée",
    address: "123 Boulevard de la Mer, Cotonou",
    cuisine_type: "Française • Gastronomique",
    rating: 4.9,
    review_count: 127,
    price_range: "15 000 - 25 000 FCFA",
    image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop",
    description: "La Maison Dorée vous invite à découvrir une cuisine française raffinée dans un cadre élégant et chaleureux.",
    phone: "+229 61 23 45 67",
    whatsapp: "+229 61 23 45 67",
    opening_hours: "Lun - Sam: 11:00 - 22:30",
    services: ["Parking", "WiFi", "Climatisation", "Terrasse", "Musique Live"],
    ambiance: ["Romantique", "Calme", "Classe"],
    latitude: 6.3601,
    longitude: 2.4413,
    is_open: true,
    owner_id: 1
  };

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/restaurants/${id}`);
        if (response.ok) {
          const data = await response.json();
          setRestaurant(data);
        } else {
          console.warn('Utilisation des données de démonstration');
          setRestaurant(demoRestaurant);
        }
      } catch (error) {
        console.error('Erreur:', error);
        setRestaurant(demoRestaurant);
        setError('Impossible de charger le restaurant. Affichage des données de démonstration.');
      } finally {
        setLoading(false);
      }
    };

    const checkFavorite = async () => {
      if (isAuthenticated && token) {
        try {
          const response = await fetch(`${API_URL}/favorites/check/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setIsFavorite(data.is_favorite);
          }
        } catch (error) {
          console.error('Erreur check favori:', error);
        }
      }
    };

    fetchRestaurant();
    checkFavorite();
  }, [id, isAuthenticated, token]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast('🔒 Veuillez vous connecter pour ajouter aux favoris', 'warning');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/favorites/${id}`, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        showToast(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris ❤️', 'success');
      }
    } catch (error) {
      showToast('Erreur de connexion', 'error');
    }
  };

  const openGoogleMaps = (lat, lng, name) => {
    if (!lat || !lng) {
      showToast('Coordonnées non disponibles', 'warning');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  };

  const openGoogleMapsView = (lat, lng) => {
    if (!lat || !lng) {
      showToast('Coordonnées non disponibles', 'warning');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <AnimatedBackground>
        <Navbar />
        <main className="pt-24 pb-12 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chargement...</p>
          </div>
        </main>
        <Footer />
      </AnimatedBackground>
    );
  }

  if (!restaurant) {
    return (
      <AnimatedBackground>
        <Navbar />
        <main className="pt-24 pb-12 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-darkText'} mb-2`}>
              Restaurant non trouvé
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Le restaurant que vous recherchez n'existe pas.
            </p>
            <Link to="/search" className="btn-primary mt-4 inline-block">
              Retour à la recherche
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
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/search" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition mb-4">
            <FaArrowLeft /> Retour
          </Link>

          {error && (
            <div className={`p-3 rounded-xl mb-4 ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`}>
              {error}
            </div>
          )}

          {/* Hero du restaurant */}
          <div className="relative rounded-2xl overflow-hidden mb-8">
            <img 
              src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop'} 
              alt={restaurant.name} 
              className="w-full h-72 sm:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">{restaurant.name}</h1>
                  <p className="text-white/80">{restaurant.cuisine_type || 'Cuisine variée'}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span>{restaurant.rating || 0}</span>
                      <span className="text-white/60">({restaurant.review_count || 0} avis)</span>
                    </div>
                    <span className="text-white/60">•</span>
                    <span className="font-medium">{restaurant.price_range || ''}</span>
                    <span className="text-white/60">•</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      restaurant.is_open 
                        ? 'bg-green-500/80 text-white' 
                        : 'bg-gray-500/80 text-white'
                    }`}>
                      {restaurant.is_open ? '🟢 Ouvert' : '🔴 Fermé'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-full transition ${
                    isFavorite 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
                >
                  {isFavorite ? <FaHeart className="text-xl" /> : <FaRegHeart className="text-xl" />}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'info' 
                  ? 'bg-primary-500 text-white' 
                  : `${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'services' 
                  ? 'bg-primary-500 text-white' 
                  : `${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('ambiance')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'ambiance' 
                  ? 'bg-primary-500 text-white' 
                  : `${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              Ambiance
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'map' 
                  ? 'bg-primary-500 text-white' 
                  : `${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              📍 Localisation
            </button>
          </div>

          {/* Contenu principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations */}
              {activeTab === 'info' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                >
                  <h2 className={`font-display text-xl font-bold ${isDark ? 'text-white' : 'text-darkText'} mb-3`}>
                    À propos
                  </h2>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                    {restaurant.description || 'Aucune description disponible.'}
                  </p>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {restaurant.phone && (
                      <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <FaPhone className="text-primary-500" />
                        <div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Téléphone</div>
                          <a href={`tel:${restaurant.phone}`} className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'} hover:text-primary-500`}>
                            {restaurant.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {restaurant.whatsapp && (
                      <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <FaWhatsapp className="text-green-500" />
                        <div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>WhatsApp</div>
                          <a href={`https://wa.me/${restaurant.whatsapp}`} className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'} hover:text-green-500`}>
                            {restaurant.whatsapp}
                          </a>
                        </div>
                      </div>
                    )}
                    {restaurant.opening_hours && (
                      <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} sm:col-span-2`}>
                        <FaClock className="text-primary-500" />
                        <div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Horaires</div>
                          <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{restaurant.opening_hours}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Services */}
              {activeTab === 'services' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                >
                  <h2 className={`font-display text-xl font-bold ${isDark ? 'text-white' : 'text-darkText'} mb-4`}>
                    Services
                  </h2>
                  {restaurant.services && restaurant.services.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {restaurant.services.map((service, index) => (
                        <span key={index} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                          isDark ? 'bg-primary-900/30 text-primary-300' : 'bg-primary-50 text-primary-600'
                        }`}>
                          {serviceIcons[service] || <FaUtensils />}
                          {service}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Aucun service renseigné</p>
                  )}
                </motion.div>
              )}

              {/* Ambiance */}
              {activeTab === 'ambiance' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                >
                  <h2 className={`font-display text-xl font-bold ${isDark ? 'text-white' : 'text-darkText'} mb-4`}>
                    Ambiance
                  </h2>
                  {restaurant.ambiance && restaurant.ambiance.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {restaurant.ambiance.map((item, index) => (
                        <span key={index} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                          isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600'
                        }`}>
                          {ambianceIcons[item] || <FaHeart />}
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Aucune ambiance renseignée</p>
                  )}
                </motion.div>
              )}

              {/* Localisation */}
              {activeTab === 'map' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                >
                  <h2 className={`font-display text-xl font-bold ${isDark ? 'text-white' : 'text-darkText'} mb-3`}>
                    📍 Localisation
                  </h2>
                  
                  <div className={`flex items-start gap-3 p-3 rounded-xl mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <FaMapMarkerAlt className="text-primary-500 mt-1" />
                    <div>
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {restaurant.address || 'Adresse non disponible'}
                      </div>
                      {restaurant.latitude && restaurant.longitude && (
                        <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Lat: {restaurant.latitude}, Lng: {restaurant.longitude}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => openGoogleMaps(restaurant.latitude, restaurant.longitude, restaurant.name)}
                      className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition flex items-center justify-center gap-2"
                    >
                      <FaRoute /> Itinéraire depuis ma position
                    </button>
                    
                    <button
                      onClick={() => openGoogleMapsView(restaurant.latitude, restaurant.longitude)}
                      className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
                    >
                      <FaMapMarkerAlt /> Voir sur Google Maps
                    </button>
                  </div>

                  <div className={`mt-4 rounded-xl overflow-hidden h-48 flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    {restaurant.latitude && restaurant.longitude ? (
                      <div className="text-center">
                        <FaMapMarkerAlt className="text-5xl text-primary-500 mx-auto mb-2" />
                        <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{restaurant.name}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{restaurant.address}</p>
                        <button
                          onClick={() => openGoogleMaps(restaurant.latitude, restaurant.longitude, restaurant.name)}
                          className="mt-2 text-sm text-primary-500 hover:text-primary-600 font-medium"
                        >
                          📍 Ouvrir l'itinéraire
                        </button>
                      </div>
                    ) : (
                      <p className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Coordonnées non disponibles</p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Colonne latérale - Actions */}
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h2 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-darkText'} mb-4`}>
                  Actions
                </h2>
                <div className="space-y-3">
                  {/* Bouton Réserver */}
                  <button
                    onClick={() => setShowReservation(true)}
                    className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <FaCalendarCheck /> Réserver
                  </button>
                  
                  <button 
                    onClick={() => openGoogleMaps(restaurant.latitude, restaurant.longitude, restaurant.name)}
                    className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition flex items-center justify-center gap-2"
                  >
                    <FaRoute /> Itinéraire
                  </button>
                  {restaurant.whatsapp && (
                    <a href={`https://wa.me/${restaurant.whatsapp}`} className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition flex items-center justify-center gap-2 block text-center">
                      <FaWhatsapp /> WhatsApp
                    </a>
                  )}
                  {restaurant.phone && (
                    <a href={`tel:${restaurant.phone}`} className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2 block text-center">
                      <FaPhone /> Appeler
                    </a>
                  )}
                  <button 
                    onClick={() => openGoogleMapsView(restaurant.latitude, restaurant.longitude)}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
                  >
                    <FaMapMarkerAlt /> Voir sur Google Maps
                  </button>
                </div>
              </div>

              {/* Partager */}
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h2 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-darkText'} mb-4`}>
                  Partager
                </h2>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: restaurant.name,
                        text: `Découvrez ${restaurant.name} sur RestoGo Bénin !`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('🔗 Lien copié !', 'success');
                    }
                  }}
                  className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaShare /> Partager ce restaurant
                </button>
              </div>
            </div>
          </div>

          {/* SECTION PHOTOS - Visible uniquement pour le propriétaire */}
          {isAuthenticated && user?.is_restaurateur && restaurant?.owner_id === user?.id && (
            <div className={`mt-8 p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className={`font-display text-xl font-bold ${isDark ? 'text-white' : 'text-darkText'} mb-3`}>
                📸 Photos du restaurant
              </h2>
              <PhotoManager restaurantId={id} />
            </div>
          )}

          {/* SECTION AVIS */}
          <div className="mt-8">
            <ReviewsSection restaurantId={id} />
          </div>
        </div>
      </main>

      {/* Modal de réservation */}
      <ReservationModal
        isOpen={showReservation}
        onClose={() => setShowReservation(false)}
        restaurant={restaurant}
      />

      <Footer />
    </AnimatedBackground>
  );
};

export default RestaurantDetail;