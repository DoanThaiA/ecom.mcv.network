import { Injectable, Logger } from '@nestjs/common';
import { CdpService } from './cdp.service';
import { OrderRepository } from '../shop/order/domain/order.repository';
import { UserRepository } from '../users/domain/user.repository';
import { Order } from '../shop/order/domain/order';
import { CdpSyncStatus } from '../shop/order/domain/cdp-sync-status.enum';
import { OrderCdpMapper } from './order-cdp.mapper';
import { CustomerTransaction } from './types/customerTransaction.types';
import { VoucherStatusForCustomer, CdpVoucher } from './types/voucher.types';

@Injectable()
export class OrderCdpSyncService {
  private readonly logger = new Logger(OrderCdpSyncService.name);

  constructor(
    private readonly cdpService: CdpService,
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Sync order to CDP (called on CMS order confirmation)
   * - Registered user: Uses user.cdpCustomerId
   * - Guest: Creates/finds CDP customer by phone
   */
  async syncOrder(
    order: Order,
  ): Promise<{ cdpCustomerId: string | null; success: boolean }> {
    try {
      let cdpCustomerId: string | null = null;

      // Case 1: Registered user - try to use existing CDP customer ID
      if (order.userId) {
        const user = await this.userRepository.findById(order.userId);
        if (user?.cdpCustomerId) {
          cdpCustomerId = user.cdpCustomerId;
        }
      }

      // Case 2: Need to create/find CDP customer
      if (!cdpCustomerId) {
        cdpCustomerId = await this.getOrCreateCdpCustomer(order);
      }

      if (!cdpCustomerId) {
        await this.orderRepository.updateCdpSyncStatus(
          order.id,
          CdpSyncStatus.FAILED,
          undefined,
          'Failed to get CDP customer ID',
        );
        return { cdpCustomerId: null, success: false };
      }

      // Sync order transaction after customer sync succeeds
      const customerTransaction = await this.syncOrderTransaction(
        order,
        cdpCustomerId,
      );

      // Sync voucher usage
      await this.syncVoucherUsage(order, cdpCustomerId);

      await this.orderRepository.updateCdpSyncStatus(
        order.id,
        CdpSyncStatus.SYNCED,
        cdpCustomerId,
        undefined,
        customerTransaction,
      );
      this.logger.log(
        `Order ${order.orderNumber} synced to CDP, customer: ${cdpCustomerId}`,
      );
      return { cdpCustomerId, success: true };
    } catch (error) {
      this.logger.error(`Failed to sync order ${order.id} to CDP`, error);
      await this.orderRepository.updateCdpSyncStatus(
        order.id,
        CdpSyncStatus.FAILED,
        undefined,
        error instanceof Error ? error.message : 'Unknown error',
      );
      return { cdpCustomerId: null, success: false };
    }
  }

  /**
   * Get or create CDP customer for guest order
   * First tries to find existing customer by phone, then creates if not found
   */
  async getOrCreateCdpCustomer(order: Order): Promise<string | null> {
    // Try to find existing customer by phone first
    try {
      const existingCustomer = await this.cdpService.getCustomer({
        phone: order.customer.phone,
        brand_code: 'CCHAT',
      });

      if (
        existingCustomer.code === 0 &&
        existingCustomer.customer?.customer_id
      ) {
        this.logger.log(
          `Found existing CDP customer for phone ${order.customer.phone}: ${existingCustomer.customer.customer_id}`,
        );
        return existingCustomer.customer.customer_id;
      }
    } catch (error) {
      // Customer not found or lookup failed, proceed to create
      this.logger.debug(
        `CDP customer not found for phone ${order.customer.phone}, will create new`,
      );
    }

    // Create new customer if not found
    const customer = OrderCdpMapper.toNewCustomer(order);
    const response = await this.cdpService.createOrUpdateCustomer({ customer });

    if (response.code === 0 && response.customer?.customer_id) {
      return response.customer.customer_id;
    }

    this.logger.error(`Failed to create CDP customer: ${response.message}`);
    return null;
  }

  /**
   * Sync order transaction to CDP
   * Should be called after customer sync succeeds
   */
  async syncOrderTransaction(
    order: Order,
    cdpCustomerId: string,
  ): Promise<CustomerTransaction | undefined> {
    const customerTransaction = OrderCdpMapper.toTransaction(
      order,
      cdpCustomerId,
    );

    try {
      const response = await this.cdpService.createOrUpdateCustomerTransaction({
        customer_transaction: customerTransaction,
      });

      if (response.code === 0) {
        this.logger.log(
          `Order transaction ${order.orderNumber} synced to CDP for customer ${cdpCustomerId}`,
        );
        return response.customer_transaction;
      } else {
        this.logger.error(
          `Failed to sync order transaction ${order.orderNumber}: ${response.message}`,
        );
        return undefined;
      }
    } catch (error) {
      this.logger.error(
        `Error syncing order transaction ${order.orderNumber}\n
        CDP transaction payload: ${JSON.stringify(customerTransaction, null, 2)}`,
        error,
      );
      return undefined;
    }
  }

  /**
   * Sync order completion/success to CDP (called when order is delivered)
   * Updates pay_status to 'paid' and syncs to CDP
   * Only syncs if order was previously synced to CDP
   */
  async syncOrderCompletion(order: Order): Promise<boolean> {
    // Only sync if order was previously synced
    if (
      order.cdp?.syncStatus !== CdpSyncStatus.SYNCED ||
      !order.cdp?.customerId
    ) {
      this.logger.log(
        `Skipping completion sync - order ${order.orderNumber} was not synced to CDP`,
      );
      return true;
    }

    const completionTransaction = OrderCdpMapper.toCompletionTransaction(
      order,
      order.cdp.customerId,
    );

    try {
      const response = await this.cdpService.createOrUpdateCustomerTransaction({
        customer_transaction: completionTransaction,
      });

      if (response.code === 0) {
        // Update order's CDP transaction with completed status
        await this.orderRepository.updateCdpSyncStatus(
          order.id,
          CdpSyncStatus.SYNCED,
          order.cdp.customerId,
          undefined,
          response.customer_transaction,
        );
        this.logger.log(
          `Order ${order.orderNumber} completion synced to CDP with paid status`,
        );
        return true;
      } else {
        this.logger.error(
          `Failed to sync order completion ${order.orderNumber}: ${response.message}`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Error syncing order completion ${order.orderNumber}\n
        CDP completion payload: ${JSON.stringify(completionTransaction, null, 2)}`,
        error,
      );
      return false;
    }
  }

  /**
   * Sync order cancellation to CDP (called on CMS order cancellation)
   * Releases CDP vouchers and syncs cancellation transaction if order was previously synced
   */
  async syncOrderCancellation(order: Order): Promise<boolean> {
    // Release CDP vouchers first (regardless of sync status)
    await this.releaseVouchersOnCancellation(order);

    // Only sync cancellation transaction if order was previously synced
    if (
      order.cdp?.syncStatus !== CdpSyncStatus.SYNCED ||
      !order.cdp?.customerId
    ) {
      this.logger.log(
        `Skipping cancellation transaction sync - order ${order.orderNumber} was not synced to CDP`,
      );
      return true;
    }

    const cancellationTransaction = OrderCdpMapper.toCancellationTransaction(
      order,
      order.cdp.customerId,
    );

    try {
      const response = await this.cdpService.createOrUpdateCustomerTransaction({
        customer_transaction: cancellationTransaction,
      });

      if (response.code === 0) {
        this.logger.log(
          `Order ${order.orderNumber} cancellation synced to CDP`,
        );
        return true;
      } else {
        this.logger.error(
          `Failed to sync order cancellation ${order.orderNumber}: ${response.message}`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Error syncing order cancellation ${order.orderNumber}\n
        CDP cancellation payload: ${JSON.stringify(cancellationTransaction, null, 2)}`,
        error,
      );
      return false;
    }
  }

  /**
   * Sync used vouchers to CDP (mark as USED)
   */
  async syncVoucherUsage(order: Order, cdpCustomerId: string): Promise<void> {
    if (!order.discountDetails) return;

    const cdpVouchers: CdpVoucher[] = [];
    for (const detail of order.discountDetails) {
      if (detail.source === 'CDP' && detail.referenceId) {
        cdpVouchers.push({
          voucher_code: detail.referenceId,
          discount_amount: detail.discountAmount,
          productAppliedPromotions: [],
        });
      }
    }

    if (cdpVouchers.length === 0) return;

    try {
      await this.cdpService.updateCustomerVoucher({
        brand_code: 'CCHAT',
        cdp_vouchers: cdpVouchers,
        transaction_no: order.orderNumber,
        transaction_start_at: order.createdAt.toISOString(),
        transaction_end_at: order.createdAt.toISOString(),
        subtotal_with_tax: order.total,
        is_cancel: false,
      });
      this.logger.log(`Synced voucher usage for order ${order.orderNumber}`);
    } catch (err) {
      this.logger.error(`Failed to sync voucher usage`, err);
    }
  }

  /**
   * Release CDP vouchers when order is cancelled
   * Calls removeVoucherFromOrder RPC for each CDP voucher
   */
  private async releaseVouchersOnCancellation(order: Order): Promise<void> {
    if (!order.discountDetails) return;

    for (const detail of order.discountDetails) {
      if (detail.source === 'CDP' && detail.referenceId) {
        try {
          const response = await this.cdpService.removeVoucherFromOrder({
            voucher_code: detail.referenceId,
          });
          if (response.code === 0) {
            this.logger.log(
              `Released CDP voucher ${detail.referenceId} for cancelled order ${order.orderNumber}`,
            );
          } else {
            this.logger.warn(
              `Failed to release CDP voucher ${detail.referenceId}: ${response.message}`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error releasing CDP voucher ${detail.referenceId}`,
            error,
          );
        }
      }
    }
  }
}
