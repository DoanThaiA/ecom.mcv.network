/**
 * Orders Types
 * Types matching backend API structure
 */

/**
 * Nhanh.vn sync info for orders
 * Previously from gen/shop/shop, now defined locally
 */
export interface OrderNhanhSyncInfo {
  orderId?: number | null;
  syncStatus?: string;
  syncedAt?: string | null;
  syncError?: string | null;
}

/**
 * Order Status Enum - matches backend OrderStatus
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Payment Status Enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Payment Method Enum
 */
export enum PaymentMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
  CARD = 'card',
  EWALLET = 'ewallet',
}

/**
 * Order Tab Types
 */
export type OrderTab =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'nhanhUnsynced';

/**
 * Order Customer
 */
export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string | null;
}

/**
 * Order Address
 */
export interface OrderAddress {
  street: string;
  ward?: string | null;
  district?: string | null;
  city: string;
  country?: string;
  cityId?: number | null;
  districtId?: number | null;
  wardId?: number | null;
}

/**
 * Order Item - Product in order
 */
export interface OrderItem {
  productId: string;
  variantId?: string | null;
  code: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  comboInstanceId?: string | null;
  comboId?: string | null;
  comboName?: string | null;
}

/**
 * Order Discount Detail
 */
export interface OrderDiscountDetail {
  type: 'combo';
  referenceId: string;
  referenceName: string;
  instanceId?: string | null;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  discountAmount: number;
}

/**
 * CDP Sync Info
 */
export interface OrderCdpSyncInfo {
  customerId?: string | null;
  syncStatus?: string;
  syncedAt?: string | null;
  syncError?: string | null;
}

/**
 * Order Entity - matches backend Order domain
 */
export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  sessionId: string;
  customer: OrderCustomer;
  shippingAddress: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  depotId?: number | null;
  discount?: number;
  discountDetails?: OrderDiscountDetail[] | null;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  cdp?: OrderCdpSyncInfo | null;
  nhanh?: OrderNhanhSyncInfo | null;
}

/**
 * Order Filters
 */
export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  orderNumber?: string;
  phone?: string;
  fromDate?: string;
  toDate?: string;
  tab?: OrderTab;
  /** When defined, filter by Nhanh.vn sync state (false = not synced). */
  nhanhSynced?: boolean;
}

/**
 * Order Sort
 */
export interface OrderSort {
  orderBy: 'createdAt' | 'total' | 'orderNumber';
  order: 'asc' | 'desc';
}

/**
 * Get Orders Request
 */
export interface GetOrdersRequest {
  page: number;
  limit: number;
  filters?: OrderFilters;
  sort?: OrderSort;
}

/**
 * Get Orders Response
 */
export interface GetOrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

/**
 * Tab Count Response
 */
export interface OrderTabCounts {
  all: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

/**
 * Update Order Status Request
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  reason?: string;
}

/**
 * Update Payment Status Request
 */
export interface UpdatePaymentStatusRequest {
  paymentStatus: PaymentStatus;
}

/**
 * Helper: Get status translation key
 */
export const getOrderStatusKey = (status: OrderStatus): string => {
  const statusKeyMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'orderStatusPending',
    [OrderStatus.CONFIRMED]: 'orderStatusConfirmed',
    [OrderStatus.PROCESSING]: 'orderStatusProcessing',
    [OrderStatus.SHIPPED]: 'orderStatusShipped',
    [OrderStatus.DELIVERED]: 'orderStatusDelivered',
    [OrderStatus.CANCELLED]: 'orderStatusCancelled',
    [OrderStatus.REFUNDED]: 'orderStatusRefunded',
  };
  return statusKeyMap[status] || 'orderStatusPending';
};

/**
 * Helper: Get status color for MUI Chip
 */
export const getOrderStatusColor = (
  status: OrderStatus
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'info';
    case OrderStatus.CONFIRMED:
      return 'primary';
    case OrderStatus.PROCESSING:
      return 'warning';
    case OrderStatus.SHIPPED:
      return 'secondary';
    case OrderStatus.DELIVERED:
      return 'success';
    case OrderStatus.CANCELLED:
    case OrderStatus.REFUNDED:
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Helper: Get payment status translation key
 */
export const getPaymentStatusKey = (status: PaymentStatus): string => {
  const statusKeyMap: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'paymentStatusPending',
    [PaymentStatus.PAID]: 'paymentStatusPaid',
    [PaymentStatus.FAILED]: 'paymentStatusFailed',
    [PaymentStatus.REFUNDED]: 'paymentStatusRefunded',
  };
  return statusKeyMap[status] || 'paymentStatusPending';
};

/**
 * Helper: Get payment method translation key
 */
export const getPaymentMethodKey = (method: PaymentMethod): string => {
  const methodKeyMap: Record<PaymentMethod, string> = {
    [PaymentMethod.COD]: 'paymentMethodCod',
    [PaymentMethod.BANK_TRANSFER]: 'paymentMethodBankTransfer',
    [PaymentMethod.CARD]: 'paymentMethodCard',
    [PaymentMethod.EWALLET]: 'paymentMethodEwallet',
  };
  return methodKeyMap[method] || 'paymentMethodCod';
};
