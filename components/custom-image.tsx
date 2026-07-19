'use client';

import Image from 'next/image';
import { useState } from 'react';

interface CustomImageProps extends Omit<React.ComponentProps<typeof Image>, 'src'> {
  src: string;
  fallbackSrc?: string;
}

const CustomImage = ({ 
  src, 
  fallbackSrc, 
  alt, 
  className = '', 
  onLoad,
  onError,
  ...props 
}: CustomImageProps) => {
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const imageSrc = imgError ? (fallbackSrc || src) : src;

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = () => {
    if (!imgError) {
      setImgError(true);
    }
    onError?.();
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
        <Image
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        fill
        className={`object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105 will-change-transform ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
        />
    </div>
  );
};

export default CustomImage;