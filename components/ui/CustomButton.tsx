import * as React from "react";
import { cn } from "@/lib/utils";

export interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'continue' | 'ok' | 'danger' | 'default' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  shortcut?: string; // e.g., "↵", "⌘K"
}

const variantStyles = {
  continue: 
    "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 hover:shadow-rose-500/30 hover:-translate-y-0.5 border border-transparent",
  ok: 
    "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 hover:shadow-emerald-500/30 hover:-translate-y-0.5 border border-transparent",
  danger: 
    "bg-white text-rose-600 border border-rose-200 shadow-sm hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700",
  default: 
    "bg-stone-900 text-stone-50 shadow-lg shadow-stone-900/10 hover:bg-stone-800 hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent",
  ghost: 
    "bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-transparent",
};

const sizeStyles = {
  sm: "h-8 px-4 rounded-md text-[10px] gap-1.5",
  md: "h-11 px-6 rounded-lg text-[11px] gap-2",
  lg: "h-14 px-8 rounded-xl text-xs gap-2.5",
};

/**
 * RaceButton - High-performance, aerodynamic button.
 * Features a "Lens Flare" gloss effect and tactile "shutter" press.
 */
const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ 
    className, 
    variant = 'default', 
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
          "group relative inline-flex items-center justify-center font-bold uppercase tracking-widest overflow-hidden",
          
          // Interactions: Tactile press & Focus
          "transition-all duration-300 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2",
          "active:scale-[0.96] active:shadow-none active:translate-y-0",
          
          // States
          "disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0",
          
          // Variants & Sizes
          variantStyles[variant],
          sizeStyles[size],
          
          // The "Lens Flare" Effect (Subtle light sweep)
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
          "before:translate-x-[-150%] before:transition-transform before:duration-1000 before:ease-out",
          "group-hover:before:translate-x-[150%]",
          
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Content Wrapper (z-10 to sit above the gloss effect) */}
        <div className="relative z-10 flex items-center gap-2">
          {/* Loading Spinner (Shutter Pulse) */}
          {isLoading ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              {leftIcon && <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">{leftIcon}</span>}
              {children}
              {rightIcon && <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">{rightIcon}</span>}
            </>
          )}
        </div>

        {/* Keyboard Shortcut Hint (Telemetry Readout) */}
        {shortcut && !isLoading && (
          <kbd className={cn(
            "relative z-10 ml-2 font-mono text-[9px] font-medium px-1.5 py-0.5 rounded border uppercase",
            variant === 'continue' || variant === 'ok' || variant === 'default'
              ? "bg-black/20 border-white/20 text-white/80" 
              : "bg-stone-200/50 border-stone-300/50 text-stone-500"
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