import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <-- You need this to enable Authentication

const firebaseConfig = {
  apiKey: "AIzaSyAdB9VIWXF6t7TWMQzmNWSe1Ih_BCuOi3Y",
  authDomain: "safora-48093.firebaseapp.com",
  projectId: "safora-48093",
  storageBucket: "safora-48093.firebasestorage.app",
  messagingSenderId: "83894177344",
  appId: "1:83894177344:web:4a3f14ad230fb00a7719a5"
};

// Initialize Firebase and EXPORT it
export const app = initializeApp(firebaseConfig);

// Initialize Authentication and EXPORT it so AuthContext can use it
export const auth = getAuth(app);