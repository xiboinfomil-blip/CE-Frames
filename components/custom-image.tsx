'use client';

import Image from 'next/image';
import React, { useState } from 'react';

interface CustomImageProps extends Omit<React.ComponentProps<typeof Image>, 'src'> {
  src: string;
  fallbackSrc?: string;
  aspectRatio?: string;
}

const CustomImage = ({ 
  src,
  fallbackSrc,
  alt,
  className = '',
  onLoad,
  onError,
  aspectRatio,
  quality = 75,
  loading = 'lazy',
  ...props 
}: CustomImageProps) => {
  const [imgError, setImgError] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentSrc = imgError ? (fallbackSrc || src) : src;
  const isProtectedGalleryMedia = currentSrc.startsWith('/api/gallery-media/');

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!imgError && fallbackSrc) {
      setImgError(true);
      setIsLoaded(false);
    } else {
      setFallbackFailed(true);
    }
    onError?.(e);
  };

  return (
    <div 
      className={`relative h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!isLoaded && !fallbackFailed && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-200/70 dark:bg-slate-800/70">
          <span
            className="h-8 w-8 animate-spin rounded-full border-2 border-[#004A87]/20 border-t-[#FF8201]"
            aria-label="Chargement de l’image"
          />
        </div>
      )}

      {fallbackFailed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600 text-xs font-mono">
          <span>Image Unavailable</span>
        </div>
      ) : (
        <Image
          src={currentSrc}
          alt={alt || 'Photo d’un événement du CE'}
          fill
          quality={quality}
          unoptimized={isProtectedGalleryMedia || props.unoptimized}
          loading={props.priority ? undefined : loading}
          className={`object-cover transition-opacity duration-500 ease-in-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
};

export default CustomImage;