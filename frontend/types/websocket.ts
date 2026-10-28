/**
 * WebSocket event types for real-time updates
 */
export enum WebSocketEventType {
  CART_REFETCH = 'cart:refetch',
  ORDER_REFETCH = 'order:refetch',
  NOTIFICATION_NEW = 'notification:new',
  NOTIFICATION_RECALLED = 'notification:recalled',
  PING = 'ping',
  PONG = 'pong',
}

/**
 * Generic WebSocket message structure from server
 */
export interface WebSocketMessage<T = unknown> {
  event: WebSocketEventType | string;
  data?: T;
}

/**
 * Payload for cart:refetch event
 */
export interface CartRefetchPayload {
  cartId?: string;
}

/**
 * Payload for order:refetch event
 */
export interface OrderRefetchPayload {
  orderId?: string;
}

/**
 * Payload for notification:new event
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
 * Payload for notification:recalled event
 */
export interface NotificationRecalledPayload {
  id: string;
}
