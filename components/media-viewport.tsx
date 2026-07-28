'use client';

import { useState, useMemo, useEffect } from 'react';
import { MEDIA_TYPES } from '@/db/schema';
import CustomImage from './custom-image'; // Adjust import path as needed
import CustomVideo from './custom-video'; // Adjust import path as needed

interface MediaViewportProps {
  mediaType: typeof MEDIA_TYPES[number];
  fullResUrl: string;
  thumbnailUrl: string;
  caption?: string | null;
  originalFilename?: string | null;
  className?: string;
  priority?: boolean;
  sizes?: string; // Add sizes prop to allow customization
  onClick?: () => void;
}

const MediaViewport = ({
  mediaType,
  fullResUrl,
  thumbnailUrl,
  caption,
  originalFilename,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw', // Default responsive sizes
  onClick
}: MediaViewportProps) => {
  const [hasError, setHasError] = useState(false);

  const ariaLabel = useMemo(() => 
    `Media preview: ${caption || originalFilename || 'Untitled media'}`, 
    [caption, originalFilename]
  );

  const currentSrc = hasError ? thumbnailUrl : fullResUrl;

  // Reset error state if the source URL changes (e.g., navigating between items)
  useEffect(() => {
    setHasError(false);
  }, [currentSrc]);

  return (
    <figure 
      role="figure"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`group relative w-full h-full overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200/60 transition-all duration-500 hover:shadow-xl hover:shadow-zinc-200/50 hover:ring-zinc-300 ${className}`}
    >
      {mediaType === 'video' ? (
        <CustomVideo
          src={currentSrc}
          poster={thumbnailUrl || undefined}
          hoverPlay={true}
          onError={() => setHasError(true)}
        />
      ) : (
        <CustomImage
          src={currentSrc}
          fallbackSrc={thumbnailUrl}
          alt={caption || originalFilename || 'Media asset'}
          priority={priority}
          sizes={sizes} // Pass the sizes prop to CustomImage
          onError={() => setHasError(true)}
        />
      )}
    </figure>
  );
};

export default MediaViewport;