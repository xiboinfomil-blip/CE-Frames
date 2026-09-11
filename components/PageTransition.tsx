'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

const TRANSITION_DURATION = 240;

function isNavigableLink(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;

  const link = target.closest('a');
  if (!link || link.target === '_blank' || link.hasAttribute('download')) {
    return false;
  }

  if (link.getAttribute('aria-disabled') === 'true') return false;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false;
  }

  const url = new URL(link.href, window.location.href);
  return url.origin === window.location.origin && url.href !== window.location.href;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const routeKey = pathname;
  const previousRouteKey = useRef(routeKey);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!isNavigableLink(event.target)) return;

      setIsLeaving(true);
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, []);

  useEffect(() => {
    if (previousRouteKey.current === routeKey) return;

    previousRouteKey.current = routeKey;
    setIsLeaving(true);

    const frame = requestAnimationFrame(() => {
      setIsLeaving(false);
    });

    return () => cancelAnimationFrame(frame);
  }, [routeKey]);

  useEffect(() => {
    if (!isLeaving) return;

    const timeout = window.setTimeout(() => {
      setIsLeaving(false);
    }, TRANSITION_DURATION + 80);

    return () => window.clearTimeout(timeout);
  }, [isLeaving]);

  return (
    <div
      className="relative min-h-full transition-opacity ease-out motion-reduce:transition-none"
      style={{
        opacity: isLeaving ? 0 : 1,
        transitionDuration: `${TRANSITION_DURATION}ms`,
      }}
      aria-busy={isLeaving}
    >
      {children}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 z-100 h-0.5 origin-left bg-[#FF8201] transition-transform ease-out motion-reduce:transition-none ${isLeaving ? 'scale-x-100' : 'scale-x-0'}`}
        style={{ transitionDuration: `${TRANSITION_DURATION}ms` }}
      />
    </div>
  );
}
