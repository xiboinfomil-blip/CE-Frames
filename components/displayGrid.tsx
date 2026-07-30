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
  
  /** Custom empty state to display when items array is empty */
  emptyState?: ReactNode;
  
  /** Additional classes for the grid container (e.g., custom gaps) */
  className?: string;
  
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

/**
 * A responsive, accessible, and performant grid layout for displaying lists of cards.
 * Designed to mimic the spacing and rhythm of a professional photography portfolio.
 */
const CardGrid = <T,>({ 
  items, 
  renderItem, 
  getKey, 
  emptyState, 
  className = '', 
  ariaLabel = 'Content grid' 
}: CardGridProps<T>) => {
  
  // Default Empty State - Editorial Style
  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
      <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800">
        <FolderOpen className="w-8 h-8 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">No items found</h3>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 max-w-xs font-medium">Try adjusting your filters or create a new item.</p>
    </div>
  );

  if (items.length === 0) {
    return <div className={`w-full ${className}`}>{emptyState || defaultEmptyState}</div>;
  }

  return (
    <div 
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 ${className}`}
      role="list"
      aria-label={ariaLabel}
    >
      {items.map((item, index) => {
        const key = getKey ? getKey(item, index) : index;
        return (
          <div key={key} role="listitem" className="flex flex-col">
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
};

CardGrid.displayName = 'CardGrid';

export default memo(CardGrid) as typeof CardGrid;