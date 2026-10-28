// Re-export Protobuf enums
export {
  PromotionType,
  PromotionStatus,
  BundleDealSubType,
  DiscountType,
  OrderDiscountSubType,
  ProductDiscountSubType,
  promotionTypeFromJSON,
  promotionTypeToJSON,
  promotionStatusFromJSON,
  promotionStatusToJSON,
  bundleDealSubTypeFromJSON,
  bundleDealSubTypeToJSON,
  discountTypeFromJSON,
  discountTypeToJSON,
  orderDiscountSubTypeFromJSON,
  orderDiscountSubTypeToJSON,
  productDiscountSubTypeFromJSON,
  productDiscountSubTypeToJSON,
} from '../gen/shared/shared/common/enums';

// Re-export Protobuf types
export type {
  Promotion,
  BundleDealConfig,
  BundleDealTier,
  GiftProduct,
  OrderDiscountConfig,
  PromotionUsageRecord,
  ProductDiscountConfig,
  ProductDiscountProduct,
} from '../gen/shared/shared/promotions/promotion';

import {
  PromotionStatus,
  PromotionType,
  BundleDealSubType,
  DiscountType,
  OrderDiscountSubType,
  ProductDiscountSubType,
} from '../gen/shared/shared/common/enums';

// ----------------------------------------------------------------------
// DTO types for API create/update (only requires productId)
// ----------------------------------------------------------------------

/**
 * Gift product for create/update DTO (only productId needed)
 */
export interface CreateGiftProductDto {
  productId: string;
}

/**
 * Bundle deal tier for create/update DTO
 */
export interface CreateBundleDealTierDto {
  minOrderValue: number;
  giftProducts: CreateGiftProductDto[];
}

/**
 * Bundle deal config for create/update DTO
 */
export interface CreateBundleDealConfigDto {
  subType: BundleDealSubType;
  // BUY_TO_GET_GIFT
  tiers?: CreateBundleDealTierDto[];
  // BUY_X_GET_Y
  requiredQuantity?: number;
  requiredProducts?: CreateGiftProductDto[];
  giftQuantity?: number;
  giftProducts?: CreateGiftProductDto[];
  minimumOrderValue?: number;
  maxGiftQuantity?: number;
  // Shared
  notApplicableWithOtherPromotions?: boolean;
}

// ----------------------------------------------------------------------
// Order Discount config types
// ----------------------------------------------------------------------

/**
 * Order discount config for create/update DTO
 */
export interface CreateOrderDiscountConfigDto {
  subType: OrderDiscountSubType;
  promoCode?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountValue?: number;
  minimumOrderValue: number;
  notApplicableWithOtherPromotions?: boolean;
  singleUsePerCustomer?: boolean;
  totalUsageLimit?: number;
}

// ----------------------------------------------------------------------
// Product Discount DTO types
// ----------------------------------------------------------------------

/**
 * Product for create/update DTO (only productId needed)
 */
export interface CreateProductDiscountProductDto {
  productId: string;
  discountType: DiscountType;
  discountValue: number;
}

/**
 * Product discount config for create/update DTO
 */
export interface CreateProductDiscountConfigDto {
  subType: ProductDiscountSubType;
  voucherCode?: string;
  minimumOrderValue: number;
  products: CreateProductDiscountProductDto[];
  totalUsageLimit?: number;
  maxUsagePerCustomer?: number;
  notApplicableWithOtherPromotions?: boolean;
}

/**
 * Product discount product for form state (with display info)
 */
export interface ProductDiscountProductForm {
  productId: string;
  name: string;
  image: string;
  code: string;
  originalPrice: number;
  discountType: DiscountType;
  discountValue: number;
  discountedPrice: number;
  soldCount: number;
  isEnabled: boolean;
}

// ----------------------------------------------------------------------
// Custom types for API/Redux (previously in proto, now defined locally)
// ----------------------------------------------------------------------

/**
 * Promotion list item (summary, no config details)
 */
export interface PromotionListItem {
  id: string;
  type: PromotionType;
  subType?: number;
  name: string;
  startTime: Date | undefined;
  endTime: Date | undefined;
  isEnabled: boolean;
  status: PromotionStatus;
  tierCount: number;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
}

/**
 * Promotion list response with pagination
 */
export interface PromotionListResponse {
  data: PromotionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Query promotions DTO
 */
export interface QueryPromotionsDto {
  page?: number;
  limit?: number;
  type?: PromotionType;
  status?: PromotionStatus;
  keyword?: string;
}

/**
 * Create promotion DTO
 */
export interface CreatePromotionDto {
  type: PromotionType;
  name: string;
  startTime: Date | undefined;
  endTime: Date | undefined;
  bundleDealConfig?: CreateBundleDealConfigDto;
  orderDiscountConfig?: CreateOrderDiscountConfigDto;
  productDiscountConfig?: CreateProductDiscountConfigDto;
}

/**
 * Update promotion DTO
 */
export interface UpdatePromotionDto {
  name?: string;
  startTime?: Date;
  endTime?: Date;
  isEnabled?: boolean;
  bundleDealConfig?: CreateBundleDealConfigDto;
  orderDiscountConfig?: CreateOrderDiscountConfigDto;
  productDiscountConfig?: CreateProductDiscountConfigDto;
}

// ----------------------------------------------------------------------
// Helper functions
// ----------------------------------------------------------------------

/**
 * Convert PromotionStatus to translation key
 */
export const promotionStatusToKey = (status: PromotionStatus): string => {
  switch (status) {
    case PromotionStatus.PROMOTION_STATUS_ACTIVE:
      return 'ongoing';
    case PromotionStatus.PROMOTION_STATUS_UPCOMING:
      return 'upcoming';
    case PromotionStatus.PROMOTION_STATUS_PAUSED:
      return 'paused';
    case PromotionStatus.PROMOTION_STATUS_ENDED:
      return 'ended';
    default:
      return 'unknown';
  }
};

/**
 * Get MUI Chip color for PromotionStatus
 */
export const getPromotionStatusColor = (
  status: PromotionStatus
): 'success' | 'info' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case PromotionStatus.PROMOTION_STATUS_ACTIVE:
      return 'success';
    case PromotionStatus.PROMOTION_STATUS_UPCOMING:
      return 'info';
    case PromotionStatus.PROMOTION_STATUS_PAUSED:
      return 'warning';
    case PromotionStatus.PROMOTION_STATUS_ENDED:
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Convert PromotionType to translation key
 */
export const promotionTypeToKey = (type: PromotionType): string => {
  switch (type) {
    case PromotionType.PROMOTION_TYPE_BUNDLE_DEAL:
      return 'shockDeal';
    case PromotionType.PROMOTION_TYPE_ORDER_DISCOUNT:
      return 'invoiceDiscount';
    case PromotionType.PROMOTION_TYPE_PRODUCT_COMBO:
      return 'comboPromotion';
    case PromotionType.PROMOTION_TYPE_PRODUCT_DISCOUNT:
      return 'productDiscount';
    default:
      return 'unknown';
  }
};

/**
 * Convert promotion subType to translation key based on promotion type
 * SubType values:
 * - BundleDeal: 1 = buyToReceiveGift
 * - OrderDiscount: 1 = autoApply, 2 = promoCodeType
 * - ProductDiscount: 1 = promotionProgram, 2 = voucherCode
 */
export const promotionSubTypeToKey = (type: PromotionType, subType: number | undefined): string => {
  if (subType === undefined) return '-';

  switch (type) {
    case PromotionType.PROMOTION_TYPE_BUNDLE_DEAL:
      // BundleDealSubType: 1 = BUY_TO_GET_GIFT, 2 = BUY_X_GET_Y
      if (subType === 1) return 'buyToReceiveGift';
      if (subType === 2) return 'buyXGetY';
      return '-';

    case PromotionType.PROMOTION_TYPE_ORDER_DISCOUNT:
      // OrderDiscountSubType: 1 = AUTO_APPLY, 2 = PROMO_CODE
      if (subType === 1) return 'autoApply';
      if (subType === 2) return 'promoCodeType';
      return '-';

    case PromotionType.PROMOTION_TYPE_PRODUCT_DISCOUNT:
      // ProductDiscountSubType: 1 = AUTO_APPLY, 2 = VOUCHER
      if (subType === 1) return 'promotionProgram';
      if (subType === 2) return 'voucherCode';
      return '-';

    default:
      return '-';
  }
};

// ----------------------------------------------------------------------
// Custom types for Redux/API
// ----------------------------------------------------------------------

/**
 * Filter params for promotions query
 */
export interface FilterPromotion {
  keyword?: string;
  status?: PromotionStatus;
  type?: PromotionType;
}

/**
 * Pagination info
 */
export interface PromotionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Promotion products page (server-side pagination)
 */
export interface PromotionProductsPage {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
