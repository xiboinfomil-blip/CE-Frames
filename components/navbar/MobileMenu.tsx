'use client';

import { motion, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NAV_ITEMS, AUTH_ITEMS } from '../../config/navbar';
import { HiArrowRightOnRectangle } from 'react-icons/hi2';

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
    y: -12,
    scale: 0.98,
    transition: { duration: 0.25, ease: cubicBezier } 
  },
  open: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.35, ease: cubicBezier, staggerChildren: 0.04, delayChildren: 0.05 } 
  },
};

const itemVariants: Variants = {
  closed: { opacity: 0, x: -8, transition: { duration: 0.15 } },
  open: { opacity: 1, x: 0, transition: { duration: 0.25, ease: cubicBezier } },
};

// --- Sub-Components ---
const CategoryLink = ({ 
  category, 
  config, 
  onClick 
}: { 
  category: Category; 
  config: CategoryListConfig; 
  onClick: () => void 
}) => {
  return (
    <Link 
      href={`${config.basePath}?for=${encodeURIComponent(category.name)}`} 
      className="group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      onClick={onClick}
      role="menuitem"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-rose-400 transition-colors duration-200" aria-hidden="true" />
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
      id="mobile-menu"
      className="lg:hidden fixed inset-x-4 top-16 z-50 mt-1"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      <div className="bg-slate-950/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-slate-950/80 border border-slate-800/80 overflow-hidden">
        
        {/* Scrollable Container */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          
          {/* Main Navigation Items */}
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
                    className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                      ${isActive 
                         ? 'bg-rose-600/15 text-rose-300 font-semibold' 
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                      }`}
                    onClick={closeMenu}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="mobileActiveIndicator" 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-rose-500 rounded-r-full" 
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
            <div className="relative pt-1" aria-hidden="true">
              <div className="h-px bg-slate-800/80" />
            </div>
          )}

          {/* Extra / Category Items */}
          <motion.div variants={itemVariants} className="space-y-4">
            {extraItems.map((item) => {
              // 1. Render category list if configured
              if ((item.type === 'gallery' || item.type === 'category-list') && item.mobileCategoryList) {
                const config = item.mobileCategoryList;

                return (
                  <div key={item.id} className="space-y-2">
                    {config.header.show && (
                      <div className="flex items-center gap-3 px-3.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {config.header.title || 'Categories'}
                        </span>
                        <div className="flex-1 h-px bg-slate-800/80" aria-hidden="true" />
                      </div>
                    )}
                    
                    <div className="space-y-0.5">
                      {loading ? (
                        <div className="px-3.5 py-2.5 text-sm text-slate-500 animate-pulse">Loading categories...</div>
                      ) : error ? (
                        <div className="px-3.5 py-2.5 text-sm text-rose-400 bg-rose-950/30 rounded-xl border border-rose-900/40">
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
                        <div className="px-3.5 py-2.5 text-sm text-slate-500">No categories available</div>
                      )}
                    </div>
                  </div>
                );
              }
              
              // 2. Render standard links
              if (item.type === 'link' || (item.type === 'gallery' && item.href)) {
                const isActive = pathname === item.href || 
                  (item.activePaths && item.activePaths.some((path: string) => 
                    pathname === path || pathname.startsWith(path + '/')
                  ));
                
                return (
                  <Link 
                    key={item.id}
                    href={item.href || '#'} 
                    className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                      ${isActive 
                        ? 'bg-rose-600/15 text-rose-300 font-semibold' 
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                      }`}
                    onClick={closeMenu}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="mobileActiveIndicator" 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-rose-500 rounded-r-full" 
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

        {/* Footer Actions */}
        <div className="relative border-t border-slate-800/80 bg-slate-900/60 p-5">
          {!authenticated ? (
            <motion.div variants={itemVariants}>
              <Link 
                href={AUTH_ITEMS.login.href || '#'} 
                className="group relative flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-rose-600 text-white font-semibold text-sm tracking-wide shadow-lg shadow-rose-600/20 hover:bg-rose-500 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
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
                className="group relative flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-sm tracking-wide hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <HiArrowRightOnRectangle className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                <span>{AUTH_ITEMS.logout.mobileLabel || AUTH_ITEMS.logout.label || 'Sign Out'}</span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}