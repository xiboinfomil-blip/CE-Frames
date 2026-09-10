'use client';

import { useCallback, memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Swal from 'sweetalert2';
import { MEDIA_TYPES } from '@/db/schema';
import MediaViewport from '@/components/media-viewport';
import {
HiPlay,
HiMapPin,
HiTrash,
HiArrowPath,
HiCamera,
} from 'react-icons/hi2';

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
onOpenLightbox: () => void;
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
onOpenLightbox,
isDeleting = false,
priority = false,
sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: MediaCardProps) {
const exif = media.exifData || {};

const isoStr = getExifString(exif.ISO ?? exif.iso);
const apertureStr = getExifString(exif.FNumber ?? exif.fNumber);
const shutterStr = getExifString(
exif.ExposureTime ?? exif.exposureTime
);
const cameraModelStr = getExifString(exif.model);

const hasTechnicalData =
!!isoStr ||
!!apertureStr ||
!!shutterStr ||
!!cameraModelStr;

const resolution =
media.width && media.height
? `${media.width}×${media.height}`
: null;

const handleDeleteClick = useCallback(
async (e: React.MouseEvent | React.KeyboardEvent) => {
e.stopPropagation();

  if (isDeleting) return;

  const result = await Swal.fire({
    title: 'Delete Frame Asset?',
    html: `<span class="text-[#64748B] text-sm">You are about to permanently remove <strong class="text-[#172033]">${media.originalFilename || 'this asset'}</strong> from CE Frames.</span>`,
    icon: 'warning',
    showCancelButton: true,

    // CE Frames brand colors
    confirmButtonColor: '#FF8201',
    cancelButtonColor: '#E2E8F0',

    confirmButtonText: 'Yes, delete asset',
    cancelButtonText: 'Cancel',

    background: '#FFFFFF',

    customClass: {
      popup:
        'rounded-2xl shadow-xl border border-[#E2E8F0] p-6',
      title:
        'font-bold text-[#172033] text-lg tracking-tight',
      htmlContainer:
        'mt-2',
      confirmButton:
        'px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:bg-[#E87500] hover:shadow-md cursor-pointer',
      cancelButton:
        'px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#64748B] hover:bg-[#F5F7FA] cursor-pointer',
    },
  });

  if (result.isConfirmed) {
    onDelete(media.id);
  }
},
[
  isDeleting,
  onDelete,
  media.id,
  media.originalFilename,
]

);

return ( <figure
   className="
     group relative flex flex-col w-full h-full
    bg-white dark:bg-[#102238]
     rounded-2xl overflow-hidden
    border border-[#E2E8F0] dark:border-white/10
     shadow-sm
     hover:shadow-xl hover:shadow-[#00345F]/10
     hover:border-[#CBD5E1]
     transition-all duration-500 ease-out
   "
 >
{/* --- Media Viewport Wrapper --- */}
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
aria-label={`Open ${
          media.originalFilename || 'media asset'
        } in lightbox`}
> <MediaViewport
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

```
    {/* Gradient Overlay */}
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

    {/* Top Badges */}
    <div className="absolute top-3 left-3 z-10 flex gap-2 pointer-events-none">
      {/* Media Type */}
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
        {media.type === 'video' && (
          <HiPlay className="w-3 h-3 text-[#FF8201]" />
        )}

        {media.type === 'video' ? 'Video' : 'Photo'}
      </span>

      {/* Location */}
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

          <span className="truncate">
            {media.locationName}
          </span>
        </span>
      )}
    </div>

    {/* Delete Button */}
    <button
      type="button"
      onClick={handleDeleteClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleDeleteClick(e);
        }
      }}
      disabled={isDeleting}
      className={`
        absolute top-3 right-3 z-20
        p-2 rounded-full
        bg-white/95 dark:bg-[#102238]/95
        backdrop-blur-md
        shadow-sm
        border border-[#E2E8F0] dark:border-white/10
        transition-all duration-200
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#FF8201]
        focus-visible:ring-offset-1
        cursor-pointer

        ${
          isDeleting
            ? 'cursor-not-allowed opacity-60'
            : `
              text-[#64748B]
              hover:text-red-600
              hover:bg-red-50
              hover:border-red-200
              opacity-0
              group-hover:opacity-100
              group-focus-within:opacity-100
            `
        }
      `}
      aria-label={`Delete ${
        media.originalFilename || 'media asset'
      }`}
    >
      {isDeleting ? (
        <HiArrowPath className="animate-spin h-4 w-4 text-[#FF8201]" />
      ) : (
        <HiTrash className="w-4 h-4" />
      )}
    </button>

    {/* Duration Badge */}
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

  {/* --- Content Body --- */}
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
        {media.caption ||
          media.originalFilename ||
          'Untitled Frame'}
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

    {/* Technical Metadata */}
    {hasTechnicalData ? (
      <div
        className="
          mt-auto
          pt-4
          border-t border-[#E2E8F0]
        "
      >
        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
          {/* Camera */}
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

          {/* ISO */}
          {isoStr && (
            <div className="flex items-center justify-between">
              <span
                className="
                  text-[10px]
                  font-medium
                  text-[#64748B]
                  uppercase
                  tracking-wider
                "
              >
                ISO
              </span>

              <span
                className="
                  text-[10px]
                  font-mono
                  font-semibold
                  text-[#00345F]
                "
              >
                {isoStr}
              </span>
            </div>
          )}

          {/* Aperture */}
          {apertureStr && (
            <div className="flex items-center justify-between">
              <span
                className="
                  text-[10px]
                  font-medium
                  text-[#64748B]
                  uppercase
                  tracking-wider
                "
              >
                Aperture
              </span>

              <span
                className="
                  text-[10px]
                  font-mono
                  font-semibold
                  text-[#00345F]
                "
              >
                f/{apertureStr}
              </span>
            </div>
          )}

          {/* Shutter */}
          {shutterStr && (
            <div className="flex items-center justify-between">
              <span
                className="
                  text-[10px]
                  font-medium
                  text-[#64748B]
                  uppercase
                  tracking-wider
                "
              >
                Shutter
              </span>

              <span
                className="
                  text-[10px]
                  font-mono
                  font-semibold
                  text-[#00345F]
                "
              >
                {shutterStr}s
              </span>
            </div>
          )}

          {/* Resolution */}
          {resolution && (
            <div className="flex items-center justify-between">
              <span
                className="
                  text-[10px]
                  font-medium
                  text-[#64748B]
                  uppercase
                  tracking-wider
                "
              >
                Res
              </span>

              <span
                className="
                  text-[10px]
                  font-mono
                  font-semibold
                  text-[#00345F]
                "
              >
                {resolution}
              </span>
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
        <span
          className="
            font-medium
            text-[#94A3B8]
            uppercase
            tracking-wider
          "
        >
          Standard Frame
        </span>

        {resolution && (
          <span
            className="
              font-mono
              font-semibold
              text-[#64748B]
            "
          >
            {resolution}
          </span>
        )}
      </div>
    )}
  </figcaption>

  {/* Brand Accent */}
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
