import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaImage, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

const API_URL = 'http://localhost:8000/api';

const PhotoManager = ({ restaurantId }) => {
  const { token, isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [restaurantId]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`${API_URL}/restaurateur/restaurants/${restaurantId}/photos`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Veuillez sélectionner une image', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ L\'image ne doit pas dépasser 5MB', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/restaurateur/restaurants/${restaurantId}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        showToast('✅ Photo ajoutée avec succès', 'success');
        fetchPhotos();
      } else {
        const error = await response.json();
        showToast(error.detail || 'Erreur lors de l\'upload', 'error');
      }
    } catch (error) {
      showToast('Erreur de connexion', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette photo ?')) return;

    try {
      const response = await fetch(`${API_URL}/restaurateur/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showToast('✅ Photo supprimée', 'success');
        fetchPhotos();
      }
    } catch (error) {
      showToast('Erreur de suppression', 'error');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <FaSpinner className="animate-spin text-primary-500 text-2xl mx-auto" />
      </div>
    );
  }

  return (
    <div>
      {/* Bouton d'upload - Visible pour les restaurateurs */}
      {isAuthenticated && user?.is_restaurateur && (
        <div className="mb-4">
          <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition ${
            isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <FaPlus />
            <span>Ajouter une photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {uploading && <FaSpinner className="animate-spin ml-2 inline" />}
        </div>
      )}

      {/* Grille de photos */}
      {photos.length === 0 ? (
        <div className={`text-center py-8 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <FaImage className="text-4xl text-gray-400 mx-auto mb-2" />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Aucune photo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group rounded-xl overflow-hidden aspect-square"
            >
              <img
                src={`http://localhost:8000${photo.image_url}`}
                alt="Restaurant"
                className="w-full h-full object-cover"
              />
              {isAuthenticated && user?.is_restaurateur && (
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <FaTrash size={12} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoManager;