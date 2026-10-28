import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { ProductCategory } from './product-category';
import {
  FilterProductCategoryDto,
  SortProductCategoryDto,
} from '../dto/product-query-category.dto';
import { PaginateResult } from 'mongoose';

/**
 * Abstract repository interface for ProductCategory entity
 */
export abstract class ProductCategoryRepository {
  /**
   * Create a new category
   */
  abstract create(
    data: Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProductCategory>;

  /**
   * Find categories with filtering and pagination
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductCategoryDto | null;
    sortOptions?: SortProductCategoryDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ProductCategory>>;

  /**
   * Find all categories (for tree building)
   */
  abstract findAll(): Promise<ProductCategory[]>;

  /**
   * Find all categories with filtering (no pagination)
   */
  abstract findAllWithFilter({
    filterOptions,
    sortOptions,
  }: {
    filterOptions?: FilterProductCategoryDto | null;
    sortOptions?: SortProductCategoryDto[] | null;
  }): Promise<ProductCategory[]>;

  /**
   * Find category by ID
   */
  abstract findById(
    id: ProductCategory['id'],
  ): Promise<NullableType<ProductCategory>>;

  /**
   * Find category by snapshot ID (source ID) and source
   */
  abstract findBySnapshotId(
    snapshotId: number,
    source: ProductCategory['source'],
  ): Promise<NullableType<ProductCategory>>;

  /**
   * Find category by code
   */
  abstract findByCode(code: string): Promise<NullableType<ProductCategory>>;

  /**
   * Find multiple categories by IDs
   * @param ids - Array of category IDs
   * @returns Array of categories (only found categories, not null for missing)
   */
  abstract findByIds(ids: string[]): Promise<ProductCategory[]>;

  /**
   * Find category by slug within a business
   * @param businessId - Business ID
   * @param slug - SEO-friendly URL slug
   * @returns Category or null if not found
   */
  abstract findBySlug(
    businessId: string,
    slug: string,
  ): Promise<NullableType<ProductCategory>>;

  /**
   * Find child categories by parent ID
   */
  abstract findByParentId(parentId: string): Promise<ProductCategory[]>;

  /**
   * Update existing category
   */
  abstract update(
    id: ProductCategory['id'],
    payload: DeepPartial<ProductCategory>,
  ): Promise<NullableType<ProductCategory>>;

  /**
   * Delete category
   */
  abstract remove(id: ProductCategory['id']): Promise<void>;

  /**
   * Bulk upsert categories (create or update by snapshot.id)
   * Uses MongoDB bulkWrite for optimal performance
   * @param categories - Array of category data
   * @returns Number of categories upserted
   */
  abstract bulkUpsert(
    categories: Array<Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<number>;

  /**
   * Build a mapping of source category IDs (snapshot.id) to MongoDB _ids
   * Used for resolving parent relationships after sync
   * @param businessId - The business ID to filter categories
   * @param source - The source to filter categories
   * @returns Map of snapshot.id (as string) -> MongoDB _id (as string)
   */
  abstract buildSnapshotIdMapping(
    businessId: string,
    source: ProductCategory['source'],
  ): Promise<Map<string, string>>;

  /**
   * Bulk update parentId for categories based on snapshot.parentId mapping
   * @param updates - Array of { id, parentId } updates
   * @returns Number of categories updated
   */
  abstract bulkUpdateParentIds(
    updates: Array<{ id: string; parentId: string }>,
  ): Promise<number>;
}
