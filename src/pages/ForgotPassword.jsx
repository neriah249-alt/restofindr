import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://localhost:8000/api';

const ForgotPassword = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Veuillez entrer votre email');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email invalide');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Une erreur est survenue');
      }
      
      setResetLink(data.reset_link || '');
      setIsSuccess(true);
      console.log('📧 Email envoyé à:', email);
      console.log('🔗 Lien de réinitialisation:', data.reset_link);
      
    } catch (error) {
      setError(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

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
                <FaEnvelope className="text-2xl text-primary-500" />
              </div>
              <h1 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-darkText'}`}>
                Mot de passe oublié
              </h1>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Entrez votre email pour recevoir un lien de réinitialisation.
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
                  <p className="font-medium">Email envoyé !</p>
                  <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    Un lien de réinitialisation a été envoyé à <span className="font-semibold">{email}</span>
                  </p>
                  {resetLink && (
                    <p className={`text-xs mt-2 break-all ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      🔗 Lien de test : <a href={resetLink} className="text-primary-500 hover:underline">{resetLink}</a>
                    </p>
                  )}
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
                    Email
                  </label>
                  <div className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <FaEnvelope className={`${isDark ? 'text-gray-500' : 'text-gray-400'} mr-3`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className={`flex-1 bg-transparent outline-none placeholder-gray-400 ${
                        isDark ? 'text-white' : 'text-gray-700'
                      }`}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition disabled:opacity-70"
                >
                  {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link to="/login" className={`inline-flex items-center gap-2 text-sm transition ${
                isDark ? 'text-gray-400 hover:text-primary-500' : 'text-gray-500 hover:text-primary-500'
              }`}>
                <FaArrowLeft className="text-xs" />
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

export default ForgotPassword;