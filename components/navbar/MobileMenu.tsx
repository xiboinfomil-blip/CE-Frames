'use client';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import CustomLink from '../CustomLinks';
import { FaFlagCheckered } from 'react-icons/fa';
import { NAV_ITEMS, AUTH_ITEMS } from '../../config/navbar';

// --- Theme Configuration ---
const THEME_CLASSES = {
  red: {
    scrollbar: 'scrollbar-thumb-red-300 dark:scrollbar-thumb-red-700',
    dot: 'bg-red-500/40 group-hover:bg-red-500 group-hover:shadow-[0_0_6px_rgba(239,68,68,0.6)]',
    hoverText: 'hover:text-red-500',
    underline: 'from-red-500 to-orange-500',
    headerIcon: 'text-red-500',
    headerLine: 'from-red-500/30 to-transparent'
  },
  orange: {
    scrollbar: 'scrollbar-thumb-orange-300 dark:scrollbar-thumb-orange-700',
    dot: 'bg-orange-500/40 group-hover:bg-orange-500 group-hover:shadow-[0_0_6px_rgba(249,115,22,0.6)]',
    hoverText: 'hover:text-orange-500',
    underline: 'from-orange-500 to-red-500',
    headerIcon: 'text-orange-500',
    headerLine: 'from-orange-500/30 to-transparent'
  }
};

// --- Animation Variants ---
const menuVariants = {
  closed: { opacity: 0, y: -20, height: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  open: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  closed: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  open: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

// --- Sub-Component: Category Link ---
const CategoryLink = ({ category, config, theme, onClick }: any) => {
  return (
    <div className="group/item relative flex items-center rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-200">
      <CustomLink 
        href={`${config.basePath}?for=${encodeURIComponent(category.name)}`} 
        passHref
        className={`flex-1 group relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-300 ${theme.hoverText} transition-all duration-200`}
        onClick={onClick}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} transition-all`} />
        <span className="capitalize font-medium">{category.name}</span>
        <div className={`absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r ${theme.underline} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
      </CustomLink>
    </div>
  );
};

export default function MobileMenu({ authenticated, imagesFor, loading, error, handleLogout, setIsMenuOpen }: any) {
  const pathname = usePathname();
  const closeMenu = () => setIsMenuOpen(false);

  // Filter items
  const mobileItems = NAV_ITEMS.filter(item => {
    if (!item.mobile) return false;
    if (item.auth === 'authenticated' && !authenticated) return false;
    if (item.auth === 'guest' && authenticated) return false;
    return true;
  });

  const mainItems = mobileItems.filter(item => item.mobileGroup === 'main');
  const extraItems = mobileItems.filter(item => item.mobileGroup === 'extra');
  const visibleCategories = imagesFor?.filter((cat: any) => cat.isVisible !== false) || [];

  return (
    <motion.div 
      variants={menuVariants} 
      initial="closed" 
      animate="open" 
      exit="closed" 
      className="lg:hidden fixed inset-x-0 top-16 z-50 px-4 pb-6"
    >
      <div className="bg-white/98 dark:bg-zinc-900/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50 overflow-hidden relative">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_10px_rgba(239,68,68,0.5)]" />

        <div className="p-6 space-y-2">
          {/* Main Navigation Links */}
          <motion.ul className="space-y-1">
            {mainItems.map((item) => {
              // Updated isActive logic to support activePaths
              const isActive = pathname === item.href || 
                (item.activePaths && item.activePaths.some(path => 
                  pathname === path || pathname.startsWith(path + '/')
                ));
              
              return (
                <motion.li key={item.id} variants={itemVariants}>
                  <CustomLink 
                    href={item.href} 
                    passHref
                    className={`group relative block px-4 py-3 rounded-xl text-base font-bold uppercase tracking-wider italic transition-all duration-200
                      ${isActive ? 'bg-red-50 dark:bg-red-900/20 text-red-500 font-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-red-500'}`}
                    onClick={closeMenu}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator" 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-r-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" 
                        transition={{ type: "spring", stiffness: 380, damping: 30 }} 
                      />
                    )}
                    <div className="absolute bottom-1 left-4 right-4 h-[2px] bg-gradient-to-r from-red-500 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </CustomLink>
                </motion.li>
              );
            })}
          </motion.ul>

          {/* Divider with Racing Stripes Logic */}
          {extraItems.length > 0 && (
            <div className="relative my-6">
              <div className="h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />
              <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            </div>
          )}

          {/* Authenticated Content (Categories) */}
          {authenticated ? (
            <motion.div variants={itemVariants} className="space-y-6">
              {extraItems.map((item) => {
                if ((item.type === 'gallery' || item.type === 'category-list') && item.mobileCategoryList) {
                  const config = item.mobileCategoryList;
                  const theme = THEME_CLASSES[config.theme] || THEME_CLASSES.red;

                  return (
                    <div key={item.id} className="space-y-2">
                      {/* Header */}
                      {config.header.show && (
                        <div className="flex items-center gap-2 px-4">
                          {config.header.icon && <config.header.icon className={`${theme.headerIcon} text-sm`} />}
                          <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 italic">{config.header.title}</span>
                          <div className={`flex-1 h-[1px] bg-gradient-to-r ${theme.headerLine}`} />
                        </div>
                      )}
                      
                      {/* Scrollable List */}
                      <div className={`max-h-48 overflow-y-auto overflow-x-hidden space-y-1 pl-4 pr-2 scrollbar-thin ${theme.scrollbar}`}>
                        {loading ? (
                          <div className="px-4 py-2 text-sm text-zinc-500 animate-pulse italic">Loading track data...</div>
                        ) : error ? (
                          <div className="px-4 py-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-2 border-red-500 italic">{error}</div>
                        ) : visibleCategories.length > 0 ? (
                          visibleCategories.map((categoryObj: any) => (
                            <CategoryLink 
                              key={`${item.id}-${categoryObj.name}`} 
                              category={categoryObj} 
                              config={config} 
                              theme={theme} 
                              onClick={closeMenu} 
                            />
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-zinc-400 italic">No visible categories</div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </motion.div>
          ) : (
            /* Guest Extra Links */
            <motion.div variants={itemVariants}>
              {extraItems.map((item) => {
                if (item.type === 'link' || (item.type === 'gallery' && item.href)) {
                  // Updated isActive logic to support activePaths
                  const isActive = pathname === item.href || 
                    (item.activePaths && item.activePaths.some(path => 
                      pathname === path || pathname.startsWith(path + '/')
                    ));
                  
                  return (
                    <CustomLink 
                      key={item.id}
                      href={item.href} 
                      passHref
                      className={`group relative block px-4 py-3 rounded-xl text-base font-bold uppercase tracking-wider italic transition-all duration-200
                        ${isActive ? 'bg-red-50 dark:bg-red-900/20 text-red-500 font-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-red-500'}`}
                      onClick={closeMenu}
                    >
                      <span className="relative z-10">{item.label}</span>
                      {isActive && (
                        <motion.div 
                          layoutId="activeIndicator" 
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-r-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" 
                          transition={{ type: "spring", stiffness: 380, damping: 30 }} 
                        />
                      )}
                      <div className="absolute bottom-1 left-4 right-4 h-[2px] bg-gradient-to-r from-red-500 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </CustomLink>
                  );
                }
                return null;
              })}
            </motion.div>
          )}
        </div>

        {/* Auth Section Footer */}
        <div className="relative border-t border-zinc-200/50 dark:border-zinc-700/50 bg-zinc-50/50 dark:bg-zinc-800/30 p-6">
          {/* Racing Stripe Divider */}
          <div className="absolute top-0 left-0 right-0 h-2 flex overflow-hidden">
            {[...Array(24)].map((_, i) => (
              <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-zinc-900 dark:bg-white' : 'bg-white dark:bg-zinc-900'}`} />
            ))}
          </div>

          {!authenticated ? (
            <motion.div variants={itemVariants}>
              <CustomLink 
                href={AUTH_ITEMS.login.href} 
                passHref
                className="group relative flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black uppercase tracking-wider italic shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 overflow-hidden"
                onClick={closeMenu}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <FaFlagCheckered className="relative z-10" />
                <span className="relative z-10">{AUTH_ITEMS.login.mobileLabel}</span>
                <svg className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </CustomLink>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="space-y-2">
              <motion.button 
                whileTap={{ scale: 0.98 }} 
                whileHover={{ scale: 1.01 }} 
                onClick={handleLogout}
                className="group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-black uppercase tracking-wider italic transition-all duration-200 border border-red-200 dark:border-red-800/50"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{AUTH_ITEMS.logout.mobileLabel}</span>
              </motion.button>
            </motion.div>
          )}
        </div>
        
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
      </div>
    </motion.div>
  );
}