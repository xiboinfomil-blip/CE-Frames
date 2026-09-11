'use client';

import React, { memo, useCallback, useState } from 'react';
import {
  HiAdjustmentsHorizontal,
  HiMagnifyingGlass,
  HiFunnel,
  HiXMark,
  HiChevronDown,
  HiChevronUp,
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
  actions?: React.ReactNode;
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
  actions,
}: MediaLibraryHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
      <div className="container mx-auto max-w-[1800px] pointer-events-auto flex items-start gap-3">

        {/* Floating Control Deck */}
        <div className="bg-white/95 dark:bg-[#102238]/95 backdrop-blur-xl border border-[#E2E8F0] dark:border-white/10 shadow-2xl shadow-[#00345F]/10 rounded-2xl p-3 md:p-4 flex flex-col gap-3.5 transition-all duration-300">
          <button
            type="button"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            aria-expanded={isExpanded}
            aria-controls="search-sort-filter-controls"
            className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-1 text-left text-sm font-semibold text-[#00345F] transition-colors hover:bg-[#EAF4FB] dark:text-white dark:hover:bg-white/5"
          >
            <span className="flex items-center gap-2">
              <HiAdjustmentsHorizontal className="h-5 w-5 text-[#FF8201]" />
              <span>Recherche et filtres</span>
            </span>
            {isExpanded ? (
              <HiChevronUp className="h-4 w-4 text-[#64748B]" />
            ) : (
              <HiChevronDown className="h-4 w-4 text-[#64748B]" />
            )}
          </button>

          {isExpanded && (
            <div id="search-sort-filter-controls" className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-end">
              {hasSearch && (
                <div className="flex w-full flex-1 flex-col gap-1 md:max-w-[420px]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B] dark:text-white/55">
                    Recherche
                  </span>
                  <div className="relative group flex items-center h-11 rounded-xl bg-[#F5F7FA] dark:bg-[#0E1C2D] hover:bg-[#EAF4FB] dark:hover:bg-[#00345F]/50 focus-within:bg-white dark:focus-within:bg-[#102238] focus-within:ring-2 focus-within:ring-[#FF8201]/30 border border-[#E2E8F0] dark:border-white/10 focus-within:border-[#FF8201] transition-all duration-200">
                    <div className="pl-3.5 text-[#64748B] group-focus-within:text-[#FF8201] transition-colors">
                      <HiMagnifyingGlass className="w-4 h-4" />
                    </div>

                    <label htmlFor="media-search" className="sr-only">
                      Rechercher des éléments
                    </label>
                    <input
                      id="media-search"
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
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#00345F] hover:bg-[#EAF4FB] transition-all"
                          aria-label="Effacer la recherche"
                        >
                          <HiXMark className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={onSearchSubmit}
                          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#004A87] opacity-0 group-hover:opacity-100 transition-all"
                          aria-label="Valider la recherche"
                        >
                          <HiMagnifyingGlass className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {hasFilters && (
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B] dark:text-white/55">
                    Filtrer
                  </span>
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
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 justify-between md:justify-end">
              {hasSort && (
                <div className="flex min-w-[170px] flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B] dark:text-white/55">
                    Trier
                  </span>
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
                      className={`flex items-center justify-between gap-2 h-11 w-full min-w-[170px] px-3.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                        isDefaultSort
                          ? 'bg-[#F5F7FA] dark:bg-[#0E1C2D] border-[#E2E8F0] dark:border-white/10 text-[#64748B] dark:text-white/60 hover:bg-[#EAF4FB] dark:hover:bg-[#00345F]/50'
                          : 'bg-[#FFF1E5] border-[#FF8201]/30 text-[#00345F] shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <HiFunnel
                          className={`w-4 h-4 ${
                            isDefaultSort
                              ? 'text-[#64748B]'
                              : 'text-[#FF8201]'
                          }`}
                        />

                        <span className="truncate">
                          {selectedSortLabel || 'Tri'}
                        </span>
                      </div>

                      <HiChevronDown className="w-3.5 h-3.5 text-[#64748B] opacity-70 shrink-0" />
                    </div>
                  </div>
                </div>
              )}

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
          )}
        </div>
        {actions}
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