export const DEFAULT_PRODUCT_IMAGE = '/assets/images/logo.webp';

/**
 * Responsive image sizes for different component contexts
 * Used with Next.js Image component's sizes prop
 */
export const IMAGE_SIZES = {
  /** Product cards in grid (2 cols mobile, 3 tablet, 4 desktop) */
  productCard: '(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 20vw',
  /** Product detail main image */
  productDetail: '(max-width: 768px) 100vw, 50vw',
  /** Full-width hero banners */
  hero: '100vw',
  /** Small thumbnails (cart, variants) */
  thumbnail: '64px',
  /** Category cards in grid */
  categoryCard: '(max-width: 640px) 50vw, 33vw',
  /** Advertisement banners (full mobile, half desktop) */
  adBanner: '(max-width: 640px) 100vw, 50vw',
  /** News cards */
  newsCard: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  /** Logo and small icons */
  logo: '150px',
} as const;

export type ImageSizeKey = keyof typeof IMAGE_SIZES;
