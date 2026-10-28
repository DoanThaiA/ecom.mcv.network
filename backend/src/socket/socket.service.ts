import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  SocketEvents,
  OrderRefetchPayload,
  CartRefetchPayload,
  NotificationNewPayload,
  NotificationRecalledPayload,
} from './socket.events';
import { getUserRoom, getSessionRoom } from './socket.utils';

/**
 * Service for emitting real-time refetch notifications to connected clients
 *
 * This service sends lightweight notification events that tell clients
 * to refetch data from REST APIs. No actual data is transferred over WebSocket.
 */
@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);
  private server: Server | null = null;

  /**
   * Set the Socket.io server instance
   * Called by SocketGateway after initialization
   */
  setServer(server: Server): void {
    this.server = server;
    this.logger.log('Socket.io server instance set');
  }

  /**
   * Check if server is available
   */
  private isServerReady(): boolean {
    if (!this.server) {
      this.logger.warn('Socket.io server not initialized, skipping emit');
      return false;
    }
    return true;
  }

  // ==================== ORDER NOTIFICATIONS ====================

  /**
   * Notify order owner to refetch order data
   * Emits to both user room (if authenticated) and session room
   *
   * @param order - Order info containing id, orderNumber, userId, sessionId
   */
  notifyOrderRefetch(order: {
    id: string;
    orderNumber: string;
    userId?: string | null;
    sessionId: string;
  }): void {
    if (!this.isServerReady()) return;

    const payload: OrderRefetchPayload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
    };

    // Emit to user room if order has userId
    if (order.userId) {
      const userRoom = getUserRoom(order.userId);
      this.server!.to(userRoom).emit(SocketEvents.ORDER_REFETCH, payload);
      this.logger.debug(`Emitted order:refetch to user room: ${userRoom}`);
    }

    // Always emit to session room
    const sessionRoom = getSessionRoom(order.sessionId);
    this.server!.to(sessionRoom).emit(SocketEvents.ORDER_REFETCH, payload);
    this.logger.debug(`Emitted order:refetch to session room: ${sessionRoom}`);

    this.logger.log(
      `Order refetch notification sent for order: ${order.orderNumber}`,
    );
  }

  // ==================== CART NOTIFICATIONS ====================

  /**
   * Notify cart owner to refetch cart data
   * Emits to both user room (if authenticated) and session room
   *
   * @param cartId - Cart ID
   * @param userId - User ID (optional, for authenticated users)
   * @param sessionId - Session ID
   */
  notifyCartRefetch(
    cartId: string,
    userId: string | undefined | null,
    sessionId: string,
  ): void {
    if (!this.isServerReady()) return;

    const payload: CartRefetchPayload = {
      cartId,
    };

    // Emit to user room if authenticated
    if (userId) {
      const userRoom = getUserRoom(userId);
      this.server!.to(userRoom).emit(SocketEvents.CART_REFETCH, payload);
      this.logger.debug(`Emitted cart:refetch to user room: ${userRoom}`);
    }

    // Always emit to session room
    const sessionRoom = getSessionRoom(sessionId);
    this.server!.to(sessionRoom).emit(SocketEvents.CART_REFETCH, payload);
    this.logger.debug(`Emitted cart:refetch to session room: ${sessionRoom}`);

    this.logger.log(`Cart refetch notification sent for cart: ${cartId}`);
  }

  // ==================== PUSH NOTIFICATION BROADCASTS ====================

  /**
   * Broadcast a new push notification to all connected clients
   */
  broadcastNewNotification(payload: NotificationNewPayload): void {
    if (!this.isServerReady()) return;

    this.server!.emit(SocketEvents.NOTIFICATION_NEW, payload);
    this.logger.log(
      `Broadcast notification:new for notification: ${payload.id}`,
    );
  }

  /**
   * Broadcast notification recall to all connected clients
   */
  broadcastNotificationRecalled(payload: NotificationRecalledPayload): void {
    if (!this.isServerReady()) return;

    this.server!.emit(SocketEvents.NOTIFICATION_RECALLED, payload);
    this.logger.log(
      `Broadcast notification:recalled for notification: ${payload.id}`,
    );
  }
}
