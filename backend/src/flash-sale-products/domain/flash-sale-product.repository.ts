import { PaginateResult } from 'mongoose';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { NullableType } from '../../utils/types/nullable.type';
import { FlashSaleProduct } from './flash-sale-product';
import { DiscountType } from '../../combos/domain/discount-type.enum';

/**
 * Filter options for querying flash sale products
 */
export interface FilterFlashSaleProductDto {
  search?: string;
  categoryIds?: string[];
  topicProductIds?: string[];
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Sort options for querying flash sale products
 */
export interface SortFlashSaleProductDto {
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
 * Data for updating a flash sale product
 */
export interface UpdateFlashSaleProductData {
  discountType?: DiscountType;
  discountValue?: number;
  promotionalQuantity?: number;
  soldCount?: number;
  isEnabled?: boolean;
  order?: number;
}

/**
 * Abstract repository interface for FlashSaleProduct entity
 * Defines the contract for flash sale product data access operations
 */
export abstract class FlashSaleProductRepository {
  /**
   * Upsert many flash sale products (keyed on productId + flashSaleId)
   * @param products - Flash sale product data to upsert
   * @returns Number of products upserted
   */
  abstract upsertMany(
    products: Omit<
      FlashSaleProduct,
      'id' | 'createdAt' | 'updatedAt' | 'remainingStock'
    >[],
  ): Promise<number>;

  /**
   * Soft delete all flash sale products for a given flash sale
   * @param flashSaleId - Flash sale ID
   * @returns Number of documents soft-deleted
   */
  abstract removeByFlashSaleId(flashSaleId: string): Promise<number>;

  /**
   * Soft delete flash sale products not in the given product ID list
   * @param flashSaleId - Flash sale ID
   * @param keepProductIds - Product IDs to keep
   * @returns Number of documents soft-deleted
   */
  abstract removeNotInProductIds(
    flashSaleId: string,
    keepProductIds: string[],
  ): Promise<number>;

  /**
   * Soft delete multiple flash sale products by product IDs
   * @param flashSaleId - Flash sale ID
   * @param productIds - Product IDs to remove
   * @returns Number of documents soft-deleted
   */
  abstract removeByProductIds(
    flashSaleId: string,
    productIds: string[],
  ): Promise<number>;

  /**
   * Find flash sale products with pagination, filtering, and sorting
   * @param params - Query parameters
   * @returns Paginated result
   */
  abstract findManyWithPagination(params: {
    flashSaleId: string;
    filterOptions?: FilterFlashSaleProductDto | null;
    sortOptions?: SortFlashSaleProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<FlashSaleProduct>>;

  /**
   * Count flash sale products for a given flash sale
   * @param flashSaleId - Flash sale ID
   * @returns Count of enabled products
   */
  abstract countByFlashSaleId(flashSaleId: string): Promise<number>;

  /**
   * Soft delete all flash sale products from the collection
   * Used when no flash sale is active
   * @returns Number of documents soft-deleted
   */
  abstract removeAll(): Promise<number>;

  /**
   * Create a single flash sale product
   * @param product - Flash sale product data
   * @returns Created flash sale product
   */
  abstract createOne(
    product: Omit<
      FlashSaleProduct,
      'id' | 'createdAt' | 'updatedAt' | 'remainingStock'
    >,
  ): Promise<FlashSaleProduct>;

  /**
   * Update a single flash sale product by flashSaleId and productId
   * @param flashSaleId - Flash sale ID
   * @param productId - Product ID
   * @param data - Fields to update
   * @returns Updated flash sale product or null
   */
  abstract updateOne(
    flashSaleId: string,
    productId: string,
    data: UpdateFlashSaleProductData,
  ): Promise<NullableType<FlashSaleProduct>>;

  /**
   * Soft delete a single flash sale product by flashSaleId and productId
   * @param flashSaleId - Flash sale ID
   * @param productId - Product ID
   * @returns True if soft-deleted, false if not found
   */
  abstract removeOne(flashSaleId: string, productId: string): Promise<boolean>;

  /**
   * Bulk update flash sale products
   * @param flashSaleId - Flash sale ID
   * @param updates - Array of product updates
   * @returns Number of products updated
   */
  abstract bulkUpdate(
    flashSaleId: string,
    updates: Array<{ productId: string } & UpdateFlashSaleProductData>,
  ): Promise<number>;

  /**
   * Find flash sale products for a given flash sale with pagination
   * @param params - Query parameters
   * @returns Paginated result
   */
  abstract findByFlashSaleIdWithPagination(params: {
    flashSaleId: string;
    filterOptions?: FilterFlashSaleProductDto | null;
    sortOptions?: SortFlashSaleProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<FlashSaleProduct>>;

  /**
   * Find a single flash sale product by flashSaleId and productId
   * @param flashSaleId - Flash sale ID
   * @param productId - Product ID
   * @returns Flash sale product or null
   */
  abstract findOneByProductId(
    flashSaleId: string,
    productId: string,
  ): Promise<NullableType<FlashSaleProduct>>;

  /**
   * Find a single flash sale product by flashSaleId and productId, including soft-deleted records
   * @param flashSaleId - Flash sale ID
   * @param productId - Product ID
   * @returns Flash sale product (active or soft-deleted) or null
   */
  abstract findOneByProductIdIncludingDeleted(
    flashSaleId: string,
    productId: string,
  ): Promise<NullableType<FlashSaleProduct>>;

  /**
   * Find flash sale products by flashSaleId and multiple productIds
   * @param flashSaleId - Flash sale ID
   * @param productIds - Product IDs
   * @returns Array of flash sale products
   */
  abstract findByFlashSaleIdAndProductIds(
    flashSaleId: string,
    productIds: string[],
  ): Promise<FlashSaleProduct[]>;

  /**
   * Find an active flash sale product for a given product ID
   * Requires the active flash sale ID (caller determines which flash sale is active)
   * @param activeFlashSaleId - The currently active flash sale ID
   * @param productId - Product ID
   * @param excludeFlashSaleId - Optional flash sale ID to exclude
   * @returns Flash sale product or null
   */
  abstract findByActiveFlashSaleAndProductId(
    activeFlashSaleId: string,
    productId: string,
  ): Promise<NullableType<FlashSaleProduct>>;

  /**
   * Atomically increment soldCount for a flash sale product
   * @param flashSaleId - Flash sale ID
   * @param productId - Product ID
   * @param quantity - Quantity to increment
   * @returns Result with success status and new soldCount
   */
  abstract incrementSoldCount(
    flashSaleId: string,
    productId: string,
    quantity: number,
  ): Promise<IncrementSoldCountResult>;

  /**
   * Increment sold count for multiple checkout items (fire-and-forget)
   * @param items - Checkout session items
   */
  abstract incrementSoldCountForItems(
    items: Array<{
      flashSaleId?: string | null;
      productId: string;
      variantId?: string | null;
      quantity: number;
    }>,
  ): void;

  /**
   * Find flash sale products for multiple product IDs from the active flash sale
   * @param activeFlashSaleId - The currently active flash sale ID
   * @param productIds - Product IDs to look up
   * @returns Map of productId to flash sale product
   */
  abstract findActiveForProducts(
    activeFlashSaleId: string,
    productIds: string[],
  ): Promise<Map<string, FlashSaleProduct>>;

  /**
   * Find all product IDs and their order for a given flash sale (no pagination)
   * @param flashSaleId - Flash sale ID
   * @returns Array of productId and order pairs, sorted by order ascending
   */
  abstract findProductIdsAndOrderByFlashSaleId(
    flashSaleId: string,
  ): Promise<Array<{ productId: string; order: number }>>;
}
