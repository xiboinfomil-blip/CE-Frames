'use client';

import { memo } from 'react';
import { VISIBILITY_STATUSES } from '@/db/schema';

interface VisibilityBadgeProps {
  type: typeof VISIBILITY_STATUSES[number];
}

export const VisibilityBadge = memo(({ type }: VisibilityBadgeProps) => {
  const config: Record<typeof VISIBILITY_STATUSES[number], { 
    label: string; 
    dotColor: string; 
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon?: React.ReactNode;
  }> = {
    public: {
      label: 'Public',
      dotColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-50/80 dark:bg-emerald-950/80',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      borderColor: 'border-emerald-200/50 dark:border-emerald-800/50',
    },
    private: {
      label: 'Private',
      dotColor: 'bg-zinc-500',
      bgColor: 'bg-zinc-100/80 dark:bg-zinc-900/80',
      textColor: 'text-zinc-700 dark:text-zinc-300',
      borderColor: 'border-zinc-200/50 dark:border-zinc-700/50',
    },
    password_protected: {
      label: 'Locked',
      dotColor: 'bg-amber-500',
      bgColor: 'bg-amber-50/80 dark:bg-amber-950/80',
      textColor: 'text-amber-700 dark:text-amber-400',
      borderColor: 'border-amber-200/50 dark:border-amber-800/50',
      icon: (
        <svg className="w-3 h-3 ml-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    unlisted: {
      label: 'Unlisted',
      dotColor: 'bg-blue-500',
      bgColor: 'bg-blue-50/80 dark:bg-blue-950/80',
      textColor: 'text-blue-700 dark:text-blue-400',
      borderColor: 'border-blue-200/50 dark:border-blue-800/50',
    }
  };

  const current = config[type];

  return (
    <div className={`
      inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md 
      backdrop-blur-md border shadow-sm transition-all duration-300
      ${current.bgColor} ${current.textColor} ${current.borderColor}
    `}>
      {/* Status LED with Pulse Effect */}
      <span className="relative flex h-1.5 w-1.5">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping ${current.dotColor}`}></span>
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${current.dotColor}`}></span>
      </span>
      
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] leading-none">
        {current.label}
      </span>

      {current.icon && <span>{current.icon}</span>}
    </div>
  );
});

VisibilityBadge.displayName = 'VisibilityBadge';