import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid, Layers, ChevronRight, ChevronLeft, Edit3, Plus, Trash2, Sliders, X, RotateCcw, Check } from 'lucide-react';
import { Project, WorkCategory, Language } from '../types';
import { FourPointStar } from './FourPointStar';
import { WorksTabSkeleton } from './Skeletons';

interface WorksTabProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  playClickSound: () => void;
  initialProjectIndex?: number;
  likesMap: Record<string, number>;
  onIncrementLike: (projectId: string) => void;
  language?: Language;
  onOpenProjectManager?: () => void;
  isEditMode?: boolean;
}

export interface CustomCategoryDef {
  id: string;
  labelZh: string;
  labelEn: string;
  isCustom?: boolean;
}

const DEFAULT_CATEGORIES: CustomCategoryDef[] = [
  { id: 'all', labelZh: '全部作品', labelEn: 'ALL PROJECTS' },
  { id: 'branding', labelZh: '品牌 VI', labelEn: 'BRANDING' },
  { id: 'type', labelZh: '字体排版', labelEn: 'TYPE & EDITORIAL' },
  { id: 'packaging', labelZh: '包装工程', labelEn: 'PACKAGING' },
  { id: 'exhibition', labelZh: '展陈艺术', labelEn: 'EXHIBITION' }
];

export const WorksTab: React.FC<WorksTabProps> = ({
  projects,
  onSelectProject,
  playClickSound,
  likesMap,
  onIncrementLike,
  language = 'zh',
  onOpenProjectManager,
  isEditMode = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'deck'>('grid');
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Categories State with localStorage persistence
  const [customCategories, setCustomCategories] = useState<CustomCategoryDef[]>(() => {
    try {
      const saved = localStorage.getItem('portfolio_custom_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.warn('Failed to load custom categories:', err);
    }
    return DEFAULT_CATEGORIES;
  });

  const [isEditingBar, setIsEditingBar] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const activeBarEditing = isEditingBar || Boolean(editingCatId);

  // Long press timer refs for category pills
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressedRef = useRef<boolean>(false);

  const handlePointerDownPill = (catId: string, e: React.PointerEvent) => {
    if (catId === 'all') return;
    isLongPressedRef.current = false;
    pressStartPosRef.current = { x: e.clientX, y: e.clientY };

    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

    longPressTimerRef.current = setTimeout(() => {
      isLongPressedRef.current = true;
      playClickSound();
      setEditingCatId(catId);
      setIsEditingBar(true);
    }, 500);
  };

  const handlePointerMovePill = (e: React.PointerEvent) => {
    if (!pressStartPosRef.current) return;
    const dx = Math.abs(e.clientX - pressStartPosRef.current.x);
    const dy = Math.abs(e.clientY - pressStartPosRef.current.y);
    if (dx > 6 || dy > 6) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const handlePointerUpOrLeavePill = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Save custom categories to localStorage whenever they change
  const saveCustomCategories = (newList: CustomCategoryDef[]) => {
    setCustomCategories(newList);
    try {
      localStorage.setItem('portfolio_custom_categories', JSON.stringify(newList));
    } catch (err) {
      console.error('Failed to save custom categories:', err);
    }
  };

  const handleAddCategoryInline = () => {
    playClickSound();
    const newId = `cat_${Date.now()}`;
    const newCat: CustomCategoryDef = {
      id: newId,
      labelZh: '新词条',
      labelEn: 'NEW TERM',
      isCustom: true
    };
    const updated = [...customCategories, newCat];
    saveCustomCategories(updated);
  };

  const handleRenameCategoryInline = (catId: string, newZh: string, newEn?: string) => {
    const updated = customCategories.map((c) => {
      if (c.id === catId) {
        return {
          ...c,
          labelZh: newZh,
          labelEn: newEn !== undefined ? newEn : newZh.toUpperCase()
        };
      }
      return c;
    });
    saveCustomCategories(updated);
  };

  const handleDeleteCategoryInline = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    const updated = customCategories.filter((c) => c.id !== catId);
    saveCustomCategories(updated);
    if (selectedCategory === catId) {
      setSelectedCategory('all');
    }
  };

  // Synchronize category list dynamically with projects & compute live count matching projects/tags
  const categories = useMemo(() => {
    const definedIds = new Set(customCategories.map((c) => c.id));
    const projectCategories = new Set(projects.map((p) => p.category).filter(Boolean));

    const mergedList = [...customCategories];

    // Auto-detect non-registered categories from projects
    projectCategories.forEach((catKey) => {
      if (!definedIds.has(catKey)) {
        const formattedLabel = catKey.charAt(0).toUpperCase() + catKey.slice(1).replace(/[-_]/g, ' ');
        mergedList.push({
          id: catKey,
          labelZh: formattedLabel,
          labelEn: formattedLabel.toUpperCase(),
          isCustom: true
        });
      }
    });

    // Compute live count for each category automatically
    return mergedList.map((cat) => {
      let count = 0;
      if (cat.id === 'all') {
        count = projects.length;
      } else {
        const termId = cat.id.toLowerCase().trim();
        const termZh = (cat.labelZh || '').toLowerCase().trim();
        const termEn = (cat.labelEn || '').toLowerCase().trim();

        count = projects.filter((p) => {
          const pCat = (p.category || '').toLowerCase().trim();
          const pTags = (p.tags || []).map((t) => t.toLowerCase().trim());

          return (
            (termId && pCat === termId) ||
            (termZh && pCat === termZh) ||
            (termEn && pCat === termEn) ||
            (termId && pTags.includes(termId)) ||
            (termZh && pTags.includes(termZh)) ||
            (termEn && pTags.includes(termEn))
          );
        }).length;
      }
      return { ...cat, count };
    });
  }, [customCategories, projects]);

  // Horizontal Drag to Scroll for Category Filter Bar
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleCategoryChange = (catId: string) => {
    playClickSound();
    setIsLoading(true);
    setSelectedCategory(catId);
    setCurrentDeckIndex(0);
    setTimeout(() => setIsLoading(false), 220);
  };

  const handleViewModeChange = (mode: 'grid' | 'deck') => {
    playClickSound();
    setIsLoading(true);
    setViewMode(mode);
    setTimeout(() => setIsLoading(false), 220);
  };

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (selectedCategory !== 'all') {
      const activeCat = categories.find((c) => c.id === selectedCategory);
      if (activeCat) {
        const termId = activeCat.id.toLowerCase().trim();
        const termZh = (activeCat.labelZh || '').toLowerCase().trim();
        const termEn = (activeCat.labelEn || '').toLowerCase().trim();

        list = projects.filter((p) => {
          const pCat = (p.category || '').toLowerCase().trim();
          const pTags = (p.tags || []).map((t) => t.toLowerCase().trim());

          return (
            (termId && pCat === termId) ||
            (termZh && pCat === termZh) ||
            (termEn && pCat === termEn) ||
            (termId && pTags.includes(termId)) ||
            (termZh && pTags.includes(termZh)) ||
            (termEn && pTags.includes(termEn))
          );
        });
      } else {
        const termKey = selectedCategory.toLowerCase().trim();
        list = projects.filter((p) => {
          const pCat = (p.category || '').toLowerCase().trim();
          const pTags = (p.tags || []).map((t) => t.toLowerCase().trim());
          return pCat === termKey || pTags.includes(termKey);
        });
      }
    }

    return list.slice().sort((a, b) => {
      const likesA = likesMap[a.id] ?? (a.likes || 0);
      const likesB = likesMap[b.id] ?? (b.likes || 0);
      return likesB - likesA;
    });
  }, [selectedCategory, categories, projects, likesMap]);

  const nextDeckCard = () => {
    playClickSound();
    setCurrentDeckIndex((prev) => (prev + 1) % filteredProjects.length);
  };

  const prevDeckCard = () => {
    playClickSound();
    setCurrentDeckIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length);
  };

  const formatLikes = (count: number) => (count > 999 ? '999+' : `${count}`);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-transparent via-white to-white dark:via-neutral-950 dark:to-neutral-950 pt-16 sm:pt-20 pb-24 sm:pb-32 px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-20 transition-colors overflow-hidden">
      {/* Subtle Ambient Blend Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-32 bg-gradient-to-b from-gray-100/40 via-transparent to-transparent dark:from-neutral-900/30 pointer-events-none blur-xl" />

      <div className="relative max-w-7xl 2xl:max-w-[1600px] mx-auto space-y-6 sm:space-y-8 z-10">
        
        {/* HEADER BAR & FILTER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 border-b border-gray-100 dark:border-neutral-800 pb-5 sm:pb-6">
          
          <div className="space-y-1.5 sm:space-y-2">
            <div className="mb-1">
              <button
                onClick={() => {
                  playClickSound();
                  const el = document.getElementById('home');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[11px] font-mono px-3 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-gray-700 dark:text-neutral-300 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                title={language === 'zh' ? '返回首页' : 'Back to Home'}
              >
                <span>↑</span>
                <span>{language === 'zh' ? '返回首页' : 'HOME'}</span>
              </button>
            </div>
            
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-black dark:text-white tracking-tight font-sans">
              {language === 'zh' ? '精选作品' : 'SELECTED WORKS'}
            </h1>
          </div>

          {/* Compact View Mode Switcher & Manage Projects Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isEditMode && onOpenProjectManager && (
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onOpenProjectManager();
                }}
                className="p-2 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-neutral-600 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0 shadow-2xs"
                title={language === 'zh' ? '管理或替换作品集' : 'Manage or Replace Projects'}
                id="works-manage-projects-btn"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            <div className="bg-gray-100 dark:bg-neutral-900 p-1 border border-gray-200 dark:border-neutral-800 rounded-full flex items-center gap-1 shadow-2xs">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'grid'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
                title={language === 'zh' ? '网格视图' : 'Grid View'}
                id="works-grid-view-btn"
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleViewModeChange('deck')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'deck'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
                title={language === 'zh' ? '卡牌视图' : 'Deck View'}
                id="works-deck-view-btn"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CATEGORY FILTER PILLS (With Inline Editing, Deletion Cross & Inline Add) */}
        <div className="relative w-full overflow-hidden space-y-2.5">
          <div className="flex items-center gap-2">
            <div
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeaveOrUp}
              onMouseUp={handleMouseLeaveOrUp}
              onMouseMove={handleMouseMove}
              className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 pt-1 scrollbar-none flex-1 max-w-full touch-pan-x snap-x snap-mandatory scroll-smooth px-0.5 cursor-grab active:cursor-grabbing select-none"
            >
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const isAll = cat.id === 'all';
                const isPillEditable = !isAll && activeBarEditing;
                const primaryText = language === 'zh' ? cat.labelZh : cat.labelEn;
                const secondaryText = language === 'zh' ? cat.labelEn : cat.labelZh;

                return (
                  <div
                    key={cat.id}
                    onClick={(e) => {
                      if (isLongPressedRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                        isLongPressedRef.current = false;
                        return;
                      }
                      if (!isPillEditable) {
                        handleCategoryChange(cat.id);
                      }
                    }}
                    onPointerDown={(e) => handlePointerDownPill(cat.id, e)}
                    onPointerMove={handlePointerMovePill}
                    onPointerUp={handlePointerUpOrLeavePill}
                    onPointerCancel={handlePointerUpOrLeavePill}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-sans rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 sm:gap-2 shrink-0 snap-start cursor-pointer select-none ${
                      isActive
                        ? 'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white font-bold shadow-xs scale-[1.02]'
                        : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-300 border border-gray-200 dark:border-neutral-800 hover:text-black dark:hover:text-white'
                    }`}
                    id={`filter-tab-${cat.id}`}
                  >
                    {isPillEditable ? (
                      <input
                        type="text"
                        value={cat.labelZh}
                        onChange={(e) => handleRenameCategoryInline(cat.id, e.target.value, cat.labelEn)}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        placeholder="词条名称"
                        className="bg-transparent border-b border-amber-400 focus:outline-none text-xs font-bold font-sans text-amber-700 dark:text-amber-300 w-20"
                        autoFocus={editingCatId === cat.id}
                      />
                    ) : (
                      <>
                        <span>{primaryText}</span>
                        <span className="text-[10px] opacity-60 font-mono hidden xs:inline">{secondaryText}</span>
                      </>
                    )}

                    {/* Automatic Count Badge matching projects */}
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black' : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300'
                    }`}>
                      {cat.count}
                    </span>

                    {/* Inline Delete Cross Button */}
                    {isPillEditable && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCategoryInline(cat.id, e)}
                        className="p-0.5 hover:bg-red-500/20 text-red-500 rounded-full transition-colors cursor-pointer"
                        title="删除此类目词条"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Inline Add Category Pill */}
              {activeBarEditing && (
                <button
                  type="button"
                  onClick={handleAddCategoryInline}
                  className="px-3 py-1.5 sm:py-2 text-xs font-mono bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-dashed border-amber-400 dark:border-amber-600 rounded-full transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs font-bold active:scale-95"
                  title="增加新词条"
                  id="add-category-pill-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'zh' ? '增加词条' : 'Add Term'}</span>
                </button>
              )}
            </div>

            {/* EDIT CATEGORY BAR BUTTON: Only visible in edit mode, icon only, click toggles edit mode on/off */}
            {isEditMode && (
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  if (activeBarEditing) {
                    setIsEditingBar(false);
                    setEditingCatId(null);
                  } else {
                    setIsEditingBar(true);
                  }
                }}
                className={`p-2 sm:p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-2xs font-bold active:scale-95 ${
                  activeBarEditing
                    ? 'bg-amber-500 text-white border border-amber-500 ring-2 ring-amber-300 dark:ring-amber-700'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80'
                }`}
                title={activeBarEditing ? (language === 'zh' ? '关闭编辑' : 'Close Edit') : (language === 'zh' ? '编辑 / 增减分类词条' : 'Edit Categories')}
                id="edit-category-bar-btn"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* SKELETON LOADING OR CONTENT */}
        {isLoading ? (
          <WorksTabSkeleton viewMode={viewMode} />
        ) : (
          <>
            {/* VIEW MODE 1: GRID VIEW */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                {filteredProjects.map((project, idx) => {
                  const currentLikes = likesMap[project.id] ?? (project.likes || 12);
                  const displayTitle = language === 'zh' ? project.title : project.subtitle;
                  const displaySub = language === 'zh' ? project.subtitle : project.title;

                  return (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      onClick={() => {
                        playClickSound();
                        onSelectProject(project);
                      }}
                      className="group cursor-pointer bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-all duration-300 relative flex flex-col justify-between shadow-2xs hover:shadow-lg"
                      id={`project-card-${project.id}`}
                    >
                      {/* Top Header: Star Like Icon + Index */}
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playClickSound();
                            onIncrementLike(project.id);
                          }}
                          className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono text-gray-600 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700/80 rounded-full transition-all active:scale-95"
                          title={language === 'zh' ? '点赞 +1' : 'Like +1'}
                        >
                          <FourPointStar className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                          <span>{formatLikes(currentLikes)}</span>
                        </button>

                        <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
                          {project.index}
                        </span>
                      </div>

                      {/* Cover Artwork */}
                      <div className="relative aspect-4/3 overflow-hidden bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 my-3 rounded-lg">
                        <img
                          src={project.coverImage}
                          alt={displayTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white dark:bg-black text-black dark:text-white font-mono font-semibold text-xs px-4 py-2 rounded-md uppercase tracking-widest">
                            {language === 'zh' ? '查看案例 ↗' : 'VIEW CASE ↗'}
                          </span>
                        </div>
                      </div>

                      {/* Title & Category Info */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-black dark:text-white line-clamp-1 group-hover:underline">
                          {displayTitle}
                        </h3>
                        <p className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 line-clamp-1 uppercase tracking-wider">
                          {project.categoryLabel} • {displaySub}
                        </p>
                      </div>


                  {/* Bottom Palette Dots */}
                  <div className="pt-3 mt-2 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {project.colorPalette.slice(0, 4).map((color, i) => (
                        <span
                          key={i}
                          className="w-2.5 h-2.5 rounded-full border border-gray-200 dark:border-neutral-700"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500">{project.year}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* VIEW MODE 2: DECK VIEW */}
        {viewMode === 'deck' && filteredProjects.length > 0 && (
          <div className="relative max-w-xl mx-auto py-12 flex flex-col items-center">
            
            <div className="relative w-72 sm:w-80 h-[460px] flex items-center justify-center">
              {filteredProjects.map((project, idx) => {
                const offset = (idx - currentDeckIndex + filteredProjects.length) % filteredProjects.length;
                if (offset > 4 && offset < filteredProjects.length - 1) return null;

                const isFront = offset === 0;
                const currentLikes = likesMap[project.id] ?? (project.likes || 12);

                return (
                  <motion.div
                    key={project.id}
                    onClick={() => {
                      if (isFront) {
                        playClickSound();
                        onSelectProject(project);
                      } else {
                        nextDeckCard();
                      }
                    }}
                    animate={{
                      scale: isFront ? 1 : 1 - offset * 0.05,
                      y: isFront ? 0 : offset * 12,
                      rotate: isFront ? 0 : offset * 3,
                      zIndex: filteredProjects.length - offset
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className={`absolute inset-0 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-black dark:border-white shadow-lg cursor-pointer flex flex-col justify-between ${
                      isFront ? 'hover:scale-105' : 'opacity-80'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          onIncrementLike(project.id);
                        }}
                        className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono text-gray-600 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700/80 rounded-full transition-all active:scale-95"
                      >
                        <FourPointStar className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                        <span>{formatLikes(currentLikes)}</span>
                      </button>

                      <span className="text-xs font-mono text-gray-400 dark:text-neutral-500">{project.index}</span>
                    </div>

                    {/* Image */}
                    <div className="aspect-4/3 overflow-hidden bg-gray-50 dark:bg-neutral-950 my-2 border border-gray-200 dark:border-neutral-800 rounded-lg">
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Info */}
                    <div className="text-center space-y-1">
                      <h3 className="text-base font-bold text-black dark:text-white leading-tight">
                        {project.title}
                      </h3>
                      <p className="text-[11px] font-mono text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                        {project.categoryLabel}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-xs font-mono text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                      <span>{project.year}</span>
                      <span className="font-bold text-black dark:text-white">VIEW ↗</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Deck Controls */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={prevDeckCard}
                className="p-3 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-xs font-mono font-bold text-gray-600 dark:text-neutral-400 uppercase tracking-widest">
                {currentDeckIndex + 1} / {filteredProjects.length} CARDS
              </span>

              <button
                onClick={nextDeckCard}
                className="p-3 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        )}
        </>
        )}

        {/* THANKS / 感谢观看 ENDING SECTION */}
        <div className="pt-12 pb-8 text-center space-y-2 border-t border-gray-100 dark:border-neutral-800">
          <h2 className="text-base sm:text-xl font-bold text-black dark:text-white font-sans tracking-tight">
            {language === 'zh' ? '感谢观看' : 'THANKS FOR WATCHING'}
          </h2>
          <p className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
            齐思设计 • QSi STUDIO © {new Date().getFullYear()}
          </p>
        </div>

      </div>

    </div>
  );
};
