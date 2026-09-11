'use client';

import { motion, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { NAV_ITEMS, AUTH_ITEMS } from '../../config/navbar';
import { HiArrowRightOnRectangle } from 'react-icons/hi2';

// ============================================================
// TYPES
// ============================================================

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
  roles?: string[];
  activePaths?: string[];
  type?: 'link' | 'gallery' | 'category-list';
  mobileCategoryList?: CategoryListConfig;
}

interface MobileMenuProps {
  authenticated: boolean;
  role?: string;
  imagesFor: Category[] | null | undefined;
  loading: boolean;
  error: string | null | undefined;
  handleLogout: () => void;
  setIsMenuOpen: (isOpen: boolean) => void;
}

// ============================================================
// ANIMATION
// ============================================================

const cubicBezier = [
  0.22,
  1,
  0.36,
  1,
] as [number, number, number, number];

const menuVariants: Variants = {
  closed: {
    opacity: 0,
    y: -12,
    scale: 0.98,
    transition: {
      duration: 0.25,
      ease: cubicBezier,
    },
  },

  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: cubicBezier,
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  closed: {
    opacity: 0,
    x: -8,
    transition: {
      duration: 0.15,
    },
  },

  open: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      ease: cubicBezier,
    },
  },
};

// ============================================================
// CATEGORY LINK
// ============================================================

const CategoryLink = ({
  category,
  config,
  onClick,
}: {
  category: Category;
  config: CategoryListConfig;
  onClick: () => void;
}) => {
  return (
    <Link
      href={`${config.basePath}?for=${encodeURIComponent(
        category.name
      )}`}
      onClick={onClick}
      role="menuitem"
      className="
        group relative
        flex items-center gap-3
        rounded-xl
        px-3.5 py-2.5
        text-sm font-medium

        text-[#64748B]

        transition-all duration-200

        hover:bg-[#EAF4FB]
        hover:text-[#004A87]

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#FF8201]
        focus-visible:ring-offset-2
        focus-visible:ring-offset-white

        dark:text-white/55
        dark:hover:bg-white/[0.06]
        dark:hover:text-white
        dark:focus-visible:ring-offset-[#0B1624]
      "
    >
      {/* Category indicator */}
      <span
        className="
          flex h-6 w-6
          items-center justify-center
          rounded-lg
          bg-[#F5F7FA]
          transition-all duration-200

          group-hover:bg-[#FFF1E5]

          dark:bg-white/[0.05]
          dark:group-hover:bg-[#FF8201]/10
        "
      >
        <span
          className="
            h-1.5 w-1.5
            rounded-full
            bg-[#64748B]
            transition-colors duration-200

            group-hover:bg-[#FF8201]

            dark:bg-white/30
            dark:group-hover:bg-[#FF8201]
          "
          aria-hidden="true"
        />
      </span>

      <span className="capitalize">
        {category.name}
      </span>

      {/* Hover arrow */}
      <span
        className="
          ml-auto
          translate-x-[-4px]
          text-[#FF8201]
          opacity-0
          transition-all duration-200

          group-hover:translate-x-0
          group-hover:opacity-100
        "
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function MobileMenu({
  authenticated,
  role,
  imagesFor,
  loading,
  error,
  handleLogout,
  setIsMenuOpen,
}: MobileMenuProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    const menu = menuRef.current;
    const focusableSelector = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const focusFirstItem = () => {
      menu?.querySelector<HTMLElement>(focusableSelector)?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !menu) return;
      const focusable = Array.from(menu.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const timer = window.setTimeout(focusFirstItem, 0);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [setIsMenuOpen]);

  const closeMenu = () =>
    setIsMenuOpen(false);

  // ==========================================================
  // NAVIGATION FILTERING
  // ==========================================================

  const mobileItems = (
    NAV_ITEMS as NavItem[]
  ).filter((item) => {
    if (!item.mobile) return false;

    if (
      item.auth === 'authenticated' &&
      !authenticated
    ) {
      return false;
    }

    if (
      item.auth === 'guest' &&
      authenticated
    ) {
      return false;
    }

    if (item.roles && (!role || !item.roles.includes(role))) {
      return false;
    }

    return true;
  });

  const mainItems = mobileItems.filter(
    (item) =>
      item.mobileGroup === 'main'
  );

  const extraItems = mobileItems.filter(
    (item) =>
      item.mobileGroup === 'extra'
  );

  const visibleCategories = (
    imagesFor || []
  ).filter(
    (category) =>
      category.isVisible !== false
  );

  // ==========================================================
  // ACTIVE STATE
  // ==========================================================

  const checkIsActive = (
    item: NavItem
  ) => {
    return (
      pathname === item.href ||
      Boolean(
        item.activePaths?.some(
          (path: string) =>
            pathname === path ||
            pathname.startsWith(
              path + '/'
            )
        )
      )
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <button
        type="button"
        aria-label="Fermer le menu"
        onClick={() => setIsMenuOpen(false)}
        className="fixed inset-0 z-40 bg-[#00345F]/20 backdrop-blur-[2px] lg:hidden"
      />
      <motion.div
      variants={menuVariants}
      initial="closed"
      animate="open"
      exit="closed"
      id="mobile-menu"
      ref={menuRef}
      className="
        fixed inset-x-4 top-16 z-50 mt-2
        lg:hidden
      "
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >

      {/* ======================================================
          MENU CONTAINER
      ====================================================== */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[1.5rem]

          border
          border-[#E2E8F0]

          bg-white/95
          shadow-2xl
          shadow-[#00345F]/15

          backdrop-blur-2xl

          dark:border-white/[0.08]
          dark:bg-[#0E1C2D]/95
          dark:shadow-black/40
        "
      >

        {/* ====================================================
            DECORATIVE ACCENTS
        ==================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-40 w-40
            rounded-full
            bg-[#EAF4FB]
            blur-3xl
            dark:bg-[#004A87]/20
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-20
            -left-20
            h-40 w-40
            rounded-full
            bg-[#FFF1E5]
            blur-3xl
            dark:bg-[#FF8201]/10
          "
        />


        {/* ====================================================
            SCROLLABLE CONTENT
        ==================================================== */}

        <div
          className="
            relative
            max-h-[70vh]
            space-y-5
            overflow-y-auto
            p-5

            scrollbar-thin
            scrollbar-track-transparent
            scrollbar-thumb-[#E2E8F0]

            dark:scrollbar-thumb-white/10
          "
        >

          {/* ==================================================
              MAIN NAVIGATION
          ================================================== */}

          <motion.ul
            className="space-y-1"
            role="menu"
          >
            {mainItems.map((item) => {
              const isActive =
                checkIsActive(item);

              return (
                <motion.li
                  key={item.id}
                  variants={itemVariants}
                  role="none"
                >
                  <Link
                    href={item.href || '#'}
                    onClick={closeMenu}
                    role="menuitem"
                    aria-current={
                      isActive
                        ? 'page'
                        : undefined
                    }
                    className={`
                      group relative
                      flex items-center
                      gap-4
                      rounded-xl
                      px-4 py-3.5

                      text-base
                      font-medium

                      transition-all
                      duration-200

                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[#FF8201]
                      focus-visible:ring-offset-2
                      focus-visible:ring-offset-white

                      dark:focus-visible:ring-offset-[#0B1624]

                      ${
                        isActive
                          ? `
                            bg-[#EAF4FB]
                            font-semibold
                            text-[#004A87]

                            dark:bg-[#00345F]/60
                            dark:text-white
                          `
                          : `
                            text-[#64748B]

                            hover:bg-[#F5F7FA]
                            hover:text-[#004A87]

                            dark:text-white/65
                            dark:hover:bg-white/[0.06]
                            dark:hover:text-white
                          `
                      }
                    `}
                  >

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveIndicator"
                        className="
                          absolute
                          left-0
                          top-1/2
                          h-6 w-1
                          -translate-y-1/2
                          rounded-r-full
                          bg-[#FF8201]
                        "
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    <span className="relative z-10">
                      {item.label}
                    </span>

                    {isActive && (
                      <span
                        className="
                          ml-auto
                          h-2 w-2
                          rounded-full
                          bg-[#FF8201]
                          shadow-sm
                          shadow-[#FF8201]/40
                        "
                      />
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>


          {/* ==================================================
              DIVIDER
          ================================================== */}

          {extraItems.length > 0 && (
            <div
              className="
                relative
                flex items-center
                gap-3
                py-1
              "
              aria-hidden="true"
            >
              <div className="h-px flex-1 bg-[#E2E8F0] dark:bg-white/[0.08]" />

              <span
                className="
                  h-1.5 w-1.5
                  rounded-full
                  bg-[#FF8201]
                "
              />

              <div className="h-px flex-1 bg-[#E2E8F0] dark:bg-white/[0.08]" />
            </div>
          )}


          {/* ==================================================
              EXTRA / CATEGORY ITEMS
          ================================================== */}

          <motion.div
            variants={itemVariants}
            className="space-y-4"
          >
            {extraItems.map((item) => {

              {/* ============================================
                  CATEGORY LIST
              ============================================ */}

              if (
                (item.type === 'gallery' ||
                  item.type === 'category-list') &&
                item.mobileCategoryList
              ) {
                const config =
                  item.mobileCategoryList;

                return (
                  <div
                    key={item.id}
                    className="space-y-2"
                  >

                    {/* Category heading */}
                    {config.header.show && (
                      <div
                        className="
                          flex items-center
                          gap-3
                          px-3.5
                        "
                      >
                        <div
                          className="
                            flex h-7 w-7
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#FFF1E5]
                            text-[#FF8201]

                            dark:bg-[#FF8201]/10
                          "
                        >
                          <span className="text-xs">
                            ✦
                          </span>
                        </div>

                        <span
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.18em]
                            text-[#64748B]

                            dark:text-white/40
                          "
                        >
                          {config.header.title ||
                            'Categories'}
                        </span>

                        <div
                          className="
                            h-px flex-1
                            bg-[#E2E8F0]
                            dark:bg-white/[0.08]
                          "
                          aria-hidden="true"
                        />
                      </div>
                    )}


                    {/* Categories */}
                    <div className="space-y-0.5">

                      {/* Loading */}
                      {loading && (
                        <div
                          className="
                            flex items-center
                            gap-3
                            rounded-xl
                            px-3.5 py-3
                            text-sm
                            text-[#64748B]
                            dark:text-white/40
                          "
                        >
                          <span
                            className="
                              h-4 w-4
                              animate-spin
                              rounded-full
                              border-2
                              border-[#E2E8F0]
                              border-t-[#FF8201]
                              dark:border-white/10
                              dark:border-t-[#FF8201]
                            "
                          />

                          Loading categories...
                        </div>
                      )}


                      {/* Error */}
                      {!loading && error && (
                        <div
                          className="
                            rounded-xl
                            border
                            border-[#FF8201]/20
                            bg-[#FFF1E5]
                            px-3.5 py-3
                            text-sm
                            text-[#00345F]

                            dark:border-[#FF8201]/20
                            dark:bg-[#FF8201]/10
                            dark:text-[#FFB15C]
                          "
                        >
                          {error}
                        </div>
                      )}


                      {/* Categories */}
                      {!loading &&
                        !error &&
                        visibleCategories.length >
                          0 &&
                        visibleCategories.map(
                          (categoryObj) => (
                            <CategoryLink
                              key={`${item.id}-${categoryObj.name}`}
                              category={
                                categoryObj
                              }
                              config={config}
                              onClick={
                                closeMenu
                              }
                            />
                          )
                        )}


                      {/* Empty */}
                      {!loading &&
                        !error &&
                        visibleCategories.length ===
                          0 && (
                          <div
                            className="
                              rounded-xl
                              px-3.5 py-3
                              text-sm
                              text-[#64748B]
                              dark:text-white/40
                            "
                          >
                            No categories available
                          </div>
                        )}
                    </div>
                  </div>
                );
              }


              {/* ============================================
                  STANDARD LINKS
              ============================================ */}

              if (
                item.type === 'link' ||
                (item.type === 'gallery' &&
                  item.href)
              ) {
                const isActive =
                  checkIsActive(item);

                return (
                  <Link
                    key={item.id}
                    href={item.href || '#'}
                    onClick={closeMenu}
                    role="menuitem"
                    aria-current={
                      isActive
                        ? 'page'
                        : undefined
                    }
                    className={`
                      group relative
                      flex items-center
                      gap-4
                      rounded-xl
                      px-4 py-3.5

                      text-base
                      font-medium

                      transition-all
                      duration-200

                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[#FF8201]
                      focus-visible:ring-offset-2
                      focus-visible:ring-offset-white

                      dark:focus-visible:ring-offset-[#0B1624]

                      ${
                        isActive
                          ? `
                            bg-[#EAF4FB]
                            font-semibold
                            text-[#004A87]

                            dark:bg-[#00345F]/60
                            dark:text-white
                          `
                          : `
                            text-[#64748B]

                            hover:bg-[#F5F7FA]
                            hover:text-[#004A87]

                            dark:text-white/65
                            dark:hover:bg-white/[0.06]
                            dark:hover:text-white
                          `
                      }
                    `}
                  >

                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveIndicator"
                        className="
                          absolute
                          left-0
                          top-1/2
                          h-6 w-1
                          -translate-y-1/2
                          rounded-r-full
                          bg-[#FF8201]
                        "
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    <span className="relative z-10">
                      {item.label}
                    </span>

                    {isActive && (
                      <span
                        className="
                          ml-auto
                          h-2 w-2
                          rounded-full
                          bg-[#FF8201]
                        "
                      />
                    )}
                  </Link>
                );
              }

              return null;
            })}
          </motion.div>
        </div>


        {/* ====================================================
            FOOTER ACTION
        ==================================================== */}

        <div
          className="
            relative
            border-t
            border-[#E2E8F0]
            bg-[#F5F7FA]/80
            p-5

            dark:border-white/[0.08]
            dark:bg-[#0B1624]/70
          "
        >

          {/* Small accent */}
          <div
            className="
              absolute
              left-5
              top-0
              h-px
              w-12
              bg-[#FF8201]
            "
          />

          {/* Guest */}
          {!authenticated ? (
            <motion.div variants={itemVariants}>
              <Link
                href={
                  AUTH_ITEMS.login.href || '#'
                }
                onClick={closeMenu}
                className="
                  group
                  flex w-full
                  items-center
                  justify-center
                  gap-2

                  rounded-xl
                  bg-[#004A87]
                  px-4 py-3.5

                  text-sm
                  font-semibold
                  tracking-wide
                  text-white

                  shadow-lg
                  shadow-[#004A87]/20

                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:bg-[#00345F]
                  hover:shadow-xl
                  hover:shadow-[#004A87]/25

                  active:scale-[0.98]

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#FF8201]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#F5F7FA]

                  dark:focus-visible:ring-offset-[#0B1624]
                "
              >
                <span>
                  {AUTH_ITEMS.login.mobileLabel ||
                    AUTH_ITEMS.login.label ||
                    'Sign In'}
                </span>

                <span
                  className="
                    h-1.5 w-1.5
                    rounded-full
                    bg-[#FF8201]

                    transition-transform
                    duration-300

                    group-hover:scale-125
                  "
                />
              </Link>
            </motion.div>
          ) : (

            /* Authenticated */
            <motion.div variants={itemVariants}>
              <motion.button
                whileTap={{
                  scale: 0.98,
                }}
                onClick={handleLogout}
                className="
                  group
                  flex w-full
                  items-center
                  justify-center
                  gap-2

                  rounded-xl

                  border
                  border-[#E2E8F0]
                  bg-white

                  px-4 py-3.5

                  text-sm
                  font-semibold
                  tracking-wide

                  text-[#64748B]

                  transition-all
                  duration-300

                  hover:border-[#FF8201]/30
                  hover:bg-[#FFF1E5]
                  hover:text-[#00345F]

                  dark:border-white/[0.08]
                  dark:bg-white/[0.04]
                  dark:text-white/60

                  dark:hover:border-[#FF8201]/30
                  dark:hover:bg-[#FF8201]/10
                  dark:hover:text-white

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#FF8201]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#F5F7FA]

                  dark:focus-visible:ring-offset-[#0B1624]
                "
              >
                <HiArrowRightOnRectangle
                  className="
                    h-4 w-4
                    text-[#004A87]
                    transition-transform
                    duration-300

                    group-hover:-translate-x-0.5

                    dark:text-[#FF8201]
                  "
                  aria-hidden="true"
                />

                <span>
                  {AUTH_ITEMS.logout.mobileLabel ||
                    AUTH_ITEMS.logout.label ||
                    'Sign Out'}
                </span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
      </motion.div>
    </>
  );
}