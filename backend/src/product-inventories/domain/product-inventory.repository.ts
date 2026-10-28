import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { ProductInventory } from './product-inventory';
import {
  FilterProductInventoryDto,
  SortProductInventoryDto,
} from '../dto/query-product-inventory.dto';
import { PaginateResult } from 'mongoose';

/**
 * Abstract repository interface for ProductInventory entity
 */
export abstract class ProductInventoryRepository {
  /**
   * Create or update inventory record
   */
  abstract upsert(
    data: Omit<ProductInventory, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProductInventory>;

  /**
   * Find inventory records with filtering and pagination
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductInventoryDto | null;
    sortOptions?: SortProductInventoryDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ProductInventory>>;

  /**
   * Find inventory by ID
   */
  abstract findById(
    id: ProductInventory['id'],
  ): Promise<NullableType<ProductInventory>>;

  /**
   * Find inventory by product ID
   */
  abstract findByProductId(
    productId: string,
  ): Promise<NullableType<ProductInventory>>;

  /**
   * Find inventories by multiple product IDs
   */
  abstract findByProductIds(productIds: string[]): Promise<ProductInventory[]>;

  /**
   * Find inventory by snapshot product ID (source product ID) and source
   */
  abstract findBySnapshotProductId(
    snapshotProductId: number,
    source: ProductInventory['source'],
  ): Promise<NullableType<ProductInventory>>;

  /**
   * Update existing inventory
   */
  abstract update(
    id: ProductInventory['id'],
    payload: DeepPartial<ProductInventory>,
  ): Promise<NullableType<ProductInventory>>;

  /**
   * Delete inventory record
   */
  abstract remove(id: ProductInventory['id']): Promise<void>;

  /**
   * Bulk upsert inventory (create or update by productId)
   * Uses MongoDB bulkWrite for optimal performance
   * @param inventories - Array of inventory data
   * @returns Number of inventories upserted
   */
  abstract bulkUpsert(
    inventories: Array<
      Omit<ProductInventory, 'id' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<number>;
}
