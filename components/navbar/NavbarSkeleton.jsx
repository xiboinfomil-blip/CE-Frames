'use client';

import { motion } from 'framer-motion';
import Skeleton from '../Skeleton';

export default function NavbarSkeleton() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#0B1624]/80 backdrop-blur-md border-b border-[#E2E8F0] dark:border-white/10 py-3"
      role="status"
      aria-label="Loading navbar"
    >
      {/* Top accent glow line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          
          {/* Logo Skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton variant="text-line" className="w-8 h-8 sm:w-9 sm:h-9 !rounded-xl" />
            <div className="flex flex-col gap-1.5">
              <Skeleton variant="text-line" className="w-28 sm:w-32 h-4 !rounded-md" />
              <Skeleton variant="text-line" className="w-16 h-2 !rounded-md hidden sm:block" />
            </div>
          </div>

          {/* Desktop Menu Skeleton */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="text-line" className="w-16 h-4 !rounded-md" />
              ))}
            </div>

            <div className="w-px h-5 bg-[#E2E8F0] dark:bg-white/10" aria-hidden="true" />
            
            {/* Auth Button Skeleton */}
            <Skeleton variant="text-line" className="w-24 h-9 !rounded-xl" />
          </div>

          {/* Mobile Menu Button Skeleton */}
          <div className="lg:hidden flex items-center">
            <Skeleton variant="text-line" className="w-9 h-9 !rounded-xl" />
          </div>

        </div>
      </div>
    </motion.nav>
  );
}