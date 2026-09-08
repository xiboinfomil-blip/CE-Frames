'use client';

import React, { useMemo, memo } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

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
  
  // Robust page number calculation
  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    
    // Always show all pages if total pages are 5 or fewer
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always include the first page
    pages.push(1);

    // Left ellipsis
    if (currentPage > 3) {
      pages.push('...');
    }

    // Middle pages around active page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    // Right ellipsis
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always include the last page
    pages.push(totalPages);
    
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <nav 
        className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl" 
        aria-label="Pagination Navigation"
      >
        
        {/* Previous Button */}
        <button
          onClick={() => hasPrevious && onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          aria-label="Go to previous page"
        >
          <HiChevronLeft className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform duration-200" />
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-5 bg-slate-800 mx-0.5" />

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span 
                key={`ellipsis-${index}`} 
                className="w-7 h-9 sm:w-9 sm:h-10 flex items-center justify-center text-xs font-mono font-bold text-slate-600 select-none" 
                aria-hidden="true"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={`Page ${page}`}
                className={`
                  relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-xs font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500
                  ${page === currentPage
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-100 font-bold z-10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }
                `}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-5 bg-slate-800 mx-0.5" />

        {/* Next Button */}
        <button
          onClick={() => hasNext && onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          aria-label="Go to next page"
        >
          <HiChevronRight className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </nav>
    </div>
  );
});

export default Pagination;