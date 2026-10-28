import { Product } from './product';

/**
 * Get the product avatar image with parent fallback
 * For variants without images, falls back to parent's avatar
 * @param product - Product entity
 * @returns Avatar image URL or null
 */
export function getProductImage(
  product: Product | null | undefined,
): string | null {
  if (!product) return null;
  return product.images?.avatar ?? product.parent?.images?.avatar ?? null;
}
