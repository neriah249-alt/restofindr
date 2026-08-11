import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaSlidersH, FaUtensils, FaCheckCircle, FaStar, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '../ui/Autocomplete';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const navigate = useNavigate();

  const trendingSearches = [
    'Romantique',
    'Moins de 6000 FCFA',
    'Maquis',
    'Vue sur mer',
    'Anniversaire'
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNearby = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Votre navigateur ne supporte pas la géolocalisation');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Position trouvée:', latitude, longitude);
        window.location.href = `/search?nearby=true&lat=${latitude}&lng=${longitude}`;
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Impossible de récupérer votre position. Veuillez activer la géolocalisation.');
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleTrendingClick = (term) => {
    setSearchQuery(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleAutocompleteSelect = (suggestion) => {
    if (suggestion.id) {
      navigate(`/restaurant/${suggestion.id}`);
    } else if (suggestion.name) {
      navigate(`/search?q=${encodeURIComponent(suggestion.name)}`);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="container-custom relative z-10 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft mb-8"
          >
            <FaCheckCircle className="text-primary-500" />
            <span className="text-sm text-gray-600">
              <span className="font-semibold">COTONOU & ABOMEY-CALAVI</span> — Découvrez les meilleurs restaurants
            </span>
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-darkText leading-tight mb-6"
          >
            Trouvez votre prochaine
            <span className="text-primary-500 block">expérience culinaire</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 mb-10 max-w-2xl"
          >
            Explorez les meilleurs restaurants autour de vous selon vos envies, 
            votre budget et votre humeur.
          </motion.p>

          {/* Barre de recherche */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-large p-2 mb-6"
          >
            {/* Desktop : tout sur une ligne */}
            <div className="hidden md:flex flex-row items-stretch gap-2">
              <div className="flex-1">
                <Autocomplete
                  placeholder="Ex : Restaurant romantique"
                  onSelect={handleAutocompleteSelect}
                />
              </div>
              
              <button 
                onClick={handleNearby}
                disabled={isLoadingLocation}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl transition disabled:opacity-50 whitespace-nowrap"
              >
                {isLoadingLocation ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaMapMarkerAlt />
                )}
                <span>{isLoadingLocation ? 'Localisation...' : 'Ma position'}</span>
              </button>
              
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition whitespace-nowrap">
                <FaSlidersH />
                <span>Filtres</span>
              </button>
              
              <button 
                onClick={handleSearch}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition whitespace-nowrap"
              >
                Rechercher
              </button>
            </div>

            {/* Mobile : recherche sur une ligne, boutons en dessous */}
            <div className="md:hidden flex flex-col gap-2">
              <div className="flex-1">
                <Autocomplete
                  placeholder="Ex : Restaurant romantique"
                  onSelect={handleAutocompleteSelect}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleNearby}
                  disabled={isLoadingLocation}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl transition disabled:opacity-50 text-sm"
                >
                  {isLoadingLocation ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaMapMarkerAlt />
                  )}
                  <span>{isLoadingLocation ? 'Localisation...' : '📍 Position'}</span>
                </button>
                
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition text-sm">
                  <FaSlidersH />
                  <span>Filtres</span>
                </button>
                
                <button 
                  onClick={handleSearch}
                  className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition text-sm"
                >
                  Rechercher
                </button>
              </div>
            </div>
          </motion.div>

          {/* Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8"
          >
            <div className="flex items-center space-x-2">
              <FaUtensils className="text-primary-500" />
              <span className="text-sm text-gray-600">
                <span className="font-semibold">250+</span> restaurants vérifiés
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FaStar className="text-gold" />
              <span className="text-sm text-gray-600">
                <span className="font-semibold">4.8</span> note moyenne
              </span>
            </div>
          </motion.div>

          {/* Tendances */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p className="text-sm text-gray-500 mb-3">Tendances :</p>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleTrendingClick(term)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full text-xs sm:text-sm text-gray-700 
                           hover:bg-primary-50 hover:text-primary-600 transition-all duration-300
                           shadow-soft hover:shadow-medium hover:scale-105"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;