'use client';

import { useEffect, useRef } from 'react';

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  root?: Element | null;
  rootSelector?: string;
}

export default function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  error = null,
  onRetry,
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
        if (entries[0]?.isIntersecting && !isLoading && !error) {
          onLoadMore();
        }
      },
      { root: observerRoot, rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, isLoading, onLoadMore, root, rootSelector]);

  if (!hasMore) {
    return (
      <div className={`${className} flex items-center justify-center text-xs text-zinc-400`} aria-live="polite">
        Tous les éléments sont chargés
      </div>
    );
  }

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
      {!isLoading && error && (
        <button type="button" onClick={onRetry} className="text-sm text-[#004A87] underline underline-offset-4">
          Réessayer
        </button>
      )}
    </div>
  );
}