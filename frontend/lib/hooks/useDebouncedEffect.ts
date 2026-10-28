'use client';

import { useEffect, useRef, type DependencyList } from 'react';

interface UseDebouncedEffectOptions {
  /** Delay in milliseconds before executing the callback */
  delay: number;
  /** Function that returns true if the effect should be skipped */
  shouldSkip?: () => boolean;
  /** Whether the effect is enabled */
  enabled?: boolean;
}

/**
 * A hook that debounces an async callback and handles stale closure prevention.
 * Automatically clears the timer on dependency changes and unmount.
 *
 * @param callback - The async function to execute after debounce
 * @param deps - Dependencies that trigger the debounce
 * @param options - Configuration options for delay, skip condition, and enabled state
 */
export function useDebouncedEffect(
  callback: () => Promise<void> | void,
  deps: DependencyList,
  options: UseDebouncedEffectOptions
): void {
  const { delay, shouldSkip, enabled = true } = options;

  // Keep callback ref updated to prevent stale closures
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Keep shouldSkip ref updated
  const shouldSkipRef = useRef(shouldSkip);
  useEffect(() => {
    shouldSkipRef.current = shouldSkip;
  }, [shouldSkip]);

  // Serialize deps to trigger effect on changes
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    if (!enabled) return;

    // Check skip condition at effect start
    if (shouldSkipRef.current?.()) return;

    const timer = setTimeout(() => {
      // Re-check skip condition at execution time
      if (!shouldSkipRef.current?.()) {
        callbackRef.current();
      }
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [depsKey, delay, enabled]);
}
