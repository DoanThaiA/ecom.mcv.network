/**
 * Image preloading utilities for optimizing image loading performance
 */

/**
 * Preload an image by creating an Image object and optionally injecting a preload link
 * This ensures the image is fetched and cached before it's displayed
 *
 * @param url - The image URL to preload
 * @param highPriority - If true, also injects a <link rel="preload"> for higher priority
 */
export function preloadImage(url: string, highPriority = false): void {
  // Skip if running on server
  if (typeof window === 'undefined') return;

  // Skip if URL is empty or invalid
  if (!url || url.trim() === '') return;

  try {
    // Method 1: Use Image() constructor for immediate preload
    // This is the most reliable cross-browser method
    const img = new Image();
    img.src = url;

    // Method 2: Inject preload link for higher priority (optional)
    // This gives the browser a hint to prioritize this resource
    if (highPriority) {
      // Check if link already exists to avoid duplicates
      const existingLink = document.querySelector(
        `link[rel="preload"][href="${url}"]`
      );

      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);

        // Clean up after image loads to avoid memory leaks
        img.onload = () => {
          setTimeout(() => {
            if (link.parentNode) {
              document.head.removeChild(link);
            }
          }, 1000);
        };
      }
    }
  } catch {
    // Silently fail - preloading is an optimization, not critical
    // Error is intentionally ignored as preloading is non-critical
  }
}

/**
 * Preload multiple images
 *
 * @param urls - Array of image URLs to preload
 * @param highPriority - If true, uses high priority preloading
 */
export function preloadImages(urls: string[], highPriority = false): void {
  urls.forEach((url) => preloadImage(url, highPriority));
}

/**
 * Preload an image with idle callback for low-priority background loading
 * Uses requestIdleCallback when available, falls back to setTimeout
 *
 * @param url - The image URL to preload
 */
export function preloadImageIdle(url: string): void {
  if (typeof window === 'undefined') return;

  const preload = () => preloadImage(url, false);

  // Use requestIdleCallback for better performance (Chrome, Edge)
  // Falls back to setTimeout for Safari and older browsers
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preload);
  } else {
    setTimeout(preload, 1);
  }
}

/**
 * Preload multiple images with idle callback
 *
 * @param urls - Array of image URLs to preload
 */
export function preloadImagesIdle(urls: string[]): void {
  urls.forEach((url) => preloadImageIdle(url));
}
