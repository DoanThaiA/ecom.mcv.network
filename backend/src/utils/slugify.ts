import slugify from 'slugify';

/**
 * Generate a URL-friendly slug from a string
 * Handles Vietnamese characters and other diacritics
 *
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 *
 * @example
 * generateSlug('Áo Sơ Mi') // 'ao-so-mi'
 * generateSlug('Featured Products') // 'featured-products'
 */
export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'vi',
  });
}
