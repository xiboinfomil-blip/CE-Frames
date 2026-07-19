'use client';

import { useState, useRef, useMemo } from 'react';
import { MEDIA_TYPES } from '@/db/schema';
import CustomVideo from './custom-video';
import CustomImage from './custom-image';

interface MediaViewportProps {
  mediaType: typeof MEDIA_TYPES[number];
  fullResUrl: string;
  thumbnailUrl: string;
  caption?: string | null;
  originalFilename?: string | null;
  className?: string;
}

const MediaViewport = ({
  mediaType,
  fullResUrl,
  thumbnailUrl,
  caption,
  originalFilename,
  className = ''
}: MediaViewportProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Memoize aria label to prevent unnecessary recalculations
  const ariaLabel = useMemo(() => 
    `Media preview: ${caption || originalFilename || 'Untitled'}`, 
    [caption, originalFilename]
  );

  // Memoize grid style to avoid inline style recreation on every render
  const gridStyle = useMemo(() => ({
    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
    backgroundSize: '20px 20px'
  }), []);

  return (
    <div className={`group relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-900 ring-1 ring-slate-800 shadow-xl transition-shadow duration-300 hover:ring-slate-700 hover:shadow-2xl ${className}`}>
      {/* Technical Grid Background - Optimized with memoized style */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={gridStyle} />

      {/* Loading Shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full animate-pulse bg-slate-800" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-red-500 animate-spin" />
          </div>
        </div>
      )}

      {mediaType === 'video' ? (
        <CustomVideo
          ref={videoRef}
          src={fullResUrl}
          poster={thumbnailUrl || undefined}
          onLoadedData={() => setIsLoaded(true)}
          aria-label={ariaLabel}
        />
      ) : (
        <CustomImage
          src={fullResUrl}
          fallbackSrc={thumbnailUrl}
          alt={caption || originalFilename || 'Media asset'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={() => setIsLoaded(true)}
          className="z-10"
          priority={false} // Ensure lazy loading for performance
        />
      )}

      {/* Overlay: Caption & Status */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
      
      {/* Caption Text */}
      {(caption || originalFilename) && (
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 translate-y-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-sm font-medium text-white tracking-wide drop-shadow-md">
            {caption || originalFilename}
          </p>
          {mediaType === 'video' && (
            <div className="mt-1 flex items-center gap-2 text-xs text-red-400 font-mono uppercase tracking-widest">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
              <span>Motion Preview</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaViewport;