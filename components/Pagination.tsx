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
  className = "mt-12"
}: PaginationProps) {
  
  if (totalPages <= 1) return null;

  // Memoize page number calculation to prevent unnecessary recalculations
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
      <div className="inline-flex items-center gap-2 p-1 bg-white rounded-full border border-zinc-200 shadow-sm animate-slideUpFade">
        
        {/* Previous Button */}
        <button
          onClick={() => hasPrevious && onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className="group relative flex items-center justify-center w-10 h-10 rounded-full text-zinc-400 hover:text-slate-900 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          aria-label="Previous Page"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-200 mx-1"></div>

        {/* Page Numbers Container */}
        <div className="flex items-center gap-1 px-2">
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-xs font-mono text-zinc-400 select-none animate-pulse" aria-hidden="true">
                •••
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`
                  relative w-8 h-8 flex items-center justify-center text-xs font-bold rounded-full transition-all duration-300 font-mono tracking-wide overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-500/20
                  ${page === currentPage
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-110 z-10' 
                    : 'text-zinc-500 hover:text-slate-900 hover:bg-zinc-100'
                  }
                `}
              >
                {/* Active State Background Animation */}
                {page === currentPage && (
                  <span className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 animate-scaleIn -z-10"></span>
                )}
                {page}
              </button>
            )
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-200 mx-1"></div>

        {/* Next Button */}
        <button
          onClick={() => hasNext && onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="group relative flex items-center justify-center w-10 h-10 rounded-full text-zinc-400 hover:text-slate-900 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          aria-label="Next Page"
        >
          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Inline Styles for Custom Animations */}
      <style jsx>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-slideUpFade { animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
});

export default Pagination;