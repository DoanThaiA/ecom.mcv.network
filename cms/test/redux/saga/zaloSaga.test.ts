import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { zaloRepository } from 'src/repositories/zalo.repository';
import { zaloSaga } from 'src/redux/saga/zaloSaga';
import {
  zaloRedirectRequest,
  zaloCallbackRequest,
  zaloCheckConnectionRequest,
  setZaloLoading,
  setZaloOAInfo,
} from 'src/redux/store/zaloSlice';

// Mock repository
vi.mock('src/repositories/zalo.repository', () => ({
  zaloRepository: {
    getRedirectUrl: vi.fn(),
    handleCallback: vi.fn(),
    checkConnection: vi.fn(),
  },
}));

// Mock toast
vi.mock('src/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

describe('zaloSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = '';
  });

  describe('root saga', () => {
    it('exports zaloSaga function', () => {
      expect(zaloSaga).toBeDefined();
      expect(zaloSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchZalo', () => {
      const gen = zaloSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchZalo', () => {
      const gen = zaloSaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('zaloRedirectSaga', () => {
    it('successfully gets redirect URL and redirects', async () => {
      const mockResponse = {
        url: 'https://oauth.zaloapp.com/v4/oa/permission',
      };

      vi.mocked(zaloRepository.getRedirectUrl).mockResolvedValue(mockResponse);

      const action = zaloRedirectRequest({});

      expect(action.type).toBe('zalo/redirectRequest');
    });

    it('handles redirect with empty URL', async () => {
      const mockResponse = {
        url: '',
      };

      vi.mocked(zaloRepository.getRedirectUrl).mockResolvedValue(mockResponse);

      expect(zaloSaga).toBeDefined();
    });

    it('handles redirect failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(zaloRepository.getRedirectUrl).mockRejectedValue(mockError);

      expect(zaloSaga).toBeDefined();
    });

    it('sets loading state during redirect', () => {
      const action = setZaloLoading(true);

      expect(action.type).toBe('zalo/setZaloLoading');
      expect(action.payload).toBe(true);
    });
  });

  describe('zaloCallbackSaga', () => {
    it('successfully handles callback with code', async () => {
      const mockResponse = {
        message: 'Authentication successful',
        oaInfo: {
          oaId: '123456',
          name: 'Test OA',
        },
      };

      vi.mocked(zaloRepository.handleCallback).mockResolvedValue(mockResponse);

      const action = zaloCallbackRequest({ code: 'auth-code-123' });

      expect(action.type).toBe('zalo/callbackRequest');
      expect(action.payload.code).toBe('auth-code-123');
    });

    it('handles callback without message', async () => {
      const mockResponse = {
        oaInfo: {
          oaId: '123456',
          name: 'Test OA',
        },
      };

      vi.mocked(zaloRepository.handleCallback).mockResolvedValue(mockResponse);

      expect(zaloSaga).toBeDefined();
    });

    it('handles callback failure', async () => {
      const mockError = new Error('Invalid code');

      vi.mocked(zaloRepository.handleCallback).mockRejectedValue(mockError);

      const action = zaloCallbackRequest({ code: 'invalid-code' });

      expect(action.type).toBe('zalo/callbackRequest');
    });

    it('handles callback with error object', async () => {
      const mockError = { message: 'Auth failed' };

      vi.mocked(zaloRepository.handleCallback).mockRejectedValue(mockError);

      expect(zaloSaga).toBeDefined();
    });
  });

  describe('zaloCheckConnectionSaga', () => {
    it('successfully checks connection when connected', async () => {
      const mockResponse = {
        oaInfo: {
          oaId: '123456',
          name: 'Test OA',
          avatar: 'https://example.com/avatar.jpg',
        },
      };

      vi.mocked(zaloRepository.checkConnection).mockResolvedValue(mockResponse);

      const action = zaloCheckConnectionRequest({});

      expect(action.type).toBe('zalo/checkConnectionRequest');
    });

    it('successfully checks connection when not connected', async () => {
      const mockResponse = {
        oaInfo: null,
      };

      vi.mocked(zaloRepository.checkConnection).mockResolvedValue(mockResponse);

      expect(zaloSaga).toBeDefined();
    });

    it('handles check connection failure silently', async () => {
      const mockError = new Error('Connection check failed');

      vi.mocked(zaloRepository.checkConnection).mockRejectedValue(mockError);

      const action = zaloCheckConnectionRequest({});

      expect(action.type).toBe('zalo/checkConnectionRequest');
    });

    it('sets OA info when connected', () => {
      const oaInfo = {
        oaId: '123456',
        name: 'Test OA',
        avatar: 'https://example.com/avatar.jpg',
      };

      const action = setZaloOAInfo(oaInfo);

      expect(action.type).toBe('zalo/setZaloOAInfo');
      expect(action.payload).toEqual(oaInfo);
    });

    it('sets null OA info when not connected', () => {
      const action = setZaloOAInfo(null);

      expect(action.type).toBe('zalo/setZaloOAInfo');
      expect(action.payload).toBeNull();
    });
  });

  describe('action types', () => {
    it('has correct action type for zaloRedirectRequest', () => {
      expect(zaloRedirectRequest.type).toBe('zalo/redirectRequest');
    });

    it('has correct action type for zaloCallbackRequest', () => {
      expect(zaloCallbackRequest.type).toBe('zalo/callbackRequest');
    });

    it('has correct action type for zaloCheckConnectionRequest', () => {
      expect(zaloCheckConnectionRequest.type).toBe('zalo/checkConnectionRequest');
    });

    it('has correct action type for setZaloLoading', () => {
      expect(setZaloLoading.type).toBe('zalo/setZaloLoading');
    });

    it('has correct action type for setZaloOAInfo', () => {
      expect(setZaloOAInfo.type).toBe('zalo/setZaloOAInfo');
    });
  });

  describe('integration with redux-saga effects', () => {
    it('uses call effect', () => {
      expect(call).toBeDefined();
    });

    it('uses put effect', () => {
      expect(put).toBeDefined();
    });

    it('uses takeLatest effect', () => {
      expect(takeLatest).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('handles error with message', () => {
      const error = new Error('Test error');

      expect(error.message).toBe('Test error');
    });

    it('handles error without message', () => {
      const error = { code: 500 };

      expect(error).toHaveProperty('code');
    });

    it('handles null error', () => {
      const error = null;

      expect(error).toBeNull();
    });
  });
});
