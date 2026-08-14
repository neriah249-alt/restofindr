import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

const ResetPassword = () => {
  const { isDark } = useTheme();
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!token) {
      setError('Token invalide ou manquant');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          new_password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Erreur lors de la réinitialisation');
      }
      
      setIsSuccess(true);
      console.log('✅ Mot de passe réinitialisé avec succès');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setError(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Force du mot de passe
  const getPasswordStrength = () => {
    const pass = formData.password;
    if (!pass) return { label: '', color: '', score: 0 };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    const strengths = [
      { label: 'Très faible', color: 'bg-red-500' },
      { label: 'Faible', color: 'bg-orange-500' },
      { label: 'Moyen', color: 'bg-yellow-500' },
      { label: 'Fort', color: 'bg-green-500' },
      { label: 'Très fort', color: 'bg-green-600' },
    ];
    const index = Math.min(score, 4);
    return { ...strengths[index], score };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <AnimatedBackground>
      <Navbar />
      <main className="pt-24 pb-12 min-h-screen flex items-center">
        <div className="max-w-md mx-auto w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl shadow-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="text-center mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-gray-700' : 'bg-primary-50'
              }`}>
                <FaLock className="text-2xl text-primary-500" />
              </div>
              <h1 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-darkText'}`}>
                Nouveau mot de passe
              </h1>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Créez un nouveau mot de passe sécurisé.
              </p>
            </div>

            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${
                  isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-50 text-green-700'
                }`}
              >
                <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />
                <div>
                  <p className="font-medium">Mot de passe réinitialisé !</p>
                  <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    Redirection vers la connexion...
                  </p>
                </div>
              </motion.div>
            )}

            {error && (
              <div className={`text-sm p-3 rounded-xl mb-4 ${
                isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-500'
              }`}>
                {error}
              </div>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nouveau mot de passe
                  </label>
                  <div className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <FaLock className={`${isDark ? 'text-gray-500' : 'text-gray-400'} mr-3`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`flex-1 bg-transparent outline-none placeholder-gray-400 ${
                        isDark ? 'text-white' : 'text-gray-700'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  
                  {/* Indicateur de force */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 h-1.5">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              i < passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Force : <span className="font-medium">{passwordStrength.label}</span>
                      </p>
                      <ul className={`text-xs mt-1 space-y-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <li className={formData.password.length >= 6 ? 'text-green-500' : ''}>
                          • Minimum 6 caractères
                        </li>
                        <li className={/[A-Z]/.test(formData.password) ? 'text-green-500' : ''}>
                          • Au moins une majuscule
                        </li>
                        <li className={/[0-9]/.test(formData.password) ? 'text-green-500' : ''}>
                          • Au moins un chiffre
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Confirmer le mot de passe
                  </label>
                  <div className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <FaLock className={`${isDark ? 'text-gray-500' : 'text-gray-400'} mr-3`} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`flex-1 bg-transparent outline-none placeholder-gray-400 ${
                        isDark ? 'text-white' : 'text-gray-700'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                    <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                      <FaCheckCircle /> Les mots de passe correspondent
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition disabled:opacity-70"
                >
                  {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link to="/login" className={`text-sm transition ${
                isDark ? 'text-gray-400 hover:text-primary-500' : 'text-gray-500 hover:text-primary-500'
              }`}>
                Retour à la connexion
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default ResetPassword;