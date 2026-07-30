import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, MessageSquare, QrCode, X, ArrowUpRight, Sparkles, ExternalLink } from 'lucide-react';
import { ABOUT_DATA } from '../data/portfolioData';
import { TabType, Language } from '../types';

interface FooterBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  language: Language;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  activeTab,
  setActiveTab,
  language
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  return (
    <>
      {/* HIGH Z-INDEX (z-[100]) COVERING ALL PAGES AT BOTTOM LEFT */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[100] font-sans" ref={popupRef}>
        
        {/* BOTTOM-LEFT ANIMATED EXTENSION POPUP WITH CONTINUITY FROM BUTTON */}
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: -10, y: 15 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: -10, y: 15 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              style={{ transformOrigin: 'bottom left' }}
              className="absolute bottom-14 left-0 w-[88vw] max-w-[340px] bg-white dark:bg-neutral-900 border border-gray-900 dark:border-neutral-700 shadow-2xl p-5 mb-2 origin-bottom-left rounded-2xl overflow-hidden"
            >
              {/* Connected Visual Tail from Icon */}
              <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white dark:bg-neutral-900 border-r border-b border-gray-900 dark:border-neutral-700 rotate-45" />

              {/* Header inside Popup */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-ping" />
                  <span className="text-xs font-bold text-black dark:text-white font-sans uppercase tracking-wider">
                    {language === 'zh' ? '齐思设计 • 联系方式' : 'QISI STUDIO • CONTACT'}
                  </span>
                </div>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="p-1 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>

              {/* Profile Card Body */}
              <div className="mt-4 space-y-3">
                <div className="bg-gray-50 dark:bg-neutral-950 p-3 border border-gray-200 dark:border-neutral-800 rounded-xl">
                  <h4 className="text-sm font-bold text-black dark:text-white font-sans">
                    {language === 'zh' ? ABOUT_DATA.name : ABOUT_DATA.englishName}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-mono mt-0.5">
                    {language === 'zh' ? ABOUT_DATA.title : ABOUT_DATA.englishTitle}
                  </p>
                </div>

                {/* FULL CONTACT LIST (Email, Phone, WeChat, QQ) */}
                <div className="space-y-2 pt-1 text-xs font-mono">
                  
                  {/* Email */}
                  <div className="flex items-center justify-between bg-white dark:bg-neutral-950 p-2 border border-gray-100 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300">
                      <Mail className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-sans uppercase">
                        {language === 'zh' ? '邮箱' : 'Email'}
                      </span>
                    </div>
                    <span className="text-black dark:text-white font-medium text-[11px]">{ABOUT_DATA.email}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between bg-white dark:bg-neutral-950 p-2 border border-gray-100 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300">
                      <Phone className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-sans uppercase">
                        {language === 'zh' ? '电话' : 'Phone'}
                      </span>
                    </div>
                    <span className="text-black dark:text-white font-medium text-[11px]">{ABOUT_DATA.phone}</span>
                  </div>

                  {/* WeChat */}
                  <div className="flex items-center justify-between bg-white dark:bg-neutral-950 p-2 border border-gray-100 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300">
                      <MessageSquare className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-sans uppercase">
                        {language === 'zh' ? '微信' : 'WeChat'}
                      </span>
                    </div>
                    <span className="text-black dark:text-white font-medium text-[11px]">{ABOUT_DATA.wechat}</span>
                  </div>

                  {/* QQ */}
                  <div className="flex items-center justify-between bg-white dark:bg-neutral-950 p-2 border border-gray-100 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300">
                      <QrCode className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-sans uppercase">
                        QQ
                      </span>
                    </div>
                    <span className="text-black dark:text-white font-medium text-[11px]">{ABOUT_DATA.qq}</span>
                  </div>

                </div>

                {/* ABOUT ME Action Link */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setActiveTab('about');
                    }}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 px-3 text-xs font-mono font-medium tracking-wider flex items-center justify-center gap-1.5 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors rounded-xl"
                  >
                    <span>{language === 'zh' ? '关于我' : 'ABOUT ME'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM-LEFT TRIGGER BUTTON (Continuous Anchor - QSi) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-900 text-black dark:text-white border transition-all duration-200 shadow-md hover:shadow-lg rounded-full ${
              profileOpen
                ? 'border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20 bg-gray-50 dark:bg-neutral-800'
                : 'border-gray-300 dark:border-neutral-700 hover:border-black dark:hover:border-white'
            }`}
            id="footer-bottom-left-profile-btn"
          >
            <span className="text-xl font-light font-sans tracking-tight text-neutral-800 dark:text-neutral-100 animate-[pulse_4s_infinite_ease-in-out]">QSi</span>
            <span className="text-xs font-bold font-mono tracking-tight text-black dark:text-white hidden sm:inline">
              QSi DESIGN
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>

      </div>
    </>
  );
};
