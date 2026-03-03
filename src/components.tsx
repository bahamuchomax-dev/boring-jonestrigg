/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  writeBatch,
  increment,
  arrayUnion,
} from "firebase/firestore";
import { DEFAULT_VOCAB, DEFAULT_VOCAB_IDIOM, DEFAULT_VOCAB_KANJI, DEFAULT_VOCAB_CHEM, DEFAULT_VOCAB_KOBUN } from "./vocab";
import { calcLevel, getFirebaseInstance, fb, calcExpForLevel, calcExpProgress, SHOP_PETS, SHOP_ACCESSORIES, SHOP_BACKGROUNDS, DEFAULT_INVITE_CODE, IcThemeTango, IcThemeDark, IcThemeLight, IcThemeCyber, IcThemePink, IcThemeIos, IcTheme3DS, IcNoteApp, IcSettings2, IcTyping, IcThumbsUp, IcMuscle, IcSkull, IcParty, IcFactory, IcTweetApp, IcHeart, IcRetweet, IcComment, IcShare, IcPlus, IcTrash2, THEMES, ADMIN_PASSCODE, ACHIEVEMENT_CATEGORIES, RANK_META, ACHIEVEMENTS, COLORS, STAGES, IcCatEigo, IcCatIdiom, IcCatKanji, IcCatChem, IcCatKobun, CATEGORY_ICONS, WORD_CATEGORIES } from "./constants";
import { owlDataUri, calculateNewStreak, Ic, Trophy, Star, Play, RotateCcw, Zap, Settings, User, Plus, Trash2, Home, CheckCircle2, BookOpen, BarChart3, ChevronLeft, ChevronRight, Calendar, MessageSquare, Send, Layers, Lock, Loader2, FileUp, Heart, BookCheck, Megaphone, Sparkles, Award, MapIcon, Flag, Volume2, Flame, UserPlus, Users, Search, Copy, Check, Clock, Target, IcBgNight, IcBgForest, IcBgOcean, IcBgSunset, IcBgCandy, IcBgSnow, IcSparkle, IcDiamond, IcCircle, IcMap, IcMegaphone, IcBook, IcShop, IcPet, IcGift, IcAdmin, IcFood, IcPaw, IcCoin, IcHat, IcCrown2, IcBow, IcGlasses, IcStar2, IcRainbow, IcCat, IcDog, IcRabbit, IcFox, IcPanda, IcDragon, IcUnicorn, IcBearcat, IcPenguin, IcHamster, PET_LV_NEEDS, getPetLvFromAffection, getPetLvProgress, HatOverlay, IcAvCatHat, IcAvDogHat, IcAvRabbitHat, IcAvFoxHat, IcAvPandaHat, IcAvDragonHat, IcAvUnicornHat, IcAvBearcatHat, IcAvPenguinHat, IcAvHamsterHat, PET_HAT_AVATARS, PET_ICONS, ACC_ICONS, IcAchFirst, IcAchBolt, IcAchWave, IcAchTrophy, IcAchGem, IcAchCrown, IcAchPerfect, IcAchFire, IcAchVolcano, IcAchStar, IcAchBook, IcAchBooks, IcAchGrad, IcAchBrain, IcAchFleur, IcAchSentence, IcAchScoreSilver, IcAchScoreGold, IcAchGame, IcAchJoystick, IcAchMuscle, IcAchMedal, IcAchBadge, IcAchPencil, IcAchChart, IcAchRocket, IcAchGalaxy, IcAchPaw, IcAchCat, IcAchUnicorn, IcAchCoin, IcAvRabbit, IcAvBear, IcAvFox, IcAvPenguin, IcAvOwl, IcAvCat, IcAvHamster, IcAvGorilla, IcAvSmile, IcAvRocket, IcAvStar, IcAvFire, IcAvCrown, IcAvGhost, IcAvRobot, IcAvTeacher, IcDefaultUser, IcCamera, IcKey, IcRefresh, IcSpeech, IcEye, IcTrashSm, IcCrownSm, IcArrowDown, IcAlert, IcCheckSm, IcMedalSm, ACHIEVEMENT_ICONS, AVATAR_ICONS, AVATARS, TEACHER_EXCLUSIVE_AVATARS, EmojiIcon } from "./icons";

const ALL_VOCAB = [
  ...DEFAULT_VOCAB,
  ...DEFAULT_VOCAB_IDIOM,
  ...DEFAULT_VOCAB_KANJI,
  ...DEFAULT_VOCAB_CHEM,
  ...DEFAULT_VOCAB_KOBUN,
];


const AvatarDisplay = ({
  avatar,
  color,
  size = "w-10 h-10",
  textSize = "text-xl",
  rounded = "rounded-[20px]",
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
  isUnread,
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
    } catch (e: any) {
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
    } catch (e: any) {
      showToast("削除エラー: " + e.message, "error");
    }
  };

  return (
    <div
      className="p-5 rounded-[20px] relative overflow-hidden text-left"
      style={{
        background: isUnread
          ? isLight
            ? "rgba(255,255,255,0.98)"
            : "rgba(255,255,255,0.08)"
          : isLight
          ? "rgba(255,255,255,0.92)"
          : "rgba(255,255,255,0.05)",
        border: isUnread
          ? isLight
            ? "2px solid rgba(99,102,241,0.35)"
            : "1px solid rgba(99,102,241,0.35)"
          : isLight
          ? "2px solid rgba(0,0,0,0.18)"
          : "1px solid rgba(255,255,255,0.1)",
        boxShadow: isUnread
          ? isLight
            ? "0 2px 16px rgba(99,102,241,0.12)"
            : "0 0 0 1px rgba(99,102,241,0.15)"
          : isLight
          ? "0 2px 12px rgba(0,0,0,0.08)"
          : "none",
      }}
    >
      {isUnread && (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#f43f5e",
            boxShadow: "0 0 6px rgba(244,63,94,0.7)",
          }}
        />
      )}
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
              className="w-full p-3 rounded-[12px] font-bold text-sm outline-none min-h-[80px]"
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
      className="rounded-[20px] p-4"
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
          className="py-2.5 rounded-[12px] font-black text-white text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
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
          className="py-2.5 rounded-[12px] font-black text-white text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform disabled:opacity-40"
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
          className="rounded-[12px] p-2.5"
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

// ─── Deep Focus Scroller v2 ─────────────────────────────────────────────────
// Intersection Observer ベース: スクロールコンテナ内の子要素を自動検出してフォーカス
const DeepFocusScroller = ({ children, style }) => {
  const containerRef = React.useRef(null);
  const [focusIdx, setFocusIdx] = React.useState(0);
  const rafRef = React.useRef(null);

  const updateFocus = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const centerY = containerRect.top + containerRect.height / 2;
    const children = Array.from(container.children);
    let closestIdx = 0;
    let closestDist = Infinity;
    children.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top + rect.height / 2 - centerY);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });
    setFocusIdx(closestIdx);
  }, []);

  const handleScroll = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateFocus);
  }, [updateFocus]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    updateFocus();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll, updateFocus]);

  const items = React.Children.toArray(children);

  return (
    <div
      ref={containerRef}
      style={{
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        ...style,
      }}
    >
      {items.map((child, i) => {
        const dist = Math.abs(i - focusIdx);
        const isFocused = dist === 0;
        const scale = isFocused ? 1 : dist === 1 ? 0.94 : 0.88;
        const blur = isFocused ? 0 : dist === 1 ? 2.5 : 6;
        const opacity = isFocused ? 1 : dist === 1 ? 0.55 : 0.28;
        return (
          <div
            key={i}
            style={{
              transform: `scale(${scale})`,
              filter: blur > 0 ? `blur(${blur}px)` : "none",
              opacity,
              transition:
                "transform 0.4s cubic-bezier(0.34,1.1,0.64,1), filter 0.4s ease, opacity 0.4s ease",
              transformOrigin: "center top",
              willChange: "transform, filter, opacity",
              pointerEvents: isFocused ? "auto" : "none",
              marginBottom: 10,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

// ─── スワイプエントリー画面 ─────────────────────────────────────────────────────
const SwipeEntryScreen = ({ theme, isLight, onComplete }) => {
  const touchStartY = React.useRef(null);
  const [dragRatio, setDragRatio] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);
  const THRESHOLD = 88;

  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.touches[0].clientY;
    setDragRatio(Math.max(0, Math.min(dy / THRESHOLD, 1)));
  };
  const onTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;
    if (dy >= THRESHOLD) {
      setExiting(true);
      setTimeout(onComplete, 700);
    } else setDragRatio(0);
  };

  const slideY = exiting ? -window.innerHeight : -(dragRatio * 36);
  const ac = theme.accent || "#4B9EFF";
  const txtFaint = isLight ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.28)";

  // dragRatio に連動するグロー強度
  const glow = dragRatio;

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        overflow: "hidden",
        userSelect: "none",
        transform: `translateY(${slideY}px)`,
        transition: exiting
          ? "transform 0.7s cubic-bezier(0.4,0,0.2,1)"
          : dragRatio > 0
          ? "none"
          : "transform 0.5s cubic-bezier(0.34,1.1,0.64,1)",
      }}
    >
      <style>{`
        @keyframes se-orb-a {
          0%,100%{transform:translate(0,0) scale(1);}
          40%{transform:translate(14px,-22px) scale(1.05);}
          70%{transform:translate(-10px,14px) scale(1.03);}
        }
        @keyframes se-orb-b {
          0%,100%{transform:translate(0,0) scale(1);}
          50%{transform:translate(-20px,18px) scale(1.07);}
        }
        @keyframes se-fadein {
          from{opacity:0;transform:translateY(16px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes se-ripple {
          0%{opacity:0;transform:scale(0.82);}
          35%{opacity:0.55;}
          100%{opacity:0;transform:scale(1.4);}
        }
        @keyframes se-breathe {
          0%,100%{opacity:0.55;transform:scale(1);}
          50%{opacity:0.9;transform:scale(1.07);}
        }
        @keyframes se-shimmer {
          0%{background-position:-200% center;}
          100%{background-position:200% center;}
        }
        @keyframes se-corner-blink {
          0%,100%{opacity:0.3;} 50%{opacity:0.75;}
        }
        @keyframes se-ring-spin {
          from{transform:rotate(0deg);} to{transform:rotate(360deg);}
        }
        @keyframes se-ring-spin-r {
          from{transform:rotate(0deg);} to{transform:rotate(-360deg);}
        }
        /* 矢印が上へ順番に流れる */
        @keyframes se-arrow-flow {
          0%{opacity:0;transform:translateY(8px);}
          30%{opacity:1;transform:translateY(0);}
          70%{opacity:1;transform:translateY(-6px);}
          100%{opacity:0;transform:translateY(-14px);}
        }
        /* 下からグロー光が迫り上がる（アイドル） */
        @keyframes se-ground-glow-idle {
          0%,100%{opacity:0.25;transform:scaleX(1);}
          50%{opacity:0.55;transform:scaleX(1.08);}
        }
        /* カード全体のスケール = 引き上げ感 */
      `}</style>

      {/* ── テーマ背景 ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: theme.bg || "#050609",
        }}
      />

      {/* ── オーブ群 ── */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          left: "-20%",
          width: "90vw",
          height: "90vw",
          borderRadius: "50%",
          background: theme.orb1 || `${ac}20`,
          filter: "blur(72px)",
          opacity: isLight ? 0.7 : 0.85,
          animation: "se-orb-a 10s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-20%",
          width: "75vw",
          height: "75vw",
          borderRadius: "50%",
          background: theme.orb2 || `${ac}18`,
          filter: "blur(64px)",
          opacity: isLight ? 0.6 : 0.75,
          animation: "se-orb-b 13s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* ── ドラッグ中: 画面全体がアクセントカラーに染まる ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 110%, ${ac} 0%, ${ac}60 20%, ${ac}00 65%)`,
          opacity: dragRatio * 0.35,
          transition: "opacity 0.05s",
          pointerEvents: "none",
        }}
      />

      {/* ── 下端グロー光（アイドル時は静かに脈動、ドラッグで爆発的に上昇） ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${20 + dragRatio * 55}vh`,
          background: `radial-gradient(ellipse at 50% 100%, ${ac} 0%, ${ac}90 10%, ${ac}40 35%, transparent 70%)`,
          opacity: dragRatio > 0 ? 0.18 + dragRatio * 0.55 : 0,
          filter: `blur(${8 + dragRatio * 20}px)`,
          transition: dragRatio > 0 ? "none" : "opacity 0.6s ease",
          pointerEvents: "none",
          animation:
            dragRatio === 0
              ? "se-ground-glow-idle 3s ease-in-out infinite"
              : "none",
        }}
      />

      {/* アイドル時の常時うっすらグロー */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: "18vh",
          background: `radial-gradient(ellipse at 50% 100%, ${ac}50 0%, transparent 70%)`,
          opacity: 0.22,
          filter: "blur(24px)",
          animation: "se-ground-glow-idle 3s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* ── コーナーデコ（4隅 L字） ── */}
      {[
        { top: 20, left: 20, transform: "none" },
        { top: 20, right: 20, transform: "scaleX(-1)" },
        { bottom: 20, left: 20, transform: "scaleY(-1)" },
        { bottom: 20, right: 20, transform: "scale(-1,-1)" },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 22,
            height: 22,
            animation: `se-corner-blink 3s ease-in-out ${i * 0.5}s infinite`,
            pointerEvents: "none",
            opacity: 0.4 + glow * 0.6,
            transition: "opacity 0.1s",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1.5,
              background: `linear-gradient(to right, ${ac}90, transparent)`,
              borderRadius: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 1.5,
              background: `linear-gradient(to bottom, ${ac}90, transparent)`,
              borderRadius: 2,
            }}
          />
        </div>
      ))}

      {/* ── 中央コンテンツ ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          // ドラッグで全体がわずかに上へ引き寄せられる感
          transform: `translateY(${-dragRatio * 18}px)`,
          transition:
            dragRatio > 0
              ? "none"
              : "transform 0.45s cubic-bezier(0.34,1.2,0.64,1)",
        }}
      >
        {/* アイコン + リップル + スピンリング */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
            animation: "se-fadein 0.9s cubic-bezier(0.22,1,0.36,1) 0.1s both",
            // ドラッグでスケールアップ
            transform: `scale(${1 + glow * 0.08})`,
            transition: dragRatio > 0 ? "none" : "transform 0.4s ease",
          }}
        >
          {/* 外側回転リング */}
          <div
            style={{
              position: "absolute",
              width: 94,
              height: 94,
              borderRadius: "50%",
              border: `1px dashed ${ac}30`,
              animation: "se-ring-spin 18s linear infinite",
              opacity: 1 + glow * 0,
            }}
          >
            {[0, 120, 240].map((deg, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: i === 0 ? ac : `${ac}50`,
                  boxShadow: i === 0 ? `0 0 6px ${ac}` : "none",
                  transform: `rotate(${deg}deg) translateX(46px) translate(-50%,-50%)`,
                  transformOrigin: "0 0",
                }}
              />
            ))}
          </div>
          {/* 内側逆回転リング */}
          <div
            style={{
              position: "absolute",
              width: 74,
              height: 74,
              borderRadius: "50%",
              border: `0.5px solid ${ac}${dragRatio > 0 ? "40" : "18"}`,
              animation: "se-ring-spin-r 25s linear infinite",
              transition: "border-color 0.1s",
            }}
          />

          {/* リップル */}
          {[0, 0.9, 1.8].map((delay, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 62 + i * 12,
                height: 62 + i * 12,
                borderRadius: "50%",
                border: `1px solid ${ac}${
                  i === 0 ? "60" : i === 1 ? "35" : "18"
                }`,
                animation: `se-ripple 2.7s ease-out ${delay}s infinite`,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* グロー */}
          <div
            style={{
              position: "absolute",
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${ac}${
                dragRatio > 0 ? "40" : "22"
              } 0%, transparent 70%)`,
              filter: `blur(${8 + glow * 12}px)`,
              animation: "se-breathe 4s ease-in-out infinite",
              transition: "filter 0.1s",
            }}
          />

          {/* アイコン本体 */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 17,
              overflow: "hidden",
              position: "relative",
              zIndex: 2,
              boxShadow: `0 0 0 1px ${ac}${
                dragRatio > 0 ? "60" : "28"
              }, 0 10px 40px rgba(0,0,0,0.6), 0 0 ${50 + glow * 40}px ${ac}${
                dragRatio > 0 ? "50" : "20"
              }`,
              transition: "box-shadow 0.1s",
            }}
          >
            <img
              src={owlDataUri}
              alt="icon"
              style={{ width: "100%", height: "100%", display: "block" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(145deg,rgba(255,255,255,0.1) 0%,transparent 55%)",
              }}
            />
          </div>
        </div>

        {/* アプリ名 */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.48em",
            textTransform: "uppercase",
            background: isLight
              ? `linear-gradient(110deg, ${ac}90 20%, rgba(0,0,0,0.5) 50%, ${ac}90 80%)`
              : `linear-gradient(110deg, ${ac}90 20%, rgba(255,255,255,0.7) 50%, ${ac}90 80%)`,
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation:
              "se-shimmer 5s linear infinite, se-fadein 0.9s cubic-bezier(0.22,1,0.36,1) 0.25s both",
            marginBottom: 52,
            opacity: 1 - glow * 0.4,
            transition: "opacity 0.1s",
          }}
        >
          ORITAN
        </div>

        {/* ── スワイプインジケーター ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            animation: "se-fadein 0.9s cubic-bezier(0.22,1,0.36,1) 0.45s both",
            opacity: dragRatio > 0 ? 0.3 + glow * 0.4 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {/* 上昇矢印 × 3段 — 一番わかりやすい「上へ」ビジュアル */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
              marginBottom: 8,
            }}
          >
            {[0.6, 0.3, 0].map((delay, i) => (
              <svg
                key={i}
                width={18 - i * 3}
                height={11 - i * 2}
                viewBox="0 0 18 11"
                fill="none"
                style={{
                  display: "block",
                  animation: `se-arrow-flow 1.6s ease-in-out ${delay}s infinite`,
                  marginBottom: i < 2 ? -2 : 0,
                }}
              >
                <polyline
                  points="1 10 9 2 17 10"
                  stroke={ac}
                  strokeWidth={i === 0 ? 2.2 : i === 1 ? 1.8 : 1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ))}
          </div>

          <div
            style={{
              fontSize: 8.5,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: txtFaint,
              marginBottom: 10,
            }}
          >
            Swipe up
          </div>

          {/* プログレスバー */}
          <div
            style={{
              position: "relative",
              width: 72,
              height: 3,
              borderRadius: 99,
              background: isLight
                ? "rgba(0,0,0,0.06)"
                : "rgba(255,255,255,0.07)",
              overflow: "visible",
            }}
          >
            {/* アイドル時シマー */}
            {dragRatio === 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: `linear-gradient(to right, transparent 0%, ${ac}60 50%, transparent 100%)`,
                    backgroundSize: "200% 100%",
                    animation: "se-shimmer 2.5s linear infinite",
                  }}
                />
              </div>
            )}
            {/* ドラッグ進捗 */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: `${dragRatio * 100}%`,
                background: `linear-gradient(to right, ${ac}80, ${ac})`,
                borderRadius: 99,
                transition: dragRatio === 0 ? "width 0.4s ease" : "none",
                boxShadow:
                  dragRatio > 0 ? `0 0 14px ${ac}, 0 0 28px ${ac}70` : "none",
              }}
            >
              {dragRatio > 0 && (
                <div
                  style={{
                    position: "absolute",
                    right: -4,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: ac,
                    boxShadow: `0 0 12px ${ac}`,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 上端アクセントライン ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 1.5,
          background: `linear-gradient(to right, transparent, ${ac}80 35%, ${ac} 50%, ${ac}80 65%, transparent)`,
          boxShadow: `0 0 ${14 + glow * 20}px ${ac}${
            dragRatio > 0 ? "90" : "70"
          }, 0 0 30px ${ac}30`,
          opacity: 0.65 + glow * 0.35,
          transition: dragRatio > 0 ? "none" : "all 0.3s",
        }}
      />

      {/* ── 下端ライン（ドラッグで明るくなる） ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(to right, transparent, ${ac}${
            dragRatio > 0 ? "80" : "30"
          }, transparent)`,
          boxShadow: dragRatio > 0 ? `0 0 20px ${ac}70` : "none",
          transition: "all 0.1s",
        }}
      />
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
    const iosStyle = document.createElement("style");
    iosStyle.textContent = `
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
      /* iOS Glassmorphism */
      .ios-glass {
        background: var(--ios-card-bg) !important;
        backdrop-filter: blur(20px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
        border: 0.5px solid var(--ios-card-border) !important;
      }
      /* iOS Buttons */
      .ios-button {
        border-radius: var(--ios-radius) !important;
        font-weight: 600 !important;
        transition: opacity 0.2s ease !important;
      }
      .ios-button:active {
        opacity: 0.7 !important;
      }
      /* iOS Inputs */
      .ios-input {
        background: rgba(255, 255, 255, 0.1) !important;
        border-radius: 10px !important;
        border: none !important;
        padding: 12px 16px !important;
        color: white !important;
      }
    `;
    document.head.appendChild(iosStyle);

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
        height: "calc(100dvh - 60px)",
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
          className="p-2 rounded-[12px] active:opacity-70 transition-all"
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
          className="ml-auto p-2 rounded-[12px] active:opacity-70 flex items-center gap-1"
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

// ─── StudyDiaryScreen コンポーネント ───────────────────────────────────────
function StudyDiaryScreen({
  fb,
  user,
  studyDiaryWeekOffset,
  setStudyDiaryWeekOffset,
  studyDiaryData,
  setStudyDiaryData,
  studyDiaryViewUid,
  isLight,
  profile,
  prevScreen,
  setScreen,
}) {
  // 週のキー計算
  const getWeekKey = (offset = 0) => {
    const now = new Date();
    const day = now.getDay(); // 0=日
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(monday.getDate()).padStart(2, "0")}`;
  };
  const weekKey = getWeekKey(studyDiaryWeekOffset);
  const diaryEntry = studyDiaryData[weekKey] || {};

  // 週の月曜〜日曜の日付を生成
  const getWeekDates = (offset = 0) => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };
  const weekDates = getWeekDates(studyDiaryWeekOffset);
  const dayNames = ["月", "火", "水", "木", "金", "土", "日"];
  const timeSlots = [
    "5:00〜6:00",
    "6:00〜7:00",
    "7:00〜8:00",
    "8:00〜9:00",
    "9:00〜10:00",
    "10:00〜11:00",
    "11:00〜12:00",
    "12:00〜13:00",
    "13:00〜14:00",
    "14:00〜15:00",
    "15:00〜16:00",
    "16:00〜17:00",
    "17:00〜18:00",
    "18:00〜19:00",
    "19:00〜20:00",
    "20:00〜21:00",
    "21:00〜22:00",
    "22:00〜23:00",
    "23:00〜24:00",
    "24:00〜25:00",
  ];

  const saveEntry = async (updatedEntry) => {
    if (!fb.db || !user?.uid) return;
    const uid = studyDiaryViewUid || user.uid;
    await setDoc(
      doc(fb.db, "artifacts", fb.appId, "users", uid, "studyDiary", weekKey),
      { ...updatedEntry, updatedAt: Date.now() },
      { merge: true }
    );
  };

  const updateCell = async (dayIdx, slot, field, value) => {
    const key = `${dayIdx}_${slot}_${field}`;
    const updated = {
      ...diaryEntry,
      cells: { ...(diaryEntry.cells || {}), [key]: value },
    };
    setStudyDiaryData((prev) => ({ ...prev, [weekKey]: updated }));
    await saveEntry(updated);
  };

  const updateField = async (field, value) => {
    const updated = { ...diaryEntry, [field]: value };
    setStudyDiaryData((prev) => ({ ...prev, [weekKey]: updated }));
    await saveEntry(updated);
  };

  // 画面を開いた時にFirestoreから読み込む
  useEffect(() => {
    if (!fb.db || !user?.uid) return;
    const uid = studyDiaryViewUid || user.uid;
    setDoc; // 参照保持
    const unsub = onSnapshot(
      doc(fb.db, "artifacts", fb.appId, "users", uid, "studyDiary", weekKey),
      (snap) => {
        if (snap.exists()) {
          setStudyDiaryData((prev) => ({
            ...prev,
            [weekKey]: snap.data(),
          }));
        }
      }
    );
    return () => unsub();
  }, [weekKey, studyDiaryViewUid]);

  const cellStyle = {
    fontSize: 10,
    background: "none",
    border: "none",
    outline: "none",
    width: "100%",
    color: isLight ? "rgba(20,10,60,0.85)" : "rgba(255,255,255,0.88)",
    fontWeight: 500,
    padding: "2px 3px",
    resize: "none",
    fontFamily: "inherit",
  };

  const colW = 80;
  const timeW = 72;

  return (
    <div
      className="animate-in fade-in text-left pb-6 px-4 no-scrollbar"
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        paddingTop: "12px",
        overflowY: "scroll",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <button
          onClick={() => setScreen(prevScreen || "customApp")}
          className="p-2 rounded-[12px] active:opacity-70 transition-all"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <ChevronLeft />
        </button>
        <div style={{ flex: 1 }}>
          <h2
            className="text-xl font-black"
            style={{
              color: isLight ? "rgba(20,10,60,0.9)" : "white",
              lineHeight: 1,
            }}
          >
            学習日誌
          </h2>
          <p
            style={{
              fontSize: 11,
              color: isLight ? "rgba(40,20,80,0.45)" : "rgba(255,255,255,0.4)",
              marginTop: 2,
            }}
          >
            {weekDates[0].getMonth() + 1}/{weekDates[0].getDate()} 〜{" "}
            {weekDates[6].getMonth() + 1}/{weekDates[6].getDate()}
          </p>
        </div>
        {/* 週ナビ */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStudyDiaryWeekOffset((w) => w - 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center active:opacity-70"
            style={{
              background: isLight
                ? "rgba(0,0,0,0.06)"
                : "rgba(255,255,255,0.1)",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setStudyDiaryWeekOffset(0)}
            className="px-2 h-8 rounded-lg text-xs font-black active:opacity-70"
            style={{
              background:
                studyDiaryWeekOffset === 0
                  ? "linear-gradient(135deg,#06b6d4,#0891b2)"
                  : isLight
                  ? "rgba(0,0,0,0.06)"
                  : "rgba(255,255,255,0.1)",
              color:
                studyDiaryWeekOffset === 0
                  ? "white"
                  : isLight
                  ? "rgba(20,10,60,0.7)"
                  : "rgba(255,255,255,0.7)",
            }}
          >
            今週
          </button>
          <button
            onClick={() => setStudyDiaryWeekOffset((w) => w + 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center active:opacity-70"
            style={{
              background: isLight
                ? "rgba(0,0,0,0.06)"
                : "rgba(255,255,255,0.1)",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        {/* 印刷ボタン */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const wk = getWeekKey(studyDiaryWeekOffset);
            const uid = studyDiaryViewUid || user?.uid || "";
            const url = `study_diary_print.html?uid=${encodeURIComponent(
              uid
            )}&week=${encodeURIComponent(wk)}`;
            window.open(url, "_blank");
          }}
          className="flex items-center gap-1.5 px-3 h-8 rounded-[12px] active:opacity-70 transition-all shrink-0"
          style={{
            background: "linear-gradient(135deg,#06b6d4,#0891b2)",
            color: "white",
            fontSize: 12,
            fontWeight: 800,
            boxShadow: "0 2px 8px rgba(6,182,212,0.4)",
          }}
        >
          <FileUp size={14} />
          印刷
        </button>
      </div>

      {/* 今週の目標 */}
      <div
        className="shrink-0 mb-3 rounded-[20px] overflow-hidden"
        style={{
          background: isLight
            ? "rgba(255,255,255,0.7)"
            : "rgba(255,255,255,0.07)",
          border: isLight
            ? "1.5px solid rgba(0,0,0,0.10)"
            : "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div
          className="px-4 py-2 flex items-center gap-2"
          style={{
            background: isLight
              ? "rgba(6,182,212,0.12)"
              : "rgba(6,182,212,0.18)",
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: isLight ? "#0891b2" : "#67e8f9",
            }}
          >
            今週の目標
          </p>
          <p
            style={{
              fontSize: 9,
              color: isLight ? "rgba(40,20,80,0.45)" : "rgba(255,255,255,0.35)",
            }}
          >
            達成したかどうかわかるように、できる限り定量化しよう！
          </p>
        </div>
        <textarea
          value={diaryEntry.goal || ""}
          onChange={(e) => updateField("goal", e.target.value)}
          placeholder="例：英単語100個覚える、数学問題集3章まで終わらせる"
          rows={2}
          style={{
            ...cellStyle,
            padding: "10px 14px",
            fontSize: 13,
            display: "block",
            width: "100%",
            resize: "none",
          }}
        />
      </div>

      {/* 時間割グリッド（横スクロール） */}
      <div
        className="flex-1 min-h-0 overflow-y-auto rounded-[20px]"
        style={{
          background: isLight
            ? "rgba(255,255,255,0.7)"
            : "rgba(255,255,255,0.07)",
          border: isLight
            ? "1.5px solid rgba(0,0,0,0.10)"
            : "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div style={{ overflowX: "auto", minWidth: "100%" }}>
          <table
            style={{
              borderCollapse: "collapse",
              fontSize: 10,
              minWidth: timeW + colW * 7 + 120,
            }}
          >
            {/* ヘッダー行 */}
            <thead>
              <tr>
                <th
                  style={{
                    width: timeW,
                    minWidth: timeW,
                    padding: "8px 4px",
                    background: isLight ? "#dbeafe" : "rgba(6,182,212,0.25)",
                    border: isLight
                      ? "1px solid rgba(0,0,0,0.12)"
                      : "1px solid rgba(255,255,255,0.1)",
                    color: isLight ? "#1e40af" : "#93c5fd",
                    fontWeight: 800,
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  時間
                </th>
                {weekDates.map((date, di) => (
                  <th
                    key={di}
                    colSpan={2}
                    style={{
                      width: colW,
                      minWidth: colW,
                      padding: "6px 2px",
                      background:
                        di === 0
                          ? isLight
                            ? "#bfdbfe"
                            : "rgba(59,130,246,0.3)"
                          : isLight
                          ? "#dbeafe"
                          : "rgba(6,182,212,0.2)",
                      border: isLight
                        ? "1px solid rgba(0,0,0,0.12)"
                        : "1px solid rgba(255,255,255,0.1)",
                      color: isLight ? "#1e40af" : "#93c5fd",
                      fontWeight: 800,
                      textAlign: "center",
                    }}
                  >
                    {dayNames[di]}（{date.getMonth() + 1}/{date.getDate()}）
                    {di === 0 ? " ★" : ""}
                  </th>
                ))}
                <th
                  style={{
                    minWidth: 110,
                    padding: "8px 6px",
                    background: isLight ? "#dbeafe" : "rgba(6,182,212,0.2)",
                    border: isLight
                      ? "1px solid rgba(0,0,0,0.12)"
                      : "1px solid rgba(255,255,255,0.1)",
                    color: isLight ? "#1e40af" : "#93c5fd",
                    fontWeight: 800,
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  今週のよかった点
                </th>
              </tr>
              <tr>
                <th
                  style={{
                    background: isLight ? "#eff6ff" : "rgba(255,255,255,0.05)",
                    border: isLight
                      ? "1px solid rgba(0,0,0,0.08)"
                      : "1px solid rgba(255,255,255,0.07)",
                  }}
                />
                {weekDates.map((_, di) => (
                  <React.Fragment key={di}>
                    <th
                      style={{
                        width: colW / 2,
                        padding: "4px 2px",
                        background: isLight
                          ? "#eff6ff"
                          : "rgba(255,255,255,0.05)",
                        border: isLight
                          ? "1px solid rgba(0,0,0,0.08)"
                          : "1px solid rgba(255,255,255,0.07)",
                        color: isLight
                          ? "rgba(30,64,175,0.7)"
                          : "rgba(147,197,253,0.7)",
                        fontWeight: 700,
                        textAlign: "center",
                        fontSize: 9,
                      }}
                    >
                      予定
                    </th>
                    <th
                      style={{
                        width: colW / 2,
                        padding: "4px 2px",
                        background: isLight
                          ? "#eff6ff"
                          : "rgba(255,255,255,0.05)",
                        border: isLight
                          ? "1px solid rgba(0,0,0,0.08)"
                          : "1px solid rgba(255,255,255,0.07)",
                        color: isLight
                          ? "rgba(30,64,175,0.7)"
                          : "rgba(147,197,253,0.7)",
                        fontWeight: 700,
                        textAlign: "center",
                        fontSize: 9,
                      }}
                    >
                      実績
                    </th>
                  </React.Fragment>
                ))}
                <th
                  style={{
                    background: isLight ? "#eff6ff" : "rgba(255,255,255,0.05)",
                    border: isLight
                      ? "1px solid rgba(0,0,0,0.08)"
                      : "1px solid rgba(255,255,255,0.07)",
                  }}
                  rowSpan={timeSlots.length + 1}
                />
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, si) => (
                <tr key={slot}>
                  <td
                    style={{
                      width: timeW,
                      minWidth: timeW,
                      padding: "2px 4px",
                      background: isLight
                        ? "#eff6ff"
                        : "rgba(255,255,255,0.04)",
                      border: isLight
                        ? "1px solid rgba(0,0,0,0.08)"
                        : "1px solid rgba(255,255,255,0.07)",
                      color: isLight ? "#1e40af" : "#93c5fd",
                      fontWeight: 700,
                      fontSize: 9,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {slot}
                  </td>
                  {weekDates.map((_, di) => (
                    <React.Fragment key={di}>
                      <td
                        style={{
                          width: colW / 2,
                          minWidth: colW / 2,
                          border: isLight
                            ? "1px solid rgba(0,0,0,0.08)"
                            : "1px solid rgba(255,255,255,0.07)",
                          padding: 0,
                          verticalAlign: "top",
                        }}
                      >
                        <textarea
                          rows={1}
                          value={
                            (diaryEntry.cells || {})[`${di}_${slot}_plan`] || ""
                          }
                          onChange={(e) =>
                            updateCell(di, slot, "plan", e.target.value)
                          }
                          style={{
                            ...cellStyle,
                            minHeight: 22,
                            height: 22,
                          }}
                        />
                      </td>
                      <td
                        style={{
                          width: colW / 2,
                          minWidth: colW / 2,
                          border: isLight
                            ? "1px solid rgba(0,0,0,0.08)"
                            : "1px solid rgba(255,255,255,0.07)",
                          padding: 0,
                          verticalAlign: "top",
                          background: isLight
                            ? "rgba(251,207,232,0.15)"
                            : "rgba(244,114,182,0.05)",
                        }}
                      >
                        <textarea
                          rows={1}
                          value={
                            (diaryEntry.cells || {})[`${di}_${slot}_actual`] ||
                            ""
                          }
                          onChange={(e) =>
                            updateCell(di, slot, "actual", e.target.value)
                          }
                          style={{
                            ...cellStyle,
                            minHeight: 22,
                            height: 22,
                          }}
                        />
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 集計行・振り返り */}
        <div
          className="p-4 space-y-3"
          style={{
            borderTop: isLight
              ? "2px solid rgba(0,0,0,0.10)"
              : "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {/* 勉強時間・達成率 */}
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((d, di) => (
              <div key={di} className="space-y-1">
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textAlign: "center",
                    color: isLight ? "#0891b2" : "#67e8f9",
                  }}
                >
                  {d}
                </p>
                <input
                  type="text"
                  value={(diaryEntry.studyHours || {})[di] || ""}
                  onChange={(e) => {
                    const v = {
                      ...(diaryEntry.studyHours || {}),
                      [di]: e.target.value,
                    };
                    updateField("studyHours", v);
                  }}
                  placeholder="0h"
                  style={{
                    ...cellStyle,
                    textAlign: "center",
                    border: isLight
                      ? "1px solid rgba(0,0,0,0.12)"
                      : "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 6,
                    padding: "3px 4px",
                    fontSize: 11,
                  }}
                />
                <p
                  style={{
                    fontSize: 8,
                    textAlign: "center",
                    color: isLight
                      ? "rgba(40,20,80,0.4)"
                      : "rgba(255,255,255,0.35)",
                  }}
                >
                  勉強時間
                </p>
                <input
                  type="text"
                  value={(diaryEntry.achievement || {})[di] || ""}
                  onChange={(e) => {
                    const v = {
                      ...(diaryEntry.achievement || {}),
                      [di]: e.target.value,
                    };
                    updateField("achievement", v);
                  }}
                  placeholder="0%"
                  style={{
                    ...cellStyle,
                    textAlign: "center",
                    border: isLight
                      ? "1px solid rgba(0,0,0,0.12)"
                      : "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 6,
                    padding: "3px 4px",
                    fontSize: 11,
                  }}
                />
                <p
                  style={{
                    fontSize: 8,
                    textAlign: "center",
                    color: isLight
                      ? "rgba(40,20,80,0.4)"
                      : "rgba(255,255,255,0.35)",
                  }}
                >
                  達成率
                </p>
                <textarea
                  rows={2}
                  value={(diaryEntry.reflection || {})[di] || ""}
                  onChange={(e) => {
                    const v = {
                      ...(diaryEntry.reflection || {}),
                      [di]: e.target.value,
                    };
                    updateField("reflection", v);
                  }}
                  placeholder="振り返り・気づき"
                  style={{
                    ...cellStyle,
                    border: isLight
                      ? "1px solid rgba(0,0,0,0.12)"
                      : "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 6,
                    padding: "3px 4px",
                    fontSize: 9,
                    resize: "none",
                    minHeight: 40,
                  }}
                />
              </div>
            ))}
          </div>

          {/* よかった点・問題発見・原因分析・解決策 */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { key: "goodPoints", label: "今週のよかった点" },
              { key: "problems", label: "問題発見" },
              { key: "causes", label: "原因分析" },
              { key: "solutions", label: "解決策" },
            ].map(({ key, label }) => (
              <div
                key={key}
                className="rounded-[12px] overflow-hidden"
                style={{
                  border: isLight
                    ? "1.5px solid rgba(6,182,212,0.3)"
                    : "1px solid rgba(6,182,212,0.2)",
                }}
              >
                <div
                  className="px-3 py-1.5"
                  style={{
                    background: isLight
                      ? "rgba(6,182,212,0.12)"
                      : "rgba(6,182,212,0.15)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: isLight ? "#0891b2" : "#67e8f9",
                    }}
                  >
                    {label}
                  </p>
                </div>
                <textarea
                  rows={3}
                  value={diaryEntry[key] || ""}
                  onChange={(e) => updateField(key, e.target.value)}
                  placeholder={label + "を記入..."}
                  style={{
                    ...cellStyle,
                    padding: "8px 10px",
                    fontSize: 12,
                    display: "block",
                    width: "100%",
                    resize: "none",
                    minHeight: 60,
                  }}
                />
              </div>
            ))}
          </div>

          {/* コーチからのコメント（先生のみ編集可） */}
          <div
            className="rounded-[12px] overflow-hidden"
            style={{
              border: isLight
                ? "1.5px solid rgba(245,158,11,0.4)"
                : "1px solid rgba(245,158,11,0.25)",
            }}
          >
            <div
              className="px-3 py-1.5"
              style={{
                background: isLight
                  ? "rgba(245,158,11,0.12)"
                  : "rgba(245,158,11,0.18)",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: isLight ? "#d97706" : "#fbbf24",
                }}
              >
                コーチからのコメント
              </p>
            </div>
            <textarea
              rows={3}
              value={diaryEntry.coachComment || ""}
              onChange={(e) => updateField("coachComment", e.target.value)}
              readOnly={!profile?.isTeacher}
              placeholder={
                profile?.isTeacher
                  ? "コメントを記入..."
                  : "先生からのコメントがここに表示されます"
              }
              style={{
                ...cellStyle,
                padding: "8px 10px",
                fontSize: 12,
                display: "block",
                width: "100%",
                resize: "none",
                minHeight: 60,
                opacity: !profile?.isTeacher ? 0.7 : 1,
                cursor: !profile?.isTeacher ? "default" : "text",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


export {
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
  StudyDiaryScreen
};
