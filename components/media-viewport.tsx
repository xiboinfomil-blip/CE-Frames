'use client';

import { memo, useState, useMemo, KeyboardEvent } from 'react';
import { MEDIA_TYPES } from '@/db/schema';
import CustomImage from './custom-image';
import CustomVideo from './custom-video';
import {
  HiPlay,
  HiMagnifyingGlassPlus,
} from 'react-icons/hi2';

interface MediaViewportProps {
  mediaType: typeof MEDIA_TYPES[number];
  fullResUrl: string;
  thumbnailUrl: string;
  caption?: string | null;
  originalFilename?: string | null;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onClick?: () => void;

  // Display controls
  showTitle?: boolean;
  showFilename?: boolean;
  showMagnifyingGlass?: boolean;
}

const MediaViewport = memo(function MediaViewport({
  mediaType,
  fullResUrl,
  thumbnailUrl,
  caption,
  originalFilename,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onClick,

  // Defaults preserve the current behavior
  showTitle = true,
  showFilename = true,
  showMagnifyingGlass = true,
}: MediaViewportProps) {
  const [errorSource, setErrorSource] =
    useState<string | null>(null);

  const ariaLabel = useMemo(
    () =>
      `Media preview: ${
        caption ||
        originalFilename ||
        'Untitled media'
      }`,
    [caption, originalFilename]
  );

  const hasError =
    errorSource === fullResUrl;

  const currentSrc = hasError
    ? thumbnailUrl
    : fullResUrl;

  const handleKeyDown = (
    e: KeyboardEvent<HTMLElement>
  ) => {
    if (
      onClick &&
      (e.key === 'Enter' || e.key === ' ')
    ) {
      e.preventDefault();
      onClick();
    }
  };

  const isInteractive = Boolean(onClick);

  return (
    <figure
      role={isInteractive ? 'button' : 'figure'}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`
        group
        relative
        w-full
        h-full
        overflow-hidden
        rounded-2xl

        bg-white dark:bg-[#102238]
        border
        border-[#E2E8F0] dark:border-white/10

        transition-all
        duration-300
        ease-out

        hover:shadow-xl
        hover:shadow-[#00345F]/10
        hover:border-[#004A87]/30

        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#FF8201]
        focus-visible:ring-offset-2
        focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#102238]

        ${isInteractive ? 'cursor-pointer' : ''}

        ${className}
      `}
    >
      {/* Event Media Preview */}
      {mediaType === 'video' ? (
        <CustomVideo
          src={currentSrc}
          poster={thumbnailUrl || undefined}
          hoverPlay={true}
          onError={() =>
            setErrorSource(fullResUrl)
          }
        />
      ) : (
        <CustomImage
          src={currentSrc}
          fallbackSrc={thumbnailUrl}
          alt={
            caption ||
            originalFilename ||
            'Media asset'
          }
          priority={priority}
          sizes={sizes}
          onError={() =>
            setErrorSource(fullResUrl)
          }
        />
      )}

      {/* ---------------------------------------------
          Hover Interaction Overlay
          --------------------------------------------- */}

      {showMagnifyingGlass && (
        <div
          className="
            absolute
            inset-0

            bg-[#00345F]/20

            opacity-0
            group-hover:opacity-100

            transition-opacity
            duration-300

            pointer-events-none

            flex
            items-center
            justify-center
          "
        >
          <div
            className="
              w-12
              h-12

              rounded-full

              bg-white/95 dark:bg-[#102238]/95
              backdrop-blur-md

              border
              border-[#E2E8F0] dark:border-white/10

              text-[#004A87]

              flex
              items-center
              justify-center

              shadow-2xl
              shadow-[#00345F]/20

              transform
              scale-90
              group-hover:scale-100

              transition-transform
              duration-300
            "
          >
            {mediaType === 'video' ? (
              <HiPlay
                className="
                  w-6
                  h-6
                  ml-0.5
                  text-[#FF8201]
                "
              />
            ) : (
              <HiMagnifyingGlassPlus
                className="
                  w-5
                  h-5
                  text-[#004A87]
                "
              />
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------
          Caption / Filename Overlay
          --------------------------------------------- */}

      {(showTitle || showFilename) &&
        (caption || originalFilename) && (
          <figcaption
            className="
              absolute
              inset-x-0
              bottom-0
              p-3

              bg-gradient-to-t
              from-[#00345F]/95
              via-[#00345F]/60
              to-transparent

              opacity-0
              group-hover:opacity-100

              transition-opacity
              duration-300

              pointer-events-none
            "
          >
            {/* Caption / Title */}
            {showTitle && caption && (
              <p
                className="
                  text-xs
                  font-medium
                  text-white
                  truncate
                "
              >
                {caption}
              </p>
            )}

            {/* Original Filename */}
            {showFilename && originalFilename && (
              <p
                className={`
                  truncate
                  text-white/70
                  ${
                    showTitle && caption
                      ? 'mt-0.5 text-[10px]'
                      : 'text-xs font-medium'
                  }
                `}
              >
                {originalFilename}
              </p>
            )}
          </figcaption>
        )}
    </figure>
  );
});

export default MediaViewport;