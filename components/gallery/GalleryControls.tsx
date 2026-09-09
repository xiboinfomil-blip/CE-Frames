'use client';

import React from 'react';
import {
HiMagnifyingGlass,
HiBarsArrowDown,
HiBarsArrowUp,
HiBars3BottomLeft,
HiXMark,
} from 'react-icons/hi2';

interface GalleryControlsProps {
searchQuery: string;
setSearchQuery: (query: string) => void;
sortBy: 'newest' | 'oldest' | 'name';
setSortBy: (sort: 'newest' | 'oldest' | 'name') => void;
filterType: 'all' | 'public' | 'password_protected';
setFilterType: (
filter: 'all' | 'public' | 'password_protected'
) => void;
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
sortBy === 'newest'
? 'oldest'
: sortBy === 'oldest'
? 'name'
: 'newest'
);
};

return ( <div className="sticky top-[80px] z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md transition-colors"> <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5"> <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4">

```
      {/* Left Side: Search Input & Filter Pills */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">

        {/* Search Input */}
        <div className="relative flex-1 max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiMagnifyingGlass className="w-4 h-4 text-[#94A3B8] group-focus-within:text-[#004A87] transition-colors" />
          </div>

          <input
            type="text"
            placeholder="Search galleries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8201]/25 focus:border-[#FF8201] transition-all duration-200 text-sm text-[#172033] placeholder-[#94A3B8] shadow-sm"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search input"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#004A87] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] rounded-md"
            >
              <HiXMark className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="inline-flex items-center p-1 bg-[#F5F7FA] rounded-xl border border-[#E2E8F0] self-start sm:self-auto">
          {(
            ['all', 'public', 'password_protected'] as const
          ).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] ${
                filterType === type
                  ? 'bg-[#004A87] text-white shadow-md shadow-[#004A87]/20'
                  : 'text-[#64748B] hover:text-[#00345F] hover:bg-[#EAF4FB]'
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
      <div className="flex items-center justify-between xl:justify-end gap-4 pt-1 xl:pt-0 border-t xl:border-t-0 border-[#E2E8F0]">

        {/* Results Count Indicator */}
        <div className="text-xs text-[#64748B] font-medium">
          Showing{' '}
          <span className="text-[#FF8201] font-bold">
            {resultsCount}
          </span>{' '}
          {resultsCount === 1 ? 'gallery' : 'galleries'}
        </div>

        {/* Sort Dropdown / Cycle Button */}
        <button
          type="button"
          onClick={handleSortClick}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl hover:border-[#004A87]/30 hover:bg-[#EAF4FB] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] group"
        >
          <span className="text-[#64748B] group-hover:text-[#004A87] transition-colors">
            {getSortIcon()}
          </span>

          <span className="text-xs font-semibold text-[#172033] group-hover:text-[#00345F]">
            {getSortLabel()}
          </span>
        </button>
      </div>

    </div>
  </div>
</div>

);
}
