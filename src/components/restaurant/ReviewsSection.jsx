import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaUser, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

// ✅ CORRECTION
const API_URL = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : 'http://localhost:8000/api';

const ReviewsSection = ({ restaurantId }) => {
  const { token, user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userReview, setUserReview] = useState(null);

  // Charger les avis
  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
        
        // Vérifier si l'utilisateur a déjà donné un avis
        if (isAuthenticated && user) {
          const userReviewData = data.find(r => r.user_id === user.id);
          if (userReviewData) {
            setUserReview(userReviewData);
            setUserRating(userReviewData.rating);
            setUserComment(userReviewData.comment);
          }
        }
      }
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [restaurantId, isAuthenticated, user]);

  // Soumettre un avis
  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      showToast('🔒 Veuillez vous connecter pour donner un avis', 'warning');
      return;
    }

    if (userRating === 0) {
      showToast('⚠️ Veuillez sélectionner une note', 'warning');
      return;
    }

    if (!userComment.trim()) {
      showToast('⚠️ Veuillez écrire un commentaire', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const method = userReview ? 'PUT' : 'POST';
      const url = userReview 
        ? `${API_URL}/restaurants/reviews/${userReview.id}`
        : `${API_URL}/restaurants/${restaurantId}/reviews`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: userRating,
          comment: userComment
        })
      });

      if (response.ok) {
        showToast(userReview ? '✅ Avis modifié avec succès' : '✅ Avis ajouté avec succès', 'success');
        setIsEditing(false);
        fetchReviews();
        setUserRating(0);
        setUserComment('');
      } else {
        const data = await response.json();
        showToast(data.detail || 'Erreur lors de l\'envoi', 'error');
      }
    } catch (error) {
      showToast('Erreur de connexion', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer un avis
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/restaurants/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showToast('✅ Avis supprimé avec succès', 'success');
        setUserReview(null);
        setUserRating(0);
        setUserComment('');
        fetchReviews();
      } else {
        showToast('Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      showToast('Erreur de connexion', 'error');
    }
  };

  // Afficher les étoiles
  const renderStars = (rating, interactive = false, size = 'text-lg') => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && setUserRating(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <FaStar 
              className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} ${size}`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Formater la date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculer les statistiques des avis
  const getStats = () => {
    if (reviews.length === 0) return null;
    const total = reviews.length;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => distribution[r.rating]++);
    return { total, avg, distribution };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chargement des avis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      {stats && (
        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-500">{stats.avg.toFixed(1)}</div>
              <div className="flex justify-center mt-1">{renderStars(Math.round(stats.avg))}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {stats.total} avis
              </div>
            </div>
            <div className="flex-1 w-full space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.distribution[rating] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8 text-right">{rating}</span>
                    <FaStar className="text-yellow-400 text-sm" />
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          rating >= 4 ? 'bg-green-500' :
                          rating >= 3 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm w-10 text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Formulaire d'avis */}
      {isAuthenticated && (
        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-darkText'} mb-4`}>
            {userReview ? 'Modifier mon avis' : 'Donner mon avis'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Votre note
              </label>
              {renderStars(userRating, true, 'text-2xl')}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Votre commentaire
              </label>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                rows="3"
                className={`w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 ${
                  isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'
                } focus:ring-2 focus:ring-primary-500`}
                placeholder="Partagez votre expérience..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="bg-primary-500 text-white px-6 py-2 rounded-xl hover:bg-primary-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <FaCheck /> {userReview ? 'Modifier' : 'Publier'}
                  </>
                )}
              </button>
              {userReview && (
                <button
                  onClick={() => {
                    setUserReview(null);
                    setUserRating(0);
                    setUserComment('');
                  }}
                  className={`px-6 py-2 rounded-xl transition ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Liste des avis */}
      <div className="space-y-4">
        <h3 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-darkText'}`}>
          Tous les avis ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Aucun avis pour le moment. Soyez le premier à donner votre avis !
          </div>
        ) : (
          <AnimatePresence>
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${
                  isDark ? 'border-gray-700' : 'border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold">
                      {review.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-medium">{review.user?.name || 'Utilisateur'}</div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, false, 'text-sm')}
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isAuthenticated && review.user_id === user?.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setUserRating(review.rating);
                          setUserComment(review.comment);
                        }}
                        className={`p-1.5 rounded-lg transition ${
                          isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                        }`}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className={`p-1.5 rounded-lg transition ${
                          isDark ? 'hover:bg-red-900/30 text-gray-400' : 'hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
                <div className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {review.comment}
                </div>
                {review.updated_at && review.updated_at !== review.created_at && (
                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    (modifié)
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;