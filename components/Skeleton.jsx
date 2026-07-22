// components/Skeleton.jsx
import React from 'react';

export default function Skeleton({
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-md',
  className = '',
  animate = true,
  variant = 'shimmer', // 'shimmer' | 'pulse'
}) {
  const baseClasses = 
    'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';
  
  const animationClasses = animate
    ? variant === 'pulse'
      ? 'animate-pulse'
      : 'bg-[length:200%_100%] animate-shimmer'
    : '';

  return (
    <div
      className={`${width} ${height} ${rounded} ${baseClasses} ${animationClasses} ${className}`}
      aria-busy="true"
      aria-label="Loading content"
    />
  );
}