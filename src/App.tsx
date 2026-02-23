import React, { useState, useEffect, useCallback, useRef } from "react";
// pressTimerRef はクレジット長押し用タイマー管理（クラッシュ防止・Reactベストプラクティス準拠）
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  addDoc,
  query,
  limit,
  deleteDoc,
  updateDoc,
  where,
  getDocs,
  orderBy,
  writeBatch,
} from "firebase/firestore";
// ─── Custom SVG Icons ────────────────────────────────────────────────────────
const Ic = ({
  size = 24,
  style,
  className,
  children,
  viewBox = "0 0 24 24",
}) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
  >
    {children}
  </svg>
);
const Trophy = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M7 3h10v5a5 5 0 0 1-10 0V3z" />
    <path d="M7 5H4a2 2 0 0 0 0 4h3" />
    <path d="M17 5h3a2 2 0 0 1 0 4h-3" />
    <path d="M12 13v4" />
    <path d="M8 21h8" />
    <path d="M10 17h4" />
  </Ic>
);
const Star = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Ic>
);
const Play = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </Ic>
);
const RotateCcw = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
  </Ic>
);
const Zap = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Ic>
);
const Settings = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Ic>
);
const User = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Ic>
);
const Plus = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Ic>
);
const Trash2 = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </Ic>
);
const Home = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
    <polyline points="9 21 9 12 15 12 15 21" />
  </Ic>
);
const CheckCircle2 = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M7.5 12l3 3 6-6" />
  </Ic>
);
const BookOpen = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </Ic>
);
const BarChart3 = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <rect x="3" y="13" width="4" height="8" rx="1" />
    <rect x="10" y="8" width="4" height="13" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </Ic>
);
const ChevronLeft = ({ size = 24, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <polyline points="15 18 9 12 15 6" />
  </Ic>
);
const ChevronRight = ({ size = 24, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <polyline points="9 18 15 12 9 6" />
  </Ic>
);
const Calendar = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Ic>
);
const MessageSquare = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Ic>
);
const Send = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Ic>
);
const Layers = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </Ic>
);
const Lock = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Ic>
);
const Loader2 = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </Ic>
);
const FileUp = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <polyline points="9 15 12 12 15 15" />
  </Ic>
);
const Heart = ({ size, style, className, fill }) => (
  <Ic size={size} style={style} className={className}>
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={fill || "none"}
    />
  </Ic>
);
const BookCheck = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M9 12l2 2 4-4" />
  </Ic>
);
const Megaphone = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M3 11l18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </Ic>
);
const Sparkles = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
    <path d="M19 3l.8 2.2L22 6l-2.2.8L19 9l-.8-2.2L16 6l2.2-.8z" />
    <path d="M5 18l.6 1.6L7 20l-1.4.4L5 22l-.6-1.6L3 20l1.4-.4z" />
  </Ic>
);
const Award = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </Ic>
);
const MapIcon = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </Ic>
);
const Flag = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </Ic>
);
const Volume2 = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </Ic>
);
const Flame = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </Ic>
);
const UserPlus = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </Ic>
);
const Users = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Ic>
);
const Search = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Ic>
);
const Copy = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Ic>
);
const Check = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <polyline points="20 6 9 17 4 12" />
  </Ic>
);
const Clock = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Ic>
);
const Target = ({ size, style, className }) => (
  <Ic size={size} style={style} className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </Ic>
);
// ─────────────────────────────────────────────────────────────────────────────

// ─── Background theme SVG Icons ──────────────────────────────────────────────
const IcBgNight = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M20 6C14 6 9 11 9 17c0 6 5 10 11 10 2 0 4-0.5 5.5-1.5-6 0-10.5-4-10.5-8.5 0-5 4-9 9-9.5C23 7.2 21.5 6 20 6z"
      fill={color}
      opacity="0.9"
    />
    <circle cx="24" cy="8" r="1.2" fill={color} />
    <circle cx="27" cy="13" r="0.8" fill={color} opacity="0.7" />
    <circle cx="22" cy="4" r="0.7" fill={color} opacity="0.6" />
  </svg>
);
const IcBgForest = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 4L9 16h4l-4 8h7v4h0v-4h7l-4-8h4z" fill={color} opacity="0.9" />
    <path d="M7 10L2 20h3l-3 6h5v2h0v-2h5l-3-6h3z" fill={color} opacity="0.6" />
    <path
      d="M25 10l-5 10h3l-3 6h5v2h0v-2h5l-3-6h3z"
      fill={color}
      opacity="0.6"
    />
  </svg>
);
const IcBgOcean = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M2 20 Q8 16 14 20 Q20 24 26 20 Q29 18 30 20L30 28 Q26 26 20 28 Q14 30 8 28 Q4 26 2 28z"
      fill={color}
      opacity="0.9"
    />
    <path
      d="M2 15 Q8 11 14 15 Q20 19 26 15 Q28 13 30 15"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.6"
    />
    <path
      d="M2 10 Q8 7 14 10 Q20 13 26 10"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      fill="none"
      opacity="0.4"
    />
  </svg>
);
const IcBgSunset = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="18" r="7" fill={color} opacity="0.9" />
    <path
      d="M16 4v3M16 29v3M4 18H1M31 18h-3M7.5 7.5L9.6 9.6M22.4 22.4L24.5 24.5M7.5 28.5L9.6 26.4M22.4 9.6L24.5 7.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M2 22 Q16 18 30 22"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.5"
    />
  </svg>
);
const IcBgCandy = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle
      cx="16"
      cy="14"
      r="8"
      stroke={color}
      strokeWidth="2"
      fill="none"
      opacity="0.9"
    />
    <path d="M11 14 Q16 9 21 14 Q16 19 11 14z" fill={color} opacity="0.8" />
    <path
      d="M16 22v6M13 28h6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.7"
    />
    <circle cx="24" cy="7" r="1.5" fill={color} opacity="0.5" />
    <circle cx="8" cy="8" r="1" fill={color} opacity="0.4" />
  </svg>
);
const IcBgSnow = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 4v24M4 16h24M8.7 8.7l14.6 14.6M23.3 8.7L8.7 23.3"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.9"
    />
    <circle cx="16" cy="4" r="1.5" fill={color} />
    <circle cx="16" cy="28" r="1.5" fill={color} />
    <circle cx="4" cy="16" r="1.5" fill={color} />
    <circle cx="28" cy="16" r="1.5" fill={color} />
    <circle cx="8.7" cy="8.7" r="1.2" fill={color} opacity="0.7" />
    <circle cx="23.3" cy="8.7" r="1.2" fill={color} opacity="0.7" />
    <circle cx="8.7" cy="23.3" r="1.2" fill={color} opacity="0.7" />
    <circle cx="23.3" cy="23.3" r="1.2" fill={color} opacity="0.7" />
  </svg>
);
// SVG icons for feed effect particles (IcHeart is defined later, shared)
const IcSparkle = ({ size = 16, color = "#fbbf24" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
    <path d="M8 1l1.2 4.8L14 8l-4.8 1.2L8 15l-1.2-4.8L2 8l4.8-1.2z" />
  </svg>
);
const IcDiamond = ({ size = 16, color = "#60a5fa" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
    <path d="M8 2L2 8l6 6 6-6z" />
  </svg>
);
const IcCircle = ({ size = 16, color = "#a78bfa" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="5" fill={color} />
  </svg>
);
// ─── App-specific SVG Icons (replacing emoji) ────────────────────────────────
const IcMap = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M4 8l8-4 8 4 8-4v20l-8 4-8-4-8 4V8z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill={color + "22"}
    />
    <line x1="12" y1="4" x2="12" y2="24" stroke={color} strokeWidth="1.6" />
    <line x1="20" y1="8" x2="20" y2="28" stroke={color} strokeWidth="1.6" />
    <circle cx="16" cy="14" r="2.5" fill={color} />
  </svg>
);
const IcMegaphone = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M6 12h4l10-6v16l-10-6H6a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill={color + "22"}
    />
    <path
      d="M10 18v5a2 2 0 0 0 4 0v-5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="24" cy="10" r="1.5" fill={color} opacity="0.7" />
    <path
      d="M26 7c1.5 1 2.5 3 2.5 5s-1 4-2.5 5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
const IcBook = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M6 5h10a4 4 0 0 1 4 4v16H6V5z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill={color + "22"}
    />
    <path
      d="M20 9h4a2 2 0 0 1 2 2v14h-6V9z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill={color + "11"}
    />
    <line
      x1="10"
      y1="11"
      x2="16"
      y2="11"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="10"
      y1="15"
      x2="16"
      y2="15"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M11 22l2 2 4-4"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IcShop = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M5 14h22v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V14z"
      stroke={color}
      strokeWidth="1.8"
      fill={color + "22"}
    />
    <path
      d="M3 10l2.5-5h21L29 10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      stroke={color}
      strokeWidth="1.8"
      fill={color + "33"}
    />
    <path
      d="M12 12v4a4 4 0 0 0 8 0v-4"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="19"
      x2="16"
      y2="23"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="13.5"
      y1="21"
      x2="18.5"
      y2="21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const IcPet = ({ size = 32, color = "currentColor", style: extraStyle }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    style={extraStyle}
  >
    {/* 耳（左） */}
    <path
      d="M8 13 L6 5 L13 10z"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    {/* 耳内（左） */}
    <path d="M8.5 12 L7.5 7.5 L11.5 10.5z" fill={color + "55"} />
    {/* 耳（右） */}
    <path
      d="M24 13 L26 5 L19 10z"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    {/* 耳内（右） */}
    <path d="M23.5 12 L24.5 7.5 L20.5 10.5z" fill={color + "55"} />
    {/* 頭部 */}
    <ellipse
      cx="16"
      cy="15"
      rx="8.5"
      ry="7.5"
      fill={color + "22"}
      stroke={color}
      strokeWidth="1.6"
    />
    {/* 体 */}
    <ellipse
      cx="16"
      cy="25"
      rx="6"
      ry="5"
      fill={color + "18"}
      stroke={color}
      strokeWidth="1.4"
    />
    {/* 目（左） */}
    <ellipse cx="13" cy="14.5" rx="2" ry="2.2" fill={color + "dd"} />
    <ellipse
      cx="13"
      cy="14.5"
      rx="1.1"
      ry="1.4"
      fill={color === "currentColor" ? "#1a1040" : "#1a1040"}
    />
    <circle cx="13.6" cy="13.8" r="0.55" fill="white" />
    {/* 目（右） */}
    <ellipse cx="19" cy="14.5" rx="2" ry="2.2" fill={color + "dd"} />
    <ellipse cx="19" cy="14.5" rx="1.1" ry="1.4" fill="#1a1040" />
    <circle cx="19.6" cy="13.8" r="0.55" fill="white" />
    {/* 鼻 */}
    <path
      d="M15.2 17.5 L16 18.3 L16.8 17.5 L16 17z"
      fill={color}
      opacity="0.7"
    />
    {/* 口 */}
    <path
      d="M16 18.3 Q14.2 19.8 13.5 19.5"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
      fill="none"
      opacity="0.75"
    />
    <path
      d="M16 18.3 Q17.8 19.8 18.5 19.5"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
      fill="none"
      opacity="0.75"
    />
    {/* ひげ（左） */}
    <line
      x1="13"
      y1="17.8"
      x2="7.5"
      y2="17"
      stroke={color}
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.5"
    />
    <line
      x1="13"
      y1="18.5"
      x2="7.5"
      y2="18.8"
      stroke={color}
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.5"
    />
    {/* ひげ（右） */}
    <line
      x1="19"
      y1="17.8"
      x2="24.5"
      y2="17"
      stroke={color}
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.5"
    />
    <line
      x1="19"
      y1="18.5"
      x2="24.5"
      y2="18.8"
      stroke={color}
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.5"
    />
    {/* しっぽ */}
    <path
      d="M21 27 Q27 25 26 21 Q25 18 23 19"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.7"
    />
    {/* 前足（左） */}
    <ellipse
      cx="12"
      cy="29"
      rx="2.5"
      ry="1.5"
      fill={color + "22"}
      stroke={color}
      strokeWidth="1.2"
    />
    {/* 前足（右） */}
    <ellipse
      cx="18"
      cy="29"
      rx="2.5"
      ry="1.5"
      fill={color + "22"}
      stroke={color}
      strokeWidth="1.2"
    />
  </svg>
);
const IcGift = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect
      x="4"
      y="14"
      width="24"
      height="15"
      rx="2"
      stroke={color}
      strokeWidth="1.8"
      fill={color + "22"}
    />
    <rect
      x="4"
      y="9"
      width="24"
      height="5"
      rx="1.5"
      stroke={color}
      strokeWidth="1.8"
      fill={color + "33"}
    />
    <line x1="16" y1="9" x2="16" y2="29" stroke={color} strokeWidth="1.8" />
    <path
      d="M16 9c0 0-4-1-4-4a4 4 0 0 1 4 4z"
      stroke={color}
      strokeWidth="1.5"
      fill={color + "44"}
    />
    <path
      d="M16 9c0 0 4-1 4-4a4 4 0 0 0-4 4z"
      stroke={color}
      strokeWidth="1.5"
      fill={color + "44"}
    />
  </svg>
);
const IcAdmin = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 4l10 4v8c0 6-4 10-10 12C10 26 6 22 6 16V8l10-4z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill={color + "22"}
    />
    <path
      d="M11 16l3 3 7-7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IcFood = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <ellipse
      cx="16"
      cy="22"
      rx="10"
      ry="5"
      stroke={color}
      strokeWidth="1.8"
      fill={color + "22"}
    />
    <path
      d="M8 18c0-4.4 3.6-8 8-8s8 3.6 8 8"
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M12 12c-1-3 1-7 4-7s5 4 4 7"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="10"
      x2="16"
      y2="22"
      stroke={color}
      strokeWidth="1.4"
      strokeDasharray="1.5 2"
    />
  </svg>
);
const IcPaw = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <ellipse
      cx="16"
      cy="21"
      rx="7"
      ry="6"
      stroke={color}
      strokeWidth="1.8"
      fill={color + "22"}
    />
    <circle
      cx="9"
      cy="13"
      r="3"
      stroke={color}
      strokeWidth="1.6"
      fill={color + "22"}
    />
    <circle
      cx="14"
      cy="10"
      r="2.5"
      stroke={color}
      strokeWidth="1.6"
      fill={color + "22"}
    />
    <circle
      cx="19.5"
      cy="10"
      r="2.5"
      stroke={color}
      strokeWidth="1.6"
      fill={color + "22"}
    />
    <circle
      cx="24"
      cy="13"
      r="3"
      stroke={color}
      strokeWidth="1.6"
      fill={color + "22"}
    />
  </svg>
);
const IcCoin = ({ size = 20, color = "#facc15" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle
      cx="10"
      cy="10"
      r="8.5"
      stroke={color}
      strokeWidth="1.5"
      fill={color + "22"}
    />
    <circle
      cx="10"
      cy="10"
      r="6"
      stroke={color}
      strokeWidth="1"
      fill={color + "11"}
    />
    <text
      x="10"
      y="14"
      textAnchor="middle"
      fontSize="8"
      fontWeight="bold"
      fill={color}
    >
      ¥
    </text>
  </svg>
);
// ── シルクハット（紫系・塗り潰し）────────────────────────────────
const IcHat = ({ size = 40, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* ブリム */}
    <ellipse
      cx="20"
      cy="30"
      rx="15"
      ry="4.5"
      fill="#5b21b6"
      stroke="#3b0764"
      strokeWidth="1.4"
    />
    {/* 胴体 */}
    <path
      d="M12 30V16a8 8 0 0 1 16 0v14"
      fill="#7c3aed"
      stroke="#4c1d95"
      strokeWidth="1.4"
    />
    {/* 上面 */}
    <ellipse
      cx="20"
      cy="16"
      rx="8"
      ry="3.5"
      fill="#8b5cf6"
      stroke="#4c1d95"
      strokeWidth="1.2"
    />
    {/* ハイライト */}
    <ellipse cx="17" cy="20" rx="2" ry="5" fill="rgba(255,255,255,0.12)" />
    {/* ハットバンド */}
    <path
      d="M12 26 Q20 28 28 26"
      stroke="#c4b5fd"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
// ── クラウン（金色・塗り潰し）────────────────────────────────────
const IcCrown2 = ({ size = 40, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* 王冠本体 */}
    <path
      d="M6 28l4-14 8 8 2-10 2 10 8-8 4 14H6z"
      fill="#f59e0b"
      stroke="#b45309"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    {/* ベルト部分 */}
    <rect
      x="6"
      y="28"
      width="28"
      height="5"
      rx="2"
      fill="#fbbf24"
      stroke="#b45309"
      strokeWidth="1.4"
    />
    {/* 宝石・先端 */}
    <circle
      cx="20"
      cy="12"
      r="2.5"
      fill="#ef4444"
      stroke="#b91c1c"
      strokeWidth="1"
    />
    <circle
      cx="8"
      cy="18"
      r="2"
      fill="#3b82f6"
      stroke="#1d4ed8"
      strokeWidth="1"
    />
    <circle
      cx="32"
      cy="18"
      r="2"
      fill="#3b82f6"
      stroke="#1d4ed8"
      strokeWidth="1"
    />
    {/* ハイライト */}
    <path
      d="M9 30h22"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);
// ── リボン（ピンク系・塗り潰し）──────────────────────────────────
const IcBow = ({ size = 40, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* 左上ループ */}
    <path
      d="M20 20c-3-3-10-8-12-5s3 10 12 5z"
      fill="#f472b6"
      stroke="#be185d"
      strokeWidth="1.4"
    />
    {/* 右上ループ */}
    <path
      d="M20 20c3-3 10-8 12-5s-3 10-12 5z"
      fill="#f472b6"
      stroke="#be185d"
      strokeWidth="1.4"
    />
    {/* 左下ループ */}
    <path
      d="M20 20c-3 3-10 8-12 5s3-10 12-5z"
      fill="#fb7185"
      stroke="#be185d"
      strokeWidth="1.4"
    />
    {/* 右下ループ */}
    <path
      d="M20 20c3 3 10 8 12 5s-3-10-12-5z"
      fill="#fb7185"
      stroke="#be185d"
      strokeWidth="1.4"
    />
    {/* 中心ノット */}
    <circle
      cx="20"
      cy="20"
      r="3.2"
      fill="#ec4899"
      stroke="#be185d"
      strokeWidth="1.2"
    />
    <circle cx="20" cy="20" r="1.5" fill="rgba(255,255,255,0.5)" />
  </svg>
);
// ── メガネ（ブルー系・塗り潰し）──────────────────────────────────
const IcGlasses = ({ size = 40, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* 左レンズ */}
    <circle
      cx="13"
      cy="22"
      r="7.5"
      fill="#bfdbfe"
      stroke="#1d4ed8"
      strokeWidth="1.8"
    />
    {/* 右レンズ */}
    <circle
      cx="27"
      cy="22"
      r="7.5"
      fill="#bfdbfe"
      stroke="#1d4ed8"
      strokeWidth="1.8"
    />
    {/* ブリッジ */}
    <path
      d="M20.5 21.5h-1"
      stroke="#1d4ed8"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* テンプル左 */}
    <path
      d="M5.5 19 Q5.5 22 8 22"
      stroke="#3b82f6"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
    {/* テンプル右 */}
    <path
      d="M34.5 19 Q34.5 22 32 22"
      stroke="#3b82f6"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
    {/* レンズハイライト */}
    <circle cx="10.5" cy="19.5" r="2" fill="rgba(255,255,255,0.5)" />
    <circle cx="24.5" cy="19.5" r="2" fill="rgba(255,255,255,0.5)" />
  </svg>
);
// ── スター（黄色・塗り潰し）──────────────────────────────────────
const IcStar2 = ({ size = 40, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* 影 */}
    <polygon
      points="20 6 24.5 15 35 16.5 27.5 24 29.5 34.5 20 29.5 10.5 34.5 12.5 24 5 16.5 15.5 15"
      fill={color}
      opacity="0.12"
    />
    {/* 本体：アウトラインのみ */}
    <polygon
      points="20 4 24.5 14.5 36 16 27.5 24 30 35.5 20 30 10 35.5 12.5 24 4 16 15.5 14.5"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* 内側ハイライト線 */}
    <polygon
      points="20 9 23 16.5 31 17.5 25.5 22.5 27 30 20 26.5 13 30 14.5 22.5 9 17.5 17 16.5"
      fill="none"
      stroke={color}
      strokeWidth="0.8"
      strokeLinejoin="round"
      opacity="0.35"
    />
    {/* 中心光 */}
    <circle cx="20" cy="20" r="2" fill={color} opacity="0.25" />
  </svg>
);
// ── レインボー（多色・塗り潰し）──────────────────────────────────
const IcRainbow = ({ size = 40, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* 雲（左） */}
    <circle cx="6" cy="31" r="4" fill="white" opacity="0.9" />
    <circle cx="10" cy="29" r="4.5" fill="white" opacity="0.9" />
    {/* 雲（右） */}
    <circle cx="34" cy="31" r="4" fill="white" opacity="0.9" />
    <circle cx="30" cy="29" r="4.5" fill="white" opacity="0.9" />
    {/* 虹アーチ */}
    <path
      d="M4 30a16 16 0 0 1 32 0"
      stroke="#ef4444"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M7 30a13 13 0 0 1 26 0"
      stroke="#f97316"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M10.5 30a9.5 9.5 0 0 1 19 0"
      stroke="#facc15"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M14 30a6 6 0 0 1 12 0"
      stroke="#4ade80"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M17 30a3 3 0 0 1 6 0"
      stroke="#60a5fa"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
// ─────────────────────────────────────────────────────────────────────────────

// ─── Per-pet SVG icons ───────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// ペットアイコン — プロ線画スタイル (32×32 viewBox)
// strokeWidth 一定、fill は color+"22" で軽い塗り
// ═══════════════════════════════════════════════════════════════

// ネコ（ピンク系固有色）
const IcCat = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M7 13 L5 5 L12 10 Z"
      fill="#e8a0c0"
      stroke="#c06090"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M25 13 L27 5 L20 10 Z"
      fill="#e8a0c0"
      stroke="#c06090"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 11.5 L6.5 7 L11 10 Z"
      fill="#ffcce0"
      stroke="#d080a8"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path
      d="M24.5 11.5 L25.5 7 L21 10 Z"
      fill="#ffcce0"
      stroke="#d080a8"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path
      d="M7 13 Q5 17 6 20 Q7 25 12 27 Q16 28.5 20 27 Q25 25 26 20 Q27 17 25 13 Q22 9 16 9 Q10 9 7 13 Z"
      fill="#f0c8e0"
      stroke="#c06090"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 16.5 Q12 15 13.5 16.5 Q12 17.8 10.5 16.5 Z"
      fill="#3a2030"
      stroke="#3a2030"
      strokeWidth="0.8"
    />
    <path
      d="M18.5 16.5 Q20 15 21.5 16.5 Q20 17.8 18.5 16.5 Z"
      fill="#3a2030"
      stroke="#3a2030"
      strokeWidth="0.8"
    />
    <circle cx="11.8" cy="16.3" r="0.5" fill="rgba(255,255,255,0.9)" />
    <circle cx="19.8" cy="16.3" r="0.5" fill="rgba(255,255,255,0.9)" />
    <path d="M14.5 20 L16 21.2 L17.5 20 L16 19.2 Z" fill="#d04080" />
    <path
      d="M16 21.2 L15.2 22.5"
      stroke="#d04080"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M16 21.2 L16.8 22.5"
      stroke="#d04080"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="5"
      y1="19.5"
      x2="11"
      y2="20.5"
      stroke="#c080a0"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.8"
    />
    <line
      x1="5"
      y1="21.5"
      x2="11"
      y2="21.5"
      stroke="#c080a0"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.8"
    />
    <line
      x1="27"
      y1="19.5"
      x2="21"
      y2="20.5"
      stroke="#c080a0"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.8"
    />
    <line
      x1="27"
      y1="21.5"
      x2="21"
      y2="21.5"
      stroke="#c080a0"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.8"
    />
    <ellipse cx="9" cy="20.5" rx="2.5" ry="1.8" fill="rgba(220,80,120,0.28)" />
    <ellipse cx="23" cy="20.5" rx="2.5" ry="1.8" fill="rgba(220,80,120,0.28)" />
  </svg>
);
// イヌ（キャラメル固有色）
const IcDog = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M6 10 Q3 11 3 17 Q3.5 22 7.5 22 Q8 22 8.5 21.5"
      stroke="#a06030"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#d4904a"
    />
    <path
      d="M26 10 Q29 11 29 17 Q28.5 22 24.5 22 Q24 22 23.5 21.5"
      stroke="#a06030"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#d4904a"
    />
    <path
      d="M8 10 Q7 14 7 17 Q7 24 16 25.5 Q25 24 25 17 Q25 14 24 10 Q22 6 16 6 Q10 6 8 10 Z"
      fill="#e8aa60"
      stroke="#a06030"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M11.5 19 Q12 23 16 24 Q20 23 20.5 19 Q20 17 16 17 Q12 17 11.5 19 Z"
      fill="#f0c880"
      stroke="#a06030"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <circle
      cx="11.5"
      cy="14"
      r="2.2"
      fill="white"
      stroke="#3a1800"
      strokeWidth="1.2"
    />
    <circle
      cx="20.5"
      cy="14"
      r="2.2"
      fill="white"
      stroke="#3a1800"
      strokeWidth="1.2"
    />
    <circle cx="11.5" cy="14" r="1" fill="#2a1000" />
    <circle cx="20.5" cy="14" r="1" fill="#2a1000" />
    <circle cx="12.2" cy="13.3" r="0.45" fill="rgba(255,255,255,0.8)" />
    <circle cx="21.2" cy="13.3" r="0.45" fill="rgba(255,255,255,0.8)" />
    <ellipse cx="16" cy="19" rx="2.2" ry="1.5" fill="#8a4020" />
    <circle cx="15.2" cy="18.5" r="0.4" fill="rgba(255,255,255,0.5)" />
    <path
      d="M14.5 21 Q16 22.5 17.5 21"
      stroke="#8a4020"
      strokeWidth="1.3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M23 24 Q27 20 28 16 Q28.5 13 27 12"
      stroke="#a06030"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
// ウサギ（薄紫固有色）
const IcRabbit = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M11 13 Q9 7 9.5 3 Q10 0.5 12 1 Q14 1.5 13.5 5 Q13 9 13 13"
      fill="#d8b8e8"
      stroke="#9060b8"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.2 12 Q10 7 10.5 3.5 Q11 2 12 2.2 Q13 2.5 12.8 5.5 Q12.5 9 12.5 12"
      fill="#f0d0f8"
      stroke="#b878d8"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    <path
      d="M21 13 Q23 7 22.5 3 Q22 0.5 20 1 Q18 1.5 18.5 5 Q19 9 19 13"
      fill="#d8b8e8"
      stroke="#9060b8"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.8 12 Q22 7 21.5 3.5 Q21 2 20 2.2 Q19 2.5 19.2 5.5 Q19.5 9 19.5 12"
      fill="#f0d0f8"
      stroke="#b878d8"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    <circle
      cx="16"
      cy="19"
      r="9.5"
      fill="#ecdcf8"
      stroke="#9060b8"
      strokeWidth="1.6"
    />
    <circle
      cx="12"
      cy="17"
      r="2"
      fill="white"
      stroke="#3a1050"
      strokeWidth="1.2"
    />
    <circle
      cx="20"
      cy="17"
      r="2"
      fill="white"
      stroke="#3a1050"
      strokeWidth="1.2"
    />
    <circle cx="12" cy="17" r="0.9" fill="#3a1050" />
    <circle cx="20" cy="17" r="0.9" fill="#3a1050" />
    <circle cx="12.6" cy="16.4" r="0.4" fill="rgba(255,255,255,0.9)" />
    <circle cx="20.6" cy="16.4" r="0.4" fill="rgba(255,255,255,0.9)" />
    <path
      d="M14.8 21.2 Q15.5 20 16 20.5 Q16.5 20 17.2 21.2 Q16.5 22.5 16 22.2 Q15.5 22.5 14.8 21.2 Z"
      fill="#d060a0"
    />
    <path
      d="M16 21 L15.3 22.5 M16 21 L16.7 22.5"
      stroke="#9060b8"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
    <line
      x1="5.5"
      y1="20.5"
      x2="12"
      y2="21.5"
      stroke="#9878c0"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.7"
    />
    <line
      x1="5.5"
      y1="22"
      x2="12"
      y2="22"
      stroke="#9878c0"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.7"
    />
    <line
      x1="26.5"
      y1="20.5"
      x2="20"
      y2="21.5"
      stroke="#9878c0"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.7"
    />
    <line
      x1="26.5"
      y1="22"
      x2="20"
      y2="22"
      stroke="#9878c0"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>
);
// キツネ（オレンジ固有色）
const IcFox = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M5 5 L5 16 L12 13 Z"
      fill="#e06020"
      stroke="#b04010"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M5.5 7 L6 14 L11 12 Z"
      fill="#ffb07a"
      stroke="#e07030"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path
      d="M27 5 L27 16 L20 13 Z"
      fill="#e06020"
      stroke="#b04010"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M26.5 7 L26 14 L21 12 Z"
      fill="#ffb07a"
      stroke="#e07030"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path
      d="M7 15 Q6 19 8 22 Q10 25.5 16 27 Q22 25.5 24 22 Q26 19 25 15 Q22 10 16 10 Q10 10 7 15 Z"
      fill="#e87030"
      stroke="#b04010"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M12 21.5 Q13.5 24.5 16 25 Q18.5 24.5 20 21.5 Q18.5 20 16 20 Q13.5 20 12 21.5 Z"
      fill="#fff0e0"
    />
    <path d="M9 16.5 Q10.5 15 12 16.5 Q10.5 17.5 9 16.5 Z" fill="#2a1000" />
    <path d="M20 16.5 Q21.5 15 23 16.5 Q21.5 17.5 20 16.5 Z" fill="#2a1000" />
    <circle cx="10.5" cy="16.2" r="0.5" fill="rgba(255,255,255,0.8)" />
    <circle cx="21.5" cy="16.2" r="0.5" fill="rgba(255,255,255,0.8)" />
    <path d="M14.5 22 L16 23.5 L17.5 22 L16 21.2 Z" fill="#2a1000" />
    <path
      d="M14.5 23 Q16 24.5 17.5 23"
      stroke="#b04010"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <ellipse cx="9" cy="20" rx="2.5" ry="1.5" fill="rgba(255,200,180,0.45)" />
    <ellipse cx="23" cy="20" rx="2.5" ry="1.5" fill="rgba(255,200,180,0.45)" />
  </svg>
);
// パンダ（白黒固有色）
const IcPanda = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="9" cy="8.5" r="4.5" fill="#2a2a2a" />
    <circle cx="23" cy="8.5" r="4.5" fill="#2a2a2a" />
    <circle
      cx="16"
      cy="18"
      r="11"
      fill="#f0f0f0"
      stroke="#d8d8d8"
      strokeWidth="1.2"
    />
    <ellipse cx="11.5" cy="15.5" rx="3.5" ry="3" fill="#2a2a2a" />
    <ellipse cx="20.5" cy="15.5" rx="3.5" ry="3" fill="#2a2a2a" />
    <circle cx="11.5" cy="15.5" r="1.8" fill="white" />
    <circle cx="20.5" cy="15.5" r="1.8" fill="white" />
    <circle cx="11.5" cy="15.5" r="1" fill="#2a2a2a" />
    <circle cx="20.5" cy="15.5" r="1" fill="#2a2a2a" />
    <circle cx="12.1" cy="14.9" r="0.4" fill="rgba(255,255,255,0.9)" />
    <circle cx="21.1" cy="14.9" r="0.4" fill="rgba(255,255,255,0.9)" />
    <ellipse cx="16" cy="21" rx="2.5" ry="1.5" fill="#2a2a2a" />
    <path
      d="M13.5 23 Q16 25 18.5 23"
      stroke="#2a2a2a"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M16 21.5 L16 23"
      stroke="#2a2a2a"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <ellipse cx="10" cy="21" rx="2.2" ry="1.5" fill="rgba(230,100,110,0.3)" />
    <ellipse cx="22" cy="21" rx="2.2" ry="1.5" fill="rgba(230,100,110,0.3)" />
  </svg>
);
// ドラゴン（エメラルド固有色）
const IcDragon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M12 9 L10 2 L14 7 Z"
      fill="#40c080"
      stroke="#208050"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M20 9 L22 2 L18 7 Z"
      fill="#40c080"
      stroke="#208050"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M7 15 Q1 12 2 6 Q5 10 8 13 Z"
      fill="#60d0a0"
      stroke="#208050"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M25 15 Q31 12 30 6 Q27 10 24 13 Z"
      fill="#60d0a0"
      stroke="#208050"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M8 14 Q7 18 8.5 21.5 Q10.5 26 16 27.5 Q21.5 26 23.5 21.5 Q25 18 24 14 Q22 9.5 16 9.5 Q10 9.5 8 14 Z"
      fill="#50d090"
      stroke="#208050"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M10 14 Q16 12 22 14"
      stroke="#208050"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.6"
    />
    <ellipse
      cx="12"
      cy="17"
      rx="2.5"
      ry="2.8"
      fill="white"
      stroke="#208050"
      strokeWidth="1.2"
    />
    <ellipse
      cx="20"
      cy="17"
      rx="2.5"
      ry="2.8"
      fill="white"
      stroke="#208050"
      strokeWidth="1.2"
    />
    <ellipse cx="12" cy="17" rx="1" ry="2.2" fill="#1a6030" />
    <ellipse cx="20" cy="17" rx="1" ry="2.2" fill="#1a6030" />
    <circle cx="12.5" cy="15.8" r="0.4" fill="rgba(255,255,255,0.9)" />
    <circle cx="20.5" cy="15.8" r="0.4" fill="rgba(255,255,255,0.9)" />
    <ellipse cx="14.5" cy="22" rx="1.2" ry="0.8" fill="#208050" />
    <ellipse cx="17.5" cy="22" rx="1.2" ry="0.8" fill="#208050" />
    <path
      d="M9.5 23.5 Q16 27 22.5 23.5"
      stroke="#208050"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M12 23.5 L12.5 25.5 M16 24.2 L16 26 M20 23.5 L19.5 25.5"
      stroke="#208050"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
  </svg>
);
// ユニコーン（パステルパープル固有色）
const IcUnicorn = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 2 L13.5 10"
      stroke="#c084fc"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M16 2 L15 6 M16 2 L17 8"
      stroke="#a855f7"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.7"
    />
    <path
      d="M10 12 Q6 10 5 14 Q4 18 7 20"
      stroke="#ec4899"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
      opacity="0.8"
    />
    <path
      d="M9 13 Q5.5 12 5 16 Q4.5 19 7.5 21"
      stroke="#a855f7"
      strokeWidth="1.1"
      strokeLinecap="round"
      fill="none"
      opacity="0.6"
    />
    <path
      d="M11 11 L9.5 6 L14 10 Z"
      fill="#e0b8ff"
      stroke="#a855f7"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M11.2 10.5 L10 7 L13.2 10 Z"
      fill="#ec4899"
      stroke="#ec4899"
      strokeWidth="0.6"
      strokeLinejoin="round"
      opacity="0.5"
    />
    <path
      d="M9 13 Q7 17 8 21 Q10 26 16 27.5 Q22 26 24 21 Q25 17 23 13 Q21 9 16 9 Q11 9 9 13 Z"
      fill="#f0d8ff"
      stroke="#c084fc"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="17"
      r="2.5"
      fill="white"
      stroke="#c084fc"
      strokeWidth="1.2"
    />
    <circle
      cx="20"
      cy="17"
      r="2.5"
      fill="white"
      stroke="#c084fc"
      strokeWidth="1.2"
    />
    <circle cx="12" cy="17" r="1.3" fill="#6b21a8" />
    <circle cx="20" cy="17" r="1.3" fill="#6b21a8" />
    <circle cx="12.7" cy="16.3" r="0.55" fill="rgba(255,255,255,0.9)" />
    <circle cx="20.7" cy="16.3" r="0.55" fill="rgba(255,255,255,0.9)" />
    <path
      d="M14.2 21.5 Q15.5 22.8 16 22.5 Q16.5 22.8 17.8 21.5 Q16.5 20.5 16 20.8 Q15.5 20.5 14.2 21.5 Z"
      fill="#ec4899"
    />
    <circle cx="24" cy="8" r="1.5" fill="#fbbf24" opacity="0.9" />
    <circle cx="27" cy="13" r="1" fill="#a855f7" opacity="0.7" />
    <circle cx="26" cy="20" r="0.8" fill="#ec4899" opacity="0.6" />
  </svg>
);

// くまねこ - クリーム×ブラウン固有色
const IcBearcat = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* クマ耳（丸い） */}
    <circle
      cx="9"
      cy="8"
      r="4.2"
      fill="#c8956c"
      stroke="#8b5e3c"
      strokeWidth="1.4"
    />
    <circle cx="9" cy="8" r="2.2" fill="#e8b48a" />
    <circle
      cx="23"
      cy="8"
      r="4.2"
      fill="#c8956c"
      stroke="#8b5e3c"
      strokeWidth="1.4"
    />
    <circle cx="23" cy="8" r="2.2" fill="#e8b48a" />
    {/* 頭部 */}
    <path
      d="M7 13 Q5 17 6 21 Q8 26 12 27.5 Q16 29 20 27.5 Q24 26 26 21 Q27 17 25 13 Q22 9 16 9 Q10 9 7 13 Z"
      fill="#e8c9a0"
      stroke="#8b5e3c"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    {/* ネコ耳ライン（頭の中に） */}
    <path
      d="M10 13 L8.5 10 L12 12 Z"
      fill="#c8956c"
      stroke="#8b5e3c"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path
      d="M22 13 L23.5 10 L20 12 Z"
      fill="#c8956c"
      stroke="#8b5e3c"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    {/* 目（ネコっぽいアーモンド形） */}
    <path
      d="M10.5 16.5 Q12 15 13.5 16.5 Q12 17.8 10.5 16.5 Z"
      fill="#4a3020"
      stroke="#4a3020"
      strokeWidth="0.8"
    />
    <path
      d="M18.5 16.5 Q20 15 21.5 16.5 Q20 17.8 18.5 16.5 Z"
      fill="#4a3020"
      stroke="#4a3020"
      strokeWidth="0.8"
    />
    <circle cx="12" cy="16" r="0.5" fill="rgba(255,255,255,0.9)" />
    <circle cx="20" cy="16" r="0.5" fill="rgba(255,255,255,0.9)" />
    {/* マズル（クマっぽい） */}
    <ellipse
      cx="16"
      cy="21"
      rx="3.5"
      ry="2.5"
      fill="#f0d8b8"
      stroke="#c8956c"
      strokeWidth="1"
    />
    {/* 鼻 */}
    <path d="M14.5 20.2 L16 21.5 L17.5 20.2 L16 19.5 Z" fill="#8b5e3c" />
    {/* 口 */}
    <path
      d="M16 21.5 L15.2 23"
      stroke="#8b5e3c"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
    <path
      d="M16 21.5 L16.8 23"
      stroke="#8b5e3c"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
    {/* ヒゲ */}
    <line
      x1="5"
      y1="20"
      x2="11.5"
      y2="21"
      stroke="#8b5e3c"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.6"
    />
    <line
      x1="5"
      y1="22"
      x2="11.5"
      y2="21.8"
      stroke="#8b5e3c"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.6"
    />
    <line
      x1="27"
      y1="20"
      x2="20.5"
      y2="21"
      stroke="#8b5e3c"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.6"
    />
    <line
      x1="27"
      y1="22"
      x2="20.5"
      y2="21.8"
      stroke="#8b5e3c"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

// ペンギン - 白黒＋オレンジ固有色
const IcPenguin = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* 頭（黒） */}
    <ellipse
      cx="16"
      cy="10"
      rx="8"
      ry="7"
      fill="#2a2a3a"
      stroke="#111122"
      strokeWidth="1.4"
    />
    {/* 白お腹 */}
    <ellipse
      cx="16"
      cy="21"
      rx="7"
      ry="9"
      fill="#2a2a3a"
      stroke="#111122"
      strokeWidth="1.4"
    />
    <ellipse cx="16" cy="22" rx="5" ry="7.5" fill="#f0f0f8" />
    {/* 目（白目＋黒目） */}
    <circle cx="12.5" cy="9.5" r="2.2" fill="white" />
    <circle cx="19.5" cy="9.5" r="2.2" fill="white" />
    <circle cx="12.5" cy="9.5" r="1.2" fill="#1a1a2a" />
    <circle cx="19.5" cy="9.5" r="1.2" fill="#1a1a2a" />
    <circle cx="13" cy="9" r="0.45" fill="white" />
    <circle cx="20" cy="9" r="0.45" fill="white" />
    {/* くちばし */}
    <path
      d="M14 13 L16 15 L18 13 L16 12 Z"
      fill="#ff8c00"
      stroke="#cc6600"
      strokeWidth="0.8"
    />
    {/* 翼（フリッパー） */}
    <path
      d="M8 14 Q4 16 4 22 Q5 26 8 26 Q10 26 10 23 L10 14 Z"
      fill="#2a2a3a"
      stroke="#111122"
      strokeWidth="1.2"
    />
    <path
      d="M24 14 Q28 16 28 22 Q27 26 24 26 Q22 26 22 23 L22 14 Z"
      fill="#2a2a3a"
      stroke="#111122"
      strokeWidth="1.2"
    />
    {/* 足 */}
    <path
      d="M13 29 L11 31 L15 31 L14 29 Z"
      fill="#ff8c00"
      stroke="#cc6600"
      strokeWidth="0.8"
    />
    <path
      d="M19 29 L17 31 L21 31 L20 29 Z"
      fill="#ff8c00"
      stroke="#cc6600"
      strokeWidth="0.8"
    />
  </svg>
);

// ハムスター - ベージュ×オレンジ固有色
const IcHamster = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* 丸い頬袋（ハムスター特有） */}
    <circle
      cx="7.5"
      cy="19"
      r="5.5"
      fill="#f0c080"
      stroke="#c88040"
      strokeWidth="1.3"
    />
    <circle
      cx="24.5"
      cy="19"
      r="5.5"
      fill="#f0c080"
      stroke="#c88040"
      strokeWidth="1.3"
    />
    {/* 耳（小さい丸） */}
    <circle
      cx="11"
      cy="8"
      r="3.5"
      fill="#f4a060"
      stroke="#c88040"
      strokeWidth="1.3"
    />
    <circle cx="11" cy="8" r="1.8" fill="#ffcca0" />
    <circle
      cx="21"
      cy="8"
      r="3.5"
      fill="#f4a060"
      stroke="#c88040"
      strokeWidth="1.3"
    />
    <circle cx="21" cy="8" r="1.8" fill="#ffcca0" />
    {/* 頭・体（丸くてふっくら） */}
    <ellipse
      cx="16"
      cy="18"
      rx="9.5"
      ry="10"
      fill="#f8d8a8"
      stroke="#c88040"
      strokeWidth="1.6"
    />
    {/* お腹白 */}
    <ellipse
      cx="16"
      cy="20"
      rx="5"
      ry="6"
      fill="#fff5e0"
      stroke="#e0b070"
      strokeWidth="0.8"
    />
    {/* 目（丸くてつぶら） */}
    <circle
      cx="12.5"
      cy="15"
      r="2.2"
      fill="#3a2010"
      stroke="#2a1508"
      strokeWidth="0.8"
    />
    <circle
      cx="19.5"
      cy="15"
      r="2.2"
      fill="#3a2010"
      stroke="#2a1508"
      strokeWidth="0.8"
    />
    <circle cx="13" cy="14.4" r="0.6" fill="rgba(255,255,255,0.9)" />
    <circle cx="20" cy="14.4" r="0.6" fill="rgba(255,255,255,0.9)" />
    {/* 鼻（小さいハート） */}
    <path
      d="M14.8 18.5 Q15.5 17.5 16 18 Q16.5 17.5 17.2 18.5 Q16.5 19.5 16 19.2 Q15.5 19.5 14.8 18.5 Z"
      fill="#e06080"
    />
    {/* 口 */}
    <path
      d="M16 19.2 L15.3 20.5 M16 19.2 L16.7 20.5"
      stroke="#c88040"
      strokeWidth="1"
      strokeLinecap="round"
    />
    {/* ヒゲ */}
    <line
      x1="5"
      y1="18.5"
      x2="11"
      y2="19.5"
      stroke="#c88040"
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.7"
    />
    <line
      x1="5"
      y1="20"
      x2="11"
      y2="20"
      stroke="#c88040"
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.7"
    />
    <line
      x1="27"
      y1="18.5"
      x2="21"
      y2="19.5"
      stroke="#c88040"
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.7"
    />
    <line
      x1="27"
      y1="20"
      x2="21"
      y2="20"
      stroke="#c88040"
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>
);

// ─── ペットLvシステム（レベルが上がるほど必要なつき度が増加） ───────────────
// Lv1→2: 50, Lv2→3: 85, Lv3→4: 130, Lv4→5: 185, Lv5→6: 255, Lv6→7: 340,
// Lv7→8: 445, Lv8→9: 575, Lv9→10: 740, ...
const PET_LV_NEEDS = (() => {
  const needs = [];
  let base = 50;
  for (let i = 0; i < 20; i++) {
    needs.push(Math.round(base));
    base = base * 1.32;
  }
  return needs; // needs[i] = Lvi+1 → Lvi+2 に必要な増分
})();

const getPetLvFromAffection = (aff) => {
  let remaining = aff;
  let lv = 1;
  for (let i = 0; i < PET_LV_NEEDS.length; i++) {
    if (remaining >= PET_LV_NEEDS[i]) {
      remaining -= PET_LV_NEEDS[i];
      lv++;
    } else break;
  }
  return lv;
};

const getPetLvProgress = (aff) => {
  let remaining = aff;
  let lv = 1;
  for (let i = 0; i < PET_LV_NEEDS.length; i++) {
    if (remaining >= PET_LV_NEEDS[i]) {
      remaining -= PET_LV_NEEDS[i];
      lv++;
    } else {
      const need = PET_LV_NEEDS[i];
      return {
        lv,
        current: remaining,
        need,
        pct: Math.round((remaining / need) * 100),
      };
    }
  }
  return { lv, current: 0, need: 1, pct: 100 };
};

// ─── ペット帽子付きアバターSVG（Lv10解放プロフィールアイコン） ─────────────
// 共通の帽子SVGパーツ（小さいシルクハット、ペットの頭上に乗せる）
const HatOverlay = ({ y = 2 }) => (
  <g>
    <ellipse
      cx="16"
      cy={y + 8.5}
      rx="10"
      ry="3"
      fill="#4c1d95"
      stroke="#2e1065"
      strokeWidth="1"
    />
    <path
      d={`M9 ${y + 8.5} L10 ${y} L22 ${y} L23 ${y + 8.5}`}
      fill="#6d28d9"
      stroke="#3b0764"
      strokeWidth="1"
    />
    <ellipse
      cx="16"
      cy={y}
      rx="6"
      ry="2.5"
      fill="#7c3aed"
      stroke="#3b0764"
      strokeWidth="0.9"
    />
    <path
      d={`M9 ${y + 6} Q16 ${y + 7.5} 23 ${y + 6}`}
      stroke="#a78bfa"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />
  </g>
);

const IcAvCatHat = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* 耳（帽子の下から見えるよう小さく） */}
    <path
      d="M8.5 16 L7 11 L11 14 Z"
      fill="#e8a0c0"
      stroke="#c06090"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M23.5 16 L25 11 L21 14 Z"
      fill="#e8a0c0"
      stroke="#c06090"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* 顔 */}
    <path
      d="M7.5 16 Q6 19 7 22 Q8 26 12 27.5 Q16 29 20 27.5 Q24 26 25 22 Q26 19 24.5 16 Q22 13 16 13 Q10 13 7.5 16 Z"
      fill="#f0c8e0"
      stroke="#c06090"
      strokeWidth="1.4"
    />
    <path d="M10.5 19.5 Q12 18 13.5 19.5 Q12 20.8 10.5 19.5 Z" fill="#3a2030" />
    <path d="M18.5 19.5 Q20 18 21.5 19.5 Q20 20.8 18.5 19.5 Z" fill="#3a2030" />
    <circle cx="11.8" cy="19.3" r="0.45" fill="rgba(255,255,255,0.9)" />
    <circle cx="19.8" cy="19.3" r="0.45" fill="rgba(255,255,255,0.9)" />
    <path d="M14.5 22.8 L16 24 L17.5 22.8 L16 22 Z" fill="#d04080" />
    <ellipse cx="9.5" cy="23" rx="2" ry="1.5" fill="rgba(220,80,120,0.25)" />
    <ellipse cx="22.5" cy="23" rx="2" ry="1.5" fill="rgba(220,80,120,0.25)" />
    <HatOverlay y={3} />
  </svg>
);

const IcAvDogHat = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* 垂れ耳（帽子の横から） */}
    <path
      d="M6 14 Q3 12 3 18 Q3.5 22 7 22 Q7.5 18 8 14 Z"
      fill="#d4904a"
      stroke="#a06030"
      strokeWidth="1.2"
    />
    <path
      d="M26 14 Q29 12 29 18 Q28.5 22 25 22 Q24.5 18 24 14 Z"
      fill="#d4904a"
      stroke="#a06030"
      strokeWidth="1.2"
    />
    {/* 顔 */}
    <path
      d="M8 14 Q7 18 7 21 Q7 27 16 28.5 Q25 27 25 21 Q25 18 24 14 Q22 10 16 10 Q10 10 8 14 Z"
      fill="#e8aa60"
      stroke="#a06030"
      strokeWidth="1.4"
    />
    <path
      d="M11.5 22 Q12 25 16 26 Q20 25 20.5 22 Q20 20 16 20 Q12 20 11.5 22 Z"
      fill="#f0c880"
      stroke="#a06030"
      strokeWidth="1"
    />
    <circle
      cx="11.5"
      cy="17"
      r="2"
      fill="white"
      stroke="#3a1800"
      strokeWidth="1"
    />
    <circle
      cx="20.5"
      cy="17"
      r="2"
      fill="white"
      stroke="#3a1800"
      strokeWidth="1"
    />
    <circle cx="11.5" cy="17" r="0.9" fill="#2a1000" />
    <circle cx="20.5" cy="17" r="0.9" fill="#2a1000" />
    <circle cx="12.1" cy="16.4" r="0.4" fill="rgba(255,255,255,0.8)" />
    <circle cx="21.1" cy="16.4" r="0.4" fill="rgba(255,255,255,0.8)" />
    <ellipse cx="16" cy="22" rx="2" ry="1.3" fill="#8a4020" />
    <HatOverlay y={2} />
  </svg>
);

const IcAvRabbitHat = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* 顔 */}
    <path
      d="M7 16 Q5 20 6 23 Q8 28 16 29 Q24 28 26 23 Q27 20 25 16 Q23 12 16 12 Q9 12 7 16 Z"
      fill="#e8d0f8"
      stroke="#9060b8"
      strokeWidth="1.4"
    />
    <path d="M10.5 19.5 Q12 18 13.5 19.5 Q12 21 10.5 19.5 Z" fill="#5a2080" />
    <path d="M18.5 19.5 Q20 18 21.5 19.5 Q20 21 18.5 19.5 Z" fill="#5a2080" />
    <circle cx="12" cy="19.2" r="0.5" fill="rgba(255,255,255,0.9)" />
    <circle cx="20" cy="19.2" r="0.5" fill="rgba(255,255,255,0.9)" />
    <ellipse cx="16" cy="23" rx="2" ry="1.5" fill="#d080c0" />
    <path
      d="M16 24.5 L15.2 26 M16 24.5 L16.8 26"
      stroke="#c060a8"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <ellipse cx="10" cy="23.5" rx="2.2" ry="1.5" fill="rgba(180,80,180,0.25)" />
    <ellipse cx="22" cy="23.5" rx="2.2" ry="1.5" fill="rgba(180,80,180,0.25)" />
    <HatOverlay y={2} />
  </svg>
);

const IcAvFoxHat = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* 耳（帽子の横） */}
    <path
      d="M8 16 L6 10 L12 14 Z"
      fill="#e87030"
      stroke="#a04020"
      strokeWidth="1.2"
    />
    <path
      d="M24 16 L26 10 L20 14 Z"
      fill="#e87030"
      stroke="#a04020"
      strokeWidth="1.2"
    />
    {/* 顔 */}
    <path
      d="M8 16 Q6 20 7 23 Q9 27 16 28 Q23 27 25 23 Q26 20 24 16 Q22 12 16 12 Q10 12 8 16 Z"
      fill="#f09050"
      stroke="#a04020"
      strokeWidth="1.4"
    />
    <path
      d="M11 22 Q13 20 16 21 Q19 20 21 22 Q19 25 16 25.5 Q13 25 11 22 Z"
      fill="#fff5e8"
      stroke="#c06030"
      strokeWidth="0.9"
    />
    <path d="M10.5 18.5 Q12 17 13.5 18.5 Q12 20 10.5 18.5 Z" fill="#2a1000" />
    <path d="M18.5 18.5 Q20 17 21.5 18.5 Q20 20 18.5 18.5 Z" fill="#2a1000" />
    <circle cx="12" cy="18.2" r="0.5" fill="rgba(255,255,255,0.9)" />
    <circle cx="20" cy="18.2" r="0.5" fill="rgba(255,255,255,0.9)" />
    <ellipse cx="16" cy="22" rx="1.8" ry="1.2" fill="#d04030" />
    <HatOverlay y={2} />
  </svg>
);

const IcAvPandaHat = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* 耳（黒丸） */}
    <circle cx="9" cy="15" r="4" fill="#2a2a2a" stroke="#111" strokeWidth="1" />
    <circle
      cx="23"
      cy="15"
      r="4"
      fill="#2a2a2a"
      stroke="#111"
      strokeWidth="1"
    />
    {/* 顔 */}
    <ellipse
      cx="16"
      cy="22"
      rx="11"
      ry="10"
      fill="#f5f5f5"
      stroke="#2a2a2a"
      strokeWidth="1.4"
    />
    <ellipse cx="11.5" cy="20" rx="3.5" ry="3" fill="#2a2a2a" />
    <ellipse cx="20.5" cy="20" rx="3.5" ry="3" fill="#2a2a2a" />
    <circle cx="11.5" cy="19.5" r="1.4" fill="white" />
    <circle cx="20.5" cy="19.5" r="1.4" fill="white" />
    <circle cx="11.8" cy="19.5" r="0.7" fill="#111" />
    <circle cx="20.8" cy="19.5" r="0.7" fill="#111" />
    <circle cx="12.1" cy="19.1" r="0.3" fill="rgba(255,255,255,0.9)" />
    <circle cx="21.1" cy="19.1" r="0.3" fill="rgba(255,255,255,0.9)" />
    <ellipse cx="16" cy="25" rx="2.5" ry="1.8" fill="#2a2a2a" />
    <path
      d="M16 26.8 L15 28.5 M16 26.8 L17 28.5"
      stroke="#555"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <HatOverlay y={4} />
  </svg>
);

const IcAvDragonHat = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* ツノ */}
    <path
      d="M10 14 L9 8 L13 13 Z"
      fill="#7c3aed"
      stroke="#5b21b6"
      strokeWidth="1"
    />
    <path
      d="M22 14 L23 8 L19 13 Z"
      fill="#7c3aed"
      stroke="#5b21b6"
      strokeWidth="1"
    />
    {/* 顔 */}
    <path
      d="M8 16 Q7 20 8 23 Q10 28 16 28.5 Q22 28 24 23 Q25 20 24 16 Q22 12 16 12 Q10 12 8 16 Z"
      fill="#60d080"
      stroke="#208040"
      strokeWidth="1.4"
    />
    <path d="M10.5 18.5 Q12 17 13.5 18.5 Q12 20 10.5 18.5 Z" fill="#102808" />
    <path d="M18.5 18.5 Q20 17 21.5 18.5 Q20 20 18.5 18.5 Z" fill="#102808" />
    <circle cx="12" cy="18.2" r="0.5" fill="rgba(255,255,255,0.9)" />
    <circle cx="20" cy="18.2" r="0.5" fill="rgba(255,255,255,0.9)" />
    <path
      d="M13 23 Q16 24.5 19 23 Q17.5 25.5 16 25 Q14.5 25.5 13 23 Z"
      fill="#f87060"
    />
    <path
      d="M13 23 L11.5 26"
      stroke="#f87060"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M19 23 L20.5 26"
      stroke="#f87060"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <HatOverlay y={2} />
  </svg>
);

const IcAvUnicornHat = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* たてがみ */}
    <path
      d="M22 14 Q26 12 25 18 Q24 20 22 18"
      fill="#f472b6"
      stroke="#db2777"
      strokeWidth="0.8"
    />
    {/* 顔 */}
    <ellipse
      cx="15"
      cy="21"
      rx="10"
      ry="10"
      fill="#fef3ff"
      stroke="#d946ef"
      strokeWidth="1.4"
    />
    {/* ツノ（帽子の上から見えるように少し） */}
    <path
      d="M15 10 L13 6 L17 6 Z"
      fill="#fbbf24"
      stroke="#d97706"
      strokeWidth="0.9"
    />
    <path d="M10.5 19 Q12 17.5 13.5 19 Q12 20.5 10.5 19 Z" fill="#7e22ce" />
    <path d="M18.5 19 Q20 17.5 21.5 19 Q20 20.5 18.5 19 Z" fill="#7e22ce" />
    <circle cx="12" cy="18.7" r="0.45" fill="rgba(255,255,255,0.9)" />
    <circle cx="20" cy="18.7" r="0.45" fill="rgba(255,255,255,0.9)" />
    <ellipse
      cx="15"
      cy="23"
      rx="2.5"
      ry="1.8"
      fill="#f9a8d4"
      stroke="#db2777"
      strokeWidth="0.8"
    />
    <ellipse cx="9.5" cy="23.5" rx="2" ry="1.4" fill="rgba(249,168,212,0.4)" />
    <ellipse cx="20.5" cy="23.5" rx="2" ry="1.4" fill="rgba(249,168,212,0.4)" />
    <HatOverlay y={3} />
  </svg>
);

const IcAvBearcatHat = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* 耳（丸い） */}
    <circle
      cx="9.5"
      cy="15.5"
      r="4"
      fill="#c09060"
      stroke="#805030"
      strokeWidth="1.2"
    />
    <circle cx="9.5" cy="15.5" r="2" fill="#f0c890" />
    <circle
      cx="22.5"
      cy="15.5"
      r="4"
      fill="#c09060"
      stroke="#805030"
      strokeWidth="1.2"
    />
    <circle cx="22.5" cy="15.5" r="2" fill="#f0c890" />
    {/* 顔 */}
    <ellipse
      cx="16"
      cy="22"
      rx="10.5"
      ry="9.5"
      fill="#d4a870"
      stroke="#805030"
      strokeWidth="1.4"
    />
    <ellipse
      cx="16"
      cy="25"
      rx="5.5"
      ry="4"
      fill="#f0c890"
      stroke="#a06040"
      strokeWidth="0.8"
    />
    <circle
      cx="11.5"
      cy="19.5"
      r="2"
      fill="white"
      stroke="#3a1800"
      strokeWidth="1"
    />
    <circle
      cx="20.5"
      cy="19.5"
      r="2"
      fill="white"
      stroke="#3a1800"
      strokeWidth="1"
    />
    <circle cx="11.5" cy="19.5" r="0.9" fill="#2a1000" />
    <circle cx="20.5" cy="19.5" r="0.9" fill="#2a1000" />
    <circle cx="12" cy="19" r="0.4" fill="rgba(255,255,255,0.8)" />
    <circle cx="21" cy="19" r="0.4" fill="rgba(255,255,255,0.8)" />
    <ellipse cx="16" cy="24.5" rx="2.2" ry="1.5" fill="#8a5030" />
    <HatOverlay y={4} />
  </svg>
);

const IcAvPenguinHat = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* 体（白黒） */}
    <ellipse
      cx="16"
      cy="22"
      rx="10"
      ry="10"
      fill="#1a1a2e"
      stroke="#0d0d1a"
      strokeWidth="1.4"
    />
    <ellipse cx="16" cy="24" rx="6" ry="7" fill="#f5f5f5" />
    {/* 目 */}
    <circle cx="12.5" cy="18.5" r="2.2" fill="white" />
    <circle cx="19.5" cy="18.5" r="2.2" fill="white" />
    <circle cx="12.5" cy="18.5" r="1.1" fill="#1a1a2e" />
    <circle cx="19.5" cy="18.5" r="1.1" fill="#1a1a2e" />
    <circle cx="12.9" cy="18.1" r="0.45" fill="rgba(255,255,255,0.9)" />
    <circle cx="19.9" cy="18.1" r="0.45" fill="rgba(255,255,255,0.9)" />
    {/* くちばし */}
    <path
      d="M14.5 22 L16 23.5 L17.5 22 L16 21.5 Z"
      fill="#f59e0b"
      stroke="#d97706"
      strokeWidth="0.8"
    />
    <HatOverlay y={4} />
  </svg>
);

const IcAvHamsterHat = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* 頬袋 */}
    <circle
      cx="6.5"
      cy="22"
      r="5"
      fill="#f0c080"
      stroke="#c88040"
      strokeWidth="1.2"
    />
    <circle
      cx="25.5"
      cy="22"
      r="5"
      fill="#f0c080"
      stroke="#c88040"
      strokeWidth="1.2"
    />
    {/* 耳 */}
    <circle
      cx="11"
      cy="13"
      r="3.5"
      fill="#f4a060"
      stroke="#c88040"
      strokeWidth="1.2"
    />
    <circle cx="11" cy="13" r="1.7" fill="#ffcca0" />
    <circle
      cx="21"
      cy="13"
      r="3.5"
      fill="#f4a060"
      stroke="#c88040"
      strokeWidth="1.2"
    />
    <circle cx="21" cy="13" r="1.7" fill="#ffcca0" />
    {/* 顔 */}
    <ellipse
      cx="16"
      cy="21"
      rx="9"
      ry="9.5"
      fill="#f8d8a8"
      stroke="#c88040"
      strokeWidth="1.4"
    />
    <ellipse
      cx="16"
      cy="23"
      rx="4.5"
      ry="5.5"
      fill="#fff5e0"
      stroke="#e0b070"
      strokeWidth="0.8"
    />
    <circle
      cx="12.5"
      cy="18.5"
      r="2"
      fill="#3a2010"
      stroke="#2a1508"
      strokeWidth="0.7"
    />
    <circle
      cx="19.5"
      cy="18.5"
      r="2"
      fill="#3a2010"
      stroke="#2a1508"
      strokeWidth="0.7"
    />
    <circle cx="13" cy="18" r="0.55" fill="rgba(255,255,255,0.9)" />
    <circle cx="20" cy="18" r="0.55" fill="rgba(255,255,255,0.9)" />
    <path
      d="M14.8 22 Q16 21 17.2 22 Q16.5 23 16 22.8 Q15.5 23 14.8 22 Z"
      fill="#e06080"
    />
    <HatOverlay y={4} />
  </svg>
);

const PET_HAT_AVATARS = {
  cat: { char: "cat_hat", label: "ねこ🎩", component: IcAvCatHat },
  dog: { char: "dog_hat", label: "いぬ🎩", component: IcAvDogHat },
  rabbit: { char: "rabbit_hat", label: "うさぎ🎩", component: IcAvRabbitHat },
  fox: { char: "fox_hat", label: "きつね🎩", component: IcAvFoxHat },
  panda: { char: "panda_hat", label: "パンダ🎩", component: IcAvPandaHat },
  dragon: { char: "dragon_hat", label: "ドラゴン🎩", component: IcAvDragonHat },
  unicorn: {
    char: "unicorn_hat",
    label: "ユニコーン🎩",
    component: IcAvUnicornHat,
  },
  bearcat: {
    char: "bearcat_hat",
    label: "くまねこ🎩",
    component: IcAvBearcatHat,
  },
  penguin: {
    char: "penguin_hat",
    label: "ペンギン🎩",
    component: IcAvPenguinHat,
  },
  hamster: {
    char: "hamster_hat",
    label: "ハムスター🎩",
    component: IcAvHamsterHat,
  },
};

const PET_ICONS = {
  cat: IcCat,
  dog: IcDog,
  rabbit: IcRabbit,
  fox: IcFox,
  panda: IcPanda,
  dragon: IcDragon,
  unicorn: IcUnicorn,
  bearcat: IcBearcat,
  penguin: IcPenguin,
  hamster: IcHamster,
};
const ACC_ICONS = {
  hat: IcHat,
  crown: IcCrown2,
  bow: IcBow,
  glasses: IcGlasses,
  star: IcStar2,
  rainbow: IcRainbow,
};
// ─── 実績 & アバター SVGアイコン ──────────────────────────────────────────────
const IcAchFirst = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 4l2 5h5l-4 3 1.5 5L16 14l-4.5 3 1.5-5-4-3h5z"
      fill={color}
      stroke={color}
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <path
      d="M10 22h12M12 26h8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const IcAchBolt = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M18 4L8 18h8l-2 10 14-16h-9z"
      fill={color}
      stroke={color}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);
const IcAchWave = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M4 16c3-4 5-4 8 0s5 4 8 0 5-4 8 0"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M4 22c3-4 5-4 8 0s5 4 8 0 5-4 8 0"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.5"
    />
    <path
      d="M4 10c3-4 5-4 8 0s5 4 8 0 5-4 8 0"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.5"
    />
  </svg>
);
const IcAchTrophy = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M9 4h14v9a7 7 0 01-14 0V4z"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M9 6H5a3 3 0 000 6h4M23 6h4a3 3 0 010 6h-4"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M16 20v4M11 28h10M13 24h6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const IcAchGem = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 4l10 8-10 16L6 12z"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M6 12h20M11 4l5 8M21 4l-5 8"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const IcAchCrown = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M4 22l4-12 8 8 4-10 4 10 4-8 4 12z"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <rect
      x="4"
      y="22"
      width="24"
      height="4"
      rx="2"
      fill={color}
      opacity="0.8"
    />
    <circle cx="16" cy="10" r="2" fill={color} />
    <circle cx="6" cy="14" r="1.5" fill={color} />
    <circle cx="26" cy="14" r="1.5" fill={color} />
  </svg>
);
const IcAchPerfect = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle
      cx="16"
      cy="16"
      r="12"
      stroke={color}
      strokeWidth="2"
      fill={color + "22"}
    />
    <path
      d="M10 16l4 4 8-8"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="16"
      cy="16"
      r="6"
      stroke={color}
      strokeWidth="1"
      opacity="0.4"
    />
  </svg>
);
const IcAchFire = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 4c0 0 6 6 4 11 2-1 3-4 2-7 4 3 6 9 3 14-1 2-4 4-7 4s-8-3-8-8c0-3 2-5 4-6-1 3 1 5 3 5-3-4 0-9-1-13z"
      fill={color + "44"}
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="22" r="3" fill={color} opacity="0.7" />
  </svg>
);
const IcAchVolcano = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 6l-3 8h-3l-8 14h28L22 14h-3z"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M13 6c1-1 3-3 3-3s2 2 3 3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M14 10l4 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);
const IcAchStar = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 3l3.5 7 7.5 1-5.5 5.5 1.5 7.5L16 21l-7 3.5 1.5-7.5L5 11.5l7.5-1z"
      fill={color + "44"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="23" cy="7" r="1.5" fill={color} opacity="0.7" />
    <circle cx="8" cy="6" r="1" fill={color} opacity="0.5" />
    <circle cx="26" cy="20" r="1" fill={color} opacity="0.5" />
  </svg>
);
const IcAchBook = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect
      x="5"
      y="4"
      width="22"
      height="26"
      rx="3"
      fill={color + "22"}
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M10 10h12M10 15h12M10 20h8"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M5 27a3 3 0 003 3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const IcAchBooks = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect
      x="4"
      y="8"
      width="8"
      height="20"
      rx="2"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.5"
    />
    <rect
      x="14"
      y="5"
      width="8"
      height="23"
      rx="2"
      fill={color + "44"}
      stroke={color}
      strokeWidth="1.8"
    />
    <rect
      x="24"
      y="10"
      width="5"
      height="18"
      rx="2"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.5"
    />
    <path
      d="M14 9h8"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);
const IcAchGrad = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 6L2 14l14 8 14-8z"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M6 18v7c0 0 4 3 10 3s10-3 10-3v-7"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path d="M28 14v6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="28" cy="22" r="2" fill={color} />
  </svg>
);
const IcAchBrain = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M8 20c-3-1-5-4-4-7 1-4 5-5 7-4-1-4 2-7 5-7s6 3 5 7c2-1 6 0 7 4 1 3-1 6-4 7v2H8z"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M12 16c1 1 3 2 4 1M20 16c-1 1-3 2-4 1M16 20v2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const IcAchFleur = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="4" fill={color} />
    <ellipse
      cx="16"
      cy="8"
      rx="3"
      ry="5"
      fill={color + "55"}
      stroke={color}
      strokeWidth="1.2"
    />
    <ellipse
      cx="16"
      cy="24"
      rx="3"
      ry="5"
      fill={color + "55"}
      stroke={color}
      strokeWidth="1.2"
    />
    <ellipse
      cx="8"
      cy="16"
      rx="5"
      ry="3"
      fill={color + "55"}
      stroke={color}
      strokeWidth="1.2"
    />
    <ellipse
      cx="24"
      cy="16"
      rx="5"
      ry="3"
      fill={color + "55"}
      stroke={color}
      strokeWidth="1.2"
    />
  </svg>
);
const IcAchSentence = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect
      x="4"
      y="6"
      width="24"
      height="20"
      rx="3"
      fill={color + "22"}
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M8 12h16M8 16h12M8 20h8"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="24" cy="22" r="4" fill={color} />
    <path
      d="M22 22l1.5 1.5L26 20.5"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IcAchScoreSilver = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <polygon
      points="16,4 19,12 28,12 21,18 24,27 16,22 8,27 11,18 4,12 13,12"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <polygon
      points="16,9 18,14 24,14 19,17.5 21,23 16,19.5 11,23 13,17.5 8,14 14,14"
      fill={color}
      opacity="0.5"
    />
  </svg>
);
const IcAchScoreGold = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <polygon
      points="16,3 19.5,11 28,12 22,18 24,27 16,23 8,27 10,18 4,12 12.5,11"
      fill={color + "44"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <polygon
      points="16,8 18.5,13.5 24,14.5 20,18 21.5,24 16,21 10.5,24 12,18 8,14.5 13.5,13.5"
      fill={color}
      opacity="0.6"
    />
    <circle cx="16" cy="15" r="2" fill={color} />
  </svg>
);
const IcAchGame = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect
      x="4"
      y="10"
      width="24"
      height="14"
      rx="4"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M12 14v6M9 17h6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="21" cy="15" r="1.5" fill={color} />
    <circle cx="24" cy="18" r="1.5" fill={color} />
    <path
      d="M13 7h6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);
const IcAchJoystick = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect
      x="6"
      y="14"
      width="20"
      height="12"
      rx="4"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
    />
    <circle
      cx="16"
      cy="10"
      r="5"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M16 7v6M13 10h6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="22" cy="19" r="2" fill={color} opacity="0.6" />
    <circle cx="10" cy="19" r="1.5" fill={color} opacity="0.4" />
  </svg>
);
const IcAchMuscle = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M10 20c0-5 2-8 6-8s6 3 6 8"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M6 18c0 2 2 4 4 3M26 18c0 2-2 4-4 3"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path d="M8 23h16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <ellipse
      cx="16"
      cy="12"
      rx="4"
      ry="3"
      fill={color + "44"}
      stroke={color}
      strokeWidth="1.5"
    />
  </svg>
);
const IcAchMedal = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M12 4h8l-2 8H14z"
      fill={color + "55"}
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle
      cx="16"
      cy="21"
      r="8"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M13 21l2 2 4-4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 4l-4 4M18 4l4 4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);
const IcAchBadge = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 3l3 4h5l-2 5 3 4h-5l-4 5-4-5H7l3-4-2-5h5z"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="14" r="4" fill={color} opacity="0.6" />
    <path
      d="M13 26l3 3 3-3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IcAchPencil = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M22 4l6 6-16 16H6v-6z"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M18 8l6 6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
    <path
      d="M6 26l3-3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);
const IcAchChart = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M4 28V10l7 6 5-9 6 8 6-10"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="11" cy="16" r="2" fill={color} />
    <circle cx="16" cy="7" r="2" fill={color} />
    <circle cx="22" cy="15" r="2" fill={color} />
    <circle cx="28" cy="5" r="2" fill={color} />
    <path
      d="M4 28h24"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.4"
    />
  </svg>
);
const IcAchRocket = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 4c4 0 8 6 8 14l-4 2v6l-4-2-4 2v-6l-4-2C8 10 12 4 16 4z"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="14" r="3" fill={color} opacity="0.7" />
    <path
      d="M8 18c-2 1-4 4-3 7M24 18c2 1 4 4 3 7"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);
const IcAchGalaxy = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <ellipse
      cx="16"
      cy="16"
      rx="13"
      ry="5"
      stroke={color}
      strokeWidth="1.5"
      fill={color + "22"}
      transform="rotate(-20 16 16)"
    />
    <ellipse
      cx="16"
      cy="16"
      rx="13"
      ry="5"
      stroke={color}
      strokeWidth="1.5"
      fill={color + "11"}
      transform="rotate(20 16 16)"
    />
    <circle cx="16" cy="16" r="3" fill={color} />
    <circle cx="8" cy="10" r="1" fill={color} opacity="0.5" />
    <circle cx="25" cy="22" r="1" fill={color} opacity="0.5" />
    <circle cx="24" cy="9" r="1.2" fill={color} opacity="0.6" />
  </svg>
);
const IcAchPaw = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <ellipse
      cx="16"
      cy="20"
      rx="7"
      ry="6"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
    />
    <circle
      cx="10"
      cy="12"
      r="3"
      fill={color + "55"}
      stroke={color}
      strokeWidth="1.5"
    />
    <circle
      cx="22"
      cy="12"
      r="3"
      fill={color + "55"}
      stroke={color}
      strokeWidth="1.5"
    />
    <circle
      cx="7"
      cy="18"
      r="2.5"
      fill={color + "55"}
      stroke={color}
      strokeWidth="1.5"
    />
    <circle
      cx="25"
      cy="18"
      r="2.5"
      fill={color + "55"}
      stroke={color}
      strokeWidth="1.5"
    />
  </svg>
);
const IcAchCat = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M8 6l-2 6h2M24 6l2 6h-2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <ellipse
      cx="16"
      cy="18"
      rx="10"
      ry="10"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
    />
    <circle cx="12" cy="16" r="1.5" fill={color} />
    <circle cx="20" cy="16" r="1.5" fill={color} />
    <path
      d="M13 21q3 2 6 0"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M16 18v2"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.5"
    />
    <path
      d="M9 17h3M20 17h3"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.4"
    />
  </svg>
);
const IcAchUnicorn = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 4l2 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <ellipse
      cx="16"
      cy="19"
      rx="9"
      ry="8"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
    />
    <circle cx="12.5" cy="17" r="1.5" fill={color} />
    <circle cx="19.5" cy="17" r="1.5" fill={color} />
    <path
      d="M13 22q3 2 6 0"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M14 5l4 6M18 5l-2 5"
      stroke="#a855f7"
      strokeWidth="1.3"
      strokeLinecap="round"
      opacity="0.7"
    />
    <circle cx="22" cy="7" r="1.2" fill="#ec4899" opacity="0.7" />
    <circle cx="25" cy="10" r="0.8" fill="#a855f7" opacity="0.6" />
  </svg>
);
const IcAchCoin = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle
      cx="16"
      cy="16"
      r="12"
      fill={color + "33"}
      stroke={color}
      strokeWidth="2"
    />
    <circle
      cx="16"
      cy="16"
      r="8"
      fill={color + "22"}
      stroke={color}
      strokeWidth="1.2"
      opacity="0.6"
    />
    <text
      x="16"
      y="21"
      textAnchor="middle"
      fontSize="12"
      fontWeight="bold"
      fill={color}
    >
      ¥
    </text>
  </svg>
);
// アバター用SVGアイコン
// ─── プロ線画スタイルアバター（80×80 viewBox, stroke中心, 洗練デザイン） ────

// ── ウサギ（プロフィールアバター用）─────────────────────────────
const IcAvRabbit = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    {/* 左耳外 */}
    <path
      d="M24 40 Q20 18 23 8 Q25 2 29 3 Q33 4 32 12 Q30 24 28 40 Z"
      fill="#d8b8e8"
      stroke="#9060b8"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* 左耳内 */}
    <path
      d="M26 38 Q23 20 25 11 Q26 6 29 7 Q31.5 8 31 14 Q29.5 26 28 38 Z"
      fill="#f2d0fa"
    />
    {/* 右耳外 */}
    <path
      d="M56 40 Q60 18 57 8 Q55 2 51 3 Q47 4 48 12 Q50 24 52 40 Z"
      fill="#d8b8e8"
      stroke="#9060b8"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* 右耳内 */}
    <path
      d="M54 38 Q57 20 55 11 Q54 6 51 7 Q48.5 8 49 14 Q50.5 26 52 38 Z"
      fill="#f2d0fa"
    />
    {/* 顔 */}
    <ellipse
      cx="40"
      cy="52"
      rx="28"
      ry="24"
      fill="#ecdcf8"
      stroke="#9060b8"
      strokeWidth="1.8"
    />
    {/* マズル */}
    <ellipse cx="40" cy="61" rx="12" ry="8.5" fill="#f8eeff" />
    {/* 目白目 */}
    <circle cx="29" cy="48" r="6" fill="white" />
    <circle cx="51" cy="48" r="6" fill="white" />
    {/* 目黒目 */}
    <circle cx="30" cy="49" r="3.5" fill="#3a1050" />
    <circle cx="52" cy="49" r="3.5" fill="#3a1050" />
    {/* ハイライト */}
    <circle cx="31.5" cy="47.5" r="1.4" fill="white" />
    <circle cx="53.5" cy="47.5" r="1.4" fill="white" />
    {/* 鼻 */}
    <ellipse cx="40" cy="57" rx="3.5" ry="2.5" fill="#d060a0" />
    {/* 口 */}
    <path
      d="M36 60 Q40 65 44 60"
      stroke="#9060b8"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
    <line
      x1="40"
      y1="57.5"
      x2="40"
      y2="60"
      stroke="#9060b8"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* ひげ */}
    <line
      x1="10"
      y1="57"
      x2="27"
      y2="59"
      stroke="#9060b8"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.5"
    />
    <line
      x1="10"
      y1="62"
      x2="27"
      y2="61"
      stroke="#9060b8"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.4"
    />
    <line
      x1="53"
      y1="59"
      x2="70"
      y2="57"
      stroke="#9060b8"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.5"
    />
    <line
      x1="53"
      y1="61"
      x2="70"
      y2="62"
      stroke="#9060b8"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.4"
    />
    {/* ほっぺ */}
    <ellipse cx="16" cy="55" rx="7" ry="5" fill="rgba(210,100,170,0.28)" />
    <ellipse cx="64" cy="55" rx="7" ry="5" fill="rgba(210,100,170,0.28)" />
  </svg>
);

// 共通スタイル: strokeWidth 2～2.5, fill は薄い半透明, キャラクター特徴を線で表現

// ═══════════════════════════════════════════════
// プロフィールアバター SVG（固有色・塗り全fill）
// ═══════════════════════════════════════════════

// ── くま ─────────────────────────────────────────
const IcAvBear = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    {/* 耳外 */}
    <circle cx="20" cy="22" r="12" fill="#c8813a" />
    <circle cx="60" cy="22" r="12" fill="#c8813a" />
    {/* 耳内 */}
    <circle cx="20" cy="22" r="6.5" fill="#e8a86a" />
    <circle cx="60" cy="22" r="6.5" fill="#e8a86a" />
    {/* 顔 */}
    <ellipse cx="40" cy="47" rx="29" ry="27" fill="#dea06a" />
    {/* マズル */}
    <ellipse cx="40" cy="57" rx="13" ry="9.5" fill="#f0c090" />
    {/* 目白目 */}
    <circle cx="28" cy="43" r="6.5" fill="white" />
    <circle cx="52" cy="43" r="6.5" fill="white" />
    {/* 目黒目 */}
    <circle cx="29" cy="44" r="3.8" fill="#2a1505" />
    <circle cx="53" cy="44" r="3.8" fill="#2a1505" />
    {/* ハイライト */}
    <circle cx="31" cy="42" r="1.6" fill="white" />
    <circle cx="55" cy="42" r="1.6" fill="white" />
    {/* 鼻 */}
    <ellipse cx="40" cy="52" rx="4" ry="2.8" fill="#8a3a18" />
    <ellipse cx="38.8" cy="51" rx="1.4" ry="0.9" fill="rgba(255,255,255,0.4)" />
    {/* 口 */}
    <path
      d="M34.5 57 Q40 63 45.5 57"
      stroke="#8a3a18"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <line
      x1="40"
      y1="52.5"
      x2="40"
      y2="57"
      stroke="#8a3a18"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* ほっぺ */}
    <ellipse cx="17" cy="52" rx="7" ry="5" fill="rgba(230,100,110,0.32)" />
    <ellipse cx="63" cy="52" rx="7" ry="5" fill="rgba(230,100,110,0.32)" />
  </svg>
);

// ── きつね ───────────────────────────────────────
const IcAvFox = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    {/* 耳 */}
    <path d="M14 38 L7 4 L36 30 Z" fill="#e06020" />
    <path d="M17 35 L12 12 L31 28 Z" fill="#ffb07a" />
    <path d="M66 38 L73 4 L44 30 Z" fill="#e06020" />
    <path d="M63 35 L68 12 L49 28 Z" fill="#ffb07a" />
    {/* 頭 */}
    <ellipse cx="40" cy="46" rx="28" ry="26" fill="#e8742a" />
    {/* 白マズル */}
    <ellipse cx="40" cy="56" rx="14" ry="11" fill="#fff0e0" />
    {/* 目白目 */}
    <circle cx="27" cy="41" r="7" fill="white" />
    <circle cx="53" cy="41" r="7" fill="white" />
    {/* 目 */}
    <circle cx="27" cy="41" r="4" fill="#2a1000" />
    <circle cx="53" cy="41" r="4" fill="#2a1000" />
    <circle cx="29" cy="39.5" r="1.6" fill="white" />
    <circle cx="55" cy="39.5" r="1.6" fill="white" />
    {/* 鼻 */}
    <path d="M36 53 L40 56 L44 53 L40 51 Z" fill="#2a1000" />
    {/* 口 */}
    <path
      d="M35 57 Q40 62 45 57"
      stroke="#c05010"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    {/* ほっぺ白 */}
    <ellipse cx="17" cy="52" rx="6" ry="4.5" fill="rgba(255,255,255,0.5)" />
    <ellipse cx="63" cy="52" rx="6" ry="4.5" fill="rgba(255,255,255,0.5)" />
    {/* しっぽ hint */}
    <ellipse cx="16" cy="51" rx="6" ry="4" fill="rgba(230,100,30,0.2)" />
    <ellipse cx="64" cy="51" rx="6" ry="4" fill="rgba(230,100,30,0.2)" />
  </svg>
);

// ── ペンギン ─────────────────────────────────────
const IcAvPenguin = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    {/* 頭（黒） */}
    <ellipse cx="40" cy="28" rx="22" ry="20" fill="#1e2035" />
    {/* 顔白 */}
    <ellipse cx="40" cy="30" rx="14" ry="13" fill="#f0f0f8" />
    {/* 体 */}
    <ellipse cx="40" cy="60" rx="22" ry="18" fill="#1e2035" />
    {/* お腹白 */}
    <ellipse cx="40" cy="62" rx="14" ry="13" fill="#f0f0f8" />
    {/* 目 */}
    <circle cx="32" cy="26" r="4.5" fill="white" />
    <circle cx="48" cy="26" r="4.5" fill="white" />
    <circle cx="32" cy="26" r="2.5" fill="#1a1a2a" />
    <circle cx="48" cy="26" r="2.5" fill="#1a1a2a" />
    <circle cx="33" cy="25" r="1" fill="white" />
    <circle cx="49" cy="25" r="1" fill="white" />
    {/* くちばし */}
    <path d="M36 34 L40 40 L44 34 L40 32 Z" fill="#ff8c00" />
    {/* 翼 */}
    <path
      d="M18 42 Q10 48 11 60 Q14 68 19 67 Q23 66 22 58 L22 42 Z"
      fill="#1e2035"
    />
    <path
      d="M62 42 Q70 48 69 60 Q66 68 61 67 Q57 66 58 58 L58 42 Z"
      fill="#1e2035"
    />
    {/* 足 */}
    <path d="M32 75 L27 80 L35 80 L33 75 Z" fill="#ff8c00" />
    <path d="M48 75 L45 80 L53 80 L47 75 Z" fill="#ff8c00" />
  </svg>
);

// ── ふくろう ─────────────────────────────────────
const IcAvOwl = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    {/* 羽（左右） */}
    <ellipse
      cx="14"
      cy="52"
      rx="10"
      ry="16"
      fill="#7a4e28"
      transform="rotate(-10,14,52)"
    />
    <ellipse
      cx="66"
      cy="52"
      rx="10"
      ry="16"
      fill="#7a4e28"
      transform="rotate(10,66,52)"
    />
    {/* 羽模様 */}
    <path
      d="M9 44 Q14 50 10 60"
      stroke="#5a3510"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M11 46 Q16 53 12 63"
      stroke="#5a3510"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M71 44 Q66 50 70 60"
      stroke="#5a3510"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M69 46 Q64 53 68 63"
      stroke="#5a3510"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    />
    {/* 体 */}
    <ellipse cx="40" cy="55" rx="22" ry="23" fill="#9a6030" />
    {/* お腹縞 */}
    <ellipse cx="40" cy="60" rx="13" ry="15" fill="#d4a870" />
    <path
      d="M30 55 Q40 57 50 55"
      stroke="#c09060"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M29 61 Q40 63 51 61"
      stroke="#c09060"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M30 67 Q40 69 50 67"
      stroke="#c09060"
      strokeWidth="1.5"
      fill="none"
    />
    {/* 頭 */}
    <circle cx="40" cy="30" r="22" fill="#7a4e28" />
    {/* 耳羽（三角） */}
    <path d="M22 16 L18 4 L30 14 Z" fill="#5a3510" />
    <path d="M58 16 L62 4 L50 14 Z" fill="#5a3510" />
    {/* 目の大きな輪 */}
    <circle cx="29" cy="30" r="11" fill="#e8c070" />
    <circle cx="51" cy="30" r="11" fill="#e8c070" />
    <circle cx="29" cy="30" r="8" fill="white" />
    <circle cx="51" cy="30" r="8" fill="white" />
    {/* 目 */}
    <circle cx="29" cy="30" r="5" fill="#1a0800" />
    <circle cx="51" cy="30" r="5" fill="#1a0800" />
    <circle cx="31" cy="28" r="2" fill="white" />
    <circle cx="53" cy="28" r="2" fill="white" />
    {/* くちばし */}
    <path d="M36 37 L40 44 L44 37 Z" fill="#e07820" />
    {/* まゆ毛 */}
    <path
      d="M21 21 Q29 18 37 21"
      stroke="#3a2008"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M43 21 Q51 18 59 21"
      stroke="#3a2008"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// ── ねこ ─────────────────────────────────────────
const IcAvCat = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    {/* 耳 */}
    <path d="M16 32 L10 8 L32 26 Z" fill="#e8a0c0" />
    <path d="M18 30 L14 12 L28 25 Z" fill="#ffcce0" />
    <path d="M64 32 L70 8 L48 26 Z" fill="#e8a0c0" />
    <path d="M62 30 L66 12 L52 25 Z" fill="#ffcce0" />
    {/* 頭 */}
    <ellipse cx="40" cy="46" rx="28" ry="26" fill="#f0c8e0" />
    {/* マズル */}
    <ellipse cx="40" cy="57" rx="13" ry="9" fill="#ffe8f4" />
    {/* 目白目 */}
    <circle cx="27" cy="42" r="7" fill="white" />
    <circle cx="53" cy="42" r="7" fill="white" />
    {/* アーモンド目 */}
    <ellipse cx="27" cy="42" rx="5" ry="6" fill="#3a2030" />
    <ellipse cx="53" cy="42" rx="5" ry="6" fill="#3a2030" />
    <circle cx="29" cy="40" r="2" fill="white" />
    <circle cx="55" cy="40" r="2" fill="white" />
    {/* 鼻ハート */}
    <path
      d="M37 53 Q39 51 40 52 Q41 51 43 53 Q41 56 40 55 Q39 56 37 53 Z"
      fill="#d04080"
    />
    {/* 口 */}
    <path
      d="M36 57 Q40 61 44 57"
      stroke="#d04080"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
    <line
      x1="40"
      y1="55"
      x2="40"
      y2="57"
      stroke="#d04080"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* ヒゲ */}
    <line
      x1="8"
      y1="53"
      x2="26"
      y2="55"
      stroke="#c080a0"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="8"
      y1="57"
      x2="26"
      y2="57"
      stroke="#c080a0"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="72"
      y1="53"
      x2="54"
      y2="55"
      stroke="#c080a0"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="72"
      y1="57"
      x2="54"
      y2="57"
      stroke="#c080a0"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* ほっぺ */}
    <ellipse cx="16" cy="54" rx="7" ry="5" fill="rgba(220,80,120,0.25)" />
    <ellipse cx="64" cy="54" rx="7" ry="5" fill="rgba(220,80,120,0.25)" />
  </svg>
);

// ── ハムスター ───────────────────────────────────
const IcAvHamster = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    {/* 耳 */}
    <circle cx="22" cy="18" r="10" fill="#f4a060" />
    <circle cx="58" cy="18" r="10" fill="#f4a060" />
    <circle cx="22" cy="18" r="5.5" fill="#ffcca0" />
    <circle cx="58" cy="18" r="5.5" fill="#ffcca0" />
    {/* ほっぺ袋（でかい） */}
    <circle cx="10" cy="52" r="16" fill="#f0c080" />
    <circle cx="70" cy="52" r="16" fill="#f0c080" />
    {/* 頭・体 */}
    <ellipse cx="40" cy="46" rx="26" ry="28" fill="#f8d8a8" />
    {/* お腹 */}
    <ellipse cx="40" cy="56" rx="14" ry="16" fill="#fff5e0" />
    {/* 目 */}
    <circle cx="28" cy="38" r="5.5" fill="#2a1000" />
    <circle cx="52" cy="38" r="5.5" fill="#2a1000" />
    <circle cx="30" cy="36.5" r="2" fill="white" />
    <circle cx="54" cy="36.5" r="2" fill="white" />
    {/* 鼻ハート */}
    <path
      d="M36 50 Q38.5 47.5 40 49 Q41.5 47.5 44 50 Q42 53.5 40 52.5 Q38 53.5 36 50 Z"
      fill="#e06080"
    />
    {/* 口 */}
    <path
      d="M36 52 L33 56 M36 52 L39 56"
      stroke="#c88040"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M44 52 L41 56 M44 52 L47 56"
      stroke="#c88040"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* ヒゲ */}
    <line
      x1="5"
      y1="49"
      x2="24"
      y2="51"
      stroke="#c88040"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <line
      x1="5"
      y1="53"
      x2="24"
      y2="53"
      stroke="#c88040"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <line
      x1="75"
      y1="49"
      x2="56"
      y2="51"
      stroke="#c88040"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <line
      x1="75"
      y1="53"
      x2="56"
      y2="53"
      stroke="#c88040"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

// ── ゴリラ ───────────────────────────────────────
const IcAvGorilla = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    {/* 耳（大きい） */}
    <ellipse cx="12" cy="42" rx="9" ry="11" fill="#3a3030" />
    <ellipse cx="68" cy="42" rx="9" ry="11" fill="#3a3030" />
    <ellipse cx="12" cy="42" rx="5" ry="6.5" fill="#6a5050" />
    <ellipse cx="68" cy="42" rx="5" ry="6.5" fill="#6a5050" />
    {/* 頭でっかい */}
    <ellipse cx="40" cy="38" rx="30" ry="26" fill="#3a3030" />
    {/* 額のライン */}
    <path
      d="M14 28 Q40 20 66 28"
      stroke="#2a2020"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    {/* 顔中央は少し明るめ */}
    <ellipse cx="40" cy="44" rx="20" ry="18" fill="#4a3838" />
    {/* マズル（明るいベージュ） */}
    <ellipse cx="40" cy="57" rx="15" ry="11" fill="#a07860" />
    {/* 目 */}
    <circle cx="28" cy="39" r="6" fill="white" />
    <circle cx="52" cy="39" r="6" fill="white" />
    <circle cx="28" cy="39" r="3.5" fill="#1a0a00" />
    <circle cx="52" cy="39" r="3.5" fill="#1a0a00" />
    <circle cx="29.5" cy="37.5" r="1.4" fill="white" />
    <circle cx="53.5" cy="37.5" r="1.4" fill="white" />
    {/* 鼻（平ら・大きい） */}
    <ellipse cx="40" cy="51" rx="6" ry="4" fill="#2a1a10" />
    <ellipse cx="37" cy="50" rx="2" ry="1.2" fill="#503a30" />
    <ellipse cx="43" cy="50" rx="2" ry="1.2" fill="#503a30" />
    {/* 口 */}
    <path
      d="M31 58 Q40 65 49 58"
      stroke="#2a1a10"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M40 51.5 L40 58"
      stroke="#2a1a10"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* ほっぺ */}
    <ellipse cx="18" cy="52" rx="6" ry="4.5" fill="rgba(180,120,100,0.3)" />
    <ellipse cx="62" cy="52" rx="6" ry="4.5" fill="rgba(180,120,100,0.3)" />
  </svg>
);

const IcAvSmile = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle
      cx="16"
      cy="16"
      r="13"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
    />
    <circle cx="12" cy="13" r="2" fill={color} />
    <circle cx="20" cy="13" r="2" fill={color} />
    <path
      d="M11 20q5 5 10 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
const IcAvRocket = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 5c3 0 7 5 7 12l-3 2v5l-4-2-4 2v-5l-3-2C9 10 13 5 16 5z"
      fill={color + "44"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="14" r="2.5" fill={color} opacity="0.8" />
    <path
      d="M9 17c-2 1-3 4-2 6M23 17c2 1 3 4 2 6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);
const IcAvStar = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 4l3 8 8 1-6 5.5 2 8L16 23l-7 3.5 2-8L5 13l8-1z"
      fill={color + "44"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="22" cy="8" r="1.5" fill={color} opacity="0.6" />
    <circle cx="9" cy="7" r="1" fill={color} opacity="0.4" />
  </svg>
);
const IcAvFire = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 5c0 0 5 5 4 10 2-1 3-4 2-7 4 3 5 8 3 13-1 3-4 5-7 5s-8-3-8-8c0-3 2-5 4-6-1 3 1 4 3 4-3-4 1-8-1-11z"
      fill={color + "55"}
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="22" r="2.5" fill={color} opacity="0.7" />
  </svg>
);
const IcAvCrown = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M4 24l4-14 8 8 4-10 4 10 4-8 4 14z"
      fill={color + "44"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <rect
      x="4"
      y="24"
      width="24"
      height="4"
      rx="2"
      fill={color}
      opacity="0.7"
    />
    <circle cx="16" cy="10" r="2" fill={color} />
    <circle cx="6.5" cy="13" r="1.5" fill={color} />
    <circle cx="25.5" cy="13" r="1.5" fill={color} />
  </svg>
);
const IcAvGhost = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M6 28V15a10 10 0 0120 0v13l-4-4-3 4-3-4-3 4-3-4z"
      fill={color + "44"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="16" r="2" fill={color} />
    <circle cx="20" cy="16" r="2" fill={color} />
  </svg>
);
const IcAvRobot = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect
      x="7"
      y="11"
      width="18"
      height="14"
      rx="3"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
    />
    <rect
      x="11"
      y="15"
      width="4"
      height="4"
      rx="1"
      fill={color}
      opacity="0.7"
    />
    <rect
      x="17"
      y="15"
      width="4"
      height="4"
      rx="1"
      fill={color}
      opacity="0.7"
    />
    <path d="M13 23h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M16 7v4M13 9h6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M7 17h-3M28 17h-3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const IcDefaultUser = ({ size = 32, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle
      cx="16"
      cy="11"
      r="6"
      fill={color + "44"}
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M4 28c0-6.627 5.373-10 12-10s12 3.373 12 10"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      fill={color + "22"}
    />
  </svg>
);
// ─── UI用小アイコン ───────────────────────────────────────────────────────────
const IcCamera = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IcKey = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);
const IcRefresh = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
  </svg>
);
const IcSpeech = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IcEye = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcTrashSm = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IcCrownSm = ({ size = 16, color = "#facc15" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 20h20M4 20l2-8 6 4 6-4 2 8" />
    <circle cx="4" cy="10" r="1.5" fill={color} />
    <circle cx="12" cy="6" r="1.5" fill={color} />
    <circle cx="20" cy="10" r="1.5" fill={color} />
  </svg>
);
const IcArrowDown = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);
const IcAlert = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IcCheckSm = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IcMedalSm = ({ size = 20, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="14" r="6" />
    <path d="M8 6l-2-4h12l-2 4" />
    <path d="M9.5 14l1.5 1.5 3-3" />
  </svg>
);
const ACHIEVEMENT_ICONS: Record<string, React.FC<any>> = {
  "🎉": IcAchFirst,
  "⚡": IcAchBolt,
  "🌊": IcAchWave,
  "🏆": IcAchTrophy,
  "💎": IcAchGem,
  "👑": IcAchCrown,
  "💯": IcAchPerfect,
  "🔥": IcAchFire,
  "🌋": IcAchVolcano,
  "🌟": IcAchStar,
  "📗": IcAchBook,
  "📚": IcAchBooks,
  "🎓": IcAchGrad,
  "🧠": IcAchBrain,
  "⚜️": IcAchFleur,
  "📖": IcAchSentence,
  "⭐": IcAchScoreSilver,
  "🌠": IcAchScoreGold,
  "🎮": IcAchGame,
  "🕹️": IcAchJoystick,
  "💪": IcAchMuscle,
  "🏅": IcAchMedal,
  "🎖️": IcAchBadge,
  "✏️": IcAchPencil,
  "📈": IcAchChart,
  "🚀": IcAchRocket,
  "🌌": IcAchGalaxy,
  "🐾": IcAchPaw,
  "🐱": IcAchCat,
  "🦄": IcAchUnicorn,
  "💰": IcAchCoin,
};

const AVATAR_ICONS = {
  bear: IcAvBear,
  fox: IcAvFox,
  penguin: IcAvPenguin,
  owl: IcAvOwl,
  cat2: IcAvCat,
  hamster: IcAvHamster,
  gorilla: IcAvGorilla,
  rabbit: IcAvRabbit,
  // ペット帽子アバター（Lv10解放）
  cat_hat: IcAvCatHat,
  dog_hat: IcAvDogHat,
  rabbit_hat: IcAvRabbitHat,
  fox_hat: IcAvFoxHat,
  panda_hat: IcAvPandaHat,
  dragon_hat: IcAvDragonHat,
  unicorn_hat: IcAvUnicornHat,
  bearcat_hat: IcAvBearcatHat,
  penguin_hat: IcAvPenguinHat,
  hamster_hat: IcAvHamsterHat,
};

const AVATARS = [
  { char: "bear", label: "くま" },
  { char: "fox", label: "きつね" },
  { char: "penguin", label: "ペンギン" },
  { char: "owl", label: "ふくろう" },
  { char: "cat2", label: "ねこ" },
  { char: "hamster", label: "ハムスター" },
  { char: "gorilla", label: "ゴリラ" },
  { char: "rabbit", label: "ウサギ" },
];

// 絵文字をSVGアイコンでレンダリングするヘルパー
const EmojiIcon = ({ emoji, size = 32, color = "currentColor" }) => {
  const Ic = ACHIEVEMENT_ICONS[emoji] || AVATAR_ICONS[emoji];
  if (Ic) return <Ic size={size} color={color} />;
  return <span style={{ fontSize: size * 0.75, lineHeight: 1 }}>{emoji}</span>;
};
// ─────────────────────────────────────────────────────────────────────────────
const getFirebaseInstance = () => {
  const config = {
    apiKey: "AIzaSyDRxf41aviV1nAPzdpfua-oD6uCbZocdVc",
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
  } catch (e) {
    // ✅ alertを出さずサイレントにオフラインモードへ（広告ブロッカー・厳格なWi-Fi対策）
    // alertを出すとFirebase初期化前にReactがクラッシュして画面真っ白になる
    console.warn("Firebase unavailable, running in offline mode:", e.message);
    return { db: null, auth: null, enabled: false, appId: "local-only" };
  }
};
const fb = getFirebaseInstance();

// --- 定数 ---
// レベルに必要な累積EXP (非線形: レベルが上がるほど必要EXPが増加)
// lv1→2: 500, lv2→3: 800, lv3→4: ~1280... (初期500で×1.6ずつ増加)
const calcExpForLevel = (lv) => {
  let total = 0;
  for (let i = 1; i < lv; i++) total += Math.floor(500 * Math.pow(1.6, i - 1));
  return total;
};
const calcExpProgress = (exp) => {
  const e = exp || 0;
  const lv = calcLevel(e);
  const cur = e - calcExpForLevel(lv);
  const need = calcExpForLevel(lv + 1) - calcExpForLevel(lv);
  return { cur, need, pct: Math.min(100, Math.round((cur / need) * 100)) };
};

const SHOP_PETS = [
  { id: "bearcat", name: "くまねこ", price: 0, desc: "クマとネコの不思議な子" },
  { id: "cat", name: "ネコ", price: 50, desc: "気まぐれな相棒" },
  { id: "dog", name: "イヌ", price: 50, desc: "忠実な友達" },
  {
    id: "penguin",
    name: "ペンギン",
    price: 100,
    desc: "ちょこちょこ歩く海の鳥",
  },
  { id: "rabbit", name: "ウサギ", price: 100, desc: "ふわふわ癒し系" },
  {
    id: "hamster",
    name: "ハムスター",
    price: 150,
    desc: "ほっぺに詰め込む天才",
  },
  { id: "fox", name: "キツネ", price: 200, desc: "ずる賢くて賢い" },
  { id: "panda", name: "パンダ", price: 300, desc: "白黒のかわいい子" },
  { id: "dragon", name: "ドラゴン", price: 800, desc: "伝説の生き物" },
  { id: "unicorn", name: "ユニコーン", price: 1200, desc: "夢の生き物" },
];

const SHOP_ACCESSORIES = [
  {
    id: "hat",
    emoji: "🎩",
    name: "シルクハット",
    price: 80,
    slot: "head",
    color: "#7c3aed",
  },
  {
    id: "crown",
    emoji: "👑",
    name: "クラウン",
    price: 200,
    slot: "head",
    color: "#f59e0b",
  },
  {
    id: "bow",
    emoji: "🎀",
    name: "リボン",
    price: 60,
    slot: "head",
    color: "#ec4899",
  },
  {
    id: "glasses",
    emoji: "👓",
    name: "メガネ",
    price: 100,
    slot: "face",
    color: "#3b82f6",
  },
  {
    id: "star",
    emoji: "⭐",
    name: "スター",
    price: 150,
    slot: "bg",
    color: "#eab308",
  },
  {
    id: "rainbow",
    emoji: "🌈",
    name: "レインボー",
    price: 300,
    slot: "bg",
    color: "#10b981",
  },
];

const SHOP_BACKGROUNDS = [
  {
    id: "night",
    emoji: "🌃",
    SvgIcon: IcBgNight,
    iconColor: "#c4b5fd",
    name: "夜の部屋",
    price: 0,
    gradient:
      "linear-gradient(180deg, #1a0a3e 0%, #0d1b4e 40%, #1a2a5e 70%, #2a3060 100%)",
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
    gradient:
      "linear-gradient(180deg, #3a0a00 0%, #8b2500 30%, #d4500a 60%, #f0a030 100%)",
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

const IcThemeTango = ({ size = 20, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="14" height="10" rx="1.5" fill={color + "22"} />
    <rect
      x="5"
      y="7"
      width="14"
      height="10"
      rx="1.5"
      fill={color + "22"}
      stroke={color}
      strokeWidth="1.5"
    />
    <rect
      x="7"
      y="9"
      width="14"
      height="10"
      rx="1.5"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.8"
    />
    <line x1="10" y1="13" x2="18" y2="13" strokeWidth="1.4" />
    <line x1="10" y1="16" x2="15" y2="16" strokeWidth="1.2" />
  </svg>
);
const IcThemeDark = ({ size = 20, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      fill={color + "33"}
    />
    <circle cx="19" cy="4" r="1" fill={color} />
    <circle cx="22" cy="8" r="1" fill={color} />
    <circle cx="17" cy="8" r="0.7" fill={color} />
  </svg>
);
const IcThemeLight = ({ size = 20, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" fill={color + "33"} />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const IcThemeCyber = ({ size = 20, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" fill={color + "22"} />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <path d="M7 8h2M11 8h6M7 11h4M13 11h4" strokeWidth="1.5" />
  </svg>
);
const IcThemePink = ({ size = 20, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 4.03 3.01 2 5.795 2c2.088 0 3.71 1.086 4.7 2.568C11.5 3.086 13.122 2 15.205 2 17.99 2 20 4.03 20 7.191c0 4.105-5.37 8.863-11 14.402z"
      fill={color + "44"}
    />
  </svg>
);

const IcNoteApp = ({ size = 32, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);
const IcSettings2 = ({ size = 32, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IcTyping = ({ size = 32, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="6" width="20" height="13" rx="2" />
    <line x1="6" y1="10" x2="6" y2="10" strokeWidth="2.5" />
    <line x1="10" y1="10" x2="10" y2="10" strokeWidth="2.5" />
    <line x1="14" y1="10" x2="14" y2="10" strokeWidth="2.5" />
    <line x1="18" y1="10" x2="18" y2="10" strokeWidth="2.5" />
    <line x1="6" y1="14" x2="6" y2="14" strokeWidth="2.5" />
    <line x1="10" y1="14" x2="10" y2="14" strokeWidth="2.5" />
    <line x1="14" y1="14" x2="14" y2="14" strokeWidth="2.5" />
    <line x1="18" y1="14" x2="18" y2="14" strokeWidth="2.5" />
    <line x1="8" y1="17.5" x2="16" y2="17.5" strokeWidth="2" />
  </svg>
);
const IcThumbsUp = ({ size = 32, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);
const IcMuscle = ({ size = 32, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4" />
    <path d="M12 12c0 2.2-1.8 4-4 4a4 4 0 0 1-4-4" />
    <path d="M4 12c0-2.2 1.8-4 4-4" />
    <path d="M16 16c0 2.2-1.8 4-4 4s-4-1.8-4-4" />
    <path d="M8 8c0-2.2 1.8-4 4-4s4 1.8 4 4" />
  </svg>
);
const IcSkull = ({ size = 32, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="11" r="7" />
    <path d="M9 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0" fill={color} />
    <path d="M13 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0" fill={color} />
    <path d="M9 17v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1" />
    <line x1="12" y1="17" x2="12" y2="19" />
  </svg>
);
const IcParty = ({ size = 32, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5.8 11.3L2 22l10.7-3.79" />
    <path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01" />
    <path d="M22 2l-7.5 7.5" />
    <path d="M10 12l-2 2" />
    <circle cx="16.5" cy="7.5" r="3.5" />
  </svg>
);
const IcFactory = ({ size = 32, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 20V9l5-3v3l5-3v3l5-3v14H2z" />
    <line x1="2" y1="20" x2="22" y2="20" />
    <rect x="6" y="14" width="3" height="6" rx="0.5" />
    <rect x="11" y="14" width="3" height="6" rx="0.5" />
    <path d="M17 14h2v6h-2" />
    <path d="M6 11h2M11 11h2" />
  </svg>
);
const IcTweetApp = ({ size = 32, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);
const IcHeart = ({ size = 16, color = "currentColor", filled = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? color : "none"}
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IcRetweet = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
const IcComment = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IcShare = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const IcPlus = ({ size = 20, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IcTrash2 = ({ size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

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
];
// ⚠️ セキュリティ警告: このパスコードはフロントエンドに直書きされており、
// ブラウザの開発者ツールから誰でも閲覧可能です。
// 本番運用では Firebase Functions などバックエンドでの検証に移行してください。
const ADMIN_PASSCODE = "genronkai.miwa";

// ─── 実績カテゴリー ───────────────────────────────────────────────────────────
const ACHIEVEMENT_CATEGORIES = [
  { id: "all", label: "すべて", color: "#c9a84c" },
  { id: "stage", label: "ステージ", color: "#6366f1" },
  { id: "vocab", label: "単語力", color: "#10b981" },
  { id: "play", label: "プレイ", color: "#f43f5e" },
  { id: "special", label: "特別", color: "#f59e0b" },
  { id: "pet", label: "ペット", color: "#ec4899" },
];
const RANK_META = {
  bronze: {
    label: "ブロンズ",
    color: "#cd7f32",
    bg: "rgba(205,127,50,0.15)",
    border: "rgba(205,127,50,0.4)",
  },
  silver: {
    label: "シルバー",
    color: "#b0b8c1",
    bg: "rgba(176,184,193,0.15)",
    border: "rgba(176,184,193,0.4)",
  },
  gold: {
    label: "ゴールド",
    color: "#c9a84c",
    bg: "rgba(201,168,76,0.15)",
    border: "rgba(201,168,76,0.45)",
  },
  platinum: {
    label: "プラチナ",
    color: "#94a3b8",
    bg: "rgba(226,232,240,0.18)",
    border: "rgba(148,163,184,0.5)",
  },
};
// ─── 実績定義 (30個) ─────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  // ステージ
  {
    id: "first_clear",
    cat: "stage",
    rank: "bronze",
    icon: "🎉",
    IconComp: IcAchFirst,
    title: "はじめての一歩",
    desc: "はじめてステージをクリアする",
    check: (p, h) => h.some((r) => r.isClear),
  },
  {
    id: "stage3_clear",
    cat: "stage",
    rank: "bronze",
    icon: "⚡",
    IconComp: IcAchBolt,
    title: "初級突破",
    desc: "ステージ3をクリアする",
    check: (p, h) => h.some((r) => r.isClear && r.stage === 3),
  },
  {
    id: "stage5_clear",
    cat: "stage",
    rank: "silver",
    icon: "🌊",
    IconComp: IcAchWave,
    title: "中級突破",
    desc: "ステージ5をクリアする",
    check: (p, h) => h.some((r) => r.isClear && r.stage === 5),
  },
  {
    id: "stage10_clear",
    cat: "stage",
    rank: "gold",
    icon: "🏆",
    IconComp: IcAchTrophy,
    title: "上級到達",
    desc: "ステージ10をクリアする",
    check: (p, h) => h.some((r) => r.isClear && r.stage === 10),
  },
  {
    id: "stage15_clear",
    cat: "stage",
    rank: "gold",
    icon: "💎",
    IconComp: IcAchGem,
    title: "エキスパート",
    desc: "ステージ15をクリアする",
    check: (p, h) => h.some((r) => r.isClear && r.stage === 15),
  },
  {
    id: "stage20_clear",
    cat: "stage",
    rank: "platinum",
    icon: "👑",
    IconComp: IcAchCrown,
    title: "伝説の覇者",
    desc: "全ステージ20をクリアする",
    check: (p, h) => h.some((r) => r.isClear && r.stage === 20),
  },
  {
    id: "perfect_clear",
    cat: "stage",
    rank: "gold",
    icon: "💯",
    IconComp: IcAchPerfect,
    title: "パーフェクト",
    desc: "ライフを全て残してクリアする",
    check: (p, h) => h.some((r) => r.isClear && (r.lives || 0) >= 3),
  },
  {
    id: "streak3",
    cat: "stage",
    rank: "silver",
    icon: "🔥",
    IconComp: IcAchFire,
    title: "3連勝",
    desc: "3回連続でステージをクリアする",
    check: (p, h) => {
      let s = 0;
      for (const r of [...h].reverse()) {
        if (r.isClear) {
          s++;
          if (s >= 3) return true;
        } else s = 0;
      }
      return false;
    },
  },
  {
    id: "streak5",
    cat: "stage",
    rank: "gold",
    icon: "🌋",
    IconComp: IcAchVolcano,
    title: "5連勝",
    desc: "5回連続でステージをクリアする",
    check: (p, h) => {
      let s = 0;
      for (const r of [...h].reverse()) {
        if (r.isClear) {
          s++;
          if (s >= 5) return true;
        } else s = 0;
      }
      return false;
    },
  },
  {
    id: "all20_clear",
    cat: "stage",
    rank: "platinum",
    icon: "🌟",
    IconComp: IcAchStar,
    title: "完全制覇",
    desc: "ステージ1〜20を全てクリアする",
    check: (p) => (p?.unlockedStage || 1) > 20,
  },
  // 単語力
  {
    id: "total10",
    cat: "vocab",
    rank: "bronze",
    icon: "📗",
    IconComp: IcAchBook,
    title: "単語デビュー",
    desc: "合計10語を正解する",
    check: (p, h) => h.reduce((s, r) => s + (r.correctCount || 0), 0) >= 10,
  },
  {
    id: "total50",
    cat: "vocab",
    rank: "bronze",
    icon: "📚",
    IconComp: IcAchBooks,
    title: "50語マスター",
    desc: "合計50語を正解する",
    check: (p, h) => h.reduce((s, r) => s + (r.correctCount || 0), 0) >= 50,
  },
  {
    id: "total200",
    cat: "vocab",
    rank: "silver",
    icon: "🎓",
    IconComp: IcAchGrad,
    title: "200語マスター",
    desc: "合計200語を正解する",
    check: (p, h) => h.reduce((s, r) => s + (r.correctCount || 0), 0) >= 200,
  },
  {
    id: "total500",
    cat: "vocab",
    rank: "gold",
    icon: "🧠",
    IconComp: IcAchBrain,
    title: "500語の達人",
    desc: "合計500語を正解する",
    check: (p, h) => h.reduce((s, r) => s + (r.correctCount || 0), 0) >= 500,
  },
  {
    id: "total1000",
    cat: "vocab",
    rank: "platinum",
    icon: "⚜️",
    IconComp: IcAchFleur,
    title: "単語の神",
    desc: "合計1000語を正解する",
    check: (p, h) => h.reduce((s, r) => s + (r.correctCount || 0), 0) >= 1000,
  },
  {
    id: "sentence_clear",
    cat: "vocab",
    rank: "silver",
    icon: "📖",
    IconComp: IcAchSentence,
    title: "例文の使い手",
    desc: "例文モードでステージをクリアする",
    check: (p, h) => h.some((r) => r.isClear && r.mode === "sentence"),
  },
  {
    id: "highscore1k",
    cat: "vocab",
    rank: "silver",
    icon: "⭐",
    IconComp: IcAchScoreSilver,
    title: "ハイスコア",
    desc: "1ゲームで1000点以上獲得する",
    check: (p, h) => h.some((r) => r.score >= 1000),
  },
  {
    id: "highscore2k",
    cat: "vocab",
    rank: "gold",
    icon: "🌠",
    IconComp: IcAchScoreGold,
    title: "スーパースコア",
    desc: "1ゲームで2000点以上獲得する",
    check: (p, h) => h.some((r) => r.score >= 2000),
  },
  // プレイ
  {
    id: "play1",
    cat: "play",
    rank: "bronze",
    icon: "🎮",
    IconComp: IcAchGame,
    title: "初プレイ",
    desc: "ゲームを1回プレイする",
    check: (p, h) => h.length >= 1,
  },
  {
    id: "play10",
    cat: "play",
    rank: "bronze",
    icon: "🕹️",
    IconComp: IcAchJoystick,
    title: "10回挑戦",
    desc: "ゲームを10回プレイする",
    check: (p, h) => h.length >= 10,
  },
  {
    id: "play30",
    cat: "play",
    rank: "silver",
    icon: "💪",
    IconComp: IcAchMuscle,
    title: "30回挑戦",
    desc: "ゲームを30回プレイする",
    check: (p, h) => h.length >= 30,
  },
  {
    id: "play100",
    cat: "play",
    rank: "gold",
    icon: "🏅",
    IconComp: IcAchMedal,
    title: "100回挑戦",
    desc: "ゲームを100回プレイする",
    check: (p, h) => h.length >= 100,
  },
  {
    id: "play300",
    cat: "play",
    rank: "platinum",
    icon: "🎖️",
    IconComp: IcAchBadge,
    title: "300回の猛者",
    desc: "ゲームを300回プレイする",
    check: (p, h) => h.length >= 300,
  },
  {
    id: "custom_play",
    cat: "play",
    rank: "bronze",
    icon: "✏️",
    IconComp: IcAchPencil,
    title: "オリジナル挑戦者",
    desc: "カスタム問題に挑戦する",
    check: (p, h) => h.some((r) => r.stage === "Custom"),
  },
  // 特別
  {
    id: "level5",
    cat: "special",
    rank: "silver",
    icon: "📈",
    IconComp: IcAchChart,
    title: "レベル5突破",
    desc: "レベル5に到達する",
    check: (p) => calcLevel(p?.totalExp || 0) >= 5,
  },
  {
    id: "level10",
    cat: "special",
    rank: "gold",
    icon: "🚀",
    IconComp: IcAchRocket,
    title: "レベル10突破",
    desc: "レベル10に到達する",
    check: (p) => calcLevel(p?.totalExp || 0) >= 10,
  },
  {
    id: "level20",
    cat: "special",
    rank: "platinum",
    icon: "🌌",
    IconComp: IcAchGalaxy,
    title: "レベル20の伝説",
    desc: "レベル20に到達する",
    check: (p) => calcLevel(p?.totalExp || 0) >= 20,
  },
  // ペット
  {
    id: "pet_owner",
    cat: "pet",
    rank: "bronze",
    icon: "🐾",
    IconComp: IcAchPaw,
    title: "ペットの親",
    desc: "ペットを1匹購入する",
    check: (p) => (p?.ownedPets || []).length >= 1,
  },
  {
    id: "pet_collector",
    cat: "pet",
    rank: "silver",
    icon: "🐱",
    IconComp: IcAchCat,
    title: "ペットコレクター",
    desc: "ペットを3匹以上購入する",
    check: (p) => (p?.ownedPets || []).length >= 3,
  },
  {
    id: "pet_all",
    cat: "pet",
    rank: "gold",
    icon: "🦄",
    IconComp: IcAchUnicorn,
    title: "動物園オーナー",
    desc: "ペットを全種類購入する",
    check: (p) => (p?.ownedPets || []).length >= 7,
  },
  {
    id: "points1000",
    cat: "pet",
    rank: "silver",
    icon: "💰",
    IconComp: IcAchCoin,
    title: "コイン長者",
    desc: "1000pt以上を所持する",
    check: (p) => (p?.petPoints || 0) >= 1000,
  },
];
const COLORS = [
  { name: "Gold", bg: "bg-amber-500", hex: "#f59e0b" },
  { name: "Sky", bg: "bg-sky-500", hex: "#0ea5e9" },
  { name: "Emerald", bg: "bg-emerald-500", hex: "#10b981" },
  { name: "Rose", bg: "bg-rose-500", hex: "#f43f5e" },
  { name: "Violet", bg: "bg-violet-500", hex: "#8b5cf6" },
  { name: "Pink", bg: "bg-pink-500", hex: "#ec4899" },
  { name: "Orange", bg: "bg-orange-500", hex: "#f97316" },
  { name: "Teal", bg: "bg-teal-500", hex: "#14b8a6" },
  { name: "Indigo", bg: "bg-indigo-500", hex: "#6366f1" },
  { name: "Lime", bg: "bg-lime-500", hex: "#84cc16" },
  { name: "Red", bg: "bg-red-600", hex: "#dc2626" },
  { name: "Cyan", bg: "bg-cyan-500", hex: "#06b6d4" },
];

const STAGES = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  isBoss: (i + 1) % 5 === 0,
}));

// ─── 単語カテゴリ ───────────────────────────────────────────────────────────────
// ─── カテゴリアイコン ─────────────────────────────────────────────────────────
const IcCatEigo = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect
      x="2"
      y="3"
      width="16"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth="1.6"
      fill={color + "18"}
    />
    <text
      x="10"
      y="13.5"
      textAnchor="middle"
      fontSize="8"
      fontWeight="bold"
      fill={color}
      fontFamily="serif"
    >
      ABC
    </text>
  </svg>
);
const IcCatIdiom = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path
      d="M3 5h14M3 9h10M3 13h12M3 17h8"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle
      cx="16"
      cy="15"
      r="3"
      fill={color + "33"}
      stroke={color}
      strokeWidth="1.4"
    />
    <path
      d="M14.8 15h2.4M16 13.8v2.4"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);
const IcCatKanji = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect
      x="3"
      y="3"
      width="14"
      height="14"
      rx="1.5"
      stroke={color}
      strokeWidth="1.6"
      fill={color + "18"}
    />
    <line
      x1="10"
      y1="4"
      x2="10"
      y2="16"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <line
      x1="4"
      y1="10"
      x2="16"
      y2="10"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <line
      x1="5"
      y1="6"
      x2="9"
      y2="9"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="15"
      y1="6"
      x2="11"
      y2="9"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);
const IcCatChem = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path
      d="M7 3v7L3 17h14l-4-7V3"
      stroke={color}
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill={color + "18"}
    />
    <line
      x1="6.5"
      y1="6"
      x2="13.5"
      y2="6"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <circle cx="8" cy="14" r="1.2" fill={color} opacity="0.7" />
    <circle cx="12" cy="15.5" r="1" fill={color} opacity="0.5" />
    <circle cx="14.5" cy="13.5" r="0.8" fill={color} opacity="0.4" />
  </svg>
);
const IcCatKobun = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path
      d="M10 2 Q6 4 4 8 Q3 11 4 14 Q6 18 10 18 Q14 18 16 14 Q17 11 16 8 Q14 4 10 2z"
      stroke={color}
      strokeWidth="1.5"
      fill={color + "18"}
    />
    <line
      x1="10"
      y1="5"
      x2="10"
      y2="15"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
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

// 150語の単語リスト (各ステージ7〜8単語)
const DEFAULT_VOCAB = [
  // Stage 1
  {
    en: "achieve",
    ja: "達成する",
    sentence:
      "After years of hard work and dedication, she finally managed to achieve her dream of becoming a doctor.",
    stage: 1,
    category: "英単語",
  },
  {
    en: "benefit",
    ja: "利益、恩恵",
    sentence:
      "Regular exercise offers a great benefit to both your physical health and your mental well-being.",
    stage: 1,
    category: "英単語",
  },
  {
    en: "essential",
    ja: "不可欠な",
    sentence:
      "Clean water is absolutely essential for life, and many communities around the world still lack access to it.",
    stage: 1,
    category: "英単語",
  },
  {
    en: "provide",
    ja: "提供する",
    sentence:
      "The local government decided to provide free meals to all students from low-income families.",
    stage: 1,
    category: "英単語",
  },
  {
    en: "require",
    ja: "必要とする",
    sentence:
      "This advanced engineering course requires a solid understanding of mathematics and physics.",
    stage: 1,
    category: "英単語",
  },
  {
    en: "develop",
    ja: "発達させる",
    sentence:
      "Scientists are working hard to develop new renewable energy sources that can replace fossil fuels.",
    stage: 1,
    category: "英単語",
  },
  {
    en: "improve",
    ja: "向上させる",
    sentence:
      "She practiced speaking English every day and gradually improved her communication skills.",
    stage: 1,
    category: "英単語",
  },
  {
    en: "consider",
    ja: "見なす、考える",
    sentence:
      "Before making a final decision, you should carefully consider all the possible consequences.",
    stage: 1,
    category: "英単語",
  },
  // Stage 2
  {
    en: "determine",
    ja: "決定する",
    sentence:
      "After much thought, he determined that the best path forward was to study abroad for two years.",
    stage: 2,
    category: "英単語",
  },
  {
    en: "efficient",
    ja: "効率的な",
    sentence:
      "The new automated system is far more efficient than the old manual process we used before.",
    stage: 2,
    category: "英単語",
  },
  {
    en: "significant",
    ja: "重要な",
    sentence:
      "The discovery of penicillin had a significant impact on medicine and saved millions of lives.",
    stage: 2,
    category: "英単語",
  },
  {
    en: "describe",
    ja: "描写する",
    sentence:
      "Could you please describe the symptoms you have been experiencing over the past few days?",
    stage: 2,
    category: "英単語",
  },
  {
    en: "maintain",
    ja: "維持する",
    sentence:
      "It is important to maintain a healthy balance between work and personal life to avoid burnout.",
    stage: 2,
    category: "英単語",
  },
  {
    en: "recognize",
    ja: "認識する",
    sentence:
      "When she walked into the room, I immediately recognized her from the photo she had sent.",
    stage: 2,
    category: "英単語",
  },
  {
    en: "various",
    ja: "様々な",
    sentence:
      "The museum displays various artifacts from ancient civilizations around the world.",
    stage: 2,
    category: "英単語",
  },
  {
    en: "available",
    ja: "利用可能な",
    sentence:
      "The latest version of the software will be available for download starting next Monday.",
    stage: 2,
    category: "英単語",
  },
  // Stage 3
  {
    en: "accurate",
    ja: "正確な",
    sentence:
      "The weather forecast was so accurate that we prepared exactly the right amount of rain gear.",
    stage: 3,
    category: "英単語",
  },
  {
    en: "identify",
    ja: "特定する",
    sentence:
      "Investigators worked for weeks to identify the cause of the mysterious factory fire.",
    stage: 3,
    category: "英単語",
  },
  {
    en: "potential",
    ja: "潜在的な",
    sentence:
      "The young athlete has tremendous potential and could become an Olympic champion one day.",
    stage: 3,
    category: "英単語",
  },
  {
    en: "involve",
    ja: "巻き込む",
    sentence:
      "The new environmental project will involve cooperation from businesses, schools, and local residents.",
    stage: 3,
    category: "英単語",
  },
  {
    en: "reduce",
    ja: "減らす",
    sentence:
      "The city council introduced a new recycling program to reduce the amount of plastic waste.",
    stage: 3,
    category: "英単語",
  },
  {
    en: "contain",
    ja: "含む",
    sentence:
      "This ancient manuscript contains detailed records of trade routes used by merchants centuries ago.",
    stage: 3,
    category: "英単語",
  },
  {
    en: "current",
    ja: "現在の",
    sentence:
      "The current economic situation has forced many small businesses to close their doors permanently.",
    stage: 3,
    category: "英単語",
  },
  {
    en: "physical",
    ja: "身体の",
    sentence:
      "Regular physical activity can help reduce stress and improve your overall quality of life.",
    stage: 3,
    category: "英単語",
  },
  // Stage 4
  {
    en: "appropriate",
    ja: "適切な",
    sentence:
      "It is important to use language that is appropriate for your audience when giving a presentation.",
    stage: 4,
    category: "英単語",
  },
  {
    en: "complex",
    ja: "複雑な",
    sentence:
      "The relationship between economic growth and environmental protection is extremely complex.",
    stage: 4,
    category: "英単語",
  },
  {
    en: "evaluate",
    ja: "評価する",
    sentence:
      "The committee will carefully evaluate all the applications before announcing the scholarship winners.",
    stage: 4,
    category: "英単語",
  },
  {
    en: "frequent",
    ja: "頻繁な",
    sentence:
      "He makes frequent business trips to Asia because most of the company's clients are based there.",
    stage: 4,
    category: "英単語",
  },
  {
    en: "influence",
    ja: "影響",
    sentence:
      "The teacher's kind words had a lasting influence on the student's attitude toward learning.",
    stage: 4,
    category: "英単語",
  },
  {
    en: "observe",
    ja: "観察する",
    sentence:
      "Scientists sent a team to observe the behavior of wild dolphins in their natural habitat.",
    stage: 4,
    category: "英単語",
  },
  {
    en: "previous",
    ja: "以前の",
    sentence:
      "Based on her previous experience working abroad, she was chosen to lead the international project.",
    stage: 4,
    category: "英単語",
  },
  {
    en: "recent",
    ja: "最近の",
    sentence:
      "Recent studies on climate change indicate that global temperatures are rising faster than expected.",
    stage: 4,
    category: "英単語",
  },
  // Stage 5
  {
    en: "sophisticated",
    ja: "洗練された",
    sentence:
      "The museum acquired a sophisticated piece of equipment that can analyze paintings without damaging them.",
    stage: 5,
    category: "英単語",
  },
  { en: "adequate", ja: "適当な", sentence: "Is the food adequate?", stage: 5 },
  { en: "commit", ja: "犯す", sentence: "He committed a crime.", stage: 5 },
  { en: "decline", ja: "断る", sentence: "I declined his offer.", stage: 5 },
  {
    en: "emphasize",
    ja: "強調する",
    sentence:
      "The doctor emphasized the importance of getting enough sleep and eating a balanced diet every day.",
    stage: 5,
    category: "英単語",
  },
  {
    en: "generate",
    ja: "生み出す",
    sentence:
      "The new solar panels installed on the school roof can generate enough electricity to power the building.",
    stage: 5,
    category: "英単語",
  },
  {
    en: "indicate",
    ja: "示す",
    sentence:
      "The results of the survey clearly indicate that most customers are satisfied with the service.",
    stage: 5,
    category: "英単語",
  },
  {
    en: "preserve",
    ja: "保護する",
    sentence:
      "Local residents gathered to sign a petition to preserve the historic building from demolition.",
    stage: 5,
    category: "英単語",
  },
  // Stage 6
  {
    en: "acquire",
    ja: "獲得する",
    sentence:
      "Through years of traveling and studying abroad, she acquired a deep knowledge of different cultures.",
    stage: 6,
    category: "英単語",
  },
  {
    en: "brief",
    ja: "短い",
    sentence:
      "The president gave a brief statement to the press before boarding the plane to attend the summit.",
    stage: 6,
    category: "英単語",
  },
  {
    en: "capable",
    ja: "有能な",
    sentence:
      "She proved herself capable of managing the entire department when the director went on leave.",
    stage: 6,
    category: "英単語",
  },
  {
    en: "demonstrate",
    ja: "証明する",
    sentence:
      "The engineer demonstrated how the new machine works by assembling it step by step in front of us.",
    stage: 6,
    category: "英単語",
  },
  {
    en: "estimate",
    ja: "見積もる",
    sentence:
      "Can you estimate how much it would cost to renovate this building from top to bottom?",
    stage: 6,
    category: "英単語",
  },
  {
    en: "fundamental",
    ja: "基本的な",
    sentence:
      "Freedom of speech is a fundamental right that must be protected in any democratic society.",
    stage: 6,
    category: "英単語",
  },
  {
    en: "investigate",
    ja: "調査する",
    sentence:
      "The journalist spent months trying to investigate the corruption scandal within the government.",
    stage: 6,
    category: "英単語",
  },
  {
    en: "participate",
    ja: "参加する",
    sentence:
      "All students are strongly encouraged to participate in the after-school clubs and activities.",
    stage: 6,
    category: "英単語",
  },
  // Stage 7
  {
    en: "adapt",
    ja: "適応する",
    sentence:
      "When she moved to a foreign country, it took her several months to fully adapt to the new culture.",
    stage: 7,
    category: "英単語",
  },
  {
    en: "capacity",
    ja: "能力",
    sentence:
      "The stadium has a seating capacity of over fifty thousand spectators for international matches.",
    stage: 7,
    category: "英単語",
  },
  {
    en: "conclude",
    ja: "結論づける",
    sentence:
      "After reviewing all the evidence carefully, the judge concluded that the defendant was not guilty.",
    stage: 7,
    category: "英単語",
  },
  {
    en: "distinguish",
    ja: "区別する",
    sentence:
      "It can be difficult to distinguish between genuine antiques and modern reproductions without an expert.",
    stage: 7,
    category: "英単語",
  },
  {
    en: "examine",
    ja: "調べる",
    sentence:
      "The doctor carefully examined the patient and ordered several tests to determine the cause of the pain.",
    stage: 7,
    category: "英単語",
  },
  {
    en: "guarantee",
    ja: "保証する",
    sentence:
      "The manufacturer will guarantee that the product works as advertised for at least five years.",
    stage: 7,
    category: "英単語",
  },
  {
    en: "isolate",
    ja: "孤立させる",
    sentence:
      "Researchers had to isolate the new virus strain to study its characteristics and develop a vaccine.",
    stage: 7,
    category: "英単語",
  },
  {
    en: "predict",
    ja: "予測する",
    sentence:
      "It is increasingly difficult to predict the weather accurately because of climate change.",
    stage: 7,
    category: "英単語",
  },
  // Stage 8
  {
    en: "adjust",
    ja: "調整する",
    sentence:
      "When you change countries, you may need to adjust to different customs, food, and social expectations.",
    stage: 8,
    category: "英単語",
  },
  {
    en: "characteristic",
    ja: "特徴",
    sentence:
      "One of the most remarkable characteristics of dolphins is their ability to communicate using sounds.",
    stage: 8,
    category: "英単語",
  },
  {
    en: "confirm",
    ja: "確認する",
    sentence:
      "Please confirm your reservation by sending an email to our office at least 48 hours in advance.",
    stage: 8,
    category: "英単語",
  },
  {
    en: "distribute",
    ja: "分配する",
    sentence:
      "Volunteers gathered at the community center to distribute food and supplies to affected families.",
    stage: 8,
    category: "英単語",
  },
  {
    en: "exhibit",
    ja: "展示する",
    sentence:
      "The gallery will exhibit works by young artists from around the country for the entire month.",
    stage: 8,
    category: "英単語",
  },
  {
    en: "illustrate",
    ja: "説明する",
    sentence:
      "This simple diagram helps to illustrate the complex relationship between supply and demand.",
    stage: 8,
    category: "英単語",
  },
  {
    en: "justify",
    ja: "正当化する",
    sentence:
      "Nothing in the world can justify the use of violence against innocent and unarmed civilians.",
    stage: 8,
    category: "英単語",
  },
  {
    en: "propose",
    ja: "提案する",
    sentence:
      "At the end of the meeting, she proposed a new marketing strategy that impressed everyone in the room.",
    stage: 8,
    category: "英単語",
  },
  // Stage 9
  { en: "alter", ja: "変える", sentence: "They altered the plans.", stage: 9 },
  {
    en: "circumstance",
    ja: "状況",
    sentence:
      "Under no circumstances should you share your personal password with anyone, even a close friend.",
    stage: 9,
    category: "英単語",
  },
  {
    en: "consume",
    ja: "消費する",
    sentence:
      "Modern society tends to consume far more natural resources than the earth can sustainably provide.",
    stage: 9,
    category: "英単語",
  },
  {
    en: "dominate",
    ja: "支配する",
    sentence:
      "The tech giant continues to dominate the global smartphone market with over forty percent of sales.",
    stage: 9,
    category: "英単語",
  },
  {
    en: "expand",
    ja: "拡大する",
    sentence:
      "The company is planning to expand its operations to five new countries in Southeast Asia next year.",
    stage: 9,
    category: "英単語",
  },
  {
    en: "imply",
    ja: "ほのめかす",
    sentence:
      "When she said she was tired, she was implying that she wanted to leave the party early.",
    stage: 9,
    category: "英単語",
  },
  {
    en: "modify",
    ja: "修正する",
    sentence:
      "Engineers had to significantly modify the original design after discovering a major structural flaw.",
    stage: 9,
    category: "英単語",
  },
  {
    en: "purchase",
    ja: "購入する",
    sentence:
      "She decided to purchase the old house and spend her savings on restoring it to its original condition.",
    stage: 9,
    category: "英単語",
  },
  // Stage 10
  {
    en: "analyze",
    ja: "分析する",
    sentence:
      "The research team analyzed thousands of hours of data before publishing their groundbreaking findings.",
    stage: 10,
    category: "英単語",
  },
  {
    en: "civilization",
    ja: "文明",
    sentence:
      "The ancient Roman civilization made enormous contributions to law, architecture, and governance.",
    stage: 10,
    category: "英単語",
  },
  {
    en: "convince",
    ja: "納得させる",
    sentence:
      "It took him several hours of careful explanation to finally convince his parents to support his decision.",
    stage: 10,
    category: "英単語",
  },
  {
    en: "eliminate",
    ja: "排除する",
    sentence:
      "The long-term goal of the organization is to eliminate poverty and hunger in developing nations.",
    stage: 10,
    category: "英単語",
  },
  {
    en: "expose",
    ja: "さらす",
    sentence:
      "The documentary expose how factory farming practices can harm both animals and the environment.",
    stage: 10,
    category: "英単語",
  },
  {
    en: "incorporate",
    ja: "組み込む",
    sentence:
      "We should try to incorporate the feedback from all stakeholders before releasing the final version.",
    stage: 10,
    category: "英単語",
  },
  {
    en: "negotiate",
    ja: "交渉する",
    sentence:
      "The two countries agreed to negotiate a trade deal that would benefit both of their economies.",
    stage: 10,
    category: "英単語",
  },
  {
    en: "pursue",
    ja: "追求する",
    sentence:
      "Despite facing many obstacles, she continued to pursue her dream of becoming a professional musician.",
    stage: 10,
    category: "英単語",
  },
  // Stage 11
  {
    en: "anticipate",
    ja: "予期する",
    sentence:
      "We anticipate that the demand for electric vehicles will grow significantly over the next decade.",
    stage: 11,
    category: "英単語",
  },
  {
    en: "colleague",
    ja: "同僚",
    sentence:
      "She turned to her most trusted colleague for advice before making such an important career move.",
    stage: 11,
    category: "英単語",
  },
  {
    en: "criticize",
    ja: "批判する",
    sentence:
      "It is easy to criticize others, but it takes real courage to reflect honestly on your own mistakes.",
    stage: 11,
    category: "英単語",
  },
  {
    en: "encounter",
    ja: "遭遇する",
    sentence:
      "During her travels in Southeast Asia, she encountered many fascinating traditions and customs.",
    stage: 11,
    category: "英単語",
  },
  {
    en: "extend",
    ja: "広げる",
    sentence:
      "The government decided to extend the deadline for tax filing by two weeks due to the holiday period.",
    stage: 11,
    category: "英単語",
  },
  { en: "obtain", ja: "得る", sentence: "He obtained a license.", stage: 11 },
  {
    en: "resolve",
    ja: "解決する",
    sentence:
      "Both parties agreed to sit down and calmly resolve their differences before taking any legal action.",
    stage: 11,
    category: "英単語",
  },
  // Stage 12
  {
    en: "apparent",
    ja: "明白な",
    sentence:
      "It became apparent to everyone in the room that the speaker had not prepared for his presentation.",
    stage: 12,
    category: "英単語",
  },
  {
    en: "commercial",
    ja: "商業的な",
    sentence:
      "The waterfront area has been transformed from an old fishing port into a modern commercial district.",
    stage: 12,
    category: "英単語",
  },
  {
    en: "crucial",
    ja: "極めて重要な",
    sentence:
      "The first few hours after an earthquake are crucial for rescuers searching for survivors in the rubble.",
    stage: 12,
    category: "英単語",
  },
  {
    en: "enhance",
    ja: "高める",
    sentence:
      "Adding high-quality images and clear headings will greatly enhance the overall look of your report.",
    stage: 12,
    category: "英単語",
  },
  {
    en: "fascinate",
    ja: "魅了する",
    sentence:
      "The documentary about deep-sea creatures fascinated the children so much that they watched it twice.",
    stage: 12,
    category: "英単語",
  },
  {
    en: "inevitable",
    ja: "避けられない",
    sentence:
      "Given the rapid growth of artificial intelligence, major changes in the job market seem inevitable.",
    stage: 12,
    category: "英単語",
  },
  {
    en: "occupy",
    ja: "占める",
    sentence:
      "The heavy furniture in the living room occupies far too much space and makes the room feel very small.",
    stage: 12,
    category: "英単語",
  },
  // Stage 13
  {
    en: "appreciate",
    ja: "感謝する",
    sentence:
      "I genuinely appreciate all the hard work and effort you put into organizing this wonderful event.",
    stage: 13,
    category: "英単語",
  },
  {
    en: "commission",
    ja: "委員会",
    sentence:
      "The government established a special commission to investigate the causes of the financial crisis.",
    stage: 13,
    category: "英単語",
  },
  {
    en: "cultivate",
    ja: "耕す",
    sentence:
      "She spent years learning how to cultivate tropical plants in the cold northern climate of her country.",
    stage: 13,
    category: "英単語",
  },
  {
    en: "ensure",
    ja: "確実にする",
    sentence:
      "Please double-check the doors and ensure all windows are securely closed before you leave the building.",
    stage: 13,
    category: "英単語",
  },
  {
    en: "fatal",
    ja: "致命的な",
    sentence:
      "Driving while distracted is a fatal mistake that costs thousands of lives every year around the world.",
    stage: 13,
    category: "英単語",
  },
  {
    en: "inform",
    ja: "知らせる",
    sentence:
      "We will inform all registered users by email as soon as there are any changes to the service terms.",
    stage: 13,
    category: "英単語",
  },
  {
    en: "occur",
    ja: "起こる",
    sentence:
      "No one could explain exactly how the accident occurred, so a full investigation was immediately launched.",
    stage: 13,
    category: "英単語",
  },
  // Stage 14
  {
    en: "approach",
    ja: "接近する",
    sentence:
      "As winter approaches, many animals begin to store food and prepare their shelters for the cold months.",
    stage: 14,
    category: "英単語",
  },
  {
    en: "cure",
    ja: "治療する",
    sentence:
      "Scientists around the world are racing to find a cure for the disease that has affected millions.",
    stage: 14,
    category: "英単語",
  },
  {
    en: "enterprise",
    ja: "企業",
    sentence:
      "Starting a small enterprise from scratch requires a great deal of patience, planning, and determination.",
    stage: 14,
    category: "英単語",
  },
  {
    en: "flexible",
    ja: "柔軟な",
    sentence:
      "To succeed in today's rapidly changing world, you need to be flexible and willing to learn new skills.",
    stage: 14,
    category: "英単語",
  },
  {
    en: "initial",
    ja: "最初の",
    sentence:
      "Her initial reaction to the surprising news was one of complete disbelief and shock.",
    stage: 14,
    category: "英単語",
  },
  {
    en: "oppose",
    ja: "反対する",
    sentence:
      "Many citizens gathered outside the parliament to strongly oppose the newly proposed tax increase.",
    stage: 14,
    category: "英単語",
  },
  {
    en: "perceive",
    ja: "知覚する",
    sentence:
      "Through careful observation, the detective perceived a slight inconsistency in the witness's story.",
    stage: 14,
    category: "英単語",
  },
  // Stage 15
  {
    en: "approve",
    ja: "承認する",
    sentence:
      "The city council finally voted to approve the budget for the construction of the new public library.",
    stage: 15,
    category: "英単語",
  },
  {
    en: "committee",
    ja: "委員会",
    sentence:
      "She was elected to serve on the committee responsible for planning next year's international conference.",
    stage: 15,
    category: "英単語",
  },
  {
    en: "curious",
    ja: "好奇心が強い",
    sentence:
      "The little boy was deeply curious about how airplanes fly, so his parents bought him several science books.",
    stage: 15,
    category: "英単語",
  },
  {
    en: "entertain",
    ja: "楽しませる",
    sentence:
      "The talented comedian entertained the large audience for over two hours with his humorous stories.",
    stage: 15,
    category: "英単語",
  },
  {
    en: "fluctuate",
    ja: "変動する",
    sentence:
      "The price of oil tends to fluctuate significantly depending on political events and global demand.",
    stage: 15,
    category: "英単語",
  },
  {
    en: "initiate",
    ja: "始める",
    sentence:
      "The company decided to initiate a new training program to help employees develop their digital skills.",
    stage: 15,
    category: "英単語",
  },
  {
    en: "overcome",
    ja: "打ち勝つ",
    sentence:
      "She had to overcome many personal and professional obstacles before she finally achieved her goals.",
    stage: 15,
    category: "英単語",
  },
  // Stage 16
  { en: "arise", ja: "生じる", sentence: "Problems often arise.", stage: 16 },
  {
    en: "communicate",
    ja: "伝達する",
    sentence:
      "In today's world, the ability to communicate clearly and effectively is more important than ever.",
    stage: 16,
    category: "英単語",
  },
  {
    en: "entire",
    ja: "全体の",
    sentence:
      "She spent the entire weekend studying for the final exam and barely slept more than a few hours.",
    stage: 16,
    category: "英単語",
  },
  {
    en: "former",
    ja: "前の",
    sentence:
      "The former president returned to his hometown after leaving office and began writing his autobiography.",
    stage: 16,
    category: "英単語",
  },
  { en: "injure", ja: "傷つける", sentence: "He injured his leg.", stage: 16 },
  {
    en: "owe",
    ja: "負っている",
    sentence:
      "I am very grateful for everything you have done for me, and I feel that I owe you a great deal.",
    stage: 16,
    category: "英単語",
  },
  {
    en: "proportion",
    ja: "割合",
    sentence:
      "A surprisingly large proportion of the country's energy now comes from solar and wind power sources.",
    stage: 16,
    category: "英単語",
  },
  // Stage 17
  {
    en: "aspect",
    ja: "側面",
    sentence:
      "Before making any major decision, it is wise to consider every aspect of the situation very carefully.",
    stage: 17,
    category: "英単語",
  },
  {
    en: "community",
    ja: "地域社会",
    sentence:
      "She devoted her career to working for the community and improving the lives of disadvantaged families.",
    stage: 17,
    category: "英単語",
  },
  { en: "custom", ja: "習慣", sentence: "It is a local custom.", stage: 17 },
  {
    en: "equip",
    ja: "装備する",
    sentence:
      "The new science laboratory is fully equipped with the latest technology and advanced research instruments.",
    stage: 17,
    category: "英単語",
  },
  { en: "fortune", ja: "運、財産", sentence: "He made a fortune.", stage: 17 },
  {
    en: "innocent",
    ja: "無罪の",
    sentence:
      "After spending ten years in prison, the man was finally proven innocent thanks to new DNA evidence.",
    stage: 17,
    category: "英単語",
  },
  { en: "own", ja: "所有する", sentence: "He owns a big house.", stage: 17 },
  // Stage 18
  {
    en: "assign",
    ja: "割り当てる",
    sentence:
      "The manager decided to assign the most challenging project to the team with the most experience.",
    stage: 18,
    category: "英単語",
  },
  {
    en: "compare",
    ja: "比較する",
    sentence:
      "When you compare the two proposals side by side, the advantages of the second one become very clear.",
    stage: 18,
    category: "英単語",
  },
  {
    en: "damage",
    ja: "損害",
    sentence:
      "The powerful storm caused extensive damage to buildings and infrastructure across the entire coastal region.",
    stage: 18,
    category: "英単語",
  },
  {
    en: "establish",
    ja: "設立する",
    sentence:
      "The organization was established over a century ago with the goal of promoting international peace.",
    stage: 18,
    category: "英単語",
  },
  {
    en: "found",
    ja: "設立する",
    sentence:
      "The school was originally founded in 1900 by a group of educators who believed in equal access to education.",
    stage: 18,
    category: "英単語",
  },
  {
    en: "inquire",
    ja: "尋ねる",
    sentence:
      "She called the airline to inquire about the possibility of changing her flight to an earlier departure.",
    stage: 18,
    category: "英単語",
  },
  { en: "pace", ja: "歩調", sentence: "He works at a fast pace.", stage: 18 },
  // Stage 19
  { en: "assist", ja: "手伝う", sentence: "I will assist you.", stage: 19 },
  {
    en: "compete",
    ja: "競争する",
    sentence:
      "Dozens of talented athletes from around the world will compete in the final round of the championship.",
    stage: 19,
    category: "英単語",
  },
  {
    en: "debate",
    ja: "論争",
    sentence:
      "A fierce and passionate debate took place in parliament over the proposed changes to immigration policy.",
    stage: 19,
    category: "英単語",
  },
  {
    en: "frequency",
    ja: "頻度",
    sentence:
      "The frequency of extreme weather events has increased dramatically over the past few decades.",
    stage: 19,
    category: "英単語",
  },
  {
    en: "insist",
    ja: "主張する",
    sentence:
      "Despite all the evidence against him, he continued to insist on his complete innocence throughout the trial.",
    stage: 19,
    category: "英単語",
  },
  {
    en: "panic",
    ja: "パニック",
    sentence:
      "The key to staying safe in an emergency is to stay calm and not panic, even when things seem out of control.",
    stage: 19,
    category: "英単語",
  },
  {
    en: "relieve",
    ja: "和らげる",
    sentence:
      "The doctor prescribed medication to relieve the severe pain the patient had been experiencing for weeks.",
    stage: 19,
    category: "英単語",
  },
  // Stage 20
  {
    en: "associate",
    ja: "結びつける",
    sentence:
      "Many people tend to associate the smell of freshly baked bread with warm childhood memories at home.",
    stage: 20,
    category: "英単語",
  },
  {
    en: "complain",
    ja: "不平を言う",
    sentence:
      "Instead of constantly complaining about the food at the cafeteria, why not write a letter of suggestion?",
    stage: 20,
    category: "英単語",
  },
  {
    en: "decade",
    ja: "10年間",
    sentence:
      "It happened over a decade ago, but the impact of that single event is still felt throughout the country.",
    stage: 20,
    category: "英単語",
  },
  {
    en: "fulfill",
    ja: "果たす",
    sentence:
      "He promised to fulfill every commitment he had made to his team before he retired from the position.",
    stage: 20,
    category: "英単語",
  },
  {
    en: "inspire",
    ja: "奮い立たせる",
    sentence:
      "Her incredible story of survival and recovery inspired thousands of people around the world to never give up.",
    stage: 20,
    category: "英単語",
  },
  {
    en: "paradox",
    ja: "逆説",
    sentence:
      "It is one of the great paradoxes of modern life that people feel more isolated despite being more connected.",
    stage: 20,
    category: "英単語",
  },
  {
    en: "resemble",
    ja: "似ている",
    sentence:
      "The young artist's latest work closely resembles the style of famous impressionist painters of the past.",
    stage: 20,
    category: "英単語",
  },
];

// ─── 熟語リスト (各ステージ8語) ──────────────────────────────────────────────
const DEFAULT_VOCAB_IDIOM = [
  {
    en: "at first glance",
    ja: "一見したところ",
    sentence:
      "At first glance, the math problem looked easy, but it took me an hour to solve.",
    stage: 1,
    category: "熟語",
  },
  {
    en: "by heart",
    ja: "暗記して",
    sentence:
      "She studied so hard that she learned the entire poem by heart before the recital.",
    stage: 1,
    category: "熟語",
  },
  {
    en: "in advance",
    ja: "前もって",
    sentence:
      "If you plan to attend the event, please let me know in advance so I can save you a seat.",
    stage: 1,
    category: "熟語",
  },
  {
    en: "on the other hand",
    ja: "一方では",
    sentence:
      "Studying abroad is exciting; on the other hand, it may be difficult to be away from family.",
    stage: 1,
    category: "熟語",
  },
  {
    en: "take for granted",
    ja: "当然のことと思う",
    sentence:
      "We often take clean water for granted, but many people around the world do not have access to it.",
    stage: 1,
    category: "熟語",
  },
  {
    en: "keep in touch",
    ja: "連絡を取り合う",
    sentence:
      "Even after graduation, let's keep in touch and meet up whenever we can.",
    stage: 1,
    category: "熟語",
  },
  {
    en: "make up one's mind",
    ja: "決心する",
    sentence:
      "After thinking about it for weeks, I finally made up my mind to study abroad next year.",
    stage: 1,
    category: "熟語",
  },
  {
    en: "run out of",
    ja: "〜を使い果たす",
    sentence:
      "We were almost finished with the project, but we ran out of time before the deadline.",
    stage: 1,
    category: "熟語",
  },
  {
    en: "as a result",
    ja: "その結果",
    sentence:
      "He trained every day for months, and as a result, he won the championship tournament.",
    stage: 2,
    category: "熟語",
  },
  {
    en: "be aware of",
    ja: "〜を知っている",
    sentence:
      "When hiking in the mountains, you should always be aware of the danger of sudden weather changes.",
    stage: 2,
    category: "熟語",
  },
  {
    en: "come up with",
    ja: "思いつく",
    sentence:
      "During the team meeting, she came up with a great idea that everyone agreed would solve the problem.",
    stage: 2,
    category: "熟語",
  },
  {
    en: "deal with",
    ja: "〜に対処する",
    sentence:
      "Instead of ignoring the complaint, we must deal with this problem before it gets any worse.",
    stage: 2,
    category: "熟語",
  },
  {
    en: "depend on",
    ja: "〜に頼る",
    sentence:
      "If you want to grow as a person, try not to depend on others to solve all your problems.",
    stage: 2,
    category: "熟語",
  },
  {
    en: "in spite of",
    ja: "〜にもかかわらず",
    sentence:
      "He decided to attend the outdoor festival in spite of the rain and the cold weather.",
    stage: 2,
    category: "熟語",
  },
  {
    en: "look forward to",
    ja: "〜を楽しみにする",
    sentence:
      "I have been so busy lately, but I really look forward to seeing you at the reunion next month.",
    stage: 2,
    category: "熟語",
  },
  {
    en: "set off",
    ja: "出発する",
    sentence:
      "To avoid the traffic jam, we set off at dawn and arrived at the campsite by morning.",
    stage: 2,
    category: "熟語",
  },
  {
    en: "carry out",
    ja: "実行する",
    sentence:
      "Despite facing many obstacles, he successfully carried out the plan exactly as the team had agreed.",
    stage: 3,
    category: "熟語",
  },
  {
    en: "catch up with",
    ja: "追いつく",
    sentence:
      "I started the race late, but I kept running hard and finally caught up with him near the finish line.",
    stage: 3,
    category: "熟語",
  },
  {
    en: "fall apart",
    ja: "崩壊する",
    sentence:
      "After their best player was injured, the team fell apart and lost every game that followed.",
    stage: 3,
    category: "熟語",
  },
  {
    en: "give up",
    ja: "あきらめる",
    sentence:
      "Even when the situation seems impossible, you should never give up on your dreams.",
    stage: 3,
    category: "熟語",
  },
  {
    en: "hand in",
    ja: "提出する",
    sentence:
      "The teacher reminded the students to hand in their homework before leaving the classroom.",
    stage: 3,
    category: "熟語",
  },
  {
    en: "in terms of",
    ja: "〜の観点から",
    sentence:
      "In terms of cost, this smartphone is much cheaper than the latest model, and the quality is similar.",
    stage: 3,
    category: "熟語",
  },
  {
    en: "lead to",
    ja: "〜につながる",
    sentence:
      "Teachers always say that consistent hard work and dedication lead to success in the long run.",
    stage: 3,
    category: "熟語",
  },
  {
    en: "make sense",
    ja: "意味をなす",
    sentence:
      "After reading the explanation twice, everything finally started to make sense to the students.",
    stage: 3,
    category: "熟語",
  },
  {
    en: "no longer",
    ja: "もはや〜ない",
    sentence:
      "Since I got a new bag as a birthday gift, I no longer need this old one.",
    stage: 4,
    category: "熟語",
  },
  {
    en: "on behalf of",
    ja: "〜を代表して",
    sentence:
      "On behalf of the entire team, I would like to thank everyone for their hard work this year.",
    stage: 4,
    category: "熟語",
  },
  {
    en: "point out",
    ja: "指摘する",
    sentence:
      "The editor carefully read the article and pointed out the mistake in the second paragraph.",
    stage: 4,
    category: "熟語",
  },
  {
    en: "put off",
    ja: "延期する",
    sentence:
      "Because several members were sick, the important meeting was put off until next Monday.",
    stage: 4,
    category: "熟語",
  },
  {
    en: "rather than",
    ja: "〜よりむしろ",
    sentence:
      "Since it was such a nice day, I decided I'd walk to the station rather than drive.",
    stage: 4,
    category: "熟語",
  },
  {
    en: "refer to",
    ja: "〜を参照する",
    sentence:
      "If you are unsure how to set up the device, please refer to the manual that came in the box.",
    stage: 4,
    category: "熟語",
  },
  {
    en: "result in",
    ja: "〜という結果になる",
    sentence:
      "Ignoring the warning signs early on resulted in a complete failure of the entire project.",
    stage: 4,
    category: "熟語",
  },
  {
    en: "so far",
    ja: "これまでのところ",
    sentence:
      "We still have a long way to go, but so far the project has been going quite smoothly.",
    stage: 4,
    category: "熟語",
  },
  {
    en: "take part in",
    ja: "参加する",
    sentence:
      "Despite being nervous, she decided to take part in the school marathon race and finished in third place.",
    stage: 5,
    category: "熟語",
  },
  {
    en: "take place",
    ja: "起こる、行われる",
    sentence:
      "The annual music festival takes place in the park every June, attracting thousands of visitors.",
    stage: 5,
    category: "熟語",
  },
  {
    en: "turn down",
    ja: "断る",
    sentence:
      "Although it was a well-paying job, he turned down the offer because it required him to move overseas.",
    stage: 5,
    category: "熟語",
  },
  {
    en: "used to",
    ja: "かつて〜だった",
    sentence:
      "Before I moved to the city, I used to live in a quiet village surrounded by mountains.",
    stage: 5,
    category: "熟語",
  },
  {
    en: "with regard to",
    ja: "〜に関して",
    sentence:
      "With regard to your question about the schedule, I will send you the details by email tomorrow.",
    stage: 5,
    category: "熟語",
  },
  {
    en: "work out",
    ja: "うまくいく",
    sentence:
      "Even though we had many challenges along the way, everything worked out fine in the end.",
    stage: 5,
    category: "熟語",
  },
  {
    en: "as well as",
    ja: "〜と同様に",
    sentence:
      "She is very talented — she sings beautifully as well as dances with impressive skill.",
    stage: 5,
    category: "熟語",
  },
  {
    en: "at the expense of",
    ja: "〜を犠牲にして",
    sentence:
      "He worked overtime every day to earn more money, but it was at the expense of his health.",
    stage: 5,
    category: "熟語",
  },
  // Stage 6
  {
    en: "make up for",
    ja: "〜を補う・埋め合わせる",
    sentence:
      "She worked extra hours to make up for the time she had missed due to illness.",
    stage: 6,
    category: "熟語",
  },
  {
    en: "put off",
    ja: "〜を延期する",
    sentence:
      "We had to put off the meeting because the manager was stuck in traffic.",
    stage: 6,
    category: "熟語",
  },
  {
    en: "set out",
    ja: "出発する・着手する",
    sentence:
      "The explorers set out early in the morning to reach the mountain before sunset.",
    stage: 6,
    category: "熟語",
  },
  {
    en: "run out of",
    ja: "〜を使い果たす",
    sentence:
      "We ran out of time before we could finish all the questions on the test.",
    stage: 6,
    category: "熟語",
  },
  {
    en: "give in",
    ja: "屈服する・折れる",
    sentence:
      "After hours of negotiation, both sides finally gave in and reached a compromise.",
    stage: 6,
    category: "熟語",
  },
  {
    en: "call off",
    ja: "〜を中止する",
    sentence:
      "The outdoor concert was called off due to the heavy rain forecast for the evening.",
    stage: 6,
    category: "熟語",
  },
  {
    en: "go through",
    ja: "〜を経験する・通り抜ける",
    sentence:
      "She had to go through a long interview process before landing her dream job.",
    stage: 6,
    category: "熟語",
  },
  {
    en: "stand for",
    ja: "〜を表す・支持する",
    sentence:
      "The abbreviation 'UN' stands for United Nations, an international organization.",
    stage: 6,
    category: "熟語",
  },
  // Stage 7
  {
    en: "break down",
    ja: "故障する・崩れる",
    sentence:
      "The car broke down on the highway, so we had to call for emergency assistance.",
    stage: 7,
    category: "熟語",
  },
  {
    en: "come up with",
    ja: "〜を思いつく",
    sentence:
      "The team came up with an innovative idea to solve the problem during the brainstorming session.",
    stage: 7,
    category: "熟語",
  },
  {
    en: "deal with",
    ja: "〜に対処する",
    sentence:
      "A good leader knows how to deal with conflicts among team members effectively.",
    stage: 7,
    category: "熟語",
  },
  {
    en: "end up",
    ja: "結局〜になる",
    sentence:
      "Despite his intention to study medicine, he ended up becoming a successful writer.",
    stage: 7,
    category: "熟語",
  },
  {
    en: "figure out",
    ja: "〜を理解する・解決する",
    sentence:
      "It took me a while to figure out how to use the new software on my computer.",
    stage: 7,
    category: "熟語",
  },
  {
    en: "hand in",
    ja: "〜を提出する",
    sentence:
      "Please hand in your completed assignments by Friday at the latest.",
    stage: 7,
    category: "熟語",
  },
  {
    en: "keep up with",
    ja: "〜に追いつく・ついていく",
    sentence:
      "It is hard to keep up with the rapid advances in technology these days.",
    stage: 7,
    category: "熟語",
  },
  {
    en: "look forward to",
    ja: "〜を楽しみにする",
    sentence:
      "The children were looking forward to the summer vacation with great excitement.",
    stage: 7,
    category: "熟語",
  },
  // Stage 8
  {
    en: "make sure",
    ja: "確認する・確かめる",
    sentence: "Please make sure you lock the door before you leave the office.",
    stage: 8,
    category: "熟語",
  },
  {
    en: "on behalf of",
    ja: "〜を代表して",
    sentence:
      "The CEO spoke on behalf of the entire company at the annual shareholders' meeting.",
    stage: 8,
    category: "熟語",
  },
  {
    en: "pay attention to",
    ja: "〜に注意を払う",
    sentence:
      "You should pay attention to the details when writing a formal business email.",
    stage: 8,
    category: "熟語",
  },
  {
    en: "put up with",
    ja: "〜を我慢する",
    sentence:
      "I cannot put up with the noise from the construction site next door any longer.",
    stage: 8,
    category: "熟語",
  },
  {
    en: "result in",
    ja: "〜という結果になる",
    sentence:
      "The lack of sleep often results in poor concentration and low productivity at work.",
    stage: 8,
    category: "熟語",
  },
  {
    en: "take advantage of",
    ja: "〜を利用する・つけ込む",
    sentence:
      "Students should take advantage of every opportunity to practice speaking English.",
    stage: 8,
    category: "熟語",
  },
  {
    en: "take place",
    ja: "起こる・行われる",
    sentence:
      "The international conference will take place in Tokyo next March.",
    stage: 8,
    category: "熟語",
  },
  {
    en: "turn out",
    ja: "〜であることがわかる",
    sentence:
      "The movie turned out to be much better than I had expected from the trailer.",
    stage: 8,
    category: "熟語",
  },
  // Stage 9
  {
    en: "account for",
    ja: "〜を説明する・占める",
    sentence:
      "Tourism accounts for a large portion of the country's national income.",
    stage: 9,
    category: "熟語",
  },
  {
    en: "be based on",
    ja: "〜に基づいている",
    sentence:
      "This novel is based on a true story that happened during the Second World War.",
    stage: 9,
    category: "熟語",
  },
  {
    en: "bring about",
    ja: "〜をもたらす",
    sentence:
      "The new law brought about significant changes in the way companies report their finances.",
    stage: 9,
    category: "熟語",
  },
  {
    en: "carry out",
    ja: "〜を実行する",
    sentence:
      "The scientist carried out a series of careful experiments to test her hypothesis.",
    stage: 9,
    category: "熟語",
  },
  {
    en: "contribute to",
    ja: "〜に貢献する・一因となる",
    sentence:
      "Regular reading greatly contributes to improving your vocabulary and comprehension.",
    stage: 9,
    category: "熟語",
  },
  {
    en: "depend on",
    ja: "〜に依存する・〜次第だ",
    sentence:
      "The success of the project depends on the cooperation of every team member.",
    stage: 9,
    category: "熟語",
  },
  {
    en: "differ from",
    ja: "〜と異なる",
    sentence:
      "Japanese culture differs greatly from Western culture in many interesting ways.",
    stage: 9,
    category: "熟語",
  },
  {
    en: "focus on",
    ja: "〜に集中する",
    sentence:
      "During the exam period, students should focus on their studies and avoid distractions.",
    stage: 9,
    category: "熟語",
  },
  // Stage 10
  {
    en: "in contrast to",
    ja: "〜と対照的に",
    sentence:
      "In contrast to her elder sister, she was very outgoing and loved meeting new people.",
    stage: 10,
    category: "熟語",
  },
  {
    en: "in terms of",
    ja: "〜の観点から・〜に関して",
    sentence:
      "In terms of cost and efficiency, this new system is far superior to the old one.",
    stage: 10,
    category: "熟語",
  },
  {
    en: "lead to",
    ja: "〜につながる・引き起こす",
    sentence:
      "Lack of exercise and poor diet can lead to serious health problems in the future.",
    stage: 10,
    category: "熟語",
  },
  {
    en: "make sense",
    ja: "意味をなす・理にかなう",
    sentence:
      "The explanation was so clear that everything suddenly made perfect sense to me.",
    stage: 10,
    category: "熟語",
  },
  {
    en: "on the other hand",
    ja: "一方では・他方では",
    sentence:
      "The city is very convenient for work; on the other hand, it can be quite stressful.",
    stage: 10,
    category: "熟語",
  },
  {
    en: "refer to",
    ja: "〜に言及する・参照する",
    sentence:
      "The teacher asked us to refer to chapter five of the textbook for more information.",
    stage: 10,
    category: "熟語",
  },
  {
    en: "rely on",
    ja: "〜に頼る・依存する",
    sentence:
      "You should not rely on others to solve all your problems; try to be independent.",
    stage: 10,
    category: "熟語",
  },
  {
    en: "take into account",
    ja: "〜を考慮する",
    sentence:
      "When planning a trip abroad, you should take into account the local customs and laws.",
    stage: 10,
    category: "熟語",
  },
  // Stage 11
  {
    en: "be aware of",
    ja: "〜に気づいている・知っている",
    sentence:
      "All students should be aware of the rules and regulations of the school.",
    stage: 11,
    category: "熟語",
  },
  {
    en: "be capable of",
    ja: "〜できる・〜の能力がある",
    sentence:
      "With enough practice, every student is capable of mastering a new language.",
    stage: 11,
    category: "熟語",
  },
  {
    en: "be likely to",
    ja: "〜しそうだ・〜の可能性が高い",
    sentence:
      "It is likely to rain this afternoon, so you should bring an umbrella with you.",
    stage: 11,
    category: "熟語",
  },
  {
    en: "be responsible for",
    ja: "〜に責任がある",
    sentence:
      "Each team member is responsible for completing their assigned tasks on time.",
    stage: 11,
    category: "熟語",
  },
  {
    en: "be supposed to",
    ja: "〜することになっている",
    sentence:
      "The meeting is supposed to start at nine, but the manager has not arrived yet.",
    stage: 11,
    category: "熟語",
  },
  {
    en: "be willing to",
    ja: "〜する気がある・厭わない",
    sentence:
      "A good doctor should be willing to listen carefully to every patient's concerns.",
    stage: 11,
    category: "熟語",
  },
  {
    en: "cannot help but",
    ja: "〜せずにはいられない",
    sentence:
      "The movie was so funny that the audience could not help but laugh out loud.",
    stage: 11,
    category: "熟語",
  },
  {
    en: "catch up with",
    ja: "〜に追いつく",
    sentence:
      "After missing several lessons, it took him weeks to catch up with the rest of the class.",
    stage: 11,
    category: "熟語",
  },
  // Stage 12
  {
    en: "cope with",
    ja: "〜に対処する・うまく扱う",
    sentence:
      "Learning to cope with stress is an essential skill for modern working adults.",
    stage: 12,
    category: "熟語",
  },
  {
    en: "devote to",
    ja: "〜に専念する・捧げる",
    sentence:
      "She devoted her entire career to finding a cure for the rare childhood disease.",
    stage: 12,
    category: "熟語",
  },
  {
    en: "due to",
    ja: "〜のために・〜が原因で",
    sentence:
      "The flight was cancelled due to a severe snowstorm that hit the region overnight.",
    stage: 12,
    category: "熟語",
  },
  {
    en: "engage in",
    ja: "〜に従事する・関与する",
    sentence:
      "Students are encouraged to engage in extracurricular activities alongside their studies.",
    stage: 12,
    category: "熟語",
  },
  {
    en: "fall short of",
    ja: "〜に達しない・不足する",
    sentence:
      "Despite their best efforts, the team's performance fell short of the manager's expectations.",
    stage: 12,
    category: "熟語",
  },
  {
    en: "give rise to",
    ja: "〜を引き起こす・生じさせる",
    sentence:
      "The rapid growth of social media has given rise to many new ethical concerns.",
    stage: 12,
    category: "熟語",
  },
  {
    en: "go along with",
    ja: "〜に従う・賛成する",
    sentence:
      "Although he had doubts, he decided to go along with the group's decision.",
    stage: 12,
    category: "熟語",
  },
  {
    en: "hold on to",
    ja: "〜をしっかり持つ・守る",
    sentence:
      "No matter how hard life gets, you should always hold on to your dreams.",
    stage: 12,
    category: "熟語",
  },
  // Stage 13
  {
    en: "in addition to",
    ja: "〜に加えて",
    sentence:
      "In addition to English, she speaks French and German with remarkable fluency.",
    stage: 13,
    category: "熟語",
  },
  {
    en: "in favor of",
    ja: "〜に賛成して・〜を支持して",
    sentence:
      "The majority of the students voted in favor of changing the school uniform policy.",
    stage: 13,
    category: "熟語",
  },
  {
    en: "in spite of",
    ja: "〜にもかかわらず",
    sentence:
      "In spite of the heavy rain, the outdoor festival attracted thousands of visitors.",
    stage: 13,
    category: "熟語",
  },
  {
    en: "insist on",
    ja: "〜を主張する・こだわる",
    sentence:
      "The customer insisted on speaking directly with the manager to resolve the complaint.",
    stage: 13,
    category: "熟語",
  },
  {
    en: "interfere with",
    ja: "〜を妨げる・干渉する",
    sentence:
      "Too much screen time can interfere with children's concentration and sleep quality.",
    stage: 13,
    category: "熟語",
  },
  {
    en: "make a difference",
    ja: "重要な違いをもたらす",
    sentence:
      "Even a small act of kindness can make a big difference in someone's difficult day.",
    stage: 13,
    category: "熟語",
  },
  {
    en: "make it",
    ja: "間に合う・成功する",
    sentence:
      "Despite the traffic, she managed to make it to the station just before the train left.",
    stage: 13,
    category: "熟語",
  },
  {
    en: "on the basis of",
    ja: "〜に基づいて",
    sentence:
      "Decisions should be made on the basis of facts, not personal emotions or preferences.",
    stage: 13,
    category: "熟語",
  },
  // Stage 14
  {
    en: "pass on",
    ja: "〜を伝える・受け継ぐ",
    sentence:
      "Grandparents often pass on traditional values and stories to younger generations.",
    stage: 14,
    category: "熟語",
  },
  {
    en: "point out",
    ja: "〜を指摘する",
    sentence:
      "The editor pointed out several grammatical errors in the manuscript before publishing.",
    stage: 14,
    category: "熟語",
  },
  {
    en: "prior to",
    ja: "〜より前に・〜に先立って",
    sentence:
      "All participants must register online prior to attending the international workshop.",
    stage: 14,
    category: "熟語",
  },
  {
    en: "regardless of",
    ja: "〜にかかわらず",
    sentence:
      "All employees are treated equally regardless of their gender, age, or background.",
    stage: 14,
    category: "熟語",
  },
  {
    en: "respond to",
    ja: "〜に反応する・返答する",
    sentence:
      "The government was slow to respond to the citizens' growing concerns about pollution.",
    stage: 14,
    category: "熟語",
  },
  {
    en: "result from",
    ja: "〜から生じる・〜が原因だ",
    sentence:
      "Many health problems result from poor dietary habits and a sedentary lifestyle.",
    stage: 14,
    category: "熟語",
  },
  {
    en: "be related to",
    ja: "〜と関連している",
    sentence:
      "Research shows that mental health is closely related to the quality of social relationships.",
    stage: 14,
    category: "熟語",
  },
  {
    en: "search for",
    ja: "〜を探す・追求する",
    sentence:
      "Scientists continue to search for effective treatments for currently incurable diseases.",
    stage: 14,
    category: "熟語",
  },
  // Stage 15
  {
    en: "succeed in",
    ja: "〜に成功する",
    sentence:
      "After numerous failed attempts, the team finally succeeded in launching the new product.",
    stage: 15,
    category: "熟語",
  },
  {
    en: "suffer from",
    ja: "〜に苦しむ・悩まされる",
    sentence:
      "Millions of people around the world suffer from depression and anxiety disorders.",
    stage: 15,
    category: "熟語",
  },
  {
    en: "take care of",
    ja: "〜の世話をする",
    sentence:
      "While her parents were abroad, she had to take care of her younger brother alone.",
    stage: 15,
    category: "熟語",
  },
  {
    en: "tend to",
    ja: "〜する傾向がある",
    sentence:
      "People tend to underestimate how much time and effort a new project will actually require.",
    stage: 15,
    category: "熟語",
  },
  {
    en: "think of A as B",
    ja: "AをBだと考える",
    sentence:
      "Many young people think of social media as an essential part of their daily social life.",
    stage: 15,
    category: "熟語",
  },
  {
    en: "to some extent",
    ja: "ある程度は",
    sentence:
      "To some extent, the criticism was fair, but the overall review was too harsh.",
    stage: 15,
    category: "熟語",
  },
  {
    en: "under the circumstances",
    ja: "この状況のもとでは",
    sentence:
      "Under the circumstances, cancelling the event was the most reasonable decision to make.",
    stage: 15,
    category: "熟語",
  },
  {
    en: "vary from A to B",
    ja: "AからBまで様々だ",
    sentence:
      "The climate can vary from very hot summers to extremely cold winters in that region.",
    stage: 15,
    category: "熟語",
  },
  // Stage 16
  {
    en: "with a view to",
    ja: "〜する目的で",
    sentence:
      "The company hired new engineers with a view to expanding its overseas operations.",
    stage: 16,
    category: "熟語",
  },
  {
    en: "work on",
    ja: "〜に取り組む",
    sentence:
      "The research team is currently working on a new vaccine to combat the virus.",
    stage: 16,
    category: "熟語",
  },
  {
    en: "be concerned with",
    ja: "〜に関わる・心配する",
    sentence:
      "This chapter is concerned with the environmental impact of industrial farming.",
    stage: 16,
    category: "熟語",
  },
  {
    en: "be confronted with",
    ja: "〜に直面する",
    sentence:
      "Every day, doctors are confronted with life-and-death decisions in emergency situations.",
    stage: 16,
    category: "熟語",
  },
  {
    en: "be exposed to",
    ja: "〜にさらされる",
    sentence:
      "Children who are exposed to multiple languages from birth tend to be better communicators.",
    stage: 16,
    category: "熟語",
  },
  {
    en: "be faced with",
    ja: "〜に直面する",
    sentence:
      "The city council is faced with the challenge of reducing traffic congestion.",
    stage: 16,
    category: "熟語",
  },
  {
    en: "be fed up with",
    ja: "〜にうんざりしている",
    sentence:
      "Many citizens are fed up with the endless delays in the construction of the new bridge.",
    stage: 16,
    category: "熟語",
  },
  {
    en: "be involved in",
    ja: "〜に関わっている・携わる",
    sentence:
      "All employees are encouraged to be involved in the company's community outreach programs.",
    stage: 16,
    category: "熟語",
  },
  // Stage 17
  {
    en: "be known for",
    ja: "〜で知られている",
    sentence:
      "Japan is known for its unique blend of traditional culture and cutting-edge technology.",
    stage: 17,
    category: "熟語",
  },
  {
    en: "be made up of",
    ja: "〜から構成される",
    sentence:
      "Water is made up of two hydrogen atoms and one oxygen atom bonded together.",
    stage: 17,
    category: "熟語",
  },
  {
    en: "be satisfied with",
    ja: "〜に満足している",
    sentence:
      "The customer was not satisfied with the service and decided to write a complaint letter.",
    stage: 17,
    category: "熟語",
  },
  {
    en: "be subject to",
    ja: "〜の影響を受けやすい・〜に従う",
    sentence:
      "All imported goods are subject to strict customs regulations and taxation.",
    stage: 17,
    category: "熟語",
  },
  {
    en: "come to terms with",
    ja: "〜を受け入れる・折り合いをつける",
    sentence:
      "It took him years to come to terms with the loss of his beloved friend.",
    stage: 17,
    category: "熟語",
  },
  {
    en: "correspond to",
    ja: "〜に対応する・一致する",
    sentence:
      "The map symbols correspond to real geographical features in the landscape.",
    stage: 17,
    category: "熟語",
  },
  {
    en: "derive from",
    ja: "〜から生じる・由来する",
    sentence:
      "Many English words derive from Latin and Greek roots from ancient times.",
    stage: 17,
    category: "熟語",
  },
  {
    en: "distinguish between",
    ja: "〜を区別する",
    sentence:
      "It is important to be able to distinguish between reliable sources and misleading information.",
    stage: 17,
    category: "熟語",
  },
  // Stage 18
  {
    en: "do away with",
    ja: "〜を廃止する・排除する",
    sentence:
      "Many schools are considering doing away with traditional exams in favor of project-based assessment.",
    stage: 18,
    category: "熟語",
  },
  {
    en: "draw attention to",
    ja: "〜に注意を引く",
    sentence:
      "The documentary drew international attention to the serious problem of ocean plastic pollution.",
    stage: 18,
    category: "熟語",
  },
  {
    en: "fall back on",
    ja: "〜に頼る・拠り所にする",
    sentence:
      "When all else fails, he always falls back on his natural talent and creativity.",
    stage: 18,
    category: "熟語",
  },
  {
    en: "go hand in hand",
    ja: "密接に関連している",
    sentence:
      "Economic growth and environmental protection do not always go hand in hand.",
    stage: 18,
    category: "熟語",
  },
  {
    en: "have access to",
    ja: "〜を利用できる・アクセスできる",
    sentence:
      "In rural areas, many people still do not have access to reliable high-speed internet.",
    stage: 18,
    category: "熟語",
  },
  {
    en: "in light of",
    ja: "〜に照らして・〜を考慮して",
    sentence:
      "In light of the new evidence, the judge decided to reopen the investigation.",
    stage: 18,
    category: "熟語",
  },
  {
    en: "keep track of",
    ja: "〜を把握する・記録する",
    sentence:
      "Athletes use wearable devices to keep track of their heart rate and performance data.",
    stage: 18,
    category: "熟語",
  },
  {
    en: "lay emphasis on",
    ja: "〜を強調する",
    sentence:
      "The new curriculum lays great emphasis on developing critical thinking and communication skills.",
    stage: 18,
    category: "熟語",
  },
  // Stage 19
  {
    en: "make the most of",
    ja: "〜を最大限に活かす",
    sentence:
      "You should make the most of every opportunity to practice speaking in front of others.",
    stage: 19,
    category: "熟語",
  },
  {
    en: "narrow down",
    ja: "〜を絞り込む",
    sentence:
      "After discussing the options, the committee was able to narrow down the candidates to three.",
    stage: 19,
    category: "熟語",
  },
  {
    en: "on a large scale",
    ja: "大規模に",
    sentence:
      "The new factory will produce electric vehicles on a large scale starting next year.",
    stage: 19,
    category: "熟語",
  },
  {
    en: "out of the question",
    ja: "不可能だ・問題外だ",
    sentence:
      "Finishing such a complex project in just two days is completely out of the question.",
    stage: 19,
    category: "熟語",
  },
  {
    en: "play a role in",
    ja: "〜において役割を果たす",
    sentence:
      "Education plays a vital role in reducing poverty and promoting social equality.",
    stage: 19,
    category: "熟語",
  },
  {
    en: "put emphasis on",
    ja: "〜を強調する・重視する",
    sentence:
      "The coach puts great emphasis on teamwork and communication during every training session.",
    stage: 19,
    category: "熟語",
  },
  {
    en: "run the risk of",
    ja: "〜のリスクを冒す",
    sentence:
      "Without proper preparation, you run the risk of making serious errors during the presentation.",
    stage: 19,
    category: "熟語",
  },
  {
    en: "shed light on",
    ja: "〜を解明する・明らかにする",
    sentence:
      "The new research sheds light on the complex relationship between diet and mental health.",
    stage: 19,
    category: "熟語",
  },
  // Stage 20
  {
    en: "stand out",
    ja: "目立つ・際立つ",
    sentence:
      "Among all the applicants, her unique portfolio made her stand out to the hiring committee.",
    stage: 20,
    category: "熟語",
  },
  {
    en: "take for granted",
    ja: "〜を当然と思う",
    sentence:
      "We often take clean water and electricity for granted, but many people lack these basics.",
    stage: 20,
    category: "熟語",
  },
  {
    en: "to a great extent",
    ja: "非常に・大きな程度で",
    sentence:
      "The outcome of the project depends to a great extent on the quality of team communication.",
    stage: 20,
    category: "熟語",
  },
  {
    en: "turn to",
    ja: "〜に頼る・向く",
    sentence:
      "When she felt overwhelmed, she always turned to her closest friends for comfort and advice.",
    stage: 20,
    category: "熟語",
  },
  {
    en: "under no circumstances",
    ja: "いかなる状況でも〜しない",
    sentence:
      "Under no circumstances should you share your personal password with anyone else.",
    stage: 20,
    category: "熟語",
  },
  {
    en: "up to date",
    ja: "最新の・現代的な",
    sentence:
      "It is important to keep your computer's security software always up to date.",
    stage: 20,
    category: "熟語",
  },
  {
    en: "with the aim of",
    ja: "〜を目的として",
    sentence:
      "The organization was founded with the aim of providing free education to underprivileged children.",
    stage: 20,
    category: "熟語",
  },
  {
    en: "without fail",
    ja: "必ず・間違いなく",
    sentence:
      "She submits her homework without fail every single week throughout the entire school year.",
    stage: 20,
    category: "熟語",
  },
];

// ─── 漢字リスト (各ステージ8語) ──────────────────────────────────────────────
const DEFAULT_VOCAB_KANJI = [
  {
    en: "河川",
    ja: "かわ、かせん",
    sentence: "河川の水質を守る。",
    stage: 1,
    category: "漢字",
  },
  {
    en: "絵画",
    ja: "えかき、かいが",
    sentence: "絵画を美術館に飾る。",
    stage: 1,
    category: "漢字",
  },
  {
    en: "宣言",
    ja: "せんげん",
    sentence: "独立を宣言する。",
    stage: 1,
    category: "漢字",
  },
  {
    en: "結晶",
    ja: "けっしょう",
    sentence: "雪の結晶は美しい。",
    stage: 1,
    category: "漢字",
  },
  {
    en: "観察",
    ja: "かんさつ",
    sentence: "生物を観察する。",
    stage: 1,
    category: "漢字",
  },
  {
    en: "推移",
    ja: "すいい",
    sentence: "人口の推移を調べる。",
    stage: 1,
    category: "漢字",
  },
  {
    en: "模倣",
    ja: "もほう",
    sentence: "名画を模倣する。",
    stage: 1,
    category: "漢字",
  },
  {
    en: "巨大",
    ja: "きょだい",
    sentence: "巨大な岩山がそびえる。",
    stage: 1,
    category: "漢字",
  },
  {
    en: "寛容",
    ja: "かんよう",
    sentence: "寛容な心を持つ。",
    stage: 2,
    category: "漢字",
  },
  {
    en: "緻密",
    ja: "ちみつ",
    sentence: "緻密な計画を立てる。",
    stage: 2,
    category: "漢字",
  },
  {
    en: "俯瞰",
    ja: "ふかん",
    sentence: "全体を俯瞰する。",
    stage: 2,
    category: "漢字",
  },
  {
    en: "矛盾",
    ja: "むじゅん",
    sentence: "矛盾した発言をする。",
    stage: 2,
    category: "漢字",
  },
  {
    en: "恩恵",
    ja: "おんけい",
    sentence: "自然の恩恵を受ける。",
    stage: 2,
    category: "漢字",
  },
  {
    en: "隆盛",
    ja: "りゅうせい",
    sentence: "産業が隆盛を誇る。",
    stage: 2,
    category: "漢字",
  },
  {
    en: "逆境",
    ja: "ぎゃっきょう",
    sentence: "逆境に負けない。",
    stage: 2,
    category: "漢字",
  },
  {
    en: "冒険",
    ja: "ぼうけん",
    sentence: "未知の土地を冒険する。",
    stage: 2,
    category: "漢字",
  },
  {
    en: "献身",
    ja: "けんしん",
    sentence: "患者に献身的に尽くす。",
    stage: 3,
    category: "漢字",
  },
  {
    en: "悠然",
    ja: "ゆうぜん",
    sentence: "悠然と構えている。",
    stage: 3,
    category: "漢字",
  },
  {
    en: "機微",
    ja: "きび",
    sentence: "人間の機微を知る。",
    stage: 3,
    category: "漢字",
  },
  {
    en: "遍在",
    ja: "へんざい",
    sentence: "神は遍在するとされる。",
    stage: 3,
    category: "漢字",
  },
  {
    en: "体裁",
    ja: "ていさい・たいさい",
    sentence: "体裁を気にする。",
    stage: 3,
    category: "漢字",
  },
  {
    en: "払拭",
    ja: "ふっしょく",
    sentence: "不安を払拭する。",
    stage: 3,
    category: "漢字",
  },
  {
    en: "滋養",
    ja: "じよう",
    sentence: "滋養のある食事をとる。",
    stage: 3,
    category: "漢字",
  },
  {
    en: "倦怠",
    ja: "けんたい",
    sentence: "倦怠感に悩む。",
    stage: 3,
    category: "漢字",
  },
  {
    en: "瞬時",
    ja: "しゅんじ",
    sentence: "瞬時に判断する。",
    stage: 4,
    category: "漢字",
  },
  {
    en: "旺盛",
    ja: "おうせい",
    sentence: "旺盛な食欲を持つ。",
    stage: 4,
    category: "漢字",
  },
  {
    en: "憐憫",
    ja: "れんびん",
    sentence: "憐憫の情を示す。",
    stage: 4,
    category: "漢字",
  },
  {
    en: "叡智",
    ja: "えいち",
    sentence: "先人の叡智に学ぶ。",
    stage: 4,
    category: "漢字",
  },
  {
    en: "邁進",
    ja: "まいしん",
    sentence: "目標に向かって邁進する。",
    stage: 4,
    category: "漢字",
  },
  {
    en: "殊勝",
    ja: "しゅしょう",
    sentence: "殊勝な態度だ。",
    stage: 4,
    category: "漢字",
  },
  {
    en: "喚起",
    ja: "かんき",
    sentence: "注意を喚起する。",
    stage: 4,
    category: "漢字",
  },
  {
    en: "鼓舞",
    ja: "こぶ",
    sentence: "仲間を鼓舞する。",
    stage: 4,
    category: "漢字",
  },
  {
    en: "真摯",
    ja: "しんし",
    sentence: "真摯に向き合う。",
    stage: 5,
    category: "漢字",
  },
  {
    en: "凌駕",
    ja: "りょうが",
    sentence: "ライバルを凌駕する。",
    stage: 5,
    category: "漢字",
  },
  {
    en: "逡巡",
    ja: "しゅんじゅん",
    sentence: "逡巡せず決断する。",
    stage: 5,
    category: "漢字",
  },
  {
    en: "慮外",
    ja: "りょがい",
    sentence: "慮外の事態に備える。",
    stage: 5,
    category: "漢字",
  },
  {
    en: "瑕疵",
    ja: "かし",
    sentence: "瑕疵のない仕事をする。",
    stage: 5,
    category: "漢字",
  },
  {
    en: "蓋然",
    ja: "がいぜん",
    sentence: "蓋然性が高い。",
    stage: 5,
    category: "漢字",
  },
  {
    en: "畢竟",
    ja: "ひっきょう",
    sentence: "畢竟、努力が大切だ。",
    stage: 5,
    category: "漢字",
  },
  {
    en: "截然",
    ja: "せつぜん",
    sentence: "截然と区別する。",
    stage: 5,
    category: "漢字",
  },
  // Stage 6
  {
    en: "逡巡",
    ja: "しゅんじゅん",
    sentence: "逡巡せず決断した。",
    stage: 6,
    category: "漢字",
  },
  {
    en: "憂鬱",
    ja: "ゆううつ",
    sentence: "雨の日は憂鬱な気分になる。",
    stage: 6,
    category: "漢字",
  },
  {
    en: "煩悩",
    ja: "ぼんのう",
    sentence: "煩悩を断ち切る修行をした。",
    stage: 6,
    category: "漢字",
  },
  {
    en: "慟哭",
    ja: "どうこく",
    sentence: "訃報を聞いて慟哭した。",
    stage: 6,
    category: "漢字",
  },
  {
    en: "逼迫",
    ja: "ひっぱく",
    sentence: "財政が逼迫した状況にある。",
    stage: 6,
    category: "漢字",
  },
  {
    en: "蹂躙",
    ja: "じゅうりん",
    sentence: "権利を蹂躙された。",
    stage: 6,
    category: "漢字",
  },
  {
    en: "恣意",
    ja: "しい",
    sentence: "恣意的な判断を避ける。",
    stage: 6,
    category: "漢字",
  },
  {
    en: "瞥見",
    ja: "べっけん",
    sentence: "書類を瞥見した。",
    stage: 6,
    category: "漢字",
  },
  // Stage 7
  {
    en: "頽廃",
    ja: "たいはい",
    sentence: "社会の頽廃を嘆く。",
    stage: 7,
    category: "漢字",
  },
  {
    en: "嗜好",
    ja: "しこう",
    sentence: "食の嗜好は人それぞれだ。",
    stage: 7,
    category: "漢字",
  },
  {
    en: "懐柔",
    ja: "かいじゅう",
    sentence: "相手を懐柔する作戦をとった。",
    stage: 7,
    category: "漢字",
  },
  {
    en: "跋扈",
    ja: "ばっこ",
    sentence: "悪習が跋扈している。",
    stage: 7,
    category: "漢字",
  },
  {
    en: "僭越",
    ja: "せんえつ",
    sentence: "僭越ながら意見を述べる。",
    stage: 7,
    category: "漢字",
  },
  {
    en: "矜持",
    ja: "きょうじ",
    sentence: "職人としての矜持を持つ。",
    stage: 7,
    category: "漢字",
  },
  {
    en: "忸怩",
    ja: "じくじ",
    sentence: "忸怩たる思いが残る。",
    stage: 7,
    category: "漢字",
  },
  {
    en: "漸進",
    ja: "ぜんしん",
    sentence: "漸進的な改革を進める。",
    stage: 7,
    category: "漢字",
  },
  // Stage 8
  {
    en: "齟齬",
    ja: "そご",
    sentence: "両者の意見に齟齬が生じた。",
    stage: 8,
    category: "漢字",
  },
  {
    en: "払拭",
    ja: "ふっしょく",
    sentence: "不安を払拭する努力をした。",
    stage: 8,
    category: "漢字",
  },
  {
    en: "辟易",
    ja: "へきえき",
    sentence: "しつこい勧誘に辟易した。",
    stage: 8,
    category: "漢字",
  },
  {
    en: "傍若無人",
    ja: "ぼうじゃくぶじん",
    sentence: "彼の傍若無人な振る舞いに呆れた。",
    stage: 8,
    category: "漢字",
  },
  {
    en: "捏造",
    ja: "ねつぞう",
    sentence: "データを捏造してはならない。",
    stage: 8,
    category: "漢字",
  },
  {
    en: "喧噪",
    ja: "けんそう",
    sentence: "都会の喧噪を離れた。",
    stage: 8,
    category: "漢字",
  },
  {
    en: "卑劣",
    ja: "ひれつ",
    sentence: "卑劣な手段を使った。",
    stage: 8,
    category: "漢字",
  },
  {
    en: "宥恕",
    ja: "ゆうじょ",
    sentence: "過ちを宥恕してもらった。",
    stage: 8,
    category: "漢字",
  },
  // Stage 9
  {
    en: "恬淡",
    ja: "てんたん",
    sentence: "恬淡とした生き方を好む。",
    stage: 9,
    category: "漢字",
  },
  {
    en: "慇懃",
    ja: "いんぎん",
    sentence: "慇懃な態度で接した。",
    stage: 9,
    category: "漢字",
  },
  {
    en: "韜晦",
    ja: "とうかい",
    sentence: "意図的に韜晦した。",
    stage: 9,
    category: "漢字",
  },
  {
    en: "悠然",
    ja: "ゆうぜん",
    sentence: "悠然と構えた態度が印象的だ。",
    stage: 9,
    category: "漢字",
  },
  {
    en: "逓減",
    ja: "ていげん",
    sentence: "収益が逓減傾向にある。",
    stage: 9,
    category: "漢字",
  },
  {
    en: "耽溺",
    ja: "たんでき",
    sentence: "読書に耽溺する日々を過ごした。",
    stage: 9,
    category: "漢字",
  },
  {
    en: "狷介",
    ja: "けんかい",
    sentence: "狷介な性格が災いした。",
    stage: 9,
    category: "漢字",
  },
  {
    en: "邂逅",
    ja: "かいこう",
    sentence: "旅先での邂逅が生涯の友を生んだ。",
    stage: 9,
    category: "漢字",
  },
  // Stage 10
  {
    en: "掣肘",
    ja: "せいちゅう",
    sentence: "上司に掣肘を受けた。",
    stage: 10,
    category: "漢字",
  },
  {
    en: "輻輳",
    ja: "ふくそう",
    sentence: "交通が輻輳する地点だ。",
    stage: 10,
    category: "漢字",
  },
  {
    en: "憔悴",
    ja: "しょうすい",
    sentence: "長い闘病で憔悴した。",
    stage: 10,
    category: "漢字",
  },
  {
    en: "淡泊",
    ja: "たんぱく",
    sentence: "淡泊な味付けが好まれる。",
    stage: 10,
    category: "漢字",
  },
  {
    en: "杜撰",
    ja: "ずさん",
    sentence: "杜撰な計画が失敗を招いた。",
    stage: 10,
    category: "漢字",
  },
  {
    en: "陳腐",
    ja: "ちんぷ",
    sentence: "陳腐な表現を避ける。",
    stage: 10,
    category: "漢字",
  },
  {
    en: "慚愧",
    ja: "ざんき",
    sentence: "慚愧に堪えない失態だった。",
    stage: 10,
    category: "漢字",
  },
  {
    en: "稀有",
    ja: "けう",
    sentence: "稀有な才能の持ち主だ。",
    stage: 10,
    category: "漢字",
  },
  // Stage 11
  {
    en: "欺瞞",
    ja: "ぎまん",
    sentence: "欺瞞に満ちた言葉を信じた。",
    stage: 11,
    category: "漢字",
  },
  {
    en: "呵責",
    ja: "かしゃく",
    sentence: "良心の呵責を感じた。",
    stage: 11,
    category: "漢字",
  },
  {
    en: "詭弁",
    ja: "きべん",
    sentence: "詭弁を弄して言い訳をした。",
    stage: 11,
    category: "漢字",
  },
  {
    en: "懶惰",
    ja: "らんだ",
    sentence: "懶惰な生活を改めた。",
    stage: 11,
    category: "漢字",
  },
  {
    en: "奸智",
    ja: "かんち",
    sentence: "奸智に長けた人物だった。",
    stage: 11,
    category: "漢字",
  },
  {
    en: "逍遥",
    ja: "しょうよう",
    sentence: "公園を逍遥しながら考えた。",
    stage: 11,
    category: "漢字",
  },
  {
    en: "恍惚",
    ja: "こうこつ",
    sentence: "恍惚とした表情を浮かべた。",
    stage: 11,
    category: "漢字",
  },
  {
    en: "蹉跌",
    ja: "さてつ",
    sentence: "計画が蹉跌をきたした。",
    stage: 11,
    category: "漢字",
  },
  // Stage 12
  {
    en: "紆余曲折",
    ja: "うよきょくせつ",
    sentence: "紆余曲折を経て成功した。",
    stage: 12,
    category: "漢字",
  },
  {
    en: "七転八倒",
    ja: "しちてんばっとう",
    sentence: "七転八倒しながら問題を解いた。",
    stage: 12,
    category: "漢字",
  },
  {
    en: "臥薪嘗胆",
    ja: "がしんしょうたん",
    sentence: "臥薪嘗胆の末に雪辱を果たした。",
    stage: 12,
    category: "漢字",
  },
  {
    en: "切磋琢磨",
    ja: "せっさたくま",
    sentence: "互いに切磋琢磨して成長した。",
    stage: 12,
    category: "漢字",
  },
  {
    en: "温故知新",
    ja: "おんこちしん",
    sentence: "温故知新の精神で学ぶ。",
    stage: 12,
    category: "漢字",
  },
  {
    en: "一期一会",
    ja: "いちごいちえ",
    sentence: "一期一会の出会いを大切にする。",
    stage: 12,
    category: "漢字",
  },
  {
    en: "不撓不屈",
    ja: "ふとうふくつ",
    sentence: "不撓不屈の精神で困難を乗り越えた。",
    stage: 12,
    category: "漢字",
  },
  {
    en: "以心伝心",
    ja: "いしんでんしん",
    sentence: "以心伝心で通じ合う二人だ。",
    stage: 12,
    category: "漢字",
  },
  // Stage 13
  {
    en: "無我夢中",
    ja: "むがむちゅう",
    sentence: "無我夢中で作業に没頭した。",
    stage: 13,
    category: "漢字",
  },
  {
    en: "大器晩成",
    ja: "たいきばんせい",
    sentence: "大器晩成型の人物として知られる。",
    stage: 13,
    category: "漢字",
  },
  {
    en: "起死回生",
    ja: "きしかいせい",
    sentence: "起死回生の一手を打った。",
    stage: 13,
    category: "漢字",
  },
  {
    en: "同床異夢",
    ja: "どうしょういむ",
    sentence: "同床異夢の関係が続いた。",
    stage: 13,
    category: "漢字",
  },
  {
    en: "馬耳東風",
    ja: "ばじとうふう",
    sentence: "忠告も馬耳東風だった。",
    stage: 13,
    category: "漢字",
  },
  {
    en: "五里霧中",
    ja: "ごりむちゅう",
    sentence: "五里霧中の状況に陥った。",
    stage: 13,
    category: "漢字",
  },
  {
    en: "付和雷同",
    ja: "ふわらいどう",
    sentence: "付和雷同せず自分の意見を持つ。",
    stage: 13,
    category: "漢字",
  },
  {
    en: "自縄自縛",
    ja: "じじょうじばく",
    sentence: "自縄自縛に陥ってしまった。",
    stage: 13,
    category: "漢字",
  },
  // Stage 14
  {
    en: "喜怒哀楽",
    ja: "きどあいらく",
    sentence: "豊かな喜怒哀楽を表現する。",
    stage: 14,
    category: "漢字",
  },
  {
    en: "因果応報",
    ja: "いんがおうほう",
    sentence: "因果応報で報いを受けた。",
    stage: 14,
    category: "漢字",
  },
  {
    en: "試行錯誤",
    ja: "しこうさくご",
    sentence: "試行錯誤を繰り返して完成させた。",
    stage: 14,
    category: "漢字",
  },
  {
    en: "空前絶後",
    ja: "くうぜんぜつご",
    sentence: "空前絶後の大記録が生まれた。",
    stage: 14,
    category: "漢字",
  },
  {
    en: "前途多難",
    ja: "ぜんとたなん",
    sentence: "前途多難な道のりが待っている。",
    stage: 14,
    category: "漢字",
  },
  {
    en: "八方塞がり",
    ja: "はっぽうふさがり",
    sentence: "八方塞がりの状況から抜け出した。",
    stage: 14,
    category: "漢字",
  },
  {
    en: "我田引水",
    ja: "がでんいんすい",
    sentence: "我田引水な主張に終始した。",
    stage: 14,
    category: "漢字",
  },
  {
    en: "口角泡を飛ばす",
    ja: "こうかくあわをとばす",
    sentence: "議論で口角泡を飛ばして主張した。",
    stage: 14,
    category: "漢字",
  },
  // Stage 15
  {
    en: "朝三暮四",
    ja: "ちょうさんぼし",
    sentence: "朝三暮四の政策に惑わされた。",
    stage: 15,
    category: "漢字",
  },
  {
    en: "呉越同舟",
    ja: "ごえつどうしゅう",
    sentence: "呉越同舟で協力せざるを得なかった。",
    stage: 15,
    category: "漢字",
  },
  {
    en: "杞憂",
    ja: "きゆう",
    sentence: "心配は杞憂に終わった。",
    stage: 15,
    category: "漢字",
  },
  {
    en: "漁夫の利",
    ja: "ぎょふのり",
    sentence: "漁夫の利を得る結果となった。",
    stage: 15,
    category: "漢字",
  },
  {
    en: "蛇足",
    ja: "だそく",
    sentence: "この説明は蛇足だろう。",
    stage: 15,
    category: "漢字",
  },
  {
    en: "矛盾",
    ja: "むじゅん",
    sentence: "矛盾した発言が批判を招いた。",
    stage: 15,
    category: "漢字",
  },
  {
    en: "五十歩百歩",
    ja: "ごじっぽひゃっぽ",
    sentence: "どちらも五十歩百歩の差だ。",
    stage: 15,
    category: "漢字",
  },
  {
    en: "推敲",
    ja: "すいこう",
    sentence: "文章を何度も推敲した。",
    stage: 15,
    category: "漢字",
  },
  // Stage 16
  {
    en: "敷衍",
    ja: "ふえん",
    sentence: "概念を敷衍して説明した。",
    stage: 16,
    category: "漢字",
  },
  {
    en: "瑕疵",
    ja: "かし",
    sentence: "契約の瑕疵を指摘された。",
    stage: 16,
    category: "漢字",
  },
  {
    en: "諧謔",
    ja: "かいぎゃく",
    sentence: "諧謔を交えた演説が受けた。",
    stage: 16,
    category: "漢字",
  },
  {
    en: "闊達",
    ja: "かったつ",
    sentence: "闊達な人柄で慕われた。",
    stage: 16,
    category: "漢字",
  },
  {
    en: "淫靡",
    ja: "いんび",
    sentence: "淫靡な空気が漂っていた。",
    stage: 16,
    category: "漢字",
  },
  {
    en: "冗漫",
    ja: "じょうまん",
    sentence: "冗漫な文章を簡潔にまとめた。",
    stage: 16,
    category: "漢字",
  },
  {
    en: "迂闊",
    ja: "うかつ",
    sentence: "迂闊な発言が誤解を招いた。",
    stage: 16,
    category: "漢字",
  },
  {
    en: "狡猾",
    ja: "こうかつ",
    sentence: "狡猾な手口で騙された。",
    stage: 16,
    category: "漢字",
  },
  // Stage 17
  {
    en: "懐疑",
    ja: "かいぎ",
    sentence: "懐疑的な姿勢で情報を見る。",
    stage: 17,
    category: "漢字",
  },
  {
    en: "錯綜",
    ja: "さくそう",
    sentence: "情報が錯綜して混乱した。",
    stage: 17,
    category: "漢字",
  },
  {
    en: "截取",
    ja: "せっしゅ",
    sentence: "一部を截取して引用した。",
    stage: 17,
    category: "漢字",
  },
  {
    en: "猛省",
    ja: "もうせい",
    sentence: "失敗を受けて猛省した。",
    stage: 17,
    category: "漢字",
  },
  {
    en: "敢然",
    ja: "かんぜん",
    sentence: "敢然と立ち向かった。",
    stage: 17,
    category: "漢字",
  },
  {
    en: "漠然",
    ja: "ばくぜん",
    sentence: "漠然とした不安が続いた。",
    stage: 17,
    category: "漢字",
  },
  {
    en: "悄然",
    ja: "しょうぜん",
    sentence: "悄然と立ち去った。",
    stage: 17,
    category: "漢字",
  },
  {
    en: "截断",
    ja: "せつだん",
    sentence: "問題を截断して整理する。",
    stage: 17,
    category: "漢字",
  },
  // Stage 18
  {
    en: "奔放",
    ja: "ほんぽう",
    sentence: "自由奔放に生きた人物だ。",
    stage: 18,
    category: "漢字",
  },
  {
    en: "逸脱",
    ja: "いつだつ",
    sentence: "規範から逸脱した行動をとった。",
    stage: 18,
    category: "漢字",
  },
  {
    en: "凡庸",
    ja: "ぼんよう",
    sentence: "凡庸な発想では通用しない。",
    stage: 18,
    category: "漢字",
  },
  {
    en: "顕著",
    ja: "けんちょ",
    sentence: "顕著な成果を上げた。",
    stage: 18,
    category: "漢字",
  },
  {
    en: "逸材",
    ja: "いつざい",
    sentence: "彼は球界の逸材と呼ばれた。",
    stage: 18,
    category: "漢字",
  },
  {
    en: "齟齬",
    ja: "そご",
    sentence: "認識の齟齬を解消した。",
    stage: 18,
    category: "漢字",
  },
  {
    en: "煽情",
    ja: "せんじょう",
    sentence: "煽情的な報道が批判された。",
    stage: 18,
    category: "漢字",
  },
  {
    en: "哀愁",
    ja: "あいしゅう",
    sentence: "哀愁を帯びた旋律が流れた。",
    stage: 18,
    category: "漢字",
  },
  // Stage 19
  {
    en: "簒奪",
    ja: "さんだつ",
    sentence: "権力を簒奪した。",
    stage: 19,
    category: "漢字",
  },
  {
    en: "懐旧",
    ja: "かいきゅう",
    sentence: "懐旧の情に浸った。",
    stage: 19,
    category: "漢字",
  },
  {
    en: "叡智",
    ja: "えいち",
    sentence: "先人の叡智に学ぶ。",
    stage: 19,
    category: "漢字",
  },
  {
    en: "奸佞",
    ja: "かんねい",
    sentence: "奸佞な側近が跋扈した。",
    stage: 19,
    category: "漢字",
  },
  {
    en: "矍鑠",
    ja: "かくしゃく",
    sentence: "九十歳にして矍鑠としている。",
    stage: 19,
    category: "漢字",
  },
  {
    en: "蒙昧",
    ja: "もうまい",
    sentence: "蒙昧な偏見を捨てるべきだ。",
    stage: 19,
    category: "漢字",
  },
  {
    en: "涵養",
    ja: "かんよう",
    sentence: "人格の涵養に努める。",
    stage: 19,
    category: "漢字",
  },
  {
    en: "闡明",
    ja: "せんめい",
    sentence: "真理を闡明した論文だ。",
    stage: 19,
    category: "漢字",
  },
  // Stage 20
  {
    en: "嘉納",
    ja: "かのう",
    sentence: "提案を嘉納してもらった。",
    stage: 20,
    category: "漢字",
  },
  {
    en: "揺曳",
    ja: "ようえい",
    sentence: "煙が揺曳しながら昇った。",
    stage: 20,
    category: "漢字",
  },
  {
    en: "嗤笑",
    ja: "しせん・しょう",
    sentence: "失敗を嗤笑された。",
    stage: 20,
    category: "漢字",
  },
  {
    en: "逍遙",
    ja: "しょうよう",
    sentence: "自然の中を逍遙した。",
    stage: 20,
    category: "漢字",
  },
  {
    en: "傲岸",
    ja: "ごうがん",
    sentence: "傲岸不遜な態度が嫌われた。",
    stage: 20,
    category: "漢字",
  },
  {
    en: "窈窕",
    ja: "ようちょう",
    sentence: "窈窕たる淑女の姿だった。",
    stage: 20,
    category: "漢字",
  },
  {
    en: "蓬髪",
    ja: "ほうはつ",
    sentence: "蓬髪の老人が歩いていた。",
    stage: 20,
    category: "漢字",
  },
  {
    en: "纏綿",
    ja: "てんめん",
    sentence: "纏綿とした情が続いた。",
    stage: 20,
    category: "漢字",
  },
];

// ─── 化学リスト (各ステージ8語) ──────────────────────────────────────────────
const DEFAULT_VOCAB_CHEM = [
  {
    en: "原子",
    ja: "atom：物質の最小単位",
    sentence: "物質は原子から成り、原子が結びついて分子ができる。",
    stage: 1,
    category: "化学",
  },
  {
    en: "分子",
    ja: "molecule：原子が結合した粒子",
    sentence: "水の分子はH₂Oで、酸素原子1つと水素原子2つが結合する。",
    stage: 1,
    category: "化学",
  },
  {
    en: "イオン",
    ja: "ion：電荷を帯びた粒子",
    sentence: "塩化ナトリウムはイオン結晶で、Na⁺とCl⁻が規則正しく並ぶ。",
    stage: 1,
    category: "化学",
  },
  {
    en: "元素",
    ja: "element：同じ原子番号の原子の総称",
    sentence: "元素記号Hは水素を表し、元素周期表の1番目に位置する。",
    stage: 1,
    category: "化学",
  },
  {
    en: "化合物",
    ja: "compound：複数の元素から成る物質",
    sentence: "食塩（NaCl）は塩素と金属の化合物で、水に溶けてイオンになる。",
    stage: 1,
    category: "化学",
  },
  {
    en: "酸化",
    ja: "oxidation：酸素と結合または電子を失う反応",
    sentence: "鉄が酸化すると酸化鉄（さび）が生じ、質量が増加する。",
    stage: 1,
    category: "化学",
  },
  {
    en: "還元",
    ja: "reduction：酸素を失うか電子を得る反応",
    sentence: "酸化銅を炭素で加熱すると還元され、銅が得られる。",
    stage: 1,
    category: "化学",
  },
  {
    en: "電解質",
    ja: "electrolyte：水に溶けてイオンになる物質",
    sentence: "塩化ナトリウムは電解質で、水に溶かすと電流が流れる。",
    stage: 1,
    category: "化学",
  },
  {
    en: "共有結合",
    ja: "covalent bond：電子対を共有する結合",
    sentence: "水分子では共有結合により酸素と水素が電子対を共有している。",
    stage: 2,
    category: "化学",
  },
  {
    en: "イオン結合",
    ja: "ionic bond：陽・陰イオン間の静電引力",
    sentence: "NaClはNa⁺とCl⁻がイオン結合して結晶を形成する。",
    stage: 2,
    category: "化学",
  },
  {
    en: "金属結合",
    ja: "metallic bond：自由電子による結合",
    sentence: "金属結合では自由電子が金属全体を結びつけて電気を通す。",
    stage: 2,
    category: "化学",
  },
  {
    en: "pH",
    ja: "水素イオン指数：酸性度を示す値（0〜14）",
    sentence: "pH7が中性で、それより小さいと酸性、大きいと塩基性となる。",
    stage: 2,
    category: "化学",
  },
  {
    en: "触媒",
    ja: "catalyst：反応速度を変えるが自身は変化しない物質",
    sentence: "白金触媒は水素の燃焼を促進するが、触媒自身は消費されない。",
    stage: 2,
    category: "化学",
  },
  {
    en: "電気陰性度",
    ja: "electronegativity：原子が電子を引きつける力",
    sentence: "フッ素の電気陰性度は最大（4.0）で、最も強く電子を引きつける。",
    stage: 2,
    category: "化学",
  },
  {
    en: "モル",
    ja: "mole：物質量の単位（6.02×10²³個）",
    sentence: "1モルの水は18gで、6.02×10²³個の水分子を含む。",
    stage: 2,
    category: "化学",
  },
  {
    en: "中和",
    ja: "neutralization：酸と塩基が反応して塩と水ができる",
    sentence: "塩酸と水酸化ナトリウムが中和すると食塩と水が生じる。",
    stage: 2,
    category: "化学",
  },
  {
    en: "酸化数",
    ja: "oxidation number：原子の形式的な電荷",
    sentence: "酸化数が増加する変化を酸化、減少する変化を還元という。",
    stage: 3,
    category: "化学",
  },
  {
    en: "電気分解",
    ja: "electrolysis：電流で化学変化を起こすこと",
    sentence: "水を電気分解すると陰極から水素、陽極から酸素が発生する。",
    stage: 3,
    category: "化学",
  },
  {
    en: "半反応式",
    ja: "half-reaction：酸化・還元を別々に表した式",
    sentence: "半反応式を組み合わせるとイオン反応式中の電子数が確認できる。",
    stage: 3,
    category: "化学",
  },
  {
    en: "緩衝液",
    ja: "buffer solution：pHの変化を抑える溶液",
    sentence: "血液は緩衝液として働き、体内のpHをほぼ7.4に保っている。",
    stage: 3,
    category: "化学",
  },
  {
    en: "コロイド",
    ja: "colloid / 分散系の一種",
    sentence: "牛乳はコロイドの例。",
    stage: 3,
    category: "化学",
  },
  {
    en: "ル・シャトリエ",
    ja: "Le Chatelier's principle",
    sentence: "平衡移動の原理を適用する。",
    stage: 3,
    category: "化学",
  },
  {
    en: "アボガドロ定数",
    ja: "Avogadro's number",
    sentence: "6.02×10²³がアボガドロ定数。",
    stage: 3,
    category: "化学",
  },
  {
    en: "蒸気圧",
    ja: "vapor pressure：液体が蒸発しようとする圧力",
    sentence:
      "温度が上昇すると蒸気圧が増し、蒸気圧が大気圧と等しくなる温度が沸点となる。",
    stage: 3,
    category: "化学",
  },
  {
    en: "ヘスの法則",
    ja: "Hess's law：反応経路によらず反応熱は一定",
    sentence: "ヘスの法則より、途中の経路を変えても全体の反応熱は同じになる。",
    stage: 4,
    category: "化学",
  },
  {
    en: "ファラデー定数",
    ja: "Faraday constant：電気量と物質量の関係定数（96500 C/mol）",
    sentence:
      "ファラデー定数96500 C/molを使い、電気分解で析出する物質量を計算する。",
    stage: 4,
    category: "化学",
  },
  {
    en: "気体の状態方程式",
    ja: "ideal gas law：PV=nRTで気体の状態を表す式",
    sentence:
      "気体の状態方程式PV=nRTで、温度・圧力・体積・物質量の関係を求める。",
    stage: 4,
    category: "化学",
  },
  {
    en: "浸透圧",
    ja: "osmotic pressure：半透膜を通じて生じる圧力差",
    sentence: "植物の細胞は浸透圧の差により水を吸収・放出して体積を調節する。",
    stage: 4,
    category: "化学",
  },
  {
    en: "電池",
    ja: "electrochemical cell：化学エネルギーを電気に変換する装置",
    sentence:
      "ダニエル電池では亜鉛が負極、銅が正極として化学エネルギーを電気に変える。",
    stage: 4,
    category: "化学",
  },
  {
    en: "酸塩基平衡",
    ja: "acid-base equilibrium：弱酸・弱塩基の電離平衡",
    sentence: "酢酸水溶液では酸塩基平衡が成立し、Ka値でその電離度が表される。",
    stage: 4,
    category: "化学",
  },
  {
    en: "溶解平衡",
    ja: "dissolution equilibrium：難溶塩が溶ける限界を表す平衡",
    sentence:
      "溶解平衡の溶解積Kspを使い、AgClがほとんど水に溶けないことを示す。",
    stage: 4,
    category: "化学",
  },
  {
    en: "沸点上昇",
    ja: "boiling point elevation：溶質を溶かすと沸点が高くなる現象",
    sentence:
      "食塩水は純水より沸点が高く、これを沸点上昇という束一的性質の一つ。",
    stage: 4,
    category: "化学",
  },
  {
    en: "凝固点降下",
    ja: "freezing point depression",
    sentence: "塩をまくと氷が溶ける。",
    stage: 5,
    category: "化学",
  },
  {
    en: "分子量",
    ja: "molecular weight：分子を構成する原子量の総和",
    sentence: "水（H₂O）の分子量は18で、1mol=18gとして物質量の計算に使う。",
    stage: 5,
    category: "化学",
  },
  {
    en: "原子量",
    ja: "atomic weight：各元素の平均相対質量",
    sentence: "炭素の原子量は12で、各元素の原子量から化合物の分子量を求める。",
    stage: 5,
    category: "化学",
  },
  {
    en: "酸化還元滴定",
    ja: "redox titration：酸化還元反応を用いた滴定",
    sentence: "酸化還元滴定で過マンガン酸カリウム溶液の濃度を標定する。",
    stage: 5,
    category: "化学",
  },
  {
    en: "クロマトグラフィー",
    ja: "chromatography：物質の移動速度差による分離法",
    sentence:
      "クロマトグラフィーで色素混合物を展開すると成分ごとに分離できる。",
    stage: 5,
    category: "化学",
  },
  {
    en: "同位体",
    ja: "isotope：陽子数が同じで中性子数の異なる原子",
    sentence:
      "炭素14は放射性同位体で、年代測定（放射性炭素年代測定）に利用される。",
    stage: 5,
    category: "化学",
  },
  {
    en: "錯体",
    ja: "complex：金属イオンに配位子が結合した化合物",
    sentence: "銅イオンにアンモニアが配位した錯体を生成すると深青色を呈する。",
    stage: 5,
    category: "化学",
  },
  {
    en: "有機化合物",
    ja: "organic compound：炭素骨格を持つ化合物の総称",
    sentence:
      "アルコールやタンパク質など炭素を骨格とする有機化合物は生命に不可欠だ。",
    stage: 5,
    category: "化学",
  },
  // Stage 6
  {
    en: "共有結合",
    ja: "covalent bond：電子対を共有する結合",
    sentence:
      "水素分子H₂は2つの水素原子が電子対を共有する共有結合でできている。",
    stage: 6,
    category: "化学",
  },
  {
    en: "イオン結合",
    ja: "ionic bond：陽イオンと陰イオンの静電引力",
    sentence: "食塩NaClはNa⁺とCl⁻がイオン結合した典型的なイオン結晶だ。",
    stage: 6,
    category: "化学",
  },
  {
    en: "金属結合",
    ja: "metallic bond：自由電子による結合",
    sentence: "銅は金属結合により自由電子が動けるため電気をよく導く。",
    stage: 6,
    category: "化学",
  },
  {
    en: "水素結合",
    ja: "hydrogen bond：F・O・N間の強い分子間力",
    sentence: "水は水素結合により沸点が高く、氷は液体より密度が低い。",
    stage: 6,
    category: "化学",
  },
  {
    en: "極性",
    ja: "polarity：電荷の偏り",
    sentence: "水分子は極性があるため、イオン性物質をよく溶かす溶媒となる。",
    stage: 6,
    category: "化学",
  },
  {
    en: "電気陰性度",
    ja: "electronegativity：電子を引きつける力",
    sentence: "フッ素は電気陰性度が最も大きい元素で、最も強い酸化剤の一つだ。",
    stage: 6,
    category: "化学",
  },
  {
    en: "分子間力",
    ja: "intermolecular force：分子同士に働く引力",
    sentence: "ファンデルワールス力は分子間力の一種で、無極性分子間にも働く。",
    stage: 6,
    category: "化学",
  },
  {
    en: "結晶格子",
    ja: "crystal lattice：粒子が規則配列した固体構造",
    sentence: "食塩の結晶格子ではNa⁺とCl⁻が交互に規則正しく並んでいる。",
    stage: 6,
    category: "化学",
  },
  // Stage 7
  {
    en: "モル濃度",
    ja: "molar concentration：溶液1Lあたりの溶質mol数",
    sentence: "1mol/L塩酸は1Lの溶液中に塩化水素が1mol溶けている溶液だ。",
    stage: 7,
    category: "化学",
  },
  {
    en: "質量パーセント濃度",
    ja: "mass percent：溶質の質量/溶液の質量×100",
    sentence: "10%食塩水は溶液100gあたり食塩10gが溶けていることを意味する。",
    stage: 7,
    category: "化学",
  },
  {
    en: "溶解度",
    ja: "solubility：一定温度で溶媒100gに溶ける溶質の最大量",
    sentence: "硝酸カリウムの溶解度は温度が上がると大きく増加する。",
    stage: 7,
    category: "化学",
  },
  {
    en: "飽和溶液",
    ja: "saturated solution：溶質が最大限溶けた溶液",
    sentence: "飽和溶液を冷やすと溶解度が下がり結晶が析出する。",
    stage: 7,
    category: "化学",
  },
  {
    en: "再結晶",
    ja: "recrystallization：溶解度差を利用した精製法",
    sentence: "硝酸カリウムは再結晶により塩化ナトリウムから分離精製できる。",
    stage: 7,
    category: "化学",
  },
  {
    en: "コロイド",
    ja: "colloid：1〜100nmの粒子が分散した系",
    sentence: "牛乳はコロイド溶液で、チンダル現象により光が散乱して見える。",
    stage: 7,
    category: "化学",
  },
  {
    en: "浸透圧",
    ja: "osmotic pressure：半透膜を通した溶媒の移動圧力",
    sentence: "細胞は浸透圧の差により水を取り込んだり放出したりする。",
    stage: 7,
    category: "化学",
  },
  {
    en: "沸点上昇",
    ja: "boiling point elevation：溶質添加による沸点の上昇",
    sentence: "塩を加えた水は沸点上昇により純水より高い温度で沸騰する。",
    stage: 7,
    category: "化学",
  },
  // Stage 8
  {
    en: "凝固点降下",
    ja: "freezing point depression：溶質添加による凝固点の低下",
    sentence: "不凍液にエチレングリコールを加えることで凝固点降下を利用する。",
    stage: 8,
    category: "化学",
  },
  {
    en: "酸化数",
    ja: "oxidation number：原子の酸化の程度を示す数",
    sentence: "マンガン酸カリウムでMnの酸化数は+7で最高酸化状態にある。",
    stage: 8,
    category: "化学",
  },
  {
    en: "半反応式",
    ja: "half-reaction：酸化または還元のみを示す式",
    sentence: "酸化還元反応は半反応式を組み合わせてイオン反応式を導く。",
    stage: 8,
    category: "化学",
  },
  {
    en: "電気分解",
    ja: "electrolysis：電気エネルギーで化学変化を起こす操作",
    sentence: "塩化銅水溶液の電気分解では陰極に銅、陽極に塩素が生じる。",
    stage: 8,
    category: "化学",
  },
  {
    en: "電池",
    ja: "battery：化学エネルギーを電気エネルギーに変換する装置",
    sentence: "ダニエル電池では亜鉛が酸化され、銅イオンが還元される。",
    stage: 8,
    category: "化学",
  },
  {
    en: "イオン化傾向",
    ja: "ionization tendency：金属が陽イオンになりやすい順序",
    sentence: "イオン化傾向が大きい金属ほど酸に溶けやすく腐食しやすい。",
    stage: 8,
    category: "化学",
  },
  {
    en: "不動態",
    ja: "passive state：酸化被膜で内部が保護された状態",
    sentence: "アルミニウムや鉄は濃硝酸中で不動態となり溶けなくなる。",
    stage: 8,
    category: "化学",
  },
  {
    en: "めっき",
    ja: "plating：電気分解で金属表面に薄膜を形成する技術",
    sentence: "銀めっきは電気分解を利用して製品表面に銀の薄膜を形成する。",
    stage: 8,
    category: "化学",
  },
  // Stage 9
  {
    en: "アルカン",
    ja: "alkane：CₙH₂ₙ₊₂の飽和炭化水素",
    sentence: "メタンやエタンはアルカンで、燃焼しやすい無色の気体だ。",
    stage: 9,
    category: "化学",
  },
  {
    en: "アルケン",
    ja: "alkene：C=C二重結合を持つ不飽和炭化水素",
    sentence: "エチレンはアルケンで付加重合によりポリエチレンになる。",
    stage: 9,
    category: "化学",
  },
  {
    en: "アルキン",
    ja: "alkyne：C≡C三重結合を持つ炭化水素",
    sentence: "アセチレンはアルキンで、金属カーバイドと水の反応で生成する。",
    stage: 9,
    category: "化学",
  },
  {
    en: "置換反応",
    ja: "substitution reaction：原子や基が別のものに入れ替わる反応",
    sentence: "メタンと塩素の混合物に光を当てると置換反応が起こる。",
    stage: 9,
    category: "化学",
  },
  {
    en: "付加反応",
    ja: "addition reaction：二重・三重結合に原子が付加する反応",
    sentence: "エチレンに臭素水を加えると付加反応が起こり脱色する。",
    stage: 9,
    category: "化学",
  },
  {
    en: "芳香族",
    ja: "aromatic：ベンゼン環を持つ化合物の総称",
    sentence: "ベンゼンは代表的な芳香族化合物で、特有の臭いと安定性を持つ。",
    stage: 9,
    category: "化学",
  },
  {
    en: "フェノール",
    ja: "phenol：ベンゼン環にOH基が結合した化合物",
    sentence: "フェノールは弱酸性を示し、FeCl₃水溶液で紫色に呈色する。",
    stage: 9,
    category: "化学",
  },
  {
    en: "エステル結合",
    ja: "ester bond：カルボキシル基とヒドロキシル基の縮合結合",
    sentence: "酢酸とエタノールのエステル化により酢酸エチルが生成する。",
    stage: 9,
    category: "化学",
  },
  // Stage 10
  {
    en: "けん化",
    ja: "saponification：エステルをアルカリで加水分解する反応",
    sentence: "油脂をNaOH水溶液でけん化すると石けんとグリセリンが生成する。",
    stage: 10,
    category: "化学",
  },
  {
    en: "アミノ酸",
    ja: "amino acid：アミノ基とカルボキシル基を持つ化合物",
    sentence: "タンパク質はアミノ酸がペプチド結合で連なった高分子化合物だ。",
    stage: 10,
    category: "化学",
  },
  {
    en: "ペプチド結合",
    ja: "peptide bond：アミノ酸のNH₂とCOOHの脱水縮合",
    sentence:
      "ペプチド結合はアミノ酸同士が連結する際に水が脱離して形成される。",
    stage: 10,
    category: "化学",
  },
  {
    en: "変性",
    ja: "denaturation：タンパク質の立体構造が壊れる現象",
    sentence: "卵白を加熱すると変性して固まり元の状態には戻らない。",
    stage: 10,
    category: "化学",
  },
  {
    en: "単糖",
    ja: "monosaccharide：加水分解されない最小の糖",
    sentence: "グルコースとフルクトースは代表的な単糖で分子式C₆H₁₂O₆を持つ。",
    stage: 10,
    category: "化学",
  },
  {
    en: "二糖",
    ja: "disaccharide：単糖2分子が結合した糖",
    sentence: "スクロースは二糖でグルコースとフルクトースが結合している。",
    stage: 10,
    category: "化学",
  },
  {
    en: "多糖",
    ja: "polysaccharide：多数の単糖が結合した高分子糖",
    sentence: "デンプンとセルロースは多糖だがグルコースの結合様式が異なる。",
    stage: 10,
    category: "化学",
  },
  {
    en: "加水分解",
    ja: "hydrolysis：水を加えて結合を切る反応",
    sentence:
      "デンプンは酵素や酸により加水分解されて最終的にグルコースになる。",
    stage: 10,
    category: "化学",
  },
  // Stage 11
  {
    en: "天然ゴム",
    ja: "natural rubber：イソプレンの重合体",
    sentence: "天然ゴムはゴムの木の樹液から得られるイソプレン重合体だ。",
    stage: 11,
    category: "化学",
  },
  {
    en: "合成樹脂",
    ja: "synthetic resin：人工的に合成した高分子材料",
    sentence: "ポリエチレンやPETは代表的な合成樹脂で広く日常に使われる。",
    stage: 11,
    category: "化学",
  },
  {
    en: "縮合重合",
    ja: "condensation polymerization：小分子脱離を伴う重合",
    sentence:
      "ナイロン66は縮合重合によりアジピン酸とヘキサメチレンジアミンから合成される。",
    stage: 11,
    category: "化学",
  },
  {
    en: "付加重合",
    ja: "addition polymerization：二重結合の開裂による重合",
    sentence: "塩化ビニルは付加重合によりポリ塩化ビニル（PVC）になる。",
    stage: 11,
    category: "化学",
  },
  {
    en: "熱可塑性樹脂",
    ja: "thermoplastic resin：加熱で軟化する合成樹脂",
    sentence: "ポリエチレンは熱可塑性樹脂で加熱すると軟化し成形できる。",
    stage: 11,
    category: "化学",
  },
  {
    en: "熱硬化性樹脂",
    ja: "thermosetting resin：加熱で硬化する合成樹脂",
    sentence: "フェノール樹脂は熱硬化性樹脂で一度固まると再び軟化しない。",
    stage: 11,
    category: "化学",
  },
  {
    en: "イオン交換樹脂",
    ja: "ion exchange resin：イオンを交換できる合成樹脂",
    sentence: "イオン交換樹脂は純水製造や水の軟化処理に広く利用される。",
    stage: 11,
    category: "化学",
  },
  {
    en: "生分解性プラスチック",
    ja: "biodegradable plastic：微生物で分解されるプラスチック",
    sentence: "生分解性プラスチックは環境負荷低減のため開発が進んでいる。",
    stage: 11,
    category: "化学",
  },
  // Stage 12
  {
    en: "反応速度",
    ja: "reaction rate：単位時間あたりの濃度変化",
    sentence: "反応速度は温度が上がると一般に大きくなる。",
    stage: 12,
    category: "化学",
  },
  {
    en: "活性化エネルギー",
    ja: "activation energy：反応が起こるために必要な最小エネルギー",
    sentence: "触媒は活性化エネルギーを下げることで反応を促進する。",
    stage: 12,
    category: "化学",
  },
  {
    en: "触媒",
    ja: "catalyst：自身は変化せず反応速度を変える物質",
    sentence: "白金は水素と酸素の反応を促進する優れた触媒として知られる。",
    stage: 12,
    category: "化学",
  },
  {
    en: "化学平衡",
    ja: "chemical equilibrium：正逆反応速度が等しい状態",
    sentence: "可逆反応では一定条件下で化学平衡の状態に達する。",
    stage: 12,
    category: "化学",
  },
  {
    en: "ルシャトリエの原理",
    ja: "Le Chatelier's principle：平衡移動の方向を予測する原理",
    sentence:
      "ルシャトリエの原理により圧力増加で気体分子数減少側に平衡移動する。",
    stage: 12,
    category: "化学",
  },
  {
    en: "電離平衡",
    ja: "ionic equilibrium：弱電解質の電離の平衡",
    sentence: "酢酸水溶液では電離平衡が成り立ち一部だけがイオンになる。",
    stage: 12,
    category: "化学",
  },
  {
    en: "緩衝液",
    ja: "buffer solution：pH変化を小さく保つ溶液",
    sentence: "血液は炭酸と炭酸水素イオンからなる緩衝液としてpHを保つ。",
    stage: 12,
    category: "化学",
  },
  {
    en: "溶解度積",
    ja: "solubility product：難溶性塩の溶解平衡定数",
    sentence: "塩化銀の溶解度積は非常に小さく水にほとんど溶けない。",
    stage: 12,
    category: "化学",
  },
  // Stage 13
  {
    en: "熱化学方程式",
    ja: "thermochemical equation：熱量変化を含む化学反応式",
    sentence: "熱化学方程式では反応熱をkJで示し発熱は正、吸熱は負で表す。",
    stage: 13,
    category: "化学",
  },
  {
    en: "ヘスの法則",
    ja: "Hess's law：反応熱は経路によらず一定",
    sentence: "ヘスの法則により直接測定困難な反応熱も計算で求められる。",
    stage: 13,
    category: "化学",
  },
  {
    en: "生成熱",
    ja: "heat of formation：単体から化合物1molを生成する熱",
    sentence: "水の生成熱は286kJで水素と酸素から水ができるとき発生する。",
    stage: 13,
    category: "化学",
  },
  {
    en: "燃焼熱",
    ja: "heat of combustion：物質1molが完全燃焼する熱",
    sentence: "メタンの燃焼熱は890kJで天然ガスの主成分として重要だ。",
    stage: 13,
    category: "化学",
  },
  {
    en: "中和熱",
    ja: "heat of neutralization：酸と塩基の中和で発生する熱",
    sentence: "強酸強塩基の中和熱は水1molあたり約57kJで一定だ。",
    stage: 13,
    category: "化学",
  },
  {
    en: "溶解熱",
    ja: "heat of dissolution：物質1molが溶解する際の熱",
    sentence: "水酸化ナトリウムの溶解熱は大きく水に溶かすと発熱する。",
    stage: 13,
    category: "化学",
  },
  {
    en: "結合エネルギー",
    ja: "bond energy：共有結合1molを切るのに必要なエネルギー",
    sentence: "結合エネルギーを使って反応熱を計算することができる。",
    stage: 13,
    category: "化学",
  },
  {
    en: "エンタルピー",
    ja: "enthalpy：定圧条件での熱含量",
    sentence: "発熱反応ではエンタルピー変化ΔHは負の値をとる。",
    stage: 13,
    category: "化学",
  },
  // Stage 14
  {
    en: "族",
    ja: "group：周期表の縦の列",
    sentence: "同族元素は最外殻電子数が同じで化学的性質が似ている。",
    stage: 14,
    category: "化学",
  },
  {
    en: "周期",
    ja: "period：周期表の横の行",
    sentence: "同周期の元素は左から右に進むにつれ原子番号が増加する。",
    stage: 14,
    category: "化学",
  },
  {
    en: "典型元素",
    ja: "main group element：1・2族と12〜18族の元素",
    sentence: "典型元素は族番号と最外殻電子数が規則的に対応している。",
    stage: 14,
    category: "化学",
  },
  {
    en: "遷移元素",
    ja: "transition element：3〜11族の元素",
    sentence: "遷移元素は複数の酸化数をとり有色の化合物を形成しやすい。",
    stage: 14,
    category: "化学",
  },
  {
    en: "アルカリ金属",
    ja: "alkali metal：1族の金属元素（Li・Na・K等）",
    sentence: "アルカリ金属は水と激しく反応し水素を発生させる。",
    stage: 14,
    category: "化学",
  },
  {
    en: "ハロゲン",
    ja: "halogen：17族の非金属元素（F・Cl・Br・I）",
    sentence: "ハロゲンは電気陰性度が高く酸化力が強い非金属元素だ。",
    stage: 14,
    category: "化学",
  },
  {
    en: "希ガス",
    ja: "noble gas：18族の安定な単原子分子気体",
    sentence: "希ガスは最外殻電子が満たされ化学的に非常に安定だ。",
    stage: 14,
    category: "化学",
  },
  {
    en: "イオン化エネルギー",
    ja: "ionization energy：原子から電子1個を取り除くエネルギー",
    sentence: "イオン化エネルギーは同周期では希ガスが最大となる傾向がある。",
    stage: 14,
    category: "化学",
  },
  // Stage 15
  {
    en: "電子親和力",
    ja: "electron affinity：原子が電子1個を受け取る際のエネルギー",
    sentence: "ハロゲンは電子親和力が大きく陰イオンになりやすい。",
    stage: 15,
    category: "化学",
  },
  {
    en: "原子半径",
    ja: "atomic radius：原子の大きさの目安",
    sentence: "同族では原子番号が増えると原子半径が大きくなる傾向がある。",
    stage: 15,
    category: "化学",
  },
  {
    en: "同素体",
    ja: "allotrope：同じ元素からなる異なる単体",
    sentence: "ダイヤモンドと黒鉛は炭素の同素体で性質が大きく異なる。",
    stage: 15,
    category: "化学",
  },
  {
    en: "同位体",
    ja: "isotope：同じ原子番号で質量数が異なる原子",
    sentence: "水素の同位体には軽水素・重水素・三重水素がある。",
    stage: 15,
    category: "化学",
  },
  {
    en: "放射性同位体",
    ja: "radioactive isotope：放射線を放出する不安定な同位体",
    sentence: "炭素14は放射性同位体で年代測定に利用される。",
    stage: 15,
    category: "化学",
  },
  {
    en: "核反応",
    ja: "nuclear reaction：原子核の変換を伴う反応",
    sentence: "ウランの核分裂は核反応の一種で膨大なエネルギーを放出する。",
    stage: 15,
    category: "化学",
  },
  {
    en: "半減期",
    ja: "half-life：放射性同位体の量が半分になるまでの時間",
    sentence: "炭素14の半減期は約5730年で年代測定に使われる。",
    stage: 15,
    category: "化学",
  },
  {
    en: "質量欠損",
    ja: "mass defect：核子が結合する際に減少する質量",
    sentence:
      "質量欠損はアインシュタインのE=mc²により結合エネルギーに変換される。",
    stage: 15,
    category: "化学",
  },
  // Stage 16
  {
    en: "アルデヒド",
    ja: "aldehyde：末端にCHO基を持つ化合物",
    sentence: "アセトアルデヒドは銀鏡反応や赤色沈殿反応を示す還元性化合物だ。",
    stage: 16,
    category: "化学",
  },
  {
    en: "ケトン",
    ja: "ketone：炭素鎖中にC=O基を持つ化合物",
    sentence: "アセトンは代表的なケトンで有機溶媒として広く使われる。",
    stage: 16,
    category: "化学",
  },
  {
    en: "カルボン酸",
    ja: "carboxylic acid：COOHを持つ酸性有機化合物",
    sentence: "酢酸は代表的なカルボン酸で弱酸性を示す。",
    stage: 16,
    category: "化学",
  },
  {
    en: "アミン",
    ja: "amine：NH₂基を持つ有機化合物",
    sentence: "アニリンは芳香族アミンで弱塩基性を示す。",
    stage: 16,
    category: "化学",
  },
  {
    en: "光学異性体",
    ja: "optical isomer：鏡像関係にある立体異性体",
    sentence: "アミノ酸の多くは光学異性体を持ち生体では一方のみ利用される。",
    stage: 16,
    category: "化学",
  },
  {
    en: "構造異性体",
    ja: "structural isomer：分子式が同じで構造が異なる化合物",
    sentence: "ブタンと2-メチルプロパンは構造異性体の関係にある。",
    stage: 16,
    category: "化学",
  },
  {
    en: "シス・トランス異性体",
    ja: "cis-trans isomer：二重結合周りの幾何異性体",
    sentence: "2-ブテンにはシスとトランスの幾何異性体が存在する。",
    stage: 16,
    category: "化学",
  },
  {
    en: "官能基",
    ja: "functional group：化合物の化学的性質を決める原子団",
    sentence: "ヒドロキシル基OHはアルコールに共通する官能基だ。",
    stage: 16,
    category: "化学",
  },
  // Stage 17
  {
    en: "酸化還元電位",
    ja: "redox potential：酸化還元反応の起こりやすさの尺度",
    sentence: "標準酸化還元電位が大きいほど酸化剤として強力だ。",
    stage: 17,
    category: "化学",
  },
  {
    en: "オストワルト法",
    ja: "Ostwald process：アンモニアから硝酸を製造する方法",
    sentence: "オストワルト法ではアンモニアを酸化してNOを経て硝酸を得る。",
    stage: 17,
    category: "化学",
  },
  {
    en: "ハーバー・ボッシュ法",
    ja: "Haber-Bosch process：窒素と水素からアンモニアを合成",
    sentence: "ハーバー・ボッシュ法は窒素固定の工業的手法でFe触媒を使う。",
    stage: 17,
    category: "化学",
  },
  {
    en: "接触法",
    ja: "contact process：SO₂を酸化しSOを経て硫酸を製造する方法",
    sentence: "接触法ではV₂O₅触媒を用いてSO₂からSO₃を生成する。",
    stage: 17,
    category: "化学",
  },
  {
    en: "ソルベー法",
    ja: "Solvay process：炭酸ナトリウムを工業的に製造する方法",
    sentence: "ソルベー法ではアンモニアと二酸化炭素を塩水に吹き込む。",
    stage: 17,
    category: "化学",
  },
  {
    en: "アルミニウムの製錬",
    ja: "aluminium smelting：溶融塩電解でAlを製造する方法",
    sentence:
      "アルミニウムは融解アルミナを電気分解するホール・エルー法で製造する。",
    stage: 17,
    category: "化学",
  },
  {
    en: "鉄の製錬",
    ja: "iron smelting：溶鉱炉でFeを還元する方法",
    sentence: "溶鉱炉で鉄鉱石をコークスで還元して銑鉄を得る。",
    stage: 17,
    category: "化学",
  },
  {
    en: "クロマトグラフィー",
    ja: "chromatography：移動速度の差で混合物を分離する方法",
    sentence: "薄層クロマトグラフィーで色素の成分を分離することができる。",
    stage: 17,
    category: "化学",
  },
  // Stage 18
  {
    en: "DNA",
    ja: "deoxyribonucleic acid：遺伝情報を担う核酸",
    sentence: "DNAは二重らせん構造を持ち塩基の相補的結合で安定する。",
    stage: 18,
    category: "化学",
  },
  {
    en: "RNA",
    ja: "ribonucleic acid：タンパク質合成に関わる核酸",
    sentence: "mRNAはDNAの遺伝情報を転写してリボソームに伝える。",
    stage: 18,
    category: "化学",
  },
  {
    en: "酵素",
    ja: "enzyme：生体触媒として働くタンパク質",
    sentence: "酵素は基質特異性を持ち特定の反応のみを触媒する。",
    stage: 18,
    category: "化学",
  },
  {
    en: "補酵素",
    ja: "coenzyme：酵素の働きを助ける有機化合物",
    sentence: "NADはエネルギー代謝に関わる重要な補酵素の一つだ。",
    stage: 18,
    category: "化学",
  },
  {
    en: "ATP",
    ja: "adenosine triphosphate：細胞のエネルギー通貨",
    sentence: "ATPはアデノシンに3つのリン酸が結合したエネルギー分子だ。",
    stage: 18,
    category: "化学",
  },
  {
    en: "界面活性剤",
    ja: "surfactant：親水基と疎水基を持つ洗浄剤成分",
    sentence: "石けんは界面活性剤で油汚れを水中に分散させて洗浄する。",
    stage: 18,
    category: "化学",
  },
  {
    en: "医薬品合成",
    ja: "pharmaceutical synthesis：化学合成による薬品製造",
    sentence: "アスピリンはサリチル酸と無水酢酸のエステル化で合成できる。",
    stage: 18,
    category: "化学",
  },
  {
    en: "染料と顔料",
    ja: "dye and pigment：物質に色を与える化合物",
    sentence:
      "アゾ染料はジアゾ化とカップリング反応により合成される有機染料だ。",
    stage: 18,
    category: "化学",
  },
  // Stage 19
  {
    en: "超臨界流体",
    ja: "supercritical fluid：臨界点以上の温度・圧力の流体",
    sentence: "超臨界CO₂は溶媒として食品のカフェイン除去に利用される。",
    stage: 19,
    category: "化学",
  },
  {
    en: "ナノ材料",
    ja: "nanomaterial：ナノスケールの特性を持つ材料",
    sentence: "カーボンナノチューブはナノ材料で高強度・高導電性を持つ。",
    stage: 19,
    category: "化学",
  },
  {
    en: "フラーレン",
    ja: "fullerene：炭素が球状に結合したC₆₀等の分子",
    sentence: "フラーレンC₆₀はサッカーボール状の炭素同素体だ。",
    stage: 19,
    category: "化学",
  },
  {
    en: "グラフェン",
    ja: "graphene：炭素原子が六角形に並んだ単原子層",
    sentence: "グラフェンは黒鉛の一原子層で優れた電気伝導性を持つ。",
    stage: 19,
    category: "化学",
  },
  {
    en: "太陽電池",
    ja: "solar cell：光エネルギーを電気に変換する素子",
    sentence: "シリコン太陽電池は光起電力効果を利用して発電する。",
    stage: 19,
    category: "化学",
  },
  {
    en: "燃料電池",
    ja: "fuel cell：水素と酸素の反応で発電する電池",
    sentence: "燃料電池は水素と酸素から電気を取り出し排出物は水のみだ。",
    stage: 19,
    category: "化学",
  },
  {
    en: "二次電池",
    ja: "rechargeable battery：繰り返し充放電できる電池",
    sentence:
      "リチウムイオン電池は代表的な二次電池でスマートフォンに使われる。",
    stage: 19,
    category: "化学",
  },
  {
    en: "有機EL",
    ja: "organic electroluminescence：有機化合物を使った発光素子",
    sentence:
      "有機ELは有機化合物に電流を流すと発光する薄型ディスプレイ素子だ。",
    stage: 19,
    category: "化学",
  },
  // Stage 20
  {
    en: "グリーンケミストリー",
    ja: "green chemistry：環境負荷を減らす化学の取り組み",
    sentence: "グリーンケミストリーは廃棄物削減や再生可能資源の活用を目指す。",
    stage: 20,
    category: "化学",
  },
  {
    en: "触媒設計",
    ja: "catalyst design：目的反応に最適な触媒の開発",
    sentence:
      "ゼオライトは分子ふるい効果を持つ優れた固体触媒として設計される。",
    stage: 20,
    category: "化学",
  },
  {
    en: "高分子電解質",
    ja: "polyelectrolyte：イオン性基を持つ高分子化合物",
    sentence: "高分子電解質膜は燃料電池のイオン交換膜として重要だ。",
    stage: 20,
    category: "化学",
  },
  {
    en: "分子認識",
    ja: "molecular recognition：特定分子を選択的に識別する現象",
    sentence:
      "クラウンエーテルは特定金属イオンを選択的に取り込む分子認識を示す。",
    stage: 20,
    category: "化学",
  },
  {
    en: "自己組織化",
    ja: "self-assembly：分子が自発的に構造を形成する現象",
    sentence: "脂質二重膜は自己組織化により細胞膜の基本構造を形成する。",
    stage: 20,
    category: "化学",
  },
  {
    en: "キラル触媒",
    ja: "chiral catalyst：光学活性な触媒",
    sentence: "キラル触媒を使うと一方の光学異性体を選択的に合成できる。",
    stage: 20,
    category: "化学",
  },
  {
    en: "フロー合成",
    ja: "flow synthesis：連続流通式の有機合成法",
    sentence: "フロー合成は反応の安全性と効率を高める現代的な化学合成法だ。",
    stage: 20,
    category: "化学",
  },
  {
    en: "コンビナトリアルケミストリー",
    ja: "combinatorial chemistry：大量の化合物を一度に合成・評価する手法",
    sentence:
      "コンビナトリアルケミストリーで新薬候補化合物のスクリーニングを行う。",
    stage: 20,
    category: "化学",
  },
];

// ─── 古文リスト (各ステージ8語) ──────────────────────────────────────────────
const DEFAULT_VOCAB_KOBUN = [
  // Stage 1
  {
    en: "あはれ",
    ja: "しみじみとした感動・情趣",
    sentence: "春の花を見てあはれを感じた。",
    stage: 1,
    category: "古文",
  },
  {
    en: "をかし",
    ja: "趣深い・興味深い",
    sentence: "この景色はをかしとぞ思ふ。",
    stage: 1,
    category: "古文",
  },
  {
    en: "いみじ",
    ja: "非常に・甚だしい・すごい",
    sentence: "いみじく美しき人なり。",
    stage: 1,
    category: "古文",
  },
  {
    en: "めでたし",
    ja: "すばらしい・立派だ",
    sentence: "めでたき歌を詠みたまへり。",
    stage: 1,
    category: "古文",
  },
  {
    en: "あながち",
    ja: "むりやり・強引に",
    sentence: "あながちに頼みたまふ。",
    stage: 1,
    category: "古文",
  },
  {
    en: "おぼし",
    ja: "思われる（尊敬語）",
    sentence: "帝はいかにおぼしめすか。",
    stage: 1,
    category: "古文",
  },
  {
    en: "たまふ",
    ja: "〜なさる（尊敬）／〜ください（謙譲）",
    sentence: "早く来たまへ。",
    stage: 1,
    category: "古文",
  },
  {
    en: "さぶらふ",
    ja: "おそば近くに仕える・「ある」の丁寧語",
    sentence: "御前にさぶらふ女房たち。",
    stage: 1,
    category: "古文",
  },
  // Stage 2
  {
    en: "なほ",
    ja: "やはり・相変わらず",
    sentence: "なほ昔の恋しさは消えず。",
    stage: 2,
    category: "古文",
  },
  {
    en: "やがて",
    ja: "すぐに・そのまま",
    sentence: "やがて立ち去りぬ。",
    stage: 2,
    category: "古文",
  },
  {
    en: "かたじけなし",
    ja: "恐れ多い・もったいない",
    sentence: "かたじけなき御言葉なり。",
    stage: 2,
    category: "古文",
  },
  {
    en: "あさまし",
    ja: "驚きあきれる・嘆かわしい",
    sentence: "あさましきことを聞きたり。",
    stage: 2,
    category: "古文",
  },
  {
    en: "つきづきし",
    ja: "似つかわしい・ふさわしい",
    sentence: "つきづきしき装束にて参れ。",
    stage: 2,
    category: "古文",
  },
  {
    en: "ゆかし",
    ja: "見たい・聞きたい・知りたい",
    sentence: "その歌のゆかしく思はる。",
    stage: 2,
    category: "古文",
  },
  {
    en: "こころもとなし",
    ja: "待ち遠しい・不安だ",
    sentence: "返事のなきがこころもとなし。",
    stage: 2,
    category: "古文",
  },
  {
    en: "むつかし",
    ja: "気味が悪い・やっかいだ",
    sentence: "むつかしき病を得たり。",
    stage: 2,
    category: "古文",
  },
  // Stage 3
  {
    en: "つれなし",
    ja: "平然としている・冷淡だ",
    sentence: "つれなく返事をしたまふ。",
    stage: 3,
    category: "古文",
  },
  {
    en: "ねんごろ",
    ja: "丁寧・親切・熱心",
    sentence: "ねんごろに教へたまへり。",
    stage: 3,
    category: "古文",
  },
  {
    en: "ありがたし",
    ja: "めったにない・珍しい",
    sentence: "ありがたき幸ひなり。",
    stage: 3,
    category: "古文",
  },
  {
    en: "あいなし",
    ja: "つまらない・気にくわない",
    sentence: "あいなきことを言ひける。",
    stage: 3,
    category: "古文",
  },
  {
    en: "なまめかし",
    ja: "優雅だ・上品だ",
    sentence: "なまめかしき姿にて現れぬ。",
    stage: 3,
    category: "古文",
  },
  {
    en: "けしき",
    ja: "様子・表情・気配",
    sentence: "彼のけしきを見て驚きたり。",
    stage: 3,
    category: "古文",
  },
  {
    en: "はかなし",
    ja: "はかない・頼りない・つまらない",
    sentence: "はかなき命を嘆きつ。",
    stage: 3,
    category: "古文",
  },
  {
    en: "まめやか",
    ja: "誠実・真剣・真心のある",
    sentence: "まめやかに仕へたまふ。",
    stage: 3,
    category: "古文",
  },
  // Stage 4
  {
    en: "おろかなり",
    ja: "いい加減だ・なおざりだ",
    sentence: "おろかにも思ひたまはず。",
    stage: 4,
    category: "古文",
  },
  {
    en: "すさまじ",
    ja: "興ざめだ・ひどい",
    sentence: "すさまじきありさまなり。",
    stage: 4,
    category: "古文",
  },
  {
    en: "さながら",
    ja: "そのまま・すべて",
    sentence: "さながら夢のごとし。",
    stage: 4,
    category: "古文",
  },
  {
    en: "あだなり",
    ja: "浮気だ・誠実でない・はかない",
    sentence: "あだなる人の心かな。",
    stage: 4,
    category: "古文",
  },
  {
    en: "いかで",
    ja: "どうにかして・なぜ・どうして",
    sentence: "いかでこの山を越えむ。",
    stage: 4,
    category: "古文",
  },
  {
    en: "かしこし",
    ja: "賢い・恐れ多い・ありがたい",
    sentence: "かしこき御心なり。",
    stage: 4,
    category: "古文",
  },
  {
    en: "らうたし",
    ja: "かわいい・いとおしい",
    sentence: "らうたき子の顔を見る。",
    stage: 4,
    category: "古文",
  },
  {
    en: "みそかなり",
    ja: "ひそかに・こっそり",
    sentence: "みそかに文を送りけり。",
    stage: 4,
    category: "古文",
  },
  // Stage 5
  {
    en: "あぢきなし",
    ja: "つまらない・どうにもならない",
    sentence: "あぢきなき世を嘆きたまふ。",
    stage: 5,
    category: "古文",
  },
  {
    en: "おぼろけ",
    ja: "並々ではない・普通でない",
    sentence: "おぼろけの仲にはあらず。",
    stage: 5,
    category: "古文",
  },
  {
    en: "いとほし",
    ja: "かわいそう・気の毒・いとしい",
    sentence: "いとほしき御様なり。",
    stage: 5,
    category: "古文",
  },
  {
    en: "やをら",
    ja: "静かに・そっと・ゆっくり",
    sentence: "やをら立ちて出でぬ。",
    stage: 5,
    category: "古文",
  },
  {
    en: "をりふし",
    ja: "折々・ちょうどその時",
    sentence: "をりふし風の吹きける。",
    stage: 5,
    category: "古文",
  },
  {
    en: "おどろく",
    ja: "目が覚める・気づく・驚く",
    sentence: "暁におどろきて歌を詠む。",
    stage: 5,
    category: "古文",
  },
  {
    en: "やんごとなし",
    ja: "高貴だ・並並でない・捨てておけない",
    sentence: "やんごとなき御方なり。",
    stage: 5,
    category: "古文",
  },
  {
    en: "さすがに",
    ja: "そうはいってもやはり",
    sentence: "さすがに捨てがたく思ふ。",
    stage: 5,
    category: "古文",
  },
  // Stage 6
  {
    en: "あながち",
    ja: "強引に・むやみに・必ずしも",
    sentence: "あながち無理とは言へぬ。",
    stage: 6,
    category: "古文",
  },
  {
    en: "いとど",
    ja: "いっそう・ますます",
    sentence: "いとど悲しみが増した。",
    stage: 6,
    category: "古文",
  },
  {
    en: "うたて",
    ja: "情けない・嘆かわしい・不快だ",
    sentence: "うたてある様子に心が痛む。",
    stage: 6,
    category: "古文",
  },
  {
    en: "おぼつかなし",
    ja: "はっきりしない・気がかりだ",
    sentence: "消息がなくておぼつかなし。",
    stage: 6,
    category: "古文",
  },
  {
    en: "かたはらいたし",
    ja: "見苦しい・気の毒だ・そばにいて辛い",
    sentence: "その振る舞いはかたはらいたし。",
    stage: 6,
    category: "古文",
  },
  {
    en: "くちをし",
    ja: "残念だ・情けない",
    sentence: "叶はぬ恋をくちをしと嘆く。",
    stage: 6,
    category: "古文",
  },
  {
    en: "こころもとなし",
    ja: "待ち遠しい・不安だ・頼りない",
    sentence: "返事が来ぬままこころもとなし。",
    stage: 6,
    category: "古文",
  },
  {
    en: "さうざうし",
    ja: "物足りない・寂しい",
    sentence: "彼が去ってさうざうしき夜だ。",
    stage: 6,
    category: "古文",
  },
  // Stage 7
  {
    en: "すさまじ",
    ja: "興ざめだ・殺風景だ・凄まじい",
    sentence: "雪の朝のすさまじき景色よ。",
    stage: 7,
    category: "古文",
  },
  {
    en: "つれなし",
    ja: "冷淡だ・平然としている",
    sentence: "つれなき顔で去っていった。",
    stage: 7,
    category: "古文",
  },
  {
    en: "ながむ",
    ja: "物思いにふけりながら眺める",
    sentence: "秋の空をながめて涙した。",
    stage: 7,
    category: "古文",
  },
  {
    en: "なまめかし",
    ja: "優雅だ・色気がある・みずみずしい",
    sentence: "なまめかしき姿の姫君だ。",
    stage: 7,
    category: "古文",
  },
  {
    en: "にほふ",
    ja: "美しく輝く・香る・映える",
    sentence: "桜がにほひわたる春の朝。",
    stage: 7,
    category: "古文",
  },
  {
    en: "ねんごろ",
    ja: "丁寧だ・親切だ・熱心だ",
    sentence: "ねんごろに世話をしてくれた。",
    stage: 7,
    category: "古文",
  },
  {
    en: "はかなし",
    ja: "頼りない・あっけない・無常だ",
    sentence: "はかなき夢のごとき一生だ。",
    stage: 7,
    category: "古文",
  },
  {
    en: "ひがひがし",
    ja: "偏っている・道理に反する",
    sentence: "ひがひがしき意見に従えない。",
    stage: 7,
    category: "古文",
  },
  // Stage 8
  {
    en: "まめなり",
    ja: "誠実だ・真面目だ・実用的だ",
    sentence: "まめなる人を夫に選んだ。",
    stage: 8,
    category: "古文",
  },
  {
    en: "むつかし",
    ja: "うっとうしい・気難しい・複雑だ",
    sentence: "むつかしき御心の君なり。",
    stage: 8,
    category: "古文",
  },
  {
    en: "ゆかし",
    ja: "見たい・聞きたい・知りたい",
    sentence: "奥の部屋がゆかしく思はれた。",
    stage: 8,
    category: "古文",
  },
  {
    en: "らうたし",
    ja: "かわいらしい・いとしい",
    sentence: "らうたき子の寝顔を眺めた。",
    stage: 8,
    category: "古文",
  },
  {
    en: "わびし",
    ja: "つらい・貧しい・落ちぶれた",
    sentence: "わびしき身の上を嘆いた。",
    stage: 8,
    category: "古文",
  },
  {
    en: "いかで",
    ja: "どうして・なんとかして",
    sentence: "いかで会ひたき思ひが募る。",
    stage: 8,
    category: "古文",
  },
  {
    en: "いかに",
    ja: "どのように・どれほど",
    sentence: "いかにかなしきことぞと思ふ。",
    stage: 8,
    category: "古文",
  },
  {
    en: "いさ",
    ja: "さあどうだろう・知らない（打消の応答）",
    sentence: "いさ、知らずとぞ答へける。",
    stage: 8,
    category: "古文",
  },
  // Stage 9
  {
    en: "いみじくも",
    ja: "非常にうまく・的確に",
    sentence: "いみじくも言ひ当てたり。",
    stage: 9,
    category: "古文",
  },
  {
    en: "かく",
    ja: "このように・こうして",
    sentence: "かくのごとき世の中なり。",
    stage: 9,
    category: "古文",
  },
  {
    en: "かたち",
    ja: "容貌・姿・形",
    sentence: "かたちよき人は心もよしと言ふ。",
    stage: 9,
    category: "古文",
  },
  {
    en: "きはめて",
    ja: "非常に・極めて",
    sentence: "きはめて優れた歌人なり。",
    stage: 9,
    category: "古文",
  },
  {
    en: "げに",
    ja: "なるほど・本当に・いかにも",
    sentence: "げに美しき月夜かな。",
    stage: 9,
    category: "古文",
  },
  {
    en: "こそ",
    ja: "〜は（強調の係助詞）〜已然形で結ぶ",
    sentence: "命こそ惜しけれ、名をば惜しまじ。",
    stage: 9,
    category: "古文",
  },
  {
    en: "さ",
    ja: "そのように・そう・その程度",
    sentence: "さばかりの人もなし。",
    stage: 9,
    category: "古文",
  },
  {
    en: "しか",
    ja: "そのように・そうだ（過去の確認）",
    sentence: "しかありけりと語り伝へた。",
    stage: 9,
    category: "古文",
  },
  // Stage 10
  {
    en: "すなはち",
    ja: "すぐに・そのまま・つまり",
    sentence: "すなはちその場を去りにけり。",
    stage: 10,
    category: "古文",
  },
  {
    en: "たまふ",
    ja: "〜なさる・〜くださる（尊敬の補助動詞）",
    sentence: "大君かくのたまひけり。",
    stage: 10,
    category: "古文",
  },
  {
    en: "つゆ",
    ja: "少しも〜ない（下に打消を伴う）",
    sentence: "つゆ疑ひもなく信じた。",
    stage: 10,
    category: "古文",
  },
  {
    en: "なほ",
    ja: "やはり・なおも・さらに",
    sentence: "なほ山里に住みたいと思ふ。",
    stage: 10,
    category: "古文",
  },
  {
    en: "のたまふ",
    ja: "おっしゃる（言ふの尊敬語）",
    sentence: "帝かくのたまひけり。",
    stage: 10,
    category: "古文",
  },
  {
    en: "はた",
    ja: "また・やはり・そのうえ",
    sentence: "はたかかる事もありけりと思ふ。",
    stage: 10,
    category: "古文",
  },
  {
    en: "ほど",
    ja: "程度・時間・距離・〜の間に",
    sentence: "しばしのほどに事が変はりぬ。",
    stage: 10,
    category: "古文",
  },
  {
    en: "まさに",
    ja: "今まさに・ちょうど・正しく",
    sentence: "まさに出でんとするところなり。",
    stage: 10,
    category: "古文",
  },
  // Stage 11
  {
    en: "まし",
    ja: "〜だろうに（反実仮想の助動詞）",
    sentence: "知らずともあらましものを。",
    stage: 11,
    category: "古文",
  },
  {
    en: "めり",
    ja: "〜のようだ・〜らしい（視覚的推量）",
    sentence: "あの方は悲しめりと見えた。",
    stage: 11,
    category: "古文",
  },
  {
    en: "やうやう",
    ja: "だんだんと・しだいに",
    sentence: "夜やうやう明けてゆく空よ。",
    stage: 11,
    category: "古文",
  },
  {
    en: "やがて",
    ja: "すぐに・そのまま・ほどなく",
    sentence: "やがて都に帰りにけり。",
    stage: 11,
    category: "古文",
  },
  {
    en: "よし",
    ja: "由来・手段・方法・知らせ・よい",
    sentence: "そのよし申し上げたり。",
    stage: 11,
    category: "古文",
  },
  {
    en: "らむ",
    ja: "〜ているだろう（現在推量の助動詞）",
    sentence: "今ごろ何をしてゐるらむ。",
    stage: 11,
    category: "古文",
  },
  {
    en: "をり",
    ja: "〜している（存在・継続の補助動詞）",
    sentence: "ものを思ひをりける夜半に。",
    stage: 11,
    category: "古文",
  },
  {
    en: "あはれなり",
    ja: "しみじみとした情趣がある・かわいそうだ",
    sentence: "夕暮れの空のあはれなる色よ。",
    stage: 11,
    category: "古文",
  },
  // Stage 12
  {
    en: "けり",
    ja: "〜た・〜けり（過去・詠嘆の助動詞）",
    sentence: "見れば夢にてありけり。",
    stage: 12,
    category: "古文",
  },
  {
    en: "ぬ",
    ja: "〜た・〜てしまった（完了の助動詞）",
    sentence: "花はすでに散りぬ。",
    stage: 12,
    category: "古文",
  },
  {
    en: "べし",
    ja: "〜はずだ・〜すべきだ（推量・義務）",
    sentence: "かくあるべき定めなり。",
    stage: 12,
    category: "古文",
  },
  {
    en: "む",
    ja: "〜だろう・〜しよう（推量・意志）",
    sentence: "明日は出で立たむとぞ思ふ。",
    stage: 12,
    category: "古文",
  },
  {
    en: "き",
    ja: "〜た（過去の直接経験・助動詞）",
    sentence: "昔かくありきと語り伝へた。",
    stage: 12,
    category: "古文",
  },
  {
    en: "なり（断定）",
    ja: "〜だ・〜である（断定の助動詞）",
    sentence: "これは夢なりけりと思ひぬ。",
    stage: 12,
    category: "古文",
  },
  {
    en: "なり（推量）",
    ja: "〜のようだ・〜らしい（伝聞・推量）",
    sentence: "遠くにて鐘の音するなり。",
    stage: 12,
    category: "古文",
  },
  {
    en: "たり",
    ja: "〜ている・〜た（完了・存続の助動詞）",
    sentence: "鎧を着たる武者が立てり。",
    stage: 12,
    category: "古文",
  },
  // Stage 13
  {
    en: "係り結びの法則",
    ja: "ぞ・なむ・や・かは連体形、こそは已然形で結ぶ",
    sentence: "花ぞ咲きける（ぞ→連体形「ける」で結ぶ）。",
    stage: 13,
    category: "古文",
  },
  {
    en: "敬語（尊敬）",
    ja: "動作をする人を高める敬語",
    sentence: "大臣のたまひけり（たまふ＝尊敬の補助動詞）。",
    stage: 13,
    category: "古文",
  },
  {
    en: "敬語（謙譲）",
    ja: "動作を受ける人を高める敬語",
    sentence: "御前に参りはべりぬ（参る・はべり＝謙譲語）。",
    stage: 13,
    category: "古文",
  },
  {
    en: "敬語（丁寧）",
    ja: "聞き手を敬う敬語（はべり・候）",
    sentence: "かくなむはべりと申しける。",
    stage: 13,
    category: "古文",
  },
  {
    en: "二方向の敬語",
    ja: "尊敬と謙譲を同時に使う表現",
    sentence: "殿が姫に申したまひけり（謙譲＋尊敬）。",
    stage: 13,
    category: "古文",
  },
  {
    en: "和歌の枕詞",
    ja: "特定の語に付く五音の修飾語",
    sentence: "「あしびきの」は山にかかる枕詞なり。",
    stage: 13,
    category: "古文",
  },
  {
    en: "掛詞",
    ja: "一語に二つの意味を持たせる修辞法",
    sentence: "「松」に「待つ」を掛けた歌なり。",
    stage: 13,
    category: "古文",
  },
  {
    en: "縁語",
    ja: "歌中で意味的に関連する語を使う修辞",
    sentence: "「海」「波」「浜」は縁語として用ゐらる。",
    stage: 13,
    category: "古文",
  },
  // Stage 14
  {
    en: "本歌取り",
    ja: "有名な歌の語句を取り込む技法",
    sentence: "本歌取りにより古歌の趣を新たな歌に活かした。",
    stage: 14,
    category: "古文",
  },
  {
    en: "体言止め",
    ja: "和歌の末尾を名詞で止める技法",
    sentence: "余情を残すために体言止めを用ゐた歌だ。",
    stage: 14,
    category: "古文",
  },
  {
    en: "序詞",
    ja: "特定の語を導くための長い枕詞的表現",
    sentence: "「あしびきの山鳥の尾の」は序詞として「ながし」を導く。",
    stage: 14,
    category: "古文",
  },
  {
    en: "見立て",
    ja: "あるものを別のものに見なす修辞",
    sentence: "雪を白梅に見立てた歌が美しい。",
    stage: 14,
    category: "古文",
  },
  {
    en: "物語文学",
    ja: "平安時代の散文文学（源氏物語等）",
    sentence: "源氏物語は世界最古の長編物語文学といはれる。",
    stage: 14,
    category: "古文",
  },
  {
    en: "日記文学",
    ja: "平安女流文学の日記形式作品群",
    sentence: "土佐日記は日本最古の日記文学とされる。",
    stage: 14,
    category: "古文",
  },
  {
    en: "随筆文学",
    ja: "枕草子・徒然草等の随想的文学",
    sentence: "枕草子は清少納言の鋭い感性による随筆文学の傑作だ。",
    stage: 14,
    category: "古文",
  },
  {
    en: "説話文学",
    ja: "今昔物語集等の説話を集めた作品",
    sentence: "今昔物語集は千余りの説話を集めた説話文学の大作だ。",
    stage: 14,
    category: "古文",
  },
  // Stage 15
  {
    en: "歌物語",
    ja: "和歌を中心とした物語（伊勢物語等）",
    sentence: "伊勢物語は在原業平を思はせる男の歌物語だ。",
    stage: 15,
    category: "古文",
  },
  {
    en: "軍記物語",
    ja: "戦争を題材にした物語（平家物語等）",
    sentence: "平家物語は琵琶法師が語り広めた軍記物語だ。",
    stage: 15,
    category: "古文",
  },
  {
    en: "歌論",
    ja: "和歌の理念・技法を論じた書",
    sentence: "古今集の仮名序は最初期の歌論として名高い。",
    stage: 15,
    category: "古文",
  },
  {
    en: "勅撰和歌集",
    ja: "天皇・上皇の命で編纂された和歌集",
    sentence: "古今和歌集は最初の勅撰和歌集として重要だ。",
    stage: 15,
    category: "古文",
  },
  {
    en: "八代集",
    ja: "古今集から新古今集までの8つの勅撰集",
    sentence: "八代集はいづれも王朝文学の精粋を示す。",
    stage: 15,
    category: "古文",
  },
  {
    en: "万葉集",
    ja: "現存最古の和歌集（4500首余り）",
    sentence: "万葉集には天皇から庶民まで多様な歌が収められる。",
    stage: 15,
    category: "古文",
  },
  {
    en: "連歌",
    ja: "複数人が句を連ねていく文学形式",
    sentence: "連歌は室町時代に最盛期を迎えた共同詩の形式だ。",
    stage: 15,
    category: "古文",
  },
  {
    en: "俳諧",
    ja: "連歌から派生した短詩文学（俳句の前身）",
    sentence: "松尾芭蕉は俳諧を文学の域まで高めた俳聖とされる。",
    stage: 15,
    category: "古文",
  },
  // Stage 16
  {
    en: "無常観",
    ja: "すべては移ろいゆくという仏教的世界観",
    sentence: "方丈記は無常観を基調とした鴨長明の名作だ。",
    stage: 16,
    category: "古文",
  },
  {
    en: "もののあはれ",
    ja: "物事に触れて感じるしみじみとした情感",
    sentence: "源氏物語の根底には「もののあはれ」が流れる。",
    stage: 16,
    category: "古文",
  },
  {
    en: "をかし",
    ja: "知性的・清少納言的美意識（趣深い）",
    sentence: "枕草子には「をかし」の美意識が随所に現れる。",
    stage: 16,
    category: "古文",
  },
  {
    en: "幽玄",
    ja: "能・連歌に見られる深遠な美的理念",
    sentence: "世阿弥は能の理念として幽玄を重視した。",
    stage: 16,
    category: "古文",
  },
  {
    en: "侘び・寂び",
    ja: "茶道・俳諧における枯淡の美意識",
    sentence: "松尾芭蕉の俳句には侘び・寂びの精神が宿る。",
    stage: 16,
    category: "古文",
  },
  {
    en: "仮名遣い",
    ja: "歴史的仮名遣いと現代仮名遣いの対応",
    sentence: "「ゐ」「ゑ」「を」は歴史的仮名遣いで現代語に直して読む。",
    stage: 16,
    category: "古文",
  },
  {
    en: "活用の種類",
    ja: "動詞の語形変化のパターン（四段・二段等）",
    sentence: "「書く」は四段活用、「起く」は上二段活用だ。",
    stage: 16,
    category: "古文",
  },
  {
    en: "助動詞の識別",
    ja: "同形の助動詞を文脈から区別する読解技法",
    sentence: "「なり」が断定か推量かを文脈と接続で識別する。",
    stage: 16,
    category: "古文",
  },
  // Stage 17
  {
    en: "竹取物語",
    ja: "かぐや姫の物語・最古の仮名物語",
    sentence: "竹取物語はかぐや姫が月に帰る日本最古の仮名物語だ。",
    stage: 17,
    category: "古文",
  },
  {
    en: "源氏物語",
    ja: "紫式部作・世界最古の長編小説",
    sentence: "源氏物語は光源氏の生涯を描く紫式部の大長編だ。",
    stage: 17,
    category: "古文",
  },
  {
    en: "枕草子",
    ja: "清少納言による随筆・をかしの文学",
    sentence: "「春はあけぼの」で始まる枕草子は平安の名随筆だ。",
    stage: 17,
    category: "古文",
  },
  {
    en: "方丈記",
    ja: "鴨長明作・無常を主題とした随筆",
    sentence: "「ゆく河の流れは絶えずして」で始まる方丈記は名文だ。",
    stage: 17,
    category: "古文",
  },
  {
    en: "徒然草",
    ja: "兼好法師作・無常観の随筆",
    sentence: "「つれづれなるままに」で始まる徒然草は中世随筆の代表作だ。",
    stage: 17,
    category: "古文",
  },
  {
    en: "平家物語",
    ja: "平氏の盛衰を描く軍記物語",
    sentence: "「祇園精舎の鐘の声」で始まる平家物語は有名な軍記物語だ。",
    stage: 17,
    category: "古文",
  },
  {
    en: "奥の細道",
    ja: "松尾芭蕉の俳諧紀行文",
    sentence: "「月日は百代の過客にして」で始まる奥の細道は紀行文学の傑作だ。",
    stage: 17,
    category: "古文",
  },
  {
    en: "古今和歌集",
    ja: "紀貫之ら撰の最初の勅撰和歌集",
    sentence: "古今和歌集の仮名序は紀貫之が書いた歌論の名文だ。",
    stage: 17,
    category: "古文",
  },
  // Stage 18
  {
    en: "土佐日記",
    ja: "紀貫之が女性に仮託した最古の日記文学",
    sentence: "土佐日記は男性が女性のふりをして書いた最古の日記だ。",
    stage: 18,
    category: "古文",
  },
  {
    en: "蜻蛉日記",
    ja: "藤原道綱母による最初の女流日記",
    sentence: "蜻蛉日記は夫の不実を嘆く女性の心情を描く。",
    stage: 18,
    category: "古文",
  },
  {
    en: "紫式部日記",
    ja: "源氏物語作者による宮廷生活の記録",
    sentence: "紫式部日記には宮廷の様子と作者の内省が記される。",
    stage: 18,
    category: "古文",
  },
  {
    en: "更級日記",
    ja: "菅原孝標女の回想的日記",
    sentence: "更級日記には源氏物語への憧れが生き生きと描かれる。",
    stage: 18,
    category: "古文",
  },
  {
    en: "伊勢物語",
    ja: "在原業平を思わせる男の歌物語",
    sentence: "伊勢物語は百二十五段からなる最初の歌物語だ。",
    stage: 18,
    category: "古文",
  },
  {
    en: "大和物語",
    ja: "平安中期の短編歌物語集",
    sentence: "大和物語には様々な人物の恋と別れが描かれる。",
    stage: 18,
    category: "古文",
  },
  {
    en: "宇治拾遺物語",
    ja: "鎌倉時代の説話集",
    sentence: "宇治拾遺物語には笑える話から感動的な話まで収録される。",
    stage: 18,
    category: "古文",
  },
  {
    en: "今昔物語集",
    ja: "平安末期の大説話集",
    sentence: "今昔物語集は「今は昔」で始まる千余りの説話を集める。",
    stage: 18,
    category: "古文",
  },
  // Stage 19
  {
    en: "能",
    ja: "世阿弥が大成した仮面音楽劇",
    sentence: "能は幽玄の美を体現する日本の伝統芸能だ。",
    stage: 19,
    category: "古文",
  },
  {
    en: "狂言",
    ja: "能と交互に演じられる喜劇的芸能",
    sentence: "狂言は日常の出来事を笑いで描く庶民的な芸能だ。",
    stage: 19,
    category: "古文",
  },
  {
    en: "歌舞伎",
    ja: "江戸時代に発達した総合芸能",
    sentence: "歌舞伎は女形や見得など独特の様式美を持つ。",
    stage: 19,
    category: "古文",
  },
  {
    en: "近松門左衛門",
    ja: "元禄期の浄瑠璃・歌舞伎作者",
    sentence: "近松門左衛門は「曽根崎心中」など情話で名高い。",
    stage: 19,
    category: "古文",
  },
  {
    en: "井原西鶴",
    ja: "元禄期の浮世草子・俳諧師",
    sentence: "井原西鶴は好色一代男など浮世草子で名を馳せた。",
    stage: 19,
    category: "古文",
  },
  {
    en: "松尾芭蕉",
    ja: "江戸前期・俳諧の芸術的完成者",
    sentence: "松尾芭蕉は「古池や蛙飛び込む水の音」で有名な俳聖だ。",
    stage: 19,
    category: "古文",
  },
  {
    en: "与謝蕪村",
    ja: "江戸中期の俳人・画家",
    sentence: "与謝蕪村は絵画的で情景豊かな俳句を多く詠んだ。",
    stage: 19,
    category: "古文",
  },
  {
    en: "小林一茶",
    ja: "江戸後期・庶民的情感の俳人",
    sentence: "小林一茶の俳句は弱いものへの愛情にあふれている。",
    stage: 19,
    category: "古文",
  },
  // Stage 20
  {
    en: "本居宣長",
    ja: "江戸期の国学者・もののあはれ論",
    sentence: "本居宣長は源氏物語の本質を「もののあはれ」と論じた。",
    stage: 20,
    category: "古文",
  },
  {
    en: "契沖",
    ja: "万葉集研究の先駆けとなった僧侶",
    sentence: "契沖は万葉代匠記で万葉集の注釈に大きな業績を残した。",
    stage: 20,
    category: "古文",
  },
  {
    en: "賀茂真淵",
    ja: "万葉集・古道を研究した国学者",
    sentence: "賀茂真淵は万葉集の雄大な精神を称え研究した。",
    stage: 20,
    category: "古文",
  },
  {
    en: "平田篤胤",
    ja: "復古神道を唱えた後期国学者",
    sentence: "平田篤胤は古代日本の神道精神を復興しようとした。",
    stage: 20,
    category: "古文",
  },
  {
    en: "古事記",
    ja: "現存最古の歴史書・神話集",
    sentence: "古事記は太安万侶が撰録した日本最古の歴史書だ。",
    stage: 20,
    category: "古文",
  },
  {
    en: "日本書紀",
    ja: "養老4年成立の国家的正史",
    sentence: "日本書紀は漢文体で書かれた日本初の勅撰正史だ。",
    stage: 20,
    category: "古文",
  },
  {
    en: "風土記",
    ja: "諸国の地誌・説話を記した地方誌",
    sentence: "出雲風土記は現存する数少ない完本の風土記だ。",
    stage: 20,
    category: "古文",
  },
  {
    en: "万葉仮名",
    ja: "漢字の音訓を借りて日本語を書く表記法",
    sentence: "万葉集は万葉仮名で書かれ後の仮名文字の基礎となった。",
    stage: 20,
    category: "古文",
  },
];

// 全カテゴリ統合リスト
const ALL_VOCAB = [
  ...DEFAULT_VOCAB,
  ...DEFAULT_VOCAB_IDIOM,
  ...DEFAULT_VOCAB_KANJI,
  ...DEFAULT_VOCAB_CHEM,
  ...DEFAULT_VOCAB_KOBUN,
];

const calcLevel = (exp) => {
  const e = exp || 0;
  let lv = 1;
  while (calcExpForLevel(lv + 1) <= e) lv++;
  return lv;
};

const AvatarDisplay = ({
  avatar,
  color,
  size = "w-10 h-10",
  textSize = "text-xl",
  rounded = "rounded-2xl",
  border = "",
  isTeacher = false,
  isMe = false,
  isLight = false,
}) => {
  const isImage = avatar?.startsWith("data:") || avatar?.startsWith("http");
  return (
    <div
      className={`${size} shrink-0`}
      style={{ position: "relative", flexShrink: 0 }}
    >
      {isMe && (
        <div
          style={{
            position: "absolute",
            top: "-11px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 9,
            fontWeight: 900,
            color: isLight ? "rgba(30,20,80,0.7)" : "rgba(255,255,255,0.7)",
            whiteSpace: "nowrap",
            letterSpacing: "0.05em",
            pointerEvents: "none",
          }}
        >
          自分
        </div>
      )}
      <div
        className={`${rounded} flex items-center justify-center ${textSize} shadow-sm overflow-hidden ${
          isImage ? "" : color || "bg-amber-500"
        } ${border}`}
        style={{ width: "100%", height: "100%" }}
      >
        {isImage ? (
          <img
            src={avatar}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          (() => {
            const AvatarIc = AVATAR_ICONS[avatar] || IcDefaultUser;
            // Tailwindのw-N: N*4px。w-10=40, w-9=36, w-8=32 etc.
            const tw = size?.match(/w-(\d+)/)?.[1];
            const iconSize = tw ? Math.round(parseInt(tw) * 4 * 0.82) : 32;
            return <AvatarIc size={iconSize} color="currentColor" />;
          })()
        )}
      </div>
      {isTeacher && (
        <div
          style={{
            position: "absolute",
            bottom: "-4px",
            right: "-4px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
            border: "2px solid #1a1040",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <polygon
              points="5,1 6.2,3.8 9.5,4.1 7.2,6.1 8,9.3 5,7.5 2,9.3 2.8,6.1 0.5,4.1 3.8,3.8"
              fill="white"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

const AnnouncementCard = ({
  a,
  isAdmin,
  db,
  appId,
  showToast,
  setAnnouncements,
  isLight,
}) => {
  const [editing, setEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(a.text);
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      if (db)
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "announcements", a.id),
          { text: editText.trim() }
        );
      setAnnouncements((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, text: editText.trim() } : x))
      );
      showToast("更新しました！");
      setEditing(false);
    } catch (e) {
      showToast("更新エラー: " + e.message, "error");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("このお知らせを削除しますか？")) return;
    try {
      if (db)
        await deleteDoc(
          doc(db, "artifacts", appId, "public", "data", "announcements", a.id)
        );
      setAnnouncements((prev) => prev.filter((x) => x.id !== a.id));
      showToast("削除しました");
    } catch (e) {
      showToast("削除エラー: " + e.message, "error");
    }
  };

  return (
    <div
      className="p-5 rounded-2xl relative overflow-hidden text-left"
      style={{
        background: isLight
          ? "rgba(255,255,255,0.92)"
          : "rgba(255,255,255,0.05)",
        border: isLight
          ? "2px solid rgba(0,0,0,0.18)"
          : "1px solid rgba(255,255,255,0.1)",
        boxShadow: isLight ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ background: "linear-gradient(180deg, #6366f1, #8b5cf6)" }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] font-bold mb-2 tracking-wider uppercase"
            style={{
              color: isLight ? "rgba(30,20,80,0.40)" : "rgba(255,255,255,0.30)",
            }}
          >
            {new Date(a.timestamp).toLocaleDateString("ja-JP")}
          </p>
          {editing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-3 rounded-xl font-bold text-sm outline-none min-h-[80px]"
              style={{
                background: isLight
                  ? "rgba(0,0,0,0.04)"
                  : "rgba(255,255,255,0.08)",
                border: isLight
                  ? "1.5px solid rgba(99,102,241,0.5)"
                  : "1px solid rgba(99,102,241,0.5)",
                color: isLight ? "rgba(20,10,60,0.85)" : "white",
              }}
              autoFocus
            />
          ) : (
            <p
              className="font-bold leading-relaxed text-base"
              style={{ color: isLight ? "rgba(20,10,60,0.85)" : "white" }}
            >
              {a.text}
            </p>
          )}
        </div>
        {isAdmin && (
          <div className="flex flex-col gap-1.5 shrink-0">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg font-black text-[11px] text-white active:opacity-70"
                  style={{
                    background: "linear-gradient(135deg,#b8860b,#e0c97f)",
                  }}
                >
                  {saving ? "..." : "保存"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditText(a.text);
                  }}
                  className="px-3 py-1.5 rounded-lg font-black text-[11px] active:opacity-70"
                  style={{
                    background: isLight
                      ? "rgba(0,0,0,0.06)"
                      : "rgba(255,255,255,0.08)",
                    color: isLight
                      ? "rgba(30,20,80,0.55)"
                      : "rgba(255,255,255,0.5)",
                  }}
                >
                  取消
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 rounded-lg font-black text-[11px] text-amber-300 active:opacity-70"
                  style={{
                    background: "rgba(201,168,76,0.18)",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  編集
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-lg font-black text-[11px] text-rose-400 active:opacity-70"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  削除
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const compressImage = (dataUrl) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const SIZE = 80;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };
    img.src = dataUrl;
  });

const generateShortId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++)
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

// ─── PetCareCard: ownedPets.map内でhooksを使うため独立コンポーネント ────────
const PetCareCard = ({
  pet,
  idx,
  profile,
  setProfile,
  saveLocal,
  fb,
  user,
  getPetData,
  getPetAccessories,
  handleFeed,
  handlePetInteract,
  handleEquipAccForPet,
  isLight,
}) => {
  const petDisplayName = profile?.petNames?.[pet.id] || pet.name;
  const pd = getPetData(pet.id);
  const affection = pd.affection || 0;
  const {
    lv: petLv,
    current: lvCurrent,
    need: lvNeed,
  } = getPetLvProgress(affection);
  const progress = Math.min(100, Math.round((lvCurrent / lvNeed) * 100));
  const today = new Date().toDateString();
  const nadeCount = pd.lastNadeDate === today ? pd.nadeCountToday || 0 : 0;
  const PIcon = PET_ICONS[pet.id] || IcPet;
  const colors = [
    "#f9a8d4",
    "#86efac",
    "#93c5fd",
    "#fcd34d",
    "#c4b5fd",
    "#fb923c",
    "#a5f3fc",
  ];
  const petColor = colors[idx % colors.length];
  const [editingName, setEditingName] = React.useState(false);
  const [nameVal, setNameVal] = React.useState(petDisplayName);
  const saveName = () => {
    const trimmed = nameVal.trim() || pet.name;
    const np = {
      ...profile,
      petNames: { ...(profile?.petNames || {}), [pet.id]: trimmed },
    };
    setProfile(np);
    saveLocal("profile", np);
    if (fb.db && user)
      updateDoc(
        doc(fb.db, "artifacts", fb.appId, "users", user.uid, "profile", "main"),
        { petNames: np.petNames }
      ).catch(() => {});
    setEditingName(false);
  };
  const ownedAccIds = profile?.ownedAccessories || [];
  const petAccs = getPetAccessories(pet.id);
  const ownedAccList = SHOP_ACCESSORIES.filter((a) =>
    ownedAccIds.includes(a.id)
  );

  return (
    <div
      key={pet.id}
      className="rounded-2xl p-4"
      style={{
        background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${petColor}44`,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <PIcon size={32} />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            {editingName ? (
              <div className="flex items-center gap-1.5 flex-1 mr-2">
                <input
                  autoFocus
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  maxLength={12}
                  style={{
                    background: isLight
                      ? "rgba(0,0,0,0.07)"
                      : "rgba(255,255,255,0.1)",
                    border: `1px solid ${petColor}88`,
                    borderRadius: 8,
                    padding: "2px 8px",
                    color: isLight ? "#1e0a40" : "white",
                    fontWeight: 900,
                    fontSize: 13,
                    width: "100%",
                    outline: "none",
                  }}
                />
              </div>
            ) : (
              <button
                className="flex items-center gap-1.5"
                onClick={() => {
                  setNameVal(petDisplayName);
                  setEditingName(true);
                }}
              >
                <span
                  className="font-black text-sm"
                  style={{
                    color: isLight ? "#1e0a40" : "white",
                  }}
                >
                  {petDisplayName}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: petColor,
                    fontWeight: 900,
                    textShadow: isLight
                      ? "1px 1px 0 rgba(0,0,0,0.6), -1px -1px 0 rgba(0,0,0,0.6), 1px -1px 0 rgba(0,0,0,0.6), -1px 1px 0 rgba(0,0,0,0.6)"
                      : "none",
                  }}
                >
                  Lv.{petLv}
                </span>
                <IcAchPencil
                  size={10}
                  color={isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.3)"}
                />
              </button>
            )}
            <span
              className="text-[10px] font-bold flex-shrink-0"
              style={{
                color: isLight ? petColor : "rgba(255,255,255,0.4)",
                textShadow: isLight
                  ? "1px 1px 0 rgba(0,0,0,0.6), -1px -1px 0 rgba(0,0,0,0.6), 1px -1px 0 rgba(0,0,0,0.6), -1px 1px 0 rgba(0,0,0,0.6)"
                  : "none",
              }}
            >
              {lvCurrent} / {lvNeed}
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{
              background: isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="h-full transition-all rounded-full"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${petColor}99, ${petColor})`,
              }}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => handleFeed(pet.id)}
          className="py-2.5 rounded-xl font-black text-white text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          style={{
            background: "linear-gradient(135deg,#f43f5e,#e11d48)",
            boxShadow: "0 3px 10px rgba(244,63,94,0.3)",
          }}
        >
          <IcFood size={18} color="white" /> エサ{" "}
          <span style={{ opacity: 0.75, fontSize: 10 }}>(5pt)</span>
        </button>
        <button
          onClick={() => handlePetInteract(pet.id)}
          disabled={nadeCount >= 3}
          className="py-2.5 rounded-xl font-black text-white text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg,#10b981,#059669)",
            boxShadow: "0 3px 10px rgba(16,185,129,0.3)",
          }}
        >
          <IcPaw size={18} color="white" /> なでる{" "}
          <span style={{ opacity: 0.75, fontSize: 10 }}>
            ({3 - nadeCount}/3)
          </span>
        </button>
      </div>
      {ownedAccList.length > 0 && (
        <div
          className="rounded-xl p-2.5"
          style={{
            background: isLight ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.2)",
            border: isLight ? "1px solid rgba(0,0,0,0.08)" : "none",
          }}
        >
          <p
            className="text-[10px] font-black mb-2 uppercase tracking-widest"
            style={{
              color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.4)",
            }}
          >
            アクセサリー
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ownedAccList.map((acc) => {
              const equipped = petAccs.includes(acc.id);
              const AccIc = ACC_ICONS[acc.id];
              return (
                <button
                  key={acc.id}
                  onClick={() => handleEquipAccForPet(pet.id, acc.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[11px] active:scale-95 transition-all"
                  style={{
                    background: equipped
                      ? `${petColor}33`
                      : isLight
                      ? "rgba(0,0,0,0.07)"
                      : "rgba(255,255,255,0.07)",
                    border: equipped
                      ? `1.5px solid ${petColor}99`
                      : isLight
                      ? "1.5px solid rgba(0,0,0,0.18)"
                      : "1.5px solid rgba(255,255,255,0.1)",
                    color: equipped
                      ? petColor
                      : isLight
                      ? "rgba(0,0,0,0.6)"
                      : "rgba(255,255,255,0.5)",
                  }}
                  title={`${acc.slot}スロット`}
                >
                  <span style={{ display: "flex", alignItems: "center" }}>
                    {AccIc ? (
                      <AccIc
                        size={14}
                        color={
                          equipped
                            ? "currentColor"
                            : acc.color || "currentColor"
                        }
                      />
                    ) : (
                      <IcGift size={14} color="currentColor" />
                    )}
                  </span>
                  {acc.name}
                  {equipped && (
                    <span
                      style={{
                        fontSize: 9,
                        opacity: isLight ? 1 : 0.8,
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── タイピング練習コンポーネント ────────────────────────────────────────────
const TypingGameScreen = ({ pool, isLight, theme, onBack }) => {
  const [words, setWords] = React.useState([]);
  const [current, setCurrent] = React.useState(0);
  const [input, setInput] = React.useState("");
  const [results, setResults] = React.useState([]); // { word, correct, typed, ms }
  const [startTime, setStartTime] = React.useState(null);
  const [wordStart, setWordStart] = React.useState(null);
  const [phase, setPhase] = React.useState("ready"); // ready | playing | done
  const inputRef = React.useRef(null);

  const TOTAL = 10;

  const startGame = React.useCallback(() => {
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, TOTAL);
    setWords(shuffled);
    setCurrent(0);
    setInput("");
    setResults([]);
    setPhase("playing");
    setStartTime(Date.now());
    setWordStart(Date.now());
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [pool]);

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const typed = input.trim();
      if (!typed) return;
      const word = words[current];
      const correct = typed.toLowerCase() === word.en.toLowerCase();
      const ms = Date.now() - wordStart;
      const newResults = [...results, { word, correct, typed, ms }];
      setResults(newResults);
      setInput("");
      setWordStart(Date.now());
      if (current + 1 >= TOTAL) {
        setPhase("done");
      } else {
        setCurrent((c) => c + 1);
      }
    }
  };

  const correctCount = results.filter((r) => r.correct).length;
  const totalMs = results.reduce((s, r) => s + r.ms, 0);
  const avgSec =
    results.length > 0 ? (totalMs / results.length / 1000).toFixed(1) : "-";

  if (pool.length === 0) {
    return (
      <div className="animate-in fade-in" style={{ paddingBottom: 90 }}>
        <button
          onClick={onBack}
          style={{
            color: theme.textMuted,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          ← 戻る
        </button>
        <div
          style={{ textAlign: "center", marginTop: 60, color: theme.textMuted }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <IcBook
              size={56}
              color={isLight ? "rgba(30,20,80,0.25)" : "rgba(255,255,255,0.25)"}
            />
          </div>
          <p
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: theme.text,
              marginTop: 12,
            }}
          >
            単語が登録されていません
          </p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            先生に単語を追加してもらいましょう
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in" style={{ paddingBottom: 90 }}>
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <button
          onClick={onBack}
          style={{
            color: theme.textMuted,
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ← 戻る
        </button>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: theme.text,
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <IcTyping size={22} color={isLight ? "#059669" : "#6ee7b7"} />{" "}
          タイピング練習
        </h2>
      </div>

      {phase === "ready" && (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <IcTyping size={72} color={isLight ? "#059669" : "#6ee7b7"} />
          </div>
          <p
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: theme.text,
              marginBottom: 8,
            }}
          >
            単語タイピング練習
          </p>
          <p style={{ fontSize: 13, color: theme.textMuted, marginBottom: 32 }}>
            {TOTAL}問の英単語を日本語訳を見てタイプしよう{"\n"}
            Enterまたはスペースで確定
          </p>
          <button
            onClick={startGame}
            style={{
              background: "linear-gradient(135deg,#10b981,#059669)",
              color: "white",
              border: "none",
              borderRadius: 16,
              padding: "14px 40px",
              fontSize: 16,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            スタート
          </button>
        </div>
      )}

      {phase === "playing" && words[current] && (
        <div>
          {/* 進捗 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span
              style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted }}
            >
              {current + 1} / {TOTAL}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>
              ✓ {results.filter((r) => r.correct).length}
            </span>
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 4,
              background: isLight
                ? "rgba(0,0,0,0.08)"
                : "rgba(255,255,255,0.08)",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 4,
                background: "linear-gradient(90deg,#10b981,#059669)",
                width: `${(current / TOTAL) * 100}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {/* 問題カード */}
          <div
            style={{
              borderRadius: 22,
              padding: "32px 24px",
              marginBottom: 20,
              textAlign: "center",
              background: isLight
                ? "rgba(255,255,255,0.78)"
                : "rgba(15,8,35,0.58)",
              border: isLight
                ? "1.5px solid rgba(0,0,0,0.22)"
                : "1.5px solid rgba(255,255,255,0.32)",
              boxShadow: isLight
                ? "0 4px 20px rgba(0,0,0,0.10)"
                : "0 6px 28px rgba(0,0,0,0.62)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: theme.textMuted,
                marginBottom: 10,
              }}
            >
              次の単語を英語でタイプ
            </p>
            <p
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: theme.text,
                marginBottom: 8,
              }}
            >
              {words[current].ja}
            </p>
            {words[current].sentence && (
              <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 8 }}>
                {words[current].sentence}
              </p>
            )}
          </div>

          {/* 直近の結果 */}
          {results.length > 0 &&
            (() => {
              const last = results[results.length - 1];
              return (
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    color: last.correct ? "#10b981" : "#ef4444",
                  }}
                >
                  {last.correct
                    ? `✓ 正解！ "${last.word.en}"`
                    : `✗ 不正解 "${last.typed}" → 正解: "${last.word.en}"`}
                </div>
              );
            })()}

          {/* 入力 */}
          <input
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="ここに英語でタイプ..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "16px 20px",
              borderRadius: 16,
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "monospace",
              outline: "none",
              background: isLight
                ? "rgba(255,255,255,0.9)"
                : "rgba(255,255,255,0.08)",
              border: isLight
                ? "2px solid rgba(16,185,129,0.4)"
                : "2px solid rgba(52,211,153,0.4)",
              color: theme.text,
              textAlign: "center",
            }}
          />
          <button
            onClick={() => {
              const typed = input.trim();
              if (!typed) return;
              const word = words[current];
              const correct = typed.toLowerCase() === word.en.toLowerCase();
              const ms = Date.now() - wordStart;
              const newResults = [...results, { word, correct, typed, ms }];
              setResults(newResults);
              setInput("");
              setWordStart(Date.now());
              if (current + 1 >= TOTAL) {
                setPhase("done");
              } else {
                setCurrent((c) => c + 1);
              }
              inputRef.current?.focus();
            }}
            style={{
              width: "100%",
              marginTop: 10,
              padding: "14px",
              borderRadius: 16,
              border: "none",
              background: input.trim()
                ? "linear-gradient(135deg,#10b981,#059669)"
                : isLight
                ? "rgba(0,0,0,0.08)"
                : "rgba(255,255,255,0.10)",
              color: input.trim() ? "white" : theme.textMuted,
              fontSize: 16,
              fontWeight: 900,
              cursor: input.trim() ? "pointer" : "default",
              transition: "all 0.15s",
            }}
          >
            確定 →
          </button>
        </div>
      )}

      {phase === "done" && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            {correctCount >= 8 ? (
              <IcParty size={64} color={isLight ? "#f59e0b" : "#fcd34d"} />
            ) : correctCount >= 5 ? (
              <IcThumbsUp size={64} color={isLight ? "#3b82f6" : "#93c5fd"} />
            ) : (
              <IcMuscle size={64} color={isLight ? "#8b5cf6" : "#c4b5fd"} />
            )}
          </div>
          <p
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: theme.text,
              marginBottom: 4,
            }}
          >
            {correctCount} / {TOTAL} 正解
          </p>
          <p style={{ fontSize: 13, color: theme.textMuted, marginBottom: 24 }}>
            平均タイム {avgSec}秒 / 問
          </p>

          {/* 結果一覧 */}
          <div style={{ textAlign: "left", marginBottom: 24 }}>
            {results.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: 12,
                  marginBottom: 6,
                  background: r.correct
                    ? isLight
                      ? "rgba(16,185,129,0.10)"
                      : "rgba(16,185,129,0.15)"
                    : isLight
                    ? "rgba(239,68,68,0.08)"
                    : "rgba(239,68,68,0.15)",
                  border: r.correct
                    ? "1px solid rgba(16,185,129,0.25)"
                    : "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <div>
                  <span
                    style={{ fontWeight: 800, fontSize: 14, color: theme.text }}
                  >
                    {r.word.en}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: theme.textMuted,
                      marginLeft: 8,
                    }}
                  >
                    {r.word.ja}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {!r.correct && (
                    <span style={{ fontSize: 11, color: "#ef4444" }}>
                      {r.typed}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: r.correct ? "#10b981" : "#ef4444",
                    }}
                  >
                    {r.correct ? "✓" : "✗"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={startGame}
            style={{
              background: "linear-gradient(135deg,#10b981,#059669)",
              color: "white",
              border: "none",
              borderRadius: 16,
              padding: "14px 40px",
              fontSize: 16,
              fontWeight: 900,
              cursor: "pointer",
              width: "100%",
            }}
          >
            もう一度
          </button>
        </div>
      )}
    </div>
  );
};

// ─── AIペット対話コンポーネント ────────────────────────────────────────────
const PetChatScreen = ({
  onBack,
  learnedWords,
  PetIc,
  activePetId,
  isLight,
  theme,
  savedMessages,
  onSaveMessages,
}) => {
  const initMsg = {
    role: "assistant",
    text:
      learnedWords.length > 0
        ? `こんにちは！今日は「${learnedWords
            .slice(0, 3)
            .map((w) => w.en)
            .join("」「")}」などの単語を使って話しかけてみよう！`
        : "こんにちは！英語で話しかけてみよう！",
  };
  const [messages, setMessages] = useState(savedMessages || [initMsg]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const wordList = learnedWords.map((w) => `${w.en}（${w.ja}）`).join(", ");

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    onSaveMessages?.(newMessages);
    setLoading(true);
    try {
      const apiKey = localStorage.getItem("genron_anthropicApiKey") || "";
      if (!apiKey) {
        setMessages((prev) => {
          const next = [
            ...prev,
            {
              role: "assistant",
              text: "AIペット機能は先生がAPIキーを設定すると使えるようになります。",
            },
          ];
          onSaveMessages?.(next);
          return next;
        });
        setLoading(false);
        return;
      }
      const apiMessages = newMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.text,
      }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          system: `You are a friendly AI pet in an English learning app. The user is a Japanese speaker learning English.
Rules:
- Reply in 2-3 short, natural English sentences
- Naturally incorporate learned words (${wordList}) when relevant
- If the user writes in Japanese, briefly reply in Japanese then suggest the English equivalent
- Gently correct grammar mistakes by modeling the correct form
- Always be encouraging and friendly
- Use simple vocabulary`,
          messages: apiMessages,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const reply =
        data?.content?.[0]?.text?.trim() || "Great! Keep practicing! 😊";
      setMessages((prev) => {
        const next = [...prev, { role: "assistant", text: reply }];
        onSaveMessages?.(next);
        return next;
      });
    } catch (err) {
      const errMsg = err?.message || "接続エラー";
      setMessages((prev) => {
        const next = [
          ...prev,
          {
            role: "assistant",
            text: `接続エラーが発生しました（${errMsg}）。もう一度試してみてください。`,
          },
        ];
        onSaveMessages?.(next);
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const G = {
    background: isLight ? "rgba(255,255,255,0.78)" : "rgba(15,8,35,0.58)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    border: isLight
      ? "1.5px solid rgba(0,0,0,0.22)"
      : "1.5px solid rgba(255,255,255,0.32)",
    boxShadow: isLight
      ? "0 4px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.98)"
      : "0 6px 28px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.10)",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 60px)",
        position: "relative",
      }}
      className="animate-in fade-in text-left"
    >
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          className="p-2 rounded-xl active:opacity-70 transition-all"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <ChevronLeft />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: isLight
                ? "rgba(236,72,153,0.18)"
                : "rgba(236,72,153,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PetIc size={22} color={isLight ? "#db2777" : "#f9a8d4"} />
          </div>
          <div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: isLight ? "#1a0035" : "white",
              }}
            >
              ペットと英会話
            </p>
            <p
              style={{
                fontSize: 10,
                color: isLight
                  ? "rgba(100,20,80,0.5)"
                  : "rgba(249,168,212,0.6)",
                marginTop: 1,
              }}
            >
              AI Chat Practice
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            const init = {
              role: "assistant",
              text:
                learnedWords.length > 0
                  ? `こんにちは！今日は「${learnedWords
                      .slice(0, 3)
                      .map((w) => w.en)
                      .join("」「")}」などの単語を使って話しかけてみよう！`
                  : "こんにちは！英語で話しかけてみよう！",
            };
            setMessages([init]);
            onSaveMessages?.([init]);
          }}
          className="ml-auto p-2 rounded-xl active:opacity-70 flex items-center gap-1"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.4)",
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0,
          }}
          title="会話をリセット"
        >
          <IcRefresh size={12} color="currentColor" />
          <span>リセット</span>
        </button>
      </div>

      {/* 学習単語チップ */}
      {learnedWords.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 5,
            flexWrap: "wrap",
            marginBottom: 10,
            flexShrink: 0,
          }}
        >
          {learnedWords.slice(0, 6).map((w, i) => (
            <button
              key={i}
              onClick={() =>
                setInput((prev) => prev + (prev ? " " : "") + w.en)
              }
              style={{
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                background: isLight
                  ? "rgba(236,72,153,0.12)"
                  : "rgba(236,72,153,0.22)",
                color: isLight ? "#db2777" : "#f9a8d4",
                border: "none",
                cursor: "pointer",
              }}
            >
              {w.en}
            </button>
          ))}
        </div>
      )}

      {/* メッセージリスト：入力エリア分の余白を下に確保 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingBottom: 80,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            {m.role === "assistant" && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: isLight
                    ? "rgba(236,72,153,0.18)"
                    : "rgba(236,72,153,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PetIc size={18} color={isLight ? "#db2777" : "#f9a8d4"} />
              </div>
            )}
            <div
              style={{
                maxWidth: "75%",
                padding: "10px 14px",
                borderRadius:
                  m.role === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                background:
                  m.role === "user"
                    ? isLight
                      ? "rgba(236,72,153,0.85)"
                      : "rgba(236,72,153,0.75)"
                    : isLight
                    ? "rgba(255,255,255,0.72)"
                    : "rgba(255,255,255,0.10)",
                border:
                  m.role === "user"
                    ? "none"
                    : isLight
                    ? "0.5px solid rgba(0,0,0,0.1)"
                    : "0.5px solid rgba(255,255,255,0.15)",
                fontSize: 13,
                fontWeight: 400,
                color:
                  m.role === "user"
                    ? "white"
                    : isLight
                    ? "rgba(20,10,40,0.85)"
                    : "rgba(255,255,255,0.85)",
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                flexShrink: 0,
                background: isLight
                  ? "rgba(236,72,153,0.18)"
                  : "rgba(236,72,153,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PetIc size={18} color={isLight ? "#db2777" : "#f9a8d4"} />
            </div>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "18px 18px 18px 4px",
                background: isLight
                  ? "rgba(255,255,255,0.72)"
                  : "rgba(255,255,255,0.10)",
                border: isLight
                  ? "0.5px solid rgba(0,0,0,0.1)"
                  : "0.5px solid rgba(255,255,255,0.15)",
                fontSize: 13,
                color: isLight ? "rgba(20,10,40,0.5)" : "rgba(255,255,255,0.4)",
              }}
            >
              考え中...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 入力エリア：画面下部に固定 */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          padding: "10px 16px",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          background: isLight ? "rgba(248,244,255,0.92)" : "rgba(10,8,28,0.90)",
          borderTop: isLight
            ? "0.5px solid rgba(0,0,0,0.08)"
            : "0.5px solid rgba(255,255,255,0.10)",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="英語で話しかけよう..."
          style={{
            flex: 1,
            padding: "11px 16px",
            borderRadius: 16,
            fontSize: 14,
            outline: "none",
            ...(isLight
              ? {
                  background: "rgba(255,255,255,0.85)",
                  border: "0.5px solid rgba(0,0,0,0.12)",
                  color: "#1a0035",
                }
              : {
                  background: "rgba(255,255,255,0.10)",
                  border: "0.5px solid rgba(255,255,255,0.18)",
                  color: "white",
                }),
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            flexShrink: 0,
            background:
              !input.trim() || loading
                ? isLight
                  ? "rgba(0,0,0,0.10)"
                  : "rgba(255,255,255,0.10)"
                : "linear-gradient(135deg, #ec4899, #a855f7)",
            border: "none",
            cursor: !input.trim() || loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
          }}
        >
          <Send
            size={18}
            style={{
              color:
                !input.trim() || loading ? "rgba(255,255,255,0.3)" : "white",
            }}
          />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState("loading");
  const [prevScreen, setPrevScreen] = useState("start");
  const navigateTo = (s) => {
    setPrevScreen(screen);
    setScreen(s);
  };
  const [history, setHistory] = useState([]);
  const [vocabList, setVocabList] = useState(DEFAULT_VOCAB);
  const [announcements, setAnnouncements] = useState([]);
  const [friends, setFriends] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [reviewList, setReviewList] = useState([]);
  const [customVocabList, setCustomVocabList] = useState([]);
  const [userVocabList, setUserVocabList] = useState([]); // 生徒が自作した単語
  const [factoryInput, setFactoryInput] = useState({
    en: "",
    ja: "",
    sentence: "",
  });
  const [factoryError, setFactoryError] = useState("");
  const [factoryAdding, setFactoryAdding] = useState(false);
  // 設定
  const [notifVocabAdd, setNotifVocabAdd] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("genron_notifVocabAdd") ?? "true");
    } catch {
      return true;
    }
  });
  const [notifChatUnread, setNotifChatUnread] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("genron_notifChatUnread") ?? "true"
      );
    } catch {
      return true;
    }
  });
  // AIペットチャット履歴（画面間で保持）
  const [petChatMessages, setPetChatMessages] = useState(null);
  const [newCustomWord, setNewCustomWord] = useState({
    en: "",
    ja: "",
    sentence: "",
    category: "英単語",
  });

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const [activeFriend, setActiveFriend] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [dmInput, setDmInput] = useState("");

  const [currentStage, setCurrentStage] = useState(1);
  const [gameMode, setGameMode] = useState("meaning");
  const [gameCategory, setGameCategory] = useState("英単語"); // ゲーム中のカテゴリ
  const [stageWords, setStageWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [stageClearedOccurred, setStageClearedOccurred] = useState(false);
  const [levelUpOccurred, setLevelUpOccurred] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [achvNotif, setAchvNotif] = useState(null); // { icon, title, rank }
  const achvNotifTimer = React.useRef(null);
  const chatEndRef = React.useRef(null);
  const dmEndRef = React.useRef(null);

  const [newName, setNewName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]); // bear
  const [avatarImage, setAvatarImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetImporting, setSheetImporting] = useState(false);
  const [sheetPreview, setSheetPreview] = useState(null);
  const [sheetStage, setSheetStage] = useState(1);
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [inviteCodeError, setInviteCodeError] = useState("");
  // ── メモアプリ ──
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("oritan_notes") || "[]");
    } catch {
      return [];
    }
  });
  const [noteInput, setNoteInput] = useState("");
  const [noteEditId, setNoteEditId] = useState(null);
  const [noteEditText, setNoteEditText] = useState("");
  const [noteSearch, setNoteSearch] = useState("");

  // ── つぶやきアプリ ──
  const [tweets, setTweets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("oritan_tweets") || "[]");
    } catch {
      return [];
    }
  });
  const [tweetInput, setTweetInput] = useState("");
  const [tweetCommentTarget, setTweetCommentTarget] = useState(null); // tweet id
  const [tweetCommentInput, setTweetCommentInput] = useState("");
  const [tweetImage, setTweetImage] = useState(null); // base64

  const [petFeedEffect, setPetFeedEffect] = useState(null); // { petId }
  const [shopTab, setShopTab] = useState("pets");
  const [petNameModal, setPetNameModal] = useState(null); // { pet } or null
  const [petNameInput, setPetNameInput] = useState("");
  const [achvCat, setAchvCat] = useState("all");
  const [achvFilter, setAchvFilter] = useState("all");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteCodeFetched, setInviteCodeFetched] = useState(false);
  const [editingInviteCode, setEditingInviteCode] = useState("");
  const [passwordList, setPasswordList] = useState([]);
  const [isLoadingPasswords, setIsLoadingPasswords] = useState(false);
  const [showPasswordList, setShowPasswordList] = useState(false);
  const [isSavingInviteCode, setIsSavingInviteCode] = useState(false);
  const [coinInputs, setCoinInputs] = useState({});
  const [chatSettings, setChatSettings] = useState({ allowedUids: [] }); // 発言権限があるUID一覧
  const [themeId, setThemeId] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("genron_theme")) || "light";
    } catch {
      return "dark";
    }
  });
  const [unreadChat, setUnreadChat] = useState(0);
  const [unreadDm, setUnreadDm] = useState({});
  const [announcementDismissed, setAnnouncementDismissed] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("genron_announcementDismissed")) || null
      );
    } catch {
      return null;
    }
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teacherCodeInput, setTeacherCodeInput] = useState("");
  const [toast, setToast] = useState(null);
  const [reviewMode, setReviewMode] = useState("list"); // "list" | "quiz"
  // 単語帳
  const [wordbookTab, setWordbookTab] = useState("stage"); // "stage" | "custom"
  const [wordbookStage, setWordbookStage] = useState(null);
  const [wordbookCategory, setWordbookCategory] = useState("英単語"); // 英単語|熟語|漢字|化学
  // カスタム問題配布先
  const [customAssignTarget, setCustomAssignTarget] = useState("all");
  // 生徒側カスタムタブ
  const [customTab, setCustomTab] = useState("new");
  const [reviewQuizIdx, setReviewQuizIdx] = useState(0);
  const [reviewQuizOptions, setReviewQuizOptions] = useState([]);
  const [reviewQuizFeedback, setReviewQuizFeedback] = useState(null); // null | "correct" | "wrong"
  const [reviewQuizLoading, setReviewQuizLoading] = useState(false);
  const [reviewSentenceRevealed, setReviewSentenceRevealed] = useState(false);
  const [anthropicApiKey, setAnthropicApiKey] = useState(
    () => localStorage.getItem("genron_anthropicApiKey") || ""
  );
  const prevVocabCountRef = useRef(null);
  const deletingReviewIds = useRef(new Set());
  const pressTimerRef = useRef(null); // ✅ クレジット長押し用タイマー管理
  const revertTimerRef = useRef(null); // ✅ クレジット復元タイマー管理
  const [creditState, setCreditState] = useState({
    text: "by miwa",
    color: "rgba(255,255,255,0.08)",
  });
  // ✅ アンマウント時に両タイマーをクリア（メモリリーク防止・指摘2対応済み）
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      if (revertTimerRef.current) clearTimeout(revertTimerRef.current);
    };
  }, []);

  const saveLocal = (key, val) =>
    localStorage.setItem(`genron_${key}`, JSON.stringify(val));
  const loadLocal = (key) => JSON.parse(localStorage.getItem(`genron_${key}`));

  useEffect(() => {
    const meta = (n, c) => {
      let el = document.querySelector(`meta[name="${n}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.name = n;
        document.head.appendChild(el);
      }
      el.content = c;
    };
    meta("apple-mobile-web-app-capable", "yes");
    meta("apple-mobile-web-app-status-bar-style", "black-translucent");
    meta(
      "viewport",
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover"
    );
    document.body.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100%";

    // ✅ アンマウント後のsetState呼び出しを防ぐフラグ
    let isMounted = true;
    let fallbackTimer = null;

    const init = async () => {
      const localProfile = loadLocal("profile");
      const localHistory = loadLocal("history") || [];
      if (localProfile) {
        setProfile(localProfile);
        if (localProfile.isTeacher) setIsAdmin(true);
      }
      setHistory(localHistory);

      if (fb.enabled) {
        try {
          signInAnonymously(fb.auth).catch(() => null);
          const unsubAuth = onAuthStateChanged(
            fb.auth,
            async (firebaseUser) => {
              unsubAuth();
              if (firebaseUser) {
                // ローカルに保存したUIDがあればそちらを優先（handleLogin経由の再起動対応）
                const savedUid = loadLocal("uid");
                const effectiveUid = savedUid || firebaseUser.uid;
                // ✅ await前にマウント確認
                if (!isMounted) return;
                setUser({ uid: effectiveUid });
                try {
                  const snap = await getDoc(
                    doc(
                      fb.db,
                      "artifacts",
                      fb.appId,
                      "users",
                      effectiveUid,
                      "profile",
                      "main"
                    )
                  );
                  // ✅ await後に再度マウント確認
                  if (!isMounted) return;
                  if (snap.exists()) {
                    const fbProfile = snap.data();
                    setProfile(fbProfile);
                    saveLocal("profile", fbProfile);
                    if (fbProfile.isTeacher) setIsAdmin(true);
                    // Firestoreから履歴も取得
                    try {
                      const histSnap = await getDocs(
                        query(
                          collection(
                            fb.db,
                            "artifacts",
                            fb.appId,
                            "users",
                            effectiveUid,
                            "history"
                          ),
                          limit(50)
                        )
                      );
                      if (!isMounted) return;
                      const fbHistory = histSnap.docs
                        .map((d) => ({ id: d.id, ...d.data() }))
                        .sort((a, b) => b.timestamp - a.timestamp);
                      if (fbHistory.length > 0) {
                        setHistory(fbHistory);
                        saveLocal("history", fbHistory);
                      }
                    } catch (e) {}
                    if (isMounted) setScreen("start");
                    return;
                  }
                } catch (e) {}
              }
              if (isMounted) setScreen(localProfile ? "start" : "login");
            }
          );
          // ✅ fallbackTimerをrefに保持してクリーンアップ可能にする
          fallbackTimer = setTimeout(() => {
            setScreen((prev) => {
              if (prev === "loading") return localProfile ? "start" : "login";
              return prev;
            });
          }, 3000);
        } catch (e) {
          if (isMounted) setScreen(localProfile ? "start" : "login");
        }
      } else {
        setScreen(localProfile ? "start" : "login");
      }
    };
    init();

    // ✅ クリーンアップ: フォールバックタイマー破棄 & マウントフラグ無効化
    return () => {
      isMounted = false;
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  const profileRef = React.useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const screenRef = React.useRef(screen);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  const activeFriendRef = React.useRef(activeFriend);
  useEffect(() => {
    activeFriendRef.current = activeFriend;
  }, [activeFriend]);

  // 複数端末対策: stageMap / startに戻るたびにFirestoreから最新プロフィールを同期
  useEffect(() => {
    if (!user?.uid || !fb.enabled || !["start", "stageMap"].includes(screen))
      return;
    const syncProfile = async () => {
      try {
        const snap = await getDoc(
          doc(
            fb.db,
            "artifacts",
            fb.appId,
            "users",
            user.uid,
            "profile",
            "main"
          )
        );
        if (!snap.exists()) {
          // キャッシュ由来や起動直後は無視、サーバー確定値のみ処理
          if (!snap.metadata.fromCache) forceLogout(true);
          return;
        }
        const latest = snap.data();
        const current = profileRef.current;
        // 進行度・経験値・ペットポイントはFirestoreの方が高ければ更新
        // clearedStagesはカテゴリ別に統合（両方のデータをマージ）
        const mergedCleared = { ...(latest.clearedStages || {}) };
        const curCleared = current?.clearedStages || {};
        for (const cat of Object.keys(curCleared)) {
          if (!mergedCleared[cat]) mergedCleared[cat] = curCleared[cat];
          else {
            const combined = new Set([
              ...mergedCleared[cat],
              ...curCleared[cat],
            ]);
            mergedCleared[cat] = Array.from(combined);
          }
        }
        const merged = {
          ...current,
          totalExp: Math.max(current?.totalExp || 0, latest.totalExp || 0),
          unlockedStage: Math.max(
            current?.unlockedStage || 1,
            latest.unlockedStage || 1
          ),
          petPoints: Math.max(current?.petPoints || 0, latest.petPoints || 0),
          petAffection: Math.max(
            current?.petAffection || 0,
            latest.petAffection || 0
          ),
          streakCount: Math.max(
            current?.streakCount || 0,
            latest.streakCount || 0
          ),
          clearedStages: mergedCleared,
        };
        // 実際に差分がある場合のみ更新
        if (
          merged.totalExp !== current?.totalExp ||
          merged.unlockedStage !== current?.unlockedStage ||
          merged.petPoints !== current?.petPoints
        ) {
          setProfile(merged);
          saveLocal("profile", merged);
        }
      } catch (e) {}
    };
    syncProfile();
  }, [screen, user]);

  // 削除検知は syncProfile（画面遷移時）のみで行う（onSnapshotは誤検知が多いため廃止）

  // チャット発言権限設定の購読
  useEffect(() => {
    if (!fb.enabled) return;
    const unsubChat = onSnapshot(
      doc(fb.db, "artifacts", fb.appId, "public", "data", "settings", "chat"),
      (snap) => {
        if (snap.exists()) setChatSettings(snap.data());
        else setChatSettings({ allowedUids: [] });
      },
      () => {}
    );
    return () => unsubChat();
  }, []);

  useEffect(() => {
    if (!user || !fb.enabled) return;

    const unsubA = onSnapshot(
      collection(
        fb.db,
        "artifacts",
        fb.appId,
        "public",
        "data",
        "announcements"
      ),
      (s) => {
        const sorted = s.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => b.timestamp - a.timestamp);
        setAnnouncements(sorted);
        // 最新のお知らせが変わったら非表示フラグをリセット
        if (sorted.length > 0) {
          const latestId = sorted[0].id;
          setAnnouncementDismissed((prev) => {
            if (prev !== latestId) return null;
            return prev;
          });
        }
      }
    );

    const unsubV = onSnapshot(
      collection(fb.db, "artifacts", fb.appId, "public", "data", "vocabulary"),
      (s) => {
        if (!s.empty) {
          const newList = s.docs.map((d) => ({ id: d.id, ...d.data() }));
          setVocabList(newList);
          // 初回以外で件数が増えたら通知
          if (
            prevVocabCountRef.current !== null &&
            newList.length > prevVocabCountRef.current
          ) {
            const diff = newList.length - prevVocabCountRef.current;
            if (notifVocabAdd)
              showToast(`先生から単語が${diff}問追加されました！`, "success");
          }
          prevVocabCountRef.current = newList.length;
        }
      }
    );

    const unsubL = onSnapshot(
      collection(fb.db, "artifacts", fb.appId, "public", "data", "leaderboard"),
      (s) => {
        // ★ 重複排除処理（同じshortIdを持つものを除外）
        const uniqueMap = new Map();
        s.docs.forEach((d) => {
          const data = d.data();
          if (!data.isTeacher) {
            const key = data.shortId || d.id;
            uniqueMap.set(key, { id: d.id, ...data });
          }
        });
        setLeaderboard(
          Array.from(uniqueMap.values()).sort((a, b) => b.score - a.score)
        );
      }
    );

    const unsubF = onSnapshot(
      collection(fb.db, "artifacts", fb.appId, "users", user.uid, "friends"),
      (s) => setFriends(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubR = onSnapshot(
      collection(fb.db, "artifacts", fb.appId, "users", user.uid, "review"),
      (s) => {
        const items = s.docs
          .map((d) => {
            const data = d.data();
            // dataのidフィールドは無視し、必ずFirestoreのdoc.idを使う
            const { id: _ignored, ...rest } = data;
            return { id: d.id, ...rest };
          })
          .filter((d) => !deletingReviewIds.current.has(d.id));
        setReviewList(items);
      }
    );
    const unsubC = onSnapshot(
      query(
        collection(fb.db, "artifacts", fb.appId, "public", "data", "chat"),
        orderBy("timestamp", "asc"),
        limit(100)
      ),
      (s) => setChatMessages(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubCV = onSnapshot(
      collection(
        fb.db,
        "artifacts",
        fb.appId,
        "public",
        "data",
        "customVocabulary"
      ),
      (s) => {
        if (!s.empty)
          setCustomVocabList(s.docs.map((d) => ({ id: d.id, ...d.data() })));
        else setCustomVocabList([]);
      }
    );

    const unsubUV = onSnapshot(
      collection(fb.db, "artifacts", fb.appId, "users", user.uid, "userVocab"),
      (s) => setUserVocabList(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => {}
    );

    const unsubTweet = onSnapshot(
      query(
        collection(fb.db, "artifacts", fb.appId, "public", "data", "tweets"),
        orderBy("createdAt", "desc"),
        limit(100)
      ),
      (s) => setTweets(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => {}
    );

    return () => {
      unsubA();
      unsubV();
      unsubL();
      unsubF();
      unsubR();
      unsubC();
      unsubCV();
      unsubUV();
      unsubTweet();
    };
  }, [user]);

  useEffect(() => {
    if (screen === "chat") {
      const ts =
        chatMessages.length > 0
          ? chatMessages[chatMessages.length - 1].timestamp
          : Date.now();
      localStorage.setItem("genron_lastReadChat", JSON.stringify(ts));
      setUnreadChat(0);
    } else {
      const lastRead = (() => {
        try {
          return Number(
            JSON.parse(localStorage.getItem("genron_lastReadChat")) || 0
          );
        } catch {
          return 0;
        }
      })();
      const myUid = user?.uid || "";
      const count = chatMessages.filter(
        (m) => (m.timestamp || 0) > lastRead && m.uid !== myUid
      ).length;
      setUnreadChat(notifChatUnread ? count : 0);
    }
  }, [screen, chatMessages, user]);

  // チャット画面: メッセージ更新時・画面表示時に最下部へスクロール
  useEffect(() => {
    if (screen === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [screen, chatMessages]);

  // DM画面: メッセージ更新時・画面表示時に最下部へスクロール
  useEffect(() => {
    if (screen === "dm") {
      dmEndRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [screen, dmMessages]);

  useEffect(() => {
    const t = THEMES.find((th) => th.id === themeId) || THEMES[0];
    document.body.style.backgroundColor = t.bgColor;
    let styleEl = document.getElementById("theme-override");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "theme-override";
      document.head.appendChild(styleEl);
    }
    if (themeId === "light") {
      styleEl.textContent = `
        [data-theme="light"] { color: ${t.text}; }
        [data-theme="light"] .text-white,
        [data-theme="light"] [class*="text-white"] { color: ${t.text} !important; }
        [data-theme="light"] .text-white\\/60,
        [data-theme="light"] .text-white\\/50,
        [data-theme="light"] .text-white\\/40,
        [data-theme="light"] .text-white\\/30,
        [data-theme="light"] .text-white\\/25,
        [data-theme="light"] .text-white\\/20 { color: ${t.textMuted} !important; }
        [data-theme="light"] .text-slate-300,
        [data-theme="light"] .text-slate-400 { color: ${t.textMuted} !important; }
        [data-theme="light"] ::placeholder { color: ${t.textMuted} !important; }
        [data-theme="light"] input,
        [data-theme="light"] input[type="text"],
        [data-theme="light"] input[type="password"],
        [data-theme="light"] textarea { color: ${t.text} !important; }
        [data-theme="light"] p, [data-theme="light"] span, [data-theme="light"] h1,
        [data-theme="light"] h2, [data-theme="light"] h3, [data-theme="light"] h4,
        [data-theme="light"] code, [data-theme="light"] label { color: ${t.text}; }
        [data-theme="light"] .bg-amber-500 { color: white !important; }
        [data-theme="light"] .bg-amber-500 span,
        [data-theme="light"] .bg-amber-500 p { color: white !important; }
        [data-theme="light"] .text-amber-400 { color: #b45309 !important; }
        [data-theme="light"] .text-amber-300 { color: #d97706 !important; }
        [data-theme="light"] .text-amber-200 { color: #92620a !important; }
        [data-theme="light"] .text-rose-400 { color: #be123c !important; }
        [data-theme="light"] .text-emerald-400 { color: #047857 !important; }
        [data-theme="light"] .text-indigo-400 { color: #4338ca !important; }
        [data-theme="light"] .text-violet-400 { color: #6d28d9 !important; }
        [data-theme="light"] .text-yellow-400 { color: #b45309 !important; }
      `;
    } else {
      styleEl.textContent = "";
    }
  }, [themeId]);

  useEffect(() => {
    if (!user || !fb.enabled || friends.length === 0) return;
    // ログイン直後 lastReadDm が未設定のフレンドには「今」をセット（過去メッセージを未読扱いしない）
    friends.forEach((f) => {
      if (!loadLocal(`lastReadDm_${f.id}`)) {
        saveLocal(`lastReadDm_${f.id}`, Date.now().toString());
      }
    });
    const unsubs = friends.map((f) => {
      const roomId = [user.uid, f.id].sort().join("_");
      return onSnapshot(
        query(
          collection(fb.db, "artifacts", fb.appId, "chats", roomId, "messages"),
          orderBy("timestamp", "desc"),
          limit(1)
        ),
        (s) => {
          if (s.empty) return;
          const latest = s.docs[0].data();
          if (latest.uid === user.uid) return;
          const lastRead = Number(loadLocal(`lastReadDm_${f.id}`) || 0);
          if (latest.timestamp > lastRead) {
            setUnreadDm((prev) => {
              if (
                screenRef.current === "dm" &&
                activeFriendRef.current?.id === f.id
              )
                return { ...prev, [f.id]: 0 };
              return { ...prev, [f.id]: 1 };
            });
          }
        }
      );
    });
    return () => unsubs.forEach((u) => u());
  }, [friends, user]); // screen/activeFriendはrefで参照するため依存配列から除外

  useEffect(() => {
    if (screen === "dm" && user && activeFriend && fb.enabled) {
      const roomId = [user.uid, activeFriend.id].sort().join("_");
      saveLocal(`lastReadDm_${activeFriend.id}`, Date.now().toString());
      setUnreadDm((prev) => ({ ...prev, [activeFriend.id]: 0 }));

      const unsubDM = onSnapshot(
        query(
          collection(fb.db, "artifacts", fb.appId, "chats", roomId, "messages"),
          limit(50)
        ),
        (s) => {
          const msgs = s.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => a.timestamp - b.timestamp);
          setDmMessages(msgs);
          if (msgs.length > 0) {
            saveLocal(`lastReadDm_${activeFriend.id}`, Date.now().toString());
            setUnreadDm((prev) => ({ ...prev, [activeFriend.id]: 0 }));
          }
        }
      );
      return () => unsubDM();
    }
  }, [screen, activeFriend, user]);

  // PWAアイコン設定（Safari / Android ホーム画面追加用）
  useEffect(() => {
    // ログイン画面SVGイラストと同じフクロウSVGをBase64に変換してアイコンとして設定
    const svgStr = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#1a0e3a"/>
          <stop offset="40%" stop-color="#0f1a40"/>
          <stop offset="100%" stop-color="#1a0a2e"/>
        </linearGradient>
        <linearGradient id="owl" x1="135" y1="94" x2="377" y2="418" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#f0c060"/>
          <stop offset="50%" stop-color="#e08020"/>
          <stop offset="100%" stop-color="#c06010"/>
        </linearGradient>
        <linearGradient id="star" x1="350" y1="67" x2="471" y2="202" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ffe566"/>
          <stop offset="100%" stop-color="#ff8c00"/>
        </linearGradient>
        <radialGradient id="glow" cx="256" cy="256" r="256" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#6040d0" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#6040d0" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#bg)"/>
      <rect width="512" height="512" rx="112" fill="url(#glow)"/>
      <circle cx="81" cy="94" r="8" fill="rgba(255,220,100,0.7)"/>
      <circle cx="431" cy="67" r="6" fill="rgba(200,180,255,0.6)"/>
      <circle cx="458" cy="377" r="7" fill="rgba(255,200,100,0.5)"/>
      <circle cx="54" cy="350" r="5" fill="rgba(180,200,255,0.5)"/>
      <circle cx="391" cy="445" r="5" fill="rgba(255,180,220,0.5)"/>
      <ellipse cx="256" cy="337" rx="121" ry="108" stroke="url(#owl)" stroke-width="13" fill="rgba(240,180,60,0.1)"/>
      <ellipse cx="256" cy="357" rx="67" ry="74" stroke="rgba(255,240,200,0.5)" stroke-width="8" fill="rgba(255,240,200,0.12)"/>
      <path d="M148 350 Q256 317 364 350" stroke="rgba(240,160,40,0.4)" stroke-width="8" stroke-linecap="round"/>
      <path d="M135 323 Q81 350 88 418 Q135 384 142 337 Z" stroke="url(#owl)" stroke-width="12" fill="rgba(200,130,30,0.2)"/>
      <path d="M377 323 Q431 350 424 418 Q377 384 370 337 Z" stroke="url(#owl)" stroke-width="12" fill="rgba(200,130,30,0.2)"/>
      <path d="M189 162 L162 94 L216 148 Z" stroke="url(#owl)" stroke-width="12" fill="rgba(200,140,40,0.3)"/>
      <path d="M323 162 L350 94 L296 148 Z" stroke="url(#owl)" stroke-width="12" fill="rgba(200,140,40,0.3)"/>
      <circle cx="256" cy="202" r="114" stroke="url(#owl)" stroke-width="13" fill="rgba(240,180,60,0.1)"/>
      <ellipse cx="256" cy="209" rx="94" ry="88" stroke="rgba(240,200,120,0.4)" stroke-width="8" fill="rgba(240,200,120,0.06)"/>
      <circle cx="202" cy="189" r="50" stroke="#e8a020" stroke-width="12" fill="rgba(255,255,255,0.9)"/>
      <circle cx="310" cy="189" r="50" stroke="#e8a020" stroke-width="12" fill="rgba(255,255,255,0.9)"/>
      <circle cx="205" cy="192" r="34" fill="#c87800"/>
      <circle cx="313" cy="192" r="34" fill="#c87800"/>
      <circle cx="205" cy="192" r="19" fill="#1a1000"/>
      <circle cx="313" cy="192" r="19" fill="#1a1000"/>
      <circle cx="215" cy="179" r="10" fill="white"/>
      <circle cx="323" cy="179" r="10" fill="white"/>
      <path d="M226 243 L256 284 L286 243 Z" stroke="#d97706" stroke-width="9" stroke-linejoin="round" fill="rgba(245,158,11,0.8)"/>
      <line x1="226" y1="243" x2="286" y2="243" stroke="#b45309" stroke-width="7"/>
      <rect x="310" y="377" width="94" height="94" rx="17" stroke="rgba(100,140,255,0.6)" stroke-width="10" fill="rgba(60,90,200,0.2)"/>
      <line x1="330" y1="404" x2="384" y2="404" stroke="rgba(180,200,255,0.5)" stroke-width="7"/>
      <line x1="330" y1="424" x2="371" y2="424" stroke="rgba(180,200,255,0.4)" stroke-width="7"/>
      <path d="M404 121 L412 148 L440 148 L418 165 L426 192 L404 175 L382 192 L390 165 L368 148 L396 148 Z" stroke="url(#star)" stroke-width="7" fill="rgba(255,200,50,0.7)"/>
    </svg>`;
    const setOrReplaceLink = (rel, href, sizes) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement("link"); el.rel = rel; document.head.appendChild(el); }
      el.href = href;
      if (sizes) el.setAttribute("sizes", sizes);
    };

    // SafariはSVGのapple-touch-iconを無視するのでCanvasでPNGに変換する
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 512, 512);
      URL.revokeObjectURL(svgUrl);
      const pngUrl = canvas.toDataURL("image/png");

      setOrReplaceLink("apple-touch-icon", pngUrl, "512x512");
      setOrReplaceLink("apple-touch-icon-precomposed", pngUrl, "512x512");
      setOrReplaceLink("icon", pngUrl, "512x512");

      // Android用 manifest (動的生成)
      const manifestObj = {
        name: "ORITAN",
        short_name: "ORITAN",
        start_url: "./",
        display: "standalone",
        background_color: "#0f1a40",
        theme_color: "#1a0e3a",
        icons: [
          { src: pngUrl, sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      };
      const manifestBlob = new Blob([JSON.stringify(manifestObj)], { type: "application/json" });
      const manifestUrl = URL.createObjectURL(manifestBlob);
      setOrReplaceLink("manifest", manifestUrl);
    };
    img.src = svgUrl;
  }, []);

  const speak = (text) => {
    if (!window.speechSynthesis || !text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  };

  const formatSentence = (sentence, word) => {
    if (!sentence || !word) return sentence || "";
    // 日本語・古文・化学用語:  が効かないので直接置換
    const isJapanese = /[ぁ-ん々ー]|[一-鿿]|[ァ-ヶ]/.test(word);
    if (isJapanese) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const result = sentence.replace(new RegExp(escaped, "g"), "______");
      return result.includes("______") ? result : sentence;
    }
    // 英語: 語幹末尾削りでマッチ
    for (let cut = 0; cut <= 3; cut++) {
      if (word.length - cut < 3) break;
      const stem = cut === 0 ? word : word.slice(0, word.length - cut);
      const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\w*\\b`, "gi");
      const result = sentence.replace(regex, "______");
      if (result.includes("______")) return result;
    }
    return sentence;
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const canPost =
      profile?.isTeacher ||
      (chatSettings.allowedUids || []).includes(user?.uid || "");
    if (!canPost) {
      showToast("発言権限がありません", "error");
      return;
    }
    const newMessage = {
      text: chatInput,
      uid: user?.uid || "local-user",
      name: profile?.name || "User",
      avatar: profile?.avatar || "bear",
      color: profile?.color || "bg-amber-500",
      isTeacher: profile?.isTeacher || false,
      timestamp: Date.now(),
    };
    if (user && fb.enabled)
      await addDoc(
        collection(fb.db, "artifacts", fb.appId, "public", "data", "chat"),
        newMessage
      );
    else
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), ...newMessage },
      ]);
    setChatInput("");
    setTimeout(
      () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const handleSendDM = async () => {
    if (!dmInput.trim() || !activeFriend) return;
    const newMessage = {
      text: dmInput,
      uid: user?.uid || "local-user",
      timestamp: Date.now(),
    };
    if (user && fb.enabled) {
      const roomId = [user.uid, activeFriend.id].sort().join("_");
      await addDoc(
        collection(fb.db, "artifacts", fb.appId, "chats", roomId, "messages"),
        newMessage
      );
    } else
      setDmMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), ...newMessage },
      ]);
    setDmInput("");
    setTimeout(
      () => dmEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const handleSearchById = async () => {
    if (!searchId.trim()) return;
    const queryId = searchId.trim().toUpperCase();
    if (queryId === profile?.shortId) {
      alert("自分のIDです！");
      return;
    }
    let targetUser = leaderboard.find((u) => u.shortId === queryId);
    if (!targetUser && fb.enabled) {
      try {
        // leaderboard（生徒）を検索
        const snap = await getDocs(
          collection(
            fb.db,
            "artifacts",
            fb.appId,
            "public",
            "data",
            "leaderboard"
          )
        );
        const allUsers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        targetUser = allUsers.find((u) => u.shortId === queryId);
      } catch (error) {
        console.warn("leaderboard検索中にエラー:", error);
      }
    }
    if (!targetUser && fb.enabled) {
      try {
        // teacherIndex（先生）を検索
        const tSnap = await getDocs(
          collection(
            fb.db,
            "artifacts",
            fb.appId,
            "public",
            "data",
            "teacherIndex"
          )
        );
        const allTeachers = tSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        targetUser = allTeachers.find((u) => u.shortId === queryId);
      } catch (error) {
        console.warn("teacherIndex検索中にエラー:", error);
      }
    }
    if (targetUser) setSearchResult(targetUser);
    else alert("ユーザーが見つかりませんでした。");
  };

  const handleAddFriend = async (targetUser) => {
    if (!fb.db || !user?.uid) {
      alert("ログインが完了していません。");
      return;
    }
    const myUid = user?.uid;
    const targetUid = targetUser.uid || targetUser.id;
    if (!targetUid || myUid === targetUid) return;

    try {
      await setDoc(
        doc(fb.db, "artifacts", fb.appId, "users", myUid, "friends", targetUid),
        {
          id: targetUid,
          uid: targetUid,
          name: targetUser.name,
          avatar: targetUser.avatar,
          color: targetUser.color,
          isTeacher: targetUser.isTeacher || false,
          addedAt: Date.now(),
        }
      );
      try {
        await setDoc(
          doc(
            fb.db,
            "artifacts",
            fb.appId,
            "users",
            targetUid,
            "friends",
            myUid
          ),
          {
            id: myUid,
            uid: myUid,
            name: profile.name,
            avatar: profile.avatar,
            color: profile.color,
            isTeacher: profile.isTeacher || false,
            addedAt: Date.now(),
          }
        );
      } catch (e) {}
      alert(`${targetUser.name}さんをフレンドに追加しました！`);
      setSearchResult(null);
      setSearchId("");
      setScreen("friendsList");
    } catch (e) {
      alert("フレンド追加に失敗しました。");
    }
  };

  const handleRemoveFriend = async (friend) => {
    if (!fb.db || !user?.uid) return;
    if (!window.confirm(`${friend.name}さんをフレンドから削除しますか？`))
      return;
    const friendId = friend.uid || friend.id;
    try {
      await deleteDoc(
        doc(
          fb.db,
          "artifacts",
          fb.appId,
          "users",
          user.uid,
          "friends",
          friendId
        )
      );
      try {
        await deleteDoc(
          doc(
            fb.db,
            "artifacts",
            fb.appId,
            "users",
            friendId,
            "friends",
            user.uid
          )
        );
      } catch (e) {}
      // 未読通知をstateとlocalStorageの両方からクリア
      setUnreadDm((prev) => {
        const next = { ...prev };
        delete next[friendId];
        return next;
      });
      localStorage.removeItem(`genron_lastReadDm_${friendId}`);
      // フレンドリストからも即時削除
      setFriends((prev) => prev.filter((f) => (f.uid || f.id) !== friendId));
      showToast("フレンドを削除しました");
    } catch (error) {
      showToast("削除に失敗しました", "error");
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Googleスプレッドシートからの単語インポート
  const importFromSheet = async (url, stageNum) => {
    setSheetImporting(true);
    setSheetPreview(null);
    try {
      // 公開スプレッドシートのURLをCSVエクスポートURLに変換
      let csvUrl = url.trim();
      // https://docs.google.com/spreadsheets/d/SHEET_ID/edit... 形式を変換
      const match = csvUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      if (!match)
        throw new Error(
          "URLが正しくありません。GoogleスプレッドシートのURLを入力してください。"
        );
      const sheetId = match[1];
      // gidパラメータがあれば取得
      const gidMatch = csvUrl.match(/[#&?]gid=([0-9]+)/);
      const gid = gidMatch ? gidMatch[1] : "0";
      csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

      const res = await fetch(csvUrl);
      if (!res.ok)
        throw new Error(
          "スプレッドシートを取得できません。「ウェブに公開」されているか確認してください。"
        );
      const text = await res.text();

      // CSV解析（1行目=ヘッダー: en, ja, sentence）
      const lines = text.trim().split(/\r?\n/);
      const errors = [];
      const words = [];

      // ヘッダー行をスキップして解析
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        // CSV正しく分割（クォート対応）
        const cols =
          line
            .match(/(".*?"|[^,]+)(?=,|$)/g)
            ?.map((c) => c.replace(/^"|"$/g, "").trim()) || [];
        const en = cols[0] || "";
        const ja = cols[1] || "";
        const sentence = cols[2] || "";
        if (!en || !ja) {
          errors.push(`行${i + 1}: 単語または意味が空です`);
          continue;
        }
        words.push({ en, ja, sentence, stage: stageNum || 1 });
      }
      setSheetPreview({ words, errors, total: lines.length - 1 });
    } catch (e) {
      showToast(e.message || "読み込みエラー", "error");
    }
    setSheetImporting(false);
  };

  const commitSheetImport = async (words, replaceAll) => {
    if (!fb.enabled || !fb.db) return showToast("Firebase未接続", "error");
    setSheetImporting(true);
    try {
      const vocabRef = collection(
        fb.db,
        "artifacts",
        fb.appId,
        "public",
        "data",
        "vocabulary"
      );
      if (replaceAll) {
        // 既存を全削除してから追加
        const existing = await getDocs(vocabRef);
        const batch = writeBatch(fb.db);
        existing.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      // バッチで追加（500件制限に対応）
      for (let i = 0; i < words.length; i += 400) {
        const batch = writeBatch(fb.db);
        words.slice(i, i + 400).forEach((w) => {
          batch.set(
            doc(
              fb.db,
              "artifacts",
              fb.appId,
              "public",
              "data",
              "vocabulary",
              `${w.en}_${w.stage}`
            ),
            w
          );
        });
        await batch.commit();
      }
      showToast(`${words.length}語を登録しました！`, "success");
      setSheetPreview(null);
      setSheetUrl("");
    } catch (e) {
      showToast("登録エラー: " + e.message, "error");
    }
    setSheetImporting(false);
  };

  // AI で紛らわしい誤答3択を生成
  const generateAIDistractors = async (word, allWords) => {
    // まず vocabList から候補を素早く用意しておく（フォールバック用）
    const fallback = allWords
      .filter((w) => w.en !== word.en)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    try {
      const apiKey = localStorage.getItem("genron_anthropicApiKey") || "";
      if (!apiKey) return fallback;

      const otherWords = allWords
        .filter((w) => w.en !== word.en)
        .slice(0, 40)
        .map((w) => `${w.en}（${w.ja}）`)
        .join(", ");

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: `英単語4択クイズの誤答を選んでください。
正解の単語: "${word.en}"（${word.ja}）
候補リスト: ${otherWords}

候補リストの中から、正解と意味や語形が紛らわしい単語を3つ選び、
以下のJSON形式だけで返してください（説明不要）:
{"distractors": ["単語1", "単語2", "単語3"]}`,
            },
          ],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const distractorWords = parsed.distractors
        .map((en) => allWords.find((w) => w.en === en))
        .filter(Boolean)
        .slice(0, 3);
      // 3つ揃わなかったらフォールバックで補完
      if (distractorWords.length === 3) return distractorWords;
      const extra = fallback.filter(
        (w) => !distractorWords.find((d) => d.en === w.en)
      );
      return [...distractorWords, ...extra].slice(0, 3);
    } catch {
      return fallback;
    }
  };

  // 復習クイズの問題をセット
  const startReviewQuiz = async (idx, list) => {
    const word = list[idx];
    if (!word) return;
    setReviewQuizLoading(true);
    setReviewQuizFeedback(null);
    const pool = vocabList.length >= 4 ? vocabList : DEFAULT_VOCAB;
    const distractors = await generateAIDistractors(word, pool);
    const opts = [word, ...distractors].sort(() => 0.5 - Math.random());
    setReviewQuizOptions(opts);
    setReviewQuizLoading(false);
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;
    if (!fb.db || !fb.auth) return showToast("Firebase未接続です", "error");
    try {
      await addDoc(
        collection(
          fb.db,
          "artifacts",
          fb.appId,
          "public",
          "data",
          "announcements"
        ),
        {
          text: newAnnouncement,
          timestamp: Date.now(),
          uid: user?.uid || "admin",
        }
      );
      setNewAnnouncement("");
      showToast("お知らせを送信しました！");
    } catch (e) {
      showToast("送信エラー: " + e.message, "error");
    }
  };

  const handleDeleteChatMessage = async (messageId) => {
    if (!fb.db) return;
    try {
      await deleteDoc(
        doc(fb.db, "artifacts", fb.appId, "public", "data", "chat", messageId)
      );
    } catch (e) {
      showToast("削除エラー", "error");
    }
  };

  const handleDeleteUser = async (targetUid, targetShortId) => {
    if (!fb.db) return;
    if (
      !window.confirm(`UID: ${targetShortId} のユーザーを完全に削除しますか？`)
    )
      return;
    try {
      await deleteDoc(
        doc(fb.db, "artifacts", fb.appId, "users", targetUid, "profile", "main")
      );
      await deleteDoc(
        doc(
          fb.db,
          "artifacts",
          fb.appId,
          "public",
          "data",
          "leaderboard",
          targetUid
        )
      );
      // teacherIndexからも削除（先生の場合）
      try {
        await deleteDoc(
          doc(
            fb.db,
            "artifacts",
            fb.appId,
            "public",
            "data",
            "teacherIndex",
            targetUid
          )
        );
      } catch (e) {}
      // チャットメッセージを削除
      try {
        const chatSnap = await getDocs(
          query(
            collection(fb.db, "artifacts", fb.appId, "public", "data", "chat"),
            where("uid", "==", targetUid)
          )
        );
        await Promise.allSettled(chatSnap.docs.map((d) => deleteDoc(d.ref)));
      } catch (e) {}
      // パスワード一覧のstateからも即時削除
      setPasswordList((prev) =>
        prev.filter((u) => (u.uid || u.id) !== targetUid)
      );
      showToast("ユーザーを削除しました");
    } catch (e) {
      showToast("削除エラー", "error");
    }
  };

  // リアクション送信（絵文字スタンプをチャットに流す）
  const handleSendReaction = async (emoji) => {
    if (!user?.uid) return;
    const msg = {
      uid: user.uid,
      name: profile?.name || "匿名",
      avatar: profile?.avatar || "",
      color: profile?.color || "bg-amber-500",
      isTeacher: false,
      text: emoji,
      isReaction: true,
      timestamp: Date.now(),
    };
    if (fb.enabled && fb.db) {
      try {
        await addDoc(
          collection(fb.db, "artifacts", fb.appId, "public", "data", "chat"),
          msg
        );
      } catch (e) {}
    }
  };

  // チャット発言権限の付与/剥奪
  const handleToggleChatPermission = async (targetUid) => {
    if (!fb.db) return;
    const current = chatSettings.allowedUids || [];
    const next = current.includes(targetUid)
      ? current.filter((id) => id !== targetUid)
      : [...current, targetUid];
    const newSettings = { ...chatSettings, allowedUids: next };
    try {
      await setDoc(
        doc(fb.db, "artifacts", fb.appId, "public", "data", "settings", "chat"),
        newSettings,
        { merge: true }
      );
      setChatSettings(newSettings);
      const target = leaderboard.find((u) => (u.uid || u.id) === targetUid);
      showToast(
        next.includes(targetUid)
          ? `${target?.name || "ユーザー"}に発言権限を付与しました`
          : `${target?.name || "ユーザー"}の発言権限を剥奪しました`
      );
    } catch (e) {
      showToast("権限の更新に失敗しました", "error");
    }
  };

  // コイン配布
  const handleGiveCoins = async (targetUid, targetName, amount) => {
    if (!fb.db || !amount || amount <= 0) return;
    try {
      const profileSnap = await getDoc(
        doc(fb.db, "artifacts", fb.appId, "users", targetUid, "profile", "main")
      );
      if (!profileSnap.exists()) {
        showToast("ユーザーが見つかりません", "error");
        return;
      }
      const current = profileSnap.data();
      const newPoints = (current.petPoints || 0) + amount;
      const updated = { ...current, petPoints: newPoints };
      await setDoc(
        doc(
          fb.db,
          "artifacts",
          fb.appId,
          "users",
          targetUid,
          "profile",
          "main"
        ),
        updated,
        { merge: true }
      );
      // leaderboard も更新
      await setDoc(
        doc(
          fb.db,
          "artifacts",
          fb.appId,
          "public",
          "data",
          "leaderboard",
          targetUid
        ),
        { petPoints: newPoints },
        { merge: true }
      ).catch(() => null);
      showToast(`${targetName}さんに${amount}コイン配布しました！`);
    } catch (e) {
      showToast("配布エラー: " + e.message, "error");
    }
  };

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginError("IDとパスワードを入力してください");
      return;
    }
    setIsLoggingIn(true);
    setLoginError("");
    try {
      let targetUid = null;
      let targetProfile = null;
      const lbSnap = await getDocs(
        collection(
          fb.db,
          "artifacts",
          fb.appId,
          "public",
          "data",
          "leaderboard"
        )
      );
      const lbUser = lbSnap.docs.find(
        (d) => d.data().shortId === loginId.trim().toUpperCase()
      );
      if (lbUser) targetUid = lbUser.id;
      if (!targetUid) {
        const teacherSnap = await getDocs(
          collection(
            fb.db,
            "artifacts",
            fb.appId,
            "public",
            "data",
            "teacherIndex"
          )
        );
        const teacherDoc = teacherSnap.docs.find(
          (d) => d.data().shortId === loginId.trim().toUpperCase()
        );
        if (teacherDoc) targetUid = teacherDoc.id;
      }
      if (!targetUid) {
        setLoginError("IDが見つかりません");
        setIsLoggingIn(false);
        return;
      }
      const profileSnap = await getDoc(
        doc(fb.db, "artifacts", fb.appId, "users", targetUid, "profile", "main")
      );
      if (!profileSnap.exists()) {
        setLoginError("アカウントが見つかりません");
        setIsLoggingIn(false);
        return;
      }
      targetProfile = profileSnap.data();
      if (targetProfile.password !== loginPassword) {
        setLoginError("パスワードが違います");
        setIsLoggingIn(false);
        return;
      }

      setProfile(targetProfile);
      saveLocal("profile", targetProfile);
      saveLocal("uid", targetUid);
      if (targetProfile.isTeacher) setIsAdmin(true);

      // Firestoreから履歴を取得してlocalStorageに保存
      try {
        const histSnap = await getDocs(
          query(
            collection(
              fb.db,
              "artifacts",
              fb.appId,
              "users",
              targetUid,
              "history"
            ),
            limit(50)
          )
        );
        const fbHistory = histSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => b.timestamp - a.timestamp);
        setHistory(fbHistory);
        saveLocal("history", fbHistory);
      } catch (e) {
        // 取得失敗時はlocalのものをそのまま使う
      }

      await signInAnonymously(fb.auth);
      setUser({ uid: targetUid });
      setScreen("start");
      setLoginId("");
      setLoginPassword("");
    } catch (e) {
      setLoginError("ログインエラー: " + e.message);
    }
    setIsLoggingIn(false);
  };

  // 強制ログアウト（確認ダイアログなし・アカウント削除検知時に使用）
  const forceLogout = (showDeletedToast = true) => {
    // ログイン画面・loading画面では誤発動を防ぐためスキップ
    const currentScreen = screenRef.current;
    if (
      currentScreen === "login" ||
      currentScreen === "loading" ||
      currentScreen === "register"
    )
      return;
    ["profile", "history", "uid", "lastReadChat"].forEach((k) =>
      localStorage.removeItem(`genron_${k}`)
    );
    Object.keys(localStorage)
      .filter((k) => k.startsWith("genron_lastReadDm_"))
      .forEach((k) => localStorage.removeItem(k));
    setProfile(null);
    setUser(null);
    setHistory([]);
    setFriends([]);
    setReviewList([]);
    setLeaderboard([]);
    setChatMessages([]);
    setAnnouncements([]);
    setDmMessages([]);
    setActiveFriend(null);
    setIsAdmin(false);
    setUnreadChat(0);
    setUnreadDm({});
    setScreen("login");
    // ✅ Firebaseの認証セッションを破棄
    if (fb.enabled) signOut(fb.auth).catch(() => null);
    if (showDeletedToast) {
      setTimeout(
        () => setToast({ msg: "アカウントが削除されました", type: "error" }),
        200
      );
    }
  };

  const handleLogout = () => {
    if (!window.confirm("ログアウトしますか？")) return;
    ["profile", "history", "uid", "lastReadChat"].forEach((k) =>
      localStorage.removeItem(`genron_${k}`)
    );
    Object.keys(localStorage)
      .filter((k) => k.startsWith("genron_lastReadDm_"))
      .forEach((k) => localStorage.removeItem(k));
    setProfile(null);
    setUser(null);
    setHistory([]);
    setFriends([]);
    setReviewList([]);
    setLeaderboard([]);
    setChatMessages([]);
    setAnnouncements([]);
    setDmMessages([]);
    setActiveFriend(null);
    setIsAdmin(false);
    setUnreadChat(0);
    setUnreadDm({});
    // ✅ Firebaseの認証セッションを破棄（これがないとonAuthStateChangedで自動再ログインされる）
    if (fb.enabled) signOut(fb.auth).catch(() => null);
    setScreen("login");
  };

  const handleResetProgress = async () => {
    if (
      !window.confirm(
        "経験値・ステージ進捗・ペット・履歴をすべてリセットしますか？\nアカウント（名前・ID・パスワード）は残ります。"
      )
    )
      return;
    if (!window.confirm("本当にリセットしますか？この操作は取り消せません。"))
      return;
    const resetProfile = {
      ...profile,
      totalExp: 0,
      unlockedStage: 1,
      petPoints: 0,
      ownedPets: [],
      ownedAccessories: [],
      petNames: {},
      petAccessories: {},
      activePet: null,
    };
    setProfile(resetProfile);
    setHistory([]);
    saveLocal("profile", resetProfile);
    saveLocal("history", []);
    const uid = user?.uid;
    if (fb.db && uid) {
      try {
        await setDoc(
          doc(fb.db, "artifacts", fb.appId, "users", uid, "profile", "main"),
          resetProfile,
          { merge: true }
        );
        await setDoc(
          doc(
            fb.db,
            "artifacts",
            fb.appId,
            "public",
            "data",
            "leaderboard",
            uid
          ),
          { ...resetProfile, score: 0 },
          { merge: true }
        );
        // 履歴コレクションを削除
        const histSnap = await getDocs(
          collection(fb.db, "artifacts", fb.appId, "users", uid, "history")
        ).catch(() => ({ docs: [] }));
        await Promise.allSettled(histSnap.docs.map((d) => deleteDoc(d.ref)));
      } catch (e) {
        console.error("リセットエラー:", e);
      }
    }
    showToast("進捗をリセットしました");
  };

  const handleSelfDeleteAccount = async () => {
    if (
      !window.confirm(
        "アカウントを完全に削除しますか？\nこの操作は取り消せません。"
      )
    )
      return;
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      const uid = user?.uid;
      if (fb.db && uid) {
        await Promise.allSettled([
          deleteDoc(
            doc(fb.db, "artifacts", fb.appId, "users", uid, "profile", "main")
          ),
          deleteDoc(
            doc(
              fb.db,
              "artifacts",
              fb.appId,
              "public",
              "data",
              "leaderboard",
              uid
            )
          ),
          deleteDoc(
            doc(
              fb.db,
              "artifacts",
              fb.appId,
              "public",
              "data",
              "teacherIndex",
              uid
            )
          ),
        ]);
        const myFriendsSnap = await getDocs(
          collection(fb.db, "artifacts", fb.appId, "users", uid, "friends")
        ).catch(() => ({ docs: [] }));
        await Promise.allSettled(
          myFriendsSnap.docs.map((fd) =>
            deleteDoc(
              doc(fb.db, "artifacts", fb.appId, "users", fd.id, "friends", uid)
            ).catch(() => null)
          )
        );
      }
      localStorage.removeItem("genron_profile");
      localStorage.removeItem("genron_history");
      localStorage.removeItem("genron_uid");
      setProfile(null);
      setUser(null);
      setHistory([]);
      setFriends([]);
      setLeaderboard([]);
      setChatMessages([]);
      setIsAdmin(false);
      showToast("アカウントを削除しました");
      setScreen("login");
    } catch (e) {
      showToast("削除エラー", "error");
    }
  };

  const saveInviteCode = async () => {
    if (!editingInviteCode.trim() || !fb.db) return;
    setIsSavingInviteCode(true);
    try {
      const code = editingInviteCode.trim().toUpperCase();
      await setDoc(
        doc(
          fb.db,
          "artifacts",
          fb.appId,
          "public",
          "data",
          "settings",
          "inviteCode"
        ),
        { code, updatedAt: Date.now() }
      );
      setInviteCode(code);
      setEditingInviteCode("");
      showToast("招待コードを更新しました");
    } catch (e) {
      showToast("保存エラー", "error");
    }
    setIsSavingInviteCode(false);
  };

  const fetchInviteCode = async () => {
    if (!fb.db || inviteCodeFetched) return;
    setInviteCodeFetched(true);
    try {
      const snap = await getDoc(
        doc(
          fb.db,
          "artifacts",
          fb.appId,
          "public",
          "data",
          "settings",
          "inviteCode"
        )
      );
      setInviteCode(
        snap.exists()
          ? snap.data().code || DEFAULT_INVITE_CODE
          : DEFAULT_INVITE_CODE
      );
    } catch (e) {
      setInviteCode(DEFAULT_INVITE_CODE);
    }
  };

  // ── 汎用実績チェック＆交流自動投稿 ──────────────────────────────
  const checkAndPostAchievements = async (
    prevProfile,
    prevHistory,
    newProfile,
    newHistory
  ) => {
    const prevUnlocked = new Set(
      ACHIEVEMENTS.filter((a) => {
        try {
          return a.check(prevProfile, prevHistory);
        } catch {
          return false;
        }
      }).map((a) => a.id)
    );
    const newlyUnlocked = ACHIEVEMENTS.filter((a) => {
      try {
        return !prevUnlocked.has(a.id) && a.check(newProfile, newHistory);
      } catch {
        return false;
      }
    });
    if (newlyUnlocked.length === 0) return;

    // 通知ポップアップ
    const showNext = (i) => {
      if (i >= newlyUnlocked.length) return;
      const ach = newlyUnlocked[i];
      setAchvNotif({
        icon: ach.icon,
        IconComp: ach.IconComp,
        title: ach.title,
        rank: ach.rank,
        desc: ach.desc,
      });
      if (achvNotifTimer.current) clearTimeout(achvNotifTimer.current);
      achvNotifTimer.current = setTimeout(() => {
        setAchvNotif(null);
        setTimeout(() => showNext(i + 1), 400);
      }, 3500);
    };
    setTimeout(() => showNext(0), 800);

    // 交流に投稿
    const effectiveUid = user?.uid || fb.auth?.currentUser?.uid;
    if (fb.enabled && effectiveUid && !newProfile?.isTeacher) {
      for (const ach of newlyUnlocked) {
        try {
          await addDoc(
            collection(fb.db, "artifacts", fb.appId, "public", "data", "chat"),
            {
              text: `${ach.icon} 【${ach.title}】${ach.desc}`,
              uid: effectiveUid,
              name: newProfile?.name || "User",
              avatar: newProfile?.avatar || "👤",
              color: newProfile?.color || "bg-amber-500",
              isTeacher: false,
              isAchievement: true,
              isPublic: true,
              achRank: ach.rank,
              achColor: (RANK_META[ach.rank] || {}).color || "#c9a84c",
              timestamp: Date.now(),
            }
          );
        } catch (e) {
          console.error("実績投稿エラー:", e);
        }
      }
    } else if (!fb.enabled && !newProfile?.isTeacher) {
      const newPosts = newlyUnlocked.map((ach) => ({
        id: `ach_${Date.now()}_${ach.id}`,
        text: `${ach.icon} 【${ach.title}】${ach.desc}`,
        uid: "local-user",
        name: newProfile?.name || "User",
        avatar: newProfile?.avatar || "👤",
        color: newProfile?.color || "bg-amber-500",
        isTeacher: false,
        isAchievement: true,
        achRank: ach.rank,
        achColor: (RANK_META[ach.rank] || {}).color || "#c9a84c",
        timestamp: Date.now(),
      }));
      setChatMessages((prev) => [...prev, ...newPosts]);
    }
  };

  const handleShopBuy = (item, type, customName) => {
    const pts = profile?.petPoints || 0;
    if (pts < item.price) {
      showToast("ポイントが足りません", "error");
      return;
    }
    const owned = profile?.ownedPets || [];
    const ownedAcc = profile?.ownedAccessories || [];
    if (type === "pet" && owned.includes(item.id)) {
      showToast("すでに持っています");
      return;
    }
    if (type === "acc" && ownedAcc.includes(item.id)) {
      showToast("すでに持っています");
      return;
    }

    // ペット購入時: 名前入力ダイアログを表示（customNameがあればスキップ）
    if (type === "pet" && customName === undefined) {
      setPetNameInput(item.name);
      setPetNameModal({ pet: item });
      return;
    }

    const petNames = { ...(profile?.petNames || {}) };
    if (type === "pet" && customName) petNames[item.id] = customName;

    const newProfile = {
      ...profile,
      petPoints: pts - item.price,
      ownedPets: type === "pet" ? [...owned, item.id] : owned,
      ownedAccessories: type === "acc" ? [...ownedAcc, item.id] : ownedAcc,
      petNames,
    };
    setProfile(newProfile);
    saveLocal("profile", newProfile);
    if (user && fb.db)
      setDoc(
        doc(fb.db, "artifacts", fb.appId, "users", user.uid, "profile", "main"),
        newProfile,
        { merge: true }
      ).catch(() => null);
    showToast(`${customName || item.name}を購入しました！`);
    // 実績チェック（ペット購入で解除されるものがある）
    checkAndPostAchievements(profile, history, newProfile, history);
  };

  // ペットごとのアクセサリー取得
  const getPetAccessories = (petId) => {
    return (profile?.petAccessories || {})[petId] || [];
  };

  // ペットにアクセサリーを装着/外す
  const handleEquipAccForPet = (petId, accId) => {
    const current = getPetAccessories(petId);
    const acc = SHOP_ACCESSORIES.find((a) => a.id === accId);
    // 同じスロットの既存アクセサリーを外してから付ける
    let next;
    if (current.includes(accId)) {
      next = current.filter((id) => id !== accId);
    } else {
      const sameSlot = acc
        ? current.filter((id) => {
            const a = SHOP_ACCESSORIES.find((x) => x.id === id);
            return a?.slot === acc.slot;
          })
        : [];
      next = [...current.filter((id) => !sameSlot.includes(id)), accId];
    }
    const newProfile = {
      ...profile,
      petAccessories: { ...(profile?.petAccessories || {}), [petId]: next },
    };
    setProfile(newProfile);
    saveLocal("profile", newProfile);
    if (user && fb.db)
      setDoc(
        doc(fb.db, "artifacts", fb.appId, "users", user.uid, "profile", "main"),
        newProfile,
        { merge: true }
      ).catch(() => null);
  };

  const handleEquip = (item, type) => {
    if (type !== "pet") return; // アクセサリーは handleEquipAccForPet を使用
    const newProfile = { ...profile, activePet: item.id };
    setProfile(newProfile);
    saveLocal("profile", newProfile);
    if (user && fb.db)
      setDoc(
        doc(fb.db, "artifacts", fb.appId, "users", user.uid, "profile", "main"),
        newProfile,
        { merge: true }
      ).catch(() => null);
  };

  const toggleArr = (arr, id) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  // ★ ペット育成のお世話処理（petIdごとに個別管理）
  const getPetData = (petId) => {
    const pd = profile?.petData || {};
    return pd[petId] || { affection: 0, lastNadeDate: "", nadeCountToday: 0 };
  };

  const handleFeed = (petId) => {
    if ((profile?.petPoints || 0) < 5) {
      showToast("ポイントが足りません", "error");
      return;
    }
    const pd = getPetData(petId);
    const newAffection = (pd.affection || 0) + 10;
    const newPoints = (profile?.petPoints || 0) - 5;
    const newProfile = {
      ...profile,
      petPoints: newPoints,
      petData: {
        ...(profile?.petData || {}),
        [petId]: { ...pd, affection: newAffection },
      },
    };
    setProfile(newProfile);
    saveLocal("profile", newProfile);
    if (user && fb.db)
      setDoc(
        doc(fb.db, "artifacts", fb.appId, "users", user.uid, "profile", "main"),
        newProfile,
        { merge: true }
      ).catch(() => null);
    showToast("エサをあげました！ (なつき度+10)");
    // Lv10到達チェック
    const oldLv = getPetLvFromAffection(pd.affection || 0);
    const newLv = getPetLvFromAffection(newAffection);
    if (oldLv < 10 && newLv >= 10 && PET_HAT_AVATARS[petId]) {
      setTimeout(
        () =>
          showToast(
            `🎩 ${PET_HAT_AVATARS[petId].label} アバターが解放されました！`
          ),
        800
      );
    }
    setPetFeedEffect({ petId });
    setTimeout(() => setPetFeedEffect(null), 2400);
  };

  const handlePetInteract = (petId) => {
    const DAILY_LIMIT = 3;
    const today = new Date().toDateString();
    const pd = getPetData(petId);
    const countToday = pd.lastNadeDate === today ? pd.nadeCountToday || 0 : 0;
    if (countToday >= DAILY_LIMIT) {
      showToast(`今日はもうなでられません（1日${DAILY_LIMIT}回まで）`, "error");
      return;
    }
    const newAffection = (pd.affection || 0) + 2;
    const newProfile = {
      ...profile,
      petData: {
        ...(profile?.petData || {}),
        [petId]: {
          ...pd,
          affection: newAffection,
          lastNadeDate: today,
          nadeCountToday: countToday + 1,
        },
      },
    };
    setProfile(newProfile);
    saveLocal("profile", newProfile);
    if (user && fb.db)
      setDoc(
        doc(fb.db, "artifacts", fb.appId, "users", user.uid, "profile", "main"),
        newProfile,
        { merge: true }
      ).catch(() => null);
    showToast(
      `なでなでしました！ (なつき度+2) 本日${countToday + 1}/${DAILY_LIMIT}回`
    );
  };

  const fetchPasswordList = async () => {
    if (!fb.db) return;
    setIsLoadingPasswords(true);
    try {
      const lbSnap = await getDocs(
        collection(
          fb.db,
          "artifacts",
          fb.appId,
          "public",
          "data",
          "leaderboard"
        )
      );
      const results = await Promise.all(
        lbSnap.docs.map(async (d) => {
          try {
            const pSnap = await getDoc(
              doc(
                fb.db,
                "artifacts",
                fb.appId,
                "users",
                d.id,
                "profile",
                "main"
              )
            );
            if (pSnap.exists()) {
              const p = pSnap.data();
              return {
                uid: d.id,
                name: p.name,
                shortId: p.shortId,
                password: p.password || "（未設定）",
                avatar: p.avatar,
                color: p.color,
              };
            }
          } catch (e) {
            return null;
          }
          return null;
        })
      );
      setPasswordList(
        results
          .filter(Boolean)
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      );
    } catch (e) {
      showToast("取得エラー", "error");
    }
    setIsLoadingPasswords(false);
  };

  const handleRegister = async () => {
    if (!newName.trim()) return;
    if (newPassword && newPassword !== confirmPassword) {
      showToast("パスワードが一致しません", "error");
      return;
    }
    if (screen === "register" && !newPassword.trim()) {
      showToast("パスワードを設定してください", "error");
      return;
    }
    if (screen === "register" && teacherCodeInput === ADMIN_PASSCODE) {
      // 先生コードが正しければ招待コード不要 → そのまま通過
    } else if (screen === "register") {
      if (!inviteCodeInput.trim()) {
        setInviteCodeError("招待コードを入力してください");
        return;
      }
      let currentCode = DEFAULT_INVITE_CODE;
      if (fb.db) {
        const codeSnap = await getDoc(
          doc(
            fb.db,
            "artifacts",
            fb.appId,
            "public",
            "data",
            "settings",
            "inviteCode"
          )
        ).catch(() => null);
        if (codeSnap?.exists())
          currentCode = codeSnap.data().code || DEFAULT_INVITE_CODE;
      }
      if (inviteCodeInput.trim().toUpperCase() !== currentCode.toUpperCase()) {
        setInviteCodeError("招待コードが違います");
        return;
      }
    } // end else-if (not teacher code)

    setIsSavingProfile(true);
    const currentShortId = profile?.shortId || generateShortId();
    const teacherFlag =
      teacherCodeInput === ADMIN_PASSCODE ? true : profile?.isTeacher || false;
    const passwordToSave = newPassword.trim()
      ? newPassword.trim()
      : profile?.password || "";

    const data = {
      // 既存プロフィールを全て引き継ぎ、変更箇所だけ上書き
      ...(profile || {}),
      name: newName,
      displayName: newName,
      avatar: avatarImage || selectedAvatar.char,
      color: selectedColor.bg,
      totalExp: profile?.totalExp || 0,
      unlockedStage: profile?.unlockedStage || 1,
      streakCount: profile?.streakCount || 1,
      shortId: currentShortId,
      petPoints: profile?.petPoints || 0,
      petAffection: profile?.petAffection || 0,
      ownedPets: profile?.ownedPets || [],
      ownedAccessories: profile?.ownedAccessories || [],
      ownedRoomBgs: profile?.ownedRoomBgs || ["night"],
      activeRoomBg: profile?.activeRoomBg || "night",
      petNames: profile?.petNames || {},
      petAccessories: profile?.petAccessories || {},
      activePet: profile?.activePet || null,
      activeAccessories: profile?.activeAccessories || [],
      activeRoomBg: profile?.activeRoomBg || "night",
      ownedRoomBgs: profile?.ownedRoomBgs || ["night"],
      registeredAt: profile?.registeredAt || Date.now(),
      isTeacher: teacherFlag,
      password: passwordToSave,
    };
    if (teacherFlag) setIsAdmin(true);

    setProfile(data);
    saveLocal("profile", data);

    if (fb.db && fb.auth) {
      try {
        // 既にログイン済みならそのUIDを使い、未ログインなら匿名ログイン
        let uid = user?.uid;
        if (!uid) {
          const cred = await signInAnonymously(fb.auth);
          uid = cred.user.uid;
        }
        await setDoc(
          doc(fb.db, "artifacts", fb.appId, "users", uid, "profile", "main"),
          data,
          { merge: true }
        );
        if (!data.isTeacher) {
          await setDoc(
            doc(
              fb.db,
              "artifacts",
              fb.appId,
              "public",
              "data",
              "leaderboard",
              uid
            ),
            { ...data, score: data.totalExp },
            { merge: true }
          );
        } else {
          await setDoc(
            doc(
              fb.db,
              "artifacts",
              fb.appId,
              "public",
              "data",
              "teacherIndex",
              uid
            ),
            { shortId: data.shortId, uid }
          );
        }

        const myFriendsSnap = await getDocs(
          collection(fb.db, "artifacts", fb.appId, "users", uid, "friends")
        );
        const friendUpdateData = {
          name: data.name,
          avatar: data.avatar,
          color: data.color,
          isTeacher: data.isTeacher || false,
        };
        await Promise.allSettled(
          myFriendsSnap.docs.map((fd) =>
            setDoc(
              doc(fb.db, "artifacts", fb.appId, "users", fd.id, "friends", uid),
              {
                ...friendUpdateData,
                id: uid,
                uid: uid,
                addedAt: fd.data().addedAt || Date.now(),
              },
              { merge: true }
            ).catch(() => null)
          )
        );
        showToast("保存しました！");
      } catch (error) {
        showToast("保存エラー", "error");
      }
    }

    setIsSavingProfile(false);
    setNewPassword("");
    setConfirmPassword("");
    setScreen("start");
  };

  const addCustomWordToDB = async () => {
    if (!newCustomWord.en || !newCustomWord.ja) return;
    setIsAdding(true);
    await addDoc(
      collection(
        fb.db,
        "artifacts",
        fb.appId,
        "public",
        "data",
        "customVocabulary"
      ),
      {
        ...newCustomWord,
        timestamp: Date.now(),
        assignedTo: customAssignTarget, // "all" or [uid1, uid2, ...]
        seenBy: [],
      }
    );
    setNewCustomWord({
      en: "",
      ja: "",
      sentence: "",
      category: newCustomWord.category,
    });
    setIsAdding(false);
    showToast(
      customAssignTarget === "all"
        ? "カスタム問題を全員に配布しました！"
        : `${
            Array.isArray(customAssignTarget) ? customAssignTarget.length : 0
          }人の生徒に配布しました！`
    );
  };

  const deleteCustomWord = async (id) => {
    if (!window.confirm("この問題を削除しますか？")) return;
    await deleteDoc(
      doc(
        fb.db,
        "artifacts",
        fb.appId,
        "public",
        "data",
        "customVocabulary",
        id
      )
    );
    showToast("削除しました");
  };

  const startGame = (mode, stage, category = "英単語") => {
    const catVocab = ALL_VOCAB.filter(
      (v) => (v.category || "英単語") === category
    );
    let source = catVocab.filter((v) => v.stage === stage);
    if (source.length === 0) source = catVocab.slice(0, 8);
    if (source.length === 0) source = DEFAULT_VOCAB.slice(0, 8);
    const shuffled = [...source].sort(() => 0.5 - Math.random());
    setGameMode(mode);
    setGameCategory(category);
    setCurrentStage(stage);
    setStageWords(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setLives(3);
    setCorrectCount(0);
    setGameStartTime(Date.now());
    setStageClearedOccurred(false);
    setLevelUpOccurred(false);
    setShowQuitConfirm(false);
    generateQuestion(shuffled[0], false, category);
    setScreen("play");
  };

  const startCustomGame = (mode, tab = "new") => {
    const myUid = user?.uid || "";
    const myWords = customVocabList.filter((w) => {
      const at = w.assignedTo;
      const isAssigned =
        at === "all" ||
        at === undefined ||
        (Array.isArray(at) && at.includes(myUid));
      if (!isAssigned) return false;
      const seen = Array.isArray(w.seenBy) ? w.seenBy.includes(myUid) : false;
      return tab === "new" ? !seen : seen;
    });
    if (myWords.length === 0) return;
    const shuffled = [...myWords].sort(() => 0.5 - Math.random());
    setGameMode(mode);
    setCurrentStage(tab === "new" ? "Custom" : "CustomPast");
    setStageWords(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setLives(3);
    setCorrectCount(0);
    setGameStartTime(Date.now());
    setStageClearedOccurred(false);
    setLevelUpOccurred(false);
    setShowQuitConfirm(false);
    generateQuestion(shuffled[0], true);
    setScreen("play");
  };

  const generateQuestion = (word, isCustom = false, category = null) => {
    if (!word) return;
    const cat = category || gameCategory || "英単語";
    let pool = isCustom
      ? customVocabList
      : ALL_VOCAB.filter((v) => (v.category || "英単語") === cat);
    // 同カテゴリで4問未満の場合も同カテゴリ内でのみ補完（異カテゴリは混入しない）
    if (pool.length < 4) {
      pool = ALL_VOCAB.filter((v) => (v.category || "英単語") === cat);
    }
    // それでも足りない場合のみ全体から補完（カスタムのみ）
    if (pool.length < 4 && isCustom) pool = [...pool, ...customVocabList];
    const distractors = [...pool]
      .filter((v) => v.en !== word.en)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setOptions([word, ...distractors].sort(() => 0.5 - Math.random()));
    setFeedback(null);
  };

  const finishGame = async (isClear, finalCorrect, finalScore) => {
    if (screen !== "play") return;
    setScreen("result");
    const duration = Math.max(
      1,
      Math.round((Date.now() - (gameStartTime || Date.now())) / 60000)
    );

    // 複数端末対策: Firestoreから最新プロフィールを取得してから計算する
    let currentProfile = profileRef.current;
    if (user && fb.enabled) {
      try {
        const snap = await getDoc(
          doc(
            fb.db,
            "artifacts",
            fb.appId,
            "users",
            user.uid,
            "profile",
            "main"
          )
        );
        if (snap.exists()) {
          const latest = snap.data();
          // clearedStagesもFirestore値とローカル値をマージ
          const mergedCleared = { ...(latest.clearedStages || {}) };
          const localCleared = currentProfile?.clearedStages || {};
          for (const cat of Object.keys(localCleared)) {
            if (!mergedCleared[cat]) mergedCleared[cat] = localCleared[cat];
            else {
              const combined = new Set([
                ...mergedCleared[cat],
                ...localCleared[cat],
              ]);
              mergedCleared[cat] = Array.from(combined);
            }
          }
          // 最新のexpとunlockedStageを使う（高い方を採用）
          currentProfile = {
            ...currentProfile,
            totalExp: Math.max(
              currentProfile?.totalExp || 0,
              latest.totalExp || 0
            ),
            unlockedStage: Math.max(
              currentProfile?.unlockedStage || 1,
              latest.unlockedStage || 1
            ),
            petPoints: Math.max(
              currentProfile?.petPoints || 0,
              latest.petPoints || 0
            ),
            clearedStages: mergedCleared,
          };
        }
      } catch (e) {}
    }

    const totalGained = finalScore + (isClear ? 30 : 0);
    const oldLevel = calcLevel(currentProfile?.totalExp);
    const newExp = (currentProfile?.totalExp || 0) + totalGained;
    if (calcLevel(newExp) > oldLevel) setLevelUpOccurred(true);

    const earnedPetPts =
      finalCorrect * 1 +
      (isClear && currentStage !== "Custom" && currentStage !== "CustomPast"
        ? 3
        : 0);
    const newPetPoints = (currentProfile?.petPoints || 0) + earnedPetPts;
    const newUnlocked =
      isClear &&
      currentStage === currentProfile?.unlockedStage &&
      currentStage !== "Custom" &&
      currentStage !== "CustomPast"
        ? currentStage + 1
        : currentProfile?.unlockedStage || 1;
    if (isClear) setStageClearedOccurred(true);

    // カテゴリ別クリア済みステージを更新
    const prevCleared = currentProfile?.clearedStages || {};
    const catKey = gameCategory || "英単語";
    const prevCatCleared = prevCleared[catKey] || [];
    const newCatCleared =
      isClear &&
      currentStage !== "Custom" &&
      currentStage !== "CustomPast" &&
      !prevCatCleared.includes(currentStage)
        ? [...prevCatCleared, currentStage]
        : prevCatCleared;
    const newClearedStages = { ...prevCleared, [catKey]: newCatCleared };

    const updatedProfile = {
      ...currentProfile,
      totalExp: newExp,
      unlockedStage: Math.min(20, newUnlocked),
      petPoints: newPetPoints,
      clearedStages: newClearedStages,
    };
    const newRecord = {
      score: totalGained,
      correctCount: finalCorrect,
      stage: currentStage,
      isClear,
      lives,
      mode: gameMode,
      duration,
      timestamp: Date.now(),
      id: Date.now().toString(),
    };
    const updatedHistory = [newRecord, ...history].slice(0, 50);

    setProfile(updatedProfile);
    setHistory(updatedHistory);
    saveLocal("profile", updatedProfile);
    saveLocal("history", updatedHistory);

    // 実績チェック＆交流自動投稿
    await checkAndPostAchievements(
      currentProfile,
      history,
      updatedProfile,
      updatedHistory
    );

    if (user && fb.enabled) {
      await setDoc(
        doc(fb.db, "artifacts", fb.appId, "users", user.uid, "profile", "main"),
        updatedProfile,
        { merge: true }
      );
      if (!updatedProfile.isTeacher) {
        await setDoc(
          doc(
            fb.db,
            "artifacts",
            fb.appId,
            "public",
            "data",
            "leaderboard",
            user.uid
          ),
          { ...updatedProfile, score: newExp },
          { merge: true }
        );
      }
      await addDoc(
        collection(fb.db, "artifacts", fb.appId, "users", user.uid, "history"),
        newRecord
      );
      // 新しいカスタム問題タブのゲーム終了時: seenByに自分を追加
      if (currentStage === "Custom" && stageWords.length > 0) {
        const myUid = user.uid;
        for (const word of stageWords) {
          if (!word.id) continue;
          const wordRef = doc(
            fb.db,
            "artifacts",
            fb.appId,
            "public",
            "data",
            "customVocabulary",
            word.id
          );
          try {
            const snap = await getDoc(wordRef);
            if (snap.exists()) {
              const cur = snap.data();
              const seen = Array.isArray(cur.seenBy) ? cur.seenBy : [];
              if (!seen.includes(myUid)) {
                await updateDoc(wordRef, { seenBy: [...seen, myUid] });
              }
            }
          } catch (e) {}
        }
      }
    }
  };

  const handleAnswer = (choice) => {
    if (feedback) return;
    const isCorrect = choice.en === stageWords[currentIndex].en;
    let nextCorrect = correctCount;
    let nextScore = score;
    const isCustom = currentStage === "Custom" || currentStage === "CustomPast";

    if (isCorrect) {
      setFeedback("correct");
      nextCorrect++;
      setCorrectCount(nextCorrect);
      nextScore += 1;
      setScore(nextScore);
      if (gameCategory === "英単語") speak(choice.en);
      setTimeout(() => {
        if (currentIndex + 1 < stageWords.length) {
          setCurrentIndex(currentIndex + 1);
          generateQuestion(
            stageWords[currentIndex + 1],
            isCustom,
            isCustom ? null : gameCategory
          );
        } else finishGame(true, nextCorrect, nextScore);
      }, 700);
    } else {
      setFeedback("incorrect");
      let newLives = 0;
      setLives((l) => {
        newLives = l - 1;
        return l - 1;
      });
      if (user && fb.enabled) {
        const { id: _id, ...wordData } = stageWords[currentIndex];
        addDoc(
          collection(fb.db, "artifacts", fb.appId, "users", user.uid, "review"),
          wordData
        );
      }
      setTimeout(() => {
        // newLives は setLives コールバック内で確定した最新値
        if (newLives <= 0) finishGame(false, nextCorrect, nextScore);
        else if (currentIndex + 1 < stageWords.length) {
          setCurrentIndex(currentIndex + 1);
          generateQuestion(
            stageWords[currentIndex + 1],
            isCustom,
            isCustom ? null : gameCategory
          );
        } else finishGame(true, nextCorrect, nextScore);
      }, 700);
    }
  };

  const BarChart = ({ type }) => {
    const labels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString("ja-JP", {
        month: "numeric",
        day: "numeric",
      });
    });
    const stats = labels.map((label) => {
      const dayRecords = history.filter(
        (h) =>
          new Date(h.timestamp).toLocaleDateString("ja-JP", {
            month: "numeric",
            day: "numeric",
          }) === label
      );
      return {
        words: dayRecords.reduce((sum, h) => sum + (h.correctCount || 0), 0),
        minutes: dayRecords.reduce((sum, h) => sum + (h.duration || 0), 0),
      };
    });
    const values = stats.map((s) => s[type]);
    const maxVal =
      Math.ceil(Math.max(...values, type === "words" ? 20 : 10) / 10) * 10;

    return (
      <div className="w-full pt-10 pb-4">
        <div className="relative h-44 flex ml-10">
          <div className="absolute -left-10 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] font-black text-slate-300 pr-2 text-right">
            <span>{maxVal}</span>
            <span>{maxVal / 2}</span>
            <span>0</span>
          </div>
          <div className="flex-1 relative border-l border-slate-100">
            <div className="absolute top-0 left-0 w-full border-t border-slate-50" />
            <div className="absolute top-1/2 left-0 w-full border-t border-slate-50" />
            <div className="absolute bottom-0 left-0 w-full border-t border-slate-300" />
            {type === "words" && (
              <div
                className="absolute left-0 right-0 border-t-2 border-dashed border-rose-200 z-10"
                style={{ bottom: `${(20 / maxVal) * 100}%` }}
              >
                <span
                  className="absolute -left-10 -top-2 text-[8px] font-black text-rose-400 px-1"
                  style={{ background: theme.bgColor }}
                >
                  GOAL
                </span>
              </div>
            )}
            <div className="absolute inset-0 flex items-end justify-around px-2 gap-2">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="flex-1 h-full flex items-end group relative z-20"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-30">
                    {s[type]}
                    {type === "words" ? "語" : "分"}
                  </div>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 ${
                      type === "minutes" ? "bg-amber-400" : "bg-amber-400"
                    }`}
                    style={{
                      height: `${(s[type] / maxVal) * 100}%`,
                      minHeight: s[type] > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="ml-10 flex justify-around mt-6 px-2">
          {labels.map((l, i) => (
            <span
              key={i}
              className="flex-1 text-[9px] font-black text-slate-400 block -rotate-45 text-center"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const isLight = themeId === "light";

  const NAV_ICONS = {
    start: ({ active, color }) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          fill={active ? color : "none"}
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 0 : 1.8}
          strokeLinejoin="round"
          opacity={active ? 1 : 0.7}
        />
        {active && (
          <path
            d="M9 21V16C9 15.45 9.45 15 10 15H14C14.55 15 15 15.45 15 16V21"
            fill="rgba(0,0,0,0.2)"
          />
        )}
      </svg>
    ),
    friendsList: ({ active, color }) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="9"
          cy="8"
          r="3.5"
          fill={active ? color : "none"}
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 0 : 1.8}
          opacity={active ? 0.9 : 0.7}
        />
        <path
          d="M2 20C2 17.2 5.13 15 9 15C12.87 15 16 17.2 16 20"
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 2.2 : 1.8}
          strokeLinecap="round"
          fill="none"
          opacity={active ? 1 : 0.7}
        />
        <circle
          cx="17.5"
          cy="8"
          r="2.5"
          fill={active ? color : "none"}
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 0 : 1.8}
          opacity={active ? 0.7 : 0.5}
        />
        <path
          d="M16 14.5C17 14.2 18.2 14 19.5 14C21.5 14 23 15.1 23 16.5"
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 2 : 1.6}
          strokeLinecap="round"
          fill="none"
          opacity={active ? 0.8 : 0.5}
        />
      </svg>
    ),
    plaza: ({ active, color }) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 21h18M5 21V10l7-7 7 7v11"
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 2 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={active ? 1 : 0.7}
        />
        <rect
          x="9"
          y="14"
          width="6"
          height="7"
          fill={active ? color : "none"}
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 0 : 1.6}
          opacity={active ? 0.7 : 0.6}
        />
        <rect
          x="5"
          y="12"
          width="4"
          height="4"
          rx="0.5"
          fill={active ? color : "none"}
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 0 : 1.4}
          opacity={active ? 0.5 : 0.5}
        />
        <rect
          x="15"
          y="12"
          width="4"
          height="4"
          rx="0.5"
          fill={active ? color : "none"}
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 0 : 1.4}
          opacity={active ? 0.5 : 0.5}
        />
      </svg>
    ),
    chat: ({ active, color }) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15C21 15.55 20.55 16 20 16H7L3 20V4C3 3.45 3.45 3 4 3H20C20.55 3 21 3.45 21 4V15Z"
          fill={active ? color : "none"}
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 0 : 1.8}
          strokeLinejoin="round"
          opacity={active ? 1 : 0.7}
        />
        {active && (
          <>
            <line
              x1="8"
              y1="8"
              x2="16"
              y2="8"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="8"
              y1="11.5"
              x2="13"
              y2="11.5"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    ),
    leaderboard: ({ active, color }) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3L13.8 8.2H19.2L14.7 11.4L16.5 16.6L12 13.4L7.5 16.6L9.3 11.4L4.8 8.2H10.2L12 3Z"
          fill={active ? color : "none"}
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 0 : 1.6}
          strokeLinejoin="round"
          opacity={active ? 1 : 0.7}
        />
        {active && (
          <path
            d="M8 21V19M12 21V17M16 21V19"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        )}
      </svg>
    ),
    stats: ({ active, color }) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="14"
          width="4"
          height="7"
          rx="1"
          fill={active ? color : "none"}
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 0 : 1.8}
          opacity={active ? 0.6 : 0.7}
        />
        <rect
          x="10"
          y="9"
          width="4"
          height="12"
          rx="1"
          fill={active ? color : "none"}
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 0 : 1.8}
          opacity={active ? 0.8 : 0.7}
        />
        <rect
          x="17"
          y="4"
          width="4"
          height="17"
          rx="1"
          fill={active ? color : "none"}
          stroke={active ? color : "currentColor"}
          strokeWidth={active ? 0 : 1.8}
          opacity={active ? 1 : 0.7}
        />
      </svg>
    ),
  };

  const Nav = () => (
    <div
      className="bg-transparent shrink-0"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingTop: "4px",
        paddingLeft: 0,
        paddingRight: 0,
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      <div className="px-3">
        <div
          className="rounded-[2rem] flex justify-around items-center"
          style={{
            background: isLight
              ? "rgba(240,244,255,0.92)"
              : "rgba(15,12,41,0.88)",
            backdropFilter: "blur(32px)",
            border: `1px solid ${
              isLight ? "rgba(201,168,76,0.18)" : "rgba(255,255,255,0.1)"
            }`,
            boxShadow: isLight
              ? "0 -2px 32px rgba(201,168,76,0.12), 0 4px 24px rgba(0,0,0,0.08)"
              : "0 -2px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
            padding: "6px 4px",
          }}
        >
          {[
            { id: "start", label: "ホーム" },
            { id: "plaza", label: "広場" },
            { id: "chat", label: "称え場" },
            { id: "leaderboard", label: "順位" },
            { id: "stats", label: "成績" },
          ].map((item) => {
            const isActive =
              screen === item.id ||
              (item.id === "start" &&
                [
                  "stageMap",
                  "play",
                  "result",
                  "modeSelect",
                  "profileEdit",
                  "announcementsList",
                  "customApp",
                  "petChat",
                  "typingGame",
                  "dm",
                  "wordbook",
                  "factoryApp",
                  "settingsApp",
                ].includes(screen)) ||
              (item.id === "plaza" &&
                [
                  "petShop",
                  "petRoom",
                  "achievements",
                  "tweetApp",
                  "noteApp",
                ].includes(screen));
            const badge =
              item.id === "chat"
                ? unreadChat
                : item.id === "start"
                ? Object.values(unreadDm).reduce((a, b) => a + b, 0)
                : 0;
            const IconComp = NAV_ICONS[item.id];
            return (
              <button
                key={item.id}
                onClick={() => {
                  setScreen(item.id);
                  if (item.id === "chat") {
                    setTimeout(
                      () =>
                        chatEndRef.current?.scrollIntoView({
                          behavior: "instant",
                        }),
                      50
                    );
                  }
                }}
                className="relative flex flex-col items-center justify-center transition-all"
                style={{
                  minWidth: 56,
                  minHeight: 56,
                  borderRadius: 20,
                  gap: 3,
                  color: isActive
                    ? theme.accent
                    : isLight
                    ? "rgba(30,20,80,0.35)"
                    : "rgba(255,255,255,0.28)",
                  background: isActive
                    ? isLight
                      ? `linear-gradient(145deg, ${theme.accent}18, ${theme.accent}10)`
                      : `linear-gradient(145deg, ${theme.accent}28, ${theme.accent}12)`
                    : "transparent",
                  boxShadow: isActive
                    ? `0 0 20px ${theme.accent}35, inset 0 1px 0 ${theme.accent}25`
                    : "none",
                  transform: isActive ? "translateY(-1px)" : "translateY(0)",
                }}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 5,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: theme.accent,
                      boxShadow: `0 0 6px ${theme.accent}`,
                    }}
                  />
                )}
                {/* Glow behind icon when active */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      top: "30%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${theme.accent}30 0%, transparent 70%)`,
                      pointerEvents: "none",
                    }}
                  />
                )}
                <div style={{ position: "relative", zIndex: 1 }}>
                  <IconComp active={isActive} color={theme.accent} />
                </div>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 900,
                    letterSpacing: "0.04em",
                    color: isActive ? theme.accent : "inherit",
                    opacity: isActive ? 1 : 0.65,
                    position: "relative",
                    zIndex: 1,
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </span>
                {badge > 0 && (
                  <span
                    className="absolute flex items-center justify-center text-white font-black"
                    style={{
                      top: 6,
                      right: 6,
                      minWidth: 17,
                      height: 17,
                      borderRadius: 999,
                      fontSize: 9,
                      paddingLeft: 3,
                      paddingRight: 3,
                      background: "linear-gradient(135deg, #ff4d6d, #c9184a)",
                      border: "2px solid " + (isLight ? "#f0f4ff" : "#0f0c29"),
                      boxShadow: "0 2px 8px rgba(255,77,109,0.5)",
                      zIndex: 2,
                    }}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (screen === "loading")
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.bg,
          zIndex: 9999,
        }}
      >
        <span
          className="animate-pulse font-black text-xl"
          style={{
            color: theme.accent,
            position: "absolute",
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
            right: 24,
            whiteSpace: "nowrap",
          }}
        >
          Loading...
        </span>
      </div>
    );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        background: theme.bg,
      }}
    >
      {/* 実績解除通知 */}
      {achvNotif &&
        (() => {
          const rm = RANK_META[achvNotif.rank];
          return (
            <div
              style={{
                position: "fixed",
                bottom: "calc(env(safe-area-inset-bottom, 0px) + 90px)",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9998,
                width: "calc(100% - 48px)",
                maxWidth: 360,
                background: isLight
                  ? `linear-gradient(135deg, ${rm.color}30, ${rm.color}18), rgba(255,255,255,0.92)`
                  : `linear-gradient(135deg, ${rm.color}22, ${rm.color}44)`,
                backdropFilter: "blur(24px)",
                border: `1.5px solid ${
                  isLight ? rm.color + "88" : rm.color + "66"
                }`,
                borderRadius: 20,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                boxShadow: isLight
                  ? `0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px ${rm.color}44`
                  : `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${rm.color}33`,
                animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
              <span style={{ lineHeight: 1, flexShrink: 0 }}>
                {achvNotif.IconComp ? (
                  <achvNotif.IconComp size={42} color={rm.color} />
                ) : (
                  <EmojiIcon
                    emoji={achvNotif.icon}
                    size={42}
                    color={rm.color}
                  />
                )}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: rm.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 2,
                  }}
                >
                  <IcAchMedal
                    size={12}
                    color={rm.color}
                    style={{
                      display: "inline",
                      verticalAlign: "middle",
                      marginRight: 3,
                    }}
                  />{" "}
                  実績解除！ · {rm.label}
                </p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: isLight ? "#1a1040" : "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  {achvNotif.title}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: isLight
                      ? "rgba(30,20,80,0.55)"
                      : "rgba(255,255,255,0.6)",
                    marginTop: 2,
                  }}
                >
                  {achvNotif.desc}
                </p>
              </div>
              <button
                onClick={() => {
                  if (achvNotifTimer.current)
                    clearTimeout(achvNotifTimer.current);
                  setAchvNotif(null);
                }}
                style={{
                  color: isLight
                    ? "rgba(30,20,80,0.35)"
                    : "rgba(255,255,255,0.4)",
                  flexShrink: 0,
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>
          );
        })()}

      {/* ペット名前入力モーダル */}
      {petNameModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="rounded-3xl p-6 flex flex-col gap-4 w-full max-w-xs"
            style={{
              background: theme.bgColor,
              border: `1.5px solid ${theme.cardBorder}`,
            }}
          >
            <div className="text-center">
              {(() => {
                const PIcon = PET_ICONS[petNameModal.pet.id] || IcPet;
                return <PIcon size={56} />;
              })()}
            </div>
            <h3
              className="font-black text-lg text-center"
              style={{ color: theme.text }}
            >
              {petNameModal.pet.name}に名前をつけよう！
            </h3>
            <input
              value={petNameInput}
              onChange={(e) => setPetNameInput(e.target.value)}
              maxLength={12}
              placeholder={petNameModal.pet.name}
              className="w-full rounded-2xl px-4 py-3 font-bold text-center text-base outline-none"
              style={{
                background: isLight
                  ? "rgba(0,0,0,0.07)"
                  : "rgba(255,255,255,0.1)",
                color: theme.text,
                border: `1.5px solid ${theme.cardBorder}`,
              }}
            />
            <p
              className="text-[10px] text-center"
              style={{ color: theme.textMuted }}
            >
              空白の場合はデフォルト名を使用
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPetNameModal(null);
                  setPetNameInput("");
                }}
                className="flex-1 py-3 rounded-2xl font-black text-sm"
                style={{
                  background: isLight
                    ? "rgba(0,0,0,0.07)"
                    : "rgba(255,255,255,0.1)",
                  color: theme.textMuted,
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  const name = petNameInput.trim() || petNameModal.pet.name;
                  handleShopBuy(petNameModal.pet, "pet", name);
                  setPetNameModal(null);
                  setPetNameInput("");
                }}
                className="flex-1 py-3 rounded-2xl font-black text-sm"
                style={{
                  background: "linear-gradient(135deg,#b8860b,#e0c97f)",
                  color: "#1a0e00",
                }}
              >
                決定！
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            top: "calc(env(safe-area-inset-top, 0px) + 16px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            pointerEvents: "none",
            background:
              toast.type === "error"
                ? "rgba(239,68,68,0.95)"
                : "rgba(16,185,129,0.95)",
            backdropFilter: "blur(12px)",
            padding: "12px 20px",
            borderRadius: "999px",
            color: "white",
            fontWeight: "800",
            fontSize: "13px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          {toast.type === "error" ? (
            <IcAlert size={14} color="currentColor" />
          ) : (
            <IcCheckSm size={14} color="currentColor" />
          )}{" "}
          {toast.msg}
        </div>
      )}
      {/* ── 背景装飾: ボケた光の重なり ── */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          right: "-10%",
          width: "80vw",
          height: "80vw",
          maxWidth: "400px",
          maxHeight: "400px",
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 40%, ${theme.orb1} 0%, transparent 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "-15%",
          width: "70vw",
          height: "70vw",
          maxWidth: "340px",
          maxHeight: "340px",
          borderRadius: "50%",
          background: `radial-gradient(circle at 60% 60%, ${theme.orb2} 0%, transparent 70%)`,
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "20%",
          width: "55vw",
          height: "55vw",
          maxWidth: "260px",
          maxHeight: "260px",
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 50%, ${
            theme.orb3 || theme.orb1
          } 0%, transparent 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none",
          opacity: 0.7,
        }}
      />
      {/* ドットグリッド */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${
            theme.dotColor || "rgba(255,255,255,0.03)"
          } 1.2px, transparent 1.2px)`,
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />

      <div
        className="font-sans text-left"
        style={{
          width: "100%",
          maxWidth: "576px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "transparent",
          position: "relative",
          zIndex: 1,
          color: theme.text,
        }}
        data-theme={themeId}
      >
        {screen === "login" && (
          <div
            className="animate-in fade-in"
            style={{
              flex: 1,
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              paddingTop: "calc(env(safe-area-inset-top, 0px) + 48px)",
              paddingLeft: 24,
              paddingRight: 24,
              paddingBottom: 48,
            }}
          >
            <style>{`
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }

              @keyframes oritan-float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
              }
              @keyframes oritan-shimmer {
                0% { background-position: -200% center; }
                100% { background-position: 200% center; }
              }
              @keyframes oritan-appear {
                0% { opacity: 0; transform: translateY(18px) scale(0.8); filter: blur(4px); }
                100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
              }
              .oritan-letter-wrap {
                display: inline-flex;
                gap: 0.04em;
                align-items: baseline;
              }
              .oritan-letter {
                display: inline-block;
                font-family: 'Georgia', 'Times New Roman', serif;
                font-weight: 900;
                font-size: 3.4rem;
                line-height: 1;
                background: linear-gradient(160deg,
                  #fff8dc 0%,
                  #ffe57a 18%,
                  #e0c97f 32%,
                  #fffbe6 48%,
                  #c9a84c 64%,
                  #ffe57a 80%,
                  #e0c97f 100%
                );
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                -webkit-text-stroke: 1px rgba(120,60,0,0.6);
                paint-order: stroke fill;
                animation: oritan-appear 0.55s cubic-bezier(0.22,1,0.36,1) both, oritan-float 3.2s ease-in-out infinite, oritan-shimmer 4s linear infinite;
                filter:
                  drop-shadow(0 0 14px rgba(255,200,40,0.7))
                  drop-shadow(0 2px 6px rgba(80,40,0,0.6));
              }
              .oritan-letter:nth-child(1) { animation-delay: 0.05s, 0.6s, 0s; }
              .oritan-letter:nth-child(2) { animation-delay: 0.12s, 0.9s, 0.5s; }
              .oritan-letter:nth-child(3) { animation-delay: 0.19s, 1.2s, 1.0s; }
              .oritan-letter:nth-child(4) { animation-delay: 0.26s, 0.7s, 1.5s; }
              .oritan-letter:nth-child(5) { animation-delay: 0.33s, 1.0s, 2.0s; }
              .oritan-letter:nth-child(6) { animation-delay: 0.40s, 0.8s, 2.5s; }
              .oritan-sub {
                filter: drop-shadow(0 1px 0 rgba(30,30,30,0.6)) drop-shadow(0 -1px 0 rgba(30,30,30,0.6)) drop-shadow(1px 0 0 rgba(30,30,30,0.6)) drop-shadow(-1px 0 0 rgba(30,30,30,0.6));
              }
              .oritan-divider {
                display: flex;
                align-items: center;
                gap: 8px;
                justify-content: center;
                margin: 4px 0 2px;
              }
              .oritan-divider-line {
                height: 1px;
                width: 32px;
                background: linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent);
              }
              .oritan-divider-dot {
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: rgba(201,168,76,0.8);
              }
            `}</style>
            <div className="max-w-sm mx-auto space-y-6">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-5">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: "drop-shadow(0 6px 32px rgba(60,40,180,0.5)) drop-shadow(0 0 16px rgba(201,168,76,0.25))",
                    }}
                  >
                    <defs>
                      <linearGradient id="iBg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#12082e" />
                        <stop offset="100%" stopColor="#0a1628" />
                      </linearGradient>
                      <linearGradient id="iGold" x1="20" y1="10" x2="60" y2="70" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#ffe57a" />
                        <stop offset="50%" stopColor="#c9a84c" />
                        <stop offset="100%" stopColor="#a06010" />
                      </linearGradient>
                      <radialGradient id="iEyeL" cx="29" cy="32" r="8" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fff8e0" />
                        <stop offset="100%" stopColor="#f0c040" />
                      </radialGradient>
                      <radialGradient id="iEyeR" cx="51" cy="32" r="8" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fff8e0" />
                        <stop offset="100%" stopColor="#f0c040" />
                      </radialGradient>
                      <filter id="iGlow">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    {/* 背景 */}
                    <rect width="80" height="80" rx="22" fill="url(#iBg)" />
                    {/* 内側の微妙な光 */}
                    <rect width="80" height="80" rx="22" fill="rgba(80,50,200,0.08)" />
                    {/* 耳羽（シンプル三角） */}
                    <polygon points="26,26 22,12 32,22" fill="url(#iGold)" opacity="0.9" />
                    <polygon points="54,26 58,12 48,22" fill="url(#iGold)" opacity="0.9" />
                    {/* ボディ（シンプル楕円） */}
                    <ellipse cx="40" cy="56" rx="17" ry="14" fill="url(#iGold)" opacity="0.12" stroke="url(#iGold)" strokeWidth="1.2" />
                    {/* 翼ライン */}
                    <path d="M23 52 Q16 56 17 66 Q23 61 24 53Z" fill="url(#iGold)" opacity="0.25" />
                    <path d="M57 52 Q64 56 63 66 Q57 61 56 53Z" fill="url(#iGold)" opacity="0.25" />
                    {/* 頭（クリーンな円） */}
                    <circle cx="40" cy="32" r="20" fill="url(#iGold)" opacity="0.1" stroke="url(#iGold)" strokeWidth="1.4" />
                    {/* 左目 */}
                    <circle cx="29" cy="32" r="8" fill="url(#iEyeL)" />
                    <circle cx="29" cy="32" r="8" stroke="url(#iGold)" strokeWidth="1.2" fill="none" />
                    <circle cx="29" cy="32" r="4.5" fill="#0a0600" />
                    <circle cx="30.8" cy="30.2" r="1.8" fill="white" opacity="0.9" />
                    {/* 右目 */}
                    <circle cx="51" cy="32" r="8" fill="url(#iEyeR)" />
                    <circle cx="51" cy="32" r="8" stroke="url(#iGold)" strokeWidth="1.2" fill="none" />
                    <circle cx="51" cy="32" r="4.5" fill="#0a0600" />
                    <circle cx="52.8" cy="30.2" r="1.8" fill="white" opacity="0.9" />
                    {/* くちばし（細くシャープ） */}
                    <path d="M36 38 L40 44 L44 38 Z" fill="#c9a84c" opacity="0.9" />
                    {/* 腹の縦線（フェザーライン） */}
                    <line x1="40" y1="48" x2="40" y2="66" stroke="url(#iGold)" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 2" />
                    {/* 星（右上・小さくシャープ） */}
                    <path d="M63 14 L64.2 17.6 L68 17.6 L65 19.8 L66.2 23.4 L63 21.2 L59.8 23.4 L61 19.8 L58 17.6 L61.8 17.6 Z" fill="#ffe57a" opacity="0.85" />
                  </svg>
                </div>
                <p
                  className="oritan-sub"
                  style={{
                    color: "rgba(201,168,76,0.7)",
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.45em",
                    marginBottom: 10,
                    textTransform: "uppercase",
                  }}
                >
                  一宮駅前校オリジナル
                </p>
                <h1 style={{ margin: 0, lineHeight: 1 }}>
                  <span className="oritan-letter-wrap">
                    {"ORITAN".split("").map((ch, i) => (
                      <span key={i} className="oritan-letter">{ch}</span>
                    ))}
                  </span>
                </h1>
                <div className="oritan-divider" style={{ margin: "10px auto 8px" }}>
                  <div className="oritan-divider-line" />
                  <div className="oritan-divider-dot" />
                  <div className="oritan-divider-line" />
                </div>
                <p
                  className="oritan-sub"
                  style={{
                    color: "rgba(201,168,76,0.75)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.5em",
                    textTransform: "uppercase",
                  }}
                >
                  ログイン
                </p>
              </div>
              <div
                className="rounded-2xl p-6 space-y-4"
                style={{
                  background: "rgba(201,168,76,0.05)",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
                    Friend ID
                  </p>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => {
                      setLoginId(e.target.value.toUpperCase());
                      setLoginError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="6桁のID"
                    maxLength={6}
                    className="w-full px-4 py-3.5 rounded-xl font-mono font-black text-lg outline-none tracking-widest"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: theme.text,
                    }}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
                    パスワード
                  </p>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="パスワードを入力"
                    className="w-full px-4 py-3.5 rounded-xl font-bold text-base outline-none"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: theme.text,
                    }}
                  />
                </div>
                {loginError && (
                  <p className="text-rose-400 text-xs font-black">
                    {loginError}
                  </p>
                )}
              </div>
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full py-4 rounded-2xl font-black text-white text-base active:opacity-80 transition-all"
                style={
                  isLoggingIn
                    ? {
                        background: "rgba(201,168,76,0.25)",
                        cursor: "not-allowed",
                      }
                    : {
                        background: "linear-gradient(135deg,#b8860b,#e0c97f)",
                        boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
                      }
                }
              >
                {isLoggingIn ? "Signing in..." : "ログイン"}
              </button>
              <button
                onClick={() => {
                  setNewName("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setScreen("register");
                }}
                className="w-full py-3.5 rounded-2xl font-bold text-sm active:opacity-70 transition-all"
                style={{
                  background: "rgba(201,168,76,0.1)",
                  color: "rgba(201,168,76,0.9)",
                  border: "1px solid rgba(201,168,76,0.35)",
                }}
              >
                新規登録
              </button>
              <p
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.12)",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  paddingTop: 8,
                }}
              >
                Designed &amp; Developed by miwa
              </p>
            </div>
          </div>
        )}

        {(screen === "register" || screen === "profileEdit") && (
          <div
            className="animate-in fade-in"
            style={{
              flex: 1,
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)",
              paddingLeft: 24,
              paddingRight: 24,
              paddingBottom: 48,
            }}
          >
            {screen === "profileEdit" && (
              <button
                onClick={() => setScreen("start")}
                className="flex items-center gap-1.5 mb-5 active:opacity-70 transition-all"
                style={{
                  color: theme.text,
                  background: isLight
                    ? "rgba(30,20,80,0.07)"
                    : "rgba(255,255,255,0.08)",
                  border: isLight
                    ? "1px solid rgba(30,20,80,0.12)"
                    : "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  padding: "8px 14px",
                  display: "inline-flex",
                }}
              >
                <ChevronLeft size={18} />
                <span className="text-sm font-black">戻る</span>
              </button>
            )}
            <p
              className="text-[11px] font-black tracking-[0.2em] uppercase mb-6"
              style={{ color: isLight ? "#92400e" : "#fbbf24" }}
            >
              {screen === "register" ? "新規登録" : "プロフィール編集"}
            </p>
            <div className="flex items-end gap-5 mb-8">
              <div
                className={`w-24 h-24 ${
                  avatarImage ? "" : selectedColor.bg
                } rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl overflow-hidden`}
                style={{
                  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                  border: isLight
                    ? "3px solid rgba(180,100,0,0.3)"
                    : "3px solid rgba(255,255,255,0.6)",
                }}
              >
                {avatarImage ? (
                  <img
                    src={avatarImage}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (() => {
                    const AvatarIc = AVATAR_ICONS[selectedAvatar.char];
                    if (AvatarIc)
                      return <AvatarIc size={52} color="currentColor" />;
                    return selectedAvatar.char;
                  })()
                )}
              </div>
              <div className="pb-1">
                <p
                  className="text-3xl font-black tracking-tighter leading-none"
                  style={{ color: theme.text }}
                >
                  {newName ||
                    (screen === "register"
                      ? "あなたの名前"
                      : profile?.name || "名前")}
                </p>
                <p
                  className="text-sm font-bold mt-1"
                  style={{ color: theme.textMuted }}
                >
                  {screen === "profileEdit"
                    ? `ID: ${profile?.shortId || "------"}`
                    : " Oritanへようこそ"}
                </p>
              </div>
            </div>

            {screen === "profileEdit" && (
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(profile?.shortId || "");
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="w-full mb-6 p-4 bg-amber-50 rounded-2xl flex items-center justify-between border border-amber-100"
              >
                <div className="text-left">
                  <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">
                    Friend ID
                  </span>
                  <code className="text-lg font-mono font-black text-amber-500 tracking-widest">
                    {profile?.shortId || "------"}
                  </code>
                </div>
                {isCopied ? (
                  <Check size={18} className="text-emerald-500" />
                ) : (
                  <Copy size={18} className="text-amber-300" />
                )}
              </button>
            )}

            <div
              className="rounded-[2rem] p-6 mb-5"
              style={{
                background: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: isLight ? "#78350f" : "#94a3b8" }}
                >
                  アバター
                </p>
                <label
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer active:opacity-70 transition-all"
                  style={{
                    background: "rgba(201,168,76,0.12)",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                    <IcCamera size={13} color="currentColor" /> 写真
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async (ev) => {
                        const compressed = await compressImage(
                          ev.target.result
                        );
                        setAvatarImage(compressed);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
              {avatarImage && (
                <button
                  onClick={() => setAvatarImage(null)}
                  className="w-full mb-3 py-2 rounded-xl text-[11px] font-bold text-rose-400 active:opacity-70"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  写真を削除してアイコンを使う
                </button>
              )}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {AVATARS.map((a) => {
                  const AvatarIc = AVATAR_ICONS[a.char];
                  const isSelected =
                    !avatarImage && selectedAvatar.char === a.char;
                  return (
                    <button
                      key={a.char}
                      onClick={() => {
                        setSelectedAvatar(a);
                        setAvatarImage(null);
                      }}
                      className="flex flex-col items-center gap-1 py-2 rounded-2xl transition-all active:scale-95"
                      style={{
                        background: isSelected
                          ? "rgba(201,168,76,0.18)"
                          : "rgba(100,116,139,0.07)",
                        border: isSelected
                          ? "2px solid #f59e0b"
                          : "2px solid transparent",
                      }}
                    >
                      {AvatarIc ? (
                        <AvatarIc size={36} color="currentColor" />
                      ) : (
                        <span className="text-3xl">{a.char}</span>
                      )}
                      <span
                        className="text-[9px] font-black"
                        style={{ color: isSelected ? "#b45309" : "#94a3b8" }}
                      >
                        {a.label || a.char}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Lv10解放帽子アバター */}
              {(() => {
                const unlockedHatAvatars = Object.values(
                  PET_HAT_AVATARS
                ).filter((ha) => {
                  const petId = ha.char.replace("_hat", "");
                  const pd = getPetData(petId);
                  return getPetLvFromAffection(pd.affection || 0) >= 10;
                });
                if (unlockedHatAvatars.length === 0) return null;
                return (
                  <>
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <IcHat size={12} /> Lv10解放アバター
                    </p>
                    <div className="grid grid-cols-4 gap-2 mb-5">
                      {unlockedHatAvatars.map((ha) => {
                        const HatIc = ha.component;
                        const isSelected =
                          !avatarImage && selectedAvatar.char === ha.char;
                        return (
                          <button
                            key={ha.char}
                            onClick={() => {
                              setSelectedAvatar(ha);
                              setAvatarImage(null);
                            }}
                            className="flex flex-col items-center gap-1 py-2 rounded-2xl transition-all active:scale-95"
                            style={{
                              background: isSelected
                                ? "rgba(201,168,76,0.18)"
                                : "rgba(245,158,11,0.07)",
                              border: isSelected
                                ? "2px solid #f59e0b"
                                : "2px solid rgba(245,158,11,0.3)",
                            }}
                          >
                            <HatIc size={36} />
                            <span
                              className="text-[9px] font-black"
                              style={{
                                color: isSelected ? "#b45309" : "#f59e0b",
                              }}
                            >
                              {ha.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
              <p
                className="text-[10px] font-black uppercase tracking-widest mb-3"
                style={{ color: isLight ? "#78350f" : "#94a3b8" }}
              >
                カラー
              </p>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    className={`h-9 rounded-xl ${c.bg} transition-all`}
                    style={{
                      boxShadow:
                        selectedColor.name === c.name
                          ? `0 0 0 3px ${c.hex || "#f59e0b"}, 0 0 0 5px ${
                              isLight ? "#eef2ff" : "#0e0618"
                            }`
                          : "none",
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <p
              className="text-[10px] font-black uppercase tracking-widest mb-2"
              style={{ color: isLight ? "#78350f" : "rgba(255,255,255,0.4)" }}
            >
              ニックネーム
            </p>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl font-black text-lg outline-none focus:border-amber-400 transition-colors mb-3"
              style={{
                background: theme.card,
                border: `2px solid ${theme.cardBorder}`,
                color: theme.text,
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
              placeholder="ニックネームを入力"
            />

            {screen === "register" && teacherCodeInput !== ADMIN_PASSCODE && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <p
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: "rgba(16,185,129,0.8)" }}
                  >
                    <IcKey size={12} color="rgba(16,185,129,0.8)" /> 招待コード
                  </p>
                  <p
                    className="text-[10px] font-bold"
                    style={{ color: theme.textMuted }}
                  >
                    先生から受け取ったコードを入力
                  </p>
                </div>
                <input
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) => {
                    setInviteCodeInput(e.target.value.toUpperCase());
                    setInviteCodeError("");
                  }}
                  className="w-full px-5 py-3.5 rounded-2xl font-mono font-black text-base outline-none transition-all tracking-widest"
                  style={{
                    background: "rgba(16,185,129,0.08)",
                    border: inviteCodeError
                      ? "1.5px solid rgba(239,68,68,0.6)"
                      : "1.5px solid rgba(16,185,129,0.3)",
                    color: theme.text,
                  }}
                  placeholder="招待コードを入力"
                  maxLength={20}
                />
                {inviteCodeError && (
                  <p className="text-rose-400 text-[11px] font-black mt-1.5 px-1">
                    {inviteCodeError}
                  </p>
                )}
              </div>
            )}

            {screen === "register" && (
              <div className="mb-4">
                <input
                  type="password"
                  value={teacherCodeInput}
                  onChange={(e) => setTeacherCodeInput(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl font-bold text-sm outline-none transition-all"
                  style={{
                    background: isLight
                      ? "rgba(0,0,0,0.05)"
                      : "rgba(255,255,255,0.06)",
                    border:
                      teacherCodeInput && teacherCodeInput === ADMIN_PASSCODE
                        ? "1.5px solid rgba(99,102,241,0.6)"
                        : isLight
                        ? "1.5px solid rgba(0,0,0,0.15)"
                        : "1.5px solid rgba(255,255,255,0.1)",
                    color: theme.text,
                  }}
                  placeholder="先生用コード（任意）"
                />
                {teacherCodeInput && teacherCodeInput === ADMIN_PASSCODE && (
                  <p className="text-amber-400 text-[11px] font-black mt-1.5 px-1">
                    ✓ 先生アカウントとして登録されます
                  </p>
                )}
              </div>
            )}

            <div className="mb-4 space-y-2">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl font-bold text-sm outline-none transition-all"
                style={{
                  background: isLight
                    ? "rgba(0,0,0,0.05)"
                    : "rgba(255,255,255,0.06)",
                  border: isLight
                    ? "1.5px solid rgba(0,0,0,0.15)"
                    : "1.5px solid rgba(255,255,255,0.1)",
                  color: theme.text,
                }}
                placeholder={
                  screen === "register"
                    ? "パスワードを設定"
                    : "新しいパスワード（変更する場合）"
                }
              />
              {newPassword.length > 0 && (
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl font-bold text-sm outline-none transition-all"
                  style={{
                    background: isLight
                      ? "rgba(0,0,0,0.05)"
                      : "rgba(255,255,255,0.06)",
                    border:
                      confirmPassword && confirmPassword !== newPassword
                        ? "1.5px solid rgba(239,68,68,0.6)"
                        : isLight
                        ? "1.5px solid rgba(0,0,0,0.15)"
                        : "1.5px solid rgba(255,255,255,0.1)",
                    color: theme.text,
                  }}
                  placeholder="パスワードを再入力"
                />
              )}
              {newPassword.length > 0 &&
                confirmPassword.length > 0 &&
                confirmPassword !== newPassword && (
                  <p className="text-rose-400 text-[11px] font-black px-1">
                    パスワードが一致しません
                  </p>
                )}
              {newPassword.length > 0 && confirmPassword === newPassword && (
                <p className="text-emerald-400 text-[11px] font-black px-1">
                  ✓ パスワードが一致しました
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setScreen(screen === "profileEdit" ? "start" : "login")
                }
                className="flex-1 py-4 rounded-2xl font-black transition-all active:opacity-70"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: theme.text,
                  border: `1px solid ${theme.cardBorder}`,
                }}
              >
                戻る
              </button>
              <button
                onClick={handleRegister}
                disabled={isSavingProfile}
                className="flex-[2] py-4 rounded-2xl font-black text-white text-lg transition-all active:scale-[0.98]"
                style={
                  isSavingProfile
                    ? {
                        background: "rgba(201,168,76,0.25)",
                        cursor: "not-allowed",
                      }
                    : {
                        background: "linear-gradient(135deg,#b8860b,#e0c97f)",
                        boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
                        border: "none",
                      }
                }
              >
                {isSavingProfile ? "保存中..." : "決定"}
              </button>
            </div>

            {screen === "profileEdit" && <div className="mt-4"></div>}
          </div>
        )}

        {![
          "play",
          "result",
          "register",
          "profileEdit",
          "dm",
          "login",
          "settingsApp",
        ].includes(screen) && (
          <header
            className="px-4 flex justify-between items-center shrink-0"
            style={{
              paddingTop: "calc(env(safe-area-inset-top, 0px) + 36px)",
              paddingBottom: "14px",
              background: "transparent",
              borderBottom: "none",
            }}
          >
            {/* 左: アバター小 + 名前 + Lv（コンパクト） */}
            <div className="flex items-center gap-2.5 text-left">
              {/* アバター（小） */}
              <div
                style={{
                  position: "relative",
                  width: 42,
                  height: 42,
                  flexShrink: 0,
                }}
              >
                <div
                  className={`w-full h-full ${
                    profile?.avatar?.startsWith("data:") ||
                    profile?.avatar?.startsWith("http")
                      ? ""
                      : profile?.color || "bg-amber-500"
                  } rounded-2xl flex items-center justify-center overflow-hidden`}
                  style={{ boxShadow: `0 0 0 1.5px ${theme.accent}44` }}
                >
                  {profile?.avatar?.startsWith("data:") ||
                  profile?.avatar?.startsWith("http") ? (
                    <img
                      src={profile.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (() => {
                      const AvatarIc = AVATAR_ICONS[profile?.avatar];
                      if (AvatarIc)
                        return <AvatarIc size={28} color="currentColor" />;
                      return profile?.avatar || "👤";
                    })()
                  )}
                </div>
                {profile?.isTeacher && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: -3,
                      right: -3,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                      border: `1.5px solid ${theme.bgColor}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IcCrownSm size={9} />
                  </div>
                )}
              </div>
              {/* 名前 + Lv */}
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    style={{
                      fontSize: 19,
                      fontWeight: 900,
                      color: theme.text,
                      lineHeight: 1,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {profile?.name || "User"}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      color: theme.accent,
                      background: `${theme.accent}18`,
                      border: `1px solid ${theme.accent}44`,
                      borderRadius: 5,
                      padding: "2px 6px",
                      lineHeight: 1.4,
                    }}
                  >
                    Lv.{calcLevel(profile?.totalExp)}
                  </span>
                </div>
                {/* 学校名 */}
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      color: isLight
                        ? "rgba(60,40,120,0.5)"
                        : "rgba(255,255,255,0.35)",
                    }}
                  >
                    現論会 一宮駅前校
                  </span>
                  {/* ストリーク */}
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      color: "#f97316",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Flame
                      size={11}
                      style={{ color: "#f97316", display: "inline" }}
                    />
                    {profile?.streakCount || 1}d
                  </span>
                </div>
                {/* EXPバー */}
                <div
                  className="mt-1.5 w-24 h-0.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      background: `linear-gradient(90deg,${theme.accent}88,${theme.accent})`,
                      width: `${calcExpProgress(profile?.totalExp).pct}%`,
                      boxShadow: `0 0 4px ${theme.accent}88`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 右: 管理/ログアウト（超小さく） */}
            <div className="flex items-center gap-0.5">
              {profile?.isTeacher && (
                <button
                  onClick={() => setScreen("admin")}
                  className="p-2"
                  style={{ color: `${theme.accent}88` }}
                >
                  <Lock size={15} />
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-2"
                style={{ color: "rgba(255,255,255,0.18)" }}
                title="ログアウト"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </header>
        )}

        <main
          className="px-4"
          style={{
            flex: 1,
            overflowY:
              screen === "play" || screen === "start" ? "hidden" : "scroll",
            overflowX: "hidden",
            paddingTop: "12px",
            paddingBottom: "4px",
            WebkitOverflowScrolling: "touch",
            display: ["register", "profileEdit", "login"].includes(screen)
              ? "none"
              : screen === "play" || screen === "start"
              ? "flex"
              : "block",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
            color: theme.text,
          }}
        >
          {screen === "chat" && (
            <div
              className="flex flex-col animate-in fade-in text-left"
              style={{ height: "100%" }}
            >
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-xl font-black flex items-center gap-2 text-white tracking-tight">
                  <MessageSquare className="text-amber-500" size={28} />
                  称え場
                </h2>
                {!profile?.isTeacher && (
                  <span
                    className="text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider"
                    style={
                      (chatSettings.allowedUids || []).includes(user?.uid || "")
                        ? {
                            background: "rgba(201,168,76,0.15)",
                            color: "#c9a84c",
                            border: "1px solid rgba(201,168,76,0.3)",
                          }
                        : {
                            background: "rgba(255,255,255,0.05)",
                            color: isLight
                              ? theme.textMuted
                              : "rgba(255,255,255,0.25)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }
                    }
                  >
                    {(chatSettings.allowedUids || []).includes(
                      user?.uid || ""
                    ) ? (
                      <>
                        <IcSpeech size={12} color="currentColor" /> 発言OK
                      </>
                    ) : (
                      <>
                        <IcEye size={12} color="currentColor" /> 閲覧のみ
                      </>
                    )}
                  </span>
                )}
              </div>
              <div
                className="overflow-y-auto space-y-4 pr-2 no-scrollbar"
                style={{
                  flex: 1,
                  paddingBottom: "80px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {chatMessages.length === 0 ? (
                  <p className="text-center text-slate-400 font-bold mt-10">
                    まだメッセージがありません
                  </p>
                ) : (
                  chatMessages.map((m) => {
                    const isMe = m.uid === user?.uid;
                    const canDelete = isAdmin || isMe;
                    // leaderboardは同一UIDのユーザーのみ参照。マッチしない場合はメッセージ自体のデータを使う
                    const lp = leaderboard.find((u) => u.id === m.uid);
                    const displayAvatar = isMe
                      ? profile?.avatar || m.avatar
                      : (lp ? lp.avatar : m.avatar) || m.avatar;
                    const displayColor = isMe
                      ? profile?.color || m.color
                      : (lp ? lp.color : m.color) || m.color;
                    const displayName = isMe
                      ? profile?.name || m.name
                      : (lp ? lp.name : m.name) || m.name;
                    const displayIsTeacher = isMe
                      ? !!profile?.isTeacher
                      : !!(lp?.isTeacher || m.isTeacher);
                    return (
                      <div
                        key={m.id}
                        className={`flex gap-2 ${
                          isMe ? "flex-row-reverse" : ""
                        }`}
                        style={{ alignItems: "flex-end" }}
                      >
                        {/* アバター：リアクション時も含め常に isMe で左右が決まる */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          {m.isReaction && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 900,
                                whiteSpace: "nowrap",
                                color: isLight
                                  ? "rgba(30,20,80,0.6)"
                                  : "rgba(255,255,255,0.55)",
                                pointerEvents: "none",
                              }}
                            >
                              {isMe ? "自分" : displayName}
                            </span>
                          )}
                          <AvatarDisplay
                            avatar={displayAvatar}
                            color={displayColor}
                            isTeacher={displayIsTeacher}
                            isMe={isMe && !m.isReaction}
                            isLight={isLight}
                          />
                        </div>
                        <div
                          className={`flex flex-col gap-1 max-w-[70%] ${
                            isMe ? "items-end" : "items-start"
                          }`}
                        >
                          {m.isAchievement ? (
                            /* 実績解除バナー */
                            <div
                              className="rounded-2xl px-4 py-3 shadow-md w-full"
                              style={{
                                background: isLight
                                  ? `linear-gradient(135deg, ${
                                      m.achColor || "#c9a84c"
                                    }20, ${
                                      m.achColor || "#c9a84c"
                                    }10), rgba(255,255,255,0.85)`
                                  : `linear-gradient(135deg, ${
                                      m.achColor || "#c9a84c"
                                    }18, ${m.achColor || "#c9a84c"}32)`,
                                border: `1.5px solid ${
                                  m.achColor || "#c9a84c"
                                }55`,
                              }}
                            >
                              <p
                                className="text-[9px] font-black uppercase tracking-widest mb-1 flex items-center gap-1"
                                style={{ color: m.achColor || "#c9a84c" }}
                              >
                                <IcAchMedal
                                  size={11}
                                  color={m.achColor || "#c9a84c"}
                                />{" "}
                                実績解除 · {displayName}
                              </p>
                              <p
                                className="font-black text-sm leading-snug"
                                style={{ color: isLight ? "#1a1040" : "#fff" }}
                              >
                                {m.text}
                              </p>
                              <p
                                className="text-[9px] mt-1 font-bold uppercase tracking-wider"
                                style={{
                                  color:
                                    RANK_META[m.achRank]?.color || "#c9a84c",
                                }}
                              >
                                {RANK_META[m.achRank]?.label || ""}
                              </p>
                            </div>
                          ) : m.isReaction ? (
                            /* リアクション → コンパクトな絵文字バブル */
                            <div className="flex flex-col items-end gap-0.5">
                              <div
                                className="rounded-2xl px-3 py-1.5 shadow-sm"
                                style={{
                                  background: isLight
                                    ? "rgba(255,255,255,0.85)"
                                    : "rgba(255,255,255,0.07)",
                                  border: isLight
                                    ? "1px solid rgba(30,20,80,0.1)"
                                    : "1px solid rgba(255,255,255,0.1)",
                                  fontSize: 22,
                                  lineHeight: 1.2,
                                }}
                              >
                                {m.text}
                              </div>
                            </div>
                          ) : (
                            /* 通常メッセージ */
                            <div
                              className={`p-3.5 rounded-2xl shadow-sm ${
                                isMe
                                  ? "text-white rounded-tr-none"
                                  : "rounded-tl-none"
                              }`}
                              style={
                                isMe
                                  ? {
                                      background:
                                        "linear-gradient(135deg,#b8860b,#d4a020)",
                                      color: "#fff",
                                    }
                                  : isLight
                                  ? {
                                      background: "rgba(255,255,255,0.9)",
                                      border: "1px solid rgba(30,20,80,0.1)",
                                      color: "#1a1040",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    }
                                  : {
                                      background: "rgba(255,255,255,0.1)",
                                      border:
                                        "1px solid rgba(255,255,255,0.15)",
                                      color: "#fff",
                                    }
                              }
                            >
                              {!isMe && (
                                <p className="text-[10px] font-black opacity-70 mb-1 tracking-wider">
                                  {displayName}
                                </p>
                              )}
                              <p className="font-bold leading-relaxed text-sm">
                                {m.text}
                              </p>
                            </div>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteChatMessage(m.id)}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all active:opacity-60"
                              style={{
                                color:
                                  isAdmin && !isMe
                                    ? "rgba(239,68,68,0.7)"
                                    : isLight
                                    ? "rgba(30,20,80,0.35)"
                                    : "rgba(255,255,255,0.3)",
                              }}
                            >
                              {isAdmin && !isMe ? (
                                <>
                                  <IcTrashSm size={12} color="currentColor" />{" "}
                                  削除
                                </>
                              ) : (
                                "取り消し"
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>
              {/* 入力バー: 権限によって切り替え */}
              {(() => {
                const canPost =
                  profile?.isTeacher ||
                  (chatSettings.allowedUids || []).includes(user?.uid || "");
                const REACTIONS = [
                  "👍",
                  "❤️",
                  "🔥",
                  "😂",
                  "🎉",
                  "💪",
                  "✨",
                  "😮",
                ];
                return (
                  <div
                    style={{
                      position: "fixed",
                      left: 0,
                      right: 0,
                      bottom:
                        "calc(env(safe-area-inset-bottom, 0px) + 72px)",
                      zIndex: 50,
                      padding: "0 16px 8px",
                    }}
                  >
                    {canPost ? (
                      /* 発言権限あり → 通常入力 */
                      <div
                        className="flex gap-2 p-2 rounded-2xl"
                        style={{
                          background: theme.navBg,
                          backdropFilter: "blur(24px)",
                          border: "1px solid rgba(201,168,76,0.25)",
                          boxShadow: "0 -2px 20px rgba(0,0,0,0.3)",
                        }}
                      >
                        <input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                          className="flex-1 p-4 bg-transparent outline-none font-bold placeholder-white/30"
                          style={{ color: theme.text }}
                          placeholder="メッセージを入力..."
                        />
                        <button
                          onClick={handleSendMessage}
                          className="p-3.5 rounded-xl active:opacity-80 transition-all"
                          style={{
                            background:
                              "linear-gradient(135deg,#b8860b,#e0c97f)",
                            color: "#1a0e00",
                          }}
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    ) : (
                      /* 発言権限なし → リアクションバー */
                      <div
                        className="rounded-2xl px-3 py-2"
                        style={{
                          background: theme.navBg,
                          backdropFilter: "blur(24px)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          boxShadow: "0 -2px 20px rgba(0,0,0,0.3)",
                        }}
                      >
                        <p
                          className="text-[10px] font-black text-center mb-2"
                          style={{
                            color: "rgba(201,168,76,0.5)",
                            letterSpacing: "0.15em",
                          }}
                        >
                          REACTION
                        </p>
                        <div className="flex justify-around">
                          {REACTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleSendReaction(emoji)}
                              className="text-xl active:scale-125 transition-transform"
                              style={{ lineHeight: 1 }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {screen === "dm" && activeFriend && (
            <div className="flex flex-col animate-in fade-in text-left pt-6">
              <div className="flex items-center gap-4 mb-4 border-b pb-4">
                <button
                  onClick={() => {
                    setScreen("friendsList");
                    setDmMessages([]);
                  }}
                  className="p-2 rounded-xl active:opacity-70 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <ChevronLeft />
                </button>
                <h2 className="text-2xl font-black text-white">
                  {activeFriend.name} とのトーク
                </h2>
              </div>
              <div
                className="overflow-y-auto space-y-4 mb-4 pr-2 no-scrollbar"
                style={{
                  maxHeight: "55vh",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {dmMessages.length === 0 ? (
                  <p className="text-center text-slate-400 font-bold mt-10">
                    メッセージを送ってみましょう！
                  </p>
                ) : (
                  dmMessages.map((m) => {
                    const isMe = m.uid === (user?.uid || "local-user");
                    return (
                      <div
                        key={m.id}
                        className={`flex gap-3 ${
                          isMe ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`p-4 rounded-2xl max-w-[75%] shadow-sm ${
                            isMe
                              ? "text-white rounded-tr-none"
                              : "rounded-tl-none text-white"
                          }`}
                          style={
                            isMe
                              ? {
                                  background:
                                    "linear-gradient(135deg,#6366f1,#8b5cf6)",
                                }
                              : {
                                  background: "rgba(255,255,255,0.1)",
                                  border: "1px solid rgba(255,255,255,0.15)",
                                }
                          }
                        >
                          <p className="font-bold leading-relaxed">{m.text}</p>
                          <p
                            className={`text-[9px] mt-1 ${
                              isMe
                                ? "text-amber-200 text-right"
                                : "text-slate-400 text-left"
                            }`}
                          >
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={dmEndRef} />
              </div>
              <div
                className="flex gap-2 p-2 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <input
                  value={dmInput}
                  onChange={(e) => setDmInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendDM()}
                  className="flex-1 p-4 bg-transparent outline-none font-bold text-white placeholder-white/30"
                  placeholder="メッセージを入力..."
                />
                <button
                  onClick={handleSendDM}
                  className="p-3.5 text-white rounded-xl active:opacity-80 transition-all"
                  style={{
                    background: "linear-gradient(135deg,#b8860b,#e0c97f)",
                  }}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          )}

          {screen === "start" && (
            <div
              className="animate-in fade-in"
              style={{
                paddingTop: "4px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
              >
                {(() => {
                  const activePetId =
                    (profile?.ownedPets || [])[0] || "bearcat";
                  const pet =
                    SHOP_PETS.find((p) => p.id === activePetId) || SHOP_PETS[0];
                  const accs = (
                    getPetAccessories
                      ? getPetAccessories(activePetId)
                      : (profile?.petAccessories || {})[activePetId] || []
                  )
                    .map((id) => SHOP_ACCESSORIES.find((a) => a.id === id))
                    .filter(Boolean);

                  const teacherApps = [
                    {
                      label: "管理画面",
                      SvgIcon: IcAdmin,
                      grad: ["#fcd34d", "#b45309"],
                      shadow: "#d97706",
                      screen: "admin",
                    },
                    {
                      label: "設定",
                      SvgIcon: IcSettings2,
                      grad: ["#94a3b8", "#475569"],
                      shadow: "#64748b",
                      screen: "settingsApp",
                    },
                    {
                      label: "カスタム問題",
                      SvgIcon: IcGift,
                      grad: ["#fb7185", "#e11d48"],
                      shadow: "#f43f5e",
                      screen: "customApp",
                    },
                  ];

                  // テーマ別カラー: [from, to, shadow, accent]
                  const studentApps = [
                    {
                      label: "マップ",
                      SvgIcon: IcMap,
                      grad: ["#f59e0b", "#d97706"],
                      shadow: "#f59e0b",
                      screen: "stageMap",
                      big: true,
                    },
                    {
                      label: "お知らせ",
                      SvgIcon: IcMegaphone,
                      grad: ["#a78bfa", "#7c3aed"],
                      shadow: "#8b5cf6",
                      screen: "announcementsList",
                    },
                    {
                      label: "復習",
                      SvgIcon: IcBook,
                      grad: ["#34d399", "#059669"],
                      shadow: "#10b981",
                      screen: "review",
                      badge: reviewList.length > 0 ? reviewList.length : null,
                    },
                    {
                      label: "ショップ",
                      SvgIcon: IcShop,
                      grad: ["#fcd34d", "#f59e0b"],
                      shadow: "#eab308",
                      screen: "petShop",
                    },
                    {
                      label: "育成",
                      SvgIcon: PET_ICONS[activePetId] || IcPet,
                      grad: ["#f9a8d4", "#ec4899"],
                      shadow: "#ec4899",
                      screen: "petRoom",
                      isPet: true,
                    },
                    {
                      label: "カスタム問題",
                      SvgIcon: IcGift,
                      grad: ["#fb7185", "#e11d48"],
                      shadow: "#f43f5e",
                      screen: "customApp",
                    },
                    {
                      label: "実績",
                      SvgIcon: IcStar2,
                      grad: ["#c084fc", "#7c3aed"],
                      shadow: "#9333ea",
                      screen: "achievements",
                    },
                    {
                      label: "FACTORY",
                      SvgIcon: IcFactory,
                      grad: ["#f97316", "#ea580c"],
                      shadow: "#f97316",
                      screen: "factoryApp",
                    },
                    {
                      label: "設定",
                      SvgIcon: IcSettings2,
                      grad: ["#94a3b8", "#475569"],
                      shadow: "#64748b",
                      screen: "settingsApp",
                    },
                    {
                      label: "つぶやき",
                      SvgIcon: IcTweetApp,
                      grad: ["#60a5fa", "#2563eb"],
                      shadow: "#3b82f6",
                      screen: "tweetApp",
                    },
                  ];

                  const apps = profile?.isTeacher ? teacherApps : studentApps;

                  // ── プランB: サイドバー・フォーカスレイアウト ──────────────
                  if (profile?.isTeacher) {
                    // 先生用: 従来のグリッド
                    return (
                      <div className="grid grid-cols-4 gap-y-6 gap-x-2 mt-6 px-1">
                        {apps.map((app, i) => {
                          const [c1, c2] = app.grad || ["#888", "#444"];
                          const sh = app.shadow || c2;
                          return (
                            <button
                              key={app.screen}
                              onClick={() => {
                                setPrevScreen("start");
                                setScreen(app.screen);
                              }}
                              className="flex flex-col items-center gap-2 active:scale-90 transition-all duration-150 relative"
                            >
                              <div className="relative w-full px-0.5">
                                <div
                                  className="w-full aspect-square flex items-center justify-center relative overflow-hidden"
                                  style={{
                                    borderRadius: "26%",
                                    background: `linear-gradient(150deg, ${c1} 0%, ${c2} 100%)`,
                                    boxShadow: `0 6px 20px ${sh}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
                                  }}
                                >
                                  <div
                                    style={{ position: "relative", zIndex: 1 }}
                                  >
                                    {(() => {
                                      const Ic = app.SvgIcon || IcPet;
                                      return (
                                        <Ic
                                          size={26}
                                          color="rgba(255,255,255,0.97)"
                                        />
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: isLight
                                    ? "rgba(20,10,60,0.75)"
                                    : "rgba(255,255,255,0.82)",
                                }}
                              >
                                {app.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  }

                  // ══════════════════════════════════════════════════════════
                  // ダッシュボード
                  // Row1: マップ + カスタム問題（2列・大）
                  // Row2: 復習 + 単語帳（2列・大）
                  // Row3: ショップ・育成・実績・メモ（4列・小）
                  // Row4: お知らせ・つぶやき（スリム）
                  // ══════════════════════════════════════════════════════════

                  // wordbookをstudentAppsに追加（未登録の場合のみ）
                  if (!studentApps.find((a) => a.screen === "wordbook")) {
                    studentApps.splice(1, 0, {
                      label: "単語帳",
                      SvgIcon: IcBook,
                      grad: ["#67e8f9", "#0891b2"],
                      shadow: "#06b6d4",
                      screen: "wordbook",
                    });
                  }

                  // 大カード（Row1: マップ+カスタム, Row2: 復習+単語帳）
                  const bigApps = [
                    studentApps.find((a) => a.screen === "stageMap"),
                    studentApps.find((a) => a.screen === "customApp"),
                    studentApps.find((a) => a.screen === "review"),
                    studentApps.find((a) => a.screen === "wordbook"),
                  ].filter(Boolean);

                  // 小カード（Row3）
                  const gridApps = [
                    studentApps.find((a) => a.screen === "petShop"),
                    studentApps.find((a) => a.screen === "petRoom"),
                    studentApps.find((a) => a.screen === "achievements"),
                    studentApps.find((a) => a.screen === "factoryApp"),
                  ].filter(Boolean);

                  // スリム（Row4）
                  const utilApps = [
                    studentApps.find((a) => a.screen === "settingsApp"),
                    studentApps.find((a) => a.screen === "tweetApp"),
                  ].filter(Boolean);

                  const unlockedStage = profile?.unlockedStage || 1;
                  const stagePct = Math.min(
                    100,
                    Math.round(((unlockedStage - 1) / 20) * 100)
                  );
                  const reviewCount = reviewList?.length || 0;

                  // ── マテリアル共通 ──
                  const G = {
                    background: isLight
                      ? "rgba(255,255,255,0.78)"
                      : "rgba(15,8,35,0.58)",
                    backdropFilter: "blur(22px)",
                    WebkitBackdropFilter: "blur(22px)",
                    border: isLight
                      ? "1.5px solid rgba(0,0,0,0.22)"
                      : "1.5px solid rgba(255,255,255,0.32)",
                    boxShadow: isLight
                      ? "0 4px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.98)"
                      : "0 6px 28px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.10)",
                  };
                  const glow = (color) =>
                    isLight
                      ? { color }
                      : {
                          color,
                          filter: `drop-shadow(0 0 5px ${color}ee) drop-shadow(0 0 10px ${color}66)`,
                        };
                  const eyebrow = {
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                    color: isLight
                      ? "rgba(40,20,80,0.60)"
                      : "rgba(255,255,255,0.55)",
                  };
                  const titleMd = {
                    fontSize: 21,
                    fontWeight: 900,
                    letterSpacing: "0.01em",
                    lineHeight: 1,
                    color: isLight
                      ? "rgba(20,10,60,0.95)"
                      : "rgba(255,255,255,0.98)",
                  };
                  const titleSm = {
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: "0.01em",
                    lineHeight: 1,
                    color: isLight
                      ? "rgba(20,10,60,0.88)"
                      : "rgba(255,255,255,0.90)",
                  };
                  const metaTxt = {
                    fontSize: 8,
                    fontWeight: 300,
                    letterSpacing: "0.06em",
                    color: isLight
                      ? "rgba(40,20,80,0.35)"
                      : "rgba(255,255,255,0.25)",
                  };

                  // 大カード1枚のレンダラー
                  const BigCard = ({ app }) => {
                    const [c1] = app.grad;
                    const sh = app.shadow;
                    const col = isLight ? sh : c1;
                    const isReview = app.screen === "review";
                    const isMap = app.screen === "stageMap";
                    const reviewPct =
                      isReview && reviewCount > 0
                        ? Math.min(100, Math.round((reviewCount / 30) * 100))
                        : 0;
                    return (
                      <button
                        onClick={() => {
                          if (app.screen === "wordbook") {
                            setWordbookStage(null);
                            setWordbookTab("stage");
                          }
                          setPrevScreen("start");
                          setScreen(app.screen);
                        }}
                        className="active:scale-[0.94] transition-transform duration-150 relative overflow-hidden text-left"
                        style={{
                          height: 155,
                          borderRadius: 22,
                          ...G,
                          border: isLight
                            ? "2px solid rgba(0,0,0,0.22)"
                            : G.border,
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            right: "-12%",
                            bottom: "-18%",
                            width: "65%",
                            height: "75%",
                            borderRadius: "50%",
                            background: `radial-gradient(circle, ${sh}22 0%, transparent 70%)`,
                            pointerEvents: "none",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            right: 12,
                            bottom: 12,
                          }}
                        >
                          {(() => {
                            const Ic = app.SvgIcon || IcPet;
                            return (
                              <Ic size={46} color={col} style={glow(col)} />
                            );
                          })()}
                        </div>
                        <div
                          style={{ position: "absolute", top: 14, left: 14 }}
                        >
                          <p style={{ ...eyebrow, marginBottom: 4 }}>
                            {isMap
                              ? "stage map"
                              : isReview
                              ? "review"
                              : app.screen === "wordbook"
                              ? "word book"
                              : "custom"}
                          </p>
                        </div>
                        <div
                          style={{ position: "absolute", bottom: 14, left: 14 }}
                        >
                          <p style={{ ...titleMd, fontSize: 17 }}>
                            {app.label}
                          </p>
                          {(isMap || isReview) && (
                            <div
                              style={{
                                marginTop: 6,
                                width: 56,
                                height: 1.5,
                                borderRadius: 2,
                                background: isLight
                                  ? "rgba(0,0,0,0.10)"
                                  : "rgba(255,255,255,0.12)",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  borderRadius: 2,
                                  width: `${isMap ? stagePct : reviewPct}%`,
                                  background: isLight ? sh : c1,
                                  boxShadow: isLight ? "none" : `0 0 4px ${sh}`,
                                  transition: "width 0.6s ease",
                                }}
                              />
                            </div>
                          )}
                        </div>
                        {app.badge && !isReview && (
                          <span
                            className="absolute top-2.5 right-2.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-black text-white px-0.5"
                            style={{
                              background:
                                "linear-gradient(135deg,#ff4757,#c0392b)",
                              boxShadow: "0 0 8px rgba(255,71,87,0.7)",
                            }}
                          >
                            {app.badge > 99 ? "99+" : app.badge}
                          </span>
                        )}
                        {isReview && reviewCount > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              right: 12,
                              top: 12,
                              textAlign: "right",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 15,
                                fontWeight: 700,
                                lineHeight: 1,
                                color: "#f97316",
                                display: "flex",
                                alignItems: "baseline",
                                gap: 2,
                                ...(isLight
                                  ? {}
                                  : {
                                      textShadow:
                                        "0 0 10px rgba(249,115,22,0.6)",
                                    }),
                              }}
                            >
                              {reviewCount}
                              <span style={{ fontSize: 10, fontWeight: 600 }}>
                                語
                              </span>
                            </p>
                            <p
                              style={{ ...metaTxt, fontSize: 8, marginTop: 2 }}
                            >
                              要復習
                            </p>
                          </div>
                        )}
                      </button>
                    );
                  };

                  return (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        flex: 1,
                        paddingBottom: 4,
                        marginTop: -12,
                      }}
                    >
                      {/* ━━ タイピング練習バナー ━━ */}
                      {(() => {
                        const totalWords =
                          vocabList.length + customVocabList.length;
                        return (
                          <button
                            onClick={() => {
                              setPrevScreen("start");
                              setScreen("typingGame");
                            }}
                            className="active:scale-[0.97] transition-transform duration-150 relative overflow-hidden text-left"
                            style={{
                              borderRadius: 18,
                              height: 80,
                              background: isLight
                                ? "linear-gradient(135deg, rgba(167,243,208,0.65) 0%, rgba(110,231,183,0.55) 100%)"
                                : "linear-gradient(135deg, rgba(16,185,129,0.28) 0%, rgba(5,150,105,0.28) 100%)",
                              border: isLight
                                ? "1.5px solid rgba(16,185,129,0.35)"
                                : "1.5px solid rgba(52,211,153,0.45)",
                              backdropFilter: "blur(22px)",
                              WebkitBackdropFilter: "blur(22px)",
                              boxShadow: isLight
                                ? "0 4px 20px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,0.80)"
                                : "0 6px 28px rgba(16,185,129,0.32), inset 0 1px 0 rgba(255,255,255,0.08)",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                right: -10,
                                top: -10,
                                width: 90,
                                height: 90,
                                borderRadius: "50%",
                                background:
                                  "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)",
                                pointerEvents: "none",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                paddingLeft: 16,
                                paddingRight: 14,
                              }}
                            >
                              {/* アイコン */}
                              <div
                                style={{
                                  width: 46,
                                  height: 46,
                                  borderRadius: 14,
                                  background: isLight
                                    ? "rgba(16,185,129,0.18)"
                                    : "rgba(16,185,129,0.30)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <IcTyping
                                  size={26}
                                  color={isLight ? "#059669" : "#6ee7b7"}
                                />
                              </div>
                              {/* テキスト */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p
                                  style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    letterSpacing: "0.13em",
                                    textTransform: "uppercase",
                                    color: isLight
                                      ? "rgba(6,95,70,0.65)"
                                      : "rgba(110,231,183,0.65)",
                                    marginBottom: 3,
                                  }}
                                >
                                  typing practice
                                </p>
                                <p
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    letterSpacing: "0.02em",
                                    color: isLight
                                      ? "rgba(6,50,30,0.92)"
                                      : "rgba(255,255,255,0.95)",
                                    lineHeight: 1,
                                  }}
                                >
                                  タイピング練習
                                </p>
                                <p
                                  style={{
                                    fontSize: 9,
                                    fontWeight: 500,
                                    color: isLight
                                      ? "rgba(6,95,70,0.55)"
                                      : "rgba(110,231,183,0.55)",
                                    marginTop: 3,
                                  }}
                                >
                                  {totalWords}語で練習しよう
                                </p>
                              </div>
                              <Zap
                                size={16}
                                style={{
                                  color: isLight
                                    ? "rgba(6,95,70,0.40)"
                                    : "rgba(110,231,183,0.40)",
                                  flexShrink: 0,
                                }}
                              />
                            </div>
                          </button>
                        );
                      })()}

                      {/* ━━ Row1: マップ + カスタム問題 ━━ */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 6,
                          marginTop: 10,
                        }}
                      >
                        {bigApps.slice(0, 2).map((app) => (
                          <BigCard key={app.screen} app={app} />
                        ))}
                      </div>

                      {/* ━━ Row2: 復習 + 単語帳 ━━ */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 6,
                        }}
                      >
                        {bigApps.slice(2, 4).map((app) => (
                          <BigCard key={app.screen} app={app} />
                        ))}
                      </div>

                      {/* ━━ お知らせ・設定（大カードと同じ2列）━━ */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 6,
                        }}
                      >
                        {[
                          studentApps.find(
                            (a) => a.screen === "announcementsList"
                          ),
                          studentApps.find((a) => a.screen === "settingsApp"),
                        ]
                          .filter(Boolean)
                          .map((app) => {
                            const [c1] = app.grad;
                            const sh = app.shadow;
                            const col = isLight ? sh : c1;
                            const Ic = app.SvgIcon || IcPet;
                            return (
                              <button
                                key={app.screen}
                                onClick={() => {
                                  setPrevScreen("start");
                                  setScreen(app.screen);
                                }}
                                className="active:scale-[0.94] transition-transform duration-150 relative overflow-hidden text-left"
                                style={{
                                  height: 90,
                                  borderRadius: 18,
                                  ...G,
                                  border: isLight
                                    ? "2px solid rgba(0,0,0,0.22)"
                                    : G.border,
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    right: "-8%",
                                    bottom: "-12%",
                                    width: "55%",
                                    height: "70%",
                                    borderRadius: "50%",
                                    background: `radial-gradient(circle, ${sh}22 0%, transparent 70%)`,
                                    pointerEvents: "none",
                                  }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    bottom: 10,
                                  }}
                                >
                                  <Ic size={30} color={col} style={glow(col)} />
                                </div>
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 12,
                                    left: 12,
                                  }}
                                >
                                  <p style={{ ...eyebrow, marginBottom: 3 }}>
                                    {app.screen === "announcementsList"
                                      ? "notice"
                                      : "settings"}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: 12,
                                    left: 12,
                                  }}
                                >
                                  <p style={{ ...titleMd, fontSize: 14 }}>
                                    {app.label}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {screen === "stats" && (
            <div className="space-y-6 animate-in fade-in text-left">
              <h2
                className="text-2xl font-black flex items-center gap-2 leading-none tracking-tight"
                style={{ color: theme.text }}
              >
                <BarChart3 className="text-amber-500" size={36} /> 成績
              </h2>

              {/* ── 総学習時間カード ── */}
              {(() => {
                const totalMin = history.reduce(
                  (s, h) => s + (h.duration || 0),
                  0
                );
                const hours = Math.floor(totalMin / 60);
                const mins = totalMin % 60;
                const sessions = history.length;
                const avgMin =
                  sessions > 0 ? Math.round(totalMin / sessions) : 0;
                return (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "総学習時間",
                        value: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
                        sub: `${sessions}セッション`,
                        color: "#f59e0b",
                        icon: <IcAchBolt size={26} color="#f59e0b" />,
                      },
                      {
                        label: "平均時間/回",
                        value: `${avgMin}分`,
                        sub: "セッション平均",
                        color: "#10b981",
                        icon: <IcAchChart size={26} color="#10b981" />,
                      },
                      {
                        label: "総セッション",
                        value: `${sessions}回`,
                        sub:
                          history.filter((h) => h.isClear).length + "回クリア",
                        color: "#8b5cf6",
                        icon: <IcAchPerfect size={26} color="#8b5cf6" />,
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl p-4 text-center"
                        style={{
                          background: isLight
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.05)",
                          border: `1px solid ${
                            isLight
                              ? "rgba(0,0,0,0.08)"
                              : "rgba(255,255,255,0.1)"
                          }`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            height: 28,
                          }}
                        >
                          {stat.icon}
                        </div>
                        <div
                          className="font-black text-lg mt-1"
                          style={{ color: stat.color }}
                        >
                          {stat.value}
                        </div>
                        <div
                          className="text-[9px] font-bold mt-0.5"
                          style={{ color: theme.textMuted }}
                        >
                          {stat.label}
                        </div>
                        <div
                          className="text-[8px] mt-0.5"
                          style={{ color: theme.textMuted }}
                        >
                          {stat.sub}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* ── カテゴリ別習得単語数 ── */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: isLight
                    ? "rgba(0,0,0,0.04)"
                    : "rgba(255,255,255,0.05)",
                  border: isLight
                    ? "1px solid rgba(0,0,0,0.08)"
                    : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <h3
                  className="font-black text-[11px] mb-4 flex items-center gap-2 uppercase tracking-widest"
                  style={{ color: theme.textMuted }}
                >
                  <BookCheck size={15} className="text-emerald-400" />{" "}
                  カテゴリ別 習得単語数
                </h3>
                {(() => {
                  const clearedStages = profile?.clearedStages || {};
                  const totalByCategory = WORD_CATEGORIES.map((cat) => {
                    const cleared = clearedStages[cat.key] || [];
                    // クリア済みステージのALL_VOCAB語数を正確にカウント
                    const learnedCount = ALL_VOCAB.filter(
                      (v) =>
                        (v.category || "英単語") === cat.key &&
                        cleared.includes(v.stage)
                    ).length;
                    const totalCount = ALL_VOCAB.filter(
                      (v) => (v.category || "英単語") === cat.key
                    ).length;
                    return {
                      ...cat,
                      learnedCount,
                      totalCount,
                      clearedCount: cleared.length,
                    };
                  });
                  const grandTotal = totalByCategory.reduce(
                    (s, c) => s + c.learnedCount,
                    0
                  );
                  const grandMax = totalByCategory.reduce(
                    (s, c) => s + c.totalCount,
                    0
                  );
                  return (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                      }}
                    >
                      {/* 合計 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: 14,
                          background: isLight
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.08)",
                          border: isLight
                            ? "1px solid rgba(0,0,0,0.07)"
                            : "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              color: theme.textMuted,
                              textTransform: "uppercase",
                              marginBottom: 2,
                            }}
                          >
                            合計
                          </p>
                          <p
                            style={{
                              fontSize: 22,
                              fontWeight: 900,
                              lineHeight: 1,
                              color: theme.accent,
                            }}
                          >
                            {grandTotal}{" "}
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: theme.textMuted,
                              }}
                            >
                              / {grandMax} 語
                            </span>
                          </p>
                        </div>
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            position: "relative",
                          }}
                        >
                          <svg
                            viewBox="0 0 56 56"
                            style={{
                              transform: "rotate(-90deg)",
                              width: 56,
                              height: 56,
                            }}
                          >
                            <circle
                              cx="28"
                              cy="28"
                              r="22"
                              fill="none"
                              stroke={
                                isLight
                                  ? "rgba(0,0,0,0.08)"
                                  : "rgba(255,255,255,0.1)"
                              }
                              strokeWidth="5"
                            />
                            <circle
                              cx="28"
                              cy="28"
                              r="22"
                              fill="none"
                              stroke={theme.accent}
                              strokeWidth="5"
                              strokeDasharray={`${2 * Math.PI * 22}`}
                              strokeDashoffset={`${
                                2 *
                                Math.PI *
                                22 *
                                (1 - grandTotal / Math.max(grandMax, 1))
                              }`}
                              strokeLinecap="round"
                              style={{
                                transition: "stroke-dashoffset 0.8s ease",
                              }}
                            />
                          </svg>
                          <span
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 900,
                              color: theme.accent,
                            }}
                          >
                            {grandMax > 0
                              ? Math.round((grandTotal / grandMax) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                      {/* カテゴリ別 */}
                      {totalByCategory.map((cat) => {
                        const pct =
                          cat.totalCount > 0
                            ? Math.round(
                                (cat.learnedCount / cat.totalCount) * 100
                              )
                            : 0;
                        const CatIc = CATEGORY_ICONS[cat.key];
                        return (
                          <div key={cat.key}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 6,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 7,
                                }}
                              >
                                {CatIc && <CatIc size={15} color={cat.color} />}
                                <span
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: isLight
                                      ? "rgba(20,10,60,0.75)"
                                      : "rgba(255,255,255,0.75)",
                                  }}
                                >
                                  {cat.label}
                                </span>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: theme.textMuted,
                                  }}
                                >
                                  ({cat.clearedCount}ステージ)
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "baseline",
                                  gap: 3,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 900,
                                    color: cat.color,
                                  }}
                                >
                                  {cat.learnedCount}
                                </span>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: theme.textMuted,
                                  }}
                                >
                                  / {cat.totalCount}
                                </span>
                              </div>
                            </div>
                            <div
                              style={{
                                height: 6,
                                borderRadius: 3,
                                background: isLight
                                  ? "rgba(0,0,0,0.08)"
                                  : "rgba(255,255,255,0.1)",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  borderRadius: 3,
                                  background: `linear-gradient(90deg, ${cat.color}cc, ${cat.color})`,
                                  width: `${pct}%`,
                                  boxShadow: `0 0 6px ${cat.color}88`,
                                  transition: "width 0.7s ease",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div
                className="p-6 rounded-2xl relative"
                style={{
                  background: isLight
                    ? "rgba(0,0,0,0.05)"
                    : "rgba(255,255,255,0.05)",
                  border: isLight
                    ? "1px solid rgba(0,0,0,0.08)"
                    : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <h3
                  className="font-black text-[11px] mb-3 flex items-center gap-2 uppercase tracking-widest"
                  style={{ color: theme.textMuted }}
                >
                  <Target size={16} className="text-amber-400" /> 正解数
                </h3>
                <BarChart type="words" />
              </div>
              <div
                className="p-6 rounded-2xl relative"
                style={{
                  background: isLight
                    ? "rgba(0,0,0,0.05)"
                    : "rgba(255,255,255,0.05)",
                  border: isLight
                    ? "1px solid rgba(0,0,0,0.08)"
                    : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <h3
                  className="font-black text-[11px] mb-3 flex items-center gap-2 uppercase tracking-widest"
                  style={{ color: theme.textMuted }}
                >
                  <Clock size={16} className="text-amber-500" /> 学習時間 (分)
                </h3>
                <BarChart type="minutes" />
              </div>
              <h3
                className="text-xl font-black mt-6 mb-3 px-1"
                style={{ color: theme.text }}
              >
                最近の履歴
              </h3>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <p
                    className="p-10 text-center font-bold"
                    style={{ color: theme.textMuted }}
                  >
                    まだ記録がありません
                  </p>
                ) : (
                  history.slice(0, 5).map((h) => (
                    <div
                      key={h.id}
                      className="p-4 rounded-2xl flex justify-between items-center"
                      style={{
                        background: isLight
                          ? "rgba(0,0,0,0.04)"
                          : "rgba(255,255,255,0.05)",
                        border: isLight
                          ? "1px solid rgba(0,0,0,0.07)"
                          : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center`}
                          style={
                            h.isClear
                              ? {
                                  background: "rgba(16,185,129,0.15)",
                                  color: "#34d399",
                                }
                              : {
                                  background: "rgba(239,68,68,0.15)",
                                  color: "#f87171",
                                }
                          }
                        >
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p
                            className="font-black text-base leading-none mb-1"
                            style={{ color: theme.text }}
                          >
                            {h.correctCount}語 / {h.duration}分
                          </p>
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: theme.textMuted }}
                          >
                            Stage {h.stage} •{" "}
                            {new Date(h.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {screen === "achievements" && (
            <div className="animate-in fade-in pb-24 text-left">
              {/* ヘッダー */}
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => setScreen(prevScreen || "start")}
                  className="p-2 rounded-xl active:opacity-70"
                  style={{
                    background: isLight
                      ? "rgba(0,0,0,0.07)"
                      : "rgba(255,255,255,0.08)",
                    border: isLight
                      ? "1px solid rgba(0,0,0,0.1)"
                      : "1px solid rgba(255,255,255,0.1)",
                    color: theme.text,
                  }}
                >
                  <ChevronLeft />
                </button>
                <h2
                  className="text-2xl font-black flex items-center gap-2"
                  style={{ color: theme.text }}
                >
                  <Trophy size={24} className="text-yellow-400" /> 実績
                </h2>
              </div>

              {/* 達成バー */}
              {(() => {
                const total = ACHIEVEMENTS.length;
                const done = ACHIEVEMENTS.filter((a) =>
                  a.check(profile, history)
                ).length;
                return (
                  <div
                    className="rounded-2xl p-4 mb-5"
                    style={{
                      background: isLight
                        ? "rgba(0,0,0,0.05)"
                        : "rgba(255,255,255,0.06)",
                      border: isLight
                        ? "1px solid rgba(0,0,0,0.1)"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className="text-xs font-black uppercase tracking-widest"
                        style={{ color: theme.textMuted }}
                      >
                        達成率
                      </span>
                      <span
                        className="font-black text-base"
                        style={{ color: theme.accent }}
                      >
                        {done} / {total}
                      </span>
                    </div>
                    <div
                      className="h-2.5 rounded-full overflow-hidden"
                      style={{
                        background: isLight
                          ? "rgba(0,0,0,0.1)"
                          : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.round((done / total) * 100)}%`,
                          background: "linear-gradient(90deg,#7c3aed,#c9a84c)",
                        }}
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      {["bronze", "silver", "gold", "platinum"].map((r) => {
                        const rm = RANK_META[r];
                        const cnt = ACHIEVEMENTS.filter(
                          (a) => a.rank === r && a.check(profile, history)
                        ).length;
                        const tot = ACHIEVEMENTS.filter(
                          (a) => a.rank === r
                        ).length;
                        return (
                          <div
                            key={r}
                            className="flex-1 rounded-xl p-2 text-center"
                            style={{
                              background: rm.bg,
                              border: `1px solid ${rm.border}`,
                            }}
                          >
                            <p
                              className="text-[9px] font-black"
                              style={{ color: rm.color }}
                            >
                              {rm.label}
                            </p>
                            <p
                              className="text-sm font-black"
                              style={{ color: rm.color }}
                            >
                              {cnt}
                              <span className="text-[10px] opacity-60">
                                /{tot}
                              </span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* カテゴリータブ */}
              <div
                className="flex gap-2 pb-1 mb-3"
                style={{
                  overflowX: "auto",
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                {ACHIEVEMENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setAchvCat(cat.id)}
                    className="shrink-0 px-3 py-1.5 rounded-xl font-black text-xs transition-all"
                    style={
                      achvCat === cat.id
                        ? {
                            background: cat.color,
                            color: "#fff",
                            boxShadow: `0 2px 12px ${cat.color}55`,
                          }
                        : {
                            background: "rgba(128,128,128,0.15)",
                            color: isLight
                              ? "rgba(30,20,80,0.6)"
                              : "rgba(255,255,255,0.5)",
                            border: "1px solid rgba(128,128,128,0.2)",
                          }
                    }
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* 達成フィルター */}
              <div className="flex gap-2 mb-4">
                {[
                  ["all", "すべて"],
                  ["unlocked", "達成済み"],
                  ["locked", "未達成"],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setAchvFilter(val)}
                    className="flex-1 py-2 rounded-xl font-black text-xs transition-all"
                    style={
                      achvFilter === val
                        ? {
                            background:
                              "linear-gradient(135deg,#7c3aed,#6366f1)",
                            color: "#fff",
                          }
                        : {
                            background: isLight
                              ? "rgba(0,0,0,0.06)"
                              : "rgba(255,255,255,0.06)",
                            color: isLight
                              ? "rgba(30,20,80,0.5)"
                              : "rgba(255,255,255,0.45)",
                            border: isLight
                              ? "1px solid rgba(0,0,0,0.1)"
                              : "1px solid rgba(255,255,255,0.08)",
                          }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 実績グリッド */}
              {(() => {
                const rankOrder = {
                  platinum: 0,
                  gold: 1,
                  silver: 2,
                  bronze: 3,
                };
                const filtered = ACHIEVEMENTS.filter((a) => {
                  const catOk = achvCat === "all" || a.cat === achvCat;
                  const unlocked = a.check(profile, history);
                  const fOk =
                    achvFilter === "all" ||
                    (achvFilter === "unlocked" ? unlocked : !unlocked);
                  return catOk && fOk;
                }).sort((a, b) => {
                  const au = a.check(profile, history) ? 0 : 1,
                    bu = b.check(profile, history) ? 0 : 1;
                  if (au !== bu) return au - bu;
                  return (rankOrder[a.rank] ?? 9) - (rankOrder[b.rank] ?? 9);
                });
                if (!filtered.length)
                  return (
                    <p
                      className="text-center py-12 font-bold"
                      style={{ color: theme.textMuted }}
                    >
                      該当する実績がありません
                    </p>
                  );
                return (
                  <div className="grid grid-cols-2 gap-3">
                    {filtered.map((a) => {
                      const unlocked = a.check(profile, history);
                      const rm = RANK_META[a.rank];
                      const catColor =
                        ACHIEVEMENT_CATEGORIES.find((c) => c.id === a.cat)
                          ?.color || "#c9a84c";
                      const lockedText = isLight
                        ? "rgba(30,20,80,0.25)"
                        : "rgba(255,255,255,0.35)";
                      const lockedDesc = isLight
                        ? "rgba(30,20,80,0.18)"
                        : "rgba(255,255,255,0.2)";
                      return (
                        <div
                          key={a.id}
                          className="rounded-2xl p-4 flex flex-col gap-1.5"
                          style={{
                            background: unlocked
                              ? isLight
                                ? rm.bg
                                : rm.bg
                              : isLight
                              ? "rgba(0,0,0,0.04)"
                              : "rgba(255,255,255,0.03)",
                            border: `1.5px solid ${
                              unlocked
                                ? rm.border
                                : isLight
                                ? "rgba(0,0,0,0.08)"
                                : "rgba(255,255,255,0.07)"
                            }`,
                            opacity: unlocked ? 1 : 0.55,
                          }}
                        >
                          {/* アイコン行とランクバッジ */}
                          <div className="flex items-start justify-between">
                            <span
                              style={{
                                lineHeight: 1,
                                opacity: unlocked ? 1 : 0.35,
                                filter: unlocked ? "none" : "grayscale(1)",
                              }}
                            >
                              {a.IconComp ? (
                                <a.IconComp
                                  size={30}
                                  color={unlocked ? rm.color : "#888"}
                                />
                              ) : (
                                <EmojiIcon
                                  emoji={a.icon}
                                  size={30}
                                  color={unlocked ? rm.color : "#888"}
                                />
                              )}
                            </span>
                            <span
                              className="text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0"
                              style={{
                                background: rm.bg,
                                color: rm.color,
                                border: `1px solid ${rm.border}`,
                              }}
                            >
                              {rm.label}
                            </span>
                          </div>
                          {/* タイトル */}
                          <p
                            className="font-black text-sm leading-tight"
                            style={{
                              color: unlocked ? theme.text : lockedText,
                            }}
                          >
                            {a.title}
                          </p>
                          {/* 説明 */}
                          <p
                            className="text-[10px] font-bold leading-snug"
                            style={{
                              color: unlocked ? theme.textMuted : lockedDesc,
                            }}
                          >
                            {a.desc}
                          </p>
                          {/* カテゴリー + 達成マーク */}
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: catColor }}
                              />
                              <span
                                className="text-[9px] font-black uppercase tracking-wider"
                                style={{ color: catColor }}
                              >
                                {
                                  ACHIEVEMENT_CATEGORIES.find(
                                    (c) => c.id === a.cat
                                  )?.label
                                }
                              </span>
                            </div>
                            {unlocked && (
                              <span
                                className="text-[9px] font-black shrink-0 px-1.5 py-0.5 rounded-md"
                                style={{
                                  background: "rgba(16,185,129,0.2)",
                                  color: "#34d399",
                                  border: "1px solid rgba(16,185,129,0.3)",
                                }}
                              >
                                ✓ 達成
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {screen === "announcementsList" && (
            <div className="space-y-6 animate-in fade-in text-left">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setScreen("start")}
                  className="p-2 rounded-xl active:opacity-70 transition-all"
                  style={{
                    background: isLight
                      ? "rgba(0,0,0,0.06)"
                      : "rgba(255,255,255,0.08)",
                    border: isLight
                      ? "1.5px solid rgba(0,0,0,0.18)"
                      : "1px solid rgba(255,255,255,0.1)",
                    color: isLight ? "rgba(20,10,60,0.8)" : "white",
                  }}
                >
                  <ChevronLeft />
                </button>
                <h2
                  className="text-2xl font-black"
                  style={{ color: isLight ? "rgba(20,10,60,0.9)" : "white" }}
                >
                  お知らせ
                </h2>
              </div>
              <div className="space-y-4">
                {announcements.map((a) => (
                  <AnnouncementCard
                    key={a.id}
                    a={a}
                    isAdmin={isAdmin}
                    db={fb.db}
                    appId={fb.appId}
                    showToast={showToast}
                    setAnnouncements={setAnnouncements}
                    isLight={isLight}
                  />
                ))}
              </div>
            </div>
          )}

          {screen === "stageMap" && (
            <div className="pb-20 animate-in fade-in text-left">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setScreen("start")}
                  className="p-2 rounded-xl active:opacity-70 transition-all"
                  style={{
                    background: isLight
                      ? "rgba(0,0,0,0.06)"
                      : "rgba(255,255,255,0.08)",
                    border: isLight
                      ? "1px solid rgba(0,0,0,0.12)"
                      : "1px solid rgba(255,255,255,0.1)",
                    color: theme.text,
                  }}
                >
                  <ChevronLeft />
                </button>
                <h2 className="text-3xl font-black">ステージ選択</h2>
              </div>
              {/* カテゴリタブ */}
              <div className="flex gap-1.5 mb-5 flex-wrap">
                {WORD_CATEGORIES.map((cat) => {
                  const CatIc = CATEGORY_ICONS[cat.key];
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setGameCategory(cat.key)}
                      className="px-3 py-1.5 rounded-full font-black text-xs transition-all flex items-center gap-1.5"
                      style={{
                        background:
                          gameCategory === cat.key
                            ? cat.color
                            : isLight
                            ? "rgba(0,0,0,0.06)"
                            : "rgba(255,255,255,0.07)",
                        color:
                          gameCategory === cat.key
                            ? "white"
                            : isLight
                            ? "rgba(20,10,60,0.75)"
                            : "white",
                        border:
                          gameCategory === cat.key
                            ? "none"
                            : isLight
                            ? "1px solid rgba(0,0,0,0.15)"
                            : "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      {CatIc && (
                        <CatIc
                          size={13}
                          color={
                            gameCategory === cat.key
                              ? "white"
                              : isLight
                              ? "rgba(20,10,60,0.75)"
                              : "white"
                          }
                        />
                      )}
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                {(() => {
                  const catVocab = ALL_VOCAB.filter(
                    (v) => (v.category || "英単語") === gameCategory
                  );
                  const catStages = [
                    ...new Set(catVocab.map((v) => v.stage)),
                  ].sort((a, b) => a - b);
                  const catColor =
                    WORD_CATEGORIES.find((c) => c.key === gameCategory)
                      ?.color || "#f59e0b";
                  return catStages.map((sid) => {
                    const isUnlocked = sid <= (profile?.unlockedStage || 1);
                    // カテゴリ別クリア済みチェック
                    const clearedForCat =
                      profile?.clearedStages?.[gameCategory] || [];
                    const isCleared = clearedForCat.includes(sid);
                    const isBoss = sid % 5 === 0;
                    return (
                      <button
                        key={sid}
                        disabled={!isUnlocked}
                        onClick={() => {
                          setCurrentStage(sid);
                          setScreen("modeSelect");
                        }}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all`}
                        style={
                          isUnlocked
                            ? isBoss
                              ? {
                                  background: `linear-gradient(135deg, ${catColor}cc, ${catColor}88)`,
                                  border: `2px solid ${catColor}`,
                                  color: "white",
                                }
                              : {
                                  background: theme.card,
                                  border: `1.5px solid ${catColor}44`,
                                }
                            : { background: theme.card, opacity: 0.35 }
                        }
                      >
                        <span
                          className="text-[10px] font-black"
                          style={{
                            color:
                              isBoss && isUnlocked
                                ? "rgba(199,210,254,1)"
                                : theme.textMuted,
                          }}
                        >
                          {sid}
                        </span>
                        {isUnlocked ? (
                          isCleared ? (
                            <CheckCircle2
                              className="text-emerald-500"
                              size={20}
                            />
                          ) : (
                            <Zap style={{ color: catColor }} size={20} />
                          )
                        ) : (
                          <Lock size={14} className="text-slate-400" />
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {screen === "modeSelect" && (
            <div className="pb-20 animate-in fade-in text-left">
              <button
                onClick={() => setScreen("stageMap")}
                className="mb-6 p-2 rounded-xl active:opacity-70 transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <ChevronLeft />
              </button>
              <h2 className="text-4xl font-black mb-4">Stage {currentStage}</h2>
              {/* カテゴリ選択 */}
              <div className="flex gap-2 mb-8 flex-wrap">
                {WORD_CATEGORIES.map((cat) => {
                  const CatIc = CATEGORY_ICONS[cat.key];
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setGameCategory(cat.key)}
                      className="px-3 py-1.5 rounded-full font-black text-xs transition-all flex items-center gap-1.5"
                      style={{
                        background:
                          gameCategory === cat.key
                            ? cat.color
                            : isLight
                            ? "rgba(0,0,0,0.06)"
                            : "rgba(255,255,255,0.07)",
                        color:
                          gameCategory === cat.key
                            ? "white"
                            : isLight
                            ? "rgba(20,10,60,0.75)"
                            : "white",
                        border:
                          gameCategory === cat.key
                            ? "none"
                            : isLight
                            ? "1px solid rgba(0,0,0,0.15)"
                            : "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      {CatIc && (
                        <CatIc
                          size={13}
                          color={
                            gameCategory === cat.key
                              ? "white"
                              : isLight
                              ? "rgba(20,10,60,0.75)"
                              : "white"
                          }
                        />
                      )}
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-6">
                <button
                  onClick={() =>
                    startGame("meaning", currentStage, gameCategory)
                  }
                  className="p-10 rounded-[2.5rem] text-left flex justify-between items-center group active:opacity-80 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  <div className="flex items-center gap-6 text-left">
                    <div
                      className="p-5 rounded-2xl"
                      style={{ background: "rgba(201,168,76,0.18)" }}
                    >
                      <Zap className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">単語モード</h3>
                      <p
                        className="text-xs font-bold uppercase"
                        style={{ color: "rgba(165,180,252,0.7)" }}
                      >
                        Meaning
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-white/30" />
                </button>
                <button
                  onClick={() =>
                    startGame("sentence", currentStage, gameCategory)
                  }
                  className="p-10 rounded-[2.5rem] text-left flex justify-between items-center group active:opacity-80 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(16,185,129,0.3)",
                  }}
                >
                  <div className="flex items-center gap-6 text-left">
                    <div
                      className="p-5 rounded-2xl"
                      style={{ background: "rgba(16,185,129,0.2)" }}
                    >
                      <BookOpen className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">例文モード</h3>
                      <p
                        className="text-xs font-bold uppercase"
                        style={{ color: "rgba(110,231,183,0.7)" }}
                      >
                        Sentence
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-white/30" />
                </button>
              </div>
            </div>
          )}

          {screen === "play" && stageWords[currentIndex] && (
            <div
              className="animate-in fade-in flex flex-col w-full"
              style={{ flex: 1, gap: 12, paddingBottom: 8 }}
            >
              {/* ── ヘッダー：ライフ・スコア・プログレス ── */}
              <div
                className="shrink-0 px-4 py-3 rounded-2xl flex flex-col gap-2"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex gap-1.5">
                    {[...Array(3)].map((_, i) => (
                      <Heart
                        key={i}
                        size={22}
                        fill={i < lives ? "#f43f5e" : "none"}
                        className={
                          i < lives ? "text-rose-500" : "text-slate-300"
                        }
                      />
                    ))}
                  </div>
                  <div className="font-black text-amber-400 text-xl">
                    {score}
                  </div>
                  {/* やめるボタン */}
                  <button
                    onClick={() => setShowQuitConfirm(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs active:scale-95 transition-all"
                    style={{
                      background: isLight
                        ? "rgba(0,0,0,0.06)"
                        : "rgba(255,255,255,0.08)",
                      border: isLight
                        ? "1.5px solid rgba(0,0,0,0.25)"
                        : "1px solid rgba(255,255,255,0.14)",
                      color: isLight
                        ? "rgba(30,20,80,0.65)"
                        : "rgba(255,255,255,0.55)",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    やめる
                  </button>
                </div>
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{
                    background: isLight
                      ? "rgba(0,0,0,0.10)"
                      : "rgba(255,255,255,0.15)",
                    height: 8,
                    border: isLight ? "1.5px solid rgba(0,0,0,0.18)" : "none",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 999,
                      background: "linear-gradient(90deg,#b8860b,#e0c97f)",
                      width: `${Math.max(
                        4,
                        ((currentIndex + 1) / stageWords.length) * 100
                      )}%`,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              {/* ── 問題カード ── */}
              <div
                className="shrink-0 rounded-[2rem] flex flex-col items-center justify-center text-center relative"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  flex: "0 0 auto",
                  minHeight: 0,
                  padding: "24px 20px",
                }}
              >
                <button
                  onClick={() => {
                    const speakCats = ["英単語", "英熟語", "英会話"];
                    if (speakCats.includes(gameCategory || "英単語"))
                      speak(stageWords[currentIndex].en);
                  }}
                  className="absolute bottom-4 right-4 p-2.5 rounded-xl transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  <Volume2 size={18} />
                </button>
                {gameMode === "meaning" ? (
                  <div className="flex flex-col items-center gap-3">
                    <h2 className="text-5xl font-black text-white tracking-tighter text-center">
                      {stageWords[currentIndex].en}
                    </h2>
                    {["英単語", "英熟語", "英会話"].includes(
                      gameCategory || "英単語"
                    ) && (
                      <button
                        onClick={() => speak(stageWords[currentIndex].en)}
                        className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 active:scale-90 transition-all"
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        <Volume2 size={14} />
                        <span className="text-xs font-bold">読み上げ</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <h2 className="text-lg font-bold italic text-white/90 leading-relaxed px-4 text-center">
                    "
                    {formatSentence(
                      stageWords[currentIndex].sentence,
                      stageWords[currentIndex].en
                    )}
                    "
                  </h2>
                )}
              </div>

              {/* ── 選択肢 ── */}
              <div
                className="grid gap-2.5"
                style={{ flex: 1, minHeight: 0, paddingBottom: 12 }}
              >
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!feedback}
                    className={`rounded-2xl text-lg font-black transition-all text-center flex items-center justify-center ${
                      !feedback
                        ? ""
                        : feedback === "correct" &&
                          opt.en === stageWords[currentIndex].en
                        ? "bg-green-500 text-white"
                        : feedback === "incorrect" &&
                          opt.en === stageWords[currentIndex].en
                        ? isLight
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-emerald-900 text-emerald-300"
                        : "opacity-20"
                    }`}
                    style={{
                      flex: 1,
                      minHeight: 0,
                      ...(!feedback
                        ? {
                            background: isLight
                              ? "rgba(255,255,255,0.85)"
                              : "rgba(255,255,255,0.09)",
                            border: isLight
                              ? "2px solid rgba(0,0,0,0.20)"
                              : "1px solid rgba(255,255,255,0.15)",
                            color: isLight ? "rgba(30,20,80,0.85)" : "white",
                            boxShadow: isLight
                              ? "0 2px 8px rgba(0,0,0,0.08)"
                              : "none",
                          }
                        : {}),
                    }}
                  >
                    {gameMode === "meaning" ? opt.ja : opt.en}
                  </button>
                ))}
              </div>

              {/* ── やめる確認モーダル ── */}
              {showQuitConfirm && (
                <div
                  className="fixed inset-0 flex items-center justify-center z-50"
                  style={{
                    background: "rgba(0,0,0,0.65)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div
                    className="mx-6 rounded-3xl p-7 flex flex-col items-center gap-5 text-center"
                    style={{
                      background: isLight
                        ? "rgba(255,255,255,0.98)"
                        : "rgba(20,14,40,0.96)",
                      border: isLight
                        ? "1.5px solid rgba(0,0,0,0.15)"
                        : "1px solid rgba(255,255,255,0.12)",
                      boxShadow: isLight
                        ? "0 20px 60px rgba(0,0,0,0.18)"
                        : "0 20px 60px rgba(0,0,0,0.6)",
                      maxWidth: 320,
                      width: "100%",
                    }}
                  >
                    {/* アイコン */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "rgba(244,63,94,0.15)",
                        border: "1px solid rgba(244,63,94,0.3)",
                      }}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>

                    <div>
                      <p
                        className="font-black text-lg mb-1"
                        style={{
                          color: isLight ? "rgba(30,20,80,0.85)" : "white",
                        }}
                      >
                        本当にやめる？
                      </p>
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: isLight
                            ? "rgba(30,20,80,0.50)"
                            : "rgba(255,255,255,0.45)",
                        }}
                      >
                        {currentIndex}問 正解 {correctCount} / スコア {score}
                      </p>
                      <p
                        className="text-xs mt-1 font-bold"
                        style={{
                          color: isLight
                            ? "rgba(30,20,80,0.35)"
                            : "rgba(255,255,255,0.3)",
                        }}
                      >
                        ここまでの結果は記録されません
                      </p>
                    </div>

                    {/* ボタン2つ */}
                    <div className="flex flex-col gap-3 w-full">
                      <button
                        onClick={() => {
                          setShowQuitConfirm(false);
                          setScreen(
                            currentStage === "Custom" ||
                              currentStage === "CustomPast"
                              ? "customApp"
                              : "stageMap"
                          );
                        }}
                        className="w-full py-3.5 rounded-2xl font-black text-base active:scale-95 transition-all"
                        style={{
                          background: "linear-gradient(135deg,#f43f5e,#e11d48)",
                          color: "white",
                          boxShadow: "0 4px 16px rgba(244,63,94,0.4)",
                        }}
                      >
                        やめる
                      </button>
                      <button
                        onClick={() => setShowQuitConfirm(false)}
                        className="w-full py-3.5 rounded-2xl font-black text-base active:scale-95 transition-all"
                        style={{
                          background: isLight
                            ? "rgba(0,0,0,0.05)"
                            : "rgba(255,255,255,0.07)",
                          border: isLight
                            ? "1.5px solid rgba(0,0,0,0.18)"
                            : "1px solid rgba(255,255,255,0.12)",
                          color: isLight
                            ? "rgba(30,20,80,0.75)"
                            : "rgba(255,255,255,0.8)",
                        }}
                      >
                        続ける
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {screen === "result" && (
            <div
              className="flex flex-col items-center justify-center animate-in fade-in text-center"
              style={{ minHeight: "calc(100vh - 120px)", padding: "16px 0" }}
            >
              <div
                className="rounded-[3rem] w-full text-center flex flex-col items-center justify-center gap-5"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: "32px 24px",
                }}
              >
                <Trophy size={56} className="text-yellow-400 animate-bounce" />
                {stageClearedOccurred ? (
                  <div className="w-full text-center">
                    <span className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl font-black shadow-xl uppercase tracking-wider text-base flex items-center justify-center gap-2 w-full">
                      <IcParty size={18} color="white" /> Mission Complete!
                    </span>
                  </div>
                ) : (
                  lives <= 0 && (
                    <div className="w-full text-center">
                      <span className="bg-rose-600 text-white px-4 py-2.5 rounded-2xl font-black shadow-xl uppercase tracking-wider text-base flex items-center justify-center gap-2 w-full">
                        <IcSkull size={18} color="white" /> Mission Failed
                      </span>
                    </div>
                  )
                )}
                <div
                  className="font-black leading-none text-center"
                  style={{
                    color: "#a78bfa",
                    fontSize: "clamp(5rem, 22vw, 8rem)",
                  }}
                >
                  {score}
                </div>
                {levelUpOccurred && (
                  <div className="w-full p-4 bg-yellow-100 rounded-[2rem] flex items-center justify-center gap-3 border-4 border-yellow-200 text-yellow-800 font-black text-lg uppercase tracking-widest shadow-lg text-center">
                    <Award size={28} /> Level Up!
                  </div>
                )}
                <button
                  onClick={() =>
                    setScreen(
                      currentStage === "Custom" || currentStage === "CustomPast"
                        ? "customApp"
                        : "stageMap"
                    )
                  }
                  className="w-full py-5 text-white rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all text-center"
                  style={{
                    background: "linear-gradient(135deg,#b8860b,#e0c97f)",
                    color: "#1a0e00",
                    boxShadow: "0 4px 20px rgba(200,160,60,0.4)",
                  }}
                >
                  {currentStage === "Custom" || currentStage === "CustomPast"
                    ? "カスタム問題へ戻る"
                    : "マップへ戻る"}
                </button>
              </div>
            </div>
          )}

          {/* --- フレンドリスト画面 --- */}
          {screen === "friendsList" && (
            <div className="space-y-8 animate-in fade-in text-left">
              <div className="flex justify-between items-center px-2 text-left">
                <h2 className="text-2xl font-black flex items-center gap-2 leading-none text-white tracking-tight">
                  <Users className="text-amber-400" size={28} /> フレンド
                </h2>
                <button
                  onClick={() => setScreen("addFriend")}
                  className="p-2.5 rounded-xl text-amber-300 active:opacity-70 transition-all"
                  style={{
                    background: "rgba(201,168,76,0.12)",
                    border: "1px solid rgba(99,102,241,0.25)",
                  }}
                >
                  <UserPlus size={22} />
                </button>
              </div>
              <div className="space-y-4">
                {friends.length === 0 ? (
                  <p
                    className="p-16 text-center font-bold text-white/30 rounded-2xl text-center"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    友達がまだいません
                  </p>
                ) : (
                  friends
                    .filter((f) => f.id !== user?.uid)
                    .map((f) => {
                      const fp = leaderboard.find((l) => l.id === f.id);
                      const fAvatar = fp?.avatar || f.avatar || "👤";
                      const fColor = fp?.color || f.color || "bg-amber-500";
                      const fName = fp?.name || f.name;
                      const fIsTeacher = !!(fp?.isTeacher || f.isTeacher);
                      const fScore = fp?.score || 0;
                      const fStage = fp?.unlockedStage || 1;
                      return (
                        <div
                          key={f.id}
                          className="p-5 rounded-2xl flex justify-between items-center group text-left"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <div className="flex items-center gap-6 text-left">
                            <div
                              style={{
                                position: "relative",
                                width: "64px",
                                height: "64px",
                                flexShrink: 0,
                              }}
                            >
                              <div
                                className={`w-16 h-16 ${fColor} rounded-[1.5rem] flex items-center justify-center text-4xl shadow-lg border-4 border-white overflow-hidden`}
                              >
                                {fAvatar.startsWith("data:") ||
                                fAvatar.startsWith("http") ? (
                                  <img
                                    src={fAvatar}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  fAvatar
                                )}
                              </div>
                              {fIsTeacher && (
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: "-4px",
                                    right: "-4px",
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    background:
                                      "linear-gradient(135deg,#f59e0b,#fbbf24)",
                                    border: "2px solid #1a1040",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "11px",
                                    zIndex: 20,
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                                  }}
                                >
                                  <IcCrownSm size={12} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-black text-white text-xl tracking-tight mb-1 text-left">
                                {fName}
                              </p>
                              <div className="flex items-center gap-3 text-left">
                                <span
                                  className="text-[9px] font-black px-2 py-0.5 rounded-lg uppercase text-left"
                                  style={{
                                    background:
                                      "linear-gradient(135deg,#b8860b,#d4a020)",
                                    color: "#fff8e0",
                                  }}
                                >
                                  Lv.{calcLevel(fScore)}
                                </span>
                                <span className="text-[11px] font-black text-slate-400 uppercase text-left">
                                  Stage {fStage}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setActiveFriend(f);
                                setScreen("dm");
                              }}
                              className="p-2.5 text-amber-400 rounded-xl active:opacity-70 transition-all relative"
                              style={{ background: "rgba(201,168,76,0.18)" }}
                            >
                              <MessageSquare size={20} />
                              {(unreadDm[f.id] || 0) > 0 && (
                                <span
                                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                                  style={{
                                    background: "#ef4444",
                                    border: "1.5px solid #1a1040",
                                  }}
                                >
                                  {unreadDm[f.id] > 9 ? "9+" : unreadDm[f.id]}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => handleRemoveFriend(f)}
                              className="p-2.5 transition-all text-white/20 hover:text-rose-400"
                            >
                              <Trash2 size={24} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* --- IDで追加画面 --- */}
          {screen === "addFriend" && (
            <div className="space-y-8 animate-in fade-in text-left">
              <div className="flex items-center gap-4 text-left">
                <button
                  onClick={() => setScreen("friendsList")}
                  className="p-2 rounded-xl active:opacity-70 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <ChevronLeft />
                </button>
                <h2 className="text-4xl font-black leading-none text-left">
                  IDで追加
                </h2>
              </div>
              <div
                className="p-8 rounded-3xl space-y-6 text-left"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="relative group text-left">
                  <Search
                    style={{
                      position: "absolute",
                      left: 24,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full p-5 pl-14 rounded-2xl font-black text-sm outline-none font-mono text-white text-left"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                    placeholder="6桁のFriend IDを入力"
                  />
                </div>
                <button
                  onClick={handleSearchById}
                  className="w-full py-6 text-white rounded-[2rem] font-black text-2xl shadow-xl active:scale-95 transition-all text-center"
                  style={{
                    background: "linear-gradient(135deg,#b8860b,#e0c97f)",
                    color: "#1a0e00",
                    boxShadow: "0 6px 28px rgba(200,160,60,0.45)",
                  }}
                >
                  ユーザー検索
                </button>
              </div>
              {searchResult && (
                <div
                  className="p-8 rounded-3xl flex flex-col items-center animate-in fade-in text-center mt-6"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    className={`w-28 h-28 ${searchResult.color} rounded-[2rem] flex items-center justify-center text-6xl mb-6 border-[6px] border-white shadow-2xl transform rotate-6 text-center`}
                  >
                    {searchResult.avatar}
                  </div>
                  <h3 className="text-3xl font-black text-white mb-6 text-center">
                    {searchResult.name}
                  </h3>
                  <button
                    onClick={() => handleAddFriend(searchResult)}
                    className="w-full py-6 text-white rounded-[2rem] font-black text-2xl shadow-xl text-center"
                    style={{
                      background: "linear-gradient(135deg,#b8860b,#e0c97f)",
                      color: "#1a0e00",
                      boxShadow: "0 6px 28px rgba(200,160,60,0.45)",
                    }}
                  >
                    追加する
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ━━━ 広場スクリーン ━━━ */}
          {screen === "plaza" &&
            (() => {
              const plazaApps = [
                {
                  label: "FACTORY",
                  SvgIcon: IcFactory,
                  grad: ["#f97316", "#ea580c"],
                  shadow: "#f97316",
                  screen: "factoryApp",
                  desc: "マイワードを作成",
                },
                {
                  label: "メモ",
                  SvgIcon: IcNoteApp,
                  grad: ["#38bdf8", "#0284c7"],
                  shadow: "#0ea5e9",
                  screen: "noteApp",
                  desc: "自分だけのメモを管理",
                },
                {
                  label: "ショップ",
                  SvgIcon: IcShop,
                  grad: ["#fcd34d", "#f59e0b"],
                  shadow: "#eab308",
                  screen: "petShop",
                  desc: "ペットやアイテムを購入",
                },
                {
                  label: "育成",
                  SvgIcon: IcPet,
                  grad: ["#f9a8d4", "#ec4899"],
                  shadow: "#ec4899",
                  screen: "petRoom",
                  desc: "ペットを育てて交流",
                },
                {
                  label: "実績",
                  SvgIcon: IcStar2,
                  grad: ["#c084fc", "#7c3aed"],
                  shadow: "#9333ea",
                  screen: "achievements",
                  desc: "達成したバッジを確認",
                },
                {
                  label: "つぶやき",
                  SvgIcon: IcTweetApp,
                  grad: ["#60a5fa", "#2563eb"],
                  shadow: "#3b82f6",
                  screen: "tweetApp",
                  desc: "みんなの投稿を見る",
                },
              ];
              return (
                <div
                  className="animate-in fade-in text-left pb-4"
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <h2
                    className="text-2xl font-black"
                    style={{ color: isLight ? "#1a0035" : "white" }}
                  >
                    広場
                  </h2>
                  {/* アプリグリッド */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    {plazaApps.map((app) => {
                      const [c1, c2] = app.grad;
                      const sh = app.shadow;
                      const col = isLight ? sh : c1;
                      const Ic = app.SvgIcon;
                      return (
                        <button
                          key={app.screen}
                          onClick={() => navigateTo(app.screen)}
                          className="active:scale-[0.94] transition-transform duration-150 relative overflow-hidden text-left"
                          style={{
                            height: 120,
                            borderRadius: 22,
                            background: isLight
                              ? "rgba(255,255,255,0.58)"
                              : "rgba(0,0,0,0.42)",
                            backdropFilter: "blur(22px)",
                            WebkitBackdropFilter: "blur(22px)",
                            border: isLight
                              ? "0.5px solid rgba(0,0,0,0.09)"
                              : "0.5px solid rgba(255,255,255,0.15)",
                            boxShadow: isLight
                              ? "0 2px 14px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)"
                              : "0 4px 22px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.06)",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              right: "-8%",
                              bottom: "-12%",
                              width: "55%",
                              height: "70%",
                              borderRadius: "50%",
                              background: `radial-gradient(circle, ${sh}22 0%, transparent 70%)`,
                              pointerEvents: "none",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              right: 12,
                              bottom: 12,
                            }}
                          >
                            <Ic
                              size={38}
                              color={col}
                              style={
                                isLight
                                  ? { color: col }
                                  : {
                                      color: col,
                                      filter: `drop-shadow(0 0 5px ${col}ee)`,
                                    }
                              }
                            />
                          </div>
                          <div
                            style={{ position: "absolute", top: 14, left: 14 }}
                          >
                            <p
                              style={{
                                fontSize: 9,
                                fontWeight: 600,
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                                color: isLight
                                  ? "rgba(40,20,80,0.55)"
                                  : "rgba(255,255,255,0.50)",
                                marginBottom: 5,
                              }}
                            >
                              {app.desc}
                            </p>
                            <p
                              style={{
                                fontSize: 18,
                                fontWeight: 800,
                                letterSpacing: "0.03em",
                                lineHeight: 1,
                                color: isLight
                                  ? "rgba(20,10,60,0.90)"
                                  : "rgba(255,255,255,0.92)",
                              }}
                            >
                              {app.label}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* フレンドリストへのアクセス */}
                  <button
                    onClick={() => setScreen("friendsList")}
                    className="active:scale-[0.97] transition-transform duration-150 relative overflow-hidden text-left"
                    style={{
                      borderRadius: 18,
                      height: 70,
                      background: isLight
                        ? "rgba(255,255,255,0.58)"
                        : "rgba(0,0,0,0.42)",
                      backdropFilter: "blur(22px)",
                      WebkitBackdropFilter: "blur(22px)",
                      border: isLight
                        ? "0.5px solid rgba(0,0,0,0.09)"
                        : "0.5px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        paddingLeft: 18,
                        paddingRight: 18,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          flexShrink: 0,
                          background: isLight
                            ? "rgba(99,102,241,0.15)"
                            : "rgba(99,102,241,0.25)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Users
                          size={20}
                          style={{ color: isLight ? "#4f46e5" : "#a5b4fc" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 300,
                            letterSpacing: "0.04em",
                            color: isLight
                              ? "rgba(20,10,60,0.75)"
                              : "rgba(255,255,255,0.70)",
                          }}
                        >
                          フレンド
                        </p>
                        <p
                          style={{
                            fontSize: 9,
                            fontWeight: 300,
                            letterSpacing: "0.1em",
                            color: isLight
                              ? "rgba(40,20,80,0.38)"
                              : "rgba(255,255,255,0.28)",
                            marginTop: 2,
                          }}
                        >
                          {friends.length > 0
                            ? `${friends.length}人のフレンド`
                            : "フレンドを追加しよう"}
                        </p>
                      </div>
                      {Object.values(unreadDm).reduce((a, b) => a + b, 0) >
                        0 && (
                        <span
                          style={{
                            minWidth: 20,
                            height: 20,
                            borderRadius: 10,
                            background:
                              "linear-gradient(135deg,#f43f5e,#e11d48)",
                            color: "white",
                            fontSize: 10,
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingInline: 4,
                            boxShadow: "0 0 8px rgba(244,63,94,0.6)",
                          }}
                        >
                          {Object.values(unreadDm).reduce((a, b) => a + b, 0)}
                        </span>
                      )}
                      <ChevronRight
                        size={16}
                        style={{
                          color: isLight
                            ? "rgba(40,20,80,0.3)"
                            : "rgba(255,255,255,0.25)",
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  </button>
                </div>
              );
            })()}

          {/* ランキング画面 */}
          {screen === "leaderboard" && (
            <div className="animate-in fade-in space-y-4 text-left pb-4">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 leading-none text-left text-white">
                <Trophy className="text-yellow-500" size={40} /> ランキング
              </h2>
              <div
                className="rounded-2xl overflow-hidden text-left"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {leaderboard.length === 0 ? (
                  <p className="p-10 text-center text-white/30 font-bold">
                    データがありません
                  </p>
                ) : (
                  leaderboard.map((e, i) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between px-4 py-3 transition-all text-left"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className="flex items-center gap-3 text-left min-w-0">
                        <div className="w-8 shrink-0 flex items-center justify-center">
                          {i === 0 ? (
                            <svg
                              width="28"
                              height="28"
                              viewBox="0 0 28 28"
                              fill="none"
                            >
                              <polygon
                                points="14,2 17,10 26,10 19,15.5 21.5,24 14,19 6.5,24 9,15.5 2,10 11,10"
                                fill="#f59e0b"
                                stroke="#d97706"
                                strokeWidth="1.2"
                                strokeLinejoin="round"
                              />
                              <circle
                                cx="14"
                                cy="12"
                                r="2.5"
                                fill="#fef3c7"
                                opacity="0.7"
                              />
                            </svg>
                          ) : i === 1 ? (
                            <svg
                              width="26"
                              height="26"
                              viewBox="0 0 26 26"
                              fill="none"
                            >
                              <circle
                                cx="13"
                                cy="13"
                                r="11"
                                fill="none"
                                stroke="#94a3b8"
                                strokeWidth="2"
                              />
                              <circle
                                cx="13"
                                cy="13"
                                r="7"
                                fill="#cbd5e1"
                                opacity="0.3"
                              />
                              <text
                                x="13"
                                y="17.5"
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight="900"
                                fill="#94a3b8"
                              >
                                2
                              </text>
                            </svg>
                          ) : i === 2 ? (
                            <svg
                              width="26"
                              height="26"
                              viewBox="0 0 26 26"
                              fill="none"
                            >
                              <circle
                                cx="13"
                                cy="13"
                                r="11"
                                fill="none"
                                stroke="#cd7f32"
                                strokeWidth="2"
                              />
                              <circle
                                cx="13"
                                cy="13"
                                r="7"
                                fill="#cd7f32"
                                opacity="0.2"
                              />
                              <text
                                x="13"
                                y="17.5"
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight="900"
                                fill="#cd7f32"
                              >
                                3
                              </text>
                            </svg>
                          ) : (
                            <span className="text-sm font-black text-white/30 w-6 text-center">
                              {i + 1}
                            </span>
                          )}
                        </div>
                        <div className="relative w-12 h-12 shrink-0">
                          <div
                            className={`w-12 h-12 ${e.color} rounded-2xl flex items-center justify-center shadow-md border-2 border-white overflow-hidden`}
                          >
                            {e.avatar?.startsWith("data:") ||
                            e.avatar?.startsWith("http") ? (
                              <img
                                src={e.avatar}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (() => {
                                const AvIc = AVATAR_ICONS[e.avatar];
                                return AvIc ? (
                                  <AvIc size={36} color="currentColor" />
                                ) : (
                                  <IcDefaultUser
                                    size={32}
                                    color="rgba(255,255,255,0.8)"
                                  />
                                );
                              })()
                            )}
                          </div>
                          {e.isTeacher && (
                            <div
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-lg"
                              style={{
                                background:
                                  "linear-gradient(135deg,#f59e0b,#fbbf24)",
                                border: "2px solid #0f0c29",
                                zIndex: 10,
                              }}
                            >
                              <IcCrownSm size={12} />
                            </div>
                          )}
                        </div>
                        <div className="text-left min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-black text-white text-base tracking-tight leading-none text-left truncate max-w-[120px]">
                              {e.uid === user?.uid ? "自分" : e.name}
                            </p>
                            <span
                              className="text-[10px] font-black px-2 py-0.5 rounded-lg uppercase shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg,#b8860b,#d4a020)",
                                color: "#fff8e0",
                              }}
                            >
                              Lv.{calcLevel(e.score)}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-white/40 uppercase tracking-wide text-left">
                            {e.score?.toLocaleString()} pts
                          </p>
                        </div>
                      </div>
                      <p className="font-black text-amber-400 text-lg tracking-tight text-right shrink-0 ml-2">
                        {e.score?.toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 先生用管理画面 */}
          {screen === "admin" &&
            (() => {
              if (!inviteCodeFetched) fetchInviteCode();
              return null;
            })()}
          {screen === "admin" && (
            <div className="space-y-6 animate-in fade-in pt-4 pb-4 text-left">
              <div className="flex justify-between items-end px-2 text-left">
                <h2 className="text-2xl font-black text-white leading-none">
                  先生用管理
                </h2>
                <button
                  onClick={() => setScreen("start")}
                  className="p-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 text-center active:opacity-70"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Home size={18} /> 終了
                </button>
              </div>
              <div
                className="rounded-2xl p-6 text-white space-y-4 relative overflow-hidden text-left"
                style={{
                  background: "linear-gradient(135deg,#b8860b,#e0c97f)",
                  boxShadow: "0 4px 24px rgba(201,168,76,0.4)",
                }}
              >
                <Megaphone
                  size={192}
                  style={{
                    position: "absolute",
                    right: -48,
                    bottom: -48,
                    opacity: 0.1,
                    transform: "rotate(12deg)",
                    pointerEvents: "none",
                  }}
                />
                <h3 className="font-black text-xl flex items-center gap-3 leading-none text-left">
                  <Megaphone size={32} /> お知らせの投稿
                </h3>
                <textarea
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder="メッセージを入力..."
                  className="w-full p-4 bg-white/10 rounded-2xl text-white text-base outline-none border border-white/20 transition-all min-h-[100px] text-left"
                />
                <button
                  onClick={handleAddAnnouncement}
                  className="w-full py-3.5 rounded-xl font-black text-base active:opacity-80 transition-all text-center"
                  style={{
                    background: theme.card,
                    border: `1px solid ${theme.cardBorder}`,
                    color: theme.accent,
                  }}
                >
                  送信
                </button>
              </div>
              <div
                className="rounded-2xl p-6 space-y-4 text-left"
                style={{
                  background: "rgba(16,185,129,0.07)",
                  border: "1px solid rgba(16,185,129,0.25)",
                }}
              >
                <h3 className="font-black text-xl flex items-center gap-3 text-emerald-300">
                  <IcKey size={14} color="currentColor" /> 招待コード管理
                </h3>
                <p className="text-white/30 text-xs font-bold">
                  生徒はこのコードがないと登録できません。変更すると以前のコードは使えなくなります。
                </p>
                <div
                  className="rounded-xl p-4 text-center"
                  style={{
                    background: "rgba(16,185,129,0.15)",
                    border: "1px solid rgba(16,185,129,0.3)",
                  }}
                >
                  <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest mb-2">
                    <IcArrowDown size={13} color="currentColor" />{" "}
                    生徒に伝えるコード
                  </p>
                  <code
                    className="font-mono font-black text-3xl text-emerald-300"
                    style={{ letterSpacing: "0.25em" }}
                  >
                    {inviteCode || "読み込み中..."}
                  </code>
                  <p className="text-[11px] text-emerald-400/50 font-bold mt-2">
                    登録画面で入力してもらう
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingInviteCode}
                    onChange={(e) =>
                      setEditingInviteCode(e.target.value.toUpperCase())
                    }
                    placeholder="新しいコードを入力"
                    maxLength={20}
                    className="flex-1 px-4 py-3 rounded-xl font-mono font-black text-sm outline-none text-white tracking-widest"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  />
                  <button
                    onClick={saveInviteCode}
                    disabled={isSavingInviteCode || !editingInviteCode.trim()}
                    className="px-5 py-3 rounded-xl font-black text-sm active:opacity-80 transition-all"
                    style={{
                      background: "linear-gradient(135deg,#059669,#10b981)",
                      color: "white",
                    }}
                  >
                    {isSavingInviteCode ? "..." : "更新"}
                  </button>
                </div>
              </div>

              {/* ━━ Googleスプレッドシートから単語インポート ━━ */}
              <div
                className="rounded-2xl p-6 space-y-4 text-left"
                style={{
                  background: "rgba(16,185,129,0.06)",
                  border: "1px solid rgba(16,185,129,0.22)",
                }}
              >
                <h3 className="font-black text-xl flex items-center gap-3 text-emerald-300">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  スプレッドシートから単語を追加
                </h3>

                {/* 機能説明 */}
                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{
                    background: "rgba(240,165,0,0.08)",
                    border: "1px solid rgba(240,165,0,0.20)",
                  }}
                >
                  <p className="text-xs font-black text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BookOpen size={13} /> この機能でできること
                  </p>
                  {[
                    [
                      "一括インポート",
                      "GoogleスプレッドシートのURLを貼るだけで単語を一括登録できます",
                      <FileUp size={14} />,
                    ],
                    [
                      "プレビュー確認",
                      "登録前に内容を確認。エラー行も表示されます",
                      <BookOpen size={14} />,
                    ],
                    [
                      "追加登録",
                      "既存の単語はそのままに、新しい単語を追記します",
                      <Plus size={14} />,
                    ],
                    [
                      "全置換",
                      "既存の単語をすべて削除してから新しい単語を登録します",
                      <RotateCcw size={14} />,
                    ],
                  ].map(([title, desc, icon], i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-amber-400/70 shrink-0 mt-0.5">
                        {icon}
                      </span>
                      <div>
                        <span className="text-xs font-black text-white/70">
                          {title}
                        </span>
                        <p className="text-[10px] text-white/40 font-bold mt-0.5">
                          {desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 公開手順 */}
                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.20)",
                  }}
                >
                  <p className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Settings size={13} /> スプレッドシートの公開手順
                  </p>
                  {[
                    "① Googleスプレッドシートを開く",
                    "② メニュー「ファイル」→「共有」→「ウェブに公開」",
                    "③「リンクを取得」で表示されたURLをコピー",
                    "④ 下のURL入力欄に貼り付けて「プレビュー」を押す",
                  ].map((step, i) => (
                    <p key={i} className="text-xs text-white/60 font-bold">
                      {step}
                    </p>
                  ))}
                  <p className="text-[10px] text-red-400/70 font-bold mt-2">
                    ⚠
                    「ウェブに公開」しないと読み込めません（「共有」の「リンクをコピー」とは別です）
                  </p>
                </div>

                {/* 使い方説明 */}
                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{
                    background: "rgba(16,185,129,0.10)",
                    border: "1px solid rgba(16,185,129,0.20)",
                  }}
                >
                  <p className="text-xs font-black text-emerald-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Layers size={13} /> スプレッドシートの列の形式
                  </p>
                  <div
                    className="rounded-lg overflow-hidden text-xs font-mono"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="grid grid-cols-3 gap-0">
                      {[
                        "A列: 英単語",
                        "B列: 日本語訳",
                        "C列: 例文（任意）",
                      ].map((h, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 text-emerald-400 font-black border-b"
                          style={{
                            borderColor: "rgba(16,185,129,0.2)",
                            background: "rgba(16,185,129,0.12)",
                          }}
                        >
                          {h}
                        </div>
                      ))}
                      {["achieve", "達成する", "He achieved his goal."].map(
                        (v, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 text-white/60"
                            style={{ borderColor: "rgba(255,255,255,0.05)" }}
                          >
                            {v}
                          </div>
                        )
                      )}
                      {["benefit", "利益・恩恵", "Fresh air is a benefit."].map(
                        (v, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 text-white/40 text-[10px]"
                          >
                            {v}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 font-bold">
                    ※
                    1行目はヘッダー行（見出し）として無視されます。2行目から単語データを入力してください。
                  </p>
                </div>

                {/* URLとステージ入力 */}
                <div className="space-y-3">
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={(e) => {
                      setSheetUrl(e.target.value);
                      setSheetPreview(null);
                    }}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(16,185,129,0.30)",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  />
                  <div className="flex gap-3 items-center">
                    <label className="text-xs font-black text-white/50 whitespace-nowrap">
                      ステージ番号
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={sheetStage}
                      onChange={(e) => setSheetStage(Number(e.target.value))}
                      className="w-20 px-3 py-2 rounded-xl text-sm font-black outline-none text-center"
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(16,185,129,0.25)",
                        color: "white",
                      }}
                    />
                    <button
                      onClick={() => importFromSheet(sheetUrl, sheetStage)}
                      disabled={!sheetUrl.trim() || sheetImporting}
                      className="flex-1 py-2.5 rounded-xl font-black text-sm active:opacity-80 transition-all"
                      style={{
                        background: sheetUrl.trim()
                          ? "linear-gradient(135deg,#059669,#10b981)"
                          : "rgba(255,255,255,0.08)",
                        color: "white",
                      }}
                    >
                      {sheetImporting ? "読み込み中..." : "プレビュー"}
                    </button>
                  </div>
                </div>

                {/* プレビュー */}
                {sheetPreview && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-emerald-300">
                        {sheetPreview.words.length}語を検出
                        {sheetPreview.errors.length > 0 && (
                          <span className="text-red-400 ml-2">
                            ({sheetPreview.errors.length}行エラー)
                          </span>
                        )}
                      </p>
                    </div>
                    {/* エラー表示 */}
                    {sheetPreview.errors.length > 0 && (
                      <div
                        className="rounded-xl p-3 space-y-1"
                        style={{
                          background: "rgba(239,68,68,0.10)",
                          border: "1px solid rgba(239,68,68,0.25)",
                        }}
                      >
                        {sheetPreview.errors.map((e, i) => (
                          <p key={i} className="text-xs text-red-400 font-bold">
                            {e}
                          </p>
                        ))}
                      </div>
                    )}
                    {/* 単語プレビュー（最大5件） */}
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {sheetPreview.words.slice(0, 5).map((w, i) => (
                        <div
                          key={i}
                          className="flex gap-4 px-4 py-2.5 text-sm"
                          style={{
                            background:
                              i % 2 === 0
                                ? "rgba(255,255,255,0.04)"
                                : "rgba(255,255,255,0.02)",
                            borderBottom:
                              i < 4
                                ? "1px solid rgba(255,255,255,0.06)"
                                : "none",
                          }}
                        >
                          <span className="font-black text-white w-28 shrink-0">
                            {w.en}
                          </span>
                          <span className="text-white/60 w-24 shrink-0">
                            {w.ja}
                          </span>
                          <span className="text-white/35 text-xs truncate">
                            {w.sentence}
                          </span>
                        </div>
                      ))}
                      {sheetPreview.words.length > 5 && (
                        <div
                          className="px-4 py-2 text-xs text-white/30 font-bold"
                          style={{ background: "rgba(255,255,255,0.02)" }}
                        >
                          ...他 {sheetPreview.words.length - 5} 語
                        </div>
                      )}
                    </div>
                    {/* 登録ボタン */}
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          commitSheetImport(sheetPreview.words, false)
                        }
                        disabled={
                          sheetImporting || sheetPreview.words.length === 0
                        }
                        className="flex-1 py-3 rounded-xl font-black text-sm active:opacity-80 transition-all"
                        style={{
                          background: "linear-gradient(135deg,#059669,#10b981)",
                          color: "white",
                        }}
                      >
                        {sheetImporting
                          ? "登録中..."
                          : `➕ 追加登録（${sheetPreview.words.length}語）`}
                      </button>
                      <button
                        onClick={() =>
                          commitSheetImport(sheetPreview.words, true)
                        }
                        disabled={
                          sheetImporting || sheetPreview.words.length === 0
                        }
                        className="flex-1 py-3 rounded-xl font-black text-sm active:opacity-80 transition-all"
                        style={{
                          background: "linear-gradient(135deg,#dc2626,#ef4444)",
                          color: "white",
                        }}
                      >
                        {sheetImporting ? "..." : "全置換"}
                      </button>
                    </div>
                    <p className="text-[10px] text-white/30 font-bold text-center">
                      「追加登録」は既存に追記、「全置換」は既存を全削除してから登録します
                    </p>
                  </div>
                )}
              </div>

              <div
                className="rounded-2xl p-6 space-y-4 text-left"
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl flex items-center gap-3 text-amber-300">
                    <Lock size={22} /> パスワード一覧
                  </h3>
                  <button
                    onClick={() => {
                      if (!showPasswordList) fetchPasswordList();
                      setShowPasswordList(!showPasswordList);
                    }}
                    className="px-4 py-2 rounded-xl font-black text-xs active:opacity-70 transition-all"
                    style={{
                      background: "rgba(201,168,76,0.25)",
                      color: "rgba(165,180,252,1)",
                      border: "1px solid rgba(99,102,241,0.4)",
                    }}
                  >
                    {showPasswordList ? "隠す" : "表示する"}
                  </button>
                </div>
                {showPasswordList && (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {isLoadingPasswords ? (
                      <p className="text-white/30 text-sm font-bold text-center py-4">
                        読み込み中...
                      </p>
                    ) : passwordList.length === 0 ? (
                      <p className="text-white/30 text-sm font-bold text-center py-4">
                        ユーザーなし
                      </p>
                    ) : (
                      passwordList.map((u) => (
                        <div
                          key={u.uid}
                          className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm overflow-hidden shrink-0 ${
                                u.avatar?.startsWith("data:")
                                  ? ""
                                  : u.color || "bg-amber-500"
                              }`}
                            >
                              {u.avatar?.startsWith("data:") ? (
                                <img
                                  src={u.avatar}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                u.avatar || "👤"
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-bold text-sm leading-none truncate">
                                {u.name}
                              </p>
                              <p className="text-white/30 text-[10px] font-bold font-mono">
                                {u.shortId}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-amber-300 font-mono font-black text-sm">
                              {u.password}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div
                className="rounded-2xl p-6 space-y-4 text-left"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <h3 className="font-black text-xl flex items-center gap-3 text-rose-400">
                  <Trash2 size={22} /> ユーザー管理
                </h3>
                <div
                  className="flex items-center gap-2 text-[11px] font-bold"
                  style={{ color: "rgba(201,168,76,0.7)" }}
                >
                  <MessageSquare size={12} />
                  <IcSpeech size={13} color="#c9a84c" />=
                  発言権限（タップでON/OFF）　生徒はデフォルト閲覧のみ
                </div>
                {/* 一括コイン配布 */}
                <div
                  className="rounded-xl p-3 flex items-center gap-2"
                  style={{
                    background: "rgba(250,204,21,0.08)",
                    border: "1px solid rgba(250,204,21,0.2)",
                  }}
                >
                  <IcCoin size={20} color="#facc15" />
                  <span className="text-yellow-300 font-black text-xs flex-1">
                    全員に一括配布
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    value={coinInputs["__all__"] ?? ""}
                    onChange={(e) =>
                      setCoinInputs((prev) => ({
                        ...prev,
                        __all__: e.target.value,
                      }))
                    }
                    className="w-16 px-2 py-1.5 rounded-lg outline-none font-black text-yellow-300 text-xs"
                    style={{
                      background: "rgba(250,204,21,0.15)",
                      border: "1px solid rgba(250,204,21,0.3)",
                    }}
                    placeholder="pt"
                  />
                  <button
                    onClick={async () => {
                      const amt = parseInt(coinInputs["__all__"], 10);
                      if (!amt || amt <= 0) {
                        showToast("配布ポイントを入力してください", "error");
                        return;
                      }
                      if (
                        !window.confirm(
                          `全ユーザー(${leaderboard.length}人)に${amt}ptを配布しますか？`
                        )
                      )
                        return;
                      for (const u of leaderboard) {
                        await handleGiveCoins(u.uid || u.id, u.name, amt).catch(
                          () => null
                        );
                      }
                      setCoinInputs((prev) => ({ ...prev, __all__: "" }));
                    }}
                    className="px-3 py-1.5 rounded-xl font-black text-xs text-yellow-900 active:opacity-70 transition-all"
                    style={{
                      background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                    }}
                  >
                    配布
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {leaderboard.length === 0 ? (
                    <p className="text-white/30 text-sm font-bold text-center py-4">
                      ユーザーなし
                    </p>
                  ) : (
                    leaderboard.map((u) => (
                      <div
                        key={u.uid || u.shortId}
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            style={{
                              position: "relative",
                              width: "32px",
                              height: "32px",
                              flexShrink: 0,
                            }}
                          >
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm overflow-hidden ${
                                u.avatar?.startsWith("data:")
                                  ? ""
                                  : u.color || "bg-amber-500"
                              }`}
                            >
                              {u.avatar?.startsWith("data:") ? (
                                <img
                                  src={u.avatar}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                u.avatar || "👤"
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm leading-none">
                              {(u.uid || u.id) === user?.uid ? "自分" : u.name}
                            </p>
                            <p className="text-white/30 text-[10px] font-bold">
                              {u.shortId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div
                            className="flex items-center gap-1 rounded-xl overflow-hidden"
                            style={{
                              background: "rgba(250,204,21,0.12)",
                              border: "1px solid rgba(250,204,21,0.25)",
                            }}
                          >
                            <input
                              type="number"
                              min="1"
                              max="9999"
                              value={coinInputs[u.uid || u.id] ?? ""}
                              onChange={(e) =>
                                setCoinInputs((prev) => ({
                                  ...prev,
                                  [u.uid || u.id]: e.target.value,
                                }))
                              }
                              className="w-14 px-2 py-1.5 bg-transparent outline-none font-black text-yellow-300 text-xs"
                              placeholder="pt"
                            />
                            <button
                              onClick={() => {
                                const amt = parseInt(
                                  coinInputs[u.uid || u.id],
                                  10
                                );
                                if (!amt || amt <= 0) {
                                  showToast(
                                    "配布ポイントを入力してください",
                                    "error"
                                  );
                                  return;
                                }
                                handleGiveCoins(u.uid || u.id, u.name, amt);
                                setCoinInputs((prev) => ({
                                  ...prev,
                                  [u.uid || u.id]: "",
                                }));
                              }}
                              className="px-2 py-1.5 font-black text-[11px] text-yellow-900 active:opacity-70 transition-all"
                              style={{
                                background:
                                  "linear-gradient(135deg,#f59e0b,#fbbf24)",
                              }}
                              title="コインを配布"
                            >
                              <IcCoin size={14} color="#92400e" />
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              handleToggleChatPermission(u.uid || u.id)
                            }
                            className="p-2 rounded-xl active:opacity-70 transition-all shrink-0"
                            title={
                              (chatSettings.allowedUids || []).includes(
                                u.uid || u.id
                              )
                                ? "発言権限を剥奪"
                                : "発言権限を付与"
                            }
                            style={
                              (chatSettings.allowedUids || []).includes(
                                u.uid || u.id
                              )
                                ? {
                                    background: "rgba(201,168,76,0.2)",
                                    border: "1px solid rgba(201,168,76,0.4)",
                                  }
                                : {
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                  }
                            }
                          >
                            <MessageSquare
                              size={16}
                              style={{
                                color: (
                                  chatSettings.allowedUids || []
                                ).includes(u.uid || u.id)
                                  ? "#c9a84c"
                                  : "rgba(255,255,255,0.25)",
                              }}
                            />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteUser(u.uid || u.id, u.shortId)
                            }
                            className="p-2 rounded-xl text-rose-400 active:opacity-70 transition-all"
                            style={{
                              background: "rgba(239,68,68,0.15)",
                              border: "1px solid rgba(239,68,68,0.3)",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== 設定画面 ===== */}
          {screen === "settingsApp" && (
            <div
              className="animate-in fade-in"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)",
                paddingLeft: 20,
                paddingRight: 20,
                paddingBottom: 60,
                background: theme.bg,
              }}
            >
              {/* ヘッダー */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setScreen(prevScreen || "start")}
                  className="p-2 rounded-xl active:opacity-70 transition-all"
                  style={{
                    background: isLight
                      ? "rgba(30,20,80,0.07)"
                      : "rgba(255,255,255,0.08)",
                    border: `1px solid ${
                      isLight ? "rgba(30,20,80,0.12)" : "rgba(255,255,255,0.1)"
                    }`,
                  }}
                >
                  <ChevronLeft size={20} style={{ color: theme.text }} />
                </button>
                <h2
                  className="text-2xl font-black"
                  style={{ color: theme.text }}
                >
                  設定
                </h2>
              </div>

              {/* ── プロフィール ── */}
              <div
                className="rounded-2xl p-5 mb-4"
                style={{
                  background: isLight
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${theme.cardBorder}`,
                }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-4"
                  style={{ color: theme.textMuted }}
                >
                  プロフィール再設定
                </p>

                {/* ── ニックネーム変更 ── */}
                <div
                  className="mb-5 pb-5"
                  style={{ borderBottom: `1px solid ${theme.cardBorder}` }}
                >
                  <p
                    className="text-[10px] font-black uppercase tracking-widest mb-3"
                    style={{ color: theme.textMuted }}
                  >
                    ニックネーム
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-14 h-14 ${
                        avatarImage ? "" : selectedColor.bg
                      } rounded-2xl flex items-center justify-center overflow-hidden shrink-0`}
                      style={{ border: `2px solid ${theme.accent}44` }}
                    >
                      {avatarImage ? (
                        <img
                          src={avatarImage}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (() => {
                          const AvatarIc = AVATAR_ICONS[selectedAvatar.char];
                          return AvatarIc ? (
                            <AvatarIc size={34} color="currentColor" />
                          ) : (
                            <span style={{ fontSize: 28 }}>
                              {selectedAvatar.char}
                            </span>
                          );
                        })()
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="ニックネーム"
                        className="w-full px-4 py-3 rounded-xl font-black text-base outline-none"
                        style={{
                          background: isLight
                            ? "rgba(255,255,255,0.9)"
                            : "rgba(255,255,255,0.07)",
                          border: `1.5px solid ${theme.cardBorder}`,
                          color: theme.text,
                        }}
                      />
                      <p
                        className="text-xs mt-1.5 font-bold"
                        style={{ color: theme.textMuted }}
                      >
                        ID: {profile?.shortId || "------"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!newName.trim()) return;
                      setIsSavingProfile(true);
                      const updated = {
                        ...profile,
                        name: newName.trim(),
                        displayName: newName.trim(),
                      };
                      setProfile(updated);
                      saveLocal("profile", updated);
                      if (user && fb.enabled) {
                        try {
                          await setDoc(
                            doc(
                              fb.db,
                              "artifacts",
                              fb.appId,
                              "users",
                              user.uid,
                              "profile",
                              "main"
                            ),
                            updated,
                            { merge: true }
                          );
                        } catch {}
                      }
                      setIsSavingProfile(false);
                      showToast("ニックネームを保存しました！");
                    }}
                    disabled={isSavingProfile || !newName.trim()}
                    className="w-full py-3 rounded-xl font-black text-white text-sm active:scale-95 transition-all disabled:opacity-40"
                    style={{
                      background: `linear-gradient(135deg,${theme.accent}cc,${theme.accent})`,
                      boxShadow: `0 4px 16px ${theme.accent}44`,
                    }}
                  >
                    {isSavingProfile ? "保存中..." : "ニックネームを保存"}
                  </button>
                </div>

                {/* ── アバター変更 ── */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: theme.textMuted }}
                    >
                      アバター
                    </p>
                    <label
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer active:opacity-70"
                      style={{
                        background: "rgba(201,168,76,0.12)",
                        border: "1px solid rgba(201,168,76,0.3)",
                      }}
                    >
                      <IcCamera size={11} color="#f59e0b" />
                      <span className="text-[10px] font-black text-amber-400">
                        写真
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async (ev) => {
                            const compressed = await compressImage(
                              ev.target.result
                            );
                            setAvatarImage(compressed);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                  {avatarImage && (
                    <button
                      onClick={() => setAvatarImage(null)}
                      className="w-full mb-2 py-1.5 rounded-lg text-[11px] font-bold text-rose-400"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                      }}
                    >
                      写真を削除してアイコンを使う
                    </button>
                  )}
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {AVATARS.map((a) => {
                      const AvatarIc = AVATAR_ICONS[a.char];
                      const isSel =
                        !avatarImage && selectedAvatar.char === a.char;
                      return (
                        <button
                          key={a.char}
                          onClick={() => {
                            setSelectedAvatar(a);
                            setAvatarImage(null);
                          }}
                          className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all active:scale-95"
                          style={{
                            background: isSel
                              ? "rgba(201,168,76,0.18)"
                              : "rgba(100,116,139,0.07)",
                            border: isSel
                              ? "2px solid #f59e0b"
                              : "2px solid transparent",
                          }}
                        >
                          {AvatarIc ? (
                            <AvatarIc size={28} color="currentColor" />
                          ) : (
                            <span style={{ fontSize: 22 }}>{a.char}</span>
                          )}
                          <span
                            className="text-[8px] font-black"
                            style={{ color: isSel ? "#b45309" : "#94a3b8" }}
                          >
                            {a.label || a.char}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Lv10解放帽子アバター */}
                  {(() => {
                    const unlockedHatAvatars = Object.values(
                      PET_HAT_AVATARS
                    ).filter((ha) => {
                      const petId = ha.char.replace("_hat", "");
                      const pd = getPetData(petId);
                      return getPetLvFromAffection(pd.affection || 0) >= 10;
                    });
                    if (unlockedHatAvatars.length === 0) return null;
                    return (
                      <>
                        <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <IcHat size={11} /> Lv10解放アバター
                        </p>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                          {unlockedHatAvatars.map((ha) => {
                            const HatIc = ha.component;
                            const isSel =
                              !avatarImage && selectedAvatar.char === ha.char;
                            return (
                              <button
                                key={ha.char}
                                onClick={() => {
                                  setSelectedAvatar(ha);
                                  setAvatarImage(null);
                                }}
                                className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all active:scale-95"
                                style={{
                                  background: isSel
                                    ? "rgba(201,168,76,0.18)"
                                    : "rgba(245,158,11,0.07)",
                                  border: isSel
                                    ? "2px solid #f59e0b"
                                    : "2px solid rgba(245,158,11,0.3)",
                                }}
                              >
                                <HatIc size={28} />
                                <span
                                  className="text-[8px] font-black"
                                  style={{
                                    color: isSel ? "#b45309" : "#f59e0b",
                                  }}
                                >
                                  {ha.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                  {/* カラー 12色 */}
                  <p
                    className="text-[10px] font-black uppercase tracking-widest mb-2"
                    style={{ color: theme.textMuted }}
                  >
                    カラー
                  </p>
                  <div className="grid grid-cols-6 gap-2 mb-4">
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        className={`h-9 rounded-xl ${c.bg} transition-all`}
                        style={{
                          boxShadow:
                            selectedColor.name === c.name
                              ? `0 0 0 3px ${c.hex}, 0 0 0 5px ${theme.bgColor}`
                              : "none",
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <button
                    onClick={async () => {
                      setIsSavingProfile(true);
                      const updated = {
                        ...profile,
                        avatar: avatarImage || selectedAvatar.char,
                        color: selectedColor.bg,
                      };
                      setProfile(updated);
                      saveLocal("profile", updated);
                      if (user && fb.enabled) {
                        try {
                          await setDoc(
                            doc(
                              fb.db,
                              "artifacts",
                              fb.appId,
                              "users",
                              user.uid,
                              "profile",
                              "main"
                            ),
                            updated,
                            { merge: true }
                          );
                        } catch {}
                      }
                      setIsSavingProfile(false);
                      showToast("アバターを保存しました！");
                    }}
                    disabled={isSavingProfile}
                    className="w-full py-3 rounded-xl font-black text-white text-sm active:scale-95 transition-all disabled:opacity-40"
                    style={{
                      background: "linear-gradient(135deg,#f59e0b,#d97706)",
                      boxShadow: "0 4px 16px rgba(245,158,11,0.4)",
                    }}
                  >
                    {isSavingProfile ? "保存中..." : "アバターを保存"}
                  </button>
                </div>
              </div>

              {/* ── テーマ ── */}
              <div
                className="rounded-2xl p-5 mb-4"
                style={{
                  background: isLight
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${theme.cardBorder}`,
                }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-3"
                  style={{ color: theme.textMuted }}
                >
                  テーマ
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setThemeId(t.id);
                        saveLocal("theme", t.id);
                      }}
                      className="py-3 px-4 rounded-xl flex items-center gap-2 font-black text-sm active:opacity-70 transition-all"
                      style={{
                        background:
                          themeId === t.id
                            ? t.accentGrad
                            : isLight
                            ? "rgba(30,20,80,0.06)"
                            : "rgba(255,255,255,0.06)",
                        color:
                          themeId === t.id
                            ? "white"
                            : isLight
                            ? "rgba(30,20,80,0.7)"
                            : "rgba(255,255,255,0.5)",
                        border:
                          themeId === t.id
                            ? "none"
                            : `1px solid ${
                                isLight
                                  ? "rgba(30,20,80,0.12)"
                                  : "rgba(255,255,255,0.1)"
                              }`,
                      }}
                    >
                      {t.IconComp ? (
                        <t.IconComp
                          size={16}
                          color={
                            themeId === t.id
                              ? "white"
                              : isLight
                              ? "rgba(30,20,80,0.7)"
                              : "rgba(255,255,255,0.5)"
                          }
                        />
                      ) : (
                        <span>{t.emoji}</span>
                      )}
                      {t.name}
                      {themeId === t.id && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── 通知 ── */}
              <div
                className="rounded-2xl p-5 mb-4"
                style={{
                  background: isLight
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${theme.cardBorder}`,
                }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-3"
                  style={{ color: theme.textMuted }}
                >
                  通知
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{ color: theme.text }}
                    >
                      単語追加通知
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: theme.textMuted }}
                    >
                      先生が単語を追加したとき通知する
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !notifVocabAdd;
                      setNotifVocabAdd(next);
                      localStorage.setItem(
                        "genron_notifVocabAdd",
                        JSON.stringify(next)
                      );
                    }}
                    className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                    style={{
                      background: notifVocabAdd
                        ? theme.accent
                        : "rgba(255,255,255,0.15)",
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                      style={{
                        left: notifVocabAdd ? "calc(100% - 22px)" : "2px",
                      }}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{ color: theme.text }}
                    >
                      称え場の未読バッジ
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: theme.textMuted }}
                    >
                      称え場に新しい投稿があるとき通知する
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !notifChatUnread;
                      setNotifChatUnread(next);
                      localStorage.setItem(
                        "genron_notifChatUnread",
                        JSON.stringify(next)
                      );
                    }}
                    className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                    style={{
                      background: notifChatUnread
                        ? theme.accent
                        : "rgba(255,255,255,0.15)",
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                      style={{
                        left: notifChatUnread ? "calc(100% - 22px)" : "2px",
                      }}
                    />
                  </button>
                </div>
              </div>

              {/* ── パスワード変更 ── */}
              <div
                className="rounded-2xl p-5 mb-4"
                style={{
                  background: isLight
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${theme.cardBorder}`,
                }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-3"
                  style={{ color: theme.textMuted }}
                >
                  パスワード変更
                </p>
                <div className="space-y-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none"
                    style={{
                      background: isLight
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.07)",
                      border: `1px solid ${theme.cardBorder}`,
                      color: theme.text,
                    }}
                    placeholder="新しいパスワード"
                  />
                  {newPassword.length > 0 && (
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none"
                      style={{
                        background: isLight
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(255,255,255,0.07)",
                        border: `1.5px solid ${
                          confirmPassword && confirmPassword !== newPassword
                            ? "rgba(239,68,68,0.6)"
                            : theme.cardBorder
                        }`,
                        color: theme.text,
                      }}
                      placeholder="パスワードを再入力"
                    />
                  )}
                  {newPassword && newPassword === confirmPassword && (
                    <button
                      onClick={handleRegister}
                      className="w-full py-3 rounded-xl font-black text-white text-sm"
                      style={{
                        background: "linear-gradient(135deg,#10b981,#059669)",
                      }}
                    >
                      パスワードを変更
                    </button>
                  )}
                </div>
              </div>

              {/* ── AI設定（先生のみ）── */}
              {isAdmin && (
                <div
                  className="rounded-2xl p-5 mb-4"
                  style={{
                    background: isLight
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(255,255,255,0.05)",
                    border: `1px solid ${theme.cardBorder}`,
                  }}
                >
                  <p
                    className="text-[10px] font-black uppercase tracking-widest mb-1"
                    style={{ color: theme.textMuted }}
                  >
                    AI 設定
                  </p>
                  <p
                    className="text-[11px] mb-4 leading-relaxed"
                    style={{ color: theme.textMuted }}
                  >
                    AIペットとの会話・スマート選択肢生成に
                    <span style={{ fontWeight: 700, color: theme.text }}>
                      {" "}
                      Anthropic API{" "}
                    </span>
                    を使用します。APIキーは
                    <a
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: theme.accent,
                        fontWeight: 700,
                        textDecoration: "underline",
                      }}
                    >
                      console.anthropic.com
                    </a>
                    から取得できます。キーはこの端末にのみ保存されます。
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={anthropicApiKey}
                      onChange={(e) => setAnthropicApiKey(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl font-mono text-sm outline-none"
                      style={{
                        background: isLight
                          ? "rgba(30,20,80,0.06)"
                          : "rgba(255,255,255,0.07)",
                        border: `1px solid ${theme.cardBorder}`,
                        color: theme.text,
                      }}
                      placeholder="sk-ant-..."
                    />
                    <button
                      onClick={() => {
                        localStorage.setItem(
                          "genron_anthropicApiKey",
                          anthropicApiKey
                        );
                        showToast("APIキーを保存しました！");
                      }}
                      className="px-4 py-2.5 rounded-xl font-black text-xs active:opacity-70 transition-all"
                      style={{
                        background: `linear-gradient(135deg,${theme.accent}cc,${theme.accent})`,
                        color: "white",
                      }}
                    >
                      保存
                    </button>
                  </div>
                </div>
              )}

              {/* ── アカウント ── */}
              <div
                className="rounded-2xl p-5 mb-4"
                style={{
                  background: isLight
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${theme.cardBorder}`,
                }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-3"
                  style={{ color: theme.textMuted }}
                >
                  アカウント
                </p>
                <div className="space-y-2">
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 rounded-xl font-bold text-sm active:opacity-70 flex items-center justify-center gap-2"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: isLight
                        ? "rgba(30,20,80,0.7)"
                        : "rgba(255,255,255,0.6)",
                      border: `1px solid ${theme.cardBorder}`,
                    }}
                  >
                    ログアウト
                  </button>
                  <button
                    onClick={handleResetProgress}
                    className="w-full py-3 rounded-xl font-bold text-xs active:opacity-70"
                    style={{
                      background: "rgba(251,146,60,0.08)",
                      color: "rgba(251,146,60,0.8)",
                      border: "1px solid rgba(251,146,60,0.2)",
                    }}
                  >
                    進捗をリセット（アカウントは残す）
                  </button>
                  <button
                    onClick={handleSelfDeleteAccount}
                    className="w-full py-3 rounded-xl font-bold text-xs active:opacity-70"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      color: "rgba(239,68,68,0.5)",
                      border: "1px solid rgba(239,68,68,0.15)",
                    }}
                  >
                    アカウントを削除する
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== FACTORY（マイワード作成）画面 ===== */}
          {screen === "factoryApp" &&
            (() => {
              const addUserVocab = async () => {
                const en = factoryInput.en.trim();
                const ja = factoryInput.ja.trim();
                const sentence = factoryInput.sentence.trim();
                if (!en || !ja) {
                  setFactoryError("英語と日本語は必須です");
                  return;
                }
                if (
                  userVocabList.some(
                    (w) => w.en.toLowerCase() === en.toLowerCase()
                  )
                ) {
                  setFactoryError("その単語はすでに登録されています");
                  return;
                }
                setFactoryAdding(true);
                setFactoryError("");
                const wordData = { en, ja, sentence, createdAt: Date.now() };
                if (user && fb.enabled) {
                  try {
                    await addDoc(
                      collection(
                        fb.db,
                        "artifacts",
                        fb.appId,
                        "users",
                        user.uid,
                        "userVocab"
                      ),
                      wordData
                    );
                  } catch (e) {
                    setFactoryError("保存に失敗しました");
                    setFactoryAdding(false);
                    return;
                  }
                } else {
                  setUserVocabList((prev) => [
                    ...prev,
                    { ...wordData, id: Date.now().toString() },
                  ]);
                }
                setFactoryInput({ en: "", ja: "", sentence: "" });
                setFactoryAdding(false);
                showToast("マイワードに追加しました！", "success");
              };

              return (
                <div
                  className="animate-in fade-in"
                  style={{ paddingBottom: "100px" }}
                >
                  {/* ヘッダー */}
                  <div className="flex items-center gap-3 mb-5">
                    <button
                      onClick={() => setScreen(prevScreen || "start")}
                      className="p-2 rounded-xl active:opacity-70 transition-all"
                      style={{
                        background: isLight
                          ? "rgba(30,20,80,0.07)"
                          : "rgba(255,255,255,0.08)",
                        border: `1px solid ${
                          isLight
                            ? "rgba(30,20,80,0.12)"
                            : "rgba(255,255,255,0.1)"
                        }`,
                      }}
                    >
                      <ChevronLeft size={20} style={{ color: theme.text }} />
                    </button>
                    <div>
                      <p
                        style={{
                          fontSize: 9,
                          fontWeight: 300,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "rgba(249,115,22,0.7)",
                          marginBottom: 2,
                        }}
                      >
                        my word factory
                      </p>
                      <h2
                        className="text-2xl font-black"
                        style={{ color: theme.text, lineHeight: 1 }}
                      >
                        FACTORY
                      </h2>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span
                        className="text-sm font-black px-3 py-1 rounded-full"
                        style={{
                          background: "rgba(249,115,22,0.15)",
                          color: "#f97316",
                          border: "1px solid rgba(249,115,22,0.3)",
                        }}
                      >
                        {userVocabList.length}語
                      </span>
                    </div>
                  </div>

                  {/* 入力フォーム */}
                  <div
                    className="rounded-2xl p-5 mb-4"
                    style={{
                      background: isLight
                        ? "rgba(249,115,22,0.06)"
                        : "rgba(249,115,22,0.08)",
                      border: "1.5px solid rgba(249,115,22,0.25)",
                    }}
                  >
                    <p
                      className="text-xs font-black uppercase tracking-widest mb-4"
                      style={{ color: "rgba(249,115,22,0.8)" }}
                    >
                      ＋ 新しい単語を追加
                    </p>
                    <div className="space-y-3">
                      {[
                        {
                          key: "en",
                          label: "英語 *",
                          placeholder: "例: persevere",
                        },
                        {
                          key: "ja",
                          label: "日本語 *",
                          placeholder: "例: 頑張り続ける",
                        },
                        {
                          key: "sentence",
                          label: "例文（任意）",
                          placeholder:
                            "例: She persevered through all difficulties.",
                        },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <p
                            className="text-xs font-bold mb-1"
                            style={{
                              color: isLight
                                ? "rgba(80,40,20,0.6)"
                                : "rgba(255,255,255,0.45)",
                            }}
                          >
                            {label}
                          </p>
                          <input
                            value={factoryInput[key]}
                            onChange={(e) => {
                              setFactoryInput((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }));
                              setFactoryError("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && key === "sentence")
                                addUserVocab();
                            }}
                            placeholder={placeholder}
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: 12,
                              fontSize: 14,
                              outline: "none",
                              background: isLight
                                ? "rgba(255,255,255,0.8)"
                                : "rgba(255,255,255,0.07)",
                              border: `1px solid ${
                                isLight
                                  ? "rgba(0,0,0,0.12)"
                                  : "rgba(255,255,255,0.12)"
                              }`,
                              color: isLight ? "#1a0035" : "white",
                            }}
                          />
                        </div>
                      ))}
                      {factoryError && (
                        <p
                          className="text-xs font-bold"
                          style={{ color: "#fb7185" }}
                        >
                          {factoryError}
                        </p>
                      )}
                      <button
                        onClick={addUserVocab}
                        disabled={
                          factoryAdding ||
                          !factoryInput.en.trim() ||
                          !factoryInput.ja.trim()
                        }
                        className="w-full py-3 rounded-xl font-black text-white text-sm active:scale-95 transition-all disabled:opacity-40"
                        style={{
                          background: "linear-gradient(135deg,#f97316,#ea580c)",
                          boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
                        }}
                      >
                        {factoryAdding ? "追加中..." : "＋ マイワードに追加"}
                      </button>
                    </div>
                  </div>

                  {/* 単語一覧 */}
                  {userVocabList.length > 0 && (
                    <div>
                      <p
                        className="text-xs font-black uppercase tracking-widest mb-3"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        登録済み単語
                      </p>
                      <div className="space-y-2">
                        {[...userVocabList].reverse().map((word) => {
                          const inReview = reviewList.some(
                            (r) => r.en === word.en
                          );
                          return (
                            <div
                              key={word.id}
                              className="flex items-center gap-3 p-3 rounded-2xl"
                              style={{
                                background: inReview
                                  ? "rgba(249,115,22,0.08)"
                                  : isLight
                                  ? "rgba(0,0,0,0.04)"
                                  : "rgba(255,255,255,0.04)",
                                border: inReview
                                  ? "1px solid rgba(249,115,22,0.3)"
                                  : `1px solid ${
                                      isLight
                                        ? "rgba(0,0,0,0.07)"
                                        : "rgba(255,255,255,0.07)"
                                    }`,
                              }}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <p
                                    className="font-black"
                                    style={{ color: theme.text, fontSize: 15 }}
                                  >
                                    {word.en}
                                  </p>
                                  <p
                                    className="font-bold text-sm"
                                    style={{ color: "rgba(255,255,255,0.5)" }}
                                  >
                                    {word.ja}
                                  </p>
                                </div>
                                {word.sentence && (
                                  <p
                                    className="text-xs italic mt-0.5"
                                    style={{ color: "rgba(255,255,255,0.3)" }}
                                  >
                                    {word.sentence}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                <button
                                  onClick={async () => {
                                    if (inReview) {
                                      const target = reviewList.find(
                                        (r) => r.en === word.en
                                      );
                                      if (target && user && fb.enabled) {
                                        try {
                                          await deleteDoc(
                                            doc(
                                              fb.db,
                                              "artifacts",
                                              fb.appId,
                                              "users",
                                              user.uid,
                                              "review",
                                              target.id
                                            )
                                          );
                                        } catch {}
                                      } else {
                                        setReviewList((prev) =>
                                          prev.filter((r) => r.en !== word.en)
                                        );
                                      }
                                      showToast("復習リストから削除しました");
                                    } else {
                                      const { id: _id, ...wordData } = word;
                                      if (user && fb.enabled) {
                                        await addDoc(
                                          collection(
                                            fb.db,
                                            "artifacts",
                                            fb.appId,
                                            "users",
                                            user.uid,
                                            "review"
                                          ),
                                          wordData
                                        );
                                      } else {
                                        setReviewList((prev) => [
                                          ...prev,
                                          {
                                            ...wordData,
                                            id: Date.now().toString(),
                                          },
                                        ]);
                                      }
                                      showToast("復習リストに追加しました！");
                                    }
                                  }}
                                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                                  style={{
                                    background: inReview
                                      ? "rgba(74,222,128,0.18)"
                                      : "rgba(255,255,255,0.06)",
                                    border: inReview
                                      ? "1.5px solid #4ade80"
                                      : "1.5px solid rgba(255,255,255,0.12)",
                                    color: inReview
                                      ? "#4ade80"
                                      : "rgba(255,255,255,0.3)",
                                  }}
                                  title={
                                    inReview
                                      ? "復習リストから削除"
                                      : "復習リストに追加"
                                  }
                                >
                                  {inReview ? (
                                    <CheckCircle2 size={15} />
                                  ) : (
                                    <BookOpen size={15} />
                                  )}
                                </button>
                                <button
                                  onClick={async () => {
                                    if (user && fb.enabled) {
                                      try {
                                        await deleteDoc(
                                          doc(
                                            fb.db,
                                            "artifacts",
                                            fb.appId,
                                            "users",
                                            user.uid,
                                            "userVocab",
                                            word.id
                                          )
                                        );
                                      } catch {}
                                    } else {
                                      setUserVocabList((prev) =>
                                        prev.filter((w) => w.id !== word.id)
                                      );
                                    }
                                    showToast("削除しました");
                                  }}
                                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                                  style={{
                                    background: "rgba(244,63,94,0.10)",
                                    color: "#fb7185",
                                    border: "1px solid rgba(244,63,94,0.2)",
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

          {/* ===== メモアプリ画面 ===== */}
          {screen === "noteApp" &&
            (() => {
              const saveNotes = (newNotes) => {
                setNotes(newNotes);
                try {
                  localStorage.setItem(
                    "oritan_notes",
                    JSON.stringify(newNotes)
                  );
                } catch {}
              };
              const addNote = () => {
                if (!noteInput.trim()) return;
                const newNote = {
                  id: Date.now().toString(),
                  text: noteInput.trim(),
                  createdAt: new Date().toISOString(),
                  pinned: false,
                };
                saveNotes([newNote, ...notes]);
                setNoteInput("");
              };
              const deleteNote = (id) =>
                saveNotes(notes.filter((n) => n.id !== id));
              const startEdit = (note) => {
                setNoteEditId(note.id);
                setNoteEditText(note.text);
              };
              const saveEdit = () => {
                if (!noteEditText.trim()) return;
                saveNotes(
                  notes.map((n) =>
                    n.id === noteEditId
                      ? { ...n, text: noteEditText.trim() }
                      : n
                  )
                );
                setNoteEditId(null);
                setNoteEditText("");
              };
              const togglePin = (id) =>
                saveNotes(
                  notes.map((n) =>
                    n.id === id ? { ...n, pinned: !n.pinned } : n
                  )
                );
              const filtered = notes.filter((n) =>
                n.text.toLowerCase().includes(noteSearch.toLowerCase())
              );
              const sorted = [...filtered].sort(
                (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
              );
              return (
                <div
                  className="animate-in fade-in"
                  style={{ paddingBottom: "90px" }}
                >
                  {/* ヘッダー */}
                  <div className="flex items-center gap-3 mb-5">
                    <button
                      onClick={() => setScreen(prevScreen || "start")}
                      className="p-2 rounded-xl active:opacity-70 transition-all"
                      style={{
                        background: isLight
                          ? "rgba(30,20,80,0.07)"
                          : "rgba(255,255,255,0.08)",
                        border: `1px solid ${
                          isLight
                            ? "rgba(30,20,80,0.12)"
                            : "rgba(255,255,255,0.1)"
                        }`,
                      }}
                    >
                      <ChevronLeft size={20} style={{ color: theme.text }} />
                    </button>
                    <h2
                      className="text-2xl font-black flex-1"
                      style={{ color: theme.text }}
                    >
                      メモ
                    </h2>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        background: "rgba(14,165,233,0.15)",
                        color: "#0ea5e9",
                      }}
                    >
                      {notes.length}件
                    </span>
                  </div>

                  {/* 入力エリア */}
                  <div
                    className="rounded-2xl p-4 mb-4"
                    style={{
                      background: isLight
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(255,255,255,0.06)",
                      border: `1px solid ${
                        isLight
                          ? "rgba(14,165,233,0.25)"
                          : "rgba(14,165,233,0.3)"
                      }`,
                      boxShadow: isLight
                        ? "0 2px 12px rgba(0,0,0,0.06)"
                        : "none",
                    }}
                  >
                    <textarea
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="メモを入力..."
                      rows={3}
                      className="w-full bg-transparent resize-none outline-none text-sm font-medium"
                      style={{ color: theme.text }}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        {noteInput.length}文字
                      </span>
                      <button
                        onClick={addNote}
                        disabled={!noteInput.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-sm active:opacity-70 transition-all disabled:opacity-40"
                        style={{
                          background: "linear-gradient(135deg,#0ea5e9,#38bdf8)",
                          color: "#fff",
                        }}
                      >
                        <IcPlus size={16} color="#fff" /> 保存
                      </button>
                    </div>
                  </div>

                  {/* 検索 */}
                  {notes.length > 2 && (
                    <div className="relative mb-4">
                      <input
                        value={noteSearch}
                        onChange={(e) => setNoteSearch(e.target.value)}
                        placeholder="メモを検索..."
                        className="w-full rounded-2xl px-4 py-3 text-sm font-medium outline-none"
                        style={{
                          background: isLight
                            ? "rgba(255,255,255,0.8)"
                            : "rgba(255,255,255,0.06)",
                          border: `1px solid ${
                            isLight
                              ? "rgba(0,0,0,0.1)"
                              : "rgba(255,255,255,0.1)"
                          }`,
                          color: theme.text,
                        }}
                      />
                    </div>
                  )}

                  {/* メモリスト */}
                  {sorted.length === 0 ? (
                    <div
                      className="text-center py-16"
                      style={{ color: theme.textMuted }}
                    >
                      <div className="mb-4 flex justify-center">
                        <IcNoteApp size={48} color="currentColor" />
                      </div>
                      <p className="font-bold text-sm">
                        {noteSearch ? "見つかりません" : "メモがありません"}
                      </p>
                      <p className="text-xs mt-1">
                        上のフォームからメモを追加してください
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sorted.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-2xl p-4"
                          style={{
                            background: note.pinned
                              ? isLight
                                ? "rgba(14,165,233,0.08)"
                                : "rgba(14,165,233,0.12)"
                              : isLight
                              ? "rgba(255,255,255,0.8)"
                              : "rgba(255,255,255,0.05)",
                            border: `1px solid ${
                              note.pinned
                                ? "rgba(14,165,233,0.35)"
                                : isLight
                                ? "rgba(0,0,0,0.08)"
                                : "rgba(255,255,255,0.08)"
                            }`,
                            boxShadow: isLight
                              ? "0 2px 8px rgba(0,0,0,0.05)"
                              : "none",
                          }}
                        >
                          {noteEditId === note.id ? (
                            <div>
                              <textarea
                                value={noteEditText}
                                onChange={(e) =>
                                  setNoteEditText(e.target.value)
                                }
                                rows={3}
                                className="w-full bg-transparent resize-none outline-none text-sm font-medium mb-3"
                                style={{ color: theme.text }}
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={saveEdit}
                                  className="flex-1 py-2 rounded-xl font-black text-xs active:opacity-70"
                                  style={{
                                    background:
                                      "linear-gradient(135deg,#0ea5e9,#38bdf8)",
                                    color: "#fff",
                                  }}
                                >
                                  保存
                                </button>
                                <button
                                  onClick={() => {
                                    setNoteEditId(null);
                                    setNoteEditText("");
                                  }}
                                  className="px-4 py-2 rounded-xl font-black text-xs active:opacity-70"
                                  style={{
                                    background: isLight
                                      ? "rgba(0,0,0,0.07)"
                                      : "rgba(255,255,255,0.08)",
                                    color: theme.text,
                                  }}
                                >
                                  キャンセル
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p
                                className="text-sm font-medium whitespace-pre-wrap leading-relaxed mb-3"
                                style={{ color: theme.text }}
                              >
                                {note.pinned && (
                                  <svg
                                    style={{
                                      display: "inline",
                                      verticalAlign: "middle",
                                      marginRight: 3,
                                    }}
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                  </svg>
                                )}
                                {note.text}
                              </p>
                              <div className="flex items-center justify-between">
                                <span
                                  className="text-[10px] font-bold"
                                  style={{ color: theme.textMuted }}
                                >
                                  {new Date(note.createdAt).toLocaleString(
                                    "ja-JP",
                                    {
                                      month: "numeric",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => togglePin(note.id)}
                                    className="p-2 rounded-xl active:opacity-70 transition-all"
                                    style={{
                                      background: note.pinned
                                        ? "rgba(14,165,233,0.15)"
                                        : isLight
                                        ? "rgba(0,0,0,0.05)"
                                        : "rgba(255,255,255,0.06)",
                                      color: note.pinned
                                        ? "#0ea5e9"
                                        : theme.textMuted,
                                    }}
                                    title={
                                      note.pinned ? "ピン解除" : "ピン留め"
                                    }
                                  >
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill={
                                        note.pinned ? "currentColor" : "none"
                                      }
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    >
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                      <circle cx="12" cy="10" r="3" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => startEdit(note)}
                                    className="p-2 rounded-xl active:opacity-70 transition-all"
                                    style={{
                                      background: isLight
                                        ? "rgba(0,0,0,0.05)"
                                        : "rgba(255,255,255,0.06)",
                                      color: theme.textMuted,
                                    }}
                                    title="編集"
                                  >
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    >
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => deleteNote(note.id)}
                                    className="p-2 rounded-xl active:opacity-70 transition-all"
                                    style={{
                                      background: isLight
                                        ? "rgba(239,68,68,0.08)"
                                        : "rgba(239,68,68,0.1)",
                                      color: "#ef4444",
                                    }}
                                    title="削除"
                                  >
                                    <IcTrash2 size={14} color="#ef4444" />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

          {/* ===== つぶやきアプリ画面 ===== */}
          {screen === "tweetApp" &&
            (() => {
              const saveTweets = async (newTweets) => {
                setTweets(newTweets);
                try {
                  localStorage.setItem(
                    "oritan_tweets",
                    JSON.stringify(newTweets)
                  );
                } catch {}
              };
              const postToFirebase = async (tweetObj) => {
                if (user && fb.enabled) {
                  await addDoc(
                    collection(
                      fb.db,
                      "artifacts",
                      fb.appId,
                      "public",
                      "data",
                      "tweets"
                    ),
                    tweetObj
                  );
                }
              };

              const myUid = user?.uid || "local";
              const myName =
                profile?.displayName || user?.displayName || "あなた";
              const myAvatar = profile?.avatar || "bear";

              const postTweet = async () => {
                if (!tweetInput.trim() && !tweetImage) return;
                const t = {
                  uid: myUid,
                  name: myName,
                  avatar: myAvatar,
                  text: tweetInput.trim(),
                  image: tweetImage || null,
                  createdAt: Date.now(),
                  likes: [],
                  retweets: [],
                  comments: [],
                };
                if (user && fb.enabled) {
                  await addDoc(
                    collection(
                      fb.db,
                      "artifacts",
                      fb.appId,
                      "public",
                      "data",
                      "tweets"
                    ),
                    t
                  );
                } else {
                  setTweets((prev) => [
                    { id: Date.now().toString(), ...t },
                    ...prev,
                  ]);
                  try {
                    localStorage.setItem(
                      "oritan_tweets",
                      JSON.stringify([
                        { id: Date.now().toString(), ...t },
                        ...tweets,
                      ])
                    );
                  } catch {}
                }
                setTweetInput("");
                setTweetImage(null);
              };
              const toggleLike = async (id) => {
                const tw = tweets.find((t) => t.id === id);
                if (!tw) return;
                const liked = (tw.likes || []).includes(myUid);
                const newLikes = liked
                  ? tw.likes.filter((u) => u !== myUid)
                  : [...(tw.likes || []), myUid];
                if (user && fb.enabled) {
                  await updateDoc(
                    doc(
                      fb.db,
                      "artifacts",
                      fb.appId,
                      "public",
                      "data",
                      "tweets",
                      id
                    ),
                    { likes: newLikes }
                  );
                } else {
                  setTweets((prev) =>
                    prev.map((t) =>
                      t.id === id ? { ...t, likes: newLikes } : t
                    )
                  );
                }
              };
              const toggleRetweet = async (id) => {
                const tw = tweets.find((t) => t.id === id);
                if (!tw) return;
                const rted = (tw.retweets || []).includes(myUid);
                const newRTs = rted
                  ? tw.retweets.filter((u) => u !== myUid)
                  : [...(tw.retweets || []), myUid];
                if (user && fb.enabled) {
                  await updateDoc(
                    doc(
                      fb.db,
                      "artifacts",
                      fb.appId,
                      "public",
                      "data",
                      "tweets",
                      id
                    ),
                    { retweets: newRTs }
                  );
                } else {
                  setTweets((prev) =>
                    prev.map((t) =>
                      t.id === id ? { ...t, retweets: newRTs } : t
                    )
                  );
                }
              };
              const addComment = async (id) => {
                if (!tweetCommentInput.trim()) return;
                const tw = tweets.find((t) => t.id === id);
                if (!tw) return;
                const comment = {
                  id: Date.now().toString(),
                  uid: myUid,
                  name: myName,
                  avatar: myAvatar,
                  text: tweetCommentInput.trim(),
                  createdAt: Date.now(),
                };
                const newComments = [...(tw.comments || []), comment];
                if (user && fb.enabled) {
                  await updateDoc(
                    doc(
                      fb.db,
                      "artifacts",
                      fb.appId,
                      "public",
                      "data",
                      "tweets",
                      id
                    ),
                    { comments: newComments }
                  );
                } else {
                  setTweets((prev) =>
                    prev.map((t) =>
                      t.id === id ? { ...t, comments: newComments } : t
                    )
                  );
                }
                setTweetCommentInput("");
                setTweetCommentTarget(null);
              };
              const deleteTweet = async (id) => {
                if (user && fb.enabled) {
                  try {
                    await deleteDoc(
                      doc(
                        fb.db,
                        "artifacts",
                        fb.appId,
                        "public",
                        "data",
                        "tweets",
                        id
                      )
                    );
                  } catch {
                    setTweets((prev) => prev.filter((t) => t.id !== id));
                  }
                } else {
                  setTweets((prev) => prev.filter((t) => t.id !== id));
                }
              };

              return (
                <div
                  className="animate-in fade-in"
                  style={{ paddingBottom: "90px" }}
                >
                  {/* ヘッダー */}
                  <div className="flex items-center gap-3 mb-5">
                    <button
                      onClick={() => setScreen(prevScreen || "start")}
                      className="p-2 rounded-xl active:opacity-70 transition-all"
                      style={{
                        background: isLight
                          ? "rgba(30,20,80,0.07)"
                          : "rgba(255,255,255,0.08)",
                        border: `1px solid ${
                          isLight
                            ? "rgba(30,20,80,0.12)"
                            : "rgba(255,255,255,0.1)"
                        }`,
                      }}
                    >
                      <ChevronLeft size={20} style={{ color: theme.text }} />
                    </button>
                    <div className="flex-1">
                      <h2
                        className="text-xl font-black leading-none"
                        style={{ color: theme.text }}
                      >
                        つぶやき
                      </h2>
                      <p
                        className="text-[10px] font-bold mt-0.5"
                        style={{ color: theme.textMuted }}
                      >
                        {tweets.length}件の投稿
                      </p>
                    </div>
                  </div>

                  {/* 投稿エリア */}
                  <div
                    className="rounded-2xl p-4 mb-5"
                    style={{
                      background: isLight
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.06)",
                      border: `1px solid ${
                        isLight
                          ? "rgba(29,155,240,0.25)"
                          : "rgba(29,155,240,0.3)"
                      }`,
                      boxShadow: isLight
                        ? "0 2px 16px rgba(0,0,0,0.06)"
                        : "none",
                    }}
                  >
                    <div className="flex gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                        style={{
                          background: isLight
                            ? "rgba(29,155,240,0.12)"
                            : "rgba(29,155,240,0.2)",
                        }}
                      >
                        {(() => {
                          const Av = AVATAR_ICONS[myAvatar];
                          if (Av) return <Av size={32} color="currentColor" />;
                          if (
                            myAvatar?.startsWith("data:") ||
                            myAvatar?.startsWith("http")
                          )
                            return (
                              <img
                                src={myAvatar}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            );
                          return <IcDefaultUser size={28} color="#1d9bf0" />;
                        })()}
                      </div>
                      <textarea
                        value={tweetInput}
                        onChange={(e) => setTweetInput(e.target.value)}
                        placeholder="いまどうしてる？"
                        rows={2}
                        maxLength={280}
                        className="flex-1 bg-transparent resize-none outline-none text-sm font-medium pt-2"
                        style={{ color: theme.text }}
                      />
                    </div>
                    {/* 画像プレビュー */}
                    {tweetImage && (
                      <div
                        className="relative mt-3 rounded-xl overflow-hidden"
                        style={{ maxHeight: 200 }}
                      >
                        <img
                          src={tweetImage}
                          alt="添付画像"
                          className="w-full object-cover rounded-xl"
                          style={{ maxHeight: 200 }}
                        />
                        <button
                          onClick={() => setTweetImage(null)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center font-black text-sm active:opacity-70"
                          style={{
                            background: "rgba(0,0,0,0.55)",
                            color: "#fff",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <div
                      className="flex justify-between items-center mt-3 pt-3"
                      style={{
                        borderTop: `1px solid ${
                          isLight
                            ? "rgba(0,0,0,0.06)"
                            : "rgba(255,255,255,0.06)"
                        }`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {/* 画像添付ボタン */}
                        <label
                          className="p-2 rounded-full active:opacity-70 cursor-pointer transition-all"
                          style={{ color: "#1d9bf0" }}
                          title="画像を添付"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (ev) =>
                                setTweetImage(ev.target.result);
                              reader.readAsDataURL(file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        <span
                          className="text-xs"
                          style={{
                            color:
                              tweetInput.length > 240
                                ? "#ef4444"
                                : theme.textMuted,
                          }}
                        >
                          {tweetInput.length}/280
                        </span>
                      </div>
                      <button
                        onClick={postTweet}
                        disabled={
                          (!tweetInput.trim() && !tweetImage) ||
                          tweetInput.length > 280
                        }
                        className="px-5 py-2 rounded-full font-black text-sm active:opacity-70 transition-all disabled:opacity-40"
                        style={{
                          background: "linear-gradient(135deg,#1d9bf0,#60cdff)",
                          color: "#fff",
                        }}
                      >
                        つぶやく
                      </button>
                    </div>
                  </div>

                  {/* タイムライン */}
                  {tweets.length === 0 ? (
                    <div
                      className="text-center py-16"
                      style={{ color: theme.textMuted }}
                    >
                      <div className="mb-4 flex justify-center">
                        <IcTweetApp size={48} color="currentColor" />
                      </div>
                      <p className="font-bold text-sm">
                        まだつぶやきがありません
                      </p>
                      <p className="text-xs mt-1">
                        最初のつぶやきを投稿してみよう！
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tweets.map((tw) => {
                        const liked = (tw.likes || []).includes(myUid);
                        const retweeted = (tw.retweets || []).includes(myUid);
                        const isOwn = tw.uid === myUid;
                        const showComments = tweetCommentTarget === tw.id;
                        return (
                          <div
                            key={tw.id}
                            className="rounded-2xl p-4"
                            style={{
                              background: isLight
                                ? "rgba(255,255,255,0.85)"
                                : "rgba(255,255,255,0.05)",
                              border: `1px solid ${
                                isLight
                                  ? "rgba(0,0,0,0.07)"
                                  : "rgba(255,255,255,0.08)"
                              }`,
                              boxShadow: isLight
                                ? "0 2px 8px rgba(0,0,0,0.04)"
                                : "none",
                            }}
                          >
                            {/* 投稿ヘッダー */}
                            <div className="flex items-start gap-3 mb-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                                style={{
                                  background: isLight
                                    ? "rgba(29,155,240,0.1)"
                                    : "rgba(29,155,240,0.15)",
                                }}
                              >
                                {(() => {
                                  const av = tw.avatar;
                                  const Av = AVATAR_ICONS[av];
                                  if (Av)
                                    return (
                                      <Av size={32} color="currentColor" />
                                    );
                                  if (
                                    av?.startsWith("data:") ||
                                    av?.startsWith("http")
                                  )
                                    return (
                                      <img
                                        src={av}
                                        className="w-full h-full object-cover"
                                        alt=""
                                      />
                                    );
                                  return (
                                    <IcDefaultUser size={28} color="#1d9bf0" />
                                  );
                                })()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className="font-black text-sm"
                                    style={{ color: theme.text }}
                                  >
                                    {tw.name}
                                  </span>
                                  <span
                                    className="text-[10px] font-bold"
                                    style={{ color: theme.textMuted }}
                                  >
                                    {new Date(tw.createdAt).toLocaleString(
                                      "ja-JP",
                                      {
                                        month: "numeric",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </span>
                                </div>
                                <p
                                  className="text-sm font-medium mt-1 whitespace-pre-wrap leading-relaxed"
                                  style={{ color: theme.text }}
                                >
                                  {tw.text}
                                </p>
                                {tw.image && (
                                  <div
                                    className="mt-2 rounded-xl overflow-hidden"
                                    style={{ maxHeight: 220 }}
                                  >
                                    <img
                                      src={tw.image}
                                      alt="添付画像"
                                      className="w-full object-cover rounded-xl"
                                      style={{ maxHeight: 220 }}
                                    />
                                  </div>
                                )}
                              </div>
                              {isOwn && (
                                <button
                                  onClick={() => deleteTweet(tw.id)}
                                  className="p-1.5 rounded-lg active:opacity-70 shrink-0"
                                  style={{
                                    color: isLight
                                      ? "rgba(0,0,0,0.25)"
                                      : "rgba(255,255,255,0.25)",
                                  }}
                                >
                                  <IcTrash2 size={14} color="currentColor" />
                                </button>
                              )}
                            </div>

                            {/* アクションボタン */}
                            <div
                              className="flex items-center gap-1 mt-1"
                              style={{
                                borderTop: `1px solid ${
                                  isLight
                                    ? "rgba(0,0,0,0.05)"
                                    : "rgba(255,255,255,0.05)"
                                }`,
                                paddingTop: "10px",
                              }}
                            >
                              {/* いいね */}
                              <button
                                onClick={() => toggleLike(tw.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs active:scale-90 transition-all"
                                style={{
                                  background: liked
                                    ? "rgba(249,24,128,0.12)"
                                    : "transparent",
                                  color: liked ? "#f91880" : theme.textMuted,
                                }}
                              >
                                <IcHeart
                                  size={15}
                                  color={liked ? "#f91880" : "currentColor"}
                                  filled={liked}
                                />
                                <span>
                                  {(tw.likes || []).length > 0
                                    ? (tw.likes || []).length
                                    : ""}
                                </span>
                              </button>
                              {/* リツイート */}
                              <button
                                onClick={() => toggleRetweet(tw.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs active:scale-90 transition-all"
                                style={{
                                  background: retweeted
                                    ? "rgba(0,186,124,0.12)"
                                    : "transparent",
                                  color: retweeted
                                    ? "#00ba7c"
                                    : theme.textMuted,
                                }}
                              >
                                <IcRetweet
                                  size={15}
                                  color={retweeted ? "#00ba7c" : "currentColor"}
                                />
                                <span>
                                  {(tw.retweets || []).length > 0
                                    ? (tw.retweets || []).length
                                    : ""}
                                </span>
                              </button>
                              {/* コメント */}
                              <button
                                onClick={() =>
                                  setTweetCommentTarget(
                                    showComments ? null : tw.id
                                  )
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs active:scale-90 transition-all"
                                style={{
                                  background: showComments
                                    ? "rgba(29,155,240,0.12)"
                                    : "transparent",
                                  color: showComments
                                    ? "#1d9bf0"
                                    : theme.textMuted,
                                }}
                              >
                                <IcComment
                                  size={15}
                                  color={
                                    showComments ? "#1d9bf0" : "currentColor"
                                  }
                                />
                                <span>
                                  {(tw.comments || []).length > 0
                                    ? (tw.comments || []).length
                                    : ""}
                                </span>
                              </button>
                              {/* シェア */}
                              <button
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs active:scale-90 transition-all ml-auto"
                                style={{ color: theme.textMuted }}
                                onClick={() => {
                                  if (navigator.clipboard)
                                    navigator.clipboard.writeText(tw.text);
                                }}
                                title="コピー"
                              >
                                <IcShare size={15} color="currentColor" />
                              </button>
                            </div>

                            {/* コメント展開 */}
                            {showComments && (
                              <div
                                className="mt-3 pt-3"
                                style={{
                                  borderTop: `1px solid ${
                                    isLight
                                      ? "rgba(0,0,0,0.05)"
                                      : "rgba(255,255,255,0.05)"
                                  }`,
                                }}
                              >
                                {/* 既存コメント */}
                                {(tw.comments || []).length > 0 && (
                                  <div className="space-y-2 mb-3">
                                    {tw.comments.map((c) => (
                                      <div key={c.id} className="flex gap-2">
                                        <div
                                          className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                                          style={{
                                            background: isLight
                                              ? "rgba(0,0,0,0.06)"
                                              : "rgba(255,255,255,0.08)",
                                          }}
                                        >
                                          {(() => {
                                            const av = c.avatar;
                                            const Av = AVATAR_ICONS[av];
                                            if (Av)
                                              return (
                                                <Av
                                                  size={22}
                                                  color="currentColor"
                                                />
                                              );
                                            if (
                                              av?.startsWith("data:") ||
                                              av?.startsWith("http")
                                            )
                                              return (
                                                <img
                                                  src={av}
                                                  className="w-full h-full object-cover"
                                                  alt=""
                                                />
                                              );
                                            return (
                                              <IcDefaultUser
                                                size={20}
                                                color={
                                                  isLight
                                                    ? "#475569"
                                                    : "rgba(255,255,255,0.7)"
                                                }
                                              />
                                            );
                                          })()}
                                        </div>
                                        <div
                                          className="rounded-xl px-3 py-2 flex-1"
                                          style={{
                                            background: isLight
                                              ? "rgba(0,0,0,0.04)"
                                              : "rgba(255,255,255,0.06)",
                                          }}
                                        >
                                          <span
                                            className="font-black text-[11px]"
                                            style={{ color: "#1d9bf0" }}
                                          >
                                            {c.name}{" "}
                                          </span>
                                          <span
                                            className="text-xs"
                                            style={{ color: theme.text }}
                                          >
                                            {c.text}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {/* コメント入力 */}
                                <div className="flex gap-2">
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                                    style={{
                                      background: isLight
                                        ? "rgba(29,155,240,0.1)"
                                        : "rgba(29,155,240,0.15)",
                                    }}
                                  >
                                    {(() => {
                                      const Av = AVATAR_ICONS[myAvatar];
                                      if (Av)
                                        return (
                                          <Av size={22} color="currentColor" />
                                        );
                                      if (
                                        myAvatar?.startsWith("data:") ||
                                        myAvatar?.startsWith("http")
                                      )
                                        return (
                                          <img
                                            src={myAvatar}
                                            className="w-full h-full object-cover"
                                            alt=""
                                          />
                                        );
                                      return (
                                        <IcDefaultUser
                                          size={20}
                                          color="#1d9bf0"
                                        />
                                      );
                                    })()}
                                  </div>
                                  <div className="flex-1 flex gap-2">
                                    <input
                                      value={tweetCommentInput}
                                      onChange={(e) =>
                                        setTweetCommentInput(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                          addComment(tw.id);
                                      }}
                                      placeholder="返信を入力..."
                                      className="flex-1 rounded-full px-3 py-1.5 text-xs font-medium outline-none"
                                      style={{
                                        background: isLight
                                          ? "rgba(0,0,0,0.05)"
                                          : "rgba(255,255,255,0.07)",
                                        border: `1px solid ${
                                          isLight
                                            ? "rgba(0,0,0,0.08)"
                                            : "rgba(255,255,255,0.1)"
                                        }`,
                                        color: theme.text,
                                      }}
                                    />
                                    <button
                                      onClick={() => addComment(tw.id)}
                                      disabled={!tweetCommentInput.trim()}
                                      className="px-3 py-1.5 rounded-full font-black text-xs active:opacity-70 disabled:opacity-40"
                                      style={{
                                        background:
                                          "linear-gradient(135deg,#1d9bf0,#60cdff)",
                                        color: "#fff",
                                      }}
                                    >
                                      返信
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

          {/* ===== AIペット対話画面 ===== */}
          {screen === "typingGame" &&
            (() => {
              // 単語プール（vocabList + customVocabList）
              const pool = [
                ...vocabList,
                ...customVocabList.filter((w) => {
                  const at = w.assignedTo;
                  const uid = user?.uid || "";
                  return (
                    at === "all" ||
                    at === undefined ||
                    (Array.isArray(at) && at.includes(uid))
                  );
                }),
              ].filter((w) => w.en);

              return (
                <TypingGameScreen
                  pool={pool}
                  isLight={isLight}
                  theme={theme}
                  onBack={() => setScreen("start")}
                />
              );
            })()}

          {/* ===== ペットショップ画面 ===== */}
          {/* ===== ペットショップ画面 ===== */}
          {screen === "petShop" && (
            <div
              className="animate-in fade-in"
              style={{ paddingBottom: "90px" }}
            >
              {/* ヘッダー */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setScreen(prevScreen || "start")}
                  className="p-2 rounded-xl active:opacity-70 transition-all"
                  style={{
                    background: isLight
                      ? "rgba(30,20,80,0.07)"
                      : "rgba(255,255,255,0.08)",
                    border: `1px solid ${
                      isLight ? "rgba(30,20,80,0.12)" : "rgba(255,255,255,0.1)"
                    }`,
                  }}
                >
                  <ChevronLeft size={20} style={{ color: theme.text }} />
                </button>
                <h2
                  className="text-2xl font-black flex-1"
                  style={{ color: isLight ? "#1a1040" : "#fff" }}
                >
                  ショップ
                </h2>
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl"
                  style={{
                    background: isLight
                      ? "rgba(180,130,0,0.1)"
                      : "rgba(250,204,21,0.15)",
                    border: `1px solid ${
                      isLight ? "rgba(180,130,0,0.25)" : "rgba(250,204,21,0.3)"
                    }`,
                  }}
                >
                  <IcCoin size={20} color={isLight ? "#b45309" : "#facc15"} />
                  <span
                    className="font-black text-lg"
                    style={{ color: isLight ? "#b45309" : "#facc15" }}
                  >
                    {(profile?.petPoints || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              {/* タブ */}
              <div
                className="flex gap-2 mb-4 p-1 rounded-2xl"
                style={{
                  background: isLight
                    ? "rgba(30,20,80,0.06)"
                    : "rgba(255,255,255,0.05)",
                }}
              >
                {["pets", "accessories", "bg"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setShopTab(tab)}
                    className="flex-1 py-2 rounded-xl font-black text-xs transition-all"
                    style={
                      shopTab === tab
                        ? {
                            background:
                              "linear-gradient(135deg,#b8860b,#e0c97f)",
                            color: "white",
                          }
                        : {
                            color: isLight
                              ? "rgba(30,20,80,0.45)"
                              : "rgba(255,255,255,0.4)",
                          }
                    }
                  >
                    {tab === "pets"
                      ? "ペット"
                      : tab === "accessories"
                      ? "アクセサリー"
                      : "背景"}
                  </button>
                ))}
              </div>
              {shopTab === "pets" && (
                <div className="grid grid-cols-2 gap-3">
                  {SHOP_PETS.map((pet) => {
                    const owned = (profile?.ownedPets || []).includes(pet.id);
                    const isActive =
                      (profile?.activePet || "bearcat") === pet.id;
                    const canAfford = (profile?.petPoints || 0) >= pet.price;
                    return (
                      <div
                        key={pet.id}
                        className="rounded-2xl p-4 text-center"
                        style={{
                          background: isLight
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.05)",
                          border: `1px solid ${
                            owned
                              ? "rgba(16,185,129,0.5)"
                              : isLight
                              ? "rgba(30,20,80,0.1)"
                              : "rgba(255,255,255,0.08)"
                          }`,
                          boxShadow: isLight
                            ? "0 2px 12px rgba(0,0,0,0.06)"
                            : "none",
                        }}
                      >
                        <div
                          className="flex justify-center mb-2"
                          style={{
                            filter: owned
                              ? "drop-shadow(0 0 12px rgba(16,185,129,0.6))"
                              : "none",
                          }}
                        >
                          {(() => {
                            const PIcon = PET_ICONS[pet.id] || IcPet;
                            return (
                              <PIcon
                                size={44}
                                color={
                                  owned
                                    ? "#059669"
                                    : isLight
                                    ? "rgba(30,20,80,0.65)"
                                    : "rgba(255,255,255,0.75)"
                                }
                              />
                            );
                          })()}
                        </div>
                        <p
                          className="font-black text-sm mb-1"
                          style={{ color: isLight ? "#1a1040" : "#fff" }}
                        >
                          {profile?.petNames?.[pet.id] || pet.name}
                        </p>
                        <p
                          className="text-[10px] mb-3"
                          style={{
                            color: isLight
                              ? "rgba(30,20,80,0.45)"
                              : "rgba(255,255,255,0.3)",
                          }}
                        >
                          {pet.desc}
                        </p>
                        {owned ? (
                          <span
                            className="text-[11px] font-black px-3 py-1 rounded-lg"
                            style={{
                              background: isLight
                                ? "rgba(16,185,129,0.15)"
                                : "rgba(16,185,129,0.25)",
                              color: isLight
                                ? "#047857"
                                : "rgba(110,231,183,1)",
                            }}
                          >
                            ✓ 所持済み
                          </span>
                        ) : (
                          <button
                            onClick={() => handleShopBuy(pet, "pet")}
                            disabled={!canAfford}
                            className="w-full py-2 rounded-xl font-black text-[11px] active:opacity-70 transition-all"
                            style={
                              canAfford
                                ? {
                                    background:
                                      "linear-gradient(135deg,#f59e0b,#fbbf24)",
                                    color: "#1a1040",
                                  }
                                : {
                                    background: isLight
                                      ? "rgba(30,20,80,0.08)"
                                      : "rgba(255,255,255,0.05)",
                                    color: isLight
                                      ? "rgba(30,20,80,0.3)"
                                      : "rgba(255,255,255,0.2)",
                                  }
                            }
                          >
                            <IcCoin size={14} color="currentColor" />{" "}
                            {pet.price}pt
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {shopTab === "accessories" && (
                <div className="grid grid-cols-2 gap-3">
                  {SHOP_ACCESSORIES.map((acc) => {
                    const owned = (profile?.ownedAccessories || []).includes(
                      acc.id
                    );
                    const isActive = (
                      profile?.activeAccessories || []
                    ).includes(acc.id);
                    const canAfford = (profile?.petPoints || 0) >= acc.price;
                    return (
                      <div
                        key={acc.id}
                        className="rounded-2xl p-4 text-center"
                        style={{
                          background: isLight
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.05)",
                          border: `1px solid ${
                            isActive
                              ? "rgba(250,204,21,0.4)"
                              : isLight
                              ? "rgba(30,20,80,0.1)"
                              : "rgba(255,255,255,0.08)"
                          }`,
                          boxShadow: isLight
                            ? "0 2px 12px rgba(0,0,0,0.06)"
                            : "none",
                        }}
                      >
                        <div className="flex justify-center mb-2">
                          {acc.id === "hat" && (
                            <IcHat
                              size={44}
                              color={
                                acc.color ||
                                (isLight
                                  ? "rgba(30,20,80,0.65)"
                                  : "rgba(255,255,255,0.7)")
                              }
                            />
                          )}
                          {acc.id === "crown" && (
                            <IcCrown2
                              size={44}
                              color={
                                acc.color ||
                                (isLight
                                  ? "rgba(30,20,80,0.65)"
                                  : "rgba(255,255,255,0.7)")
                              }
                            />
                          )}
                          {acc.id === "bow" && (
                            <IcBow
                              size={44}
                              color={
                                acc.color ||
                                (isLight
                                  ? "rgba(30,20,80,0.65)"
                                  : "rgba(255,255,255,0.7)")
                              }
                            />
                          )}
                          {acc.id === "glasses" && (
                            <IcGlasses
                              size={44}
                              color={
                                acc.color ||
                                (isLight
                                  ? "rgba(30,20,80,0.65)"
                                  : "rgba(255,255,255,0.7)")
                              }
                            />
                          )}
                          {acc.id === "star" && (
                            <IcStar2
                              size={44}
                              color={
                                acc.color ||
                                (isLight
                                  ? "rgba(30,20,80,0.65)"
                                  : "rgba(255,255,255,0.7)")
                              }
                            />
                          )}
                          {acc.id === "rainbow" && (
                            <IcRainbow
                              size={44}
                              color={
                                isLight
                                  ? "rgba(30,20,80,0.65)"
                                  : "rgba(255,255,255,0.7)"
                              }
                            />
                          )}
                        </div>
                        <p
                          className="font-black text-sm mb-1"
                          style={{ color: isLight ? "#1a1040" : "#fff" }}
                        >
                          {acc.name}
                        </p>
                        <p
                          className="text-[10px] mb-3"
                          style={{
                            color: isLight
                              ? "rgba(30,20,80,0.45)"
                              : "rgba(255,255,255,0.3)",
                          }}
                        >
                          {acc.slot === "head"
                            ? "頭"
                            : acc.slot === "face"
                            ? "顔"
                            : "背景"}
                        </p>
                        {owned ? (
                          <span
                            className="text-[11px] font-black px-3 py-1 rounded-lg"
                            style={{
                              background: isLight
                                ? "rgba(16,185,129,0.15)"
                                : "rgba(16,185,129,0.25)",
                              color: isLight
                                ? "#047857"
                                : "rgba(110,231,183,1)",
                            }}
                          >
                            ✓ 所持済み
                          </span>
                        ) : (
                          <button
                            onClick={() => handleShopBuy(acc, "acc")}
                            disabled={!canAfford}
                            className="w-full py-2 rounded-xl font-black text-[11px] active:opacity-70 transition-all"
                            style={
                              canAfford
                                ? {
                                    background:
                                      "linear-gradient(135deg,#f59e0b,#fbbf24)",
                                    color: "#1a1040",
                                  }
                                : {
                                    background: isLight
                                      ? "rgba(30,20,80,0.08)"
                                      : "rgba(255,255,255,0.05)",
                                    color: isLight
                                      ? "rgba(30,20,80,0.3)"
                                      : "rgba(255,255,255,0.2)",
                                  }
                            }
                          >
                            <IcCoin size={14} color="currentColor" />{" "}
                            {acc.price}pt
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {shopTab === "bg" && (
                <div className="grid grid-cols-2 gap-3">
                  {SHOP_BACKGROUNDS.map((bg) => {
                    const owned = (profile?.ownedRoomBgs || ["night"]).includes(
                      bg.id
                    );
                    const isActive =
                      (profile?.activeRoomBg || "night") === bg.id;
                    const canAfford = (profile?.petPoints || 0) >= bg.price;
                    return (
                      <div
                        key={bg.id}
                        className="rounded-2xl p-3 text-center"
                        style={{
                          background: isLight
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.05)",
                          border: `1px solid ${
                            isActive
                              ? "rgba(250,204,21,0.5)"
                              : isLight
                              ? "rgba(30,20,80,0.1)"
                              : "rgba(255,255,255,0.08)"
                          }`,
                          boxShadow: isLight
                            ? "0 2px 12px rgba(0,0,0,0.06)"
                            : "none",
                        }}
                      >
                        {/* 背景プレビュー */}
                        <div
                          className="w-full rounded-xl mb-2 flex items-end justify-center overflow-hidden"
                          style={{
                            height: 60,
                            background: bg.gradient,
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: 16,
                              background: bg.floor,
                              borderTop: `2px solid ${bg.floorBorder}`,
                            }}
                          />
                          <span
                            style={{
                              position: "relative",
                              zIndex: 1,
                              paddingBottom: 12,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {bg.SvgIcon ? (
                              <bg.SvgIcon
                                size={28}
                                color={bg.iconColor || "rgba(255,255,255,0.9)"}
                              />
                            ) : null}
                          </span>
                        </div>
                        <p
                          className="font-black text-xs mb-0.5"
                          style={{ color: isLight ? "#1a1040" : "#fff" }}
                        >
                          {bg.name}
                        </p>
                        {owned ? (
                          isActive ? (
                            <span
                              className="text-[10px] font-black px-2 py-1 rounded-lg block"
                              style={{
                                background: "rgba(250,204,21,0.2)",
                                color: "#d97706",
                              }}
                            >
                              ✓ 使用中
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                const np = { ...profile, activeRoomBg: bg.id };
                                setProfile(np);
                                saveLocal("profile", np);
                                if (fb.db && user)
                                  updateDoc(
                                    doc(
                                      fb.db,
                                      "artifacts",
                                      fb.appId,
                                      "users",
                                      user.uid,
                                      "profile",
                                      "main"
                                    ),
                                    { activeRoomBg: bg.id }
                                  ).catch(() => {});
                              }}
                              className="w-full py-1.5 rounded-xl font-black text-[10px] active:opacity-70"
                              style={{
                                background: isLight
                                  ? "rgba(30,20,80,0.08)"
                                  : "rgba(255,255,255,0.1)",
                                color: isLight ? "#1a1040" : "#fff",
                              }}
                            >
                              セット
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => {
                              if ((profile?.petPoints || 0) < bg.price) {
                                showToast("ポイントが足りません", "error");
                                return;
                              }
                              const np = {
                                ...profile,
                                petPoints: (profile?.petPoints || 0) - bg.price,
                                ownedRoomBgs: [
                                  ...(profile?.ownedRoomBgs || ["night"]),
                                  bg.id,
                                ],
                                activeRoomBg: bg.id,
                              };
                              setProfile(np);
                              saveLocal("profile", np);
                              if (fb.db && user)
                                updateDoc(
                                  doc(
                                    fb.db,
                                    "artifacts",
                                    fb.appId,
                                    "users",
                                    user.uid,
                                    "profile",
                                    "main"
                                  ),
                                  {
                                    petPoints: np.petPoints,
                                    ownedRoomBgs: np.ownedRoomBgs,
                                    activeRoomBg: np.activeRoomBg,
                                  }
                                ).catch(() => {});
                              showToast(`${bg.name}を購入しました！`);
                            }}
                            disabled={!canAfford}
                            className="w-full py-1.5 rounded-xl font-black text-[10px] active:opacity-70 disabled:opacity-40"
                            style={{
                              background: canAfford
                                ? "linear-gradient(135deg,#f59e0b,#fbbf24)"
                                : isLight
                                ? "rgba(30,20,80,0.08)"
                                : "rgba(255,255,255,0.05)",
                              color: canAfford
                                ? "#1a1040"
                                : isLight
                                ? "rgba(30,20,80,0.3)"
                                : "rgba(255,255,255,0.2)",
                            }}
                          >
                            {bg.price === 0 ? (
                              "無料"
                            ) : (
                              <>
                                <IcCoin size={12} color="currentColor" />{" "}
                                {bg.price}pt
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== ペット育成（部屋）画面 ===== */}
          {screen === "petRoom" &&
            (() => {
              const ownedPetIds = profile?.ownedPets || [];
              const ownedPets = SHOP_PETS.filter((p) =>
                ownedPetIds.includes(p.id)
              );
              return (
                <div
                  className="animate-in fade-in text-left"
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    height: "calc(100vh - 0px)",
                    overflow: "hidden",
                  }}
                >
                  {/* たまごっち風部屋背景 */}
                  <style>{`
                @keyframes petBob    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(2deg)} }
                @keyframes petHop    { 0%,100%{transform:translateY(0) scaleX(1)} 30%{transform:translateY(-18px) scaleX(0.9)} 60%{transform:translateY(-8px) scaleX(1.05)} }
                @keyframes petSpin   { 0%{transform:rotate(0deg) scale(1)} 25%{transform:rotate(-15deg) scale(1.1)} 75%{transform:rotate(15deg) scale(1.1)} 100%{transform:rotate(0deg) scale(1)} }
                @keyframes petWiggle { 0%,100%{transform:translateX(0) rotate(0deg)} 20%{transform:translateX(-5px) rotate(-8deg)} 40%{transform:translateX(5px) rotate(8deg)} 60%{transform:translateX(-3px) rotate(-5deg)} 80%{transform:translateX(3px) rotate(5deg)} }
                @keyframes petFloat  { 0%,100%{transform:translateY(0) scale(1)} 25%{transform:translateY(-6px) scale(1.03)} 75%{transform:translateY(-14px) scale(0.97)} }
                @keyframes petWag    { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
                @keyframes petDance  { 0%,100%{transform:translateY(0) scaleY(1)} 25%{transform:translateY(-8px) scaleY(0.92)} 50%{transform:translateY(0) scaleY(1.05)} 75%{transform:translateY(-4px) scaleY(0.96)} }
                @keyframes floatHeart { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-60px) scale(1.6)} }
                @keyframes floorShine { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
                @keyframes twinkle   { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.4)} }
                @keyframes snowfall  { 0%{transform:translateY(-10px) rotate(0deg);opacity:0.8} 100%{transform:translateY(220px) rotate(360deg);opacity:0} }
                @keyframes petWalkBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
                @keyframes feedParticle { 0%{opacity:1;transform:translate(-50%,-50%) translate(0,0) scale(1.2)} 100%{opacity:0;transform:translate(-50%,-50%) translate(var(--fdx),var(--fdy)) scale(0.5)} }
                @keyframes feedBounce { 0%{transform:scale(1)} 18%{transform:scale(1.45) rotate(-10deg)} 38%{transform:scale(0.88) rotate(6deg)} 58%{transform:scale(1.22) rotate(-5deg)} 80%{transform:scale(0.96)} 100%{transform:scale(1)} }
                @keyframes feedHeart { 0%{opacity:1;transform:translate(-50%,-50%) translateY(0) scale(0.7)} 100%{opacity:0;transform:translate(-50%,-50%) translateY(-80px) scale(1.5)} }
                .pet-bob    { animation: petBob 2.4s ease-in-out infinite; }
                .pet-hop    { animation: petHop 1.8s ease-in-out infinite; }
                .pet-spin   { animation: petSpin 3s ease-in-out infinite; }
                .pet-wiggle { animation: petWiggle 2s ease-in-out infinite; }
                .pet-float  { animation: petFloat 3.5s ease-in-out infinite; }
                .pet-dance  { animation: petDance 1.2s ease-in-out infinite; }
                .pet-anim-0 { animation: petBob 2.4s ease-in-out infinite; }
                .pet-anim-1 { animation: petHop 2s ease-in-out infinite 0.3s; }
                .pet-anim-2 { animation: petWiggle 2.2s ease-in-out infinite 0.6s; }
                .pet-anim-3 { animation: petFloat 3s ease-in-out infinite 0.9s; }
                .pet-anim-4 { animation: petDance 1.5s ease-in-out infinite 0.2s; }
                .pet-anim-5 { animation: petSpin 3.5s ease-in-out infinite 0.5s; }
                .pet-anim-6 { animation: petBob 2s ease-in-out infinite 1s; }
                .pet-wag { animation: petWag 1.5s ease-in-out infinite; transform-origin: bottom center; }
                .pet-walk-bob { animation: petWalkBob 0.4s ease-in-out infinite; }
              `}</style>

                  {/* ヘッダー */}
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setScreen(prevScreen || "start")}
                      className="p-2 rounded-xl active:opacity-70 transition-all"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <ChevronLeft />
                    </button>
                    <h2 className="text-2xl font-black text-white flex-1">
                      ペットの部屋
                    </h2>
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-2xl"
                      style={{
                        background: "rgba(250,204,21,0.15)",
                        border: "1px solid rgba(250,204,21,0.3)",
                      }}
                    >
                      <IcCoin size={18} color="#facc15" />
                      <span className="font-black text-yellow-400">
                        {(profile?.petPoints || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {ownedPets.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-white/40 font-bold text-lg mb-4">
                        まだペットがいません
                      </p>
                      <button
                        onClick={() => setScreen("petShop")}
                        className="px-6 py-3 rounded-2xl font-black text-white"
                        style={{
                          background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                        }}
                      >
                        ショップへ
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* ─── 固定エリア：部屋＋背景選択 ─── */}
                      <div style={{ flexShrink: 0 }}>
                        {/* お部屋エリア */}
                        {(() => {
                          const activeBgId = profile?.activeRoomBg || "night";
                          const roomBg =
                            SHOP_BACKGROUNDS.find((b) => b.id === activeBgId) ||
                            SHOP_BACKGROUNDS[0];
                          // 3D遠近感レーン設定 [奥→手前の順]
                          const depthLanes = [
                            {
                              id: "far",
                              bottom: "54%",
                              scale: 0.42,
                              opacity: 0.55,
                              zIndex: 1,
                              shadow: "none",
                            },
                            {
                              id: "mid",
                              bottom: "32%",
                              scale: 0.65,
                              opacity: 0.75,
                              zIndex: 2,
                              shadow: "0 4px 12px rgba(0,0,0,0.25)",
                            },
                            {
                              id: "close",
                              bottom: "12%",
                              scale: 1.0,
                              opacity: 1.0,
                              zIndex: 3,
                              shadow: "0 8px 24px rgba(0,0,0,0.4)",
                            },
                          ];
                          // ペットをレーンに割り振り
                          const petsByLane = depthLanes.map((lane, li) =>
                            ownedPets.filter((_, pi) => pi % 3 === li)
                          );

                          return (
                            <div
                              className="rounded-3xl overflow-hidden mb-4"
                              style={{
                                background: roomBg.gradient,
                                border: "2px solid rgba(255,255,255,0.12)",
                                position: "relative",
                                minHeight: 280,
                                boxShadow:
                                  "0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                              }}
                            >
                              {/* ─── 豊かな3Dルームシーン（SVGベース） ─── */}
                              <svg
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  width: "100%",
                                  height: "100%",
                                  pointerEvents: "none",
                                  overflow: "visible",
                                }}
                                viewBox="0 0 400 280"
                                preserveAspectRatio="none"
                              >
                                <defs>
                                  {/* 床グラデーション（遠近） */}
                                  <linearGradient
                                    id="floorGrad"
                                    x1="0%"
                                    y1="0%"
                                    x2="0%"
                                    y2="100%"
                                  >
                                    <stop
                                      offset="0%"
                                      stopColor="rgba(0,0,0,0.35)"
                                    />
                                    <stop
                                      offset="100%"
                                      stopColor="rgba(0,0,0,0)"
                                    />
                                  </linearGradient>
                                  <linearGradient
                                    id="wallLeft"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="0%"
                                  >
                                    <stop
                                      offset="0%"
                                      stopColor="rgba(0,0,0,0.22)"
                                    />
                                    <stop
                                      offset="100%"
                                      stopColor="rgba(0,0,0,0)"
                                    />
                                  </linearGradient>
                                  <linearGradient
                                    id="wallRight"
                                    x1="100%"
                                    y1="0%"
                                    x2="0%"
                                    y2="0%"
                                  >
                                    <stop
                                      offset="0%"
                                      stopColor="rgba(0,0,0,0.22)"
                                    />
                                    <stop
                                      offset="100%"
                                      stopColor="rgba(0,0,0,0)"
                                    />
                                  </linearGradient>
                                  <linearGradient
                                    id="ceilGrad"
                                    x1="0%"
                                    y1="0%"
                                    x2="0%"
                                    y2="100%"
                                  >
                                    <stop
                                      offset="0%"
                                      stopColor="rgba(0,0,0,0.3)"
                                    />
                                    <stop
                                      offset="100%"
                                      stopColor="rgba(0,0,0,0.05)"
                                    />
                                  </linearGradient>
                                  <radialGradient
                                    id="floorSpot"
                                    cx="50%"
                                    cy="0%"
                                    r="80%"
                                  >
                                    <stop
                                      offset="0%"
                                      stopColor="rgba(255,255,255,0.07)"
                                    />
                                    <stop
                                      offset="100%"
                                      stopColor="rgba(0,0,0,0)"
                                    />
                                  </radialGradient>
                                  {/* テーマ別 */}
                                  {activeBgId === "night" && (
                                    <>
                                      <radialGradient
                                        id="moonGlow"
                                        cx="50%"
                                        cy="50%"
                                        r="60%"
                                      >
                                        <stop
                                          offset="0%"
                                          stopColor="#fffde7"
                                          stopOpacity="0.9"
                                        />
                                        <stop
                                          offset="100%"
                                          stopColor="#fdd835"
                                          stopOpacity="0"
                                        />
                                      </radialGradient>
                                      <radialGradient
                                        id="lampGlow"
                                        cx="50%"
                                        cy="50%"
                                        r="60%"
                                      >
                                        <stop
                                          offset="0%"
                                          stopColor="#ffd070"
                                          stopOpacity="0.6"
                                        />
                                        <stop
                                          offset="100%"
                                          stopColor="#ff8800"
                                          stopOpacity="0"
                                        />
                                      </radialGradient>
                                    </>
                                  )}
                                  {activeBgId === "forest" && (
                                    <>
                                      <radialGradient
                                        id="sunRays"
                                        cx="80%"
                                        cy="5%"
                                        r="80%"
                                      >
                                        <stop
                                          offset="0%"
                                          stopColor="#ffe070"
                                          stopOpacity="0.35"
                                        />
                                        <stop
                                          offset="100%"
                                          stopColor="#80c020"
                                          stopOpacity="0"
                                        />
                                      </radialGradient>
                                      <linearGradient
                                        id="grassGrad"
                                        x1="0%"
                                        y1="0%"
                                        x2="0%"
                                        y2="100%"
                                      >
                                        <stop offset="0%" stopColor="#4a9a30" />
                                        <stop
                                          offset="100%"
                                          stopColor="#2a6018"
                                        />
                                      </linearGradient>
                                    </>
                                  )}
                                  {activeBgId === "ocean" && (
                                    <>
                                      <radialGradient
                                        id="waterGlow"
                                        cx="50%"
                                        cy="40%"
                                        r="70%"
                                      >
                                        <stop
                                          offset="0%"
                                          stopColor="#40c0ff"
                                          stopOpacity="0.2"
                                        />
                                        <stop
                                          offset="100%"
                                          stopColor="#0040a0"
                                          stopOpacity="0"
                                        />
                                      </radialGradient>
                                      <linearGradient
                                        id="waveGrad"
                                        x1="0%"
                                        y1="0%"
                                        x2="0%"
                                        y2="100%"
                                      >
                                        <stop offset="0%" stopColor="#40b0e0" />
                                        <stop
                                          offset="100%"
                                          stopColor="#0060a0"
                                        />
                                      </linearGradient>
                                    </>
                                  )}
                                  {activeBgId === "sunset" && (
                                    <>
                                      <radialGradient
                                        id="sunGlow"
                                        cx="70%"
                                        cy="35%"
                                        r="60%"
                                      >
                                        <stop
                                          offset="0%"
                                          stopColor="#ffb040"
                                          stopOpacity="0.7"
                                        />
                                        <stop
                                          offset="100%"
                                          stopColor="#ff4000"
                                          stopOpacity="0"
                                        />
                                      </radialGradient>
                                    </>
                                  )}
                                  {activeBgId === "candy" && (
                                    <>
                                      <radialGradient
                                        id="candyGlow"
                                        cx="50%"
                                        cy="30%"
                                        r="70%"
                                      >
                                        <stop
                                          offset="0%"
                                          stopColor="#ff80ff"
                                          stopOpacity="0.3"
                                        />
                                        <stop
                                          offset="100%"
                                          stopColor="#8020c0"
                                          stopOpacity="0"
                                        />
                                      </radialGradient>
                                    </>
                                  )}
                                  {activeBgId === "snow" && (
                                    <>
                                      <radialGradient
                                        id="snowGlow"
                                        cx="50%"
                                        cy="40%"
                                        r="70%"
                                      >
                                        <stop
                                          offset="0%"
                                          stopColor="#d0e8ff"
                                          stopOpacity="0.25"
                                        />
                                        <stop
                                          offset="100%"
                                          stopColor="#1a2a4e"
                                          stopOpacity="0"
                                        />
                                      </radialGradient>
                                    </>
                                  )}
                                </defs>

                                {/* ─── 消失点3D構造 ─── */}
                                {/* 消失点: (200, 108) */}
                                {/* 床面（消失点から扇形に広がる） */}
                                {/* 左壁 */}
                                <polygon
                                  points="0,0 200,108 0,280"
                                  fill="url(#wallLeft)"
                                />
                                {/* 右壁 */}
                                <polygon
                                  points="400,0 200,108 400,280"
                                  fill="url(#wallRight)"
                                />
                                {/* 天井 */}
                                <polygon
                                  points="0,0 400,0 200,108"
                                  fill="url(#ceilGrad)"
                                />
                                {/* 床シャドウ */}
                                <polygon
                                  points="0,280 400,280 200,108"
                                  fill="url(#floorGrad)"
                                  opacity="0.7"
                                />
                                {/* 床スポットライト */}
                                <ellipse
                                  cx="200"
                                  cy="210"
                                  rx="180"
                                  ry="70"
                                  fill="url(#floorSpot)"
                                />

                                {/* 壁コーナーライン */}
                                <line
                                  x1="0"
                                  y1="0"
                                  x2="200"
                                  y2="108"
                                  stroke="rgba(255,255,255,0.06)"
                                  strokeWidth="1"
                                />
                                <line
                                  x1="400"
                                  y1="0"
                                  x2="200"
                                  y2="108"
                                  stroke="rgba(255,255,255,0.06)"
                                  strokeWidth="1"
                                />
                                <line
                                  x1="0"
                                  y1="280"
                                  x2="200"
                                  y2="108"
                                  stroke="rgba(255,255,255,0.04)"
                                  strokeWidth="0.8"
                                />
                                <line
                                  x1="400"
                                  y1="280"
                                  x2="200"
                                  y2="108"
                                  stroke="rgba(255,255,255,0.04)"
                                  strokeWidth="0.8"
                                />
                                {/* 壁境界（水平）：極めて薄く */}
                                <line
                                  x1="0"
                                  y1="140"
                                  x2="400"
                                  y2="140"
                                  stroke="rgba(255,255,255,0.06)"
                                  strokeWidth="0.8"
                                />

                                {/* ─── テーマ別リッチ装飾 ─── */}

                                {activeBgId === "night" && (
                                  <>
                                    {/* グロー背景 */}
                                    <circle
                                      cx="200"
                                      cy="50"
                                      r="120"
                                      fill="url(#moonGlow)"
                                      opacity="0.6"
                                    />
                                    {/* 星 */}
                                    {[
                                      [30, 18],
                                      [80, 12],
                                      [140, 25],
                                      [220, 8],
                                      [290, 18],
                                      [350, 10],
                                      [380, 30],
                                      [60, 40],
                                      [170, 38],
                                      [310, 35],
                                      [400, 50],
                                      [10, 55],
                                    ].map(([x, y], i) => (
                                      <circle
                                        key={i}
                                        cx={x}
                                        cy={y}
                                        r={1 + (i % 2) * 0.8}
                                        fill="white"
                                        opacity={0.5 + (i % 3) * 0.2}
                                      >
                                        <animate
                                          attributeName="opacity"
                                          values={`${0.3 + (i % 3) * 0.2};${
                                            0.8 + (i % 2) * 0.2
                                          };${0.3 + (i % 3) * 0.2}`}
                                          dur={`${1.5 + i * 0.3}s`}
                                          repeatCount="indefinite"
                                        />
                                      </circle>
                                    ))}
                                    {/* 月 */}
                                    <circle
                                      cx="338"
                                      cy="30"
                                      r="22"
                                      fill="#fffde0"
                                      opacity="0.95"
                                    />
                                    <circle
                                      cx="338"
                                      cy="30"
                                      r="22"
                                      fill="url(#moonGlow)"
                                    />
                                    <circle
                                      cx="330"
                                      cy="24"
                                      r="14"
                                      fill={
                                        SHOP_BACKGROUNDS.find(
                                          (b) => b.id === "night"
                                        )?.gradient?.includes("1a0a3e")
                                          ? "#1a1a40"
                                          : "#1a1a40"
                                      }
                                      opacity="0.25"
                                    />
                                    {/* 月の光の筋 */}
                                    <line
                                      x1="338"
                                      y1="52"
                                      x2="200"
                                      y2="108"
                                      stroke="rgba(255,250,200,0.04)"
                                      strokeWidth="40"
                                    />
                                    {/* 窓 */}
                                    <rect
                                      x="16"
                                      y="14"
                                      width="58"
                                      height="48"
                                      rx="5"
                                      fill="rgba(100,150,255,0.1)"
                                      stroke="rgba(255,255,255,0.2)"
                                      strokeWidth="1.5"
                                    />
                                    <line
                                      x1="16"
                                      y1="38"
                                      x2="74"
                                      y2="38"
                                      stroke="rgba(255,255,255,0.15)"
                                      strokeWidth="1"
                                    />
                                    <line
                                      x1="45"
                                      y1="14"
                                      x2="45"
                                      y2="62"
                                      stroke="rgba(255,255,255,0.15)"
                                      strokeWidth="1"
                                    />
                                    {/* 窓の外の月明かり */}
                                    <rect
                                      x="16"
                                      y="14"
                                      width="58"
                                      height="48"
                                      rx="5"
                                      fill="rgba(200,220,255,0.06)"
                                    />
                                    {/* ランプ */}
                                    <ellipse
                                      cx="200"
                                      cy="4"
                                      rx="8"
                                      ry="3"
                                      fill="rgba(255,210,100,0.4)"
                                    />
                                    <path
                                      d="M194 4 L192 22 L208 22 L206 4 Z"
                                      fill="rgba(255,220,130,0.5)"
                                    />
                                    <ellipse
                                      cx="200"
                                      cy="22"
                                      rx="16"
                                      ry="5"
                                      fill="rgba(255,200,80,0.3)"
                                    />
                                    <circle
                                      cx="200"
                                      cy="200"
                                      r="100"
                                      fill="url(#lampGlow)"
                                      opacity="0.5"
                                    />
                                    {/* 本棚（左壁） */}
                                    <rect
                                      x="0"
                                      y="80"
                                      width="18"
                                      height="60"
                                      fill="rgba(80,50,20,0.4)"
                                      stroke="rgba(255,255,255,0.08)"
                                      strokeWidth="0.8"
                                    />
                                    {[
                                      [0, "#e84"],
                                      [10, "#4ae"],
                                      [20, "#a4e"],
                                      [30, "#e4a"],
                                      [40, "#4ea"],
                                      [50, "#ea4"],
                                    ].map(([y, c], i) => (
                                      <rect
                                        key={i}
                                        x="2"
                                        y={82 + y}
                                        width="14"
                                        height="8"
                                        rx="1"
                                        fill={c}
                                        opacity="0.6"
                                      />
                                    ))}
                                  </>
                                )}

                                {activeBgId === "forest" && (
                                  <>
                                    {/* 太陽グロー */}
                                    <circle
                                      cx="340"
                                      cy="25"
                                      r="80"
                                      fill="url(#sunRays)"
                                    />
                                    <circle
                                      cx="340"
                                      cy="25"
                                      r="18"
                                      fill="#ffe060"
                                      opacity="0.9"
                                    />
                                    <circle
                                      cx="340"
                                      cy="25"
                                      r="12"
                                      fill="#fff8a0"
                                    />
                                    {/* 光の柱 */}
                                    <polygon
                                      points="310,0 370,0 280,140 250,140"
                                      fill="rgba(255,240,100,0.06)"
                                    />
                                    <polygon
                                      points="330,0 360,0 240,140 220,140"
                                      fill="rgba(255,240,100,0.04)"
                                    />
                                    {/* 遠景の山・丘 */}
                                    <path
                                      d="M0 140 Q50 90 100 120 Q160 80 220 110 Q280 70 340 100 Q380 80 400 110 L400 140 Z"
                                      fill="rgba(30,70,20,0.5)"
                                    />
                                    {/* 遠景の木（シルエット・奥） */}
                                    {[20, 60, 110, 170, 240, 300, 360].map(
                                      (x, i) => (
                                        <g
                                          key={i}
                                          transform={`translate(${x},${
                                            70 + (i % 3) * 10
                                          })`}
                                          opacity={0.3 + (i % 3) * 0.1}
                                        >
                                          <rect
                                            x="-2"
                                            y="20"
                                            width="4"
                                            height="25"
                                            fill="#3a6020"
                                          />
                                          <polygon
                                            points="0,0 -12,25 12,25"
                                            fill="#2a7030"
                                          />
                                          <polygon
                                            points="0,8 -10,28 10,28"
                                            fill="#349035"
                                          />
                                        </g>
                                      )
                                    )}
                                    {/* 中景の茂み */}
                                    {[0, 60, 130, 200, 280, 340, 390].map(
                                      (x, i) => (
                                        <ellipse
                                          key={i}
                                          cx={x}
                                          cy={155 + (i % 2) * 8}
                                          rx={28 + (i % 3) * 10}
                                          ry={20 + (i % 2) * 8}
                                          fill={`rgba(${40 + i * 8},${
                                            120 + (i % 3) * 20
                                          },${30 + i * 5},0.5)`}
                                        />
                                      )
                                    )}
                                    {/* 花 */}
                                    {[
                                      [50, 148],
                                      [130, 145],
                                      [220, 150],
                                      [300, 148],
                                      [370, 145],
                                    ].map(([x, y], i) => (
                                      <g
                                        key={i}
                                        transform={`translate(${x},${y})`}
                                      >
                                        <circle
                                          cx="0"
                                          cy="0"
                                          r="4"
                                          fill={
                                            [
                                              "#ff6090",
                                              "#ff90a0",
                                              "#ffb0c0",
                                              "#ffaabb",
                                              "#ff70a0",
                                            ][i]
                                          }
                                          opacity="0.85"
                                        />
                                        <circle
                                          cx="0"
                                          cy="0"
                                          r="2"
                                          fill="#ffe060"
                                        />
                                      </g>
                                    ))}
                                    {/* 手前草 */}
                                    <path
                                      d="M0 260 Q20 220 0 280"
                                      stroke="#3a8020"
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                      fill="none"
                                      opacity="0.7"
                                    />
                                    <path
                                      d="M15 265 Q25 230 20 280"
                                      stroke="#50a030"
                                      strokeWidth="3.5"
                                      strokeLinecap="round"
                                      fill="none"
                                      opacity="0.6"
                                    />
                                    <path
                                      d="M370 255 Q385 220 400 280"
                                      stroke="#3a8020"
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                      fill="none"
                                      opacity="0.7"
                                    />
                                    <path
                                      d="M385 260 Q395 228 390 280"
                                      stroke="#50a030"
                                      strokeWidth="3.5"
                                      strokeLinecap="round"
                                      fill="none"
                                      opacity="0.6"
                                    />
                                    {/* 蝶 */}
                                    <g
                                      transform="translate(250,130)"
                                      opacity="0.7"
                                    >
                                      <path
                                        d="M0 0 Q-10,-12 -8,0"
                                        fill="#ff9090"
                                        stroke="#ff6060"
                                        strokeWidth="0.8"
                                      />
                                      <path
                                        d="M0 0 Q10,-12 8,0"
                                        fill="#ffb080"
                                        stroke="#ff8040"
                                        strokeWidth="0.8"
                                      />
                                      <line
                                        x1="-2"
                                        y1="-6"
                                        x2="2"
                                        y2="-6"
                                        stroke="#604020"
                                        strokeWidth="1"
                                      />
                                    </g>
                                  </>
                                )}

                                {activeBgId === "ocean" && (
                                  <>
                                    {/* 深海グロー */}
                                    <rect
                                      x="0"
                                      y="0"
                                      width="400"
                                      height="140"
                                      fill="url(#waterGlow)"
                                    />
                                    {/* 月 */}
                                    <circle
                                      cx="50"
                                      cy="20"
                                      r="14"
                                      fill="#f0f4ff"
                                      opacity="0.9"
                                    />
                                    {/* 星 */}
                                    {[
                                      [100, 15],
                                      [180, 8],
                                      [260, 20],
                                      [320, 10],
                                      [370, 18],
                                      [200, 5],
                                      [80, 35],
                                    ].map(([x, y], i) => (
                                      <circle
                                        key={i}
                                        cx={x}
                                        cy={y}
                                        r={1.2 + (i % 2) * 0.6}
                                        fill="white"
                                        opacity={0.5 + (i % 3) * 0.15}
                                      >
                                        <animate
                                          attributeName="opacity"
                                          values="0.3;0.9;0.3"
                                          dur={`${1.8 + i * 0.4}s`}
                                          repeatCount="indefinite"
                                        />
                                      </circle>
                                    ))}
                                    {/* 水面の波紋 */}
                                    {[0, 1, 2, 3].map((i) => (
                                      <ellipse
                                        key={i}
                                        cx={80 + i * 80}
                                        cy={138}
                                        rx={30 + i * 10}
                                        ry={4}
                                        fill="none"
                                        stroke="rgba(100,200,255,0.3)"
                                        strokeWidth="1.5"
                                        opacity={0.6 - i * 0.1}
                                      >
                                        <animate
                                          attributeName="rx"
                                          values={`${25 + i * 10};${
                                            35 + i * 10
                                          };${25 + i * 10}`}
                                          dur={`${2 + i * 0.6}s`}
                                          repeatCount="indefinite"
                                        />
                                      </ellipse>
                                    ))}
                                    {/* 深海の魚群 */}
                                    {[
                                      [60, 60],
                                      [120, 45],
                                      [200, 70],
                                      [280, 55],
                                      [340, 65],
                                    ].map(([x, y], i) => (
                                      <g key={i} opacity={0.3 + (i % 3) * 0.1}>
                                        <ellipse
                                          cx={x}
                                          cy={y}
                                          rx="8"
                                          ry="5"
                                          fill={
                                            [
                                              "#60c0ff",
                                              "#40a0e0",
                                              "#80d0ff",
                                              "#50b0f0",
                                              "#70c8ff",
                                            ][i]
                                          }
                                        />
                                        <path
                                          d={`M${x + 8} ${y} L${x + 14} ${
                                            y - 4
                                          } L${x + 14} ${y + 4} Z`}
                                          fill={
                                            [
                                              "#40a0e0",
                                              "#2080c0",
                                              "#60b0f0",
                                              "#30a0e0",
                                              "#50b0e0",
                                            ][i]
                                          }
                                        />
                                      </g>
                                    ))}
                                    {/* 水草・サンゴ（手前） */}
                                    {[20, 70, 150, 230, 310, 370].map(
                                      (x, i) => (
                                        <g key={i}>
                                          <path
                                            d={`M${x} 280 Q${x - 5} ${
                                              250 - (i % 3) * 15
                                            } ${x} ${230 - (i % 2) * 20}`}
                                            stroke={
                                              [
                                                "#20c080",
                                                "#00e090",
                                                "#40d8a0",
                                                "#20b870",
                                                "#10d090",
                                                "#30c888",
                                              ][i]
                                            }
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            fill="none"
                                            opacity="0.5"
                                          />
                                        </g>
                                      )
                                    )}
                                    {/* 泡 */}
                                    {[
                                      [40, 200],
                                      [90, 180],
                                      [180, 220],
                                      [270, 190],
                                      [350, 210],
                                    ].map(([x, y], i) => (
                                      <circle
                                        key={i}
                                        cx={x}
                                        cy={y}
                                        r={2 + (i % 3)}
                                        fill="none"
                                        stroke="rgba(150,220,255,0.4)"
                                        strokeWidth="1"
                                        opacity="0.6"
                                      >
                                        <animate
                                          attributeName="cy"
                                          values={`${y};${y - 40};${y}`}
                                          dur={`${2 + i * 0.5}s`}
                                          repeatCount="indefinite"
                                        />
                                        <animate
                                          attributeName="opacity"
                                          values="0.6;0;0.6"
                                          dur={`${2 + i * 0.5}s`}
                                          repeatCount="indefinite"
                                        />
                                      </circle>
                                    ))}
                                  </>
                                )}

                                {activeBgId === "sunset" && (
                                  <>
                                    {/* 太陽グロー */}
                                    <circle
                                      cx="290"
                                      cy="30"
                                      r="100"
                                      fill="url(#sunGlow)"
                                    />
                                    <circle
                                      cx="290"
                                      cy="35"
                                      r="22"
                                      fill="#ffcf40"
                                      opacity="0.95"
                                    />
                                    <circle
                                      cx="290"
                                      cy="35"
                                      r="15"
                                      fill="#fff0a0"
                                    />
                                    {/* 光の放射 */}
                                    {[
                                      0, 30, 60, 90, 120, 150, 180, 210, 240,
                                      270, 300, 330,
                                    ].map((angle, i) => {
                                      const rad = (angle * Math.PI) / 180;
                                      return (
                                        <line
                                          key={i}
                                          x1={290}
                                          y1={35}
                                          x2={290 + Math.cos(rad) * 50}
                                          y2={35 + Math.sin(rad) * 50}
                                          stroke="rgba(255,200,50,0.15)"
                                          strokeWidth="1.5"
                                        />
                                      );
                                    })}
                                    {/* 雲（複数・立体的） */}
                                    {[
                                      [60, 35, 1.2],
                                      [140, 22, 1.0],
                                      [230, 40, 0.9],
                                      [320, 18, 1.1],
                                    ].map(([x, y, s], i) => (
                                      <g
                                        key={i}
                                        transform={`translate(${x},${y}) scale(${s})`}
                                        opacity={0.7 - i * 0.05}
                                      >
                                        <ellipse
                                          cx="0"
                                          cy="0"
                                          rx="30"
                                          ry="12"
                                          fill="rgba(255,220,180,0.6)"
                                        />
                                        <ellipse
                                          cx="-14"
                                          cy="-4"
                                          rx="16"
                                          ry="12"
                                          fill="rgba(255,230,200,0.7)"
                                        />
                                        <ellipse
                                          cx="14"
                                          cy="-4"
                                          rx="18"
                                          ry="13"
                                          fill="rgba(255,225,195,0.65)"
                                        />
                                        <ellipse
                                          cx="0"
                                          cy="-8"
                                          rx="14"
                                          ry="10"
                                          fill="rgba(255,240,220,0.75)"
                                        />
                                      </g>
                                    ))}
                                    {/* 山のシルエット */}
                                    <path
                                      d="M0 140 L50 80 L100 115 L160 60 L230 100 L280 55 L340 90 L400 70 L400 140 Z"
                                      fill="rgba(60,20,10,0.45)"
                                    />
                                    <path
                                      d="M0 140 Q80 120 160 130 Q240 118 320 128 Q360 122 400 125 L400 140 Z"
                                      fill="rgba(40,10,5,0.35)"
                                    />
                                    {/* 夕焼けの反射（床に） */}
                                    <polygon
                                      points="0,140 400,140 300,280 100,280"
                                      fill="rgba(255,100,20,0.06)"
                                    />
                                  </>
                                )}

                                {activeBgId === "candy" && (
                                  <>
                                    {/* キャンディカラーグロー */}
                                    <rect
                                      x="0"
                                      y="0"
                                      width="400"
                                      height="140"
                                      fill="url(#candyGlow)"
                                    />
                                    {/* 虹 */}
                                    <path
                                      d="M-20 160 Q200 10 420 160"
                                      fill="none"
                                      stroke="rgba(255,100,100,0.3)"
                                      strokeWidth="8"
                                    />
                                    <path
                                      d="M-20 160 Q200 25 420 160"
                                      fill="none"
                                      stroke="rgba(255,160,60,0.3)"
                                      strokeWidth="7"
                                    />
                                    <path
                                      d="M-20 160 Q200 40 420 160"
                                      fill="none"
                                      stroke="rgba(255,230,60,0.25)"
                                      strokeWidth="6"
                                    />
                                    <path
                                      d="M-20 160 Q200 55 420 160"
                                      fill="none"
                                      stroke="rgba(100,220,80,0.25)"
                                      strokeWidth="5"
                                    />
                                    <path
                                      d="M-20 160 Q200 68 420 160"
                                      fill="none"
                                      stroke="rgba(60,160,255,0.25)"
                                      strokeWidth="5"
                                    />
                                    <path
                                      d="M-20 160 Q200 80 420 160"
                                      fill="none"
                                      stroke="rgba(180,80,255,0.25)"
                                      strokeWidth="4"
                                    />
                                    {/* 浮かぶキャンディ・星 */}
                                    {[
                                      [40, 20, "#ff6090"],
                                      [100, 35, "#ffa040"],
                                      [180, 15, "#60d060"],
                                      [250, 30, "#4090ff"],
                                      [320, 20, "#c060ff"],
                                      [370, 40, "#ff60a0"],
                                    ].map(([x, y, c], i) => (
                                      <g key={i}>
                                        <circle
                                          cx={x}
                                          cy={y}
                                          r="8"
                                          fill={c}
                                          opacity="0.75"
                                        >
                                          <animate
                                            attributeName="cy"
                                            values={`${y};${y - 12};${y}`}
                                            dur={`${2 + i * 0.5}s`}
                                            repeatCount="indefinite"
                                          />
                                        </circle>
                                        <circle
                                          cx={x}
                                          cy={y}
                                          r="4"
                                          fill="white"
                                          opacity="0.3"
                                        >
                                          <animate
                                            attributeName="cy"
                                            values={`${y};${y - 12};${y}`}
                                            dur={`${2 + i * 0.5}s`}
                                            repeatCount="indefinite"
                                          />
                                        </circle>
                                      </g>
                                    ))}
                                    {/* キャンディの建物 */}
                                    <rect
                                      x="15"
                                      y="70"
                                      width="30"
                                      height="70"
                                      rx="3"
                                      fill="rgba(255,100,150,0.3)"
                                      stroke="rgba(255,150,180,0.4)"
                                      strokeWidth="1.5"
                                    />
                                    <path
                                      d="M15 70 Q30 55 45 70 Z"
                                      fill="rgba(255,60,120,0.4)"
                                    />
                                    <rect
                                      x="355"
                                      y="65"
                                      width="30"
                                      height="75"
                                      rx="3"
                                      fill="rgba(100,160,255,0.3)"
                                      stroke="rgba(150,190,255,0.4)"
                                      strokeWidth="1.5"
                                    />
                                    <path
                                      d="M355 65 Q370 48 385 65 Z"
                                      fill="rgba(60,120,255,0.4)"
                                    />
                                    {/* キャンディのアーチ */}
                                    <path
                                      d="M80 140 Q150 100 220 140"
                                      fill="none"
                                      stroke="rgba(255,180,200,0.35)"
                                      strokeWidth="10"
                                      strokeLinecap="round"
                                    />
                                    <path
                                      d="M190 140 Q260 100 330 140"
                                      fill="none"
                                      stroke="rgba(180,220,255,0.35)"
                                      strokeWidth="10"
                                      strokeLinecap="round"
                                    />
                                  </>
                                )}

                                {activeBgId === "snow" && (
                                  <>
                                    {/* 雪のグロー */}
                                    <rect
                                      x="0"
                                      y="0"
                                      width="400"
                                      height="280"
                                      fill="url(#snowGlow)"
                                    />
                                    {/* 月 */}
                                    <circle
                                      cx="350"
                                      cy="22"
                                      r="16"
                                      fill="#e8eeff"
                                      opacity="0.9"
                                    />
                                    <circle
                                      cx="344"
                                      cy="17"
                                      r="10"
                                      fill="#c8d4ee"
                                      opacity="0.2"
                                    />
                                    {/* 雪の結晶 大 */}
                                    {[
                                      [80, 30],
                                      [200, 15],
                                      [320, 25],
                                    ].map(([x, y], i) => (
                                      <g
                                        key={i}
                                        opacity="0.4"
                                        transform={`translate(${x},${y})`}
                                      >
                                        {[0, 30, 60, 90, 120, 150].map((a) => {
                                          const r = (a * Math.PI) / 180;
                                          return (
                                            <line
                                              key={a}
                                              x1={0}
                                              y1={0}
                                              x2={Math.cos(r) * 12}
                                              y2={Math.sin(r) * 12}
                                              stroke="#c0d8ff"
                                              strokeWidth="1.5"
                                            />
                                          );
                                        })}
                                        {[0, 30, 60, 90, 120, 150].map((a) => {
                                          const r = (a * Math.PI) / 180;
                                          return (
                                            <g key={a}>
                                              <line
                                                x1={Math.cos(r) * 5}
                                                y1={Math.sin(r) * 5}
                                                x2={
                                                  Math.cos(r) * 5 +
                                                  Math.cos(r + Math.PI / 2) * 3
                                                }
                                                y2={
                                                  Math.sin(r) * 5 +
                                                  Math.sin(r + Math.PI / 2) * 3
                                                }
                                                stroke="#c0d8ff"
                                                strokeWidth="1"
                                              />
                                              <line
                                                x1={Math.cos(r) * 5}
                                                y1={Math.sin(r) * 5}
                                                x2={
                                                  Math.cos(r) * 5 +
                                                  Math.cos(r - Math.PI / 2) * 3
                                                }
                                                y2={
                                                  Math.sin(r) * 5 +
                                                  Math.sin(r - Math.PI / 2) * 3
                                                }
                                                stroke="#c0d8ff"
                                                strokeWidth="1"
                                              />
                                            </g>
                                          );
                                        })}
                                      </g>
                                    ))}
                                    {/* 山のシルエット（雪） */}
                                    <path
                                      d="M0 120 L40 60 L80 90 L130 30 L190 80 L240 40 L290 70 L340 20 L390 55 L400 40 L400 120 Z"
                                      fill="rgba(30,50,90,0.4)"
                                    />
                                    {/* 雪の積もり */}
                                    <path
                                      d="M0 115 L40 55 L80 85 L130 25 L190 75 L240 35 L290 65 L340 15 L390 50 L400 35 L400 115"
                                      fill="none"
                                      stroke="rgba(220,235,255,0.55)"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                    />
                                    {/* 雪の粒（降雪） */}
                                    {[...Array(16)].map((_, i) => {
                                      const x = (i * 27) % 400;
                                      const size = 2 + (i % 3);
                                      return (
                                        <circle
                                          key={i}
                                          cx={x}
                                          cy={20 + (i % 5) * 20}
                                          r={size}
                                          fill="white"
                                          opacity={0.5 + (i % 3) * 0.15}
                                        >
                                          <animate
                                            attributeName="cy"
                                            values={`${-10};280`}
                                            dur={`${3 + i * 0.4}s`}
                                            repeatCount="indefinite"
                                            begin={`${i * 0.3}s`}
                                          />
                                          <animate
                                            attributeName="opacity"
                                            values="0.6;0.6;0"
                                            keyTimes="0;0.8;1"
                                            dur={`${3 + i * 0.4}s`}
                                            repeatCount="indefinite"
                                            begin={`${i * 0.3}s`}
                                          />
                                        </circle>
                                      );
                                    })}
                                    {/* 雪だるま */}
                                    <circle
                                      cx="60"
                                      cy="118"
                                      r="12"
                                      fill="rgba(230,240,255,0.5)"
                                      stroke="rgba(200,220,255,0.4)"
                                      strokeWidth="1"
                                    />
                                    <circle
                                      cx="60"
                                      cy="100"
                                      r="9"
                                      fill="rgba(240,248,255,0.55)"
                                      stroke="rgba(200,220,255,0.4)"
                                      strokeWidth="1"
                                    />
                                    <circle
                                      cx="58"
                                      cy="98"
                                      r="1.5"
                                      fill="rgba(50,60,80,0.8)"
                                    />
                                    <circle
                                      cx="63"
                                      cy="98"
                                      r="1.5"
                                      fill="rgba(50,60,80,0.8)"
                                    />
                                    <circle
                                      cx="60"
                                      cy="101"
                                      r="1"
                                      fill="rgba(255,120,60,0.8)"
                                    />
                                  </>
                                )}

                                {/* ─── 床面タイル（全テーマ共通） ─── */}
                                {/* 床奥→手前のグラデーション */}
                                <polygon
                                  points="0,280 400,280 360,140 40,140"
                                  fill="rgba(0,0,0,0.1)"
                                />
                                {/* タイルグリッド（消失点収束） */}
                                {[
                                  -160, -100, -40, 20, 80, 140, 200, 260, 320,
                                  380, 440, 500,
                                ].map((x, i) => (
                                  <line
                                    key={i}
                                    x1={x}
                                    y1="280"
                                    x2="200"
                                    y2="140"
                                    stroke="rgba(255,255,255,0.055)"
                                    strokeWidth="0.7"
                                  />
                                ))}
                              </svg>

                              {/* 天井（上面グラデーション） */}
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: "40%",
                                  background: "rgba(0,0,0,0.12)",
                                  pointerEvents: "none",
                                }}
                              />

                              {/* ─── 3D床エリア（遠近グラデーション） ─── */}
                              {/* 床ベース */}
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: "50%",
                                  background: `linear-gradient(to bottom, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.15) 100%), ${roomBg.floor}`,
                                  borderTop: `2px solid ${roomBg.floorBorder}`,
                                }}
                              />
                              {/* 床の遠近タイルライン */}
                              {[0, 1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: `${i * 22}%`,
                                    width: "20%",
                                    height: "50%",
                                    borderRight:
                                      "1px solid rgba(255,255,255,0.05)",
                                    pointerEvents: "none",
                                  }}
                                />
                              ))}
                              {/* 床の横ライン（遠ざかるほど細く薄く） */}
                              {[0, 1, 2, 3].map((i) => {
                                const pct = 12 + i * 10 + i * i * 2;
                                return (
                                  <div
                                    key={i}
                                    style={{
                                      position: "absolute",
                                      bottom: `${pct}%`,
                                      left: 0,
                                      right: 0,
                                      height: 1,
                                      background: `rgba(255,255,255,${
                                        0.03 + i * 0.015
                                      })`,
                                      pointerEvents: "none",
                                    }}
                                  />
                                );
                              })}

                              {/* ─── 奥→手前 各レーンのペット ─── */}
                              {depthLanes.map((lane, li) => {
                                const lanePets = petsByLane[li];
                                if (!lanePets || lanePets.length === 0)
                                  return null;
                                const colors = [
                                  "#f9a8d4",
                                  "#86efac",
                                  "#93c5fd",
                                  "#fcd34d",
                                  "#c4b5fd",
                                  "#fb923c",
                                  "#a5f3fc",
                                ];
                                return (
                                  <div
                                    key={lane.id}
                                    style={{
                                      position: "absolute",
                                      left: 0,
                                      right: 0,
                                      bottom: lane.bottom,
                                      display: "flex",
                                      alignItems: "flex-end",
                                      justifyContent: "space-evenly",
                                      padding: "0 12px",
                                      zIndex: lane.zIndex,
                                    }}
                                  >
                                    {lanePets.map((pet, idx) => {
                                      const globalIdx = ownedPets.indexOf(pet);
                                      const pd = getPetData(pet.id);
                                      const affection = pd.affection || 0;
                                      const petLv =
                                        getPetLvFromAffection(affection);
                                      const PIcon = PET_ICONS[pet.id] || IcPet;
                                      const petColor =
                                        colors[globalIdx % colors.length];
                                      const petAccIds = getPetAccessories(
                                        pet.id
                                      );
                                      const petAccList =
                                        SHOP_ACCESSORIES.filter((a) =>
                                          petAccIds.includes(a.id)
                                        );
                                      const headAcc = petAccList.find(
                                        (a) => a.slot === "head"
                                      );
                                      const faceAcc = petAccList.find(
                                        (a) => a.slot === "face"
                                      );
                                      const bgAcc = petAccList.find(
                                        (a) => a.slot === "bg"
                                      );
                                      const hasRainbow =
                                        bgAcc?.id === "rainbow";
                                      const hasStar = bgAcc?.id === "star";
                                      const rainbowKeyId = `rainbow_${pet.id}`;
                                      const baseSize = 72;
                                      const iconSize = Math.round(
                                        baseSize *
                                          lane.scale *
                                          (ownedPets.length > 4 ? 0.8 : 1)
                                      );
                                      // 歩行アニメ（奥のレーンほどゆっくり）
                                      const walkDur =
                                        10 + li * 4 + globalIdx * 2.5;
                                      const walkDelay = -(globalIdx * 4);
                                      const walkKeyId = `walk3d_${pet.id}`;
                                      const flipKeyId = `flip3d_${pet.id}`;
                                      return (
                                        <React.Fragment key={pet.id}>
                                          <style>{`
                                          @keyframes ${walkKeyId} {
                                            0%   { transform: translateX(-120px); }
                                            48%  { transform: translateX(120px); }
                                            50%  { transform: translateX(120px); }
                                            98%  { transform: translateX(-120px); }
                                            100% { transform: translateX(-120px); }
                                          }
                                          @keyframes ${flipKeyId} {
                                            0%,48%  { transform: scaleX(1); }
                                            49%,98% { transform: scaleX(-1); }
                                            100%    { transform: scaleX(1); }
                                          }
                                          @keyframes ${rainbowKeyId} {
                                            0%   { filter: drop-shadow(0 0 8px #ff0080) hue-rotate(0deg); }
                                            25%  { filter: drop-shadow(0 0 12px #ffaa00) hue-rotate(90deg); }
                                            50%  { filter: drop-shadow(0 0 8px #00ff80) hue-rotate(180deg); }
                                            75%  { filter: drop-shadow(0 0 12px #0088ff) hue-rotate(270deg); }
                                            100% { filter: drop-shadow(0 0 8px #ff0080) hue-rotate(360deg); }
                                          }
                                        `}</style>
                                          <div
                                            style={{
                                              animation: `${walkKeyId} ${walkDur}s linear ${walkDelay}s infinite`,
                                              cursor: "pointer",
                                              opacity: lane.opacity,
                                              position: "relative",
                                            }}
                                            onClick={() =>
                                              handlePetInteract(pet.id)
                                            }
                                          >
                                            {/* レインボー後光エフェクト */}
                                            {hasRainbow && (
                                              <div
                                                style={{
                                                  position: "absolute",
                                                  top: "50%",
                                                  left: "50%",
                                                  transform:
                                                    "translate(-50%,-50%)",
                                                  width: iconSize * 2.2,
                                                  height: iconSize * 2.2,
                                                  borderRadius: "50%",
                                                  background:
                                                    "conic-gradient(from 0deg,#ff0080,#ff6600,#ffcc00,#00ff80,#0088ff,#8800ff,#ff0080)",
                                                  opacity: 0.35,
                                                  animation: `${rainbowKeyId} 2s linear infinite`,
                                                  pointerEvents: "none",
                                                  zIndex: 0,
                                                  filter: "blur(6px)",
                                                }}
                                              />
                                            )}
                                            {/* スター後光エフェクト */}
                                            {hasStar && (
                                              <div
                                                style={{
                                                  position: "absolute",
                                                  top: "50%",
                                                  left: "50%",
                                                  transform:
                                                    "translate(-50%,-55%)",
                                                  lineHeight: 1,
                                                  pointerEvents: "none",
                                                  zIndex: 0,
                                                  animation:
                                                    "petBob 2s ease-in-out infinite",
                                                  filter: `drop-shadow(0 0 6px #ffd700)`,
                                                }}
                                              >
                                                <IcStar2
                                                  size={Math.round(
                                                    iconSize * 0.45
                                                  )}
                                                  color="#ffd700"
                                                />
                                              </div>
                                            )}
                                            <div
                                              className={`pet-anim-${
                                                globalIdx % 7
                                              }`}
                                              style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: 2,
                                                position: "relative",
                                                zIndex: 1,
                                              }}
                                            >
                                              <div
                                                style={{
                                                  position: "relative",
                                                  display: "inline-flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  animation: hasRainbow
                                                    ? `${rainbowKeyId} 2s linear infinite`
                                                    : undefined,
                                                }}
                                              >
                                                {headAcc && (
                                                  <div
                                                    style={{
                                                      position: "absolute",
                                                      top: -iconSize * 0.28,
                                                      left: "50%",
                                                      transform:
                                                        "translateX(-50%)",
                                                      zIndex: 2,
                                                      lineHeight: 1,
                                                    }}
                                                  >
                                                    {(() => {
                                                      const A =
                                                        ACC_ICONS[headAcc.id];
                                                      return A ? (
                                                        <A
                                                          size={iconSize * 0.45}
                                                          color="currentColor"
                                                        />
                                                      ) : (
                                                        <IcGift
                                                          size={iconSize * 0.45}
                                                          color="currentColor"
                                                        />
                                                      );
                                                    })()}
                                                  </div>
                                                )}
                                                <div
                                                  style={{
                                                    animation:
                                                      petFeedEffect?.petId ===
                                                      pet.id
                                                        ? `${flipKeyId} ${walkDur}s linear ${walkDelay}s infinite, feedBounce 0.7s ease-out`
                                                        : `${flipKeyId} ${walkDur}s linear ${walkDelay}s infinite`,
                                                    filter: `drop-shadow(0 0 ${Math.round(
                                                      8 * lane.scale
                                                    )}px ${petColor}88)`,
                                                  }}
                                                >
                                                  <div
                                                    style={{
                                                      background: `radial-gradient(circle, rgba(255,255,255,0.18) 40%, transparent 70%)`,
                                                      borderRadius: "50%",
                                                      padding: Math.round(
                                                        iconSize * 0.08
                                                      ),
                                                      display: "inline-flex",
                                                    }}
                                                  >
                                                    <PIcon size={iconSize} />
                                                  </div>
                                                </div>
                                                {faceAcc && (
                                                  <div
                                                    style={{
                                                      position: "absolute",
                                                      top: "40%",
                                                      left: "50%",
                                                      transform:
                                                        "translate(-50%,-50%)",
                                                      zIndex: 2,
                                                      lineHeight: 1,
                                                      opacity: 0.9,
                                                    }}
                                                  >
                                                    {(() => {
                                                      const A =
                                                        ACC_ICONS[faceAcc.id];
                                                      return A ? (
                                                        <A
                                                          size={iconSize * 0.38}
                                                          color="currentColor"
                                                        />
                                                      ) : (
                                                        <IcGift
                                                          size={iconSize * 0.38}
                                                          color="currentColor"
                                                        />
                                                      );
                                                    })()}
                                                  </div>
                                                )}
                                                {/* エサあげ喜び演出 */}
                                                {petFeedEffect?.petId ===
                                                  pet.id &&
                                                  (() => {
                                                    const IcHeartFilled = ({
                                                      size,
                                                      color,
                                                    }) => (
                                                      <IcHeart
                                                        size={size}
                                                        color={color}
                                                        filled={true}
                                                      />
                                                    );
                                                    const particles = [
                                                      IcHeartFilled,
                                                      IcSparkle,
                                                      IcHeartFilled,
                                                      IcSparkle,
                                                      IcDiamond,
                                                      IcSparkle,
                                                      IcHeartFilled,
                                                      IcSparkle,
                                                    ];
                                                    const particleColors = [
                                                      "#f472b6",
                                                      "#fbbf24",
                                                      "#f472b6",
                                                      "#fbbf24",
                                                      "#60a5fa",
                                                      "#fbbf24",
                                                      "#f472b6",
                                                      "#fbbf24",
                                                    ];
                                                    const angles = [
                                                      0, 45, 90, 135, 180, 225,
                                                      270, 315,
                                                    ];
                                                    const dist = iconSize * 1.1;
                                                    return (
                                                      <>
                                                        {angles.map(
                                                          (deg, ei) => {
                                                            const rad =
                                                              (deg * Math.PI) /
                                                              180;
                                                            const dx =
                                                              Math.round(
                                                                Math.cos(rad) *
                                                                  dist
                                                              );
                                                            const dy =
                                                              Math.round(
                                                                Math.sin(rad) *
                                                                  dist *
                                                                  0.75
                                                              );
                                                            const PIcon =
                                                              particles[ei];
                                                            return (
                                                              <div
                                                                key={ei}
                                                                style={{
                                                                  position:
                                                                    "absolute",
                                                                  top: "50%",
                                                                  left: "50%",
                                                                  width:
                                                                    Math.round(
                                                                      iconSize *
                                                                        0.3
                                                                    ),
                                                                  height:
                                                                    Math.round(
                                                                      iconSize *
                                                                        0.3
                                                                    ),
                                                                  lineHeight: 1,
                                                                  pointerEvents:
                                                                    "none",
                                                                  zIndex: 20,
                                                                  "--fdx": `${dx}px`,
                                                                  "--fdy": `${
                                                                    -Math.abs(
                                                                      dy
                                                                    ) - 10
                                                                  }px`,
                                                                  animation: `feedParticle 1.2s ease-out ${
                                                                    ei * 0.05
                                                                  }s both`,
                                                                }}
                                                              >
                                                                <PIcon
                                                                  size={Math.round(
                                                                    iconSize *
                                                                      0.3
                                                                  )}
                                                                  color={
                                                                    particleColors[
                                                                      ei
                                                                    ]
                                                                  }
                                                                />
                                                              </div>
                                                            );
                                                          }
                                                        )}
                                                        {[0, 1, 2, 3].map(
                                                          (i) => (
                                                            <div
                                                              key={"h" + i}
                                                              style={{
                                                                position:
                                                                  "absolute",
                                                                top: "20%",
                                                                left: `${
                                                                  25 + i * 17
                                                                }%`,
                                                                width:
                                                                  Math.round(
                                                                    iconSize *
                                                                      0.35
                                                                  ),
                                                                height:
                                                                  Math.round(
                                                                    iconSize *
                                                                      0.35
                                                                  ),
                                                                pointerEvents:
                                                                  "none",
                                                                zIndex: 20,
                                                                animation: `feedHeart ${
                                                                  0.8 + i * 0.18
                                                                }s ease-out ${
                                                                  i * 0.12
                                                                }s both`,
                                                              }}
                                                            >
                                                              <IcHeart
                                                                size={Math.round(
                                                                  iconSize *
                                                                    0.35
                                                                )}
                                                                color="#f472b6"
                                                                filled={true}
                                                              />
                                                            </div>
                                                          )
                                                        )}
                                                      </>
                                                    );
                                                  })()}
                                              </div>
                                              {/* 影 */}
                                              <div
                                                style={{
                                                  width: iconSize * 0.6,
                                                  height: 5,
                                                  borderRadius: "50%",
                                                  background: `radial-gradient(ellipse,rgba(0,0,0,0.3),transparent)`,
                                                  marginTop: -4,
                                                }}
                                              />
                                              <span
                                                style={{
                                                  fontSize: Math.max(
                                                    7,
                                                    Math.round(9 * lane.scale)
                                                  ),
                                                  fontWeight: 900,
                                                  color: "#fff",
                                                  opacity: 0.95,
                                                  letterSpacing: "0.05em",
                                                  textShadow: `0 1px 4px rgba(0,0,0,0.8), 0 0 8px ${petColor}`,
                                                }}
                                              >
                                                Lv.{petLv}
                                              </span>
                                            </div>
                                          </div>
                                        </React.Fragment>
                                      );
                                    })}
                                  </div>
                                );
                              })}

                              {/* ─── 手前の床の縁（影） ─── */}
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: 8,
                                  background:
                                    "linear-gradient(to bottom,rgba(0,0,0,0.15),transparent)",
                                  pointerEvents: "none",
                                }}
                              />
                            </div>
                          );
                        })()}
                      </div>
                      {/* end fixed area inner */}
                      {/* 背景セレクター */}
                      <div className="px-0 py-2" style={{ flexShrink: 0 }}>
                        <div
                          className="flex gap-2 overflow-x-auto pb-1"
                          style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
                        >
                          <style>{`.bg-scroll::-webkit-scrollbar{display:none}`}</style>
                          {SHOP_BACKGROUNDS.map((bg) => {
                            const owned = (
                              profile?.ownedRoomBgs || ["night"]
                            ).includes(bg.id);
                            const active =
                              (profile?.activeRoomBg || "night") === bg.id;
                            const canAfford =
                              (profile?.petPoints || 0) >= bg.price;
                            return (
                              <button
                                key={bg.id}
                                onClick={() => {
                                  if (!owned) {
                                    if (!canAfford) {
                                      showToast(
                                        "ポイントが足りません",
                                        "error"
                                      );
                                      return;
                                    }
                                    const np = {
                                      ...profile,
                                      petPoints:
                                        (profile?.petPoints || 0) - bg.price,
                                      ownedRoomBgs: [
                                        ...(profile?.ownedRoomBgs || ["night"]),
                                        bg.id,
                                      ],
                                      activeRoomBg: bg.id,
                                    };
                                    setProfile(np);
                                    saveLocal("profile", np);
                                    if (fb.db && user)
                                      updateDoc(
                                        doc(
                                          fb.db,
                                          "artifacts",
                                          fb.appId,
                                          "users",
                                          user.uid,
                                          "profile",
                                          "main"
                                        ),
                                        {
                                          petPoints: np.petPoints,
                                          ownedRoomBgs: np.ownedRoomBgs,
                                          activeRoomBg: np.activeRoomBg,
                                        }
                                      ).catch(() => {});
                                    showToast(`${bg.name}を購入！`);
                                  } else {
                                    const np = {
                                      ...profile,
                                      activeRoomBg: bg.id,
                                    };
                                    setProfile(np);
                                    saveLocal("profile", np);
                                    if (fb.db && user)
                                      updateDoc(
                                        doc(
                                          fb.db,
                                          "artifacts",
                                          fb.appId,
                                          "users",
                                          user.uid,
                                          "profile",
                                          "main"
                                        ),
                                        { activeRoomBg: bg.id }
                                      ).catch(() => {});
                                  }
                                }}
                                style={{
                                  flexShrink: 0,
                                  width: 52,
                                  height: 52,
                                  borderRadius: 12,
                                  background: bg.gradient,
                                  border: active
                                    ? "2.5px solid #fbbf24"
                                    : "2px solid rgba(255,255,255,0.1)",
                                  position: "relative",
                                  overflow: "hidden",
                                  transition: "all 0.2s",
                                  boxShadow: active
                                    ? "0 0 10px rgba(251,191,36,0.5)"
                                    : "none",
                                  opacity: !owned && !canAfford ? 0.45 : 1,
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 1,
                                  }}
                                >
                                  {bg.SvgIcon ? (
                                    <bg.SvgIcon
                                      size={22}
                                      color={
                                        bg.iconColor || "rgba(255,255,255,0.9)"
                                      }
                                    />
                                  ) : null}
                                  {!owned && (
                                    <span
                                      style={{
                                        fontSize: 7,
                                        fontWeight: 900,
                                        color: "#fbbf24",
                                        textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                                      }}
                                    >
                                      {bg.price}pt
                                    </span>
                                  )}
                                  {active && (
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: 2,
                                        right: 2,
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: "#fbbf24",
                                        border: "1px solid white",
                                      }}
                                    />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ─── スクロールエリア：お世話パネル ─── */}
                      <div
                        style={{
                          flex: 1,
                          overflowY: "auto",
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                          paddingBottom: 24,
                        }}
                      >
                        <style>{`[data-care-scroll]::-webkit-scrollbar{display:none}`}</style>
                        {/* 各ペットのお世話パネル */}
                        <div className="space-y-3">
                          {ownedPets.map((pet, idx) => (
                            <PetCareCard
                              key={pet.id}
                              pet={pet}
                              idx={idx}
                              profile={profile}
                              setProfile={setProfile}
                              saveLocal={saveLocal}
                              fb={fb}
                              user={user}
                              getPetData={getPetData}
                              getPetAccessories={getPetAccessories}
                              handleFeed={handleFeed}
                              handlePetInteract={handlePetInteract}
                              handleEquipAccForPet={handleEquipAccForPet}
                              isLight={isLight}
                            />
                          ))}
                        </div>
                      </div>
                      {/* end scroll area */}
                    </>
                  )}
                </div>
              );
            })()}

          {screen === "review" &&
            (() => {
              const removeReviewItem = async (item) => {
                // 即座にローカルから消し、リスナーの再追加も防ぐ
                deletingReviewIds.current.add(item.id);
                setReviewList((prev) => prev.filter((r) => r.id !== item.id));
                if (user && fb.enabled) {
                  try {
                    await deleteDoc(
                      doc(
                        fb.db,
                        "artifacts",
                        fb.appId,
                        "users",
                        user.uid,
                        "review",
                        item.id
                      )
                    );
                  } catch (e) {}
                }
                // Firestoreのリスナー通知が完了するまで待ってからセットを解放
                setTimeout(() => {
                  deletingReviewIds.current.delete(item.id);
                }, 3000);
              };

              return (
                <div
                  className="animate-in fade-in text-left"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  {/* ヘッダー */}
                  <div className="flex items-center gap-4 mb-4 shrink-0">
                    <button
                      onClick={() => {
                        setScreen("start");
                        setReviewMode("list");
                        setReviewQuizIdx(0);
                      }}
                      className="p-2 rounded-xl active:opacity-70 transition-all"
                      style={{
                        background: isLight
                          ? "rgba(0,0,0,0.06)"
                          : "rgba(255,255,255,0.08)",
                        border: isLight
                          ? "1.5px solid rgba(0,0,0,0.18)"
                          : "1px solid rgba(255,255,255,0.12)",
                        color: isLight ? "rgba(20,10,60,0.8)" : "white",
                      }}
                    >
                      <ChevronLeft />
                    </button>
                    <h2
                      className="text-2xl font-black flex items-center gap-3"
                      style={{ color: theme.accent }}
                    >
                      <BookCheck size={28} /> 復習
                    </h2>
                    <span
                      className="ml-auto text-sm font-bold px-3 py-1 rounded-full"
                      style={{
                        background: `${theme.accent}22`,
                        color: theme.accent,
                        border: `1px solid ${theme.accent}44`,
                      }}
                    >
                      {reviewList.length}語
                    </span>
                  </div>

                  {/* タブ */}
                  {reviewList.length > 0 && (
                    <div className="flex gap-2 mb-4 shrink-0">
                      {[
                        {
                          id: "list",
                          label: "リスト",
                          icon: <Layers size={13} />,
                        },
                        {
                          id: "quiz",
                          label: "4択",
                          icon: <Zap size={13} />,
                        },
                        {
                          id: "sentence",
                          label: "例文",
                          icon: <BookOpen size={13} />,
                        },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setReviewMode(tab.id);
                            if (tab.id === "quiz") {
                              setReviewQuizIdx(0);
                              setReviewQuizFeedback(null);
                              setReviewSentenceRevealed(false);
                              startReviewQuiz(0, reviewList);
                            }
                            if (tab.id === "sentence") {
                              setReviewQuizIdx(0);
                              setReviewQuizFeedback(null);
                              setReviewSentenceRevealed(false);
                            }
                          }}
                          className="flex-1 py-2 rounded-xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                          style={{
                            background:
                              reviewMode === tab.id
                                ? theme.accent
                                : isLight
                                ? "rgba(0,0,0,0.05)"
                                : "rgba(255,255,255,0.06)",
                            color:
                              reviewMode === tab.id
                                ? "#fff"
                                : isLight
                                ? "rgba(20,10,60,0.65)"
                                : theme.textMuted,
                            border:
                              reviewMode === tab.id
                                ? "none"
                                : isLight
                                ? "1.5px solid rgba(0,0,0,0.18)"
                                : "1px solid rgba(255,255,255,0.10)",
                          }}
                        >
                          {tab.icon}
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {reviewList.length === 0 ? (
                    <p
                      className="p-16 text-center font-bold rounded-2xl"
                      style={{
                        color: isLight
                          ? "rgba(0,0,0,0.35)"
                          : "rgba(255,255,255,0.3)",
                        background: isLight
                          ? "rgba(0,0,0,0.04)"
                          : "rgba(255,255,255,0.04)",
                        border: isLight ? "1px solid rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      復習すべき単語はありません！
                    </p>
                  ) : reviewMode === "list" ? (
                    /* ━━ リストモード ━━ */
                    <div
                      className="space-y-4 overflow-y-auto"
                      style={{ flex: 1, minHeight: 0 }}
                    >
                      {reviewList.map((item) => {
                        const isEn = !/[ぁ-ん々ー一-鿿ｦ-ﾟ]/.test(item.en);
                        return (
                          <div
                            key={item.id}
                            className="p-5 rounded-2xl flex justify-between items-center"
                            style={{
                              background: isLight
                                ? "rgba(255,255,255,0.92)"
                                : "rgba(255,255,255,0.06)",
                              border: isLight
                                ? "2px solid rgba(0,0,0,0.15)"
                                : "1px solid rgba(255,255,255,0.10)",
                              boxShadow: isLight
                                ? "0 2px 10px rgba(0,0,0,0.07)"
                                : "none",
                            }}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p
                                  className="text-3xl font-black tracking-tight"
                                  style={{ color: theme.text }}
                                >
                                  {item.en}
                                </p>
                                {isEn && (
                                  <button
                                    onClick={() => speak(item.en)}
                                    className="p-1.5 rounded-lg active:scale-90 transition-all"
                                    style={{
                                      background: isLight
                                        ? "rgba(0,0,0,0.07)"
                                        : "rgba(255,255,255,0.08)",
                                      color: isLight
                                        ? "rgba(20,10,60,0.45)"
                                        : "rgba(255,255,255,0.4)",
                                    }}
                                  >
                                    <Volume2 size={14} />
                                  </button>
                                )}
                              </div>
                              <p
                                className="text-lg font-bold"
                                style={{
                                  color: isLight
                                    ? "rgba(99,102,241,0.85)"
                                    : "rgba(165,180,252,0.85)",
                                }}
                              >
                                {item.ja}
                              </p>
                              {item.sentence && (
                                <p
                                  className="text-xs mt-1 italic"
                                  style={{
                                    color: isLight
                                      ? "rgba(20,10,60,0.35)"
                                      : "rgba(255,255,255,0.28)",
                                  }}
                                >
                                  {item.sentence}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                removeReviewItem(item);
                                showToast("復習済み！");
                              }}
                              className="ml-4 p-4 transition-all active:scale-90 rounded-xl"
                              style={{ color: "rgba(99,102,241,0.5)" }}
                              title="復習済み"
                            >
                              <CheckCircle2 size={32} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : reviewMode === "quiz" ? (
                    /* ━━ 4択クイズモード ━━ */
                    (() => {
                      const currentWord = reviewList[reviewQuizIdx];
                      if (!currentWord) return null;
                      const total = reviewList.length;
                      const pct = Math.round((reviewQuizIdx / total) * 100);

                      return (
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                            minHeight: 0,
                          }}
                        >
                          {/* 進捗バー */}
                          <div className="shrink-0">
                            <div
                              className="flex justify-between text-xs font-bold mb-2"
                              style={{ color: theme.textMuted }}
                            >
                              <span>
                                {reviewQuizIdx + 1} / {total}
                              </span>
                              <span>{pct}%</span>
                            </div>
                            <div
                              className="w-full rounded-full overflow-hidden"
                              style={{
                                height: 4,
                                background: isLight
                                  ? "rgba(0,0,0,0.10)"
                                  : "rgba(255,255,255,0.10)",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  borderRadius: 99,
                                  width: `${pct}%`,
                                  background: `linear-gradient(90deg,${theme.accent}88,${theme.accent})`,
                                  transition: "width 0.4s ease",
                                }}
                              />
                            </div>
                          </div>

                          {/* 問題カード */}
                          <div
                            className="rounded-2xl p-6 text-center shrink-0"
                            style={{
                              background: isLight
                                ? "rgba(255,255,255,0.92)"
                                : "rgba(255,255,255,0.06)",
                              border: isLight
                                ? "2px solid rgba(0,0,0,0.15)"
                                : "1px solid rgba(255,255,255,0.12)",
                              boxShadow: isLight
                                ? "0 2px 12px rgba(0,0,0,0.08)"
                                : "none",
                            }}
                          >
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <p
                                className="text-xs font-black uppercase tracking-widest"
                                style={{ color: theme.textMuted }}
                              >
                                次の意味は？
                              </p>
                              {!/[ぁ-ん々ー一-鿿ｦ-ﾟ]/.test(currentWord.en) && (
                                <button
                                  onClick={() => speak(currentWord.en)}
                                  className="p-1 rounded-lg active:scale-90"
                                  style={{
                                    background: isLight
                                      ? "rgba(0,0,0,0.07)"
                                      : "rgba(255,255,255,0.08)",
                                    color: isLight
                                      ? "rgba(20,10,60,0.45)"
                                      : "rgba(255,255,255,0.4)",
                                  }}
                                >
                                  <Volume2 size={12} />
                                </button>
                              )}
                            </div>
                            <p
                              className="text-4xl font-black tracking-tight"
                              style={{ color: theme.text }}
                            >
                              {currentWord.en}
                            </p>
                            {currentWord.sentence && (
                              <p
                                className="text-xs mt-3 italic px-2"
                                style={{
                                  color: isLight
                                    ? "rgba(20,10,60,0.38)"
                                    : "rgba(255,255,255,0.30)",
                                }}
                              >
                                {currentWord.sentence.replace(
                                  new RegExp(currentWord.en, "gi"),
                                  "___"
                                )}
                              </p>
                            )}
                          </div>

                          {/* 選択肢 */}
                          {reviewQuizLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                              <div className="text-center">
                                <div className="flex justify-center mb-2">
                                  <Loader2
                                    size={28}
                                    style={{
                                      color: theme.accent,
                                      animation: "spin 1s linear infinite",
                                    }}
                                  />
                                </div>
                                <p
                                  className="text-sm font-bold"
                                  style={{ color: theme.textMuted }}
                                >
                                  AIが問題を生成中...
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="grid grid-cols-2 gap-3"
                              style={{ flex: 1 }}
                            >
                              {reviewQuizOptions.map((opt, i) => {
                                const isCorrect = opt.en === currentWord.en;
                                const isSelected = reviewQuizFeedback !== null;
                                let bg = isLight
                                  ? "rgba(255,255,255,0.88)"
                                  : "rgba(255,255,255,0.07)";
                                let border = isLight
                                  ? "2px solid rgba(0,0,0,0.15)"
                                  : "1px solid rgba(255,255,255,0.12)";
                                let textColor = theme.text;
                                if (isSelected && isCorrect) {
                                  bg = "rgba(52,211,153,0.18)";
                                  border = "1.5px solid #34d399";
                                  textColor = "#34d399";
                                } else if (
                                  isSelected &&
                                  reviewQuizFeedback === opt.en &&
                                  !isCorrect
                                ) {
                                  bg = "rgba(239,68,68,0.18)";
                                  border = "1.5px solid #ef4444";
                                  textColor = "#ef4444";
                                }
                                return (
                                  <button
                                    key={i}
                                    onClick={async () => {
                                      if (reviewQuizFeedback !== null) return;
                                      setReviewQuizFeedback(opt.en);
                                      const correct = opt.en === currentWord.en;
                                      if (correct) {
                                        showToast("⭕ 正解！");
                                        setTimeout(async () => {
                                          // 正解したら復習リストから削除
                                          await removeReviewItem(currentWord);
                                          const nextList = reviewList.filter(
                                            (r) => r.id !== currentWord.id
                                          );
                                          if (nextList.length === 0) {
                                            showToast("全問クリア！");
                                            setReviewMode("list");
                                            return;
                                          }
                                          const nextIdx = Math.min(
                                            reviewQuizIdx,
                                            nextList.length - 1
                                          );
                                          setReviewQuizIdx(nextIdx);
                                          setReviewQuizFeedback(null);
                                          startReviewQuiz(nextIdx, nextList);
                                        }, 900);
                                      } else {
                                        showToast(
                                          `✗ 不正解 → ${currentWord.ja}`,
                                          "error"
                                        );
                                        setTimeout(() => {
                                          const nextIdx =
                                            reviewQuizIdx + 1 <
                                            reviewList.length
                                              ? reviewQuizIdx + 1
                                              : 0;
                                          setReviewQuizIdx(nextIdx);
                                          setReviewQuizFeedback(null);
                                          startReviewQuiz(nextIdx, reviewList);
                                        }, 1200);
                                      }
                                    }}
                                    className="rounded-2xl p-4 text-left transition-all active:scale-95 font-bold"
                                    style={{
                                      background: bg,
                                      border,
                                      color: textColor,
                                      minHeight: 72,
                                    }}
                                  >
                                    <span
                                      className="text-xs font-black uppercase tracking-wider block mb-1"
                                      style={{
                                        color:
                                          isSelected && isCorrect
                                            ? "#34d399"
                                            : isSelected &&
                                              reviewQuizFeedback === opt.en
                                            ? "#ef4444"
                                            : theme.textMuted,
                                      }}
                                    >
                                      {String.fromCharCode(65 + i)}
                                    </span>
                                    {opt.ja}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* スキップ */}
                          {!reviewQuizLoading &&
                            reviewQuizFeedback === null &&
                            reviewList.length > 1 && (
                              <button
                                onClick={() => {
                                  const nextIdx =
                                    reviewQuizIdx + 1 < reviewList.length
                                      ? reviewQuizIdx + 1
                                      : 0;
                                  setReviewQuizIdx(nextIdx);
                                  setReviewQuizFeedback(null);
                                  startReviewQuiz(nextIdx, reviewList);
                                }}
                                className="shrink-0 text-center py-2 text-xs font-bold active:opacity-60"
                                style={{ color: theme.textMuted }}
                              >
                                スキップ →
                              </button>
                            )}
                        </div>
                      );
                    })()
                  ) : (
                    /* ━━ 例文穴埋めモード ━━ */
                    (() => {
                      const sentenceList = reviewList.filter((w) => w.sentence);
                      if (sentenceList.length === 0)
                        return (
                          <div className="flex-1 flex items-center justify-center">
                            <p
                              className="text-center font-bold p-8"
                              style={{
                                color: isLight
                                  ? "rgba(20,10,60,0.40)"
                                  : "rgba(255,255,255,0.3)",
                                background: isLight
                                  ? "rgba(0,0,0,0.04)"
                                  : "rgba(255,255,255,0.04)",
                                borderRadius: 16,
                                border: isLight
                                  ? "1.5px solid rgba(0,0,0,0.12)"
                                  : "none",
                              }}
                            >
                              例文のある単語がありません
                            </p>
                          </div>
                        );
                      const idx = Math.min(
                        reviewQuizIdx,
                        sentenceList.length - 1
                      );
                      const word = sentenceList[idx];
                      const isEn = !/[ぁ-ん々ー一-鿿ｦ-ﾟ]/.test(word.en);
                      const total = sentenceList.length;
                      const pct = Math.round((idx / total) * 100);
                      const revealed = reviewSentenceRevealed;
                      const setRevealed = setReviewSentenceRevealed;
                      const goNext = () => {
                        setReviewSentenceRevealed(false);
                        const nextIdx = idx + 1 < total ? idx + 1 : 0;
                        setReviewQuizIdx(nextIdx);
                      };
                      return (
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 14,
                            minHeight: 0,
                          }}
                        >
                          {/* 進捗 */}
                          <div className="shrink-0">
                            <div
                              className="flex justify-between text-xs font-bold mb-1"
                              style={{ color: theme.textMuted }}
                            >
                              <span>
                                {idx + 1} / {total}
                              </span>
                              <span>{pct}%</span>
                            </div>
                            <div
                              className="w-full rounded-full overflow-hidden"
                              style={{
                                height: 4,
                                background: isLight
                                  ? "rgba(0,0,0,0.10)"
                                  : "rgba(255,255,255,0.10)",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  borderRadius: 99,
                                  width: `${pct}%`,
                                  background: `linear-gradient(90deg,${theme.accent}88,${theme.accent})`,
                                  transition: "width 0.4s ease",
                                }}
                              />
                            </div>
                          </div>
                          {/* 例文カード */}
                          <div
                            className="rounded-2xl p-6 text-center shrink-0"
                            style={{
                              background: isLight
                                ? "rgba(255,255,255,0.92)"
                                : "rgba(255,255,255,0.06)",
                              border: isLight
                                ? "2px solid rgba(0,0,0,0.15)"
                                : "1px solid rgba(255,255,255,0.12)",
                              boxShadow: isLight
                                ? "0 2px 12px rgba(0,0,0,0.08)"
                                : "none",
                            }}
                          >
                            <p
                              className="text-xs font-black uppercase tracking-widest mb-4"
                              style={{ color: theme.textMuted }}
                            >
                              ___に入る単語は？
                            </p>
                            <p
                              className="text-xl font-bold leading-relaxed"
                              style={{ color: theme.text }}
                            >
                              {formatSentence(word.sentence, word.en)}
                            </p>
                            {revealed && (
                              <div
                                className="mt-4 pt-4"
                                style={{
                                  borderTop: isLight
                                    ? "1px solid rgba(0,0,0,0.10)"
                                    : "1px solid rgba(255,255,255,0.10)",
                                }}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <p
                                    className="text-3xl font-black"
                                    style={{ color: theme.accent }}
                                  >
                                    {word.en}
                                  </p>
                                  {isEn && (
                                    <button
                                      onClick={() => speak(word.en)}
                                      className="p-1.5 rounded-lg active:scale-90"
                                      style={{
                                        background: isLight
                                          ? "rgba(0,0,0,0.07)"
                                          : "rgba(255,255,255,0.08)",
                                        color: isLight
                                          ? "rgba(20,10,60,0.45)"
                                          : "rgba(255,255,255,0.5)",
                                      }}
                                    >
                                      <Volume2 size={14} />
                                    </button>
                                  )}
                                </div>
                                <p
                                  className="text-sm mt-1"
                                  style={{
                                    color: isLight
                                      ? "rgba(99,102,241,0.85)"
                                      : "rgba(165,180,252,0.85)",
                                  }}
                                >
                                  {word.ja}
                                </p>
                              </div>
                            )}
                          </div>
                          {/* ボタン */}
                          <div className="flex gap-3 shrink-0">
                            {!revealed ? (
                              <button
                                onClick={() => setRevealed(true)}
                                className="flex-1 py-4 rounded-2xl font-black text-white active:scale-95 transition-all"
                                style={{
                                  background: `linear-gradient(135deg,${theme.accent}cc,${theme.accent})`,
                                  boxShadow: `0 4px 16px ${theme.accent}44`,
                                }}
                              >
                                答えを見る
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    removeReviewItem(word);
                                    goNext();
                                    showToast("✓ 覚えた！");
                                  }}
                                  className="flex-1 py-4 rounded-2xl font-black active:scale-95 transition-all"
                                  style={{
                                    background: "rgba(52,211,153,0.2)",
                                    color: "#34d399",
                                    border: "1.5px solid #34d399",
                                  }}
                                >
                                  ✓ 覚えた
                                </button>
                                <button
                                  onClick={goNext}
                                  className="flex-1 py-4 rounded-2xl font-black active:scale-95 transition-all"
                                  style={{
                                    background: isLight
                                      ? "rgba(0,0,0,0.05)"
                                      : "rgba(255,255,255,0.06)",
                                    color: isLight
                                      ? "rgba(20,10,60,0.65)"
                                      : theme.textMuted,
                                    border: isLight
                                      ? "1.5px solid rgba(0,0,0,0.15)"
                                      : "1px solid rgba(255,255,255,0.12)",
                                  }}
                                >
                                  次へ →
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              );
            })()}

          {/* --- 単語帳画面 --- */}
          {screen === "wordbook" &&
            (() => {
              const myUid = user?.uid || "";
              const reviewEnSet = new Set(reviewList.map((r) => r.en));
              const reviewEnToId = {};
              reviewList.forEach((r) => {
                reviewEnToId[r.en] = r.id;
              });

              const toggleReview = async (word) => {
                const isInReview = reviewEnSet.has(word.en);
                if (isInReview) {
                  const rid = reviewEnToId[word.en];
                  if (!rid) return;
                  deletingReviewIds.current.add(rid);
                  setReviewList((prev) => prev.filter((r) => r.id !== rid));
                  if (user && fb.enabled) {
                    try {
                      await deleteDoc(
                        doc(
                          fb.db,
                          "artifacts",
                          fb.appId,
                          "users",
                          user.uid,
                          "review",
                          rid
                        )
                      );
                    } catch (e) {}
                    setTimeout(() => {
                      deletingReviewIds.current.delete(rid);
                    }, 3000);
                  }
                  showToast("復習リストから削除しました");
                } else {
                  const { id: _id, ...wordData } = word;
                  if (user && fb.enabled) {
                    await addDoc(
                      collection(
                        fb.db,
                        "artifacts",
                        fb.appId,
                        "users",
                        user.uid,
                        "review"
                      ),
                      wordData
                    );
                  } else {
                    setReviewList((prev) => [
                      ...prev,
                      { ...wordData, id: Date.now().toString() },
                    ]);
                  }
                  showToast("復習リストに追加しました！");
                }
              };

              const stages = Array.from({ length: 20 }, (_, i) => i + 1);
              const myCustomWords = customVocabList.filter((w) => {
                const at = w.assignedTo;
                return (
                  at === "all" ||
                  at === undefined ||
                  (Array.isArray(at) && at.includes(myUid))
                );
              });

              return (
                <div
                  className="animate-in fade-in text-left pb-10"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <div className="flex items-center gap-4 mb-5 shrink-0">
                    <button
                      onClick={() => {
                        if (wordbookStage !== null) {
                          setWordbookStage(null);
                        } else {
                          setScreen("start");
                        }
                      }}
                      className="p-2 rounded-xl active:opacity-70 transition-all"
                      style={{
                        background: isLight
                          ? "rgba(0,0,0,0.06)"
                          : "rgba(255,255,255,0.08)",
                        border: isLight
                          ? "1px solid rgba(0,0,0,0.12)"
                          : "1px solid rgba(255,255,255,0.12)",
                        color: theme.text,
                      }}
                    >
                      <ChevronLeft />
                    </button>
                    <h2
                      className="text-3xl font-black"
                      style={{ color: theme.text }}
                    >
                      {wordbookStage !== null
                        ? `Stage ${wordbookStage}`
                        : wordbookTab === "custom"
                        ? "カスタム問題"
                        : wordbookTab === "myword"
                        ? "マイワード"
                        : "単語帳"}
                    </h2>
                    <span
                      className="ml-auto text-sm font-bold px-3 py-1 rounded-full"
                      style={{
                        background: isLight
                          ? "rgba(6,182,212,0.12)"
                          : "rgba(6,182,212,0.15)",
                        color: isLight ? "#0e7490" : "#67e8f9",
                        border: "1px solid rgba(6,182,212,0.3)",
                      }}
                    >
                      {wordbookStage !== null
                        ? `${
                            vocabList.filter((v) => v.stage === wordbookStage)
                              .length
                          }語`
                        : wordbookTab === "custom"
                        ? `${myCustomWords.length}語`
                        : wordbookTab === "myword"
                        ? `${userVocabList.length}語`
                        : `${stages.length}ステージ`}
                    </span>
                  </div>

                  {wordbookStage === null && (
                    <>
                      <div className="flex gap-2 mb-3 shrink-0">
                        {[
                          {
                            key: "stage",
                            label: "マップ別",
                            iconFn: (c) => (
                              <MapIcon size={13} style={{ color: c }} />
                            ),
                          },
                          {
                            key: "custom",
                            label: "カスタム",
                            iconFn: (c) => <IcGift size={13} color={c} />,
                          },
                          {
                            key: "myword",
                            label: "マイワード",
                            iconFn: (c) => <IcFactory size={13} color={c} />,
                          },
                        ].map((t) => {
                          const iconColor =
                            wordbookTab === t.key
                              ? "white"
                              : isLight
                              ? "rgba(20,10,60,0.75)"
                              : "rgba(255,255,255,0.75)";
                          return (
                            <button
                              key={t.key}
                              onClick={() => setWordbookTab(t.key)}
                              className="flex-1 py-2 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-1.5"
                              style={{
                                background:
                                  wordbookTab === t.key
                                    ? "linear-gradient(135deg,#0891b2,#06b6d4)"
                                    : isLight
                                    ? "rgba(0,0,0,0.06)"
                                    : "rgba(255,255,255,0.06)",
                                color:
                                  wordbookTab === t.key
                                    ? "white"
                                    : isLight
                                    ? "rgba(20,10,60,0.75)"
                                    : "rgba(255,255,255,0.75)",
                                border:
                                  wordbookTab === t.key
                                    ? "none"
                                    : isLight
                                    ? "1px solid rgba(0,0,0,0.15)"
                                    : "1px solid rgba(255,255,255,0.1)",
                              }}
                            >
                              {t.iconFn(iconColor)}
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                      {wordbookTab === "stage" && (
                        <div className="flex gap-1.5 mb-3 shrink-0 flex-wrap">
                          {WORD_CATEGORIES.map((cat) => {
                            const CatIc = CATEGORY_ICONS[cat.key];
                            return (
                              <button
                                key={cat.key}
                                onClick={() => {
                                  setWordbookCategory(cat.key);
                                  setWordbookStage(null);
                                }}
                                className="px-3 py-1 rounded-full font-black text-xs transition-all flex items-center gap-1"
                                style={{
                                  background:
                                    wordbookCategory === cat.key
                                      ? cat.color
                                      : isLight
                                      ? "rgba(0,0,0,0.06)"
                                      : "rgba(255,255,255,0.06)",
                                  color:
                                    wordbookCategory === cat.key
                                      ? "white"
                                      : isLight
                                      ? "rgba(20,10,60,0.75)"
                                      : "rgba(255,255,255,0.75)",
                                  border:
                                    wordbookCategory === cat.key
                                      ? "none"
                                      : isLight
                                      ? "1px solid rgba(0,0,0,0.15)"
                                      : "1px solid rgba(255,255,255,0.1)",
                                }}
                              >
                                {CatIc && (
                                  <CatIc
                                    size={12}
                                    color={
                                      wordbookCategory === cat.key
                                        ? "white"
                                        : isLight
                                        ? "rgba(20,10,60,0.75)"
                                        : "rgba(255,255,255,0.75)"
                                    }
                                  />
                                )}
                                {cat.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: "auto",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {wordbookTab === "stage" &&
                      wordbookStage === null &&
                      (() => {
                        const catVocab = ALL_VOCAB.filter(
                          (v) => (v.category || "英単語") === wordbookCategory
                        );
                        const catStages = [
                          ...new Set(catVocab.map((v) => v.stage)),
                        ].sort((a, b) => a - b);
                        return (
                          <div className="grid grid-cols-4 gap-3 pb-4">
                            {catStages.map((s) => {
                              const words = catVocab.filter(
                                (v) => v.stage === s
                              );
                              const reviewedCount = words.filter((w) =>
                                reviewEnSet.has(w.en)
                              ).length;
                              const isUnlocked =
                                s <= (profile?.unlockedStage || 1);
                              const catColor =
                                WORD_CATEGORIES.find(
                                  (c) => c.key === wordbookCategory
                                )?.color || "#0891b2";
                              return (
                                <button
                                  key={s}
                                  onClick={() => setWordbookStage(s)}
                                  className="rounded-2xl p-3 flex flex-col items-center gap-1 transition-all active:scale-95"
                                  style={{
                                    background: isUnlocked
                                      ? isLight
                                        ? "rgba(0,0,0,0.05)"
                                        : "rgba(255,255,255,0.08)"
                                      : isLight
                                      ? "rgba(0,0,0,0.02)"
                                      : "rgba(255,255,255,0.03)",
                                    border: isUnlocked
                                      ? `1px solid ${catColor}55`
                                      : isLight
                                      ? "1px solid rgba(0,0,0,0.1)"
                                      : "1px solid rgba(255,255,255,0.08)",
                                    opacity: isUnlocked ? 1 : 0.5,
                                  }}
                                >
                                  <span
                                    className="text-xs font-black"
                                    style={{
                                      color: isUnlocked
                                        ? catColor
                                        : isLight
                                        ? "rgba(0,0,0,0.25)"
                                        : "rgba(255,255,255,0.3)",
                                    }}
                                  >
                                    Stage
                                  </span>
                                  <span
                                    className="text-2xl font-black"
                                    style={{
                                      color: isUnlocked
                                        ? theme.text
                                        : isLight
                                        ? "rgba(0,0,0,0.25)"
                                        : "rgba(255,255,255,0.3)",
                                    }}
                                  >
                                    {s}
                                  </span>
                                  <span
                                    className="text-[10px] font-bold"
                                    style={{
                                      color:
                                        reviewedCount > 0
                                          ? "#16a34a"
                                          : isLight
                                          ? "rgba(0,0,0,0.4)"
                                          : "rgba(255,255,255,0.3)",
                                    }}
                                  >
                                    {reviewedCount > 0
                                      ? `✓ ${reviewedCount}`
                                      : `${words.length}語`}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}

                    {wordbookTab === "stage" &&
                      wordbookStage !== null &&
                      (() => {
                        const catVocab = ALL_VOCAB.filter(
                          (v) =>
                            (v.category || "英単語") === wordbookCategory &&
                            v.stage === wordbookStage
                        );
                        return (
                          <div className="space-y-2 pb-4">
                            {catVocab.length === 0 ? (
                              <p
                                className="text-center font-bold py-10"
                                style={{
                                  color: isLight
                                    ? "rgba(0,0,0,0.3)"
                                    : "rgba(255,255,255,0.3)",
                                }}
                              >
                                このステージに単語がありません
                              </p>
                            ) : (
                              catVocab.map((word, idx) => {
                                const inReview = reviewEnSet.has(word.en);
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                                    style={{
                                      background: inReview
                                        ? "rgba(74,222,128,0.08)"
                                        : isLight
                                        ? "rgba(0,0,0,0.04)"
                                        : "rgba(255,255,255,0.05)",
                                      border: inReview
                                        ? "1px solid rgba(74,222,128,0.3)"
                                        : isLight
                                        ? "1px solid rgba(0,0,0,0.1)"
                                        : "1px solid rgba(255,255,255,0.08)",
                                    }}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className="text-lg font-black"
                                        style={{ color: theme.text }}
                                      >
                                        {word.en}
                                      </p>
                                      <p
                                        className="text-sm font-bold"
                                        style={{
                                          color: isLight
                                            ? "#6d28d9"
                                            : "rgba(165,180,252,0.85)",
                                        }}
                                      >
                                        {word.ja}
                                      </p>
                                      {word.sentence && (
                                        <p
                                          className="text-xs mt-0.5 italic"
                                          style={{
                                            color: isLight
                                              ? "rgba(0,0,0,0.45)"
                                              : "rgba(255,255,255,0.28)",
                                          }}
                                        >
                                          {word.sentence}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => toggleReview(word)}
                                      className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                                      style={{
                                        background: inReview
                                          ? "rgba(74,222,128,0.2)"
                                          : isLight
                                          ? "rgba(0,0,0,0.06)"
                                          : "rgba(255,255,255,0.06)",
                                        border: inReview
                                          ? "2px solid #4ade80"
                                          : isLight
                                          ? "2px solid rgba(0,0,0,0.2)"
                                          : "2px solid rgba(255,255,255,0.15)",
                                        color: inReview
                                          ? "#16a34a"
                                          : isLight
                                          ? "rgba(0,0,0,0.4)"
                                          : "rgba(255,255,255,0.3)",
                                      }}
                                    >
                                      {inReview ? (
                                        <CheckCircle2 size={18} />
                                      ) : (
                                        <Plus size={18} />
                                      )}
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        );
                      })()}

                    {wordbookTab === "custom" && (
                      <div className="space-y-2 pb-4">
                        {myCustomWords.length === 0 ? (
                          <div
                            className="p-8 rounded-2xl text-center"
                            style={{
                              background: isLight
                                ? "rgba(0,0,0,0.04)"
                                : "rgba(255,255,255,0.04)",
                              border: isLight
                                ? "1px solid rgba(0,0,0,0.1)"
                                : "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <p
                              className="font-bold"
                              style={{
                                color: isLight
                                  ? "rgba(0,0,0,0.35)"
                                  : "rgba(255,255,255,0.3)",
                              }}
                            >
                              配布されたカスタム問題はありません
                            </p>
                          </div>
                        ) : (
                          myCustomWords.map((word) => {
                            const inReview = reviewEnSet.has(word.en);
                            const seen = Array.isArray(word.seenBy)
                              ? word.seenBy.includes(myUid)
                              : false;
                            const catColor =
                              WORD_CATEGORIES.find(
                                (c) => c.key === (word.category || "英単語")
                              )?.color || "#0891b2";
                            return (
                              <div
                                key={word.id}
                                className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                                style={{
                                  background: inReview
                                    ? "rgba(74,222,128,0.08)"
                                    : isLight
                                    ? "rgba(0,0,0,0.04)"
                                    : "rgba(255,255,255,0.05)",
                                  border: inReview
                                    ? "1px solid rgba(74,222,128,0.3)"
                                    : isLight
                                    ? "1px solid rgba(0,0,0,0.1)"
                                    : "1px solid rgba(255,255,255,0.08)",
                                }}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                    <p
                                      className="text-lg font-black"
                                      style={{ color: theme.text }}
                                    >
                                      {word.en}
                                    </p>
                                    {word.category && (
                                      <span
                                        className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                                        style={{
                                          background: `${catColor}22`,
                                          color: catColor,
                                          border: `1px solid ${catColor}44`,
                                        }}
                                      >
                                        {word.category}
                                      </span>
                                    )}
                                    {seen && (
                                      <span
                                        className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                                        style={{
                                          background: "rgba(244,63,94,0.15)",
                                          color: "#fb7185",
                                        }}
                                      >
                                        挑戦済
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className="text-sm font-bold"
                                    style={{
                                      color: isLight
                                        ? "#6d28d9"
                                        : "rgba(165,180,252,0.85)",
                                    }}
                                  >
                                    {word.ja}
                                  </p>
                                  {word.sentence && (
                                    <p
                                      className="text-xs mt-0.5 italic"
                                      style={{
                                        color: isLight
                                          ? "rgba(0,0,0,0.45)"
                                          : "rgba(255,255,255,0.28)",
                                      }}
                                    >
                                      {word.sentence}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => toggleReview(word)}
                                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                                  style={{
                                    background: inReview
                                      ? "rgba(74,222,128,0.2)"
                                      : isLight
                                      ? "rgba(0,0,0,0.06)"
                                      : "rgba(255,255,255,0.06)",
                                    border: inReview
                                      ? "2px solid #4ade80"
                                      : isLight
                                      ? "2px solid rgba(0,0,0,0.2)"
                                      : "2px solid rgba(255,255,255,0.15)",
                                    color: inReview
                                      ? "#16a34a"
                                      : isLight
                                      ? "rgba(0,0,0,0.4)"
                                      : "rgba(255,255,255,0.3)",
                                  }}
                                >
                                  {inReview ? (
                                    <CheckCircle2 size={18} />
                                  ) : (
                                    <Plus size={18} />
                                  )}
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                    {wordbookTab === "myword" && (
                      <div className="space-y-2 pb-4">
                        {userVocabList.length === 0 ? (
                          <div
                            className="p-8 rounded-2xl text-center"
                            style={{
                              background: isLight
                                ? "rgba(0,0,0,0.04)"
                                : "rgba(255,255,255,0.04)",
                              border: isLight
                                ? "1px solid rgba(0,0,0,0.1)"
                                : "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <p
                              className="font-bold"
                              style={{
                                color: isLight
                                  ? "rgba(0,0,0,0.35)"
                                  : "rgba(255,255,255,0.3)",
                              }}
                            >
                              まだマイワードがありません
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{
                                color: isLight
                                  ? "rgba(0,0,0,0.25)"
                                  : "rgba(255,255,255,0.2)",
                              }}
                            >
                              FACTORYで単語を作ってみよう！
                            </p>
                          </div>
                        ) : (
                          userVocabList.map((word) => {
                            const inReview = reviewList.some(
                              (r) => r.en === word.en
                            );
                            return (
                              <div
                                key={word.id}
                                className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                                style={{
                                  background: inReview
                                    ? "rgba(249,115,22,0.08)"
                                    : isLight
                                    ? "rgba(0,0,0,0.04)"
                                    : "rgba(255,255,255,0.05)",
                                  border: inReview
                                    ? "1px solid rgba(249,115,22,0.3)"
                                    : isLight
                                    ? "1px solid rgba(0,0,0,0.1)"
                                    : "1px solid rgba(255,255,255,0.08)",
                                }}
                              >
                                <div className="flex-1 min-w-0">
                                  <p
                                    className="text-lg font-black"
                                    style={{ color: theme.text }}
                                  >
                                    {word.en}
                                  </p>
                                  <p
                                    className="text-sm font-bold mt-0.5"
                                    style={{
                                      color: isLight
                                        ? "rgba(0,0,0,0.5)"
                                        : "rgba(255,255,255,0.5)",
                                    }}
                                  >
                                    {word.ja}
                                  </p>
                                  {word.sentence && (
                                    <p
                                      className="text-xs mt-1 italic"
                                      style={{
                                        color: isLight
                                          ? "rgba(0,0,0,0.4)"
                                          : "rgba(255,255,255,0.35)",
                                      }}
                                    >
                                      {word.sentence}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button
                                    onClick={async () => {
                                      if (user && fb.enabled) {
                                        try {
                                          await deleteDoc(
                                            doc(
                                              fb.db,
                                              "artifacts",
                                              fb.appId,
                                              "users",
                                              user.uid,
                                              "userVocab",
                                              word.id
                                            )
                                          );
                                        } catch {}
                                      } else {
                                        setUserVocabList((prev) =>
                                          prev.filter((w) => w.id !== word.id)
                                        );
                                      }
                                      showToast("削除しました");
                                    }}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{
                                      background: "rgba(244,63,94,0.12)",
                                      color: "#fb7185",
                                      border: "1px solid rgba(244,63,94,0.25)",
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (inReview) {
                                        const target = reviewList.find(
                                          (r) => r.en === word.en
                                        );
                                        if (target && user && fb.enabled) {
                                          try {
                                            await deleteDoc(
                                              doc(
                                                fb.db,
                                                "artifacts",
                                                fb.appId,
                                                "users",
                                                user.uid,
                                                "review",
                                                target.id
                                              )
                                            );
                                          } catch {}
                                        } else {
                                          setReviewList((prev) =>
                                            prev.filter((r) => r.en !== word.en)
                                          );
                                        }
                                        showToast("復習リストから削除しました");
                                      } else {
                                        const { id: _id, ...wordData } = word;
                                        if (user && fb.enabled) {
                                          await addDoc(
                                            collection(
                                              fb.db,
                                              "artifacts",
                                              fb.appId,
                                              "users",
                                              user.uid,
                                              "review"
                                            ),
                                            wordData
                                          );
                                        } else {
                                          setReviewList((prev) => [
                                            ...prev,
                                            {
                                              ...wordData,
                                              id: Date.now().toString(),
                                            },
                                          ]);
                                        }
                                        showToast("復習リストに追加しました！");
                                      }
                                    }}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                                    style={{
                                      background: inReview
                                        ? "rgba(74,222,128,0.2)"
                                        : isLight
                                        ? "rgba(0,0,0,0.06)"
                                        : "rgba(255,255,255,0.06)",
                                      border: inReview
                                        ? "2px solid #4ade80"
                                        : isLight
                                        ? "2px solid rgba(0,0,0,0.2)"
                                        : "2px solid rgba(255,255,255,0.15)",
                                      color: inReview
                                        ? "#16a34a"
                                        : isLight
                                        ? "rgba(0,0,0,0.4)"
                                        : "rgba(255,255,255,0.3)",
                                    }}
                                  >
                                    {inReview ? (
                                      <CheckCircle2 size={18} />
                                    ) : (
                                      <Plus size={18} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          {/* --- カスタム画面 --- */}
          {screen === "customApp" && (
            <div className="space-y-6 animate-in fade-in text-left pb-10">
              <div className="flex items-center gap-4 text-left">
                <button
                  onClick={() => setScreen("start")}
                  className="p-2 rounded-xl active:opacity-70 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <ChevronLeft />
                </button>
                <h2 className="text-3xl font-black text-white">カスタム問題</h2>
              </div>

              {profile?.isTeacher ? (
                <div className="space-y-6">
                  <div
                    className="rounded-2xl p-6 space-y-4"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <h3 className="font-black text-xl flex items-center gap-2 text-rose-400">
                      <Plus size={24} /> 問題を作成して配布
                    </h3>
                    <div className="space-y-3">
                      {/* カテゴリ選択 */}
                      <div className="flex gap-1.5 flex-wrap">
                        {WORD_CATEGORIES.map((cat) => {
                          const CatIc = CATEGORY_ICONS[cat.key];
                          return (
                            <button
                              key={cat.key}
                              type="button"
                              onClick={() =>
                                setNewCustomWord({
                                  ...newCustomWord,
                                  category: cat.key,
                                })
                              }
                              className="px-3 py-1.5 rounded-full font-black text-xs transition-all flex items-center gap-1"
                              style={{
                                background:
                                  (newCustomWord.category || "英単語") ===
                                  cat.key
                                    ? cat.color
                                    : "rgba(255,255,255,0.07)",
                                color: "white",
                                border:
                                  (newCustomWord.category || "英単語") ===
                                  cat.key
                                    ? "none"
                                    : "1px solid rgba(255,255,255,0.12)",
                              }}
                            >
                              {CatIc && <CatIc size={12} color="white" />}
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        placeholder="問題（単語・熟語・漢字・化学用語など）"
                        value={newCustomWord.en}
                        onChange={(e) =>
                          setNewCustomWord({
                            ...newCustomWord,
                            en: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-xl font-bold text-sm outline-none text-white"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      />
                      <input
                        type="text"
                        placeholder="答え・読み・意味"
                        value={newCustomWord.ja}
                        onChange={(e) =>
                          setNewCustomWord({
                            ...newCustomWord,
                            ja: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-xl font-bold text-sm outline-none text-white"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      />
                      <textarea
                        placeholder="例文・例題・補足説明..."
                        value={newCustomWord.sentence}
                        onChange={(e) =>
                          setNewCustomWord({
                            ...newCustomWord,
                            sentence: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-xl font-bold text-sm min-h-[70px] outline-none text-white"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          resize: "none",
                        }}
                      />
                      {/* 配布先選択 */}
                      <div
                        className="rounded-xl p-3 space-y-2"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <p className="text-xs font-black text-white/60 mb-2">
                          配布先
                        </p>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="assignTarget"
                            checked={customAssignTarget === "all"}
                            onChange={() => setCustomAssignTarget("all")}
                            className="accent-rose-500"
                          />
                          <span className="text-white font-bold text-sm">
                            全員に配布
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="assignTarget"
                            checked={customAssignTarget !== "all"}
                            onChange={() => setCustomAssignTarget([])}
                            className="accent-rose-500"
                          />
                          <span className="text-white font-bold text-sm">
                            特定の生徒に配布
                          </span>
                        </label>
                        {customAssignTarget !== "all" && (
                          <div className="mt-2 space-y-1 max-h-[20vh] overflow-y-auto pl-2">
                            {leaderboard.length === 0 ? (
                              <p className="text-white/40 text-xs font-bold">
                                生徒がいません
                              </p>
                            ) : (
                              leaderboard.map((s) => {
                                const isSelected =
                                  Array.isArray(customAssignTarget) &&
                                  customAssignTarget.includes(s.id);
                                return (
                                  <label
                                    key={s.id}
                                    className="flex items-center gap-2 cursor-pointer py-1"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {
                                        if (isSelected) {
                                          setCustomAssignTarget(
                                            customAssignTarget.filter(
                                              (id) => id !== s.id
                                            )
                                          );
                                        } else {
                                          setCustomAssignTarget([
                                            ...(Array.isArray(
                                              customAssignTarget
                                            )
                                              ? customAssignTarget
                                              : []),
                                            s.id,
                                          ]);
                                        }
                                      }}
                                      className="accent-rose-500"
                                    />
                                    <span className="text-white font-bold text-sm">
                                      {s.name}
                                    </span>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={addCustomWordToDB}
                        disabled={
                          isAdding ||
                          (customAssignTarget !== "all" &&
                            Array.isArray(customAssignTarget) &&
                            customAssignTarget.length === 0)
                        }
                        className="w-full py-3.5 text-white rounded-xl font-black text-base active:opacity-80 transition-all disabled:opacity-40"
                        style={{
                          background: "linear-gradient(135deg,#f43f5e,#e11d48)",
                        }}
                      >
                        {isAdding
                          ? "保存中..."
                          : customAssignTarget === "all"
                          ? "保存して全員に配布"
                          : `保存して${
                              Array.isArray(customAssignTarget)
                                ? customAssignTarget.length
                                : 0
                            }人に配布`}
                      </button>
                    </div>
                  </div>

                  <div
                    className="rounded-2xl p-6 space-y-4"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <h3 className="font-black text-xl flex items-center gap-2 text-white">
                      <Layers size={24} className="text-amber-400" />{" "}
                      配布中の問題 ({customVocabList.length}問)
                    </h3>
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                      {customVocabList.length === 0 ? (
                        <p className="text-white/40 text-sm font-bold text-center py-4">
                          まだ問題がありません
                        </p>
                      ) : (
                        customVocabList.map((w) => (
                          <div
                            key={w.id}
                            className="flex items-center justify-between p-3 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <p className="font-black text-white text-base leading-none">
                                  {w.en}
                                </p>
                                {w.category &&
                                  (() => {
                                    const cat = WORD_CATEGORIES.find(
                                      (c) => c.key === w.category
                                    );
                                    return cat ? (
                                      <span
                                        className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                                        style={{
                                          background: `${cat.color}22`,
                                          color: cat.color,
                                          border: `1px solid ${cat.color}44`,
                                        }}
                                      >
                                        {cat.label}
                                      </span>
                                    ) : null;
                                  })()}
                              </div>
                              <p className="text-xs font-bold text-white/60">
                                {w.ja}
                              </p>
                              <p
                                className="text-xs font-bold mt-1"
                                style={{ color: "rgba(255,255,255,0.35)" }}
                              >
                                {w.assignedTo === "all" ||
                                w.assignedTo === undefined
                                  ? "全員"
                                  : Array.isArray(w.assignedTo)
                                  ? `${w.assignedTo.length}人`
                                  : "全員"}
                                {" · "}挑戦済み{" "}
                                {Array.isArray(w.seenBy) ? w.seenBy.length : 0}
                                人
                              </p>
                            </div>
                            <button
                              onClick={() => deleteCustomWord(w.id)}
                              className="p-3 text-rose-400 hover:bg-rose-400/20 rounded-lg transition-all"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* 生徒側: 新しい問題・過去の問題タブ */
                <div className="space-y-4">
                  {/* タブ */}
                  <div className="flex gap-2">
                    {[
                      {
                        key: "new",
                        label: "新しい問題",
                        icon: <Sparkles size={13} />,
                      },
                      {
                        key: "past",
                        label: "過去の問題",
                        icon: <BookCheck size={13} />,
                      },
                    ].map((t) => {
                      const myUid = user?.uid || "";
                      const count = customVocabList.filter((w) => {
                        const at = w.assignedTo;
                        const isAssigned =
                          at === "all" ||
                          at === undefined ||
                          (Array.isArray(at) && at.includes(myUid));
                        if (!isAssigned) return false;
                        const seen = Array.isArray(w.seenBy)
                          ? w.seenBy.includes(myUid)
                          : false;
                        return t.key === "new" ? !seen : seen;
                      }).length;
                      return (
                        <button
                          key={t.key}
                          onClick={() => setCustomTab(t.key)}
                          className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-1.5"
                          style={{
                            background:
                              customTab === t.key
                                ? "linear-gradient(135deg,#f43f5e,#e11d48)"
                                : isLight
                                ? "rgba(0,0,0,0.06)"
                                : "rgba(255,255,255,0.06)",
                            color:
                              customTab === t.key
                                ? "white"
                                : isLight
                                ? "rgba(20,10,60,0.75)"
                                : "rgba(255,255,255,0.75)",
                            border:
                              customTab === t.key
                                ? "none"
                                : isLight
                                ? "1px solid rgba(0,0,0,0.15)"
                                : "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {t.icon}
                          {t.label}{" "}
                          <span
                            className="ml-1 text-xs"
                            style={{ opacity: 0.75 }}
                          >
                            ({count})
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* タブ内容 */}
                  {(() => {
                    const myUid = user?.uid || "";
                    const tabWords = customVocabList.filter((w) => {
                      const at = w.assignedTo;
                      const isAssigned =
                        at === "all" ||
                        at === undefined ||
                        (Array.isArray(at) && at.includes(myUid));
                      if (!isAssigned) return false;
                      const seen = Array.isArray(w.seenBy)
                        ? w.seenBy.includes(myUid)
                        : false;
                      return customTab === "new" ? !seen : seen;
                    });

                    if (tabWords.length === 0) {
                      return (
                        <div
                          className="rounded-[2.5rem] p-8 text-center"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <p className="text-white/40 font-black text-base">
                            {customTab === "new"
                              ? "新しい問題はまだありません"
                              : "過去に挑戦した問題はありません"}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div
                        className="rounded-[2.5rem] p-8 text-center"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <div className="w-24 h-24 bg-rose-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-rose-500/30">
                          {customTab === "new" ? (
                            <IcGift size={48} color="rgba(255,255,255,0.95)" />
                          ) : (
                            <BookCheck
                              size={48}
                              style={{ color: "rgba(255,255,255,0.95)" }}
                            />
                          )}
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">
                          {customTab === "new"
                            ? "先生のオリジナル問題"
                            : "復習モード"}
                        </h3>
                        <p className="text-white/60 font-bold text-sm mb-8">
                          {customTab === "new" ? (
                            <>{tabWords.length}問が配布されています！</>
                          ) : (
                            <>
                              過去に挑戦した
                              <span className="text-amber-400 text-lg mx-1">
                                {tabWords.length}
                              </span>
                              問を復習できます
                            </>
                          )}
                        </p>
                        <button
                          onClick={() => startCustomGame("meaning", customTab)}
                          className="w-full py-4 text-white rounded-2xl font-black text-lg active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                          style={{
                            background:
                              "linear-gradient(135deg,#f43f5e,#e11d48)",
                          }}
                        >
                          <Zap size={20} /> 単語モードで挑戦
                        </button>
                        <button
                          onClick={() => startCustomGame("sentence", customTab)}
                          disabled={!tabWords.some((w) => w.sentence)}
                          className="w-full py-4 text-white rounded-2xl font-black text-lg active:scale-95 transition-all shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-40"
                          style={{
                            background:
                              "linear-gradient(135deg,#10b981,#059669)",
                          }}
                        >
                          <BookOpen size={20} /> 例文モードで挑戦
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </main>

        {![
          "loading",
          "register",
          "play",
          "result",
          "dm",
          "login",
          "typingGame",
          "customApp",
          "noteApp",
          "wordbook",
          "factoryApp",
          "settingsApp",
        ].includes(screen) && <Nav />}
        {/* クレジット: 目立たない場所に */}
        {!["login", "register", "loading"].includes(screen) && (
          <div
            style={{
              textAlign: "center",
              padding: "2px 0 4px",
              pointerEvents: "auto",
              userSelect: "none",
            }}
            onContextMenu={(e) => {
              e.preventDefault();
            }}
            onTouchStart={() => {
              // ✅ Fix 1: 連打対策 - 既存タイマーを必ずクリアしてから新規セット
              clearTimeout(pressTimerRef.current);
              clearTimeout(revertTimerRef.current);
              pressTimerRef.current = setTimeout(() => {
                setCreditState({
                  text: "designed & built by 三輪 © 2024",
                  color: "rgba(255,255,255,0.55)",
                });
                revertTimerRef.current = setTimeout(() => {
                  setCreditState({
                    text: "by miwa",
                    color: "rgba(255,255,255,0.08)",
                  });
                }, 3000);
              }, 800);
            }}
            onTouchMove={() => {
              // ✅ Fix 3: スワイプ中も長押しキャンセル
              clearTimeout(pressTimerRef.current);
            }}
            onTouchEnd={() => {
              clearTimeout(pressTimerRef.current);
            }}
            onTouchCancel={() => {
              clearTimeout(pressTimerRef.current);
            }}
            onMouseDown={() => {
              // ✅ Fix 4: PCマウス長押し対応
              clearTimeout(pressTimerRef.current);
              clearTimeout(revertTimerRef.current);
              pressTimerRef.current = setTimeout(() => {
                setCreditState({
                  text: "designed & built by 三輪 © 2024",
                  color: "rgba(255,255,255,0.55)",
                });
                revertTimerRef.current = setTimeout(() => {
                  setCreditState({
                    text: "by miwa",
                    color: "rgba(255,255,255,0.08)",
                  });
                }, 3000);
              }, 800);
            }}
            onMouseUp={() => {
              clearTimeout(pressTimerRef.current);
            }}
            onMouseLeave={() => {
              clearTimeout(pressTimerRef.current);
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: creditState.color, // ✅ stateの値をバインド
                fontWeight: 600,
                letterSpacing: "0.12em",
                transition: "color 0.4s",
              }}
            >
              {creditState.text} {/* ✅ stateの値を表示 */}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
