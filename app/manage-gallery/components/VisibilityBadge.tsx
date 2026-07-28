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
    icon?: React.ReactNode;
  }> = {
    public: {
      label: 'Public',
      dotColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      textColor: 'text-emerald-700 dark:text-emerald-400',
    },
    private: {
      label: 'Private',
      dotColor: 'bg-zinc-500',
      bgColor: 'bg-zinc-100 dark:bg-zinc-800',
      textColor: 'text-zinc-700 dark:text-zinc-300',
    },
    password_protected: {
      label: 'Locked',
      dotColor: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      textColor: 'text-amber-700 dark:text-amber-400',
      icon: (
        <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    unlisted: {
      label: 'Unlisted',
      dotColor: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      textColor: 'text-blue-700 dark:text-blue-400',
    }
  };

  const current = config[type];

  return (
    <div className={`
      flex items-center gap-1.5 px-2.5 py-1.5 rounded-full 
      backdrop-blur-md border border-white/20 dark:border-black/20 shadow-sm
      transition-all duration-200
      ${current.bgColor} ${current.textColor}
    `}>
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-20 ${current.dotColor}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dotColor}`}></span>
      </span>
      
      <span className="text-[11px] font-medium leading-none">
        {current.label}
      </span>

      {current.icon && <span className="opacity-60">{current.icon}</span>}
    </div>
  );
});

VisibilityBadge.displayName = 'VisibilityBadge';