'use client';

import { memo } from 'react';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export const EmptyState = memo(({ onCreateClick }: EmptyStateProps) => (
  <div className="relative min-h-[40vh] flex flex-col items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 shadow-sm overflow-hidden">
    <div className="text-center max-w-sm relative z-10">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 mb-6 relative shadow-sm">
        <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">No galleries yet</h3>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 font-medium leading-relaxed">
        Start building your portfolio by creating your first collection.
      </p>
      <button 
        onClick={onCreateClick}
        className="mt-8 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 shadow-sm active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-2"
      >
        Create Gallery
      </button>
    </div>
  </div>
));
EmptyState.displayName = 'EmptyState';