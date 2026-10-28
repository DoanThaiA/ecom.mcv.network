import { Order, OrderItem } from '../shop/order/domain/order';
import { PaymentMethod, PaymentStatus } from '../shop/order/domain/order.enums';
import { Customer, Source } from './types/customer.types';
import {
  CustomerTransaction,
  CustomerOrderTransaction,
  OrderTransactionSource,
  TransactionType,
  CdpPaymentMethod,
  CdpPayStatus,
  OrderTransactionItem,
} from './types/customerTransaction.types';

/**
 * Mapper for converting Order domain objects to CDP data structures
 */
export class OrderCdpMapper {
  /**
   * Map order to CDP Customer for creation
   */
  static toNewCustomer(order: Order): Customer {
    return {
      phone: order.customer.phone,
      email: order.customer.email || undefined,
      name: order.customer.name,
      status: 'active',
      customer_sources: [
        {
          source: Source.CCHAT_WEBSITE,
          customer_name: order.customer.name,
        },
      ],
      registration_channel: {
        registration_name: 'CCHAT WEBSITE',
      },
      brand: {
        brand_code: 'CCHAT',
      },
      city: order.shippingAddress.city,
      district: order.shippingAddress.district || undefined,
      ward: order.shippingAddress.ward || undefined,
      address: order.shippingAddress.address,
    };
  }

  /**
   * Map order to CDP Customer for update
   */
  static toCustomerUpdate(order: Order, cdpCustomerId: string): Customer {
    return {
      customer_id: cdpCustomerId,
      phone: order.customer.phone,
      name: order.customer.name,
      email: order.customer.email || undefined,
      city: order.shippingAddress.city,
      district: order.shippingAddress.district || undefined,
      ward: order.shippingAddress.ward || undefined,
      address: order.shippingAddress.address,
      brand: {
        brand_code: 'CCHAT',
      },
    };
  }

  /**
   * Map order to CDP CustomerTransaction
   */
  static toTransaction(
    order: Order,
    cdpCustomerId: string,
  ): CustomerTransaction {
    return {
      id: order.id,
      brand_code: 'CCHAT',
      customer_id: cdpCustomerId,
      created_at_text: new Date(order.createdAt).toISOString(),
      transaction_type: TransactionType.ORDER,
      third_party_transaction_info: {
        name: 0, // MMENU_POS
        transaction_id: order.id,
        merchant_id: 'CCHAT',
        merchant_name: 'CCHAT',
      },
      customer_order_transaction: this.toOrderTransaction(order),
    };
  }

  /**
   * Map order to CDP CustomerOrderTransaction
   */
  static toOrderTransaction(order: Order): CustomerOrderTransaction {
    const orderItems = order.items.map((item) => this.toTransactionItem(item));

    return {
      bill_no: order.orderNumber,
      discount_amount: order.discount || 0,
      payment_amount: order.total,
      order_source: OrderTransactionSource.CCHAT_WEBSITE,
      pay_status: this.mapPayStatus(order.paymentStatus),
      points_earned: 0,
      payment_method: this.mapPaymentMethodString(order.paymentMethod),
      primary_payment_amount: order.total,
      order_item_quantity: order.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
      pretax_payment_amount: order.subtotal,
      customer_order_transaction_detail: {
        order_transaction_items: orderItems,
        note: order.note || undefined,
        pretax_payment_amount: order.subtotal,
        payment_amount: order.total,
        payment_method: this.mapPaymentMethodEnum(order.paymentMethod),
      },
    };
  }

  /**
   * Map order item to CDP OrderTransactionItem
   */
  static toTransactionItem(item: OrderItem): OrderTransactionItem {
    return {
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total_price: item.subtotal,
      item_code: item.code,
    };
  }

  /**
   * Map PaymentMethod to string for CDP
   */
  static mapPaymentMethodString(method: PaymentMethod): string {
    const mapping: Record<PaymentMethod, string> = {
      [PaymentMethod.COD]: 'CASH',
      [PaymentMethod.BANK_TRANSFER]: 'BANK_TRANSFER',
      [PaymentMethod.CARD]: 'CARD_SWIPE',
      [PaymentMethod.EWALLET]: 'OTHER',
      [PaymentMethod.ONEPAY_INTERCARD]: 'CARD_SWIPE',
      [PaymentMethod.ONEPAY_DOMESTIC]: 'CARD_SWIPE',
      [PaymentMethod.INFOCMS_VIETQR]: 'BANK_TRANSFER',
    };
    return mapping[method] || 'OTHER';
  }

  /**
   * Map PaymentMethod to CdpPaymentMethod enum
   */
  static mapPaymentMethodEnum(method: PaymentMethod): CdpPaymentMethod {
    const mapping: Record<PaymentMethod, CdpPaymentMethod> = {
      [PaymentMethod.COD]: CdpPaymentMethod.CASH,
      [PaymentMethod.BANK_TRANSFER]: CdpPaymentMethod.BANK_TRANSFER,
      [PaymentMethod.CARD]: CdpPaymentMethod.CARD_SWIPE,
      [PaymentMethod.EWALLET]: CdpPaymentMethod.OTHER,
      [PaymentMethod.ONEPAY_INTERCARD]: CdpPaymentMethod.CARD_SWIPE,
      [PaymentMethod.ONEPAY_DOMESTIC]: CdpPaymentMethod.CARD_SWIPE,
      [PaymentMethod.INFOCMS_VIETQR]: CdpPaymentMethod.BANK_TRANSFER,
    };
    return mapping[method] ?? CdpPaymentMethod.OTHER;
  }

  /**
   * Map PaymentStatus to CDP pay_status
   */
  static mapPayStatus(status: PaymentStatus): CdpPayStatus {
    const mapping: Record<PaymentStatus, CdpPayStatus> = {
      [PaymentStatus.PAID]: CdpPayStatus.PAID,
      [PaymentStatus.PENDING]: CdpPayStatus.UNPAID,
      [PaymentStatus.FAILED]: CdpPayStatus.UNPAID,
      [PaymentStatus.REFUNDED]: CdpPayStatus.CANCELLED,
    };
    return mapping[status] ?? CdpPayStatus.UNPAID;
  }

  /**
   * Map order to CDP CustomerTransaction for completion (with paid status)
   * Used when order is successfully delivered
   */
  static toCompletionTransaction(
    order: Order,
    cdpCustomerId: string,
  ): CustomerTransaction {
    const orderTransaction = this.toOrderTransaction(order);

    // Update pay_status to PAID for completed orders
    return {
      id: order.id,
      brand_code: 'CCHAT',
      customer_id: cdpCustomerId,
      created_at_text: new Date(order.createdAt).toISOString(),
      transaction_type: TransactionType.ORDER,
      third_party_transaction_info: {
        name: 0, // MMENU_POS
        transaction_id: order.id,
        merchant_id: 'CCHAT',
        merchant_name: 'CCHAT',
      },
      customer_order_transaction: {
        ...orderTransaction,
        pay_status: CdpPayStatus.PAID,
      },
    };
  }

  /**
   * Map order to CDP CustomerTransaction for cancellation
   */
  static toCancellationTransaction(
    order: Order,
    cdpCustomerId: string,
  ): CustomerTransaction {
    return {
      id: order.id,
      brand_code: 'CCHAT',
      customer_id: cdpCustomerId,
      created_at_text: new Date().toISOString(),
      transaction_type: TransactionType.ORDER_CANCELLATION,
      third_party_transaction_info: {
        name: 0, // MMENU_POS
        transaction_id: order.id,
        merchant_id: 'CCHAT',
        merchant_name: 'CCHAT',
      },
      customer_order_cancellation_transaction: {
        bill_no: order.orderNumber,
        payment_amount: order.total,
        original_order_transaction_id: order.id,
        cancellation_reason: order.cancellationReason || undefined,
        is_cancel_paid_status: order.paymentStatus === PaymentStatus.PAID,
      },
    };
  }
}
