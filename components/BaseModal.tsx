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

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Store currently focused element to restore later
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isLoading]);

  // Focus management & Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Defer focus to ensure DOM is ready
      const timer = setTimeout(() => closeBtnRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
      // Restore focus to the element that triggered the modal
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Map Tailwind max-width classes
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop - Light & Airy Glassmorphism */}
      <div 
        className="absolute inset-0 bg-white/40 backdrop-blur-md transition-opacity duration-300 ease-out" 
        onClick={!isLoading ? onClose : undefined} 
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div 
        ref={modalRef}
        className={`relative w-full ${widthClasses[maxWidth]} bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-black/5 transform transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] scale-100 opacity-100`}
      >
        
        {/* Racing Livery Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-20" />

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-white relative">
          <div className="pr-8">
            <h2 id="modal-title" className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs font-mono font-medium text-slate-500 mt-2 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                {subtitle}
              </p>
            )}
          </div>
          <button 
            ref={closeBtnRef}
            onClick={onClose} 
            disabled={isLoading}
            className="group p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-200 disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
           {/* Subtle Technical Grid Background */}
           <div 
            className="absolute inset-0 pointer-events-none opacity-[0.4]" 
            style={{ 
              backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)', 
              backgroundSize: '24px 24px' 
            }} 
            aria-hidden="true" 
          />
          
          <div className="relative z-10 px-8 py-6">
            {children}
          </div>
        </div>

        {/* Footer Actions */}
        {footer && (
          <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 relative z-10 backdrop-blur-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}