import {
  OrderStatus as ApiOrderStatus,
  PaymentStatus as ApiPaymentStatus,
} from '@/types/gen/shop/shared/orders/order';
import { Order, OrderStatus, OrderItem, PaymentStatusType } from '@/types/order';

/**
 * Map API OrderStatus enum to frontend OrderStatus string
 */
const mapOrderStatus = (status: ApiOrderStatus | string): OrderStatus => {
  // Handle string status from API response
  if (typeof status === 'string') {
    // Handle both proto string format (ORDER_STATUS_DELIVERED) and simple format (delivered)
    const normalizedStatus = status
      .replace(/^ORDER_STATUS_/, '') // Remove ORDER_STATUS_ prefix
      .toLowerCase();

    const stringStatusMap: Record<string, OrderStatus> = {
      unspecified: "pending",
      pending: "pending",
      confirmed: "confirmed",
      processing: "processing",
      shipped: "shipped",
      delivered: "delivered",
      cancelled: "cancelled",
      refunded: "cancelled",
    };
    return stringStatusMap[normalizedStatus] || 'pending';
  }

  // Handle enum status
  const statusMap: Record<ApiOrderStatus, OrderStatus> = {
    [ApiOrderStatus.ORDER_STATUS_UNSPECIFIED]: "pending",
    [ApiOrderStatus.ORDER_STATUS_PENDING]: "pending",
    [ApiOrderStatus.ORDER_STATUS_CONFIRMED]: "confirmed",
    [ApiOrderStatus.ORDER_STATUS_PROCESSING]: "processing",
    [ApiOrderStatus.ORDER_STATUS_SHIPPED]: "shipped",
    [ApiOrderStatus.ORDER_STATUS_DELIVERED]: "delivered",
    [ApiOrderStatus.ORDER_STATUS_CANCELLED]: "cancelled",
    [ApiOrderStatus.ORDER_STATUS_REFUNDED]: "cancelled",
    [ApiOrderStatus.UNRECOGNIZED]: "pending",
  };
  return statusMap[status] || 'pending';
};

/**
 * Map API PaymentStatus enum to frontend PaymentStatusType string
 */
const mapPaymentStatus = (
  status: ApiPaymentStatus | string
): PaymentStatusType => {
  // Handle string status from API response
  if (typeof status === 'string') {
    const normalizedStatus = status
      .replace(/^PAYMENT_STATUS_/, '')
      .toLowerCase();

    const stringStatusMap: Record<string, PaymentStatusType> = {
      unspecified: 'pending',
      pending: 'pending',
      paid: 'paid',
      failed: 'failed',
      refunded: 'refunded',
    };
    return stringStatusMap[normalizedStatus] || 'pending';
  }

  // Handle enum status
  const statusMap: Record<ApiPaymentStatus, PaymentStatusType> = {
    [ApiPaymentStatus.PAYMENT_STATUS_UNSPECIFIED]: 'pending',
    [ApiPaymentStatus.PAYMENT_STATUS_PENDING]: 'pending',
    [ApiPaymentStatus.PAYMENT_STATUS_PAID]: 'paid',
    [ApiPaymentStatus.PAYMENT_STATUS_FAILED]: 'failed',
    [ApiPaymentStatus.PAYMENT_STATUS_REFUNDED]: 'refunded',
    [ApiPaymentStatus.UNRECOGNIZED]: 'pending',
  };
  return statusMap[status] || 'pending';
};

/**
 * Map API Order to frontend Order type
 */
export const mapApiOrderToOrder = (apiOrder: any): Order => {
  const items: OrderItem[] = apiOrder.items.map((item: any, index: number) => ({
    id: `${apiOrder.id}-${index}`,
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));

  const createdAt =
    apiOrder.createdAt instanceof Date
      ? apiOrder.createdAt.toISOString()
      : typeof apiOrder.createdAt === 'string'
        ? apiOrder.createdAt
        : '';

  return {
    id: apiOrder.id,
    orderNumber: apiOrder.orderNumber,
    status: mapOrderStatus(apiOrder.status),
    paymentStatus: apiOrder.paymentStatus
      ? mapPaymentStatus(apiOrder.paymentStatus)
      : undefined,
    total: apiOrder.total,
    createdAt,
    items,
  };
};
