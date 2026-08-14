import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FaUtensils, FaMapMarkerAlt, FaStar, FaUsers, 
  FaArrowRight, FaSearch, FaHeart, FaCalendarCheck,
  FaWifi, FaParking, FaSnowflake, FaMusic, FaUserCircle
} from 'react-icons/fa';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import PopularRestaurants from '../components/home/PopularRestaurants';
import CategoriesSection from '../components/home/CategoriesSection';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Fonctions interactives pour les fonctionnalités
  const handleFeatureClick = (feature) => {
    if (!isAuthenticated) {
      showToast('🔒 Veuillez vous connecter pour accéder à cette fonctionnalité', 'warning');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }
    
    const routes = {
      'Recherche intelligente': '/search',
      'Favoris': '/favorites',
      'Géolocalisation': '/search?nearby=true',
      'Réservations': '/search'
    };
    
    navigate(routes[feature] || '/search');
    showToast(`🔍 ${feature} - Chargement...`, 'info');
  };

  const features = [
    { 
      icon: <FaSearch />, 
      title: 'Recherche intelligente', 
      desc: 'Trouvez le restaurant parfait selon vos critères',
      action: () => handleFeatureClick('Recherche intelligente')
    },
    { 
      icon: <FaHeart />, 
      title: 'Favoris', 
      desc: 'Sauvegardez vos restaurants préférés',
      action: () => handleFeatureClick('Favoris')
    },
    { 
      icon: <FaMapMarkerAlt />, 
      title: 'Géolocalisation', 
      desc: 'Découvrez les restaurants près de chez vous',
      action: () => handleFeatureClick('Géolocalisation')
    },
    { 
      icon: <FaCalendarCheck />, 
      title: 'Réservations', 
      desc: 'Réservez votre table en quelques clics',
      action: () => handleFeatureClick('Réservations')
    },
  ];

  const stats = [
    { value: '250+', label: 'Restaurants', icon: <FaUtensils /> },
    { value: '4.8', label: 'Note moyenne', icon: <FaStar /> },
    { value: '500+', label: 'Utilisateurs', icon: <FaUsers /> },
    { value: '2', label: 'Villes', icon: <FaMapMarkerAlt /> },
  ];

  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <AnimatedBackground>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Texte */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6">
                  <span className="text-xs font-semibold text-primary-500">BÉNIN</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">Cotonou & Abomey-Calavi</span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-darkText">
                  Découvrez les meilleurs
                  <span className="text-primary-500 block">restaurants du Bénin</span>
                </h1>

                <p className="text-lg text-gray-600 mb-8 max-w-lg">
                  Trouvez le restaurant parfait selon vos envies, votre budget et votre humeur. 
                  Explorez une sélection unique de restaurants à Cotonou et Abomey-Calavi.
                </p>

                {/* Boutons selon authentification */}
                {isAuthenticated ? (
                  <div className="flex flex-wrap gap-4">
                    <Link to="/dashboard">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary-500 text-white px-8 py-4 rounded-full font-medium hover:bg-primary-600 transition shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <FaUserCircle className="text-xl" />
                        Mon espace
                      </motion.button>
                    </Link>
                    <Link to="/search">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition bg-white text-gray-700 hover:bg-gray-50"
                      >
                        Explorer
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    <Link to="/login">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary-500 text-white px-8 py-4 rounded-full font-medium hover:bg-primary-600 transition shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        Commencer
                        <FaArrowRight />
                      </motion.button>
                    </Link>
                    <Link to="/register">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition bg-white text-gray-700 hover:bg-gray-50"
                      >
                        Créer mon compte
                      </motion.button>
                    </Link>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center cursor-pointer transition-all duration-200"
                    >
                      <div className="text-2xl text-primary-500 flex justify-center">{stat.icon}</div>
                      <div className="text-xl font-bold text-darkText">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80" 
                    alt="Restaurant"
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg cursor-pointer"
                    onClick={() => navigate('/search')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-500">
                        <FaStar />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-darkText">
                          4.8 / 5
                        </div>
                        <div className="text-xs text-gray-500">
                          Note moyenne
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="absolute -bottom-6 -right-6 rounded-2xl shadow-xl p-4 bg-white">
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <FaWifi className="text-primary-500" /> WiFi
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <FaParking className="text-primary-500" /> Parking
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <FaSnowflake className="text-primary-500" /> Clim
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <FaMusic className="text-primary-500" /> Live
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features - INTERACTIFS */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4 text-darkText">
                Pourquoi choisir RestoGo ?
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Une plateforme conçue pour vous offrir la meilleure expérience culinaire au Bénin
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={feature.action}
                  className="rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white hover:bg-gray-50"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-primary-500 mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 bg-primary-50 group-hover:bg-primary-100">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2 text-darkText">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {feature.desc}
                  </p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs text-primary-500 font-medium">
                      Cliquez pour explorer →
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <CategoriesSection />
        <PopularRestaurants />

        {/* Call to Action - Visible seulement si non connecté */}
        {!isAuthenticated && (
          <section className="py-20 bg-primary-500">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                  Prêt à découvrir les meilleurs restaurants ?
                </h2>
                <p className="text-white/80 text-lg mb-8">
                  Rejoignez RestoGo Bénin et commencez à explorer une sélection unique de restaurants
                </p>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-primary-500 px-10 py-4 rounded-full font-bold hover:bg-gray-50 transition shadow-xl"
                  >
                    Créer mon compte gratuitement
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* Section "Mon espace" - Visible seulement si connecté */}
        {isAuthenticated && (
          <section className="py-20 bg-green-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-2xl font-bold">
                    {userInitials}
                  </div>
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-darkText">
                  Bienvenue, {user?.name || 'Utilisateur'} ! 👋
                </h2>
                <p className="text-lg mb-8 text-gray-600">
                  Accédez à vos favoris, gérez vos restaurants et découvrez de nouvelles adresses.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-primary-500 text-white px-8 py-3 rounded-full font-medium hover:bg-primary-600 transition shadow-lg"
                    >
                      Accéder à mon espace
                    </motion.button>
                  </Link>
                  <Link to="/search">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition bg-white text-gray-700 hover:bg-gray-50"
                    >
                      Explorer les restaurants
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default Home;