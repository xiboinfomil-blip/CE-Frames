'use client';

import React from 'react';
import { 
  HiMagnifyingGlass, 
  HiBarsArrowDown, 
  HiBarsArrowUp, 
  HiBars3BottomLeft, 
  HiXMark 
} from 'react-icons/hi2';

interface GalleryControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'newest' | 'oldest' | 'name';
  setSortBy: (sort: 'newest' | 'oldest' | 'name') => void;
  filterType: 'all' | 'public' | 'password_protected';
  setFilterType: (filter: 'all' | 'public' | 'password_protected') => void;
  resultsCount: number;
}

export default function GalleryControls({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  filterType,
  setFilterType,
  resultsCount,
}: GalleryControlsProps) {
  const getSortIcon = () => {
    switch (sortBy) {
      case 'newest':
        return <HiBarsArrowDown className="w-4 h-4" />;
      case 'oldest':
        return <HiBarsArrowUp className="w-4 h-4" />;
      case 'name':
        return <HiBars3BottomLeft className="w-4 h-4" />;
    }
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'newest':
        return 'Newest First';
      case 'oldest':
        return 'Oldest First';
      case 'name':
        return 'Name (A-Z)';
    }
  };

  const handleSortClick = () => {
    setSortBy(
      sortBy === 'newest' ? 'oldest' : sortBy === 'oldest' ? 'name' : 'newest'
    );
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-[80px] z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4">
          
          {/* Left Side: Search Input & Filter Pills */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <HiMagnifyingGlass className="h-4 h-4 text-slate-500 group-focus-within:text-rose-400 transition-colors" />
              </div>

              <input
                type="text"
                placeholder="Search galleries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all duration-200 text-sm text-slate-100 placeholder-slate-500 shadow-inner"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="inline-flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 self-start sm:self-auto">
              {(['all', 'public', 'password_protected'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                    filterType === type
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {type === 'password_protected'
                    ? 'Protected'
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Results Counter & Sort Toggle */}
          <div className="flex items-center justify-between xl:justify-end gap-4 pt-1 xl:pt-0 border-t xl:border-t-0 border-slate-800/50">
            
            {/* Results Count Indicator */}
            <div className="text-xs text-slate-400 font-medium">
              Showing <span className="text-rose-400 font-bold">{resultsCount}</span> {resultsCount === 1 ? 'gallery' : 'galleries'}
            </div>

            {/* Sort Dropdown / Cycle Button */}
            <button
              type="button"
              onClick={handleSortClick}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 group"
            >
              <span className="text-slate-400 group-hover:text-rose-400 transition-colors">
                {getSortIcon()}
              </span>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-100">
                {getSortLabel()}
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}