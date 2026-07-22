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
  ...props // This now correctly includes 'priority' from the parent
}: CustomImageProps) => {
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const imageSrc = imgError ? (fallbackSrc || src) : src;

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!imgError) {
      setImgError(true);
    }
    onError?.(e); // Pass the event up to the parent
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Image
        src={imageSrc}
        alt={alt || 'Image'} // Fallback alt to satisfy Next.js requirements
        // REMOVED: loading="lazy" (Next.js handles this automatically based on the 'priority' prop)
        // REMOVED: decoding="async" (Next.js handles this optimally by default)
        fill
        className={`object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105 will-change-transform ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props} // 'priority' is passed through here
      />
    </div>
  );
};

export default CustomImage;