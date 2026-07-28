'use client';

import Link from 'next/link';
import { HiChevronDown } from 'react-icons/hi';

export default function DropdownMenu({ title, categories, loading, error, basePath }: any) {
  const visibleCategories = categories?.filter((cat: any) => cat.isVisible !== false) || [];

  return (
    <div className="relative group focus-within">
      
      {/* Trigger Button */}
      <button
        type="button"
        className="group/trigger relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <span>{title}</span>
        <HiChevronDown 
          className="w-4 h-4 transition-transform duration-200 group-hover/trigger:rotate-180 group-focus-within/trigger:rotate-180" 
          aria-hidden="true" 
        />
        
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-stone-900 dark:bg-stone-100 rounded-full transition-all duration-300 group-hover/trigger:w-1/2 group-focus-within/trigger:w-1/2" />
      </button>
      
      {/* Dropdown Panel */}
      <div
        className="absolute left-0 top-full pt-2 w-64 opacity-0 invisible group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0 transition-all duration-200 ease-out z-50"
        role="menu"
        aria-label={`${title} categories`}
      >
        <div className="bg-white/95 dark:bg-stone-950/95 backdrop-blur-xl shadow-xl shadow-stone-200/50 dark:shadow-black/50 border border-stone-200/60 dark:border-stone-800/60 rounded-xl overflow-hidden">
          
          {/* Panel Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100 dark:border-stone-800/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              {title}
            </span>
            <div className="flex-1 h-px bg-stone-100 dark:bg-stone-800" aria-hidden="true" />
          </div>

          {/* Content Area */}
          <div className="p-2">
            {loading ? (
              <div className="flex items-center gap-3 px-3 py-4 text-sm text-stone-500 dark:text-stone-400">
                <svg className="animate-spin h-4 w-4 text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading categories...</span>
              </div>
            ) : error ? (
              <div className="px-3 py-4 text-sm text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-900/50 rounded-lg text-center border border-stone-100 dark:border-stone-800">
                Unable to load categories.
              </div>
            ) : visibleCategories.length > 0 ? (
              <div className="space-y-0.5 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-700 scrollbar-track-transparent pr-1">
                {visibleCategories.map((categoryObj: any) => (
                  <Link
                    key={categoryObj.name}
                    href={`${basePath}?for=${encodeURIComponent(categoryObj.name)}`}
                    className="group/item relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                    role="menuitem"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 group-hover/item:bg-stone-900 dark:group-hover/item:bg-stone-100 transition-colors duration-200" aria-hidden="true" />
                    <span className="capitalize truncate">{categoryObj.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-3 py-4 text-sm text-stone-500 dark:text-stone-400 text-center">
                No categories available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}