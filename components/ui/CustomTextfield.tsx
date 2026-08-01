import * as React from "react";
import { HiExclamationCircle } from 'react-icons/hi2';
import { cn } from "@/lib/utils";

export interface CustomTextfieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * CustomTextfield - A sophisticated, compact, and accessible text input.
 * Designed for a light, modern photography aesthetic with rectangular rounded corners.
 */
const CustomTextfield = React.forwardRef<HTMLInputElement, CustomTextfieldProps>(
  ({ className, type, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="group relative w-full flex flex-col gap-1.5">
        {/* Editorial Label */}
        {label && (
          <label 
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.1em] transition-colors duration-200 select-none pl-1",
              "text-zinc-500 dark:text-zinc-400",
              "group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100",
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
              "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none",
              "text-zinc-400 dark:text-zinc-500",
              "group-focus-within:text-zinc-700 dark:group-focus-within:text-zinc-300",
              error && "text-rose-500"
            )}>
              {leftIcon}
            </div>
          )}

          {/* The Input Field */}
          <input
            type={type}
            className={cn(
              // Base styles: Clean, Compact, Rectangular Rounded
              "w-full rounded-2xl px-4 py-3 text-sm font-medium",
              "bg-white dark:bg-zinc-900/50",
              "text-zinc-900 dark:text-zinc-100",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
              
              // Borders & Shadows (Subtle depth)
              "border border-zinc-200 dark:border-zinc-800",
              "shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200",
              
              // Focus state (Clean Ring)
              "focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500",
              "focus:ring-4 focus:ring-zinc-100/50 dark:focus:ring-zinc-800/50",
              
              // Error state
              error && "border-rose-200 dark:border-rose-900/50 focus:ring-rose-100/50 dark:focus:ring-rose-900/30 focus:border-rose-300",
              
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-zinc-50 dark:disabled:bg-zinc-950",
              
              // Padding adjustments for icons
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              
              className
            )}
            ref={ref}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className={cn(
              "absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200",
              "text-zinc-400 dark:text-zinc-500",
              "group-focus-within:text-zinc-700 dark:group-focus-within:text-zinc-300",
              error && "text-rose-500"
            )}>
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-0.5 pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <HiExclamationCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

CustomTextfield.displayName = "CustomTextfield";

export { CustomTextfield };