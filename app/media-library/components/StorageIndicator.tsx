'use client';

import { memo } from 'react';

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

  // Color configurations for different states
  const stateStyles = {
    low: {
      bg: 'bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60',
      border: 'border-emerald-200/60',
      indicator: 'bg-emerald-400',
      progress: 'bg-gradient-to-r from-emerald-400 to-teal-500',
      text: 'text-emerald-700',
      label: 'text-emerald-600/70',
      shadow: 'shadow-emerald-100/50',
    },
    medium: {
      bg: 'bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60',
      border: 'border-amber-200/60',
      indicator: 'bg-amber-400',
      progress: 'bg-gradient-to-r from-amber-400 to-orange-500',
      text: 'text-amber-700',
      label: 'text-amber-600/70',
      shadow: 'shadow-amber-100/50',
    },
    high: {
      bg: 'bg-gradient-to-br from-orange-50/80 via-white to-red-50/60',
      border: 'border-orange-200/60',
      indicator: 'bg-orange-400',
      progress: 'bg-gradient-to-r from-orange-400 to-red-500',
      text: 'text-orange-700',
      label: 'text-orange-600/70',
      shadow: 'shadow-orange-100/50',
    },
    critical: {
      bg: 'bg-gradient-to-br from-rose-50/80 via-white to-pink-50/60',
      border: 'border-rose-200/60',
      indicator: 'bg-rose-500',
      progress: 'bg-gradient-to-r from-rose-500 to-pink-600',
      text: 'text-rose-700',
      label: 'text-rose-600/70',
      shadow: 'shadow-rose-100/50',
    },
    full: {
      bg: 'bg-gradient-to-br from-red-50/90 via-white to-rose-50/80',
      border: 'border-red-300/70',
      indicator: 'bg-red-600 animate-pulse',
      progress: 'bg-gradient-to-r from-red-500 via-rose-600 to-red-600',
      text: 'text-red-700 font-semibold',
      label: 'text-red-600',
      shadow: 'shadow-red-200/60',
    },
    unknown: {
      bg: 'bg-gradient-to-br from-slate-50/80 via-white to-gray-50/60',
      border: 'border-slate-200/60',
      indicator: 'bg-slate-400',
      progress: 'bg-gradient-to-r from-slate-400 to-gray-500',
      text: 'text-slate-600',
      label: 'text-slate-500/70',
      shadow: 'shadow-slate-100/50',
    },
  };

  const currentStyle = stateStyles[state as keyof typeof stateStyles];

  // Loading skeleton
  if (isLoading) {
    return (
      <div 
        className="relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-lg shadow-zinc-100/50"
        aria-label="Loading storage information"
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
              <div className="h-3 w-28 rounded bg-zinc-200" />
            </div>
            <div className="h-3 w-16 rounded bg-zinc-200" />
          </div>
          
          <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-zinc-300 animate-shimmer" />
          </div>
          
          <div className="flex justify-between">
            <div className="h-2.5 w-16 rounded bg-zinc-200" />
            <div className="h-2.5 w-16 rounded bg-zinc-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        group relative overflow-hidden rounded-2xl border backdrop-blur-md 
        transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-xl
        ${currentStyle.bg} ${currentStyle.border} ${currentStyle.shadow}
      `}
      role="region"
      aria-label="Storage capacity indicator"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_70%)]" />
      </div>

      {/* Content */}
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {/* Status indicator with glow effect */}
            <div className="relative">
              <div className={`w-2.5 h-2.5 rounded-full ${currentStyle.indicator}`} />
              {state === 'critical' || state === 'full' ? (
                <div className={`absolute inset-0 rounded-full ${currentStyle.indicator} blur-md opacity-60`} />
              ) : null}
            </div>
            
            <h3 className={`text-[11px] font-bold uppercase tracking-[0.2em] ${currentStyle.label}`}>
              Storage Capacity
            </h3>
          </div>
          
          <span className={`text-xs font-mono font-medium ${currentStyle.text}`}>
            {storage ? `${storage.percentageUsed}% USED` : 'CALCULATING...'}
          </span>
        </div>
        
        {/* Progress bar container */}
        <div 
          className="relative h-2.5 w-full rounded-full overflow-hidden bg-white/60 shadow-inner"
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
          <div className="absolute inset-0 flex">
            {[25, 50, 75].map((mark) => (
              <div 
                key={mark}
                className="h-full w-px bg-black/5"
                style={{ left: `${mark}%` }}
              />
            ))}
          </div>
        </div>
        
        {/* Storage details */}
        <div className="flex justify-between mt-3 text-[11px] font-mono">
          <span className={`${currentStyle.label} font-medium`}>
            {storage ? storage.used : '---'}
          </span>
          <span className={`${currentStyle.label} font-medium`}>
            {storage ? storage.limit : '---'}
          </span>
        </div>

        {/* Warning message for critical/full states */}
        {(state === 'critical' || state === 'full') && (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-rose-600 animate-fade-in">
            <svg 
              className="w-3.5 h-3.5 shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" 
                clipRule="evenodd" 
              />
            </svg>
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