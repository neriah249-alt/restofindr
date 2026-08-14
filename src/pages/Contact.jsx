import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <AnimatedBackground>
      <Navbar />
      <main className="pt-32 pb-12 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-darkText mb-2">📞 Contactez-nous</h1>
          <p className="text-gray-500 mb-8">Une question ? Une suggestion ? N'hésitez pas à nous contacter.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Formulaire */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold text-green-600">Message envoyé !</h3>
                  <p className="text-gray-500">Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl outline-none bg-gray-50 text-gray-700 focus:ring-2 focus:ring-primary-500"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl outline-none bg-gray-50 text-gray-700 focus:ring-2 focus:ring-primary-500"
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl outline-none bg-gray-50 text-gray-700 focus:ring-2 focus:ring-primary-500"
                      placeholder="Votre message..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium hover:bg-primary-600 transition"
                  >
                    Envoyer
                  </button>
                </form>
              )}
            </div>

            {/* Infos contact */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <h3 className="font-semibold text-darkText mb-4">Informations de contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-primary-500 text-lg" />
                    <span className="text-gray-600">+229 61 23 45 67</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaWhatsapp className="text-green-500 text-lg" />
                    <span className="text-gray-600">+229 61 23 45 67</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-primary-500 text-lg" />
                    <span className="text-gray-600">contact@restogo.bj</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="text-red-500 text-lg" />
                    <span className="text-gray-600">Cotonou, Bénin</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
                <h3 className="font-semibold text-darkText mb-2">📍 Horaires</h3>
                <p className="text-gray-600">Lundi - Vendredi : 8h - 20h</p>
                <p className="text-gray-600">Samedi : 9h - 18h</p>
                <p className="text-gray-600">Dimanche : Fermé</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default Contact;