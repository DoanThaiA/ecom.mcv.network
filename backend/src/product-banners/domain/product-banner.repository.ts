import { PaginateResult } from 'mongoose';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { ProductBanner, ProductBannerProduct } from './product-banner';

/**
 * Filter options for querying product banners
 */
export interface FilterProductBannerDto {
  search?: string;
  isActive?: boolean;
}

/**
 * Sort options for querying product banners
 */
export interface SortProductBannerDto {
  orderBy: 'createdAt' | 'updatedAt' | 'name';
  order: 'asc' | 'desc';
}

/**
 * Abstract repository interface for ProductBanner entity
 * Defines the contract for product banner data access operations
 */
export abstract class ProductBannerRepository {
  /**
   * Create a new product banner
   * @param data - Product banner data
   * @returns Created product banner
   */
  abstract create(
    data: Omit<ProductBanner, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProductBanner>;

  /**
   * Find product banners with filtering, sorting and pagination
   * @param filterOptions - Filter options
   * @param sortOptions - Sort options
   * @param paginationOptions - Pagination options
   * @returns Paginated result with product banners
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductBannerDto | null;
    sortOptions?: SortProductBannerDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ProductBanner>>;

  /**
   * Find product banner by ID
   * @param id - Product banner ID
   * @returns Product banner or null if not found
   */
  abstract findById(
    id: ProductBanner['id'],
  ): Promise<NullableType<ProductBanner>>;

  /**
   * Find product banner by product ID
   * @param productId - Product ID
   * @returns Product banner or null if not found
   */
  abstract findByProductId(
    productId: string,
  ): Promise<NullableType<ProductBanner>>;

  /**
   * Update existing product banner
   * @param id - Product banner ID
   * @param payload - Partial product banner data to update
   * @returns Updated product banner or null if not found
   */
  abstract update(
    id: ProductBanner['id'],
    payload: DeepPartial<ProductBanner>,
  ): Promise<NullableType<ProductBanner>>;

  /**
   * Soft delete product banner
   * @param id - Product banner ID
   */
  abstract remove(id: ProductBanner['id']): Promise<void>;

  /**
   * Add products to a banner
   * @param id - Product banner ID
   * @param products - Products to add
   * @returns Updated product banner
   */
  abstract addProducts(
    id: ProductBanner['id'],
    products: ProductBannerProduct[],
  ): Promise<NullableType<ProductBanner>>;

  /**
   * Remove products from a banner
   * @param id - Product banner ID
   * @param productIds - Product IDs to remove
   * @returns Updated product banner
   */
  abstract removeProducts(
    id: ProductBanner['id'],
    productIds: string[],
  ): Promise<NullableType<ProductBanner>>;
}
