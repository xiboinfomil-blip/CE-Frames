// components/ui/RaceButton.tsx
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
    "bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-500 hover:shadow-red-500/30 hover:-translate-y-0.5",
  ok: 
    "bg-emerald-500 dark:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 dark:shadow-emerald-600/20 hover:bg-emerald-400 dark:hover:bg-emerald-500 hover:-translate-y-0.5",
  danger: 
    "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400 dark:hover:border-red-700",
  default: 
    "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/50 backdrop-blur-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:-translate-y-0.5",
  ghost: 
    "bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100",
};

const sizeStyles = {
  sm: "h-8 px-4 rounded-md text-[10px] gap-1.5",
  md: "h-11 px-6 rounded-lg text-[11px] gap-2",
  lg: "h-14 px-8 rounded-xl text-xs gap-2.5",
};

/**
 * RaceButton - High-performance, aerodynamic button.
 * Features a light-sweep gloss effect and tactile "downshift" press.
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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950",
          "active:scale-[0.97] active:shadow-none active:translate-y-0",
          
          // States
          "disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0",
          
          // Variants & Sizes
          variantStyles[variant],
          sizeStyles[size],
          
          // The "Aero-Gloss" Photography Effect (Light sweep on hover)
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 dark:before:via-white/5 before:to-transparent",
          "before:translate-x-[-100%] before:transition-transform before:duration-700 before:ease-out",
          "group-hover:before:translate-x-[100%]",
          
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Content Wrapper (z-10 to sit above the gloss effect) */}
        <div className="relative z-10 flex items-center gap-2">
          {/* Loading Spinner (Telemetry Pulse) */}
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
            variant === 'continue' || variant === 'ok' 
              ? "bg-black/20 border-white/20 text-white/80" 
              : "bg-zinc-200/50 dark:bg-zinc-700/50 border-zinc-300/50 dark:border-zinc-600/50 text-zinc-500 dark:text-zinc-400"
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