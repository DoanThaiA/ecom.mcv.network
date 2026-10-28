import { PaginateResult } from 'mongoose';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { Combo } from './combo';
import { ComboStatus } from './combo-status.enum';

/**
 * Filter options for querying combos
 */
export interface FilterComboDto {
  status?: ComboStatus;
  search?: string;
  isValid?: boolean;
  productId?: string;
}

/**
 * Sort options for querying combos
 */
export interface SortComboDto {
  orderBy: 'createdAt' | 'name' | 'originalPrice';
  order: 'asc' | 'desc';
}

/**
 * Abstract repository interface for Combo entity
 * Defines the contract for combo data access operations
 */
export abstract class ComboRepository {
  /**
   * Create a new combo
   * @param data - Combo data
   * @returns Created combo
   */
  abstract create(
    data: Omit<Combo, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Combo>;

  /**
   * Find combos with filtering, sorting and pagination
   * @param filterOptions - Filter options
   * @param sortOptions - Sort options
   * @param paginationOptions - Pagination options
   * @returns Paginated result with combos
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterComboDto | null;
    sortOptions?: SortComboDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Combo>>;

  /**
   * Find combo by ID
   * @param id - Combo ID
   * @returns Combo or null if not found
   */
  abstract findById(id: Combo['id']): Promise<NullableType<Combo>>;

  /**
   * Find multiple combos by IDs
   * @param ids - Array of combo IDs
   * @returns Array of combos found
   */
  abstract findByIds(ids: string[]): Promise<Combo[]>;

  /**
   * Find active combos that contain a specific product
   * @param productId - Product ID to search for
   * @returns Array of active combos containing the product
   */
  abstract findActiveByProductId(productId: string): Promise<Combo[]>;

  /**
   * Find active combos that contain any of the specified products
   * @param productIds - Array of product IDs to search for
   * @returns Array of active combos containing any of the products
   */
  abstract findActiveByProductIds(productIds: string[]): Promise<Combo[]>;

  /**
   * Update existing combo
   * @param id - Combo ID
   * @param payload - Partial combo data to update
   * @returns Updated combo or null if not found
   */
  abstract update(
    id: Combo['id'],
    payload: DeepPartial<Combo>,
  ): Promise<NullableType<Combo>>;

  /**
   * Soft delete combo
   * @param id - Combo ID
   */
  abstract remove(id: Combo['id']): Promise<void>;
}
