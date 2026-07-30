import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Project, Language } from '../types';
import { FourPointStar } from './FourPointStar';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  playClickSound: () => void;
  likesMap: Record<string, number>;
  onIncrementLike: (projectId: string) => void;
  language?: Language;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onNext,
  onPrev,
  playClickSound,
  likesMap,
  onIncrementLike,
  language = 'zh'
}) => {
  const [sparkleAnim, setSparkleAnim] = useState(false);

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 transition-colors">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white dark:bg-neutral-900 w-full max-w-4xl shadow-2xl border border-black dark:border-neutral-700 rounded-2xl overflow-hidden relative my-auto max-h-[90vh] flex flex-col transition-colors"
        >
          {/* TOP FIXED MODAL BAR */}
          <div className="sticky top-0 z-20 bg-white dark:bg-neutral-900 px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Star Like Increment Button */}
              <button
                onClick={handleLikeClick}
                className="relative flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-black dark:text-white border border-gray-200 dark:border-neutral-700 text-xs font-mono font-semibold rounded-full transition-all active:scale-95"
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

              <span className="text-xs font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-widest hidden sm:inline">
                {project.index} • {project.categoryLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  onPrev();
                }}
                className="p-2 text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                title={language === 'zh' ? '上一个作品' : 'Previous Project'}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  onNext();
                }}
                className="p-2 text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                title={language === 'zh' ? '下一个作品' : 'Next Project'}
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className="p-2 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full transition-colors ml-2"
                title={language === 'zh' ? '关闭' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="overflow-y-auto p-6 sm:p-10 space-y-8">
            
            {/* Title & Metadata */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 tracking-[0.2em] uppercase block">
                {project.year} • {project.client}
              </span>
              
              <h2 className="text-2xl sm:text-4xl font-light text-black dark:text-white leading-tight font-sans">
                {primaryTitle}
              </h2>
              
              <p className="text-xs sm:text-sm font-mono text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
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
                  {language === 'zh' ? '配色' : 'PALETTE'}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  {project.colorPalette.map((color, idx) => (
                    <span
                      key={idx}
                      className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-neutral-700"
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

          </div>


        </motion.div>
      </div>
    </AnimatePresence>
  );
};
