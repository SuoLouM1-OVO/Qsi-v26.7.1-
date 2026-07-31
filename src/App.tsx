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
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { CustomCursor } from './components/CustomCursor';
import { IntroLoader } from './components/IntroLoader';
import { PROJECTS as INITIAL_DEFAULT_PROJECTS } from './data/portfolioData';
import { TabType, Project, Language } from './types';
import { soundSynth } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('zh');
  const [isIntroReady, setIsIntroReady] = useState(false);

  // Dynamic Portfolio Projects State (Loaded from localStorage or default dataset)
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('qsi_custom_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback to initial default projects
      }
    }
    return INITIAL_DEFAULT_PROJECTS;
  });

  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [managerEditProject, setManagerEditProject] = useState<Project | null>(null);

  const handleSaveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    try {
      localStorage.setItem('qsi_custom_projects', JSON.stringify(newProjects));
    } catch (e) {
      // ignore quota or storage error
    }
  };

  const handleResetProjects = () => {
    setProjects(INITIAL_DEFAULT_PROJECTS);
    try {
      localStorage.removeItem('qsi_custom_projects');
    } catch (e) {
      // ignore
    }
  };

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
  const [userLikeDeltas, setUserLikeDeltas] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('qsi_user_like_deltas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore parse error
      }
    }
    return {};
  });

  // Calculate current effective likes map
  const likesMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => {
      const base = typeof p.likes === 'number' ? p.likes : 12;
      const delta = userLikeDeltas[p.id] || 0;
      map[p.id] = base + delta;
    });
    return map;
  }, [projects, userLikeDeltas]);

  const handleIncrementLike = (projectId: string) => {
    setUserLikeDeltas((prev) => {
      const updated = {
        ...prev,
        [projectId]: (prev[projectId] || 0) + 1
      };
      try {
        localStorage.setItem('qsi_user_like_deltas', JSON.stringify(updated));
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
    const currentIdx = projects.findIndex((p) => p.id === selectedProject.id);
    const nextIdx = (currentIdx + 1) % projects.length;
    setSelectedProject(projects[nextIdx]);
  };

  const handlePrevProject = () => {
    if (!selectedProject) return;
    const currentIdx = projects.findIndex((p) => p.id === selectedProject.id);
    const prevIdx = (currentIdx - 1 + projects.length) % projects.length;
    setSelectedProject(projects[prevIdx]);
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
        isSearchOpen={searchOpen}
        onOpenSearch={() => {
          playClickSound();
          setSearchOpen(!searchOpen);
        }}
        projectCount={projects.length}
        language={language}
        setLanguage={setLanguage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        projects={projects}
        onSelectProject={(project) => {
          setSelectedProject(project);
          playClickSound();
        }}
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
            projects={projects}
            onSelectProject={(project) => {
              playClickSound();
              setSelectedProject(project);
            }}
            playClickSound={playClickSound}
            likesMap={likesMap}
            onIncrementLike={handleIncrementLike}
            language={language}
            onOpenProjectManager={() => {
              setManagerEditProject(null);
              setIsProjectManagerOpen(true);
            }}
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
        language={language}
        onEditProject={(proj) => {
          setSelectedProject(null);
          setManagerEditProject(proj);
          setIsProjectManagerOpen(true);
        }}
        onDeleteProject={(projectId) => {
          const updated = projects.filter((p) => p.id !== projectId);
          handleSaveProjects(updated);
          setSelectedProject(null);
        }}
      />

      {/* PROJECT MANAGER & REPLACE MODAL */}
      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => {
          setIsProjectManagerOpen(false);
          setManagerEditProject(null);
        }}
        projects={projects}
        onSaveProjects={handleSaveProjects}
        onResetProjects={handleResetProjects}
        playClickSound={playClickSound}
        language={language}
        initialEditProject={managerEditProject}
      />

      {/* INITIALIZATION INTRO LOADER */}
      <IntroLoader onStartExit={() => setIsIntroReady(true)} />

    </div>
  );
}
