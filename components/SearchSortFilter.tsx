'use client';

import React, { memo, useCallback } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { HiFunnel } from 'react-icons/hi2';
import { HiXMark } from 'react-icons/hi2';
import { HiChevronDown } from 'react-icons/hi2';

// --- Types ---
export interface FilterOption { value: string; label: string; }
export interface SortOption { value: string; label: string; }

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
  showCount?: boolean;
}

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
  totalPages = 1,
  showCount = true
}: MediaLibraryHeaderProps) {
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchSubmit?.();
    }
  }, [onSearchSubmit]);

  const handleClear = useCallback(() => {
    onSearchChange?.('');
  }, [onSearchChange]);

  const hasSearch = !!onSearchChange;
  const hasFilters = filters.length > 1 && !!onFilterChange;
  const hasSort = sorts.length > 1 && !!onSortChange;
  
  const selectedSortLabel = sorts.find(s => s.value === activeSort)?.label;
  const isDefaultSort = !activeSort || activeSort === sorts[0]?.value;

  if (!hasSearch && !hasFilters && !hasSort && totalItems === 0) return null;

  return (
    <header className="sticky top-4 z-50 px-4 md:px-6 pointer-events-none">
      <div className="container mx-auto max-w-[1800px] pointer-events-auto">
        
        {/* The Floating Rectangular Control Deck */}
        <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300">
          
          {/* Left Cluster: Search & Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            
            {/* Search Input - Dynamic Width (Only what is needed) */}
            {hasSearch && (
              <div className="relative group flex items-center w-fit min-w-[240px] h-12 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/5 dark:focus-within:ring-white/10 transition-all duration-300 border border-transparent focus-within:border-zinc-200 dark:focus-within:border-zinc-800">
                <div className="pl-4 text-zinc-500 dark:text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors">
                  <HiMagnifyingGlass className="w-5 h-5" />
                </div>
                
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchValue || ''}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none outline-none px-3 text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400/80 font-medium min-w-[120px]"
                />

                <div className="pr-3 flex items-center">
                  {searchValue ? (
                    <button onClick={handleClear} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all" aria-label="Clear">
                      <HiXMark className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={onSearchSubmit} 
                      className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-all" 
                      aria-label="Execute search"
                    >
                      <HiMagnifyingGlass className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Filters - Rectangular Tabs */}
            {hasFilters && (
              <nav className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 overflow-x-auto no-scrollbar" role="tablist">
                {filters.map((f) => {
                  const active = activeFilter === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => onFilterChange?.(f.value)}
                      role="tab"
                      aria-selected={active}
                      className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                        active 
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' 
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Cluster: Sort & Count */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            
            {/* Sort - Rectangular Dropdown */}
            {hasSort && (
              <div className="relative inline-flex items-center group">
                <select
                  value={activeSort || ''}
                  onChange={(e) => onSortChange?.(e.target.value)}
                  className="appearance-none absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Sort media"
                >
                  {sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>

                <div className={`flex items-center gap-3 h-12 px-4 rounded-xl border transition-all duration-300 ${
                  isDefaultSort
                    ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                }`}>
                  <HiFunnel className={`w-5 h-5 ${isDefaultSort ? 'opacity-70' : 'text-zinc-900 dark:text-zinc-100'}`} />
                  {!isDefaultSort && (
                    <span className="text-sm font-semibold pr-1">{selectedSortLabel}</span>
                  )}
                  <HiChevronDown className="w-4 h-4 opacity-50" />
                </div>
              </div>
            )}

            {/* Count Badge - Rectangular & Clean */}
            {showCount && totalItems > 0 && (
              <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">
                  {totalItems.toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                  Assets
                </span>
                {totalPages > 1 && (
                  <>
                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />
                    <span className="text-xs font-medium text-zinc-500 tabular-nums">
                      {currentPage}<span className="text-zinc-300 dark:text-zinc-700 mx-0.5">/</span>{totalPages}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </header>
  );
});

export default MediaLibraryHeader;