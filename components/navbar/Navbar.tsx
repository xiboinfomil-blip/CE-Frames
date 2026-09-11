'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { signOut } from 'next-auth/react';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useNavData } from '@/hooks/useNavData';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import DropdownMenu from './DropdownMenu';
import MobileMenu from './MobileMenu';
import NavbarSkeleton from './NavbarSkeleton';
import { NAV_ITEMS, AUTH_ITEMS } from '../../config/navbar';

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
  roles?: string[];
  activePaths?: string[];
  type: 'link' | 'gallery' | 'category-list';
  dataSource?: string;
  dataKey?: string;
  desktopDropdown?: {
    title: string;
    basePath: string;
  };
  mobileCategoryList?: {
    header: {
      show: boolean;
      title?: string;
    };
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
  featured?: boolean;
}

const DesktopLink = ({
  item,
  isActive,
  href,
  featured = false,
}: DesktopLinkProps) => {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`
        group relative inline-flex items-center gap-2
        rounded-full px-3.5 py-2
        text-sm font-medium tracking-wide
        transition-all duration-300

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#FF8201]
        focus-visible:ring-offset-2
        focus-visible:ring-offset-white
        dark:focus-visible:ring-offset-[#0B1624]

        ${
          featured
            ? `
              border
              border-[#FF8201]/30
              bg-[#FFF1E5]
              text-[#004A87]
              shadow-sm

              hover:-translate-y-0.5
              hover:border-[#FF8201]/60
              hover:bg-[#FF8201]
              hover:text-white
              hover:shadow-lg
              hover:shadow-[#FF8201]/20

              dark:border-[#FF8201]/30
              dark:bg-[#FF8201]/10
              dark:text-[#FFB15C]

              dark:hover:border-[#FF8201]
              dark:hover:bg-[#FF8201]
              dark:hover:text-white
            `
            : isActive
              ? `
                bg-[#EAF4FB]
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
      {featured && (
        <span
          className="
            flex h-6 w-6
            items-center justify-center
            rounded-full
            bg-[#FF8201]
            text-white
            shadow-sm
            transition-transform duration-300
            group-hover:rotate-12
          "
        >
          <span className="text-[11px]">✦</span>
        </span>
      )}

      <span>{item.label}</span>

      {!featured && (
        <span
          className={`
            absolute
            bottom-1
            left-3.5
            right-3.5
            h-[2px]
            origin-center
            rounded-full
            bg-[#FF8201]
            transition-all
            duration-300

            ${
              isActive
                ? 'scale-x-100 opacity-100'
                : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
            }
          `}
        />
      )}
    </Link>
  );
};

export default function Navbar() {
  const { isAuthenticated, isLoading, role } = useAuthCheck();
  const navData = useNavData() as NavData;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();

  const getItemData = (item: NavItem | undefined) => {
    if (!item?.dataSource || !navData[item.dataSource]) {
      return {
        categories: [] as Category[],
        loading: false,
        error: null,
      };
    }

    const sourceData = navData[item.dataSource];

    return {
      categories:
        (sourceData[
          item.dataKey as keyof typeof sourceData
        ] as Category[]) || [],
      loading: sourceData.loading || false,
      error: sourceData.error || null,
    };
  };

  /* ================= SCROLL ================= */

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ================= CLOSE ON ROUTE CHANGE ================= */

  useEffect(() => {
    const timer = setTimeout(() => setIsMenuOpen(false), 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  /* ================= BODY LOCK ================= */

  useEffect(() => {
    document.body.style.overflow = isMenuOpen
      ? 'hidden'
      : 'unset';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  if (isLoading) {
    return <NavbarSkeleton />;
  }

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  /* ================= DESKTOP ITEMS ================= */

  const desktopItems = (NAV_ITEMS as NavItem[]).filter(
    (item) => {
      if (!item.desktop) return false;

      if (
        item.auth === 'authenticated' &&
        !isAuthenticated
      ) {
        return false;
      }

      if (
        item.auth === 'guest' &&
        isAuthenticated
      ) {
        return false;
      }

      if (item.roles && (!role || !item.roles.includes(role))) {
        return false;
      }

      return true;
    }
  );

  /* ================= MOBILE GALLERY ================= */

  const mobileGalleryItem = (
    NAV_ITEMS as NavItem[]
  ).find((item) => item.id === 'gallery');

  const mobileData = getItemData(
    mobileGalleryItem
  );

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 22,
      }}
      className={`
        fixed inset-x-0 top-0 z-50
        transition-all duration-500

        ${
          isScrolled
            ? `
              border-b
              border-[#E2E8F0]/80
              bg-white/85
              shadow-[0_8px_35px_rgba(0,74,135,0.07)]
              backdrop-blur-xl

              dark:border-white/[0.08]
              dark:bg-[#0B1624]/85
              dark:shadow-[0_8px_35px_rgba(0,0,0,0.3)]
            `
            : `
              bg-transparent
            `
        }
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">

          {/* =====================================================
              BRAND
          ===================================================== */}

          <Link
            href="/"
            aria-label="CE Frames Home"
            className="
              group flex items-center gap-3
              rounded-xl p-1
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#FF8201]
            "
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                rotate: 1,
              }}
              whileTap={{
                scale: 0.96,
              }}
              className="
                relative
                flex h-10 w-10
                items-center justify-center
                overflow-hidden
                rounded-xl

                border
                border-[#E2E8F0]
                bg-white
                shadow-sm

                transition-all duration-300

                group-hover:border-[#004A87]/20
                group-hover:shadow-md
                group-hover:shadow-[#004A87]/10

                dark:border-white/[0.08]
                dark:bg-[#102238]
                dark:group-hover:border-[#FF8201]/30
              "
            >
              <Image
                src="/Logo name.png"
                alt="CE Frames"
                width={32}
                height={32}
                unoptimized
                className="
                  h-6 w-6
                  object-contain
                "
                priority
              />

              {/* Tiny orange accent */}
              <span
                className="
                  absolute
                  bottom-0.5
                  right-0.5
                  h-1.5 w-1.5
                  rounded-full
                  bg-[#FF8201]
                "
              />
            </motion.div>

            <div className="flex flex-col">
              <span
                className="
                  text-[17px]
                  font-extrabold
                  leading-none
                  tracking-tight
                  text-[#172033]
                  dark:text-white
                "
              >
                CE{' '}
                <span className="font-semibold text-[#004A87] dark:text-[#FF8201]">
                  Frames
                </span>
              </span>

              <span
                className="
                  mt-1
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#64748B]
                  dark:text-white/40
                "
              >
                Infomil Mauritius
              </span>
            </div>
          </Link>


          {/* =====================================================
              DESKTOP
          ===================================================== */}

          <div className="hidden items-center gap-6 lg:flex">

            <ul
              className="flex items-center gap-1"
              role="menubar"
            >
              {desktopItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.activePaths &&
                    item.activePaths.some(
                      (path: string) =>
                        pathname === path ||
                        pathname.startsWith(
                          path + '/'
                        )
                    )) ||
                  false;

                const isGallery =
                  item.id === 'gallery';

                if (item.type === 'link') {
                  return (
                    <li key={item.id} role="none">
                      <DesktopLink
                        item={item}
                        isActive={isActive}
                        href={item.href || '#'}
                      />
                    </li>
                  );
                }

                if (
                  (item.type === 'gallery' ||
                    item.type === 'category-list') &&
                  isAuthenticated &&
                  item.desktopDropdown
                ) {
                  const {
                    categories,
                    loading,
                    error,
                  } = getItemData(item);

                  return (
                    <li key={item.id} role="none">
                      <DropdownMenu
                        title={
                          item.desktopDropdown.title
                        }
                        categories={categories}
                        loading={loading}
                        error={error}
                        basePath={
                          item.desktopDropdown.basePath
                        }
                      />
                    </li>
                  );
                }

                if (
                  (item.type === 'gallery' ||
                    item.type === 'category-list') &&
                  !isAuthenticated &&
                  item.href
                ) {
                  return (
                    <li key={item.id} role="none">
                      <DesktopLink
                        item={item}
                        isActive={isActive}
                        href={item.href}
                        featured={isGallery}
                      />
                    </li>
                  );
                }

                return null;
              })}
            </ul>


            {/* =================================================
                DIVIDER
            ================================================= */}

            <div
              className="
                h-6 w-px
                bg-[#E2E8F0]
                dark:bg-white/[0.08]
              "
              aria-hidden="true"
            />


            {/* =================================================
                AUTH
            ================================================= */}

            {!isAuthenticated ? (
              <Link
                href={AUTH_ITEMS.login.href || '#'}
                className="
                  group
                  inline-flex items-center gap-2
                  rounded-full
                  bg-[#004A87]
                  px-5 py-2.5
                  text-sm
                  font-semibold
                  text-white

                  shadow-lg
                  shadow-[#004A87]/15

                  transition-all duration-300

                  hover:-translate-y-0.5
                  hover:bg-[#00345F]
                  hover:shadow-xl
                  hover:shadow-[#004A87]/20

                  active:scale-95

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#FF8201]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-white
                  dark:focus-visible:ring-offset-[#0B1624]
                "
              >
                {AUTH_ITEMS.login.label}

                <span
                  className="
                    h-1.5 w-1.5
                    rounded-full
                    bg-[#FF8201]
                    transition-transform
                    group-hover:scale-125
                  "
                />
              </Link>
            ) : (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleLogout}
                className="
                  rounded-full
                  px-4 py-2
                  text-sm
                  font-medium

                  text-[#64748B]
                  hover:bg-[#F5F7FA]
                  hover:text-[#004A87]

                  dark:text-white/60
                  dark:hover:bg-white/[0.06]
                  dark:hover:text-white

                  transition-all
                  duration-200

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#FF8201]
                "
                aria-label="Log out of your account"
              >
                {AUTH_ITEMS.logout.label}
              </motion.button>
            )}
          </div>


          {/* =====================================================
              MOBILE BUTTON
          ===================================================== */}

          <div className="lg:hidden">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                setIsMenuOpen(!isMenuOpen)
              }
              className={`
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                border
                transition-all

                ${
                  isMenuOpen
                    ? `
                      border-[#FF8201]/30
                      bg-[#FFF1E5]
                      text-[#004A87]

                      dark:border-[#FF8201]/30
                      dark:bg-[#FF8201]/10
                      dark:text-[#FFB15C]
                    `
                    : `
                      border-[#E2E8F0]
                      bg-white/80
                      text-[#004A87]

                      dark:border-white/[0.08]
                      dark:bg-[#102238]/80
                      dark:text-white
                    `
                }
              `}
              aria-label={
                isMenuOpen
                  ? 'Close navigation menu'
                  : 'Open navigation menu'
              }
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence
                mode="wait"
                initial={false}
              >
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{
                      rotate: -90,
                      opacity: 0,
                    }}
                    animate={{
                      rotate: 0,
                      opacity: 1,
                    }}
                    exit={{
                      rotate: 90,
                      opacity: 0,
                    }}
                  >
                    <HiX
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{
                      rotate: 90,
                      opacity: 0,
                    }}
                    animate={{
                      rotate: 0,
                      opacity: 1,
                    }}
                    exit={{
                      rotate: -90,
                      opacity: 0,
                    }}
                  >
                    <HiMenuAlt3
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

        </div>
      </div>


      {/* =========================================================
          MOBILE MENU
      ========================================================= */}

      <AnimatePresence>
        {isMenuOpen && (
          <MobileMenu
            authenticated={isAuthenticated}
            role={role}
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