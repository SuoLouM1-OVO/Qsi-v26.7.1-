import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  Plus
} from 'lucide-react';
import { ABOUT_DATA } from '../data/portfolioData';
import { Language } from '../types';
import { QSiLogo } from './QSiLogo';
import { Edit3 } from 'lucide-react';
import { postGuestMessage, subscribeGuestMessages, deleteGuestMessage } from '../services/firebaseService';

interface AboutTabProps {
  playClickSound: () => void;
  language: Language;
  aboutData?: typeof ABOUT_DATA;
  onOpenAboutManager?: () => void;
  onOpenGuestbook?: () => void;
  isEditMode?: boolean;
  onSaveAboutData?: (updated: typeof ABOUT_DATA) => void;
  onResetAboutData?: () => void;
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

export const AboutTab: React.FC<AboutTabProps> = ({
  playClickSound,
  language,
  aboutData,
  onOpenAboutManager,
  onOpenGuestbook,
  isEditMode = false,
  onSaveAboutData,
  onResetAboutData
}) => {
  const [localAboutData, setLocalAboutData] = useState<typeof ABOUT_DATA>(aboutData || ABOUT_DATA);
  const [rawIsInPageEditing, setIsInPageEditing] = useState<boolean>(false);
  const isInPageEditing = isEditMode || rawIsInPageEditing;
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    if (aboutData) {
      setLocalAboutData(aboutData);
    }
  }, [aboutData]);

  const data = localAboutData;

  const updateAboutField = (updater: (prev: typeof ABOUT_DATA) => typeof ABOUT_DATA) => {
    setLocalAboutData((prev) => {
      const next = updater(prev);
      if (onSaveAboutData) {
        onSaveAboutData(next);
      } else {
        try {
          localStorage.setItem('qsi_custom_about_data', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  const handleAddCustomSection = () => {
    playClickSound();
    updateAboutField((prev) => {
      const customSections = Array.isArray((prev as any).customSections) ? [...(prev as any).customSections] : [];
      const newSec = {
        id: `sec-${Date.now()}`,
        title: `自定义 DIV 模块 ${customSections.length + 1}`,
        items: [
          {
            id: `item-${Date.now()}-1`,
            mainTitle: '模块大标题 / 描述名称',
            content: '请输入详细描述内容...'
          }
        ]
      };
      return { ...prev, customSections: [...customSections, newSec] };
    });
  };

  const handleAddCustomItem = (secIdx: number) => {
    playClickSound();
    updateAboutField((prev) => {
      const customSections = Array.isArray((prev as any).customSections) ? [...(prev as any).customSections] : [];
      if (!customSections[secIdx]) return prev;
      const items = Array.isArray(customSections[secIdx].items) ? [...customSections[secIdx].items] : [];
      items.push({
        id: `item-${Date.now()}`,
        mainTitle: '新条目标题',
        content: '详细说明...'
      });
      customSections[secIdx] = { ...customSections[secIdx], items };
      return { ...prev, customSections };
    });
  };

  const handleDeleteCustomItem = (secIdx: number, itemIdx: number) => {
    playClickSound();
    updateAboutField((prev) => {
      const customSections = Array.isArray((prev as any).customSections) ? [...(prev as any).customSections] : [];
      if (!customSections[secIdx]) return prev;
      const items = Array.isArray(customSections[secIdx].items) ? [...customSections[secIdx].items] : [];
      items.splice(itemIdx, 1);
      customSections[secIdx] = { ...customSections[secIdx], items };
      return { ...prev, customSections };
    });
  };

  const handleDeleteCustomSection = (secIdx: number) => {
    playClickSound();
    updateAboutField((prev) => {
      const customSections = Array.isArray((prev as any).customSections) ? [...(prev as any).customSections] : [];
      customSections.splice(secIdx, 1);
      return { ...prev, customSections };
    });
  };

  const handleAddSkillTag = () => {
    if (!newTagInput.trim()) return;
    playClickSound();
    updateAboutField((prev) => {
      const skillTags = Array.isArray(prev.skillTags) ? [...prev.skillTags] : [];
      skillTags.push(newTagInput.trim());
      return { ...prev, skillTags };
    });
    setNewTagInput('');
  };

  const handleDeleteSkillTag = (tagIdx: number) => {
    playClickSound();
    updateAboutField((prev) => {
      const skillTags = Array.isArray(prev.skillTags) ? [...prev.skillTags] : [];
      skillTags.splice(tagIdx, 1);
      return { ...prev, skillTags };
    });
  };

  const handleAddEducation = () => {
    playClickSound();
    updateAboutField((prev) => {
      const education = Array.isArray(prev.education) ? [...prev.education] : [];
      education.push({
        year: '2026',
        degree: '设计学硕士 / M.A.',
        school: '美术学院',
        location: '中国',
        description: '视觉传达与艺术实践研究'
      });
      return { ...prev, education };
    });
  };

  const handleDeleteEducation = (idx: number) => {
    playClickSound();
    updateAboutField((prev) => {
      const education = Array.isArray(prev.education) ? [...prev.education] : [];
      education.splice(idx, 1);
      return { ...prev, education };
    });
  };

  const handleAddExperience = () => {
    playClickSound();
    updateAboutField((prev) => {
      const experience = Array.isArray(prev.experience) ? [...prev.experience] : [];
      experience.push({
        year: '2026',
        role: '设计总监 / Art Director',
        company: '齐思设计工作室 QSi Studio',
        location: '中国',
        description: '负责品牌重构与艺术展陈...',
        highlights: ['品牌全案视觉', '展陈艺术主视觉']
      });
      return { ...prev, experience };
    });
  };

  const handleDeleteExperience = (idx: number) => {
    playClickSound();
    updateAboutField((prev) => {
      const experience = Array.isArray(prev.experience) ? [...prev.experience] : [];
      experience.splice(idx, 1);
      return { ...prev, experience };
    });
  };

  const handleAddAward = () => {
    playClickSound();
    updateAboutField((prev) => {
      const awards = Array.isArray(prev.awards) ? [...prev.awards] : [];
      awards.push({
        year: '2026',
        title: '东方设计大奖 金奖',
        organization: '国际设计联合会',
        category: '展陈视觉类'
      });
      return { ...prev, awards };
    });
  };

  const handleDeleteAward = (idx: number) => {
    playClickSound();
    updateAboutField((prev) => {
      const awards = Array.isArray(prev.awards) ? [...prev.awards] : [];
      awards.splice(idx, 1);
      return { ...prev, awards };
    });
  };

  // Skill Groups editing handlers
  const handleAddSkillCategoryGroup = () => {
    playClickSound();
    updateAboutField((prev) => {
      const skills = Array.isArray(prev.skills) ? [...prev.skills] : [...ABOUT_DATA.skills];
      skills.push({
        category: '新分类组',
        items: ['技能条目 1']
      });
      return { ...prev, skills };
    });
  };

  const handleDeleteSkillCategoryGroup = (grpIdx: number) => {
    playClickSound();
    updateAboutField((prev) => {
      const skills = Array.isArray(prev.skills) ? [...prev.skills] : [...ABOUT_DATA.skills];
      skills.splice(grpIdx, 1);
      return { ...prev, skills };
    });
  };

  const handleAddSkillGroupItem = (grpIdx: number) => {
    playClickSound();
    updateAboutField((prev) => {
      const skills = Array.isArray(prev.skills) ? [...prev.skills] : [...ABOUT_DATA.skills];
      if (!skills[grpIdx]) return prev;
      const items = Array.isArray(skills[grpIdx].items) ? [...skills[grpIdx].items] : [];
      items.push('新专业技能条目');
      skills[grpIdx] = { ...skills[grpIdx], items };
      return { ...prev, skills };
    });
  };

  const handleDeleteSkillGroupItem = (grpIdx: number, itemIdx: number) => {
    playClickSound();
    updateAboutField((prev) => {
      const skills = Array.isArray(prev.skills) ? [...prev.skills] : [...ABOUT_DATA.skills];
      if (!skills[grpIdx]) return prev;
      const items = Array.isArray(skills[grpIdx].items) ? [...skills[grpIdx].items] : [];
      items.splice(itemIdx, 1);
      skills[grpIdx] = { ...skills[grpIdx], items };
      return { ...prev, skills };
    });
  };

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

  // Real-time Cloud Guestbook Subscription for Lower Messages Log
  const [inboxMessages, setInboxMessages] = useState<MessageLogItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeGuestMessages((list) => {
      const formatted: MessageLogItem[] = list.map((msg) => ({
        id: msg.id || `msg-${Date.now()}`,
        name: msg.authorName || '匿名访客',
        email: msg.email || '',
        message: msg.content || '',
        date: msg.date || (msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleString('zh-CN', { hour12: false }) : '刚刚'),
        projectTitle: msg.projectTitle
      }));
      setInboxMessages(formatted);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleDeleteMessage = async (id: string) => {
    playClickSound();
    try {
      await deleteGuestMessage(id);
    } catch (e) {
      console.warn('Delete message notice:', e);
    }
  };

  const handleClearInbox = () => {
    playClickSound();
    setInboxMessages([]);
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

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (formData.name && formData.email && formData.message) {
      try {
        await postGuestMessage({
          authorName: formData.name.trim(),
          email: formData.email.trim(),
          content: formData.message.trim()
        });
      } catch (err) {
        console.warn('Post guest message notice:', err);
      }

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

          {/* Action Control Buttons: Edit Profile & Expand/Collapse Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {isEditMode && (
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsInPageEditing(!isInPageEditing);
                  if (!isInPageEditing) {
                    setOpenSections({
                      profile: true,
                      bio: true,
                      skills: true,
                      education: true,
                      experience: true,
                      awards: true,
                      contact: true
                    });
                  }
                }}
                className={`p-2.5 rounded-full border transition-all cursor-pointer flex items-center justify-center shadow-2xs font-bold active:scale-95 ${
                  isInPageEditing
                    ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-300 dark:ring-amber-700'
                    : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white'
                }`}
                title={isInPageEditing ? (language === 'zh' ? '退出原页编辑' : 'Exit In-Page Edit') : (language === 'zh' ? '原页编辑模式' : 'In-Page Edit Mode')}
                id="about-toggle-inpage-edit-btn"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleExpandAll}
              className="text-[11px] font-mono uppercase tracking-wider text-gray-700 dark:text-neutral-200 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 px-4 py-2.5 transition-all shadow-2xs border border-gray-200 dark:border-neutral-700 flex items-center gap-1.5 active:scale-95 rounded-full cursor-pointer"
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
        </div>

        {/* IN-PAGE EDITING BANNER */}
        {isInPageEditing && (
          <div className="p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono shadow-xs animate-fade-in">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-bold">{language === 'zh' ? '原页实时编辑已开启：支持在原有界面直接修改文字、删除/添加 DIV 模块卡片' : 'In-Page Direct Editing Mode Active'}</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <button
                type="button"
                onClick={handleAddCustomSection}
                className="p-2 sm:px-2.5 sm:py-1.5 bg-black text-white dark:bg-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs active:scale-95"
                title={language === 'zh' ? '增加 DIV 模块卡片' : 'Add Custom DIV Card'}
                id="add-custom-div-card-btn"
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs font-mono">DIV</span>
              </button>
              {onResetAboutData && (
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    if (window.confirm(language === 'zh' ? '确定重置为默认齐思资料？' : 'Reset default profile?')) {
                      onResetAboutData();
                    }
                  }}
                  className="px-3 py-1.5 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all cursor-pointer"
                >
                  {language === 'zh' ? '恢复默认' : 'Reset'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsInPageEditing(false);
                }}
                className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                {language === 'zh' ? '完成编辑' : 'Finish Editing'}
              </button>
            </div>
          </div>
        )}

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
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
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
                  <div className="p-5 sm:p-6 bg-gray-50/50 dark:bg-neutral-950/50">
                    {isInPageEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/40 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 font-mono">
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-1 font-bold">姓名 Name (ZH)</label>
                          <input
                            type="text"
                            value={data.name || ''}
                            onChange={(e) => updateAboutField((d) => ({ ...d, name: e.target.value }))}
                            className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-black dark:text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-1 font-bold">英文名 English Name</label>
                          <input
                            type="text"
                            value={data.englishName || ''}
                            onChange={(e) => updateAboutField((d) => ({ ...d, englishName: e.target.value }))}
                            className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-black dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-1 font-bold">职位 Title (ZH)</label>
                          <input
                            type="text"
                            value={data.title || ''}
                            onChange={(e) => updateAboutField((d) => ({ ...d, title: e.target.value }))}
                            className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-black dark:text-white font-sans"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-1 font-bold">职位 Title (EN)</label>
                          <input
                            type="text"
                            value={data.englishTitle || ''}
                            onChange={(e) => updateAboutField((d) => ({ ...d, englishTitle: e.target.value }))}
                            className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-black dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-1 font-bold">工作地点 Location</label>
                          <input
                            type="text"
                            value={data.location || ''}
                            onChange={(e) => updateAboutField((d) => ({ ...d, location: e.target.value }))}
                            className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-black dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-1 font-bold">电子邮箱 Email</label>
                          <input
                            type="text"
                            value={data.email || ''}
                            onChange={(e) => updateAboutField((d) => ({ ...d, email: e.target.value }))}
                            className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-black dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-1 font-bold">电话 Phone</label>
                          <input
                            type="text"
                            value={data.phone || ''}
                            onChange={(e) => updateAboutField((d) => ({ ...d, phone: e.target.value }))}
                            className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-black dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-1 font-bold">微信 WeChat</label>
                          <input
                            type="text"
                            value={data.wechat || ''}
                            onChange={(e) => updateAboutField((d) => ({ ...d, wechat: e.target.value }))}
                            className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-black dark:text-white"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[11px] text-gray-500 mb-1 font-bold">QQ 号码</label>
                          <input
                            type="text"
                            value={data.qq || ''}
                            onChange={(e) => updateAboutField((d) => ({ ...d, qq: e.target.value }))}
                            className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-black dark:text-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <QSiLogo className="h-6 w-auto text-black dark:text-white" />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <h2 className="text-xl font-black text-black dark:text-white">
                              {data.name}
                            </h2>
                            {language === 'zh' && (
                              <span className="text-xs font-mono text-gray-400 dark:text-neutral-500 font-normal">
                                {data.englishName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono text-gray-600 dark:text-neutral-300 mt-1">
                            {data.title}
                          </p>
                          {language === 'zh' && (
                            <p className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 mt-0.5">
                              {data.englishTitle}
                            </p>
                          )}
                          
                          <div className="mt-4 space-y-1.5 text-xs font-mono text-gray-600 dark:text-neutral-300">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 dark:text-neutral-500">{language === 'zh' ? '工作地点:' : 'Location:'}</span>
                              <span className="text-black dark:text-white font-medium">{data.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 dark:text-neutral-500">{language === 'zh' ? '专业方向:' : 'Focus:'}</span>
                              <span className="text-black dark:text-white font-medium">{language === 'zh' ? '视觉传达 / 品牌视觉重构' : 'Visual Communication'}</span>
                            </div>
                          </div>
                        </div>

                        {/* COMPLETE CONTACT INFO BOX (Email, Phone, WeChat, QQ) */}
                        <div className="bg-white dark:bg-neutral-900 p-4 border border-gray-200 dark:border-neutral-800 rounded-xl space-y-2.5 text-xs font-mono">
                          <div className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-widest font-semibold pb-1 border-b border-gray-100 dark:border-neutral-800">
                            {language === 'zh' ? '全域联系方式' : 'CONTACT CHANNELS'}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-neutral-400">{language === 'zh' ? '邮箱' : 'Email'}:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-black dark:text-white font-medium">{data.email}</span>
                              <button onClick={() => handleCopy(data.email, 'email')} className="p-1 hover:text-black dark:hover:text-white text-gray-400 cursor-pointer" title="Copy Email">
                                {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-neutral-400">{language === 'zh' ? '电话' : 'Phone'}:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-black dark:text-white font-medium">{data.phone}</span>
                              <button onClick={() => handleCopy(data.phone, 'phone')} className="p-1 hover:text-black dark:hover:text-white text-gray-400 cursor-pointer" title="Copy Phone">
                                {copiedKey === 'phone' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-neutral-400">{language === 'zh' ? '微信' : 'WeChat'}:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-black dark:text-white font-medium">{data.wechat}</span>
                              <button onClick={() => handleCopy(data.wechat, 'wechat')} className="p-1 hover:text-black dark:hover:text-white text-gray-400 cursor-pointer" title="Copy WeChat">
                                {copiedKey === 'wechat' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-neutral-400">QQ:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-black dark:text-white font-medium">{data.qq}</span>
                              <button onClick={() => handleCopy(data.qq, 'qq')} className="p-1 hover:text-black dark:hover:text-white text-gray-400 cursor-pointer" title="Copy QQ">
                                {copiedKey === 'qq' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
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
                    {isInPageEditing ? (
                      <div className="space-y-4 bg-amber-50/30 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60">
                        <div className="space-y-2">
                          <label className="block text-xs font-mono font-bold text-amber-900 dark:text-amber-200">编辑设计宣言 (Manifesto Lines)</label>
                          {(Array.isArray(data.manifesto) ? data.manifesto : [data.manifesto]).map((line, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={line}
                                onChange={(e) => {
                                  const arr = Array.isArray(data.manifesto) ? [...data.manifesto] : [data.manifesto];
                                  arr[idx] = e.target.value;
                                  updateAboutField((d) => ({ ...d, manifesto: arr }));
                                }}
                                className="flex-1 p-2 text-xs bg-black text-white dark:bg-white dark:text-black font-serif italic rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const arr = Array.isArray(data.manifesto) ? [...data.manifesto] : [data.manifesto];
                                  arr.splice(idx, 1);
                                  updateAboutField((d) => ({ ...d, manifesto: arr }));
                                }}
                                className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const arr = Array.isArray(data.manifesto) ? [...data.manifesto] : [data.manifesto];
                              arr.push('新设计宣言金句...');
                              updateAboutField((d) => ({ ...d, manifesto: arr }));
                            }}
                            className="mt-1 text-xs font-mono text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>新增宣言句子</span>
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-mono font-bold text-amber-900 dark:text-amber-200 mb-1">编辑个人 / 工作室长篇简介 (Bio)</label>
                          <textarea
                            rows={5}
                            value={Array.isArray(data.bio) ? data.bio.join('\n') : (data.bio || '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateAboutField((d) => ({ ...d, bio: val.includes('\n') ? val.split('\n') : val }));
                            }}
                            className="w-full p-3 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl text-black dark:text-white leading-relaxed font-sans"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 bg-black dark:bg-white text-white dark:text-black rounded-xl space-y-1">
                          {(Array.isArray(data.manifesto) ? data.manifesto : [data.manifesto]).map((line, idx) => (
                            <p key={idx} className="text-xs sm:text-sm font-serif italic">
                              {line}
                            </p>
                          ))}
                        </div>

                        <p className="text-xs sm:text-sm text-gray-700 dark:text-neutral-300 leading-relaxed font-sans whitespace-pre-wrap">
                          {Array.isArray(data.bio) ? data.bio.join('\n\n') : data.bio}
                        </p>
                      </>
                    )}
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
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
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
                      <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-widest block mb-3 font-bold">
                        {language === 'zh' ? '核心技能标签' : 'CAPABILITY TAGS'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(data.skillTags || skillTagList.map((t) => t.name)).map((tag, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 text-black dark:text-white border border-gray-300 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-all text-xs font-mono shadow-2xs group rounded-xl"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white group-hover:bg-amber-500" />
                            <span className="font-bold">{typeof tag === 'string' ? tag : (tag as any).name}</span>
                            {isInPageEditing && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSkillTag(idx)}
                                className="text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer"
                                title="删除此标签"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {isInPageEditing && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-amber-200 dark:border-amber-800/50">
                          <input
                            type="text"
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            placeholder="输入新技能标签 (如: C4D, 展陈艺术)"
                            className="p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-black dark:text-white font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleAddSkillTag}
                            className="px-3 py-2 text-xs bg-black text-white dark:bg-white dark:text-black font-bold rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>添加技能标签</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Grouped Category Breakdown */}
                    <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-widest block font-bold">
                          {language === 'zh' ? '分类技能与专业领域' : 'SKILL CATEGORY GROUPS'}
                        </span>
                        {isInPageEditing && (
                          <button
                            type="button"
                            onClick={handleAddSkillCategoryGroup}
                            className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{language === 'zh' ? '新增技能分类组' : 'Add Category Group'}</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(data.skills || ABOUT_DATA.skills).map((grp, grpIdx) => (
                          <div key={grpIdx} className="p-4 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl space-y-2.5">
                            {isInPageEditing ? (
                              <div className="space-y-2.5 font-mono">
                                <div className="flex items-center justify-between gap-2">
                                  <input
                                    type="text"
                                    value={grp.category || ''}
                                    onChange={(e) => {
                                      const skills = Array.isArray(data.skills) ? [...data.skills] : [...ABOUT_DATA.skills];
                                      skills[grpIdx] = { ...skills[grpIdx], category: e.target.value };
                                      updateAboutField((d) => ({ ...d, skills }));
                                    }}
                                    placeholder="分类名称"
                                    className="p-1.5 text-xs font-bold bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-700 rounded-md text-black dark:text-white flex-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSkillCategoryGroup(grpIdx)}
                                    className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                                    title="删除此分类组"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="space-y-1.5">
                                  {(grp.items || []).map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => {
                                          const skills = Array.isArray(data.skills) ? [...data.skills] : [...ABOUT_DATA.skills];
                                          const items = [...(skills[grpIdx].items || [])];
                                          items[itemIdx] = e.target.value;
                                          skills[grpIdx] = { ...skills[grpIdx], items };
                                          updateAboutField((d) => ({ ...d, skills }));
                                        }}
                                        className="p-1 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md text-black dark:text-white flex-1 font-sans"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSkillGroupItem(grpIdx, itemIdx)}
                                        className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                                        title="删除条目"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => handleAddSkillGroupItem(grpIdx)}
                                    className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>添加条目</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-2 font-mono">
                                  {grp.category}
                                </h4>
                                <ul className="space-y-1 text-xs text-gray-600 dark:text-neutral-400 font-sans">
                                  {(grp.items || []).map((item, i) => (
                                    <li key={i} className="flex items-center gap-1.5">
                                      <span className="w-1 h-1 bg-black dark:bg-white rounded-full" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
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
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
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
                    {(data.education || []).map((edu, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl space-y-2">
                        {isInPageEditing ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={edu.year || ''}
                                onChange={(e) => {
                                  const list = [...(data.education || [])];
                                  list[idx] = { ...list[idx], year: e.target.value };
                                  updateAboutField((d) => ({ ...d, education: list }));
                                }}
                                placeholder="年份 (如 2026)"
                                className="w-24 p-1.5 text-xs bg-black text-white dark:bg-white dark:text-black font-bold rounded-md"
                              />
                              <input
                                type="text"
                                value={edu.location || ''}
                                onChange={(e) => {
                                  const list = [...(data.education || [])];
                                  list[idx] = { ...list[idx], location: e.target.value };
                                  updateAboutField((d) => ({ ...d, education: list }));
                                }}
                                placeholder="地点"
                                className="flex-1 p-1.5 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md"
                              />
                            </div>
                            <div className="flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => handleDeleteEducation(idx)}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-mono font-bold cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>删除卡片</span>
                              </button>
                            </div>
                            <input
                              type="text"
                              value={edu.degree || ''}
                              onChange={(e) => {
                                const list = [...(data.education || [])];
                                list[idx] = { ...list[idx], degree: e.target.value };
                                updateAboutField((d) => ({ ...d, education: list }));
                              }}
                              placeholder="学位 / 专业名称"
                              className="w-full p-1.5 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md font-sans font-bold"
                            />
                            <input
                              type="text"
                              value={edu.school || ''}
                              onChange={(e) => {
                                const list = [...(data.education || [])];
                                list[idx] = { ...list[idx], school: e.target.value };
                                updateAboutField((d) => ({ ...d, education: list }));
                              }}
                              placeholder="学校 / 机构"
                              className="w-full p-1.5 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md font-mono"
                            />
                            <input
                              type="text"
                              value={edu.description || ''}
                              onChange={(e) => {
                                const list = [...(data.education || [])];
                                list[idx] = { ...list[idx], description: e.target.value };
                                updateAboutField((d) => ({ ...d, education: list }));
                              }}
                              placeholder="描述简述..."
                              className="sm:col-span-2 w-full p-1.5 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md font-sans"
                            />
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    ))}

                    {isInPageEditing && (
                      <button
                        type="button"
                        onClick={handleAddEducation}
                        className="w-full p-2.5 border border-dashed border-gray-300 dark:border-neutral-700 hover:border-black dark:hover:border-white rounded-xl text-xs font-mono font-bold text-black dark:text-white flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>新增教育卡片</span>
                      </button>
                    )}
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
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
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
                    {(data.experience || []).map((exp, idx) => (
                      <div key={idx} className="p-4 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl space-y-2">
                        {isInPageEditing ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={exp.year || ''}
                                onChange={(e) => {
                                  const list = [...(data.experience || [])];
                                  list[idx] = { ...list[idx], year: e.target.value };
                                  updateAboutField((d) => ({ ...d, experience: list }));
                                }}
                                placeholder="年份"
                                className="w-24 p-1.5 text-xs bg-black text-white dark:bg-white dark:text-black font-bold rounded-md"
                              />
                              <input
                                type="text"
                                value={exp.location || ''}
                                onChange={(e) => {
                                  const list = [...(data.experience || [])];
                                  list[idx] = { ...list[idx], location: e.target.value };
                                  updateAboutField((d) => ({ ...d, experience: list }));
                                }}
                                placeholder="地点"
                                className="flex-1 p-1.5 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md"
                              />
                            </div>
                            <div className="flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => handleDeleteExperience(idx)}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-mono font-bold cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>删除卡片</span>
                              </button>
                            </div>
                            <input
                              type="text"
                              value={exp.role || ''}
                              onChange={(e) => {
                                const list = [...(data.experience || [])];
                                list[idx] = { ...list[idx], role: e.target.value };
                                updateAboutField((d) => ({ ...d, experience: list }));
                              }}
                              placeholder="职位 / 角色"
                              className="w-full p-1.5 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md font-sans font-bold"
                            />
                            <input
                              type="text"
                              value={exp.company || ''}
                              onChange={(e) => {
                                const list = [...(data.experience || [])];
                                list[idx] = { ...list[idx], company: e.target.value };
                                updateAboutField((d) => ({ ...d, experience: list }));
                              }}
                              placeholder="公司 / 工作室"
                              className="w-full p-1.5 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md font-mono"
                            />
                            <input
                              type="text"
                              value={exp.description || ''}
                              onChange={(e) => {
                                const list = [...(data.experience || [])];
                                list[idx] = { ...list[idx], description: e.target.value };
                                updateAboutField((d) => ({ ...d, experience: list }));
                              }}
                              placeholder="履历核心描述..."
                              className="sm:col-span-2 w-full p-1.5 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md font-sans"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="text-[10px] font-mono bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 self-start rounded-md font-bold">
                                {exp.year}
                              </span>
                              <span className="text-xs font-mono text-gray-400 dark:text-neutral-500">{exp.location}</span>
                            </div>
                            <h4 className="text-sm font-bold text-black dark:text-white font-sans">{exp.role}</h4>
                            <p className="text-xs font-mono text-gray-600 dark:text-neutral-400">{exp.company}</p>
                            <p className="text-xs text-gray-500 dark:text-neutral-400 font-sans">{exp.description}</p>
                          </>
                        )}
                      </div>
                    ))}

                    {isInPageEditing && (
                      <button
                        type="button"
                        onClick={handleAddExperience}
                        className="w-full p-2.5 border border-dashed border-gray-300 dark:border-neutral-700 hover:border-black dark:hover:border-white rounded-xl text-xs font-mono font-bold text-black dark:text-white flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>新增工作履历卡片</span>
                      </button>
                    )}
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
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
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
                    {(data.awards || []).map((award, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl gap-2"
                      >
                        {isInPageEditing ? (
                          <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                            <input
                              type="text"
                              value={award.year || ''}
                              onChange={(e) => {
                                const list = [...(data.awards || [])];
                                list[idx] = { ...list[idx], year: e.target.value };
                                updateAboutField((d) => ({ ...d, awards: list }));
                              }}
                              placeholder="年份"
                              className="w-20 p-1.5 bg-black text-white dark:bg-white dark:text-black font-bold rounded-md"
                            />
                            <input
                              type="text"
                              value={award.title || ''}
                              onChange={(e) => {
                                const list = [...(data.awards || [])];
                                list[idx] = { ...list[idx], title: e.target.value };
                                updateAboutField((d) => ({ ...d, awards: list }));
                              }}
                              placeholder="奖项 / 展览名称"
                              className="flex-1 p-1.5 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md font-sans font-bold"
                            />
                            <input
                              type="text"
                              value={award.category || ''}
                              onChange={(e) => {
                                const list = [...(data.awards || [])];
                                list[idx] = { ...list[idx], category: e.target.value };
                                updateAboutField((d) => ({ ...d, awards: list }));
                              }}
                              placeholder="类别"
                              className="w-28 p-1.5 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteAward(idx)}
                              className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-black dark:text-white">{award.year}</span>
                              <span className="text-gray-800 dark:text-neutral-200 font-sans font-medium">{award.title}</span>
                            </div>
                            <span className="text-gray-500 dark:text-neutral-400 text-[11px]">{award.category}</span>
                          </>
                        )}
                      </div>
                    ))}

                    {isInPageEditing && (
                      <button
                        type="button"
                        onClick={handleAddAward}
                        className="w-full p-2.5 border border-dashed border-gray-300 dark:border-neutral-700 hover:border-black dark:hover:border-white rounded-xl text-xs font-mono font-bold text-black dark:text-white flex items-center justify-center gap-1 cursor-pointer mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>新增获奖荣誉行</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* DYNAMIC CUSTOM SECTIONS / DIV 卡片 ("dvi/div 标记部分增加进编辑功能") */}
          {((data as any).customSections || []).map((cSec: any, cIdx: number) => {
            const secKey = `custom_${cSec.id || cIdx}`;
            const isOpen = openSections[secKey] !== false; // Default open

            return (
              <motion.div
                key={secKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 * cIdx }}
                className="border border-amber-300 dark:border-amber-800 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xs"
              >
                <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 bg-amber-50/20 dark:bg-amber-950/20">
                  <div className="flex items-center gap-3 flex-1 mr-2">
                    {isInPageEditing ? (
                      <input
                        type="text"
                        value={cSec.title || ''}
                        onChange={(e) => {
                          const list = [...((data as any).customSections || [])];
                          list[cIdx] = { ...list[cIdx], title: e.target.value };
                          updateAboutField((d) => ({ ...d, customSections: list }));
                        }}
                        placeholder="自定义 DIV 模块标题"
                        className="p-1.5 text-sm font-bold bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-700 rounded-lg text-black dark:text-white w-full max-w-md font-sans"
                      />
                    ) : (
                      <span className="text-sm sm:text-base font-bold text-black dark:text-white uppercase tracking-wide flex items-baseline gap-2">
                        <span>{String(7 + cIdx).padStart(2, '0')}. {cSec.title || '自定义 DIV 卡片'}</span>
                        <span className="text-[10px] font-mono font-normal text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                          CUSTOM DIV CARD
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isInPageEditing && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomSection(cIdx)}
                        className="px-2.5 py-1 text-xs font-mono text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 rounded-lg flex items-center gap-1 cursor-pointer"
                        title="删除整个 DIV 模块"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>删除模块</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleSection(secKey)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-black dark:text-white' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 sm:p-6 space-y-4 font-sans">
                        {(cSec.items || []).map((item: any, itemIdx: number) => (
                          <div
                            key={item.id || itemIdx}
                            className="p-4 bg-gray-50/80 dark:bg-neutral-950/80 border border-gray-200 dark:border-neutral-800 rounded-xl space-y-2 relative group"
                          >
                            {isInPageEditing ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <input
                                    type="text"
                                    value={item.mainTitle || ''}
                                    onChange={(e) => {
                                      const secList = [...((data as any).customSections || [])];
                                      const items = [...(secList[cIdx].items || [])];
                                      items[itemIdx] = { ...items[itemIdx], mainTitle: e.target.value };
                                      secList[cIdx] = { ...secList[cIdx], items };
                                      updateAboutField((d) => ({ ...d, customSections: secList }));
                                    }}
                                    placeholder="条目主标题"
                                    className="p-1.5 text-xs font-bold bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md text-black dark:text-white flex-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCustomItem(cIdx, itemIdx)}
                                    className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                                    title="删除此条目"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <textarea
                                  rows={3}
                                  value={item.content || ''}
                                  onChange={(e) => {
                                    const secList = [...((data as any).customSections || [])];
                                    const items = [...(secList[cIdx].items || [])];
                                    items[itemIdx] = { ...items[itemIdx], content: e.target.value };
                                    secList[cIdx] = { ...secList[cIdx], items };
                                    updateAboutField((d) => ({ ...d, customSections: secList }));
                                  }}
                                  placeholder="条目详细内容阐述..."
                                  className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md text-black dark:text-white font-sans"
                                />
                              </div>
                            ) : (
                              <>
                                {item.mainTitle && (
                                  <h4 className="text-sm font-bold text-black dark:text-white font-sans flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                                    <span>{item.mainTitle}</span>
                                  </h4>
                                )}
                                {item.content && (
                                  <p className="text-xs sm:text-sm text-gray-700 dark:text-neutral-300 leading-relaxed font-sans whitespace-pre-wrap pl-3 border-l-2 border-amber-400 dark:border-amber-600">
                                    {item.content}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        ))}

                        {isInPageEditing && (
                          <button
                            type="button"
                            onClick={() => handleAddCustomItem(cIdx)}
                            className="w-full p-2 border border-dashed border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl text-xs font-mono font-bold text-amber-900 dark:text-amber-200 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>新增条目内容</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

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
                          className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 px-4 text-xs font-mono font-bold tracking-widest uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all rounded-xl shadow-xs active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{language === 'zh' ? '发送在线留言 / SUBMIT MESSAGE' : 'SUBMIT MESSAGE'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCopyMyEmail}
                          className="px-4 py-3 bg-gray-100 dark:bg-neutral-800 text-black dark:text-white text-xs font-mono font-medium rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                          {language === 'zh' ? '留言成功！已实时保存与云端同步。' : 'MESSAGE SAVED! STORED & SYNCED LIVE ON CLOUD.'}
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

