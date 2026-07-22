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

// --- Icons (Optimized, Crisp SVGs) ---
const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
  </svg>
);

const IconGrid = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const IconX = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
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
    // Defer search submission to allow React state to flush
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
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] transition-colors duration-300">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-5 max-w-[1600px]">
        
        <div className="flex flex-col gap-6">
          
          {/* ─── Top Row: Control Module ─── */}
          <div className="flex flex-col xl:flex-row gap-5 justify-between items-start xl:items-center">
            
            {/* Left: Search Pod (Unified Aerodynamic Control) */}
            {hasSearch && (
              <div className="flex w-full xl:w-auto items-stretch gap-3">
                <div className="relative group flex-1 xl:w-95">
                  <CustomTextfield
                    type="text"
                    placeholder="SEARCH ASSETS..."
                    value={searchValue || ''}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    onKeyDown={handleKeyDown}
                    leftIcon={<IconSearch />}
                    rightIcon={searchValue && searchValue.length > 0 ? (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="group/clear flex items-center justify-center w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
                        aria-label="Clear search query"
                      >
                        <IconX />
                      </button>
                    ) : undefined}
                    className="w-full h-11"
                  />
                </div>
                
                {/* Search Action Button */}
                <CustomButton
                  variant="continue"
                  size="md"
                  onClick={onSearchSubmit}
                  leftIcon={<IconSearch />}
                  className="h-11 px-6 shrink-0 shadow-red-500/20 hover:shadow-red-500/40"
                  aria-label="Execute search"
                >
                  <span className="hidden sm:inline">Search</span>
                </CustomButton>
              </div>
            )}

            {/* Right: Dashboard Toggles */}
            {(hasFilters || hasSort) && (
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                
                {/* Filter Segmented Control (Physical Toggle Bank) */}
                {hasFilters && (
                  <div 
                    className="flex bg-zinc-100/80 dark:bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar max-w-full backdrop-blur-md transition-colors duration-300" 
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
                          className={`relative px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] rounded-lg transition-all duration-200 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 ${
                            isActive
                              ? 'text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.5)]' 
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                          }`}
                        >
                          {filter.label}
                          {/* Active Indicator "Rev Line" */}
                          {isActive && (
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-red-600 dark:bg-red-500 rounded-full shadow-[0_0_8px_-1px_rgba(220,38,38,0.6)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sort Select (Telemetry Gauge) */}
                {hasSort && (
                  <div className="relative group min-w-40">
                    <label htmlFor="sort-select" className="sr-only">Sort by</label>
                    <select
                      id="sort-select"
                      value={activeSort}
                      onChange={(e) => onSortChange?.(e.target.value)}
                      className="appearance-none w-full h-11 px-4 pr-10 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)] hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 focus:border-red-500/50 cursor-pointer transition-all duration-200"
                    >
                      {sorts.map((sort) => (
                        <option key={sort.value} value={sort.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium normal-case tracking-normal">
                          {sort.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400 dark:text-zinc-500 group-focus-within:text-red-600 dark:group-focus-within:text-red-400 transition-colors duration-200">
                      <IconChevronDown />
                    </div>
                    {/* Aerodynamic Focus Line */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full bg-linear-to-r from-transparent via-red-600 to-transparent transition-all duration-500 ease-out group-focus-within:w-[85%]" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* ─── Bottom Row: Telemetry Data Bar ─── */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 mt-1 transition-colors duration-300 gap-3 sm:gap-0">
              
              {/* Left: Live Asset Count */}
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 transition-colors duration-300">
                   <IconGrid />
                   {/* Pulsing "Live" Dot */}
                   <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-zinc-950"></span>
                   </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] leading-none mb-1">Total Assets</span>
                  <span className="text-base font-mono font-black text-zinc-900 dark:text-zinc-50 tabular-nums tracking-tight transition-colors duration-300">
                    {totalItems.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Right: Pagination Telemetry */}
              {totalPages > 1 && (
                <div className="flex items-center gap-3 bg-zinc-50/80 dark:bg-zinc-900/40 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm transition-colors duration-300">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em]">Page</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-mono font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {currentPage}
                    </span>
                    <span className="text-xs font-bold text-zinc-300 dark:text-zinc-700">/</span>
                    <span className="text-sm font-mono font-bold text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {totalPages}
                    </span>
                  </div>
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