import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Project } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProject: (project: Project) => void;
  playClickSound: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  projects,
  onSelectProject,
  playClickSound
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = query.trim() === ''
    ? projects.slice(0, 5)
    : projects.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          p.summary.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
          p.categoryLabel.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-end pt-14 pr-4 sm:pr-8 pl-4"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{
            opacity: 0,
            scale: 0.15,
            x: 40,
            y: -20,
            borderRadius: '28px'
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            borderRadius: '24px'
          }}
          exit={{
            opacity: 0,
            scale: 0.15,
            x: 40,
            y: -20,
            borderRadius: '28px'
          }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 28,
            mass: 0.8
          }}
          style={{ transformOrigin: 'top right' }}
          className="bg-white dark:bg-neutral-900 w-full max-w-xl border border-black dark:border-neutral-700 shadow-2xl overflow-hidden transition-colors rounded-2xl"
        >
          {/* SEARCH INPUT */}
          <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-3">
            <Search className="w-4 h-4 text-gray-400 dark:text-neutral-500 ml-2" />
            <input
              type="text"
              autoFocus
              placeholder="搜索作品名称、标签或分类 (如：书籍装帧、品牌视觉、展览)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-xs font-sans text-black dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 bg-transparent focus:outline-none tracking-wider"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 dark:text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-mono uppercase tracking-widest rounded-full"
            >
              关闭 ESC
            </button>
          </div>

          {/* RESULTS LIST */}
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2 divide-y divide-gray-100 dark:divide-neutral-800">
            <div className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 uppercase tracking-widest px-2 pb-1">
              {query ? `已找到 (${results.length}) 项匹配` : '精选推荐搜索'}
            </div>

            {results.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  playClickSound();
                  onSelectProject(project);
                  onClose();
                }}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors group rounded-xl"
              >
                <div className="w-12 h-12 overflow-hidden bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 shrink-0 rounded-lg">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-black dark:text-white truncate font-sans">{project.title}</span>
                  </div>
                  <p className="text-[10px] font-mono text-gray-400 dark:text-neutral-500 truncate uppercase tracking-wider mt-0.5">
                    {project.subtitle} • {project.categoryLabel}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            ))}

            {results.length === 0 && (
              <div className="py-8 text-center text-xs text-gray-400 dark:text-neutral-500 font-mono uppercase tracking-widest">
                No projects found matching "{query}".
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
