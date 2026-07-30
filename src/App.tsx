/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FooterBar } from './components/FooterBar';
import { HomeTab } from './components/HomeTab';
import { AboutTab } from './components/AboutTab';
import { WorksTab } from './components/WorksTab';
import { ProjectModal } from './components/ProjectModal';
import { SearchModal } from './components/SearchModal';
import { CustomCursor } from './components/CustomCursor';
import { IntroLoader } from './components/IntroLoader';
import { PROJECTS } from './data/portfolioData';
import { TabType, Project, Language } from './types';
import { soundSynth } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('zh');
  const [isIntroReady, setIsIntroReady] = useState(false);

  // Dark Mode / Night Reading Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('qsi_theme') === 'dark';
  });

  // Top Slim Scroll Reading Progress Bar State
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('qsi_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('qsi_theme', 'light');
    }
  }, [darkMode]);

  // Global Likes State Management (+1 increment only, capped at 999+)
  const [likesMap, setLikesMap] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('qsi_likes_map');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore parse error
      }
    }
    const initialMap: Record<string, number> = {};
    PROJECTS.forEach((p) => {
      initialMap[p.id] = p.likes || 12;
    });
    return initialMap;
  });

  const handleIncrementLike = (projectId: string) => {
    setLikesMap((prevLikes) => {
      const currentCount = prevLikes[projectId] ?? 12;
      const updated = {
        ...prevLikes,
        [projectId]: currentCount + 1
      };
      try {
        localStorage.setItem('qsi_likes_map', JSON.stringify(updated));
      } catch (e) {
        // ignore storage error
      }
      return updated;
    });
  };

  const playClickSound = () => {
    soundSynth.playClick();
  };

  // Scroll to section when tab clicked
  const handleTabClick = (tab: TabType) => {
    playClickSound();
    setActiveTab(tab);
    const element = document.getElementById(tab);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // IntersectionObserver to auto-update active tab as user scrolls
  useEffect(() => {
    const sectionIds: TabType[] = ['home', 'about', 'works'];
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id as TabType);
        }
      });
    };

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '-25% 0px -45% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Handle next / prev project in modal
  const handleNextProject = () => {
    if (!selectedProject) return;
    const currentIdx = PROJECTS.findIndex((p) => p.id === selectedProject.id);
    const nextIdx = (currentIdx + 1) % PROJECTS.length;
    setSelectedProject(PROJECTS[nextIdx]);
  };

  const handlePrevProject = () => {
    if (!selectedProject) return;
    const currentIdx = PROJECTS.findIndex((p) => p.id === selectedProject.id);
    const prevIdx = (currentIdx - 1 + PROJECTS.length) % PROJECTS.length;
    setSelectedProject(PROJECTS[prevIdx]);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-black dark:text-white font-sans antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black flex flex-col transition-colors duration-300">
      <CustomCursor />
      
      {/* SUBTLE SLIM TOP READING PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-black dark:bg-white transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* HEADER NAVIGATION */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabClick}
        onOpenSearch={() => {
          playClickSound();
          setSearchOpen(true);
        }}
        projectCount={PROJECTS.length}
        language={language}
        setLanguage={setLanguage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* CONTINUOUS SCROLLABLE MAIN CONTENT */}
      <main className="flex-1 w-full">
        {/* HOME SECTION */}
        <section id="home" className="relative z-20 scroll-mt-20">
          <HomeTab
            onSelectProject={(project) => {
              playClickSound();
              setSelectedProject(project);
            }}
            onGoToAbout={() => handleTabClick('about')}
            playClickSound={playClickSound}
            language={language}
            isIntroReady={isIntroReady}
            likesMap={likesMap}
          />
        </section>

        {/* ABOUT SECTION (Placed underneath homepage cards layer z-10) */}
        <section id="about" className="relative z-10 scroll-mt-20">
          <AboutTab playClickSound={playClickSound} language={language} />
        </section>

        {/* WORKS SECTION */}
        <section id="works" className="relative z-10 scroll-mt-20">
          <WorksTab
            projects={PROJECTS}
            onSelectProject={(project) => {
              playClickSound();
              setSelectedProject(project);
            }}
            playClickSound={playClickSound}
            likesMap={likesMap}
            onIncrementLike={handleIncrementLike}
            language={language}
          />
        </section>
      </main>

      {/* FOOTER BAR WITH HIGH Z-INDEX BOTTOM-LEFT CONNECTED POPUP */}
      <FooterBar
        activeTab={activeTab}
        setActiveTab={handleTabClick}
        language={language}
      />

      {/* PROJECT CASE STUDY DETAIL MODAL */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onNext={handleNextProject}
        onPrev={handlePrevProject}
        playClickSound={playClickSound}
        likesMap={likesMap}
        onIncrementLike={handleIncrementLike}
      />

      {/* GLOBAL SEARCH OVERLAY */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        projects={PROJECTS}
        onSelectProject={(project) => {
          playClickSound();
          setSelectedProject(project);
        }}
        playClickSound={playClickSound}
      />

      {/* INITIALIZATION INTRO LOADER */}
      <IntroLoader onStartExit={() => setIsIntroReady(true)} />

    </div>
  );
}
