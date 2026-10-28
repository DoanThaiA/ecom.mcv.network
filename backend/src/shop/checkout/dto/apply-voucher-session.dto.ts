export class ApplyVoucherToSessionDto {
  code: string;
  name: string;
  source: 'CMS' | 'CDP';
  discountAmount: number;
  id?: string;
  discountType?: number;
  discountValue?: number;
  minimumOrderValue?: number;
  maxDiscountValue?: number;
  notApplicableWithOtherPromotions?: boolean;
  /**
   * Eligible product IDs (for CMS Product Discount VOUCHER)
   * If provided, discount will only be calculated on these products in session
   * If not provided, discount applies to entire session subtotal (CDP voucher behavior)
   */
  eligibleProductIds?: string[];
}
