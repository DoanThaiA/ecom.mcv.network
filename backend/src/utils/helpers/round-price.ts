import { DiscountType } from '../../combos/domain/discount-type.enum';

/**
 * Round a value to the nearest hundred.
 * Used for rounding shipping discounts and commissions.
 *
 * @example
 * roundToNearestHundred(12345) // 12300
 * roundToNearestHundred(12350) // 12400
 */
export function roundToNearestHundred(value: number): number {
  return Math.round(value / 100) * 100;
}

/**
 * Round a value to the nearest thousand.
 * Used for rounding discount amounts and prices for display.
 *
 * @example
 * roundToNearestThousand(23400) // 23000
 * roundToNearestThousand(23600) // 24000
 */
export function roundToNearestThousand(value: number): number {
  return Math.round(value / 1000) * 1000;
}

/**
 * Calculate discount amount based on discount type.
 * Returns the raw discount amount (not rounded).
 *
 * @param originalPrice - The original price before discount
 * @param discountType - FIXED or PERCENTAGE
 * @param discountValue - The discount value (amount for FIXED, percentage for PERCENTAGE)
 * @returns The calculated discount amount
 */
export function calculateDiscountAmount(
  originalPrice: number,
  discountType: DiscountType,
  discountValue: number,
): number {
  if (discountType === DiscountType.FIXED) {
    return Math.min(discountValue, originalPrice);
  }
  return Math.round(originalPrice * (discountValue / 100));
}

/**
 * Calculate discount amount with rounding to nearest thousand.
 * Use this for display consistency across cart, checkout, and product APIs.
 *
 * @param originalPrice - The original price before discount
 * @param discountType - FIXED or PERCENTAGE
 * @param discountValue - The discount value (amount for FIXED, percentage for PERCENTAGE)
 * @returns The calculated discount amount rounded to nearest thousand
 */
export function calculateRoundedDiscountAmount(
  originalPrice: number,
  discountType: DiscountType,
  discountValue: number,
): number {
  return roundToNearestThousand(
    calculateDiscountAmount(originalPrice, discountType, discountValue),
  );
}

/**
 * Distribute a total discount proportionally across items based on their subtotal share.
 *
 * @param itemSubtotal - The subtotal of the item (price * quantity)
 * @param orderSubtotal - The total subtotal of the order (sum of all item subtotals)
 * @param totalDiscount - The total order-level discount to distribute
 * @returns The discount amount allocated to this item (rounded to integer)
 */
export function distributeDiscount(
  itemSubtotal: number,
  orderSubtotal: number,
  totalDiscount: number,
): number {
  if (orderSubtotal <= 0 || totalDiscount <= 0) return 0;
  return Math.round((itemSubtotal / orderSubtotal) * totalDiscount);
}

/**
 * Calculate commission amount from an effective subtotal and a rate.
 *
 * @param effectiveSubtotal - The subtotal after discount distribution
 * @param rate - The commission rate (0-100)
 * @returns The commission amount (rounded to nearest integer)
 */
export function calculateCommissionAmount(
  effectiveSubtotal: number,
  rate: number,
): number {
  return Math.round((effectiveSubtotal * rate) / 100);
}
