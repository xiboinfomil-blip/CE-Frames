'use client';

import { useEffect, useRef } from 'react';
import styles from './cursor.module.css';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Check for touch devices or reduced motion preference immediately
    if (typeof window === 'undefined') return;
    
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) return;

    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        // 2. Directly update transform. No lerp, no RAF loop.
        // CSS transition will handle the smoothness/lag.
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    // 3. Use passive listener for better scroll performance
    window.addEventListener('mousemove', move, { passive: true });

    return () => {
      window.removeEventListener('mousemove', move);
    };
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className={styles.cursor}
      aria-hidden="true" 
    />
  );
}