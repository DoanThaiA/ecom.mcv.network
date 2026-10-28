// ==================== Re-export from Generated Proto Types ====================

// Enums from shared/common/enums
export {
  ShippingPromotionType,
  shippingPromotionTypeFromJSON,
  shippingPromotionTypeToJSON,
  ShippingPromotionStatus,
  shippingPromotionStatusFromJSON,
  shippingPromotionStatusToJSON,
  DiscountType,
  discountTypeFromJSON,
  discountTypeToJSON,
} from 'src/types/gen/shared/shared/common/enums';

// Types from shared/shipping/shipping-promotion
export type {
  FreeshippingConfig,
  ShippingDiscountTier,
  ShippingDiscountConfig,
  ShippingPromotion,
  ShippingPromotionListItem,
} from 'src/types/gen/shared/shared/shipping/shipping-promotion';

// CMS DTOs from cms/shipping/shipping-promotion
export type {
  CreateShippingPromotionRequest,
  UpdateShippingPromotionRequest,
  FilterShippingPromotion,
  SortShippingPromotion,
  QueryShippingPromotionsRequest,
  QueryShippingPromotionsResponse,
} from 'src/types/gen/cms/cms/shipping/shipping-promotion';

// ==================== Helper Functions ====================

import {
  ShippingPromotionType,
  ShippingPromotionStatus,
  DiscountType,
} from 'src/types/gen/shared/shared/common/enums';

/**
 * Get color for shipping promotion status (for UI display)
 */
export const getShippingPromotionStatusColor = (
  status: ShippingPromotionStatus
): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_ACTIVE:
      return 'success';
    case ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_UPCOMING:
      return 'warning';
    case ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_ENDED:
      return 'error';
    case ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_DISABLED:
      return 'default';
    default:
      return 'default';
  }
};

/**
 * Get i18n key for shipping promotion type
 */
export const getShippingPromotionTypeKey = (type: ShippingPromotionType): string => {
  switch (type) {
    case ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP:
      return 'freeship';
    case ShippingPromotionType.SHIPPING_PROMOTION_TYPE_SHIPPING_DISCOUNT:
      return 'shippingDiscount';
    default:
      return 'unknown';
  }
};

/**
 * Get i18n key for shipping promotion status
 */
export const getShippingPromotionStatusKey = (status: ShippingPromotionStatus): string => {
  switch (status) {
    case ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_ACTIVE:
      return 'active';
    case ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_UPCOMING:
      return 'upcoming';
    case ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_ENDED:
      return 'ended';
    case ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_DISABLED:
      return 'disabled';
    default:
      return 'unknown';
  }
};

/**
 * Get i18n key for discount type
 */
export const getDiscountTypeKey = (type: DiscountType): string => {
  switch (type) {
    case DiscountType.DISCOUNT_TYPE_FIXED:
      return 'fixed';
    case DiscountType.DISCOUNT_TYPE_PERCENTAGE:
      return 'percentage';
    default:
      return 'unknown';
  }
};

/**
 * Get default freeship config
 */
export const getDefaultFreeshippingConfig = () => ({
  minimumOrderValue: 500000,
});

/**
 * Get default shipping discount tier
 */
export const getDefaultShippingDiscountTier = () => ({
  minimumOrderValue: 0,
  discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
  discountValue: 10,
});

/**
 * Get default shipping discount config
 */
export const getDefaultShippingDiscountConfig = () => ({
  tiers: [getDefaultShippingDiscountTier()],
});

/**
 * Convert ShippingPromotionType enum to API string format
 * API expects: "freeship" | "shipping_discount"
 */
export const shippingPromotionTypeToApiString = (type: ShippingPromotionType): string => {
  switch (type) {
    case ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP:
      return 'freeship';
    case ShippingPromotionType.SHIPPING_PROMOTION_TYPE_SHIPPING_DISCOUNT:
      return 'shipping_discount';
    default:
      return 'freeship';
  }
};

/**
 * Convert API string to ShippingPromotionType enum
 * API returns: "freeship" | "shipping_discount"
 */
export const apiStringToShippingPromotionType = (str: string): ShippingPromotionType => {
  switch (str) {
    case 'freeship':
      return ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP;
    case 'shipping_discount':
      return ShippingPromotionType.SHIPPING_PROMOTION_TYPE_SHIPPING_DISCOUNT;
    default:
      return ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP;
  }
};

/**
 * Convert DiscountType enum to API string format
 * API expects: "fixed" | "percentage"
 */
export const discountTypeToApiString = (type: DiscountType): string => {
  switch (type) {
    case DiscountType.DISCOUNT_TYPE_FIXED:
      return 'fixed';
    case DiscountType.DISCOUNT_TYPE_PERCENTAGE:
      return 'percentage';
    default:
      return 'percentage';
  }
};

/**
 * Convert API string to DiscountType enum
 * API returns: "fixed" | "percentage"
 */
export const apiStringToDiscountType = (str: string): DiscountType => {
  switch (str) {
    case 'fixed':
      return DiscountType.DISCOUNT_TYPE_FIXED;
    case 'percentage':
      return DiscountType.DISCOUNT_TYPE_PERCENTAGE;
    default:
      return DiscountType.DISCOUNT_TYPE_PERCENTAGE;
  }
};

/**
 * Convert ShippingPromotionStatus enum to API string format
 * API expects: "active" | "upcoming" | "ended" | "disabled"
 */
export const shippingPromotionStatusToApiString = (status: ShippingPromotionStatus): string => {
  switch (status) {
    case ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_ACTIVE:
      return 'active';
    case ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_UPCOMING:
      return 'upcoming';
    case ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_ENDED:
      return 'ended';
    case ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_DISABLED:
      return 'disabled';
    default:
      return 'active';
  }
};

/**
 * Convert API string to ShippingPromotionStatus enum
 * API returns: "active" | "upcoming" | "ended" | "disabled"
 */
export const apiStringToShippingPromotionStatus = (str: string): ShippingPromotionStatus => {
  switch (str) {
    case 'active':
      return ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_ACTIVE;
    case 'upcoming':
      return ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_UPCOMING;
    case 'ended':
      return ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_ENDED;
    case 'disabled':
      return ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_DISABLED;
    default:
      return ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_UNSPECIFIED;
  }
};

/**
 * Calculate shipping promotion status from time and enabled flag
 */
export const calculateShippingPromotionStatus = (
  startTime: Date | string | undefined,
  endTime: Date | string | undefined,
  isEnabled: boolean
): ShippingPromotionStatus => {
  if (!isEnabled) {
    return ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_DISABLED;
  }

  const now = new Date();
  const start = startTime ? new Date(startTime) : null;
  const end = endTime ? new Date(endTime) : null;

  if (start && now < start) {
    return ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_UPCOMING;
  }
  if (end && now > end) {
    return ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_ENDED;
  }
  return ShippingPromotionStatus.SHIPPING_PROMOTION_STATUS_ACTIVE;
};

/**
 * Transform API response to ShippingPromotionListItem with proper enum types
 */
export const transformApiToListItem = (
  apiItem: Record<string, unknown>
): Record<string, unknown> => {
  const type = apiStringToShippingPromotionType(apiItem.type as string);
  const status =
    typeof apiItem.status === 'string'
      ? apiStringToShippingPromotionStatus(apiItem.status)
      : calculateShippingPromotionStatus(
          apiItem.startTime as string | undefined,
          apiItem.endTime as string | undefined,
          apiItem.isEnabled as boolean
        );

  // Calculate tierCount: 1 for freeship, number of tiers for shipping_discount
  let tierCount = 1;
  if (type === ShippingPromotionType.SHIPPING_PROMOTION_TYPE_SHIPPING_DISCOUNT) {
    const config = apiItem.shippingDiscountConfig as { tiers?: unknown[] } | undefined;
    tierCount = config?.tiers?.length ?? 1;
  }

  return {
    ...apiItem,
    type,
    status,
    tierCount,
  };
};
