import React from 'react';
import { motion } from 'framer-motion';
import { FaUtensils, FaHamburger, FaPizzaSlice, FaFish, FaLeaf, FaBirthdayCake, FaCoffee } from 'react-icons/fa';

const CategoriesSection = () => {
  const categories = [
    { name: 'Africain', icon: <FaUtensils />, color: 'bg-orange-100 text-orange-600' },
    { name: 'Maquis', icon: <FaUtensils />, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Italien', icon: <FaPizzaSlice />, color: 'bg-red-100 text-red-600' },
    { name: 'Fast food', icon: <FaHamburger />, color: 'bg-amber-100 text-amber-600' },
    { name: 'Poisson & Fruits de mer', icon: <FaFish />, color: 'bg-blue-100 text-blue-600' },
    { name: 'Végétarien', icon: <FaLeaf />, color: 'bg-green-100 text-green-600' },
    { name: 'Pâtisseries', icon: <FaBirthdayCake />, color: 'bg-pink-100 text-pink-600' },
    { name: 'Café & Thé', icon: <FaCoffee />, color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-10"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-darkText mb-1 sm:mb-2">
            Catégories populaires
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            Découvrez les meilleurs restaurants par catégorie
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((category, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${category.color} mb-2 sm:mb-3`}>
                <span className="text-xl sm:text-2xl">{category.icon}</span>
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-gray-700">
                {category.name}
              </h3>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;