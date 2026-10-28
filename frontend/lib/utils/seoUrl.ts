/**
 * SEO-friendly URL utilities for category and topic pages
 *
 * URL format: /[type]/[slug]-[id]
 * Example: /category/ao-dai-6955f3dfabd3fed1bcd5183e
 */

import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import lastIndexOf from 'lodash/lastIndexOf';
import size from 'lodash/size';

import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';
import type { ShopTopicItem } from '@/types/gen/shared/shared/topics/topic';

/**
 * Convert Vietnamese text to URL-friendly slug
 * "Áo Sơ Mi" → "ao-so-mi"
 */
export function slugify(text: string): string {
  if (!text) return '';

  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-|-$/g, ''); // Trim - from start/end
}

/**
 * MongoDB ObjectId length (24 hex characters)
 */
const OBJECT_ID_LENGTH = 24;

/**
 * Regex pattern for valid MongoDB ObjectId (24 hex characters)
 */
const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

/**
 * Check if a string is a valid MongoDB ObjectId
 */
export function isValidObjectId(str: string): boolean {
  if (!isString(str) || size(str) !== OBJECT_ID_LENGTH) {
    return false;
  }
  return OBJECT_ID_REGEX.test(str);
}

/**
 * Parse result from URL segment
 */
export interface ParsedSlug {
  /** Extracted ID (if found) */
  id?: string;
  /** Extracted slug (if found) */
  slug?: string;
  /** Whether this is a slug-only URL that needs special handling */
  isSlugOnly: boolean;
}

/**
 * Parse a URL segment to extract slug and id
 *
 * Handles 3 formats:
 * 1. "slug-id" format: "ao-dai-6955f3dfabd3fed1bcd5183e" -> { slug: "ao-dai", id: "6955..." }
 * 2. ID only: "6955f3dfabd3fed1bcd5183e" -> { id: "6955..." }
 * 3. Slug only: "ao-dai" -> { slug: "ao-dai", isSlugOnly: true }
 */
export function parseSlug(segment: string): ParsedSlug {
  // Safe check for empty or non-string input
  if (isEmpty(segment) || !isString(segment)) {
    return { isSlugOnly: false };
  }

  // Case 1: ID only (24 hex chars)
  if (isValidObjectId(segment)) {
    return { id: segment, isSlugOnly: false };
  }

  // Case 2: slug-id format (ends with -[24 hex chars])
  const lastDashIndex = lastIndexOf(segment, '-');
  if (lastDashIndex > 0) {
    const possibleId = segment.substring(lastDashIndex + 1);
    if (isValidObjectId(possibleId)) {
      return {
        slug: segment.substring(0, lastDashIndex),
        id: possibleId,
        isSlugOnly: false,
      };
    }
  }

  // Case 3: Slug only
  return { slug: segment, isSlugOnly: true };
}

// ============ Category-specific utilities ============

/** Re-export parseSlug as parseCategorySlug for semantic clarity */
export const parseCategorySlug = parseSlug;

/**
 * Find a category by slug
 */
export function findCategoryBySlug(
  categories: ProductCategory[],
  slug: string
): ProductCategory | undefined {
  if (isEmpty(categories) || isEmpty(slug)) {
    return undefined;
  }
  return find(categories, (cat) => cat.slug === slug);
}

/**
 * Find a category by ID or code
 */
export function findCategoryById(
  categories: ProductCategory[],
  idOrCode: string
): ProductCategory | undefined {
  if (isEmpty(categories) || isEmpty(idOrCode)) {
    return undefined;
  }
  return (
    find(categories, (cat) => cat.id === idOrCode) ||
    find(categories, (cat) => cat.code === idOrCode)
  );
}

/**
 * Generate SEO-friendly category URL
 */
export function getCategoryUrl(
  category: Pick<ProductCategory, 'id' | 'slug'>,
  locale: string
): string {
  if (category.slug) {
    return `/${locale}/category/${category.slug}-${category.id}`;
  }
  return `/${locale}/category/${category.id}`;
}

// ============ Topic-specific utilities ============

/** Re-export parseSlug as parseTopicSlug for semantic clarity */
export const parseTopicSlug = parseSlug;

/**
 * Find a topic by slug
 */
export function findTopicBySlug(
  topics: ShopTopicItem[],
  slug: string
): ShopTopicItem | undefined {
  if (isEmpty(topics) || isEmpty(slug)) {
    return undefined;
  }
  return find(topics, (topic) => topic.slug === slug);
}

/**
 * Find a topic by ID
 */
export function findTopicById(
  topics: ShopTopicItem[],
  id: string
): ShopTopicItem | undefined {
  if (isEmpty(topics) || isEmpty(id)) {
    return undefined;
  }
  return find(topics, (topic) => topic.id === id);
}

/**
 * Generate SEO-friendly topic URL
 */
export function getTopicUrl(
  topic: Pick<ShopTopicItem, 'id' | 'slug'>,
  locale: string
): string {
  if (topic.slug) {
    return `/${locale}/topic/${topic.slug}-${topic.id}`;
  }
  return `/${locale}/topic/${topic.id}`;
}

// ============ Product-specific utilities ============

import type { Product } from '@/types/gen/shared/shared/products/product';

/** Re-export parseSlug as parseProductSlug for semantic clarity */
export const parseProductSlug = parseSlug;

/**
 * Generate SEO-friendly product URL
 * Format: /{locale}/products/{slug}-{id} or /{locale}/products/{id}
 */
export function getProductUrl(
  product: Pick<Product, 'id' | 'slug'>,
  locale: string
): string {
  if (product.slug) {
    return `/${locale}/products/${product.slug}-${product.id}`;
  }
  return `/${locale}/products/${product.id}`;
}
