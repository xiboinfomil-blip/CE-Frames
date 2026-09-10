'use client';

import React, { memo, useId } from 'react';
import { HiPlus } from 'react-icons/hi2';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left';
  variant?: 'circle' | 'extended';
  colorScheme?: 'orange' | 'blue';
  className?: string;
}

const FloatingActionButton = memo(function FloatingActionButton({
  onClick,
  label = 'Ajouter',
  icon = <HiPlus className="w-5 h-5 sm:w-5 sm:h-5" />,
  position = 'bottom-right',
  variant = 'extended',
  colorScheme = 'orange',
  className = '',
}: FloatingActionButtonProps) {
  const tooltipId = useId();

  const positionClasses =
    position === 'bottom-right'
      ? 'right-6 sm:right-8'
      : 'left-6 sm:left-8';

  const colorClasses =
    colorScheme === 'orange'
      ? `
        bg-[#FF8201]
        text-white
        border-[#FF8201]
        shadow-[#FF8201]/30
        hover:bg-[#e87500]
        hover:border-[#e87500]
        focus-visible:ring-[#FF8201]
        `
      : `
        bg-[#004A87]
        text-white
        border-[#004A87]
        shadow-[#004A87]/30
        hover:bg-[#00345F]
        hover:border-[#00345F]
        focus-visible:ring-[#004A87]
        `;

  return (
    <button
      onClick={onClick}
      className={`
        fixed
        bottom-6
        sm:bottom-8
        ${positionClasses}
        z-50

        flex
        items-center
        justify-center

        ${
          variant === 'extended'
            ? 'h-14 px-5 rounded-2xl gap-3 shadow-2xl shadow-[#FF8201]/20'
            : 'w-14 h-14 sm:w-16 sm:h-16 rounded-full'
        }

        ${colorClasses}

        border
        shadow-xl

        hover:shadow-2xl
        hover:-translate-y-1

        transition-all
        duration-300
        cubic-bezier(0.16, 1, 0.3, 1)

        group

        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-offset-2
        focus-visible:ring-offset-white

        active:scale-95
        active:translate-y-0

        ${className}
      `}
      aria-label={label}
      aria-describedby={
        variant === 'circle'
          ? tooltipId
          : undefined
      }
    >
      {/* Icon */}
      <span
        className="
          relative
          z-10
          flex
          items-center
          justify-center
          transform
          transition-transform
          duration-300
          ease-out
          group-hover:rotate-90
        "
      >
        {icon}
      </span>

      {/* Extended Label */}
      {variant === 'extended' && (
        <span
          className="
            text-sm
            font-semibold
            tracking-wide
            whitespace-nowrap
          "
        >
          {label}
        </span>
      )}

      {/* Tooltip */}
      {variant === 'circle' && (
        <span
          id={tooltipId}
          className={`
            absolute

            ${
              position === 'bottom-left'
                ? 'left-full ml-4'
                : 'right-full mr-4'
            }

            top-1/2
            -translate-y-1/2

            bg-[#00345F]
            text-white

            text-[10px]
            font-bold
            uppercase
            tracking-widest

            px-3
            py-1.5

            rounded-lg

            opacity-0
            group-hover:opacity-100

            transition-all
            duration-200
            ease-out

            whitespace-nowrap
            pointer-events-none

            shadow-lg
            border
            border-[#004A87]
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