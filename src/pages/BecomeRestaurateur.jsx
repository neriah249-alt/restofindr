import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaStore, FaUtensils, FaMapMarkerAlt, FaPhone, FaWhatsapp, FaClock, FaImage, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

const BecomeRestaurateur = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [restaurantId, setRestaurantId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: 6.3601,
    longitude: 2.4413,
    cuisine_type: '',
    price_range: '',
    description: '',
    phone: '',
    whatsapp: '',
    opening_hours: '',
    services: [],
    ambiance: []
  });

  const cuisineTypes = ['Africain', 'Français', 'Italien', 'Asiatique', 'Fast Food', 'Fruits de mer', 'Béninois', 'Maquis', 'Végétarien'];
  const priceRanges = ['$ (0 - 5 000 FCFA)', '$$ (5 000 - 15 000 FCFA)', '$$$ (15 000 - 30 000 FCFA)', '$$$$ (30 000+ FCFA)'];
  const serviceOptions = ['Parking', 'WiFi', 'Climatisation', 'Terrasse', 'Musique Live', 'Livraison', 'À emporter', 'Piscine'];
  const ambianceOptions = ['Romantique', 'Calme', 'Festif', 'Détendu', 'Classe', 'Familial', 'Jeune', 'Vue sur mer'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...prev[name], value] 
          : prev[name].filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/restaurateur/restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erreur lors de l\'ajout du restaurant');
      }

      setRestaurantId(data.id);
      setSuccess('🎉 Restaurant ajouté avec succès !');
      showToast('✅ Restaurant ajouté avec succès !', 'success');
      
      // Redirection après 3 secondes
      setTimeout(() => {
        navigate('/my-restaurant');
      }, 3000);
    } catch (error) {
      setError(error.message);
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl shadow-2xl p-6 sm:p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="text-center mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-gray-700' : 'bg-primary-50'
              }`}>
                <FaStore className="text-2xl text-primary-500" />
              </div>
              <h1 className={`font-display text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-darkText'}`}>
                Ajouter mon restaurant
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                Remplissez les informations de votre restaurant
              </p>
            </div>

            {error && (
              <div className={`p-3 rounded-xl mb-4 ${
                isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-500'
              }`}>
                {error}
              </div>
            )}

            {success && (
              <div className={`p-4 rounded-xl mb-4 ${
                isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-50 text-green-700'
              }`}>
                <p className="font-medium">{success}</p>
                <p className={`text-sm mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  Redirection vers la gestion de votre restaurant...
                </p>
              </div>
            )}

            {/* ✅ NOUVEAU MESSAGE INFORMATIF */}
            {!success && (
              <div className={`p-4 rounded-xl mb-6 border-2 border-dashed ${
                isDark ? 'border-primary-500/50 bg-primary-900/20 text-primary-300' : 'border-primary-300 bg-primary-50 text-primary-700'
              }`}>
                <div className="flex items-start gap-3">
                  <FaImage className="text-2xl text-primary-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">📸 Ajoutez vos photos après la création</p>
                    <p className={`text-sm mt-1 ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                      Une fois votre restaurant créé, vous pourrez ajouter des photos depuis la page <strong>"Mon restaurant"</strong> dans votre tableau de bord.
                    </p>
                    <div className={`flex items-center gap-2 mt-2 text-xs ${
                      isDark ? 'text-primary-400' : 'text-primary-600'
                    }`}>
                      <FaCheckCircle />
                      <span>Créez votre restaurant</span>
                      <span className="mx-1">→</span>
                      <FaCheckCircle />
                      <span>Ajoutez des photos</span>
                      <span className="mx-1">→</span>
                      <FaCheckCircle />
                      <span>Attirez plus de clients</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nom du restaurant */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nom du restaurant *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                    }`}
                    placeholder="Ex: La Maison Dorée"
                  />
                </div>

                {/* Adresse */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Adresse *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                    }`}
                    placeholder="Ex: 123 Boulevard de la Mer, Cotonou"
                  />
                </div>

                {/* Localisation */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                      }`}
                    />
                  </div>
                </div>

                {/* Type de cuisine */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Type de cuisine *
                  </label>
                  <select
                    name="cuisine_type"
                    value={formData.cuisine_type}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <option value="">Sélectionnez un type</option>
                    {cuisineTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Fourchette de prix */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Fourchette de prix *
                  </label>
                  <select
                    name="price_range"
                    value={formData.price_range}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <option value="">Sélectionnez une fourchette</option>
                    {priceRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                    }`}
                    placeholder="Décrivez votre restaurant..."
                  />
                </div>

                {/* Téléphone et WhatsApp */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                      }`}
                      placeholder="+229 XX XX XX XX"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                      }`}
                      placeholder="+229 XX XX XX XX"
                    />
                  </div>
                </div>

                {/* Horaires d'ouverture */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Horaires d'ouverture
                  </label>
                  <input
                    type="text"
                    name="opening_hours"
                    value={formData.opening_hours}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                    }`}
                    placeholder="Ex: Lun - Sam: 11:00 - 22:30"
                  />
                </div>

                {/* Services */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Services
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {serviceOptions.map(service => (
                      <label key={service} className={`flex items-center gap-2 text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <input
                          type="checkbox"
                          name="services"
                          value={service}
                          checked={formData.services.includes(service)}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary-500 rounded"
                        />
                        {service}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ambiance */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Ambiance
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {ambianceOptions.map(ambiance => (
                      <label key={ambiance} className={`flex items-center gap-2 text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <input
                          type="checkbox"
                          name="ambiance"
                          value={ambiance}
                          checked={formData.ambiance.includes(ambiance)}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary-500 rounded"
                        />
                        {ambiance}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition disabled:opacity-70"
                >
                  {isLoading ? 'Ajout en cours...' : 'Ajouter mon restaurant'}
                </button>
              </form>
            )}

            {/* Message après succès */}
            {success && (
              <div className="text-center mt-4">
                <button
                  onClick={() => navigate('/my-restaurant')}
                  className="bg-primary-500 text-white px-6 py-2 rounded-xl hover:bg-primary-600 transition"
                >
                  📸 Ajouter des photos maintenant
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default BecomeRestaurateur;