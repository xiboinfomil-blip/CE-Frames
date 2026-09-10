import * as React from 'react';
import { HiExclamationCircle } from 'react-icons/hi2';
import { cn } from '@/lib/utils';

export interface CustomTextfieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * CustomTextfield - A compact and accessible text input matching the CE Frames palette.
 */
const CustomTextfield = React.forwardRef<
  HTMLInputElement,
  CustomTextfieldProps
>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    // Generate fallback unique ID for accessible label and error pairing
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="group relative w-full flex flex-col gap-1.5">

        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-[11px] font-bold uppercase tracking-[0.1em] transition-colors duration-200 select-none pl-1',
              'text-[#64748B] group-focus-within:text-[#004A87]',
              error &&
                'text-[#FF8201] group-focus-within:text-[#FF8201]'
            )}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative flex items-center">

          {/* Left Icon */}
          {leftIcon && (
            <div
              className={cn(
                'absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none z-10',
                'text-[#94A3B8] group-focus-within:text-[#004A87]',
                error && 'text-[#FF8201]'
              )}
            >
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            id={inputId}
            type={type}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              // Base Layout & Typography
              'w-full rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
              'bg-white dark:bg-[#0E1C2D] text-[#172033] dark:text-white placeholder:text-[#94A3B8]',

              // Borders & Subtle Shadows
              'border border-[#E2E8F0] dark:border-white/10 shadow-sm hover:border-[#CBD5E1]',

              // Focus State
              'focus:outline-none focus:border-[#FF8201] focus:ring-4 focus:ring-[#FF8201]/15',

              // Error State
              error &&
                'border-red-300 text-[#172033] dark:text-white placeholder:text-red-300 focus:border-red-500 focus:ring-red-500/15',

              // Disabled State
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F5F7FA] dark:disabled:bg-[#102238]',

              // Dynamic Padding based on Icons
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',

              className
            )}
            ref={ref}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div
              className={cn(
                'absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 z-10',
                'text-[#94A3B8] group-focus-within:text-[#004A87]',
                error && 'text-[#FF8201]'
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-red-600 flex items-center gap-1.5 mt-0.5 pl-1 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <HiExclamationCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

CustomTextfield.displayName = 'CustomTextfield';

export { CustomTextfield };