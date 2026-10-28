import { ComboStatus, DiscountType, ProductStatus } from 'src/types/gen/shared/shared/common/enums';

/**
 * Custom enum converters for API communication.
 *
 * NOTE: These custom mappings are required because:
 * - Protobuf helpers (comboStatusFromJSON, discountTypeFromJSON) expect: "COMBO_STATUS_ACTIVE" or 1
 * - Backend API returns/expects: "active", "inactive", "fixed", "percentage" (lowercase, no prefix)
 *
 * Since API format differs from Protobuf format, custom mapping is necessary.
 */

// Combo Status -> API string
export const COMBO_STATUS_API: Record<ComboStatus, string> = {
  [ComboStatus.COMBO_STATUS_UNSPECIFIED]: 'active',
  [ComboStatus.COMBO_STATUS_ACTIVE]: 'active',
  [ComboStatus.COMBO_STATUS_INACTIVE]: 'inactive',
  [ComboStatus.UNRECOGNIZED]: 'active',
};

// API string -> Combo Status (reverse mapping for API response)
export const API_COMBO_STATUS: Record<string, ComboStatus> = {
  active: ComboStatus.COMBO_STATUS_ACTIVE,
  inactive: ComboStatus.COMBO_STATUS_INACTIVE,
};

// Discount Type -> API string
export const DISCOUNT_TYPE_API: Record<DiscountType, string> = {
  [DiscountType.DISCOUNT_TYPE_UNSPECIFIED]: 'fixed',
  [DiscountType.DISCOUNT_TYPE_FIXED]: 'fixed',
  [DiscountType.DISCOUNT_TYPE_PERCENTAGE]: 'percentage',
  [DiscountType.UNRECOGNIZED]: 'fixed',
};

// API string -> Discount Type (reverse mapping for API response)
export const API_DISCOUNT_TYPE: Record<string, DiscountType> = {
  fixed: DiscountType.DISCOUNT_TYPE_FIXED,
  percentage: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
};

/**
 * Parse discount type from API string or enum number to DiscountType enum
 * Handles both API format ("fixed", "percentage") and enum numbers
 */
export function parseDiscountType(value: string | number | DiscountType | undefined): DiscountType {
  if (value === undefined || value === null) {
    return DiscountType.DISCOUNT_TYPE_FIXED; // Default
  }

  // If already a DiscountType enum, return as is
  if (typeof value === 'number' && Object.values(DiscountType).includes(value)) {
    return value as DiscountType;
  }

  // If string, try to parse from API format
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'fixed' || lowerValue === 'discount_type_fixed') {
      return DiscountType.DISCOUNT_TYPE_FIXED;
    }
    if (lowerValue === 'percentage' || lowerValue === 'discount_type_percentage') {
      return DiscountType.DISCOUNT_TYPE_PERCENTAGE;
    }
    // Try API_DISCOUNT_TYPE mapping
    if (API_DISCOUNT_TYPE[lowerValue]) {
      return API_DISCOUNT_TYPE[lowerValue];
    }
  }

  // Default fallback
  return DiscountType.DISCOUNT_TYPE_FIXED;
}

// Product Status -> UI string (for display/translation keys)
export const PRODUCT_STATUS_UI: Record<ProductStatus, string | undefined> = {
  [ProductStatus.PRODUCT_STATUS_UNSPECIFIED]: undefined,
  [ProductStatus.PRODUCT_STATUS_NEW]: 'new',
  [ProductStatus.PRODUCT_STATUS_ACTIVE]: 'active',
  [ProductStatus.PRODUCT_STATUS_DISCONTINUED]: 'discontinued',
  [ProductStatus.PRODUCT_STATUS_OUT_OF_STOCK]: 'outOfStock',
  [ProductStatus.PRODUCT_STATUS_INACTIVE]: 'inactive',
  [ProductStatus.UNRECOGNIZED]: undefined,
};

// UI string -> Product Status (reverse mapping)
export const UI_PRODUCT_STATUS: Record<string, ProductStatus> = {
  new: ProductStatus.PRODUCT_STATUS_NEW,
  active: ProductStatus.PRODUCT_STATUS_ACTIVE,
  discontinued: ProductStatus.PRODUCT_STATUS_DISCONTINUED,
  outOfStock: ProductStatus.PRODUCT_STATUS_OUT_OF_STOCK,
  inactive: ProductStatus.PRODUCT_STATUS_INACTIVE,
};
