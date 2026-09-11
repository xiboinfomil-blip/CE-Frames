'use client';

import Link from 'next/link';
import { memo, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

import { GallerySummary } from '@/types/types';
import { VisibilityBadge } from './VisibilityBadge';
import MediaViewport from '@/components/media-viewport';

import {
  Pencil,
  Trash2,
  Image as ImageIcon,
  Play,
  MoreHorizontal,
  Check,
  ArrowUpRight,
} from 'lucide-react';

interface GalleryCardProps {
  gallery: GallerySummary;
  onEdit: () => void;
  onDelete: () => void;
  priority?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export const GalleryCard = memo(function GalleryCard({
  gallery,
  onEdit,
  onDelete,
  priority = false,
  isSelected = false,
  onToggleSelect,
}: GalleryCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  /*
   * ------------------------------------------------------------
   * Close menu when clicking outside / pressing Escape
   * ------------------------------------------------------------
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );

      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [isMenuOpen]);

  /*
   * ------------------------------------------------------------
   * Delete confirmation
   * ------------------------------------------------------------
   */
  const handleDeleteClick = async (
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setIsMenuOpen(false);

    const result = await Swal.fire({
      title:
        '<span class="text-xl font-semibold text-[#172033]">Supprimer cet album CE ?</span>',

      text: `Vous êtes sur le point de supprimer définitivement l'album « ${gallery.title} ». Cette action est irréversible.`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#EAF4FB',

      confirmButtonText: 'Supprimer définitivement',
      cancelButtonText: 'Annuler',

      background: 'var(--page-background)',
      color: 'var(--page-foreground)',

      customClass: {
        popup:
          'rounded-3xl shadow-2xl border border-[#E2E8F0] p-6 max-w-md',

        title:
          'font-semibold text-[#172033] mb-2',

        htmlContainer:
          'mt-2',

        confirmButton:
          'px-6 py-3 rounded-xl text-base font-medium transition-all hover:bg-red-700 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',

        cancelButton:
          'px-6 py-3 rounded-xl text-base font-medium text-[#00345F] hover:bg-[#DCEEF9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] focus-visible:ring-offset-2',
      },
    });

    if (result.isConfirmed) {
      onDelete();
    }
  };

  /*
   * ------------------------------------------------------------
   * Media
   * ------------------------------------------------------------
   */
  const media = gallery.coverMedia || gallery.randomMedia;

  const sourceUrl = media?.thumbnailUrl ?? null;
  const posterUrl = media?.thumbnailUrl ?? null;
  const mediaType = media?.type ?? null;

  const hasMedia = Boolean(sourceUrl);
  const mediaCount = gallery.mediaCount || 0;

  /*
   * ------------------------------------------------------------
   * Date
   * ------------------------------------------------------------
   */
  const createdDate = new Date(gallery.createdAt);

  const formattedDate = createdDate.toLocaleDateString(
    'fr-FR',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  return (
    <article
      className={`
        group
        relative
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-[26px]
        border
        bg-white
        transition-all
        duration-500
        ease-out

        ${
          isSelected
            ? `
              border-[#004A87]
              shadow-[0_0_0_2px_rgba(0,74,135,0.12),0_18px_45px_rgba(0,74,135,0.14)]
            `
            : `
              border-[#E2E8F0]
              shadow-[0_3px_12px_rgba(0,74,135,0.055)]
              hover:-translate-y-1
              hover:border-[#C9D8E5]
              hover:shadow-[0_18px_45px_rgba(0,52,95,0.12)]
            `
        }

        dark:bg-[#102238]
        dark:border-white/[0.08]
        dark:shadow-[0_4px_20px_rgba(2,6,23,0.3)]
        dark:hover:border-white/[0.15]
        dark:hover:shadow-[0_20px_50px_rgba(2,6,23,0.5)]
      `}
    >
      {/* ======================================================
          MEDIA
          ====================================================== */}

      <div
        className="
          relative
          aspect-[4/5]
          w-full
          overflow-hidden
          bg-[#F3F7FA]
          dark:bg-[#0B1828]
        "
      >
        <Link
          href={`/manage-gallery/${gallery.id}`}
          className="
            absolute
            inset-0
            z-0
            block
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#FF8201]
            focus-visible:ring-inset
          "
          aria-label={`Ouvrir l'album ${gallery.title}`}
        >
          {hasMedia && mediaType ? (
            <>
              {/* Image */}
              <div
                className="
                  absolute
                  inset-0
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-[1.035]
                "
              >
                <MediaViewport
                  mediaType={mediaType}
                  showMagnifyingGlass={false}
                  fullResUrl={sourceUrl!}
                  thumbnailUrl={posterUrl || sourceUrl!}
                  caption={gallery.title}
                  originalFilename={null}
                  className="h-full w-full object-cover"
                  priority={priority}
                />
              </div>

              {/* Cinematic overlay */}
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-b
                  from-[#00345F]/25
                  via-transparent
                  to-[#00345F]/45
                  opacity-70
                  transition-opacity
                  duration-500
                  group-hover:opacity-90
                "
              />

              {/* Bottom shine */}
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  bottom-0
                  h-32
                  bg-gradient-to-t
                  from-black/30
                  to-transparent
                  opacity-60
                "
              />

              {/* Video indicator */}
              {mediaType === 'video' && (
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    z-10
                    flex
                    items-center
                    justify-center
                  "
                >
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/50
                      bg-white/90
                      shadow-[0_8px_30px_rgba(0,0,0,0.18)]
                      backdrop-blur-xl
                      transition-all
                      duration-500
                      group-hover:scale-110
                      md:h-16
                      md:w-16
                    "
                  >
                    <Play
                      className="
                        ml-0.5
                        h-6
                        w-6
                        fill-[#004A87]
                        text-[#004A87]
                        md:h-7
                        md:w-7
                      "
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div
              className="
                flex
                h-full
                w-full
                flex-col
                items-center
                justify-center
                bg-gradient-to-br
                from-[#EAF4FB]
                to-[#F5F8FB]
                dark:from-[#102A42]
                dark:to-[#0D1E31]
              "
            >
              <div
                className="
                  mb-4
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-[#D7E5EF]
                  bg-white/80
                  shadow-sm
                  backdrop-blur
                  dark:border-white/10
                  dark:bg-white/5
                "
              >
                <ImageIcon
                  className="
                    h-7
                    w-7
                    text-[#004A87]
                    dark:text-[#9BCBFF]
                  "
                />
              </div>

              <span
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-[#64748B]
                  dark:text-white/50
                "
              >
                Aucun média
              </span>
            </div>
          )}
        </Link>

        {/* ====================================================
            TOP CONTROLS
            ==================================================== */}

        <div
          className="
            absolute
            left-4
            right-4
            top-4
            z-30
            flex
            items-start
            justify-between
          "
        >
          {/* Selection */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSelect?.();
            }}
            aria-label={
              isSelected
                ? 'Désélectionner la galerie'
                : 'Sélectionner la galerie'
            }
            aria-pressed={isSelected}
            className={`
              group/select
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              border
              shadow-lg
              backdrop-blur-xl
              transition-all
              duration-200
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#FF8201]

              ${
                isSelected
                  ? `
                    border-[#004A87]
                    bg-[#004A87]
                    text-white
                  `
                  : `
                    border-white/70
                    bg-white/90
                    text-transparent
                    hover:bg-white
                    dark:border-white/20
                    dark:bg-[#102238]/80
                    dark:hover:bg-[#102238]
                  `
              }
            `}
          >
            <Check
              className={`
                h-4
                w-4
                transition-transform
                duration-200
                ${
                  isSelected
                    ? 'scale-100'
                    : 'scale-75 group-hover/select:scale-90'
                }
              `}
            />
          </button>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Visibility */}
            <div className="pointer-events-none">
              <VisibilityBadge
                type={gallery.visibility}
              />
            </div>

            {/* Menu */}
            <div
              ref={menuRef}
              className="relative"
            >
              <button
                ref={menuButtonRef}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMenuOpen((current) => !current);
                }}
                aria-label="Options de l'album"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/70
                  bg-white/90
                  text-[#00345F]
                  shadow-lg
                  backdrop-blur-xl
                  transition-all
                  duration-200
                  hover:bg-white
                  hover:text-[#004A87]
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#FF8201]
                  dark:border-white/20
                  dark:bg-[#102238]/80
                  dark:text-white
                  dark:hover:bg-[#102238]
                "
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>

              {isMenuOpen && (
                <div
                  role="menu"
                  className="
                    absolute
                    right-0
                    top-full
                    z-50
                    mt-2
                    w-56
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[#E2E8F0]
                    bg-white
                    p-1.5
                    shadow-[0_20px_50px_rgba(0,52,95,0.16)]
                    animate-in
                    fade-in
                    zoom-in-95
                    duration-150
                    origin-top-right
                    dark:border-white/10
                    dark:bg-[#0E1C2D]
                    dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]
                  "
                >
                  <button
                    role="menuitem"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onEdit();
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      font-medium
                      text-[#334155]
                      transition-colors
                      hover:bg-[#EAF4FB]
                      hover:text-[#004A87]
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-inset
                      focus-visible:ring-[#FF8201]
                      dark:text-white/80
                      dark:hover:bg-white/[0.06]
                      dark:hover:text-white
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#EAF4FB]
                        text-[#004A87]
                        dark:bg-[#004A87]/20
                        dark:text-[#9BCBFF]
                      "
                    >
                      <Pencil className="h-4 w-4" />
                    </span>

                    <span>Modifier les détails</span>
                  </button>

                  <div className="my-1 h-px bg-[#E2E8F0] dark:bg-white/10" />

                  <button
                    role="menuitem"
                    type="button"
                    onClick={handleDeleteClick}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      font-medium
                      text-red-600
                      transition-colors
                      hover:bg-red-50
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-inset
                      focus-visible:ring-red-500
                      dark:hover:bg-red-950/30
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-red-50
                        text-red-600
                        dark:bg-red-500/10
                      "
                    >
                      <Trash2 className="h-4 w-4" />
                    </span>

                    <span>Supprimer l&apos;album</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================
            MEDIA COUNT
            ==================================================== */}

        {mediaCount > 0 && (
          <div
            className="
              pointer-events-none
              absolute
              bottom-4
              left-4
              z-20
              flex
              items-center
              gap-1.5
              rounded-full
              border
              border-white/30
              bg-black/30
              px-3
              py-1.5
              text-xs
              font-semibold
              text-white
              shadow-sm
              backdrop-blur-xl
            "
          >
            <ImageIcon className="h-3.5 w-3.5" />

            <span>
              {mediaCount}{' '}
              {mediaCount === 1
                ? 'élément'
                : 'éléments'}
            </span>
          </div>
        )}

        {/* ====================================================
            QUICK OPEN
            ==================================================== */}

        <Link
          href={`/manage-gallery/${gallery.id}`}
          aria-label={`Gérer ${gallery.title}`}
          className="
            absolute
            bottom-4
            right-4
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-white/40
            bg-white/90
            text-[#00345F]
            opacity-0
            shadow-lg
            backdrop-blur-xl
            translate-y-2
            transition-all
            duration-300
            group-hover:translate-y-0
            group-hover:opacity-100
            hover:bg-white
            hover:text-[#004A87]
            focus:translate-y-0
            focus:opacity-100
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#FF8201]
            md:flex
          "
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* ======================================================
          CONTENT
          ====================================================== */}

      <div className="flex flex-1 flex-col p-5 md:p-6">
        {/* Title + date */}
        <div className="min-w-0">
          <Link
            href={`/manage-gallery/${gallery.id}`}
            className="
              block
              rounded-lg
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#FF8201]
              focus-visible:ring-offset-2
            "
          >
            <h3
              className="
                line-clamp-2
                text-lg
                font-semibold
                leading-[1.25]
                tracking-[-0.02em]
                text-[#172033]
                transition-colors
                duration-200
                group-hover:text-[#004A87]
                dark:text-white
                dark:group-hover:text-[#9BCBFF]
                md:text-xl
              "
            >
              {gallery.title}
            </h3>
          </Link>

          <time
            dateTime={createdDate.toISOString()}
            className="
              mt-2
              block
              text-xs
              font-medium
              tracking-wide
              text-[#94A3B8]
              dark:text-white/40
            "
          >
            {formattedDate}
          </time>
        </div>

        {/* Description */}
        {gallery.description ? (
          <p
            className="
              mt-4
              line-clamp-3
              text-sm
              leading-relaxed
              text-[#64748B]
              dark:text-white/55
            "
          >
            {gallery.description}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        {/* Bottom action */}
        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            border-t
            border-[#E2E8F0]
            pt-4
            dark:border-white/[0.07]
          "
        >
          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#94A3B8]
              dark:text-white/35
            "
          >
            Album CE
          </span>

          <Link
            href={`/manage-gallery/${gallery.id}`}
            className="
              group/open
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              text-xs
              font-semibold
              text-[#004A87]
              transition-colors
              hover:text-[#FF8201]
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#FF8201]
              dark:text-[#9BCBFF]
              dark:hover:text-[#FF9B35]
            "
          >
            Ouvrir

            <ArrowUpRight
              className="
                h-3.5
                w-3.5
                transition-transform
                duration-200
                group-hover/open:translate-x-0.5
                group-hover/open:-translate-y-0.5
              "
            />
          </Link>
        </div>
      </div>
    </article>
  );
});