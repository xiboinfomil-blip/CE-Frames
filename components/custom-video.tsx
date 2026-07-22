'use client';

import { forwardRef, useCallback, useState } from 'react';

interface CustomVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  poster?: string;
  hoverPlay?: boolean;
}

const CustomVideo = forwardRef<HTMLVideoElement, CustomVideoProps>(
  ({ 
    poster, 
    hoverPlay = true, 
    className = '', 
    onLoadedData,
    onError,
    ...props 
  }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // CRITICAL FIX: Unified handler for both metadata and data loaded.
    const handleReady = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
      setIsLoaded(true);
      onLoadedData?.(e);
    }, [onLoadedData]);

    const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLVideoElement>) => {
      if (!hoverPlay) return;
      e.currentTarget.play().catch(() => {
        // Ignore autoplay prevention errors
      });
    }, [hoverPlay]);

    const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLVideoElement>) => {
      if (!hoverPlay) return;
      e.currentTarget.pause();
      e.currentTarget.currentTime = 0; // Reset to show poster again
    }, [hoverPlay]);

    const handleError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      console.error('Video failed to load:', props.src);
      setIsLoaded(true); // Force opacity-100 so poster/error is visible
      onError?.(e);
    }, [onError, props.src]);

    return (
      <div className="relative h-full w-full overflow-hidden">
        <video
          ref={ref}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onLoadedMetadata={handleReady} // 🚨 CRITICAL: Fires even if loadedData stalls
          onLoadedData={handleReady}
          onError={handleError}
          className={`h-full w-full object-cover transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          {...props}
        />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
      </div>
    );
  }
);

CustomVideo.displayName = 'CustomVideo';
export default CustomVideo;