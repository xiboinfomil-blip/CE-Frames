'use client';

import { useEffect, useRef } from 'react';

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
  root?: Element | null;
  rootSelector?: string;
}

export default function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  className = 'h-16',
  root = null,
  rootSelector,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observerRoot = root || (rootSelector ? document.querySelector(rootSelector) : null);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { root: observerRoot, rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore, root, rootSelector]);

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