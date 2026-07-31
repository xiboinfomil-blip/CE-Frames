'use client';

import React, { memo } from 'react';
import { HiPlus } from 'react-icons/hi2';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left';
  className?: string;
}

const FloatingActionButton = memo(function FloatingActionButton({ 
  onClick, 
  label = "Add New", 
  icon = <HiPlus className="w-6 h-6 sm:w-7 sm:h-7" />,
  position = 'bottom-right',
  className = ""
}: FloatingActionButtonProps) {
  
  const positionClasses = position === 'bottom-right' 
    ? 'right-6 sm:right-8' 
    : 'left-6 sm:left-8';

  // Generate a stable ID for accessibility
  const tooltipId = `fab-tooltip-${React.useId?.() || Math.random().toString(36).substr(2, 9)}`;

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 sm:bottom-8 ${positionClasses} z-50
        flex items-center justify-center
        w-14 h-14 sm:w-16 sm:h-16
        bg-zinc-900 dark:bg-white
        text-white dark:text-zinc-900
        rounded-full
        border border-zinc-800 dark:border-zinc-200
        shadow-xl shadow-zinc-900/20 dark:shadow-white/10
        hover:shadow-2xl hover:shadow-zinc-900/30 dark:hover:shadow-white/20
        hover:-translate-y-1
        transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)
        group
        focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:ring-offset-2
        active:scale-95 active:translate-y-0
        ${className}
      `}
      aria-label={label}
      aria-describedby={tooltipId}
    >
      {/* Icon container with elegant rotation micro-interaction */}
      <span className="relative z-10 transform transition-transform duration-300 ease-out group-hover:rotate-90">
        {icon}
      </span>

      {/* Modern, Camera-Setting Style Tooltip */}
      <span 
        id={tooltipId}
        className={`
          absolute 
          ${position === 'bottom-left' ? 'left-full ml-4' : 'right-full mr-4'}
          top-1/2 -translate-y-1/2
          bg-zinc-900 dark:bg-white 
          text-white dark:text-zinc-900
          text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5
          rounded-md
          opacity-0 group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-200 ease-out
          whitespace-nowrap
          pointer-events-none
          shadow-lg border border-zinc-800 dark:border-zinc-200
        `}
        role="tooltip"
      >
        {label}
      </span>
    </button>
  );
});

export default FloatingActionButton;