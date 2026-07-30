'use client';

import Link from 'next/link';
import { HiChevronDown } from 'react-icons/hi';

export default function DropdownMenu({ title, categories, loading, error, basePath }: any) {
  const visibleCategories = categories?.filter((cat: any) => cat.isVisible !== false) || [];

  return (
    <div className="relative group focus-within">
      
      {/* Trigger Button - Minimalist & Clean */}
      <button
        type="button"
        className="group/trigger relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <span>{title}</span>
        <HiChevronDown 
          className="w-4 h-4 transition-transform duration-300 ease-out group-hover/trigger:rotate-180 group-focus-within/trigger:rotate-180" 
          aria-hidden="true" 
        />
        
        {/* Subtle Underline Animation */}
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-300 group-hover/trigger:w-1/2 group-focus-within/trigger:w-1/2" />
      </button>
      
      {/* Dropdown Panel - Premium Glassmorphism */}
      <div
        className="absolute left-0 top-full pt-3 w-72 opacity-0 invisible group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0 transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) z-50"
        role="menu"
        aria-label={`${title} categories`}
      >
        <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
          
          {/* Panel Header - Editorial Style */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/50">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              {title}
            </span>
            <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" aria-hidden="true" />
          </div>

          {/* Content Area */}
          <div className="p-3">
            {loading ? (
              <div className="flex items-center justify-center gap-3 px-3 py-8 text-sm text-zinc-500 dark:text-zinc-400">
                <svg className="animate-spin h-4 w-4 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium">Loading...</span>
              </div>
            ) : error ? (
              <div className="px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl text-center border border-zinc-100 dark:border-zinc-800">
                Unable to load categories.
              </div>
            ) : visibleCategories.length > 0 ? (
              <div className="space-y-1 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent pr-1">
                {visibleCategories.map((categoryObj: any) => (
                  <Link
                    key={categoryObj.name}
                    href={`${basePath}?for=${encodeURIComponent(categoryObj.name)}`}
                    className="group/item relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    role="menuitem"
                  >
                    {/* Focus Point Indicator */}
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 group-hover/item:bg-zinc-900 dark:group-hover/item:bg-zinc-100 group-hover/item:scale-125 transition-all duration-200" aria-hidden="true" />
                    <span className="capitalize truncate">{categoryObj.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400 text-center font-medium">
                No categories available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}