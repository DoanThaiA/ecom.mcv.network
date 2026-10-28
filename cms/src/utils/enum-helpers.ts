import {
  ProductBadge,
  productBadgeToJSON,
  productBadgeFromJSON,
} from 'src/types/gen/shared/shared/common/enums';

/**
 * Converts ProductBadge enum to backend-expected string format
 * @param badge - ProductBadge enum value (0-5) or undefined
 * @returns String without "PRODUCT_BADGE_" prefix, null for UNSPECIFIED, or undefined if not set
 *
 * Examples:
 * - PRODUCT_BADGE_SALE (1) → "SALE"
 * - PRODUCT_BADGE_NEW (2) → "NEW"
 * - PRODUCT_BADGE_UNSPECIFIED (0) → null
 * - undefined → undefined
 */
export function convertBadgeForApi(badge: ProductBadge | undefined): string | null | undefined {
  // Return null if badge is UNSPECIFIED (user selected "no badge")
  if (badge === ProductBadge.PRODUCT_BADGE_UNSPECIFIED) {
    return null;
  }

  // Return undefined if badge is not provided (optional field not set)
  if (badge === undefined) {
    return undefined;
  }

  // Convert enum number to full string (e.g., 1 → "PRODUCT_BADGE_SALE")
  const fullEnumString = productBadgeToJSON(badge);

  // Remove "PRODUCT_BADGE_" prefix to get just the suffix (e.g., "SALE")
  const badgeSuffix = fullEnumString.replace('PRODUCT_BADGE_', '');

  return badgeSuffix;
}

/**
 * Converts backend badge string to ProductBadge enum
 * @param badgeString - Backend badge format ("SALE", "NEW", etc.)
 * @returns ProductBadge enum value
 *
 * Examples:
 * - "SALE" → PRODUCT_BADGE_SALE (1)
 * - "NEW" → PRODUCT_BADGE_NEW (2)
 * - undefined → PRODUCT_BADGE_UNSPECIFIED (0)
 */
export function convertBadgeFromApi(badgeString: string | undefined): ProductBadge {
  if (!badgeString) {
    return ProductBadge.PRODUCT_BADGE_UNSPECIFIED;
  }

  // Add prefix to match enum name
  const fullEnumString = `PRODUCT_BADGE_${badgeString}`;

  // Use generated helper to convert string to enum
  return productBadgeFromJSON(fullEnumString);
}
