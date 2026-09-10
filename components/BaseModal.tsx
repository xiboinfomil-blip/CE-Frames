'use client';

import { useEffect, useId, useRef, useState, ReactNode } from 'react';
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

  const titleId = `modal-title-${useId()}`;
  const subtitleId = `modal-subtitle-${useId()}`;

  // ============================================================
  // OPEN / CLOSE ANIMATION STATE
  // ============================================================

  useEffect(() => {
    if (isOpen) {
      hasBeenOpened.current = true;
      setIsClosing(false);
      return;
    }

    if (!hasBeenOpened.current) return;

    setIsClosing(true);

    const timer = setTimeout(() => {
      setIsClosing(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // ============================================================
  // KEYBOARD + FOCUS TRAP
  // ============================================================

  useEffect(() => {
    if (!isRendered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const modal = modalRef.current;

      if (!modal) return;

      const focusableElements =
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRendered, onClose, isLoading]);

  // ============================================================
  // FOCUS MANAGEMENT + SCROLL LOCK
  // ============================================================

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current =
      document.activeElement as HTMLElement;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 80);

    return () => {
      clearTimeout(timer);

      document.body.style.overflow = originalOverflow;

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
          duration: 0.2,
          ease: 'easeOut',
        }}
        className="
          fixed
          inset-0
          z-50
          flex
          items-end
          justify-center
          sm:items-center
          sm:p-6
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={
          subtitle ? subtitleId : undefined
        }
      >
        {/* ================================================== */}
        {/* BACKDROP */}
        {/* ================================================== */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="
            absolute
            inset-0

            bg-[#00345F]/35
            backdrop-blur-[18px]

            dark:bg-[#06101C]/65
            dark:backdrop-blur-[20px]
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
            scale: 0.97,
            y: 8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.97,
            y: 8,
          }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 32,
            mass: 0.8,
          }}
          className={`
            relative
            flex
            max-h-[90vh]
            w-full
            flex-col
            overflow-hidden

            rounded-t-[26px]
            border
            border-white/70
            bg-white/95

            shadow-[0_24px_80px_rgba(0,52,95,0.22)]

            backdrop-blur-2xl

            sm:max-h-[86vh]
            sm:rounded-[22px]

            dark:border-white/[0.10]
            dark:bg-[#0E1C2D]/95
            dark:shadow-[0_28px_90px_rgba(0,0,0,0.55)]

            ${widthClasses[maxWidth]}
          `}
        >
          {/* ================================================== */}
          {/* TOP ACCENT */}
          {/* ================================================== */}

          <div
            className="
              absolute
              left-0
              right-0
              top-0
              z-30
              h-[2px]

              bg-linear-to-r
              from-[#00345F]
              via-[#004A87]
              to-[#FF8201]
            "
            aria-hidden="true"
          />

          {/* ================================================== */}
          {/* HEADER */}
          {/* ================================================== */}

          <div
            className="
              relative
              z-20
              flex
              min-h-[68px]
              items-center
              justify-between

              border-b
              border-[#00345F]/[0.07]

              bg-white/80
              px-5
              py-3.5

              backdrop-blur-xl

              sm:px-6

              dark:border-white/[0.07]
              dark:bg-[#0E1C2D]/75
            "
          >
            {/* macOS-style traffic-light inspired controls */}

            <div
              className="
                flex
                items-center
                gap-2
              "
              aria-hidden="true"
            >
              <span
                className="
                  h-3
                  w-3
                  rounded-full
                  bg-[#FF5F57]
                  shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]
                "
              />

              <span
                className="
                  h-3
                  w-3
                  rounded-full
                  bg-[#FFBD2E]
                  shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]
                "
              />

              <span
                className="
                  h-3
                  w-3
                  rounded-full
                  bg-[#28C840]
                  shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]
                "
              />
            </div>

            {/* Title */}

            <div
              className="
                absolute
                left-1/2
                max-w-[55%]
                -translate-x-1/2
                text-center
              "
            >
              <h2
                id={titleId}
                className="
                  truncate
                  text-[15px]
                  font-semibold
                  tracking-[-0.01em]
                  text-[#172033]

                  dark:text-white
                "
              >
                {title}
              </h2>

              {subtitle && (
                <p
                  id={subtitleId}
                  className="
                    mt-0.5
                    truncate
                    text-[11px]
                    font-medium
                    text-[#64748B]

                    dark:text-white/45
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
                ml-auto
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full

                border
                border-[#00345F]/[0.06]

                bg-[#F5F7FA]/80

                text-[#64748B]

                shadow-sm

                transition-all
                duration-150

                hover:border-[#FF8201]/20
                hover:bg-[#FFF1E5]
                hover:text-[#00345F]

                active:scale-95

                disabled:pointer-events-none
                disabled:opacity-30

                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#FF8201]
                focus-visible:ring-offset-2

                dark:border-white/[0.08]
                dark:bg-white/[0.06]
                dark:text-white/45

                dark:hover:border-[#FF8201]/30
                dark:hover:bg-[#FF8201]/10
                dark:hover:text-white

                dark:focus-visible:ring-offset-[#0E1C2D]
              "
              aria-label="Close modal"
            >
              <HiXMark
                className="
                  h-[17px]
                  w-[17px]
                  transition-transform
                  duration-200

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

              bg-white/75

              dark:bg-[#0E1C2D]/70
            "
          >
            {/* Subtle Infomil blue glow */}

            <div
              className="
                pointer-events-none
                absolute
                -right-32
                -top-32
                h-64
                w-64
                rounded-full

                bg-[#EAF4FB]

                opacity-50
                blur-[70px]

                dark:bg-[#004A87]/10
                dark:opacity-80
              "
              aria-hidden="true"
            />

            {/* Subtle orange glow */}

            <div
              className="
                pointer-events-none
                absolute
                -bottom-32
                -left-32
                h-56
                w-56
                rounded-full

                bg-[#FFF1E5]

                opacity-30
                blur-[70px]

                dark:bg-[#FF8201]/[0.04]
                dark:opacity-100
              "
              aria-hidden="true"
            />

            <div
              className="
                relative
                z-10
                px-5
                py-6

                sm:px-7
                sm:py-7
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
                z-20

                flex
                flex-col-reverse
                gap-2

                border-t
                border-[#00345F]/[0.07]

                bg-[#F8FAFC]/85

                px-5
                py-4

                backdrop-blur-xl

                sm:flex-row
                sm:items-center
                sm:justify-end
                sm:px-6

                dark:border-white/[0.07]
                dark:bg-[#091522]/80
              "
            >
              {footer}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ================================================== */}
      {/* MAC-STYLE SCROLLBAR */}
      {/* ================================================== */}

      <style>{`
        .modal-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .modal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .modal-scroll::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.28);
          border: 2px solid transparent;
          background-clip: padding-box;
          border-radius: 999px;
        }

        .modal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.48);
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .dark .modal-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.14);
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .dark .modal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 130, 1, 0.38);
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .modal-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.28) transparent;
        }

        .dark .modal-scroll {
          scrollbar-color: rgba(255, 255, 255, 0.14) transparent;
        }
      `}</style>
    </AnimatePresence>
  );
}