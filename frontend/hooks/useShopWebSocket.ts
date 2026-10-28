'use client';

import { WS_BASE_URL, WS_CONFIG } from '@/lib/config/websocket';
import { orderRepository } from '@/lib/repositories/order.repository';
import { storageService } from '@/lib/services/storage.service';
import { PaymentStatus } from '@/types/gen/shop/shared/orders/order';
import { OrderRefetchPayload, WebSocketEventType } from '@/types/websocket';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Singleton socket instance (module-level)
let socketInstance: Socket | null = null;

// Polling interval in milliseconds
const POLLING_INTERVAL_MS = 3000;

interface UseShopWebSocketOptions {
  enabled?: boolean;
  pendingOrderId?: string | null;
  onOrderRefetch?: (_orderId: string) => void;
  onPaymentFailed?: (_orderId: string) => void;
}

interface UseShopWebSocketReturn {
  isConnected: boolean;
  status: number; // 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED
}

/**
 * Custom hook for shop WebSocket connection using Socket.IO
 *
 * Features:
 * - Singleton connection (shared across all hook instances)
 * - Auto-reconnect with exponential backoff
 * - Event handlers for cart:refetch, order:refetch
 * - Polling fallback when WebSocket is not connected
 *
 * @param options - Hook options
 * @param options.enabled - Whether to enable the WebSocket connection (default: true)
 * @param options.pendingOrderId - Order ID to poll for payment status when socket is disconnected
 * @param options.onOrderRefetch - Callback when order:refetch event received or polling detects paid status
 * @returns Connection status and state
 *
 * @example
 * const { isConnected, status } = useShopWebSocket({
 *   enabled: true,
 *   pendingOrderId: 'order-123',
 *   onOrderRefetch: (orderId) => router.push(`/order/${orderId}`)
 * });
 */
export function useShopWebSocket(
  options: UseShopWebSocketOptions = {}
): UseShopWebSocketReturn {
  const {
    enabled = true,
    pendingOrderId,
    onOrderRefetch: onOrderRefetchCallback,
    onPaymentFailed: onPaymentFailedCallback,
  } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Socket connection effect
  useEffect(() => {
    if (!enabled) return;

    const sessionId = storageService.getXSessionId();
    const token = storageService.getToken();
    if (!sessionId || !token) return;
    const wss = `${WS_BASE_URL}/shop?${
      token ? `token=${token}` : sessionId ? `sessionId=${sessionId}` : ''
    }`;
    // Create singleton socket
    if (!socketInstance) {
      socketInstance = io(wss, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: WS_CONFIG.reconnectAttempts,
        reconnectionDelay: WS_CONFIG.reconnectIntervalMs,
        reconnectionDelayMax: WS_CONFIG.maxReconnectIntervalMs,
      });
    }

    const socket = socketInstance;

    // Connection handlers
    const onConnect = () => {
      // eslint-disable-next-line no-console
      console.log(
        '[WebSocket] Connected to',
        `${WS_BASE_URL}/shop?sessionId=${sessionId}`
      );
      setIsConnected(true);
      setStatus(1);
    };

    const onDisconnect = (reason: string) => {
      // eslint-disable-next-line no-console
      console.log('[WebSocket] Disconnected:', reason);
      setIsConnected(false);
      setStatus(3);
    };

    const onConnectError = (error: Error) => {
      // eslint-disable-next-line no-console
      console.error('[WebSocket] Connection error:', error.message);
    };

    // Business event handlers
    const onCartRefetch = () => {
      // eslint-disable-next-line no-console
      console.log('[WebSocket] Event: cart:refetch');
    };

    const onOrderRefetch = (data: OrderRefetchPayload) => {
      // eslint-disable-next-line no-console
      console.log('[WebSocket] Event: order:refetch', data);
      if (data?.orderId) {
        // Call callback if provided (for navigation etc.)
        onOrderRefetchCallback?.(data.orderId);
      }
    };

    // Register handlers (outside connect to avoid duplicates on reconnect)
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on(WebSocketEventType.CART_REFETCH, onCartRefetch);
    socket.on(WebSocketEventType.ORDER_REFETCH, onOrderRefetch);

    // Set initial state if already connected
    if (socket.connected) {
      setIsConnected(true);
      setStatus(1);
    }

    // Cleanup: remove listeners but keep socket alive
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off(WebSocketEventType.CART_REFETCH, onCartRefetch);
      socket.off(WebSocketEventType.ORDER_REFETCH, onOrderRefetch);
    };
  }, [enabled, onOrderRefetchCallback]);

  // Polling fallback effect - only when socket is not connected and has pendingOrderId
  useEffect(() => {
    // No pending order → no polling needed
    if (!pendingOrderId) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Socket connected → no polling needed (socket will handle it)
    if (isConnected) {
      if (pollingIntervalRef.current) {
        // eslint-disable-next-line no-console
        console.log('[WebSocket] Socket reconnected, stopping polling');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Socket not connected → start polling
    // eslint-disable-next-line no-console
    console.log('[WebSocket] Socket disconnected, starting polling fallback');

    const pollOrderStatus = async () => {
      try {
        const order = await orderRepository.getOrderByIdFormatResponse(pendingOrderId);

        // check by paymentStatus
        // case 1: payment failed => show re payment button
        // case 2: success => push history
        // If paid → trigger callback (same as socket event)
        if (order.paymentStatus === PaymentStatus.PAYMENT_STATUS_PAID || order.paymentStatus === 'paid') {
          // eslint-disable-next-line no-console
          console.log('[WebSocket] Polling detected payment success');
          onOrderRefetchCallback?.(pendingOrderId);

          // Stop polling after success
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else if (
          order.paymentStatus === PaymentStatus.PAYMENT_STATUS_FAILED ||
          order.paymentStatus === 'failed'
        ) {
          // eslint-disable-next-line no-console
          console.log('[WebSocket] Polling detected payment failure');
          onPaymentFailedCallback?.(pendingOrderId);

          // Stop polling after failure
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch {
        // Order not found or error - continue polling
        // eslint-disable-next-line no-console
        console.log('[Order not found or error - continue polling');
      }
    };

    // Poll every 3 seconds
    pollingIntervalRef.current = setInterval(
      pollOrderStatus,
      POLLING_INTERVAL_MS
    );

    // Poll immediately on start
    pollOrderStatus();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [pendingOrderId, isConnected, onOrderRefetchCallback, onPaymentFailedCallback]);

  return { isConnected, status };
}
