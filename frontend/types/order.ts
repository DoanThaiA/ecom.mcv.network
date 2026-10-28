// Order types (frontend-only)

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatusType =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  ward?: string;
  district?: string;
  city?: string;
}

export interface SavedAddress extends ShippingAddress {
  id: string;
  isDefault: boolean;
}

export interface PaymentSummary {
  subtotal: number;
  shippingFee: number;
  discount?: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus?: PaymentStatusType;
  total: number;
  createdAt: string;
  updatedAt?: string;
  shippingAddress?: ShippingAddress;
  paymentSummary?: PaymentSummary;
  paymentMethod?: string;
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  processing: "#3B82F6",
  shipped: "#3B82F6",
  delivered: "#10B981",
  cancelled: "#EF4444",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatusType, string> = {
  pending: "#F59E0B",
  paid: "#10B981",
  failed: "#EF4444",
  refunded: "#6B7280",
};
