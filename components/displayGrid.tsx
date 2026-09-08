'use client';

import React, { memo, ReactNode } from 'react';
import { FolderOpen } from 'lucide-react';

interface CardGridProps<T> {
  /** The array of items to render */
  items: T[];
  
  /** Function to render each individual card. Receives the item and its index. */
  renderItem: (item: T, index: number) => ReactNode;
  
  /** Optional unique key extractor. Defaults to using the index if not provided. */
  getKey?: (item: T, index: number) => string | number;
  
  /** Controls skeleton loading placeholders */
  isLoading?: boolean;
  
  /** Number of skeleton cards to display when isLoading is true */
  skeletonCount?: number;
  
  /** Custom skeleton card component */
  renderSkeleton?: (index: number) => ReactNode;
  
  /** Custom empty state to display when items array is empty */
  emptyState?: ReactNode;
  
  /** Preset column distribution density */
  columns?: 'auto' | 'compact' | 'wide' | 'editorial';

  /** Additional classes for the grid container */
  className?: string;
  
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

/**
 * A responsive, accessible grid component with skeleton loaders and customizable layouts.
 */
const CardGrid = <T,>({ 
  items, 
  renderItem, 
  getKey, 
  isLoading = false,
  skeletonCount = 8,
  renderSkeleton,
  emptyState, 
  columns = 'auto',
  className = '', 
  ariaLabel = 'Content grid' 
}: CardGridProps<T>) => {
  
  // Dynamic grid layouts based on content density preference
  const columnStyles = {
    auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    compact: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
    wide: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    editorial: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  // Default Skeleton Card
  const defaultSkeleton = (index: number) => (
    <div 
      key={`skeleton-${index}`} 
      className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3 bg-white dark:bg-slate-900 shadow-sm animate-pulse"
    >
      <div className="w-full aspect-[4/3] rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-3/4 rounded-md bg-slate-200 dark:bg-slate-800 mt-1" />
      <div className="h-3 w-1/2 rounded-md bg-slate-100 dark:bg-slate-800/60" />
    </div>
  );

  // Default Editorial Empty State
  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
        <FolderOpen className="w-8 h-8 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">No items found</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs font-medium">Try adjusting your filters or adding new items to your gallery.</p>
    </div>
  );

  // Render Skeleton Grid when loading
  if (isLoading) {
    return (
      <div 
        className={`grid ${columnStyles[columns]} gap-6 ${className}`}
        aria-busy="true"
        aria-label="Loading content"
      >
        {Array.from({ length: skeletonCount }).map((_, idx) => 
          renderSkeleton ? renderSkeleton(idx) : defaultSkeleton(idx)
        )}
      </div>
    );
  }

  // Render Empty State
  if (items.length === 0) {
    return <div className={`w-full ${className}`}>{emptyState || defaultEmptyState}</div>;
  }

  // Render Populated Grid
  return (
    <div 
      className={`grid ${columnStyles[columns]} gap-6 ${className}`}
      role="list"
      aria-label={ariaLabel}
    >
      {items.map((item, index) => {
        const key = getKey ? getKey(item, index) : index;
        return (
          <div key={key} role="listitem" className="flex flex-col h-full">
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
};

CardGrid.displayName = 'CardGrid';

export default memo(CardGrid) as typeof CardGrid;