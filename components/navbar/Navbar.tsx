"use client";
import { useEffect, useState } from 'react';
import Image from "next/image";
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { signOut } from 'next-auth/react';
import { useAuthCheck } from "@/hooks/useAuthCheck"; 
import { useNavData } from "@/hooks/useNavData"; 
import { usePathname } from 'next/navigation';
import CustomLink from '../CustomLinks';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFlagCheckered } from 'react-icons/fa';

import DropdownMenu from './DropdownMenu';
import MobileMenu from './MobileMenu';
import NavbarSkeleton from '../NavbarSkeleton'; 
import { NAV_ITEMS, AUTH_ITEMS } from '../../config/navbar'; 

// Helper component for Desktop Links to keep main JSX clean
const DesktopLink = ({ item, isActive, href }: { item: any, isActive: boolean, href: string }) => {
  const linkClasses = `group relative px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider italic transition-all duration-300
    ${isActive ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'}`;

  return (
    <CustomLink href={href} passHref className={linkClasses} data-cursor="hover">
      {item.label}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 ${isActive ? 'w-3/4 opacity-100' : 'w-0 opacity-0 group-hover:w-3/4 group-hover:opacity-100'}`} />
    </CustomLink>
  );
};

export default function Navbar() {
  const { isAuthenticated, isLoading } = useAuthCheck();
  const navData = useNavData(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Helper to get data for dropdowns
  const getItemData = (item: any) => {
    if (!item.dataSource || !navData[item.dataSource]) {
      return { categories: [], loading: false, error: null };
    }
    const sourceData = navData[item.dataSource];
    return {
      categories: sourceData[item.dataKey] || [],
      loading: sourceData.loading || false,
      error: sourceData.error || null,
    };
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [pathname]);

  if (isLoading) return <NavbarSkeleton />;

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  // Filter items for desktop
  const desktopItems = NAV_ITEMS.filter(item => {
    if (!item.desktop) return false;
    if (item.auth === 'authenticated' && !isAuthenticated) return false;
    if (item.auth === 'guest' && isAuthenticated) return false;
    return true;
  });

  const mobileGalleryItem = NAV_ITEMS.find(i => i.id === 'gallery');
  const mobileData = getItemData(mobileGalleryItem);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed w-full z-40 transition-all duration-500 ease-out will-change-transform ${
        isScrolled
          ? 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-zinc-200/50 dark:border-zinc-800/50 h-16'
          : 'bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border-b border-transparent h-20'
      }`}
    >
      {/* Top Gradient Line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent transition-opacity duration-500 ${
        isScrolled ? 'opacity-100 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'opacity-40'
      }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <CustomLink href="/" passHref className="flex items-center space-x-3 group" data-cursor="hover">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 p-0.5 shadow-lg shadow-red-500/20"
              >
                <div className="w-full h-full rounded-[10px] bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                  <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" priority />
                </div>
              </motion.div>
              <div className="flex flex-col">
                <span className="font-black italic text-lg sm:text-xl uppercase tracking-tight text-zinc-900 dark:text-white">
                  Orama<span className="text-red-500">Creativ</span>
                </span>
                <span className="text-[8px] tracking-[0.3em] text-zinc-500 dark:text-zinc-400 uppercase font-bold hidden sm:block">
                  Motorsport Media
                </span>
              </div>
            </CustomLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-10">
            <ul className="flex items-center space-x-1">
              {desktopItems.map((item) => {
                // Updated isActive logic to support activePaths
                const isActive = pathname === item.href || 
                  (item.activePaths && item.activePaths.some(path => 
                    pathname === path || pathname.startsWith(path + '/')
                  ));

                // 1. Simple Link
                if (item.type === 'link') {
                  return (
                    <li key={item.id}>
                      <DesktopLink item={item} isActive={isActive} href={item.href} />
                    </li>
                  );
                }

                // 2. Dropdown (Authenticated)
                if ((item.type === 'gallery' || item.type === 'category-list') && isAuthenticated && item.desktopDropdown) {
                  const { categories, loading, error } = getItemData(item);
                  return (
                    <li key={item.id}>
                      <DropdownMenu 
                        title={item.desktopDropdown.title} 
                        categories={categories} 
                        loading={loading} 
                        error={error} 
                        basePath={item.desktopDropdown.basePath} 
                      />
                    </li>
                  );
                } 
                
                // 3. Fallback Link for Unauthenticated Users
                if ((item.type === 'gallery' || item.type === 'category-list') && !isAuthenticated && item.href) {
                  return (
                    <li key={item.id}>
                      <DesktopLink item={item} isActive={isActive} href={item.href} />
                    </li>
                  );
                }
                return null;
              })}
            </ul>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              {!isAuthenticated ? (
                <CustomLink href={AUTH_ITEMS.login.href} passHref data-cursor="hover" className="group relative px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wider italic text-white bg-gradient-to-r from-red-600 to-orange-600 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10 flex items-center gap-2">
                    <FaFlagCheckered className="text-xs" />
                    {AUTH_ITEMS.login.label}
                  </span>
                </CustomLink>
              ) : (
                <motion.button 
                  whileTap={{ scale: 0.95 }} 
                  onClick={handleLogout} 
                  data-cursor="hover" 
                  className="group relative px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider italic text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                >
                  {AUTH_ITEMS.logout.label}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-red-500 group-hover:w-3/4 transition-all duration-300" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-cursor="hover"
              className={`relative p-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isMenuOpen ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'}`}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <HiX className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <HiMenuAlt3 className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <MobileMenu 
              authenticated={isAuthenticated} 
              imagesFor={mobileData.categories}
              loading={mobileData.loading}
              error={mobileData.error}
              handleLogout={handleLogout}
              setIsMenuOpen={setIsMenuOpen}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Gradient Line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent transition-opacity duration-500 ${isScrolled ? 'opacity-100 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'opacity-0'}`} />
    </motion.nav>
  );
}