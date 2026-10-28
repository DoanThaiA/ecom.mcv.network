'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  /**
   * The root element for intersection. Defaults to the browser viewport.
   */
  root?: Element | null;
  /**
   * Margin around the root. Can be used to grow or shrink the root element's
   * bounding box before computing intersections. Default: '0px'
   */
  rootMargin?: string;
  /**
   * A threshold indicating the percentage of the target's visibility the
   * observer's callback should be executed. Default: 0
   */
  threshold?: number | number[];
  /**
   * If true, the observer will disconnect after the first intersection.
   * Useful for lazy loading that only needs to trigger once.
   */
  triggerOnce?: boolean;
}

interface UseIntersectionObserverReturn<T extends Element> {
  ref: RefObject<T | null>;
  isIntersecting: boolean;
}

/**
 * Hook that tracks whether an element is in the viewport using IntersectionObserver.
 * Useful for lazy loading, triggering animations, or deferring expensive operations.
 *
 * @example
 * const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
 *   rootMargin: '200px',
 *   triggerOnce: true,
 * });
 *
 * useEffect(() => {
 *   if (isIntersecting) {
 *     // Load data, play video, etc.
 *   }
 * }, [isIntersecting]);
 *
 * return <div ref={ref}>Content</div>;
 */
export function useIntersectionObserver<T extends Element = Element>(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn<T> {
  const { root = null, rootMargin = '0px', threshold = 0, triggerOnce = false } = options;

  const ref = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If triggerOnce is true and we've already triggered, don't observe again
    if (triggerOnce && hasTriggeredRef.current) return;

    // Check for IntersectionObserver support
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: assume element is visible if IntersectionObserver is not supported
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          const intersecting = entry.isIntersecting;
          setIsIntersecting(intersecting);

          // If triggerOnce and now intersecting, disconnect observer
          if (triggerOnce && intersecting) {
            hasTriggeredRef.current = true;
            observer.disconnect();
          }
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, triggerOnce]);

  return { ref, isIntersecting };
}
