import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';

// ✅ FORCE REBUILD - 14/08/2026
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

export {
    auth,
    googleProvider,
    signInWithPopup
};