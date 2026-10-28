'use client';

import { useEffect, useState } from 'react';

interface UseDelayedLoadOptions {
  /**
   * Delay in milliseconds before triggering load.
   * Default: 1000 (1 second)
   */
  delay?: number;
}

/**
 * Simple hook that returns true after a delay.
 * Used to defer loading non-critical content until after initial paint is stable.
 *
 * @example
 * const shouldLoad = useDelayedLoad({ delay: 1000 });
 *
 * useEffect(() => {
 *   if (shouldLoad) {
 *     dispatch(fetchData());
 *   }
 * }, [shouldLoad]);
 */
export function useDelayedLoad(options: UseDelayedLoadOptions = {}): boolean {
  const { delay = 1000 } = options;
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof requestIdleCallback !== 'undefined') {
      const idleId = requestIdleCallback(
        () => setShouldLoad(true),
        { timeout: delay }
      );
      return () => cancelIdleCallback(idleId);
    } else {
      const timeoutId = setTimeout(() => setShouldLoad(true), delay);
      return () => clearTimeout(timeoutId);
    }
  }, [delay]);

  return shouldLoad;
}
