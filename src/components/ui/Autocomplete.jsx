import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaUtensils, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

const API_URL = 'http://localhost:8000/api';

const Autocomplete = ({ 
  placeholder = "Rechercher un restaurant...",
  onSelect,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Fermer les suggestions en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Rechercher des suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('🔍 Recherche suggestions pour:', query);
        const response = await fetch(`${API_URL}/restaurants/suggestions?q=${encodeURIComponent(query)}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          console.log('📦 Suggestions reçues:', data);
          setSuggestions(data);
          setIsOpen(data.length > 0);
        } else {
          console.error('❌ Erreur API:', response.status);
        }
      } catch (error) {
        console.error('❌ Erreur suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Navigation au clavier
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      setIsOpen(false);
      if (onSelect) {
        onSelect({ name: query });
      }
    }
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div className="flex items-center bg-lightGray dark:bg-gray-700 rounded-xl px-4">
        <FaSearch className="text-gray-400 text-lg" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 && query.length >= 2) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-3 bg-transparent outline-none text-gray-700 dark:text-white placeholder-gray-400"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1"
          >
            <FaTimes />
          </button>
        )}
        {isLoading && (
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
          >
            <div className="max-h-96 overflow-y-auto py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSelect(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-3 ${
                    index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 flex-shrink-0">
                    <FaUtensils />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-700 dark:text-gray-200 truncate">
                      {suggestion.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{suggestion.cuisine || 'Cuisine variée'}</span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-xs" />
                        {suggestion.address || 'Adresse'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Autocomplete;