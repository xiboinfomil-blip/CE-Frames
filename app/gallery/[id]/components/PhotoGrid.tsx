'use client';

import React from 'react';
import PhotoAlbum from 'react-photo-album';
import "react-photo-album/styles.css";
import MediaViewport from '@/components/media-viewport';
import { MediaSummary } from '@/types/types'; // ✅ Import the actual type

interface PhotoItem {
  src: string;
  width: number;
  height: number;
  alt: string;
  mediaItem: MediaSummary; // ✅ Use the actual type instead of a fragile inline definition
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
        <div className="w-16 h-16 mb-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No media found</h3>
        <p className="text-sm text-slate-500 max-w-xs">
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

            // 🚨 ROBUST TYPE DETECTION:
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
                className="group relative block outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 rounded-xl overflow-hidden bg-slate-100 cursor-pointer"
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
                    className="h-full w-full"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
                  />
                </div>

                {/* Minimalist Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
                
                {/* Caption Overlay */}
                {(caption || locationName) && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                    <div className="flex flex-col gap-1">
                      {locationName && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 drop-shadow-md">
                          {locationName}
                        </span>
                      )}
                      {caption && (
                        <p className="text-sm font-medium text-white line-clamp-2 drop-shadow-md">
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