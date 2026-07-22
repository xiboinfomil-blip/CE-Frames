// components/ui/CustomTextfield.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface CustomTextfieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * CustomTextfield - A high-performance, aerodynamic text input.
 * Inspired by racecar telemetry and high-contrast automotive photography.
 */
const CustomTextfield = React.forwardRef<HTMLInputElement, CustomTextfieldProps>(
  ({ className, type, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="group relative w-full flex flex-col gap-1.5">
        {/* Telemetry Label */}
        {label && (
          <label 
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-200",
              "text-zinc-400 dark:text-zinc-500",
              "group-focus-within:text-red-500 dark:group-focus-within:text-red-400",
              error && "text-red-500 dark:text-red-400"
            )}
          >
            {label}
            {/* Blinking telemetry dot on focus */}
            <span className="inline-block w-1 h-1 rounded-full bg-red-500 ml-2 opacity-0 scale-0 transition-all duration-300 group-focus-within:opacity-100 group-focus-within:scale-100 animate-pulse" />
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-red-500 dark:group-focus-within:text-red-400 transition-colors duration-200 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* The Input Field */}
          <input
            type={type}
            className={cn(
              // Base styles: Glossy light / Matte dark
              "w-full rounded-lg px-4 py-3.5 text-sm font-medium",
              "bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md",
              "text-zinc-900 dark:text-zinc-100",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
              
              // Borders & Shadows (Automotive depth)
              "border border-zinc-200 dark:border-zinc-800/80",
              "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.5)]",
              
              // Hover state (Slight gloss increase)
              "hover:bg-white dark:hover:bg-zinc-900/80",
              "hover:border-zinc-300 dark:hover:border-zinc-700",
              
              // Focus state (Aerodynamic glow)
              "focus:outline-none focus:ring-0",
              "focus:border-red-500/50 dark:focus:border-red-500/50",
              "focus:shadow-[0_0_20px_-5px_rgba(239,68,68,0.15)] dark:focus:shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]",
              
              // Error state
              error && "border-red-500/50 dark:border-red-500/50 focus:shadow-[0_0_20px_-5px_rgba(239,68,68,0.2)]",
              
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50",
              
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
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-red-500 dark:group-focus-within:text-red-400 transition-colors duration-200">
              {rightIcon}
            </div>
          )}

          {/* Aerodynamic "Rev-Meter" Focus Line */}
          <div 
            className={cn(
              "absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 rounded-full",
              "bg-gradient-to-r from-transparent via-red-500 to-transparent",
              "transition-all duration-500 ease-out",
              "group-focus-within:w-[90%]",
              error && "w-[90%] via-red-500"
            )} 
          />
        </div>

        {/* Error Message (Telemetry Warning) */}
        {error && (
          <p className="text-[11px] font-mono font-medium text-red-500 dark:text-red-400 flex items-center gap-1.5 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

CustomTextfield.displayName = "CustomTextfield";

export { CustomTextfield };