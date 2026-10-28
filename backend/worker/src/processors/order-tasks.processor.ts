import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger, Optional } from '@nestjs/common';
import { Job } from 'bullmq';

import { OrderTaskType } from '@app/order-tasks/domain/order-task-type.enum';
import {
  OrderTaskData,
  PromotionUsageParams,
} from '@app/order-tasks/order-tasks.service';
import { orderTaskQueueName } from '@app/utils/env';
import { Order } from '@app/shop/order/domain/order';
import { CheckoutSessionShipping } from '@app/shop/checkout/domain/checkout-session';
import { OrderCdpSyncService } from '@app/cdp/order-cdp-sync.service';
import { OrderNhanhSyncService } from '@app/nhanh/services/order-nhanh-sync.service';
import { OrderConfirmationService } from '@app/shop/order-confirmation/order-confirmation.service';
import { AffiliateOrderCommissionsService } from '@app/affiliate-order-commissions/affiliate-order-commissions.service';
import { PromotionRepository } from '@app/promotions/domain/promotion.repository';
import { PromotionProductRepository } from '@app/promotion-products/domain/promotion-product.repository';
import { PromotionUsageRecordRepository } from '@app/promotion-usage-records/domain/promotion-usage-record.repository';
import { TelegramService } from '@app/telegram/telegram.service';

@Injectable()
@Processor(orderTaskQueueName, {
  lockDuration: 120000,
  stalledInterval: 120000,
  concurrency: 5,
})
export class OrderTasksProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderTasksProcessor.name);

  constructor(
    private readonly orderCdpSyncService: OrderCdpSyncService,
    private readonly orderNhanhSyncService: OrderNhanhSyncService,
    private readonly orderConfirmationService: OrderConfirmationService,
    private readonly affiliateOrderCommissionsService: AffiliateOrderCommissionsService,
    private readonly promotionRepository: PromotionRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
    private readonly promotionUsageRecordRepository: PromotionUsageRecordRepository,
    @Optional()
    private readonly telegramService?: TelegramService,
  ) {
    super();
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<OrderTaskData>, error: Error): void {
    if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
      this.logger.error(
        `Job ${job.data.type} permanently failed after ${job.attemptsMade} attempts`,
        error.stack,
      );
      void this.telegramService?.sendErrorAlert(
        `OrderTasksProcessor.${job.data.type}`,
        error,
        {
          jobId: job.id,
          attemptsMade: job.attemptsMade,
          orderNumber:
            (
              (job.data.params as Record<string, unknown>).order as Record<
                string,
                unknown
              >
            )?.orderNumber ??
            (job.data.params as Record<string, unknown>).orderNumber,
        },
      );
    }
  }

  async process(job: Job<OrderTaskData>): Promise<unknown> {
    const { type, params } = job.data;
    this.logger.log(`Processing order task ${type} (job ${job.id})`);

    switch (type) {
      case OrderTaskType.SYNC_ORDER_CDP:
        return await this.processSyncOrderCdp(params.order as Order);

      case OrderTaskType.SYNC_ORDER_CANCELLATION_CDP:
        return await this.processSyncOrderCancellationCdp(
          params.order as Order,
        );

      case OrderTaskType.SYNC_ORDER_NHANH:
        return await this.processSyncOrderNhanh(
          params.order as Order,
          (params.shipping as CheckoutSessionShipping) ?? null,
        );

      case OrderTaskType.CREATE_ORDER_CONFIRMATION:
        return await this.processCreateOrderConfirmation(params.order as Order);

      case OrderTaskType.CREATE_AFFILIATE_COMMISSION:
        return await this.processCreateAffiliateCommission(
          params.order as Order,
          params.affiliateId as string,
          params.affiliateCode as string,
        );

      case OrderTaskType.UPDATE_AFFILIATE_COMMISSION_STATUS:
        return await this.processUpdateAffiliateCommissionStatus(
          params.orderId as string,
          params.newStatus as string,
        );

      case OrderTaskType.INCREMENT_PROMOTION_USAGE:
        return await this.processIncrementPromotionUsage(
          params.promotionUsageParams as PromotionUsageParams,
        );

      default:
        throw new Error(`Unknown order task type: ${type}`);
    }
  }

  private async processSyncOrderCdp(order: Order): Promise<void> {
    const result = await this.orderCdpSyncService.syncOrder(order);
    if (!result.success) {
      throw new Error(`CDP sync failed for order ${order.orderNumber}`);
    }
    this.logger.log(`CDP sync succeeded for order ${order.orderNumber}`);
  }

  private async processSyncOrderCancellationCdp(order: Order): Promise<void> {
    const success = await this.orderCdpSyncService.syncOrderCancellation(order);
    if (!success) {
      throw new Error(
        `CDP cancellation sync failed for order ${order.orderNumber}`,
      );
    }
    this.logger.log(
      `CDP cancellation sync succeeded for order ${order.orderNumber}`,
    );
  }

  private async processSyncOrderNhanh(
    order: Order,
    shipping: CheckoutSessionShipping | null,
  ): Promise<void> {
    const result = await this.orderNhanhSyncService.syncOrder(order, shipping);
    if (!result.success) {
      throw new Error(`Nhanh sync failed for order ${order.orderNumber}`);
    }
    this.logger.log(`Nhanh sync succeeded for order ${order.orderNumber}`);
  }

  private async processCreateOrderConfirmation(order: Order): Promise<void> {
    await this.orderConfirmationService.createOrderConfirmationToken(order);
    this.logger.log(
      `Order confirmation created for order ${order.orderNumber}`,
    );
  }

  private async processCreateAffiliateCommission(
    order: Order,
    affiliateId: string,
    affiliateCode: string,
  ): Promise<void> {
    await this.affiliateOrderCommissionsService.createFromOrder(
      order,
      affiliateId,
      affiliateCode,
    );
    this.logger.log(
      `Affiliate commission created for order ${order.orderNumber}`,
    );
  }

  private async processUpdateAffiliateCommissionStatus(
    orderId: string,
    newStatus: string,
  ): Promise<void> {
    await this.affiliateOrderCommissionsService.updateOrderStatus(
      orderId,
      newStatus,
    );
    this.logger.log(`Affiliate commission status updated for order ${orderId}`);
  }

  /**
   * Increment promotion usage counts and product soldCounts.
   * Logic extracted from CheckoutPaymentHandlerService.incrementPromotionUsageAndSoldCount.
   */
  private async processIncrementPromotionUsage(
    p: PromotionUsageParams,
  ): Promise<void> {
    // 1. Handle Product Discount usage tracking and sold count
    for (const discount of p.productDiscounts) {
      if (p.userId) {
        await this.promotionUsageRecordRepository.create({
          promotionId: discount.referenceId,
          userId: p.userId,
          usedAt: new Date(),
        });
      }

      await this.promotionProductRepository.incrementSoldCountForItems(
        p.items.map((item) => ({
          promotionId: discount.referenceId,
          productId: item.productId,
          quantity: item.quantity,
        })),
      );
    }

    // 2b. Handle ORDER_DISCOUNT promotions
    for (const discount of p.orderDiscounts) {
      const result = await this.promotionRepository.incrementOrderDiscountUsage(
        discount.referenceId,
      );

      if (result && p.userId) {
        await this.promotionUsageRecordRepository.create({
          promotionId: discount.referenceId,
          userId: p.userId,
          usedAt: new Date(),
        });
      }
    }

    // 3. Handle Bundle Deal gift count (BUY_X_GET_Y)
    for (const gift of p.bundleDealGifts) {
      await this.promotionRepository.incrementBundleDealGiftCount(
        gift.promotionId,
        gift.count,
      );
    }

    this.logger.log(
      `Promotion usage incremented (${p.productDiscounts.length} product discounts, ${p.orderDiscounts.length} order discounts, ${p.bundleDealGifts.length} bundle deals)`,
    );
  }
}
