import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDKbC_GipZhrTCF-FEwqWxDDN5RtTTygEk",
  authDomain: "vinnys-reservations.firebaseapp.com",
  projectId: "vinnys-reservations",
  storageBucket: "vinnys-reservations.firebasestorage.app",
  messagingSenderId: "590608474794",
  appId: "1:590608474794:web:c398b399ef4657c291e6d3",
  measurementId: "G-YCYG1Q88JZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);