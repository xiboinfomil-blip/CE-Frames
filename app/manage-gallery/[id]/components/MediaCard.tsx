'use client';

import { memo, useCallback } from 'react';
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
}

const MediaCard = memo(function MediaCard({ media, onRemove }: MediaCardProps) {
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.(media.id);
  }, [onRemove, media.id]);

  // Determine badge config - Modern & Light
  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'video':
        return {
          label: 'Video',
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          ),
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

  return (
    <article 
      className="group relative flex flex-col h-full w-full overflow-hidden rounded-2xl bg-white border border-slate-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:border-slate-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500/50"
      aria-label={`Media asset: ${media.title || 'Untitled'}`}
    >
      {/* Animated Racing Gradient Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" />

      {/* Image/Media Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
        
        {/* Media Viewport with Zoom Effect */}
        <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out">
          <MediaViewport
            mediaType={media.type as any}
            fullResUrl={media.fullResUrl || media.thumbnailUrl}
            thumbnailUrl={media.thumbnailUrl}
            caption={media.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Type Badge - Glassmorphism Pill */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${badge.className}`}>
            {badge.icon}
            {badge.label}
          </span>
        </div>

        {/* Remove Action - Floating Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/20 to-transparent pointer-events-none">
          <button 
            onClick={handleRemove}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-600 shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:scale-110 hover:ring-red-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label={`Remove ${media.title || 'media asset'} from gallery`}
            title="Remove from Gallery"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer Info - Telemetry / Spec Sheet Style */}
      <div className="flex flex-col flex-1 p-4 bg-white">
        <h3 
          className="truncate text-sm font-bold text-slate-900 leading-tight group-hover:text-purple-600 transition-colors mb-3" 
          title={media.title || 'Untitled Asset'}
        >
          {media.title || 'Untitled Asset'}
        </h3>
        
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider">
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