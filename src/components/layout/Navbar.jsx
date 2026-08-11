import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUtensils, FaBars, FaTimes, FaUser, FaSignOutAlt, 
  FaMoon, FaSun, FaStore, FaHome, FaSearch, FaMapMarkedAlt, 
  FaHeart, FaInfoCircle, FaHandshake, FaUserCircle 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // LIENS DE NAVIGATION PRINCIPAUX
  const navLinks = [
    { to: '/', label: 'Accueil', icon: <FaHome /> },
    { to: '/search', label: 'Recherche', icon: <FaSearch /> },
    { to: '/map', label: 'Carte', icon: <FaMapMarkedAlt /> },
    { to: '/favorites', label: 'Favoris', icon: <FaHeart /> },
    { to: '/about', label: 'À propos', icon: <FaInfoCircle /> },
    { to: '/become-restaurateur', label: 'Devenir restaurateur', icon: <FaStore />, highlight: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
    setIsOpen(false);
  };

  const isRestaurateur = user?.is_restaurateur === true;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? isDark ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg' : 'bg-white/95 backdrop-blur-sm shadow-md'
        : isDark ? 'bg-gray-900/50 backdrop-blur-sm' : 'bg-white/30 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* ===== LOGO ===== */}
          <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            <FaUtensils className="text-primary-500 text-xl sm:text-2xl" />
            <div>
              <h1 className={`font-display text-base sm:text-xl font-bold ${isDark ? 'text-white' : 'text-darkText'}`}>RESTOGO</h1>
              <span className="text-primary-500 text-[8px] sm:text-[10px] font-bold tracking-widest block -mt-0.5 sm:-mt-1">BÉNIN</span>
            </div>
          </Link>

          {/* ===== NAVIGATION DESKTOP ===== */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative text-sm font-medium transition-colors duration-300 flex items-center gap-1.5 xl:gap-2 whitespace-nowrap ${
                    isActive 
                      ? 'text-primary-500' 
                      : link.highlight 
                        ? 'bg-primary-500 text-white px-3 py-1.5 xl:px-4 xl:py-2 rounded-full hover:bg-primary-600'
                        : isDark ? 'text-gray-300 hover:text-primary-500' : 'text-gray-700 hover:text-primary-500'
                  }`}
                >
                  <span className="text-xs xl:text-sm">{link.icon}</span>
                  <span className="text-xs xl:text-sm">{link.label}</span>
                  {isActive && !link.highlight && (
                    <motion.span 
                      layoutId="underline"
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-500"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ===== AUTH / USER DESKTOP ===== */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-shrink-0">
            {/* Bouton mode sombre */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${
                isDark 
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:shadow-md transition ${
                    isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white/80 backdrop-blur-sm'
                  }`}
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold">
                    {user?.initials || 'U'}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} hidden xl:inline`}>
                    {user?.name || 'Utilisateur'}
                  </span>
                </button>

                {/* DROPDOWN */}
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute right-0 mt-2 w-48 sm:w-56 rounded-2xl shadow-xl py-2 z-50 ${
                      isDark ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <Link
                      to="/profile"
                      className={`flex items-center gap-3 px-4 py-2.5 sm:py-3 transition ${
                        isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaUser className={isDark ? 'text-gray-400' : 'text-gray-400'} size={14} />
                      <span className="text-sm">Mon profil</span>
                    </Link>

                    <Link
                      to="/partner"
                      className={`flex items-center gap-3 px-4 py-2.5 sm:py-3 transition ${
                        isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaHandshake className="text-blue-500" size={14} />
                      <span className="text-sm">Devenir partenaire</span>
                    </Link>

                    {isRestaurateur && (
                      <Link
                        to="/my-restaurant"
                        className={`flex items-center gap-3 px-4 py-2.5 sm:py-3 transition ${
                          isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaStore className="text-green-500" size={14} />
                        <span className="text-sm">Mon restaurant</span>
                      </Link>
                    )}

                    <hr className={`my-1 ${isDark ? 'border-gray-700' : 'border-gray-100'}`} />

                    <button
                      onClick={handleLogout}
                      className={`flex items-center gap-3 px-4 py-2.5 sm:py-3 transition w-full text-left ${
                        isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-50 text-red-500'
                      }`}
                    >
                      <FaSignOutAlt size={14} />
                      <span className="text-sm">Se déconnecter</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className={`text-xs sm:text-sm font-medium transition ${
                  isDark ? 'text-gray-300 hover:text-primary-500' : 'text-gray-700 hover:text-primary-500'
                }`}>
                  Connexion
                </Link>
                <Link to="/register" className="bg-primary-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-primary-600 transition shadow-sm hover:shadow-md">
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* ===== MOBILE MENU BUTTON ===== */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="lg:hidden text-xl sm:text-2xl transition-colors p-1.5 sm:p-2 -mr-1.5 sm:-mr-2"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`lg:hidden shadow-lg max-h-[80vh] overflow-y-auto ${
            isDark ? 'bg-gray-900' : 'bg-white'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-2 sm:space-y-3">
            {/* Liens de navigation */}
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors ${
                    isActive 
                      ? isDark ? 'bg-gray-800 text-primary-500' : 'bg-primary-50 text-primary-500'
                      : link.highlight
                        ? 'bg-primary-500 text-white hover:bg-primary-600'
                        : isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg sm:text-xl">{link.icon}</span>
                  <span className="text-sm sm:text-base font-medium">{link.label}</span>
                </Link>
              );
            })}
            
            {/* Mode sombre mobile */}
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition ${
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isDark ? <FaSun className="text-lg sm:text-xl" /> : <FaMoon className="text-lg sm:text-xl" />}
              <span className="text-sm sm:text-base">{isDark ? 'Mode clair' : 'Mode sombre'}</span>
            </button>
            
            {/* Auth / User mobile */}
            <div className="pt-3 sm:pt-4 border-t border-gray-700 space-y-2 sm:space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 py-2 px-3 sm:px-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                      {user?.initials || 'U'}
                    </div>
                    <span className={`font-medium text-sm sm:text-base ${isDark ? 'text-white' : 'text-darkText'}`}>
                      {user?.name || 'Utilisateur'}
                    </span>
                  </div>

                  <Link 
                    to="/profile" 
                    className={`flex items-center gap-3 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition ${
                      isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUser className="text-base sm:text-lg" /> 
                    <span className="text-sm sm:text-base">Mon profil</span>
                  </Link>

                  <Link 
                    to="/partner" 
                    className={`flex items-center gap-3 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition ${
                      isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <FaHandshake className="text-blue-500 text-base sm:text-lg" /> 
                    <span className="text-sm sm:text-base">Devenir partenaire</span>
                  </Link>

                  {isRestaurateur && (
                    <Link 
                      to="/my-restaurant" 
                      className={`flex items-center gap-3 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition ${
                        isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <FaStore className="text-green-500 text-base sm:text-lg" /> 
                      <span className="text-sm sm:text-base">Mon restaurant</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition w-full ${
                      isDark ? 'text-red-400 hover:bg-gray-800' : 'text-red-500 hover:bg-gray-50'
                    }`}
                  >
                    <FaSignOutAlt className="text-base sm:text-lg" /> 
                    <span className="text-sm sm:text-base">Se déconnecter</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`block py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition ${
                      isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-sm sm:text-base">Connexion</span>
                  </Link>
                  <Link 
                    to="/register" 
                    className="block bg-primary-500 text-white text-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-full hover:bg-primary-600 transition text-sm sm:text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;