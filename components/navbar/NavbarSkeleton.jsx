// components/NavbarSkeleton.jsx
import { motion } from 'framer-motion';
import Skeleton from '../Skeleton'; // Adjust path if necessary

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
            <Skeleton width="w-10" height="h-10" rounded="rounded-xl" />
            <div className="flex flex-col space-y-1.5">
              <Skeleton width="w-36" height="h-5" rounded="rounded-md" />
              <Skeleton width="w-24" height="h-2.5" rounded="rounded-md" className="hidden sm:block" />
            </div>
          </div>

          {/* Desktop Menu Skeleton */}
          <div className="hidden lg:flex items-center space-x-10">
            <div className="flex items-center space-x-1">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} width="w-20" height="h-8" rounded="rounded-lg" />
              ))}
            </div>
            
            {/* Auth Button Skeleton */}
            <Skeleton width="w-28" height="h-9" rounded="rounded-lg" />
          </div>

          {/* Mobile Menu Button Skeleton */}
          <div className="lg:hidden flex items-center">
            <Skeleton width="w-10" height="h-10" rounded="rounded-xl" />
          </div>

        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0" />
    </motion.nav>
  );
}