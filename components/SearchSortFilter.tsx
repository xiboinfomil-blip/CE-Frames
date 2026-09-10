'use client';

import React, { memo, useCallback } from 'react';
import {
  HiMagnifyingGlass,
  HiFunnel,
  HiXMark,
  HiChevronDown,
} from 'react-icons/hi2';

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
  showCount = true,
}: MediaLibraryHeaderProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearchSubmit?.();
      }
    },
    [onSearchSubmit]
  );

  const handleClear = useCallback(() => {
    onSearchChange?.('');
  }, [onSearchChange]);

  const hasSearch = !!onSearchChange;
  const hasFilters = filters.length > 0 && !!onFilterChange;
  const hasSort = sorts.length > 0 && !!onSortChange;

  const selectedSortLabel = sorts.find(
    (s) => s.value === activeSort
  )?.label;

  const isDefaultSort =
    !activeSort || activeSort === sorts[0]?.value;

  if (!hasSearch && !hasFilters && !hasSort && totalItems === 0) {
    return null;
  }

  return (
    <header className="sticky top-4 z-40 px-4 md:px-6 pointer-events-none mb-8">
      <div className="container mx-auto max-w-[1800px] pointer-events-auto">

        {/* Floating Control Deck */}
        <div className="bg-white/95 dark:bg-[#102238]/95 backdrop-blur-xl border border-[#E2E8F0] dark:border-white/10 shadow-2xl shadow-[#00345F]/10 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 transition-all duration-300">

          {/* Left Cluster: Search & Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">

            {/* Search Input */}
            {hasSearch && (
              <div className="relative group flex items-center w-full md:w-auto min-w-[240px] h-10 rounded-xl bg-[#F5F7FA] dark:bg-[#0E1C2D] hover:bg-[#EAF4FB] dark:hover:bg-[#00345F]/50 focus-within:bg-white dark:focus-within:bg-[#102238] focus-within:ring-2 focus-within:ring-[#FF8201]/30 border border-[#E2E8F0] dark:border-white/10 focus-within:border-[#FF8201] transition-all duration-200">

                <div className="pl-3.5 text-[#64748B] group-focus-within:text-[#FF8201] transition-colors">
                  <HiMagnifyingGlass className="w-4 h-4" />
                </div>

                <input
                  type="text"
                  placeholder="Rechercher des éléments..."
                  value={searchValue || ''}
                  onChange={(e) =>
                    onSearchChange?.(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none outline-none px-2.5 text-sm text-[#172033] dark:text-white placeholder:text-[#94A3B8] font-medium"
                />

                <div className="pr-2 flex items-center">
                  {searchValue ? (
                    <button
                      onClick={handleClear}
                      className="p-1 rounded-lg text-[#64748B] hover:text-[#00345F] hover:bg-[#EAF4FB] transition-all"
                      aria-label="Effacer la recherche"
                    >
                      <HiXMark className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={onSearchSubmit}
                      className="p-1 rounded-lg text-[#94A3B8] hover:text-[#004A87] opacity-0 group-hover:opacity-100 transition-all"
                      aria-label="Valider la recherche"
                    >
                      <HiMagnifyingGlass className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            {hasFilters && (
              <nav
                className="flex items-center gap-1 p-1 rounded-xl bg-[#F5F7FA] dark:bg-[#0E1C2D] border border-[#E2E8F0] dark:border-white/10 overflow-x-auto no-scrollbar"
                role="tablist"
              >
                {filters.map((f) => {
                  const active = activeFilter === f.value;

                  return (
                    <button
                      key={f.value}
                      onClick={() =>
                        onFilterChange?.(f.value)
                      }
                      role="tab"
                      aria-selected={active}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                        active
                          ? 'bg-[#004A87] text-white shadow-md shadow-[#004A87]/20'
                          : 'text-[#64748B] dark:text-white/60 hover:text-[#00345F] dark:hover:text-white hover:bg-[#EAF4FB] dark:hover:bg-[#00345F]/50'
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
                  onChange={(e) =>
                    onSortChange?.(e.target.value)
                  }
                  className="appearance-none absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Trier les médias"
                >
                  {sorts.map((s) => (
                    <option
                      key={s.value}
                      value={s.value}
                      className="bg-white dark:bg-[#102238] text-[#172033] dark:text-white"
                    >
                      {s.label}
                    </option>
                  ))}
                </select>

                <div
                  className={`flex items-center gap-2 h-10 px-3.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                    isDefaultSort
                        ? 'bg-[#F5F7FA] dark:bg-[#0E1C2D] border-[#E2E8F0] dark:border-white/10 text-[#64748B] dark:text-white/60 hover:bg-[#EAF4FB] dark:hover:bg-[#00345F]/50'
                      : 'bg-[#FFF1E5] border-[#FF8201]/30 text-[#00345F] shadow-sm'
                  }`}
                >
                  <HiFunnel
                    className={`w-4 h-4 ${
                      isDefaultSort
                        ? 'text-[#64748B]'
                        : 'text-[#FF8201]'
                    }`}
                  />

                  <span>
                    {selectedSortLabel || 'Tri'}
                  </span>

                  <HiChevronDown className="w-3.5 h-3.5 text-[#64748B] opacity-70" />
                </div>
              </div>
            )}

            {/* Asset Count Badge */}
            {showCount && totalItems > 0 && (
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#EAF4FB] border border-[#E2E8F0]">

                <span className="text-xs font-bold text-[#172033] dark:text-white tabular-nums tracking-tight">
                  {totalItems.toLocaleString()}
                </span>

                <span className="text-[10px] uppercase tracking-wider font-bold text-[#64748B]">
                  Éléments
                </span>

              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </header>
  );
});

export default MediaLibraryHeader;