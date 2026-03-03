/* eslint-disable */
// @ts-nocheck
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
  increment,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "./firebase";

// ✅ 【重要】大量にある「fb.db」や「fb.auth」をそのまま動かすための魔法の1行
const fb = { db, auth };

// ── Imports from split files ──
import {
  owlDataUri,
  calculateNewStreak,
  Ic,
  Trophy,
  Star,
  Play,
  RotateCcw,
  Zap,
  Settings,
  User,
  Plus,
  Trash2,
  Home,
  CheckCircle2,
  BookOpen,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MessageSquare,
  Send,
  Layers,
  Lock,
  Loader2,
  FileUp,
  Heart,
  BookCheck,
  Megaphone,
  Sparkles,
  Award,
  MapIcon,
  Flag,
  Volume2,
  Flame,
  UserPlus,
  Users,
  Search,
  Copy,
  Check,
  Clock,
  Target,
  IcBgNight,
  IcBgForest,
  IcBgOcean,
  IcBgSunset,
  IcBgCandy,
  IcBgSnow,
  IcSparkle,
  IcDiamond,
  IcCircle,
  IcMap,
  IcMegaphone,
  IcBook,
  IcShop,
  IcPet,
  IcGift,
  IcAdmin,
  IcFood,
  IcPaw,
  IcCoin,
  IcHat,
  IcCrown2,
  IcBow,
  IcGlasses,
  IcStar2,
  IcRainbow,
  IcCat,
  IcDog,
  IcRabbit,
  IcFox,
  IcPanda,
  IcDragon,
  IcUnicorn,
  IcBearcat,
  IcPenguin,
  IcHamster,
  PET_LV_NEEDS,
  getPetLvFromAffection,
  getPetLvProgress,
  HatOverlay,
  IcAvCatHat,
  IcAvDogHat,
  IcAvRabbitHat,
  IcAvFoxHat,
  IcAvPandaHat,
  IcAvDragonHat,
  IcAvUnicornHat,
  IcAvBearcatHat,
  IcAvPenguinHat,
  IcAvHamsterHat,
  PET_HAT_AVATARS,
  PET_ICONS,
  ACC_ICONS,
  IcAchFirst,
  IcAchBolt,
  IcAchWave,
  IcAchTrophy,
  IcAchGem,
  IcAchCrown,
  IcAchPerfect,
  IcAchFire,
  IcAchVolcano,
  IcAchStar,
  IcAchBook,
  IcAchBooks,
  IcAchGrad,
  IcAchBrain,
  IcAchFleur,
  IcAchSentence,
  IcAchScoreSilver,
  IcAchScoreGold,
  IcAchGame,
  IcAchJoystick,
  IcAchMuscle,
  IcAchMedal,
  IcAchBadge,
  IcAchPencil,
  IcAchChart,
  IcAchRocket,
  IcAchGalaxy,
  IcAchPaw,
  IcAchCat,
  IcAchUnicorn,
  IcAchCoin,
  IcAvRabbit,
  IcAvBear,
  IcAvFox,
  IcAvPenguin,
  IcAvOwl,
  IcAvCat,
  IcAvHamster,
  IcAvGorilla,
  IcAvSmile,
  IcAvRocket,
  IcAvStar,
  IcAvFire,
  IcAvCrown,
  IcAvGhost,
  IcAvRobot,
  IcAvTeacher,
  IcDefaultUser,
  IcCamera,
  IcKey,
  IcRefresh,
  IcSpeech,
  IcEye,
  IcTrashSm,
  IcCrownSm,
  IcArrowDown,
  IcAlert,
  IcCheckSm,
  IcMedalSm,
  ACHIEVEMENT_ICONS,
  AVATAR_ICONS,
  AVATARS,
  TEACHER_EXCLUSIVE_AVATARS,
  EmojiIcon,
} from "./icons";
import {
  getFirebaseInstance,
  calcExpForLevel,
  calcExpProgress,
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
} from "./constants";
import {
  DEFAULT_VOCAB,
  DEFAULT_VOCAB_IDIOM,
  DEFAULT_VOCAB_KANJI,
  DEFAULT_VOCAB_CHEM,
  DEFAULT_VOCAB_KOBUN,
} from "./vocab";
import {
  ALL_VOCAB,
  calcLevel,
  AvatarDisplay,
  AnnouncementCard,
  compressImage,
  generateShortId,
  PetCareCard,
  DeepFocusScroller,
  SwipeEntryScreen,
  TypingGameScreen,
  PetChatScreen,
  StudyDiaryScreen,
} from "./components";

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState("loading");
  const [prevScreen, setPrevScreen] = useState("start");
  // 起動時の safe-area-inset 未確定によるレイアウトずれ防止: 1フレーム後にNavを表示
  const [navReady, setNavReady] = useState(true);
  const [clockTime, setClockTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  });
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClockTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}`
      );
    };
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);
  const navigateTo = (s) => {
    setPrevScreen(screen);
    setScreen(s);
  };
  const [history, setHistory] = useState([]);
  const [vocabList, setVocabList] = useState(DEFAULT_VOCAB);
  const [announcements, setAnnouncements] = useState([]);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>(
    () => {
      try {
        return JSON.parse(
          localStorage.getItem("genron_readAnnouncements") || "[]"
        );
      } catch {
        return [];
      }
    }
  );
  const [friends, setFriends] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  // 全ユーザー名前マップ（生徒+先生）- 称え場・ランキングの名前解決用
  const [allUsersMap, setAllUsersMap] = useState<
    Record<
      string,
      { name: string; avatar: string; color: string; isTeacher: boolean }
    >
  >({});
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
  const [quizDirection, setQuizDirection] = useState("en-ja"); // "en-ja": 英→日, "ja-en": 日→英
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
  const [resultEarnedPoints, setResultEarnedPoints] = useState(0);
  const [resultEarnedCoins, setResultEarnedCoins] = useState(0);
  const [resultCorrectCount, setResultCorrectCount] = useState(0);
  const [achvNotif, setAchvNotif] = useState(null); // { icon, title, rank }
  const achvNotifTimer = React.useRef(null);
  const chatEndRef = React.useRef(null);
  const dmEndRef = React.useRef(null);
  const mainRef = React.useRef<HTMLElement>(null);

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
      return JSON.parse(localStorage.getItem("genron_theme")) || "simple";
    } catch {
      return "dark";
    }
  });
  const [debugUnlockAll, setDebugUnlockAll] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("genron_debugUnlock")) || false;
    } catch {
      return false;
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
  const [customSubMode, setCustomSubMode] = useState(null); // null | "questions" | "apps"
  const [sharedApps, setSharedApps] = useState([]);
  const [newSharedApp, setNewSharedApp] = useState({
    name: "",
    url: "",
    description: "",
  });
  // 学習日誌
  const [studyDiaryWeekOffset, setStudyDiaryWeekOffset] = useState(0);
  const [studyDiaryData, setStudyDiaryData] = useState({});
  const [studyDiaryViewUid, setStudyDiaryViewUid] = useState(null);
  const [studyDiaryStudents, setStudyDiaryStudents] = useState([]);
  const [reviewQuizIdx, setReviewQuizIdx] = useState(0);
  const [reviewQuizOptions, setReviewQuizOptions] = useState([]);
  const [reviewQuizFeedback, setReviewQuizFeedback] = useState(null); // null | "correct" | "wrong"
  const [reviewQuizLoading, setReviewQuizLoading] = useState(false);
  const [reviewSentenceRevealed, setReviewSentenceRevealed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anthropicApiKey, setAnthropicApiKey] = useState(
    () => localStorage.getItem("genron_anthropicApiKey") || ""
  );
  const prevVocabCountRef = useRef(null);
  const deletingReviewIds = useRef(new Set());
  const pressTimerRef = useRef(null); // ✅ クレジット長押し用タイマー管理
  const revertTimerRef = useRef(null); // ✅ クレジット復元タイマー管理
  const [creditState, setCreditState] = useState({
    text: "✦ ORITAN",
    color: "rgba(201,168,76,0.18)",
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

    // Safari PWA: safe-area-inset の確定は swipeEntry のスワイプ完了時に行う
    // onComplete={() => { setNavReady(true); setScreen("start"); }} で処理

    // Safe Areaは純粋なCSSのenv()のみで制御（JS計算不要・PWAでも確実動作）

    // 縦画面に固定（横画面防止・スマホのみ）
    try {
      const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
      );
      if (isMobileDevice && screen?.orientation?.lock) {
        screen.orientation.lock("portrait").catch(() => {});
      }
    } catch (_) {}

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
                  // キャッシュ戦略: 1時間以内の同期ならFirestore読み取りをスキップ
                  const lastSync = Number(loadLocal("lastSyncTime") || 0);
                  const cacheValid =
                    localProfile && Date.now() - lastSync < 3600000;
                  let fbProfile = null;
                  if (!cacheValid) {
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
                    if (snap.exists()) {
                      fbProfile = snap.data();
                      saveLocal("lastSyncTime", Date.now());
                    }
                  }
                  // ✅ await後に再度マウント確認
                  if (!isMounted) return;
                  if (fbProfile) {
                    setProfile(fbProfile);
                    saveLocal("profile", fbProfile);
                    if (fbProfile.isTeacher) setIsAdmin(true);

                    // Streak更新チェック
                    const streakData = calculateNewStreak(fbProfile);
                    if (
                      streakData.lastStreakUpdate !== fbProfile.lastStreakUpdate
                    ) {
                      const updated = { ...fbProfile, ...streakData };
                      setProfile(updated);
                      saveLocal("profile", updated);
                      // Firestoreも更新
                      setDoc(
                        doc(
                          fb.db,
                          "artifacts",
                          fb.appId,
                          "users",
                          effectiveUid,
                          "profile",
                          "main"
                        ),
                        {
                          streakCount: streakData.streakCount,
                          lastStreakUpdate: streakData.lastStreakUpdate,
                        },
                        { merge: true }
                      ).catch(() => null);
                      if (!updated.isTeacher) {
                        setDoc(
                          doc(
                            fb.db,
                            "artifacts",
                            fb.appId,
                            "public",
                            "data",
                            "leaderboard",
                            effectiveUid
                          ),
                          { streakCount: streakData.streakCount },
                          { merge: true }
                        ).catch(() => null);
                      }
                    }

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
                    } catch (e: any) {}
                    if (isMounted) setScreen("swipeEntry");
                    return;
                  }
                } catch (e: any) {}
              }
              if (isMounted) setScreen(localProfile ? "swipeEntry" : "login");
            }
          );
          // ✅ fallbackTimerをrefに保持してクリーンアップ可能にする
          fallbackTimer = setTimeout(() => {
            setScreen((prev) => {
              if (prev === "loading")
                return localProfile ? "swipeEntry" : "login";
              return prev;
            });
          }, 3000);
        } catch (e: any) {
          if (isMounted) setScreen(localProfile ? "swipeEntry" : "login");
        }
      } else {
        setScreen(localProfile ? "swipeEntry" : "login");
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
  // 新規登録直後フラグ: syncProfile の誤検知防止
  const justRegisteredRef = React.useRef(false);

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
          // 登録直後はFirestoreへの書き込みが未反映の場合があるためスキップ
          if (!snap.metadata.fromCache && !justRegisteredRef.current)
            forceLogout(true);
          return;
        }
        const latest = snap.data();
        const current = profileRef.current;
        // 進行度・経験値・ペットポイントはFirestoreの方が高ければ更新
        // clearedStagesはカテゴリ別に統合（両方のデータをマージ）
        // latestのclearedStagesが正しいオブジェクト形式かバリデーション
        const rawLatestCleared = latest.clearedStages;
        const isValidCleared = (v) =>
          v &&
          typeof v === "object" &&
          !Array.isArray(v) &&
          Object.values(v).every((arr) => Array.isArray(arr));
        const latestCleared = isValidCleared(rawLatestCleared)
          ? rawLatestCleared
          : {};
        const mergedCleared = { ...latestCleared };
        const curCleared = current?.clearedStages || {};
        // curClearedも正しい形式のみ使用
        for (const cat of Object.keys(curCleared)) {
          if (!Array.isArray(curCleared[cat])) continue;
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
          unlockedStages: (() => {
            const cur = current?.unlockedStages || {};
            const lat = latest.unlockedStages || {};
            const merged2 = { ...cur };
            for (const k of Object.keys(lat)) {
              merged2[k] = Math.max(merged2[k] || 1, lat[k] || 1);
            }
            return merged2;
          })(),
          petPoints: Math.max(current?.petPoints || 0, latest.petPoints || 0),
          petAffection: Math.max(
            current?.petAffection || 0,
            latest.petAffection || 0
          ),
          streakCount: latest.streakCount || 0,
          lastStreakUpdate: latest.lastStreakUpdate || "",
          clearedStages: mergedCleared,
        };
        // 実際に差分がある場合のみ更新
        if (
          merged.totalExp !== current?.totalExp ||
          JSON.stringify(merged.unlockedStages) !==
            JSON.stringify(current?.unlockedStages) ||
          merged.petPoints !== current?.petPoints ||
          JSON.stringify(merged.clearedStages) !==
            JSON.stringify(current?.clearedStages)
        ) {
          setProfile(merged);
          saveLocal("profile", merged);
        }
      } catch (e: any) {}
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
        const sorted = Array.from(uniqueMap.values()).sort(
          (a, b) => b.score - a.score
        );
        setLeaderboard(sorted);
        // allUsersMapに生徒を反映
        setAllUsersMap((prev) => {
          const next = { ...prev };
          s.docs.forEach((d) => {
            const data = d.data();
            next[d.id] = {
              name: data.name || "",
              avatar: data.avatar || "",
              color: data.color || "",
              isTeacher: !!data.isTeacher,
            };
          });
          return next;
        });
      }
    );

    // 先生の名前変更も称え場・ランキングに反映するためteacherIndexを監視
    const unsubTI = onSnapshot(
      collection(
        fb.db,
        "artifacts",
        fb.appId,
        "public",
        "data",
        "teacherIndex"
      ),
      (s) => {
        // 先生リストをstateに保存（admin画面の先生管理用）
        setTeacherList(
          s.docs.map((d) => ({ id: d.id, uid: d.id, ...d.data() }))
        );
        // teacherIndexにnameがない先生はprofileから名前を補完
        s.docs.forEach(async (d) => {
          if (!d.data().name && fb.db) {
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
              if (pSnap.exists() && pSnap.data().name) {
                const pData = pSnap.data();
                await setDoc(
                  doc(
                    fb.db,
                    "artifacts",
                    fb.appId,
                    "public",
                    "data",
                    "teacherIndex",
                    d.id
                  ),
                  {
                    name: pData.name,
                    displayName: pData.displayName || pData.name,
                  },
                  { merge: true }
                ).catch(() => null);
              }
            } catch (e) {}
          }
        });
        setAllUsersMap((prev) => {
          const next = { ...prev };
          s.docs.forEach((d) => {
            const data = d.data();
            if (data.name) {
              next[d.id] = {
                name: data.name,
                avatar: data.avatar || "",
                color: data.color || "",
                isTeacher: true,
              };
            }
          });
          return next;
        });
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

    const unsubSA = onSnapshot(
      collection(fb.db, "artifacts", fb.appId, "public", "data", "sharedApps"),
      (s) => setSharedApps(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => {}
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
      unsubTI();
      unsubF();
      unsubR();
      unsubC();
      unsubCV();
      unsubSA();
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
    if (themeId === "light" || themeId === "simple") {
      const d = `[data-theme="${themeId}"]`;
      styleEl.textContent = `
        ${d} { color: ${t.text}; }
        ${d} .text-white,
        ${d} [class*="text-white"] { color: ${t.text} !important; }
        ${d} .text-white\/60,
        ${d} .text-white\/50,
        ${d} .text-white\/40,
        ${d} .text-white\/30,
        ${d} .text-white\/25,
        ${d} .text-white\/20 { color: ${t.textMuted} !important; }
        ${d} .text-slate-300,
        ${d} .text-slate-400 { color: ${t.textMuted} !important; }
        ${d} ::placeholder { color: ${t.textMuted} !important; }
        ${d} input,
        ${d} input[type="text"],
        ${d} input[type="password"],
        ${d} textarea { color: ${t.text} !important; }
        ${d} p, ${d} span, ${d} h1,
        ${d} h2, ${d} h3, ${d} h4,
        ${d} code, ${d} label { color: ${t.text}; }
        ${d} .bg-amber-500 { color: white !important; }
        ${d} .bg-amber-500 span,
        ${d} .bg-amber-500 p { color: white !important; }
        ${d} .text-amber-400 { color: #b45309 !important; }
        ${d} .text-amber-300 { color: #d97706 !important; }
        ${d} .text-amber-200 { color: #92620a !important; }
        ${d} .text-rose-400 { color: #be123c !important; }
        ${d} .text-emerald-400 { color: #047857 !important; }
        ${d} .text-indigo-400 { color: #4338ca !important; }
        ${d} .text-violet-400 { color: #6d28d9 !important; }
        ${d} .text-yellow-400 { color: #b45309 !important; }
        ${d} .text-emerald-500 { color: #059669 !important; }
        ${d} .text-slate-300 { color: #475569 !important; }
      `;
    } else {
      styleEl.textContent = "";
    }
  }, [themeId]);

  // iOSテーマのCSSをDOMに適用・解除するuseEffect
  useEffect(() => {
    const IOS_STYLE_ID = "ios-theme-override";
    let styleEl = document.getElementById(IOS_STYLE_ID);
    if (themeId === "ios") {
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = IOS_STYLE_ID;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        :root {
          --ios-bg: #000000;
          --ios-card-bg: rgba(28, 28, 30, 0.7);
          --ios-card-border: rgba(255, 255, 255, 0.1);
          --ios-blue: #0A84FF;
          --ios-gray: #8E8E93;
          --ios-radius: 12px;
          --ios-radius-lg: 20px;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: var(--ios-bg) !important;
          -webkit-font-smoothing: antialiased;
        }
        .ios-glass {
          background: var(--ios-card-bg) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border: 0.5px solid var(--ios-card-border) !important;
        }
        .ios-button {
          border-radius: var(--ios-radius) !important;
          font-weight: 600 !important;
          transition: opacity 0.2s ease !important;
        }
        .ios-button:active {
          opacity: 0.7 !important;
        }
        .ios-input {
          background: rgba(255, 255, 255, 0.1) !important;
          border-radius: 10px !important;
          border: none !important;
          padding: 12px 16px !important;
          color: white !important;
        }
      `;
    } else {
      if (styleEl) {
        styleEl.remove();
      }
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

  // PWAアイコン設定 — アップロードされたフクロウ画像を使用
  useEffect(() => {
    const setOrReplaceLink = (rel, href, sizes) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
      if (sizes) el.setAttribute("sizes", sizes);
    };
    setOrReplaceLink("apple-touch-icon", owlDataUri, "512x512");
    setOrReplaceLink("apple-touch-icon-precomposed", owlDataUri, "512x512");
    setOrReplaceLink("icon", owlDataUri, "512x512");
    const manifestObj = {
      name: "ORITAN",
      short_name: "ORITAN",
      start_url: "./",
      display: "standalone",
      background_color: "#0d0a2e",
      theme_color: "#1a1248",
      icons: [
        {
          src: owlDataUri,
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    };
    const manifestBlob = new Blob([JSON.stringify(manifestObj)], {
      type: "application/json",
    });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    setOrReplaceLink("manifest", manifestUrl);
  }, []);

  // お知らせ一覧を開いたら自動で既読にする
  useEffect(() => {
    if (screen === "announcementsList" && announcements.length > 0) {
      const ids = announcements.map((a) => a.id);
      setReadAnnouncementIds(ids);
      localStorage.setItem("genron_readAnnouncements", JSON.stringify(ids));
    }
  }, [screen, announcements]);

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
      } catch (e: any) {}
      alert(`${targetUser.name}さんをフレンドに追加しました！`);
      setSearchResult(null);
      setSearchId("");
      setScreen("friendsList");
    } catch (e: any) {
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
      } catch (e: any) {}
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
    } catch (e: any) {
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
    } catch (e: any) {
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

  const markAnnouncementsRead = useCallback(() => {
    const ids = announcements.map((a) => a.id);
    setReadAnnouncementIds(ids);
    localStorage.setItem("genron_readAnnouncements", JSON.stringify(ids));
  }, [announcements]);

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
    } catch (e: any) {
      showToast("送信エラー: " + e.message, "error");
    }
  };

  const handleDeleteChatMessage = async (messageId) => {
    if (!fb.db) return;
    try {
      await deleteDoc(
        doc(fb.db, "artifacts", fb.appId, "public", "data", "chat", messageId)
      );
    } catch (e: any) {
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
      // leaderboard削除（先生は存在しない場合があるのでエラー無視）
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
      ).catch(() => null);
      // teacherIndexからも削除（先生の場合）
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
      ).catch(() => null);
      // チャットメッセージを削除
      try {
        const chatSnap = await getDocs(
          query(
            collection(fb.db, "artifacts", fb.appId, "public", "data", "chat"),
            where("uid", "==", targetUid)
          )
        );
        await Promise.allSettled(chatSnap.docs.map((d) => deleteDoc(d.ref)));
      } catch (e: any) {}
      // パスワード一覧のstateからも即時削除
      setPasswordList((prev) =>
        prev.filter((u) => (u.uid || u.id) !== targetUid)
      );
      showToast("ユーザーを削除しました");
    } catch (e: any) {
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
      } catch (e: any) {}
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
    } catch (e: any) {
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
    } catch (e: any) {
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

      // Streak更新チェック
      const streakData = calculateNewStreak(targetProfile);
      if (streakData.lastStreakUpdate !== targetProfile.lastStreakUpdate) {
        targetProfile = { ...targetProfile, ...streakData };
        setProfile(targetProfile);
        saveLocal("profile", targetProfile);
        // Firestoreも更新
        setDoc(
          doc(
            fb.db,
            "artifacts",
            fb.appId,
            "users",
            targetUid,
            "profile",
            "main"
          ),
          {
            streakCount: streakData.streakCount,
            lastStreakUpdate: streakData.lastStreakUpdate,
          },
          { merge: true }
        ).catch(() => null);
        if (!targetProfile.isTeacher) {
          setDoc(
            doc(
              fb.db,
              "artifacts",
              fb.appId,
              "public",
              "data",
              "leaderboard",
              targetUid
            ),
            { streakCount: streakData.streakCount },
            { merge: true }
          ).catch(() => null);
        }
      }

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
      } catch (e: any) {
        // 取得失敗時はlocalのものをそのまま使う
      }

      await signInAnonymously(fb.auth);
      setUser({ uid: targetUid });
      setScreen("start");
      setLoginId("");
      setLoginPassword("");
    } catch (e: any) {
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
      currentScreen === "register" ||
      currentScreen === "swipeEntry"
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
      unlockedStages: {},
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
      } catch (e: any) {
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
        // leaderboard と teacherIndex を確実に削除（エラーがあれば即中断）
        await deleteDoc(
          doc(
            fb.db,
            "artifacts",
            fb.appId,
            "public",
            "data",
            "leaderboard",
            uid
          )
        ).catch((e) => {
          throw new Error("leaderboard削除失敗: " + e.message);
        });
        await deleteDoc(
          doc(
            fb.db,
            "artifacts",
            fb.appId,
            "public",
            "data",
            "teacherIndex",
            uid
          )
        ).catch((e) => {
          throw new Error("teacherIndex削除失敗: " + e.message);
        });
        await deleteDoc(
          doc(fb.db, "artifacts", fb.appId, "users", uid, "profile", "main")
        ).catch((e) => {
          throw new Error("profile削除失敗: " + e.message);
        });
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
      setLeaderboard([]);
      setChatMessages([]);
      setIsAdmin(false);
      if (fb.enabled) signOut(fb.auth).catch(() => null);
      showToast("アカウントを削除しました");
      setScreen("login");
    } catch (e: any) {
      console.error("アカウント削除エラー:", e);
      showToast("削除エラー: " + (e.message || "再度お試しください"), "error");
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
    } catch (e: any) {
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
    } catch (e: any) {
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
        } catch (e: any) {
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
      // 生徒（leaderboard）と先生（teacherIndex）の両方を取得
      const [lbSnap, tiSnap] = await Promise.all([
        getDocs(
          collection(
            fb.db,
            "artifacts",
            fb.appId,
            "public",
            "data",
            "leaderboard"
          )
        ),
        getDocs(
          collection(
            fb.db,
            "artifacts",
            fb.appId,
            "public",
            "data",
            "teacherIndex"
          )
        ),
      ]);
      // 重複を防ぐためuidをキーにしてマージ
      const allUids = [
        ...lbSnap.docs.map((d) => d.id),
        ...tiSnap.docs
          .map((d) => d.id)
          .filter((id) => !lbSnap.docs.find((d) => d.id === id)),
      ];
      const results = await Promise.all(
        allUids.map(async (uid) => {
          try {
            const pSnap = await getDoc(
              doc(fb.db, "artifacts", fb.appId, "users", uid, "profile", "main")
            );
            if (pSnap.exists()) {
              const p = pSnap.data();
              return {
                uid,
                name: p.name,
                shortId: p.shortId,
                password: p.password || "（未設定）",
                avatar: p.avatar,
                color: p.color,
                isTeacher: p.isTeacher || false,
              };
            }
          } catch (e: any) {
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
    } catch (e: any) {
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
    if (screen === "register" && teacherCodeInput.trim() === ADMIN_PASSCODE) {
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
      teacherCodeInput.trim() === ADMIN_PASSCODE
        ? true
        : profile?.isTeacher || false;
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
      unlockedStages: profile?.unlockedStages || {},
      streakCount: profile?.streakCount || 1,
      lastStreakUpdate:
        profile?.lastStreakUpdate || new Date().toISOString().split("T")[0],
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
        // 新規登録時は古いUIDの再利用を防ぐため、必ず新しい匿名セッションを取得する
        // profileEdit時は既存UIDをそのまま使う
        let uid: string | undefined;
        if (screen === "register") {
          // ログアウト後に古いUIDがstateやlocalStorageに残っている場合があるため
          // signInAnonymously で必ず新規UIDを発行する
          const cred = await signInAnonymously(fb.auth);
          uid = cred.user.uid;
          setUser({ uid });
          saveLocal("uid", uid);
        } else {
          uid = user?.uid;
          if (!uid) {
            const cred = await signInAnonymously(fb.auth);
            uid = cred.user.uid;
            setUser({ uid });
            saveLocal("uid", uid);
          }
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
          // 先生登録時: leaderboard に残っている古いエントリーを削除してからteacherIndexに登録
          await deleteDoc(
            doc(
              fb.db,
              "artifacts",
              fb.appId,
              "public",
              "data",
              "leaderboard",
              uid
            )
          ).catch(() => null); // 存在しない場合はスキップ
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
            {
              shortId: data.shortId,
              uid,
              name: data.name,
              avatar: data.avatar || "",
              color: data.color || "",
            }
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
        // 登録直後はsyncProfileの誤検知を防ぐ（Firestoreへの書き込み反映待ち）
        justRegisteredRef.current = true;
        setTimeout(() => {
          justRegisteredRef.current = false;
        }, 10000);
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
    setResultEarnedPoints(0);
    setResultEarnedCoins(0);
    setResultCorrectCount(0);
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
    setResultEarnedPoints(0);
    setResultEarnedCoins(0);
    setResultCorrectCount(0);
    generateQuestion(shuffled[0], true);
    setScreen("play");
  };

  // 品詞判定（語尾・日本語意味から推定）
  // 品詞判定: vt=他動詞, vi=自動詞, adj=形容詞, noun=名詞
  const getPOS = (word) => {
    const en = (word.en || "").toLowerCase();
    const ja = word.ja || "";
    const ja0 = ja.split("、")[0];
    // 他動詞: "A" + 助詞 が含まれる
    if (/A[をにがとへ]/.test(ja0)) return "vt";
    // 自動詞: Aなしで動詞語尾
    if (/する$|くる$|える$|る$|く$|ぐ$|む$|ぶ$|う$/.test(ja0)) return "vi";
    if (/ate$|ify$|ize$|ise$/.test(en) && !/ment$/.test(en)) return "vi";
    // 形容詞
    if (/な$|い$|的$/.test(ja0)) return "adj";
    if (/ful$|ous$|ive$|al$|ic$|ent$|ant$|able$|ible$/.test(en)) return "adj";
    // 名詞
    return "noun";
  };
  // 他動詞かどうか
  const isVT = (word) => getPOS(word) === "vt";
  // 選択肢ラベル: en-ja方向は常に日本語訳のみ表示
  // （他動詞の場合は「Aを読む」など、jaフィールドをそのまま表示）
  const getOptionLabel = (opt, direction, catOverride = null) => {
    if (direction !== "en-ja") return opt.en;
    const ja = opt.ja || "";
    // 化学・漢字・古文は「英訳：説明」形式なので「：」以降の日本語説明のみ表示
    const nonEnglishCats = ["化学", "漢字", "古文"];
    const cat = catOverride || opt.category || gameCategory;
    if (nonEnglishCats.includes(cat)) {
      // ja が存在するか確認してから indexOf を実行する（なければ -1 を返す）
      const colonIdx = ja ? ja.indexOf(": ") : -1;
      return colonIdx !== -1 ? ja.slice(colonIdx + 1).trim() : ja;
    }
    return ja; // 英単語は問題文のみ、選択肢は日本語訳のみ
  };

  const generateQuestion = (word, isCustom = false, category = null) => {
    if (!word) return;
    const cat = category || gameCategory || "英単語";
    let pool = isCustom
      ? customVocabList
      : ALL_VOCAB.filter((v) => (v.category || "英単語") === cat);
    if (pool.length < 4)
      pool = ALL_VOCAB.filter((v) => (v.category || "英単語") === cat);
    if (pool.length < 4 && isCustom) pool = [...pool, ...customVocabList];

    const otherPool = [...pool].filter((v) => v.en !== word.en);
    const wordPOS = getPOS(word);
    const wordStage = word.stage || 1;
    // 同品詞 + 同ステージ±3 を最優先（vt/viは厳密に区別）
    const samePOSSameStage = otherPool.filter(
      (v) => getPOS(v) === wordPOS && Math.abs((v.stage || 1) - wordStage) <= 3
    );
    const samePOS = otherPool.filter((v) => getPOS(v) === wordPOS);
    // 他動詞が足りない場合は自動詞で補完（逆も同様）、形容詞・名詞は混ぜない
    const verbFallback =
      wordPOS === "vt" || wordPOS === "vi"
        ? otherPool.filter((v) => getPOS(v) === "vt" || getPOS(v) === "vi")
        : [];
    const sameStage = otherPool.filter(
      (v) => Math.abs((v.stage || 1) - wordStage) <= 2
    );
    const getSuffix = (w) => {
      const sx = [
        "tion",
        "ment",
        "ity",
        "ness",
        "ance",
        "ence",
        "ing",
        "er",
        "or",
        "al",
        "ic",
        "ive",
        "ous",
        "ful",
        "less",
        "ly",
      ];
      for (const s of sx) if (w.endsWith(s)) return s;
      return "";
    };
    const wordSuffix = getSuffix(word.en);
    const sameSuffix = otherPool.filter(
      (v) => wordSuffix && getSuffix(v.en) === wordSuffix
    );

    const seen = new Set([word.en]);
    const pick = [];
    const tryAdd = (arr) => {
      for (const v of arr.sort(() => 0.5 - Math.random())) {
        if (!seen.has(v.en)) {
          seen.add(v.en);
          pick.push(v);
        }
        if (pick.length >= 3) return;
      }
    };
    tryAdd(samePOSSameStage);
    tryAdd([...samePOS, ...sameSuffix]);
    tryAdd(verbFallback); // vt/viの場合、同動詞グループで補完
    tryAdd(sameStage);
    tryAdd(otherPool);
    const distractors = pick.slice(0, 3);
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

    // ローカルの最新profileを使用（getDocによる読み取りを削減）
    let currentProfile = profileRef.current;

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
    const catKey = gameCategory || "英単語";
    const catUnlocked = (currentProfile?.unlockedStages || {})[catKey] || 1;
    const newUnlocked =
      isClear &&
      currentStage === catUnlocked &&
      currentStage !== "Custom" &&
      currentStage !== "CustomPast"
        ? currentStage + 1
        : catUnlocked;
    if (isClear) setStageClearedOccurred(true);
    setResultEarnedPoints(totalGained);
    setResultEarnedCoins(earnedPetPts);
    setResultCorrectCount(finalCorrect);

    // カテゴリ別クリア済みステージを更新
    const prevCleared = currentProfile?.clearedStages || {};
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
      unlockedStages: {
        ...(currentProfile?.unlockedStages || {}),
        [catKey]: Math.min(20, newUnlocked),
      },
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
            await updateDoc(wordRef, { seenBy: arrayUnion(myUid) });
          } catch (e: any) {}
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
      if (
        ["英単語", "英熟語", "英会話", "熟語"].includes(
          gameCategory || "英単語"
        )
      )
        speak(choice.en);
      setTimeout(() => {
        const nextIdx = currentIndex + 1;
        if (nextIdx < stageWords.length) {
          setCurrentIndex(nextIdx);
          generateQuestion(
            stageWords[nextIdx],
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
        ).catch(() => null);
      }
      setTimeout(() => {
        // newLives は setLives コールバック内で確定した最新値
        const nextIdx = currentIndex + 1;
        if (newLives <= 0) finishGame(false, nextCorrect, nextScore);
        else if (nextIdx < stageWords.length) {
          setCurrentIndex(nextIdx);
          generateQuestion(
            stageWords[nextIdx],
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
  const isLight = themeId === "light" || themeId === "simple";

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

  const Nav = () => {
    const activePetId = (profile?.ownedPets || [])[0] || "bearcat";
    const petName =
      profile?.petNames?.[activePetId] ||
      SHOP_PETS.find((p) => p.id === activePetId)?.name ||
      "ペット";
    const PetIcon = PET_ICONS[activePetId] || IcPet;
    const catKey = gameCategory || "英単語";
    const currentUnlocked = (profile?.unlockedStages || {})[catKey] || 1;
    const totalExp = profile?.totalExp || 0;

    const menuItems = [
      {
        id: "stageMap",
        label: "マップ",
        SvgIcon: IcMap,
        grad: ["#f59e0b", "#d97706"],
        shadow: "#f59e0b",
      },
      {
        id: "wordbook",
        label: "単語帳",
        SvgIcon: IcBook,
        grad: ["#38bdf8", "#0284c7"],
        shadow: "#0ea5e9",
      },
      {
        id: "review",
        label: "復習",
        SvgIcon: IcBook,
        grad: ["#10b981", "#059669"],
        shadow: "#10b981",
      },
      {
        id: "customApp",
        label: "カスタム",
        SvgIcon: IcGift,
        grad: ["#fb7185", "#e11d48"],
        shadow: "#f43f5e",
      },
      {
        id: "petRoom",
        label: "育成",
        SvgIcon: IcPet,
        grad: ["#f472b6", "#db2777"],
        shadow: "#ec4899",
      },
      {
        id: "petShop",
        label: "ショップ",
        SvgIcon: IcShop,
        grad: ["#fbbf24", "#d97706"],
        shadow: "#f59e0b",
      },
      {
        id: "tweetApp",
        label: "つぶやき",
        SvgIcon: IcTweetApp,
        grad: ["#60a5fa", "#2563eb"],
        shadow: "#3b82f6",
      },
      {
        id: "achievements",
        label: "実績",
        SvgIcon: IcStar2,
        grad: ["#c084fc", "#7c3aed"],
        shadow: "#9333ea",
      },
      {
        id: "announcementsList",
        label: "お知らせ",
        SvgIcon: IcMegaphone,
        grad: ["#818cf8", "#4f46e5"],
        shadow: "#6366f1",
      },
      {
        id: "factoryApp",
        label: "FACTORY",
        SvgIcon: IcFactory,
        grad: ["#fb923c", "#ea580c"],
        shadow: "#f97316",
      },
      {
        id: "friendsList",
        label: "フレンド",
        SvgIcon: Users,
        grad: ["#818cf8", "#6366f1"],
        shadow: "#6366f1",
      },
      {
        id: "settingsApp",
        label: "設定",
        SvgIcon: IcSettings2,
        grad: ["#94a3b8", "#475569"],
        shadow: "#64748b",
      },
    ];

    const navTabs = [
      { id: "start", label: "ホーム" },
      { id: "plaza", label: "広場" },
      { id: "chat", label: "称え場" },
      { id: "leaderboard", label: "順位" },
      { id: "stats", label: "成績" },
    ];

    return (
      <>
        {/* ドロワーオーバーレイ */}
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />
        )}

        {/* ドロワーパネル */}
        <div
          style={{
            position: "fixed",
            left: 12,
            top: menuOpen ? "calc(env(safe-area-inset-top, 0px) + 90px)" : -420,
            width: 220,
            zIndex: 210,
            transition: "top 0.38s cubic-bezier(0.34,1.1,0.64,1)",
            background: isLight
              ? "rgba(245,246,252,0.98)"
              : "rgba(10,12,22,0.98)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            borderRadius: "0 0 20px 20px",
            border: isLight
              ? "1px solid rgba(0,0,0,0.10)"
              : `1px solid ${theme.accent}30`,
            borderTop: "none",
            boxShadow: isLight
              ? "0 8px 40px rgba(0,0,0,0.12)"
              : `0 8px 40px rgba(0,0,0,0.7), 0 0 0 0.5px ${theme.accent}20`,
            padding: "12px 12px 16px",
          }}
        >
          {/* ドロワーハンドル非表示 */}
          {/* タイトル */}
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: `${theme.accent}99`,
              marginBottom: 12,
              paddingLeft: 4,
            }}
          >
            MENU
          </p>
          {/* アプリグリッド */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 8,
            }}
          >
            {menuItems.map((app) => {
              const [c1, c2] = app.grad;
              const Ic = app.SvgIcon || IcPet;
              return (
                <button
                  key={app.id}
                  onClick={() => {
                    if (app.id === "wordbook") {
                      setWordbookStage(null);
                      setWordbookTab("stage");
                    }
                    setPrevScreen(screen);
                    setScreen(app.id);
                    setMenuOpen(false);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: `linear-gradient(145deg,${c1},${c2})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 4px 16px ${app.shadow}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "45%",
                        background:
                          "linear-gradient(180deg,rgba(255,255,255,0.22) 0%,transparent 100%)",
                        borderRadius: "14px 14px 0 0",
                      }}
                    />
                    <Ic size={24} color="rgba(255,255,255,0.97)" />
                  </div>
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: isLight
                        ? "rgba(20,10,60,0.80)"
                        : "rgba(220,235,255,0.82)",
                      textAlign: "center",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {app.label}
                  </p>
                </button>
              );
            })}
          </div>
          <div style={{ height: 16 }} />
        </div>

        {/* リルナビバー（ハンバーガー使用画面のみ） */}
        {["start", "plaza", "chat", "leaderboard", "stats"].includes(
          screen
        ) && (
          <div
            className="shrink-0"
            style={{
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              maxWidth: "576px",
              margin: "0 auto",
              zIndex: 300,
              background: isLight
                ? "rgba(240,242,248,0.96)"
                : "rgba(10,12,20,0.96)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              borderTop: isLight
                ? "1px solid rgba(0,0,0,0.08)"
                : `1px solid rgba(255,255,255,0.06)`,
              boxShadow: isLight
                ? "0 -4px 24px rgba(0,0,0,0.08)"
                : "0 -4px 40px rgba(0,0,0,0.6)",
              opacity: navReady ? 1 : 0,
              pointerEvents: navReady ? "auto" : "none",
              transition: "opacity 0.15s ease",
            }}
          >
            {/* アクセントライン */}
            <div
              style={{
                height: 2,
                background: isLight
                  ? `linear-gradient(to right, transparent, ${theme.accent}60, transparent)`
                  : `linear-gradient(to right, transparent, ${theme.accent}90, transparent)`,
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                paddingInline: 8,
                paddingTop: 2,
                paddingBottom: 4,
              }}
            >
              {/* 左: タブリスト */}
              <div style={{ display: "flex", flex: 1 }}>
                {navTabs.map((item) => {
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
                  const unreadAnnouncementsCount = announcements.filter(
                    (a) => !readAnnouncementIds.includes(a.id)
                  ).length;
                  const badge =
                    item.id === "chat"
                      ? unreadChat
                      : item.id === "start"
                      ? Object.values(unreadDm).reduce((a, b) => a + b, 0) +
                        unreadAnnouncementsCount
                      : 0;
                  const IconComp = NAV_ICONS[item.id];
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setScreen(item.id);
                        setMenuOpen(false);
                        if (mainRef.current) mainRef.current.scrollTop = 0;
                        if (item.id === "chat")
                          setTimeout(
                            () =>
                              chatEndRef.current?.scrollIntoView({
                                behavior: "instant",
                              }),
                            50
                          );
                      }}
                      className="relative flex flex-col items-center justify-center transition-all"
                      style={{
                        flex: 1,
                        minHeight: 52,
                        gap: 2,
                        paddingTop: 6,
                        paddingBottom: 4,
                        color: isActive
                          ? theme.accent
                          : isLight
                          ? "rgba(20,10,60,0.35)"
                          : "rgba(255,255,255,0.30)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        transform: isActive
                          ? "translateY(-1px)"
                          : "translateY(0)",
                        transition: "all 0.18s cubic-bezier(0.25,0.8,0.25,1)",
                      }}
                    >
                      {isActive && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 28,
                            height: 2,
                            borderRadius: "0 0 4px 4px",
                            background: `linear-gradient(to right, transparent, ${theme.accent}, transparent)`,
                            boxShadow: `0 2px 12px ${theme.accent}80`,
                          }}
                        />
                      )}
                      {isActive && (
                        <div
                          style={{
                            position: "absolute",
                            top: 14,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: `radial-gradient(circle, ${theme.accent}22 0%, transparent 70%)`,
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
                          fontWeight: isActive ? 700 : 500,
                          letterSpacing: isActive ? "0.06em" : "0.02em",
                          color: isActive ? theme.accent : "inherit",
                          opacity: isActive ? 1 : 0.55,
                          position: "relative",
                          zIndex: 1,
                          marginBottom: 2,
                          textTransform: isActive ? "uppercase" : "none",
                        }}
                      >
                        {item.label}
                      </span>
                      {badge > 0 && (
                        <span
                          className="absolute"
                          style={{
                            top: 6,
                            right: 8,
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #ff4d6d, #c9184a)",
                            border:
                              "1.5px solid " +
                              (isLight ? "#f0f4ff" : "#0f0c29"),
                            boxShadow: "0 1px 6px rgba(255,77,109,0.6)",
                            zIndex: 2,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ハンバーガーはヘッダーに移動済み */}
            </div>
          </div>
        )}
      </>
    );
  };

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

  // ─── スワイプエントリー画面 ───────────────────────────────────────
  if (screen === "swipeEntry")
    return (
      <SwipeEntryScreen
        theme={theme}
        isLight={isLight}
        onComplete={() => setScreen("start")}
      />
    );

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: "100dvh",
          display: "flex",
          justifyContent: "center",
          background: theme.bg,
          pointerEvents: "auto",
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
                className="w-full rounded-[20px] px-4 py-3 font-bold text-center text-base outline-none"
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
                  className="flex-1 py-3 rounded-[20px] font-black text-sm"
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
                  className="flex-1 py-3 rounded-[20px] font-black text-sm"
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
        <style>{`
        @keyframes ui-orb-a {
          0%,100%{transform:translate(0,0) scale(1);}
          40%{transform:translate(12px,-18px) scale(1.04);}
          70%{transform:translate(-8px,12px) scale(1.03);}
        }
        @keyframes ui-orb-b {
          0%,100%{transform:translate(0,0) scale(1);}
          50%{transform:translate(-15px,20px) scale(1.06);}
        }
        @keyframes ui-orb-c {
          0%,100%{transform:translate(0,0) scale(1);}
          45%{transform:translate(10px,-8px) scale(1.04);}
        }
      `}</style>
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
            animation: "ui-orb-a 12s ease-in-out infinite",
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
            animation: "ui-orb-b 15s ease-in-out infinite",
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
            opacity: 0.65,
            animation: "ui-orb-c 18s ease-in-out infinite",
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
            overflow: "hidden",
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
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                overflow: "hidden",
                paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
                paddingLeft: 28,
                paddingRight: 28,
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
              }}
            >
              <style>{`
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
              @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&display=swap');
              .oritan-letter {
                display: inline-block;
                font-family: 'Cinzel', 'Times New Roman', serif;
                font-weight: 700;
                font-size: 3.2rem;
                line-height: 1;
              }
              /* Safe Area: CSSのenv()のみで制御。JSによる上書きなし */
              :root {
                --sab: env(safe-area-inset-bottom, 0px);
                --sat: env(safe-area-inset-top, 0px);
                --nav-height: calc(72px + env(safe-area-inset-bottom, 0px));
              }
              @supports (padding: env(safe-area-inset-bottom)) {
                :root {
                  --sab: env(safe-area-inset-bottom);
                  --sat: env(safe-area-inset-top);
                  --nav-height: calc(72px + env(safe-area-inset-bottom));
                }
              }
            `}</style>
              {(() => {
                const lC = isLight ? "rgba(20,15,60,0.88)" : "#ffffff";
                const lM = isLight
                  ? "rgba(20,15,60,0.42)"
                  : "rgba(255,255,255,0.45)";
                const lB = isLight
                  ? "rgba(255,255,255,0.82)"
                  : "rgba(255,255,255,0.07)";
                const lBd = isLight
                  ? "1.5px solid rgba(20,15,60,0.14)"
                  : "1px solid rgba(255,255,255,0.14)";
                const lCard = isLight
                  ? "rgba(255,255,255,0.72)"
                  : "rgba(255,255,255,0.055)";
                const lCardBd = isLight
                  ? "1.5px solid rgba(20,15,60,0.12)"
                  : "1px solid rgba(255,255,255,0.11)";
                const lCardShadow = isLight
                  ? "0 4px 32px rgba(20,15,60,0.10), inset 0 1px 0 rgba(255,255,255,0.9)"
                  : "0 4px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)";
                return (
                  <div
                    className="max-w-sm mx-auto w-full"
                    style={{ display: "flex", flexDirection: "column", gap: 0 }}
                  >
                    {/* ━━ ロゴエリア ━━ */}
                    <div style={{ textAlign: "center", marginBottom: 28 }}>
                      {/* アイコン */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: 20,
                        }}
                      >
                        <img
                          src={owlDataUri}
                          alt="ORITAN"
                          style={{
                            width: 88,
                            height: 88,
                            borderRadius: 20,
                            boxShadow:
                              "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(201,168,76,0.18)",
                            display: "block",
                          }}
                        />
                      </div>

                      {/* ORITAN テキスト */}
                      <h1 style={{ margin: 0, lineHeight: 1 }}>
                        <span
                          className="oritan-letter"
                          style={{
                            color: isLight
                              ? "#1a1240"
                              : "rgba(255,255,255,0.96)",
                            letterSpacing: "0.18em",
                            paddingLeft: "0.18em",
                            textShadow: isLight
                              ? "none"
                              : "0 2px 20px rgba(201,168,76,0.18)",
                          }}
                        >
                          ORITAN
                        </span>
                      </h1>
                      {/* アクセントライン */}
                      <div
                        style={{
                          height: "1px",
                          marginTop: 10,
                          marginLeft: "auto",
                          marginRight: "auto",
                          width: "55%",
                          background: isLight
                            ? "linear-gradient(90deg, transparent, #c9a84c 30%, #e8cc78 50%, #c9a84c 70%, transparent)"
                            : "linear-gradient(90deg, transparent, rgba(201,168,76,0.6) 30%, rgba(232,204,120,0.9) 50%, rgba(201,168,76,0.6) 70%, transparent)",
                        }}
                      />
                      <p
                        style={{
                          margin: "7px 0 0",
                          fontSize: 8,
                          letterSpacing: "0.30em",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          color: isLight
                            ? "rgba(201,168,76,0.65)"
                            : "rgba(201,168,76,0.55)",
                          paddingLeft: "0.30em",
                        }}
                      >
                        vocabulary learning
                      </p>
                    </div>

                    {/* ━━ フォームカード ━━ */}
                    <div
                      style={{
                        background: lCard,
                        border: lCardBd,
                        borderRadius: 22,
                        padding: "22px 20px 20px",
                        backdropFilter: "blur(20px)",
                        boxShadow: lCardShadow,
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: lM,
                            marginBottom: 7,
                          }}
                        >
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
                          className="w-full outline-none font-mono font-black text-xl tracking-[0.22em]"
                          style={{
                            background: lB,
                            border: lBd,
                            borderRadius: 12,
                            padding: "12px 16px",
                            color: lC,
                            caretColor: isLight ? "#3d35a0" : "#e0c97f",
                          }}
                        />
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: lM,
                            marginBottom: 7,
                          }}
                        >
                          Password
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
                          className="w-full outline-none font-bold text-base"
                          style={{
                            background: lB,
                            border: lBd,
                            borderRadius: 12,
                            padding: "12px 16px",
                            color: lC,
                            caretColor: isLight ? "#3d35a0" : "#e0c97f",
                          }}
                        />
                      </div>
                      {loginError && (
                        <p
                          style={{
                            color: "#f43f5e",
                            fontSize: 12,
                            fontWeight: 700,
                            marginTop: -4,
                          }}
                        >
                          {loginError}
                        </p>
                      )}
                      <button
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className="w-full font-black text-sm active:opacity-80 transition-all"
                        style={{
                          marginTop: 2,
                          padding: "14px 0",
                          borderRadius: 12,
                          background: isLoggingIn
                            ? isLight
                              ? "rgba(20,15,60,0.06)"
                              : "rgba(255,255,255,0.08)"
                            : "linear-gradient(135deg, #2a2060 0%, #1a1040 100%)",
                          border: isLoggingIn
                            ? isLight
                              ? "1.5px solid rgba(20,15,60,0.10)"
                              : "1px solid rgba(255,255,255,0.1)"
                            : isLight
                            ? "1.5px solid rgba(20,15,60,0.25)"
                            : "1px solid rgba(255,255,255,0.18)",
                          color: isLoggingIn
                            ? isLight
                              ? "rgba(20,15,60,0.3)"
                              : "rgba(255,255,255,0.35)"
                            : "#fff",
                          letterSpacing: "0.1em",
                          boxShadow: isLoggingIn
                            ? "none"
                            : isLight
                            ? "0 4px 16px rgba(20,15,60,0.22)"
                            : "0 4px 20px rgba(0,0,0,0.4)",
                          cursor: isLoggingIn ? "not-allowed" : "pointer",
                        }}
                      >
                        {isLoggingIn ? "Signing in..." : "ログイン"}
                      </button>
                    </div>

                    {/* 新規登録 */}
                    <button
                      onClick={() => {
                        setNewName("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setScreen("register");
                      }}
                      className="w-full font-bold text-sm active:opacity-70 transition-all"
                      style={{
                        marginTop: 10,
                        padding: "13px 0",
                        borderRadius: 12,
                        background: "transparent",
                        border: isLight
                          ? "1.5px solid rgba(20,15,60,0.15)"
                          : "1px solid rgba(255,255,255,0.12)",
                        color: isLight
                          ? "rgba(20,15,60,0.45)"
                          : "rgba(255,255,255,0.45)",
                        letterSpacing: "0.06em",
                      }}
                    >
                      新規登録
                    </button>

                    <p
                      style={{
                        textAlign: "center",
                        color: isLight
                          ? "rgba(20,15,60,0.18)"
                          : "rgba(255,255,255,0.1)",
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        paddingTop: 16,
                      }}
                    >
                      Designed &amp; Developed by miwa
                    </p>
                  </div>
                );
              })()}
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
                  className="w-full mb-6 p-4 bg-amber-50 rounded-[20px] flex items-center justify-between border border-amber-100"
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] cursor-pointer active:opacity-70 transition-all"
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
                    className="w-full mb-3 py-2 rounded-[12px] text-[11px] font-bold text-rose-400 active:opacity-70"
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
                        className="flex flex-col items-center gap-1 py-2 rounded-[20px] transition-all active:scale-95"
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
                              className="flex flex-col items-center gap-1 py-2 rounded-[20px] transition-all active:scale-95"
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
                      className={`h-9 rounded-[12px] ${c.bg} transition-all`}
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
                className="w-full px-5 py-4 rounded-[20px] font-black text-lg outline-none focus:border-amber-400 transition-colors mb-3"
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
                      <IcKey size={12} color="rgba(16,185,129,0.8)" />{" "}
                      招待コード
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
                    className="w-full px-5 py-3.5 rounded-[20px] font-mono font-black text-base outline-none transition-all tracking-widest"
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
                  <div
                    style={{ fontSize: 14, color: "#AAAAAA", marginBottom: 8 }}
                  >
                    先生用コード（任意）
                  </div>
                  <input
                    type="password"
                    value={teacherCodeInput}
                    onChange={(e) => setTeacherCodeInput(e.target.value.trim())}
                    className="w-full px-5 py-3.5 rounded-[20px] font-bold text-sm outline-none transition-all"
                    style={{
                      background: isLight
                        ? "rgba(0,0,0,0.05)"
                        : "rgba(255,255,255,0.06)",
                      border:
                        teacherCodeInput &&
                        teacherCodeInput.trim() === ADMIN_PASSCODE
                          ? "1.5px solid rgba(99,102,241,0.6)"
                          : isLight
                          ? "1.5px solid rgba(0,0,0,0.15)"
                          : "1.5px solid rgba(255,255,255,0.1)",
                      color: theme.text,
                    }}
                    placeholder="先生用コードを入力"
                  />
                  {teacherCodeInput &&
                    teacherCodeInput.trim() === ADMIN_PASSCODE && (
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
                  className="w-full px-5 py-3.5 rounded-[20px] font-bold text-sm outline-none transition-all"
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
                    className="w-full px-5 py-3.5 rounded-[20px] font-bold text-sm outline-none transition-all"
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
                  className="flex-1 py-4 rounded-[20px] font-black transition-all active:opacity-70"
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
                  className="flex-[2] py-4 rounded-[20px] font-black text-white text-lg transition-all active:scale-[0.98]"
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
                paddingTop: "calc(env(safe-area-inset-top, 0px) + 28px)",
                paddingBottom: "12px",
                background: "transparent",
                borderBottom: "none",
                position: "relative",
              }}
            >
              {/* PS5風 ヘッダー下ライン */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 16,
                  right: 16,
                  height: 1,
                  background: `linear-gradient(to right, transparent, ${theme.accent}30 30%, ${theme.accent}50 50%, ${theme.accent}30 70%, transparent)`,
                }}
              />
              {/* 左: ハンバーガー + アバター小 + 名前 + Lv（コンパクト） */}
              <div className="flex items-center gap-2.5 text-left">
                {/* ハンバーガーボタン（アバターの左隣） */}
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 11,
                    flexShrink: 0,
                    background: menuOpen
                      ? `linear-gradient(135deg, ${theme.accent}cc, ${theme.accent}88)`
                      : isLight
                      ? "rgba(0,0,0,0.07)"
                      : "rgba(255,255,255,0.08)",
                    border: menuOpen
                      ? `1.5px solid ${theme.accent}88`
                      : isLight
                      ? "1.5px solid rgba(0,0,0,0.10)"
                      : "1.5px solid rgba(255,255,255,0.12)",
                    boxShadow: menuOpen
                      ? `0 4px 20px ${theme.accent}55`
                      : "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: menuOpen ? 0 : 4,
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 2,
                        borderRadius: 2,
                        background: menuOpen
                          ? "white"
                          : isLight
                          ? "rgba(20,10,60,0.7)"
                          : "rgba(255,255,255,0.8)",
                        transform: menuOpen
                          ? "translateY(2px) rotate(45deg)"
                          : "none",
                        transformOrigin: "center",
                        transition: "all 0.22s ease",
                      }}
                    />
                    {!menuOpen && (
                      <div
                        style={{
                          width: 16,
                          height: 2,
                          borderRadius: 2,
                          background: isLight
                            ? "rgba(20,10,60,0.7)"
                            : "rgba(255,255,255,0.8)",
                        }}
                      />
                    )}
                    <div
                      style={{
                        width: 16,
                        height: 2,
                        borderRadius: 2,
                        background: menuOpen
                          ? "white"
                          : isLight
                          ? "rgba(20,10,60,0.7)"
                          : "rgba(255,255,255,0.8)",
                        transform: menuOpen
                          ? "translateY(-2px) rotate(-45deg)"
                          : "none",
                        transformOrigin: "center",
                        transition: "all 0.22s ease",
                      }}
                    />
                  </div>
                </button>
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
                    } rounded-[20px] flex items-center justify-center overflow-hidden`}
                    style={{
                      boxShadow: `0 0 0 1.5px ${theme.accent}60, 0 0 12px ${theme.accent}25`,
                    }}
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
                        fontSize: 18,
                        fontWeight: 800,
                        color: theme.text,
                        lineHeight: 1,
                        letterSpacing: "0.01em",
                      }}
                    >
                      {profile?.name || "User"}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: theme.accent,
                        background: `${theme.accent}14`,
                        border: `1px solid ${theme.accent}40`,
                        borderRadius: 4,
                        padding: "2px 7px",
                        lineHeight: 1.5,
                        boxShadow: `0 0 8px ${theme.accent}20`,
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
                    className="mt-2 w-28 rounded-full overflow-hidden"
                    style={{
                      background: isLight
                        ? "rgba(0,0,0,0.07)"
                        : "rgba(255,255,255,0.08)",
                      height: 3,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 99,
                        background: `linear-gradient(90deg, ${theme.accent}70, ${theme.accent})`,
                        width: `${calcExpProgress(profile?.totalExp).pct}%`,
                        boxShadow: `0 0 8px ${theme.accent}90`,
                        transition: "width 0.8s cubic-bezier(0.34,1.1,0.64,1)",
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
                  style={{
                    color: isLight
                      ? "rgba(0,0,0,0.3)"
                      : "rgba(255,255,255,0.18)",
                  }}
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

          {/* ━━━ 学習日誌スクリーン ━━━ */}
          {screen === "studyDiaryApp" && (
            <StudyDiaryScreen
              fb={fb}
              user={user}
              studyDiaryWeekOffset={studyDiaryWeekOffset}
              setStudyDiaryWeekOffset={setStudyDiaryWeekOffset}
              studyDiaryData={studyDiaryData}
              setStudyDiaryData={setStudyDiaryData}
              studyDiaryViewUid={studyDiaryViewUid}
              isLight={isLight}
              profile={profile}
              prevScreen={prevScreen}
              setScreen={setScreen}
            />
          )}

          {screen !== "studyDiaryApp" && (
            <main
              ref={mainRef}
              className="px-4 no-scrollbar"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY:
                  screen === "play" ||
                  screen === "start" ||
                  screen === "plaza" ||
                  screen === "petRoom"
                    ? "hidden"
                    : "scroll",
                overflowX: "hidden",
                paddingTop: screen === "play" ? "8px" : "12px",
                paddingBottom:
                  screen === "play" ||
                  screen === "start" ||
                  screen === "plaza" ||
                  screen === "petRoom"
                    ? "0px"
                    : screen === "chat"
                    ? "calc(var(--nav-height, 100px) + 80px)"
                    : "calc(var(--nav-height, 100px) + 40px)",
                // ナビバー(fixed)の高さ分だけ縮める
                maxHeight:
                  screen === "start" || screen === "plaza"
                    ? "calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 200px)"
                    : screen === "petRoom"
                    ? "calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 90px)"
                    : undefined,
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                display: ["register", "profileEdit", "login"].includes(screen)
                  ? "none"
                  : screen === "play" ||
                    screen === "start" ||
                    screen === "plaza" ||
                    screen === "petRoom"
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
                  style={{
                    minHeight: "calc(100dvh - 200px)",
                    paddingTop: 4,
                  }}
                >
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 3,
                            height: 20,
                            borderRadius: 99,
                            background: `linear-gradient(to bottom, ${theme.accent}, ${theme.accent}40)`,
                            boxShadow: `0 0 10px ${theme.accent}`,
                          }}
                        />
                        <h2
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            letterSpacing: "0.02em",
                            color: isLight
                              ? "rgba(10,5,40,0.92)"
                              : "rgba(255,255,255,0.95)",
                            lineHeight: 1,
                          }}
                        >
                          称え場
                        </h2>
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 600,
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            color: `${theme.accent}80`,
                            paddingTop: 3,
                          }}
                        >
                          Chat
                        </span>
                      </div>
                      <div
                        style={{
                          height: 1,
                          background: `linear-gradient(to right, ${theme.accent}50, ${theme.accent}10, transparent)`,
                          marginLeft: 11,
                        }}
                      />
                    </div>
                    {!profile?.isTeacher && (
                      <span
                        className="text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider"
                        style={
                          (chatSettings.allowedUids || []).includes(
                            user?.uid || ""
                          )
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
                    className="space-y-4 pr-2 no-scrollbar"
                    style={{
                      paddingBottom: "12px",
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
                        // allUsersMapから最新名を取得（生徒+先生対応）
                        const userInfo = allUsersMap[m.uid];
                        const displayAvatar = isMe
                          ? profile?.avatar || m.avatar
                          : userInfo?.avatar || lp?.avatar || m.avatar;
                        const displayColor = isMe
                          ? profile?.color || m.color
                          : userInfo?.color || lp?.color || m.color;
                        const displayName = isMe
                          ? profile?.name || m.name
                          : userInfo?.name || lp?.name || m.name;
                        const displayIsTeacher = isMe
                          ? !!profile?.isTeacher
                          : !!(
                              userInfo?.isTeacher ||
                              lp?.isTeacher ||
                              m.isTeacher
                            );
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
                                  className="rounded-[20px] px-4 py-3 shadow-md w-full"
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
                                    style={{
                                      color: isLight ? "#1a1040" : "#fff",
                                    }}
                                  >
                                    {m.text}
                                  </p>
                                  <p
                                    className="text-[9px] mt-1 font-bold uppercase tracking-wider"
                                    style={{
                                      color:
                                        RANK_META[m.achRank]?.color ||
                                        "#c9a84c",
                                    }}
                                  >
                                    {RANK_META[m.achRank]?.label || ""}
                                  </p>
                                </div>
                              ) : m.isReaction ? (
                                /* リアクション → コンパクトな絵文字バブル */
                                <div className="flex flex-col items-end gap-0.5">
                                  <div
                                    className="rounded-[20px] px-3 py-1.5 shadow-sm"
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
                                  className={`p-3.5 rounded-[20px] shadow-sm ${
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
                                          border:
                                            "1px solid rgba(30,20,80,0.1)",
                                          color: "#1a1040",
                                          boxShadow:
                                            "0 2px 8px rgba(0,0,0,0.06)",
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
                                      <IcTrashSm
                                        size={12}
                                        color="currentColor"
                                      />{" "}
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
                      (chatSettings.allowedUids || []).includes(
                        user?.uid || ""
                      );
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
                          padding: "8px 16px",
                          paddingBottom: "8px",
                          position: "fixed",
                          bottom:
                            "calc(env(safe-area-inset-bottom, 20px) + 68px)",
                          left: 0,
                          right: 0,
                          maxWidth: "576px",
                          margin: "0 auto",
                          zIndex: 50,
                        }}
                      >
                        {canPost ? (
                          /* 発言権限あり → 通常入力 */
                          <div
                            className="flex gap-2 p-2 rounded-[20px]"
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
                              className="flex-1 p-4 bg-transparent outline-none font-bold"
                              style={{ color: theme.text, opacity: 1 }}
                              placeholder="メッセージを入力..."
                            />
                            <button
                              onClick={handleSendMessage}
                              className="p-3.5 rounded-[12px] active:opacity-80 transition-all"
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
                            className="rounded-[20px] px-3 py-2"
                            style={{
                              background: theme.navBg,
                              backdropFilter: "blur(24px)",
                              border: isLight
                                ? "1px solid rgba(0,0,0,0.1)"
                                : "1px solid rgba(255,255,255,0.08)",
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
                      className="p-2 rounded-[12px] active:opacity-70 transition-all"
                      style={{
                        background: isLight
                          ? "rgba(0,0,0,0.05)"
                          : "rgba(255,255,255,0.08)",
                        border: isLight
                          ? "1px solid rgba(0,0,0,0.12)"
                          : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <ChevronLeft />
                    </button>
                    <h2
                      className="text-2xl font-black"
                      style={{
                        color: isLight ? "rgba(20,10,60,0.9)" : "white",
                      }}
                    >
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
                              className={`p-4 rounded-[20px] max-w-[75%] shadow-sm ${
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
                                      background: isLight
                                        ? "rgba(0,0,0,0.05)"
                                        : "rgba(255,255,255,0.1)",
                                      border: isLight
                                        ? "1px solid rgba(0,0,0,0.15)"
                                        : "1px solid rgba(255,255,255,0.15)",
                                    }
                              }
                            >
                              <p className="font-bold leading-relaxed">
                                {m.text}
                              </p>
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
                    className="flex gap-2 p-2 rounded-[20px]"
                    style={{
                      background: isLight
                        ? "rgba(0,0,0,0.03)"
                        : "rgba(255,255,255,0.06)",
                      border: isLight
                        ? "1px solid rgba(0,0,0,0.15)"
                        : "1px solid rgba(255,255,255,0.1)",
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
                      className="p-3.5 text-white rounded-[12px] active:opacity-80 transition-all"
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
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 3,
                              height: 20,
                              borderRadius: 99,
                              background: `linear-gradient(to bottom, ${theme.accent}, ${theme.accent}40)`,
                              boxShadow: `0 0 10px ${theme.accent}`,
                            }}
                          />
                          <h2
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              letterSpacing: "0.02em",
                              color: isLight
                                ? "rgba(10,5,40,0.92)"
                                : "rgba(255,255,255,0.95)",
                              lineHeight: 1,
                            }}
                          >
                            ホーム
                          </h2>
                          <span
                            style={{
                              fontSize: 8,
                              fontWeight: 600,
                              letterSpacing: "0.3em",
                              textTransform: "uppercase",
                              color: `${theme.accent}80`,
                              paddingTop: 3,
                            }}
                          >
                            Home
                          </span>
                        </div>
                        <div
                          style={{
                            height: 1,
                            background: `linear-gradient(to right, ${theme.accent}50, ${theme.accent}10, transparent)`,
                            marginLeft: 11,
                          }}
                        />
                      </div>
                    </div>

                    {(() => {
                      const activePetId =
                        (profile?.ownedPets || [])[0] || "bearcat";
                      const pet =
                        SHOP_PETS.find((p) => p.id === activePetId) ||
                        SHOP_PETS[0];
                      const accs = (
                        getPetAccessories
                          ? getPetAccessories(activePetId)
                          : (profile?.petAccessories || {})[activePetId] || []
                      )
                        .map((id) => SHOP_ACCESSORIES.find((a) => a.id === id))
                        .filter(Boolean);

                      const teacherApps = [
                        {
                          label: "マップ",
                          SvgIcon: IcMap,
                          grad: ["#f59e0b", "#d97706"],
                          shadow: "#f59e0b",
                          screen: "stageMap",
                        },
                        {
                          label: "管理画面",
                          SvgIcon: IcAdmin,
                          grad: ["#fcd34d", "#b45309"],
                          shadow: "#d97706",
                          screen: "admin",
                        },
                        {
                          label: "お知らせ",
                          SvgIcon: IcMegaphone,
                          grad: ["#818cf8", "#4f46e5"],
                          shadow: "#6366f1",
                          screen: "announcementsList",
                          badge:
                            announcements.filter(
                              (a) => !readAnnouncementIds.includes(a.id)
                            ).length || null,
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
                          badge:
                            announcements.filter(
                              (a) => !readAnnouncementIds.includes(a.id)
                            ).length || null,
                        },
                        {
                          label: "復習",
                          SvgIcon: IcBook,
                          grad: ["#34d399", "#059669"],
                          shadow: "#10b981",
                          screen: "review",
                          badge:
                            reviewList.length > 0 ? reviewList.length : null,
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
                          label: "カスタム",
                          SvgIcon: IcGift,
                          grad: ["#fb7185", "#e11d48"],
                          shadow: "#f43f5e",
                          screen: "customApp",
                          badge: (() => {
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
                              return !seen;
                            }).length;
                            return count > 0 ? count : null;
                          })(),
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

                      const apps = profile?.isTeacher
                        ? teacherApps
                        : studentApps;

                      // ── プランB: サイドバー・フォーカスレイアウト ──────────────
                      // ── PS5ホーム: マップ・カスタム・復習・単語帳・タイピング・お知らせ・設定

                      const homeAppsData = [
                        {
                          label: "マップ",
                          sub: "ステージを攻略しよう",
                          SvgIcon: IcMap,
                          grad: ["#f59e0b", "#d97706"],
                          shadow: "#f59e0b",
                          screen: "stageMap",
                        },
                        {
                          label: "カスタム",
                          sub: "custom",
                          SvgIcon: IcGift,
                          grad: ["#fb7185", "#e11d48"],
                          shadow: "#f43f5e",
                          screen: "customApp",
                          badge: (() => {
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
                              return !seen;
                            }).length;
                            return count > 0 ? count : null;
                          })(),
                        },
                        {
                          label: "復習",
                          sub: "review",
                          SvgIcon: IcBook,
                          grad: ["#10b981", "#059669"],
                          shadow: "#10b981",
                          screen: "review",
                        },
                        {
                          label: "単語帳",
                          sub: "word book",
                          SvgIcon: IcBook,
                          grad: ["#38bdf8", "#0284c7"],
                          shadow: "#0ea5e9",
                          screen: "wordbook",
                        },
                        {
                          label: "タイピング",
                          sub: "typing",
                          SvgIcon: IcTyping,
                          grad: ["#0096ff", "#004ce0"],
                          shadow: "#0096ff",
                          screen: "typingGame",
                        },
                        {
                          label: "お知らせ",
                          sub: "notice",
                          SvgIcon: IcMegaphone,
                          grad: ["#818cf8", "#4f46e5"],
                          shadow: "#6366f1",
                          screen: "announcementsList",
                          badge:
                            announcements.filter(
                              (a) => !readAnnouncementIds.includes(a.id)
                            ).length || null,
                        },
                        {
                          label: "設定",
                          sub: "settings",
                          SvgIcon: IcSettings2,
                          grad: ["#94a3b8", "#475569"],
                          shadow: "#64748b",
                          screen: "settingsApp",
                        },
                        ...(profile?.isTeacher
                          ? [
                              {
                                label: "管理画面",
                                sub: "admin",
                                SvgIcon: IcAdmin,
                                grad: ["#fcd34d", "#b45309"],
                                shadow: "#d97706",
                                screen: "admin",
                              },
                            ]
                          : []),
                      ];

                      const featuredHomeApp = homeAppsData[0]; // マップ
                      const midHomeApps = homeAppsData.slice(1, 5); // カスタム・復習・単語帳・タイピング
                      const smallHomeApps = homeAppsData.slice(5); // お知らせ・設定

                      // フィーチャーバナー
                      const HomeFeatureBanner = ({ app }) => {
                        const [c1] = app.grad;
                        const sh = app.shadow;
                        const col = isLight ? sh : c1;
                        const Ic = app.SvgIcon;
                        const isMap = app.screen === "stageMap";
                        const stagePct = isMap
                          ? (() => {
                              const unlocked = profile?.unlockedStages || {};
                              const cats = Object.keys(unlocked);
                              if (cats.length === 0) return 0;
                              const total = cats.reduce(
                                (sum, k) => sum + (unlocked[k] || 1),
                                0
                              );
                              const maxStages = cats.length * 10;
                              return Math.min(
                                100,
                                Math.round((total / maxStages) * 100)
                              );
                            })()
                          : 0;
                        const unlockedStage = isMap
                          ? (() => {
                              const unlocked = profile?.unlockedStages || {};
                              const cats = Object.keys(unlocked);
                              if (cats.length === 0) return 1;
                              return Math.max(
                                ...cats.map((k) => unlocked[k] || 1)
                              );
                            })()
                          : 1;
                        return (
                          <button
                            onClick={() => {
                              setPrevScreen("start");
                              setScreen(app.screen);
                            }}
                            className="active:scale-[0.98] transition-transform duration-150 relative overflow-hidden text-left"
                            style={{
                              flex: "0.85 1 0",
                              minHeight: 0,
                              borderRadius: 22,
                              background:
                                themeId === "simple"
                                  ? isLight
                                    ? "#ffffff"
                                    : "#000000"
                                  : isLight
                                  ? `linear-gradient(145deg, rgba(248,248,252,0.96) 0%, rgba(238,238,250,0.92) 100%)`
                                  : `linear-gradient(145deg, ${theme.bgColor}f9 0%, ${theme.bgColor}ee 100%)`,
                              border:
                                themeId === "simple"
                                  ? `2px solid #000000`
                                  : isLight
                                  ? `1px solid ${theme.accent}20`
                                  : `1px solid ${theme.accent}28`,
                              backdropFilter: "blur(32px)",
                              WebkitBackdropFilter: "blur(32px)",
                              boxShadow:
                                themeId === "simple"
                                  ? "none"
                                  : isLight
                                  ? `0 12px 40px ${c1}30, 0 0 0 0.5px ${c1}25`
                                  : `0 16px 50px ${c1}30, 0 0 0 0.5px ${c1}35, inset 0 1px 0 ${c1}20`,
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                right: -12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                opacity: isLight ? 0.22 : 0.3,
                                pointerEvents: "none",
                              }}
                            >
                              <Ic size={100} color={col} />
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                right: 0,
                                top: 0,
                                bottom: 0,
                                width: "55%",
                                background:
                                  themeId === "simple"
                                    ? "none"
                                    : `radial-gradient(ellipse at right center, ${col}40 0%, transparent 70%)`,
                                pointerEvents: "none",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: "45%",
                                background:
                                  themeId === "simple"
                                    ? "none"
                                    : isLight
                                    ? "linear-gradient(to top, rgba(255,255,255,0.25), transparent)"
                                    : "linear-gradient(to top, rgba(0,0,0,0.30), transparent)",
                                pointerEvents: "none",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 4,
                                borderRadius: "20px 0 0 20px",
                                background:
                                  themeId === "simple"
                                    ? "none"
                                    : isLight
                                    ? `linear-gradient(to bottom, ${theme.accent}dd, ${theme.accent}55)`
                                    : `linear-gradient(to bottom, ${theme.accent}ff, ${theme.accent}77)`,
                                boxShadow:
                                  themeId === "simple"
                                    ? "none"
                                    : `2px 0 16px ${theme.accent}99`,
                              }}
                            />
                            {app.badge > 0 && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 10,
                                  right: 10,
                                  minWidth: 18,
                                  height: 18,
                                  borderRadius: 9,
                                  background:
                                    "linear-gradient(135deg,#ff4757,#c0392b)",
                                  color: "white",
                                  fontSize: 9,
                                  fontWeight: 800,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  paddingInline: 4,
                                  boxShadow: "0 2px 6px rgba(255,71,87,0.5)",
                                }}
                              >
                                {app.badge > 99 ? "99+" : app.badge}
                              </div>
                            )}
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                padding: "10px 16px",
                                gap: 4,
                              }}
                            >
                              <p
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  letterSpacing: "0.22em",
                                  textTransform: "uppercase",
                                  color: isLight ? `${c1}bb` : `${c1}cc`,
                                }}
                              >
                                {app.sub}
                              </p>
                              <p
                                style={{
                                  fontSize: 22,
                                  fontWeight: 900,
                                  letterSpacing: "-0.02em",
                                  lineHeight: 1,
                                  color: isLight
                                    ? "rgba(10,5,40,0.95)"
                                    : "rgba(255,255,255,0.98)",
                                }}
                              >
                                {app.label}
                              </p>
                              {isMap && (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginTop: 2,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 80,
                                      height: 2,
                                      borderRadius: 2,
                                      background: isLight
                                        ? "rgba(0,0,0,0.10)"
                                        : "rgba(255,255,255,0.10)",
                                    }}
                                  >
                                    <div
                                      style={{
                                        height: "100%",
                                        borderRadius: 2,
                                        width: `${stagePct}%`,
                                        background: isLight ? sh : c1,
                                        boxShadow: `0 0 8px ${sh}`,
                                        transition:
                                          "width 0.8s cubic-bezier(0.34,1.1,0.64,1)",
                                      }}
                                    />
                                  </div>
                                  <span
                                    style={{
                                      fontSize: 9,
                                      fontWeight: 600,
                                      color: isLight ? `${sh}99` : `${c1}cc`,
                                    }}
                                  >
                                    Stage {unlockedStage}
                                  </span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      };

                      // 中段カード（広場の小カードと同じスタイル）
                      const HomeMidCard = ({ app }) => {
                        const [c1] = app.grad;
                        const sh = app.shadow;
                        const col = isLight ? sh : c1;
                        const Ic = app.SvgIcon;
                        return (
                          <button
                            onClick={() => {
                              setPrevScreen("start");
                              setScreen(app.screen);
                            }}
                            className="active:scale-[0.94] transition-transform duration-150 relative overflow-hidden text-left"
                            style={{
                              flex: 1,
                              height: "100%",
                              borderRadius: 16,
                              background:
                                themeId === "simple"
                                  ? isLight
                                    ? "#ffffff"
                                    : "#000000"
                                  : isLight
                                  ? `linear-gradient(145deg, rgba(248,248,252,0.96) 0%, rgba(238,238,250,0.92) 100%)`
                                  : `linear-gradient(145deg, ${theme.bgColor}f9 0%, ${theme.bgColor}ee 100%)`,
                              border:
                                themeId === "simple"
                                  ? `2px solid #000000`
                                  : isLight
                                  ? `1px solid ${theme.accent}20`
                                  : `1px solid ${theme.accent}28`,
                              backdropFilter: "blur(24px)",
                              WebkitBackdropFilter: "blur(24px)",
                              boxShadow:
                                themeId === "simple"
                                  ? "none"
                                  : isLight
                                  ? `0 4px 18px rgba(0,0,0,0.08), 0 0 0 0.5px ${theme.accent}15`
                                  : `0 6px 24px rgba(0,0,0,0.55), 0 0 0 0.5px ${theme.accent}22, inset 0 1px 0 ${theme.accent}10`,
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                right: -4,
                                bottom: -4,
                                opacity: isLight ? 0.13 : 0.18,
                                pointerEvents: "none",
                              }}
                            >
                              <Ic size={58} color={col} />
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                right: 0,
                                bottom: 0,
                                width: "70%",
                                height: "70%",
                                borderRadius: "50%",
                                background:
                                  themeId === "simple"
                                    ? "none"
                                    : `radial-gradient(circle, ${col}30 0%, transparent 70%)`,
                                pointerEvents: "none",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 3,
                                borderRadius: "16px 0 0 16px",
                                background:
                                  themeId === "simple"
                                    ? "none"
                                    : isLight
                                    ? `linear-gradient(to bottom, ${theme.accent}dd, ${theme.accent}55)`
                                    : `linear-gradient(to bottom, ${theme.accent}ff, ${theme.accent}66)`,
                                boxShadow:
                                  themeId === "simple"
                                    ? "none"
                                    : `1px 0 10px ${theme.accent}88`,
                              }}
                            />
                            {app.badge > 0 && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 7,
                                  right: 7,
                                  minWidth: 15,
                                  height: 15,
                                  borderRadius: 8,
                                  background:
                                    "linear-gradient(135deg,#ff4757,#c0392b)",
                                  color: "white",
                                  fontSize: 7,
                                  fontWeight: 800,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  paddingInline: 3,
                                }}
                              >
                                {app.badge > 99 ? "99+" : app.badge}
                              </div>
                            )}
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                padding: "9px 11px",
                                gap: 3,
                              }}
                            >
                              <p
                                style={{
                                  fontSize: 7,
                                  fontWeight: 700,
                                  letterSpacing: "0.18em",
                                  textTransform: "uppercase",
                                  color: isLight ? `${col}99` : `${col}bb`,
                                }}
                              >
                                {app.sub}
                              </p>
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 900,
                                  lineHeight: 1.1,
                                  color: isLight
                                    ? "rgba(10,5,40,0.92)"
                                    : "rgba(255,255,255,0.95)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {app.label}
                              </p>
                            </div>
                          </button>
                        );
                      };

                      // 小カード（設定・お知らせ）— 中段より一回り小さい同スタイル
                      const HomeSmallCard = ({ app }) => {
                        const [c1] = app.grad;
                        const sh = app.shadow;
                        const col = isLight ? sh : c1;
                        const Ic = app.SvgIcon;
                        return (
                          <button
                            onClick={() => {
                              setPrevScreen("start");
                              setScreen(app.screen);
                            }}
                            className="active:scale-[0.94] transition-transform duration-150 relative overflow-hidden text-left"
                            style={{
                              flex: 1,
                              height: "100%",
                              borderRadius: 14,
                              background: isLight
                                ? `linear-gradient(145deg, rgba(248,248,252,0.96) 0%, rgba(238,238,250,0.90) 100%)`
                                : `linear-gradient(145deg, ${theme.bgColor}f9 0%, ${theme.bgColor}ec 100%)`,
                              border: isLight
                                ? `1px solid ${theme.accent}20`
                                : `1px solid ${theme.accent}25`,
                              backdropFilter: "blur(20px)",
                              WebkitBackdropFilter: "blur(20px)",
                              boxShadow: isLight
                                ? `0 3px 14px rgba(0,0,0,0.07), 0 0 0 0.5px ${theme.accent}12`
                                : `0 4px 18px rgba(0,0,0,0.50), 0 0 0 0.5px ${theme.accent}20, inset 0 1px 0 ${theme.accent}08`,
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                right: -4,
                                bottom: -4,
                                opacity: isLight ? 0.13 : 0.18,
                                pointerEvents: "none",
                              }}
                            >
                              <Ic size={48} color={col} />
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                right: 0,
                                bottom: 0,
                                width: "65%",
                                height: "65%",
                                borderRadius: "50%",
                                background: `radial-gradient(circle, ${col}2e 0%, transparent 70%)`,
                                pointerEvents: "none",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 3,
                                borderRadius: "14px 0 0 14px",
                                background: isLight
                                  ? `linear-gradient(to bottom, ${theme.accent}dd, ${theme.accent}55)`
                                  : `linear-gradient(to bottom, ${theme.accent}ff, ${theme.accent}66)`,
                                boxShadow: `1px 0 8px ${theme.accent}88`,
                              }}
                            />
                            {app.badge > 0 && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 7,
                                  right: 7,
                                  minWidth: 15,
                                  height: 15,
                                  borderRadius: 8,
                                  background:
                                    "linear-gradient(135deg,#ff4757,#c0392b)",
                                  color: "white",
                                  fontSize: 7,
                                  fontWeight: 800,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  paddingInline: 3,
                                }}
                              >
                                {app.badge > 99 ? "99+" : app.badge}
                              </div>
                            )}
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                padding: "8px 10px",
                                gap: 2,
                              }}
                            >
                              <p
                                style={{
                                  fontSize: 6,
                                  fontWeight: 700,
                                  letterSpacing: "0.18em",
                                  textTransform: "uppercase",
                                  color: isLight ? `${col}88` : `${col}aa`,
                                }}
                              >
                                {app.sub}
                              </p>
                              <p
                                style={{
                                  fontSize: 12,
                                  fontWeight: 900,
                                  lineHeight: 1.1,
                                  color: isLight
                                    ? "rgba(10,5,40,0.88)"
                                    : "rgba(255,255,255,0.92)",
                                }}
                              >
                                {app.label}
                              </p>
                            </div>
                          </button>
                        );
                      };

                      // マップを大きく、お知らせ・設定を最小に
                      const mapApp = homeAppsData[0];
                      const mainApps = homeAppsData.slice(1, 5); // カスタム・復習・単語帳・タイピング
                      const tinyApps = homeAppsData.slice(5); // お知らせ・設定

                      return (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            flex: 1,
                            minHeight: 0,
                          }}
                        >
                          {/* マップ: 大バナー flex:2.5 */}
                          <HomeFeatureBanner app={mapApp} />
                          {/* メインアプリ: 2×2グリッド */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gridTemplateRows: "1fr 1fr",
                              gap: 8,
                              flex: 1.2,
                              minHeight: 0,
                            }}
                          >
                            {mainApps.map((app) => (
                              <HomeMidCard key={app.screen} app={app} />
                            ))}
                          </div>
                          {/* お知らせ・設定: HomeMidCardと同スタイルの2列グリッド */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 8,
                              flex: 0.55,
                              minHeight: 0,
                            }}
                          >
                            {tinyApps.map((app) => (
                              <HomeMidCard key={app.screen} app={app} />
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {screen === "stats" && (
                <div className="space-y-6 animate-in fade-in text-left">
                  <div className="flex items-center justify-between mb-0 shrink-0">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 3,
                            height: 20,
                            borderRadius: 99,
                            background: `linear-gradient(to bottom, ${theme.accent}, ${theme.accent}40)`,
                            boxShadow: `0 0 10px ${theme.accent}`,
                          }}
                        />
                        <h2
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            letterSpacing: "0.02em",
                            color: isLight
                              ? "rgba(10,5,40,0.92)"
                              : "rgba(255,255,255,0.95)",
                            lineHeight: 1,
                          }}
                        >
                          成績
                        </h2>
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 600,
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            color: `${theme.accent}80`,
                            paddingTop: 3,
                          }}
                        >
                          Stats
                        </span>
                      </div>
                      <div
                        style={{
                          height: 1,
                          background: `linear-gradient(to right, ${theme.accent}50, ${theme.accent}10, transparent)`,
                          marginLeft: 11,
                        }}
                      />
                    </div>
                  </div>

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
                            value:
                              hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
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
                              history.filter((h) => h.isClear).length +
                              "回クリア",
                            color: "#8b5cf6",
                            icon: <IcAchPerfect size={26} color="#8b5cf6" />,
                          },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="rounded-[20px] p-4 text-center"
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
                    className="rounded-[20px] p-5"
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
                                    {CatIc && (
                                      <CatIc size={15} color={cat.color} />
                                    )}
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
                    className="p-6 rounded-[20px] relative"
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
                    className="p-6 rounded-[20px] relative"
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
                      <Clock size={16} className="text-amber-500" /> 学習時間
                      (分)
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
                          className="p-4 rounded-[20px] flex justify-between items-center"
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
                              className={`w-10 h-10 rounded-[12px] flex items-center justify-center`}
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
                      className="p-2 rounded-[12px] active:opacity-70"
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
                        className="rounded-[20px] p-4 mb-5"
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
                              background:
                                "linear-gradient(90deg,#7c3aed,#c9a84c)",
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
                                className="flex-1 rounded-[12px] p-2 text-center"
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
                        className="shrink-0 px-3 py-1.5 rounded-[12px] font-black text-xs transition-all"
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
                        className="flex-1 py-2 rounded-[12px] font-black text-xs transition-all"
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
                      return (
                        (rankOrder[a.rank] ?? 9) - (rankOrder[b.rank] ?? 9)
                      );
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
                              className="rounded-[20px] p-4 flex flex-col gap-1.5"
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
                                  color: unlocked
                                    ? theme.textMuted
                                    : lockedDesc,
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
                      className="p-2 rounded-[12px] active:opacity-70 transition-all"
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
                      className="text-2xl font-black flex-1"
                      style={{
                        color: isLight ? "rgba(20,10,60,0.9)" : "white",
                      }}
                    >
                      お知らせ
                      {(() => {
                        const unread = announcements.filter(
                          (a) => !readAnnouncementIds.includes(a.id)
                        ).length;
                        return unread > 0 ? (
                          <span
                            className="ml-2 inline-flex items-center justify-center text-white font-black rounded-full"
                            style={{
                              fontSize: 10,
                              minWidth: 18,
                              height: 18,
                              padding: "0 5px",
                              background:
                                "linear-gradient(135deg,#f43f5e,#c9184a)",
                              boxShadow: "0 2px 8px rgba(244,63,94,0.5)",
                              verticalAlign: "middle",
                            }}
                          >
                            {unread}
                          </span>
                        ) : null;
                      })()}
                    </h2>
                    {announcements.some(
                      (a) => !readAnnouncementIds.includes(a.id)
                    ) && (
                      <button
                        onClick={markAnnouncementsRead}
                        className="px-3 py-1.5 rounded-[12px] font-black text-xs active:scale-95 transition-all"
                        style={{
                          background: isLight
                            ? "rgba(0,0,0,0.06)"
                            : "rgba(255,255,255,0.09)",
                          border: isLight
                            ? "1.5px solid rgba(0,0,0,0.18)"
                            : "1px solid rgba(255,255,255,0.12)",
                          color: isLight
                            ? "rgba(30,20,80,0.6)"
                            : "rgba(255,255,255,0.5)",
                        }}
                      >
                        全既読
                      </button>
                    )}
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
                        isUnread={!readAnnouncementIds.includes(a.id)}
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
                      className="p-2 rounded-[12px] active:opacity-70 transition-all"
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
                                : theme.text,
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
                                  : theme.text
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
                        const isUnlocked =
                          debugUnlockAll ||
                          sid <=
                            ((profile?.unlockedStages || {})[gameCategory] ||
                              1);
                        // カテゴリ別クリア済みチェック
                        const rawClearedForCat =
                          profile?.clearedStages?.[gameCategory];
                        const clearedForCat = Array.isArray(rawClearedForCat)
                          ? rawClearedForCat
                          : [];
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
                            className={`aspect-square rounded-[20px] flex flex-col items-center justify-center transition-all`}
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
                                    ? isLight
                                      ? catColor
                                      : "rgba(199,210,254,1)"
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
                    className="mb-3 p-2 rounded-[12px] active:opacity-70 transition-all"
                    style={{
                      background: isLight
                        ? "rgba(0,0,0,0.05)"
                        : "rgba(255,255,255,0.08)",
                      border: isLight
                        ? "1px solid rgba(0,0,0,0.15)"
                        : "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <ChevronLeft />
                  </button>
                  <h2 className="text-4xl font-black mb-2">
                    Stage {currentStage}
                  </h2>
                  {/* 選択中カテゴリ表示（変更不可） */}
                  {(() => {
                    const cat = WORD_CATEGORIES.find(
                      (c) => c.key === gameCategory
                    );
                    const CatIc = cat ? CATEGORY_ICONS[cat.key] : null;
                    return cat ? (
                      <div className="flex items-center gap-2 mb-5">
                        <span
                          className="px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-1.5"
                          style={{ background: cat.color, color: "white" }}
                        >
                          {CatIc && <CatIc size={13} color="white" />}
                          {cat.label}
                        </span>
                        <span style={{ fontSize: 11, color: theme.textMuted }}>
                          カテゴリは変更できません
                        </span>
                      </div>
                    ) : null;
                  })()}
                  {/* 方向切り替え: 英→日 / 日→英 (英語系) or 意味→単語 / 単語→意味 (非英語系) */}
                  <div className="flex gap-2 mb-3">
                    {(["英単語", "熟語"].includes(gameCategory)
                      ? [
                          {
                            key: "en-ja",
                            label: "英 → 日",
                            sub: "英単語を見て意味を選ぶ",
                          },
                          {
                            key: "ja-en",
                            label: "日 → 英",
                            sub: "意味を見て英単語を選ぶ",
                          },
                        ]
                      : [
                          {
                            key: "en-ja",
                            label: "単語 → 意味",
                            sub: "単語を見て意味を選ぶ",
                          },
                          {
                            key: "ja-en",
                            label: "意味 → 単語",
                            sub: "意味を見て単語を選ぶ",
                          },
                        ]
                    ).map((d) => (
                      <button
                        key={d.key}
                        onClick={() => setQuizDirection(d.key)}
                        className="flex-1 py-2 rounded-[14px] transition-all"
                        style={{
                          background:
                            quizDirection === d.key
                              ? `linear-gradient(135deg, ${theme.accent}cc, ${theme.accent}88)`
                              : isLight
                              ? "rgba(0,0,0,0.05)"
                              : "rgba(255,255,255,0.07)",
                          border:
                            quizDirection === d.key
                              ? `1.5px solid ${theme.accent}88`
                              : isLight
                              ? "1px solid rgba(0,0,0,0.15)"
                              : "1px solid rgba(255,255,255,0.12)",
                          color: quizDirection === d.key ? "white" : theme.text,
                        }}
                      >
                        <p style={{ fontSize: 13, fontWeight: 800 }}>
                          {d.label}
                        </p>
                        <p style={{ fontSize: 9, opacity: 0.6, marginTop: 2 }}>
                          {d.sub}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-4">
                    <button
                      onClick={() =>
                        startGame("meaning", currentStage, gameCategory)
                      }
                      className="p-7 rounded-[2.5rem] text-left flex justify-between items-center group active:opacity-80 transition-all"
                      style={{
                        background: isLight
                          ? "rgba(0,0,0,0.04)"
                          : "rgba(255,255,255,0.07)",
                        border: isLight
                          ? "1.5px solid rgba(0,0,0,0.2)"
                          : "1px solid rgba(99,102,241,0.3)",
                      }}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div
                          className="p-4 rounded-[20px]"
                          style={{ background: "rgba(201,168,76,0.18)" }}
                        >
                          <Zap className="text-amber-400" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black">単語モード</h3>
                          <p
                            className="text-xs font-bold uppercase"
                            style={{
                              color: isLight
                                ? "rgba(80,60,160,0.7)"
                                : "rgba(165,180,252,0.7)",
                            }}
                          >
                            Meaning
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        style={{
                          color: isLight
                            ? "rgba(0,0,0,0.3)"
                            : "rgba(255,255,255,0.3)",
                        }}
                      />
                    </button>
                    <button
                      onClick={() =>
                        startGame("sentence", currentStage, gameCategory)
                      }
                      className="p-10 rounded-[2.5rem] text-left flex justify-between items-center group active:opacity-80 transition-all"
                      style={{
                        background: isLight
                          ? "rgba(0,0,0,0.04)"
                          : "rgba(255,255,255,0.07)",
                        border: isLight
                          ? "1.5px solid rgba(0,0,0,0.2)"
                          : "1px solid rgba(16,185,129,0.3)",
                      }}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div
                          className="p-4 rounded-[20px]"
                          style={{ background: "rgba(16,185,129,0.2)" }}
                        >
                          <BookOpen className="text-emerald-400" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black">例文モード</h3>
                          <p
                            className="text-xs font-bold uppercase"
                            style={{
                              color: isLight
                                ? "rgba(10,100,70,0.7)"
                                : "rgba(110,231,183,0.7)",
                            }}
                          >
                            Sentence
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        style={{
                          color: isLight
                            ? "rgba(0,0,0,0.3)"
                            : "rgba(255,255,255,0.3)",
                        }}
                      />
                    </button>
                  </div>
                </div>
              )}

              {screen === "play" && stageWords[currentIndex] && (
                <div
                  className="animate-in fade-in flex flex-col w-full"
                  style={{
                    flex: 1,
                    minHeight: 0,
                    gap: 10,
                    paddingBottom: "76px",
                    paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
                  }}
                >
                  {/* ── ヘッダー：ライフ・スコア・プログレス ── */}
                  <div
                    className="shrink-0 px-4 py-3 rounded-[20px] flex flex-col gap-2"
                    style={{
                      background: isLight
                        ? "rgba(0,0,0,0.04)"
                        : "rgba(255,255,255,0.07)",
                      border: isLight
                        ? "1px solid rgba(0,0,0,0.12)"
                        : "1px solid rgba(255,255,255,0.1)",
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
                        className="flex items-center gap-1 px-3 py-1.5 rounded-[12px] font-black text-xs active:scale-95 transition-all"
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
                        border: isLight
                          ? "1.5px solid rgba(0,0,0,0.18)"
                          : "none",
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
                      background: isLight
                        ? "rgba(0,0,0,0.03)"
                        : "rgba(255,255,255,0.07)",
                      border: isLight
                        ? "1.5px solid rgba(0,0,0,0.15)"
                        : "1px solid rgba(255,255,255,0.12)",
                      flex: "0 0 auto",
                      minHeight: 0,
                      padding: "24px 20px",
                    }}
                  >
                    {/* 読み上げボタン: 日本語を表示するja-enモードでは非表示 */}
                    {quizDirection === "en-ja" &&
                      ["英単語", "英熟語", "英会話", "熟語"].includes(
                        gameCategory || "英単語"
                      ) && (
                        <button
                          onClick={() => speak(stageWords[currentIndex].en)}
                          className="absolute bottom-4 right-4 p-2.5 rounded-[12px] transition-colors"
                          style={{
                            background: isLight
                              ? "rgba(0,0,0,0.06)"
                              : "rgba(255,255,255,0.08)",
                            color: isLight
                              ? "rgba(0,0,0,0.4)"
                              : "rgba(255,255,255,0.4)",
                          }}
                        >
                          <Volume2 size={18} />
                        </button>
                      )}
                    {gameMode === "meaning" ? (
                      <div className="flex flex-col items-center gap-3">
                        {quizDirection === "en-ja" ? (
                          <>
                            <h2
                              className="text-5xl font-black tracking-tighter text-center"
                              style={{
                                color: isLight ? "rgba(20,10,60,0.9)" : "white",
                              }}
                            >
                              {stageWords[currentIndex].en}
                              {isVT(stageWords[currentIndex]) && (
                                <span
                                  style={{
                                    fontSize: "0.55em",
                                    opacity: 0.55,
                                    marginLeft: "0.25em",
                                    fontWeight: 800,
                                  }}
                                >
                                  {" "}
                                  A
                                </span>
                              )}
                            </h2>
                            {["英単語", "英熟語", "英会話", "熟語"].includes(
                              gameCategory || "英単語"
                            ) && (
                              <button
                                onClick={() =>
                                  speak(stageWords[currentIndex].en)
                                }
                                className="px-3 py-1.5 rounded-[12px] flex items-center gap-1.5 active:scale-90 transition-all"
                                style={{
                                  background: isLight
                                    ? "rgba(0,0,0,0.06)"
                                    : "rgba(255,255,255,0.1)",
                                  color: isLight
                                    ? "rgba(30,20,80,0.55)"
                                    : "rgba(255,255,255,0.6)",
                                  border: isLight
                                    ? "1px solid rgba(0,0,0,0.12)"
                                    : "none",
                                }}
                              >
                                <Volume2 size={14} />
                                <span className="text-xs font-bold">
                                  読み上げ
                                </span>
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <h2
                              className="text-4xl font-black tracking-tight text-center"
                              style={{
                                color: isLight ? "rgba(20,10,60,0.9)" : "white",
                                lineHeight: 1.3,
                              }}
                            >
                              {getOptionLabel(
                                stageWords[currentIndex],
                                "en-ja"
                              )}
                            </h2>
                            <p
                              style={{
                                fontSize: 10,
                                opacity: 0.45,
                                letterSpacing: "0.1em",
                              }}
                            >
                              {["化学", "漢字", "古文"].includes(gameCategory)
                                ? "単語を選ぼう"
                                : "英単語を選ぼう"}
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 px-2">
                        <h2
                          className="text-base font-bold leading-relaxed text-center"
                          style={{
                            color: isLight
                              ? "rgba(20,10,60,0.85)"
                              : "rgba(255,255,255,0.9)",
                          }}
                        >
                          {(() => {
                            const sentence = stageWords[currentIndex].sentence;
                            const word = stageWords[currentIndex].en;
                            const blanked = formatSentence(sentence, word);
                            const parts = blanked.split("______");
                            return parts.map((part, i) =>
                              i < parts.length - 1 ? (
                                <span key={i}>
                                  {part}
                                  <span
                                    style={{
                                      display: "inline-block",
                                      minWidth: 72,
                                      borderBottom: `2.5px solid ${theme.accent}`,
                                      marginInline: 2,
                                      verticalAlign: "bottom",
                                    }}
                                  >
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                  </span>
                                </span>
                              ) : (
                                <span key={i}>{part}</span>
                              )
                            );
                          })()}
                        </h2>
                        <p
                          style={{
                            fontSize: 10,
                            color: isLight
                              ? "rgba(0,0,0,0.35)"
                              : "rgba(255,255,255,0.35)",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {["化学", "漢字", "古文"].includes(gameCategory)
                            ? "▲ 空欄に入る単語を選ぼう"
                            : "▲ 空欄に入る英単語を選ぼう"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── 選択肢 ── */}
                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      display: "grid",
                      gridTemplateRows: `repeat(${options.length || 4}, 1fr)`,
                      gap: 10,
                    }}
                  >
                    {options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        disabled={!!feedback}
                        className={`rounded-[20px] text-lg font-black transition-all text-center flex items-center justify-center ${
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
                          minHeight: 0,
                          ...(!feedback
                            ? {
                                background: isLight
                                  ? "rgba(255,255,255,0.85)"
                                  : "rgba(255,255,255,0.09)",
                                border: isLight
                                  ? "2px solid rgba(0,0,0,0.20)"
                                  : "1px solid rgba(255,255,255,0.15)",
                                color: isLight
                                  ? "rgba(30,20,80,0.85)"
                                  : "white",
                                boxShadow: isLight
                                  ? "0 2px 8px rgba(0,0,0,0.08)"
                                  : "none",
                              }
                            : {}),
                        }}
                      >
                        {gameMode === "meaning"
                          ? quizDirection === "en-ja"
                            ? getOptionLabel(opt, "en-ja")
                            : opt.en
                          : opt.en}
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
                          className="w-14 h-14 rounded-[20px] flex items-center justify-center"
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
                            {currentIndex}問 正解 {correctCount} / スコア{" "}
                            {score}
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
                            className="w-full py-3.5 rounded-[20px] font-black text-base active:scale-95 transition-all"
                            style={{
                              background:
                                "linear-gradient(135deg,#f43f5e,#e11d48)",
                              color: "white",
                              boxShadow: "0 4px 16px rgba(244,63,94,0.4)",
                            }}
                          >
                            やめる
                          </button>
                          <button
                            onClick={() => setShowQuitConfirm(false)}
                            className="w-full py-3.5 rounded-[20px] font-black text-base active:scale-95 transition-all"
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
                  style={{
                    minHeight: "calc(100dvh - 120px)",
                    padding: "16px 0",
                  }}
                >
                  <div
                    className="rounded-[3rem] w-full text-center flex flex-col items-center justify-center gap-5"
                    style={{
                      background: isLight
                        ? "rgba(0,0,0,0.03)"
                        : "rgba(255,255,255,0.07)",
                      border: isLight
                        ? "1.5px solid rgba(0,0,0,0.15)"
                        : "1px solid rgba(255,255,255,0.12)",
                      padding: "32px 24px",
                    }}
                  >
                    <Trophy
                      size={56}
                      className="text-yellow-400 animate-bounce"
                    />
                    {stageClearedOccurred ? (
                      <div className="w-full text-center">
                        <span className="bg-emerald-600 text-white px-4 py-2.5 rounded-[20px] font-black shadow-xl uppercase tracking-wider text-base flex items-center justify-center gap-2 w-full">
                          <IcParty size={18} color="white" /> Mission Complete!
                        </span>
                      </div>
                    ) : (
                      lives <= 0 && (
                        <div className="w-full text-center">
                          <span className="bg-rose-600 text-white px-4 py-2.5 rounded-[20px] font-black shadow-xl uppercase tracking-wider text-base flex items-center justify-center gap-2 w-full">
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
                    <div
                      className="w-full flex flex-col gap-2"
                      style={{ fontSize: "1rem", fontWeight: "700" }}
                    >
                      <div
                        className="flex items-center justify-between px-4 py-2.5 rounded-[16px]"
                        style={{
                          background: isLight
                            ? "rgba(167,139,250,0.25)"
                            : "rgba(167,139,250,0.12)",
                          border: isLight
                            ? "1px solid rgba(167,139,250,0.4)"
                            : "1px solid rgba(167,139,250,0.25)",
                        }}
                      >
                        <span
                          style={{
                            color: isLight
                              ? "rgba(88,28,135,0.8)"
                              : "rgba(255,255,255,0.7)",
                          }}
                        >
                          正解数
                        </span>
                        <span
                          style={{
                            color: isLight ? "#6d28d9" : "#a78bfa",
                            fontWeight: "900",
                          }}
                        >
                          {resultCorrectCount} 問
                        </span>
                      </div>
                      <div
                        className="flex items-center justify-between px-4 py-2.5 rounded-[16px]"
                        style={{
                          background: isLight
                            ? "rgba(250,204,21,0.25)"
                            : "rgba(250,204,21,0.1)",
                          border: isLight
                            ? "1px solid rgba(250,204,21,0.4)"
                            : "1px solid rgba(250,204,21,0.25)",
                        }}
                      >
                        <span
                          style={{
                            color: isLight
                              ? "rgba(120,53,15,0.8)"
                              : "rgba(255,255,255,0.7)",
                          }}
                        >
                          獲得ポイント
                        </span>
                        <span
                          style={{
                            color: isLight ? "#b45309" : "#facc15",
                            fontWeight: "900",
                          }}
                        >
                          {resultEarnedPoints} pt
                        </span>
                      </div>
                      <div
                        className="flex items-center justify-between px-4 py-2.5 rounded-[16px]"
                        style={{
                          background: isLight
                            ? "rgba(250,204,21,0.25)"
                            : "rgba(250,204,21,0.1)",
                          border: isLight
                            ? "1px solid rgba(250,204,21,0.4)"
                            : "1px solid rgba(250,204,21,0.25)",
                        }}
                      >
                        <span
                          style={{
                            color: isLight
                              ? "rgba(120,53,15,0.8)"
                              : "rgba(255,255,255,0.7)",
                          }}
                        >
                          獲得コイン
                        </span>
                        <span
                          style={{
                            color: isLight ? "#b45309" : "#facc15",
                            fontWeight: "900",
                          }}
                        >
                          {resultEarnedCoins} コイン
                        </span>
                      </div>
                    </div>
                    {levelUpOccurred && (
                      <div className="w-full p-4 bg-yellow-100 rounded-[2rem] flex items-center justify-center gap-3 border-4 border-yellow-200 text-yellow-800 font-black text-lg uppercase tracking-widest shadow-lg text-center">
                        <Award size={28} /> Level Up!
                      </div>
                    )}
                    <button
                      onClick={() =>
                        setScreen(
                          currentStage === "Custom" ||
                            currentStage === "CustomPast"
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
                      {currentStage === "Custom" ||
                      currentStage === "CustomPast"
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
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setScreen(prevScreen || "start")}
                        className="p-2 rounded-[12px] active:opacity-70 transition-all"
                        style={{
                          background: isLight
                            ? "rgba(0,0,0,0.07)"
                            : "rgba(255,255,255,0.08)",
                          border: isLight
                            ? "1px solid rgba(0,0,0,0.1)"
                            : "1px solid rgba(255,255,255,0.1)",
                          color: isLight ? "rgba(20,10,60,0.7)" : "white",
                        }}
                      >
                        <ChevronLeft />
                      </button>
                      <h2
                        className="text-2xl font-black flex items-center gap-2 leading-none tracking-tight"
                        style={{
                          color: isLight ? "rgba(20,10,60,0.9)" : "white",
                        }}
                      >
                        <Users className="text-amber-400" size={28} /> フレンド
                      </h2>
                    </div>
                    <button
                      onClick={() => setScreen("addFriend")}
                      className="p-2.5 rounded-[12px] text-amber-300 active:opacity-70 transition-all"
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
                        className="p-16 text-center font-bold rounded-[20px] text-center"
                        style={{
                          background: isLight
                            ? "rgba(0,0,0,0.04)"
                            : "rgba(255,255,255,0.04)",
                          border: isLight
                            ? "1px solid rgba(0,0,0,0.1)"
                            : "1px solid rgba(255,255,255,0.08)",
                          color: isLight
                            ? "rgba(0,0,0,0.3)"
                            : "rgba(255,255,255,0.3)",
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
                          const fStage = Math.max(
                            1,
                            ...Object.values(fp?.unlockedStages || {})
                              .map(Number)
                              .filter(Boolean)
                          );
                          return (
                            <div
                              key={f.id}
                              className="p-5 rounded-[20px] flex justify-between items-center group text-left"
                              style={{
                                background: isLight
                                  ? "rgba(0,0,0,0.03)"
                                  : "rgba(255,255,255,0.06)",
                                border: isLight
                                  ? "1px solid rgba(0,0,0,0.1)"
                                  : "1px solid rgba(255,255,255,0.1)",
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
                                  className="p-2.5 text-amber-400 rounded-[12px] active:opacity-70 transition-all relative"
                                  style={{
                                    background: "rgba(201,168,76,0.18)",
                                  }}
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
                                      {unreadDm[f.id] > 9
                                        ? "9+"
                                        : unreadDm[f.id]}
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
                      className="p-2 rounded-[12px] active:opacity-70 transition-all"
                      style={{
                        background: isLight
                          ? "rgba(0,0,0,0.05)"
                          : "rgba(255,255,255,0.08)",
                        border: isLight
                          ? "1px solid rgba(0,0,0,0.15)"
                          : "1px solid rgba(255,255,255,0.12)",
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
                      background: isLight
                        ? "rgba(0,0,0,0.03)"
                        : "rgba(255,255,255,0.06)",
                      border: isLight
                        ? "1px solid rgba(0,0,0,0.1)"
                        : "1px solid rgba(255,255,255,0.1)",
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
                        className="w-full p-5 pl-14 rounded-[20px] font-black text-sm outline-none font-mono text-left"
                        style={{
                          background: isLight
                            ? "rgba(0,0,0,0.05)"
                            : "rgba(255,255,255,0.08)",
                          border: isLight
                            ? "1px solid rgba(0,0,0,0.15)"
                            : "1px solid rgba(255,255,255,0.12)",
                          color: theme.text,
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
                        background: isLight
                          ? "rgba(0,0,0,0.04)"
                          : "rgba(255,255,255,0.06)",
                        border: isLight
                          ? "1px solid rgba(0,0,0,0.1)"
                          : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div
                        className={`w-28 h-28 ${searchResult.color} rounded-[2rem] flex items-center justify-center text-6xl mb-6 border-[6px] border-white shadow-2xl transform rotate-6 text-center`}
                      >
                        {searchResult.avatar}
                      </div>
                      <h3
                        className="text-3xl font-black mb-6 text-center"
                        style={{
                          color: isLight ? "rgba(20,10,60,0.9)" : "white",
                        }}
                      >
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
                  const myUid = user?.uid || "";
                  const newCustomCount = !profile?.isTeacher
                    ? customVocabList.filter((w) => {
                        const at = w.assignedTo;
                        const isAssigned =
                          at === "all" ||
                          at === undefined ||
                          (Array.isArray(at) && at.includes(myUid));
                        if (!isAssigned) return false;
                        const seen = Array.isArray(w.seenBy)
                          ? w.seenBy.includes(myUid)
                          : false;
                        return !seen;
                      }).length
                    : 0;

                  const plazaApps = [
                    {
                      label: "FACTORY",
                      sub: "マイワードを作成",
                      SvgIcon: IcFactory,
                      grad: ["#fb923c", "#ea580c"],
                      shadow: "#f97316",
                      screen: "factoryApp",
                      bgR: "linear-gradient(145deg,#fb923c 0%,#f97316 55%,#ea580c 100%)",
                    },
                    {
                      label: "メモ",
                      sub: "自分だけのメモを管理",
                      SvgIcon: IcNoteApp,
                      grad: ["#38bdf8", "#0284c7"],
                      shadow: "#0ea5e9",
                      screen: "noteApp",
                      bgR: "linear-gradient(145deg,#38bdf8 0%,#0ea5e9 55%,#2563eb 100%)",
                    },
                    {
                      label: "ショップ",
                      sub: "ペットやアイテムを購入",
                      SvgIcon: IcShop,
                      grad: ["#fbbf24", "#d97706"],
                      shadow: "#f59e0b",
                      screen: "petShop",
                      bgR: "linear-gradient(145deg,#fbbf24 0%,#f59e0b 55%,#d97706 100%)",
                    },
                    {
                      label: "育成",
                      sub: "ペットを育てて交流",
                      SvgIcon: IcPet,
                      grad: ["#f9a8d4", "#db2777"],
                      shadow: "#ec4899",
                      screen: "petRoom",
                      bgR: "linear-gradient(145deg,#f472b6 0%,#ec4899 50%,#db2777 100%)",
                    },
                    {
                      label: "実績",
                      sub: "達成したバッジを確認",
                      SvgIcon: IcStar2,
                      grad: ["#c084fc", "#7c3aed"],
                      shadow: "#9333ea",
                      screen: "achievements",
                      bgR: "linear-gradient(145deg,#a78bfa 0%,#8b5cf6 50%,#7c3aed 100%)",
                    },
                    {
                      label: "つぶやき",
                      sub: "みんなの投稿を見る",
                      SvgIcon: IcTweetApp,
                      grad: ["#60a5fa", "#2563eb"],
                      shadow: "#3b82f6",
                      screen: "tweetApp",
                      bgR: "linear-gradient(145deg,#38bdf8 0%,#3b82f6 55%,#2563eb 100%)",
                    },
                  ];

                  const mkRich2 = (bg, shadow) => ({ bg, shadow });
                  const richGrad2 = {
                    stageMap: mkRich2(
                      "linear-gradient(145deg,#f97316 0%,#ef4444 55%,#ec4899 100%)",
                      "#f97316"
                    ),
                    customApp: mkRich2(
                      "linear-gradient(145deg,#f43f5e 0%,#e11d48 100%)",
                      "#f43f5e"
                    ),
                    review: mkRich2(
                      "linear-gradient(145deg,#10b981 0%,#059669 60%,#0d9488 100%)",
                      "#10b981"
                    ),
                    wordbook: mkRich2(
                      "linear-gradient(145deg,#06b6d4 0%,#0284c7 100%)",
                      "#06b6d4"
                    ),
                    petRoom: mkRich2(
                      "linear-gradient(145deg,#f472b6 0%,#ec4899 50%,#db2777 100%)",
                      "#ec4899"
                    ),
                    petShop: mkRich2(
                      "linear-gradient(145deg,#fbbf24 0%,#f59e0b 60%,#d97706 100%)",
                      "#f59e0b"
                    ),
                    tweetApp: mkRich2(
                      "linear-gradient(145deg,#38bdf8 0%,#0ea5e9 55%,#2563eb 100%)",
                      "#0ea5e9"
                    ),
                    achievements: mkRich2(
                      "linear-gradient(145deg,#a78bfa 0%,#8b5cf6 50%,#7c3aed 100%)",
                      "#8b5cf6"
                    ),
                    announcementsList: mkRich2(
                      "linear-gradient(145deg,#818cf8 0%,#6366f1 60%,#4f46e5 100%)",
                      "#6366f1"
                    ),
                    settingsApp: mkRich2(
                      "linear-gradient(145deg,#94a3b8 0%,#64748b 60%,#475569 100%)",
                      "#64748b"
                    ),
                    factoryApp: mkRich2(
                      "linear-gradient(145deg,#fb923c 0%,#f97316 60%,#ea580c 100%)",
                      "#f97316"
                    ),
                    noteApp: mkRich2(
                      "linear-gradient(145deg,#38bdf8 0%,#0ea5e9 55%,#2563eb 100%)",
                      "#0ea5e9"
                    ),
                    friendsList: mkRich2(
                      "linear-gradient(145deg,#818cf8 0%,#6366f1 100%)",
                      "#6366f1"
                    ),
                  };

                  const categories = [
                    {
                      label: "学習",
                      apps: [
                        {
                          label: "マップ",
                          SvgIcon: IcMap,
                          screen: "stageMap",
                          grad: ["#f97316", "#ec4899"],
                          shadow: "#f97316",
                        },
                        {
                          label: "単語帳",
                          SvgIcon: IcBook,
                          screen: "wordbook",
                          grad: ["#06b6d4", "#0284c7"],
                          shadow: "#06b6d4",
                        },
                        {
                          label: "カスタム",
                          SvgIcon: IcGift,
                          screen: "customApp",
                          grad: ["#f43f5e", "#e11d48"],
                          shadow: "#f43f5e",
                        },
                        {
                          label: "復習",
                          SvgIcon: IcBook,
                          screen: "review",
                          grad: ["#10b981", "#059669"],
                          shadow: "#10b981",
                        },
                      ],
                    },
                    {
                      label: "エンタメ",
                      apps: [
                        {
                          label: "育成",
                          SvgIcon: IcPet,
                          screen: "petRoom",
                          grad: ["#f472b6", "#db2777"],
                          shadow: "#ec4899",
                        },
                        {
                          label: "ショップ",
                          SvgIcon: IcShop,
                          screen: "petShop",
                          grad: ["#fbbf24", "#d97706"],
                          shadow: "#f59e0b",
                        },
                        {
                          label: "つぶやき",
                          SvgIcon: IcTweetApp,
                          screen: "tweetApp",
                          grad: ["#38bdf8", "#2563eb"],
                          shadow: "#0ea5e9",
                        },
                        {
                          label: "実績",
                          SvgIcon: IcStar2,
                          screen: "achievements",
                          grad: ["#a78bfa", "#7c3aed"],
                          shadow: "#8b5cf6",
                        },
                      ],
                    },
                    {
                      label: "ツール",
                      apps: [
                        {
                          label: "FACTORY",
                          SvgIcon: IcFactory,
                          screen: "factoryApp",
                          grad: ["#fb923c", "#ea580c"],
                          shadow: "#f97316",
                        },
                        {
                          label: "お知らせ",
                          SvgIcon: IcMegaphone,
                          screen: "announcementsList",
                          grad: ["#818cf8", "#4f46e5"],
                          shadow: "#6366f1",
                        },
                        {
                          label: "設定",
                          SvgIcon: IcSettings2,
                          screen: "settingsApp",
                          grad: ["#94a3b8", "#475569"],
                          shadow: "#64748b",
                        },
                        {
                          label: "フレンド",
                          SvgIcon: Users,
                          screen: "friendsList",
                          grad: ["#818cf8", "#6366f1"],
                          shadow: "#6366f1",
                        },
                      ],
                    },
                  ];

                  const CatIcon = ({ app, size }) => {
                    const rg = richGrad2[app.screen];
                    const [c1, c2] = app.grad || ["#888", "#444"];
                    const Ic = app.SvgIcon || IcPet;
                    const r = Math.round(size * 0.225);
                    const shadowColor = rg ? rg.shadow : app.shadow;
                    return (
                      <button
                        onClick={() => {
                          setPrevScreen("plaza");
                          setScreen(app.screen);
                        }}
                        className="active:scale-90 transition-transform duration-150"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 5,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            width: size,
                            height: size,
                            borderRadius: r,
                            background: rg
                              ? rg.bg
                              : `linear-gradient(145deg,${c1},${c2})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `0 4px 20px ${shadowColor}55, 0 0 0 0.5px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.25)`,
                            position: "relative",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          {/* 光沢ハイライト */}
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: "45%",
                              background:
                                "linear-gradient(180deg,rgba(255,255,255,0.28) 0%,transparent 100%)",
                              borderRadius: `${r}px ${r}px 0 0`,
                            }}
                          />
                          {/* 下影 */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: "18%",
                              background:
                                "linear-gradient(0deg,rgba(0,0,0,0.22) 0%,transparent 100%)",
                            }}
                          />
                          {/* グロー */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: `radial-gradient(circle at 60% 35%, rgba(255,255,255,0.15) 0%, transparent 65%)`,
                            }}
                          />
                          <Ic
                            size={size * 0.46}
                            color="rgba(255,255,255,0.97)"
                          />
                        </div>
                        <p
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            color: isLight
                              ? "rgba(20,10,60,0.82)"
                              : "rgba(220,235,255,0.85)",
                            textAlign: "center",
                            lineHeight: 1.2,
                            maxWidth: size + 10,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            letterSpacing: "0.03em",
                          }}
                        >
                          {app.label}
                        </p>
                      </button>
                    );
                  };

                  return (
                    <div
                      className="animate-in fade-in"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0,
                        height: "100%",
                        minHeight: 0,
                      }}
                    >
                      {/* ヘッダー（称え場デザイン統一） */}
                      <div className="flex items-center justify-between mb-4 shrink-0">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 3,
                                height: 20,
                                borderRadius: 99,
                                background: `linear-gradient(to bottom, ${theme.accent}, ${theme.accent}40)`,
                                boxShadow: `0 0 10px ${theme.accent}`,
                              }}
                            />
                            <h2
                              style={{
                                fontSize: 20,
                                fontWeight: 800,
                                letterSpacing: "0.02em",
                                color: isLight
                                  ? "rgba(10,5,40,0.92)"
                                  : "rgba(255,255,255,0.95)",
                                lineHeight: 1,
                              }}
                            >
                              広場
                            </h2>
                            <span
                              style={{
                                fontSize: 8,
                                fontWeight: 600,
                                letterSpacing: "0.3em",
                                textTransform: "uppercase",
                                color: `${theme.accent}80`,
                                paddingTop: 3,
                              }}
                            >
                              Plaza
                            </span>
                          </div>
                          <div
                            style={{
                              height: 1,
                              background: `linear-gradient(to right, ${theme.accent}50, ${theme.accent}10, transparent)`,
                              marginLeft: 11,
                            }}
                          />
                        </div>
                      </div>

                      {themeId === "3ds" ? (
                        <>
                          {/* 検索バー */}
                          <div
                            style={{
                              flexShrink: 0,
                              marginBottom: 12,
                              background: isLight
                                ? "rgba(0,0,0,0.06)"
                                : "rgba(255,255,255,0.13)",
                              backdropFilter: "blur(20px)",
                              WebkitBackdropFilter: "blur(20px)",
                              borderRadius: 14,
                              border: isLight
                                ? "1px solid rgba(0,0,0,0.08)"
                                : "1px solid rgba(255,255,255,0.16)",
                              height: 36,
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              paddingLeft: 12,
                            }}
                          >
                            <svg
                              width={13}
                              height={13}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={
                                isLight
                                  ? "rgba(40,20,80,0.35)"
                                  : "rgba(200,220,255,0.45)"
                              }
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            >
                              <circle cx="11" cy="11" r="8" />
                              <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <p
                              style={{
                                fontSize: 13,
                                color: isLight
                                  ? "rgba(40,20,80,0.30)"
                                  : "rgba(200,220,255,0.38)",
                                fontWeight: 500,
                              }}
                            >
                              アプリライブラリ
                            </p>
                          </div>

                          {/* カテゴリフォルダ（スマホテーマ） */}
                          <div
                            style={{
                              flex: 1,
                              minHeight: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                              overflowY: "auto",
                            }}
                          >
                            {categories.map((cat) => (
                              <div
                                key={cat.label}
                                style={{
                                  borderRadius: 16,
                                  background: isLight
                                    ? "rgba(255,255,255,0.68)"
                                    : "rgba(8,12,28,0.62)",
                                  backdropFilter: "blur(28px)",
                                  WebkitBackdropFilter: "blur(28px)",
                                  border: isLight
                                    ? "1px solid rgba(0,0,0,0.10)"
                                    : `1px solid rgba(255,255,255,0.08)`,
                                  boxShadow: isLight
                                    ? "0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)"
                                    : `0 6px 32px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 0.5px ${theme.accent}12`,
                                  flexShrink: 0,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "9px 14px 3px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 2,
                                      height: 10,
                                      borderRadius: 99,
                                      background: `linear-gradient(to bottom, ${theme.accent}, ${theme.accent}40)`,
                                      boxShadow: `0 0 6px ${theme.accent}80`,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <p
                                    style={{
                                      fontSize: 9,
                                      fontWeight: 700,
                                      color: isLight
                                        ? "rgba(40,20,80,0.55)"
                                        : `${theme.accent}90`,
                                      letterSpacing: "0.20em",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {cat.label}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: `repeat(${cat.apps.length}, 1fr)`,
                                    gap: 0,
                                    padding: "4px 8px 8px",
                                  }}
                                >
                                  {cat.apps.map((app) => (
                                    <CatIcon
                                      key={app.screen}
                                      app={app}
                                      size={48}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        /* ── スマホテーマ以外: PS5風 スクロールなしグリッド ── */
                        <div
                          style={{
                            flex: 1,
                            minHeight: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          {/* フィーチャーバナー（1枚目） */}
                          {(() => {
                            const app = plazaApps[0];
                            if (!app) return null;
                            const [c1] = app.grad || ["#888", "#444"];
                            const sh = app.shadow || c1;
                            const col =
                              themeId === "simple"
                                ? "#000000"
                                : isLight
                                ? sh
                                : c1;
                            const SvgIcon = app.SvgIcon || IcPet;
                            return (
                              <button
                                key={app.screen}
                                onClick={() => {
                                  setPrevScreen("plaza");
                                  setScreen(app.screen);
                                }}
                                className="active:scale-[0.98] transition-transform duration-150 relative overflow-hidden text-left"
                                style={{
                                  flexShrink: 0,
                                  height: 90,
                                  borderRadius: 16,
                                  background:
                                    themeId === "simple"
                                      ? isLight
                                        ? "#ffffff"
                                        : "#000000"
                                      : isLight
                                      ? `linear-gradient(135deg, rgba(248,248,252,0.97) 0%, rgba(235,235,248,0.94) 100%)`
                                      : `linear-gradient(135deg, ${theme.bgColor}f8 0%, ${theme.bgColor}ee 100%)`,
                                  border:
                                    themeId === "simple"
                                      ? `2px solid #000000`
                                      : isLight
                                      ? `1px solid ${theme.accent}22`
                                      : `1px solid ${theme.accent}28`,
                                  backdropFilter: "blur(32px)",
                                  WebkitBackdropFilter: "blur(32px)",
                                  boxShadow:
                                    themeId === "simple"
                                      ? "none"
                                      : isLight
                                      ? `0 8px 32px rgba(0,0,0,0.10), 0 0 0 0.5px ${theme.accent}15`
                                      : `0 12px 40px rgba(0,0,0,0.60), 0 0 0 0.5px ${theme.accent}20, inset 0 1px 0 ${theme.accent}12`,
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    right: -10,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    opacity: isLight ? 0.07 : 0.1,
                                    pointerEvents: "none",
                                  }}
                                >
                                  <SvgIcon
                                    size={80}
                                    color={isLight ? "#000" : "#fff"}
                                  />
                                </div>
                                <div
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: "55%",
                                    background:
                                      themeId === "simple"
                                        ? "none"
                                        : `radial-gradient(ellipse at right center, ${col}35 0%, transparent 70%)`,
                                    pointerEvents: "none",
                                  }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: "50%",
                                    background:
                                      themeId === "simple"
                                        ? "none"
                                        : isLight
                                        ? "linear-gradient(to top, rgba(255,255,255,0.25), transparent)"
                                        : "linear-gradient(to top, rgba(0,0,0,0.30), transparent)",
                                    pointerEvents: "none",
                                  }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: 4,
                                    borderRadius: "20px 0 0 20px",
                                    background:
                                      themeId === "simple"
                                        ? "none"
                                        : isLight
                                        ? `linear-gradient(to bottom, ${theme.accent}dd, ${theme.accent}55)`
                                        : `linear-gradient(to bottom, ${theme.accent}ff, ${theme.accent}77)`,
                                    boxShadow:
                                      themeId === "simple"
                                        ? "none"
                                        : `2px 0 20px ${theme.accent}aa`,
                                  }}
                                />
                                {app.badge > 0 && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: 10,
                                      right: 10,
                                      minWidth: 18,
                                      height: 18,
                                      borderRadius: 9,
                                      background:
                                        "linear-gradient(135deg,#ff4757,#c0392b)",
                                      boxShadow: "0 0 8px rgba(255,71,87,0.7)",
                                      color: "white",
                                      fontSize: 9,
                                      fontWeight: 800,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      paddingInline: 4,
                                    }}
                                  >
                                    {app.badge > 99 ? "99+" : app.badge}
                                  </div>
                                )}
                                <div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "flex-end",
                                    padding: "16px 18px",
                                    gap: 5,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 8,
                                      fontWeight: 700,
                                      letterSpacing: "0.28em",
                                      textTransform: "uppercase",
                                      color: isLight ? `${col}99` : `${col}cc`,
                                    }}
                                  >
                                    {app.sub}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 22,
                                      fontWeight: 900,
                                      lineHeight: 1,
                                      color: isLight
                                        ? "rgba(10,5,40,0.95)"
                                        : "rgba(255,255,255,0.98)",
                                    }}
                                  >
                                    {app.label}
                                  </p>
                                </div>
                              </button>
                            );
                          })()}

                          {/* 残りのアプリ: 3列グリッド 2行（実績・つぶやき・フレンド含む） */}
                          {(() => {
                            const gridItems = [
                              ...plazaApps.slice(1), // メモ・ショップ・育成・実績・つぶやき
                              {
                                label: "フレンド",
                                sub:
                                  friends.length > 0
                                    ? `${friends.length}人のフレンド`
                                    : "フレンドを追加",
                                SvgIcon: Users,
                                grad: ["#818cf8", "#6366f1"],
                                shadow: "#818cf8",
                                screen: "friendsList",
                                isFriend: true,
                              },
                            ];
                            return (
                              <div
                                style={{
                                  flex: 1,
                                  minHeight: 0,
                                  display: "grid",
                                  gridTemplateColumns: "repeat(3, 1fr)",
                                  gridTemplateRows: "1fr 1fr",
                                  gap: 8,
                                }}
                              >
                                {gridItems.map((app) => {
                                  const [c1] = app.grad || ["#888", "#444"];
                                  const sh = app.shadow || c1;
                                  const col =
                                    themeId === "simple"
                                      ? "#000000"
                                      : isLight
                                      ? sh
                                      : c1;
                                  const SvgIcon = app.SvgIcon || IcPet;
                                  return (
                                    <button
                                      key={app.screen}
                                      onClick={() => {
                                        setPrevScreen("plaza");
                                        setScreen(app.screen);
                                      }}
                                      className="active:scale-[0.94] transition-transform duration-150 relative overflow-hidden text-left"
                                      style={{
                                        height: "100%",
                                        borderRadius: 16,
                                        background:
                                          themeId === "simple"
                                            ? isLight
                                              ? "#ffffff"
                                              : "#000000"
                                            : isLight
                                            ? `linear-gradient(145deg, rgba(248,248,252,0.96) 0%, rgba(238,238,250,0.92) 100%)`
                                            : `linear-gradient(145deg, ${theme.bgColor}f9 0%, ${theme.bgColor}ee 100%)`,
                                        border:
                                          themeId === "simple"
                                            ? `2px solid #000000`
                                            : isLight
                                            ? `1px solid ${theme.accent}20`
                                            : `1px solid ${theme.accent}25`,
                                        backdropFilter: "blur(24px)",
                                        WebkitBackdropFilter: "blur(24px)",
                                        boxShadow:
                                          themeId === "simple"
                                            ? "none"
                                            : isLight
                                            ? `0 4px 18px rgba(0,0,0,0.08), 0 0 0 0.5px ${theme.accent}15`
                                            : `0 6px 24px rgba(0,0,0,0.55), 0 0 0 0.5px ${theme.accent}22, inset 0 1px 0 ${theme.accent}10`,
                                      }}
                                    >
                                      {/* 背景アイコン */}
                                      <div
                                        style={{
                                          position: "absolute",
                                          right: -4,
                                          bottom: -4,
                                          opacity: isLight ? 0.1 : 0.14,
                                          pointerEvents: "none",
                                        }}
                                      >
                                        <SvgIcon size={60} color={col} />
                                      </div>
                                      {/* 右下グロー（強め） */}
                                      <div
                                        style={{
                                          position: "absolute",
                                          right: 0,
                                          bottom: 0,
                                          width: "80%",
                                          height: "80%",
                                          borderRadius: "50%",
                                          background:
                                            themeId === "simple"
                                              ? "none"
                                              : `radial-gradient(circle, ${col}28 0%, transparent 70%)`,
                                          pointerEvents: "none",
                                        }}
                                      />
                                      {/* 左縦バー（テーマカラー） */}
                                      <div
                                        style={{
                                          position: "absolute",
                                          left: 0,
                                          top: 0,
                                          bottom: 0,
                                          width: 3,
                                          borderRadius: "16px 0 0 16px",
                                          background:
                                            themeId === "simple"
                                              ? "none"
                                              : isLight
                                              ? `linear-gradient(to bottom, ${theme.accent}dd, ${theme.accent}55)`
                                              : `linear-gradient(to bottom, ${theme.accent}ff, ${theme.accent}66)`,
                                          boxShadow:
                                            themeId === "simple"
                                              ? "none"
                                              : `1px 0 8px ${theme.accent}88`,
                                        }}
                                      />
                                      {/* フレンドの未読バッジ */}
                                      {app.isFriend &&
                                        Object.values(unreadDm).reduce(
                                          (a, b) => a + b,
                                          0
                                        ) > 0 && (
                                          <div
                                            style={{
                                              position: "absolute",
                                              top: 7,
                                              right: 7,
                                              minWidth: 15,
                                              height: 15,
                                              borderRadius: 8,
                                              background:
                                                "linear-gradient(135deg,#f43f5e,#e11d48)",
                                              boxShadow:
                                                "0 0 8px rgba(255,71,87,0.7)",
                                              color: "white",
                                              fontSize: 7,
                                              fontWeight: 800,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              paddingInline: 3,
                                            }}
                                          >
                                            {Object.values(unreadDm).reduce(
                                              (a, b) => a + b,
                                              0
                                            )}
                                          </div>
                                        )}
                                      {/* 通常バッジ */}
                                      {!app.isFriend && app.badge > 0 && (
                                        <div
                                          style={{
                                            position: "absolute",
                                            top: 7,
                                            right: 7,
                                            minWidth: 15,
                                            height: 15,
                                            borderRadius: 8,
                                            background:
                                              "linear-gradient(135deg,#ff4757,#c0392b)",
                                            boxShadow:
                                              "0 0 8px rgba(255,71,87,0.7)",
                                            color: "white",
                                            fontSize: 7,
                                            fontWeight: 800,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            paddingInline: 3,
                                          }}
                                        >
                                          {app.badge > 99 ? "99+" : app.badge}
                                        </div>
                                      )}
                                      <div
                                        style={{
                                          position: "absolute",
                                          inset: 0,
                                          display: "flex",
                                          flexDirection: "column",
                                          justifyContent: "flex-end",
                                          padding: "9px 11px",
                                          gap: 3,
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 7,
                                            fontWeight: 700,
                                            letterSpacing: "0.18em",
                                            textTransform: "uppercase" as const,
                                            color: isLight
                                              ? `${col}bb`
                                              : `${c1}cc`,
                                          }}
                                        >
                                          {app.sub}
                                        </p>
                                        <p
                                          style={{
                                            fontSize: 13,
                                            fontWeight: 900,
                                            lineHeight: 1.1,
                                            color: isLight
                                              ? "rgba(10,5,40,0.92)"
                                              : "rgba(255,255,255,0.95)",
                                          }}
                                        >
                                          {app.label}
                                        </p>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })()}

              {/* ランキング画面 */}
              {screen === "leaderboard" && (
                <div className="animate-in fade-in space-y-4 text-left pb-4">
                  <div className="flex items-center justify-between mb-0 shrink-0">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 3,
                            height: 20,
                            borderRadius: 99,
                            background: `linear-gradient(to bottom, ${theme.accent}, ${theme.accent}40)`,
                            boxShadow: `0 0 10px ${theme.accent}`,
                          }}
                        />
                        <h2
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            letterSpacing: "0.02em",
                            color: isLight
                              ? "rgba(10,5,40,0.92)"
                              : "rgba(255,255,255,0.95)",
                            lineHeight: 1,
                          }}
                        >
                          順位
                        </h2>
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 600,
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            color: `${theme.accent}80`,
                            paddingTop: 3,
                          }}
                        >
                          Ranking
                        </span>
                      </div>
                      <div
                        style={{
                          height: 1,
                          background: `linear-gradient(to right, ${theme.accent}50, ${theme.accent}10, transparent)`,
                          marginLeft: 11,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="rounded-[20px] overflow-hidden text-left"
                    style={{
                      background: isLight
                        ? "#ffffff"
                        : "rgba(255,255,255,0.05)",
                      border: isLight
                        ? "1.5px solid rgba(0,0,0,0.12)"
                        : "1px solid rgba(255,255,255,0.1)",
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
                            borderBottom: isLight
                              ? "1px solid rgba(0,0,0,0.07)"
                              : "1px solid rgba(255,255,255,0.06)",
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
                                <span
                                  className="text-sm font-black w-6 text-center"
                                  style={{
                                    color: isLight
                                      ? "rgba(0,0,0,0.45)"
                                      : "rgba(255,255,255,0.3)",
                                  }}
                                >
                                  {i + 1}
                                </span>
                              )}
                            </div>
                            <div className="relative w-12 h-12 shrink-0">
                              <div
                                className={`w-12 h-12 ${e.color} rounded-[20px] flex items-center justify-center shadow-md border-2 border-white overflow-hidden`}
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
                                <p
                                  className="font-black text-base tracking-tight leading-none text-left truncate max-w-[120px]"
                                  style={{
                                    color: isLight ? "#1a1035" : "white",
                                  }}
                                >
                                  {e.id === user?.uid
                                    ? "自分"
                                    : allUsersMap[e.id]?.name || e.name}
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
                              <p
                                className="text-[11px] font-bold uppercase tracking-wide text-left"
                                style={{
                                  color: isLight
                                    ? "rgba(0,0,0,0.45)"
                                    : "rgba(255,255,255,0.4)",
                                }}
                              >
                                {e.score?.toLocaleString()} pts
                              </p>
                            </div>
                          </div>
                          <p
                            className="font-black text-lg tracking-tight text-right shrink-0 ml-2"
                            style={{ color: isLight ? "#b45309" : "#fbbf24" }}
                          >
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
                    <h2
                      className="text-2xl font-black leading-none"
                      style={{
                        color: isLight ? "rgba(20,10,60,0.9)" : "white",
                      }}
                    >
                      先生用管理
                    </h2>
                    <button
                      onClick={() => setScreen("start")}
                      className="p-3 rounded-[12px] font-black uppercase text-[10px] flex items-center gap-2 text-center active:opacity-70"
                      style={{
                        background: isLight
                          ? "rgba(0,0,0,0.05)"
                          : "rgba(255,255,255,0.08)",
                        color: isLight
                          ? "rgba(0,0,0,0.5)"
                          : "rgba(255,255,255,0.5)",
                        border: isLight
                          ? "1px solid rgba(0,0,0,0.15)"
                          : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <Home size={18} /> 終了
                    </button>
                  </div>
                  <div
                    className="rounded-[20px] p-6 text-white space-y-4 relative overflow-hidden text-left"
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
                      className="w-full p-4 rounded-[20px] text-base outline-none transition-all min-h-[100px] text-left"
                      style={{
                        background: isLight
                          ? "rgba(0,0,0,0.05)"
                          : "rgba(255,255,255,0.1)",
                        border: isLight
                          ? "1px solid rgba(0,0,0,0.15)"
                          : "1px solid rgba(255,255,255,0.2)",
                        color: theme.text,
                      }}
                    />
                    <button
                      onClick={handleAddAnnouncement}
                      className="w-full py-3.5 rounded-[12px] font-black text-base active:opacity-80 transition-all text-center"
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
                    className="rounded-[20px] p-6 space-y-4 text-left"
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
                      className="rounded-[12px] p-4 text-center"
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
                        className="flex-1 px-4 py-3 rounded-[12px] font-mono font-black text-sm outline-none tracking-widest"
                        style={{
                          background: isLight
                            ? "rgba(0,0,0,0.05)"
                            : "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          color: theme.text,
                        }}
                      />
                      <button
                        onClick={saveInviteCode}
                        disabled={
                          isSavingInviteCode || !editingInviteCode.trim()
                        }
                        className="px-5 py-3 rounded-[12px] font-black text-sm active:opacity-80 transition-all"
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
                    className="rounded-[20px] p-6 space-y-4 text-left"
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
                      className="rounded-[12px] p-4 space-y-2"
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
                      className="rounded-[12px] p-4 space-y-2"
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
                      className="rounded-[12px] p-4 space-y-2"
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
                                style={{
                                  borderColor: "rgba(255,255,255,0.05)",
                                }}
                              >
                                {v}
                              </div>
                            )
                          )}
                          {[
                            "benefit",
                            "利益・恩恵",
                            "Fresh air is a benefit.",
                          ].map((v, i) => (
                            <div
                              key={i}
                              className="px-3 py-2 text-white/40 text-[10px]"
                            >
                              {v}
                            </div>
                          ))}
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
                        className="w-full px-4 py-3 rounded-[12px] text-sm font-mono outline-none"
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
                          onChange={(e) =>
                            setSheetStage(Number(e.target.value))
                          }
                          className="w-20 px-3 py-2 rounded-[12px] text-sm font-black outline-none text-center"
                          style={{
                            background: isLight
                              ? "rgba(0,0,0,0.05)"
                              : "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(16,185,129,0.25)",
                            color: theme.text,
                          }}
                        />
                        <button
                          onClick={() => importFromSheet(sheetUrl, sheetStage)}
                          disabled={!sheetUrl.trim() || sheetImporting}
                          className="flex-1 py-2.5 rounded-[12px] font-black text-sm active:opacity-80 transition-all"
                          style={{
                            background: sheetUrl.trim()
                              ? "linear-gradient(135deg,#059669,#10b981)"
                              : isLight
                              ? "rgba(0,0,0,0.06)"
                              : "rgba(255,255,255,0.08)",
                            color: sheetUrl.trim() ? "white" : theme.text,
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
                            className="rounded-[12px] p-3 space-y-1"
                            style={{
                              background: "rgba(239,68,68,0.10)",
                              border: "1px solid rgba(239,68,68,0.25)",
                            }}
                          >
                            {sheetPreview.errors.map((e, i) => (
                              <p
                                key={i}
                                className="text-xs text-red-400 font-bold"
                              >
                                {e}
                              </p>
                            ))}
                          </div>
                        )}
                        {/* 単語プレビュー（最大5件） */}
                        <div
                          className="rounded-[12px] overflow-hidden"
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
                            className="flex-1 py-3 rounded-[12px] font-black text-sm active:opacity-80 transition-all"
                            style={{
                              background:
                                "linear-gradient(135deg,#059669,#10b981)",
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
                            className="flex-1 py-3 rounded-[12px] font-black text-sm active:opacity-80 transition-all"
                            style={{
                              background:
                                "linear-gradient(135deg,#dc2626,#ef4444)",
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
                    className="rounded-[20px] p-6 space-y-4 text-left"
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
                        className="px-4 py-2 rounded-[12px] font-black text-xs active:opacity-70 transition-all"
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
                              className="flex items-center justify-between p-3 rounded-[12px]"
                              style={{ background: "rgba(255,255,255,0.05)" }}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-[12px] flex items-center justify-center text-sm overflow-hidden shrink-0 ${
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
                    className="rounded-[20px] p-6 space-y-4 text-left"
                    style={{
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.2)",
                    }}
                  >
                    <h3 className="font-black text-xl flex items-center gap-3 text-indigo-300">
                      <User size={22} /> 先生管理
                    </h3>
                    <p className="text-white/30 text-xs font-bold">
                      自分以外の先生アカウントを削除できます。
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {teacherList.filter((t) => t.uid !== user?.uid).length ===
                      0 ? (
                        <p className="text-white/30 text-sm font-bold text-center py-4">
                          他の先生なし
                        </p>
                      ) : (
                        teacherList
                          .filter((t) => t.uid !== user?.uid)
                          .map((t) => (
                            <div
                              key={t.uid}
                              className="flex items-center justify-between p-3 rounded-[12px]"
                              style={{ background: "rgba(255,255,255,0.05)" }}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-[12px] flex items-center justify-center text-sm overflow-hidden shrink-0 ${
                                    t.avatar?.startsWith("data:")
                                      ? ""
                                      : t.color || "bg-indigo-500"
                                  }`}
                                >
                                  {t.avatar?.startsWith("data:") ? (
                                    <img
                                      src={t.avatar}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    t.avatar || "👤"
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-white font-bold text-sm leading-none truncate">
                                    {t.name ||
                                      allUsersMap[t.uid]?.name ||
                                      "（名前なし）"}
                                  </p>
                                  <p className="text-indigo-300/50 text-[10px] font-bold font-mono">
                                    {t.shortId || t.uid?.slice(0, 8)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  handleDeleteUser(
                                    t.uid,
                                    t.shortId || t.uid?.slice(0, 8)
                                  )
                                }
                                className="p-2 rounded-[12px] text-rose-400 active:opacity-70 transition-all shrink-0 ml-2"
                                style={{
                                  background: "rgba(239,68,68,0.15)",
                                  border: "1px solid rgba(239,68,68,0.3)",
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  <div
                    className="rounded-[20px] p-6 space-y-4 text-left"
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
                      つぶやき・発言権限（タップでON/OFF）
                    </div>
                    {/* 一括コイン配布 */}
                    <div
                      className="rounded-[12px] p-3 flex items-center gap-2"
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
                            showToast(
                              "配布ポイントを入力してください",
                              "error"
                            );
                            return;
                          }
                          if (
                            !window.confirm(
                              `全ユーザー(${leaderboard.length}人)に${amt}ptを配布しますか？`
                            )
                          )
                            return;
                          for (const u of leaderboard) {
                            await handleGiveCoins(
                              u.uid || u.id,
                              u.name,
                              amt
                            ).catch(() => null);
                          }
                          setCoinInputs((prev) => ({ ...prev, __all__: "" }));
                        }}
                        className="px-3 py-1.5 rounded-[12px] font-black text-xs text-yellow-900 active:opacity-70 transition-all"
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
                            className="flex items-center justify-between p-3 rounded-[12px]"
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
                                  className={`w-8 h-8 rounded-[12px] flex items-center justify-center text-sm overflow-hidden ${
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
                                  {(u.uid || u.id) === user?.uid
                                    ? "自分"
                                    : u.name}
                                </p>
                                <p className="text-white/30 text-[10px] font-bold">
                                  {u.shortId}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div
                                className="flex items-center gap-1 rounded-[12px] overflow-hidden"
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
                                className="p-2 rounded-[12px] active:opacity-70 transition-all shrink-0"
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
                                        border:
                                          "1px solid rgba(201,168,76,0.4)",
                                      }
                                    : {
                                        background: "rgba(255,255,255,0.06)",
                                        border:
                                          "1px solid rgba(255,255,255,0.12)",
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
                                className="p-2 rounded-[12px] text-rose-400 active:opacity-70 transition-all"
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
                      className="p-2 rounded-[12px] active:opacity-70 transition-all"
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
                      className="text-2xl font-black"
                      style={{ color: theme.text }}
                    >
                      設定
                    </h2>
                  </div>

                  {/* ── プロフィール ── */}
                  <div
                    className="rounded-[20px] p-5 mb-4"
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
                          } rounded-[20px] flex items-center justify-center overflow-hidden shrink-0`}
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
                              const AvatarIc =
                                AVATAR_ICONS[selectedAvatar.char];
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
                            className="w-full px-4 py-3 rounded-[12px] font-black text-base outline-none"
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
                              // プロフィール本体を更新
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
                              // ランキング（leaderboard）に名前を反映
                              if (!updated.isTeacher) {
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
                                  {
                                    name: updated.name,
                                    displayName: updated.displayName,
                                    avatar: updated.avatar,
                                    color: updated.color,
                                  },
                                  { merge: true }
                                );
                              } else {
                                // 先生はteacherIndexに名前を反映（称え場の名前解決用）
                                await setDoc(
                                  doc(
                                    fb.db,
                                    "artifacts",
                                    fb.appId,
                                    "public",
                                    "data",
                                    "teacherIndex",
                                    user.uid
                                  ),
                                  {
                                    name: updated.name,
                                    displayName: updated.displayName,
                                    avatar: updated.avatar,
                                    color: updated.color,
                                  },
                                  { merge: true }
                                ).catch(() => null);
                              }
                              // 自分のフレンド全員の名簿にも名前を反映
                              const myFriendsSnap = await getDocs(
                                collection(
                                  fb.db,
                                  "artifacts",
                                  fb.appId,
                                  "users",
                                  user.uid,
                                  "friends"
                                )
                              );
                              await Promise.allSettled(
                                myFriendsSnap.docs.map((fd) =>
                                  setDoc(
                                    doc(
                                      fb.db,
                                      "artifacts",
                                      fb.appId,
                                      "users",
                                      fd.id,
                                      "friends",
                                      user.uid
                                    ),
                                    {
                                      name: updated.name,
                                      displayName: updated.displayName,
                                      avatar: updated.avatar,
                                      color: updated.color,
                                    },
                                    { merge: true }
                                  ).catch(() => null)
                                )
                              );
                            } catch {}
                          }
                          // ローカルのleaderboard stateも即時反映（FirestoreのonSnapshot遅延対策）
                          setLeaderboard((prev) =>
                            prev.map((entry) =>
                              entry.id === user?.uid || entry.uid === user?.uid
                                ? {
                                    ...entry,
                                    name: updated.name,
                                    displayName: updated.displayName,
                                  }
                                : entry
                            )
                          );
                          // allUsersMapも即時反映
                          setAllUsersMap((prev) => ({
                            ...prev,
                            [user.uid]: {
                              ...prev[user.uid],
                              name: updated.name,
                              avatar:
                                updated.avatar || prev[user.uid]?.avatar || "",
                              color:
                                updated.color || prev[user.uid]?.color || "",
                              isTeacher: !!updated.isTeacher,
                            },
                          }));
                          setIsSavingProfile(false);
                          showToast("ニックネームを保存しました！");
                        }}
                        disabled={isSavingProfile || !newName.trim()}
                        className="w-full py-3 rounded-[12px] font-black text-white text-sm active:scale-95 transition-all disabled:opacity-40"
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
                              className="flex flex-col items-center gap-1 py-2 rounded-[12px] transition-all active:scale-95"
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
                                  !avatarImage &&
                                  selectedAvatar.char === ha.char;
                                return (
                                  <button
                                    key={ha.char}
                                    onClick={() => {
                                      setSelectedAvatar(ha);
                                      setAvatarImage(null);
                                    }}
                                    className="flex flex-col items-center gap-1 py-2 rounded-[12px] transition-all active:scale-95"
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
                            className={`h-9 rounded-[12px] ${c.bg} transition-all`}
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
                              // プロフィール本体を更新
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
                              // ランキング（leaderboard）にアバター・カラーを反映
                              if (!updated.isTeacher) {
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
                                  {
                                    name: updated.name,
                                    displayName: updated.displayName,
                                    avatar: updated.avatar,
                                    color: updated.color,
                                  },
                                  { merge: true }
                                );
                              } else {
                                // 先生はteacherIndexにアバター・カラーも反映
                                await setDoc(
                                  doc(
                                    fb.db,
                                    "artifacts",
                                    fb.appId,
                                    "public",
                                    "data",
                                    "teacherIndex",
                                    user.uid
                                  ),
                                  {
                                    name: updated.name,
                                    displayName: updated.displayName,
                                    avatar: updated.avatar,
                                    color: updated.color,
                                  },
                                  { merge: true }
                                ).catch(() => null);
                              }
                              // 自分のフレンド全員の名簿にもアバター・カラーを反映
                              const myFriendsSnap = await getDocs(
                                collection(
                                  fb.db,
                                  "artifacts",
                                  fb.appId,
                                  "users",
                                  user.uid,
                                  "friends"
                                )
                              );
                              await Promise.allSettled(
                                myFriendsSnap.docs.map((fd) =>
                                  setDoc(
                                    doc(
                                      fb.db,
                                      "artifacts",
                                      fb.appId,
                                      "users",
                                      fd.id,
                                      "friends",
                                      user.uid
                                    ),
                                    {
                                      name: updated.name,
                                      displayName: updated.displayName,
                                      avatar: updated.avatar,
                                      color: updated.color,
                                    },
                                    { merge: true }
                                  ).catch(() => null)
                                )
                              );
                            } catch {}
                          }
                          // ローカルのleaderboard stateも即時反映（FirestoreのonSnapshot遅延対策）
                          setLeaderboard((prev) =>
                            prev.map((entry) =>
                              entry.id === user?.uid || entry.uid === user?.uid
                                ? {
                                    ...entry,
                                    avatar: updated.avatar,
                                    color: updated.color,
                                  }
                                : entry
                            )
                          );
                          // allUsersMapも即時反映
                          setAllUsersMap((prev) => ({
                            ...prev,
                            [user.uid]: {
                              ...prev[user.uid],
                              name: updated.name || prev[user.uid]?.name || "",
                              avatar: updated.avatar,
                              color: updated.color,
                              isTeacher: !!updated.isTeacher,
                            },
                          }));
                          setIsSavingProfile(false);
                          showToast("アバターを保存しました！");
                        }}
                        disabled={isSavingProfile}
                        className="w-full py-3 rounded-[12px] font-black text-white text-sm active:scale-95 transition-all disabled:opacity-40"
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
                    className="rounded-[20px] p-5 mb-4"
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
                          className="py-3 px-4 rounded-[12px] flex items-center gap-2 font-black text-sm active:opacity-70 transition-all"
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
                    className="rounded-[20px] p-5 mb-4"
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
                    className="rounded-[20px] p-5 mb-4"
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
                        className="w-full px-4 py-3 rounded-[12px] font-bold text-sm outline-none"
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
                          className="w-full px-4 py-3 rounded-[12px] font-bold text-sm outline-none"
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
                          className="w-full py-3 rounded-[12px] font-black text-white text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg,#10b981,#059669)",
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
                      className="rounded-[20px] p-5 mb-4"
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
                          className="flex-1 px-4 py-2.5 rounded-[12px] font-mono text-sm outline-none"
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
                          className="px-4 py-2.5 rounded-[12px] font-black text-xs active:opacity-70 transition-all"
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
                    className="rounded-[20px] p-5 mb-4"
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
                        className="w-full py-3 rounded-[12px] font-bold text-sm active:opacity-70 flex items-center justify-center gap-2"
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
                        className="w-full py-3 rounded-[12px] font-bold text-xs active:opacity-70"
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
                        className="w-full py-3 rounded-[12px] font-bold text-xs active:opacity-70"
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
                  {/* ── デバッグ（先生・管理者のみ） ── */}
                  {isAdmin && (
                    <div
                      className="rounded-[20px] p-5 mb-4"
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
                        デバッグ
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className="text-sm font-bold"
                            style={{ color: theme.text }}
                          >
                            全ステージ開放
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: theme.textMuted }}
                          >
                            デバッグ用。全カテゴリの全ステージをプレイ可能にする
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const next = !debugUnlockAll;
                            setDebugUnlockAll(next);
                            localStorage.setItem(
                              "genron_debugUnlock",
                              JSON.stringify(next)
                            );
                          }}
                          className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                          style={{
                            background: debugUnlockAll
                              ? "#f59e0b"
                              : isLight
                              ? "rgba(0,0,0,0.15)"
                              : "rgba(255,255,255,0.15)",
                          }}
                        >
                          <span
                            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                            style={{
                              left: debugUnlockAll
                                ? "calc(100% - 22px)"
                                : "2px",
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  )}
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
                    const wordData = {
                      en,
                      ja,
                      sentence,
                      createdAt: Date.now(),
                    };
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
                      } catch (e: any) {
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
                          className="p-2 rounded-[12px] active:opacity-70 transition-all"
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
                          <ChevronLeft
                            size={20}
                            style={{ color: theme.text }}
                          />
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
                        className="rounded-[20px] p-5 mb-4"
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
                            className="w-full py-3 rounded-[12px] font-black text-white text-sm active:scale-95 transition-all disabled:opacity-40"
                            style={{
                              background:
                                "linear-gradient(135deg,#f97316,#ea580c)",
                              boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
                            }}
                          >
                            {factoryAdding
                              ? "追加中..."
                              : "＋ マイワードに追加"}
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
                                  className="flex items-center gap-3 p-3 rounded-[20px]"
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
                                        style={{
                                          color: theme.text,
                                          fontSize: 15,
                                        }}
                                      >
                                        {word.en}
                                      </p>
                                      <p
                                        className="font-bold text-sm"
                                        style={{
                                          color: "rgba(255,255,255,0.5)",
                                        }}
                                      >
                                        {word.ja}
                                      </p>
                                    </div>
                                    {word.sentence && (
                                      <p
                                        className="text-xs italic mt-0.5"
                                        style={{
                                          color: "rgba(255,255,255,0.3)",
                                        }}
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
                                              prev.filter(
                                                (r) => r.en !== word.en
                                              )
                                            );
                                          }
                                          showToast(
                                            "復習リストから削除しました"
                                          );
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
                                          showToast(
                                            "復習リストに追加しました！"
                                          );
                                        }
                                      }}
                                      className="w-8 h-8 rounded-[12px] flex items-center justify-center transition-all active:scale-90"
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
                                      className="w-8 h-8 rounded-[12px] flex items-center justify-center"
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
                  const saveNotes = (newNotesOrFn) => {
                    setNotes((prev) => {
                      const next =
                        typeof newNotesOrFn === "function"
                          ? newNotesOrFn(prev)
                          : newNotesOrFn;
                      try {
                        localStorage.setItem(
                          "oritan_notes",
                          JSON.stringify(next)
                        );
                      } catch {}
                      return next;
                    });
                  };
                  const addNote = () => {
                    if (!noteInput.trim()) return;
                    const newNote = {
                      id: Date.now().toString(),
                      text: noteInput.trim(),
                      createdAt: new Date().toISOString(),
                      pinned: false,
                    };
                    saveNotes((prev) => [newNote, ...prev]);
                    setNoteInput("");
                  };
                  const deleteNote = (id) =>
                    saveNotes((prev) => prev.filter((n) => n.id !== id));
                  const startEdit = (note) => {
                    setNoteEditId(note.id);
                    setNoteEditText(note.text);
                  };
                  const saveEdit = () => {
                    if (!noteEditText.trim()) return;
                    saveNotes((prev) =>
                      prev.map((n) =>
                        n.id === noteEditId
                          ? { ...n, text: noteEditText.trim() }
                          : n
                      )
                    );
                    setNoteEditId(null);
                    setNoteEditText("");
                  };
                  const togglePin = (id) =>
                    saveNotes((prev) =>
                      prev.map((n) =>
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
                      style={{
                        paddingBottom: "calc(var(--nav-height, 100px) + 10px)",
                      }}
                    >
                      {/* ヘッダー */}
                      <div className="flex items-center gap-3 mb-5">
                        <button
                          onClick={() => setScreen(prevScreen || "start")}
                          className="p-2 rounded-[12px] active:opacity-70 transition-all"
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
                          <ChevronLeft
                            size={20}
                            style={{ color: theme.text }}
                          />
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
                        className="rounded-[20px] p-4 mb-4"
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
                            className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] font-black text-sm active:opacity-70 transition-all disabled:opacity-40"
                            style={{
                              background:
                                "linear-gradient(135deg,#0ea5e9,#38bdf8)",
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
                            className="w-full rounded-[20px] px-4 py-3 text-sm font-medium outline-none"
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
                              className="rounded-[20px] p-4"
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
                                      className="flex-1 py-2 rounded-[12px] font-black text-xs active:opacity-70"
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
                                      className="px-4 py-2 rounded-[12px] font-black text-xs active:opacity-70"
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
                                        className="p-2 rounded-[12px] active:opacity-70 transition-all"
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
                                            note.pinned
                                              ? "currentColor"
                                              : "none"
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
                                        className="p-2 rounded-[12px] active:opacity-70 transition-all"
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
                                        className="p-2 rounded-[12px] active:opacity-70 transition-all"
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
                  const saveTweets = async (newTweetsOrFn) => {
                    setTweets((prev) => {
                      const next =
                        typeof newTweetsOrFn === "function"
                          ? newTweetsOrFn(prev)
                          : newTweetsOrFn;
                      try {
                        localStorage.setItem(
                          "oritan_tweets",
                          JSON.stringify(next)
                        );
                      } catch {}
                      return next;
                    });
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
                      saveTweets((prev) => [
                        { id: Date.now().toString(), ...t },
                        ...prev,
                      ]);
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
                      style={{
                        paddingBottom: "calc(var(--nav-height, 100px) + 10px)",
                      }}
                    >
                      {/* ヘッダー */}
                      <div className="flex items-center gap-3 mb-5">
                        <button
                          onClick={() => setScreen(prevScreen || "start")}
                          className="p-2 rounded-[12px] active:opacity-70 transition-all"
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
                          <ChevronLeft
                            size={20}
                            style={{ color: theme.text }}
                          />
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
                      {profile?.isTeacher ||
                      (chatSettings.allowedUids || []).includes(user?.uid) ? (
                        <div
                          className="rounded-[20px] p-4 mb-5"
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
                                if (Av)
                                  return <Av size={32} color="currentColor" />;
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
                                  <IcDefaultUser size={28} color="#1d9bf0" />
                                );
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
                              className="relative mt-3 rounded-[12px] overflow-hidden"
                              style={{ maxHeight: 200 }}
                            >
                              <img
                                src={tweetImage}
                                alt="添付画像"
                                className="w-full object-cover rounded-[12px]"
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
                                background:
                                  "linear-gradient(135deg,#1d9bf0,#60cdff)",
                                color: "#fff",
                              }}
                            >
                              つぶやく
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="p-6 mb-4 rounded-[20px] text-center"
                          style={{
                            background: isLight
                              ? "rgba(0,0,0,0.03)"
                              : "rgba(255,255,255,0.03)",
                            border: "1px dashed rgba(29,155,240,0.2)",
                          }}
                        >
                          <p
                            className="text-sm font-bold opacity-40"
                            style={{ color: theme.text }}
                          >
                            先生からつぶやき権限が付与されると投稿できるようになります
                          </p>
                        </div>
                      )}

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
                            const retweeted = (tw.retweets || []).includes(
                              myUid
                            );
                            const isOwn = tw.uid === myUid;
                            const showComments = tweetCommentTarget === tw.id;
                            return (
                              <div
                                key={tw.id}
                                className="rounded-[20px] p-4"
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
                                        <IcDefaultUser
                                          size={28}
                                          color="#1d9bf0"
                                        />
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
                                        className="mt-2 rounded-[12px] overflow-hidden"
                                        style={{ maxHeight: 220 }}
                                      >
                                        <img
                                          src={tw.image}
                                          alt="添付画像"
                                          className="w-full object-cover rounded-[12px]"
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
                                      <IcTrash2
                                        size={14}
                                        color="currentColor"
                                      />
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
                                      color: liked
                                        ? "#f91880"
                                        : theme.textMuted,
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
                                      color={
                                        retweeted ? "#00ba7c" : "currentColor"
                                      }
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
                                        showComments
                                          ? "#1d9bf0"
                                          : "currentColor"
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
                                          <div
                                            key={c.id}
                                            className="flex gap-2"
                                          >
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
                                              className="rounded-[12px] px-3 py-2 flex-1"
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
                                              <Av
                                                size={22}
                                                color="currentColor"
                                              />
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
                  style={{
                    paddingBottom: "calc(var(--nav-height, 100px) + 10px)",
                  }}
                >
                  {/* ヘッダー */}
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => setScreen(prevScreen || "start")}
                      className="p-2 rounded-[12px] active:opacity-70 transition-all"
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
                      style={{ color: isLight ? "#1a1040" : "#fff" }}
                    >
                      ショップ
                    </h2>
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-[20px]"
                      style={{
                        background: isLight
                          ? "rgba(180,130,0,0.1)"
                          : "rgba(250,204,21,0.15)",
                        border: `1px solid ${
                          isLight
                            ? "rgba(180,130,0,0.25)"
                            : "rgba(250,204,21,0.3)"
                        }`,
                      }}
                    >
                      <IcCoin
                        size={20}
                        color={isLight ? "#b45309" : "#facc15"}
                      />
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
                    className="flex gap-2 mb-4 p-1 rounded-[20px]"
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
                        className="flex-1 py-2 rounded-[12px] font-black text-xs transition-all"
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
                        const owned = (profile?.ownedPets || []).includes(
                          pet.id
                        );
                        const isActive =
                          (profile?.activePet || "bearcat") === pet.id;
                        const canAfford =
                          (profile?.petPoints || 0) >= pet.price;
                        return (
                          <div
                            key={pet.id}
                            className="rounded-[20px] p-4 text-center"
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
                                className="w-full py-2 rounded-[12px] font-black text-[11px] active:opacity-70 transition-all"
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
                        const owned = (
                          profile?.ownedAccessories || []
                        ).includes(acc.id);
                        const isActive = (
                          profile?.activeAccessories || []
                        ).includes(acc.id);
                        const canAfford =
                          (profile?.petPoints || 0) >= acc.price;
                        return (
                          <div
                            key={acc.id}
                            className="rounded-[20px] p-4 text-center"
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
                                className="w-full py-2 rounded-[12px] font-black text-[11px] active:opacity-70 transition-all"
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
                        const owned = (
                          profile?.ownedRoomBgs || ["night"]
                        ).includes(bg.id);
                        const isActive =
                          (profile?.activeRoomBg || "night") === bg.id;
                        const canAfford = (profile?.petPoints || 0) >= bg.price;
                        return (
                          <div
                            key={bg.id}
                            className="rounded-[20px] p-3 text-center"
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
                              className="w-full rounded-[12px] mb-2 flex items-end justify-center overflow-hidden"
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
                                    color={
                                      bg.iconColor || "rgba(255,255,255,0.9)"
                                    }
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
                                  }}
                                  className="w-full py-1.5 rounded-[12px] font-black text-[10px] active:opacity-70"
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
                                  showToast(`${bg.name}を購入しました！`);
                                }}
                                disabled={!canAfford}
                                className="w-full py-1.5 rounded-[12px] font-black text-[10px] active:opacity-70 disabled:opacity-40"
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
                        flex: 1,
                        minHeight: 0,
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
                          className="p-2 rounded-[12px] active:opacity-70 transition-all"
                          style={{
                            background: isLight
                              ? "rgba(0,0,0,0.04)"
                              : "rgba(255,255,255,0.08)",
                            border: isLight
                              ? "1px solid rgba(0,0,0,0.15)"
                              : "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <ChevronLeft />
                        </button>
                        <h2 className="text-2xl font-black text-white flex-1">
                          ペットの部屋
                        </h2>
                        <div
                          className="flex items-center gap-2 px-3 py-1.5 rounded-[20px]"
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
                            className="px-6 py-3 rounded-[20px] font-black text-white"
                            style={{
                              background:
                                "linear-gradient(135deg,#f59e0b,#fbbf24)",
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
                              const activeBgId =
                                profile?.activeRoomBg || "night";
                              const roomBg =
                                SHOP_BACKGROUNDS.find(
                                  (b) => b.id === activeBgId
                                ) || SHOP_BACKGROUNDS[0];
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
                                    minHeight: 220,
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
                                            <stop
                                              offset="0%"
                                              stopColor="#4a9a30"
                                            />
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
                                            <stop
                                              offset="0%"
                                              stopColor="#40b0e0"
                                            />
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
                                          <g
                                            key={i}
                                            opacity={0.3 + (i % 3) * 0.1}
                                          >
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
                                          0, 30, 60, 90, 120, 150, 180, 210,
                                          240, 270, 300, 330,
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
                                            {[0, 30, 60, 90, 120, 150].map(
                                              (a) => {
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
                                              }
                                            )}
                                            {[0, 30, 60, 90, 120, 150].map(
                                              (a) => {
                                                const r = (a * Math.PI) / 180;
                                                return (
                                                  <g key={a}>
                                                    <line
                                                      x1={Math.cos(r) * 5}
                                                      y1={Math.sin(r) * 5}
                                                      x2={
                                                        Math.cos(r) * 5 +
                                                        Math.cos(
                                                          r + Math.PI / 2
                                                        ) *
                                                          3
                                                      }
                                                      y2={
                                                        Math.sin(r) * 5 +
                                                        Math.sin(
                                                          r + Math.PI / 2
                                                        ) *
                                                          3
                                                      }
                                                      stroke="#c0d8ff"
                                                      strokeWidth="1"
                                                    />
                                                    <line
                                                      x1={Math.cos(r) * 5}
                                                      y1={Math.sin(r) * 5}
                                                      x2={
                                                        Math.cos(r) * 5 +
                                                        Math.cos(
                                                          r - Math.PI / 2
                                                        ) *
                                                          3
                                                      }
                                                      y2={
                                                        Math.sin(r) * 5 +
                                                        Math.sin(
                                                          r - Math.PI / 2
                                                        ) *
                                                          3
                                                      }
                                                      stroke="#c0d8ff"
                                                      strokeWidth="1"
                                                    />
                                                  </g>
                                                );
                                              }
                                            )}
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
                                      -160, -100, -40, 20, 80, 140, 200, 260,
                                      320, 380, 440, 500,
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
                                          const globalIdx = ownedPets
                                            ? ownedPets.indexOf(pet)
                                            : 0;
                                          const pd = getPetData(pet.id);
                                          const affection = pd.affection || 0;
                                          const petLv =
                                            getPetLvFromAffection(affection);
                                          const PIcon =
                                            PET_ICONS[pet.id] || IcPet;
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
                                                            ACC_ICONS[
                                                              headAcc.id
                                                            ];
                                                          return A ? (
                                                            <A
                                                              size={
                                                                iconSize * 0.45
                                                              }
                                                              color="currentColor"
                                                            />
                                                          ) : (
                                                            <IcGift
                                                              size={
                                                                iconSize * 0.45
                                                              }
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
                                                          display:
                                                            "inline-flex",
                                                        }}
                                                      >
                                                        <PIcon
                                                          size={iconSize}
                                                        />
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
                                                            ACC_ICONS[
                                                              faceAcc.id
                                                            ];
                                                          return A ? (
                                                            <A
                                                              size={
                                                                iconSize * 0.38
                                                              }
                                                              color="currentColor"
                                                            />
                                                          ) : (
                                                            <IcGift
                                                              size={
                                                                iconSize * 0.38
                                                              }
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
                                                          0, 45, 90, 135, 180,
                                                          225, 270, 315,
                                                        ];
                                                        const dist =
                                                          iconSize * 1.1;
                                                        return (
                                                          <>
                                                            {angles.map(
                                                              (deg, ei) => {
                                                                const rad =
                                                                  (deg *
                                                                    Math.PI) /
                                                                  180;
                                                                const dx =
                                                                  Math.round(
                                                                    Math.cos(
                                                                      rad
                                                                    ) * dist
                                                                  );
                                                                const dy =
                                                                  Math.round(
                                                                    Math.sin(
                                                                      rad
                                                                    ) *
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
                                                                        ei *
                                                                        0.05
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
                                                                      25 +
                                                                      i * 17
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
                                                                      0.8 +
                                                                      i * 0.18
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
                                                                    filled={
                                                                      true
                                                                    }
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
                                                        Math.round(
                                                          9 * lane.scale
                                                        )
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
                                            (profile?.petPoints || 0) -
                                            bg.price,
                                          ownedRoomBgs: [
                                            ...(profile?.ownedRoomBgs || [
                                              "night",
                                            ]),
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
                                            bg.iconColor ||
                                            "rgba(255,255,255,0.9)"
                                          }
                                        />
                                      ) : null}
                                      {!owned && (
                                        <span
                                          style={{
                                            fontSize: 7,
                                            fontWeight: 900,
                                            color: "#fbbf24",
                                            textShadow:
                                              "0 1px 3px rgba(0,0,0,0.9)",
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
                            data-care-scroll
                            style={{
                              flex: 1,
                              minHeight: 0,
                              overflowY: "auto",
                              scrollbarWidth: "none",
                              msOverflowStyle: "none",
                              paddingBottom: 32,
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
                    setReviewList((prev) =>
                      prev.filter((r) => r.id !== item.id)
                    );
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
                      } catch (e: any) {}
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
                          className="p-2 rounded-[12px] active:opacity-70 transition-all"
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
                              className="flex-1 py-2 rounded-[12px] font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
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
                          className="p-16 text-center font-bold rounded-[20px]"
                          style={{
                            color: isLight
                              ? "rgba(0,0,0,0.35)"
                              : "rgba(255,255,255,0.3)",
                            background: isLight
                              ? "rgba(0,0,0,0.04)"
                              : "rgba(255,255,255,0.04)",
                            border: isLight
                              ? "1px solid rgba(0,0,0,0.08)"
                              : "none",
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
                                className="p-5 rounded-[20px] flex justify-between items-center"
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
                                    {getOptionLabel(item, "en-ja")}
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
                                  className="ml-4 p-4 transition-all active:scale-90 rounded-[12px]"
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
                                className="rounded-[20px] p-6 text-center shrink-0"
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
                                  {!/[ぁ-ん々ー一-鿿ｦ-ﾟ]/.test(
                                    currentWord.en
                                  ) && (
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
                                  {isVT(currentWord) && (
                                    <span
                                      style={{
                                        fontSize: "0.55em",
                                        opacity: 0.55,
                                        marginLeft: "0.25em",
                                        fontWeight: 800,
                                      }}
                                    >
                                      {" "}
                                      A
                                    </span>
                                  )}
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
                                    const isSelected =
                                      reviewQuizFeedback !== null;
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
                                          if (reviewQuizFeedback !== null)
                                            return;
                                          setReviewQuizFeedback(opt.en);
                                          const correct =
                                            opt.en === currentWord.en;
                                          if (correct) {
                                            showToast("⭕ 正解！ (+1コイン)");
                                            // コイン加算処理
                                            const newPts =
                                              (profile?.petPoints || 0) + 1;
                                            const updated = {
                                              ...profile,
                                              petPoints: newPts,
                                            };
                                            setProfile(updated);
                                            saveLocal("profile", updated);
                                            if (user && fb.enabled) {
                                              setDoc(
                                                doc(
                                                  fb.db,
                                                  "artifacts",
                                                  fb.appId,
                                                  "users",
                                                  user.uid,
                                                  "profile",
                                                  "main"
                                                ),
                                                { petPoints: newPts },
                                                { merge: true }
                                              ).catch(() => null);
                                            }

                                            setTimeout(async () => {
                                              // 正解したら復習リストから削除
                                              await removeReviewItem(
                                                currentWord
                                              );
                                              const nextList =
                                                reviewList.filter(
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
                                              startReviewQuiz(
                                                nextIdx,
                                                nextList
                                              );
                                            }, 900);
                                          } else {
                                            showToast(
                                              `✗ 不正解 → ${getOptionLabel(
                                                currentWord,
                                                "en-ja"
                                              )}`,
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
                                              startReviewQuiz(
                                                nextIdx,
                                                reviewList
                                              );
                                            }, 1200);
                                          }
                                        }}
                                        className="rounded-[20px] p-4 text-left transition-all active:scale-95 font-bold"
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
                                        {getOptionLabel(opt, "en-ja")}
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
                          const sentenceList = reviewList.filter(
                            (w) => w.sentence
                          );
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
                                className="rounded-[20px] p-6 text-center shrink-0"
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
                                      {getOptionLabel(word, "en-ja")}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {/* ボタン */}
                              <div className="flex gap-3 shrink-0">
                                {!revealed ? (
                                  <button
                                    onClick={() => setRevealed(true)}
                                    className="flex-1 py-4 rounded-[20px] font-black text-white active:scale-95 transition-all"
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
                                        showToast("✓ 覚えた！ (+1コイン)");
                                        // コイン加算処理
                                        const newPts =
                                          (profile?.petPoints || 0) + 1;
                                        const updated = {
                                          ...profile,
                                          petPoints: newPts,
                                        };
                                        setProfile(updated);
                                        saveLocal("profile", updated);
                                        if (user && fb.enabled) {
                                          setDoc(
                                            doc(
                                              fb.db,
                                              "artifacts",
                                              fb.appId,
                                              "users",
                                              user.uid,
                                              "profile",
                                              "main"
                                            ),
                                            { petPoints: newPts },
                                            { merge: true }
                                          ).catch(() => null);
                                        }
                                      }}
                                      className="flex-1 py-4 rounded-[20px] font-black active:scale-95 transition-all"
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
                                      className="flex-1 py-4 rounded-[20px] font-black active:scale-95 transition-all"
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
                        } catch (e: any) {}
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
                          className="p-2 rounded-[12px] active:opacity-70 transition-all"
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
                                vocabList.filter(
                                  (v) => v.stage === wordbookStage
                                ).length
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
                                iconFn: (c) => (
                                  <IcFactory size={13} color={c} />
                                ),
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
                                  className="flex-1 py-2 rounded-[12px] font-black text-sm transition-all flex items-center justify-center gap-1.5"
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
                          paddingBottom: "8px",
                        }}
                      >
                        {wordbookTab === "stage" &&
                          wordbookStage === null &&
                          (() => {
                            const catVocab = ALL_VOCAB.filter(
                              (v) =>
                                (v.category || "英単語") === wordbookCategory
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
                                    s <=
                                    ((profile?.unlockedStages || {})[
                                      wordbookCategory
                                    ] || 1);
                                  const catColor =
                                    WORD_CATEGORIES.find(
                                      (c) => c.key === wordbookCategory
                                    )?.color || "#0891b2";
                                  return (
                                    <button
                                      key={s}
                                      onClick={() => setWordbookStage(s)}
                                      className="rounded-[20px] p-3 flex flex-col items-center gap-1 transition-all active:scale-95"
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
                                        className="flex items-center gap-3 p-3 rounded-[20px] transition-all"
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
                                            {getOptionLabel(word, "en-ja")}
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
                                          className="shrink-0 w-9 h-9 rounded-[12px] flex items-center justify-center transition-all active:scale-90"
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
                                className="p-8 rounded-[20px] text-center"
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
                                    className="flex items-center gap-3 p-3 rounded-[20px] transition-all"
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
                                              background:
                                                "rgba(244,63,94,0.15)",
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
                                        {getOptionLabel(word, "en-ja")}
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
                                      className="shrink-0 w-9 h-9 rounded-[12px] flex items-center justify-center transition-all active:scale-90"
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
                                className="p-8 rounded-[20px] text-center"
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
                                    className="flex items-center gap-3 p-3 rounded-[20px] transition-all"
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
                                              prev.filter(
                                                (w) => w.id !== word.id
                                              )
                                            );
                                          }
                                          showToast("削除しました");
                                        }}
                                        className="w-8 h-8 rounded-[12px] flex items-center justify-center"
                                        style={{
                                          background: "rgba(244,63,94,0.12)",
                                          color: "#fb7185",
                                          border:
                                            "1px solid rgba(244,63,94,0.25)",
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
                                                prev.filter(
                                                  (r) => r.en !== word.en
                                                )
                                              );
                                            }
                                            showToast(
                                              "復習リストから削除しました"
                                            );
                                          } else {
                                            const { id: _id, ...wordData } =
                                              word;
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
                                            showToast(
                                              "復習リストに追加しました！"
                                            );
                                          }
                                        }}
                                        className="w-9 h-9 rounded-[12px] flex items-center justify-center transition-all active:scale-90"
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
                      onClick={() => {
                        if (!profile?.isTeacher && customSubMode !== null) {
                          setCustomSubMode(null);
                        } else {
                          setCustomSubMode(null);
                          setScreen("start");
                        }
                      }}
                      className="p-2 rounded-[12px] active:opacity-70 transition-all"
                      style={{
                        background: isLight
                          ? "rgba(0,0,0,0.04)"
                          : "rgba(255,255,255,0.08)",
                        border: isLight
                          ? "1px solid rgba(0,0,0,0.18)"
                          : "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <ChevronLeft />
                    </button>
                    <h2
                      className="text-3xl font-black"
                      style={{
                        color: isLight ? "rgba(20,10,60,0.9)" : "white",
                      }}
                    >
                      {!profile?.isTeacher && customSubMode === "questions"
                        ? "先生からの問題"
                        : !profile?.isTeacher && customSubMode === "apps"
                        ? "配布アプリ"
                        : "カスタム"}
                    </h2>
                  </div>

                  {profile?.isTeacher ? (
                    <div className="space-y-6">
                      <div
                        className="rounded-[20px] p-6 space-y-4"
                        style={{
                          background: isLight
                            ? "rgba(0,0,0,0.03)"
                            : "rgba(255,255,255,0.05)",
                          border: isLight
                            ? "1px solid rgba(0,0,0,0.15)"
                            : "1px solid rgba(255,255,255,0.1)",
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
                                        : isLight
                                        ? "rgba(0,0,0,0.06)"
                                        : "rgba(255,255,255,0.07)",
                                    color:
                                      (newCustomWord.category || "英単語") ===
                                      cat.key
                                        ? "white"
                                        : theme.text,
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
                            className="w-full p-3 rounded-[12px] font-bold text-sm outline-none text-white"
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
                            className="w-full p-3 rounded-[12px] font-bold text-sm outline-none text-white"
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
                            className="w-full p-3 rounded-[12px] font-bold text-sm min-h-[70px] outline-none text-white"
                            style={{
                              background: "rgba(255,255,255,0.08)",
                              resize: "none",
                            }}
                          />
                          {/* 配布先選択 */}
                          <div
                            className="rounded-[12px] p-3 space-y-2"
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
                            className="w-full py-3.5 text-white rounded-[12px] font-black text-base active:opacity-80 transition-all disabled:opacity-40"
                            style={{
                              background:
                                "linear-gradient(135deg,#f43f5e,#e11d48)",
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
                        className="rounded-[20px] p-6 space-y-4"
                        style={{
                          background: isLight
                            ? "rgba(0,0,0,0.03)"
                            : "rgba(255,255,255,0.05)",
                          border: isLight
                            ? "1px solid rgba(0,0,0,0.15)"
                            : "1px solid rgba(255,255,255,0.1)",
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
                                className="flex items-center justify-between p-3 rounded-[12px]"
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
                                    {getOptionLabel(w, "en-ja")}
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
                                    {Array.isArray(w.seenBy)
                                      ? w.seenBy.length
                                      : 0}
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

                      {/* ── 配布アプリ登録 ── */}
                      <div
                        className="rounded-[20px] p-6 space-y-4"
                        style={{
                          background: isLight
                            ? "rgba(0,0,0,0.03)"
                            : "rgba(255,255,255,0.05)",
                          border: isLight
                            ? "1px solid rgba(0,0,0,0.15)"
                            : "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <h3
                          className="font-black text-xl flex items-center gap-2"
                          style={{ color: "#a5b4fc" }}
                        >
                          <Layers size={22} /> 配布アプリを登録
                        </h3>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="アプリ名"
                            value={newSharedApp.name}
                            onChange={(e) =>
                              setNewSharedApp({
                                ...newSharedApp,
                                name: e.target.value,
                              })
                            }
                            className="w-full p-3 rounded-[12px] font-bold text-sm outline-none text-white"
                            style={{ background: "rgba(255,255,255,0.08)" }}
                          />
                          <input
                            type="url"
                            placeholder="URL（https://...）"
                            value={newSharedApp.url}
                            onChange={(e) =>
                              setNewSharedApp({
                                ...newSharedApp,
                                url: e.target.value,
                              })
                            }
                            className="w-full p-3 rounded-[12px] font-bold text-sm outline-none text-white"
                            style={{ background: "rgba(255,255,255,0.08)" }}
                          />
                          <input
                            type="text"
                            placeholder="説明（任意）"
                            value={newSharedApp.description}
                            onChange={(e) =>
                              setNewSharedApp({
                                ...newSharedApp,
                                description: e.target.value,
                              })
                            }
                            className="w-full p-3 rounded-[12px] font-bold text-sm outline-none text-white"
                            style={{ background: "rgba(255,255,255,0.08)" }}
                          />
                          <button
                            onClick={async () => {
                              if (
                                !newSharedApp.name.trim() ||
                                !newSharedApp.url.trim()
                              ) {
                                showToast(
                                  "アプリ名とURLを入力してください",
                                  "error"
                                );
                                return;
                              }
                              try {
                                await addDoc(
                                  collection(
                                    fb.db,
                                    "artifacts",
                                    fb.appId,
                                    "public",
                                    "data",
                                    "sharedApps"
                                  ),
                                  {
                                    name: newSharedApp.name.trim(),
                                    url: newSharedApp.url.trim(),
                                    description:
                                      newSharedApp.description.trim(),
                                    createdAt: Date.now(),
                                  }
                                );
                                setNewSharedApp({
                                  name: "",
                                  url: "",
                                  description: "",
                                });
                                showToast("アプリを配布しました！");
                              } catch (e) {
                                showToast("エラー: " + e.message, "error");
                              }
                            }}
                            className="w-full py-3 rounded-[12px] font-black text-white text-sm active:scale-95 transition-all"
                            style={{
                              background:
                                "linear-gradient(135deg,#6366f1,#4f46e5)",
                              boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                            }}
                          >
                            <Layers
                              size={16}
                              style={{ display: "inline", marginRight: 6 }}
                            />{" "}
                            配布する
                          </button>
                        </div>
                        {sharedApps.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <p
                              className="text-xs font-black"
                              style={{ color: "rgba(255,255,255,0.4)" }}
                            >
                              配布中のアプリ
                            </p>
                            {sharedApps.map((app) => (
                              <div
                                key={app.id}
                                className="flex items-center gap-3 p-3 rounded-[12px]"
                                style={{ background: "rgba(255,255,255,0.05)" }}
                              >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p className="font-black text-sm text-white truncate">
                                    {app.name}
                                  </p>
                                  <p
                                    className="text-xs truncate"
                                    style={{ color: "rgba(255,255,255,0.35)" }}
                                  >
                                    {app.url}
                                  </p>
                                </div>
                                <button
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        `「${app.name}」を削除しますか？`
                                      )
                                    ) {
                                      await deleteDoc(
                                        doc(
                                          fb.db,
                                          "artifacts",
                                          fb.appId,
                                          "public",
                                          "data",
                                          "sharedApps",
                                          app.id
                                        )
                                      );
                                      showToast("削除しました");
                                    }
                                  }}
                                  className="p-2 text-rose-400 hover:bg-rose-400/20 rounded-lg transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* 生徒側 */
                    <div className="space-y-4">
                      {customSubMode === null ? (
                        /* ── 選択画面 ── */
                        (() => {
                          const _myUid = user?.uid || "";
                          const newCustomCount = customVocabList.filter((w) => {
                            const at = w.assignedTo;
                            const isAssigned =
                              at === "all" ||
                              at === undefined ||
                              (Array.isArray(at) && at.includes(_myUid));
                            if (!isAssigned) return false;
                            const seen = Array.isArray(w.seenBy)
                              ? w.seenBy.includes(_myUid)
                              : false;
                            return !seen;
                          }).length;
                          return (
                            <div className="space-y-4 pt-2">
                              {/* 先生からの問題 */}
                              <button
                                onClick={() => setCustomSubMode("questions")}
                                className="w-full active:scale-[0.97] transition-transform duration-150 relative overflow-hidden text-left"
                                style={{
                                  borderRadius: 20,
                                  minHeight: 130,
                                  background: isLight
                                    ? "rgba(255,255,255,0.78)"
                                    : "rgba(15,8,35,0.58)",
                                  backdropFilter: "blur(22px)",
                                  WebkitBackdropFilter: "blur(22px)",
                                  border: isLight
                                    ? "2px solid rgba(0,0,0,0.22)"
                                    : "1.5px solid rgba(255,255,255,0.32)",
                                  boxShadow: isLight
                                    ? "0 4px 20px rgba(0,0,0,0.10),inset 0 1px 0 rgba(255,255,255,0.98)"
                                    : "0 6px 28px rgba(0,0,0,0.62),inset 0 1px 0 rgba(255,255,255,0.10)",
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
                                    background:
                                      "radial-gradient(circle,#f43f5e22 0%,transparent 70%)",
                                    pointerEvents: "none",
                                  }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    right: 16,
                                    bottom: 16,
                                  }}
                                >
                                  <IcGift
                                    size={50}
                                    color={isLight ? "#f43f5e" : "#fb7185"}
                                    style={
                                      isLight
                                        ? {}
                                        : {
                                            filter:
                                              "drop-shadow(0 0 6px #fb7185cc)",
                                          }
                                    }
                                  />
                                </div>
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 16,
                                    left: 16,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 9,
                                      fontWeight: 700,
                                      letterSpacing: "0.13em",
                                      textTransform: "uppercase",
                                      color: isLight
                                        ? "rgba(40,20,80,0.55)"
                                        : "rgba(255,255,255,0.50)",
                                    }}
                                  >
                                    配布された問題に挑戦
                                  </p>
                                </div>
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: 16,
                                    left: 16,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 22,
                                      fontWeight: 900,
                                      color: isLight
                                        ? "rgba(20,10,60,0.95)"
                                        : "rgba(255,255,255,0.98)",
                                    }}
                                  >
                                    先生からの問題
                                  </p>
                                </div>
                                {newCustomCount > 0 && (
                                  <span
                                    style={{
                                      position: "absolute",
                                      top: 12,
                                      right: 12,
                                      minWidth: 22,
                                      height: 22,
                                      borderRadius: 11,
                                      background:
                                        "linear-gradient(135deg,#ff4757,#c0392b)",
                                      boxShadow: "0 0 8px rgba(255,71,87,0.7)",
                                      color: "white",
                                      fontSize: 10,
                                      fontWeight: 800,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      paddingInline: 5,
                                    }}
                                  >
                                    {newCustomCount > 99
                                      ? "99+"
                                      : newCustomCount}
                                  </span>
                                )}
                              </button>

                              {/* 配布アプリ */}
                              <button
                                onClick={() => setCustomSubMode("apps")}
                                className="w-full active:scale-[0.97] transition-transform duration-150 relative overflow-hidden text-left"
                                style={{
                                  borderRadius: 20,
                                  minHeight: 130,
                                  background: isLight
                                    ? "rgba(255,255,255,0.78)"
                                    : "rgba(15,8,35,0.58)",
                                  backdropFilter: "blur(22px)",
                                  WebkitBackdropFilter: "blur(22px)",
                                  border: isLight
                                    ? "2px solid rgba(0,0,0,0.22)"
                                    : "1.5px solid rgba(255,255,255,0.32)",
                                  boxShadow: isLight
                                    ? "0 4px 20px rgba(0,0,0,0.10),inset 0 1px 0 rgba(255,255,255,0.98)"
                                    : "0 6px 28px rgba(0,0,0,0.62),inset 0 1px 0 rgba(255,255,255,0.10)",
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
                                    background:
                                      "radial-gradient(circle,#8b5cf622 0%,transparent 70%)",
                                    pointerEvents: "none",
                                  }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    right: 16,
                                    bottom: 16,
                                  }}
                                >
                                  <Layers
                                    size={50}
                                    color={isLight ? "#7c3aed" : "#a78bfa"}
                                    style={
                                      isLight
                                        ? {}
                                        : {
                                            filter:
                                              "drop-shadow(0 0 6px #a78bfacc)",
                                          }
                                    }
                                  />
                                </div>
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 16,
                                    left: 16,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 9,
                                      fontWeight: 700,
                                      letterSpacing: "0.13em",
                                      textTransform: "uppercase",
                                      color: isLight
                                        ? "rgba(40,20,80,0.55)"
                                        : "rgba(255,255,255,0.50)",
                                    }}
                                  >
                                    先生から届いたアプリ
                                  </p>
                                </div>
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: 16,
                                    left: 16,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 22,
                                      fontWeight: 900,
                                      color: isLight
                                        ? "rgba(20,10,60,0.95)"
                                        : "rgba(255,255,255,0.98)",
                                    }}
                                  >
                                    配布アプリ
                                  </p>
                                </div>
                              </button>
                            </div>
                          );
                        })()
                      ) : customSubMode === "questions" ? (
                        /* ── 先生からの問題 ── */
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
                                  className="flex-1 py-2.5 rounded-[12px] font-black text-sm transition-all flex items-center justify-center gap-1.5"
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
                                    background: isLight
                                      ? "rgba(0,0,0,0.03)"
                                      : "rgba(255,255,255,0.05)",
                                    border: isLight
                                      ? "1px solid rgba(0,0,0,0.15)"
                                      : "1px solid rgba(255,255,255,0.1)",
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
                                  background: isLight
                                    ? "rgba(0,0,0,0.03)"
                                    : "rgba(255,255,255,0.05)",
                                  border: isLight
                                    ? "1px solid rgba(0,0,0,0.15)"
                                    : "1px solid rgba(255,255,255,0.1)",
                                }}
                              >
                                <div className="w-24 h-24 bg-rose-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-rose-500/30">
                                  {customTab === "new" ? (
                                    <IcGift
                                      size={48}
                                      color="rgba(255,255,255,0.95)"
                                    />
                                  ) : (
                                    <BookCheck
                                      size={48}
                                      style={{
                                        color: "rgba(255,255,255,0.95)",
                                      }}
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
                                  onClick={() =>
                                    startCustomGame("meaning", customTab)
                                  }
                                  className="w-full py-4 text-white rounded-[20px] font-black text-lg active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                                  style={{
                                    background:
                                      "linear-gradient(135deg,#f43f5e,#e11d48)",
                                  }}
                                >
                                  <Zap size={20} /> 単語モードで挑戦
                                </button>
                                <button
                                  onClick={() =>
                                    startCustomGame("sentence", customTab)
                                  }
                                  disabled={!tabWords.some((w) => w.sentence)}
                                  className="w-full py-4 text-white rounded-[20px] font-black text-lg active:scale-95 transition-all shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-40"
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
                      ) : (
                        /* ── 配布アプリ ── */
                        <div className="space-y-3">
                          {/* 学習日誌（常設） */}
                          <button
                            onClick={() => {
                              setPrevScreen("customApp");
                              setScreen("studyDiaryApp");
                            }}
                            className="w-full active:scale-[0.97] transition-transform duration-150 relative overflow-hidden text-left"
                            style={{
                              borderRadius: 20,
                              minHeight: 110,
                              background: isLight
                                ? "rgba(255,255,255,0.78)"
                                : "rgba(15,8,35,0.58)",
                              backdropFilter: "blur(22px)",
                              WebkitBackdropFilter: "blur(22px)",
                              border: isLight
                                ? "2px solid rgba(0,0,0,0.22)"
                                : "1.5px solid rgba(255,255,255,0.32)",
                              boxShadow: isLight
                                ? "0 4px 20px rgba(0,0,0,0.10),inset 0 1px 0 rgba(255,255,255,0.98)"
                                : "0 6px 28px rgba(0,0,0,0.62),inset 0 1px 0 rgba(255,255,255,0.10)",
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
                                background:
                                  "radial-gradient(circle,#06b6d422 0%,transparent 70%)",
                                pointerEvents: "none",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                right: 14,
                                bottom: 14,
                              }}
                            >
                              <Calendar
                                size={44}
                                color={isLight ? "#0891b2" : "#67e8f9"}
                                style={
                                  isLight
                                    ? {}
                                    : {
                                        filter:
                                          "drop-shadow(0 0 5px #67e8f9ee) drop-shadow(0 0 10px #06b6d466)",
                                      }
                                }
                              />
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                top: 14,
                                left: 14,
                              }}
                            >
                              <p
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  letterSpacing: "0.13em",
                                  textTransform: "uppercase",
                                  color: isLight
                                    ? "rgba(40,20,80,0.60)"
                                    : "rgba(255,255,255,0.55)",
                                }}
                              >
                                毎日の学習を記録
                              </p>
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                bottom: 14,
                                left: 14,
                              }}
                            >
                              <p
                                style={{
                                  fontSize: 17,
                                  fontWeight: 900,
                                  lineHeight: 1,
                                  color: isLight
                                    ? "rgba(20,10,60,0.95)"
                                    : "rgba(255,255,255,0.98)",
                                }}
                              >
                                学習日誌
                              </p>
                            </div>
                          </button>

                          {/* 先生から配布されたリンク */}
                          {sharedApps.length > 0 &&
                            sharedApps.map((app) => (
                              <a
                                key={app.id}
                                href={app.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="active:scale-[0.97] transition-transform duration-150"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 14,
                                  borderRadius: 16,
                                  padding: "14px 16px",
                                  background: isLight
                                    ? "rgba(255,255,255,0.78)"
                                    : "rgba(255,255,255,0.07)",
                                  backdropFilter: "blur(22px)",
                                  WebkitBackdropFilter: "blur(22px)",
                                  border: isLight
                                    ? "2px solid rgba(0,0,0,0.12)"
                                    : "1.5px solid rgba(255,255,255,0.15)",
                                  boxShadow: isLight
                                    ? "0 4px 20px rgba(0,0,0,0.08)"
                                    : "0 4px 20px rgba(0,0,0,0.3)",
                                  textDecoration: "none",
                                }}
                              >
                                <div
                                  style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 14,
                                    background:
                                      "linear-gradient(145deg,#818cf8,#6366f1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    boxShadow: "0 4px 14px #6366f155",
                                  }}
                                >
                                  <Layers
                                    size={24}
                                    color="rgba(255,255,255,0.95)"
                                  />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p
                                    style={{
                                      fontSize: 15,
                                      fontWeight: 800,
                                      color: isLight
                                        ? "rgba(20,10,60,0.9)"
                                        : "rgba(255,255,255,0.95)",
                                      marginBottom: 2,
                                    }}
                                  >
                                    {app.name}
                                  </p>
                                  {app.description && (
                                    <p
                                      style={{
                                        fontSize: 11,
                                        color: isLight
                                          ? "rgba(40,20,80,0.45)"
                                          : "rgba(255,255,255,0.4)",
                                        fontWeight: 500,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {app.description}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight
                                  size={16}
                                  style={{
                                    color: isLight
                                      ? "rgba(40,20,80,0.3)"
                                      : "rgba(255,255,255,0.25)",
                                    flexShrink: 0,
                                  }}
                                />
                              </a>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </main>
          )}

          {!["login", "register", "loading"].includes(screen) && <Nav />}
          {/* クレジット: 目立たない場所に */}
          {!["login", "register", "loading"].includes(screen) && (
            <div
              style={{
                position: "fixed",
                bottom: "0px",
                left: 0,
                right: 0,
                textAlign: "center",
                padding: "2px 0 2px",
                pointerEvents: "auto",
                userSelect: "none",
                zIndex: 99,
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
                    text: "designed & developed by miwa",
                    color: "rgba(255,255,255,0.55)",
                  });
                  revertTimerRef.current = setTimeout(() => {
                    setCreditState({
                      text: "✦ ORITAN",
                      color: "rgba(201,168,76,0.18)",
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
                    text: "designed & developed by miwa",
                    color: "rgba(255,255,255,0.55)",
                  });
                  revertTimerRef.current = setTimeout(() => {
                    setCreditState({
                      text: "✦ ORITAN",
                      color: "rgba(201,168,76,0.18)",
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
                  color:
                    creditState.color !== "rgba(201,168,76,0.18)"
                      ? creditState.color
                      : isLight
                      ? "rgba(0,0,0,0.12)"
                      : "rgba(255,255,255,0.10)",
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  fontStyle:
                    creditState.color !== "rgba(201,168,76,0.18)"
                      ? "italic"
                      : "normal",
                  transition: "color 0.4s, font-style 0.4s",
                  textTransform: "lowercase" as const,
                }}
              >
                {creditState.text} {/* ✅ stateの値を表示 */}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
