import { Injectable, Logger, Optional } from '@nestjs/common';
import { TelegramService } from '../../telegram/telegram.service';
import { CheckoutSessionRepository } from './domain/checkout-session.repository';
import { CartRepository } from '../cart/domain/cart.repository';
import { CartItem } from '../cart/domain/cart';
import { SocketService } from '../../socket/socket.service';
import { Order } from '../order/domain/order';
import {
  CheckoutSession,
  CheckoutSessionDiscountDetailType,
} from './domain/checkout-session';
import { SystemTasksService } from '../../system-tasks/system-tasks.service';
import {
  OrderTasksService,
  PromotionUsageParams,
} from '../../order-tasks/order-tasks.service';
import { CommissionSettingsRepository } from '../../commission-settings/domain/commission-settings.repository';
import { CommissionTrigger } from '../../commission-settings/domain/commission-trigger.enum';

/**
 * Service to handle post-payment actions for online payments
 * Centralizes logic for:
 * - Payment success: mark session completed, clear cart, queue post-payment tasks
 * - Payment failure: notify client to allow retry
 */
@Injectable()
export class CheckoutPaymentHandlerService {
  private readonly logger = new Logger(CheckoutPaymentHandlerService.name);

  constructor(
    private readonly checkoutSessionRepository: CheckoutSessionRepository,
    private readonly cartRepository: CartRepository,
    private readonly socketService: SocketService,
    private readonly systemTasksService: SystemTasksService,
    private readonly orderTasksService: OrderTasksService,
    @Optional()
    private readonly commissionSettingsRepository?: CommissionSettingsRepository,
    @Optional()
    private readonly telegramService?: TelegramService,
  ) {}

  /**
   * Handle payment success - complete the checkout flow
   * Called by payment webhooks (OnePay IPN, InfoCMS callback) when payment succeeds
   */
  async handlePaymentSuccess(order: Order): Promise<void> {
    this.logger.log(
      `Processing payment success for order ${order.orderNumber}`,
    );

    try {
      // 1. Find checkout session by orderId
      const session = await this.checkoutSessionRepository.findByOrderId(
        order.id,
      );

      if (!session) {
        this.logger.warn(
          `Checkout session not found for order ${order.orderNumber}. ` +
            `Cart may already be cleared if this is a duplicate callback.`,
        );
        // Still sync to CDP/Nhanh even if session not found
        void this.orderTasksService.queueSyncOrderCdp(order);
        void this.orderTasksService.queueSyncOrderNhanh(order);
        return;
      }

      // 2. Mark session as completed
      await this.checkoutSessionRepository.markCompleted(
        session.id,
        order.id,
        order.orderNumber,
      );

      this.logger.log(
        `Checkout session ${session.sessionNumber} marked as completed`,
      );

      // 3. Clear cart items
      const removedGiftItems = await this.clearSessionItemsFromCart(session);

      // 4. Increment flash sale soldCount via BullMQ for reliable execution
      const flashSaleItems = session.items
        .filter((item) => item.flashSaleId)
        .map((item) => ({
          flashSaleId: item.flashSaleId!,
          productId: item.productId,
          quantity: item.quantity,
        }));
      void this.systemTasksService.queueIncrementFlashSaleSoldCount(
        flashSaleItems,
      );

      // 5. Queue promotion usage increment via payment tasks queue
      void this.orderTasksService.queueIncrementPromotionUsage(
        this.buildPromotionUsageParams(session, order.userId, removedGiftItems),
        order.orderNumber,
      );

      // 6. Queue CDP and Nhanh sync via payment tasks queue
      void this.orderTasksService.queueSyncOrderCdp(order);
      void this.orderTasksService.queueSyncOrderNhanh(order, session.shipping);

      // 7. Queue order confirmation token for ZNS
      void this.orderTasksService.queueCreateOrderConfirmation(order);

      // 7.5. Create affiliate commission for online payment orders (ORDER_CREATION mode)
      if (order.affiliateId && order.affiliateCode) {
        const settings = await this.commissionSettingsRepository?.getOrCreate();
        if (
          !settings ||
          settings.commissionTrigger === CommissionTrigger.ORDER_CREATION
        ) {
          void this.orderTasksService.queueCreateAffiliateCommission(
            order,
            order.affiliateId,
            order.affiliateCode,
          );
        }
      }

      // 8. Notify client to refetch order data via WebSocket
      this.socketService.notifyOrderRefetch({
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        sessionId: order.sessionId,
      });

      this.logger.log(
        `Payment success handling completed for order ${order.orderNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Payment success handling failed for order ${order.orderNumber}`,
        (error as Error).stack,
      );
      void this.telegramService?.sendErrorAlert(
        'CheckoutPaymentHandler.handlePaymentSuccess',
        error as Error,
        { orderNumber: order.orderNumber, orderId: order.id },
      );
      throw error;
    }
  }

  /**
   * Handle payment failure - notify client to allow retry
   * Called by payment webhooks (OnePay IPN) when payment fails
   * Session remains in PENDING_PAYMENT status so customer can retry or modify cart
   */
  handlePaymentFailed(order: Order): void {
    this.logger.log(
      `Processing payment failure for order ${order.orderNumber}`,
    );

    // Notify client to refetch order data via WebSocket
    // This allows the UI to show the failed status and offer retry options
    this.socketService.notifyOrderRefetch({
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      sessionId: order.sessionId,
    });

    this.logger.log(
      `Payment failure handling completed for order ${order.orderNumber}`,
    );
  }

  /**
   * Build PromotionUsageParams from a checkout session for queue serialization
   */
  buildPromotionUsageParams(
    session: CheckoutSession,
    userId?: string | null,
    giftItems?: CartItem[],
  ): PromotionUsageParams {
    // Collect product discounts from session-level discountDetails (voucher-applied)
    const sessionProductDiscountIds = new Set(
      (session.discountDetails || [])
        .filter(
          (d) => d.type === CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT,
        )
        .map((d) => d.referenceId),
    );

    // Also collect auto-applied product discounts from item-level discountDetails
    for (const item of session.items) {
      for (const detail of item.discountDetails || []) {
        if (
          detail.type === CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT &&
          detail.referenceId
        ) {
          sessionProductDiscountIds.add(detail.referenceId);
        }
      }
    }

    const productDiscounts = Array.from(sessionProductDiscountIds).map(
      (referenceId) => ({ referenceId }),
    );

    const orderDiscounts = (session.discountDetails || [])
      .filter(
        (d) => d.type === CheckoutSessionDiscountDetailType.ORDER_DISCOUNT,
      )
      .map((d) => ({ referenceId: d.referenceId }));

    const giftCountByPromotion = new Map<string, number>();
    if (giftItems && giftItems.length > 0) {
      for (const giftItem of giftItems) {
        if (!giftItem.promotionId) continue;
        const existing = giftCountByPromotion.get(giftItem.promotionId) || 0;
        giftCountByPromotion.set(
          giftItem.promotionId,
          existing + (giftItem.quantity ?? 1),
        );
      }
    }
    const bundleDealGifts = Array.from(giftCountByPromotion.entries()).map(
      ([promotionId, count]) => ({ promotionId, count }),
    );

    const items = session.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    return {
      productDiscounts,
      orderDiscounts,
      bundleDealGifts,
      items,
      userId,
    };
  }

  /**
   * Clear session items from cart
   */
  private async clearSessionItemsFromCart(
    session: CheckoutSession,
  ): Promise<CartItem[]> {
    const cart = session.userId
      ? await this.cartRepository.findByUserId(session.userId)
      : await this.cartRepository.findBySessionId(session.sessionId);

    if (!cart) {
      this.logger.debug(
        `No cart found for session ${session.sessionNumber}, skipping cart clear`,
      );
      return [];
    }

    const sessionItemKeys = new Set(
      session.items.map((item) =>
        this.getItemKey(item.productId, item.variantId),
      ),
    );

    // Get ordered combo instance IDs
    const orderedComboIds = new Set(
      session.comboInstances?.map((ci) => ci.comboInstanceId) || [],
    );

    const removedGiftItems = cart.items.filter(
      (item) =>
        item.isGift &&
        sessionItemKeys.has(this.getItemKey(item.productId, item.variantId)),
    );

    // Keep items that were NOT ordered
    const remainingItems = cart.items.filter(
      (item) =>
        !sessionItemKeys.has(this.getItemKey(item.productId, item.variantId)),
    );

    // Keep combo instances that were NOT ordered
    const remainingComboInstances = (cart.comboInstances || []).filter(
      (ci) => !orderedComboIds.has(ci.comboInstanceId),
    );

    await this.cartRepository.update(cart.id, {
      items: remainingItems,
      comboInstances: remainingComboInstances,
    });

    // Notify client to refetch cart data
    this.socketService.notifyCartRefetch(
      cart.id,
      session.userId ?? undefined,
      session.sessionId,
    );

    this.logger.debug(
      `Cleared ${session.items.length} items from cart for session ${session.sessionNumber}`,
    );

    return removedGiftItems;
  }

  /**
   * Generate unique key for item lookup
   */
  private getItemKey(productId: string, variantId?: string | null): string {
    return `${productId}:${variantId || ''}`;
  }
}
