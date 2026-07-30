import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, Shuffle, ArrowRight, Eye, RefreshCw, Sparkles, Folder, Mail } from 'lucide-react';
import { FLOATING_ITEMS, PROJECTS } from '../data/portfolioData';
import { Project, FloatingItem, Language } from '../types';

// Realistic 3D Cubic Dice Component with Specular Lighting & Smooth Rounded Edges
const Realistic3DDice: React.FC<{ isRolling?: boolean; className?: string }> = ({ isRolling, className = "w-10 h-10" }) => {
  return (
    <div className={`relative inline-flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95 ${isRolling ? 'animate-spin' : ''}`}>
      <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="diceTopGrad" x1="12" y1="6" x2="36" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.6" stopColor="#F9FAFB" />
            <stop offset="1" stopColor="#E5E7EB" />
          </linearGradient>
          <linearGradient id="diceLeftGrad" x1="6" y1="18" x2="24" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E5E7EB" />
            <stop offset="1" stopColor="#9CA3AF" />
          </linearGradient>
          <linearGradient id="diceRightGrad" x1="24" y1="18" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D1D5DB" />
            <stop offset="1" stopColor="#6B7280" />
          </linearGradient>
        </defs>

        {/* Soft Drop Shadow */}
        <ellipse cx="24" cy="43" rx="14" ry="3.5" fill="#000000" fillOpacity="0.22" />

        {/* Top Face */}
        <path d="M24 6.5L39 13.5L24 20.5L9 13.5L24 6.5Z" fill="url(#diceTopGrad)" stroke="#9CA3AF" strokeWidth="0.8" strokeLinejoin="round" />
        {/* Left Face */}
        <path d="M9 13.5L24 20.5V37.5L9 30.5V13.5Z" fill="url(#diceLeftGrad)" stroke="#9CA3AF" strokeWidth="0.8" strokeLinejoin="round" />
        {/* Right Face */}
        <path d="M24 20.5L39 13.5V30.5L24 37.5V20.5Z" fill="url(#diceRightGrad)" stroke="#9CA3AF" strokeWidth="0.8" strokeLinejoin="round" />

        {/* Pips / Dots */}
        {/* Top Face Center Pip (Red Specular Accent) */}
        <ellipse cx="24" cy="13.5" rx="2.5" ry="1.4" fill="#EF4444" />

        {/* Left Face Dots */}
        <ellipse cx="14" cy="20" rx="1.5" ry="2.2" fill="#111827" />
        <ellipse cx="16" cy="25.5" rx="1.5" ry="2.2" fill="#111827" />
        <ellipse cx="18" cy="31" rx="1.5" ry="2.2" fill="#111827" />

        {/* Right Face Dots */}
        <ellipse cx="30" cy="21.5" rx="1.5" ry="2.2" fill="#111827" />
        <ellipse cx="34" cy="29.5" rx="1.5" ry="2.2" fill="#111827" />
      </svg>
    </div>
  );
};

interface HomeTabProps {
  onSelectProject: (project: Project) => void;
  onGoToAbout: () => void;
  playClickSound: () => void;
  language: Language;
  isIntroReady?: boolean;
  likesMap?: Record<string, number>;
}

// 10 Perimeter slots for clean card placement around central text
const TEN_PERIMETER_SLOTS = [
  { x: 8, y: 15, rotation: -12, scale: 0.88 },
  { x: 28, y: 8, rotation: 8, scale: 0.85 },
  { x: 72, y: 8, rotation: -6, scale: 0.85 },
  { x: 92, y: 15, rotation: 14, scale: 0.88 },
  { x: 95, y: 52, rotation: -16, scale: 0.88 },
  { x: 5, y: 52, rotation: 12, scale: 0.88 },
  { x: 8, y: 88, rotation: 6, scale: 0.88 },
  { x: 28, y: 92, rotation: -14, scale: 0.88 },
  { x: 72, y: 92, rotation: 12, scale: 0.88 },
  { x: 92, y: 88, rotation: -20, scale: 0.88 }
];

const createTop10Items = (likesMap: Record<string, number> = {}): FloatingItem[] => {
  // Sort projects: featured projects first, then sorted by likes descending
  const sorted = [...PROJECTS].sort((a, b) => {
    const isFeaturedA = a.featured !== false ? 1 : 0;
    const isFeaturedB = b.featured !== false ? 1 : 0;
    if (isFeaturedA !== isFeaturedB) {
      return isFeaturedB - isFeaturedA;
    }
    const likesA = likesMap[a.id] ?? a.likes ?? 0;
    const likesB = likesMap[b.id] ?? b.likes ?? 0;
    return likesB - likesA;
  });

  const top10 = sorted.slice(0, 10);

  return top10.map((project, idx) => {
    const slot = TEN_PERIMETER_SLOTS[idx % TEN_PERIMETER_SLOTS.length];
    return {
      id: `card-top-${project.id}`,
      type: 'card',
      title: project.title,
      subtitle: project.subtitle,
      image: project.coverImage,
      x: slot.x,
      y: slot.y,
      rotation: slot.rotation,
      scale: slot.scale,
      zIndex: idx + 1,
      projectId: project.id
    };
  });
};

export const HomeTab: React.FC<HomeTabProps> = ({
  onSelectProject,
  onGoToAbout,
  playClickSound,
  language,
  isIntroReady = true,
  likesMap = {}
}) => {
  const [items, setItems] = useState<FloatingItem[]>(() => createTop10Items(likesMap));
  const [isRandomized, setIsRandomized] = useState(false);

  // Sync top 10 items if likesMap updates and user hasn't shuffled to random draw mode
  useEffect(() => {
    if (!isRandomized) {
      setItems(createTop10Items(likesMap));
    }
  }, [likesMap, isRandomized]);

  const [activeZ, setActiveZ] = useState(20);
  const [rolledProject, setRolledProject] = useState<Project | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // RAF Throttled Mouse Position Tracking for Smooth 60fps Repulsion
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    lastPosRef.current = { x, y };

    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(() => {
        if (lastPosRef.current) {
          setMousePos(lastPosRef.current);
        }
        rafIdRef.current = null;
      });
    }
  };


  const handleMouseLeave = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setMousePos(null);
    setHoveredItemId(null);
  };

  // Bring item to front on drag/hover by reordering array without unbounded zIndex growth
  const bringToFront = (id: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const target = prev[idx];
      const rest = prev.filter((item) => item.id !== id);
      return [...rest, target];
    });
  };

  // Shuffle & Random Draw: Pick 10 random distinct projects from PROJECTS and scatter them
  const handleShuffle = () => {
    playClickSound();
    setIsRandomized(true);

    const shuffledProjects = [...PROJECTS].sort(() => Math.random() - 0.5).slice(0, 10);

    const newRandomItems: FloatingItem[] = shuffledProjects.map((project, idx) => {
      const side = idx % 4; // 0: top, 1: bottom, 2: left, 3: right
      let nx = 50;
      let ny = 50;

      if (side === 0) {
        nx = Math.random() * 80 + 10;
        ny = Math.random() * 10 + 6;
      } else if (side === 1) {
        nx = Math.random() * 80 + 10;
        ny = Math.random() * 10 + 82;
      } else if (side === 2) {
        nx = Math.random() * 10 + 6;
        ny = Math.random() * 80 + 10;
      } else {
        nx = Math.random() * 10 + 82;
        ny = Math.random() * 80 + 10;
      }

      return {
        id: `card-rnd-${project.id}-${Date.now()}-${idx}`,
        type: 'card',
        title: project.title,
        subtitle: project.subtitle,
        image: project.coverImage,
        x: nx,
        y: ny,
        rotation: (Math.random() - 0.5) * 36,
        scale: 0.82 + Math.random() * 0.12,
        zIndex: Math.floor(Math.random() * 15) + 1,
        projectId: project.id
      };
    });

    setItems(newRandomItems);
  };

  const handleResetTop10 = () => {
    playClickSound();
    setIsRandomized(false);
    setItems(createTop10Items(likesMap));
  };

  // Roll dice for random project
  const handleRollDice = () => {
    playClickSound();
    setIsRolling(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * PROJECTS.length);
      setRolledProject(PROJECTS[randomIndex]);
      setIsRolling(false);
    }, 500);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full bg-white dark:bg-neutral-950 flex flex-col justify-center pt-12 sm:pt-16 pb-4 sm:pb-8 select-none overflow-visible transition-colors">
      
      {/* Pure background with subtle dot depth */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Subtle Ambient Lighting Depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[700px] h-[300px] bg-gradient-to-r from-gray-100/50 via-neutral-100/40 to-gray-50/50 dark:from-neutral-900/40 dark:via-neutral-800/20 dark:to-neutral-900/40 blur-3xl pointer-events-none rounded-full" />

      {/* FLOATING CANVAS AREA (Border-free full viewport floating area) */}
      <div 
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 w-full h-full flex items-center justify-center overflow-visible touch-none px-2 sm:px-6"
      >
        
        {/* CENTER TYPOGRAPHY (Strict z-30 layer ensures buttons & text are ALWAYS on top of floating cards) */}
        <div className="z-30 relative text-center pointer-events-auto max-w-[90vw] sm:max-w-2xl mx-auto py-4 sm:py-12 px-2 transition-all">
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.93 }}
            animate={isIntroReady ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 28, scale: 0.93 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="space-y-3 sm:space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 bg-black dark:bg-white text-white dark:text-black text-[9px] sm:text-[10px] font-mono tracking-widest uppercase shadow-xs rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black animate-pulse" />
              <span>{language === 'zh' ? '齐思设计 • QSi DESIGN' : 'QSi DESIGN STUDIO'}</span>
            </div>

            {/* FLUID HEADING TEXT */}
            <h1 className="text-[clamp(1.5rem,4.2vw,3.75rem)] font-black tracking-tight text-black dark:text-white font-sans leading-[1.12]">
              {language === 'zh' ? '美学重构与视觉实践' : 'RESTRUCTURING & VISUAL PRACTICE'}
            </h1>

            <p className="text-[11px] sm:text-sm text-gray-600 dark:text-neutral-400 max-w-md sm:max-w-lg mx-auto font-sans leading-relaxed font-light">
              {language === 'zh'
                ? '以极简致纯粹，于留白处见天地。拖拽或探索四周的灵感卡片，探索品牌的视觉资产与设计探索。'
                : 'Purity through minimalism. Drag or interact with floating inspiration cards around the perimeter.'}
            </p>

            {/* CONTROLS */}
            <div className="pt-1 sm:pt-4 flex items-center justify-center gap-3 sm:gap-4">
              {/* Dices Button: Clean Vector Dices Icon */}
              <button
                onClick={handleRollDice}
                disabled={isRolling}
                className="group p-2.5 sm:p-3 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all rounded-full active:scale-95 shadow-xs flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11"
                title={language === 'zh' ? '灵感骰子' : 'Inspiration Dice'}
                id="home-dice-icon-only-btn"
              >
                <Dices className={`w-4 h-4 sm:w-5 sm:h-5 ${isRolling ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform duration-300`} />
              </button>

              {/* Shuffle Button */}
              <button
                onClick={handleShuffle}
                className="group p-2.5 sm:p-3 bg-white dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white border border-gray-200 dark:border-neutral-700 transition-all rounded-full active:scale-95 shadow-xs flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11"
                title={language === 'zh' ? '打散排布' : 'Shuffle Layout'}
                id="home-shuffle-btn"
              >
                <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* FLOATING DRAGGABLE CARDS WITH HIGH-PERFORMANCE 60FPS RENDERING & ISOLATED Z-LAYER */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-visible">
          {(() => {
            const width = canvasRef.current?.clientWidth || 1200;
            const height = canvasRef.current?.clientHeight || 700;

            return items.map((item, index) => {
              const matchedProject = item.projectId
                ? PROJECTS.find((p) => p.id === item.projectId)
                : null;

              const isHovered = hoveredItemId === item.id;
              const isDragged = draggedItemId === item.id;
              const isSelectedCard = isHovered || isDragged;

              let repelX = 0;
              let repelY = 0;
              let repelScaleOffset = 0;

              if (!isSelectedCard) {
                const itemPx = (item.x / 100) * width;
                const itemPy = (item.y / 100) * height;

                let calcX = itemPx;
                let calcY = itemPy;

                // 1. Mouse Repulsion Force (Highly sensitive exponential curve)
                if (mousePos) {
                  const dxMouse = itemPx - mousePos.x;
                  const dyMouse = itemPy - mousePos.y;
                  const distMouse = Math.hypot(dxMouse, dyMouse);

                  const repelRadius = Math.max(300, Math.min(width, height) * 0.46);

                  if (distMouse < repelRadius && distMouse > 0) {
                    const factor = Math.pow(1 - distMouse / repelRadius, 1.1) * 260;
                    calcX += (dxMouse / distMouse) * factor;
                    calcY += (dyMouse / distMouse) * factor;
                    repelScaleOffset = -0.05 * (1 - distMouse / repelRadius);
                  }
                }

                // 2. Central Protection Shield (strictly prevents covering center text & buttons)
                const centerX = width / 2;
                const centerY = height / 2;

                const dxCenter = calcX - centerX;
                const dyCenter = calcY - centerY;
                const distCenter = Math.hypot(dxCenter, dyCenter);

                const safeRadius = Math.max(220, Math.min(width, height) * 0.35);

                if (distCenter < safeRadius) {
                  const pushOutAmount = (safeRadius - distCenter) * 1.35;
                  const normX = distCenter > 0 ? dxCenter / distCenter : (item.x < 50 ? -1 : 1);
                  const normY = distCenter > 0 ? dyCenter / distCenter : (item.y < 50 ? -1 : 1);

                  calcX += normX * pushOutAmount;
                  calcY += normY * pushOutAmount;
                }

                repelX = calcX - itemPx;
                repelY = calcY - itemPy;
              }

              const targetY = isSelectedCard ? -16 : repelY;

              const currentScale = isSelectedCard
                ? item.scale * 1.25
                : item.scale + repelScaleOffset;

              const cardTitle = matchedProject
                ? (language === 'zh' ? matchedProject.title : matchedProject.subtitle)
                : item.title;

              const cardSub = matchedProject
                ? (language === 'zh' ? matchedProject.subtitle : matchedProject.title)
                : item.subtitle;

              return (
                <motion.div
                  key={item.id}
                  drag
                  dragMomentum={true}
                  dragElastic={0.15}
                  onDragStart={() => {
                    setDraggedItemId(item.id);
                    bringToFront(item.id);
                  }}
                  onDragEnd={() => setDraggedItemId(null)}
                  onClick={() => bringToFront(item.id)}
                  onMouseEnter={() => {
                    setHoveredItemId(item.id);
                    bringToFront(item.id);
                  }}
                  onMouseLeave={() => setHoveredItemId(null)}
                  initial={{
                    left: '50%',
                    top: '50%',
                    opacity: 0,
                    scale: 0.1
                  }}
                  animate={
                    isIntroReady
                      ? {
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          x: repelX,
                          y: targetY,
                          opacity: 1,
                          scale: currentScale,
                          rotate: isSelectedCard ? 0 : item.rotation
                        }
                      : {
                          left: '50%',
                          top: '50%',
                          x: 0,
                          y: 0,
                          opacity: 0,
                          scale: 0.1,
                          rotate: 0
                        }
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 220,
                    damping: 22,
                    mass: 0.65,
                    delay: isIntroReady ? (index % 8) * 0.05 + 0.1 : 0
                  }}
                  style={{ zIndex: isSelectedCard ? 20 : index + 1 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing pointer-events-auto transition-all duration-200 transform-gpu will-change-transform"
                >
              {(item.type === 'card' || item.type === 'sketch' || item.type === 'photo') && (
                <div
                  onClick={() => matchedProject && onSelectProject(matchedProject)}
                  className={`group relative bg-white dark:bg-neutral-900 p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 w-[200px] sm:w-[250px] md:w-[280px] ${
                    isSelectedCard
                      ? 'border-black dark:border-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] ring-1 ring-black/10 dark:ring-white/20'
                      : 'border-gray-200 dark:border-neutral-800 shadow-sm hover:border-gray-400 dark:hover:border-neutral-600'
                  }`}
                >
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-gray-100 dark:via-neutral-800 to-transparent opacity-80" />

                  {item.image && (
                    <div className="relative aspect-4/3 overflow-hidden bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 rounded-xl">
                      <img
                        src={item.image}
                        alt={cardTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="mt-2.5 text-left">
                    <h3 className="text-xs sm:text-sm font-semibold text-black dark:text-white line-clamp-1 font-sans">
                      {cardTitle}
                    </h3>
                    <p className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 line-clamp-1 uppercase tracking-wider mt-0.5">
                      {cardSub}
                    </p>
                  </div>

                  {matchedProject && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-[10px] text-gray-500 dark:text-neutral-400 font-mono uppercase tracking-wider">
                      <span>{matchedProject.index}</span>
                      <span className="text-black dark:text-white font-semibold group-hover:underline">
                        {language === 'zh' ? '查看作品' : 'VIEW'} ↗
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ITEM TYPE: BADGE / DICE - Sized matching circular Vinyl */}
              {item.type === 'badge' && (
                <button
                  onClick={handleRollDice}
                  className={`relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:border-black dark:hover:border-white shadow-md active:scale-95 transition-all flex flex-col items-center justify-center p-2.5 ${
                    isSelectedCard ? 'scale-110 border-black dark:border-white shadow-2xl ring-2 ring-black/10 dark:ring-white/20' : ''
                  }`}
                  title={language === 'zh' ? '灵感骰子 (点击抽取作品)' : 'Inspiration Dice (Click to roll)'}
                >
                  <Realistic3DDice isRolling={isRolling} className="w-10 h-10 sm:w-12 sm:h-12" />
                  <span className="text-[8px] font-mono text-gray-500 dark:text-neutral-400 mt-0.5 uppercase tracking-wider group-hover:text-black dark:group-hover:text-white">
                    {language === 'zh' ? '灵感骰子' : 'DICE'}
                  </span>
                </button>
              )}


              {item.type === 'vinyl' && (
                <div
                  onClick={() => matchedProject && onSelectProject(matchedProject)}
                  className={`relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black dark:bg-neutral-900 p-1 border flex items-center justify-center transition-all ${
                    isSelectedCard ? 'border-amber-400 shadow-xl scale-110' : 'border-gray-800 shadow-md'
                  }`}
                >
                  <div className="w-full h-full rounded-full border border-gray-800 flex items-center justify-center bg-neutral-950">
                    <span className="text-xl font-light font-sans tracking-tight text-white animate-[pulse_4s_infinite_ease-in-out]">QSi</span>
                  </div>
                </div>
              )}

              {item.type === 'tag' && (
                <div className="bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 border border-gray-300 dark:border-neutral-700 px-3 py-1 text-[10px] font-mono uppercase tracking-widest shadow-xs -rotate-3">
                  QSi LAB
                </div>
              )}
            </motion.div>
          );
        })})()}
        </div>
      </div>

      {/* ROLLED DICE RESULT POPUP MODAL */}
      <AnimatePresence>
        {rolledProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 border border-black dark:border-white p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-mono uppercase tracking-widest">
                <Realistic3DDice className="w-4 h-4" />
                <span>{language === 'zh' ? '灵感骰子抽取作品' : 'DICE RESULT'}</span>
              </div>

              <div className="aspect-16/10 bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 overflow-hidden">
                <img
                  src={rolledProject.coverImage}
                  alt={rolledProject.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
                  {rolledProject.cardNumber} • {rolledProject.categoryLabel}
                </span>
                <h3 className="text-lg font-bold text-black dark:text-white mt-1">
                  {rolledProject.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-neutral-400 mt-1.5 line-clamp-2 font-sans">
                  {rolledProject.summary}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    const p = rolledProject;
                    setRolledProject(null);
                    onSelectProject(p);
                  }}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black font-sans font-medium text-xs tracking-widest py-3 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                  {language === 'zh' ? '查看作品详情' : 'VIEW DETAILS'}
                </button>
                <button
                  onClick={() => setRolledProject(null)}
                  className="px-5 py-3 border border-gray-300 dark:border-neutral-700 font-sans text-xs text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  {language === 'zh' ? '关闭' : 'CLOSE'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

