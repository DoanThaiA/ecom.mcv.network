import { PaginateResult } from 'mongoose';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { PopupAds } from './popup-ads';

/**
 * Filter options for querying popup ads
 */
export interface FilterPopupAdsDto {
  isActive?: boolean;
  name?: string;
}

/**
 * Sort options for querying popup ads
 */
export interface SortPopupAdsDto {
  orderBy: 'order' | 'createdAt' | 'startAt' | 'endAt';
  order: 'asc' | 'desc';
}

/**
 * Abstract repository interface for PopupAds entity
 * Defines the contract for popup ads data access operations
 */
export abstract class PopupAdsRepository {
  /**
   * Create a new popup ads
   * @param data - PopupAds data
   * @returns Created popup ads
   */
  abstract create(
    data: Omit<PopupAds, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PopupAds>;

  /**
   * Find popup ads with filtering, sorting and pagination
   * @param filterOptions - Filter options
   * @param sortOptions - Sort options
   * @param paginationOptions - Pagination options
   * @returns Paginated result with popup ads
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterPopupAdsDto | null;
    sortOptions?: SortPopupAdsDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<PopupAds>>;

  /**
   * Find popup ads by ID
   * @param id - PopupAds ID
   * @returns PopupAds or null if not found
   */
  abstract findById(id: PopupAds['id']): Promise<NullableType<PopupAds>>;

  /**
   * Find active popup ads within the current time range
   * Returns popups where startAt <= now <= endAt and isActive = true
   * Ordered by order ASC, createdAt ASC
   * @returns Array of active popup ads
   */
  abstract findActiveInRange(): Promise<PopupAds[]>;

  /**
   * Update existing popup ads
   * @param id - PopupAds ID
   * @param payload - Partial popup ads data to update
   * @returns Updated popup ads or null if not found
   */
  abstract update(
    id: PopupAds['id'],
    payload: DeepPartial<PopupAds>,
  ): Promise<NullableType<PopupAds>>;

  /**
   * Soft delete popup ads
   * @param id - PopupAds ID
   */
  abstract remove(id: PopupAds['id']): Promise<void>;
}
