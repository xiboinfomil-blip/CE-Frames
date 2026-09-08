import * as React from "react";
import { HiArrowPath } from 'react-icons/hi2';
import { cn } from "@/lib/utils";

export interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'continue';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  shortcut?: string;
}

const variantStyles = {
  primary: 
    "bg-rose-600 text-white border border-rose-500/30 shadow-lg shadow-rose-600/20 hover:bg-rose-500 hover:shadow-rose-600/30 hover:-translate-y-0.5 active:translate-y-0",
  continue: 
    "bg-rose-600 text-white border border-rose-500/30 shadow-lg shadow-rose-600/20 hover:bg-rose-500 hover:shadow-rose-600/30 hover:-translate-y-0.5 active:translate-y-0",
  secondary: 
    "bg-slate-800 text-slate-100 border border-slate-700/80 shadow-sm hover:bg-slate-700 hover:border-slate-600 hover:-translate-y-0.5 active:translate-y-0",
  outline: 
    "bg-transparent text-slate-200 border border-slate-700 hover:bg-slate-800/80 hover:border-slate-600 hover:text-white",
  danger: 
    "bg-rose-950/40 text-rose-300 border border-rose-800/50 shadow-sm hover:bg-rose-900/50 hover:border-rose-700 hover:text-rose-200 hover:-translate-y-0.5 active:translate-y-0",
  ghost: 
    "bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent",
};

const sizeStyles = {
  sm: "h-9 px-3.5 rounded-lg text-xs gap-2",
  md: "h-11 px-5 rounded-xl text-sm font-semibold gap-2.5",
  lg: "h-13 px-7 rounded-2xl text-base font-semibold gap-3",
};

/**
 * CustomButton - Refactored button component with dark slate / rose theme integration.
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
          // Base & Layout
          "group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap select-none",
          
          // Tactical Motion & Focus
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
          "active:scale-[0.98]",
          
          // Disabled States
          "disabled:pointer-events-none disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none",
          
          // Variants & Sizes
          variantStyles[variant],
          sizeStyles[size],
          
          // Light Sheen Animation
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
          "before:-translate-x-full before:transition-transform before:duration-700 before:ease-out",
          "hover:before:translate-x-full",
          
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
              {leftIcon && <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">{leftIcon}</span>}
              <span>{children}</span>
              {rightIcon && <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">{rightIcon}</span>}
            </>
          )}
        </div>

        {/* Keyboard Hint Badge */}
        {shortcut && !isLoading && (
          <kbd className={cn(
            "relative z-10 ml-2 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider",
            variant === 'primary' || variant === 'continue'
              ? "bg-white/15 border-white/20 text-white/80" 
              : "bg-slate-900 border-slate-700 text-slate-400"
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