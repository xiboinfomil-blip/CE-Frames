'use client';

import { memo, useCallback } from 'react';
import MediaViewport from '@/components/media-viewport';
import { MEDIA_TYPES } from '@/db/schema';
import { Image as ImageIcon, Video, FileImage, Trash2, ArrowUpDown } from 'lucide-react';

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

  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'video':
        return {
          label: 'Video',
          icon: <Video className="w-3 h-3" />,
          className: 'bg-zinc-900/80 text-white border-zinc-700/50'
        };
      case 'gif':
        return {
          label: 'GIF',
          icon: null,
          className: 'bg-rose-500/90 text-white border-rose-400/50'
        };
      default:
        return {
          label: 'Photo',
          icon: <ImageIcon className="w-3 h-3" />,
          className: 'bg-white/90 dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-300 border-white/20 dark:border-zinc-800'
        };
    }
  };

  const badge = getBadgeConfig(media.type);
  const resolution = media.width && media.height ? `${media.width}×${media.height}` : null;

  const displayUrl = (media.fullResUrl && media.fullResUrl.trim() !== '') 
    ? media.fullResUrl 
    : (media.thumbnailUrl && media.thumbnailUrl.trim() !== '' ? media.thumbnailUrl : null);

  return (
    <article 
      className="group relative flex flex-col h-full w-full overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50 transition-all duration-500 ease-out hover:-translate-y-1"
    >
      {/* Media Viewport */}
      <div className="relative w-full aspect-[4/3] bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
        {displayUrl ? (
          <div className="absolute inset-0 w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out">
            <MediaViewport
              mediaType={media.type as typeof MEDIA_TYPES[number]}
              fullResUrl={displayUrl}
              thumbnailUrl={media.thumbnailUrl}
              caption={media.title}
              originalFilename={null}
              className="w-full h-full object-cover"
              priority={priority}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900">
            <FileImage className="w-10 h-10 opacity-50 mb-2" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-widest">No Preview</span>
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 right-3 z-20">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${badge.className}`}>
            {badge.icon}
            {badge.label}
          </span>
        </div>

        {/* Action Buttons Overlay */}
        {(onManualOrder || onRemove) && (
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 dark:bg-black/40 pointer-events-none z-30">
            {onManualOrder && (
              <button 
                onClick={handleManualOrderClick}
                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md text-zinc-700 dark:text-zinc-300 shadow-lg border border-white/20 dark:border-zinc-800 transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white"
                aria-label="Set manual position"
                title="Reorder"
              >
                <ArrowUpDown className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
            
            {onRemove && (
              <button 
                onClick={handleRemove}
                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md text-rose-600 dark:text-rose-400 shadow-lg border border-white/20 dark:border-zinc-800 transition-all duration-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                aria-label="Remove media"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="flex flex-col p-4 bg-white dark:bg-zinc-900 flex-shrink-0 grow">
        <h3 className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors mb-3 tracking-tight" title={media.title || 'Untitled Asset'}>
          {media.title || 'Untitled Asset'}
        </h3>
        
        <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          {resolution ? (
            <div className="flex items-center gap-2 text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
              {resolution}
            </div>
          ) : (
            <div />
          )}
          <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest opacity-60">
            #{media.id.slice(0, 6).toUpperCase()}
          </span>
        </div>
      </div>
    </article>
  );
});

MediaCard.displayName = 'MediaCard';
export default MediaCard;