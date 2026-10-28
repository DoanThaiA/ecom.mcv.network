/**
 * SEO Constants
 * Site-wide SEO configuration values
 */

/**
 * Base URL for the website
 */
export const BASE_URL = 'https://cchat.vn';

/**
 * Site name for metadata
 */
export const SITE_NAME = 'CChat Shop';

/**
 * Default description (Vietnamese)
 */
export const DEFAULT_DESCRIPTION_VI =
  'CChat Shop - Thời trang cao cấp, phong cách hiện đại. Mua sắm online với giá tốt nhất, giao hàng nhanh chóng toàn quốc.';

/**
 * Default description (English)
 */
export const DEFAULT_DESCRIPTION_EN =
  'CChat Shop - Premium fashion, modern style. Shop online with the best prices, fast delivery nationwide.';

/**
 * Default OG image
 */
export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * Twitter configuration
 */
export const TWITTER_CONFIG = {
  card: 'summary_large_image' as const,
  site: '@cchat_shop',
};

/**
 * OpenGraph locale mapping
 */
export const OG_LOCALES = {
  vi: 'vi_VN',
  en: 'en_US',
} as const;

/**
 * Alternate locale mapping
 */
export const ALTERNATE_LOCALES = {
  vi: 'vi-VN',
  en: 'en-US',
} as const;

/**
 * Default brand name for products
 */
export const DEFAULT_BRAND = 'CChat';

/**
 * Currency code for prices
 */
export const CURRENCY_CODE = 'VND';

/**
 * Social media profiles
 */
export const SOCIAL_PROFILES = {
  facebook: 'https://www.facebook.com/cchat.shop',
} as const;
