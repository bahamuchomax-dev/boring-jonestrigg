// src/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "genro-b74de.firebaseapp.com",
  projectId: "genro-b74de",
  storageBucket: "genro-b74de.firebasestorage.app",
  messagingSenderId: "311645846310",
  appId: "1:311645846310:web:4a11cadf49825db1f55fe7",
};
// 本当にキーが届いているか、コンソールに出力して確認
console.log("設定されているAPIキー:", config.apiKey);
const app = getApps().length === 0 ? initializeApp(config) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const appId = "gen-ron-kai-app-v1";
console.log("appId:", app.options.appId);
