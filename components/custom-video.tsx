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
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleMouseEnter = useCallback(() => {
      if (!hoverPlay) return;
      setIsHovered(true);
      
      const videoElement = ref && typeof ref !== 'function' ? ref.current : null;
      if (videoElement) {
        // Check if ready to play to avoid errors
        if (videoElement.readyState >= 2) {
            videoElement.play().catch(() => {});
        } else {
            // If not ready, try playing anyway, browser will handle queue
            videoElement.play().catch(() => {});
        }
      }
    }, [hoverPlay, ref]);

    const handleMouseLeave = useCallback(() => {
      if (!hoverPlay) return;
      setIsHovered(false);
      
      const videoElement = ref && typeof ref !== 'function' ? ref.current : null;
      if (videoElement) {
        videoElement.pause();
      }
    }, [hoverPlay, ref]);

    const handleLoadedData = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
      setIsLoaded(true);
      onLoadedData?.(e);
    }, [onLoadedData]);

    return (
      <div className="relative h-full w-full overflow-hidden">
        <video
          ref={ref}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata" // Better UX than 'none', lighter than 'auto'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onLoadedData={handleLoadedData}
          className={`h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105 will-change-transform ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          {...props}
        />
        
        {/* Subtle Vignette for Cinematic Feel */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
      </div>
    );
  }
);

CustomVideo.displayName = 'CustomVideo';

export default CustomVideo;