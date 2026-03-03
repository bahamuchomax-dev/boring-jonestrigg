// src/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "genro-b74de.firebaseapp.com",
  projectId: "genro-b74de",
  storageBucket: "genro-b74de.firebasestorage.app",
  messagingSenderId: "311645846310",
  appId: "1:311645846310:web:4a11cadf49825db1f55fe7",
};

const app = getApps().length === 0 ? initializeApp(config) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
