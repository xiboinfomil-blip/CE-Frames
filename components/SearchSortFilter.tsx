'use client';

import React, { memo, useCallback } from 'react';
import { 
  HiMagnifyingGlass, 
  HiFunnel, 
  HiXMark, 
  HiChevronDown 
} from 'react-icons/hi2';

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
  const hasFilters = filters.length > 0 && !!onFilterChange;
  const hasSort = sorts.length > 0 && !!onSortChange;
  
  const selectedSortLabel = sorts.find(s => s.value === activeSort)?.label;
  const isDefaultSort = !activeSort || activeSort === sorts[0]?.value;

  if (!hasSearch && !hasFilters && !hasSort && totalItems === 0) return null;

  return (
    <header className="sticky top-4 z-40 px-4 md:px-6 pointer-events-none mb-8">
      <div className="container mx-auto max-w-[1800px] pointer-events-auto">
        
        {/* Floating Control Deck */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-slate-950/50 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 transition-all duration-300">
          
          {/* Left Cluster: Search & Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            
            {/* Search Input */}
            {hasSearch && (
              <div className="relative group flex items-center w-full md:w-auto min-w-[240px] h-10 rounded-xl bg-slate-800/60 hover:bg-slate-800 focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-rose-500/50 border border-slate-700/50 transition-all duration-200">
                <div className="pl-3.5 text-slate-400 group-focus-within:text-rose-400 transition-colors">
                  <HiMagnifyingGlass className="w-4 h-4" />
                </div>
                
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchValue || ''}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none outline-none px-2.5 text-sm text-slate-100 placeholder:text-slate-500 font-medium"
                />

                <div className="pr-2 flex items-center">
                  {searchValue ? (
                    <button 
                      onClick={handleClear} 
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 transition-all" 
                      aria-label="Clear search"
                    >
                      <HiXMark className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={onSearchSubmit} 
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-all" 
                      aria-label="Submit search"
                    >
                      <HiMagnifyingGlass className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            {hasFilters && (
              <nav className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/50 border border-slate-800/60 overflow-x-auto no-scrollbar" role="tablist">
                {filters.map((f) => {
                  const active = activeFilter === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => onFilterChange?.(f.value)}
                      role="tab"
                      aria-selected={active}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                        active 
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Cluster: Sorting Dropdown & Asset Counters */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            
            {/* Sort Dropdown */}
            {hasSort && (
              <div className="relative inline-flex items-center group">
                <select
                  value={activeSort || ''}
                  onChange={(e) => onSortChange?.(e.target.value)}
                  className="appearance-none absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Sort media"
                >
                  {sorts.map((s) => <option key={s.value} value={s.value} className="bg-slate-900 text-slate-100">{s.label}</option>)}
                </select>

                <div className={`flex items-center gap-2 h-10 px-3.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                  isDefaultSort
                    ? 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    : 'bg-rose-600/10 border-rose-500/30 text-rose-300 shadow-sm'
                }`}>
                  <HiFunnel className={`w-4 h-4 ${isDefaultSort ? 'text-slate-400' : 'text-rose-400'}`} />
                  <span>{selectedSortLabel || 'Sort'}</span>
                  <HiChevronDown className="w-3.5 h-3.5 text-slate-400 opacity-70" />
                </div>
              </div>
            )}

            {/* Asset Count Badge */}
            {showCount && totalItems > 0 && (
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs font-bold text-slate-100 tabular-nums tracking-tight">
                  {totalItems.toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Assets
                </span>
                {totalPages > 1 && (
                  <>
                    <div className="w-px h-3 bg-slate-800" />
                    <span className="text-xs font-medium text-slate-400 tabular-nums">
                      {currentPage}<span className="text-slate-600 mx-0.5">/</span>{totalPages}
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