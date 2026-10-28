/**
 * Bundle deal sub-type enum - matches proto BundleDealSubType
 */
export enum BundleDealSubType {
  UNSPECIFIED = 0,
  BUY_TO_GET_GIFT = 1, // Get gift products when order value meets threshold
  BUY_X_GET_Y = 2, // Buy required products to get gift products
}
