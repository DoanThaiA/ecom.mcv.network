import { PaginateResult } from 'mongoose';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { NullableType } from '../../utils/types/nullable.type';
import { PromotionProduct } from './promotion-product';
import { DiscountType } from '../../combos/domain/discount-type.enum';

/**
 * Filter options for querying promotion products
 */
export interface FilterPromotionProductDto {
  search?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Sort options for querying promotion products
 */
export interface SortPromotionProductDto {
  orderBy: string;
  order: 'asc' | 'desc';
}

/**
 * Result of incrementing sold count
 */
export interface IncrementSoldCountResult {
  success: boolean;
  newSoldCount: number;
}

/**
 * Data for updating a promotion product
 */
export interface UpdatePromotionProductData {
  discountType?: DiscountType;
  discountValue?: number;
  isEnabled?: boolean;
  soldCount?: number;
  discountedPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  effectivePrice?: number;
}

/**
 * Abstract repository interface for PromotionProduct entity
 * Defines the contract for promotion product data access operations
 */
export abstract class PromotionProductRepository {
  /**
   * Upsert many promotion products (keyed on productId + promotionId)
   * @param products - Promotion product data to upsert
   * @returns Number of products upserted
   */
  abstract upsertMany(
    products: Omit<PromotionProduct, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<number>;

  /**
   * Remove all promotion products for a given promotion
   * @param promotionId - Promotion ID
   * @returns Number of documents removed
   */
  abstract removeByPromotionId(promotionId: string): Promise<number>;

  /**
   * Remove promotion products not in the given product ID list
   * @param promotionId - Promotion ID
   * @param keepProductIds - Product IDs to keep
   * @returns Number of documents removed
   */
  abstract removeNotInProductIds(
    promotionId: string,
    keepProductIds: string[],
  ): Promise<number>;

  /**
   * Find promotion products with pagination, filtering, and sorting (shop-facing)
   * Only returns enabled products with saleable status
   * @param params - Query parameters
   * @returns Paginated result
   */
  abstract findManyWithPagination(params: {
    promotionId: string;
    filterOptions?: FilterPromotionProductDto | null;
    sortOptions?: SortPromotionProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<PromotionProduct>>;

  /**
   * Count enabled promotion products for a given promotion
   * @param promotionId - Promotion ID
   * @returns Count of enabled products
   */
  abstract countByPromotionId(promotionId: string): Promise<number>;

  /**
   * Create a single promotion product
   * @param product - Promotion product data
   * @returns Created promotion product
   */
  abstract createOne(
    product: Omit<PromotionProduct, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PromotionProduct>;

  /**
   * Update a single promotion product by promotionId and productId
   * @param promotionId - Promotion ID
   * @param productId - Product ID
   * @param data - Fields to update
   * @returns Updated promotion product or null
   */
  abstract updateOne(
    promotionId: string,
    productId: string,
    data: UpdatePromotionProductData,
  ): Promise<NullableType<PromotionProduct>>;

  /**
   * Remove a single promotion product by promotionId and productId
   * @param promotionId - Promotion ID
   * @param productId - Product ID
   * @returns True if removed, false if not found
   */
  abstract removeOne(promotionId: string, productId: string): Promise<boolean>;

  /**
   * Bulk update promotion products
   * @param promotionId - Promotion ID
   * @param updates - Array of product updates
   * @returns Number of products updated
   */
  abstract bulkUpdate(
    promotionId: string,
    updates: Array<{ productId: string } & UpdatePromotionProductData>,
  ): Promise<number>;

  /**
   * Find promotion products for a given promotion with pagination (CMS-facing)
   * Returns all products regardless of enabled/status
   * @param params - Query parameters
   * @returns Paginated result
   */
  abstract findByPromotionIdWithPagination(params: {
    promotionId: string;
    filterOptions?: FilterPromotionProductDto | null;
    sortOptions?: SortPromotionProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<PromotionProduct>>;

  /**
   * Find a single promotion product by promotionId and productId
   * @param promotionId - Promotion ID
   * @param productId - Product ID
   * @returns Promotion product or null
   */
  abstract findOneByProductId(
    promotionId: string,
    productId: string,
  ): Promise<NullableType<PromotionProduct>>;

  /**
   * Find promotion products by promotionId and multiple productIds
   * @param promotionId - Promotion ID
   * @param productIds - Product IDs
   * @returns Array of promotion products
   */
  abstract findByPromotionIdAndProductIds(
    promotionId: string,
    productIds: string[],
  ): Promise<PromotionProduct[]>;

  /**
   * Find all product IDs for a given promotion (no pagination)
   * @param promotionId - Promotion ID
   * @returns Array of productId strings
   */
  abstract findProductIdsByPromotionId(promotionId: string): Promise<string[]>;

  /**
   * Find active promotion products for given product IDs across multiple promotions
   * @param activePromotionIds - Currently active promotion IDs
   * @param productIds - Product IDs to look up
   * @returns Map of productId to promotion product
   */
  abstract findActiveForProducts(
    activePromotionIds: string[],
    productIds: string[],
  ): Promise<Map<string, PromotionProduct>>;

  /**
   * Find an active promotion product for a given product ID (for conflict checking)
   * @param activePromotionIds - Currently active promotion IDs
   * @param productId - Product ID
   * @param excludePromotionId - Optional promotion ID to exclude
   * @returns Promotion product or null
   */
  abstract findActiveProductByProductId(
    activePromotionIds: string[],
    productId: string,
    excludePromotionId?: string,
  ): Promise<NullableType<PromotionProduct>>;

  /**
   * Find all enabled promotion products for a given promotion (for sync cron)
   * Only filters by isEnabled, no status/hide/discount filters
   * @param promotionId - Promotion ID
   * @returns Array of enabled promotion products
   */
  abstract findEnabledByPromotionId(
    promotionId: string,
  ): Promise<PromotionProduct[]>;

  /**
   * Atomically increment soldCount for a promotion product
   * @param promotionId - Promotion ID
   * @param productId - Product ID
   * @param quantity - Quantity to increment
   * @returns Result with success status and new soldCount
   */
  abstract incrementSoldCount(
    promotionId: string,
    productId: string,
    quantity: number,
  ): Promise<IncrementSoldCountResult>;

  /**
   * Increment sold count for multiple checkout items (fire-and-forget)
   * @param items - Checkout session items with promotionId
   */
  abstract incrementSoldCountForItems(
    items: Array<{
      promotionId?: string | null;
      productId: string;
      quantity: number;
    }>,
  ): void;
}
