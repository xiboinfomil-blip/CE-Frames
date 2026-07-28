'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { signOut } from 'next-auth/react';
import { useAuthCheck } from "@/hooks/useAuthCheck"; 
import { useNavData } from "@/hooks/useNavData"; 
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import DropdownMenu from './DropdownMenu';
import MobileMenu from './MobileMenu';
import NavbarSkeleton from './NavbarSkeleton'; 
import { NAV_ITEMS, AUTH_ITEMS } from '../../config/navbar'; 

// --- Type Definitions ---
interface Category {
  name: string;
  isVisible?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  desktop: boolean;
  mobile: boolean;
  mobileGroup?: 'main' | 'extra';
  auth?: 'authenticated' | 'guest' | 'any';
  activePaths?: string[];
  type: 'link' | 'gallery' | 'category-list';
  dataSource?: string;
  dataKey?: string;
  desktopDropdown?: {
    title: string;
    basePath: string;
  };
  mobileCategoryList?: {
    header: { show: boolean; title?: string };
    basePath: string;
  };
}

interface NavDataSource {
  [key: string]: unknown;
  loading: boolean;
  error: string | null;
}

interface NavData {
  [key: string]: NavDataSource;
}

interface DesktopLinkProps {
  item: NavItem;
  isActive: boolean;
  href: string;
}

const DesktopLink = ({ item, isActive, href }: DesktopLinkProps) => {
  return (
    <Link 
      href={href} 
      className={`group relative px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-200 ease-in-out 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 rounded-md
        ${isActive 
          ? 'text-stone-900 dark:text-stone-100' 
          : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
        }`}
      data-cursor="hover"
      aria-current={isActive ? 'page' : undefined}
    >
      {item.label}
      <span 
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-stone-900 dark:bg-stone-100 transition-all duration-300 ease-out rounded-full
          ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} 
      />
    </Link>
  );
};

export default function Navbar() {
  const { isAuthenticated, isLoading } = useAuthCheck();
  const navData = useNavData() as NavData; 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const getItemData = (item: NavItem | undefined) => {
    if (!item?.dataSource || !navData[item.dataSource]) {
      return { categories: [] as Category[], loading: false, error: null };
    }
    const sourceData = navData[item.dataSource];
    return {
      categories: (sourceData[item.dataKey as keyof typeof sourceData] as Category[]) || [],
      loading: sourceData.loading || false,
      error: sourceData.error || null,
    };
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Block-level disable ensures the rule is suppressed for the setState call inside the effect
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { 
    setIsMenuOpen(false); 
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  if (isLoading) return <NavbarSkeleton />;

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const desktopItems = (NAV_ITEMS as NavItem[]).filter(item => {
    if (!item.desktop) return false;
    if (item.auth === 'authenticated' && !isAuthenticated) return false;
    if (item.auth === 'guest' && isAuthenticated) return false;
    return true;
  });

  const mobileGalleryItem = (NAV_ITEMS as NavItem[]).find(i => i.id === 'gallery');
  const mobileData = getItemData(mobileGalleryItem);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${isScrolled 
          ? 'bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/60 dark:border-stone-800/60 shadow-sm' 
          : 'bg-white/50 dark:bg-stone-950/50 backdrop-blur-md border-b border-transparent'
        }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo */}
          <div className="shrink-0">
            <Link 
              href="/" 
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 rounded-lg p-1 -ml-1"
              data-cursor="hover"
              aria-label="OramaCreativ Home"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-stone-900 dark:bg-stone-100 flex items-center justify-center shadow-sm"
              >
                <Image 
                  src="/logo.png" 
                  alt="OramaCreativ Logo" 
                  width={40} 
                  height={40} 
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain invert dark:invert-0" 
                  priority 
                />
              </motion.div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-stone-900 dark:text-stone-100 leading-none">
                  Orama<span className="text-stone-500 dark:text-stone-400 font-light">Creativ</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-1" role="menubar">
              {desktopItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.activePaths && item.activePaths.some((path: string) => 
                    pathname === path || pathname.startsWith(path + '/')
                  )) || false;

                if (item.type === 'link') {
                  return (
                    <li key={item.id} role="none">
                      <DesktopLink item={item} isActive={isActive} href={item.href || '#'} />
                    </li>
                  );
                }

                if ((item.type === 'gallery' || item.type === 'category-list') && isAuthenticated && item.desktopDropdown) {
                  const { categories, loading, error } = getItemData(item);
                  return (
                    <li key={item.id} role="none">
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
                
                if ((item.type === 'gallery' || item.type === 'category-list') && !isAuthenticated && item.href) {
                  return (
                    <li key={item.id} role="none">
                      <DesktopLink item={item} isActive={isActive} href={item.href} />
                    </li>
                  );
                }
                return null;
              })}
            </ul>

            <div className="w-px h-6 bg-stone-200 dark:bg-stone-800" aria-hidden="true" />

            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <Link 
                  href={AUTH_ITEMS.login.href || '#'} 
                  data-cursor="hover" 
                  className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg shadow-sm hover:bg-stone-800 dark:hover:bg-stone-200 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                >
                  <span>{AUTH_ITEMS.login.label}</span>
                </Link>
              ) : (
                <motion.button 
                  whileTap={{ scale: 0.96 }} 
                  onClick={handleLogout} 
                  data-cursor="hover" 
                  className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                  aria-label="Log out of your account"
                >
                  {AUTH_ITEMS.logout.label}
                </motion.button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-cursor="hover"
              className={`relative p-3 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2
                ${isMenuOpen 
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100' 
                  : 'bg-stone-100/50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-700/50'
                }`}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.div 
                    key="close" 
                    initial={{ rotate: -90, opacity: 0 }} 
                    animate={{ rotate: 0, opacity: 1 }} 
                    exit={{ rotate: 90, opacity: 0 }} 
                    transition={{ duration: 0.2 }}
                  >
                    <HiX className="w-6 h-6" aria-hidden="true" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="menu" 
                    initial={{ rotate: 90, opacity: 0 }} 
                    animate={{ rotate: 0, opacity: 1 }} 
                    exit={{ rotate: -90, opacity: 0 }} 
                    transition={{ duration: 0.2 }}
                  >
                    <HiMenuAlt3 className="w-6 h-6" aria-hidden="true" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
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
    </motion.nav>
  );
}