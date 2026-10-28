import { useEffect, useRef } from 'react';
import {
  waitForDocumentReady,
  waitForStablePosition,
  isScrollNearTarget,
} from '@/lib/utils/dom';

/**
 * Detect Safari browser (includes iOS Safari)
 */
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(ua);
}

interface ScrollToHashOptions {
  /** Initial delay before attempting scroll (ms) */
  initialDelay?: number;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Interval between retries (ms) */
  retryInterval?: number;
  /** Offset from top for fixed header (px) */
  headerOffset?: number;
}

const defaultOptions: Required<ScrollToHashOptions> = {
  initialDelay: 50,
  maxRetries: 5,
  retryInterval: 200,
  headerOffset: 120,
};

/**
 * Hook để scroll đến element khi URL có hash match
 * Bao gồm retry mechanism và position verification
 * @param targetHash - hash cần kiểm tra (không bao gồm #), ví dụ: "flashsale"
 * @param elementId - id của element cần scroll đến (khác với hash để tránh browser auto-scroll)
 * @param options - các tùy chọn cấu hình
 */
export function useScrollToHash(
  targetHash: string,
  elementId: string,
  options: ScrollToHashOptions = {}
) {
  const hasScrolled = useRef(false);
  const retryCount = useRef(0);

  const {
    initialDelay,
    maxRetries,
    retryInterval,
    headerOffset,
  } = { ...defaultOptions, ...options };

  useEffect(() => {
    if (hasScrolled.current) return;

    const hash = window.location.hash.replace('#', '');
    if (hash !== targetHash) return;

    const attemptScroll = async (): Promise<boolean> => {
      const element = document.getElementById(elementId);
      if (!element) return false;

      // Wait for element position to stabilize
      await waitForStablePosition(element, 300, 50);

      // Calculate target scroll position
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetTop = rect.top + scrollTop - headerOffset;

      // Perform scroll
      if (isSafari()) {
        // Safari/iOS: use window.scrollTo for more reliable smooth scroll
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth',
        });
      } else {
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth',
        });
      }

      // Wait for scroll animation to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify scroll position
      return isScrollNearTarget(targetTop, 100);
    };

    const performScrollWithRetry = async () => {
      // Wait for document to be ready
      await waitForDocumentReady();

      // Initial delay for component hydration
      await new Promise((resolve) => setTimeout(resolve, initialDelay));

      while (retryCount.current < maxRetries) {
        const success = await attemptScroll();

        if (success) {
          hasScrolled.current = true;
          // Only remove hash after successful scroll
          history.replaceState(
            null,
            '',
            window.location.pathname + window.location.search
          );
          return;
        }

        retryCount.current++;

        if (retryCount.current < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
        }
      }

      // Even if not perfectly positioned, mark as scrolled to prevent infinite retries
      hasScrolled.current = true;
      history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    };

    performScrollWithRetry();
  }, [targetHash, elementId, initialDelay, maxRetries, retryInterval, headerOffset]);
}
