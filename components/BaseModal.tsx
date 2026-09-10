'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?:
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl';
  isLoading?: boolean;
}

// Hoisted outside component to prevent recreation on every render
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
  isLoading = false,
}: BaseModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const isRendered = isOpen || isClosing;
  const hasBeenOpened = useRef(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // ============================================================
  // MOUNT / UNMOUNT
  // ============================================================

  useEffect(() => {
    if (isOpen) {
      hasBeenOpened.current = true;
      return;
    }

    if (!hasBeenOpened.current) return;

    setIsClosing(true);
    const timer = setTimeout(() => {
      setIsClosing(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // ============================================================
  // KEYBOARD ACCESSIBILITY + FOCUS TRAP
  // ============================================================

  useEffect(() => {
    if (!isRendered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape
      if (e.key === 'Escape' && !isLoading) {
        e.preventDefault();
        onClose();
        return;
      }

      // Tab focus trap
      if (e.key === 'Tab') {
        const modal = modalRef.current;

        if (!modal) return;

        const focusableElements =
          modal.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement =
          focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (
            document.activeElement === lastElement ||
            document.activeElement === document.body
          ) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRendered, onClose, isLoading]);

  // ============================================================
  // FOCUS MANAGEMENT + BODY SCROLL LOCK
  // ============================================================

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current =
      document.activeElement as HTMLElement;

    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);

      document.body.style.overflow = '';

      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="base-modal-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
        className="
          fixed
          inset-0
          z-50
          flex
          items-end
          justify-center
          p-0

          sm:items-center
          sm:p-6
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={
          subtitle ? 'modal-subtitle' : undefined
        }
      >
        {/* ================================================== */}
        {/* BACKDROP */}
        {/* ================================================== */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="
            absolute
            inset-0

            bg-[#00345F]/55
            backdrop-blur-md

            transition-colors
            duration-300

            dark:bg-[#06101C]/75
          "
          onClick={!isLoading ? onClose : undefined}
          aria-hidden="true"
        />

        {/* ================================================== */}
        {/* MODAL */}
        {/* ================================================== */}

        <motion.div
          ref={modalRef}
          initial={{
            opacity: 0,
            scale: 0.96,
            y: 16,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.96,
            y: 16,
          }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 28,
          }}
          className={`
            relative
            flex
            max-h-[92vh]
            w-full
            flex-col
            overflow-hidden

            rounded-t-3xl
            border
            border-[#E2E8F0]
            bg-white

            shadow-2xl
            shadow-[#00345F]/20

            sm:max-h-[88vh]
            sm:rounded-3xl

            dark:border-white/[0.08]
            dark:bg-[#0E1C2D]
            dark:shadow-black/70

            ${widthClasses[maxWidth]}
          `}
        >
          {/* ================================================== */}
          {/* BRAND ACCENT */}
          {/* ================================================== */}

          <div
            className="
              h-1.5
              w-full
              bg-linear-to-r
              from-[#00345F]
              via-[#004A87]
              to-[#FF8201]
            "
          />

          {/* ================================================== */}
          {/* HEADER */}
          {/* ================================================== */}

          <div
            className="
              relative
              z-10
              flex
              items-start
              justify-between
              border-b
              border-[#E2E8F0]
              bg-white
              px-6
              py-5

              sm:px-8
              sm:py-6

              dark:border-white/[0.08]
              dark:bg-[#0E1C2D]
            "
          >
            <div className="pr-8">
              <h2
                id="modal-title"
                className="
                  text-xl
                  font-bold
                  leading-tight
                  tracking-tight
                  text-[#172033]

                  sm:text-2xl

                  dark:text-white
                "
              >
                {title}
              </h2>

              {subtitle && (
                <p
                  id="modal-subtitle"
                  className="
                    mt-1.5
                    text-sm
                    font-medium
                    leading-relaxed
                    text-[#64748B]

                    dark:text-white/50
                  "
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* Close */}
            <button
              ref={closeBtnRef}
              onClick={onClose}
              disabled={isLoading}
              className="
                group
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full

                text-[#64748B]

                transition-all
                duration-200

                hover:bg-[#FFF1E5]
                hover:text-[#00345F]

                disabled:opacity-30

                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#FF8201]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-white

                dark:text-white/45
                dark:hover:bg-[#FF8201]/10
                dark:hover:text-white
                dark:focus-visible:ring-offset-[#0E1C2D]
              "
              aria-label="Close modal"
            >
              <HiXMark
                className="
                  h-5
                  w-5
                  transition-transform
                  duration-300

                  group-hover:rotate-90
                "
              />
            </button>
          </div>

          {/* ================================================== */}
          {/* CONTENT */}
          {/* ================================================== */}

          <div
            className="
              modal-scroll
              relative
              flex-1
              overflow-y-auto
              bg-white

              dark:bg-[#0E1C2D]
            "
          >
            {/* Subtle decorative glow */}
            <div
              className="
                pointer-events-none
                absolute
                -right-24
                -top-24
                h-48
                w-48
                rounded-full
                bg-[#EAF4FB]
                blur-3xl
                opacity-60

                dark:bg-[#004A87]/10
              "
            />

            <div
              className="
                relative
                z-10
                px-6
                py-6

                sm:px-8
                sm:py-8
              "
            >
              {children}
            </div>
          </div>

          {/* ================================================== */}
          {/* FOOTER */}
          {/* ================================================== */}

          {footer && (
            <div
              className="
                relative
                z-10
                flex
                justify-end
                gap-3
                border-t
                border-[#E2E8F0]
                bg-[#F5F7FA]/90
                px-6
                py-4
                backdrop-blur-xl

                sm:px-8
                sm:py-5

                dark:border-white/[0.08]
                dark:bg-[#091522]/80
              "
            >
              {/* Orange accent */}
              <div
                className="
                  absolute
                  left-6
                  top-0
                  h-px
                  w-12
                  bg-[#FF8201]

                  sm:left-8
                "
                aria-hidden="true"
              />

              {footer}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ================================================== */}
      {/* CUSTOM SCROLLBAR */}
      {/* ================================================== */}

      <style>{`
        .modal-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .modal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .modal-scroll::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 9999px;
        }

        .modal-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #64748b;
        }

        .dark .modal-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.12);
        }

        .dark .modal-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 130, 1, 0.45);
        }

        .modal-scroll {
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }

        .dark .modal-scroll {
          scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
        }
      `}</style>
    </AnimatePresence>
  );
}