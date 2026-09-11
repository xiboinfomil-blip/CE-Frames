'use client';

import {
  useCallback,
  memo,
  useEffect,
  useRef,
  useState,
} from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MEDIA_TYPES } from '@/db/schema';
import MediaViewport from '@/components/media-viewport';

import {
  HiPlay,
  HiMapPin,
  HiTrash,
  HiArrowPath,
  HiCamera,
  HiPencil,
} from 'react-icons/hi2';

import {
  MoreHorizontal,
} from 'lucide-react';

export interface MediaSchema {
  id: string;
  type: typeof MEDIA_TYPES[number];
  thumbnailUrl: string;
  fullResUrl: string;
  originalFilename: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  exifData: Record<string, unknown> | null;
  caption: string | null;
  locationName: string | null;
  coordinates: [number, number] | null;
  uploadedAt: string | Date;
  isUnused?: boolean;
}

interface MediaCardProps {
  media: MediaSchema;
  onDelete: (id: string) => void;
  onEdit: () => void;
  onOpenLightbox: () => void;
  onSelect: (id: string) => void;
  isSelected?: boolean;
  isDeleting?: boolean;
  priority?: boolean;
  sizes?: string;
}

const formatDuration = (
  seconds: number | null
): string | null => {
  if (!seconds) return null;

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs
    .toString()
    .padStart(2, '0')}`;
};

const getExifString = (
  value: unknown
): string => {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value);
};

const MediaCard = memo(function MediaCard({
  media,
  onDelete,
  onEdit,
  onOpenLightbox,
  onSelect,
  isSelected = false,
  isDeleting = false,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: MediaCardProps) {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const menuButtonRef =
    useRef<HTMLButtonElement>(null);

  /*
   * ----------------------------------------------------------
   * EXIF
   * ----------------------------------------------------------
   */

  const exif = media.exifData || {};

  const isoStr = getExifString(
    exif.ISO ?? exif.iso
  );

  const apertureStr = getExifString(
    exif.FNumber ?? exif.fNumber
  );

  const shutterStr = getExifString(
    exif.ExposureTime ??
      exif.exposureTime
  );

  const cameraModelStr =
    getExifString(exif.model);

  const resolution =
    media.width && media.height
      ? `${media.width} × ${media.height}`
      : null;

  const hasTechnicalData =
    Boolean(
      isoStr ||
        apertureStr ||
        shutterStr ||
        cameraModelStr ||
        resolution
    );

  /*
   * ----------------------------------------------------------
   * Menu
   * ----------------------------------------------------------
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

  const handleDeleteClick =
    useCallback(
      (
        e:
          | React.MouseEvent
          | React.KeyboardEvent
      ) => {
        e.preventDefault();
        e.stopPropagation();

        setIsMenuOpen(false);

        if (!isDeleting) {
          onDelete(media.id);
        }
      },
      [
        isDeleting,
        media.id,
        onDelete,
      ]
    );
  
  const handleSelectClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect(media.id);
    },
    [media.id, onSelect]
  );

  /*
   * ----------------------------------------------------------
   * Derived
   * ----------------------------------------------------------
   */

  const displayName =
    media.caption ||
    media.originalFilename ||
    'Untitled Frame';

  const isVideo =
    media.type === 'video';

  return (
    <figure
      className={`
        group
        relative
        flex
        h-full
        min-w-0
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
              shadow-[0_3px_12px_rgba(0,74,135,0.05)]
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
          IMAGE
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
        onClick={onOpenLightbox}
        onKeyDown={(e) => {
          if (
            e.key === 'Enter' ||
            e.key === ' '
          ) {
            e.preventDefault();
            onOpenLightbox();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Open ${displayName} in lightbox`}
      >
        {media.isUnused && (
          <span className="absolute left-[-2.6rem] top-5 z-30 w-32 -rotate-45 bg-[#FF8201] py-1 text-center text-[9px] font-black tracking-[0.18em] text-white shadow-md">
            UNUSED
          </span>
        )}
        {/* ----------------------------------------------------
            Media
            ---------------------------------------------------- */}

        <MediaViewport
          mediaType={media.type}
          fullResUrl={media.fullResUrl}
          thumbnailUrl={media.thumbnailUrl}
          caption={media.caption}
          originalFilename={
            media.originalFilename
          }
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            ease-out
            group-hover:scale-[1.035]
            will-change-transform
          "
          priority={priority}
          sizes={sizes}
        />

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
            to-[#00345F]/50
            opacity-70
            transition-opacity
            duration-500
            group-hover:opacity-100
          "
        />

        {/* ----------------------------------------------------
            Top controls
            ---------------------------------------------------- */}

        <div
          className="
            absolute
            left-3
            right-3
            top-3
            z-20
            flex
            items-start
            justify-between
          "
        >
          {/* Right controls */}

          <div className="flex items-center gap-2">
            {/* Media type */}

            <div
              className="
                flex
                h-9
                items-center
                gap-1.5
                rounded-xl
                border
                border-white/70
                bg-white/90
                px-2.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-[#00345F]
                shadow-lg
                backdrop-blur-xl
                dark:border-white/20
                dark:bg-[#102238]/85
                dark:text-white
              "
            >
              {isVideo ? (
                <HiPlay className="h-3.5 w-3.5 text-[#FF8201]" />
              ) : (
                <HiCamera className="h-3.5 w-3.5 text-[#004A87]" />
              )}

              <span>
                {isVideo
                  ? 'Vidéo'
                  : 'Photo'}
              </span>
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
                    type="button"
                    role="menuitem"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

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
                      <HiPencil className="h-4 w-4" />
                    </span>

                    <span>
                      Modifier
                    </span>
                  </button>

                  <div
                    className="
                      my-1
                      h-px
                      bg-[#E2E8F0]
                      dark:bg-white/10
                    "
                  />

                  <button
                    type="button"
                    role="menuitem"
                    disabled={isDeleting}
                    onClick={
                      handleDeleteClick
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                          'Enter' ||
                        e.key === ' '
                      ) {
                        handleDeleteClick(e);
                      }
                    }}
                    className={`
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
                      transition-colors
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-inset
                      focus-visible:ring-red-500

                      ${
                        isDeleting
                          ? 'cursor-not-allowed text-[#94A3B8]'
                          : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                      }
                    `}
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
                      {isDeleting ? (
                        <HiArrowPath className="h-4 w-4 animate-spin" />
                      ) : (
                        <HiTrash className="h-4 w-4" />
                      )}
                    </span>

                    <span>
                      {isDeleting
                        ? 'Suppression...'
                        : 'Supprimer'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
            Location
            ---------------------------------------------------- */}

        {media.locationName && (
          <div
            className="
              absolute
              bottom-3
              left-3
              z-20
              flex
              max-w-[65%]
              translate-y-1
              items-center
              gap-1.5
              rounded-full
              border
              border-white/30
              bg-black/30
              px-3
              py-1.5
              text-[10px]
              font-semibold
              tracking-wide
              text-white
              opacity-0
              shadow-sm
              backdrop-blur-xl
              transition-all
              duration-300
              group-hover:translate-y-0
              group-hover:opacity-100
              pointer-events-none
            "
          >
            <HiMapPin className="h-3.5 w-3.5 shrink-0" />

            <span className="truncate">
              {media.locationName}
            </span>
          </div>
        )}

        {/* ----------------------------------------------------
            Video duration
            ---------------------------------------------------- */}

        {isVideo &&
          media.durationSeconds && (
            <div
              className="
                absolute
                bottom-3
                right-3
                z-20
                rounded-lg
                border
                border-white/20
                bg-black/45
                px-2.5
                py-1.5
                text-[10px]
                font-mono
                font-bold
                text-white
                shadow-sm
                backdrop-blur-xl
                pointer-events-none
              "
            >
              {formatDuration(
                media.durationSeconds
              )}
            </div>
          )}
      </div>

      {/* ======================================================
          INFORMATION
          ====================================================== */}

      <figcaption
        className="
          flex
          min-h-0
          flex-1
          flex-col
          bg-white
          p-4.5
          dark:bg-[#102238]
          md:p-5
        "
      >
        <button
          type="button"
          onClick={handleSelectClick}
          aria-pressed={isSelected}
          className={`mb-4 w-full rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] ${
            isSelected
              ? 'border-[#004A87] bg-[#004A87] text-white'
              : 'border-[#E2E8F0] bg-[#F5F7FA] text-[#004A87] hover:border-[#004A87] hover:bg-[#EAF4FB] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/10'
          }`}
        >
          {isSelected ? 'Sélectionné' : 'Sélectionner'}
        </button>

        {/* ----------------------------------------------------
            Title
            ---------------------------------------------------- */}

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
            title={displayName}
          >
            {displayName}
          </h3>

          <p
            className="
              mt-1.5
              text-[10px]
              font-medium
              uppercase
              tracking-[0.12em]
              text-[#94A3B8]
              dark:text-white/35
            "
          >
            {formatDistanceToNow(
              new Date(media.uploadedAt),
              {
                addSuffix: true,
              }
            )}
          </p>
        </div>

        {/* ----------------------------------------------------
            Metadata
            ---------------------------------------------------- */}

        {hasTechnicalData ? (
          <div
            className="
              mt-4
              border-t
              border-[#E2E8F0]
              pt-3.5
              dark:border-white/[0.07]
            "
          >
            {cameraModelStr && (
              <div
                className="
                  mb-3
                  flex
                  min-w-0
                  items-center
                  gap-2
                "
              >
                <div
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#EAF4FB]
                    text-[#004A87]
                    dark:bg-[#004A87]/15
                    dark:text-[#9BCBFF]
                  "
                >
                  <HiCamera className="h-3.5 w-3.5" />
                </div>

                <span
                  className="
                    truncate
                    text-[10px]
                    font-semibold
                    text-[#334155]
                    dark:text-white/70
                  "
                  title={cameraModelStr}
                >
                  {cameraModelStr}
                </span>
              </div>
            )}

            <div
              className="
                grid
                grid-cols-2
                gap-x-4
                gap-y-2
              "
            >
              {isoStr && (
                <MetadataItem
                  label="ISO"
                  value={isoStr}
                />
              )}

              {apertureStr && (
                <MetadataItem
                  label="F"
                  value={`f/${apertureStr}`}
                />
              )}

              {shutterStr && (
                <MetadataItem
                  label="Shutter"
                  value={`${shutterStr}s`}
                />
              )}

              {resolution && (
                <MetadataItem
                  label="Resolution"
                  value={resolution}
                />
              )}
            </div>
          </div>
        ) : (
          <div
            className="
              mt-auto
              flex
              items-center
              justify-between
              border-t
              border-[#E2E8F0]
              pt-3.5
              dark:border-white/[0.07]
            "
          >
            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-[#94A3B8]
                dark:text-white/30
              "
            >
              {isVideo
                ? 'Video'
                : 'Image'}
            </span>

            {resolution && (
              <span
                className="
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
        )}

        {/* ----------------------------------------------------
            Bottom accent
            ---------------------------------------------------- */}

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
      </figcaption>
    </figure>
  );
});

/*
 * ============================================================
 * Metadata item
 * ============================================================
 */

function MetadataItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2">
      <span
        className="
          shrink-0
          text-[9px]
          font-bold
          uppercase
          tracking-[0.12em]
          text-[#94A3B8]
          dark:text-white/30
        "
      >
        {label}
      </span>

      <span
        className="
          truncate
          text-[10px]
          font-mono
          font-semibold
          text-[#00345F]
          dark:text-[#B9D9F5]
        "
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

export default MediaCard;