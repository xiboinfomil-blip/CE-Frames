// components/NavbarSkeleton.jsx
import { motion } from 'framer-motion';

export default function NavbarSkeleton() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed w-full z-40 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border-b border-transparent h-20 transition-all duration-500 ease-out"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo Skeleton */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100] animate-shimmer" />
            <div className="flex flex-col space-y-1.5">
              <div className="w-36 h-5 rounded-md bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100] animate-shimmer" />
              <div className="w-24 h-2.5 rounded-md bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100] animate-shimmer hidden sm:block" />
            </div>
          </div>

          {/* Desktop Menu Skeleton */}
          <div className="hidden lg:flex items-center space-x-10">
            <div className="flex items-center space-x-1">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-20 h-8 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100] animate-shimmer" 
                />
              ))}
            </div>
            
            {/* Auth Button Skeleton */}
            <div className="w-28 h-9 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100] animate-shimmer" />
          </div>

          {/* Mobile Menu Button Skeleton */}
          <div className="lg:hidden flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100] animate-shimmer" />
          </div>

        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0" />
    </motion.nav>
  );
}