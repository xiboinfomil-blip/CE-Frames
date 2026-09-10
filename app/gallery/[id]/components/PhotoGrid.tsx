'use client';

import React from 'react';
import PhotoAlbum from 'react-photo-album';
import 'react-photo-album/styles.css';
import MediaViewport from '@/components/media-viewport';
import { MediaSummary } from '@/types/types';
import { HiPhoto } from 'react-icons/hi2';

interface PhotoItem {
  src: string;
  width: number;
  height: number;
  alt: string;
  mediaItem: MediaSummary;
}

interface PhotoGridProps {
  photos: PhotoItem[];
  layoutStyle: string;
  onPhotoClick: (index: number) => void;
}

export default function PhotoGrid({
  photos,
  layoutStyle,
  onPhotoClick,
}: PhotoGridProps) {
  const sanitizedPhotos = React.useMemo(() => {
    if (!photos) return [];

    return photos.map((photo) => {
      const width =
        photo.width && photo.width > 0
          ? photo.width
          : 800;

      const height =
        photo.height && photo.height > 0
          ? photo.height
          : 600;

      return {
        ...photo,
        width,
        height,
        src:
          photo.mediaItem.fullResUrl ||
          photo.mediaItem.thumbnailUrl ||
          photo.src,
      };
    });
  }, [photos]);

  /*
   * Empty gallery state
   */
  if (
    !sanitizedPhotos ||
    sanitizedPhotos.length === 0
  ) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div
          className="
            w-20
            h-20
            mb-6
            rounded-2xl
            bg-[#EAF4FB] dark:bg-[#00345F]/40
            flex
            items-center
            justify-center
            border
            border-[#E2E8F0] dark:border-white/10
            shadow-sm
          "
        >
          <HiPhoto className="w-8 h-8 text-[#004A87]" />
        </div>

        <h3
          className="
            text-lg
            font-medium
            text-[#172033] dark:text-white
            tracking-tight
          "
        >
          Aucun média trouvé
        </h3>

        <p
          className="
            text-sm
            text-[#64748B] dark:text-white/60
            mt-2
            max-w-xs
            font-light
            leading-relaxed
          "
        >
          Cette galerie est actuellement vide.
          Revenez plus tard pour découvrir les
          nouveautés.
        </p>
      </div>
    );
  }

  const albumLayout =
    layoutStyle === 'row'
      ? 'rows'
      : layoutStyle === 'column'
        ? 'columns'
        : 'masonry';

  return (
    <div className="w-full -mx-1 sm:-mx-2">
      <PhotoAlbum
        photos={sanitizedPhotos}
        layout={albumLayout}
        spacing={layoutStyle === 'masonry' ? 12 : 16}
        padding={0}
        {...(layoutStyle === 'row'
          ? {
              targetRowHeight: 280,
            }
          : layoutStyle === 'column'
            ? {
                columns: (containerWidth: number) => {
                  if (containerWidth < 640) return 2;
                  if (containerWidth < 1024) return 3;
                  if (containerWidth < 1536) return 4;
                  return 5;
                },
              }
            : {
              columns: (containerWidth: number) => {
                if (containerWidth < 640) return 2;
                if (containerWidth < 1024) return 3;
                if (containerWidth < 1536) return 4;
                return 5;
              },
            })}
        onClick={({ index }) => onPhotoClick(index)}
        render={{
          photo: (props, context) => {
            const { onClick } = props;

            const {
              index,
              photo: photoData,
              width,
              height,
            } = context;

            if (!photoData || !photoData.src) {
              return null;
            }

            const media =
              photoData.mediaItem as MediaSummary;

            /*
             * Media URLs
             */
            const displaySrc =
              media.fullResUrl ||
              media.thumbnailUrl ||
              photoData.src;

            const displayThumb =
              media.thumbnailUrl ||
              photoData.src;

            /*
             * Detect media type
             */
            let detectedType:
              | 'image'
              | 'video'
              | 'gif' = 'image';

            if (
              media.type === 'video' ||
              media.type === 'gif'
            ) {
              detectedType = media.type;
            } else if (
              typeof displaySrc === 'string' &&
              (
                displaySrc.includes('.mp4') ||
                displaySrc.includes('.webm') ||
                displaySrc.includes('/video/')
              )
            ) {
              detectedType = 'video';
            } else if (
              typeof displaySrc === 'string' &&
              displaySrc.includes('.gif')
            ) {
              detectedType = 'gif';
            }

            return (
              <div
                key={index}
                role="button"
                tabIndex={0}
                aria-label={`Voir ${media.caption || media.originalFilename || `le média ${index + 1}`}`}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' ||
                    e.key === ' '
                  ) {
                    e.preventDefault();

                    onClick?.(
                      e as unknown as React.MouseEvent
                    );
                  }
                }}
                onClick={onClick}
                className="
                  group
                  relative
                  block
                  outline-none

                  focus-visible:ring-2
                  focus-visible:ring-[#FF8201]
                  focus-visible:ring-offset-2

                  rounded-xl
                  overflow-hidden

                  bg-[#EAF4FB]
                  cursor-pointer

                  shadow-sm
                  hover:shadow-lg
                  hover:shadow-[#004A87]/10

                  transition-all
                  duration-500
                  ease-out
                "
                style={{
                  width: width
                    ? `${width}px`
                    : '100%',
                  height: height
                    ? `${height}px`
                    : '100%',
                }}
              >
                {/* -----------------------------------------
                    Media
                    ----------------------------------------- */}

                <div className="relative w-full h-full">
                  <MediaViewport
                    mediaType={detectedType}
                    fullResUrl={
                      displaySrc as string
                    }
                    thumbnailUrl={
                      displayThumb as string
                    }

                    /*
                     * No filename
                     * No magnifying glass
                     * No hover text
                     */

                    className="
                      h-full
                      w-full
                      object-cover

                      transition-transform
                      duration-700
                      ease-out

                      group-hover:scale-105
                    "
                    sizes="
                      (max-width: 640px) 50vw,
                      (max-width: 1024px) 33vw,
                      (max-width: 1536px) 25vw,
                      20vw
                    "
                  />
                </div>

                {/* -----------------------------------------
                    Simple Hover Overlay
                    ----------------------------------------- */}

                <div
                  className="
                    absolute
                    inset-0

                    bg-[#00345F]/20

                    opacity-0
                    group-hover:opacity-100

                    transition-opacity
                    duration-500

                    pointer-events-none
                    z-10
                  "
                />
              </div>
            );
          },
        }}
      />
    </div>
  );
}

