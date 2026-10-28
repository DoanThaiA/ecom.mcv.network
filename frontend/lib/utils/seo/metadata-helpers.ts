/**
 * SEO Metadata Helper Functions
 * Functions to generate Next.js Metadata objects
 */
import isEmpty from 'lodash/isEmpty';

import type { AppLocale } from '@/lib/locale';
import get from 'lodash/get';
import type { Metadata } from 'next';
import {
  BASE_URL,
  DEFAULT_DESCRIPTION_EN,
  DEFAULT_DESCRIPTION_VI,
  DEFAULT_OG_IMAGE,
  OG_LOCALES,
  SITE_NAME,
  TWITTER_CONFIG,
} from './constants';
import { STATIC_PAGE_METADATA } from './static-metadata';
import type {
  CategorySeoData,
  NewsSeoData,
  ProductSeoData,
  StaticPageKey,
  TopicSeoData,
} from './types';

/**
 * Get localized text based on locale
 */
function getLocalizedText(
  text: { vi: string; en: string },
  locale: AppLocale,
): string {
  return locale === 'en' ? text.en : text.vi;
}

/**
 * Generate canonical URL for a path
 */
function getCanonicalUrl(locale: AppLocale, path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}/${locale}${cleanPath}`;
}

/**
 * Generate alternate language URLs
 */
function getAlternateLanguages(path: string = ''): Record<string, string> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return {
    'vi-VN': `${BASE_URL}/vi${cleanPath}`,
    'en-US': `${BASE_URL}/en${cleanPath}`,
    'x-default': `${BASE_URL}/vi${cleanPath}`,
  };
}

/**
 * Strip HTML tags from a string and return plain text
 * @param html - HTML string to strip
 * @param maxLength - Maximum length of the returned string (default: 155)
 * @returns Plain text without HTML tags
 */
function stripHtmlTags(html: string, maxLength: number = 155): string {
  let text = html;

  // Step 2: Remove ALL HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Step 3: Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Step 4: Remove extra whitespace (but preserve newlines)
  text = text.replace(/[ \t]+/g, ' ').trim();

  // Step 5: Truncate to maxLength if needed
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim() + '...';
  }

  return text;
}

/**
 * Generate metadata for static pages
 */
export function generateStaticMetadata(
  pageKey: StaticPageKey,
  locale: AppLocale,
): Metadata {
  const config = STATIC_PAGE_METADATA[pageKey];

  if (!config) {
    return {
      title: SITE_NAME,
      description:
        locale === 'en' ? DEFAULT_DESCRIPTION_EN : DEFAULT_DESCRIPTION_VI,
    };
  }

  const title = getLocalizedText(config.title, locale);
  const description = getLocalizedText(config.description, locale);
  const path = pageKey === 'home' ? '' : `/${pageKey}`;
  const canonicalUrl = getCanonicalUrl(locale, path);

  return {
    title,
    description,
    robots: config.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguages(path),
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      alternateLocale: locale === 'vi' ? OG_LOCALES.en : OG_LOCALES.vi,
      type: 'website',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: TWITTER_CONFIG.card,
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

/**
 * Generate metadata for product detail page
 */
export function generateProductMetadata(data: ProductSeoData): Metadata {
  const product = get(data, 'product', {});
  const id = get(product, 'id', '');
  const name = get(product, 'name', '');
  const description = get(product, 'description', '');
  const descriptionLocalization = get(product, 'descriptionLocalization');
  const images = get(product, 'images');
  const slug = get(product, 'slug', '');
  const locale = get(data, 'locale', 'vi') as AppLocale;

  const title = `${name} | ${SITE_NAME}`;
  const metaDescription = isEmpty(descriptionLocalization)
    ? locale === 'en'
      ? `Buy ${name} at CChat Shop with the best price. Fast delivery nationwide.`
      : `Mua ${name} tại CChat Shop với giá tốt nhất. Giao hàng nhanh toàn quốc.`
    : stripHtmlTags(
        get(descriptionLocalization, locale) ?? description ?? '',
        155,
      );

  const path = `/products/${slug ? `${slug}-${id}` : id}`;
  const canonicalUrl = getCanonicalUrl(locale, path);
  const ogImage = get(images, 'avatar', DEFAULT_OG_IMAGE);

  return {
    title,
    description: metaDescription,
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguages(path),
    },
    openGraph: {
      title,
      description: metaDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      alternateLocale: locale === 'vi' ? OG_LOCALES.en : OG_LOCALES.vi,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    },
    twitter: {
      card: TWITTER_CONFIG.card,
      title,
      description: metaDescription,
      images: [ogImage],
    },
  };
}

/**
 * Generate metadata for category detail page
 */
export function generateCategoryMetadata(data: CategorySeoData): Metadata {
  const { id, name, description, image, slug, locale } = data;

  const title =
    locale === 'en'
      ? `${name} - Product Category | ${SITE_NAME}`
      : `${name} - Danh mục sản phẩm | ${SITE_NAME}`;

  const metaDescription = description
    ? stripHtmlTags(description, 160)
    : locale === 'en'
      ? `Explore ${name} collection at CChat Shop. High quality products with the best prices.`
      : `Khám phá bộ sưu tập ${name} tại CChat Shop. Sản phẩm chất lượng cao với giá tốt nhất.`;

  // Use SEO-friendly format: /category/slug-id or /category/id
  const path = `/category/${slug ? `${slug}-${id}` : id}`;
  const canonicalUrl = getCanonicalUrl(locale, path);
  const ogImage = image || DEFAULT_OG_IMAGE;

  return {
    title,
    description: metaDescription,
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguages(path),
    },
    openGraph: {
      title,
      description: metaDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      alternateLocale: locale === 'vi' ? OG_LOCALES.en : OG_LOCALES.vi,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    },
    twitter: {
      card: TWITTER_CONFIG.card,
      title,
      description: metaDescription,
      images: [ogImage],
    },
  };
}

/**
 * Generate metadata for topic detail page
 */
export function generateTopicMetadata(data: TopicSeoData): Metadata {
  const { id, name, description, image, slug, locale } = data;

  const title =
    locale === 'en'
      ? `${name} - Collection | ${SITE_NAME}`
      : `${name} - Bộ sưu tập | ${SITE_NAME}`;

  const metaDescription = description
    ? stripHtmlTags(description, 160)
    : locale === 'en'
      ? `Discover ${name} collection at CChat Shop. Curated fashion items just for you.`
      : `Khám phá bộ sưu tập ${name} tại CChat Shop. Các sản phẩm thời trang được chọn lọc dành cho bạn.`;

  // Use SEO-friendly format: /topic/slug-id
  const path = `/topic/${slug}-${id}`;
  const canonicalUrl = getCanonicalUrl(locale, path);
  const ogImage = image || DEFAULT_OG_IMAGE;

  return {
    title,
    description: metaDescription,
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguages(path),
    },
    openGraph: {
      title,
      description: metaDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      alternateLocale: locale === 'vi' ? OG_LOCALES.en : OG_LOCALES.vi,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    },
    twitter: {
      card: TWITTER_CONFIG.card,
      title,
      description: metaDescription,
      images: [ogImage],
    },
  };
}

/**
 * Generate metadata for news detail page
 */
export function generateNewsMetadata(data: NewsSeoData): Metadata {
  const { id, title: newsTitle, excerpt, thumbnail, locale } = data;

  const title = `${newsTitle} | ${SITE_NAME}`;
  const metaDescription = excerpt
    ? stripHtmlTags(excerpt, 160)
    : locale === 'en'
      ? `Read the latest fashion news and updates from CChat Shop.`
      : `Đọc tin tức thời trang mới nhất từ CChat Shop.`;

  const path = `/news/${id}`;
  const canonicalUrl = getCanonicalUrl(locale, path);
  const ogImage = thumbnail || DEFAULT_OG_IMAGE;

  return {
    title,
    description: metaDescription,
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguages(path),
    },
    openGraph: {
      title,
      description: metaDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      alternateLocale: locale === 'vi' ? OG_LOCALES.en : OG_LOCALES.vi,
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: newsTitle,
        },
      ],
    },
    twitter: {
      card: TWITTER_CONFIG.card,
      title,
      description: metaDescription,
      images: [ogImage],
    },
  };
}
