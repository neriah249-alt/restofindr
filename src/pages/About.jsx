import React from 'react';
import { motion } from 'framer-motion';
import { FaUtensils, FaMapMarkerAlt, FaStar, FaHeart, FaUsers } from 'react-icons/fa';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const About = () => {
  const stats = [
    { icon: <FaUtensils />, value: '250+', label: 'Restaurants' },
    { icon: <FaMapMarkerAlt />, value: '2', label: 'Villes' },
    { icon: <FaStar />, value: '4.8', label: 'Note moyenne' },
    { icon: <FaUsers />, value: '500+', label: 'Utilisateurs' },
  ];

  return (
    <AnimatedBackground>
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="font-display text-4xl font-bold text-darkText mb-4">À propos de RestoGo</h1>
            <p className="text-lg text-gray-600">
              Découvrez les meilleurs restaurants de Cotonou et Abomey-Calavi,
              sélectionnés avec soin pour vous offrir une expérience culinaire unique.
            </p>
          </motion.div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-lg"
              >
                <div className="text-3xl text-primary-500 mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-darkText">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaHeart className="text-primary-500 text-2xl" />
              <h2 className="font-display text-2xl font-bold text-darkText">Notre mission</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              RestoGo Bénin a pour mission de faciliter la découverte des meilleures adresses
              gastronomiques à Cotonou et Abomey-Calavi. Nous croyons que chaque repas est une
              expérience unique et mérite d'être partagée. Notre plateforme connecte les amateurs
              de bonne cuisine avec les restaurants qui font la renommée de notre région.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default About;