import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash, FaCheckCircle, FaUtensils } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const Register = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [registerError, setRegisterError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setRegisterError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer le mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setRegisterError('');
    
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        setIsSuccess(true);
        console.log('✅ Inscription réussie, redirection vers Home');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setRegisterError(result.error || 'Erreur d\'inscription');
      }
    } catch (error) {
      setRegisterError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setRegisterError('');
    
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        console.log('✅ Connexion Google réussie, redirection vers Home');
        navigate('/');
      } else {
        setRegisterError(result.error || 'Erreur de connexion avec Google');
      }
    } catch (error) {
      setRegisterError('Erreur de connexion avec Google');
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
            className="rounded-3xl shadow-2xl p-8 bg-white"
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <FaUtensils className="text-4xl text-primary-500" />
                <span className="font-display text-3xl font-bold text-darkText">
                  RestoGo
                </span>
                <span className="text-primary-500 text-sm font-bold">BÉNIN</span>
              </div>
              <h1 className="text-2xl font-bold text-darkText">
                Créer un compte
              </h1>
              <p className="text-sm mt-1 text-gray-500">
                Rejoignez RestoGo Bénin gratuitement
              </p>
            </div>

            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl mb-4 flex items-center gap-3 bg-green-50 text-green-700"
              >
                <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />
                <div>
                  <p className="font-medium">Inscription réussie !</p>
                  <p className="text-sm text-green-600">
                    Redirection vers l'accueil...
                  </p>
                </div>
              </motion.div>
            )}

            {registerError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm p-3 rounded-xl mb-4 bg-red-50 text-red-500"
              >
                {registerError}
              </motion.div>
            )}

            {/* Bouton Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl transition border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              <FaGoogle className="text-red-500 text-xl" />
              <span className="text-sm font-medium text-gray-700">
                S'inscrire avec Google
              </span>
            </button>

            {/* Séparateur */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  ou avec votre email
                </span>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Nom complet
                </label>
                <div className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 bg-gray-50 ${errors.name ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-primary-500'}`}>
                  <FaUser className={`${errors.name ? 'text-red-500' : 'text-gray-400'} mr-3`} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    placeholder="Jean Dupont"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Email
                </label>
                <div className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 bg-gray-50 ${errors.email ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-primary-500'}`}>
                  <FaEnvelope className={`${errors.email ? 'text-red-500' : 'text-gray-400'} mr-3`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Mot de passe
                </label>
                <div className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 bg-gray-50 ${errors.password ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-primary-500'}`}>
                  <FaLock className={`${errors.password ? 'text-red-500' : 'text-gray-400'} mr-3`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Confirmer le mot de passe
                </label>
                <div className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 bg-gray-50 ${errors.confirmPassword ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-primary-500'}`}>
                  <FaLock className={`${errors.confirmPassword ? 'text-red-500' : 'text-gray-400'} mr-3`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div>
                <label className="flex items-start gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500 mt-0.5"
                  />
                  <span className="text-gray-600">
                    J'accepte les conditions d'utilisation
                  </span>
                </label>
                {errors.acceptTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptTerms}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition disabled:opacity-70"
              >
                {isLoading ? 'Inscription...' : 'S\'inscrire'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Déjà inscrit ?{' '}
                <Link to="/login" className="text-primary-500 hover:underline font-medium transition">
                  Se connecter
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </AnimatedBackground>
  );
};

export default Register;