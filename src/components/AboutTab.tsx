import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Copy,
  Check,
  MapPin,
  Award,
  Send,
  ArrowUpRight,
  Phone,
  ChevronDown,
  User,
  Briefcase,
  Sparkles,
  FileText,
  MessageSquare,
  QrCode,
  GraduationCap,
  Trash2,
  Inbox,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { ABOUT_DATA } from '../data/portfolioData';
import { Language } from '../types';
import { QSiLogo } from './QSiLogo';

interface AboutTabProps {
  playClickSound: () => void;
  language: Language;
}

interface MessageLogItem {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}

const DEFAULT_MESSAGES: MessageLogItem[] = [
  {
    id: 'msg-1',
    name: '张立华 (Alex)',
    email: 'alex.zhang@brandvision.cn',
    message: '齐思团队您好，看了贵工作室的艺术展陈与品牌重构作品非常惊艳。我们目前有一家新零售品牌的 VI 升级与旗舰店视觉包装需求，希望能进一步沟通合作细节与项目排期。',
    date: '2026-07-28 14:30'
  },
  {
    id: 'msg-2',
    name: '林薇 (Vivian)',
    email: 'vivian.lin@artspace.org',
    message: '您好，我们是 2026 东方视角当代设计展组委会，诚挚邀请齐思设计作为特邀参展团队，参与今年 10 月的字体与书籍重构特展。',
    date: '2026-07-29 09:15'
  }
];

export const AboutTab: React.FC<AboutTabProps> = ({ playClickSound, language }) => {
  // Accordion state - DEFAULT ONLY BASIC INFO IS EXPANDED
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    profile: true,
    bio: false,
    skills: false,
    education: false,
    experience: false,
    awards: false,
    contact: false
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  // Inbox folding & password protection state (Password: "269172")
  const [isInboxFolded, setIsInboxFolded] = useState(true);
  const [isInboxUnlocked, setIsInboxUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Copy Email Handler
  const handleCopyMyEmail = () => {
    playClickSound();
    navigator.clipboard.writeText('2691726671@qq.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  // Unlock Inbox Handler
  const handleUnlockInbox = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput.trim() === '269172') {
      playClickSound();
      setIsInboxUnlocked(true);
      setPasswordError(false);
      setPasswordInput('');
    } else {
      playClickSound();
      setPasswordError(true);
    }
  };

  // Local Storage Persistent Inbox Messages Log
  const [inboxMessages, setInboxMessages] = useState<MessageLogItem[]>(() => {
    const saved = localStorage.getItem('qsi_messages_inbox');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_MESSAGES;
  });

  const saveInbox = (msgs: MessageLogItem[]) => {
    setInboxMessages(msgs);
    try {
      localStorage.setItem('qsi_messages_inbox', JSON.stringify(msgs));
    } catch (e) {
      // ignore
    }
  };

  const handleDeleteMessage = (id: string) => {
    playClickSound();
    const updated = inboxMessages.filter((m) => m.id !== id);
    saveInbox(updated);
  };

  const handleClearInbox = () => {
    playClickSound();
    saveInbox([]);
  };

  // Skill Tags array for individual icon badges
  const skillTagList = [
    { name: 'PS', category: '设计软件' },
    { name: 'AI', category: '设计软件' },
    { name: 'AIGC', category: '前沿探索' },
    { name: '品牌设计', category: '核心业务' },
    { name: '标志设计', category: '核心业务' },
    { name: '字体设计', category: '核心业务' },
    { name: '插画设计', category: '视觉创作' },
    { name: '平面视觉设计', category: '核心业务' },
    { name: '书籍装帧', category: '出版物' },
    { name: '包装结构', category: '工程包装' },
    { name: 'UI设计', category: '数字界面' },
    { name: '展陈视觉', category: '空间艺术' },
    { name: '动态视觉', category: '动效' }
  ];

  // Toggle single section
  const toggleSection = (key: string) => {
    playClickSound();
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if all are expanded
  const isAllExpanded = Object.values(openSections).every(Boolean);

  // Single button toggle: Expand All <-> Collapse All
  const handleToggleExpandAll = () => {
    playClickSound();
    const nextState = !isAllExpanded;
    setOpenSections({
      profile: nextState,
      bio: nextState,
      skills: nextState,
      education: nextState,
      experience: nextState,
      awards: nextState,
      contact: nextState
    });
  };

  const handleCopy = (text: string, key: string) => {
    playClickSound();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (formData.name && formData.email && formData.message) {
      const nowStr = new Date();
      const dateFormatted = `${nowStr.getFullYear()}-${String(nowStr.getMonth() + 1).padStart(2, '0')}-${String(nowStr.getDate()).padStart(2, '0')} ${String(nowStr.getHours()).padStart(2, '0')}:${String(nowStr.getMinutes()).padStart(2, '0')}`;

      const newRecord: MessageLogItem = {
        id: `msg-${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        date: dateFormatted
      };

      const updated = [newRecord, ...inboxMessages];
      saveInbox(updated);

      setFormData({ name: '', email: '', message: '' });
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 6000);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-transparent via-white to-white dark:via-neutral-950 dark:to-neutral-950 pt-12 sm:pt-20 pb-24 sm:pb-32 px-4 sm:px-12 transition-colors overflow-hidden">
      {/* Subtle Ambient Blend Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-32 bg-gradient-to-b from-gray-100/40 via-transparent to-transparent dark:from-neutral-900/30 pointer-events-none blur-xl" />

      <div className="relative max-w-4xl mx-auto space-y-8 z-10">
        
        {/* HEADER TITLE & MERGED EXPAND/COLLAPSE SINGLE TOGGLE BUTTON */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-gray-200 dark:border-neutral-800">
          <div>
            <div className="mb-2">
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
            <h1 className="text-2xl sm:text-4xl font-extrabold text-black dark:text-white font-sans tracking-tight">
              {language === 'zh' ? '关于齐思' : 'ABOUT QSi STUDIO'}
            </h1>
          </div>

          {/* Single Toggle Button: Expand All / Collapse All with Rounded Corners */}
          <button
            onClick={handleToggleExpandAll}
            className="self-start sm:self-auto text-[11px] font-mono uppercase tracking-wider text-white dark:text-black bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 px-5 py-2.5 transition-all shadow-xs border border-black dark:border-white flex items-center gap-2 active:scale-95 rounded-full"
            id="about-toggle-all-btn"
          >
            <span>
              {isAllExpanded
                ? language === 'zh'
                  ? '全部折叠 -'
                  : 'COLLAPSE ALL -'
                : language === 'zh'
                ? '全部展开 +'
                : 'EXPAND ALL +'}
            </span>
          </button>
        </div>

        {/* ACCORDION SECTIONS */}
        <div className="space-y-4 font-sans">
          
          {/* SECTION 1: PROFILE */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xs"
          >
            <button
              onClick={() => toggleSection('profile')}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wide flex items-baseline gap-2">
                  <span>01. {language === 'zh' ? '基础信息' : 'PROFILE & INFO'}</span>
                  {language === 'zh' && (
                    <span className="text-[10px] font-mono font-normal text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
                      BASIC INFO
                    </span>
                  )}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                  openSections.profile ? 'rotate-180 text-black dark:text-white' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openSections.profile && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-gray-100 dark:border-neutral-800"
                >
                  <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 dark:bg-neutral-950/50">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <QSiLogo className="h-6 w-auto text-black dark:text-white" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-xl font-black text-black dark:text-white">
                          {ABOUT_DATA.name}
                        </h2>
                        {language === 'zh' && (
                          <span className="text-xs font-mono text-gray-400 dark:text-neutral-500 font-normal">
                            {ABOUT_DATA.englishName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-gray-600 dark:text-neutral-300 mt-1">
                        {ABOUT_DATA.title}
                      </p>
                      {language === 'zh' && (
                        <p className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 mt-0.5">
                          {ABOUT_DATA.englishTitle}
                        </p>
                      )}
                      
                      <div className="mt-4 space-y-1.5 text-xs font-mono text-gray-600 dark:text-neutral-300">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 dark:text-neutral-500">{language === 'zh' ? '工作地点:' : 'Location:'}</span>
                          <span className="text-black dark:text-white font-medium">{ABOUT_DATA.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 dark:text-neutral-500">{language === 'zh' ? '专业方向:' : 'Focus:'}</span>
                          <span className="text-black dark:text-white font-medium">{language === 'zh' ? '视觉传达 / 品牌视觉重构' : 'Visual Communication'}</span>
                        </div>
                      </div>
                    </div>

                    {/* COMPLETE CONTACT INFO BOX (Email, Phone, WeChat, QQ) - WITHOUT SVG ICONS */}
                    <div className="bg-white dark:bg-neutral-900 p-4 border border-gray-200 dark:border-neutral-800 rounded-xl space-y-2.5 text-xs font-mono">
                      <div className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-widest font-semibold pb-1 border-b border-gray-100 dark:border-neutral-800">
                        {language === 'zh' ? '全域联系方式' : 'CONTACT CHANNELS'}
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-neutral-400">
                          {language === 'zh' ? '邮箱' : 'Email'}:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-black dark:text-white font-medium">{ABOUT_DATA.email}</span>
                          <button
                            onClick={() => handleCopy(ABOUT_DATA.email, 'email')}
                            className="p-1 hover:text-black dark:hover:text-white text-gray-400"
                            title="Copy Email"
                          >
                            {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-neutral-400">
                          {language === 'zh' ? '电话' : 'Phone'}:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-black dark:text-white font-medium">{ABOUT_DATA.phone}</span>
                          <button
                            onClick={() => handleCopy(ABOUT_DATA.phone, 'phone')}
                            className="p-1 hover:text-black dark:hover:text-white text-gray-400"
                            title="Copy Phone"
                          >
                            {copiedKey === 'phone' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {/* WeChat */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-neutral-400">
                          {language === 'zh' ? '微信' : 'WeChat'}:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-black dark:text-white font-medium">{ABOUT_DATA.wechat}</span>
                          <button
                            onClick={() => handleCopy(ABOUT_DATA.wechat, 'wechat')}
                            className="p-1 hover:text-black dark:hover:text-white text-gray-400"
                            title="Copy WeChat"
                          >
                            {copiedKey === 'wechat' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {/* QQ */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-neutral-400">
                          QQ:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-black dark:text-white font-medium">{ABOUT_DATA.qq}</span>
                          <button
                            onClick={() => handleCopy(ABOUT_DATA.qq, 'qq')}
                            className="p-1 hover:text-black dark:hover:text-white text-gray-400"
                            title="Copy QQ"
                          >
                            {copiedKey === 'qq' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SECTION 2: BIO & MANIFESTO */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
            className="border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xs"
          >
            <button
              onClick={() => toggleSection('bio')}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wide flex items-baseline gap-2">
                  <span>02. {language === 'zh' ? '设计宣言与履历' : 'MANIFESTO & PHILOSOPHY'}</span>
                  {language === 'zh' && (
                    <span className="text-[10px] font-mono font-normal text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
                      MANIFESTO
                    </span>
                  )}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                  openSections.bio ? 'rotate-180 text-black dark:text-white' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openSections.bio && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-gray-100 dark:border-neutral-800"
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="p-4 bg-black dark:bg-white text-white dark:text-black rounded-xl space-y-1">
                      {ABOUT_DATA.manifesto.map((line, idx) => (
                        <p key={idx} className="text-xs sm:text-sm font-serif italic">
                          {line}
                        </p>
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 dark:text-neutral-300 leading-relaxed font-sans">
                      {ABOUT_DATA.bio}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SECTION 3: SKILLS */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
            className="border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xs"
          >
            <button
              onClick={() => toggleSection('skills')}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wide flex items-baseline gap-2">
                  <span>03. {language === 'zh' ? '专业技能' : 'SKILLS & CAPABILITIES'}</span>
                  {language === 'zh' && (
                    <span className="text-[10px] font-mono font-normal text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
                      CAPABILITIES
                    </span>
                  )}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                  openSections.skills ? 'rotate-180 text-black dark:text-white' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openSections.skills && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-gray-100 dark:border-neutral-800"
                >
                  <div className="p-5 sm:p-6 space-y-6">
                    {/* Individual Icon Tag Chips */}
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-widest block mb-3">
                        {language === 'zh' ? '核心技能标签' : 'CAPABILITY TAGS'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {skillTagList.map((tag, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 text-black dark:text-white border border-gray-300 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-all text-xs font-mono shadow-2xs group rounded-xl"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white group-hover:bg-amber-500" />
                            <span className="font-bold">{tag.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Grouped Category Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-neutral-800">
                      {ABOUT_DATA.skills.map((grp, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl">
                          <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-2 font-mono">
                            {grp.category}
                          </h4>
                          <ul className="space-y-1 text-xs text-gray-600 dark:text-neutral-400 font-sans">
                            {grp.items.map((item, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-black dark:bg-white rounded-full" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SECTION 4: EDUCATION HISTORY */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.12 }}
            className="border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xs"
          >
            <button
              onClick={() => toggleSection('education')}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wide flex items-baseline gap-2">
                  <span>04. {language === 'zh' ? '教育经历' : 'EDUCATION HISTORY'}</span>
                  {language === 'zh' && (
                    <span className="text-[10px] font-mono font-normal text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
                      EDUCATION
                    </span>
                  )}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                  openSections.education ? 'rotate-180 text-black dark:text-white' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openSections.education && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-gray-100 dark:border-neutral-800"
                >
                  <div className="p-5 sm:p-6 space-y-3">
                    {ABOUT_DATA.education.map((edu, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-[10px] font-mono bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 self-start font-bold rounded-md">
                            {edu.year}
                          </span>
                          <span className="text-xs font-mono text-gray-400 dark:text-neutral-500">{edu.location}</span>
                        </div>
                        <h4 className="text-sm font-bold text-black dark:text-white font-sans">{edu.degree}</h4>
                        <p className="text-xs font-mono text-gray-600 dark:text-neutral-400">{edu.school}</p>
                        {edu.description && (
                          <p className="text-xs text-gray-500 dark:text-neutral-400 font-sans">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SECTION 5: EXPERIENCE */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 }}
            className="border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xs"
          >
            <button
              onClick={() => toggleSection('experience')}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wide flex items-baseline gap-2">
                  <span>05. {language === 'zh' ? '工作履历' : 'CAREER EXPERIENCE'}</span>
                  {language === 'zh' && (
                    <span className="text-[10px] font-mono font-normal text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
                      EXPERIENCE
                    </span>
                  )}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                  openSections.experience ? 'rotate-180 text-black dark:text-white' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openSections.experience && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-gray-100 dark:border-neutral-800"
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    {ABOUT_DATA.experience.map((exp, idx) => (
                      <div key={idx} className="p-4 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-[10px] font-mono bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 self-start rounded-md">
                            {exp.year}
                          </span>
                          <span className="text-xs font-mono text-gray-400 dark:text-neutral-500">{exp.location}</span>
                        </div>
                        <h4 className="text-sm font-bold text-black dark:text-white font-sans">{exp.role}</h4>
                        <p className="text-xs font-mono text-gray-600 dark:text-neutral-400">{exp.company}</p>
                        <p className="text-xs text-gray-500 dark:text-neutral-400 font-sans">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SECTION 6: AWARDS */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.18 }}
            className="border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xs"
          >
            <button
              onClick={() => toggleSection('awards')}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wide flex items-baseline gap-2">
                  <span>06. {language === 'zh' ? '获奖与展览' : 'AWARDS & EXHIBITIONS'}</span>
                  {language === 'zh' && (
                    <span className="text-[10px] font-mono font-normal text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
                      HONORS
                    </span>
                  )}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                  openSections.awards ? 'rotate-180 text-black dark:text-white' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openSections.awards && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-gray-100 dark:border-neutral-800"
                >
                  <div className="p-5 sm:p-6 space-y-2 font-mono text-xs">
                    {ABOUT_DATA.awards.map((award, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black dark:text-white">{award.year}</span>
                          <span className="text-gray-800 dark:text-neutral-200 font-sans font-medium">{award.title}</span>
                        </div>
                        <span className="text-gray-500 dark:text-neutral-400 text-[11px]">{award.category}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SECTION 7: CONTACT FORM */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.2 }}
            className="border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xs"
          >
            <button
              onClick={() => toggleSection('contact')}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wide flex items-baseline gap-2">
                  <span>07. {language === 'zh' ? '在线留言' : 'GET IN TOUCH'}</span>
                  {language === 'zh' && (
                    <span className="text-[10px] font-mono font-normal text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
                      CONTACT
                    </span>
                  )}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                  openSections.contact ? 'rotate-180 text-black dark:text-white' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openSections.contact && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-gray-100 dark:border-neutral-800"
                >
                  <div className="p-5 sm:p-6 space-y-6">
                    <form onSubmit={handleSubmitForm} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono text-gray-500 dark:text-neutral-400 mb-1">
                            {language === 'zh' ? '您的姓名 / NAME' : 'YOUR NAME'}
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                            placeholder="e.g. Alex"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-gray-500 dark:text-neutral-400 mb-1">
                            {language === 'zh' ? '您的邮箱 / EMAIL' : 'YOUR EMAIL'}
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full p-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                            placeholder="alex@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-gray-500 dark:text-neutral-400 mb-1">
                          {language === 'zh' ? '留言内容 / MESSAGE' : 'MESSAGE'}
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full p-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 rounded-xl text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                          placeholder={language === 'zh' ? '请输入合作项目需求或咨询内容...' : 'Tell us about your project...'}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="submit"
                          className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 px-4 text-xs font-mono font-bold tracking-widest uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all rounded-xl shadow-xs active:scale-98"
                        >
                          {language === 'zh' ? '发送在线留言 / SUBMIT MESSAGE' : 'SUBMIT MESSAGE'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyMyEmail}
                          className="px-4 py-3 bg-gray-100 dark:bg-neutral-800 text-black dark:text-white text-xs font-mono font-medium rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all flex items-center justify-center gap-1.5"
                        >
                          {copiedEmail ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {language === 'zh' ? '已复制邮箱: 2691726671@qq.com' : 'COPIED 2691726671@qq.com'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{language === 'zh' ? '复制我的邮箱 ✉' : 'COPY MY EMAIL ✉'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* SUBMITTED MESSAGES LOG FEEDBACK TOAST */}
                    {formSubmitted && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1.5 rounded-2xl animate-fade-in">
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 font-mono">
                          {language === 'zh' ? '留言成功！已实时保存至收件箱日志。' : 'MESSAGE SAVED! STORED IN LOCAL INBOX LOG.'}
                        </h4>
                      </div>
                    )}

                    {/* LIVE INBOX & MESSAGES LOG VIEWER (COLLAPSIBLE & PASSWORD PROTECTED) */}
                    <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-3">
                      
                      {/* COLLAPSIBLE HEADER BUTTON */}
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setIsInboxFolded(!isInboxFolded);
                        }}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-950 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Inbox className="w-4 h-4 text-black dark:text-white" />
                          <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider font-mono">
                            {language === 'zh' ? '留言收件箱记录' : 'MESSAGE INBOX LOG'}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-black dark:bg-white text-white dark:text-black font-bold rounded-full">
                            {inboxMessages.length}
                          </span>
                          {!isInboxUnlocked ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800">
                              <Lock className="w-3 h-3" />
                              <span>{language === 'zh' ? '已受密码保护' : 'LOCKED'}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                              <Unlock className="w-3 h-3" />
                              <span>{language === 'zh' ? '已解锁' : 'UNLOCKED'}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-gray-500 dark:text-neutral-400">
                            {isInboxFolded ? (language === 'zh' ? '点击展开' : 'EXPAND') : (language === 'zh' ? '折叠收件箱' : 'FOLD')}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                              !isInboxFolded ? 'rotate-180 text-black dark:text-white' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {/* UNFOLDED CONTENT SECTION */}
                      <AnimatePresence>
                        {!isInboxFolded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-3 pt-1"
                          >
                            {/* PASSWORD AUTHENTICATION BAR / OVERLAY */}
                            {!isInboxUnlocked ? (
                              <div className="p-4 bg-neutral-900 dark:bg-neutral-950 border border-neutral-800 text-white rounded-2xl space-y-3 shadow-lg">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 text-white">
                                    <KeyRound className="w-4 h-4 text-gray-300 shrink-0" />
                                    <h5 className="text-xs font-bold font-mono tracking-wider">
                                      {language === 'zh' ? '管理者身份验证' : 'ADMIN AUTHENTICATION'}
                                    </h5>
                                  </div>
                                  <span className="text-[10px] font-mono text-gray-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                                    {language === 'zh' ? '受密码保护' : 'PROTECTED'}
                                  </span>
                                </div>

                                <p className="text-[11px] font-sans text-gray-400 leading-relaxed">
                                  {language === 'zh'
                                    ? '为保护客户端留言数据安全，查看、复制与管理收件箱需验证管理员密码。'
                                    : 'Please enter the administrative passcode to view, copy, or manage stored messages.'}
                                </p>

                                <form onSubmit={handleUnlockInbox} className="flex flex-col sm:flex-row items-stretch gap-2 pt-1">
                                  <input
                                    type="password"
                                    autoComplete="current-password"
                                    value={passwordInput}
                                    onChange={(e) => {
                                      setPasswordInput(e.target.value);
                                      setPasswordError(false);
                                    }}
                                    placeholder={language === 'zh' ? '请输入密码解锁...' : 'Enter Passcode...'}
                                    className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 focus:border-white rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none tracking-[0.25em] font-mono transition-colors"
                                  />
                                  <button
                                    type="submit"
                                    className="px-4 py-2 bg-white text-black font-mono text-xs font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
                                  >
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>{language === 'zh' ? '解锁收件箱' : 'UNLOCK'}</span>
                                  </button>
                                </form>

                                {passwordError && (
                                  <p className="text-[11px] font-mono text-red-400 flex items-center gap-1.5 pt-0.5 animate-shake">
                                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                    <span>{language === 'zh' ? '密码验证失败！请输入正确密码' : 'Incorrect passcode. Try again.'}</span>
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                                <div className="flex items-center gap-2 text-xs font-mono text-emerald-900 dark:text-emerald-200 font-bold">
                                  <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>{language === 'zh' ? '已通过密码验证 (可正常查看、复制与删除留言)' : 'UNLOCKED (FULL EDIT PERMISSIONS)'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {inboxMessages.length > 0 && (
                                    <button
                                      onClick={handleClearInbox}
                                      className="text-[10px] font-mono text-red-500 hover:text-red-700 transition-colors mr-2"
                                      title="清空留言"
                                    >
                                      {language === 'zh' ? '清空所有' : 'Clear All'}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      playClickSound();
                                      setIsInboxUnlocked(false);
                                    }}
                                    className="px-2.5 py-1 text-[10px] font-mono bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-black dark:hover:border-white transition-colors flex items-center gap-1"
                                  >
                                    <Lock className="w-3 h-3" />
                                    <span>{language === 'zh' ? '重新锁定' : 'LOCK'}</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* MESSAGES LIST (BLURRED AND LOCKED UNLESS UNLOCKED) */}
                            <div className={`transition-all duration-300 space-y-2.5 ${!isInboxUnlocked ? 'filter blur-md select-none pointer-events-none opacity-40' : 'filter-none pointer-events-auto opacity-100'}`}>
                              {inboxMessages.length === 0 ? (
                                <div className="p-6 text-center bg-gray-50 dark:bg-neutral-950 border border-dashed border-gray-200 dark:border-neutral-800 rounded-xl space-y-1">
                                  <p className="text-xs font-mono text-gray-400 dark:text-neutral-500">
                                    {language === 'zh' ? '暂无新留言，请在上方填写提交' : 'No stored messages yet.'}
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  {inboxMessages.map((item) => (
                                    <div
                                      key={item.id}
                                      className="p-3.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl space-y-2 relative group hover:border-black dark:hover:border-neutral-600 transition-colors"
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-black dark:text-white font-sans">{item.name}</span>
                                          <span className="text-[11px] font-mono text-gray-500 dark:text-neutral-400">({item.email})</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500">{item.date}</span>
                                      </div>

                                      <p className="text-xs text-gray-700 dark:text-neutral-300 font-sans leading-relaxed bg-white dark:bg-neutral-900 p-2.5 rounded-lg border border-gray-100 dark:border-neutral-800">
                                        {item.message}
                                      </p>

                                      <div className="flex items-center justify-end gap-2 pt-1">
                                        <button
                                          onClick={() => handleCopy(`发件人: ${item.name} (${item.email})\n时间: ${item.date}\n内容: ${item.message}`, item.id)}
                                          className="px-2.5 py-1 text-[10px] font-mono bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white border border-gray-200 dark:border-neutral-800 rounded-lg flex items-center gap-1 transition-colors"
                                        >
                                          {copiedKey === item.id ? (
                                            <>
                                              <Check className="w-3 h-3 text-emerald-500" />
                                              <span>{language === 'zh' ? '已复制' : 'Copied'}</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3 h-3" />
                                              <span>{language === 'zh' ? '复制记录' : 'Copy'}</span>
                                            </>
                                          )}
                                        </button>

                                        <button
                                          onClick={() => {
                                            const subject = encodeURIComponent(`[回复齐思留言] ${item.name}`);
                                            const body = encodeURIComponent(`\n\n------------------\n原始留言 (${item.date}):\n${item.message}`);
                                            window.location.href = `mailto:${item.email}?subject=${subject}&body=${body}`;
                                          }}
                                          className="px-2.5 py-1 text-[10px] font-mono bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white border border-gray-200 dark:border-neutral-800 rounded-lg flex items-center gap-1 transition-colors"
                                        >
                                          <Mail className="w-3 h-3" />
                                          <span>{language === 'zh' ? '回复发件人' : 'Reply'}</span>
                                        </button>

                                        <button
                                          onClick={() => handleDeleteMessage(item.id)}
                                          className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                                          title="删除"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>

      </div>
    </div>
  );
};

