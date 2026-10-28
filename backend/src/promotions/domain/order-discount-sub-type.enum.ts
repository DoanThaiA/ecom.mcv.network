/**
 * Order discount sub-type enum
 * Determines how the discount is applied to orders
 */
export enum OrderDiscountSubType {
  /** Automatically applied when cart meets conditions */
  AUTO_APPLY = 1,
  /** Requires customer to enter promo code */
  PROMO_CODE = 2,
}
