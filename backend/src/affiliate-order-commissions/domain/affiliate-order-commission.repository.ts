import { NullableType } from '../../utils/types/nullable.type';
import { AffiliateOrderCommission } from './affiliate-order-commission';
import { PaginateResult } from 'mongoose';
import { IPaginationOptions } from '../../utils/types/pagination-options';

export interface AffiliateOrderOverview {
  successfulOrders: number;
  revenueGenerated: number;
  estimatedCommission: number;
}

export interface AffiliateProductAnalyticsItem {
  productId: string;
  productName: string;
  productCode: string;
  commissionRate: number;
  successfulOrders: number;
  revenueGenerated: number;
  estimatedCommission: number;
}

export abstract class AffiliateOrderCommissionRepository {
  /**
   * Create a new commission record
   */
  abstract create(
    data: Omit<AffiliateOrderCommission, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<AffiliateOrderCommission>;

  /**
   * Find commission record by order ID
   */
  abstract findByOrderId(
    orderId: string,
  ): Promise<NullableType<AffiliateOrderCommission>>;

  /**
   * Update order status on commission record
   */
  abstract updateOrderStatus(
    orderId: string,
    orderStatus: string,
  ): Promise<void>;

  /**
   * Find paginated commissions for an affiliate
   */
  abstract findManyByAffiliate(options: {
    affiliateId: string;
    paginationOptions: IPaginationOptions;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<PaginateResult<AffiliateOrderCommission>>;

  /**
   * Aggregate overview stats for an affiliate (orders with non-cancelled status)
   */
  abstract aggregateOverview(
    affiliateId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<AffiliateOrderOverview>;

  /**
   * Aggregate per-product stats for an affiliate, grouped by (productId, commissionRate).
   * Supports pagination, search, and optional productId filtering.
   */
  abstract aggregateByProducts(options: {
    affiliateId: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
    productIds?: string[];
    paginationOptions: IPaginationOptions;
  }): Promise<{ data: AffiliateProductAnalyticsItem[]; total: number }>;

  /**
   * Sum total earned commission for an affiliate across all successful orders (all time)
   */
  abstract sumTotalCommission(affiliateId: string): Promise<number>;

  /**
   * Find un-audited commission records with successful order status
   */
  abstract findUnaudited(
    batchSize: number,
  ): Promise<AffiliateOrderCommission[]>;

  /**
   * Mark commission records as audited by setting auditedAt timestamp
   */
  abstract markAudited(ids: string[]): Promise<void>;

  /**
   * Clear auditedAt for commissions whose order status is no longer successful
   */
  abstract deauditNonSuccessful(): Promise<number>;

  /**
   * Sum total commission for an affiliate, only counting audited records
   */
  abstract sumAuditedCommission(affiliateId: string): Promise<number>;

  /**
   * Aggregate total order count for specific products, grouped by productId only (rate-agnostic).
   * Returns a Map keyed by productId.
   */
  abstract aggregateTotalOrdersByProductIds(options: {
    affiliateId: string;
    productIds: string[];
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Map<string, { successfulOrders: number }>>;
}
