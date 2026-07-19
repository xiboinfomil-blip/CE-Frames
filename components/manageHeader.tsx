'use client';

import React, { memo, useCallback } from 'react';

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
  // State & Handlers
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  filters?: FilterOption[];
  
  activeSort?: string;
  onSortChange?: (value: string) => void;
  sorts?: SortOption[];
  
  // Stats
  totalItems: number;
  currentPage?: number;
  totalPages?: number;
}

// --- Icons (Optimized SVGs) ---
const IconSearch = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
  </svg>
);

const IconGrid = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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
      onSearchSubmit?.();
    }
  }, [onSearchSubmit]);

  // Logic to determine visibility
  const hasSearch = onSearchChange !== undefined;
  const hasFilters = filters.length > 1 && onFilterChange !== undefined;
  const hasSort = sorts.length > 1 && onSortChange !== undefined;
  const hasControls = hasSearch || hasFilters || hasSort;

  if (!hasControls && totalItems === 0) return null;

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md bg-opacity-95">
      <div className="container mx-auto px-4 py-4 max-w-[1600px]">
        
        <div className="flex flex-col gap-5">
          
          {/* Top Row: Controls */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            
            {/* Left: Search Input (The "Telemetry Readout") */}
            {hasSearch && (
              <div className="relative group w-full lg:w-[400px]">
                <label htmlFor="media-search" className="sr-only">Search media library</label>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-zinc-400 group-focus-within:text-red-600 transition-colors duration-300">
                    <IconSearch />
                  </span>
                </div>
                <input
                  id="media-search"
                  type="text"
                  placeholder="SEARCH ASSETS..."
                  value={searchValue || ''}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="block w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 font-mono tracking-wide shadow-inner"
                />
                {/* Active Indicator Line */}
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-red-600 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            )}

            {/* Right: Dashboard Controls */}
            {(hasFilters || hasSort) && (
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                
                {/* Filter Segmented Control */}
                {hasFilters && (
                  <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 overflow-x-auto no-scrollbar max-w-full" role="tablist" aria-label="Filter options">
                    {filters.map((filter) => {
                      const isActive = activeFilter === filter.value;
                      return (
                        <button
                          key={filter.value}
                          onClick={() => onFilterChange?.(filter.value)}
                          role="tab"
                          aria-selected={isActive}
                          className={`relative px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 ${
                            isActive
                              ? 'text-slate-900 shadow-sm bg-white' 
                              : 'text-zinc-500 hover:text-slate-700 hover:bg-zinc-200/50'
                          }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sort Select (Styled as a Gauge) */}
                {hasSort && (
                  <div className="relative min-w-[160px] group">
                    <label htmlFor="sort-select" className="sr-only">Sort by</label>
                    <select
                      id="sort-select"
                      value={activeSort}
                      onChange={(e) => onSortChange?.(e.target.value)}
                      className="appearance-none w-full bg-white border border-zinc-200 text-slate-700 text-xs font-bold uppercase tracking-wider py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 cursor-pointer hover:border-zinc-300 hover:shadow-md transition-all duration-200 font-mono"
                    >
                      {sorts.map((sort) => (
                        <option key={sort.value} value={sort.value}>
                          {sort.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400 group-hover:text-red-500 transition-colors duration-200">
                      <IconChevronDown />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Bottom Row: Telemetry Bar */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-dashed border-zinc-200 mt-1">
              
              {/* Left: Live Count */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-50 border border-red-100">
                   <IconGrid />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] leading-none mb-0.5">Total Assets</span>
                  <span className="text-sm font-mono font-bold text-slate-900 tabular-nums">
                    {totalItems.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Right: Pagination Status */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Page</span>
                  <span className="text-sm font-mono font-bold text-slate-900 tabular-nums">
                    {currentPage}
                  </span>
                  <span className="text-zinc-300 font-bold">/</span>
                  <span className="text-sm font-mono font-bold text-zinc-500 tabular-nums">
                    {totalPages}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles for Scrollbar Hiding & Animations */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </header>
  );
});

export default MediaLibraryHeader;