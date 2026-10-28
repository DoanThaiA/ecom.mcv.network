import { PaginateResult } from 'mongoose';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { Menu } from './menu';
import { MenuStatus } from './menu-status.enum';

/**
 * Filter options for querying menus
 */
export interface FilterMenuDto {
  status?: MenuStatus;
  search?: string;
  parentId?: string | null;
}

/**
 * Sort options for querying menus
 */
export interface SortMenuDto {
  orderBy: 'createdAt' | 'name' | 'order';
  order: 'asc' | 'desc';
}

/**
 * Abstract repository interface for Menu entity
 * Defines the contract for menu data access operations
 */
export abstract class MenuRepository {
  /**
   * Create a new menu
   * @param data - Menu data
   * @returns Created menu
   */
  abstract create(
    data: Omit<Menu, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Menu>;

  /**
   * Find menus with filtering, sorting and pagination
   * @param filterOptions - Filter options
   * @param sortOptions - Sort options
   * @param paginationOptions - Pagination options
   * @returns Paginated result with menus
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterMenuDto | null;
    sortOptions?: SortMenuDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Menu>>;

  /**
   * Find menu by ID
   * @param id - Menu ID
   * @returns Menu or null if not found
   */
  abstract findById(id: Menu['id']): Promise<NullableType<Menu>>;

  /**
   * Find all active menus (for public API)
   * @returns Array of active menus ordered by display order
   */
  abstract findAllActive(): Promise<Menu[]>;

  /**
   * Find all menus (for tree building)
   * @returns Array of all menus ordered by display order
   */
  abstract findAll(): Promise<Menu[]>;

  /**
   * Find all menus with filtering and sorting (no pagination)
   * @param filterOptions - Filter options
   * @param sortOptions - Sort options
   * @returns Array of menus
   */
  abstract findMany({
    filterOptions,
    sortOptions,
  }: {
    filterOptions?: FilterMenuDto | null;
    sortOptions?: SortMenuDto[] | null;
  }): Promise<Menu[]>;

  /**
   * Find child menus by parent ID
   * @param parentId - Parent menu ID (null for root menus)
   * @returns Array of child menus
   */
  abstract findByParentId(parentId: string | null): Promise<Menu[]>;

  /**
   * Update existing menu
   * @param id - Menu ID
   * @param payload - Partial menu data to update
   * @returns Updated menu or null if not found
   */
  abstract update(
    id: Menu['id'],
    payload: DeepPartial<Menu>,
  ): Promise<NullableType<Menu>>;

  /**
   * Bulk update menu orders
   * @param updates - Array of menu IDs with their new order values
   */
  abstract bulkUpdateOrder(
    updates: Array<{ id: string; order: number }>,
  ): Promise<void>;

  /**
   * Soft delete menu
   * @param id - Menu ID
   */
  abstract remove(id: Menu['id']): Promise<void>;
}
