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
}

const formatDuration = (seconds: number | null): string | null => {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Helper to safely convert unknown EXIF values to strings for rendering
const getExifString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const MediaCard = memo(function MediaCard({ 
  media, 
  onDelete, 
  onOpenLightbox, 
  isDeleting = false,
  priority = false
}: MediaCardProps) {
  const exif = media.exifData || {};
  
  // Extract and cast EXIF values to ensure they are treated as renderable types
  const iso = exif.ISO ?? exif.iso;
  const aperture = exif.FNumber ?? exif.fNumber;
  const shutter = exif.ExposureTime ?? exif.exposureTime;
  const cameraModel = exif.model;
  
  const hasTechnicalData = !!iso || !!aperture || !!shutter || !!cameraModel;
  const resolution = media.width && media.height ? `${media.width}×${media.height}` : null;

  const handleDeleteClick = useCallback(async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (isDeleting) return;

    const result = await Swal.fire({
      title: 'Purge Asset?',
      html: `<span class="text-slate-600">You are about to permanently remove <strong class="text-slate-900">${media.originalFilename || 'this asset'}</strong> from the archive.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'Yes, purge it',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-xl border border-slate-100 font-sans',
        title: 'font-bold text-slate-900 text-lg',
        confirmButton: 'px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-red-600 hover:shadow-md',
        cancelButton: 'px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }
    });

    if (result.isConfirmed) {
      onDelete(media.id);
    }
  }, [isDeleting, onDelete, media.id, media.originalFilename]);

  return (
    <figure 
      className="group relative flex flex-col w-full bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:border-slate-300 hover:-translate-y-1 overflow-hidden will-change-transform"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" />

      {/* --- Media Viewport Wrapper (Clickable for Lightbox) --- */}
      <div 
        className="relative aspect-4/3 bg-slate-50 overflow-hidden cursor-zoom-in"
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
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          priority={priority}
        />

        {/* Top Badges (Glassmorphism) */}
        <div className="absolute top-3 left-3 z-10 flex gap-2 pointer-events-none">
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm">
            {media.type === 'video' && (
              <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
            {media.type === 'video' ? 'Video' : 'Photo'}
          </span>
          
          {media.locationName && (
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm max-w-37.5">
              <svg className="w-3 h-3 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
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
          className={`absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-slate-200/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200
            ${isDeleting 
              ? 'cursor-not-allowed opacity-60' 
              : 'text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
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
          <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-mono font-bold text-white shadow-sm pointer-events-none">
            {formatDuration(media.durationSeconds)}
          </div>
        )}
      </div>

      {/* --- Content Body (Telemetry Dashboard) --- */}
      <figcaption className="flex flex-col flex-1 p-4 bg-white">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-slate-900 leading-snug truncate pr-2 group-hover:text-purple-600 transition-colors">
            {media.caption || media.originalFilename || 'Untitled Shot'}
          </h3>
          <p className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mt-1.5">
            {formatDistanceToNow(new Date(media.uploadedAt), { addSuffix: true })}
          </p>
        </div>

        {hasTechnicalData ? (
          <div className="mt-auto pt-3 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {cameraModel && (
                <div className="col-span-2 flex items-center justify-between text-[10px] pb-1 border-b border-slate-50 mb-1">
                  <span className="uppercase tracking-widest font-bold text-slate-400">Camera</span>
                  <span className="font-mono font-semibold text-slate-700">{getExifString(cameraModel)}</span>
                </div>
              )}
              {iso && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">ISO</span>
                  <span className="font-mono text-xs font-semibold text-slate-700">{getExifString(iso)}</span>
                </div>
              )}
              {aperture && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Aperture</span>
                  <span className="font-mono text-xs font-semibold text-slate-700">f/{getExifString(aperture)}</span>
                </div>
              )}
              {shutter && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Shutter</span>
                  <span className="font-mono text-xs font-semibold text-slate-700">{getExifString(shutter)}s</span>
                </div>
              )}
              {resolution && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Res</span>
                  <span className="font-mono text-xs font-semibold text-slate-700">{resolution}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
             <span className="font-bold uppercase tracking-wider text-slate-400">No telemetry</span>
             {resolution && <span className="font-mono font-semibold text-slate-600">{resolution}</span>}
          </div>
        )}
      </figcaption>
    </figure>
  );
});

export default MediaCard;