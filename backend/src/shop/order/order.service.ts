import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { OrderRepository } from './domain/order.repository';
import { Order } from './domain/order';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  isOnepayMethod,
  isInfocmsMethod,
} from './domain/order.enums';
import { QueryOrderDto } from './dto/order.dto';
import { UpdatePaymentResponseDto } from './dto/update-payment.dto';
import { throwException } from '../../utils/errors/throw-exception';
import { PaginateResult } from 'mongoose';
import { OnepayService } from '../../payment/onepay/onepay.service';
import { InfocmsService } from '../../payment/infocms/infocms.service';
import { OrderTasksService } from '../../order-tasks/order-tasks.service';

/**
 * Order service for managing orders
 * Note: Order creation is handled through the checkout flow only.
 * Order status updates are synced via webhook from nhanh.vn
 * CDP sync happens immediately after order creation in checkout
 */
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly i18n: I18nService,
    private readonly onepayService: OnepayService,
    private readonly infocmsService: InfocmsService,
    private readonly orderTasksService: OrderTasksService,
  ) {}

  /**
   * Get order by ID
   */
  async getById(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.order.notFound'),
      });
    }

    return order;
  }

  /**
   * Get order by order number
   */
  async getByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);

    if (!order) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.order.notFound'),
      });
    }

    return order;
  }

  /**
   * Get order by ID with ownership verification
   */
  async getByIdWithOwnership(
    id: string,
    sessionId: string,
    userId?: string,
  ): Promise<Order> {
    const order = await this.getById(id);
    this.verifyOwnership(order, sessionId, userId);
    return order;
  }

  /**
   * Get order by order number with ownership verification
   */
  async getByOrderNumberWithOwnership(
    orderNumber: string,
    sessionId: string,
    userId?: string,
  ): Promise<Order> {
    const order = await this.getByOrderNumber(orderNumber);
    this.verifyOwnership(order, sessionId, userId);
    return order;
  }

  /**
   * Verify order ownership by session ID or user ID
   */
  private verifyOwnership(
    order: Order,
    sessionId: string,
    userId?: string,
  ): void {
    // If user is authenticated, check by userId
    if (userId) {
      if (order.userId === userId) {
        return;
      }
    }

    // Check by sessionId
    if (order.sessionId === sessionId) {
      return;
    }

    // No match - not authorized
    throwException({
      status: HttpStatus.FORBIDDEN,
      message: this.i18n.t('shop.order.notAuthorized'),
    });
  }

  /**
   * Lookup order for guest (by order number and phone)
   */
  async lookupOrder(orderNumber: string, phone: string): Promise<Order> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);

    if (!order || order.customer.phone !== phone) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.order.notFound'),
      });
    }

    return order;
  }

  /**
   * Get orders for user
   */
  async getByUserId(userId: string): Promise<Order[]> {
    return this.orderRepository.findByUserId(userId);
  }

  /**
   * Get orders for session (guest)
   */
  async getBySessionId(sessionId: string): Promise<Order[]> {
    return this.orderRepository.findBySessionId(sessionId);
  }

  /**
   * Get orders for user with pagination
   */
  async getByUserIdPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginateResult<Order>> {
    return this.orderRepository.findManyWithPagination({
      filterOptions: { userId },
      sortOptions: { orderBy: 'createdAt', order: 'desc' },
      paginationOptions: { page, limit: Math.min(limit, 50) },
    });
  }

  /**
   * Get orders for session (guest) with pagination
   */
  async getBySessionIdPaginated(
    sessionId: string,
    page: number,
    limit: number,
  ): Promise<PaginateResult<Order>> {
    return this.orderRepository.findManyWithPagination({
      filterOptions: { sessionId },
      sortOptions: { orderBy: 'createdAt', order: 'desc' },
      paginationOptions: { page, limit: Math.min(limit, 50) },
    });
  }

  /**
   * Count orders that have not been synced to Nhanh.vn yet
   */
  async countUnsyncedToNhanh(): Promise<number> {
    return this.orderRepository.countUnsyncedToNhanh();
  }

  /**
   * Get orders with pagination
   */
  async getOrders(query: QueryOrderDto): Promise<PaginateResult<Order>> {
    return this.orderRepository.findManyWithPagination({
      filterOptions: query.filters,
      sortOptions: query.sort
        ? {
            orderBy: query.sort.orderBy ?? 'createdAt',
            order: query.sort.order ?? 'desc',
          }
        : undefined,
      paginationOptions: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      },
    });
  }

  /**
   * Cancel order (by customer)
   */
  async cancelOrder(
    id: string,
    sessionId: string,
    reason?: string,
    userId?: string,
  ): Promise<Order> {
    const order = await this.getById(id);

    // Verify ownership
    if (userId) {
      if (order.userId !== userId) {
        throwException({
          status: HttpStatus.FORBIDDEN,
          message: this.i18n.t('shop.order.notAuthorized'),
        });
      }
    } else if (order.sessionId !== sessionId) {
      throwException({
        status: HttpStatus.FORBIDDEN,
        message: this.i18n.t('shop.order.notAuthorized'),
      });
    }

    // Can only cancel pending or confirmed orders
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CONFIRMED
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.order.cannotCancel'),
      });
    }

    const updated = await this.orderRepository.update(id, {
      status: OrderStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: reason ?? 'Cancelled by customer',
    });

    this.logger.log(`Order ${order.orderNumber} cancelled by customer`);

    // Queue cancellation sync to CDP (releases vouchers)
    void this.orderTasksService.queueSyncOrderCancellationCdp(updated!);

    // Queue affiliate commission status update
    if (order.affiliateId) {
      void this.orderTasksService.queueUpdateAffiliateCommissionStatus(
        id,
        order.orderNumber,
        OrderStatus.CANCELLED,
      );
    }

    return updated!;
  }

  /**
   * Cleanup an abandoned order (e.g., payment setup failed, cart modified)
   * Cancels the order and releases any consumed CDP vouchers
   */
  async cleanupAbandonedOrder(orderId: string, reason: string): Promise<void> {
    const cancelled = await this.orderRepository.update(orderId, {
      status: OrderStatus.CANCELLED,
      cancellationReason: reason,
    });

    if (cancelled) {
      this.logger.log(`Order ${cancelled.orderNumber} cleaned up: ${reason}`);
      void this.orderTasksService.queueSyncOrderCancellationCdp(cancelled);
      if (cancelled.affiliateId) {
        void this.orderTasksService.queueUpdateAffiliateCommissionStatus(
          orderId,
          cancelled.orderNumber,
          OrderStatus.CANCELLED,
        );
      }
    }
  }

  /**
   * Update payment method on an order (retry or change payment)
   */
  async updatePaymentMethod(
    orderId: string,
    sessionId: string,
    userId: string | undefined,
    paymentMethod: PaymentMethod,
    clientIp: string,
  ): Promise<UpdatePaymentResponseDto> {
    const order = await this.getById(orderId);

    // Verify ownership
    if (userId) {
      if (order.userId !== userId) {
        throwException({
          status: HttpStatus.FORBIDDEN,
          message: this.i18n.t('shop.order.notAuthorized'),
        });
      }
    } else if (order.sessionId !== sessionId) {
      throwException({
        status: HttpStatus.FORBIDDEN,
        message: this.i18n.t('shop.order.notAuthorized'),
      });
    }

    // Check payment status - only allow if PENDING or FAILED
    if (
      order.paymentStatus !== PaymentStatus.PENDING &&
      order.paymentStatus !== PaymentStatus.FAILED
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.order.paymentAlreadyProcessed'),
      });
    }

    // Check order status - only allow if PENDING or CONFIRMED
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CONFIRMED
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.order.cannotChangePayment'),
      });
    }

    // Update payment method
    const updatedOrder = await this.orderRepository.update(orderId, {
      paymentMethod,
      paymentStatus: PaymentStatus.PENDING, // Reset to pending for retry
    });

    if (!updatedOrder) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('shop.order.updateFailed'),
      });
    }

    this.logger.log(
      `Order ${order.orderNumber} payment method updated to ${paymentMethod}`,
    );

    // Handle OnePay payment methods
    if (isOnepayMethod(paymentMethod)) {
      const paymentUrl = await this.onepayService.createPaymentUrl(
        updatedOrder,
        clientIp,
      );
      return { success: true, order: updatedOrder, paymentUrl };
    }

    // Handle InfoCMS (VietQR) payment methods
    if (isInfocmsMethod(paymentMethod)) {
      const qrResult = await this.infocmsService.createPaymentQr(updatedOrder);

      if (!qrResult.success) {
        throwException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: qrResult.errorMessage || 'Failed to create payment QR',
        });
      }

      await this.orderRepository.update(orderId, {
        infocms: {
          transactionUuid: qrResult.transactionUuid,
          ecollectionCd: qrResult.ecollectionCd,
        },
      });

      return {
        success: true,
        order: updatedOrder,
        qrUrl: qrResult.qrUrl,
        qrData: qrResult.qrData,
      };
    }

    // Default: COD, bank transfer, etc. - queue CDP and Nhanh sync
    void this.orderTasksService.queueSyncOrderCdp(updatedOrder);
    void this.orderTasksService.queueSyncOrderNhanh(updatedOrder);

    return { success: true, order: updatedOrder };
  }
}
