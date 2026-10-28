'use client';

import { useEffect, useState } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Breakpoint thresholds matching Tailwind CSS defaults:
 * - mobile: < 768px
 * - tablet: >= 768px and < 1024px
 * - desktop: >= 1024px
 */
const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
} as const;

/**
 * Get current breakpoint based on window width
 */
function getBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'mobile';
  const width = window.innerWidth;
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

/**
 * SSR-safe hook to detect current breakpoint.
 *
 * Unlike the previous implementation that returned `null` during SSR,
 * this hook always returns a valid breakpoint value:
 * - Returns 'mobile' on SSR and during initial hydration (mobile-first)
 * - Updates to actual breakpoint after hydration
 *
 * This prevents hydration mismatch issues where SSR renders `null`
 * but client renders 'desktop', causing layout shifts and double renders.
 *
 * @example
 * const breakpoint = useBreakpoint();
 * const mediaSrc = media[breakpoint]; // Always valid, no null checks needed
 *
 * @returns Current breakpoint: 'mobile' | 'tablet' | 'desktop'
 */
export function useBreakpoint(): Breakpoint {
  // Start with 'mobile' for SSR (mobile-first approach)
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('mobile');

  useEffect(() => {
    // Set actual breakpoint after hydration
    setBreakpoint(getBreakpoint());

    const handleResize = () => setBreakpoint(getBreakpoint());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

/**
 * Hook to detect if screen is desktop (lg breakpoint = 1024px)
 * SSR-safe: returns false on server, true after hydration if screen >= 1024px
 *
 * @example
 * const isDesktop = useIsDesktop();
 * const videoSrc = isDesktop ? desktopVideo : mobileVideo;
 */
export function useIsDesktop(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'desktop';
}

/**
 * Hook to detect if screen is mobile (< 768px)
 * SSR-safe: returns true on server (mobile-first), updates after hydration
 *
 * @example
 * const isMobile = useIsMobile();
 */
export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'mobile';
}
