'use client';

import React, { memo, useCallback } from 'react';
import { CustomTextfield } from '@/components/ui/CustomTextfield';
import { CustomButton } from '@/components/ui/CustomButton';

// --- Types ---
export interface FilterOption {
  value: string;
  label: string;
}

export interface SortOption {
  value: string;
  label: string;
}

interface MediaLibraryHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  filters?: FilterOption[];
  activeSort?: string;
  onSortChange?: (value: string) => void;
  sorts?: SortOption[];
  totalItems: number;
  currentPage?: number;
  totalPages?: number;
}

// --- Icons (Optimized, Crisp SVGs with refined stroke weights) ---
const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const IconGrid = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const IconX = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MediaLibraryHeader = memo(function MediaLibraryHeader({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  activeFilter,
  onFilterChange,
  filters = [],
  activeSort,
  onSortChange,
  sorts = [],
  totalItems,
  currentPage = 1,
  totalPages = 1
}: MediaLibraryHeaderProps) {
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchSubmit?.();
    }
  }, [onSearchSubmit]);

  const handleClearSearch = useCallback(() => {
    onSearchChange?.('');
    requestAnimationFrame(() => {
      onSearchSubmit?.();
    });
  }, [onSearchChange, onSearchSubmit]);

  const hasSearch = onSearchChange !== undefined;
  const hasFilters = filters.length > 1 && onFilterChange !== undefined;
  const hasSort = sorts.length > 1 && onSortChange !== undefined;
  const hasControls = hasSearch || hasFilters || hasSort;

  if (!hasControls && totalItems === 0) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-5 max-w-[1600px]">
        
        <div className="flex flex-col gap-5">
          
          {/* ─── Top Row: Control Module ─── */}
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
            
            {/* Left: Search Pod */}
            {hasSearch && (
              <div className="flex w-full xl:w-auto items-stretch gap-3">
                <div className="relative group flex-1 xl:w-80">
                  <CustomTextfield
                    type="text"
                    placeholder="Search gallery..."
                    value={searchValue || ''}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    onKeyDown={handleKeyDown}
                    leftIcon={<IconSearch />}
                    rightIcon={searchValue && searchValue.length > 0 ? (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="flex items-center justify-center w-6 h-6 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                        aria-label="Clear search query"
                      >
                        <IconX />
                      </button>
                    ) : undefined}
                    className="w-full h-10"
                  />
                </div>
                
                {/* Search Action Button */}
                <CustomButton
                  variant="continue"
                  size="md"
                  onClick={onSearchSubmit}
                  className="h-10 px-5 shrink-0 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-200 font-medium text-sm rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-2"
                  aria-label="Execute search"
                >
                  <span className="hidden sm:inline">Search</span>
                </CustomButton>
              </div>
            )}

            {/* Right: Dashboard Toggles */}
            {(hasFilters || hasSort) && (
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                
                {/* Filter Segmented Control */}
                {hasFilters && (
                  <div 
                    className="flex bg-zinc-100/80 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700/50 overflow-x-auto no-scrollbar max-w-full backdrop-blur-md transition-colors duration-200" 
                    role="tablist" 
                    aria-label="Filter media by type"
                  >
                    {filters.map((filter) => {
                      const isActive = activeFilter === filter.value;
                      return (
                        <button
                          key={filter.value}
                          onClick={() => onFilterChange?.(filter.value)}
                          role="tab"
                          aria-selected={isActive}
                          className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-900 ${
                            isActive
                              ? 'text-zinc-900 dark:text-white bg-white dark:bg-zinc-700 shadow-sm' 
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
                          }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sort Select */}
                {hasSort && (
                  <div className="relative group min-w-40">
                    <label htmlFor="sort-select" className="sr-only">Sort by</label>
                    <select
                      id="sort-select"
                      value={activeSort}
                      onChange={(e) => onSortChange?.(e.target.value)}
                      className="appearance-none w-full h-10 px-4 pr-10 rounded-lg text-sm font-medium bg-white/80 dark:bg-zinc-800/50 backdrop-blur-md text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-900 cursor-pointer transition-all duration-200"
                    >
                      {sorts.map((sort) => (
                        <option key={sort.value} value={sort.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium">
                          {sort.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 dark:text-zinc-500 transition-colors duration-200">
                      <IconChevronDown />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* ─── Bottom Row: Status Bar ─── */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-1 transition-colors duration-200 gap-3 sm:gap-0">
              
              {/* Left: Asset Count */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors duration-200">
                   <IconGrid />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-none mb-0.5">Showing</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {totalItems.toLocaleString()} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              
              {/* Right: Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                  <span>Page</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">{currentPage}</span>
                  <span className="text-zinc-400 dark:text-zinc-600">of</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">{totalPages}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Utility Styles for Scrollbar Hiding (Zero Layout Shift) */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </header>
  );
});

export default MediaLibraryHeader;