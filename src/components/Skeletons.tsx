import React from 'react';

export const WorksTabSkeleton: React.FC<{ viewMode?: 'grid' | 'deck' }> = ({ viewMode = 'grid' }) => {
  if (viewMode === 'deck') {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
        {/* Deck Skeleton Stack */}
        <div className="relative w-full max-w-xl aspect-4/3 bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl animate-pulse space-y-4">
          <div className="w-full h-3/5 bg-gray-200 dark:bg-neutral-800 rounded-xl" />
          <div className="h-6 w-2/3 bg-gray-200 dark:bg-neutral-800 rounded-md" />
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-neutral-800 rounded-md" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-16 bg-gray-200 dark:bg-neutral-800 rounded-full" />
            <div className="h-6 w-20 bg-gray-200 dark:bg-neutral-800 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-6">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm animate-pulse"
        >
          {/* Cover image placeholder */}
          <div className="relative aspect-4/3 w-full bg-gray-200 dark:bg-neutral-800 rounded-xl overflow-hidden" />
          
          {/* Header & Title placeholder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-gray-200 dark:bg-neutral-800 rounded-md" />
              <div className="h-3 w-12 bg-gray-200 dark:bg-neutral-800 rounded-md" />
            </div>
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-neutral-800 rounded-md" />
            <div className="h-3.5 w-1/2 bg-gray-150 dark:bg-neutral-850 rounded-md" />
          </div>

          {/* Tags placeholder */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100 dark:border-neutral-800">
            <div className="h-5 w-14 bg-gray-200 dark:bg-neutral-800 rounded-md" />
            <div className="h-5 w-16 bg-gray-200 dark:bg-neutral-800 rounded-md" />
            <div className="h-5 w-12 bg-gray-200 dark:bg-neutral-800 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ProjectModalSkeleton: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-10 overflow-y-auto animate-pulse space-y-6">
        {/* Close Button Placeholder */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-neutral-800 rounded-full" />
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-800" />
        </div>

        {/* Title Section */}
        <div className="space-y-3">
          <div className="h-8 w-2/3 bg-gray-200 dark:bg-neutral-800 rounded-lg" />
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-neutral-800 rounded-md" />
        </div>

        {/* Main Cover Image */}
        <div className="aspect-16/9 w-full bg-gray-200 dark:bg-neutral-800 rounded-xl" />

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100 dark:border-neutral-800">
          <div className="space-y-1">
            <div className="h-3 w-12 bg-gray-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-800 rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-12 bg-gray-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-800 rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-12 bg-gray-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-800 rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-12 bg-gray-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-800 rounded" />
          </div>
        </div>

        {/* Paragraphs */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-4 w-4/6 bg-gray-200 dark:bg-neutral-800 rounded" />
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="aspect-4/3 bg-gray-200 dark:bg-neutral-800 rounded-xl" />
          <div className="aspect-4/3 bg-gray-200 dark:bg-neutral-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
