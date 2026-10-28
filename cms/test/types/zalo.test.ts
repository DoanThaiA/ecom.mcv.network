import { describe, it, expect } from 'vitest';
import type {
  ZaloRedirectResponse,
  ZaloCallbackRequest,
  ZaloOAInfo,
  ZaloCallbackResponse,
  ZaloCheckConnectionResponse,
} from 'src/types/zalo';

describe('Zalo Types', () => {
  describe('ZaloRedirectResponse', () => {
    it('has url property', () => {
      const response: ZaloRedirectResponse = {
        url: 'https://example.com',
      };
      expect(response.url).toBe('https://example.com');
    });

    it('accepts string url', () => {
      const response: ZaloRedirectResponse = {
        url: 'test-url',
      };
      expect(response).toHaveProperty('url');
    });
  });

  describe('ZaloCallbackRequest', () => {
    it('has code property', () => {
      const request: ZaloCallbackRequest = {
        code: 'auth-code-123',
      };
      expect(request.code).toBe('auth-code-123');
    });

    it('accepts string code', () => {
      const request: ZaloCallbackRequest = {
        code: '123456',
      };
      expect(request).toHaveProperty('code');
    });
  });

  describe('ZaloOAInfo', () => {
    it('has required properties', () => {
      const oaInfo: ZaloOAInfo = {
        oa_id: '123',
        name: 'Test OA',
        is_verified: true,
        cate_name: 'Category',
        num_follower: 1000,
        avatar: 'https://avatar.url',
      };
      expect(oaInfo.oa_id).toBe('123');
      expect(oaInfo.name).toBe('Test OA');
      expect(oaInfo.is_verified).toBe(true);
    });

    it('has optional description', () => {
      const oaInfo: ZaloOAInfo = {
        oa_id: '123',
        name: 'Test',
        description: 'Test description',
        is_verified: false,
        cate_name: 'Cat',
        num_follower: 0,
        avatar: 'url',
      };
      expect(oaInfo.description).toBe('Test description');
    });

    it('has optional oa_alias', () => {
      const oaInfo: ZaloOAInfo = {
        oa_id: '123',
        name: 'Test',
        oa_alias: 'test-alias',
        is_verified: false,
        cate_name: 'Cat',
        num_follower: 0,
        avatar: 'url',
      };
      expect(oaInfo.oa_alias).toBe('test-alias');
    });

    it('has optional oa_type', () => {
      const oaInfo: ZaloOAInfo = {
        oa_id: '123',
        name: 'Test',
        oa_type: 1,
        is_verified: false,
        cate_name: 'Cat',
        num_follower: 0,
        avatar: 'url',
      };
      expect(oaInfo.oa_type).toBe(1);
    });

    it('has optional cover', () => {
      const oaInfo: ZaloOAInfo = {
        oa_id: '123',
        name: 'Test',
        cover: 'cover-url',
        is_verified: false,
        cate_name: 'Cat',
        num_follower: 0,
        avatar: 'url',
      };
      expect(oaInfo.cover).toBe('cover-url');
    });

    it('has optional package fields', () => {
      const oaInfo: ZaloOAInfo = {
        oa_id: '123',
        name: 'Test',
        package_name: 'Premium',
        package_valid_through_date: '2024-12-31',
        package_auto_renew_date: '2024-11-30',
        is_verified: false,
        cate_name: 'Cat',
        num_follower: 0,
        avatar: 'url',
      };
      expect(oaInfo.package_name).toBe('Premium');
      expect(oaInfo.package_valid_through_date).toBe('2024-12-31');
    });

    it('has optional linked_zca', () => {
      const oaInfo: ZaloOAInfo = {
        oa_id: '123',
        name: 'Test',
        linked_zca: 'zca-id',
        is_verified: false,
        cate_name: 'Cat',
        num_follower: 0,
        avatar: 'url',
      };
      expect(oaInfo.linked_zca).toBe('zca-id');
    });
  });

  describe('ZaloCallbackResponse', () => {
    it('has required properties', () => {
      const response: ZaloCallbackResponse = {
        success: true,
        message: 'Success',
      };
      expect(response.success).toBe(true);
      expect(response.message).toBe('Success');
    });

    it('has optional data property', () => {
      const response: ZaloCallbackResponse = {
        success: true,
        message: 'Success',
        data: { key: 'value' },
      };
      expect(response.data).toEqual({ key: 'value' });
    });

    it('works without data', () => {
      const response: ZaloCallbackResponse = {
        success: false,
        message: 'Error',
      };
      expect(response.data).toBeUndefined();
    });
  });

  describe('ZaloCheckConnectionResponse', () => {
    it('has required isConnected property', () => {
      const response: ZaloCheckConnectionResponse = {
        isConnected: true,
      };
      expect(response.isConnected).toBe(true);
    });

    it('has optional oaId', () => {
      const response: ZaloCheckConnectionResponse = {
        isConnected: true,
        oaId: 'oa-123',
      };
      expect(response.oaId).toBe('oa-123');
    });

    it('has optional oaName', () => {
      const response: ZaloCheckConnectionResponse = {
        isConnected: true,
        oaName: 'Test OA',
      };
      expect(response.oaName).toBe('Test OA');
    });

    it('has optional message', () => {
      const response: ZaloCheckConnectionResponse = {
        isConnected: false,
        message: 'Not connected',
      };
      expect(response.message).toBe('Not connected');
    });

    it('has optional expiresAt', () => {
      const response: ZaloCheckConnectionResponse = {
        isConnected: true,
        expiresAt: 1234567890,
      };
      expect(response.expiresAt).toBe(1234567890);
    });

    it('has optional refreshTokenExpiresAt', () => {
      const response: ZaloCheckConnectionResponse = {
        isConnected: true,
        refreshTokenExpiresAt: 9876543210,
      };
      expect(response.refreshTokenExpiresAt).toBe(9876543210);
    });

    it('has optional oaInfo', () => {
      const oaInfo: ZaloOAInfo = {
        oa_id: '123',
        name: 'Test',
        is_verified: true,
        cate_name: 'Cat',
        num_follower: 100,
        avatar: 'url',
      };
      const response: ZaloCheckConnectionResponse = {
        isConnected: true,
        oaInfo,
      };
      expect(response.oaInfo).toEqual(oaInfo);
    });

    it('works with all properties', () => {
      const response: ZaloCheckConnectionResponse = {
        isConnected: true,
        oaId: 'oa-123',
        oaName: 'Test OA',
        message: 'Connected',
        expiresAt: 1234567890,
        refreshTokenExpiresAt: 9876543210,
        oaInfo: {
          oa_id: '123',
          name: 'Test',
          is_verified: true,
          cate_name: 'Cat',
          num_follower: 100,
          avatar: 'url',
        },
      };
      expect(response.isConnected).toBe(true);
      expect(response.oaId).toBe('oa-123');
    });
  });

  describe('Type exports', () => {
    it('exports ZaloRedirectResponse', () => {
      const response: ZaloRedirectResponse = { url: 'test' };
      expect(response).toBeDefined();
    });

    it('exports ZaloCallbackRequest', () => {
      const request: ZaloCallbackRequest = { code: 'test' };
      expect(request).toBeDefined();
    });

    it('exports ZaloOAInfo', () => {
      const oaInfo: ZaloOAInfo = {
        oa_id: '1',
        name: 'Test',
        is_verified: true,
        cate_name: 'Cat',
        num_follower: 0,
        avatar: 'url',
      };
      expect(oaInfo).toBeDefined();
    });

    it('exports ZaloCallbackResponse', () => {
      const response: ZaloCallbackResponse = { success: true, message: 'test' };
      expect(response).toBeDefined();
    });

    it('exports ZaloCheckConnectionResponse', () => {
      const response: ZaloCheckConnectionResponse = { isConnected: true };
      expect(response).toBeDefined();
    });
  });
});
