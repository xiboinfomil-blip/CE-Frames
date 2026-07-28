'use client';

import React, { memo, ReactNode } from 'react';

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
 * Uses CSS Grid with modern breakpoints for optimal viewing on all devices.
 */
const CardGrid = <T,>({ 
  items, 
  renderItem, 
  getKey, 
  emptyState, 
  className = '', 
  ariaLabel = 'Content grid' 
}: CardGridProps<T>) => {
  
  // Default Empty State if none provided
  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-zinc-200 shadow-sm">
      <div className="w-20 h-20 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100">
        <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-zinc-900">No items found</h3>
      <p className="text-zinc-500 text-sm mt-2 max-w-xs">Try adjusting your filters or create a new item.</p>
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

// Memoize to prevent re-renders when parent state changes but items don't
CardGrid.displayName = 'CardGrid';

export default memo(CardGrid) as typeof CardGrid;