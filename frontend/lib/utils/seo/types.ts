/**
 * SEO Types
 * TypeScript interfaces for SEO metadata configuration
 */

import type { AppLocale } from '@/lib/locale';
import { Product } from '@/types/gen/shop/shared/products/product';

/**
 * Localized text with Vietnamese and English versions
 */
export interface LocalizedSeoText {
  vi: string;
  en: string;
}

/**
 * Configuration for static page SEO
 */
export interface StaticPageSeoConfig {
  title: LocalizedSeoText;
  description: LocalizedSeoText;
  keywords?: LocalizedSeoText;
  noIndex?: boolean;
}

/**
 * Data required for product SEO metadata
 */
export interface ProductSeoData {
  product: Product;
  locale: AppLocale;
}

/**
 * Data required for category SEO metadata
 */
export interface CategorySeoData {
  id: string;
  name: string;
  description?: string;
  image?: string;
  slug?: string;
  locale: AppLocale;
}

/**
 * Data required for topic SEO metadata
 */
export interface TopicSeoData {
  id: string;
  name: string;
  description?: string;
  image?: string;
  slug: string;
  locale: AppLocale;
}

/**
 * Data required for news SEO metadata
 */
export interface NewsSeoData {
  id: string;
  title: string;
  excerpt?: string;
  thumbnail?: string;
  publishedAt?: string;
  locale: AppLocale;
}

/**
 * Static page key type
 */
export type StaticPageKey =
  | 'home'
  | 'about'
  | 'categories'
  | 'faq'
  | 'locations'
  | 'guide'
  | 'news'
  | 'policy/terms'
  | 'policy/privacy'
  | 'policy/return'
  | 'policy/delivery'
  | 'policy/vip'
  | 'flashSale';
