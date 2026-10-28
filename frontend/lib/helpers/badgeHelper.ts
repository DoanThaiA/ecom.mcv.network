import { ProductBadge, productBadgeFromJSON } from '@/types/gen/shared/shared/common/enums';

/**
 * Converts API badge string to ProductBadge enum
 * API returns short format: "NEW", "BEST_SELLER", "HOT", etc.
 * Converts to enum: ProductBadge.PRODUCT_BADGE_NEW, etc.
 * Handles case-insensitive input and whitespace trimming
 *
 * @param badgeString - Short badge string from API (case-insensitive)
 * @returns ProductBadge enum value, or undefined if invalid
 */
export function parseBadgeString(badgeString?: string | null): ProductBadge | undefined {
  if (!badgeString) return undefined;

  // Normalize: trim whitespace and convert to uppercase
  const normalized = badgeString.trim().toUpperCase();

  // Convert short format to full format
  // "NEW" -> "PRODUCT_BADGE_NEW"
  // "BEST_SELLER" -> "PRODUCT_BADGE_BEST_SELLER"
  const fullBadgeName = `PRODUCT_BADGE_${normalized}`;

  try {
    const badge = productBadgeFromJSON(fullBadgeName);

    // Don't return UNRECOGNIZED as a valid value
    if (badge === ProductBadge.UNRECOGNIZED) {
      console.warn(`[badgeHelper] Unrecognized badge string: "${badgeString}" (normalized: "${normalized}")`);
      return undefined;
    }
    return badge;
  } catch (error) {
    console.error(`[badgeHelper] Error parsing badge: "${badgeString}"`, error);
    return undefined;
  }
}

/**
 * Converts ProductBadge enum to short string for API
 * ProductBadge.PRODUCT_BADGE_NEW -> "NEW"
 * ProductBadge.PRODUCT_BADGE_BEST_SELLER -> "BEST_SELLER"
 *
 * @param badge - ProductBadge enum value
 * @returns Short badge string, or undefined if invalid
 */
export function badgeToString(badge?: ProductBadge | null): string | undefined {
  if (badge === undefined || badge === null || badge === ProductBadge.UNRECOGNIZED) {
    return undefined;
  }

  // Get full name from enum
  const badgeName = ProductBadge[badge]; // e.g., "PRODUCT_BADGE_NEW"

  // Remove "PRODUCT_BADGE_" prefix
  if (badgeName.startsWith('PRODUCT_BADGE_')) {
    return badgeName.replace('PRODUCT_BADGE_', ''); // "NEW"
  }

  return undefined;
}

/**
 * Get all available badge options for select box
 * Returns array of { value: ProductBadge, label: string }
 */
export function getBadgeOptions() {
  return [
    { value: ProductBadge.PRODUCT_BADGE_NEW, label: 'NEW' },
    { value: ProductBadge.PRODUCT_BADGE_SALE, label: 'SALE' },
    { value: ProductBadge.PRODUCT_BADGE_HOT, label: 'HOT' },
    { value: ProductBadge.PRODUCT_BADGE_BEST_SELLER, label: 'BEST_SELLER' },
    { value: ProductBadge.PRODUCT_BADGE_CLEARANCE_SALE, label: 'CLEARANCE_SALE' },
  ];
}
