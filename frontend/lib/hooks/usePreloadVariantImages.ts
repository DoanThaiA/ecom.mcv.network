import { useEffect, useRef, useCallback } from 'react';
import type { Product } from '@/types/gen/shared/shared/products/product';
import { findBestVariantWithColor } from '@/lib/helpers/variantHelper';
import { preloadImageIdle, preloadImage } from '@/lib/utils/imagePreload';

/**
 * Hook to preload product variant images for faster color switching
 *
 * Strategy:
 * 1. Background preload: Preloads all in-stock color variants after page load (idle priority)
 * 2. Hover preload: Preloads specific color on hover (immediate priority)
 *
 * @param colorOptions - Array of available color names
 * @param variants - Array of product variants
 * @param productCode - Parent product code
 * @returns Object with preloadColor function for manual preloading
 */
export function usePreloadVariantImages(
  colorOptions: string[],
  variants: Product[],
  productCode: string
) {
  // Track which colors have been preloaded to avoid duplicates
  const preloadedRef = useRef<Set<string>>(new Set());

  // Background preload all in-stock color variants on mount
  useEffect(() => {
    // Skip if no colors or variants
    if ((colorOptions?.length ?? 0) === 0 || (variants?.length ?? 0) === 0) {
      return;
    }

    // Use idle callback for low-priority background loading
    const preloadAllColors = () => {
      colorOptions.forEach((color) => {
        // Skip if already preloaded
        if (preloadedRef.current.has(color)) return;

        // Find the best variant for this color
        const variant = findBestVariantWithColor(
          variants,
          color,
          productCode
        );

        // Preload the first image (avatar) if available
        if (variant?.images?.avatar) {
          preloadImageIdle(variant.images.avatar);
          preloadedRef.current.add(color);
        }
      });
    };

    // Use requestIdleCallback for better performance (Chrome, Edge)
    // Falls back to setTimeout for Safari and older browsers
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadAllColors);
    } else {
      setTimeout(preloadAllColors, 100);
    }
  }, [colorOptions, variants, productCode]);

  /**
   * Manually preload a specific color's images
   * Used for hover preloading for immediate loading
   *
   * @param color - Color name to preload
   */
  const preloadColor = useCallback(
    (color: string) => {
      // Skip if already preloaded
      if (preloadedRef.current.has(color)) return;

      // Find the best variant for this color
      const variant = findBestVariantWithColor(
        variants,
        color,
        productCode
      );

      // Preload the first image (avatar) if available
      // Use immediate preload (not idle) for hover interactions
      if (variant?.images?.avatar) {
        preloadImage(variant.images.avatar, false);
        preloadedRef.current.add(color);
      }
    },
    [variants, productCode]
  );

  return { preloadColor };
}
