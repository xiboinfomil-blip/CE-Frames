'use client';

import { memo, useCallback, useEffect } from 'react';
import MediaViewport from '@/components/media-viewport';
import { MEDIA_TYPES } from '@/db/schema';

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
  priority?: boolean;
}

const MediaCard = memo(function MediaCard({ media, onRemove, onManualOrder, priority = false }: MediaCardProps) {
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.(media.id);
  }, [onRemove, media.id]);

  const handleManualOrderClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onManualOrder?.(media.id);
  }, [onManualOrder, media.id]);

  useEffect(() => {
    console.log(`[MediaCard ${media.id}] fullResUrl:`, media.fullResUrl);
    console.log(`[MediaCard ${media.id}] thumbnailUrl:`, media.thumbnailUrl);
  }, [media.id, media.fullResUrl, media.thumbnailUrl]);

  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'video':
        return {
          label: 'Video',
          icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
          className: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      case 'gif':
        return {
          label: 'GIF',
          icon: null,
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      default:
        return {
          label: 'Photo',
          icon: null,
          className: 'bg-slate-50 text-slate-600 border-slate-200'
        };
    }
  };

  const badge = getBadgeConfig(media.type);
  const resolution = media.width && media.height ? `${media.width}×${media.height}` : 'N/A';

  const displayUrl = (media.fullResUrl && media.fullResUrl.trim() !== '') 
    ? media.fullResUrl 
    : (media.thumbnailUrl && media.thumbnailUrl.trim() !== '' ? media.thumbnailUrl : null);

  return (
    <article 
      className="group relative flex flex-col h-full w-full overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-300 ease-out hover:shadow-xl hover:border-slate-300 hover:-translate-y-1"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" />

      <div className="relative w-full aspect-square bg-slate-200 overflow-hidden">
        {displayUrl ? (
          <div className="absolute inset-0 w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out">
            <MediaViewport
              mediaType={media.type as typeof MEDIA_TYPES[number]}
              fullResUrl={displayUrl}
              thumbnailUrl={media.thumbnailUrl}
              caption={media.title}
              originalFilename={null}
              className="w-full h-full"
              priority={priority}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-100">
            <svg className="w-12 h-12 opacity-30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">No Image URL Provided</span>
          </div>
        )}
        
        <div className="absolute top-3 right-3 z-30">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md bg-opacity-90 ${badge.className}`}>
            {badge.icon}
            {badge.label}
          </span>
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 pointer-events-none z-30">
          {onManualOrder && (
            <button 
              onClick={handleManualOrderClick}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:scale-110 hover:ring-blue-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Set manual position"
              title="Set Position"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          )}
          
          {onRemove && (
            <button 
              onClick={handleRemove}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:scale-110 hover:ring-red-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Remove media"
              title="Remove"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col p-4 bg-white flex-shrink-0 grow">
        <h3 className="truncate text-sm font-semibold text-slate-900 leading-tight group-hover:text-purple-600 transition-colors mb-2" title={media.title || 'Untitled Asset'}>
          {media.title || 'Untitled Asset'}
        </h3>
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              {resolution}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest opacity-60">
            #{media.id.slice(0, 6).toUpperCase()}
          </span>
        </div>
      </div>
    </article>
  );
});

MediaCard.displayName = 'MediaCard';
export default MediaCard;