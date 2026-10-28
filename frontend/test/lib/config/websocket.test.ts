import { describe, it, expect } from 'vitest';
import { WS_BASE_URL, WS_CONFIG } from '@/lib/config/websocket';

describe('websocket', () => {
  describe('WS_BASE_URL', () => {
    it('is defined', () => {
      expect(WS_BASE_URL).toBeDefined();
    });

    it('is a string', () => {
      expect(typeof WS_BASE_URL).toBe('string');
    });

    it('starts with wss://', () => {
      expect(WS_BASE_URL).toMatch(/^wss:\/\//);
    });

    it('is a valid WebSocket URL', () => {
      expect(() => new URL(WS_BASE_URL.replace('wss://', 'https://'))).not.toThrow();
    });
  });

  describe('WS_CONFIG', () => {
    it('is defined', () => {
      expect(WS_CONFIG).toBeDefined();
    });

    it('has reconnectAttempts', () => {
      expect(WS_CONFIG.reconnectAttempts).toBeDefined();
      expect(typeof WS_CONFIG.reconnectAttempts).toBe('number');
      expect(WS_CONFIG.reconnectAttempts).toBeGreaterThan(0);
    });

    it('has reconnectIntervalMs', () => {
      expect(WS_CONFIG.reconnectIntervalMs).toBeDefined();
      expect(typeof WS_CONFIG.reconnectIntervalMs).toBe('number');
      expect(WS_CONFIG.reconnectIntervalMs).toBeGreaterThan(0);
    });

    it('has maxReconnectIntervalMs', () => {
      expect(WS_CONFIG.maxReconnectIntervalMs).toBeDefined();
      expect(typeof WS_CONFIG.maxReconnectIntervalMs).toBe('number');
      expect(WS_CONFIG.maxReconnectIntervalMs).toBeGreaterThan(0);
    });

    it('has heartbeatIntervalMs', () => {
      expect(WS_CONFIG.heartbeatIntervalMs).toBeDefined();
      expect(typeof WS_CONFIG.heartbeatIntervalMs).toBe('number');
      expect(WS_CONFIG.heartbeatIntervalMs).toBeGreaterThan(0);
    });

    it('has heartbeatTimeoutMs', () => {
      expect(WS_CONFIG.heartbeatTimeoutMs).toBeDefined();
      expect(typeof WS_CONFIG.heartbeatTimeoutMs).toBe('number');
      expect(WS_CONFIG.heartbeatTimeoutMs).toBeGreaterThan(0);
    });

    it('maxReconnectIntervalMs is greater than reconnectIntervalMs', () => {
      expect(WS_CONFIG.maxReconnectIntervalMs).toBeGreaterThan(
        WS_CONFIG.reconnectIntervalMs
      );
    });

    it('heartbeatTimeoutMs is greater than heartbeatIntervalMs', () => {
      expect(WS_CONFIG.heartbeatTimeoutMs).toBeGreaterThan(
        WS_CONFIG.heartbeatIntervalMs
      );
    });

    it('all config values are positive numbers', () => {
      Object.values(WS_CONFIG).forEach((value) => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      });
    });
  });
});
