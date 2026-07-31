import React, { useRef } from 'react';
import { Plus, Minus, Palette } from 'lucide-react';
import { Language } from '../types';

interface ColorPaletteEditorProps {
  colors: string[];
  onChange: (newColors: string[]) => void;
  language?: Language;
}

const DEFAULT_PALETTE = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#e4e4e7'];

export const ColorPaletteEditor: React.FC<ColorPaletteEditorProps> = ({
  colors = DEFAULT_PALETTE,
  onChange,
  language = 'zh'
}) => {
  const currentColors = colors.length > 0 ? colors : DEFAULT_PALETTE;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleUpdateColor = (index: number, newHex: string) => {
    const updated = [...currentColors];
    updated[index] = newHex;
    onChange(updated);
  };

  const handleAddColor = () => {
    const presetNewColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
    const nextColor = presetNewColors[currentColors.length % presetNewColors.length] || '#3b82f6';
    onChange([...currentColors, nextColor]);
  };

  const handleRemoveColor = (index?: number) => {
    if (currentColors.length <= 1) return;
    if (typeof index === 'number') {
      const updated = currentColors.filter((_, i) => i !== index);
      onChange(updated);
    } else {
      const updated = currentColors.slice(0, currentColors.length - 1);
      onChange(updated);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono">
        <label className="text-gray-600 dark:text-neutral-400 font-bold text-black dark:text-white flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" />
          <span>{language === 'zh' ? '作品配色调色板 (点击色块编辑)' : 'Color Palette (Click to edit)'}</span>
        </label>
        <span className="text-[10px] text-gray-400 dark:text-neutral-500">
          {currentColors.length} {language === 'zh' ? '个配色' : 'colors'}
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-700">
        {currentColors.map((color, idx) => (
          <div key={idx} className="relative group shrink-0">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-neutral-800 shadow-md relative cursor-pointer flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: color }}
              title={color}
            >
              <input
                ref={(el) => (inputRefs.current[idx] = el)}
                type="color"
                value={color.startsWith('#') ? color : '#000000'}
                onChange={(e) => handleUpdateColor(idx, e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded-full"
              />
            </div>

            {currentColors.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveColor(idx);
                }}
                className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer z-10"
                title={language === 'zh' ? '删除此颜色' : 'Remove color'}
              >
                ×
              </button>
            )}

            <span className="text-[9px] font-mono text-gray-400 dark:text-neutral-500 block text-center mt-1 uppercase tracking-tighter truncate w-9 sm:w-10">
              {color}
            </span>
          </div>
        ))}

        {/* Add Color + Button */}
        <button
          type="button"
          onClick={handleAddColor}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-dashed border-gray-300 dark:border-neutral-700 text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-2xs active:scale-95 mb-4"
          title={language === 'zh' ? '添加新颜色' : 'Add color'}
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Delete Last Color - Button */}
        {currentColors.length > 1 && (
          <button
            type="button"
            onClick={() => handleRemoveColor()}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-2xs active:scale-95 mb-4"
            title={language === 'zh' ? '减少一个配色' : 'Remove last color'}
          >
            <Minus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
