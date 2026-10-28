import { PaginateResult } from 'mongoose';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { Banner } from './banner';
import { BannerPosition } from '../model/banner-position.enum';

/**
 * Filter options for querying banners
 */
export interface FilterBannerDto {
  position?: BannerPosition;
  isActive?: boolean;
}

/**
 * Sort options for querying banners
 */
export interface SortBannerDto {
  orderBy: 'order' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}

/**
 * Abstract repository interface for Banner entity
 * Defines the contract for banner data access operations
 */
export abstract class BannerRepository {
  /**
   * Create a new banner
   * @param data - Banner data
   * @returns Created banner
   */
  abstract create(
    data: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Banner>;

  /**
   * Find banners with filtering, sorting and pagination
   * @param filterOptions - Filter options
   * @param sortOptions - Sort options
   * @param paginationOptions - Pagination options
   * @returns Paginated result with banners
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterBannerDto | null;
    sortOptions?: SortBannerDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Banner>>;

  /**
   * Find banner by ID
   * @param id - Banner ID
   * @returns Banner or null if not found
   */
  abstract findById(id: Banner['id']): Promise<NullableType<Banner>>;

  /**
   * Find active banners by position (ordered by order field)
   * @param position - Banner position
   * @returns Array of active banners
   */
  abstract findActiveByPosition(position: BannerPosition): Promise<Banner[]>;

  /**
   * Update existing banner
   * @param id - Banner ID
   * @param payload - Partial banner data to update
   * @returns Updated banner or null if not found
   */
  abstract update(
    id: Banner['id'],
    payload: DeepPartial<Banner>,
  ): Promise<NullableType<Banner>>;

  /**
   * Soft delete banner
   * @param id - Banner ID
   */
  abstract remove(id: Banner['id']): Promise<void>;

  /**
   * Bulk update banner order
   * @param updates - Array of {id, order} pairs
   */
  abstract bulkUpdateOrder(
    updates: Array<{ id: string; order: number }>,
  ): Promise<void>;
}
