import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup
} from '../firebase/firebase';

// ============================================
// 📌 CONFIGURATION DE L'API - HARDCODÉ
// ============================================
const API_URL = 'https://restofindr-1.onrender.com/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Fonction pour obtenir les initiales
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          setToken(storedToken);
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const userData = await response.json();
            const userWithInitials = {
              ...userData,
              initials: getInitials(userData.name)
            };
            setUser(userWithInitials);
            localStorage.setItem('user', JSON.stringify(userWithInitials));
            console.log('✅ Utilisateur chargé:', userWithInitials);
          } else {
            console.log('❌ Token invalide, déconnexion');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
          }
        } catch (error) {
          console.error('Erreur de vérification:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // ============================================
  // CONNEXION PAR EMAIL / MOT DE PASSE
  // ============================================
  const login = async (email, password, remember_me = false) => {
    try {
      console.log('🔑 Tentative de connexion:', email);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember_me })
      });
      
      const data = await response.json();
      console.log('📦 Réponse login:', data);
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.detail || 'Email ou mot de passe incorrect' 
        };
      }
      
      const { access_token } = data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userWithInitials = {
          ...userData,
          initials: getInitials(userData.name)
        };
        setUser(userWithInitials);
        localStorage.setItem('user', JSON.stringify(userWithInitials));
        console.log('✅ Utilisateur connecté:', userWithInitials);
        console.log(`🔑 Token valable: ${remember_me ? '7 jours' : '30 minutes'}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur de connexion au serveur'
      };
    }
  };

  // ============================================
  // INSCRIPTION PAR EMAIL / MOT DE PASSE
  // ============================================
  const register = async (userData) => {
    try {
      console.log('📝 Tentative d\'inscription:', userData.email);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password
        })
      });
      
      const data = await response.json();
      console.log('📦 Réponse inscription:', data);
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.detail || 'Erreur lors de l\'inscription' 
        };
      }
      
      console.log('✅ Inscription réussie, connexion automatique...');
      return await login(userData.email, userData.password, false);
    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur de connexion au serveur'
      };
    }
  };

  // ============================================
  // CONNEXION AVEC GOOGLE
  // ============================================
  const loginWithGoogle = async () => {
    try {
      console.log('🔑 Tentative de connexion avec Google...');
      
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      console.log('✅ Firebase user:', firebaseUser);
      
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email,
          firebase_uid: firebaseUser.uid,
          photo_url: firebaseUser.photoURL
        })
      });
      
      const data = await response.json();
      console.log('📦 Réponse backend:', data);
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.detail || 'Erreur lors de la connexion avec Google'
        };
      }
      
      const { access_token } = data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userWithInitials = {
          ...userData,
          initials: getInitials(userData.name)
        };
        setUser(userWithInitials);
        localStorage.setItem('user', JSON.stringify(userWithInitials));
        console.log('✅ Utilisateur connecté avec Google:', userWithInitials);
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur de connexion Google:', error);
      if (error.code) {
        console.error('Code erreur:', error.code);
        console.error('Message:', error.message);
      }
      return { 
        success: false, 
        error: error.message || 'Erreur de connexion avec Google'
      };
    }
  };

  // ============================================
  // DÉCONNEXION
  // ============================================
  const logout = async () => {
    try {
      if (auth) {
        await auth.signOut();
      }
    } catch (error) {
      console.error('Erreur Firebase logout:', error);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    console.log('👋 Déconnexion');
  };

  // ============================================
  // VALEURS EXPORTÉES
  // ============================================
  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
    token,
    getInitials
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};