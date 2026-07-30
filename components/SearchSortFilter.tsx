'use client';

import React, { memo, useCallback } from 'react';

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

// --- Icons ---
const IconSearch = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const IconSort = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h18M3 12h12M3 16.5h6" />
  </svg>
);

const IconChevron = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const IconX = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
  
  // Smart Sort State
  const selectedSortLabel = sorts.find(s => s.value === activeSort)?.label;
  const isDefaultSort = !activeSort || activeSort === sorts[0]?.value;

  if (!hasSearch && !hasFilters && !hasSort && totalItems === 0) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800/50 transition-colors duration-300">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 py-3">
        
        {/* Unified Control Bar */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
          
          {/* Left Cluster: Search + Filters */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            
            {/* Ghost Search Input */}
            {hasSearch && (
              <div className="relative group flex items-center w-full md:w-auto md:min-w-[280px] lg:min-w-[360px] h-10 rounded-full bg-zinc-100/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/5 dark:focus-within:ring-white/10 transition-all duration-300">
                <div className="pl-3.5 text-zinc-500 dark:text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors">
                  <IconSearch />
                </div>
                
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchValue || ''}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none outline-none px-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400/80 font-medium"
                />

                <div className="pr-2 flex items-center">
                  {searchValue ? (
                    <button onClick={handleClear} className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all" aria-label="Clear">
                      <IconX />
                    </button>
                  ) : (
                    <button 
                      onClick={onSearchSubmit} 
                      className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-all" 
                      aria-label="Execute search"
                    >
                      <IconSearch className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Divider */}
            {hasSearch && hasFilters && <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1 hidden md:block" />}

            {/* Segmented Filter Control */}
            {hasFilters && (
              <nav className="flex items-center gap-0.5 p-1 rounded-full bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 overflow-x-auto no-scrollbar" role="tablist">
                {filters.map((f) => {
                  const active = activeFilter === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => onFilterChange?.(f.value)}
                      role="tab"
                      aria-selected={active}
                      className={`relative px-4 py-1.5 text-[13px] font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
                        active 
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' 
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Cluster: Sort + Meta */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Adaptive Sort Trigger */}
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

                {/* Visual Representation - Fixed Contrast */}
                <div className={`flex items-center gap-2 h-10 px-3 rounded-full border transition-all duration-300 ${
                  isDefaultSort
                    ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm pl-2.5'
                }`}>
                  {isDefaultSort ? (
                    <IconSort className="w-8 h-4" />
                  ) : (
                    <>
                      <div className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        <IconSort className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[13px] font-semibold pr-1">{selectedSortLabel}</span>
                    </>
                  )}
                  </div>
              </div>
            )}

            {/* Elegant Count Badge */}
            {showCount && totalItems > 0 && (
              <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
                <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">
                  {totalItems.toLocaleString()}
                </span>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                  Assets
                </span>
                {totalPages > 1 && (
                  <>
                    <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-800" />
                    <span className="text-[12px] font-medium text-zinc-500 tabular-nums">
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