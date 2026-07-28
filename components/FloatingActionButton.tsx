'use client';

import React, { memo } from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left';
  className?: string;
}

// Clean, modern Plus Icon optimized for gallery aesthetics
const PlusIcon = () => (
  <svg 
    className="w-6 h-6 sm:w-7 sm:h-7" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round" 
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const FloatingActionButton = memo(function FloatingActionButton({ 
  onClick, 
  label = "Add New", 
  icon = <PlusIcon />,
  position = 'bottom-right',
  className = ""
}: FloatingActionButtonProps) {
  
  const positionClasses = position === 'bottom-right' 
    ? 'right-6 sm:right-8' 
    : 'left-6 sm:left-8';

  // Generate a stable ID for accessibility (in a real app, use useId() from React 18)
  const tooltipId = `fab-tooltip-${React.useId?.() || Math.random().toString(36).substr(2, 9)}`;

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 sm:bottom-8 ${positionClasses} z-50
        flex items-center justify-center
        w-14 h-14 sm:w-16 sm:h-16
        bg-white dark:bg-zinc-900
        text-zinc-900 dark:text-zinc-100
        rounded-full
        border border-zinc-200 dark:border-zinc-800
        shadow-lg shadow-zinc-200/50 dark:shadow-black/50
        hover:shadow-xl hover:shadow-zinc-300/50 dark:hover:shadow-black/60
        hover:border-zinc-300 dark:hover:border-zinc-700
        transition-all duration-300 ease-out
        group
        focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-2
        active:scale-95 hover:scale-105
        ${className}
      `}
      aria-label={label}
      aria-describedby={tooltipId}
    >
      {/* Icon container with elegant rotation micro-interaction */}
      <span className="relative z-10 transform transition-transform duration-300 ease-out group-hover:rotate-45">
        {icon}
      </span>

      {/* Modern, Robust Tooltip */}
      <span 
        id={tooltipId}
        className={`
          absolute 
          ${position === 'bottom-left' ? 'left-full ml-4' : 'right-full mr-4'}
          top-1/2 -translate-y-1/2
          bg-zinc-900 dark:bg-zinc-100 
          text-white dark:text-zinc-900
          text-xs font-medium px-3 py-1.5
          rounded-md
          opacity-0 group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-200 ease-out
          whitespace-nowrap
          pointer-events-none
          shadow-lg
        `}
        role="tooltip"
      >
        {label}
      </span>
    </button>
  );
});

export default FloatingActionButton;