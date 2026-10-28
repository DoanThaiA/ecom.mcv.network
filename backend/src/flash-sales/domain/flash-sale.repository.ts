import { PaginateResult } from 'mongoose';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { FlashSale } from './flash-sale';
import { FlashSaleStatus } from './flash-sale-status.enum';

/**
 * Filter options for querying flash sales
 */
export interface FilterFlashSaleDto {
  status?: FlashSaleStatus;
  search?: string;
}

/**
 * Sort options for querying flash sales
 */
export interface SortFlashSaleDto {
  orderBy: 'createdAt' | 'name' | 'startTime' | 'endTime';
  order: 'asc' | 'desc';
}

/**
 * Abstract repository interface for FlashSale entity
 * Defines the contract for flash sale data access operations
 * Product operations are handled by FlashSaleProductRepository
 */
export abstract class FlashSaleRepository {
  /**
   * Create a new flash sale
   * @param data - Flash sale data
   * @returns Created flash sale
   */
  abstract create(
    data: Omit<FlashSale, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<FlashSale>;

  /**
   * Find flash sales with filtering, sorting and pagination
   * @param filterOptions - Filter options
   * @param sortOptions - Sort options
   * @param paginationOptions - Pagination options
   * @returns Paginated result with flash sales
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterFlashSaleDto | null;
    sortOptions?: SortFlashSaleDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<FlashSale>>;

  /**
   * Find flash sale by ID
   * @param id - Flash sale ID
   * @returns Flash sale or null if not found
   */
  abstract findById(id: FlashSale['id']): Promise<NullableType<FlashSale>>;

  /**
   * Update existing flash sale
   * @param id - Flash sale ID
   * @param payload - Partial flash sale data to update
   * @returns Updated flash sale or null if not found
   */
  abstract update(
    id: FlashSale['id'],
    payload: DeepPartial<FlashSale>,
  ): Promise<NullableType<FlashSale>>;

  /**
   * Soft delete flash sale
   * @param id - Flash sale ID
   */
  abstract remove(id: FlashSale['id']): Promise<void>;

  /**
   * Find the currently active flash sale (only one can be active at a time)
   * Active: currently within time range and enabled
   * @returns The active flash sale or null if none is active
   */
  abstract findCurrentlyActive(): Promise<NullableType<FlashSale>>;

  /**
   * Check if a flash sale with the given time range would overlap with existing flash sales
   * Used to enforce the constraint that only one flash sale can be active at a time
   * @param startTime - Start time of the new/updated flash sale
   * @param endTime - End time of the new/updated flash sale
   * @param excludeId - Optional ID to exclude (for updates)
   * @returns The overlapping flash sale or null if no overlap
   */
  abstract findOverlapping(
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<NullableType<FlashSale>>;

  /**
   * Find all active and upcoming flash sales
   * Active: currently within time range and enabled
   * Upcoming: start time in future and enabled
   * @returns Array of flash sales sorted by startTime
   */
  abstract findActiveAndUpcoming(): Promise<FlashSale[]>;
}
