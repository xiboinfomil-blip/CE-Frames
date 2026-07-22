'use client';

import Link from 'next/link';
import { HiChevronDown } from 'react-icons/hi';

export default function DropdownMenu({ title, categories, loading, error, basePath }: any) {
  // Filter to only show categories marked as visible
  const visibleCategories = categories?.filter((cat: any) => cat.isVisible !== false) || [];

  return (
    <div className="relative group">
      {/* Trigger Button */}
      <button
        className="group/trigger relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider italic text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
        aria-haspopup="true"
      >
        <span>{title}</span>
        <HiChevronDown className="w-4 h-4 transition-transform duration-300 group-hover/trigger:rotate-180" />
        
        {/* Racing stripe underline on hover */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gradient-to-r from-red-500 to-orange-500 group-hover/trigger:w-3/4 transition-all duration-300" />
      </button>
      
      {/* Dropdown Panel 
          Note: pt-2 creates a transparent bridge so the menu doesn't close when moving mouse down 
      */}
      <div
        className="absolute left-0 top-full pt-2 w-60 opacity-0 invisible group-hover:visible group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out z-50"
      >
        <div className="bg-white/98 dark:bg-zinc-900/98 backdrop-blur-xl shadow-xl shadow-black/10 dark:shadow-black/40 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl p-2 overflow-hidden relative">
          
          {/* Top racing stripe */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_10px_rgba(239,68,68,0.5)]" />

          {/* Panel Header */}
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 italic">
              {title}
            </span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-red-500/30 to-transparent" />
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700 to-transparent mb-2" />

          {loading ? (
            <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-400 italic">
              <svg className="animate-spin h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading track data...</span>
            </div>
          ) : error ? (
            <div className="px-3 py-2.5 text-sm text-red-500 bg-red-50/50 dark:bg-red-900/20 rounded-lg border-l-2 border-red-500 italic">
              {error}
            </div>
          ) : visibleCategories.length > 0 ? (
            <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 dark:scrollbar-thumb-red-700">
              {visibleCategories.map((categoryObj: any) => (
                <div key={categoryObj.name} className="group/item relative flex items-center rounded-lg hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-all duration-200">
                  <Link
                    href={`${basePath}?for=${encodeURIComponent(categoryObj.name)}`}
                    className="flex-1 flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/40 group-hover/item:bg-red-500 group-hover/item:shadow-[0_0_6px_rgba(239,68,68,0.6)] transition-all" />
                    <span className="capitalize truncate">{categoryObj.name}</span>
                    {/* Racing stripe underline on hover */}
                    <div className="absolute bottom-0 left-3 right-3 h-[1px] bg-gradient-to-r from-red-500 to-orange-500 scale-x-0 group-hover/item:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-400 italic text-center">
              No visible categories
            </div>
          )}

          {/* Bottom racing stripe */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
        </div>
      </div>
    </div>
  );
}