/**
 * WebSocket configuration for real-time updates
 */

// WebSocket base URL
export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || 'wss://cchatapi.mmenu.io';

// Reconnection and heartbeat configuration
export const WS_CONFIG = {
  reconnectAttempts: 15,
  reconnectIntervalMs: 1000,
  maxReconnectIntervalMs: 30000,
  heartbeatIntervalMs: 25000,
  heartbeatTimeoutMs: 60000,
};
