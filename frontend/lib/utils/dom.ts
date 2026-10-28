/**
 * DOM utility functions for scroll and layout operations
 */

/**
 * Reset the viewport without inheriting the root element's smooth scrolling.
 */
export function scrollWindowToTopInstantly(): void {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant',
  });
}

/**
 * Reveal an element inside a horizontal rail without scrolling page ancestors.
 */
export function scrollElementHorizontallyIntoView(
  container: HTMLElement,
  element: HTMLElement
): void {
  if (container.clientWidth === 0) return;

  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  if (elementRect.width === 0) return;

  if (elementRect.left < containerRect.left) {
    container.scrollLeft += elementRect.left - containerRect.left;
    return;
  }

  if (elementRect.right > containerRect.right) {
    container.scrollLeft += elementRect.right - containerRect.right;
  }
}

/**
 * Wait for document to be fully ready (DOM + resources loaded)
 * @returns Promise that resolves when document is ready
 */
export function waitForDocumentReady(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      // Document already complete, resolve immediately
      resolve();
    } else {
      const handler = () => {
        if (document.readyState === 'complete') {
          document.removeEventListener('readystatechange', handler);
          resolve();
        }
      };
      document.addEventListener('readystatechange', handler);
    }
  });
}

/**
 * Wait for element position to stabilize (no more layout shifts)
 * @param element - DOM element to monitor
 * @param maxWaitTime - Maximum time to wait in ms (default: 2000)
 * @param checkInterval - Interval between checks in ms (default: 100)
 * @returns Promise that resolves when position is stable
 */
export function waitForStablePosition(
  element: HTMLElement,
  maxWaitTime = 500,
  checkInterval = 50
): Promise<void> {
  return new Promise((resolve) => {
    let lastTop = element.getBoundingClientRect().top;
    let stableCount = 0;
    const requiredStableChecks = 2; // Position must be stable for 2 consecutive checks
    const startTime = Date.now();

    const checkStability = () => {
      const currentTop = element.getBoundingClientRect().top;
      const elapsed = Date.now() - startTime;

      if (elapsed >= maxWaitTime) {
        resolve();
        return;
      }

      if (Math.abs(currentTop - lastTop) < 1) {
        stableCount++;
        if (stableCount >= requiredStableChecks) {
          resolve();
          return;
        }
      } else {
        stableCount = 0;
        lastTop = currentTop;
      }

      setTimeout(checkStability, checkInterval);
    };

    checkStability();
  });
}

/**
 * Check if scroll position is close to target
 * @param targetTop - Target scroll position
 * @param tolerance - Acceptable deviation in pixels (default: 50)
 * @returns Whether current scroll is close to target
 */
export function isScrollNearTarget(targetTop: number, tolerance = 50): boolean {
  const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  return Math.abs(currentScroll - targetTop) < tolerance;
}

/**
 * Extract hash from URL (handles both relative and absolute URLs)
 * @param url - URL string
 * @returns Hash without # or null if no hash/different origin
 */
export function extractSamePageHash(url: string): string | null {
  try {
    // Handle relative hash links like "#flashsale" or "/#flashsale"
    if (url.startsWith('#')) {
      return url.slice(1);
    }
    if (url.startsWith('/#')) {
      return url.slice(2);
    }

    // Handle absolute URLs
    const parsedUrl = new URL(url, window.location.origin);
    const currentOrigin = window.location.origin;

    // Check if same origin and has hash
    if (parsedUrl.origin === currentOrigin && parsedUrl.hash) {
      // Check if it's the same page (root or current path)
      const isSamePage =
        parsedUrl.pathname === '/' ||
        parsedUrl.pathname === window.location.pathname;
      if (isSamePage) {
        return parsedUrl.hash.slice(1);
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Scroll to element by hash with smooth behavior
 * @param hash - Hash to scroll to (without #), e.g., "flashsale"
 * @param elementId - Optional element ID to scroll to (defaults to hash + "-section")
 * @param headerOffset - Offset from top for fixed header (default: 120)
 */
export function scrollToHash(
  hash: string,
  elementId?: string,
  headerOffset = 120
): void {
  const targetId = elementId || `${hash}-section`;
  const element = document.getElementById(targetId);

  if (element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetTop = rect.top + scrollTop - headerOffset;

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });
  }
}

/**
 * Handle navigation link click - if it's a same-page hash link, scroll instead of navigate
 * @param url - The href URL
 * @param e - Optional mouse event to prevent default
 * @returns true if hash scroll was handled, false if should proceed with normal navigation
 */
export function handleHashLinkClick(
  url: string,
  e?: React.MouseEvent
): boolean {
  const hash = extractSamePageHash(url);
  if (hash) {
    e?.preventDefault();
    scrollToHash(hash);
    // Update URL hash without navigation
    window.history.pushState(null, '', `#${hash}`);
    return true;
  }
  return false;
}
