import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Grid, Layers, ChevronRight, ChevronLeft, Edit3 } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<WorkCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'deck'>('grid');
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleCategoryChange = (catId: WorkCategory) => {
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

  // Dynamically extract all tags across all projects for live category/tag synchronization
  const dynamicTags = React.useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach((p) => {
      (p.tags || []).forEach((t) => {
        const tag = t.trim();
        if (tag) {
          map.set(tag, (map.get(tag) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  const categories: { id: string; labelEn: string; labelZh: string; count: number }[] = [
    { id: 'all', labelEn: 'ALL PROJECTS', labelZh: '全部作品', count: projects.length },
    { id: 'branding', labelEn: 'BRANDING', labelZh: '品牌 VI', count: projects.filter((p) => p.category === 'branding').length },
    { id: 'type', labelEn: 'TYPE & EDITORIAL', labelZh: '字体排版', count: projects.filter((p) => p.category === 'type').length },
    { id: 'packaging', labelEn: 'PACKAGING', labelZh: '包装工程', count: projects.filter((p) => p.category === 'packaging').length },
    { id: 'exhibition', labelEn: 'EXHIBITION', labelZh: '展陈艺术', count: projects.filter((p) => p.category === 'exhibition').length }
  ];

  const filteredProjects = (selectedCategory === 'all'
    ? projects
    : selectedCategory.startsWith('tag:')
    ? projects.filter((p) => p.tags?.includes(selectedCategory.replace('tag:', '')))
    : projects.filter((p) => p.category === selectedCategory)
  ).slice().sort((a, b) => {
    const likesA = likesMap[a.id] ?? (a.likes || 0);
    const likesB = likesMap[b.id] ?? (b.likes || 0);
    return likesB - likesA;
  });

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

        {/* CATEGORY FILTER PILLS (Language Adaptive Order with Drag & Scroll Snapping) */}
        <div className="relative w-full overflow-hidden space-y-2.5">
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
            className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 pt-1 scrollbar-none w-full max-w-full touch-pan-x snap-x snap-mandatory scroll-smooth px-0.5 cursor-grab active:cursor-grabbing select-none"
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const primaryText = language === 'zh' ? cat.labelZh : cat.labelEn;
              const secondaryText = language === 'zh' ? cat.labelEn : cat.labelZh;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id as any)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-sans rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 sm:gap-2 shrink-0 snap-start cursor-pointer ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white font-bold shadow-xs scale-[1.02]'
                      : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-300 border border-gray-200 dark:border-neutral-800 hover:text-black dark:hover:text-white'
                  }`}
                  id={`filter-tab-${cat.id}`}
                >
                  <span>{primaryText}</span>
                  <span className="text-[10px] opacity-60 font-mono hidden xs:inline">{secondaryText}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black' : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
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
