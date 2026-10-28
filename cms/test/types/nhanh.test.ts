import { describe, it, expect } from 'vitest';
import type {
  NhanhRedirectResponse,
  NhanhCallbackRequest,
  NhanhCallbackResponse,
  NhanhSyncAllResponse,
  NhanhCheckConnectionResponse,
} from 'src/types/nhanh';

describe('Nhanh Types', () => {
  describe('NhanhRedirectResponse', () => {
    it('has url property', () => {
      const response: NhanhRedirectResponse = {
        url: 'https://example.com',
      };
      expect(response.url).toBe('https://example.com');
    });

    it('accepts string url', () => {
      const response: NhanhRedirectResponse = {
        url: 'test-url',
      };
      expect(response).toHaveProperty('url');
    });

    it('url can be empty string', () => {
      const response: NhanhRedirectResponse = {
        url: '',
      };
      expect(response.url).toBe('');
    });
  });

  describe('NhanhCallbackRequest', () => {
    it('has accessCode property', () => {
      const request: NhanhCallbackRequest = {
        accessCode: 'test-code',
      };
      expect(request.accessCode).toBe('test-code');
    });

    it('accepts string accessCode', () => {
      const request: NhanhCallbackRequest = {
        accessCode: '123456',
      };
      expect(request).toHaveProperty('accessCode');
    });

    it('accessCode can be empty string', () => {
      const request: NhanhCallbackRequest = {
        accessCode: '',
      };
      expect(request.accessCode).toBe('');
    });
  });

  describe('NhanhCallbackResponse', () => {
    it('has required properties', () => {
      const response: NhanhCallbackResponse = {
        success: true,
        message: 'Success',
      };
      expect(response.success).toBe(true);
      expect(response.message).toBe('Success');
    });

    it('has optional data property', () => {
      const response: NhanhCallbackResponse = {
        success: true,
        message: 'Success',
        data: { key: 'value' },
      };
      expect(response.data).toEqual({ key: 'value' });
    });

    it('works without data property', () => {
      const response: NhanhCallbackResponse = {
        success: false,
        message: 'Error',
      };
      expect(response.data).toBeUndefined();
    });

    it('accepts boolean success', () => {
      const response: NhanhCallbackResponse = {
        success: false,
        message: 'Test',
      };
      expect(typeof response.success).toBe('boolean');
    });

    it('accepts string message', () => {
      const response: NhanhCallbackResponse = {
        success: true,
        message: 'Test message',
      };
      expect(typeof response.message).toBe('string');
    });

    it('data can be any type', () => {
      const response: NhanhCallbackResponse = {
        success: true,
        message: 'Test',
        data: 'string data',
      };
      expect(response.data).toBe('string data');
    });

    it('data can be null', () => {
      const response: NhanhCallbackResponse = {
        success: true,
        message: 'Test',
        data: null,
      };
      expect(response.data).toBeNull();
    });
  });

  describe('NhanhSyncAllResponse', () => {
    it('has message property', () => {
      const response: NhanhSyncAllResponse = {
        message: 'Sync completed',
      };
      expect(response.message).toBe('Sync completed');
    });

    it('accepts string message', () => {
      const response: NhanhSyncAllResponse = {
        message: 'Test',
      };
      expect(response).toHaveProperty('message');
    });

    it('message can be empty string', () => {
      const response: NhanhSyncAllResponse = {
        message: '',
      };
      expect(response.message).toBe('');
    });
  });

  describe('NhanhCheckConnectionResponse', () => {
    it('has required isConnected property', () => {
      const response: NhanhCheckConnectionResponse = {
        isConnected: true,
      };
      expect(response.isConnected).toBe(true);
    });

    it('has optional storeId property', () => {
      const response: NhanhCheckConnectionResponse = {
        isConnected: true,
        storeId: '12345',
      };
      expect(response.storeId).toBe('12345');
    });

    it('has optional storeName property', () => {
      const response: NhanhCheckConnectionResponse = {
        isConnected: true,
        storeName: 'Test Store',
      };
      expect(response.storeName).toBe('Test Store');
    });

    it('has optional message property', () => {
      const response: NhanhCheckConnectionResponse = {
        isConnected: false,
        message: 'Connection failed',
      };
      expect(response.message).toBe('Connection failed');
    });

    it('works with all properties', () => {
      const response: NhanhCheckConnectionResponse = {
        isConnected: true,
        storeId: '123',
        storeName: 'Store',
        message: 'Connected',
      };
      expect(response.isConnected).toBe(true);
      expect(response.storeId).toBe('123');
      expect(response.storeName).toBe('Store');
      expect(response.message).toBe('Connected');
    });

    it('works with only required property', () => {
      const response: NhanhCheckConnectionResponse = {
        isConnected: false,
      };
      expect(response.storeId).toBeUndefined();
      expect(response.storeName).toBeUndefined();
      expect(response.message).toBeUndefined();
    });

    it('isConnected can be false', () => {
      const response: NhanhCheckConnectionResponse = {
        isConnected: false,
      };
      expect(response.isConnected).toBe(false);
    });

    it('optional properties can be undefined', () => {
      const response: NhanhCheckConnectionResponse = {
        isConnected: true,
        storeId: undefined,
        storeName: undefined,
        message: undefined,
      };
      expect(response.isConnected).toBe(true);
    });

    it('storeId can be empty string', () => {
      const response: NhanhCheckConnectionResponse = {
        isConnected: true,
        storeId: '',
      };
      expect(response.storeId).toBe('');
    });

    it('storeName can be empty string', () => {
      const response: NhanhCheckConnectionResponse = {
        isConnected: true,
        storeName: '',
      };
      expect(response.storeName).toBe('');
    });
  });

  describe('Type exports', () => {
    it('exports NhanhRedirectResponse', () => {
      const response: NhanhRedirectResponse = { url: 'test' };
      expect(response).toBeDefined();
    });

    it('exports NhanhCallbackRequest', () => {
      const request: NhanhCallbackRequest = { accessCode: 'test' };
      expect(request).toBeDefined();
    });

    it('exports NhanhCallbackResponse', () => {
      const response: NhanhCallbackResponse = { success: true, message: 'test' };
      expect(response).toBeDefined();
    });

    it('exports NhanhSyncAllResponse', () => {
      const response: NhanhSyncAllResponse = { message: 'test' };
      expect(response).toBeDefined();
    });

    it('exports NhanhCheckConnectionResponse', () => {
      const response: NhanhCheckConnectionResponse = { isConnected: true };
      expect(response).toBeDefined();
    });
  });
});
