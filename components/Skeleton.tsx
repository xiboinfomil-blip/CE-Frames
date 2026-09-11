'use client';

import React, { ReactElement } from 'react';

type SkeletonVariant = 'grid-card' | 'text-line' | 'avatar' | 'thumbnail';

interface SkeletonProps {
  className?: string;
  variant?: SkeletonVariant;
  count?: number;
}

export default function Skeleton({
  className = '',
  variant = 'grid-card',
  count = 1,
}: SkeletonProps): ReactElement {
  
  // Base shimmer overlay using CSS keyframes injected safely
  // Respects prefers-reduced-motion for accessibility
  const shimmerStyle = `
    @keyframes skeleton-shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .animate-shimmer {
      animation: skeleton-shimmer 1.8s infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .animate-shimmer {
        animation: none;
        background: linear-gradient(90deg, transparent, rgba(0, 74, 135, 0.1), transparent);
      }
    }
  `;

  const ShimmerOverlay = () => (
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[#004A87]/10 to-transparent dark:via-white/10" />
  );

  const renderVariant = () => {
    switch (variant) {
      case 'grid-card':
        return (
          <div className={`flex flex-col gap-3.5 ${className}`}>
            {/* Image Aspect Box */}
            <div className="relative w-full aspect-[4/5] rounded-2xl bg-[#F5F7FA] dark:bg-[#0E1C2D] overflow-hidden border border-[#E2E8F0] dark:border-white/10">
              <ShimmerOverlay />
            </div>
            
            {/* Title Line */}
            <div className="h-5 w-3/4 rounded-lg bg-[#EAF4FB] dark:bg-[#102238] overflow-hidden relative">
              <ShimmerOverlay />
            </div>
            
            {/* Meta Tag Line */}
            <div className="h-3 w-1/3 rounded-md bg-[#E2E8F0] dark:bg-[#102238]/70 overflow-hidden relative">
              <ShimmerOverlay />
            </div>
            
            {/* Description Lines */}
            <div className="space-y-2 pt-1">
              <div className="h-3 w-full rounded-md bg-[#E2E8F0]/70 dark:bg-[#102238]/60 overflow-hidden relative">
                <ShimmerOverlay />
              </div>
              <div className="h-3 w-4/5 rounded-md bg-[#E2E8F0]/70 dark:bg-[#102238]/60 overflow-hidden relative">
                <ShimmerOverlay />
              </div>
            </div>
          </div>
        );

      case 'text-line':
        return (
          <div className={`h-4 w-full rounded-lg bg-[#EAF4FB] dark:bg-[#102238] overflow-hidden relative ${className}`}>
            <ShimmerOverlay />
          </div>
        );

      case 'avatar':
        return (
          <div className={`w-10 h-10 rounded-full bg-[#EAF4FB] dark:bg-[#102238] overflow-hidden relative shrink-0 ${className}`}>
            <ShimmerOverlay />
          </div>
        );

      case 'thumbnail':
        return (
          <div className={`w-full aspect-video rounded-xl bg-[#F5F7FA] dark:bg-[#0E1C2D] border border-[#E2E8F0] dark:border-white/10 overflow-hidden relative ${className}`}>
            <ShimmerOverlay />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{shimmerStyle}</style>
      <div 
        aria-busy="true" 
        aria-label="Loading content"
        role="status"
        className={count > 1 ? "grid gap-4" : undefined}
      >
        {Array.from({ length: count }).map((_, index) => (
          <React.Fragment key={index}>
            {renderVariant()}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
