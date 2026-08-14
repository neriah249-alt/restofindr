import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBbSEVkhhw6mgQqTWshnMJhfTlR97SUkMM",
    authDomain: "restogo-a0aec.firebaseapp.com",
    projectId: "restogo-a0aec",
    storageBucket: "restogo-a0aec.firebasestorage.app",
    messagingSenderId: "689697810111",
    appId: "1:689697810111:web:a9cbf8a2f7ffafce83c80a",
    measurementId: "G-JQBBCF1NKD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// ✅ NOUVEAU : Fonction pour obtenir un mot de passe fixe
const getFirebasePassword = (uid) => {
    // Utilise le firebase_uid comme source, mais le tronque à 20 caractères
    // et le combine avec un salt fixe
    const salt = "RestoGo2024";
    const base = uid.substring(0, 20);
    return `${salt}${base}`;
};

export {
    auth,
    googleProvider,
    signInWithPopup,
    getFirebasePassword // ← EXPORTEZ LA FONCTION
};