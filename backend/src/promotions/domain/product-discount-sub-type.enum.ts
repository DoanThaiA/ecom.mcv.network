/**
 * Product discount sub-type enum - matches proto ProductDiscountSubType
 * Determines how the product discount is applied
 */
export enum ProductDiscountSubType {
  UNSPECIFIED = 0,
  /** Automatically applied to selected products */
  AUTO_APPLY = 1, // Chương trình khuyến mại
  /** Requires customer to enter voucher code */
  VOUCHER = 2, // Mã voucher
}
