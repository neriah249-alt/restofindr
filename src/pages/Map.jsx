import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaSearch, FaTimes, FaUtensils, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import 'leaflet/dist/leaflet.css';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

// Correction des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Composant pour centrer la carte
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, map]);
  return null;
};

// Marqueur personnalisé
const createCustomIcon = (color = '#FF7A00') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      border: 3px solid white;
      transition: all 0.3s;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const Map = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [filterCity, setFilterCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState([6.3601, 2.4413]);
  const [mapZoom, setMapZoom] = useState(13);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extraire la ville depuis l'adresse
  const extractCity = (address) => {
    if (!address) return 'Bénin';
    const lower = address.toLowerCase();
    if (lower.includes('cotonou')) return 'Cotonou';
    if (lower.includes('abomey-calavi') || lower.includes('abomey calavi')) return 'Abomey-Calavi';
    return 'Bénin';
  };

  // Données de démonstration (fallback)
  const demoRestaurants = [
    { 
      id: 1, 
      name: "La Maison Dorée", 
      cuisine: "Française • Gastronomique", 
      price: "15 000 - 25 000 FCFA",
      lat: 6.3601, 
      lng: 2.4413, 
      city: "Cotonou",
      color: "#FF7A00",
      rating: 4.9,
      reviews: 127,
      address: "123 Boulevard de la Mer, Cotonou",
      description: "Cuisine raffinée dans un cadre élégant",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
      open: true
    },
    { 
      id: 2, 
      name: "Le Jardin Secret", 
      cuisine: "Africaine • Traditionnelle", 
      price: "8 000 - 15 000 FCFA",
      lat: 6.4488, 
      lng: 2.3577, 
      city: "Abomey-Calavi",
      color: "#22C55E",
      rating: 4.8,
      reviews: 98,
      address: "Route de l'Amitié, Abomey-Calavi",
      description: "Cuisine authentique dans un jardin tropical",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
      open: true
    },
    { 
      id: 3, 
      name: "Ocean View", 
      cuisine: "Fruits de mer • Méditerranéen", 
      price: "12 000 - 20 000 FCFA",
      lat: 6.3713, 
      lng: 2.4375, 
      city: "Cotonou",
      color: "#3B82F6",
      rating: 4.7,
      reviews: 156,
      address: "Plage de Fidjrossè, Cotonou",
      description: "Vue imprenable sur l'océan",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
      open: false
    },
    { 
      id: 4, 
      name: "Chez Maman Bénin", 
      cuisine: "Béninoise • Maquis", 
      price: "5 000 - 10 000 FCFA",
      lat: 6.4352, 
      lng: 2.3621, 
      city: "Abomey-Calavi",
      color: "#EAB308",
      rating: 4.6,
      reviews: 203,
      address: "Carrefour Akpakpa, Abomey-Calavi",
      description: "Cuisine familiale traditionnelle",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
      open: true
    },
    { 
      id: 5, 
      name: "Maquis Chez Nous", 
      cuisine: "Maquis • Ambiance festive", 
      price: "6 000 - 12 000 FCFA",
      lat: 6.3555, 
      lng: 2.4288, 
      city: "Cotonou",
      color: "#F97316",
      rating: 4.5,
      reviews: 89,
      address: "Avenue Jean-Paul II, Cotonou",
      description: "Ambiance chaleureuse et conviviale",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
      open: true
    },
    { 
      id: 6, 
      name: "Pizza Paradiso", 
      cuisine: "Italien • Pizzeria", 
      price: "7 000 - 14 000 FCFA",
      lat: 6.3784, 
      lng: 2.4311, 
      city: "Cotonou",
      color: "#EF4444",
      rating: 4.4,
      reviews: 178,
      address: "Carrefour Arconville, Cotonou",
      description: "Pizzas authentiques au feu de bois",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
      open: true
    },
  ];

  // Charger les restaurants depuis le backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/restaurants`);
        if (response.ok) {
          const data = await response.json();
          // Transformer les données du backend
          const formattedData = data.map(r => {
            const city = extractCity(r.address);
            return {
              id: r.id,
              name: r.name,
              cuisine: r.cuisine_type || 'Cuisine variée',
              price: r.price_range || 'Prix non spécifié',
              lat: r.latitude || 6.3601,
              lng: r.longitude || 2.4413,
              city: city,
              color: city === 'Cotonou' ? '#FF7A00' : 
                      city === 'Abomey-Calavi' ? '#22C55E' : '#6B7280',
              rating: r.rating || 0,
              reviews: r.review_count || 0,
              address: r.address || 'Adresse non spécifiée',
              description: r.description || '',
              image: r.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
              open: r.is_open !== undefined ? r.is_open : true,
              // Garder les champs originaux pour la recherche
              _original: r
            };
          });
          setRestaurants(formattedData);
        } else {
          console.warn('Utilisation des données de démonstration pour la carte');
          setRestaurants(demoRestaurants);
        }
      } catch (error) {
        console.error('Erreur de chargement des restaurants:', error);
        setRestaurants(demoRestaurants);
        setError('Impossible de charger les restaurants. Affichage des données de démonstration.');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Filtrage combiné (ville + recherche)
  const filteredRestaurants = restaurants.filter(r => {
    // Filtre par ville
    if (filterCity !== 'all' && r.city !== filterCity) return false;
    
    // Filtre par recherche (nom, cuisine, ville, description)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const searchFields = [
        r.name?.toLowerCase() || '',
        r.cuisine?.toLowerCase() || '',
        r.city?.toLowerCase() || '',
        r.description?.toLowerCase() || '',
        r.address?.toLowerCase() || ''
      ];
      return searchFields.some(field => field.includes(query));
    }
    
    return true;
  });

  const handleCityFilter = (city) => {
    setFilterCity(city);
    const center = city === 'all' ? [6.3601, 2.4413] : 
                   city === 'Cotonou' ? [6.3601, 2.4413] : [6.4488, 2.3577];
    setMapCenter(center);
    setMapZoom(city === 'all' ? 12 : 14);
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(selectedRestaurant?.id === restaurant.id ? null : restaurant);
    setMapCenter([restaurant.lat, restaurant.lng]);
    setMapZoom(15);
  };

  if (loading) {
    return (
      <AnimatedBackground>
        <Navbar />
        <main className="pt-24 pb-12 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Chargement de la carte...</p>
          </div>
        </main>
        <Footer />
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <Navbar />
      <main className="pt-24 pb-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold text-darkText dark:text-white">Carte des restaurants</h1>
              <p className="text-gray-500 dark:text-gray-400">Cotonou & Abomey-Calavi</p>
              {error && <p className="text-yellow-500 text-sm mt-1">{error}</p>}
              {!loading && restaurants.length > 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {filteredRestaurants.length} restaurants sur {restaurants.length} affichés
                </p>
              )}
            </div>
            
            {/* Filtres */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleCityFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filterCity === 'all' 
                    ? 'bg-primary-500 text-white shadow-md' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => handleCityFilter('Cotonou')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filterCity === 'Cotonou' 
                    ? 'bg-primary-500 text-white shadow-md' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Cotonou
              </button>
              <button
                onClick={() => handleCityFilter('Abomey-Calavi')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filterCity === 'Abomey-Calavi' 
                    ? 'bg-primary-500 text-white shadow-md' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Abomey-Calavi
              </button>
            </div>
          </div>
          
          {/* Barre de recherche */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <FaSearch className="text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Chercher un restaurant, une cuisine, une ville..."
                className="flex-1 outline-none text-gray-700 dark:text-white bg-transparent"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            {/* Suggestions de recherche */}
            {searchQuery && filteredRestaurants.length === 0 && !loading && (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Aucun restaurant trouvé pour "{searchQuery}"
              </p>
            )}
          </div>

          {/* Carte Leaflet */}
          <div className="rounded-2xl overflow-hidden shadow-lg relative z-0" style={{ height: '500px' }}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <MapController center={mapCenter} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Marqueurs des restaurants */}
              {filteredRestaurants.map((restaurant) => (
                <Marker
                  key={restaurant.id}
                  position={[restaurant.lat, restaurant.lng]}
                  icon={createCustomIcon(restaurant.color)}
                  eventHandlers={{
                    click: () => handleRestaurantClick(restaurant),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 max-w-xs">
                      <img 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <h3 className="font-display font-semibold text-lg">{restaurant.name}</h3>
                      <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <FaStar className="text-yellow-400" />
                        <span className="font-medium">{restaurant.rating}</span>
                        <span className="text-gray-400 text-sm">({restaurant.reviews})</span>
                      </div>
                      <p className="text-sm font-medium text-primary-500 mt-1">{restaurant.price}</p>
                      <p className="text-xs text-gray-400 mt-1">{restaurant.address}</p>
                      <button 
                        className="mt-2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm hover:bg-primary-600 transition w-full"
                        onClick={() => console.log('Voir détails', restaurant.id)}
                      >
                        Voir détails
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Liste des restaurants */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((resto) => (
                <motion.button
                  key={resto.id}
                  whileHover={{ y: -4 }}
                  onClick={() => handleRestaurantClick(resto)}
                  className={`p-3 rounded-xl text-center transition ${
                    selectedRestaurant?.id === resto.id 
                      ? 'bg-primary-500 text-white shadow-lg' 
                      : 'bg-white dark:bg-gray-800 hover:shadow-lg'
                  }`}
                >
                  <div className={`text-xs font-medium ${selectedRestaurant?.id === resto.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {resto.name}
                  </div>
                  <div className={`text-xs ${selectedRestaurant?.id === resto.id ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}>
                    {resto.city}
                  </div>
                  <div className={`text-xs mt-1 ${selectedRestaurant?.id === resto.id ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}`}>
                    <FaStar className={`inline ${selectedRestaurant?.id === resto.id ? 'text-white' : 'text-yellow-400'}`} size={10} />
                    {resto.rating}
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="col-span-full text-center py-6 text-gray-400 dark:text-gray-500">
                Aucun restaurant trouvé
              </div>
            )}
          </div>

          {/* Légende */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-primary-500" /> Cotonou
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" /> Abomey-Calavi
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> Plage
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" /> Pizzeria
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default Map;