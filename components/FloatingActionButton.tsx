'use client';

import React, { memo, useId } from 'react';
import { HiPlus } from 'react-icons/hi2';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left';
  variant?: 'circle' | 'extended';
  colorScheme?: 'rose' | 'dark';
  className?: string;
}

const FloatingActionButton = memo(function FloatingActionButton({ 
  onClick, 
  label = "Add New Event", 
  icon = <HiPlus className="w-6 h-6 sm:w-7 sm:h-7" />,
  position = 'bottom-right',
  variant = 'circle',
  colorScheme = 'rose',
  className = ""
}: FloatingActionButtonProps) {
  
  // React 18 stable SSR ID hook
  const tooltipId = useId();

  const positionClasses = position === 'bottom-right' 
    ? 'right-6 sm:right-8' 
    : 'left-6 sm:left-8';

  const colorClasses = colorScheme === 'rose'
    ? 'bg-rose-600 text-white hover:bg-rose-700 border-rose-500 shadow-rose-500/25 focus-visible:ring-rose-600'
    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-slate-200 focus-visible:ring-slate-900 dark:focus-visible:ring-white';

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 sm:bottom-8 ${positionClasses} z-50
        flex items-center justify-center
        ${variant === 'extended' ? 'h-14 px-5 rounded-2xl gap-3' : 'w-14 h-14 sm:w-16 sm:h-16 rounded-full'}
        ${colorClasses}
        border shadow-xl
        hover:shadow-2xl hover:-translate-y-1
        transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)
        group
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        active:scale-95 active:translate-y-0
        ${className}
      `}
      aria-label={label}
      aria-describedby={variant === 'circle' ? tooltipId : undefined}
    >
      {/* Icon with smooth rotation transition */}
      <span className="relative z-10 transform transition-transform duration-300 ease-out group-hover:rotate-90">
        {icon}
      </span>

      {/* Extended Label for 'extended' variant */}
      {variant === 'extended' && (
        <span className="text-sm font-semibold tracking-wide whitespace-nowrap">
          {label}
        </span>
      )}

      {/* Tooltip for standard 'circle' variant */}
      {variant === 'circle' && (
        <span 
          id={tooltipId}
          className={`
            absolute 
            ${position === 'bottom-left' ? 'left-full ml-4' : 'right-full mr-4'}
            top-1/2 -translate-y-1/2
            bg-slate-900 dark:bg-white 
            text-white dark:text-slate-900
            text-[10px] font-bold uppercase tracking-widest px-3 py-1.5
            rounded-lg
            opacity-0 group-hover:opacity-100
            transition-all duration-200 ease-out
            whitespace-nowrap
            pointer-events-none
            shadow-lg border border-slate-800 dark:border-slate-200
          `}
          role="tooltip"
        >
          {label}
        </span>
      )}
    </button>
  );
});

export default FloatingActionButton;