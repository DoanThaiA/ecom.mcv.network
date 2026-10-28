/**
 * Socket event constants and payload types
 * These are lightweight refetch notifications - no data transfer
 */

export enum SocketEvents {
  // Order events - notify client to refetch order data
  ORDER_REFETCH = 'order:refetch',

  // Cart events - notify client to refetch cart data
  CART_REFETCH = 'cart:refetch',

  // Push notification events
  NOTIFICATION_NEW = 'notification:new',
  NOTIFICATION_RECALLED = 'notification:recalled',
}

/**
 * Order refetch notification payload
 * Client should refetch: GET /api/v1/shop/orders/{orderId}
 */
export interface OrderRefetchPayload {
  orderId: string;
  orderNumber: string;
}

/**
 * Cart refetch notification payload
 * Client should refetch: GET /api/v1/shop/cart
 */
export interface CartRefetchPayload {
  cartId: string;
}

/**
 * New push notification payload
 * Delivered to all connected users when a notification is sent
 */
export interface NotificationNewPayload {
  id: string;
  category: number;
  title: string;
  subtitle: string;
  url?: string;
  sentAt: string;
}

/**
 * Notification recalled payload
 */
export interface NotificationRecalledPayload {
  id: string;
}
