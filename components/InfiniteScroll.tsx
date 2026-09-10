'use client';

import { useEffect, useRef } from 'react';

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
}

export default function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  className = 'h-16',
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div
      ref={sentinelRef}
      className={`${className} flex items-center justify-center`}
      aria-live="polite"
      aria-busy={isLoading}
    >
      {isLoading && (
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-700" />
      )}
    </div>
  );
}