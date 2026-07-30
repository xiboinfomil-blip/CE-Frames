'use client';

import React from 'react';

export default function Skeleton({
  className = '',
  variant = 'grid-card', // 'grid-card' | 'text-line' | 'avatar' | 'thumbnail'
}) {
  // Premium shimmer animation using CSS keyframes
  const shimmerStyle = `
    @keyframes skeleton-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .skeleton-shimmer {
      background: linear-gradient(
        90deg,
        rgba(244, 244, 245, 0) 0%,
        rgba(244, 244, 245, 0.8) 50%,
        rgba(244, 244, 245, 0) 100%
      );
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.8s ease-in-out infinite;
    }
    .dark .skeleton-shimmer {
      background: linear-gradient(
        90deg,
        rgba(39, 39, 42, 0) 0%,
        rgba(63, 63, 70, 0.6) 50%,
        rgba(39, 39, 42, 0) 100%
      );
    }
  `;

  const variants = {
    'grid-card': (
      <div className={`flex flex-col gap-4 ${className}`}>
        {/* Image Placeholder - Matches aspect-[4/5] */}
        <div className="relative w-full aspect-[4/5] rounded-2xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
          <style>{shimmerStyle}</style>
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        
        {/* Title Line */}
        <div className="h-6 w-3/4 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        
        {/* Date/Meta Line */}
        <div className="h-3 w-1/4 rounded-md bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden relative">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        
        {/* Description Lines */}
        <div className="space-y-2 mt-1">
          <div className="h-3 w-full rounded-md bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden relative">
            <div className="absolute inset-0 skeleton-shimmer" />
          </div>
          <div className="h-3 w-5/6 rounded-md bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden relative">
            <div className="absolute inset-0 skeleton-shimmer" />
          </div>
        </div>
      </div>
    ),
    
    'text-line': (
      <div className={`h-4 w-full rounded-md bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative ${className}`}>
        <style>{shimmerStyle}</style>
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>
    ),
    
    'avatar': (
      <div className={`w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative ${className}`}>
        <style>{shimmerStyle}</style>
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>
    ),
    
    'thumbnail': (
      <div className={`w-full aspect-video rounded-xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative ${className}`}>
        <style>{shimmerStyle}</style>
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>
    ),
  };

  return (
    <div 
      aria-busy="true" 
      aria-label="Loading content"
      role="status"
    >
      {variants[variant] || variants['text-line']}
    </div>
  );
}