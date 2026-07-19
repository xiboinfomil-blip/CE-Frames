'use client';

import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaAlignLeft } from 'react-icons/fa';

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
      case 'newest': return <FaSortAmountDown className="w-4 h-4" />;
      case 'oldest': return <FaSortAmountUp className="w-4 h-4" />;
      case 'name': return <FaAlignLeft className="w-4 h-4" />;
    }
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'name': return 'Name (A-Z)';
    }
  };

  const handleSortClick = () => {
    setSortBy(sortBy === 'newest' ? 'oldest' : sortBy === 'oldest' ? 'name' : 'newest');
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border-b border-gray-200/50 sticky top-[80px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          {/* Left Side: Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search racecar galleries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 outline-none text-gray-700 placeholder-gray-400 shadow-sm"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center p-1 bg-gray-100/80 rounded-xl border border-gray-200">
              {(['all', 'public', 'password_protected'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filterType === type
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
                >
                  {type === 'password_protected' ? 'Protected' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Sort & Count */}
          <div className="flex items-center justify-between xl:justify-end gap-4">
            
            {/* Results Count */}
            <div className="text-sm text-gray-500 font-medium hidden sm:block">
              <span className="text-blue-600 font-bold">{resultsCount}</span> results
            </div>

            {/* Sort Button */}
            <button
              onClick={handleSortClick}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 group"
            >
              <span className="text-gray-400 group-hover:text-blue-500 transition-colors">
                {getSortIcon()}
              </span>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                {getSortLabel()}
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}