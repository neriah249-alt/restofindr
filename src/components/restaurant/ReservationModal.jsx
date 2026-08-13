import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaWhatsapp, FaCalendar, FaClock, FaUsers, FaPhone } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

// ✅ CORRECTION
const API_URL = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : 'http://localhost:8000/api';

const ReservationModal = ({ isOpen, onClose, restaurant }) => {
  const { token, user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '19:00',
    guests: 2,
    phone: user?.phone || '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast('🔒 Veuillez vous connecter pour réserver', 'warning');
      return;
    }

    if (!formData.date) {
      showToast('⚠️ Veuillez sélectionner une date', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/restaurants/${restaurant.id}/reservation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        showToast('✅ Demande de réservation envoyée !', 'success');
        // Ouvrir WhatsApp
        window.open(data.whatsapp_url, '_blank');
        setTimeout(() => {
          onClose();
          setFormData({
            date: '',
            time: '19:00',
            guests: 2,
            phone: user?.phone || '',
            message: ''
          });
        }, 1000);
      } else {
        showToast('❌ Erreur lors de la réservation', 'error');
      }
    } catch (error) {
      showToast('❌ Erreur de connexion', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`w-full max-w-md rounded-3xl shadow-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            {/* En-tête */}
            <div className="flex justify-between items-center mb-4">
              <h2 className={`font-display text-xl font-bold ${isDark ? 'text-white' : 'text-darkText'}`}>
                📅 Réservation
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <FaTimes className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>

            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
              {restaurant?.name} • {restaurant?.address}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaCalendar className="inline mr-2" /> Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 rounded-xl outline-none transition ${
                    isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                  } focus:ring-2 focus:ring-primary-500`}
                  required
                />
              </div>

              {/* Heure */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaClock className="inline mr-2" /> Heure
                </label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl outline-none transition ${
                    isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                  } focus:ring-2 focus:ring-primary-500`}
                >
                  {['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Nombre de personnes */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaUsers className="inline mr-2" /> Nombre de personnes
                </label>
                <select
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl outline-none transition ${
                    isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                  } focus:ring-2 focus:ring-primary-500`}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>{n} {n > 1 ? 'personnes' : 'personne'}</option>
                  ))}
                </select>
              </div>

              {/* Téléphone */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaPhone className="inline mr-2" /> Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+229 XX XX XX XX"
                  className={`w-full px-4 py-3 rounded-xl outline-none transition ${
                    isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                  } focus:ring-2 focus:ring-primary-500`}
                />
              </div>

              {/* Message */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message (optionnel)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Message spécial pour le restaurant..."
                  className={`w-full px-4 py-3 rounded-xl outline-none transition ${
                    isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                  } focus:ring-2 focus:ring-primary-500`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <FaWhatsapp /> Réserver via WhatsApp
                  </>
                )}
              </button>

              <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Vous serez redirigé vers WhatsApp pour confirmer votre réservation.
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReservationModal;