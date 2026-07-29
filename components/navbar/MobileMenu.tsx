'use client';

import { motion, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NAV_ITEMS, AUTH_ITEMS } from '../../config/navbar';

// --- Type Definitions ---
interface Category {
  name: string;
  isVisible?: boolean;
}

interface CategoryListConfig {
  header: {
    show: boolean;
    title?: string;
  };
  basePath: string;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  mobile: boolean;
  mobileGroup?: 'main' | 'extra';
  auth?: 'authenticated' | 'guest' | 'any';
  activePaths?: string[];
  type?: 'link' | 'gallery' | 'category-list';
  mobileCategoryList?: CategoryListConfig;
}

interface MobileMenuProps {
  authenticated: boolean;
  imagesFor: Category[] | null | undefined;
  loading: boolean;
  error: string | null | undefined;
  handleLogout: () => void;
  setIsMenuOpen: (isOpen: boolean) => void;
}

// --- Animation Variants ---
const cubicBezier = [0.22, 1, 0.36, 1] as [number, number, number, number];

const menuVariants: Variants = {
  closed: { 
    opacity: 0, 
    y: -10, 
    transition: { duration: 0.3, ease: cubicBezier } 
  },
  open: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: cubicBezier, staggerChildren: 0.05, delayChildren: 0.1 } 
  },
};

const itemVariants: Variants = {
  closed: { opacity: 0, x: -10, transition: { duration: 0.2 } },
  open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: cubicBezier } },
};

// --- Sub-Components ---
const CategoryLink = ({ category, config, onClick }: { category: Category; config: CategoryListConfig; onClick: () => void }) => {
  return (
    <Link 
      href={`${config.basePath}?for=${encodeURIComponent(category.name)}`} 
      className="group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
      onClick={onClick}
      role="menuitem"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 group-hover:bg-stone-900 dark:group-hover:bg-stone-100 transition-colors duration-200" aria-hidden="true" />
      <span className="capitalize">{category.name}</span>
    </Link>
  );
};

// --- Main Component ---
export default function MobileMenu({ 
  authenticated, 
  imagesFor, 
  loading, 
  error, 
  handleLogout, 
  setIsMenuOpen 
}: MobileMenuProps) {
  const pathname = usePathname();
  const closeMenu = () => setIsMenuOpen(false);

  const mobileItems = (NAV_ITEMS as NavItem[]).filter(item => {
    if (!item.mobile) return false;
    if (item.auth === 'authenticated' && !authenticated) return false;
    if (item.auth === 'guest' && authenticated) return false;
    return true;
  });

  const mainItems = mobileItems.filter(item => item.mobileGroup === 'main');
  const extraItems = mobileItems.filter(item => item.mobileGroup === 'extra');
  const visibleCategories = (imagesFor || []).filter((cat) => cat.isVisible !== false);

  return (
    <motion.div 
      variants={menuVariants} 
      initial="closed" 
      animate="open" 
      exit="closed" 
      className="lg:hidden fixed inset-x-0 top-16 z-60 px-4 pb-6"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      <div className="bg-white/95 dark:bg-stone-950/95 backdrop-blur-2xl rounded-2xl shadow-xl shadow-stone-200/50 dark:shadow-black/50 border border-stone-200/60 dark:border-stone-800/60 overflow-hidden">
        
        <div className="p-6 space-y-6">
          <motion.ul className="space-y-1" role="menu">
            {mainItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.activePaths && item.activePaths.some((path: string) => 
                  pathname === path || pathname.startsWith(path + '/')
                ));
              
              return (
                <motion.li key={item.id} variants={itemVariants} role="none">
                  <Link 
                    href={item.href || '#'} 
                    className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400
                      ${isActive 
                        ? 'bg-stone-100 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100' 
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-stone-100'
                      }`}
                    onClick={closeMenu}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="mobileActiveIndicator" 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-stone-900 dark:bg-stone-100 rounded-r-full" 
                        transition={{ type: "spring", stiffness: 400, damping: 30 }} 
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>

          {extraItems.length > 0 && (
            <div className="relative pt-2">
              <div className="h-px bg-stone-200 dark:bg-stone-800" aria-hidden="true" />
            </div>
          )}

          {/* ✅ FIXED: Unified rendering for extraItems. Auth filtering is already handled by `mobileItems` above. */}
          <motion.div variants={itemVariants} className="space-y-4">
            {extraItems.map((item) => {
              // 1. Render category list if applicable
              if ((item.type === 'gallery' || item.type === 'category-list') && item.mobileCategoryList) {
                const config = item.mobileCategoryList;

                return (
                  <div key={item.id} className="space-y-3">
                    {config.header.show && (
                      <div className="flex items-center gap-3 px-4">
                        <span className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                          {config.header.title || 'Categories'}
                        </span>
                        <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" aria-hidden="true" />
                      </div>
                    )}
                    
                    <div className="max-h-60 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-800 scrollbar-track-transparent">
                      {loading ? (
                        <div className="px-4 py-3 text-sm text-stone-400 animate-pulse">Loading categories...</div>
                      ) : error ? (
                        <div className="px-4 py-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/50">
                          {error}
                        </div>
                      ) : visibleCategories.length > 0 ? (
                        visibleCategories.map((categoryObj) => (
                          <CategoryLink 
                            key={`${item.id}-${categoryObj.name}`} 
                            category={categoryObj} 
                            config={config} 
                            onClick={closeMenu} 
                          />
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-stone-400">No categories available</div>
                      )}
                    </div>
                  </div>
                );
              }
              
              // 2. Render standard links (Now works for BOTH authenticated and guest users)
              if (item.type === 'link' || (item.type === 'gallery' && item.href)) {
                const isActive = pathname === item.href || 
                  (item.activePaths && item.activePaths.some((path: string) => 
                    pathname === path || pathname.startsWith(path + '/')
                  ));
                
                return (
                  <Link 
                    key={item.id}
                    href={item.href || '#'} 
                    className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400
                      ${isActive 
                        ? 'bg-stone-100 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100' 
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-stone-100'
                      }`}
                    onClick={closeMenu}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="mobileActiveIndicator" 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-stone-900 dark:bg-stone-100 rounded-r-full" 
                        transition={{ type: "spring", stiffness: 400, damping: 30 }} 
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              }
              
              return null;
            })}
          </motion.div>
        </div>

        <div className="relative border-t border-stone-200/60 dark:border-stone-800/60 bg-stone-50/50 dark:bg-stone-900/50 p-6">
          {!authenticated ? (
            <motion.div variants={itemVariants}>
              <Link 
                href={AUTH_ITEMS.login.href || '#'} 
                className="group relative flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-sm tracking-wide hover:bg-stone-800 dark:hover:bg-stone-200 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                onClick={closeMenu}
              >
                <span>{AUTH_ITEMS.login.mobileLabel || AUTH_ITEMS.login.label || 'Sign In'}</span>
              </Link>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <motion.button 
                whileTap={{ scale: 0.98 }} 
                onClick={handleLogout}
                className="group relative flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl bg-transparent border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-sm tracking-wide hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{AUTH_ITEMS.logout.mobileLabel || AUTH_ITEMS.logout.label || 'Sign Out'}</span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}