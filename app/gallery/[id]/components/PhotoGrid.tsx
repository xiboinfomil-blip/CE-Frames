'use client';

import React from 'react';
import PhotoAlbum from 'react-photo-album';
import "react-photo-album/styles.css";
import MediaViewport from '@/components/media-viewport';
import { MediaSummary } from '@/types/types';
import { MapPin } from 'lucide-react';

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

export default function PhotoGrid({ photos, layoutStyle, onPhotoClick }: PhotoGridProps) {
  
  const sanitizedPhotos = React.useMemo(() => {
    if (!photos) return [];
    return photos.map(photo => {
      const width = photo.width && photo.width > 0 ? photo.width : 800;
      const height = photo.height && photo.height > 0 ? photo.height : 600;
      
      return {
        ...photo,
        width,
        height,
        src: photo.mediaItem.fullResUrl || photo.mediaItem.thumbnailUrl || photo.src,
      };
    });
  }, [photos]);

  if (!sanitizedPhotos || sanitizedPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="w-20 h-20 mb-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
          <svg className="w-8 h-8 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">No media found</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs font-medium">
          This gallery is currently empty. Check back later for updates.
        </p>
      </div>
    );
  }

  const isGrid = layoutStyle === 'grid';

  return (
    <div className="w-full">
      <PhotoAlbum
        photos={sanitizedPhotos}
        layout={isGrid ? 'rows' : 'masonry'}
        spacing={12}
        padding={0}
        {...(isGrid 
          ? { targetRowHeight: 250 } 
          : {
              columns: (containerWidth: number) => {
                if (containerWidth < 640) return 2;
                if (containerWidth < 1024) return 3;
                if (containerWidth < 1536) return 4;
                return 5;
              }
            }
        )}
        onClick={({ index }) => onPhotoClick(index)}
        render={{
          photo: (props, context) => {
            const photoData = context.photo;
            const { width, height } = context;
            
            if (!photoData || !photoData.src) return null;

            const media = photoData.mediaItem;
            const displaySrc = media.fullResUrl || media.thumbnailUrl || photoData.src;
            const displayThumb = media.thumbnailUrl || photoData.src;
            const caption = media.caption;
            const locationName = media.locationName;
            const originalFilename = media.originalFilename;
            const handleClick = props.onClick || (() => {});

            // Robust Type Detection
            let detectedType: 'image' | 'video' | 'gif' = 'image';
            
            if (media.type === 'video' || media.type === 'gif') {
              detectedType = media.type;
            } else if (typeof displaySrc === 'string' && (displaySrc.includes('.mp4') || displaySrc.includes('.webm') || displaySrc.includes('/video/'))) {
              detectedType = 'video';
            } else if (typeof displaySrc === 'string' && displaySrc.includes('.gif')) {
              detectedType = 'gif';
            }

            return (
              <div 
                role="button"
                tabIndex={0}
                aria-label={`View ${caption || 'media'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (handleClick) {
                      handleClick(e as unknown as React.MouseEvent);
                    }
                  }
                }}
                className="group relative block outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:ring-offset-2 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                style={{ 
                  width: width ? `${width}px` : '100%',
                  height: height ? `${height}px` : '100%',
                }}
                onClick={handleClick}
              >
                {/* Inner Container for Media */}
                <div className="relative w-full h-full">
                  <MediaViewport
                    mediaType={detectedType}
                    fullResUrl={displaySrc as string}
                    thumbnailUrl={displayThumb as string}
                    caption={caption}
                    originalFilename={originalFilename}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
                  />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
                
                {/* Caption & Metadata Overlay */}
                {(caption || locationName) && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20">
                    <div className="flex flex-col gap-1.5">
                      {locationName && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-400 drop-shadow-md">
                          <MapPin className="w-3 h-3" />
                          {locationName}
                        </span>
                      )}
                      {caption && (
                        <p className="text-sm font-medium text-white line-clamp-2 drop-shadow-md leading-snug">
                          {caption}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          },
        }}
      />
    </div>
  );
}