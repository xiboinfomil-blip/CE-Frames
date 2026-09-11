'use client';

import React, {
  forwardRef,
  useCallback,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';

interface CustomVideoProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  poster?: string;
  hoverPlay?: boolean;
  showPlayBadge?: boolean;
  aspectRatio?: string;
}

const CustomVideo = forwardRef<HTMLVideoElement, CustomVideoProps>(
  (
    {
      poster,
      hoverPlay = true,
      showPlayBadge = true,
      aspectRatio,
      className = '',
      onLoadedData,
      onError,
      ...props
    },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Internal reference if external ref is not provided
    const internalRef = useRef<HTMLVideoElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLVideoElement | null) => {
        internalRef.current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (
            ref as React.MutableRefObject<HTMLVideoElement | null>
          ).current = node;
        }
      },
      [ref]
    );

    const handleReady = useCallback(
      (e: React.SyntheticEvent<HTMLVideoElement>) => {
        setIsLoaded(true);
        onLoadedData?.(e);
      },
      [onLoadedData]
    );

    const handleMouseEnter = useCallback(async () => {
      if (
        !hoverPlay ||
        !internalRef.current ||
        hasError ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }

      const video = internalRef.current;

      // Guarantee browser autoplay policies pass
      video.muted = true;

      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        // Suppress browser autoplay lock errors gracefully
        setIsPlaying(false);
      }
    }, [hoverPlay, hasError]);

    const handleMouseLeave = useCallback(() => {
      if (!hoverPlay || !internalRef.current) {
        return;
      }

      const video = internalRef.current;

      video.pause();
      video.currentTime = 0;

      setIsPlaying(false);
    }, [hoverPlay]);

    const handleError = useCallback(
      (
        e: React.SyntheticEvent<HTMLVideoElement, Event>
      ) => {
        console.error(
          'Video failed to load:',
          props.src
        );

        setHasError(true);
        setIsLoaded(true);

        onError?.(e);
      },
      [onError, props.src]
    );

    // Check if poster is a video file
    const isVideoPoster = poster?.match(
      /\.(mp4|webm|ogg)($|\?)/i
    );

    return (
      <div
        className={`
          group
          relative
          h-full
          w-full
          overflow-hidden
          bg-[#F5F7FA]
          dark:bg-[#0E1C2D]
          ${className}
        `}
        style={
          aspectRatio
            ? { aspectRatio }
            : undefined
        }
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >

        {/* Skeleton Loader */}
        {!isLoaded && !hasError && (
          <div
            className="
              absolute
              inset-0
              z-0
              animate-pulse
              bg-[#EAF4FB]
              dark:bg-[#00345F]/40
            "
          />
        )}

        {/* 1. POSTER THUMBNAIL LAYER */}
        {poster && !hasError && !isVideoPoster && (
            <Image
              src={poster}
              alt=""
              fill
              sizes="100vw"
              unoptimized={poster.startsWith('/api/gallery-media/')}
              className="
                pointer-events-none
                absolute
                inset-0
                h-full
                w-full
                object-cover
                transition-transform
                duration-700
                ease-out
                group-hover:scale-105
              "
            />
        )}

        {/* 2. MAIN ACTIVE VIDEO LAYER */}
        {!hasError && (
          <video
            ref={setRefs}
            {...props}
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            onLoadedMetadata={handleReady}
            onLoadedData={handleReady}
            onError={handleError}
            muted
            controls={false}
            className={`
              absolute
              inset-0
              h-full
              w-full
              object-cover
              transition-all
              duration-700
              ease-out
              group-hover:scale-105
              will-change-transform
              ${
                isLoaded
                  ? 'opacity-100'
                  : 'opacity-0'
              }
            `}
          />
        )}

        {/* 3. PLAY BADGE / INDICATOR */}
        {showPlayBadge &&
          !hasError &&
          hoverPlay && (
            <div
              className={`
                pointer-events-none
                absolute
                bottom-3
                right-3
                z-10
                flex
                items-center
                gap-1.5
                rounded-full
                px-2.5
                py-1
                text-[10px]
                font-mono
                tracking-wider
                backdrop-blur-md
                border
                transition-all
                duration-300

                ${
                  isPlaying
                    ? `
                      bg-[#FF8201]/95
                      border-[#FF8201]
                      text-white
                      shadow-lg
                      shadow-[#FF8201]/25
                    `
                    : `
                      bg-[#00345F]/85
                      border-white/10
                      text-white
                      opacity-80
                      group-hover:opacity-100
                    `
                }
              `}
            >
              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${
                    isPlaying
                      ? 'animate-ping bg-white'
                      : 'bg-[#FF8201]'
                  }
                `}
              />

              {isPlaying
                ? 'PLAYING'
                : 'HOVER TO PLAY'}
            </div>
          )}

        {/* 4. ERROR FALLBACK */}
        {hasError && (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-[#EAF4FB]
              text-[#64748B]
              text-xs
              font-mono
            "
          >
            <span>
              Video Unavailable
            </span>
          </div>
        )}
      </div>
    );
  }
);

CustomVideo.displayName = 'CustomVideo';

export default CustomVideo;