/**
 * Schema.org JSON-LD Builder Functions
 * Functions to build structured data from product and site data
 */
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import type { AppLocale } from '@/lib/locale';
import type { Product } from '@/types/gen/shop/shared/products/product';
import {
  BASE_URL,
  CURRENCY_CODE,
  DEFAULT_BRAND,
  SITE_NAME,
  SOCIAL_PROFILES,
} from './constants';
import type {
  SchemaOrgBreadcrumbList,
  SchemaOrgOrganization,
  SchemaOrgProduct,
  SchemaOrgWebSite,
} from './schema-types';

/**
 * Get localized product name
 */
function getLocalizedName(product: Product, locale: AppLocale): string {
  const localized = get(product, `nameLocalization.${locale}`);
  return localized || product.name || '';
}

/**
 * Get localized product description (stripped of HTML)
 */
function getLocalizedDescription(product: Product, locale: AppLocale): string {
  const localized = get(product, `descriptionLocalization.${locale}`);
  const description = localized || product.description || '';
  // Strip HTML tags for structured data
  return description.replace(/<[^>]*>/g, '').trim();
}

/**
 * Get the effective price for a product
 * Priority: flashSale > productDiscount > retail
 */
function getEffectivePrice(product: Product): number {
  const flashSalePrice = get(product, 'flashSale.flashSalePrice');
  if (flashSalePrice && flashSalePrice >= 0) {
    return flashSalePrice;
  }

  const discountPrice = get(product, 'productDiscount.effectivePrice');
  if (discountPrice && discountPrice > 0) {
    return discountPrice;
  }

  return get(product, 'prices.retail', 0);
}

/**
 * Get product availability based on inventory
 */
function getAvailability(product: Product): string {
  const available = get(product, 'inventory.available', 0);
  return available > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
}

/**
 * Get price valid until date (for promotional prices)
 */
function getPriceValidUntil(product: Product): string | undefined {
  const flashSaleEndTime = get(product, 'flashSale.endTime');
  if (flashSaleEndTime) {
    return new Date(flashSaleEndTime).toISOString().split('T')[0];
  }

  const discountEndTime = get(product, 'productDiscount.endTime');
  if (discountEndTime) {
    return new Date(discountEndTime).toISOString().split('T')[0];
  }

  return undefined;
}

/**
 * Build product URL
 */
function buildProductUrl(
  product: Product,
  locale: AppLocale,
): string {
  const slug = product.slug;
  const id = product.id;
  const path = slug ? `${slug}-${id}` : id;
  return `${BASE_URL}/${locale}/products/${path}`;
}

/**
 * Collect product images for JSON-LD schema
 * Priority: 1 image from parent, if none then up to 2 from variants
 */
function collectProductImages(product: Product): string[] {
  // Try parent product avatar first
  const avatar = get(product, 'images.avatar');
  if (avatar) {
    return [avatar];
  }

  // Try parent's other images
  const others = get(product, 'images.others', []) as string[];
  if (others.length > 0 && others[0]) {
    return [others[0]];
  }

  // Fallback: get up to 2 images from variants
  const variants = product.variants || [];
  const variantImages: string[] = [];

  for (const variant of variants) {
    if (variantImages.length >= 2) break;

    const variantAvatar = get(variant, 'images.avatar');
    if (variantAvatar && !variantImages.includes(variantAvatar)) {
      variantImages.push(variantAvatar);
    }

    if (variantImages.length >= 2) break;

    const variantOthers = get(variant, 'images.others', []) as string[];
    for (const img of variantOthers) {
      if (img && !variantImages.includes(img)) {
        variantImages.push(img);
        if (variantImages.length >= 2) break;
      }
    }
  }

  return variantImages;
}

/**
 * Build Schema.org Product JSON-LD
 */
export function buildProductSchema(
  product: Product,
  locale: AppLocale,
): SchemaOrgProduct {
  const name = getLocalizedName(product, locale);
  const description = getLocalizedDescription(product, locale);
  const productUrl = buildProductUrl(product, locale);
  const price = getEffectivePrice(product);
  const availability = getAvailability(product);
  const priceValidUntil = getPriceValidUntil(product);
  const images = collectProductImages(product);
  const reviewStats = product.reviewStats;

  const schema: SchemaOrgProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    brand: {
      '@type': 'Brand',
      name: DEFAULT_BRAND,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: CURRENCY_CODE,
      price,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  // Add optional fields
  if (description) {
    schema.description = description;
  } else {
    schema.description = '-';
  }

  if (images.length > 0) {
    schema.image = images;
  }

  if (product.code) {
    schema.sku = product.code;
  }

  if (product.barcode) {
    schema.gtin = product.barcode;
  }

  if (product.category?.name) {
    schema.category = product.category.name;
  }

  if (priceValidUntil && schema.offers) {
    schema.offers.priceValidUntil = priceValidUntil;
  }

  // Add aggregate rating if reviews exist
  if (
    reviewStats &&
    reviewStats.reviewCount > 0 &&
    reviewStats.averageRating > 0
  ) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: reviewStats.averageRating,
      reviewCount: reviewStats.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

/**
 * Build Schema.org BreadcrumbList JSON-LD for product page
 */
export function buildProductBreadcrumbSchema(
  product: Product,
  locale: AppLocale,
): SchemaOrgBreadcrumbList {
  const name = getLocalizedName(product, locale);
  const homeLabel = locale === 'en' ? 'Home' : 'Trang chủ';
  const productsLabel = locale === 'en' ? 'Products' : 'Sản phẩm';

  const items: SchemaOrgBreadcrumbList['itemListElement'] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: homeLabel,
      item: `${BASE_URL}/${locale}`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: productsLabel,
      item: `${BASE_URL}/${locale}/products`,
    },
  ];

  // Add category if exists
  if (!isEmpty(product.category)) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: product.category?.name || '',
      item: `${BASE_URL}/${locale}/category/${product.category?.id}`,
    });

    items.push({
      '@type': 'ListItem',
      position: 4,
      name,
    });
  } else {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

/**
 * Build Schema.org Organization JSON-LD
 */
export function buildOrganizationSchema(): SchemaOrgOrganization {
  const socialProfiles = Object.values(SOCIAL_PROFILES).filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: socialProfiles.length > 0 ? socialProfiles : undefined,
  };
}

/**
 * Build Schema.org WebSite JSON-LD with SearchAction
 */
export function buildWebSiteSchema(locale: AppLocale): SchemaOrgWebSite {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${BASE_URL}/${locale}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/${locale}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
