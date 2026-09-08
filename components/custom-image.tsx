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
  fallbackSrc = 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop', 
  alt, 
  className = '', 
  onLoad,
  onError,
  aspectRatio,
  ...props 
}: CustomImageProps) => {
  const [imgError, setImgError] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine current image source
  const currentSrc = imgError ? fallbackSrc : src;

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!imgError && fallbackSrc) {
      setImgError(true);
      setIsLoaded(false); // Reset load state so fallback fades in smoothly
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
      {/* Loading Skeleton */}
      {!isLoaded && !fallbackFailed && (
        <div className="absolute inset-0 z-0 animate-pulse bg-slate-200 dark:bg-slate-800" />
      )}

      {/* Fallback Placeholder Icon if both primary and fallback sources fail */}
      {fallbackFailed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600 text-xs font-mono">
          <span>Image Unavailable</span>
        </div>
      ) : (
        <Image
          src={currentSrc}
          alt={alt || 'Corporate event image'}
          fill
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