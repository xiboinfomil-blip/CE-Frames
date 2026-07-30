import * as React from "react";
import { cn } from "@/lib/utils";

export interface CustomTextfieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * CustomTextfield - A sophisticated, editorial-style text input.
 * Inspired by high-end gallery labels and minimalist photography UI.
 */
const CustomTextfield = React.forwardRef<HTMLInputElement, CustomTextfieldProps>(
  ({ className, type, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="group relative w-full flex flex-col gap-2">
        {/* Editorial Label */}
        {label && (
          <label 
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 select-none pl-1",
              "text-stone-500 dark:text-stone-400",
              "group-focus-within:text-stone-900 dark:group-focus-within:text-stone-100",
              error && "text-rose-600 dark:text-rose-400"
            )}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none",
              "text-stone-400 dark:text-stone-500",
              "group-focus-within:text-stone-800 dark:group-focus-within:text-stone-200",
              error && "text-rose-500"
            )}>
              {leftIcon}
            </div>
          )}

          {/* The Input Field */}
          <input
            type={type}
            className={cn(
              // Base styles: Clean & Matte
              "w-full rounded-2xl px-4 py-3.5 text-sm font-medium",
              "bg-stone-50/50 dark:bg-stone-900/50 backdrop-blur-sm",
              "text-stone-900 dark:text-stone-100",
              "placeholder:text-stone-400 dark:placeholder:text-stone-600",
              
              // Borders & Shadows (Subtle depth)
              "border border-stone-200/60 dark:border-stone-800/60",
              "shadow-sm hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-300",
              
              // Focus state (Lens Focus Effect)
              "focus:outline-none focus:border-stone-400 dark:focus:border-stone-500",
              "focus:ring-4 focus:ring-stone-100/50 dark:focus:ring-stone-800/50",
              
              // Error state
              error && "border-rose-200 dark:border-rose-900/50 focus:ring-rose-100/50 dark:focus:ring-rose-900/30 focus:border-rose-300",
              
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-stone-100 dark:disabled:bg-stone-950",
              
              // Padding adjustments for icons
              leftIcon && "pl-12",
              rightIcon && "pr-12",
              
              className
            )}
            ref={ref}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300",
              "text-stone-400 dark:text-stone-500",
              "group-focus-within:text-stone-800 dark:group-focus-within:text-stone-200",
              error && "text-rose-500"
            )}>
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message (Editorial Warning) */}
        {error && (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1 pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" x2="12" y1="8" y2="12"/>
              <line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

CustomTextfield.displayName = "CustomTextfield";

export { CustomTextfield };