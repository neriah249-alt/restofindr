import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHandshake, FaCheckCircle, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const Partner = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    restaurant: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    console.log('Formulaire envoyé:', formData);
  };

  const benefits = [
    'Visibilité accrue auprès de 500+ utilisateurs',
    'Mise en avant sur la page d\'accueil',
    'Gestion simplifiée de votre menu',
    'Accès aux statistiques de votre restaurant',
    'Support prioritaire 7j/7',
  ];

  return (
    <AnimatedBackground>
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <FaHandshake className="text-5xl text-primary-500 mx-auto mb-4" />
            <h1 className="font-display text-4xl font-bold text-darkText mb-4">Devenir partenaire</h1>
            <p className="text-lg text-gray-600">
              Rejoignez RestoGo Bénin et faites découvrir votre restaurant à des milliers de clients potentiels.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulaire */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              {submitted ? (
                <div className="text-center py-8">
                  <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-darkText mb-2">Merci !</h2>
                  <p className="text-gray-600">Nous vous contacterons dans les plus brefs délais.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 bg-primary-500 text-white px-6 py-2 rounded-full hover:bg-primary-600 transition"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-display text-2xl font-bold text-darkText mb-4">Formulaire de contact</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du restaurant</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.restaurant}
                      onChange={(e) => setFormData({...formData, restaurant: e.target.value})}
                      placeholder="Nom de votre restaurant"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+229 XX XX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Parlez-nous de votre restaurant..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition"
                  >
                    Envoyer la demande
                  </button>
                </form>
              )}
            </motion.div>

            {/* Avantages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="font-display text-2xl font-bold text-darkText mb-6">Pourquoi rejoindre RestoGo ?</h2>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <FaCheckCircle className="text-primary-500 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-primary-500 text-white rounded-2xl p-8">
                <h3 className="font-display text-xl font-bold mb-2">Prêt à commencer ?</h3>
                <p className="opacity-90 mb-4">Rejoignez notre réseau de restaurants partenaires</p>
                <div className="flex items-center gap-2 text-sm">
                  <FaPhone /> <span>+229 97 00 00 00</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-2">
                  <FaEnvelope /> <span>partenaires@restogo.bj</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default Partner;