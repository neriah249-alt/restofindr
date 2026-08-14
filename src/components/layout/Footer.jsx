import React from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-3 sm:mb-4">
              <FaUtensils className="text-primary-500 text-xl sm:text-2xl" />
              <div>
                <h2 className="font-display text-base sm:text-xl font-bold text-darkText">RestoGo</h2>
                <span className="text-primary-500 text-[8px] sm:text-xs font-medium tracking-wider">BÉNIN</span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xs">
              Découvrez les meilleurs restaurants de Cotonou et Abomey-Calavi.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm sm:text-base text-darkText mb-2 sm:mb-4">Liens rapides</h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li><Link to="/search" className="text-gray-500 hover:text-primary-500 transition-colors">Recherche</Link></li>
              <li><Link to="/map" className="text-gray-500 hover:text-primary-500 transition-colors">Carte</Link></li>
              <li><Link to="/favorites" className="text-gray-500 hover:text-primary-500 transition-colors">Favoris</Link></li>
              <li><Link to="/about" className="text-gray-500 hover:text-primary-500 transition-colors">À propos</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm sm:text-base text-darkText mb-2 sm:mb-4">Support</h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li><Link to="/faq" className="text-gray-500 hover:text-primary-500 transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-primary-500 transition-colors">Contact</Link></li>
              <li><Link to="/partner" className="text-gray-500 hover:text-primary-500 transition-colors">Devenir partenaire</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm sm:text-base text-darkText mb-2 sm:mb-4">Suivez-nous</h3>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors text-lg sm:text-xl">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors text-lg sm:text-xl">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors text-lg sm:text-xl">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors text-lg sm:text-xl">
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
          <p>&copy; {currentYear} RestoGo Bénin. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;