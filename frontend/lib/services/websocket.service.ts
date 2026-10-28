import { WS_BASE_URL, WS_CONFIG } from '@/lib/config/websocket';
import { storageService } from './storage.service';

/**
 * WebSocket service for managing socket URL and reconnection settings
 */
class WebSocketService {
  /**
   * Builds the WebSocket URL with session ID
   * @returns Socket URL or null if session ID is not available
   */
  getSocketUrl(): string | null {
    const sessionId = storageService.getXSessionId();
    if (!sessionId) return null;
    return `${WS_BASE_URL}/shop?sessionId=${sessionId}`;
  }

  /**
   * Calculates reconnection interval with exponential backoff
   * @param attemptNumber - Current reconnection attempt number
   * @returns Interval in milliseconds
   */
  getReconnectInterval(attemptNumber: number): number {
    return Math.min(
      Math.pow(2, attemptNumber) * WS_CONFIG.reconnectIntervalMs,
      WS_CONFIG.maxReconnectIntervalMs
    );
  }
}

export const websocketService = new WebSocketService();
