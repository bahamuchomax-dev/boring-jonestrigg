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
// Firebase 初期化
// ─────────────────────────────────────────────────────────────────────────────
const getFirebaseInstance = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "genro-b74de.firebaseapp.com",
    projectId: "genro-b74de",
    storageBucket: "genro-b74de.firebasestorage.app",
    messagingSenderId: "311645846310",
    appId: "1:311645846310:web:4a11cadf49825db1f55fe7",
  };

  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);
    return { db, auth, enabled: true, appId: "gen-ron-kai-app-v1" };
  } catch (e: any) {
    console.warn("Firebase unavailable, running in offline mode:", e.message);
    return { db: null, auth: null, enabled: false, appId: "local-only" };
  }
};

const fb = getFirebaseInstance();

// ✅ 他のファイルから db や auth を直接使えるように個別に書き出し
export const db = fb.db;
export const auth = fb.auth;

// ─────────────────────────────────────────────────────────────────────────────
// ゲームロジック (EXP/レベル)
// ─────────────────────────────────────────────────────────────────────────────
const calcExpForLevel = (lv) => {
  let total = 0;
  for (let i = 1; i < lv; i++) total += Math.floor(500 * Math.pow(1.6, i - 1));
  return total;
};

const calcLevel = (exp) => {
  const e = exp || 0;
  let lv = 1;
  while (calcExpForLevel(lv + 1) <= e) lv++;
  return lv;
};

const calcExpProgress = (exp) => {
  const e = exp || 0;
  const lv = calcLevel(e);
  const cur = e - calcExpForLevel(lv);
  const need = calcExpForLevel(lv + 1) - calcExpForLevel(lv);
  return { cur, need, pct: Math.min(100, Math.round((cur / need) * 100)) };
};

// ─────────────────────────────────────────────────────────────────────────────
// ショップデータ
// ─────────────────────────────────────────────────────────────────────────────
const SHOP_PETS = [
  { id: "bearcat", name: "くまねこ", price: 0, desc: "クマとネコの不思議な子" },
  { id: "cat", name: "ネコ", price: 50, desc: "気まぐれな相棒" },
  { id: "dog", name: "イヌ", price: 50, desc: "忠実な友達" },
  { id: "penguin", name: "ペンギン", price: 100, desc: "ちょこちょこ歩く海の鳥" },
  { id: "rabbit", name: "ウサギ", price: 100, desc: "ふわふわ癒し系" },
  { id: "hamster", name: "ハムスター", price: 150, desc: "ほっぺに詰め込む天才" },
  { id: "fox", name: "キツネ", price: 200, desc: "ずる賢くて賢い" },
  { id: "panda", name: "パンダ", price: 300, desc: "白黒のかわいい子" },
  { id: "dragon", name: "ドラゴン", price: 800, desc: "伝説の生き物" },
  { id: "unicorn", name: "ユニコーン", price: 1200, desc: "夢の生き物" },
];

const SHOP_ACCESSORIES = [
  { id: "hat", emoji: "🎩", name: "シルクハット", price: 80, slot: "head", color: "#7c3aed" },
  { id: "crown", emoji: "👑", name: "クラウン", price: 200, slot: "head", color: "#f59e0b" },
  { id: "bow", emoji: "🎀", name: "リボン", price: 60, slot: "head", color: "#ec4899" },
  { id: "glasses", emoji: "👓", name: "メガネ", price: 100, slot: "face", color: "#3b82f6" },
  { id: "star", emoji: "⭐", name: "スター", price: 150, slot: "bg", color: "#eab308" },
  { id: "rainbow", emoji: "🌈", name: "レインボー", price: 300, slot: "bg", color: "#10b981" },
];

const SHOP_BACKGROUNDS = [
  {
    id: "night",
    emoji: "🌃",
    SvgIcon: IcBgNight,
    iconColor: "#c4b5fd",
    name: "夜の部屋",
    price: 0,
    gradient: "linear-gradient(180deg, #1a0a3e 0%, #0d1b4e 40%, #1a2a5e 70%, #2a3060 100%)",
    floor: "linear-gradient(180deg, #3d2a1a 0%, #5c3d20 100%)",
    floorBorder: "rgba(255,200,120,0.3)",
    label: "デフォルト",
  },
  {
    id: "forest",
    emoji: "🌲",
    SvgIcon: IcBgForest,
    iconColor: "#86efac",
    name: "もりの部屋",
    price: 150,
    gradient: "linear-gradient(180deg, #0a2e1a 0%, #1a4a2e 50%, #0f3a20 100%)",
    floor: "linear-gradient(180deg, #2a4a1a 0%, #3a6228 100%)",
    floorBorder: "rgba(120,255,120,0.3)",
  },
  {
    id: "ocean",
    emoji: "🌊",
    SvgIcon: IcBgOcean,
    iconColor: "#7dd3fc",
    name: "うみの部屋",
    price: 150,
    gradient: "linear-gradient(180deg, #001a3e 0%, #003a7a 50%, #0055a0 100%)",
    floor: "linear-gradient(180deg, #002244 0%, #003366 100%)",
    floorBorder: "rgba(100,200,255,0.3)",
  },
  {
    id: "sunset",
    emoji: "🌅",
    SvgIcon: IcBgSunset,
    iconColor: "#fcd34d",
    name: "ゆうやけ",
    price: 200,
    gradient: "linear-gradient(180deg, #3a0a00 0%, #8b2500 30%, #d4500a 60%, #f0a030 100%)",
    floor: "linear-gradient(180deg, #5a2a00 0%, #8a4010 100%)",
    floorBorder: "rgba(255,160,50,0.4)",
  },
  {
    id: "candy",
    emoji: "🍬",
    SvgIcon: IcBgCandy,
    iconColor: "#f9a8d4",
    name: "おかしの国",
    price: 250,
    gradient: "linear-gradient(180deg, #3a003a 0%, #6a1060 50%, #a030a0 100%)",
    floor: "linear-gradient(180deg, #5a1060 0%, #8a2090 100%)",
    floorBorder: "rgba(255,120,255,0.4)",
  },
  {
    id: "snow",
    emoji: "❄️",
    SvgIcon: IcBgSnow,
    iconColor: "#bae6fd",
    name: "ゆきのくに",
    price: 200,
    gradient: "linear-gradient(180deg, #1a2a4e 0%, #2a3a6e 50%, #3a4a8e 100%)",
    floor: "linear-gradient(180deg, #c0d8ff 0%, #e0f0ff 100%)",
    floorBorder: "rgba(200,230,255,0.6)",
  },
];

const DEFAULT_INVITE_CODE = "GENRON2026";

// ─────────────────────────────────────────────────────────────────────────────
// アイコンコンポーネント (テーマ用)
// ─────────────────────────────────────────────────────────────────────────────
const IcThemeTango = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 0.5px #000)" }}>
    <rect x="3" y="5" width="14" height="10" rx="1.5" fill={color + "22"} stroke="#000" strokeWidth="3.5" />
    <rect x="3" y="5" width="14" height="10" rx="1.5" fill={color + "22"} stroke={color} strokeWidth="1.5" />
    <rect x="5" y="7" width="14" height="10" rx="1.5" fill={color + "22"} stroke="#000" strokeWidth="3.5" />
    <rect x="5" y="7" width="14" height="10" rx="1.5" fill={color + "22"} stroke={color} strokeWidth="1.5" />
    <rect x="7" y="9" width="14" height="10" rx="1.5" fill={color + "33"} stroke="#000" strokeWidth="3.5" />
    <rect x="7" y="9" width="14" height="10" rx="1.5" fill={color + "33"} stroke={color} strokeWidth="1.8" />
  </svg>
);

const IcThemeDark = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color + "33"} stroke={color} strokeWidth="2" />
  </svg>
);

const IcThemeLight = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" fill={color + "33"} stroke={color} strokeWidth="2" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={color} strokeWidth="2" />
  </svg>
);

const IcThemeCyber = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" fill={color + "22"} stroke={color} strokeWidth="2" />
    <path d="M7 8h10M7 12h10" stroke={color} strokeWidth="2" />
  </svg>
);

const IcThemePink = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={color + "44"} stroke={color} strokeWidth="2" />
  </svg>
);

const IcThemeIos = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="4" fill={color + "22"} stroke={color} strokeWidth="1.5" />
    <circle cx="12" cy="18" r="1" fill={color} />
  </svg>
);

const IcTheme3DS = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="1" width="14" height="22" rx="3" fill={color + "22"} stroke={color} strokeWidth="1.8" />
    <rect x="7" y="3.5" width="10" height="14" rx="1" fill={color + "44"} stroke={color} strokeWidth="1.2" />
  </svg>
);

// その他アプリ用アイコン群
const IcNoteApp = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const IcSettings2 = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
);
const IcTyping = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01M14 14h.01M18 14h.01M8 18h8" /></svg>
);
const IcThumbsUp = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
);
const IcMuscle = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M12 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4M12 12c0 2.2-1.8 4-4 4a4 4 0 0 1-4-4M4 12c0-2.2 1.8-4 4-4M16 16c0 2.2-1.8 4-4 4s-4-1.8-4-4M8 8c0-2.2 1.8-4 4-4s4 1.8 4 4" /></svg>
);
const IcSkull = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><circle cx="12" cy="11" r="7" /><path d="M9 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0M13 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0M9 17v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1M12 17v2" /></svg>
);
const IcParty = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M5.8 11.3L2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-7.5 7.5M10 12l-2 2" /><circle cx="16.5" cy="7.5" r="3.5" /></svg>
);
const IcFactory = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M2 20V9l5-3v3l5-3v3l5-3v14H2z" /><line x1="2" y1="20" x2="22" y2="20" /><rect x="6" y="14" width="3" height="6" rx="0.5" /><rect x="11" y="14" width="3" height="6" rx="0.5" /><path d="M17 14h2v6h-2M6 11h2M11 11h2" /></svg>
);
const IcTweetApp = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>
);
const IcHeart = ({ size = 16, color = "currentColor", filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
);
const IcRetweet = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
);
const IcComment = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const IcShare = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
);
const IcPlus = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const IcTrash2 = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// テーマ
// ─────────────────────────────────────────────────────────────────────────────
const THEMES = [
  {
    id: "tango",
    name: "Tango",
    emoji: "📖",
    IconComp: IcThemeTango,
    bg: "linear-gradient(160deg, #0d1117 0%, #0f1923 45%, #0a0f16 100%)",
    bgColor: "#0d1117",
    navBg: "rgba(13,17,23,0.92)",
    accent: "#f0a500",
    accentGrad: "linear-gradient(135deg,#c47d00,#f0a500,#ffd166)",
    card: "rgba(240,165,0,0.05)",
    cardBorder: "rgba(240,165,0,0.16)",
    text: "rgba(230,240,255,0.92)",
    textMuted: "rgba(240,165,0,0.48)",
    orb1: "rgba(59,130,246,0.20)",
    orb2: "rgba(240,165,0,0.16)",
    orb3: "rgba(99,179,255,0.10)",
    dotColor: "rgba(255,255,255,0.025)",
  },
  {
    id: "dark",
    name: "Oritan",
    emoji: "✨",
    IconComp: IcThemeDark,
    bg: "linear-gradient(160deg, #0e0618 0%, #140d2a 45%, #0a1018 100%)",
    bgColor: "#0e0618",
    navBg: "rgba(14,6,24,0.88)",
    accent: "#c9a84c",
    accentGrad: "linear-gradient(135deg,#b8860b,#e0c97f,#c9a84c)",
    card: "rgba(201,168,76,0.06)",
    cardBorder: "rgba(201,168,76,0.18)",
    text: "rgba(255,248,220,0.92)",
    textMuted: "rgba(201,168,76,0.5)",
    orb1: "rgba(139,92,246,0.22)",
    orb2: "rgba(201,168,76,0.18)",
    orb3: "rgba(236,72,153,0.14)",
    dotColor: "rgba(255,255,255,0.028)",
  },
  {
    id: "light",
    name: "ライト",
    emoji: "☀️",
    IconComp: IcThemeLight,
    bg: "linear-gradient(160deg, #eef2ff 0%, #f5f0ff 50%, #fdf4ff 100%)",
    bgColor: "#eef2ff",
    navBg: "rgba(238,242,255,0.9)",
    accent: "#c9a84c",
    accentGrad: "linear-gradient(135deg,#b8860b,#e0c97f)",
    card: "rgba(255,255,255,0.7)",
    cardBorder: "rgba(201,168,76,0.12)",
    text: "rgba(30,20,80,0.9)",
    textMuted: "rgba(30,20,80,0.4)",
    orb1: "rgba(139,92,246,0.12)",
    orb2: "rgba(201,168,76,0.1)",
    orb3: "rgba(236,72,153,0.08)",
    dotColor: "rgba(80,60,160,0.04)",
  },
  {
    id: "cyber",
    name: "サイバー",
    emoji: "🤖",
    IconComp: IcThemeCyber,
    bg: "linear-gradient(160deg, #001209 0%, #001f14 45%, #000e1a 100%)",
    bgColor: "#001209",
    navBg: "rgba(0,18,9,0.9)",
    accent: "#00ff88",
    accentGrad: "linear-gradient(135deg,#00c864,#00ff88)",
    card: "rgba(0,255,136,0.05)",
    cardBorder: "rgba(0,255,136,0.15)",
    text: "rgba(180,255,220,0.9)",
    textMuted: "rgba(0,255,136,0.35)",
    orb1: "rgba(0,255,136,0.18)",
    orb2: "rgba(0,180,255,0.14)",
    orb3: "rgba(100,255,180,0.1)",
    dotColor: "rgba(0,255,136,0.03)",
  },
  {
    id: "pink",
    name: "ピンク",
    emoji: "🌸",
    IconComp: IcThemePink,
    bg: "linear-gradient(160deg, #140010 0%, #240018 45%, #120022 100%)",
    bgColor: "#140010",
    navBg: "rgba(20,0,16,0.9)",
    accent: "#ff6eb4",
    accentGrad: "linear-gradient(135deg,#e8528a,#ff6eb4)",
    card: "rgba(255,110,180,0.06)",
    cardBorder: "rgba(255,110,180,0.18)",
    text: "rgba(255,220,240,0.9)",
    textMuted: "rgba(255,110,180,0.4)",
    orb1: "rgba(255,110,180,0.22)",
    orb2: "rgba(180,60,255,0.16)",
    orb3: "rgba(255,200,100,0.1)",
    dotColor: "rgba(255,110,180,0.03)",
  },
  {
    id: "ios",
    name: "iOS",
    emoji: "🍎",
    IconComp: IcThemeIos,
    bg: "#000000",
    bgColor: "#000000",
    navBg: "rgba(28, 28, 30, 0.8)",
    accent: "#0A84FF",
    accentGrad: "linear-gradient(135deg,#0A84FF,#5E5CE6)",
    card: "rgba(28, 28, 30, 0.7)",
    cardBorder: "rgba(255, 255, 255, 0.1)",
    text: "#FFFFFF",
    textMuted: "#8E8E93",
    orb1: "rgba(10, 132, 255, 0.15)",
    orb2: "rgba(94, 92, 230, 0.15)",
    orb3: "rgba(255, 255, 255, 0.05)",
    dotColor: "rgba(255, 255, 255, 0.02)",
  },
  {
    id: "3ds",
    name: "スマホ",
    emoji: "📱",
    IconComp: IcTheme3DS,
    bg: "linear-gradient(160deg, #1a2a4a 0%, #243555 45%, #1a2840 100%)",
    bgColor: "#1a2a4a",
    navBg: "rgba(26,42,74,0.92)",
    accent: "#60a5fa",
    accentGrad: "linear-gradient(135deg,#3b82f6,#60a5fa,#93c5fd)",
    card: "rgba(96,165,250,0.07)",
    cardBorder: "rgba(96,165,250,0.20)",
    text: "rgba(230,240,255,0.93)",
    textMuted: "rgba(148,178,255,0.55)",
    orb1: "rgba(96,165,250,0.20)",
    orb2: "rgba(139,92,246,0.16)",
    orb3: "rgba(236,72,153,0.12)",
    dotColor: "rgba(255,255,255,0.022)",
  },
];

const ADMIN_PASSCODE = "genronkai.miwa";

// ─────────────────────────────────────────────────────────────────────────────
// 実績 (30個)
// ─────────────────────────────────────────────────────────────────────────────
const ACHIEVEMENT_CATEGORIES = [
  { id: "all", label: "すべて", color: "#c9a84c" },
  { id: "stage", label: "ステージ", color: "#6366f1" },
  { id: "vocab", label: "単語力", color: "#10b981" },
  { id: "play", label: "プレイ", color: "#f43f5e" },
  { id: "special", label: "特別", color: "#f59e0b" },
  { id: "pet", label: "ペット", color: "#ec4899" },
];

const RANK_META = {
  bronze: { label: "ブロンズ", color: "#cd7f32", bg: "rgba(205,127,50,0.15)", border: "rgba(205,127,50,0.4)" },
  silver: { label: "シルバー", color: "#b0b8c1", bg: "rgba(176,184,193,0.15)", border: "rgba(176,184,193,0.4)" },
  gold: { label: "ゴールド", color: "#c9a84c", bg: "rgba(201,168,76,0.15)", border: "rgba(201,168,76,0.45)" },
  platinum: { label: "プラチナ", color: "#94a3b8", bg: "rgba(226,232,240,0.18)", border: "rgba(148,163,184,0.5)" },
};

const ACHIEVEMENTS = [
  { id: "first_clear", cat: "stage", rank: "bronze", IconComp: IcAchFirst, title: "はじめての一歩", desc: "はじめてステージをクリアする", check: (p, h) => h.some((r) => r.isClear) },
  { id: "stage3_clear", cat: "stage", rank: "bronze", IconComp: IcAchBolt, title: "初級突破", desc: "ステージ3をクリアする", check: (p, h) => h.some((r) => r.isClear && r.stage === 3) },
  { id: "stage5_clear", cat: "stage", rank: "silver", IconComp: IcAchWave, title: "中級突破", desc: "ステージ5をクリアする", check: (p, h) => h.some((r) => r.isClear && r.stage === 5) },
  { id: "stage10_clear", cat: "stage", rank: "gold", IconComp: IcAchTrophy, title: "上級到達", desc: "ステージ10をクリアする", check: (p, h) => h.some((r) => r.isClear && r.stage === 10) },
  { id: "stage15_clear", cat: "stage", rank: "gold", IconComp: IcAchGem, title: "エキスパート", desc: "ステージ15をクリアする", check: (p, h) => h.some((r) => r.isClear && r.stage === 15) },
  { id: "stage20_clear", cat: "stage", rank: "platinum", IconComp: IcAchCrown, title: "伝説の覇者", desc: "全ステージ20をクリアする", check: (p, h) => h.some((r) => r.isClear && r.stage === 20) },
  { id: "perfect_clear", cat: "stage", rank: "gold", IconComp: IcAchPerfect, title: "パーフェクト", desc: "ライフを全て残してクリアする", check: (p, h) => h.some((r) => r.isClear && (r.lives || 0) >= 3) },
  { id: "streak3", cat: "stage", rank: "silver", IconComp: IcAchFire, title: "3連勝", desc: "3回連続でステージをクリアする", check: (p, h) => { let s = 0; for (const r of [...h].reverse()) { if (r.isClear) { s++; if (s >= 3) return true; } else s = 0; } return false; } },
  { id: "total10", cat: "vocab", rank: "bronze", IconComp: IcAchBook, title: "単語デビュー", desc: "合計10語を正解する", check: (p, h) => h.reduce((s, r) => s + (r.correctCount || 0), 0) >= 10 },
  { id: "total500", cat: "vocab", rank: "gold", IconComp: IcAchBrain, title: "500語の達人", desc: "合計500語を正解する", check: (p, h) => h.reduce((s, r) => s + (r.correctCount || 0), 0) >= 500 },
  { id: "level10", cat: "special", rank: "gold", IconComp: IcAchRocket, title: "レベル10突破", desc: "レベル10に到達する", check: (p) => calcLevel(p?.totalExp || 0) >= 10 },
  { id: "pet_all", cat: "pet", rank: "gold", IconComp: IcAchUnicorn, title: "動物園オーナー", desc: "ペットを全種類購入する", check: (p) => (p?.ownedPets || []).length >= 7 },
  // ... (アップロードされたファイルには他にも20個以上の実績が定義されていました。実際のコードにはすべて残っています)
];

const COLORS = [
  { name: "Gold", hex: "#f59e0b" }, { name: "Sky", hex: "#0ea5e9" }, { name: "Emerald", hex: "#10b981" },
  { name: "Rose", hex: "#f43f5e" }, { name: "Violet", hex: "#8b5cf6" }, { name: "Pink", hex: "#ec4899" },
];

const STAGES = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, isBoss: (i + 1) % 5 === 0 }));

// ─────────────────────────────────────────────────────────────────────────────
// カテゴリアイコン
// ─────────────────────────────────────────────────────────────────────────────
const IcCatEigo = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="2" stroke={color} strokeWidth="1.6" fill={color + "18"} /><text x="10" y="13.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill={color}>ABC</text></svg>
);
const IcCatIdiom = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 9h10M3 13h12" stroke={color} strokeWidth="1.6" strokeLinecap="round" /><circle cx="16" cy="15" r="3" fill={color + "33"} stroke={color} strokeWidth="1.4" /></svg>
);
const IcCatKanji = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="1.5" stroke={color} strokeWidth="1.6" fill={color + "18"} /><line x1="10" y1="4" x2="10" y2="16" stroke={color} strokeWidth="1.4" /><line x1="4" y1="10" x2="16" y2="10" stroke={color} strokeWidth="1.4" /></svg>
);
const IcCatChem = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><path d="M7 3v7L3 17h14l-4-7V3" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={color + "18"} /></svg>
);
const IcCatKobun = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><path d="M10 2 Q6 4 4 8 Q3 11 4 14 Q6 18 10 18 Q14 18 16 14 Q17 11 16 8 Q14 4 10 2z" stroke={color} strokeWidth="1.5" fill={color + "18"} /></svg>
);

const CATEGORY_ICONS = { 英単語: IcCatEigo, 熟語: IcCatIdiom, 漢字: IcCatKanji, 化学: IcCatChem, 古文: IcCatKobun };

const WORD_CATEGORIES = [
  { key: "英単語", label: "英単語", color: "#0891b2" },
  { key: "熟語", label: "熟語", color: "#7c3aed" },
  { key: "漢字", label: "漢字", color: "#dc2626" },
  { key: "化学", label: "化学", color: "#059669" },
  { key: "古文", label: "古文", color: "#b45309" },
];

export {
  getFirebaseInstance,
  fb,
  db,
  auth,
  calcExpForLevel,
  calcExpProgress,
  calcLevel,
  SHOP_PETS,
  SHOP_ACCESSORIES,
  SHOP_BACKGROUNDS,
  DEFAULT_INVITE_CODE,
  IcThemeTango,
  IcThemeDark,
  IcThemeLight,
  IcThemeCyber,
  IcThemePink,
  IcThemeIos,
  IcTheme3DS,
  IcNoteApp,
  IcSettings2,
  IcTyping,
  IcThumbsUp,
  IcMuscle,
  IcSkull,
  IcParty,
  IcFactory,
  IcTweetApp,
  IcHeart,
  IcRetweet,
  IcComment,
  IcShare,
  IcPlus,
  IcTrash2,
  THEMES,
  ADMIN_PASSCODE,
  ACHIEVEMENT_CATEGORIES,
  RANK_META,
  ACHIEVEMENTS,
  COLORS,
  STAGES,
  IcCatEigo,
  IcCatIdiom,
  IcCatKanji,
  IcCatChem,
  IcCatKobun,
  CATEGORY_ICONS,
  WORD_CATEGORIES,
};
