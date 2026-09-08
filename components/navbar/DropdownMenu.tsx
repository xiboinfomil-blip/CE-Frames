'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiArrowPath } from 'react-icons/hi2';

// --- Type Definitions ---
interface Category {
  name: string;
  isVisible?: boolean;
}

interface DropdownMenuProps {
  title: string;
  categories: Category[] | null | undefined;
  loading: boolean;
  error: string | null | undefined;
  basePath: string;
}

export default function DropdownMenu({
  title,
  categories,
  loading,
  error,
  basePath,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleCategories =
    categories?.filter((cat) => cat.isVisible !== false) || [];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group/trigger relative flex items-center gap-1.5 px-2 py-2 text-sm font-medium tracking-wide transition-colors duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
          ${
            isOpen
              ? 'text-slate-100'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <HiChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ease-out group-hover/trigger:text-slate-200
            ${isOpen ? 'rotate-180 text-slate-100' : ''}`}
          aria-hidden="true"
        />

        {/* Animated Underline */}
        <span
          className={`absolute bottom-0 left-0 h-0.5 bg-rose-500 rounded-full transition-all duration-300 ease-out
            ${isOpen ? 'w-full' : 'w-0 group-hover/trigger:w-full'}`}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-full pt-2 w-72 z-50"
            role="menu"
            aria-label={`${title} categories`}
          >
            <div className="bg-slate-950/95 backdrop-blur-2xl shadow-2xl shadow-slate-950/80 border border-slate-800/80 rounded-2xl overflow-hidden ring-1 ring-slate-800/50">
              
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {title}
                </span>
                <div className="flex-1 h-px bg-slate-800/60" aria-hidden="true" />
              </div>

              {/* Content Area */}
              <div className="p-2">
                {loading ? (
                  <div className="flex items-center justify-center gap-2.5 px-3 py-6 text-sm text-slate-400">
                    <HiArrowPath
                      className="animate-spin h-4 w-4 text-rose-400"
                      aria-hidden="true"
                    />
                    <span className="font-medium">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="px-3 py-4 text-xs text-rose-400 bg-rose-950/30 rounded-xl text-center border border-rose-900/40">
                    Unable to load categories.
                  </div>
                ) : visibleCategories.length > 0 ? (
                  <div className="space-y-0.5 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent pr-1">
                    {visibleCategories.map((categoryObj) => (
                      <Link
                        key={categoryObj.name}
                        href={`${basePath}?for=${encodeURIComponent(
                          categoryObj.name
                        )}`}
                        onClick={() => setIsOpen(false)}
                        className="group/item relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                        role="menuitem"
                      >
                        {/* Indicator Dot */}
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover/item:bg-rose-400 group-hover/item:scale-125 transition-all duration-200"
                          aria-hidden="true"
                        />
                        <span className="capitalize truncate">
                          {categoryObj.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-6 text-xs text-slate-500 text-center font-medium">
                    No categories available
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}