'use client';

import React, { memo } from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left';
  className?: string;
}

// Static Icon Component
const RacecarPlusIcon = () => (
  <svg 
    className="w-7 h-7" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
    aria-hidden="true"
  >
    {/* Racing stripe effect */}
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2.5} 
      d="M12 3v18m9-9H3" 
      className="drop-shadow-sm"
    />
    {/* Speed lines for racing aesthetic */}
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={1.5} 
      d="M6 6l2 2M18 6l-2 2M6 18l2-2M18 18l-2-2"
      opacity="0.6"
    />
  </svg>
);

const FloatingActionButton = memo(function FloatingActionButton({ 
  onClick, 
  label = "Add New", 
  icon = <RacecarPlusIcon />,
  position = 'bottom-right',
  className = ""
}: FloatingActionButtonProps) {
  
  const positionClasses = position === 'bottom-right' 
    ? 'right-6 sm:right-8 lg:right-10' 
    : 'left-6 sm:left-8 lg:left-10';

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 sm:bottom-8 ${positionClasses} z-50
        flex items-center justify-center
        w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18
        bg-linear-to-br from-white via-slate-50 to-slate-100
        text-slate-800
        rounded-full
        shadow-[0_8px_30px_rgb(0,0,0,0.12)]
        hover:shadow-[0_12px_40px_rgb(239,68,68,0.25)]
        border-2 border-slate-200/80
        hover:border-red-400/60
        transition-all duration-300 ease-out
        group
        focus:outline-none
        focus:ring-4 focus:ring-red-400/30 focus:ring-offset-2
        active:scale-95 hover:scale-105
        ${className}
      `}
      aria-label={label}
      role="button"
      tabIndex={0}
    >
      {/* Racing stripe accent */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-linear-to-b from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Icon container with rotation */}
      <span 
        className={`
          relative z-10
          transform transition-transform duration-300 ease-out
          group-hover:rotate-90
          group-focus:scale-110
        `}
      >
        {icon}
      </span>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-red-500/0 group-hover:bg-red-500/5 transition-colors duration-300 pointer-events-none" />

      {/* Tooltip */}
      <span 
        className={`
          absolute 
          ${position === 'bottom-left' 
            ? 'left-full ml-4' 
            : 'right-full mr-4'
          }
          top-1/2 -translate-y-1/2
          bg-white text-slate-800
          text-xs font-semibold px-4 py-2
          rounded-lg
          opacity-0 translate-x-0 group-hover:opacity-100 group-hover:translate-x-0
          transition-all duration-200 ease-out
          whitespace-nowrap
          pointer-events-none
          shadow-[0_4px_20px_rgb(0,0,0,0.08)]
          border border-slate-200
          before:content-['']
          before:absolute
          before:top-1/2
          before:-translate-y-1/2
          ${position === 'bottom-left'
            ? 'before:-left-1 before:border-r-8 before:border-y-8 before:border-y-transparent before:border-r-white'
            : 'before:-right-1 before:border-l-8 before:border-y-8 before:border-y-transparent before:border-l-white'
          }
          before:border-solid
        `}
        role="tooltip"
      >
        {label}
      </span>
    </button>
  );
});

export default FloatingActionButton;