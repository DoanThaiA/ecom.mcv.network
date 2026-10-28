/**
 * Promotion type enum - matches proto PromotionType
 */
export enum PromotionType {
  UNSPECIFIED = 0,
  BUNDLE_DEAL = 1, // Mua kèm deal sốc
  ORDER_DISCOUNT = 2, // Giảm giá hóa đơn
  PRODUCT_COMBO = 3, // Combo khuyến mãi
  PRODUCT_DISCOUNT = 4, // Giảm giá sản phẩm
}
