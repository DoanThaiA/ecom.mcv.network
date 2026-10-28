/**
 * Product status enumeration
 * Platform-agnostic product status values
 */
export enum ProductStatus {
  /** Product is new (offline store sales only) */
  NEW = 1,
  /** Product is active and available for sale */
  ACTIVE = 2,
  /** Product is discontinued (hidden from listings) */
  DISCONTINUED = 3,
  /** Product is out of stock */
  OUT_OF_STOCK = 4,
  /** Product is inactive (temporarily disabled) */
  INACTIVE = 5,
}

/**
 * Statuses that indicate a product is available for sale
 */
export const SALEABLE_STATUSES: ProductStatus[] = [
  ProductStatus.ACTIVE,
  // ProductStatus.NEW,
];

/**
 * Check if a product status indicates the product is saleable
 * @param status - The product status to check
 * @returns true if the product can be sold
 */
export function isSaleable(status: ProductStatus): boolean {
  return SALEABLE_STATUSES.includes(status);
}
