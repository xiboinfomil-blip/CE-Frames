'use client';

import React, { useMemo, memo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination = memo(function Pagination({ 
  currentPage, 
  totalPages, 
  hasNext, 
  hasPrevious, 
  onPageChange,
  className = "mt-12 mb-8"
}: PaginationProps) {
  
  if (totalPages <= 1) return null;

  // Memoize page number calculation
  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    const maxVisible = 3; 
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 2) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) pages.push(i);
      }
      
      if (currentPage < totalPages - 1) pages.push('...');
      if (totalPages > 1) pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <nav className="inline-flex items-center gap-2 p-2 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm animate-slideUpFade" aria-label="Pagination">
        
        {/* Previous Button */}
        <button
          onClick={() => hasPrevious && onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:ring-offset-2"
          aria-label="Previous Page"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

        {/* Page Numbers Container */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-zinc-400 dark:text-zinc-500 select-none" aria-hidden="true">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`
                  relative w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:ring-offset-1
                  ${page === currentPage
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md scale-105 z-10' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }
                `}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

        {/* Next Button */}
        <button
          onClick={() => hasNext && onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:ring-offset-2"
          aria-label="Next Page"
        >
          <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </nav>

      {/* Inline Styles for Custom Animations */}
      <style jsx>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUpFade { animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
});

export default Pagination;