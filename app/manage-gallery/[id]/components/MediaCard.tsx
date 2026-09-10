'use client';

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import MediaViewport from '@/components/media-viewport';
import { MEDIA_TYPES } from '@/db/schema';

import {
  Image as ImageIcon,
  Video,
  FileImage,
  Trash2,
  ArrowUpDown,
  MoreHorizontal,
  Check,
} from 'lucide-react';

interface MediaData {
  id: string;
  thumbnailUrl: string;
  fullResUrl?: string;
  title?: string | null;
  type: typeof MEDIA_TYPES[number] | string;
  width?: number | null;
  height?: number | null;
}

interface MediaCardProps {
  media: MediaData;
  onRemove?: (mediaId: string) => void;
  onManualOrder?: (mediaId: string) => void;
  onPreview?: () => void;
  priority?: boolean;
  isSelected?: boolean;
  onSelect?: (mediaId: string) => void;
}

const MediaCard = memo(function MediaCard({
  media,
  onRemove,
  onManualOrder,
  onPreview,
  priority = false,
  isSelected = false,
  onSelect,
}: MediaCardProps) {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const menuButtonRef =
    useRef<HTMLButtonElement>(null);

  /*
   * ------------------------------------------------------------
   * Actions
   * ------------------------------------------------------------
   */

  const handleRemove = useCallback(
    (
      e:
        | React.MouseEvent
        | React.KeyboardEvent
    ) => {
      e.preventDefault();
      e.stopPropagation();

      setIsMenuOpen(false);

      onRemove?.(media.id);
    },
    [onRemove, media.id]
  );

  const handleManualOrderClick =
    useCallback(
      (
        e:
          | React.MouseEvent
          | React.KeyboardEvent
      ) => {
        e.preventDefault();
        e.stopPropagation();

        setIsMenuOpen(false);

        onManualOrder?.(media.id);
      },
      [onManualOrder, media.id]
    );

  const handleSelectClick =
    useCallback(
      (
        e:
          | React.MouseEvent
          | React.KeyboardEvent
      ) => {
        e.preventDefault();
        e.stopPropagation();

        onSelect?.(media.id);
      },
      [media.id, onSelect]
    );

  /*
   * ------------------------------------------------------------
   * Outside click / Escape
   * ------------------------------------------------------------
   */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === 'Escape' &&
        isMenuOpen
      ) {
        setIsMenuOpen(false);

        menuButtonRef.current?.focus();
      }
    };

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

  /*
   * ------------------------------------------------------------
   * Media configuration
   * ------------------------------------------------------------
   */

  const getMediaType = () => {
    switch (media.type) {
      case 'video':
        return {
          label: 'Vidéo',
          icon: Video,
          className:
            'bg-[#00345F]/90 text-white border-white/20',
        };

      case 'gif':
        return {
          label: 'GIF',
          icon: null,
          className:
            'bg-[#FFF1E5]/95 text-[#00345F] border-[#FF8201]/30',
        };

      default:
        return {
          label: 'Photo',
          icon: ImageIcon,
          className:
            'bg-white/95 text-[#004A87] border-white/70',
        };
    }
  };

  const mediaType = getMediaType();

  const MediaTypeIcon =
    mediaType.icon;

  /*
   * ------------------------------------------------------------
   * Resolution
   * ------------------------------------------------------------
   */

  const resolution =
    media.width && media.height
      ? `${media.width} × ${media.height}`
      : null;

  /*
   * ------------------------------------------------------------
   * Display URL
   * ------------------------------------------------------------
   */

  const displayUrl =
    media.fullResUrl &&
    media.fullResUrl.trim() !== ''
      ? media.fullResUrl
      : media.thumbnailUrl &&
          media.thumbnailUrl.trim() !== ''
        ? media.thumbnailUrl
        : null;

  /*
   * ------------------------------------------------------------
   * Render
   * ------------------------------------------------------------
   */

  return (
    <article
      className={`
        group
        relative
        flex
        h-full
        w-full
        flex-col
        overflow-hidden
        rounded-[24px]
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
              shadow-[0_3px_12px_rgba(0,52,95,0.05)]
              hover:-translate-y-1
              hover:border-[#CBD5E1]
              hover:shadow-[0_18px_45px_rgba(0,52,95,0.13)]
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
          aspect-[4/3]
          w-full
          shrink-0
          overflow-hidden
          bg-[#F3F7FA]
          dark:bg-[#0B1828]
          cursor-zoom-in
        "
        onClick={onPreview}
        onKeyDown={(e) => {
          if (
            e.key === 'Enter' ||
            e.key === ' '
          ) {
            e.preventDefault();
            onPreview?.();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Prévisualiser ${
          media.title || 'ce média'
        }`}
      >
        {/* ----------------------------------------------------
            Image
            ---------------------------------------------------- */}

        {displayUrl ? (
          <div
            className="
              absolute
              inset-0
              h-full
              w-full
              transition-transform
              duration-700
              ease-out
              group-hover:scale-[1.035]
              will-change-transform
            "
          >
            <MediaViewport
              mediaType={
                media.type as
                  typeof MEDIA_TYPES[number]
              }
              fullResUrl={displayUrl}
              thumbnailUrl={
                media.thumbnailUrl
              }
              caption={media.title}
              originalFilename={null}
              className="
                h-full
                w-full
                object-cover
              "
              priority={priority}
            />
          </div>
        ) : (
          <div
            className="
              absolute
              inset-0
              flex
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
                mb-3
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                border-[#D7E5EF]
                bg-white/80
                shadow-sm
                dark:border-white/10
                dark:bg-white/5
              "
            >
              <FileImage
                className="
                  h-6
                  w-6
                  text-[#004A87]
                  dark:text-[#9BCBFF]
                "
                strokeWidth={1.5}
              />
            </div>

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-[#64748B]
                dark:text-white/45
              "
            >
              Aperçu indisponible
            </span>
          </div>
        )}

        {/* ----------------------------------------------------
            Cinematic overlay
            ---------------------------------------------------- */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-b
            from-[#00345F]/35
            via-transparent
            to-[#00345F]/55
            opacity-60
            transition-opacity
            duration-500
            group-hover:opacity-90
          "
        />

        {/* ====================================================
            TOP CONTROLS
            ==================================================== */}

        <div
          className="
            absolute
            left-3
            right-3
            top-3
            z-30
            flex
            items-start
            justify-between
          "
        >
          {/* --------------------------------------------------
              Selection
              -------------------------------------------------- */}

          <button
            type="button"
            onClick={handleSelectClick}
            aria-label={
              isSelected
                ? 'Désélectionner le média'
                : 'Sélectionner le média'
            }
            aria-pressed={isSelected}
            className={`
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
                    dark:bg-[#102238]/85
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
                    : 'scale-75'
                }
              `}
            />
          </button>

          {/* --------------------------------------------------
              Right controls
              -------------------------------------------------- */}

          <div className="flex items-center gap-2">
            {/* Media type */}

            <span
              className={`
                inline-flex
                h-9
                items-center
                gap-1.5
                rounded-xl
                border
                px-2.5
                shadow-lg
                backdrop-blur-xl
                text-[10px]
                font-bold
                uppercase
                tracking-[0.12em]
                ${mediaType.className}
              `}
            >
              {MediaTypeIcon && (
                <MediaTypeIcon className="h-3.5 w-3.5" />
              )}

              {mediaType.label}
            </span>

            {/* Menu */}

            {(onManualOrder ||
              onRemove) && (
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

                    setIsMenuOpen(
                      (current) =>
                        !current
                    );
                  }}
                  aria-label="Options du média"
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
                    dark:bg-[#102238]/85
                    dark:text-white
                    dark:hover:bg-[#102238]
                  "
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>

                {/* Menu */}

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
                    {/* Reorder */}

                    {onManualOrder && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={
                          handleManualOrderClick
                        }
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
                          <ArrowUpDown className="h-4 w-4" />
                        </span>

                        <div className="flex flex-col">
                          <span>
                            Changer l'ordre
                          </span>

                          <span
                            className="
                              mt-0.5
                              text-[10px]
                              font-medium
                              text-[#94A3B8]
                            "
                          >
                            Positionner ce média
                          </span>
                        </div>
                      </button>
                    )}

                    {/* Divider */}

                    {onManualOrder &&
                      onRemove && (
                        <div
                          className="
                            my-1
                            h-px
                            bg-[#E2E8F0]
                            dark:bg-white/10
                          "
                        />
                      )}

                    {/* Remove */}

                    {onRemove && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={
                          handleRemove
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key ===
                              'Enter' ||
                            e.key === ' '
                          ) {
                            handleRemove(e);
                          }
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

                        <div className="flex flex-col">
                          <span>
                            Retirer
                          </span>

                          <span
                            className="
                              mt-0.5
                              text-[10px]
                              font-medium
                              text-red-400
                            "
                          >
                            Retirer de l'album
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ====================================================
            BOTTOM IMAGE META
            ==================================================== */}

        <div
          className="
            absolute
            bottom-3
            left-3
            right-3
            z-20
            flex
            items-end
            justify-between
            gap-2
          "
        >
          {/* Resolution */}

          {resolution && (
            <span
              className="
                rounded-lg
                border
                border-white/20
                bg-black/30
                px-2.5
                py-1.5
                text-[9px]
                font-mono
                font-semibold
                tracking-wide
                text-white
                opacity-0
                translate-y-1
                backdrop-blur-xl
                transition-all
                duration-300
                group-hover:translate-y-0
                group-hover:opacity-100
              "
            >
              {resolution}
            </span>
          )}

          {/* Preview hint */}

          <span
            className="
              ml-auto
              rounded-lg
              border
              border-white/20
              bg-black/30
              px-2.5
              py-1.5
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-white
              opacity-0
              translate-y-1
              backdrop-blur-xl
              transition-all
              duration-300
              group-hover:translate-y-0
              group-hover:opacity-100
            "
          >
            Aperçu
          </span>
        </div>
      </div>

      {/* ======================================================
          CONTENT
          ====================================================== */}

      <div
        className="
          flex
          min-h-0
          flex-1
          flex-col
          bg-white
          p-4
          dark:bg-[#102238]
          md:p-5
        "
      >
        {/* Title */}

        <div className="min-w-0">
          <h3
            className="
              truncate
              text-sm
              font-semibold
              leading-snug
              tracking-[-0.01em]
              text-[#172033]
              transition-colors
              duration-200
              group-hover:text-[#004A87]
              dark:text-white
              dark:group-hover:text-[#9BCBFF]
            "
            title={
              media.title ||
              'Sans titre'
            }
          >
            {media.title ||
              'Sans titre'}
          </h3>

          {/* Secondary info */}

          <div
            className="
              mt-2
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#94A3B8]
                dark:text-white/35
              "
            >
              {media.type === 'video'
                ? 'Vidéo'
                : media.type === 'gif'
                  ? 'Animation'
                  : 'Image'}
            </span>

            {resolution && (
              <span
                className="
                  truncate
                  text-[9px]
                  font-mono
                  font-semibold
                  text-[#64748B]
                  dark:text-white/40
                "
              >
                {resolution}
              </span>
            )}
          </div>
        </div>

        {/* Bottom accent */}

        <div
          className="
            mt-4
            h-0.5
            w-full
            origin-left
            scale-x-0
            rounded-full
            bg-[#FF8201]
            transition-transform
            duration-500
            group-hover:scale-x-100
          "
        />
      </div>
    </article>
  );
});

export default MediaCard;