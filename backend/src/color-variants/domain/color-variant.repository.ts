import { PaginateResult } from 'mongoose';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { ColorVariant } from './color-variant';
import { ColorVariantDisplayType } from './color-variant-display-type.enum';

/**
 * Filter options for querying color variants
 */
export interface FilterColorVariantDto {
  displayType?: ColorVariantDisplayType;
  name?: string;
}

/**
 * Sort options for querying color variants
 */
export interface SortColorVariantDto {
  orderBy: 'order' | 'name' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}

/**
 * Abstract repository interface for ColorVariant entity
 * Defines the contract for color variant data access operations
 */
export abstract class ColorVariantRepository {
  /**
   * Create a new color variant
   * @param data - Color variant data
   * @returns Created color variant
   */
  abstract create(
    data: Omit<ColorVariant, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ColorVariant>;

  /**
   * Find color variants with filtering, sorting and pagination
   * @param filterOptions - Filter options
   * @param sortOptions - Sort options
   * @param paginationOptions - Pagination options
   * @returns Paginated result with color variants
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterColorVariantDto | null;
    sortOptions?: SortColorVariantDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ColorVariant>>;

  /**
   * Find color variant by ID
   * @param id - Color variant ID
   * @returns Color variant or null if not found
   */
  abstract findById(
    id: ColorVariant['id'],
  ): Promise<NullableType<ColorVariant>>;

  /**
   * Find all color variants (ordered by order field)
   * @returns Array of color variants
   */
  abstract findAll(): Promise<ColorVariant[]>;

  /**
   * Find color variants by normalized names (batch lookup)
   * @param normalizedNames - Array of normalized color names
   * @returns Array of matching color variants
   */
  abstract findByNormalizedNames(
    normalizedNames: string[],
  ): Promise<ColorVariant[]>;

  /**
   * Check if a color variant with the given normalized name exists
   * @param nameNormalized - Normalized color name
   * @param excludeId - Optional ID to exclude (for update validation)
   * @returns True if exists
   */
  abstract existsByNormalizedName(
    nameNormalized: string,
    excludeId?: string,
  ): Promise<boolean>;

  /**
   * Update existing color variant
   * @param id - Color variant ID
   * @param payload - Partial color variant data to update
   * @returns Updated color variant or null if not found
   */
  abstract update(
    id: ColorVariant['id'],
    payload: DeepPartial<ColorVariant>,
  ): Promise<NullableType<ColorVariant>>;

  /**
   * Hard delete color variant
   * @param id - Color variant ID
   */
  abstract remove(id: ColorVariant['id']): Promise<void>;
}
