'use client';

import React from 'react';
import PhotoAlbum from 'react-photo-album';
import "react-photo-album/styles.css";
import MediaViewport from '@/components/media-viewport';
import { MediaSummary } from '@/types/types';
import { HiMapPin, HiPhoto } from 'react-icons/hi2';

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
      // S'assure d'avoir des dimensions valides pour le moteur de rendu de la galerie
      const width = photo.width && photo.width > 0 ? photo.width : 800;
      const height = photo.height && photo.height > 0 ? photo.height : 600;
      
      return {
        ...photo,
        width,
        height,
        // Privilégie la haute résolution pour la qualité, sinon bascule sur la miniature
        src: photo.mediaItem.fullResUrl || photo.mediaItem.thumbnailUrl || photo.src,
      };
    });
  }, [photos]);

  if (!sanitizedPhotos || sanitizedPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="w-20 h-20 mb-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <HiPhoto className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 tracking-tight">
          Aucun média trouvé
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs font-light leading-relaxed">
          Cette galerie est actuellement vide. Revenez plus tard pour découvrir les nouveautés.
        </p>
      </div>
    );
  }

  const isGrid = layoutStyle === 'grid';

  return (
    <div className="w-full -mx-1 sm:-mx-2">
      <PhotoAlbum
        photos={sanitizedPhotos}
        layout={isGrid ? 'rows' : 'masonry'}
        spacing={isGrid ? 16 : 12}
        padding={0}
        {...(isGrid 
          ? { targetRowHeight: 280 } 
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
            const { onClick } = props;
            const { index, photo: photoData, width, height } = context;
            
            if (!photoData || !photoData.src) return null;

            const media = photoData.mediaItem as MediaSummary;
            const displaySrc = media.fullResUrl || media.thumbnailUrl || photoData.src;
            const displayThumb = media.thumbnailUrl || photoData.src;
            const caption = media.caption;
            const locationName = media.locationName;
            const originalFilename = media.originalFilename;

            // Détection du type de fichier
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
                key={index}
                role="button"
                tabIndex={0}
                aria-label={`Voir ${caption || 'le média'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.(e as unknown as React.MouseEvent);
                  }
                }}
                className="group relative block outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:ring-offset-2 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-500 ease-out"
                style={{ 
                  width: width ? `${width}px` : '100%',
                  height: height ? `${height}px` : '100%',
                }}
                onClick={onClick}
              >
                {/* Conteneur Média */}
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

                {/* Overlay en dégradé */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
                
                {/* Légende & Métadonnées au survol */}
                {(caption || locationName) && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20">
                    <div className="flex flex-col gap-1.5 backdrop-blur-sm bg-white/10 rounded-lg p-3 border border-white/10">
                      {locationName && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-300 drop-shadow-md">
                          <HiMapPin className="w-3 h-3" />
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