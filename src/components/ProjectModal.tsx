import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Trash2,
  MessageSquare,
  Check,
  RotateCcw,
  ImageIcon,
  Eye,
  Save,
  Upload,
  Zap
} from 'lucide-react';
import { Project, Language, WorkCategory } from '../types';
import { FourPointStar } from './FourPointStar';
import { ColorPaletteEditor } from './ColorPaletteEditor';
import { compressImageFile, formatFileSize } from '../utils/imageCompressor';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  playClickSound: () => void;
  likesMap: Record<string, number>;
  onIncrementLike: (projectId: string) => void;
  language?: Language;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  onOpenComment?: (projectId: string) => void;
  onSaveProjects?: (projects: Project[]) => void;
  allProjects?: Project[];
  isEditMode?: boolean;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onNext,
  onPrev,
  playClickSound,
  likesMap,
  onIncrementLike,
  language = 'zh',
  onEditProject,
  onDeleteProject,
  onOpenComment,
  onSaveProjects,
  allProjects = [],
  isEditMode = false
}) => {
  const [sparkleAnim, setSparkleAnim] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const initialFormRef = useRef<Partial<Project>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [compressNotice, setCompressNotice] = useState<string | null>(null);

  // Sync edit form when project changes or edit mode toggled
  useEffect(() => {
    if (project) {
      const copy = JSON.parse(JSON.stringify(project));
      setEditForm(copy);
      initialFormRef.current = copy;
      setIsEditingInline(false);
      setShowDeleteConfirm(false);
    }
  }, [project]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  if (!project) return null;

  const currentLikes = likesMap[project.id] ?? (project.likes || 12);
  const formatLikes = (count: number) => (count > 999 ? '999+' : `${count}`);

  const handleLikeClick = () => {
    playClickSound();
    setSparkleAnim(true);
    onIncrementLike(project.id);
    setTimeout(() => setSparkleAnim(false), 600);
  };

  const primaryTitle = language === 'zh' ? project.title : project.subtitle;
  const secondarySubtitle = language === 'zh' ? project.subtitle : project.title;

  const handleSaveInline = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playClickSound();
    const updatedProj: Project = {
      ...project,
      ...editForm,
      id: project.id,
      title: editForm.title || project.title,
      subtitle: editForm.subtitle || project.subtitle,
      category: editForm.category || project.category,
      categoryLabel: editForm.categoryLabel || editForm.category?.toUpperCase() || project.categoryLabel,
      year: editForm.year || project.year,
      client: editForm.client || project.client,
      coverImage: editForm.coverImage || project.coverImage,
      galleryImages: editForm.galleryImages || project.galleryImages,
      summary: editForm.summary || project.summary,
      description: editForm.description || project.description,
      tags: editForm.tags || project.tags,
      colorPalette: editForm.colorPalette && editForm.colorPalette.length > 0 ? editForm.colorPalette : project.colorPalette
    };

    if (onEditProject) {
      onEditProject(updatedProj);
    } else if (onSaveProjects && allProjects.length > 0) {
      const nextList = allProjects.map((p) => (p.id === updatedProj.id ? updatedProj : p));
      onSaveProjects(nextList);
    }

    initialFormRef.current = JSON.parse(JSON.stringify(updatedProj));
    setIsEditingInline(false);
    showToast(language === 'zh' ? '作品信息已保存并更新！' : 'Project updated & saved!');
  };

  const handleUndoInline = () => {
    playClickSound();
    if (initialFormRef.current) {
      setEditForm(JSON.parse(JSON.stringify(initialFormRef.current)));
      showToast(language === 'zh' ? '已还原为修改前状态' : 'Restored initial form');
    }
  };

  const handleDeleteConfirm = () => {
    playClickSound();
    if (onDeleteProject) {
      onDeleteProject(project.id);
      showToast(language === 'zh' ? '作品已删除' : 'Project deleted');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 transition-colors">
        
        {/* Toast Popup Notification */}
        {toastMsg && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
            <Check className="w-3.5 h-3.5 text-green-400 dark:text-green-600" />
            <span>{toastMsg}</span>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white dark:bg-neutral-900 w-full max-w-[95vw] sm:max-w-4xl shadow-2xl border border-gray-200 dark:border-neutral-800 rounded-xl sm:rounded-2xl overflow-hidden relative my-auto max-h-[88vh] sm:max-h-[90vh] flex flex-col transition-colors"
        >
          {/* TOP FIXED MODAL BAR */}
          <div className="sticky top-0 z-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Star Like Increment Button */}
              <button
                type="button"
                onClick={handleLikeClick}
                className="relative flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-black dark:text-white border border-gray-200 dark:border-neutral-700 text-xs font-mono font-semibold rounded-full transition-all active:scale-95"
                title={language === 'zh' ? '点赞 +1' : 'Like +1'}
              >
                <FourPointStar className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span>{formatLikes(currentLikes)}</span>

                {sparkleAnim && (
                  <span className="absolute -top-6 -right-1 text-black dark:text-white text-xs font-bold animate-bounce flex items-center gap-0.5 pointer-events-none">
                    +1
                  </span>
                )}
              </button>

              <span className="text-[11px] font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-wider hidden sm:inline">
                {project.index} • {project.categoryLabel}
              </span>

              {isEditingInline && (
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold rounded-md flex items-center gap-1 border border-amber-300 dark:border-amber-700">
                  <Edit3 className="w-3 h-3" />
                  {language === 'zh' ? '直接编辑模式' : 'INLINE EDIT'}
                </span>
              )}
            </div>

            {/* Top Right Action Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* Inline Delete Confirmation Header */}
              {showDeleteConfirm ? (
                <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/80 px-2 py-1 rounded-full border border-red-200 dark:border-red-800 animate-fadeIn">
                  <span className="text-[11px] font-mono font-bold text-red-600 dark:text-red-400 pl-1">
                    {language === 'zh' ? '确认删除？' : 'Delete?'}
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-2xs"
                  >
                    {language === 'zh' ? '确定' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setShowDeleteConfirm(false);
                    }}
                    className="px-2.5 py-0.5 text-[11px] font-mono bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-full hover:bg-gray-300 transition-colors"
                  >
                    {language === 'zh' ? '取消' : 'No'}
                  </button>
                </div>
              ) : (
                <>
                  {onOpenComment && !isEditingInline && (
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        onOpenComment(project.id);
                      }}
                      className="p-1.5 sm:p-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-full transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                      title={language === 'zh' ? '给此作品留言/提出修改建议' : 'Leave comment'}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}

                  {/* Toggle Inline Edit Mode & Delete Button (Only in Edit Mode) */}
                  {isEditMode && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          if (isEditingInline) {
                            setIsEditingInline(false);
                          } else {
                            setEditForm(JSON.parse(JSON.stringify(project)));
                            setIsEditingInline(true);
                          }
                        }}
                        className={`p-1.5 sm:p-2 rounded-full transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                          isEditingInline
                            ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                            : 'text-gray-600 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'
                        }`}
                        title={isEditingInline ? (language === 'zh' ? '预览详情' : 'Preview') : (language === 'zh' ? '编辑此作品' : 'Edit Project')}
                      >
                        {isEditingInline ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                      </button>

                      {/* Delete Button */}
                      {onDeleteProject && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playClickSound();
                            setShowDeleteConfirm(true);
                          }}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                          title={language === 'zh' ? '删除此作品' : 'Delete Project'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </>
              )}

              {!isEditingInline && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      onPrev();
                    }}
                    className="p-1.5 sm:p-2 text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
                    title={language === 'zh' ? '上一个作品' : 'Previous Project'}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      onNext();
                    }}
                    className="p-1.5 sm:p-2 text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
                    title={language === 'zh' ? '下一个作品' : 'Next Project'}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className="p-1.5 sm:p-2 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full transition-colors ml-1 sm:ml-2 cursor-pointer"
                title={language === 'zh' ? '关闭' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SCROLLABLE BODY - VIEW MODE VS INLINE EDIT MODE */}
          <div className="overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-8">
            
            {isEditingInline ? (
              /* INLINE EDIT MODE - MIRRORS THE DETAIL PAGE LAYOUT */
              <form onSubmit={handleSaveInline} className="space-y-6 animate-fadeIn">
                
                {/* Title & Subtitle Edit Block */}
                <div className="space-y-3 bg-gray-50/80 dark:bg-neutral-950/80 p-4 border border-gray-200 dark:border-neutral-800 rounded-xl">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400 dark:text-neutral-500">
                    <span>{language === 'zh' ? '编辑主标题与副标题' : 'EDIT TITLES'}</span>
                    <span>ID: {project.id}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-gray-500 dark:text-neutral-400 block mb-1">
                        {language === 'zh' ? '中文主标题 *' : 'Main Title *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-3 py-2 text-base font-bold bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-gray-500 dark:text-neutral-400 block mb-1">
                        {language === 'zh' ? '英文副标题' : 'Subtitle'}
                      </label>
                      <input
                        type="text"
                        value={editForm.subtitle || ''}
                        onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                        className="w-full px-3 py-2 text-base font-mono bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Compression Status Notice */}
                {compressNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-2.5 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 rounded-xl flex items-center justify-between text-xs font-mono text-blue-800 dark:text-blue-300"
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

                {/* Cover Image URL & Live Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-gray-600 dark:text-neutral-400 font-bold text-black dark:text-white flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      {language === 'zh' ? '主封面图片 *' : 'Cover Image *'}
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
                              setEditForm((prev) => ({
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
                    value={editForm.coverImage || ''}
                    onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                    placeholder={language === 'zh' ? '贴入图片 URL 或点击上方按钮上传手机图片' : 'Paste URL or tap button above to upload'}
                    className="w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white"
                  />
                  <div className="aspect-16/9 overflow-hidden bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl relative group">
                    <img
                      src={editForm.coverImage || project.coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-mono rounded">
                      COVER LIVE PREVIEW
                    </div>
                  </div>
                </div>

                {/* Key Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 dark:bg-neutral-950 p-4 border border-gray-200 dark:border-neutral-800 rounded-xl text-xs font-mono">
                  <div>
                    <label className="text-gray-400 dark:text-neutral-500 block mb-1 uppercase text-[10px]">
                      {language === 'zh' ? '客户 / 机构' : 'CLIENT'}
                    </label>
                    <input
                      type="text"
                      value={editForm.client || ''}
                      onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 dark:text-neutral-500 block mb-1 uppercase text-[10px]">
                      {language === 'zh' ? '分类类型' : 'CATEGORY'}
                    </label>
                    <select
                      value={editForm.category || 'branding'}
                      onChange={(e) => {
                        const val = e.target.value as WorkCategory;
                        const labels: Record<string, string> = {
                          branding: 'BRANDING',
                          type: 'TYPE',
                          packaging: 'PACKAGING',
                          exhibition: 'EXHIBITION'
                        };
                        setEditForm({ ...editForm, category: val, categoryLabel: labels[val] || val.toUpperCase() });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                    >
                      <option value="branding">BRANDING / 品牌 VI</option>
                      <option value="type">TYPE / 字体排版</option>
                      <option value="packaging">PACKAGING / 包装设计</option>
                      <option value="exhibition">EXHIBITION / 策展视觉</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 dark:text-neutral-500 block mb-1 uppercase text-[10px]">
                      {language === 'zh' ? '创作年份' : 'YEAR'}
                    </label>
                    <input
                      type="text"
                      value={editForm.year || ''}
                      onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg"
                    />
                  </div>
                </div>

                {/* Color Palette Editor (REQUIREMENT 5) */}
                <div className="bg-gray-50 dark:bg-neutral-950 p-4 border border-gray-200 dark:border-neutral-800 rounded-xl">
                  <ColorPaletteEditor
                    colors={editForm.colorPalette || project.colorPalette}
                    onChange={(newPalette) => setEditForm({ ...editForm, colorPalette: newPalette })}
                    language={language}
                  />
                </div>

                {/* Summary */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-600 dark:text-neutral-400">
                    {language === 'zh' ? '概念一句话摘要' : 'Concept Brief Summary'}
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.summary || ''}
                    onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                    className="w-full p-3 text-xs sm:text-sm bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-black dark:focus:border-white font-sans"
                  />
                </div>

                {/* Detailed Description */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-600 dark:text-neutral-400">
                    {language === 'zh' ? '详细文字说明 (每行一段)' : 'Detailed Description (One paragraph per line)'}
                  </label>
                  <textarea
                    rows={4}
                    value={(editForm.description || []).join('\n')}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value.split('\n') })}
                    className="w-full p-3 text-xs sm:text-sm bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-black dark:focus:border-white font-sans"
                  />
                </div>

                {/* Gallery Images */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-gray-600 dark:text-neutral-400 font-bold text-black dark:text-white flex items-center justify-between">
                      <span>{language === 'zh' ? '图集图片 (每行一个 URL)' : 'Gallery Images (One URL per line)'}</span>
                      <span className="text-[10px] text-gray-400">{(editForm.galleryImages || []).length} {language === 'zh' ? '张图片' : 'images'}</span>
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
                              setEditForm((prev) => ({
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
                    value={(editForm.galleryImages || []).join('\n')}
                    onChange={(e) => setEditForm({ ...editForm, galleryImages: e.target.value.split('\n').filter((u) => u.trim().length > 0) })}
                    placeholder={language === 'zh' ? '贴入图片 URL 或点击上方按钮直接从手机挑选图片' : 'Paste URLs or tap button above to select from phone'}
                    className="w-full p-3 text-xs font-mono bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-black dark:focus:border-white"
                  />

                  {editForm.galleryImages && editForm.galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {editForm.galleryImages.map((url, i) => (
                        <div key={i} className="aspect-4/3 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 relative">
                          <img
                            src={url}
                            alt={`gallery-${i}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-600 dark:text-neutral-400">
                    {language === 'zh' ? '作品标签 (逗号分隔)' : 'Tags (Comma separated)'}
                  </label>
                  <input
                    type="text"
                    value={(editForm.tags || []).join(', ')}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                    className="w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl"
                  />
                </div>

                {/* Bottom Inline Save Action Bar */}
                <div className="sticky bottom-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-4 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between gap-3 rounded-b-xl shadow-lg">
                  <button
                    type="button"
                    onClick={handleUndoInline}
                    className="px-3.5 py-2 text-xs font-mono text-gray-700 dark:text-neutral-300 hover:text-black dark:hover:text-white border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '撤销修改' : 'Undo Form Edits'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingInline(false)}
                      className="px-4 py-2 text-xs font-mono text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-mono font-bold bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{language === 'zh' ? '保存并应用于作品' : 'Save & Update'}</span>
                    </button>
                  </div>
                </div>

              </form>
            ) : (
              /* STANDARD READ-ONLY DETAIL VIEW */
              <>
                {/* Title & Metadata */}
                <div className="space-y-2 sm:space-y-3">
                  <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 tracking-[0.2em] uppercase block">
                    {project.year} • {project.client}
                  </span>
                  
                  <h2 className="text-xl sm:text-3xl font-light text-black dark:text-white leading-tight font-sans">
                    {primaryTitle}
                  </h2>
                  
                  <p className="text-xs font-mono text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                    {secondarySubtitle}
                  </p>
                </div>

                {/* Main Cover Image */}
                <div className="aspect-16/10 overflow-hidden bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 shadow-xs rounded-xl">
                  <img
                    src={project.coverImage}
                    alt={primaryTitle}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Key Information Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 dark:bg-neutral-950 p-4 sm:p-6 border border-gray-100 dark:border-neutral-800 rounded-xl text-xs font-mono">
                  <div>
                    <span className="text-gray-400 dark:text-neutral-500 block mb-1 uppercase text-[10px] tracking-wider">
                      {language === 'zh' ? '客户' : 'CLIENT'}
                    </span>
                    <span className="font-bold text-black dark:text-white">{project.client}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-neutral-500 block mb-1 uppercase text-[10px] tracking-wider">
                      {language === 'zh' ? '分类' : 'CATEGORY'}
                    </span>
                    <span className="font-bold text-black dark:text-white">{project.categoryLabel}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-neutral-500 block mb-1 uppercase text-[10px] tracking-wider">
                      {language === 'zh' ? '年份' : 'YEAR'}
                    </span>
                    <span className="font-bold text-black dark:text-white">{project.year}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-neutral-500 block mb-1 uppercase text-[10px] tracking-wider">
                      {language === 'zh' ? '配色方案' : 'PALETTE'}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 overflow-x-auto py-0.5 scrollbar-none">
                      {project.colorPalette.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-4 h-4 rounded-full border border-gray-300 dark:border-neutral-700 shrink-0 shadow-2xs"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detailed Description */}
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 tracking-[0.2em] uppercase block border-b border-gray-100 dark:border-neutral-800 pb-2">
                    {language === 'zh' ? '方案概念与设计说明' : 'PROJECT BRIEF & CONCEPT'}
                  </span>
                  
                  <p className="text-sm font-medium text-black dark:text-white leading-relaxed bg-gray-50 dark:bg-neutral-950 p-4 border-l-2 border-black dark:border-white font-sans rounded-r-lg">
                    {project.summary}
                  </p>

                  <div className="space-y-3 text-xs sm:text-sm text-gray-700 dark:text-neutral-300 leading-relaxed font-sans">
                    {project.description.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>

                {/* Additional Gallery */}
                {project.galleryImages.length > 0 && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 tracking-[0.2em] uppercase block border-b border-gray-100 dark:border-neutral-800 pb-2">
                      {language === 'zh' ? '视觉细节展示' : 'VISUAL GALLERY'}
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {project.galleryImages.map((img, i) => (
                        <div key={i} className="aspect-4/3 overflow-hidden bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 rounded-xl">
                          <img
                            src={img}
                            alt={`${primaryTitle} detail ${i}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-gray-400 dark:text-neutral-500 mr-2 uppercase tracking-wider">
                    {language === 'zh' ? '标签:' : 'TAGS:'}
                  </span>
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 dark:bg-neutral-800 text-black dark:text-white text-xs font-mono px-3 py-1 rounded-full border border-gray-200 dark:border-neutral-700 uppercase tracking-wider"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Live Pin & Like Engagement Bar */}
                <div className="pt-5 mt-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        onIncrementLike(project.id);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-mono font-bold hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
                      title={language === 'zh' ? '点击给作品钉住/点赞' : 'Pin & Like Project'}
                    >
                      <FourPointStar className="w-3.5 h-3.5 fill-current text-amber-400 dark:text-amber-500" />
                      <span>PIN / 点赞 ({currentLikes})</span>
                    </button>
                    <span className="text-[11px] font-mono text-gray-400 dark:text-neutral-500">
                      {language === 'zh' ? '全网真实互动值' : 'Live Pin Count'}
                    </span>
                  </div>

                  {onOpenComment && (
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        onOpenComment(project.id);
                      }}
                      className="px-3.5 py-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{language === 'zh' ? '针对此作品留言' : 'Comment on Case'}</span>
                    </button>
                  )}
                </div>
              </>
            )}

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
