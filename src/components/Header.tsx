import React, { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, Home, FolderKanban, User, Check, Moon, ChevronRight, ChevronLeft, History, Tag, Trash2, ArrowRight, Sparkles, MessageSquare, Settings, Lock, Unlock, ShieldCheck, KeyRound, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TabType, Language, Project } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isSearchOpen?: boolean;
  onOpenSearch: () => void;
  projectCount: number;
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  projects?: Project[];
  onSelectProject?: (project: Project) => void;
  onOpenGuestbook?: () => void;
  onOpenSyncManager?: () => void;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
}

const HOT_TAGS = ['品牌视觉', '展陈空间', '包装设计', '书籍装帧', '2026', '照片特展'];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isSearchOpen = false,
  onOpenSearch,
  projectCount,
  language,
  setLanguage,
  darkMode,
  setDarkMode,
  projects = [],
  onSelectProject,
  onOpenGuestbook,
  onOpenSyncManager,
  isEditMode,
  setIsEditMode
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [manualTitleExpanded, setManualTitleExpanded] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('qsi_search_history');
      return saved ? JSON.parse(saved) : ['品牌', '展陈', '2026', '包装'];
    } catch {
      return ['品牌', '展陈', '2026'];
    }
  });

  // Track scroll position to adjust header background dynamically
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        setManualTitleExpanded(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (dropdownOpen) setDropdownOpen(false);
        if (isSearchOpen) onOpenSearch();
        if (isSettingsOpen) setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen, isSearchOpen, isSettingsOpen, onOpenSearch]);

  const saveSearchTerm = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const updated = [clean, ...searchHistory.filter((item) => item !== clean)].slice(0, 6);
    setSearchHistory(updated);
    try {
      localStorage.setItem('qsi_search_history', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('qsi_search_history');
    } catch (e) {
      console.error(e);
    }
  };

  const searchResults = searchQuery.trim() === ''
    ? []
    : projects.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const navItems: { id: TabType; labelZh: string; labelEn: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', labelZh: '首页', labelEn: 'HOME', icon: Home },
    { id: 'works', labelZh: '作品集', labelEn: 'PORTFOLIO', icon: FolderKanban },
    { id: 'about', labelZh: '关于我', labelEn: 'ABOUT', icon: User }
  ];

  const handleNavigate = (tab: TabType) => {
    setActiveTab(tab);
    setDropdownOpen(false);
  };

  const showFullTitle = !isScrolled || manualTitleExpanded;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md border-b border-gray-200/60 dark:border-neutral-800/60 shadow-2xs py-1.5 sm:py-2 pointer-events-auto'
          : 'bg-transparent border-transparent py-2.5 sm:py-3 pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        
        {/* Left Side: Home Button + Brand Title Pill (Collapses on Scroll, can be manually expanded) */}
        <div className="flex items-center pointer-events-auto relative">
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="h-8 sm:h-8.5 px-2.5 flex items-center gap-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-full border border-gray-200 dark:border-neutral-800 shadow-2xs hover:border-gray-400 dark:hover:border-neutral-600 transition-colors overflow-hidden"
          >
            <button
              onClick={() => setActiveTab('home')}
              className="p-1 text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="回到首页 / Home"
              id="header-home-btn"
            >
              <Home className="w-3.5 h-3.5 text-black dark:text-white stroke-[1.75]" />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              {showFullTitle ? (
                <motion.div
                  key="full-title"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="overflow-hidden flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="w-px h-3 bg-gray-200 dark:bg-neutral-700 shrink-0 inline-block" />

                  <button
                    onClick={() => setActiveTab('works')}
                    className="group flex items-center gap-1.5 text-left focus:outline-none shrink-0 cursor-pointer"
                    id="header-brand-title-btn"
                  >
                    <span className="text-xs font-bold tracking-tight text-black dark:text-white font-sans">
                      齐思设计作品集
                    </span>
                    <span className="text-[9px] font-mono text-gray-400 dark:text-neutral-500 font-light tracking-widest hidden sm:inline uppercase">
                      • QSi PORTFOLIO
                    </span>
                  </button>

                  {isScrolled && (
                    <button
                      onClick={() => setManualTitleExpanded(false)}
                      className="p-0.5 ml-0.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full text-gray-400 dark:text-neutral-500 transition-colors shrink-0 cursor-pointer"
                      title="折叠名称"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  )}
                </motion.div>
              ) : (
                <button
                  key="expand-btn"
                  onClick={() => setManualTitleExpanded(true)}
                  className="flex items-center gap-1 pl-1 text-[11px] font-mono text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  title="点击展开作品集名称"
                  id="header-expand-brand-btn"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right Side: Quick Search & Menu Controls */}
        <div className="relative flex items-center gap-2 pointer-events-auto" ref={dropdownRef}>
          
          {/* Data Sync & Acceleration Quick Button */}
          {onOpenSyncManager && (
            <button
              type="button"
              onClick={() => {
                if (dropdownOpen) setDropdownOpen(false);
                if (isSearchOpen) onOpenSearch();
                onOpenSyncManager();
              }}
              className="h-8 w-8 sm:h-8.5 sm:w-8.5 flex items-center justify-center backdrop-blur-md rounded-full border border-gray-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 text-black dark:text-white hover:border-gray-400 dark:hover:border-neutral-600 shadow-2xs transition-all active:scale-95 shrink-0 cursor-pointer"
              title={language === 'zh' ? '数据同步与国内网络加速' : 'Data Sync & Network Acceleration'}
              id="header-sync-pill-btn"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 stroke-[2]" />
            </button>
          )}

          {/* Guestbook Quick Button (Icon-Only) */}
          {onOpenGuestbook && (
            <button
              type="button"
              onClick={() => {
                if (dropdownOpen) setDropdownOpen(false);
                if (isSearchOpen) onOpenSearch();
                onOpenGuestbook();
              }}
              className="h-8 w-8 sm:h-8.5 sm:w-8.5 flex items-center justify-center backdrop-blur-md rounded-full border border-gray-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 text-black dark:text-white hover:border-gray-400 dark:hover:border-neutral-600 shadow-2xs transition-all active:scale-95 shrink-0 cursor-pointer"
              title={language === 'zh' ? '打开云端在线留言板' : 'View or submit live comments'}
              id="header-guestbook-pill-btn"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500 stroke-[1.75]" />
            </button>
          )}

          {/* Permanent Search Button (Static Position, Never Moves) */}
          <button
            type="button"
            onClick={() => {
              if (dropdownOpen) setDropdownOpen(false);
              onOpenSearch();
            }}
            className={`h-8 w-8 sm:h-8.5 sm:w-8.5 flex items-center justify-center backdrop-blur-md rounded-full border shadow-2xs transition-all active:scale-95 shrink-0 cursor-pointer ${
              isSearchOpen
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white ring-2 ring-black/10 dark:ring-white/20'
                : 'text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-white/90 dark:bg-neutral-900/90 border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-600'
            }`}
            title={isSearchOpen ? (language === 'zh' ? '折叠搜索' : 'Fold Search') : (language === 'zh' ? '展开搜索' : 'Expand Search')}
            id="header-search-icon-btn"
          >
            {isSearchOpen ? (
              <X className="w-3.5 h-3.5 stroke-[2]" />
            ) : (
              <Search className="w-3.5 h-3.5 stroke-[1.75]" />
            )}
          </button>

          {/* Permanent Menu Button (Static Position, Never Moves) */}
          <button
            type="button"
            onClick={() => {
              if (isSearchOpen) onOpenSearch();
              if (isSettingsOpen) setIsSettingsOpen(false);
              setDropdownOpen(!dropdownOpen);
            }}
            className={`h-8 w-8 sm:h-8.5 sm:w-8.5 flex items-center justify-center backdrop-blur-md rounded-full border shadow-2xs transition-all active:scale-95 shrink-0 cursor-pointer ${
              dropdownOpen
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white ring-2 ring-black/10 dark:ring-white/20'
                : 'text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-white/90 dark:bg-neutral-900/90 border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-600'
            }`}
            title={dropdownOpen ? (language === 'zh' ? '折叠菜单' : 'Fold Menu') : (language === 'zh' ? '展开菜单' : 'Expand Menu')}
            id="header-dropdown-toggle-btn"
          >
            {dropdownOpen ? (
              <X className="w-3.5 h-3.5 stroke-[2]" />
            ) : (
              <Menu className="w-3.5 h-3.5 stroke-[1.75]" />
            )}
          </button>

          {/* EXPANDED UNIFIED SEARCH LAYER (Centered on screen without overflowing viewport) */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ type: 'spring', stiffness: 450, damping: 30, mass: 0.8 }}
                style={{ transformOrigin: 'top center' }}
                className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-24px)] max-w-[440px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-gray-200 dark:border-neutral-800 shadow-2xl rounded-2xl p-3.5 overflow-hidden"
              >
                {/* Search Input Bar */}
                <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100 dark:border-neutral-800">
                  <div className="h-7 w-7 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white shrink-0">
                    <Search className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        saveSearchTerm(searchQuery);
                      }
                    }}
                    placeholder={language === 'zh' ? '搜索作品名称、标签、分类...' : 'Search portfolio...'}
                    className="flex-1 bg-transparent text-xs font-sans text-black dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none tracking-wide"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-gray-400 hover:text-black dark:hover:text-white text-xs transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                      title="清空文字"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Downward Area: Hot Tags (1 Row), Search History (1 Row), and Results */}
                <div className="pt-3 space-y-3 max-h-[60vh] overflow-y-auto">
                  {/* Section 1: Hot Popular Tags (1 Row) */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-widest pl-0.5">
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{language === 'zh' ? '热门推荐' : 'RECOMMENDED'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                      {HOT_TAGS.map((tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => {
                            setSearchQuery(tag);
                            saveSearchTerm(tag);
                          }}
                          className="px-2.5 py-1 text-[11px] font-mono whitespace-nowrap shrink-0 bg-gray-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-gray-700 dark:text-neutral-300 rounded-lg transition-all flex items-center gap-1 active:scale-95"
                        >
                          <Tag className="w-3 h-3 opacity-60 shrink-0" />
                          <span>{tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Local Search History (1 Row) */}
                  <div className="space-y-1 pt-1 border-t border-gray-100 dark:border-neutral-800/60">
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-widest pl-0.5">
                      <div className="flex items-center gap-1.5">
                        <History className="w-3 h-3 shrink-0" />
                        <span>{language === 'zh' ? '搜索记录' : 'RECENT SEARCHES'}</span>
                      </div>
                      {searchHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={clearSearchHistory}
                          className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-[10px] shrink-0"
                          title="清空搜索记录"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{language === 'zh' ? '清空' : 'Clear'}</span>
                        </button>
                      )}
                    </div>

                    {searchHistory.length === 0 ? (
                      <p className="text-[11px] font-mono text-gray-400 dark:text-neutral-600 italic px-1 py-0.5">
                        {language === 'zh' ? '暂无搜索记录' : 'No search history'}
                      </p>
                    ) : (
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                        {searchHistory.map((term) => (
                          <button
                            type="button"
                            key={term}
                            onClick={() => {
                              setSearchQuery(term);
                              saveSearchTerm(term);
                            }}
                            className="px-2.5 py-1 text-[11px] font-mono whitespace-nowrap shrink-0 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white rounded-lg transition-all active:scale-95"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 3: Live Matching Search Results */}
                  {searchQuery.trim() !== '' && (
                    <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 space-y-2">
                      <div className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-widest pl-0.5">
                        {language === 'zh' ? `匹配作品 (${searchResults.length})` : `MATCHES (${searchResults.length})`}
                      </div>

                      {searchResults.length === 0 ? (
                        <div className="py-6 text-center text-xs font-mono text-gray-400 dark:text-neutral-500">
                          {language === 'zh' ? `未找到与 "${searchQuery}" 相关的作品` : `No projects found for "${searchQuery}"`}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {searchResults.map((project) => (
                            <button
                              type="button"
                              key={project.id}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                saveSearchTerm(searchQuery);
                                if (onSelectProject) {
                                  onSelectProject(project);
                                }
                                onOpenSearch();
                              }}
                              className="w-full text-left flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl cursor-pointer transition-colors group"
                            >
                              <img
                                src={project.coverImage}
                                alt={project.title}
                                className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-neutral-800 shrink-0 group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-black dark:text-white truncate font-sans">{project.title}</p>
                                <p className="text-[10px] font-mono text-gray-500 dark:text-neutral-400 truncate uppercase mt-0.5">
                                  {project.categoryLabel} • {project.year}
                                </p>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* EXPANDED MENU POPUP (Attached directly under controls, zero button displacement) */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 6 }}
                transition={{ type: 'spring', stiffness: 450, damping: 30, mass: 0.8 }}
                style={{ transformOrigin: 'top right' }}
                className="absolute top-full right-0 mt-2 z-50 w-[calc(100vw-24px)] max-w-[280px] sm:w-72 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-gray-200 dark:border-neutral-800 shadow-2xl rounded-2xl p-3.5 overflow-hidden"
              >
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-gray-100 dark:border-neutral-800">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-black dark:text-white shrink-0 ml-0.5" />
                    <span className="text-[11px] font-mono font-bold text-black dark:text-white uppercase tracking-wider truncate">
                      {language === 'zh' ? '齐思工作室菜单' : 'QSI STUDIO MENU'}
                    </span>
                  </div>

                  {/* Settings / Mode Button inside Menu Window Header */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSettingsOpen(!isSettingsOpen);
                    }}
                    className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 text-[10px] font-mono cursor-pointer shrink-0 ${
                      isSettingsOpen || isEditMode
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold border border-amber-300/60 dark:border-amber-700/60'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white'
                    }`}
                    title={isEditMode ? '编辑模式 (点击设置)' : '切换模式 (访客/编辑)'}
                    id="menu-header-settings-btn"
                  >
                    {isEditMode ? (
                      <>
                        <Unlock className="w-3 h-3 text-amber-600 dark:text-amber-400 stroke-[2]" />
                        <span>{language === 'zh' ? '编辑模式' : 'EDIT'}</span>
                      </>
                    ) : (
                      <>
                        <Settings className="w-3 h-3 stroke-[1.75]" />
                        <span>{language === 'zh' ? '访客模式' : 'GUEST'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Inline Mode Switch / Password Panel inside the Menu Popup */}
                <AnimatePresence>
                  {isSettingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mb-2.5"
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl space-y-2"
                      >
                        {isEditMode ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-gray-500 dark:text-neutral-400">
                                {language === 'zh' ? '模式状态:' : 'Status:'}
                              </span>
                              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <Unlock className="w-3 h-3" />
                                {language === 'zh' ? '已解锁编辑权限' : 'Unlocked'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditMode(false);
                                setIsSettingsOpen(false);
                              }}
                              className="w-full py-1.5 px-2 text-xs font-mono font-bold bg-gray-200 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 hover:bg-red-500 hover:text-white rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Lock className="w-3 h-3" />
                              <span>{language === 'zh' ? '退出编辑模式' : 'Exit Edit Mode'}</span>
                            </button>
                          </div>
                        ) : (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (passInput.trim() === '269172') {
                                setIsEditMode(true);
                                setPassError(false);
                                setPassInput('');
                                setIsSettingsOpen(false);
                              } else {
                                setPassError(true);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="space-y-2"
                          >
                            <div className="space-y-1">
                              <input
                                type="password"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                                value={passInput}
                                onChange={(e) => {
                                  setPassInput(e.target.value);
                                  if (passError) setPassError(false);
                                }}
                                placeholder={language === 'zh' ? '密码' : 'Password'}
                                className={`w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-neutral-900 border rounded-lg focus:outline-none transition-colors ${
                                  passError
                                    ? 'border-red-500 text-red-600 dark:text-red-400 ring-1 ring-red-500'
                                    : 'border-gray-200 dark:border-neutral-700 focus:border-black dark:focus:border-white text-black dark:text-white'
                                }`}
                              />

                              {passError && (
                                <p className="text-[10px] font-mono text-red-500 py-0.5">
                                  {language === 'zh' ? '密码错误' : 'Incorrect Password'}
                                </p>
                              )}
                            </div>

                            <button
                              type="submit"
                              onClick={(e) => e.stopPropagation()}
                              className="w-full py-1.5 px-2 text-xs font-mono font-bold bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>{language === 'zh' ? '确认切换编辑模式' : 'Unlock Edit Mode'}</span>
                            </button>
                          </form>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Menu Navigation Items */}
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const IconComp = item.icon;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-xl transition-colors ${
                          isActive
                            ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                            : 'text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComp className={`w-3.5 h-3.5 stroke-[1.5] ${isActive ? 'text-white dark:text-black' : 'text-gray-500 dark:text-neutral-400'}`} />
                          <span>{language === 'zh' ? item.labelZh : item.labelEn}</span>
                        </div>
                        <span className={`text-[10px] font-mono ${isActive ? 'text-gray-300 dark:text-neutral-600' : 'text-gray-400 dark:text-neutral-500'}`}>
                          {item.labelEn}
                        </span>
                      </button>
                    );
                  })}

                  {onOpenGuestbook && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenGuestbook();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-xl text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500 stroke-[1.5]" />
                        <span className="font-medium text-black dark:text-white">{language === 'zh' ? '在线留言/修改建议' : 'Live Guestbook & Feedback'}</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded">
                        ONLINE
                      </span>
                    </button>
                  )}

                  {onOpenSyncManager && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenSyncManager();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-xl text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 stroke-[1.5]" />
                        <span className="font-medium text-black dark:text-white">{language === 'zh' ? '数据同步/国内加速' : 'Data Sync & China Speed'}</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded">
                        SPEED
                      </span>
                    </button>
                  )}
                </div>

                <div className="my-2.5 border-t border-gray-100 dark:border-neutral-800" />

                {/* Night Mode Switcher Row */}
                <div className="px-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDarkMode(!darkMode);
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-xl text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Moon className="w-3.5 h-3.5 text-gray-500 dark:text-neutral-400 stroke-[1.5]" />
                      <span>{darkMode ? (language === 'zh' ? '浅色模式' : 'Light Mode') : (language === 'zh' ? '深色模式' : 'Dark Mode')}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 uppercase">
                      {darkMode ? 'LIGHT' : 'DARK'}
                    </span>
                  </button>
                </div>

                <div className="my-2 border-t border-gray-100 dark:border-neutral-800" />

                {/* Language Switcher in Dropdown (Simplified CN / EN) */}
                <div className="px-0.5 py-0.5">
                  <div className="grid grid-cols-2 gap-1 bg-gray-50 dark:bg-neutral-950 p-1 border border-gray-200 dark:border-neutral-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('zh');
                      }}
                      className={`flex items-center justify-center gap-1 py-1 text-[11px] font-mono rounded-lg transition-all ${
                        language === 'zh' ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <span>CN</span>
                      {language === 'zh' && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('en');
                      }}
                      className={`flex items-center justify-center gap-1 py-1 text-[11px] font-mono rounded-lg transition-all ${
                        language === 'en' ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <span>EN</span>
                      {language === 'en' && <Check className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </header>
  );
};
