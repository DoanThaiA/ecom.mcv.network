import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { ProductBrand } from './product-brand';
import {
  FilterProductBrandDto,
  SortProductBrandDto,
} from '../dto/product-query-brand.dto';
import { PaginateResult } from 'mongoose';

/**
 * Abstract repository interface for ProductBrand entity
 * Defines the contract for brand data access
 */
export abstract class ProductBrandRepository {
  /**
   * Create a new brand
   * @param data - ProductBrand data
   */
  abstract create(
    data: Omit<ProductBrand, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProductBrand>;

  /**
   * Find brands with filtering and pagination
   * @param filterOptions - Filter options
   * @param sortOptions - Sort options
   * @param paginationOptions - Pagination options
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductBrandDto | null;
    sortOptions?: SortProductBrandDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ProductBrand>>;

  /**
   * Find brand by ID
   * @param id - ProductBrand ID
   */
  abstract findById(
    id: ProductBrand['id'],
  ): Promise<NullableType<ProductBrand>>;

  /**
   * Find brand by snapshot ID (source ID) and source
   * @param snapshotId - Snapshot ID from source system
   * @param source - Data source
   */
  abstract findBySnapshotId(
    snapshotId: number,
    source: ProductBrand['source'],
  ): Promise<NullableType<ProductBrand>>;

  /**
   * Update brand
   * @param id - ProductBrand ID
   * @param payload - Update data
   */
  abstract update(
    id: ProductBrand['id'],
    payload: DeepPartial<ProductBrand>,
  ): Promise<NullableType<ProductBrand>>;

  /**
   * Soft delete brand
   * @param id - ProductBrand ID
   */
  abstract remove(id: ProductBrand['id']): Promise<void>;

  /**
   * Bulk upsert brands (create or update by snapshot.id)
   * Uses MongoDB bulkWrite for optimal performance
   * @param brands - Array of brand data
   * @returns Number of brands upserted
   */
  abstract bulkUpsert(
    brands: Array<Omit<ProductBrand, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<number>;
}
