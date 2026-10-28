import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { ProductCommission } from './product-commission';
import { PaginateResult } from 'mongoose';
import {
  FilterProductCommissionDto,
  SortProductCommissionDto,
} from '../dto/query-product-commission.dto';

export abstract class ProductCommissionRepository {
  abstract upsertMany(
    products: Omit<ProductCommission, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<number>;

  abstract findManyWithPagination({
    affiliateId,
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    affiliateId: string | null;
    filterOptions?: FilterProductCommissionDto | null;
    sortOptions?: SortProductCommissionDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ProductCommission>>;

  abstract findOne(
    affiliateId: string | null,
    productId: string,
  ): Promise<NullableType<ProductCommission>>;

  abstract updateRate(
    affiliateId: string | null,
    productId: string,
    commissionRate: number,
    estimatedCommission: number,
    isCustomRate: boolean,
  ): Promise<NullableType<ProductCommission>>;

  abstract bulkUpdateRate(
    affiliateId: string | null,
    productIds: string[],
    commissionRate: number,
    isCustomRate: boolean,
  ): Promise<number>;

  abstract removeOne(
    affiliateId: string | null,
    productId: string,
  ): Promise<boolean>;

  abstract bulkRemove(
    affiliateId: string | null,
    productIds: string[],
  ): Promise<number>;

  abstract findProductIdsByAffiliate(
    affiliateId: string | null,
  ): Promise<string[]>;

  abstract bulkWrite(operations: any[]): Promise<void>;

  abstract deleteByProductIds(productIds: string[]): Promise<number>;

  abstract updateManyByFilter(
    filter: Record<string, any>,
    update: Record<string, any> | any[],
  ): Promise<number>;

  /**
   * Find categories for a set of product IDs (deduplicates by productId)
   */
  abstract findCategoriesByProductIds(
    productIds: string[],
  ): Promise<Map<string, { id: string; name: string }>>;

  /**
   * Find product IDs matching a category name (across all affiliates including global)
   */
  abstract findProductIdsByCategoryName(
    categoryName: string,
  ): Promise<string[]>;

  /**
   * Find product commissions for analytics: both global (affiliateId=null)
   * and affiliate-specific rows, with search/category/pagination support.
   */
  abstract findForAnalytics(options: {
    affiliateId: string;
    search?: string;
    categoryName?: string;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ProductCommission>>;
}
