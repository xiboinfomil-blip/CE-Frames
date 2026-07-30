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

// --- Icons (Ultra-Crisp, Thin Strokes for Elegance) ---
const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const IconChevronDown = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const IconGrid = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const IconX = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" strokeWidth={2.5}>
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
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border-b border-zinc-100 dark:border-zinc-800/50 transition-all duration-300">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-5 max-w-[1600px]">
        
        <div className="flex flex-col gap-6">
          
          {/* ─── Top Row: Control Module ─── */}
          <div className="flex flex-col xl:flex-row gap-5 justify-between items-start xl:items-center">
            
            {/* Left: Search Pod - "Floating" Aesthetic */}
            {hasSearch && (
              <div className="flex w-full xl:w-auto items-stretch gap-3">
                <div className="relative group flex-1 xl:w-[400px]">
                  <CustomTextfield
                    type="text"
                    placeholder="Search by name, tag, or date..."
                    value={searchValue || ''}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    onKeyDown={handleKeyDown}
                    leftIcon={<IconSearch />}
                    rightIcon={searchValue && searchValue.length > 0 ? (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white"
                        aria-label="Clear search query"
                      >
                        <IconX />
                      </button>
                    ) : undefined}
                    className="w-full h-12 pl-4 pr-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-300 dark:focus:border-zinc-700 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800/50 transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </div>
                
                {/* Search Action Button - Minimalist Pill */}
                <CustomButton
                  variant="continue"
                  size="md"
                  onClick={onSearchSubmit}
                  className="h-12 px-6 shrink-0 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-300 font-medium text-sm rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:ring-offset-2"
                  aria-label="Execute search"
                >
                  <span className="hidden sm:inline">Search</span>
                </CustomButton>
              </div>
            )}

            {/* Right: Dashboard Toggles */}
            {(hasFilters || hasSort) && (
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                
                {/* Filter Segmented Control - "Soft Capsule" Style */}
                {hasFilters && (
                  <div 
                    className="flex bg-zinc-100/80 dark:bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-x-auto no-scrollbar max-w-full backdrop-blur-md shadow-inner transition-colors duration-200" 
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
                          className={`relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:ring-offset-1 ${
                            isActive
                              ? 'text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 shadow-sm scale-[1.02]' 
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                          }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sort Select - "Clean Glass" Dropdown */}
                {hasSort && (
                  <div className="relative group min-w-48">
                    <label htmlFor="sort-select" className="sr-only">Sort by</label>
                    <select
                      id="sort-select"
                      value={activeSort}
                      onChange={(e) => onSortChange?.(e.target.value)}
                      className="appearance-none w-full h-12 px-5 pr-12 rounded-2xl text-sm font-medium bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-800/60 hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:ring-offset-1 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      {sorts.map((sort) => (
                        <option key={sort.value} value={sort.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium">
                          {sort.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400 dark:text-zinc-500 transition-colors duration-200 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      <IconChevronDown />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* ─── Bottom Row: Status Bar ─── */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 mt-1 transition-colors duration-200 gap-4 sm:gap-0">
              
              {/* Left: Asset Count - Editorial Style */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors duration-200 shadow-sm">
                   <IconGrid />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-zinc-400 dark:text-zinc-500 leading-none mb-1">Gallery Overview</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">
                      {totalItems.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {totalItems === 1 ? 'item' : 'items'} found
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right: Pagination - Minimalist Badge */}
              {totalPages > 1 && (
                <div className="flex items-center gap-3 text-sm font-medium bg-zinc-50/80 dark:bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800/50 backdrop-blur-sm shadow-sm">
                  <span className="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500 font-semibold">Page</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{currentPage}</span>
                  <span className="text-zinc-300 dark:text-zinc-700">of</span>
                  <span className="font-medium text-zinc-600 dark:text-zinc-400 tabular-nums">{totalPages}</span>
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