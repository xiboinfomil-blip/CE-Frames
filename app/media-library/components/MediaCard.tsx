'use client';

import { useCallback, memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Swal from 'sweetalert2';
import { MEDIA_TYPES } from '@/db/schema';
import MediaViewport from '@/components/media-viewport';

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
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: MediaCardProps) {
  const exif = media.exifData || {};
  
  // ✅ Convert unknown values to strings immediately to satisfy ReactNode typing in JSX
  const isoStr = getExifString(exif.ISO ?? exif.iso);
  const apertureStr = getExifString(exif.FNumber ?? exif.fNumber);
  const shutterStr = getExifString(exif.ExposureTime ?? exif.exposureTime);
  const cameraModelStr = getExifString(exif.model);
  
  const hasTechnicalData = !!isoStr || !!apertureStr || !!shutterStr || !!cameraModelStr;
  const resolution = media.width && media.height ? `${media.width}×${media.height}` : null;

  const handleDeleteClick = useCallback(async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (isDeleting) return;

    const result = await Swal.fire({
      title: 'Delete Asset?',
      html: `<span class="text-zinc-500">You are about to permanently remove <strong class="text-zinc-900">${media.originalFilename || 'this asset'}</strong>.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#e4e4e7',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-xl border border-zinc-100',
        title: 'font-semibold text-zinc-900 text-lg',
        htmlContainer: 'mt-2',
        confirmButton: 'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-red-600 hover:shadow-md',
        cancelButton: 'px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-100'
      }
    });

    if (result.isConfirmed) {
      onDelete(media.id);
    }
  }, [isDeleting, onDelete, media.id, media.originalFilename]);

  return (
    <figure className="group relative flex flex-col w-full bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out h-full border border-zinc-100/60">
      
      {/* --- Media Viewport Wrapper --- */}
      <div 
        className="relative aspect-4/3 bg-zinc-50 overflow-hidden cursor-zoom-in shrink-0"
        onClick={onOpenLightbox}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenLightbox(); }}
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
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
          priority={priority}
          sizes={sizes}
        />

        {/* Gradient Overlay for better contrast on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Top Badges (Glassmorphism) */}
        <div className="absolute top-3 left-3 z-10 flex gap-2 pointer-events-none">
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-[11px] font-bold text-zinc-700 shadow-sm">
            {media.type === 'video' && (
              <svg className="w-3 h-3 text-zinc-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
            {media.type === 'video' ? 'Video' : 'Photo'}
          </span>
          
          {media.locationName && (
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-[11px] font-bold text-zinc-700 shadow-sm max-w-32 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <svg className="w-3 h-3 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="truncate">{media.locationName}</span>
            </span>
          )}
        </div>

        {/* Delete Button - Appears on Hover */}
        <button 
          onClick={handleDeleteClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDeleteClick(e); }}
          disabled={isDeleting}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-zinc-200/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
            ${isDeleting 
              ? 'cursor-not-allowed opacity-60' 
              : 'text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
            }
          `}
          aria-label={`Delete ${media.originalFilename || 'media asset'}`}
        >
          {isDeleting ? (
            <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>

        {/* Duration Badge for Video */}
        {media.type === 'video' && media.durationSeconds && (
          <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-bold text-white shadow-sm pointer-events-none">
            {formatDuration(media.durationSeconds)}
          </div>
        )}
      </div>

      {/* --- Content Body --- */}
      <figcaption className="flex flex-col flex-1 p-5 bg-white">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-zinc-900 leading-snug truncate pr-2 transition-colors group-hover:text-zinc-700">
            {media.caption || media.originalFilename || 'Untitled'}
          </h3>
          <p className="text-xs font-medium text-zinc-400 mt-1.5 tracking-wide">
            {formatDistanceToNow(new Date(media.uploadedAt), { addSuffix: true })}
          </p>
        </div>

        {hasTechnicalData ? (
          <div className="mt-auto pt-4 border-t border-zinc-50">
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {/* ✅ Now using string variables, making the && operator type-safe for ReactNode */}
              {cameraModelStr && (
                <div className="col-span-2 flex items-center justify-between text-xs pb-2 border-b border-zinc-50 mb-1">
                  <span className="font-medium text-zinc-400">Camera</span>
                  <span className="font-semibold text-zinc-700">{cameraModelStr}</span>
                </div>
              )}
              {isoStr && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">ISO</span>
                  <span className="text-xs font-semibold text-zinc-700">{isoStr}</span>
                </div>
              )}
              {apertureStr && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">Aperture</span>
                  <span className="text-xs font-semibold text-zinc-700">f/{apertureStr}</span>
                </div>
              )}
              {shutterStr && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">Shutter</span>
                  <span className="text-xs font-semibold text-zinc-700">{shutterStr}s</span>
                </div>
              )}
              {resolution && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">Res</span>
                  <span className="text-xs font-semibold text-zinc-700">{resolution}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-4 border-t border-zinc-50 flex items-center justify-between text-xs">
             <span className="font-medium text-zinc-400">No additional metadata</span>
             {resolution && <span className="font-semibold text-zinc-500">{resolution}</span>}
          </div>
        )}
      </figcaption>
    </figure>
  );
});

export default MediaCard;