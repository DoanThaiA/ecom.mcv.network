import type { ShopMenuItem } from '@/types/gen/shop/shop/menus/menu';

/**
 * Menu type constants matching backend values
 */
export const MENU_TYPE = {
  CATEGORY: 'category',
  TOPIC: 'topic',
  URL: 'url',
} as const;

/**
 * Check if a URL is external (absolute)
 * @param url - URL string to check
 * @returns true if URL starts with http:// or https://
 */
export function isExternalUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Normalize a relative URL to ensure it starts with /
 * @param url - URL string to normalize
 * @returns URL with leading slash, or empty string if invalid
 */
function normalizeUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('/')) return url;
  return `/${url}`;
}

/**
 * Build localized URL from relative path or return external URL as-is
 */
function buildLocalizedUrl(url: string | undefined, locale: string): string {
  if (isExternalUrl(url)) {
    return url!;
  }
  return `/${locale}${normalizeUrl(url)}`;
}

/**
 * Generate the correct URL for a menu item based on its type
 * @param menu - The ShopMenuItem object
 * @param locale - Current locale (e.g., 'vi', 'en')
 * @returns The URL to navigate to
 */
export function getMenuUrl(menu: ShopMenuItem, locale: string): string {
  // Use backend-provided URL for category and topic types (SEO-friendly format)
  // Backend returns URLs like: /category/ao-so-mi-6955f3dfabd3fed1bcd51885
  if (menu.type === MENU_TYPE.CATEGORY && menu.url) {
    return buildLocalizedUrl(menu.url, locale);
  }

  if (menu.type === MENU_TYPE.TOPIC && menu.url) {
    return buildLocalizedUrl(menu.url, locale);
  }

  // Fallback: use url field directly (external or localized)
  return buildLocalizedUrl(menu.url, locale);
}
