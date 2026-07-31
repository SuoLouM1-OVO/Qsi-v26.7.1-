import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Edit3,
  Trash2,
  Code,
  RotateCcw,
  Check,
  Copy,
  AlertCircle,
  Image as ImageIcon,
  Undo,
  Eye,
  Save,
  Upload,
  Zap
} from 'lucide-react';
import { Project, WorkCategory, Language } from '../types';
import { ColorPaletteEditor } from './ColorPaletteEditor';
import { compressImageFile, formatFileSize } from '../utils/imageCompressor';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSaveProjects: (newProjects: Project[]) => void;
  onResetProjects: () => void;
  playClickSound: () => void;
  language?: Language;
  initialEditProject?: Project | null;
  onSelectProject?: (project: Project) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  onSaveProjects,
  onResetProjects,
  playClickSound,
  language = 'zh',
  initialEditProject = null,
  onSelectProject
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'edit' | 'json'>('list');
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [compressNotice, setCompressNotice] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFormDeleteConfirm, setShowFormDeleteConfirm] = useState(false);

  // Draft projects session state
  const [draftProjects, setDraftProjects] = useState<Project[]>(projects);
  const initialSessionRef = useRef<Project[]>(projects);
  const [historyStack, setHistoryStack] = useState<Project[][]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const initialEditFormRef = useRef<Partial<Project> | null>(null);

  // Reset session draft when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftProjects(projects);
      initialSessionRef.current = [...projects];
      setHistoryStack([]);
      setShowExitConfirm(false);
      setShowFormDeleteConfirm(false);
    }
  }, [isOpen, projects]);

  useEffect(() => {
    if (initialEditProject) {
      initialEditFormRef.current = JSON.parse(JSON.stringify(initialEditProject));
      setEditingProject(initialEditProject);
      setActiveTab('edit');
    }
  }, [initialEditProject]);

  useEffect(() => {
    if (editingProject && activeTab === 'edit') {
      if (!initialEditFormRef.current || initialEditFormRef.current.id !== editingProject.id) {
        initialEditFormRef.current = JSON.parse(JSON.stringify(editingProject));
      }
    } else if (activeTab !== 'edit') {
      initialEditFormRef.current = null;
      setShowFormDeleteConfirm(false);
    }
  }, [editingProject, activeTab]);

  useEffect(() => {
    if (activeTab === 'json') {
      setJsonText(JSON.stringify(draftProjects, null, 2));
      setJsonError(null);
    }
  }, [activeTab, draftProjects]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!isOpen) return null;

  // Push previous draft onto undo history stack
  const pushToDraft = (newDraft: Project[]) => {
    setHistoryStack((prev) => [...prev, draftProjects]);
    setDraftProjects(newDraft);
  };

  // 1. Undo last step
  const handleUndoStep = () => {
    playClickSound();
    if (
      activeTab === 'edit' &&
      editingProject &&
      initialEditFormRef.current &&
      JSON.stringify(editingProject) !== JSON.stringify(initialEditFormRef.current)
    ) {
      setEditingProject(JSON.parse(JSON.stringify(initialEditFormRef.current)));
      showToast(language === 'zh' ? '已撤销当前作品编辑，还原初始信息' : 'Form edits undone');
      return;
    }
    if (historyStack.length === 0) return;
    const previousState = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setDraftProjects(previousState);
    showToast(language === 'zh' ? '已撤回上一步操作' : 'Undone last step');
  };

  // 2. Revert to state before editing session
  const handleRevertSession = () => {
    playClickSound();
    pushToDraft([...initialSessionRef.current]);
    showToast(language === 'zh' ? '已恢复打开编辑前的所有作品状态' : 'Reverted to state before editing');
  };

  // 3. Save all draft modifications explicitly to website
  const handleExplicitSave = () => {
    playClickSound();
    onSaveProjects(draftProjects);
    initialSessionRef.current = [...draftProjects];
    showToast(language === 'zh' ? '已成功保存修改并同步至网页！' : 'Changes saved and applied!');
  };

  // 4. Request close with unsaved check
  const isModified = JSON.stringify(draftProjects) !== JSON.stringify(initialSessionRef.current);

  const handleRequestClose = () => {
    playClickSound();
    if (isModified) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmSaveAndExit = () => {
    playClickSound();
    onSaveProjects(draftProjects);
    setShowExitConfirm(false);
    onClose();
  };

  const handleDiscardAndExit = () => {
    playClickSound();
    setShowExitConfirm(false);
    onClose();
  };

  const handleStartNew = () => {
    playClickSound();
    const newId = `project-${Date.now()}`;
    const nextIndex = `${String(draftProjects.length + 1).padStart(2, '0')}/${String(draftProjects.length + 1).padStart(2, '0')}`;
    setEditingProject({
      id: newId,
      cardNumber: 'A♠',
      suit: 'spade',
      title: '',
      subtitle: '',
      category: 'branding',
      categoryLabel: 'BRANDING',
      year: new Date().getFullYear().toString(),
      index: nextIndex,
      client: 'QSi Client',
      coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80'
      ],
      summary: '',
      description: [''],
      tags: ['品牌设计', '平面视觉'],
      colorPalette: ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#e4e4e7'],
      featured: true,
      likes: 12
    });
    setActiveTab('edit');
  };

  const handleEditClick = (project: Project) => {
    playClickSound();
    setEditingProject({ ...project });
    setActiveTab('edit');
  };

  const handleDeleteCard = (id: string) => {
    playClickSound();
    const updated = draftProjects.filter((p) => p.id !== id);
    pushToDraft(updated);
    initialSessionRef.current = [...updated];
    setDeletingId(null);
    onSaveProjects(updated);
    showToast(language === 'zh' ? '作品已成功删除并同步至网页！' : 'Project deleted and synced!');
  };

  const handleConfirmDeleteFromForm = () => {
    if (!editingProject || !editingProject.id) return;
    playClickSound();
    const targetId = editingProject.id;
    const updated = draftProjects.filter((p) => p.id !== targetId);
    pushToDraft(updated);
    initialSessionRef.current = [...updated];
    onSaveProjects(updated);
    showToast(language === 'zh' ? '作品已删除，并返回管理列表' : 'Project deleted and returned to list!');
    setEditingProject(null);
    setShowFormDeleteConfirm(false);
    setActiveTab('list'); // Switch directly back to project list view!
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.title) {
      alert(language === 'zh' ? '请填写作品标题' : 'Please provide a project title');
      return;
    }

    playClickSound();
    const fullProject: Project = {
      id: editingProject.id || `proj-${Date.now()}`,
      cardNumber: editingProject.cardNumber || 'A♠',
      suit: editingProject.suit || 'spade',
      title: editingProject.title || 'Untitled',
      subtitle: editingProject.subtitle || 'SUBTITLE',
      category: (editingProject.category as WorkCategory) || 'branding',
      categoryLabel: editingProject.categoryLabel || `${(editingProject.category || 'BRANDING').toUpperCase()}`,
      year: editingProject.year || `${new Date().getFullYear()}`,
      index: editingProject.index || `01/${draftProjects.length || 1}`,
      client: editingProject.client || 'QSi Client',
      coverImage: editingProject.coverImage || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      galleryImages: editingProject.galleryImages && editingProject.galleryImages.length > 0
        ? editingProject.galleryImages
        : [editingProject.coverImage || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80'],
      summary: editingProject.summary || '',
      description: editingProject.description && editingProject.description.length > 0
        ? editingProject.description
        : ['作品详细介绍。'],
      tags: editingProject.tags && editingProject.tags.length > 0 ? editingProject.tags : ['平面设计'],
      colorPalette: editingProject.colorPalette && editingProject.colorPalette.length > 0
        ? editingProject.colorPalette
        : ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#e4e4e7'],
      featured: editingProject.featured ?? true,
      likes: editingProject.likes ?? 12
    };

    const existsIndex = draftProjects.findIndex((p) => p.id === fullProject.id);
    let updated: Project[];
    if (existsIndex >= 0) {
      updated = [...draftProjects];
      updated[existsIndex] = fullProject;
    } else {
      updated = [fullProject, ...draftProjects];
    }

    pushToDraft(updated);
    onSaveProjects(updated);
    showToast(language === 'zh' ? '作品已更新并保存至作品列表！' : 'Project draft saved!');
    setEditingProject(null);
    setActiveTab('list');
  };

  const handleApplyJson = () => {
    playClickSound();
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setJsonError(language === 'zh' ? 'JSON 格式错误：必须是作品数组 Project[]' : 'JSON must be an array of projects');
        return;
      }
      pushToDraft(parsed);
      onSaveProjects(parsed);
      setJsonError(null);
      showToast(language === 'zh' ? '已通过 JSON 批量替换所有作品并同步至网页！' : 'Batch updated all projects via JSON!');
      setActiveTab('list');
    } catch (err: any) {
      setJsonError(err?.message || 'Invalid JSON syntax');
    }
  };

  const handleCopyJson = () => {
    playClickSound();
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-black dark:text-white"
        >
          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[160] px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-mono rounded-full shadow-lg flex items-center gap-2 pointer-events-none"
              >
                <Check className="w-3.5 h-3.5 text-green-400 dark:text-green-600" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Header Bar with Icon-only Controls */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-black dark:text-white">
                <Edit3 className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-sans">
                  {language === 'zh' ? '作品集替换与管理' : 'Manage & Replace Projects'}
                </h2>
                <p className="text-xs font-mono text-gray-500 dark:text-neutral-400 flex items-center gap-2">
                  <span>{language === 'zh' ? `共 ${draftProjects.length} 个作品` : `${draftProjects.length} projects`}</span>
                  {isModified && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded">
                      {language === 'zh' ? '有未保存修改' : 'Unsaved edits'}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* HEADER ICON-ONLY BUTTONS (撤回、恢复编辑前、保存生效、关闭) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Undo Button */}
              <button
                type="button"
                disabled={
                  activeTab === 'edit'
                    ? (!initialEditFormRef.current || JSON.stringify(editingProject) === JSON.stringify(initialEditFormRef.current))
                    : historyStack.length === 0
                }
                onClick={handleUndoStep}
                className={`p-2 rounded-lg transition-all flex items-center justify-center shrink-0 ${
                  (activeTab === 'edit'
                    ? (initialEditFormRef.current && JSON.stringify(editingProject) !== JSON.stringify(initialEditFormRef.current))
                    : historyStack.length > 0)
                    ? 'text-gray-700 dark:text-neutral-200 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 cursor-pointer active:scale-95'
                    : 'text-gray-300 dark:text-neutral-700 bg-gray-50 dark:bg-neutral-900 cursor-not-allowed opacity-50'
                }`}
                title={
                  language === 'zh'
                    ? (activeTab === 'edit' ? '撤销当前修改 (Undo)' : `撤回一步 (${historyStack.length})`)
                    : 'Undo'
                }
              >
                <Undo className="w-4 h-4" />
              </button>

              {/* Revert Session Button */}
              <button
                type="button"
                onClick={handleRevertSession}
                className="p-2 rounded-lg text-gray-700 dark:text-neutral-200 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
                title={language === 'zh' ? '恢复编辑前状态' : 'Revert to state before editing'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Explicit Save Button */}
              <button
                type="button"
                onClick={handleExplicitSave}
                className={`p-2 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-95 ${
                  isModified
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
                title={language === 'zh' ? '保存修改并同步至网页' : 'Save and apply changes to website'}
              >
                <Check className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-gray-200 dark:bg-neutral-800 mx-1" />

              {/* Close Button */}
              <button
                type="button"
                onClick={handleRequestClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                title={language === 'zh' ? '退出管理' : 'Close Manager'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Navigation Tabs */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('list');
                }}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                    : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{language === 'zh' ? '作品列表' : 'Project List'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 dark:bg-black/20">
                  {draftProjects.length}
                </span>
              </button>

              <button
                onClick={handleStartNew}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                    : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingProject ? (language === 'zh' ? '编辑中' : 'Editing') : (language === 'zh' ? '新增作品' : 'Add Project')}</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('json');
                }}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'json'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                    : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>{language === 'zh' ? 'JSON 批量编辑' : 'JSON Batch Edit'}</span>
              </button>
            </div>
          </div>

          {/* Modal Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* TAB 1: PROJECT LIST */}
            {activeTab === 'list' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-neutral-400 font-sans">
                    {language === 'zh'
                      ? '点击作品项可直接查看详情；亦可随时编辑或删除作品。'
                      : 'Click any project to view details, or use controls to edit or remove.'}
                  </p>
                  <button
                    onClick={handleStartNew}
                    className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black text-xs font-mono font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '添加作品' : 'Add Project'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {draftProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="group p-3 border border-gray-200 dark:border-neutral-800 rounded-xl bg-gray-50/50 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-800/80 transition-all flex items-center justify-between gap-3 relative"
                    >
                      {/* Clickable Card Area: opens project detail */}
                      <div
                        onClick={() => {
                          playClickSound();
                          if (onSelectProject) {
                            onSelectProject(proj);
                          }
                        }}
                        className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer"
                        title={language === 'zh' ? '点击查看作品详情' : 'Click to view project details'}
                      >
                        <img
                          src={proj.coverImage}
                          alt={proj.title}
                          className="w-14 h-14 object-cover rounded-lg border border-gray-200 dark:border-neutral-700 shrink-0 group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold text-black dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {proj.title}
                          </h4>
                          <p className="text-xs font-mono text-gray-500 dark:text-neutral-400 truncate">
                            {proj.categoryLabel || proj.category} • {proj.year}
                          </p>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {proj.tags?.slice(0, 3).map((t, i) => (
                              <span key={i} className="text-[10px] font-mono px-1.5 py-0.2 bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Item Action Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        {deletingId === proj.id ? (
                          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/50 p-1 rounded-lg border border-red-200 dark:border-red-800 animate-fadeIn">
                            <span className="text-[10px] text-red-600 dark:text-red-400 font-bold font-mono px-1">
                              {language === 'zh' ? '删除？' : 'Delete?'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCard(proj.id)}
                              className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow-2xs cursor-pointer"
                            >
                              {language === 'zh' ? '确认' : 'Yes'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playClickSound();
                                setDeletingId(null);
                              }}
                              className="px-2 py-0.5 text-[10px] font-mono bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded hover:bg-gray-300 transition-colors cursor-pointer"
                            >
                              {language === 'zh' ? '取消' : 'No'}
                            </button>
                          </div>
                        ) : (
                          <>
                            {onSelectProject && (
                              <button
                                type="button"
                                onClick={() => {
                                  playClickSound();
                                  onSelectProject(proj);
                                }}
                                className="p-2 text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                                title={language === 'zh' ? '查看作品详情' : 'View Details'}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleEditClick(proj)}
                              className="p-2 text-gray-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                              title={language === 'zh' ? '编辑作品' : 'Edit Project'}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playClickSound();
                                setDeletingId(proj.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                              title={language === 'zh' ? '删除作品' : 'Delete Project'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: EDIT OR CREATE FORM */}
            {activeTab === 'edit' && editingProject && (
              <form onSubmit={handleSaveForm} className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
                  <h3 className="text-sm font-bold font-sans">
                    {editingProject.id && draftProjects.some((p) => p.id === editingProject.id)
                      ? (language === 'zh' ? '编辑作品信息' : 'Edit Project Info')
                      : (language === 'zh' ? '创建新作品' : 'Create New Project')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setEditingProject(null);
                      setActiveTab('list');
                    }}
                    className="text-xs font-mono text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    {language === 'zh' ? '返回列表' : 'Back to List'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-600 dark:text-neutral-400">
                      {language === 'zh' ? '作品标题 *' : 'Title *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.title || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      placeholder="e.g. 摄影视觉展 / Photography Exhibition"
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans font-medium"
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-600 dark:text-neutral-400">
                      {language === 'zh' ? '英文/副标题' : 'Subtitle'}
                    </label>
                    <input
                      type="text"
                      value={editingProject.subtitle || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                      placeholder="e.g. VISUAL EXHIBITION 2026"
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-mono"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-600 dark:text-neutral-400">
                      {language === 'zh' ? '分类类型' : 'Category'}
                    </label>
                    <select
                      value={editingProject.category || 'branding'}
                      onChange={(e) => {
                        const val = e.target.value as WorkCategory;
                        const labels: Record<string, string> = {
                          branding: 'BRANDING',
                          type: 'TYPE',
                          packaging: 'PACKAGING',
                          exhibition: 'EXHIBITION'
                        };
                        setEditingProject({
                          ...editingProject,
                          category: val,
                          categoryLabel: labels[val] || val.toUpperCase()
                        });
                      }}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    >
                      <option value="branding">BRANDING / 品牌 VI</option>
                      <option value="type">TYPE / 字体排版</option>
                      <option value="packaging">PACKAGING / 包装设计</option>
                      <option value="exhibition">EXHIBITION / 策展视觉</option>
                    </select>
                  </div>

                  {/* Year */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-600 dark:text-neutral-400">
                      {language === 'zh' ? '创作年份' : 'Year'}
                    </label>
                    <input
                      type="text"
                      value={editingProject.year || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                      placeholder="2026"
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-mono"
                    />
                  </div>

                  {/* Client */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono text-gray-600 dark:text-neutral-400">
                      {language === 'zh' ? '客户 / 机构' : 'Client'}
                    </label>
                    <input
                      type="text"
                      value={editingProject.client || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                      placeholder="QSi Art Gallery"
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    />
                  </div>

                  {/* Color Palette Editor (REQUIREMENT 5) */}
                  <div className="space-y-1 sm:col-span-2 bg-gray-50/80 dark:bg-neutral-950/80 p-3.5 border border-gray-200 dark:border-neutral-800 rounded-xl">
                    <ColorPaletteEditor
                      colors={editingProject.colorPalette || ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#e4e4e7']}
                      onChange={(newColors) => setEditingProject({ ...editingProject, colorPalette: newColors })}
                      language={language}
                    />
                  </div>

                  {/* Compression Status Notice */}
                  {compressNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="sm:col-span-2 p-2.5 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 rounded-xl flex items-center justify-between text-xs font-mono text-blue-800 dark:text-blue-300"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 animate-pulse" />
                        <span>{compressNotice}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCompressNotice(null)}
                        className="text-blue-400 hover:text-blue-600 dark:hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}

                  {/* Cover Image */}
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-gray-600 dark:text-neutral-400 font-bold text-black dark:text-white flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        {language === 'zh' ? '封面图片 *' : 'Cover Image *'}
                      </label>
                      <label className="cursor-pointer text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 shrink-0">
                        <Upload className="w-3 h-3" />
                        <span>{language === 'zh' ? '📱 手机选择图片 (自动压缩+云同步Ready)' : '📱 Auto-Compress Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setCompressNotice(language === 'zh' ? '⚡ 正在处理并高清压缩图片...' : '⚡ Compressing image...');
                              try {
                                const res = await compressImageFile(file);
                                setEditingProject((prev) => ({
                                  ...prev,
                                  coverImage: res.dataUrl
                                }));
                                setCompressNotice(
                                  language === 'zh'
                                    ? `⚡ 图片已自动优化 (${formatFileSize(res.originalSize)} ➔ ${formatFileSize(res.compressedSize)}, 体积缩小 ${res.compressionRatio}%)，线上同步保真！`
                                    : `⚡ Compressed (${formatFileSize(res.originalSize)} ➔ ${formatFileSize(res.compressedSize)}, -${res.compressionRatio}%)`
                                );
                              } catch (err) {
                                console.error(err);
                                setCompressNotice(language === 'zh' ? '❌ 图片压缩处理失败' : '❌ Compression failed');
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      required
                      value={editingProject.coverImage || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, coverImage: e.target.value })}
                      placeholder={language === 'zh' ? '贴入图片 URL 或点击上方上传手机图片' : 'Paste image URL or tap upload above'}
                      className="w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white"
                    />

                    {/* Cover Large Preview Box */}
                    {editingProject.coverImage && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[11px] font-mono text-gray-400 dark:text-neutral-500">
                          {language === 'zh' ? '封面实时展示预览：' : 'Cover Image Live Preview:'}
                        </p>
                        <div className="relative w-full h-36 sm:h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 group shadow-inner">
                          <img
                            src={editingProject.coverImage}
                            alt="Cover Live Preview"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono rounded-md flex items-center gap-1">
                            <span>COVER PREVIEW</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gallery Images */}
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-gray-600 dark:text-neutral-400 font-bold text-black dark:text-white flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        {language === 'zh' ? '详情页图集 (每行一个 URL)' : 'Gallery Images (One URL per line)'}
                      </label>
                      <label className="cursor-pointer text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 shrink-0">
                        <Upload className="w-3 h-3" />
                        <span>{language === 'zh' ? '📱 手机批量选择图片 (自动压缩)' : '📱 Auto-Compress Gallery'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []) as File[];
                            if (files.length > 0) {
                              setCompressNotice(
                                language === 'zh'
                                  ? `⚡ 正在并行压缩 ${files.length} 张图片...`
                                  : `⚡ Compressing ${files.length} images...`
                              );
                              try {
                                let totalOrig = 0;
                                let totalComp = 0;
                                const results = await Promise.all(
                                  files.map(async (file: File) => {
                                    const res = await compressImageFile(file);
                                    totalOrig += res.originalSize;
                                    totalComp += res.compressedSize;
                                    return res.dataUrl;
                                  })
                                );
                                setEditingProject((prev) => ({
                                  ...prev,
                                  galleryImages: [
                                    ...(prev?.galleryImages || []),
                                    ...results
                                  ]
                                }));
                                const overallRatio = totalOrig > 0 ? Math.round(((totalOrig - totalComp) / totalOrig) * 100) : 0;
                                setCompressNotice(
                                  language === 'zh'
                                    ? `⚡ 已压缩并导入 ${files.length} 张图片 (${formatFileSize(totalOrig)} ➔ ${formatFileSize(totalComp)}, 节省 ${overallRatio}%)！`
                                    : `⚡ Compressed & added ${files.length} images!`
                                );
                              } catch (err) {
                                console.error(err);
                                setCompressNotice(language === 'zh' ? '❌ 部分图片压缩失败' : '❌ Compression error');
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                    <textarea
                      rows={3}
                      value={(editingProject.galleryImages || []).join('\n')}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          galleryImages: e.target.value.split('\n').filter((url) => url.trim().length > 0)
                        })
                      }
                      placeholder="https://images.unsplash.com/photo-1&#10;https://images.unsplash.com/photo-2"
                      className="w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white"
                    />

                    {/* Gallery Live Image Thumbnails */}
                    {editingProject.galleryImages && editingProject.galleryImages.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <p className="text-[11px] font-mono text-gray-400 dark:text-neutral-500 flex items-center justify-between">
                          <span>{language === 'zh' ? '图集实时展示预览：' : 'Gallery Live Image Previews:'}</span>
                          <span>{editingProject.galleryImages.length} {language === 'zh' ? '张图片' : 'images'}</span>
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {editingProject.galleryImages.map((url, idx) => (
                            <div
                              key={idx}
                              className="relative h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 group shadow-2xs"
                            >
                              <img
                                src={url}
                                alt={`gallery-${idx}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                              <span className="absolute top-1 left-1 px-1.5 py-0.2 bg-black/70 backdrop-blur-md text-white text-[9px] font-mono rounded">
                                #{idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono text-gray-600 dark:text-neutral-400">
                      {language === 'zh' ? '一句话摘要' : 'Summary'}
                    </label>
                    <input
                      type="text"
                      value={editingProject.summary || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                      placeholder="e.g. 探索光影与空间的沉浸式现代摄影艺术展览"
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    />
                  </div>

                  {/* Description Paragraphs */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono text-gray-600 dark:text-neutral-400">
                      {language === 'zh' ? '详细文字描述 (每行一段)' : 'Description (One paragraph per line)'}
                    </label>
                    <textarea
                      rows={4}
                      value={(editingProject.description || []).join('\n')}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          description: e.target.value.split('\n')
                        })
                      }
                      placeholder="输入详细描述..."
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono text-gray-600 dark:text-neutral-400">
                      {language === 'zh' ? '作品标签 (用逗号分隔)' : 'Tags (Comma separated)'}
                    </label>
                    <input
                      type="text"
                      value={(editingProject.tags || []).join(', ')}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                        })
                      }
                      placeholder="摄影艺术, 沉浸策展, 空间布局"
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-mono"
                    />
                  </div>
                </div>

                {/* Form Bottom Action Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                  {editingProject.id ? (
                    showFormDeleteConfirm ? (
                      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/80 p-2 rounded-lg border border-red-200 dark:border-red-800 animate-fadeIn">
                        <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                          {language === 'zh' ? '确定删除作品？' : 'Confirm Delete?'}
                        </span>
                        <button
                          type="button"
                          onClick={handleConfirmDeleteFromForm}
                          className="px-3 py-1 text-xs font-mono font-bold bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow-2xs cursor-pointer"
                        >
                          {language === 'zh' ? '确认删除' : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setShowFormDeleteConfirm(false);
                          }}
                          className="px-3 py-1 text-xs font-mono bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          {language === 'zh' ? '取消' : 'Cancel'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setShowFormDeleteConfirm(true);
                        }}
                        className="px-3.5 py-2 text-xs font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{language === 'zh' ? '删除此作品' : 'Delete Project'}</span>
                      </button>
                    )
                  ) : <div />}

                  <div className="flex items-center justify-end gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        if (initialEditFormRef.current) {
                          setEditingProject(JSON.parse(JSON.stringify(initialEditFormRef.current)));
                          showToast(language === 'zh' ? '已撤销当前作品编辑，还原初始信息' : 'Form edits undone');
                        }
                      }}
                      disabled={!initialEditFormRef.current || JSON.stringify(editingProject) === JSON.stringify(initialEditFormRef.current)}
                      className="px-3 py-2 text-xs font-mono text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer font-medium"
                      title={language === 'zh' ? '撤销当前表单的修改' : 'Undo form edits'}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{language === 'zh' ? '撤销修改' : 'Undo Edits'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setEditingProject(null);
                        setActiveTab('list');
                      }}
                      className="px-3.5 py-2 text-xs font-mono text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-mono font-bold bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{language === 'zh' ? '保存作品修改' : 'Save Project'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 3: JSON BATCH EDIT */}
            {activeTab === 'json' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-neutral-400 font-sans">
                    {language === 'zh'
                      ? '直接编辑或粘贴 JSON 代码即可一键批量更新作品库。'
                      : 'Edit or paste raw JSON to batch update all portfolio items.'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="px-3 py-1.5 text-xs font-mono bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? (language === 'zh' ? '已复制' : 'Copied') : (language === 'zh' ? '复制 JSON' : 'Copy JSON')}</span>
                    </button>
                  </div>
                </div>

                {jsonError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{jsonError}</span>
                  </div>
                )}

                <textarea
                  rows={14}
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setJsonError(null);
                  }}
                  className="w-full p-4 font-mono text-xs bg-gray-950 text-gray-100 rounded-xl border border-gray-800 focus:outline-none focus:border-white"
                />

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleApplyJson}
                    className="px-5 py-2 text-xs font-mono font-bold bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '解析并替换列表' : 'Apply & Replace List'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* UNSAVED CHANGES CONFIRMATION POPUP MODAL */}
        <AnimatePresence>
          {showExitConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4 text-black dark:text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-sans">
                      {language === 'zh' ? '检测到作品已被修改' : 'Unsaved Changes Detected'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 font-mono mt-0.5">
                      {language === 'zh' ? '是否将刚才的操作保存并应用至网页作品集？' : 'Do you want to save and apply your edits to the website?'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-neutral-300 bg-gray-50 dark:bg-neutral-800/80 p-3 rounded-xl border border-gray-100 dark:border-neutral-700/60">
                  {language === 'zh'
                    ? '• 确认修改：将保存您对作品集的所有编辑、添加与删除。\n• 不保存退出：将放弃本次所有修改，保持网页为之前状态。'
                    : '• Confirm: Save all edits, additions, and deletions.\n• Discard: Revert edits and exit without modifying the website.'}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-mono text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-center cursor-pointer"
                  >
                    {language === 'zh' ? '取消并继续编辑' : 'Cancel & Keep Editing'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardAndExit}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-mono text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors text-center cursor-pointer"
                  >
                    {language === 'zh' ? '不保存直接退出' : 'Discard & Exit'}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSaveAndExit}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-mono font-bold bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity text-center shadow-xs cursor-pointer"
                  >
                    {language === 'zh' ? '确认修改并保存' : 'Save & Confirm'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
