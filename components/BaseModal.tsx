'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  isLoading?: boolean;
}

// Hoisted outside component to prevent recreation on every render (Performance)
const widthClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
  '6xl': 'sm:max-w-6xl',
  '7xl': 'sm:max-w-7xl',
};

export default function BaseModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  footer,
  maxWidth = 'lg',
  isLoading = false
}: BaseModalProps) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // 1. Self-contained animation mounting/unmounting
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      // Delay unmounting to allow Framer Motion exit animation to complete
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 2. Accessibility: Focus Trap & Escape Key Handling
  useEffect(() => {
    if (!isRendered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape
      if (e.key === 'Escape' && !isLoading) {
        e.preventDefault();
        onClose();
        return;
      }

      // Handle Tab (Focus Trap)
      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || document.activeElement === document.body) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isRendered, onClose, isLoading]);

  // 3. Accessibility & UX: Focus Management & Body Scroll Lock
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      
      // Defer focus to ensure DOM is ready and entrance transition has started
      const timer = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
      
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={subtitle ? "modal-subtitle" : undefined}
      >
        {/* Backdrop: Premium, subtle depth of field */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm transition-colors duration-300" 
          onClick={!isLoading ? onClose : undefined} 
          aria-hidden="true"
        />
        
        {/* Modal Container: Aerodynamic curves, crisp borders, diffused shadow */}
        <motion.div 
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className={`relative w-full ${widthClasses[maxWidth]} bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-100 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]`}
        >
          {/* Header */}
          <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start bg-white dark:bg-zinc-950 relative z-10">
            <div className="pr-8">
              <h2 id="modal-title" className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p id="modal-subtitle" className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            <button 
              ref={closeBtnRef}
              onClick={onClose} 
              disabled={isLoading}
              className="group flex items-center justify-center w-10 h-10 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-2"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content Area: Clean, scrollable, distraction-free */}
          <div className="flex-1 overflow-y-auto relative bg-white dark:bg-zinc-950 modal-scroll">
            <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-8">
              {children}
            </div>
          </div>

          {/* Footer Actions: Frosted glass separation */}
          {footer && (
            <div className="px-6 py-4 sm:px-8 sm:py-5 bg-zinc-50/80 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 relative z-10 backdrop-blur-md">
              {footer}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Inline styles for a premium, dependency-free custom scrollbar */}
      <style>{`
        .modal-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .modal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal-scroll::-webkit-scrollbar-thumb {
          background-color: #e4e4e7; /* zinc-200 */
          border-radius: 9999px;
        }
        .dark .modal-scroll::-webkit-scrollbar-thumb {
          background-color: #3f3f46; /* zinc-700 */
        }
        .modal-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #d4d4d8; /* zinc-300 */
        }
        .dark .modal-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #52525b; /* zinc-600 */
        }
      `}</style>
    </AnimatePresence>
  );
}