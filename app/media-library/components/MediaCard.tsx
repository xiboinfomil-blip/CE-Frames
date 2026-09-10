'use client';

import { useCallback, memo, useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MEDIA_TYPES } from '@/db/schema';
import MediaViewport from '@/components/media-viewport';
import { HiPlay, HiMapPin, HiTrash, HiArrowPath, HiCamera, HiPencil } from 'react-icons/hi2';
import { MoreVertical, Check } from 'lucide-react';

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

const formatDuration = (seconds: number | null): string | null => {
  if (!seconds) return null;

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getExifString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
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
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: MediaCardProps) {
  const exif = media.exifData || {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const isoStr = getExifString(exif.ISO ?? exif.iso);
  const apertureStr = getExifString(exif.FNumber ?? exif.fNumber);
  const shutterStr = getExifString(exif.ExposureTime ?? exif.exposureTime);
  const cameraModelStr = getExifString(exif.model);

  const hasTechnicalData =
    !!isoStr ||
    !!apertureStr ||
    !!shutterStr ||
    !!cameraModelStr;

  const resolution =
    media.width && media.height ? `${media.width}×${media.height}` : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      setIsMenuOpen(false);
      if (!isDeleting) onDelete(media.id);
    },
    [isDeleting, media.id, onDelete]
  );

  return (
    <figure
      className={`
        group relative flex flex-col w-full h-full
        bg-white dark:bg-[#102238]
        rounded-2xl overflow-hidden
        border border-[#E2E8F0] dark:border-white/10
        shadow-sm
        hover:shadow-xl hover:shadow-[#00345F]/10
        hover:border-[#CBD5E1]
        transition-all duration-500 ease-out
        ${isSelected ? 'ring-2 ring-[#FF8201] ring-offset-2' : ''}
      `}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 dark:border-white/10 dark:bg-[#0E1C2D]">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(media.id);
          }}
          className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 text-left text-[#00345F] transition hover:bg-[#EAF4FB] dark:border-white/10 dark:bg-[#102238] dark:text-white dark:hover:bg-white/5"
          aria-label={isSelected ? 'Désélectionner l\'élément' : 'Sélectionner l\'élément'}
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded border ${
              isSelected
                ? 'border-[#004A87] bg-[#004A87] text-white'
                : 'border-[#94A3B8] bg-transparent text-transparent dark:border-white/50'
            }`}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B] dark:text-white/60">
            {isSelected ? 'Sélectionné' : 'Sélectionner'}
          </span>
        </button>

        <div ref={menuRef} className="relative">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen((current) => !current);
            }}
            className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white/95 px-2.5 py-2 text-left shadow-sm text-[#00345F] transition-all duration-200 hover:bg-[#EAF4FB] hover:text-[#004A87] dark:border-white/10 dark:bg-[#102238]/95 dark:text-white dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] focus-visible:ring-offset-2"
            aria-label="Plus d'options"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-controls="media-menu"
          >
            <MoreVertical className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Actions</span>
          </button>

          {isMenuOpen && (
            <div
              id="media-menu"
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-[#E2E8F0] bg-white py-2 shadow-xl dark:border-white/10 dark:bg-[#0E1C2D]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsMenuOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#64748B] transition-colors hover:bg-[#EAF4FB] hover:text-[#004A87] focus:outline-none focus-visible:bg-[#EAF4FB] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF8201] dark:text-white/80 dark:hover:bg-white/[0.06]"
              >
                <HiPencil className="w-4 h-4 text-[#004A87] dark:text-[#9BCBFF]" />
                Modifier
              </button>

              <div className="mx-3 my-1.5 h-px bg-[#E2E8F0] dark:bg-white/10" />

              <button
                type="button"
                role="menuitem"
                onClick={handleDeleteClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleDeleteClick(e);
                  }
                }}
                disabled={isDeleting}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 ${
                  isDeleting
                    ? 'cursor-not-allowed text-[#64748B]'
                    : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                }`}
              >
                {isDeleting ? (
                  <HiArrowPath className="h-4 w-4 animate-spin text-[#FF8201]" />
                ) : (
                  <HiTrash className="w-4 h-4" />
                )}
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className="
          relative aspect-4/3
          bg-[#F5F7FA] dark:bg-[#0E1C2D]
          overflow-hidden
          cursor-zoom-in
          shrink-0
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#FF8201]
          focus-visible:ring-offset-2
          focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0E1C2D]
        "
        onClick={onOpenLightbox}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenLightbox();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Open ${media.originalFilename || 'media asset'} in lightbox`}
      >
        <MediaViewport
          mediaType={media.type}
          fullResUrl={media.fullResUrl}
          thumbnailUrl={media.thumbnailUrl}
          caption={media.caption}
          originalFilename={media.originalFilename}
          className="
            w-full h-full
            object-cover
            transition-transform duration-700 ease-out
            group-hover:scale-105
            will-change-transform
          "
          priority={priority}
          sizes={sizes}
        />

        <div
          className="
            absolute inset-0
            bg-linear-to-t
            from-[#00345F]/55
            via-transparent
            to-transparent
            opacity-0
            group-hover:opacity-100
            transition-opacity duration-500
            pointer-events-none
          "
        />

        <div className="absolute top-3 left-3 z-10 flex gap-2 pointer-events-none">
          <span
            className="
              flex items-center gap-1.5
              px-2.5 py-1.5
              rounded-full
              bg-white/95 dark:bg-[#102238]/95
              backdrop-blur-md
              border border-white/70 dark:border-white/10
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-[#00345F] dark:text-white
              shadow-sm
            "
          >
            {media.type === 'video' && <HiPlay className="w-3 h-3 text-[#FF8201]" />}
            {media.type === 'video' ? 'Video' : 'Photo'}
          </span>

          {media.locationName && (
            <span
              className="
                hidden sm:flex
                items-center gap-1.5
                px-2.5 py-1.5
                rounded-full
                bg-white/95 dark:bg-[#102238]/95
                backdrop-blur-md
                border border-white/70 dark:border-white/10
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-[#00345F] dark:text-white
                shadow-sm
                max-w-32
                transform translate-y-2
                opacity-0
                group-hover:translate-y-0
                group-hover:opacity-100
                transition-all duration-300
              "
            >
              <HiMapPin className="w-3 h-3 text-[#004A87] shrink-0" />
              <span className="truncate">{media.locationName}</span>
            </span>
          )}
        </div>

        {media.type === 'video' && media.durationSeconds && (
          <div
            className="
              absolute bottom-3 right-3 z-10
              px-2.5 py-1
              rounded-md
              bg-[#00345F]/85
              backdrop-blur-md
              text-[10px]
              font-mono
              font-bold
              text-white
              shadow-sm
              pointer-events-none
              border border-white/10
            "
          >
            {formatDuration(media.durationSeconds)}
          </div>
        )}
      </div>

      <figcaption className="flex flex-col flex-1 p-5 bg-white dark:bg-[#102238]">
        <div className="mb-4">
          <h3
            className="
              text-sm
              font-bold
              text-[#172033] dark:text-white
              leading-snug
              truncate
              pr-2
              transition-colors
              group-hover:text-[#004A87]
            "
          >
            {media.caption || media.originalFilename || 'Untitled Frame'}
          </h3>

          <p
            className="
              text-[10px]
              font-medium
              text-[#94A3B8]
              mt-1.5
              uppercase
              tracking-widest
            "
          >
            {formatDistanceToNow(new Date(media.uploadedAt), {
              addSuffix: true,
            })}
          </p>
        </div>

        {hasTechnicalData ? (
          <div
            className="
              mt-auto
              pt-4
              border-t border-[#E2E8F0]
            "
          >
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {cameraModelStr && (
                <div
                  className="
                    col-span-2
                    flex items-center justify-between
                    text-[10px]
                    pb-2
                    border-b border-[#F5F7FA]
                    mb-1
                  "
                >
                  <span
                    className="
                      font-medium
                      text-[#64748B]
                      uppercase
                      tracking-wider
                      flex items-center gap-1.5
                    "
                  >
                    <HiCamera className="w-3 h-3 text-[#FF8201]" />
                    Camera
                  </span>

                  <span
                    className="
                      font-semibold
                      text-[#00345F]
                      truncate
                      max-w-[150px]
                    "
                  >
                    {cameraModelStr}
                  </span>
                </div>
              )}

              {isoStr && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">ISO</span>
                  <span className="text-[10px] font-mono font-semibold text-[#00345F]">{isoStr}</span>
                </div>
              )}

              {apertureStr && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">Aperture</span>
                  <span className="text-[10px] font-mono font-semibold text-[#00345F]">f/{apertureStr}</span>
                </div>
              )}

              {shutterStr && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">Shutter</span>
                  <span className="text-[10px] font-mono font-semibold text-[#00345F]">{shutterStr}s</span>
                </div>
              )}

              {resolution && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">Res</span>
                  <span className="text-[10px] font-mono font-semibold text-[#00345F]">{resolution}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className="
              mt-auto
              pt-4
              border-t border-[#E2E8F0]
              flex items-center justify-between
              text-[10px]
            "
          >
            <span className="font-medium text-[#94A3B8] uppercase tracking-wider">Standard Frame</span>

            {resolution && (
              <span className="font-mono font-semibold text-[#64748B]">{resolution}</span>
            )}
          </div>
        )}
      </figcaption>

      <div
        className="
          absolute bottom-0 left-0 right-0
          h-0.5
          bg-[#FF8201]
          scale-x-0
          origin-left
          group-hover:scale-x-100
          transition-transform duration-500
        "
      />
    </figure>
  );
});

export default MediaCard;
