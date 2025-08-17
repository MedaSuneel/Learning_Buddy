// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDPDaOpJftFiS9uVv0_4q4GfEJNNL1jcBA",
  authDomain: "learning-buddy-196ae.firebaseapp.com",
  projectId: "learning-buddy-196ae",
  storageBucket: "learning-buddy-196ae.firebasestorage.app",
  messagingSenderId: "415690092382",
  appId: "1:415690092382:web:c321c65a632238b5b269cf",
  measurementId: "G-DC3GWRSEHK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);