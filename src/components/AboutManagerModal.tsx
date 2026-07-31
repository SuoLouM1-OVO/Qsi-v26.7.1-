import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  Award,
  Plus,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
  RotateCw,
  Tag,
  LayoutGrid,
  Sparkles,
  FileText
} from 'lucide-react';
import { Language, EducationItem, ExperienceItem, AwardItem, CustomSection } from '../types';
import { ABOUT_DATA } from '../data/portfolioData';

export type AboutData = typeof ABOUT_DATA & {
  enabledTabs?: string[];
  customSections?: CustomSection[];
};

interface AboutManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound: () => void;
  language?: Language;
  aboutData: AboutData;
  onSaveAboutData: (updated: AboutData) => void;
  onResetAboutData: () => void;
}

const DEFAULT_TAB_CONFIGS: { id: string; labelZh: string; labelEn: string; icon: any }[] = [
  { id: 'basic', labelZh: '基础与联系方式', labelEn: 'Basic & Contacts', icon: User },
  { id: 'education', labelZh: '教育背景卡片', labelEn: 'Education Cards', icon: GraduationCap },
  { id: 'experience', labelZh: '工作履历卡片', labelEn: 'Experience Cards', icon: Briefcase },
  { id: 'awards', labelZh: '获奖荣誉卡片', labelEn: 'Award Cards', icon: Award },
  { id: 'skills', labelZh: '技能标签', labelEn: 'Skill Tags', icon: Tag }
];

export const AboutManagerModal: React.FC<AboutManagerModalProps> = ({
  isOpen,
  onClose,
  playClickSound,
  language = 'zh',
  aboutData,
  onSaveAboutData,
  onResetAboutData
}) => {
  const [draft, setDraft] = useState<AboutData>(aboutData);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Undo & Redo History State
  const [history, setHistory] = useState<AboutData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Template Picker Modal
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);

  // Initialize draft and history when modal opens or aboutData changes
  useEffect(() => {
    if (isOpen) {
      const initialDraft: AboutData = {
        ...aboutData,
        enabledTabs: aboutData.enabledTabs || ['basic', 'education', 'experience', 'awards', 'skills'],
        customSections: aboutData.customSections || []
      };
      setDraft(initialDraft);
      setHistory([initialDraft]);
      setHistoryIndex(0);
      
      const firstAvailableTab = initialDraft.enabledTabs?.[0] || 'basic';
      setActiveTab(firstAvailableTab);
    }
  }, [isOpen, aboutData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Push new state to history for Undo/Redo
  const updateDraftWithHistory = (nextDraft: AboutData) => {
    const sliced = history.slice(0, historyIndex + 1);
    const newHist = [...sliced, nextDraft];
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
    setDraft(nextDraft);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      playClickSound();
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setDraft(prev);

      // Verify active tab is valid
      const enabled = prev.enabledTabs || ['basic', 'education', 'experience', 'awards', 'skills'];
      const customIds = (prev.customSections || []).map((c) => c.id);
      if (!enabled.includes(activeTab) && !customIds.includes(activeTab)) {
        setActiveTab(enabled[0] || 'basic');
      }
      showToast(language === 'zh' ? '已撤销修改' : 'Undone edit');
    } else if (history[0] && JSON.stringify(draft) !== JSON.stringify(history[0])) {
      playClickSound();
      setDraft(history[0]);
      showToast(language === 'zh' ? '已撤销修改，还原初始资料' : 'Reverted all edits');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      playClickSound();
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setDraft(next);

      const enabled = next.enabledTabs || ['basic', 'education', 'experience', 'awards', 'skills'];
      const customIds = (next.customSections || []).map((c) => c.id);
      if (!enabled.includes(activeTab) && !customIds.includes(activeTab)) {
        setActiveTab(enabled[0] || 'basic');
      }
    }
  };

  const handleSave = () => {
    playClickSound();
    onSaveAboutData(draft);
    showToast(language === 'zh' ? '资料修改成功，已实时同步至全站！' : 'Profile updated and synced live!');
    setTimeout(() => onClose(), 600);
  };

  const handleReset = () => {
    if (window.confirm(language === 'zh' ? '确定恢复为默认的齐思资料吗？' : 'Reset to default profile?')) {
      playClickSound();
      onResetAboutData();
      showToast(language === 'zh' ? '已重置为默认资料！' : 'Reset to default profile');
      setTimeout(() => onClose(), 600);
    }
  };

  // Delete Tab / Card Section
  const handleDeleteTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();

    const currentEnabled = draft.enabledTabs || ['basic', 'education', 'experience', 'awards', 'skills'];
    const nextEnabled = currentEnabled.filter((id) => id !== tabId);
    
    // Also check if it's a custom section
    const nextCustomSections = (draft.customSections || []).filter((s) => s.id !== tabId);

    const nextDraft: AboutData = {
      ...draft,
      enabledTabs: nextEnabled,
      customSections: nextCustomSections
    };

    updateDraftWithHistory(nextDraft);

    // If deleting active tab, switch active tab to another tab
    if (activeTab === tabId) {
      const remainingTabs = [
        ...nextEnabled,
        ...nextCustomSections.map((s) => s.id)
      ];
      setActiveTab(remainingTabs[0] || 'basic');
    }
  };

  // Add Card Template
  const handleSelectTemplate = (templateId: string) => {
    playClickSound();
    setShowTemplateModal(false);

    const currentEnabled = draft.enabledTabs || ['basic', 'education', 'experience', 'awards', 'skills'];

    if (templateId === 'custom') {
      // Add a new Custom Card
      const newSecId = `custom_${Date.now()}`;
      const newCustomSec: CustomSection = {
        id: newSecId,
        title: language === 'zh' ? '自定义新卡片' : 'Custom Card',
        items: [
          {
            id: `item_${Date.now()}`,
            mainTitle: language === 'zh' ? '项目/内容主标题' : 'Main Title',
            content: language === 'zh' ? '在此输入详细说明与文字内容...' : 'Text content...'
          }
        ]
      };

      const nextDraft: AboutData = {
        ...draft,
        customSections: [...(draft.customSections || []), newCustomSec]
      };

      updateDraftWithHistory(nextDraft);
      setActiveTab(newSecId);
      showToast(language === 'zh' ? '已新增自定义卡片' : 'Added custom card');
    } else {
      // Preset template re-addition
      if (!currentEnabled.includes(templateId)) {
        const nextDraft: AboutData = {
          ...draft,
          enabledTabs: [...currentEnabled, templateId]
        };
        updateDraftWithHistory(nextDraft);
      }
      setActiveTab(templateId);
      showToast(language === 'zh' ? '已添加卡片' : 'Added card');
    }
  };

  // Custom Item Handlers
  const handleAddCustomItem = (customSecId: string) => {
    playClickSound();
    const updatedCustoms = (draft.customSections || []).map((sec) => {
      if (sec.id === customSecId) {
        const newItem = {
          id: `item_${Date.now()}`,
          mainTitle: '',
          content: ''
        };
        return {
          ...sec,
          items: [...sec.items, newItem]
        };
      }
      return sec;
    });

    const nextDraft = {
      ...draft,
      customSections: updatedCustoms
    };
    updateDraftWithHistory(nextDraft);
  };

  const handleUpdateCustomSecTitle = (customSecId: string, newTitle: string) => {
    const updatedCustoms = (draft.customSections || []).map((sec) => {
      if (sec.id === customSecId) {
        return { ...sec, title: newTitle };
      }
      return sec;
    });
    setDraft({ ...draft, customSections: updatedCustoms });
  };

  const handleUpdateCustomItem = (
    customSecId: string,
    itemId: string,
    field: 'mainTitle' | 'content',
    val: string
  ) => {
    const updatedCustoms = (draft.customSections || []).map((sec) => {
      if (sec.id === customSecId) {
        const updatedItems = sec.items.map((it) => {
          if (it.id === itemId) {
            return { ...it, [field]: val };
          }
          return it;
        });
        return { ...sec, items: updatedItems };
      }
      return sec;
    });
    setDraft({ ...draft, customSections: updatedCustoms });
  };

  const handleDeleteCustomItem = (customSecId: string, itemId: string) => {
    playClickSound();
    const updatedCustoms = (draft.customSections || []).map((sec) => {
      if (sec.id === customSecId) {
        return {
          ...sec,
          items: sec.items.filter((it) => it.id !== itemId)
        };
      }
      return sec;
    });

    const nextDraft = {
      ...draft,
      customSections: updatedCustoms
    };
    updateDraftWithHistory(nextDraft);
  };

  if (!isOpen) return null;

  // Active sub-tabs list
  const activePresetTabs = DEFAULT_TAB_CONFIGS.filter((tab) =>
    (draft.enabledTabs || ['basic', 'education', 'experience', 'awards', 'skills']).includes(tab.id)
  );

  const activeCustomTabs = (draft.customSections || []).map((sec) => ({
    id: sec.id,
    labelZh: sec.title || '自定义卡片',
    labelEn: sec.title || 'Custom Card',
    icon: FileText,
    isCustom: true
  }));

  const allActiveSubTabs = [...activePresetTabs, ...activeCustomTabs];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-black dark:text-white"
        >
          {/* Toast Notice */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[170] px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-mono rounded-full shadow-lg flex items-center gap-2 pointer-events-none font-bold"
              >
                <Check className="w-3.5 h-3.5 text-green-400 dark:text-green-600" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-900/80">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-black text-white dark:bg-white dark:text-black shadow-2xs">
                <Edit3 className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-sans">
                  {language === 'zh' ? '管理与编辑“关于齐思”资料' : 'Edit "About QSi" Profile'}
                </h2>
                <p className="text-xs font-mono text-gray-400">
                  {language === 'zh' ? '自定义个人履历、联系方式、教育背景与扩展卡片' : 'Customize personal bio, contacts, cards & history'}
                </p>
              </div>
            </div>

            {/* Action Bar: Undo, Redo, Reset, Close */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Undo Button */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0 && (!history[0] || JSON.stringify(draft) === JSON.stringify(history[0]))}
                className="px-2.5 py-1.5 text-xs font-mono text-gray-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                title={language === 'zh' ? '撤销修改 (Undo)' : 'Undo'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'zh' ? '撤销修改' : 'Undo'}</span>
              </button>

              {/* Redo Button */}
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="px-2.5 py-1.5 text-xs font-mono text-gray-700 dark:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                title={language === 'zh' ? '恢复 (Redo)' : 'Redo'}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'zh' ? '恢复' : 'Redo'}</span>
              </button>

              {/* Reset Default */}
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 text-xs font-mono text-gray-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
                title={language === 'zh' ? '恢复默认资料' : 'Reset to default'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{language === 'zh' ? '恢复默认' : 'Reset'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs Bar with Delete '×' Badges & Add Card Button */}
          <div className="relative flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-x-auto text-xs font-mono">
            {allActiveSubTabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div key={tab.id} className="relative group shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveTab(tab.id);
                    }}
                    className={`pr-7 pl-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer relative ${
                      isActive
                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-2xs'
                        : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? tab.labelZh : tab.labelEn}</span>
                  </button>

                  {/* Top-Right Small '×' Delete Button on Card Tab */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteTab(tab.id, e)}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                    title={language === 'zh' ? '删除该卡片分类' : 'Delete Card'}
                  >
                    ×
                  </button>
                </div>
              );
            })}

            {/* Classification Tab End: "Add Card (+ 增加卡片)" Button */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setShowTemplateModal(true);
              }}
              className="px-3 py-1.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white flex items-center gap-1.5 shrink-0 transition-all cursor-pointer font-bold hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              <Plus className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>{language === 'zh' ? '增加卡片' : 'Add Card'}</span>
            </button>
          </div>

          {/* Form Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* TAB 1: BASIC INFO */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                      {language === 'zh' ? '姓名 / Studio Name' : 'Name'}
                    </label>
                    <input
                      type="text"
                      value={draft.name || ''}
                      onChange={(e) => updateDraftWithHistory({ ...draft, name: e.target.value })}
                      className="w-full p-2.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                      {language === 'zh' ? '英文名称' : 'English Name'}
                    </label>
                    <input
                      type="text"
                      value={draft.englishName || ''}
                      onChange={(e) => updateDraftWithHistory({ ...draft, englishName: e.target.value })}
                      className="w-full p-2.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                      {language === 'zh' ? '头衔 / 职位 (中文)' : 'Title (ZH)'}
                    </label>
                    <input
                      type="text"
                      value={draft.title || ''}
                      onChange={(e) => updateDraftWithHistory({ ...draft, title: e.target.value })}
                      className="w-full p-2.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                      {language === 'zh' ? '头衔 / 职位 (英文)' : 'Title (EN)'}
                    </label>
                    <input
                      type="text"
                      value={draft.englishTitle || ''}
                      onChange={(e) => updateDraftWithHistory({ ...draft, englishTitle: e.target.value })}
                      className="w-full p-2.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                      {language === 'zh' ? '工作地点' : 'Location'}
                    </label>
                    <input
                      type="text"
                      value={draft.location || ''}
                      onChange={(e) => updateDraftWithHistory({ ...draft, location: e.target.value })}
                      className="w-full p-2.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                      {language === 'zh' ? '电子邮箱' : 'Email'}
                    </label>
                    <input
                      type="email"
                      value={draft.email || ''}
                      onChange={(e) => updateDraftWithHistory({ ...draft, email: e.target.value })}
                      className="w-full p-2.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                      {language === 'zh' ? '联系电话' : 'Phone'}
                    </label>
                    <input
                      type="text"
                      value={draft.phone || ''}
                      onChange={(e) => updateDraftWithHistory({ ...draft, phone: e.target.value })}
                      className="w-full p-2.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                      {language === 'zh' ? '微信 (WeChat)' : 'WeChat'}
                    </label>
                    <input
                      type="text"
                      value={draft.wechat || ''}
                      onChange={(e) => updateDraftWithHistory({ ...draft, wechat: e.target.value })}
                      className="w-full p-2.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                      {language === 'zh' ? 'QQ 号码' : 'QQ Number'}
                    </label>
                    <input
                      type="text"
                      value={draft.qq || ''}
                      onChange={(e) => updateDraftWithHistory({ ...draft, qq: e.target.value })}
                      className="w-full p-2.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                      {language === 'zh' ? '小红书社交账号' : 'Xiaohongshu'}
                    </label>
                    <input
                      type="text"
                      value={draft.social?.xiaohongshu || ''}
                      onChange={(e) =>
                        updateDraftWithHistory({
                          ...draft,
                          social: { ...(draft.social || {}), xiaohongshu: e.target.value }
                        })
                      }
                      className="w-full p-2.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    {language === 'zh' ? '齐思理念 / 宣言描述 (Manifesto)' : 'Manifesto Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={Array.isArray(draft.manifesto) ? draft.manifesto.join('\n') : (draft.manifesto || '')}
                    onChange={(e) =>
                      updateDraftWithHistory({
                        ...draft,
                        manifesto: e.target.value.split('\n')
                      })
                    }
                    className="w-full p-2.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans leading-relaxed"
                    placeholder="每行一条理念宣言..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                    {language === 'zh' ? '个人/工作室详细介绍 (Bio)' : 'Detailed Bio'}
                  </label>
                  <textarea
                    rows={3}
                    value={draft.bio || ''}
                    onChange={(e) => updateDraftWithHistory({ ...draft, bio: e.target.value })}
                    className="w-full p-2.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: EDUCATION CARDS */}
            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-gray-500 uppercase">
                    {language === 'zh' ? '教育背景卡片列表' : 'Education List'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      const newItem: EducationItem = {
                        year: '2022 - 2026',
                        degree: '设计学 学士',
                        school: '艺术设计学院',
                        location: 'China',
                        description: '主修品牌设计与视觉传达。'
                      };
                      updateDraftWithHistory({
                        ...draft,
                        education: [newItem, ...(draft.education || [])]
                      });
                    }}
                    className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-mono font-bold flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '新增教育卡片' : 'Add Education'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(draft.education || []).map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-gray-400">Card #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            const next = (draft.education || []).filter((_, i) => i !== idx);
                            updateDraftWithHistory({ ...draft, education: next });
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                          title="删除卡片"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = [...(draft.education || [])];
                            updated[idx] = { ...updated[idx], year: e.target.value };
                            setDraft({ ...draft, education: updated });
                          }}
                          placeholder="年份范围 (如 2016-2020)"
                          className="p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                        />
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => {
                            const updated = [...(draft.education || [])];
                            updated[idx] = { ...updated[idx], school: e.target.value };
                            setDraft({ ...draft, education: updated });
                          }}
                          placeholder="学校名称"
                          className="p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...(draft.education || [])];
                            updated[idx] = { ...updated[idx], degree: e.target.value };
                            setDraft({ ...draft, education: updated });
                          }}
                          placeholder="学位/专业名称"
                          className="p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                        />
                        <input
                          type="text"
                          value={edu.location || ''}
                          onChange={(e) => {
                            const updated = [...(draft.education || [])];
                            updated[idx] = { ...updated[idx], location: e.target.value };
                            setDraft({ ...draft, education: updated });
                          }}
                          placeholder="城市/地区"
                          className="p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={edu.description || ''}
                        onChange={(e) => {
                          const updated = [...(draft.education || [])];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setDraft({ ...draft, education: updated });
                        }}
                        placeholder="详细描述/获奖情况..."
                        className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: EXPERIENCE CARDS */}
            {activeTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-gray-500 uppercase">
                    {language === 'zh' ? '工作履历卡片列表' : 'Experience List'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      const newItem: ExperienceItem = {
                        year: '2024 - Present',
                        role: '设计总监',
                        company: '齐思设计工作室',
                        location: 'Shanghai',
                        description: '负责品牌视觉构建与艺术导向。',
                        highlights: ['完成多个品牌视觉升级']
                      };
                      updateDraftWithHistory({
                        ...draft,
                        experience: [newItem, ...(draft.experience || [])]
                      });
                    }}
                    className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-mono font-bold flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '新增履历卡片' : 'Add Experience'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(draft.experience || []).map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-gray-400">Card #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            const next = (draft.experience || []).filter((_, i) => i !== idx);
                            updateDraftWithHistory({ ...draft, experience: next });
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                          title="删除卡片"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={exp.year}
                          onChange={(e) => {
                            const updated = [...(draft.experience || [])];
                            updated[idx] = { ...updated[idx], year: e.target.value };
                            setDraft({ ...draft, experience: updated });
                          }}
                          placeholder="年份范围 (如 2023 - Present)"
                          className="p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...(draft.experience || [])];
                            updated[idx] = { ...updated[idx], company: e.target.value };
                            setDraft({ ...draft, experience: updated });
                          }}
                          placeholder="公司/机构名称"
                          className="p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = [...(draft.experience || [])];
                            updated[idx] = { ...updated[idx], role: e.target.value };
                            setDraft({ ...draft, experience: updated });
                          }}
                          placeholder="职位/角色"
                          className="p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                        />
                        <input
                          type="text"
                          value={exp.location || ''}
                          onChange={(e) => {
                            const updated = [...(draft.experience || [])];
                            updated[idx] = { ...updated[idx], location: e.target.value };
                            setDraft({ ...draft, experience: updated });
                          }}
                          placeholder="工作地点"
                          className="p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={exp.description || ''}
                        onChange={(e) => {
                          const updated = [...(draft.experience || [])];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setDraft({ ...draft, experience: updated });
                        }}
                        placeholder="工作职责与内容..."
                        className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                      />

                      <input
                        type="text"
                        value={(exp.highlights || []).join('; ')}
                        onChange={(e) => {
                          const updated = [...(draft.experience || [])];
                          const list = e.target.value.split(';').map((s) => s.trim()).filter(Boolean);
                          updated[idx] = { ...updated[idx], highlights: list };
                          setDraft({ ...draft, experience: updated });
                        }}
                        placeholder="核心亮点成果 (用分号 ; 分隔)"
                        className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: AWARDS CARDS */}
            {activeTab === 'awards' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-gray-500 uppercase">
                    {language === 'zh' ? '获奖荣誉卡片列表' : 'Award List'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      const newItem: AwardItem = {
                        year: '2026',
                        title: '新锐设计奖',
                        organization: '设计艺术协会',
                        category: '金奖'
                      };
                      updateDraftWithHistory({
                        ...draft,
                        awards: [newItem, ...(draft.awards || [])]
                      });
                    }}
                    className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-mono font-bold flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '新增获奖卡片' : 'Add Award'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(draft.awards || []).map((award, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-gray-400">Card #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            const next = (draft.awards || []).filter((_, i) => i !== idx);
                            updateDraftWithHistory({ ...draft, awards: next });
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                          title="删除卡片"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={award.year}
                          onChange={(e) => {
                            const updated = [...(draft.awards || [])];
                            updated[idx] = { ...updated[idx], year: e.target.value };
                            setDraft({ ...draft, awards: updated });
                          }}
                          placeholder="年份 (如 2026)"
                          className="p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                        />
                        <input
                          type="text"
                          value={award.title}
                          onChange={(e) => {
                            const updated = [...(draft.awards || [])];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setDraft({ ...draft, awards: updated });
                          }}
                          placeholder="奖项名称"
                          className="p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={award.organization}
                          onChange={(e) => {
                            const updated = [...(draft.awards || [])];
                            updated[idx] = { ...updated[idx], organization: e.target.value };
                            setDraft({ ...draft, awards: updated });
                          }}
                          placeholder="颁发机构"
                          className="p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                        />
                        <input
                          type="text"
                          value={award.category || ''}
                          onChange={(e) => {
                            const updated = [...(draft.awards || [])];
                            updated[idx] = { ...updated[idx], category: e.target.value };
                            setDraft({ ...draft, awards: updated });
                          }}
                          placeholder="奖项类别/级别"
                          className="p-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: SKILL TAGS */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-gray-500 uppercase">
                    {language === 'zh' ? '技能与领域标签' : 'Skill Tags'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      const newTag = prompt(language === 'zh' ? '请输入新技能名称:' : 'Enter new skill tag name:');
                      if (newTag && newTag.trim()) {
                        const updated = [...(draft.skillTags || []), { name: newTag.trim(), category: 'domain' }];
                        updateDraftWithHistory({ ...draft, skillTags: updated });
                      }
                    }}
                    className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-mono font-bold flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '新增技能' : 'Add Skill'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40">
                  {(draft.skillTags || []).map((st, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-xs font-mono flex items-center gap-1.5 group"
                    >
                      <span>{st.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          const updated = (draft.skillTags || []).filter((_, i) => i !== idx);
                          updateDraftWithHistory({ ...draft, skillTags: updated });
                        }}
                        className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CUSTOM CARDS: Dynamic Custom Card Editor */}
            {activeTab.startsWith('custom_') && (
              (() => {
                const customSec = (draft.customSections || []).find((s) => s.id === activeTab);
                if (!customSec) return null;

                return (
                  <div className="space-y-5">
                    {/* Card Title Header */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200 dark:border-neutral-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono font-bold text-gray-700 dark:text-neutral-300">
                          {language === 'zh' ? '自定义卡片大标题 (卡片名称)' : 'Custom Card Title'}
                        </label>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTab(customSec.id, e)}
                          className="text-xs font-mono text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'zh' ? '删除本整张卡片' : 'Delete Card'}</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        value={customSec.title}
                        onChange={(e) => handleUpdateCustomSecTitle(customSec.id, e.target.value)}
                        placeholder={language === 'zh' ? '请输入卡片名称 (如：项目成果 / 客户评语 / 展演信息)...' : 'Card Title...'}
                        className="w-full p-2.5 text-sm font-bold bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                      />
                    </div>

                    {/* Custom Content Items */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                        {language === 'zh' ? '卡片内部文字内容模块' : 'Card Content Blocks'}
                      </h4>

                      {customSec.items.map((item, itemIdx) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs space-y-3 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-gray-400">
                              Block #{itemIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomItem(customSec.id, item.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="删除此块"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Main Title Input */}
                          <div>
                            <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                              {language === 'zh' ? '主标题 (自定义输入)' : 'Main Title'}
                            </label>
                            <input
                              type="text"
                              value={item.mainTitle}
                              onChange={(e) =>
                                handleUpdateCustomItem(customSec.id, item.id, 'mainTitle', e.target.value)
                              }
                              placeholder={language === 'zh' ? '输入主标题 (如：2026年艺术季巡展 / 核心设计理念)...' : 'Enter Main Title...'}
                              className="w-full p-2.5 text-xs font-bold bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                            />
                          </div>

                          {/* Text Content Box directly below Main Title */}
                          <div>
                            <label className="block text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 mb-1">
                              {language === 'zh' ? '文字输入内容 (方框内为文字内容)' : 'Text Content'}
                            </label>
                            <textarea
                              rows={3}
                              value={item.content}
                              onChange={(e) =>
                                handleUpdateCustomItem(customSec.id, item.id, 'content', e.target.value)
                              }
                              placeholder={language === 'zh' ? '在此处方框内输入详细说明与文字内容...' : 'Enter text content here...'}
                              className="w-full p-2.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}

                      {/* Full-width '+' Plus Button directly below the text content box / last block */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleAddCustomItem(customSec.id)}
                          className="w-full py-3 px-4 bg-gray-100 hover:bg-black hover:text-white dark:bg-neutral-800 dark:hover:bg-white dark:hover:text-black border-2 border-dashed border-gray-300 dark:border-neutral-700 hover:border-black dark:hover:border-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group"
                        >
                          <Plus className="w-4 h-4 transition-transform group-hover:scale-125 text-black dark:text-white group-hover:text-white dark:group-hover:text-black" />
                          <span>
                            {language === 'zh'
                              ? '点击增加一条主标题和文字内容 (加号会自动下移)'
                              : 'Add Main Title & Content Group (+ moves below)'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="px-5 py-4 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-900/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-gray-400">
              {language === 'zh' ? '修改将立即同步保存至全站' : 'Changes sync live across website'}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-mono text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 text-xs font-mono font-bold bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 transition-opacity shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'zh' ? '保存资料并全站生效' : 'Save Profile'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Template Picker Overlay Modal */}
        <AnimatePresence>
          {showTemplateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[180] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setShowTemplateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-black dark:text-white" />
                    <h3 className="text-sm font-bold font-sans">
                      {language === 'zh' ? '选择卡片类型 / 模板' : 'Select Card Template'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    className="p-1 text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
                  {/* Preset Card Templates */}
                  {DEFAULT_TAB_CONFIGS.map((tpl) => {
                    const TplIcon = tpl.icon;
                    const isAlreadyEnabled = (draft.enabledTabs || []).includes(tpl.id);

                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl.id)}
                        className="p-3 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-black dark:hover:border-white bg-gray-50/60 dark:bg-neutral-800/40 hover:bg-white dark:hover:bg-neutral-800 flex items-center justify-between transition-all text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded-lg bg-black/5 dark:bg-white/10 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                            <TplIcon className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="text-xs font-bold text-black dark:text-white">
                              {language === 'zh' ? tpl.labelZh : tpl.labelEn}
                            </p>
                            <p className="text-[10px] font-mono text-gray-400">
                              {isAlreadyEnabled
                                ? language === 'zh'
                                  ? '切换至该预设卡片'
                                  : 'Switch to template'
                                : language === 'zh'
                                ? '恢复并显示该卡片'
                                : 'Restore and display card'}
                            </p>
                          </div>
                        </div>

                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-black dark:group-hover:text-white" />
                      </button>
                    );
                  })}

                  {/* Custom Card Option */}
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('custom')}
                    className="p-3.5 rounded-xl border-2 border-dashed border-black/30 dark:border-white/30 hover:border-black dark:hover:border-white bg-black/5 dark:bg-white/5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-between transition-all text-left cursor-pointer group mt-1"
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold tracking-wide uppercase">
                          {language === 'zh' ? '+ 全新自定义卡片' : '+ Custom Card'}
                        </p>
                        <p className="text-[10px] font-mono text-gray-500 group-hover:text-gray-200 dark:group-hover:text-gray-700">
                          {language === 'zh'
                            ? '自定义主标题与大文本框模块'
                            : 'Custom main titles & content boxes'}
                        </p>
                      </div>
                    </div>

                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
