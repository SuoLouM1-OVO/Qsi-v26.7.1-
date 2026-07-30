import React, { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, Home, FolderKanban, User, Check, Moon } from 'lucide-react';
import { TabType, Language } from '../types';
import { FourPointStar } from './FourPointStar';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenSearch: () => void;
  projectCount: number;
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  projectCount,
  language,
  setLanguage,
  darkMode,
  setDarkMode
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position to adjust header background dynamically
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: TabType; labelZh: string; labelEn: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', labelZh: '首页', labelEn: 'HOME', icon: Home },
    { id: 'works', labelZh: '作品集', labelEn: 'PORTFOLIO', icon: FolderKanban },
    { id: 'about', labelZh: '关于我', labelEn: 'ABOUT', icon: User }
  ];

  const handleNavigate = (tab: TabType) => {
    setActiveTab(tab);
    setDropdownOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out animate-in slide-in-from-top-full duration-700 ${
        isScrolled
          ? 'bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md border-b border-gray-200/60 dark:border-neutral-800/60 shadow-xs py-2 sm:py-2.5 pointer-events-auto'
          : 'bg-transparent border-transparent py-3 sm:py-4 pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        
        {/* Left Side: Logo Icon + Brand Title in a floating pill */}
        <div className={`flex items-center gap-2.5 pointer-events-auto transition-all ${
          !isScrolled ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/80 dark:border-neutral-800/80 shadow-xs' : ''
        }`}>
          <button
            onClick={() => setActiveTab('home')}
            className="p-1.5 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors rounded-full flex items-center justify-center border border-gray-200 dark:border-neutral-700 hover:border-black dark:hover:border-white"
            title="回到首页 / Home"
            id="header-home-btn"
          >
            <span className="text-xl font-light font-sans tracking-tight text-neutral-800 dark:text-neutral-100 animate-[pulse_4s_infinite_ease-in-out]">QSi</span>
          </button>

          <button
            onClick={() => setActiveTab('works')}
            className="group flex items-center gap-2 text-left focus:outline-none"
            id="header-brand-title-btn"
          >
            <span className="text-sm sm:text-base font-bold tracking-tight text-black dark:text-white font-sans">
              齐思设计作品集
            </span>
            <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 font-light tracking-widest hidden sm:inline uppercase">
              • QSi PORTFOLIO
            </span>
          </button>
        </div>

        {/* Right Side: Quick Search & Menu Trigger in floating pills */}
        <div className="relative flex items-center gap-2 pointer-events-auto" ref={dropdownRef}>
          
          {/* Quick Search Icon Button */}
          <button
            onClick={onOpenSearch}
            className={`p-2 text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors rounded-full border border-gray-200 dark:border-neutral-700 hover:border-gray-400 ${
              !isScrolled ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-xs' : ''
            }`}
            title={language === 'zh' ? '搜索作品' : 'Search Works'}
            id="header-search-icon-btn"
          >
            <Search className="w-4 h-4 stroke-[1.5]" />
          </button>

          {/* Collapsed Menu Icon Button */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`p-2 text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors rounded-full border border-gray-200 dark:border-neutral-700 hover:border-gray-400 ${
              !isScrolled ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-xs' : ''
            }`}
            title="菜单 / Menu"
            id="header-dropdown-toggle-btn"
          >
            {dropdownOpen ? (
              <X className="w-4 h-4 stroke-[1.5]" />
            ) : (
              <Menu className="w-4 h-4 stroke-[1.5]" />
            )}
          </button>

          {/* TOP RIGHT DROPDOWN MENU */}
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-2xl rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Navigation Items */}
              <div className="px-1 space-y-0.5">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-lg transition-colors ${
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
              </div>

              <div className="my-2 border-t border-gray-100 dark:border-neutral-800" />

              {/* Night Mode Switcher Row */}
              <div className="px-2">
                <button
                  onClick={() => {
                    setDarkMode(!darkMode);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
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
              <div className="px-3 py-1">
                <div className="grid grid-cols-2 gap-1 bg-gray-50 dark:bg-neutral-950 p-1 border border-gray-200 dark:border-neutral-800 rounded-lg">
                  <button
                    onClick={() => {
                      setLanguage('zh');
                    }}
                    className={`flex items-center justify-center gap-1 py-1 text-[11px] font-mono rounded-md transition-all ${
                      language === 'zh' ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <span>CN</span>
                    {language === 'zh' && <Check className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en');
                    }}
                    className={`flex items-center justify-center gap-1 py-1 text-[11px] font-mono rounded-md transition-all ${
                      language === 'en' ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : 'text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <span>EN</span>
                    {language === 'en' && <Check className="w-3 h-3" />}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </header>
  );
};

