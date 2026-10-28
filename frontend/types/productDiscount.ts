/**
 * Product Discount types - Re-exports from generated proto types
 * Used in Shop cart page for displaying eligible promotions
 */

// Re-export from generated proto types
export type {
  ProductDiscountEligibilityResponse,
  EligibleProductResponse,
  CheckProductDiscountEligibilityRequest,
  ApplyProductDiscountRequest,
  CheckPromotionEligibilityRequest,
  PromotionEligibilityResponse,
  OrderDiscountEligibilityResponse,
} from './gen/shop/shop/shop/shop';

// Re-export enums from shared/common
export { ProductDiscountSubType, DiscountType, OrderDiscountSubType } from './gen/shared/shared/common/enums';

// Type aliases for backwards compatibility
export type ProductDiscountEligibility = import('./gen/shop/shop/shop/shop').ProductDiscountEligibilityResponse;
export type EligibleProductInfo = import('./gen/shop/shop/shop/shop').EligibleProductResponse;
export type OrderDiscountEligibility = import('./gen/shop/shop/shop/shop').OrderDiscountEligibilityResponse;
