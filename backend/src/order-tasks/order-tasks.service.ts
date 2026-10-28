import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OrderTaskType } from './domain/order-task-type.enum';
import { orderTaskQueueName } from '../utils/env';
import { Order } from '../shop/order/domain/order';
import { CheckoutSessionShipping } from '../shop/checkout/domain/checkout-session';
import { TelegramService } from '../telegram/telegram.service';

/** Shared job options for all order tasks */
const ORDER_TASK_OPTIONS = {
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 3000 },
};

export interface OrderTaskData {
  type: OrderTaskType;
  params: Record<string, unknown>;
}

export interface PromotionUsageParams {
  productDiscounts: Array<{ referenceId: string }>;
  orderDiscounts: Array<{ referenceId: string }>;
  bundleDealGifts: Array<{ promotionId: string; count: number }>;
  items: Array<{ productId: string; quantity: number }>;
  userId?: string | null;
}

/**
 * Service for queuing order post-processing background tasks.
 * Each method enqueues one independent, retriable job.
 */
@Injectable()
export class OrderTasksService {
  private readonly logger = new Logger(OrderTasksService.name);

  constructor(
    @InjectQueue(orderTaskQueueName)
    private readonly orderTasksQueue: Queue,
    @Optional()
    private readonly telegramService?: TelegramService,
  ) {}

  /**
   * Push a job to the queue and alert via Telegram if it fails.
   */
  private async enqueue(
    taskType: OrderTaskType,
    data: OrderTaskData,
    meta: { orderNumber?: string },
  ): Promise<void> {
    try {
      await this.orderTasksQueue.add(taskType, data, ORDER_TASK_OPTIONS);
    } catch (error) {
      this.logger.error(`Failed to enqueue ${taskType}`, error);
      void this.telegramService?.sendErrorAlert(
        `OrderTasksService.enqueue — ${taskType}`,
        error as Error,
        { orderNumber: meta.orderNumber, taskType },
      );
      throw error;
    }
  }

  /** Queue CDP order sync */
  async queueSyncOrderCdp(order: Order): Promise<void> {
    await this.enqueue(
      OrderTaskType.SYNC_ORDER_CDP,
      {
        type: OrderTaskType.SYNC_ORDER_CDP,
        params: { order },
      } satisfies OrderTaskData,
      { orderNumber: order.orderNumber },
    );
    this.logger.log(`Queued CDP sync for order ${order.orderNumber}`);
  }

  /** Queue CDP order cancellation sync */
  async queueSyncOrderCancellationCdp(order: Order): Promise<void> {
    await this.enqueue(
      OrderTaskType.SYNC_ORDER_CANCELLATION_CDP,
      {
        type: OrderTaskType.SYNC_ORDER_CANCELLATION_CDP,
        params: { order },
      } satisfies OrderTaskData,
      { orderNumber: order.orderNumber },
    );
    this.logger.log(
      `Queued CDP cancellation sync for order ${order.orderNumber}`,
    );
  }

  /** Queue Nhanh.vn order sync */
  async queueSyncOrderNhanh(
    order: Order,
    shipping?: CheckoutSessionShipping | null,
  ): Promise<void> {
    await this.enqueue(
      OrderTaskType.SYNC_ORDER_NHANH,
      {
        type: OrderTaskType.SYNC_ORDER_NHANH,
        params: { order, shipping: shipping ?? null },
      } satisfies OrderTaskData,
      { orderNumber: order.orderNumber },
    );
    this.logger.log(`Queued Nhanh sync for order ${order.orderNumber}`);
  }

  /** Queue ZNS order confirmation token creation */
  async queueCreateOrderConfirmation(order: Order): Promise<void> {
    await this.enqueue(
      OrderTaskType.CREATE_ORDER_CONFIRMATION,
      {
        type: OrderTaskType.CREATE_ORDER_CONFIRMATION,
        params: { order },
      } satisfies OrderTaskData,
      { orderNumber: order.orderNumber },
    );
    this.logger.log(`Queued order confirmation for order ${order.orderNumber}`);
  }

  /** Queue affiliate commission record creation */
  async queueCreateAffiliateCommission(
    order: Order,
    affiliateId: string,
    affiliateCode: string,
  ): Promise<void> {
    await this.enqueue(
      OrderTaskType.CREATE_AFFILIATE_COMMISSION,
      {
        type: OrderTaskType.CREATE_AFFILIATE_COMMISSION,
        params: { order, affiliateId, affiliateCode },
      } satisfies OrderTaskData,
      { orderNumber: order.orderNumber },
    );
    this.logger.log(
      `Queued affiliate commission for order ${order.orderNumber}`,
    );
  }

  /** Queue affiliate commission status update */
  async queueUpdateAffiliateCommissionStatus(
    orderId: string,
    orderNumber: string,
    newStatus: string,
  ): Promise<void> {
    await this.enqueue(
      OrderTaskType.UPDATE_AFFILIATE_COMMISSION_STATUS,
      {
        type: OrderTaskType.UPDATE_AFFILIATE_COMMISSION_STATUS,
        params: { orderId, orderNumber, newStatus },
      } satisfies OrderTaskData,
      { orderNumber },
    );
    this.logger.log(
      `Queued affiliate commission status update for order ${orderNumber}`,
    );
  }

  /** Queue promotion usage + sold count increment */
  async queueIncrementPromotionUsage(
    promotionUsageParams: PromotionUsageParams,
    orderNumber: string,
  ): Promise<void> {
    if (
      promotionUsageParams.productDiscounts.length === 0 &&
      promotionUsageParams.orderDiscounts.length === 0 &&
      promotionUsageParams.bundleDealGifts.length === 0
    ) {
      return;
    }

    await this.enqueue(
      OrderTaskType.INCREMENT_PROMOTION_USAGE,
      {
        type: OrderTaskType.INCREMENT_PROMOTION_USAGE,
        params: { promotionUsageParams },
      } satisfies OrderTaskData,
      { orderNumber },
    );
    this.logger.log(
      `Queued promotion usage increment for order ${orderNumber}`,
    );
  }
}
