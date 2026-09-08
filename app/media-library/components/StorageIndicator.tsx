'use client';

import { memo } from 'react';
import { HiExclamationTriangle } from 'react-icons/hi2';

interface StorageData {
  used: string;
  rawUsed: number;
  limit: string;
  rawLimit: number;
  percentageUsed: string;
}

interface StorageIndicatorProps {
  storage: StorageData | null;
  isLoading?: boolean;
}

const StorageIndicator = memo(({ storage, isLoading = false }: StorageIndicatorProps) => {
  const storagePercent = storage ? parseFloat(storage.percentageUsed) : 0;
  
  // Determine storage state and corresponding styles
  const getStorageState = () => {
    if (!storage || storage.rawLimit === 0) return 'unknown';
    if (storagePercent >= 100) return 'full';
    if (storagePercent >= 95) return 'critical';
    if (storagePercent >= 80) return 'high';
    if (storagePercent >= 60) return 'medium';
    return 'low';
  };

  const state = getStorageState();

  // Color configurations for different states (Dark/Light compatible)
  const stateStyles = {
    low: {
      bg: 'bg-linear-to-br from-emerald-50/80 via-white to-teal-50/60 dark:from-emerald-950/20 dark:via-zinc-900 dark:to-teal-950/10',
      border: 'border-emerald-200/60 dark:border-emerald-900/40',
      indicator: 'bg-emerald-500',
      progress: 'bg-linear-to-r from-emerald-400 to-teal-500',
      text: 'text-emerald-700 dark:text-emerald-400',
      label: 'text-emerald-600/80 dark:text-emerald-400/80',
      shadow: 'shadow-emerald-100/50 dark:shadow-none',
    },
    medium: {
      bg: 'bg-linear-to-br from-amber-50/80 via-white to-orange-50/60 dark:from-amber-950/20 dark:via-zinc-900 dark:to-orange-950/10',
      border: 'border-amber-200/60 dark:border-amber-900/40',
      indicator: 'bg-amber-500',
      progress: 'bg-linear-to-r from-amber-400 to-orange-500',
      text: 'text-amber-700 dark:text-amber-400',
      label: 'text-amber-600/80 dark:text-amber-400/80',
      shadow: 'shadow-amber-100/50 dark:shadow-none',
    },
    high: {
      bg: 'bg-linear-to-br from-orange-50/80 via-white to-red-50/60 dark:from-orange-950/20 dark:via-zinc-900 dark:to-red-950/10',
      border: 'border-orange-200/60 dark:border-orange-900/40',
      indicator: 'bg-orange-500',
      progress: 'bg-linear-to-r from-orange-400 to-red-500',
      text: 'text-orange-700 dark:text-orange-400',
      label: 'text-orange-600/80 dark:text-orange-400/80',
      shadow: 'shadow-orange-100/50 dark:shadow-none',
    },
    critical: {
      bg: 'bg-linear-to-br from-rose-50/80 via-white to-pink-50/60 dark:from-rose-950/30 dark:via-zinc-900 dark:to-pink-950/20',
      border: 'border-rose-200/60 dark:border-rose-900/50',
      indicator: 'bg-rose-500',
      progress: 'bg-linear-to-r from-rose-500 to-pink-600',
      text: 'text-rose-700 dark:text-rose-400',
      label: 'text-rose-600/80 dark:text-rose-400/80',
      shadow: 'shadow-rose-100/50 dark:shadow-none',
    },
    full: {
      bg: 'bg-linear-to-br from-red-50/90 via-white to-rose-50/80 dark:from-red-950/40 dark:via-zinc-900 dark:to-rose-950/30',
      border: 'border-red-300/70 dark:border-red-800/60',
      indicator: 'bg-red-600 animate-pulse',
      progress: 'bg-linear-to-r from-red-500 via-rose-600 to-red-600',
      text: 'text-red-700 dark:text-red-400 font-bold',
      label: 'text-red-600 dark:text-red-400',
      shadow: 'shadow-red-200/60 dark:shadow-none',
    },
    unknown: {
      bg: 'bg-linear-to-br from-slate-50/80 via-white to-zinc-50/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950',
      border: 'border-zinc-200/60 dark:border-zinc-800',
      indicator: 'bg-zinc-400',
      progress: 'bg-linear-to-r from-zinc-400 to-zinc-500',
      text: 'text-zinc-600 dark:text-zinc-400',
      label: 'text-zinc-500/70 dark:text-zinc-400/70',
      shadow: 'shadow-zinc-100/50 dark:shadow-none',
    },
  };

  const currentStyle = stateStyles[state as keyof typeof stateStyles];

  // Loading skeleton
  if (isLoading) {
    return (
      <div 
        className="relative overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-5 shadow-xs"
        aria-label="Loading storage information"
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          
          <div className="h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
          </div>
          
          <div className="flex justify-between">
            <div className="h-2.5 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-2.5 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        group relative overflow-hidden rounded-2xl border backdrop-blur-md 
        transition-all duration-500 ease-out hover:scale-[1.01] hover:shadow-xl
        ${currentStyle.bg} ${currentStyle.border} ${currentStyle.shadow}
      `}
      role="region"
      aria-label="Storage capacity indicator"
    >
      {/* Background overlay accent */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.15),transparent_70%)]" />
      </div>

      {/* Content */}
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {/* Status indicator with glow effect */}
            <div className="relative flex items-center justify-center">
              <div className={`w-2.5 h-2.5 rounded-full ${currentStyle.indicator}`} />
              {(state === 'critical' || state === 'full') && (
                <div className={`absolute inset-0 rounded-full ${currentStyle.indicator} blur-sm opacity-70`} />
              )}
            </div>
            
            <h3 className={`text-[11px] font-bold uppercase tracking-[0.2em] ${currentStyle.label}`}>
              Storage Capacity
            </h3>
          </div>
          
          <span className={`text-xs font-mono font-bold ${currentStyle.text}`}>
            {storage ? `${storage.percentageUsed}% USED` : 'CALCULATING...'}
          </span>
        </div>
        
        {/* Progress bar container */}
        <div 
          className="relative h-2.5 w-full rounded-full overflow-hidden bg-black/5 dark:bg-white/10 shadow-inner"
          role="progressbar"
          aria-valuenow={storagePercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Storage usage: ${storagePercent.toFixed(1)} percent`}
        >
          {/* Progress fill with gradient and shimmer */}
          <div 
            className={`
              absolute top-0 left-0 h-full rounded-full 
              transition-all duration-1000 ease-out
              ${currentStyle.progress}
            `}
            style={{ 
              width: `${Math.min(100, storagePercent)}%`,
            }}
          >
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
          
          {/* Grid lines for visual reference */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-[25%] top-0 bottom-0 w-px bg-black/5 dark:bg-white/10" />
            <div className="absolute left-[50%] top-0 bottom-0 w-px bg-black/5 dark:bg-white/10" />
            <div className="absolute left-[75%] top-0 bottom-0 w-px bg-black/5 dark:bg-white/10" />
          </div>
        </div>
        
        {/* Storage details */}
        <div className="flex justify-between mt-3 text-[11px] font-mono">
          <span className={`${currentStyle.label} font-semibold`}>
            {storage ? storage.used : '---'}
          </span>
          <span className={`${currentStyle.label} font-semibold`}>
            {storage ? storage.limit : '---'}
          </span>
        </div>

        {/* Warning message for critical/full states */}
        {(state === 'critical' || state === 'full') && (
          <div className="mt-3.5 pt-3 border-t border-rose-200/50 dark:border-rose-900/30 flex items-center gap-2 text-[11px] font-medium text-rose-600 dark:text-rose-400">
            <HiExclamationTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>
              {state === 'full' ? 'Storage is full! Free up space now.' : 'Storage is almost full. Consider upgrading.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

StorageIndicator.displayName = 'StorageIndicator';

export default StorageIndicator;