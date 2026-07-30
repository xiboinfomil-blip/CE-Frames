'use client';

import { FolderOpen } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="relative flex flex-col items-center justify-center py-24 sm:py-32 px-4">
      {/* Subtle Background Texture */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 text-center max-w-md mx-auto">
        
        {/* Icon Wrapper - Clean & Static */}
        <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 mb-8 relative">
          <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl rotate-3 transition-transform duration-500 hover:rotate-6"></div>
          <div className="relative w-full h-full bg-white dark:bg-zinc-900 rounded-3xl shadow-lg border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center transition-transform duration-500 hover:-translate-y-1">
            <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text Content */}
        <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">
          No galleries found
        </h3>
        
        <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg leading-relaxed font-medium">
          Try adjusting your filters or search terms to find what you&apos;re looking for.
        </p>

        {/* Decorative Bottom Line - Minimalist */}
        <div className="mt-10 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
        </div>
      </div>
    </div>
  );
}