import * as React from 'react';
import { HiArrowPath } from 'react-icons/hi2';
import { cn } from '@/lib/utils';

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'danger'
    | 'ghost'
    | 'continue';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  shortcut?: string;
}

const variantStyles = {
  primary:
    'bg-[#004A87] text-white border border-[#004A87]/30 shadow-lg shadow-[#004A87]/20 hover:bg-[#00345F] hover:shadow-[#00345F]/30 hover:-translate-y-0.5 active:translate-y-0',

  continue:
    'bg-[#FF8201] text-white border border-[#FF8201]/30 shadow-lg shadow-[#FF8201]/20 hover:bg-[#e87500] hover:shadow-[#FF8201]/30 hover:-translate-y-0.5 active:translate-y-0',

  secondary:
    'bg-[#EAF4FB] text-[#00345F] border border-[#E2E8F0] shadow-sm hover:bg-[#DCEEF9] hover:border-[#CBD5E1] hover:-translate-y-0.5 active:translate-y-0',

  outline:
    'bg-transparent text-[#004A87] border border-[#E2E8F0] hover:bg-[#EAF4FB] hover:border-[#004A87]/30 hover:text-[#00345F]',

  danger:
    'bg-red-50 text-red-600 border border-red-200 shadow-sm hover:bg-red-100 hover:border-red-300 hover:text-red-700 hover:-translate-y-0.5 active:translate-y-0',

  ghost:
    'bg-transparent text-[#64748B] hover:text-[#004A87] hover:bg-[#EAF4FB] border border-transparent',
};

const sizeStyles = {
  sm: 'h-9 px-3.5 rounded-lg text-xs gap-2',
  md: 'h-11 px-5 rounded-xl text-sm font-semibold gap-2.5',
  lg: 'h-13 px-7 rounded-2xl text-base font-semibold gap-3',
};

/**
 * CustomButton - Reusable button component using the CE Frames brand palette.
 */
const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      shortcut,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isBrandFilled =
      variant === 'primary' || variant === 'continue';

    return (
      <button
        className={cn(
          // Base & Layout
          'group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap select-none',

          // Motion & Focus
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          'active:scale-[0.98]',

          // Disabled States
          'disabled:pointer-events-none disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none',

          // Variants & Sizes
          variantStyles[variant],
          sizeStyles[size],

          // Light Sheen Animation
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
          'before:-translate-x-full before:transition-transform before:duration-700 before:ease-out',
          'hover:before:translate-x-full',

          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Content Wrapper */}
        <div className="relative z-10 flex items-center gap-2">
          {isLoading ? (
            <HiArrowPath className="animate-spin h-4 w-4 text-current" />
          ) : (
            <>
              {leftIcon && (
                <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
                  {leftIcon}
                </span>
              )}

              <span>{children}</span>

              {rightIcon && (
                <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
                  {rightIcon}
                </span>
              )}
            </>
          )}
        </div>

        {/* Keyboard Hint Badge */}
        {shortcut && !isLoading && (
          <kbd
            className={cn(
              'relative z-10 ml-2 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider',
              isBrandFilled
                ? 'bg-white/15 border-white/20 text-white/80'
                : 'bg-[#F5F7FA] border-[#E2E8F0] text-[#64748B]'
            )}
          >
            {shortcut}
          </kbd>
        )}
      </button>
    );
  }
);

CustomButton.displayName = 'CustomButton';

export { CustomButton };