import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash, FaUtensils } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setLoginError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setLoginError('');

    try {
      const result = await login(formData.email, formData.password, formData.remember);
      if (result.success) {
        console.log('✅ Connexion réussie, redirection vers home');
        navigate('/');  // ← Redirection vers Home
      } else {
        setLoginError(result.error || 'Email ou mot de passe incorrect');
      }
    } catch (error) {
      setLoginError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoginError('');
    
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        console.log('✅ Connexion Google réussie');
        navigate('/');  // ← Redirection vers Home
      } else {
        setLoginError(result.error || 'Erreur de connexion avec Google');
      }
    } catch (error) {
      console.error('❌ Erreur Google:', error);
      setLoginError('Erreur de connexion avec Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <main className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`rounded-3xl shadow-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex items-center justify-center gap-2 mb-4"
              >
                <FaUtensils className="text-4xl text-primary-500" />
                <span className={`font-display text-3xl font-bold ${isDark ? 'text-white' : 'text-darkText'}`}>
                  RestoGo
                </span>
                <span className="text-primary-500 text-sm font-bold">BÉNIN</span>
              </motion.div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-darkText'}`}>
                Bienvenue
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Connectez-vous pour découvrir les meilleurs restaurants
              </p>
            </div>

            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm p-3 rounded-xl mb-4 ${
                  isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-500'
                }`}
              >
                {loginError}
              </motion.div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl transition border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              <FaGoogle className="text-red-500 text-xl" />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Continuer avec Google
              </span>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                  ou avec votre email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <div className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                } ${errors.email ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-primary-500'}`}>
                  <FaEnvelope className={`${errors.email ? 'text-red-500' : 'text-gray-400'} mr-3`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`flex-1 bg-transparent outline-none ${
                      isDark ? 'text-white' : 'text-gray-700'
                    } placeholder-gray-400`}
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Mot de passe
                </label>
                <div className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                } ${errors.password ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-primary-500'}`}>
                  <FaLock className={`${errors.password ? 'text-red-500' : 'text-gray-400'} mr-3`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`flex-1 bg-transparent outline-none ${
                      isDark ? 'text-white' : 'text-gray-700'
                    } placeholder-gray-400`}
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
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className={`flex items-center gap-2 text-sm cursor-pointer ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                  />
                  Se souvenir de moi
                </label>
                <Link to="/forgot-password" className={`text-sm transition ${
                  isDark ? 'text-primary-400 hover:text-primary-300' : 'text-primary-500 hover:text-primary-600'
                } font-medium`}>
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-primary-500 hover:underline font-medium transition">
                  S'inscrire
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </AnimatedBackground>
  );
};

export default Login;