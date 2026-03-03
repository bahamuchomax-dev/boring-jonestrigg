/* eslint-disable */
// @ts-nocheck
import React from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  IcAchBadge,
  IcAchBolt,
  IcAchBook,
  IcAchBooks,
  IcAchBrain,
  IcAchCat,
  IcAchChart,
  IcAchCoin,
  IcAchCrown,
  IcAchFire,
  IcAchFirst,
  IcAchFleur,
  IcAchGalaxy,
  IcAchGame,
  IcAchGem,
  IcAchGrad,
  IcAchJoystick,
  IcAchMedal,
  IcAchMuscle,
  IcAchPaw,
  IcAchPencil,
  IcAchPerfect,
  IcAchRocket,
  IcAchScoreGold,
  IcAchScoreSilver,
  IcAchSentence,
  IcAchStar,
  IcAchTrophy,
  IcAchUnicorn,
  IcAchVolcano,
  IcAchWave,
  IcBgCandy,
  IcBgForest,
  IcBgNight,
  IcBgOcean,
  IcBgSnow,
  IcBgSunset,
} from "./icons";

// ─────────────────────────────────────────────────────────────────────────────
// Firebase 初期化関数
// ─────────────────────────────────────────────────────────────────────────────
const getFirebaseInstance = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "genro-b74de.firebaseapp.com",
    projectId: "genro-b74de",
    storageBucket: "genro-b74de.firebasestorage.app",
    messagingSenderId: "311645846310",
    appId: "1:311645846310:web:4a11cadf49825db1f55fe7"
  };

  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db, isOffline: false };
  } catch (error) {
    console.error("Firebase初期化エラー:", error);
    return { app: null, auth: null, db: null, isOffline: true };
  }
};

// インスタンスを作成
const fb = getFirebaseInstance();

// 他のファイルから直接呼び出せるように個別にexportする
export const db = fb.db;
export const auth = fb.auth;

// ─────────────────────────────────────────────────────────────────────────────
// 定数・設定データ
// ─────────────────────────────────────────────────────────────────────────────

const THEMES = {
  light: {
    name: "ライト",
    bg: "#f8fafc",
    card: "#ffffff",
    text: "#1e293b",
    primary: "#3b82f6",
    accent: "#60a5fa",
    border: "#e2e8f0",
  },
  dark: {
    name: "ダーク",
    bg: "#0f172a",
    card: "#1e293b",
    text: "#f1f5f9",
    primary: "#3b82f6",
    accent: "#60a5fa",
    border: "#334155",
  },
  sepia: {
    name: "セピア",
    bg: "#fdf6e3",
    card: "#eee8d5",
    text: "#586e75",
    primary: "#b58900",
    accent: "#cb4b16",
    border: "#d5c4a1",
  },
};

const PET_TYPES = [
  { id: "cat", name: "ねこ", icon: "🐱", basePrice: 0 },
  { id: "dog", name: "いぬ", icon: "🐶", basePrice: 500 },
  { id: "rabbit", name: "うさぎ", icon: "🐰", basePrice: 1000 },
  { id: "fox", name: "きつね", icon: "🦊", basePrice: 1500 },
  { id: "bear", name: "くま", icon: "🐻", basePrice: 2000 },
  { id: "panda", name: "ぱんだ", icon: "🐼", basePrice: 3000 },
];

const ACCESSORIES = [
  { id: "none", name: "なし", icon: "", price: 0 },
  { id: "ribbon", name: "リボン", icon: "🎀", price: 200 },
  { id: "hat", name: "帽子", icon: "👒", price: 400 },
  { id: "glasses", name: "メガネ", icon: "👓", price: 600 },
  { id: "crown", name: "王冠", icon: "👑", price: 1000 },
  { id: "scarf", name: "マフラー", icon: "🧣", price: 500 },
  { id: "star", name: "星の飾り", icon: "⭐", price: 800 },
];

const BACKGROUNDS = [
  { id: "default", name: "デフォルト", icon: null, price: 0 },
  { id: "forest", name: "森", icon: IcBgForest, price: 1000 },
  { id: "ocean", name: "海", icon: IcBgOcean, price: 1000 },
  { id: "sunset", name: "夕焼け", icon: IcBgSunset, price: 1000 },
  { id: "night", name: "夜空", icon: IcBgNight, price: 1500 },
  { id: "snow", name: "雪原", icon: IcBgSnow, price: 1500 },
  { id: "candy", name: "お菓子", icon: IcBgCandy, price: 2000 },
];

const ACHIEVEMENTS = [
  { id: "first_step", title: "最初の一歩", desc: "単語を1つ覚えた", icon: IcAchFirst, goal: 1 },
  { id: "beginner", title: "初級学習者", desc: "単語を10個覚えた", icon: IcAchPencil, goal: 10 },
  { id: "step_up", title: "ステップアップ", desc: "単語を30個覚えた", icon: IcAchBook, goal: 30 },
  { id: "regular", title: "常連さん", desc: "単語を50個覚えた", icon: IcAchBooks, goal: 50 },
  { id: "expert", title: "エキスパート", desc: "単語を100個覚えた", icon: IcAchGrad, goal: 100 },
  { id: "master", title: "マスター", desc: "単語を200個覚えた", icon: IcAchTrophy, goal: 200 },
  { id: "legend", title: "レジェンド", desc: "単語を500個覚えた", icon: IcAchCrown, goal: 500 },
  { id: "login_3", title: "継続の才能", desc: "3日間連続ログイン", icon: IcAchFire, goal: 3 },
  { id: "login_7", title: "習慣化の達人", desc: "7日間連続ログイン", icon: IcAchBolt, goal: 7 },
  { id: "login_30", title: "不屈の精神", desc: "30日間連続ログイン", icon: IcAchUnicorn, goal: 30 },
  { id: "perfect_score", title: "パーフェクト", desc: "テストで100点を取った", icon: IcAchPerfect, goal: 1 },
  { id: "score_silver", title: "シルバー", desc: "テストで合計1000点突破", icon: IcAchScoreSilver, goal: 1000 },
  { id: "score_gold", title: "ゴールド", desc: "テストで合計5000点突破", icon: IcAchScoreGold, goal: 5000 },
  { id: "fast_learner", title: "スピードスター", desc: "1分以内に10問正解", icon: IcAchRocket, goal: 1 },
  { id: "sentence_maker", title: "文章の匠", desc: "例文を10個作成", icon: IcAchSentence, goal: 10 },
  { id: "collector", title: "コレクター", desc: "アイテムを5個所持", icon: IcAchGem, goal: 5 },
  { id: "fashionista", title: "ファッショニスタ", desc: "着せ替えを10回行う", icon: IcAchFleur, goal: 10 },
  { id: "rich", title: "お金持ち", desc: "コインを1000枚貯めた", icon: IcAchCoin, goal: 1000 },
  { id: "brain_power", title: "脳トレ中", desc: "累計学習時間1時間突破", icon: IcAchBrain, goal: 1 },
  { id: "hard_worker", title: "努力家", desc: "累計学習時間10時間突破", icon: IcAchMuscle, goal: 10 },
  { id: "pet_lover", title: "ペット愛好家", desc: "ペットと100回遊んだ", icon: IcAchPaw, goal: 100 },
  { id: "cat_master", title: "ねこ使い", desc: "ねこのレベルが最大", icon: IcAchCat, goal: 1 },
  { id: "early_bird", title: "早起きさん", desc: "朝6時前に学習した", icon: IcAchStar, goal: 1 },
  { id: "night_owl", title: "夜更かしさん", desc: "深夜2時以降に学習した", icon: IcAchGalaxy, goal: 1 },
  { id: "reviewer", title: "復習の鬼", desc: "同じ単語を5回間違えた", icon: IcAchWave, goal: 5 },
  { id: "gamer", title: "ゲーマー", desc: "ミニゲームを10回プレイ", icon: IcAchGame, goal: 10 },
  { id: "pro_gamer", title: "プロゲーマー", desc: "ミニゲームでハイスコア", icon: IcAchJoystick, goal: 1 },
  { id: "volcano", title: "情熱の火山", desc: "1日で単語を100個学習", icon: IcAchVolcano, goal: 1 },
  { id: "medal_hunter", title: "メダルハンター", desc: "実績を10個解除", icon: IcAchMedal, goal: 10 },
  { id: "data_master", title: "データマスター", desc: "分析画面を10回確認", icon: IcAchChart, goal: 10 },
];

const IcCatEigo = ({ color }) => (
  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
    <path
      d="M3 5h14M3 10h14M3 15h10"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const IcCatIdiom = ({ color }) => (
  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
    <path
      d="M5 10a5 5 0 1010 0 5 5 0 00-10 0z"
      stroke={color}
      strokeWidth="1.5"
    />
    <path d="M10 7v6M7 10h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IcCatKanji = ({ color }) => (
  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
    <path
      d="M4 4h12v12H4V4zm4 4h4v4H8V8z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);
const IcCatChem = ({ color }) => (
  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
    <path
      d="M7 3l-3 12h12l-3-12H7z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="11" r="2" stroke={color} strokeWidth="1.2" />
  </svg>
);
const IcCatKobun = ({ color }) => (
  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
    <path
      d="M16 4v12H6a2 2 0 01-2-2V6a2 2 0 012-2h10z"
      stroke={color}
      strokeWidth="1.5"
    />
    <line
      x1="7"
      y1="8"
      x2="13"
      y2="8"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <line
      x1="7"
      y1="11"
      x2="13"
      y2="11"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <circle cx="10" cy="3.5" r="1" fill={color} opacity="0.6" />
  </svg>
);

const CATEGORY_ICONS = {
  英単語: IcCatEigo,
  熟語: IcCatIdiom,
  漢字: IcCatKanji,
  化学: IcCatChem,
  古文: IcCatKobun,
};

const WORD_CATEGORIES = [
  { key: "英単語", label: "英単語", color: "#0891b2" },
  { key: "熟語", label: "熟語", color: "#7c3aed" },
  { key: "漢字", label: "漢字", color: "#dc2626" },
  { key: "化学", label: "化学", color: "#059669" },
  { key: "古文", label: "古文", color: "#b45309" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 全ての定数をまとめてexport
// ─────────────────────────────────────────────────────────────────────────────
export {
  getFirebaseInstance,
  fb,
  THEMES,
  PET_TYPES,
  ACCESSORIES,
  BACKGROUNDS,
  ACHIEVEMENTS,
  CATEGORY_ICONS,
  WORD_CATEGORIES
};

// デフォルトexport（もし必要なら）
export default fb;
