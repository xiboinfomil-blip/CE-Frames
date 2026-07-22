'use client';

import { useState, useMemo, useEffect } from 'react';
import { MEDIA_TYPES } from '@/db/schema';
import CustomImage from './custom-image';

interface MediaViewportProps {
  mediaType: typeof MEDIA_TYPES[number];
  fullResUrl: string;
  thumbnailUrl: string;
  caption?: string | null;
  originalFilename?: string | null;
  className?: string;
  priority?: boolean;
}

const MediaViewport = ({
  mediaType,
  fullResUrl,
  thumbnailUrl,
  caption,
  originalFilename,
  className = '',
  priority = false
}: MediaViewportProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const ariaLabel = useMemo(() => 
    `Media preview: ${caption || originalFilename || 'Untitled'}`, 
    [caption, originalFilename]
  );

  // 🚨 CRITICAL FALLBACK: If the video takes longer than 3 seconds to load metadata,
  // force the loader to disappear so the poster image is visible.
  useEffect(() => {
    if (mediaType === 'video' && !isLoaded && !hasError) {
      const timer = setTimeout(() => {
        console.warn('Video load timeout, showing poster.');
        setIsLoaded(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mediaType, isLoaded, hasError]);

  const gridStyle = useMemo(() => ({
    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
    backgroundSize: '20px 20px'
  }), []);

  return (
    <div className={`group relative aspect-4/3 w-full overflow-hidden rounded-lg bg-slate-900 ring-1 ring-slate-800 shadow-xl transition-shadow duration-300 hover:ring-slate-700 hover:shadow-2xl ${className}`}>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={gridStyle} />

      {/* Spinner only shows if NOT loaded AND no error */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-slate-800">
          <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-red-500 animate-spin" />
        </div>
      )}

      {mediaType === 'video' ? (
        <video
          src={fullResUrl}
          poster={thumbnailUrl || undefined}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={ariaLabel}
          className={`h-full w-full object-cover transition-all duration-700 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105 will-change-transform`}
          onLoadedMetadata={() => setIsLoaded(true)}
          onLoadedData={() => setIsLoaded(true)}
          onError={(e) => {
            console.error('Video failed to load:', fullResUrl, e);
            setHasError(true);
            setIsLoaded(true);
          }}
          // 🚨 HOVER PLAY LOGIC RESTORED
          onMouseEnter={(e) => {
            e.currentTarget.play().catch(() => {
              // Ignore autoplay prevention errors (e.g., strict browser policies)
            });
          }}
          onMouseLeave={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0; // Reset to start so it shows the poster again
          }}
        />
      ) : (
        <CustomImage
          src={fullResUrl}
          fallbackSrc={thumbnailUrl}
          alt={caption || originalFilename || 'Media asset'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={`z-10 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          priority={priority}
        />
      )}

      <div className="absolute inset-0 z-20 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
      
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
              <span>Preview</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaViewport;