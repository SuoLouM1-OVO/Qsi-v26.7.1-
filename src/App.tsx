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
import { AboutManagerModal } from './components/AboutManagerModal';
import { GuestbookModal } from './components/GuestbookModal';
import { SyncManagerModal } from './components/SyncManagerModal';
import { CustomCursor } from './components/CustomCursor';
import { IntroLoader } from './components/IntroLoader';
import { PROJECTS as INITIAL_DEFAULT_PROJECTS, ABOUT_DATA as INITIAL_ABOUT_DATA } from './data/portfolioData';
import { TabType, Project, Language } from './types';
import { soundSynth } from './utils/sound';
import {
  fetchServerSyncData,
  pushServerSyncData,
  saveLocalSnapshot
} from './services/serverSyncService';
import {
  subscribeCloudProjects,
  syncProjectsToCloud,
  deleteCloudProject,
  subscribeCloudAboutData,
  syncAboutDataToCloud,
  subscribeCloudLikes,
  incrementCloudLike
} from './services/firebaseService';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('zh');
  const [isIntroReady, setIsIntroReady] = useState(false);

  // Guestbook modal state
  const [isGuestbookOpen, setIsGuestbookOpen] = useState(false);
  const [guestbookPreselectId, setGuestbookPreselectId] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Dynamic Portfolio Projects State (Loaded from localStorage or default dataset, then synced with Cloud Firestore)
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('qsi_custom_projects');
    const hasSavedFlag = localStorage.getItem('qsi_has_saved_projects') === 'true';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && (parsed.length > 0 || hasSavedFlag)) return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_DEFAULT_PROJECTS;
  });

  const [cloudLikes, setCloudLikes] = useState<Record<string, number>>({});

  // Dynamic About QSi Data State
  const [aboutData, setAboutData] = useState<typeof INITIAL_ABOUT_DATA>(() => {
    const saved = localStorage.getItem('qsi_custom_about_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_ABOUT_DATA;
  });

  const [isAboutManagerOpen, setIsAboutManagerOpen] = useState(false);
  const [isSyncManagerOpen, setIsSyncManagerOpen] = useState(false);

  // Initial Server API Sync Effect (For China & Local Server Direct Sync)
  useEffect(() => {
    fetchServerSyncData().then((serverData) => {
      if (serverData) {
        if (Array.isArray(serverData.projects) && serverData.projects.length > 0) {
          setProjects(serverData.projects);
          saveLocalSnapshot({ projects: serverData.projects });
          try { localStorage.setItem('qsi_has_saved_projects', 'true'); } catch (e) {}
        }
        if (serverData.aboutData) {
          setAboutData(serverData.aboutData);
          saveLocalSnapshot({ aboutData: serverData.aboutData });
        }
        if (serverData.likes) {
          setCloudLikes(serverData.likes);
        }
      }
    }).catch((err) => {
      console.warn('Initial server sync notice:', err);
    });
  }, []);

  // Real-time Cloud Sync Effect (Firebase Firestore)
  useEffect(() => {
    const unsubProjects = subscribeCloudProjects((cloudList) => {
      console.log('[App.tsx] Real-time Cloud Projects updated. Count:', cloudList?.length);
      if (Array.isArray(cloudList)) {
        setProjects(cloudList);
        saveLocalSnapshot({ projects: cloudList });
      }
    }, () => {
      // Seed default projects to cloud if empty
      console.log('[App.tsx] Seeding initial default projects to Cloud Firestore');
      syncProjectsToCloud(INITIAL_DEFAULT_PROJECTS);
    });

    const unsubAbout = subscribeCloudAboutData((cloudAbout) => {
      if (cloudAbout) {
        setAboutData(cloudAbout);
      }
    });

    const unsubLikes = subscribeCloudLikes((likesMap) => {
      setCloudLikes(likesMap);
    });

    return () => {
      if (typeof unsubProjects === 'function') unsubProjects();
      if (typeof unsubAbout === 'function') unsubAbout();
      if (typeof unsubLikes === 'function') unsubLikes();
    };
  }, []);

  const handleSaveAboutData = (updated: typeof INITIAL_ABOUT_DATA) => {
    setAboutData(updated);
    try {
      localStorage.setItem('qsi_custom_about_data', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
    pushServerSyncData({ aboutData: updated }).catch((e) => console.warn(e));
    syncAboutDataToCloud(updated).catch((e) => console.error('Cloud sync about data err:', e));
  };

  const handleResetAboutData = () => {
    setAboutData(INITIAL_ABOUT_DATA);
    try {
      localStorage.removeItem('qsi_custom_about_data');
    } catch (e) {
      // ignore
    }
    pushServerSyncData({ aboutData: INITIAL_ABOUT_DATA }).catch((e) => console.warn(e));
    syncAboutDataToCloud(INITIAL_ABOUT_DATA).catch((e) => console.error('Cloud reset about data err:', e));
  };

  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [managerEditProject, setManagerEditProject] = useState<Project | null>(null);

  const handleSaveProjects = (newProjects: Project[]) => {
    // Detect removed project IDs and purge from Cloud Firestore
    const newIds = new Set(newProjects.map((p) => p.id));
    const removedProjects = projects.filter((p) => !newIds.has(p.id));

    setProjects(newProjects);
    try {
      localStorage.setItem('qsi_custom_projects', JSON.stringify(newProjects));
      localStorage.setItem('qsi_has_saved_projects', 'true');
    } catch (e) {
      // ignore
    }

    saveLocalSnapshot({ projects: newProjects });
    pushServerSyncData({ projects: newProjects }).catch((e) => console.warn(e));

    // Delete removed items from Cloud Firestore so they don't reappear on real-time sync
    removedProjects.forEach((p) => {
      deleteCloudProject(p.id).catch((e) => console.error('Cloud delete project err:', e));
    });

    // Sync active projects to Cloud Firestore
    syncProjectsToCloud(newProjects).catch((e) => console.error('Cloud projects sync err:', e));
  };

  const handleResetProjects = () => {
    setProjects(INITIAL_DEFAULT_PROJECTS);
    try {
      localStorage.removeItem('qsi_custom_projects');
    } catch (e) {
      // ignore
    }
    pushServerSyncData({ projects: INITIAL_DEFAULT_PROJECTS }).catch((e) => console.warn(e));
    syncProjectsToCloud(INITIAL_DEFAULT_PROJECTS).catch((e) => console.error('Cloud reset err:', e));
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

  // Global Likes State Management (+1 increment only, merged with Cloud Likes)
  const [userLikeDeltas, setUserLikeDeltas] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('qsi_user_like_deltas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {};
  });

  // Calculate current effective likes map
  const likesMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => {
      const base = typeof p.likes === 'number' ? p.likes : 12;
      const cLikes = cloudLikes[p.id] || 0;
      const localDelta = userLikeDeltas[p.id] || 0;
      map[p.id] = base + cLikes + localDelta;
    });
    return map;
  }, [projects, cloudLikes, userLikeDeltas]);

  const handleIncrementLike = (projectId: string) => {
    setUserLikeDeltas((prev) => {
      const updated = {
        ...prev,
        [projectId]: (prev[projectId] || 0) + 1
      };
      try {
        localStorage.setItem('qsi_user_like_deltas', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });

    // Also sync to Cloud Firestore
    incrementCloudLike(projectId).catch((err) => console.error('Cloud like error:', err));
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
        onOpenGuestbook={() => {
          playClickSound();
          setGuestbookPreselectId('');
          setIsGuestbookOpen(true);
        }}
        onOpenSyncManager={() => {
          playClickSound();
          setIsSyncManagerOpen(true);
        }}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
      />

      {/* CONTINUOUS SCROLLABLE MAIN CONTENT */}
      <main className="flex-1 w-full">
        {/* HOME SECTION */}
        <section id="home" className="relative z-20 scroll-mt-20">
          <HomeTab
            projects={projects}
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
          <AboutTab
            playClickSound={playClickSound}
            language={language}
            aboutData={aboutData}
            onOpenAboutManager={() => setIsAboutManagerOpen(true)}
            onOpenGuestbook={() => setIsGuestbookOpen(true)}
            isEditMode={isEditMode}
          />
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
            isEditMode={isEditMode}
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
        onEditProject={(updatedProj) => {
          const updated = projects.map((p) => (p.id === updatedProj.id ? updatedProj : p));
          handleSaveProjects(updated);
          setSelectedProject(updatedProj);
        }}
        onDeleteProject={(projectId) => {
          const updated = projects.filter((p) => p.id !== projectId);
          handleSaveProjects(updated);
          setSelectedProject(null);
        }}
        onOpenComment={(projectId) => {
          setGuestbookPreselectId(projectId);
          setIsGuestbookOpen(true);
        }}
        onSaveProjects={handleSaveProjects}
        allProjects={projects}
        isEditMode={isEditMode}
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
        onSelectProject={(proj) => {
          setSelectedProject(proj);
        }}
      />

      {/* ONLINE GUESTBOOK & SUGGESTIONS MODAL */}
      <GuestbookModal
        isOpen={isGuestbookOpen}
        onClose={() => {
          setIsGuestbookOpen(false);
          setGuestbookPreselectId('');
        }}
        playClickSound={playClickSound}
        language={language}
        projects={projects}
        preselectedProjectId={guestbookPreselectId}
      />

      {/* ABOUT DATA MANAGER MODAL */}
      <AboutManagerModal
        isOpen={isAboutManagerOpen}
        onClose={() => setIsAboutManagerOpen(false)}
        aboutData={aboutData}
        onSaveAboutData={handleSaveAboutData}
        onResetAboutData={handleResetAboutData}
        playClickSound={playClickSound}
        language={language}
      />

      {/* DATA SYNC & CHINA ACCELERATION MODAL */}
      <SyncManagerModal
        isOpen={isSyncManagerOpen}
        onClose={() => setIsSyncManagerOpen(false)}
        language={language}
        onDataReload={(reloadedData) => {
          if (reloadedData.projects && reloadedData.projects.length > 0) {
            setProjects(reloadedData.projects);
          }
          if (reloadedData.aboutData) {
            setAboutData(reloadedData.aboutData);
          }
          if (reloadedData.likes) {
            setCloudLikes(reloadedData.likes);
          }
        }}
        onResetDefaults={() => {
          handleResetProjects();
          handleResetAboutData();
        }}
      />

      {/* INITIALIZATION INTRO LOADER */}
      <IntroLoader onStartExit={() => setIsIntroReady(true)} />

    </div>
  );
}
