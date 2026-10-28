import { PaginateResult } from 'mongoose';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Order, PaymentEvent } from './order';
import { OrderStatus, PaymentStatus } from './order.enums';
import { CdpSyncStatus } from './cdp-sync-status.enum';
import { NhanhSyncStatus } from './nhanh-sync-status.enum';
import { CustomerTransaction } from '../../../cdp/types/customerTransaction.types';

/**
 * Filter options for orders
 */
export interface OrderFilterOptions {
  userId?: string;
  sessionId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  orderNumber?: string;
  phone?: string;
  fromDate?: Date;
  toDate?: Date;
  /**
   * Filter by Nhanh.vn sync state.
   * true = synced (nhanh.orderId exists), false = not synced.
   */
  nhanhSynced?: boolean;
}

/**
 * Sort options for orders
 */
export interface OrderSortOptions {
  orderBy: 'createdAt' | 'total' | 'orderNumber';
  order: 'asc' | 'desc';
}

/**
 * Abstract repository interface for Order entity
 */
export abstract class OrderRepository {
  /**
   * Find order by ID
   */
  abstract findById(id: Order['id']): Promise<NullableType<Order>>;

  /**
   * Find order by order number
   */
  abstract findByOrderNumber(orderNumber: string): Promise<NullableType<Order>>;

  /**
   * Find order by Nhanh.vn order ID
   */
  abstract findByNhanhOrderId(
    nhanhOrderId: number,
  ): Promise<NullableType<Order>>;

  /**
   * Find orders with filtering and pagination
   */
  abstract findManyWithPagination(options: {
    filterOptions?: OrderFilterOptions;
    sortOptions?: OrderSortOptions;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Order>>;

  /**
   * Count orders that have not been synced to Nhanh.vn yet
   * (orders where nhanh.orderId does not exist)
   */
  abstract countUnsyncedToNhanh(): Promise<number>;

  /**
   * Find orders by user ID
   */
  abstract findByUserId(userId: string): Promise<Order[]>;

  /**
   * Find orders by session ID (for guest order lookup)
   */
  abstract findBySessionId(sessionId: string): Promise<Order[]>;

  /**
   * Find order by session ID and order number (for guest order lookup)
   */
  abstract findBySessionIdAndOrderNumber(
    sessionId: string,
    orderNumber: string,
  ): Promise<NullableType<Order>>;

  /**
   * Create a new order
   */
  abstract create(
    data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Order>;

  /**
   * Update order
   */
  abstract update(
    id: Order['id'],
    payload: Partial<Omit<Order, 'id' | 'createdAt' | 'orderNumber'>>,
  ): Promise<NullableType<Order>>;

  /**
   * Generate next order number
   */
  abstract generateOrderNumber(): Promise<string>;

  /**
   * Find guest orders by phone number (orders without userId)
   */
  abstract findGuestOrdersByPhone(phone: string): Promise<Order[]>;

  /**
   * Assign orders to a user (for phone linking merge)
   */
  abstract assignOrdersToUser(
    orderIds: string[],
    userId: string,
    cdpCustomerId?: string,
  ): Promise<number>;

  /**
   * Update CDP sync status for an order
   */
  abstract updateCdpSyncStatus(
    orderId: string,
    status: CdpSyncStatus,
    cdpCustomerId?: string,
    error?: string,
    customerTransaction?: CustomerTransaction,
  ): Promise<void>;

  /**
   * Update Nhanh.vn sync status for an order
   */
  abstract updateNhanhSyncStatus(
    orderId: string,
    status: NhanhSyncStatus,
    nhanhOrderId?: number,
    trackingUrl?: string,
    error?: string,
  ): Promise<void>;

  /**
   * Add a payment event and update payment status atomically
   * - INITIATED: sets paymentStatus to PENDING
   * - SUCCESS: sets paymentStatus to PAID
   * - FAILED: sets paymentStatus to FAILED
   * Returns the updated order
   */
  abstract addPaymentEvent(
    orderId: string,
    event: PaymentEvent,
  ): Promise<NullableType<Order>>;

  /**
   * Find product IDs frequently co-purchased with the given products
   * Uses aggregation on non-cancelled orders from the last 6 months
   * @param productIds - Product IDs to find co-purchases for
   * @param excludeIds - Product IDs to exclude from results
   * @param limit - Maximum number of results
   * @returns Product IDs with co-purchase counts, sorted by count desc
   */
  abstract findCoPurchasedProductIds(
    productIds: string[],
    excludeIds: string[],
    limit: number,
  ): Promise<Array<{ productId: string; count: number }>>;

  /**
   * Get distinct user IDs from orders in the last N months
   * @param months - Number of months to look back
   * @returns Distinct user IDs
   */
  abstract getDistinctUserIds(months: number): Promise<string[]>;

  /**
   * Get purchased product IDs and category IDs for a user
   * @param userId - User ID
   * @param months - Number of months to look back
   * @returns Object with productIds and categoryIds arrays
   */
  abstract getUserPurchaseHistory(
    userId: string,
    months: number,
  ): Promise<{ productIds: string[]; categoryIds: string[] }>;
}
