import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaSearch, FaFilter, FaMapMarkerAlt, FaStar, FaClock, 
  FaSpinner, FaLocationArrow, FaMagic, FaMicrophone,
  FaWallet, FaUsers, FaUtensils
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

const Search = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationalQuery, setConversationalQuery] = useState('');
  const [filters, setFilters] = useState({
    price: 'all',
    city: 'all',
    cuisine: 'all',
    openNow: false
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [nearbyInfo, setNearbyInfo] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [searchAnalysis, setSearchAnalysis] = useState(null);

  // Détecter si on vient de "Près de moi"
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nearby = params.get('nearby');
    const lat = params.get('lat');
    const lng = params.get('lng');
    const q = params.get('q');
    
    if (q) {
      setSearchQuery(q);
      handleSearch(q);
    } else if (nearby === 'true' && lat && lng) {
      searchNearby(parseFloat(lat), parseFloat(lng));
    } else {
      fetchAllRestaurants();
    }
  }, []);

  const fetchAllRestaurants = async () => {
    setLoading(true);
    setError(null);
    setNearbyInfo(null);
    setSearchMessage('');
    try {
      const response = await fetch(`${API_URL}/restaurants`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setSearched(true);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les restaurants');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RECHERCHE CONVERSATIONNELLE
  // ============================================
  const handleConversationalSearch = async () => {
    if (!conversationalQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    setSearchMessage('');
    setSearchAnalysis(null);
    setNearbyInfo(null);
    
    try {
      const response = await fetch(`${API_URL}/search/conversational?query=${encodeURIComponent(conversationalQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchMessage(data.message);
        setSearchAnalysis(data.analysis);
        
        // Formater les résultats pour l'affichage
        const formatted = data.results.map(r => ({
          ...r,
          _score: r.score,
          _match_cuisine: r.match_cuisine,
          _match_ambiance: r.match_ambiance,
          _match_price: r.match_price
        }));
        setResults(formatted);
        setSearched(true);
        
        console.log('🔍 Analyse de la recherche:', data.analysis);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Erreur lors de la recherche');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de rechercher');
    } finally {
      setIsSearching(false);
    }
  };

  // ============================================
  // RECHERCHE CLASSIQUE
  // ============================================
  const handleSearch = async (query = searchQuery) => {
    setLoading(true);
    setSearched(true);
    setError(null);
    setNearbyInfo(null);
    setSearchMessage('');
    setSearchAnalysis(null);
    
    try {
      if (!query.trim() && filters.city === 'all' && filters.cuisine === 'all') {
        await fetchAllRestaurants();
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (query.trim()) params.append('q', query.trim());
      if (filters.city !== 'all') params.append('city', filters.city);
      if (filters.cuisine !== 'all') params.append('cuisine', filters.cuisine);
      
      const response = await fetch(`${API_URL}/restaurants/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        setError('Erreur lors de la recherche');
        setResults([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de rechercher des restaurants');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // GÉOLOCALISATION
  // ============================================
  const handleFindNearby = () => {
    setIsLocating(true);
    setError(null);
    setSearchMessage('');
    setSearchAnalysis(null);
    
    if (!navigator.geolocation) {
      setError('Votre navigateur ne supporte pas la géolocalisation');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Position trouvée:', latitude, longitude);
        searchNearby(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        if (error.code === 1) {
          setError('⚠️ Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur.');
        } else {
          setError('⚠️ Impossible de récupérer votre position. Vérifiez votre connexion.');
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const searchNearby = async (lat, lng) => {
    setLoading(true);
    setSearched(true);
    setError(null);
    setNearbyInfo({ lat, lng });
    setSearchMessage('');
    setSearchAnalysis(null);
    
    try {
      const response = await fetch(`${API_URL}/restaurants/nearby?lat=${lat}&lng=${lng}&radius=10`);
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map(item => ({
          ...item.restaurant,
          distance: `${item.distance} km`,
          _distance: item.distance
        }));
        setResults(formatted);
        if (formatted.length === 0) {
          setError('Aucun restaurant trouvé à proximité');
        }
      } else {
        setError('Erreur lors de la recherche à proximité');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de trouver des restaurants à proximité');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FILTRES
  // ============================================
  const filterByPrice = (items) => {
    if (filters.price === 'all') return items;
    return items.filter(r => {
      if (filters.price === '$') {
        return r.price_range && (r.price_range.includes('0 - 5 000') || r.price_range.includes('5 000 - 10 000'));
      }
      if (filters.price === '$$') {
        return r.price_range && (r.price_range.includes('10 000 - 15 000') || r.price_range.includes('15 000 - 20 000'));
      }
      if (filters.price === '$$$') {
        return r.price_range && (r.price_range.includes('20 000 - 30 000') || r.price_range.includes('30 000+'));
      }
      return true;
    });
  };

  const filterByOpenNow = (items) => {
    if (!filters.openNow) return items;
    return items.filter(r => r.is_open === true);
  };

  const displayedResults = filterByPrice(filterByOpenNow(results));

  // ============================================
  // RENDU
  // ============================================
  return (
    <AnimatedBackground>
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ===== RECHERCHE CONVERSATIONNELLE ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl shadow-sm px-4 py-2 border border-primary-100">
                  <FaMagic className="text-primary-400 mr-3 text-lg" />
                  <input
                    type="text"
                    value={conversationalQuery}
                    onChange={(e) => setConversationalQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleConversationalSearch()}
                    placeholder="✨ Ex: 'Je cherche un restaurant romantique pour 2 personnes avec 15 000 FCFA à Cotonou'"
                    className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400 text-sm"
                  />
                  <button
                    onClick={handleConversationalSearch}
                    disabled={isSearching || !conversationalQuery.trim()}
                    className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {isSearching ? <FaSpinner className="animate-spin" /> : <FaMagic />}
                    <span className="hidden sm:inline">Rechercher</span>
                  </button>
                </div>
              </div>
              
              {/* Message de recherche */}
              {searchMessage && (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-primary-500">✨</span>
                  {searchMessage}
                </div>
              )}
              
              {/* Analyse de la recherche */}
              {searchAnalysis && searchAnalysis.keywords && searchAnalysis.keywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-400">🔍 Mots-clés détectés :</span>
                  {searchAnalysis.keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full">
                      {kw}
                    </span>
                  ))}
                  {searchAnalysis.nb_personnes > 1 && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                      👥 {searchAnalysis.nb_personnes} personnes
                    </span>
                  )}
                  {searchAnalysis.budget_total && (
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full">
                      💰 {searchAnalysis.budget_total.toLocaleString()} FCFA
                    </span>
                  )}
                </div>
              )}
              
              {/* Suggestions de recherche conversationnelle */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-400 mr-1">Exemples :</span>
                {[
                  "Restaurant romantique pour 2",
                  "Maquis avec musique pas cher",
                  "Vue sur mer à Cotonou",
                  "Restaurant calme pour famille"
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setConversationalQuery(example);
                      setTimeout(() => handleConversationalSearch(), 300);
                    }}
                    className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-primary-50 transition"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ===== BARRE DE RECHERCHE CLASSIQUE ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center bg-white rounded-2xl shadow-lg px-4 py-3">
                <FaSearch className="text-gray-400 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Rechercher un restaurant, une cuisine, une ville..."
                  className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
                />
                <button 
                  onClick={() => handleSearch()}
                  className="bg-primary-500 text-white px-6 py-2 rounded-xl hover:bg-primary-600 transition"
                >
                  Rechercher
                </button>
              </div>
              <button className="bg-white rounded-2xl shadow-lg px-6 py-3 hover:shadow-xl transition flex items-center gap-2">
                <FaFilter className="text-primary-500" />
                <span className="hidden sm:inline">Filtres</span>
              </button>
            </div>
          </motion.div>

          {/* ===== BOUTON "AUTOUR DE MOI" ===== */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <button
              onClick={handleFindNearby}
              disabled={isLocating}
              className="flex items-center gap-3 px-5 py-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLocating ? (
                <>
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Recherche de votre position...</span>
                </>
              ) : (
                <>
                  <FaLocationArrow className="text-lg" />
                  <span className="font-medium">📍 Restaurants autour de moi</span>
                </>
              )}
            </button>
            {nearbyInfo && (
              <p className="text-xs text-gray-400 mt-1 ml-1">
                Restaurants à proximité de votre position
              </p>
            )}
          </motion.div>

          {/* ===== FILTRES ===== */}
          <div className="flex flex-wrap gap-3 mb-8 overflow-x-auto pb-4">
            <button 
              onClick={() => setFilters({...filters, city: 'all'})}
              className={`px-4 py-2 rounded-full text-sm transition whitespace-nowrap ${
                filters.city === 'all' 
                  ? 'bg-primary-500 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              Toutes les villes
            </button>
            <button 
              onClick={() => setFilters({...filters, city: 'Cotonou'})}
              className={`px-4 py-2 rounded-full text-sm transition whitespace-nowrap ${
                filters.city === 'Cotonou' 
                  ? 'bg-primary-500 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              Cotonou
            </button>
            <button 
              onClick={() => setFilters({...filters, city: 'Abomey-Calavi'})}
              className={`px-4 py-2 rounded-full text-sm transition whitespace-nowrap ${
                filters.city === 'Abomey-Calavi' 
                  ? 'bg-primary-500 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              Abomey-Calavi
            </button>
            <button 
              onClick={() => setFilters({...filters, price: 'all'})}
              className={`px-4 py-2 rounded-full text-sm transition whitespace-nowrap ${
                filters.price === 'all' 
                  ? 'bg-primary-500 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              Tous prix
            </button>
            <button 
              onClick={() => setFilters({...filters, price: '$'})}
              className={`px-4 py-2 rounded-full text-sm transition whitespace-nowrap ${
                filters.price === '$' 
                  ? 'bg-primary-500 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              {'<'} 10 000 FCFA
            </button>
            <button 
              onClick={() => setFilters({...filters, price: '$$'})}
              className={`px-4 py-2 rounded-full text-sm transition whitespace-nowrap ${
                filters.price === '$$' 
                  ? 'bg-primary-500 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              10 000 - 20 000 FCFA
            </button>
            <button 
              onClick={() => setFilters({...filters, price: '$$$'})}
              className={`px-4 py-2 rounded-full text-sm transition whitespace-nowrap ${
                filters.price === '$$$' 
                  ? 'bg-primary-500 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              {'>'} 20 000 FCFA
            </button>
            <button 
              onClick={() => setFilters({...filters, openNow: !filters.openNow})}
              className={`px-4 py-2 rounded-full text-sm transition whitespace-nowrap ${
                filters.openNow 
                  ? 'bg-green-500 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              <FaClock className={`inline mr-1 ${filters.openNow ? 'text-white' : 'text-green-500'}`} />
              Ouverts maintenant
            </button>
          </div>

          {/* ===== INFO PROXIMITÉ ===== */}
          {nearbyInfo && (
            <div className="bg-primary-50 p-3 rounded-xl mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-primary-500" />
              <span className="text-sm text-gray-700">
                Restaurants à proximité de votre position
              </span>
              <button 
                onClick={() => {
                  setNearbyInfo(null);
                  fetchAllRestaurants();
                }}
                className="ml-auto text-sm text-primary-500 hover:text-primary-600"
              >
                ✕
              </button>
            </div>
          )}

          {/* ===== ERREURS ===== */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* ===== COMPTEUR ===== */}
          {searched && (
            <div className="mb-4">
              <p className="text-gray-500 text-sm">
                {loading ? 'Recherche en cours...' : `${displayedResults.length} restaurants trouvés`}
              </p>
            </div>
          )}

          {/* ===== RÉSULTATS ===== */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedResults.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => window.location.href = `/restaurant/${restaurant.id}`}
                  className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer bg-white"
                >
                  <div className="relative">
                    <img 
                      src={restaurant.photos && restaurant.photos.length > 0 
                        ? `http://localhost:8000${restaurant.photos[0].image_url}` 
                        : restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'} 
                      alt={restaurant.name} 
                      className="w-full h-48 object-cover" 
                    />
                    {/* Score de pertinence (recherche conversationnelle) */}
                    {restaurant._score !== undefined && restaurant._score > 0 && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-primary-500 text-white rounded-full text-xs font-medium">
                        {restaurant._score}% match
                      </div>
                    )}
                    {/* Badges de correspondance */}
                    <div className="absolute bottom-3 left-3 flex gap-1">
                      {restaurant._match_cuisine && (
                        <span className="px-2 py-0.5 bg-green-500/90 text-white text-[10px] rounded-full">🍽️</span>
                      )}
                      {restaurant._match_ambiance && (
                        <span className="px-2 py-0.5 bg-purple-500/90 text-white text-[10px] rounded-full">✨</span>
                      )}
                      {restaurant._match_price && (
                        <span className="px-2 py-0.5 bg-blue-500/90 text-white text-[10px] rounded-full">💰</span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display font-semibold text-lg text-darkText">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {restaurant.cuisine_type || 'Cuisine variée'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-full">
                        <FaStar className="text-yellow-400 text-sm" />
                        <span className="text-sm font-medium text-darkText">
                          {restaurant.rating || 0}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({restaurant.review_count || 0})
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <FaMapMarkerAlt className="text-primary-500" />
                        <span className="truncate max-w-[120px]">{restaurant.address || 'Adresse'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-primary-500">{restaurant.price_range || ''}</span>
                      </div>
                      {restaurant.distance && (
                        <span className="text-xs text-blue-500">📍 {restaurant.distance}</span>
                      )}
                      {restaurant.is_open ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ouvert</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Fermé</span>
                      )}
                    </div>
                    {/* Budget intelligent (si disponible) */}
                    {restaurant.price_range && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <FaWallet className="text-primary-400" />
                        <span>À partir de {restaurant.price_range}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ===== AUCUN RÉSULTAT ===== */}
          {searched && displayedResults.length === 0 && !loading && !error && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-display text-darkText">
                Aucun résultat trouvé
              </h3>
              <p className="text-gray-500 mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <button
                onClick={handleFindNearby}
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                📍 Trouver des restaurants autour de moi
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default Search;