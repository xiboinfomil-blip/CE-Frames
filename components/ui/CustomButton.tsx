import * as React from "react";
import { cn } from "@/lib/utils";

export interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'continue';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  shortcut?: string; // e.g., "↵", "⌘K"
}

const variantStyles = {
  primary: 
    "bg-zinc-900 text-white border border-transparent shadow-md shadow-zinc-900/10 hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/20 hover:-translate-y-0.5",
  continue: 
    "bg-zinc-900 text-white border border-transparent shadow-md shadow-zinc-900/10 hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/20 hover:-translate-y-0.5",
  secondary: 
    "bg-white text-zinc-900 border border-zinc-200 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5",
  outline: 
    "bg-transparent text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600",
  danger: 
    "bg-white text-rose-600 border border-rose-200 shadow-sm hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 hover:shadow-md hover:-translate-y-0.5",
  ghost: 
    "bg-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 border border-transparent",
};

const sizeStyles = {
  sm: "h-9 px-4 rounded-lg text-xs gap-2",
  md: "h-11 px-6 rounded-xl text-sm font-semibold gap-2.5",
  lg: "h-14 px-8 rounded-2xl text-base font-semibold gap-3",
};

/**
 * CustomButton - Editorial-style, tactile button.
 * Inspired by camera shutter controls and minimalist gallery UI.
 */
const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ 
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
  }, ref) => {
    return (
      <button
        className={cn(
          // Base: Typography & Layout
          "group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap",
          
          // Interactions: Tactile press & Focus
          "transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:ring-offset-2",
          "active:scale-[0.98] active:shadow-sm active:translate-y-0",
          
          // States
          "disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none",
          
          // Variants & Sizes
          variantStyles[variant],
          sizeStyles[size],
          
          // The "Subtle Lens Flare" Effect (Very refined)
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
          "before:translate-x-[-150%] before:transition-transform before:duration-700 before:ease-out",
          "group-hover:before:translate-x-[150%]",
          
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Content Wrapper (z-10 to sit above the gloss effect) */}
        <div className="relative z-10 flex items-center gap-2">
          {/* Loading Spinner (Minimalist Ring) */}
          {isLoading ? (
            <svg className="animate-spin h-4 w-4 opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              {leftIcon && <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">{leftIcon}</span>}
              {children}
              {rightIcon && <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-1">{rightIcon}</span>}
            </>
          )}
        </div>

        {/* Keyboard Shortcut Hint (Camera Setting Style) */}
        {shortcut && !isLoading && (
          <kbd className={cn(
            "relative z-10 ml-2 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider",
            variant === 'primary' || variant === 'continue'
              ? "bg-white/10 border-white/20 text-white/70" 
              : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
          )}>
            {shortcut}
          </kbd>
        )}
      </button>
    );
  }
);

CustomButton.displayName = "CustomButton";

export { CustomButton };