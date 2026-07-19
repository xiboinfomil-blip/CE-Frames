// src/hooks/useCustomCursor.ts
'use client';

import { useEffect } from 'react';
import { useCursor } from '@/context/CursorContext';

export function useCustomCursor() {
  // Assuming your context has a way to track position (x, y)
  const { setState, setPosition } = useCursor(); 

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Auto-disable on touch devices (Laptops with touchscreens will trigger this!)
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    // Helper to consistently determine cursor type
    const getCursorType = (el: HTMLElement | null) => {
      if (!el) return 'default';
      const explicitEl = el.closest('[data-cursor]');
      if (explicitEl) return explicitEl.getAttribute('data-cursor');
      if (el.closest('a, button, [role="button"]')) return 'hover';
      if (el.closest('p, h1, h2, h3, h4, span, li')) return 'text';
      return 'default';
    };

    // 1. Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      if (setPosition) {
        setPosition({ x: e.clientX, y: e.clientY });
      }
    };

    // 2. Handle mouse over
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setState(getCursorType(target) as any);
    };

    // 3. Handle mouse out (Fixed to prevent flickering on child elements)
    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const related = e.relatedTarget as HTMLElement;

      const targetType = getCursorType(target);
      const relatedType = getCursorType(related);

      // Only reset to default if we are leaving a special element 
      // and the new element we are entering is NOT a special element
      if (targetType !== 'default' && relatedType === 'default') {
        setState('default');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [setState, setPosition]);
}