'use client';

import { useEffect, useRef, ReactNode } from 'react';

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
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // 1. Accessibility: Focus Trap & Escape Key Handling
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, onClose, isLoading]);

  // 2. Accessibility & UX: Focus Management & Body Scroll Lock
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop: Premium "Depth of Field" Glassmorphism */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-md transition-opacity duration-300 ease-out" 
        onClick={!isLoading ? onClose : undefined} 
        aria-hidden="true"
      />
      
      {/* Modal Container: Aerodynamic curves, crisp borders, deep shadow */}
      <div 
        ref={modalRef}
        className={`relative w-full ${widthClasses[maxWidth]} bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] ring-1 ring-black/5 transform transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] scale-100 opacity-100`}
      >
        
        {/* Racing Livery Accent Top Bar: Classic white car with central racing stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-slate-900 via-red-600 to-slate-900 z-20" />

        {/* Header */}
        <div className="px-5 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-start bg-white relative">
          <div className="pr-8">
            <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-none">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] sm:text-xs font-mono font-semibold text-slate-500 mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
                {/* Live Telemetry Indicator */}
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block shadow-[0_0_8px_rgba(220,38,38,0.6)] animate-pulse" />
                {subtitle}
              </p>
            )}
          </div>
          <button 
            ref={closeBtnRef}
            onClick={onClose} 
            disabled={isLoading}
            className="group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-full transition-all duration-200 disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:ring-offset-2"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area: Scrollable with Technical Grid */}
        <div className="flex-1 overflow-y-auto relative bg-white modal-scroll">
           {/* Subtle Technical Drafting Grid: Highly performant radial gradient */}
           <div 
            className="absolute inset-0 pointer-events-none opacity-[0.4]" 
            style={{ 
              backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
              backgroundSize: '20px 20px' 
            }} 
            aria-hidden="true" 
          />
          
          <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-6">
            {children}
          </div>
        </div>

        {/* Footer Actions: Frosted glass separation */}
        {footer && (
          <div className="px-5 py-4 sm:px-8 sm:py-5 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3 relative z-10 backdrop-blur-md">
            {footer}
          </div>
        )}
      </div>

      {/* Inline styles for a premium, dependency-free custom scrollbar */}
      <style>{`
        .modal-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .modal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal-scroll::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 20px;
        }
        .modal-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #cbd5e1;
        }
      `}</style>
    </div>
  );
}