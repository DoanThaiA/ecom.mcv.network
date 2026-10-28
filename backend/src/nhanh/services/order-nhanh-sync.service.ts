import { Injectable, Logger } from '@nestjs/common';
import { NhanhService } from './nhanh.service';
import { OrderRepository } from '../../shop/order/domain/order.repository';
import { ProductRepository } from '../../products/domain/product.repository';
import { Order } from '../../shop/order/domain/order';
import { CheckoutSessionShipping } from '../../shop/checkout/domain/checkout-session';
import { NhanhSyncStatus } from '../../shop/order/domain/nhanh-sync-status.enum';
import { OrderNhanhMapper } from '../mappers/order-nhanh.mapper';
import { NhanhRateLimitException } from '../exceptions/nhanh-rate-limit.exception';

export interface OrderNhanhSyncResult {
  nhanhOrderId: number | null;
  trackingUrl: string | null;
  success: boolean;
  /** Failure reason when success is false; null on success. */
  error: string | null;
}

@Injectable()
export class OrderNhanhSyncService {
  private readonly logger = new Logger(OrderNhanhSyncService.name);

  constructor(
    private readonly nhanhService: NhanhService,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  /**
   * Sync order to Nhanh.vn
   * Called after order creation in checkout flow
   *
   * @param order - Order to sync
   * @param shipping - Optional shipping info from checkout session
   * @returns Sync result with Nhanh order ID and tracking URL
   */
  async syncOrder(
    order: Order,
    shipping?: CheckoutSessionShipping | null,
  ): Promise<OrderNhanhSyncResult> {
    try {
      this.logger.log(`Syncing order ${order.orderNumber} to Nhanh.vn`);

      // Get product Nhanh IDs
      const productNhanhIds = await this.getProductNhanhIds(order);

      if (productNhanhIds.size === 0) {
        const errorMsg = 'No products with Nhanh IDs found in order';
        this.logger.warn(`${errorMsg}: ${order.orderNumber}`);
        await this.orderRepository.updateNhanhSyncStatus(
          order.id,
          NhanhSyncStatus.FAILED,
          undefined,
          undefined,
          errorMsg,
        );
        return {
          nhanhOrderId: null,
          trackingUrl: null,
          success: false,
          error: errorMsg,
        };
      }

      // Build request payload
      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        shipping,
      );

      this.logger.debug(`Nhanh order payload: ${JSON.stringify(payload)}`);

      // Check if we have any products to sync
      if (payload.products.length === 0) {
        const errorMsg = 'No valid products to sync after mapping';
        this.logger.warn(`${errorMsg}: ${order.orderNumber}`);
        await this.orderRepository.updateNhanhSyncStatus(
          order.id,
          NhanhSyncStatus.FAILED,
          undefined,
          undefined,
          errorMsg,
        );
        return {
          nhanhOrderId: null,
          trackingUrl: null,
          success: false,
          error: errorMsg,
        };
      }

      // Call Nhanh API
      const response = await this.nhanhService.addOrder(payload);

      if (response.code === 1 && response.data) {
        // Success
        await this.orderRepository.updateNhanhSyncStatus(
          order.id,
          NhanhSyncStatus.SYNCED,
          response.data.id,
          response.data.trackingUrl,
        );

        this.logger.log(
          `Order ${order.orderNumber} synced to Nhanh.vn successfully. ` +
            `Nhanh ID: ${response.data.id}`,
        );

        return {
          nhanhOrderId: response.data.id,
          trackingUrl: response.data.trackingUrl,
          success: true,
          error: null,
        };
      }

      // addOrder throws on API errors, so this branch is defensive only.
      const apiErrorMsg = response.messages
        ? JSON.stringify(response.messages)
        : response.errorCode || 'Unknown error from Nhanh API';
      return await this.resolveSyncFailure(order, new Error(apiErrorMsg));
    } catch (error) {
      this.logger.error(
        `Error syncing order ${order.orderNumber} to Nhanh.vn`,
        error,
      );
      return this.resolveSyncFailure(order, error);
    }
  }

  /**
   * Resolve a failed Nhanh sync attempt.
   *
   * The add request may have failed even though the order already exists on
   * Nhanh — a duplicate "đã tồn tại" error on retry, or a timeout after Nhanh
   * had already created the order. In those cases the order would otherwise be
   * stuck in the "not synced" state forever, since we never captured its Nhanh
   * id. So, for non-transient errors, we look the order up on Nhanh by the
   * customer's phone and, if found, recover the real Nhanh id + tracking url and
   * mark it SYNCED. Rate-limit errors are transient and are recorded as-is,
   * without a lookup that would just hit the same limit.
   *
   * @param order - Order whose sync failed
   * @param error - The error thrown by the add attempt
   * @returns Sync result (recovered success, or recorded failure)
   */
  private async resolveSyncFailure(
    order: Order,
    error: unknown,
  ): Promise<OrderNhanhSyncResult> {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    // Rate-limit is transient — record it and bail out without a lookup.
    if (!(error instanceof NhanhRateLimitException)) {
      const recovered = await this.recoverViaLookup(order);
      if (recovered) {
        return recovered;
      }
    }

    await this.orderRepository.updateNhanhSyncStatus(
      order.id,
      NhanhSyncStatus.FAILED,
      undefined,
      undefined,
      errorMsg,
    );

    this.logger.error(
      `Failed to sync order ${order.orderNumber} to Nhanh.vn: ${errorMsg}`,
    );

    return {
      nhanhOrderId: null,
      trackingUrl: null,
      success: false,
      error: errorMsg,
    };
  }

  /**
   * Try to recover an order's Nhanh sync state by looking it up on Nhanh.
   * On a match, persists the Nhanh order id + tracking url and marks the
   * order SYNCED — mirroring what the order webhook would have done.
   *
   * @param order - Order to recover
   * @returns A successful sync result if found on Nhanh, otherwise null
   */
  private async recoverViaLookup(
    order: Order,
  ): Promise<OrderNhanhSyncResult | null> {
    try {
      const found = await this.nhanhService.findExistingOrder(
        order.customer.phone,
        order.createdAt,
        order.total,
      );
      if (!found) {
        return null;
      }

      await this.orderRepository.updateNhanhSyncStatus(
        order.id,
        NhanhSyncStatus.SYNCED,
        found.id,
        found.trackingUrl,
      );

      this.logger.log(
        `Recovered Nhanh sync for order ${order.orderNumber} via list lookup. ` +
          `Nhanh ID: ${found.id}`,
      );

      return {
        nhanhOrderId: found.id,
        trackingUrl: found.trackingUrl ?? null,
        success: true,
        error: null,
      };
    } catch (lookupError) {
      // Don't let a lookup failure mask the original sync error; fall through
      // to the normal failure path.
      this.logger.warn(
        `Nhanh lookup recovery failed for order ${order.orderNumber}: ` +
          `${lookupError instanceof Error ? lookupError.message : 'unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Get Nhanh product IDs for all products in the order
   * Maps internal product IDs to Nhanh product IDs via snapshot.id
   *
   * @param order - Order containing items
   * @returns Map of productId -> Nhanh product ID
   */
  private async getProductNhanhIds(order: Order): Promise<Map<string, number>> {
    const productNhanhIds = new Map<string, number>();

    // Collect all product IDs (use variantId if present, else productId)
    const productIds = order.items.map(
      (item) => item.variantId ?? item.productId,
    );
    const uniqueProductIds = [...new Set(productIds)];

    if (uniqueProductIds.length === 0) {
      return productNhanhIds;
    }

    // Fetch products from database
    const products = await this.productRepository.findByIds(uniqueProductIds);

    // Build mapping
    for (const product of products) {
      const snapshotId = (product.snapshot as any)?.id;
      if (snapshotId && typeof snapshotId === 'number') {
        productNhanhIds.set(product.id, snapshotId);
      } else {
        this.logger.warn(
          `Product ${product.id} (${product.code}) has no Nhanh snapshot ID`,
        );
      }
    }

    return productNhanhIds;
  }
}
