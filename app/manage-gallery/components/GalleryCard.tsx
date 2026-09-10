'use client';

import Link from 'next/link';
import { memo, useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';

import { GallerySummary } from '@/types/types';
import { VisibilityBadge } from './VisibilityBadge';
import MediaViewport from '@/components/media-viewport';

import {
  Pencil,
  Trash2,
  Image as ImageIcon,
  Play,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';

interface GalleryCardProps {
  gallery: GallerySummary;
  onEdit: () => void;
  onDelete: () => void;
  priority?: boolean;
}

export const GalleryCard = memo(function GalleryCard({
  gallery,
  onEdit,
  onDelete,
  priority = false,
}: GalleryCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Handle outside clicks AND Escape key for accessibility
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    document.addEventListener(
      'keydown',
      handleEscape
    );

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

  const handleDeleteClick = async (
    e: React.MouseEvent
  ) => {
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
          'rounded-2xl shadow-2xl border border-[#E2E8F0] p-6 max-w-md',

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

  const getMediaInfo = () => {
    const media = gallery.coverMedia || gallery.randomMedia;

    if (!media) {
      return {
        sourceUrl: null,
        posterUrl: null,
        mediaType: null,
      };
    }

    return {
      sourceUrl: media.thumbnailUrl,
      posterUrl: media.thumbnailUrl,
      mediaType: media.type,
    };
  };

  const {
    sourceUrl,
    posterUrl,
    mediaType,
  } = getMediaInfo();

  const hasMedia = !!sourceUrl;
  const mediaCount = gallery.mediaCount || 0;

  const createdDate = new Date(
    gallery.createdAt
  );

  const formattedDate =
    createdDate.toLocaleDateString('fr-FR', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <article
      className="
        group
        relative
        flex
        flex-col
        bg-white
        dark:bg-[#102238]
        rounded-3xl
        border
        border-[#E2E8F0]
        shadow-[0_2px_8px_rgba(0,74,135,0.05)]
        hover:shadow-[0_16px_32px_rgba(0,52,95,0.12)]
        hover:-translate-y-1
        transition-all
        duration-500
        ease-out
        h-full
      "
    >
      {/* --- Action rail --- */}
      <div
        className="absolute top-4 right-4 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
        ref={menuRef}
      >
        <button
          ref={menuButtonRef}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' ||
              e.key === ' '
            ) {
              e.preventDefault();
              setIsMenuOpen(!isMenuOpen);
            }
          }}
          className="
            flex items-center gap-2
            rounded-xl border border-[#E2E8F0]
            bg-white/95 dark:bg-[#102238]/95 backdrop-blur-md
            px-2.5 py-2 text-left shadow-md
            text-[#00345F] dark:text-white
            transition-all duration-200
            hover:bg-[#EAF4FB] hover:text-[#004A87]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] focus-visible:ring-offset-2
          "
          aria-label="Plus d'options"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-controls="gallery-menu"
        >
          <MoreVertical className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Actions</span>
        </button>

        {isMenuOpen && (
          <div
            id="gallery-menu"
            role="menu"
            className="
              w-52
              bg-white
              dark:bg-[#0E1C2D]
              rounded-2xl
              shadow-xl
              border
              border-[#E2E8F0]
              dark:border-white/10
              py-2
              overflow-hidden
              animate-in
              fade-in
              zoom-in-95
              duration-200
              origin-top-right
              z-50
            "
          >
            <button
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                onEdit();
              }}
              className="
                w-full
                text-left
                px-4
                py-3
                text-sm
                font-medium
                text-[#64748B]
                hover:bg-[#EAF4FB]
                dark:hover:bg-white/[0.06]
                hover:text-[#004A87]
                flex
                items-center
                gap-3
                transition-colors
                focus:outline-none
                focus-visible:bg-[#EAF4FB]
                focus-visible:ring-2
                focus-visible:ring-inset
                focus-visible:ring-[#FF8201]
              "
            >
              <Pencil className="w-4 h-4 text-[#004A87]" />
              Éditer les détails
            </button>

            <div className="h-px bg-[#E2E8F0] dark:bg-white/10 my-1.5 mx-3" />

            <button
              role="menuitem"
              onClick={handleDeleteClick}
              className="
                w-full
                text-left
                px-4
                py-3
                text-sm
                font-medium
                text-red-600
                hover:bg-red-50
                dark:hover:bg-red-950/30
                flex
                items-center
                gap-3
                transition-colors
                focus:outline-none
                focus-visible:bg-red-50
                focus-visible:ring-2
                focus-visible:ring-inset
                focus-visible:ring-red-500
              "
            >
              <Trash2 className="w-4 h-4" />
              Supprimer l&apos;album
            </button>
          </div>
        )}
      </div>

      {/* --- Media Area --- */}
      <div
        className="
          relative
          aspect-[3/4]
          w-full
          rounded-t-3xl
          overflow-hidden
          bg-[#F5F7FA]
          dark:bg-[#0E1C2D]
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
            rounded-t-3xl
          "
          aria-label={`Voir et gérer les détails de l'album ${gallery.title}`}
        >
          {hasMedia && mediaType ? (
            <>
              <div
                className="
                  w-full
                  h-full
                  transform
                  group-hover:scale-105
                  transition-transform
                  duration-700
                  ease-out
                  will-change-transform
                "
              >
                <MediaViewport
                  mediaType={mediaType}
                  fullResUrl={sourceUrl!}
                  thumbnailUrl={
                    posterUrl || sourceUrl!
                  }
                  caption={gallery.title}
                  originalFilename={null}
                  className="w-full h-full object-cover"
                  priority={priority}
                />
              </div>

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#00345F]/30
                  via-transparent
                  to-transparent
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                  duration-500
                  pointer-events-none
                "
              />

              {mediaType === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div
                    className="
                      w-16
                      h-16
                      md:w-20
                      md:h-20
                      rounded-full
                      bg-white/90
                      backdrop-blur-md
                      shadow-lg
                      flex
                      items-center
                      justify-center
                      opacity-90
                      scale-90
                      group-hover:scale-100
                      group-hover:opacity-100
                      transition-all
                      duration-500
                    "
                  >
                    <Play
                      className="
                        w-6
                        h-6
                        md:w-8
                        md:h-8
                        text-[#004A87]
                        ml-1
                        fill-current
                      "
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className="
                w-full
                h-full
                flex
                flex-col
                items-center
                justify-center
                bg-[#EAF4FB]
              "
            >
              <div
                className="
                  p-5
                  rounded-2xl
                  bg-white
                  border
                  border-[#E2E8F0]
                  shadow-sm
                  mb-4
                "
              >
                <ImageIcon className="w-8 h-8 text-[#004A87]" />
              </div>

              <span
                className="
                  text-sm
                  font-semibold
                  uppercase
                  tracking-widest
                  text-[#64748B]
                "
              >
                Aucun média
              </span>
            </div>
          )}
        </Link>

        {/* Top Badges Overlay */}
        <div
          className="
            absolute
            top-4
            left-4
            right-16
            flex
            justify-between
            items-start
            z-20
            pointer-events-none
          "
        >
          <VisibilityBadge type={gallery.visibility} />

          {mediaCount > 0 && (
            <div
              className="
                bg-white/90
                backdrop-blur-md
                border
                border-white/70
                text-[#00345F]
                text-xs
                font-bold
                uppercase
                tracking-wider
                px-3
                py-2
                rounded-full
                shadow-sm
                flex
                items-center
                gap-2
                pointer-events-auto
                transform
                translate-y-2
                opacity-0
                group-hover:translate-y-0
                group-hover:opacity-100
                transition-all
                duration-300
              "
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#004A87]" />

              {mediaCount}{' '}
              {mediaCount === 1
                ? 'élément'
                : 'éléments'}
            </div>
          )}
        </div>

        {/* Action Overlay Button */}
        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            z-20
            translate-y-full
            group-hover:translate-y-0
            transition-transform
            duration-500
            ease-out
            pointer-events-none
            p-4
            md:p-6
          "
        >
          <Link
            href={`/manage-gallery/${gallery.id}`}
            className="
              pointer-events-auto
              w-full
              bg-white/95
              backdrop-blur-xl
              border
              border-white/70
              text-[#00345F]
              text-sm
              md:text-base
              font-semibold
              px-5
              py-3.5
              rounded-2xl
              shadow-lg
              flex
              items-center
              justify-center
              gap-2.5
              hover:bg-[#EAF4FB]
              hover:text-[#004A87]
              transition-all
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#FF8201]
              focus-visible:ring-offset-2
            "
          >
            Gérer l&apos;album

            <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="flex flex-col grow p-6 md:p-8">
        <div className="mb-4">
          <Link
            href={`/manage-gallery/${gallery.id}`}
            className="
              block
              group/title
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#FF8201]
              focus-visible:ring-offset-2
              rounded-lg
            "
          >
            <h3
              className="
                text-xl
                md:text-2xl
                font-semibold
                text-[#172033]
                leading-tight
                group-hover/title:text-[#004A87]
                transition-colors
                duration-300
                line-clamp-1
                tracking-tight
              "
            >
              {gallery.title}
            </h3>
          </Link>

          <time
            className="
              text-sm
              font-medium
              text-[#64748B]
              mt-2
              block
            "
          >
            {formattedDate}
          </time>
        </div>

        {gallery.description ? (
          <p
            className="
              text-base
              text-[#64748B]
              line-clamp-3
              leading-relaxed
            "
          >
            {gallery.description}
          </p>
        ) : (
          <div className="grow" />
        )}
      </div>
    </article>
  );
});

