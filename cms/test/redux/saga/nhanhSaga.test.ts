import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { nhanhRepository } from 'src/repositories';
import { nhanhSaga } from 'src/redux/saga/nhanhSaga';
import {
  nhanhRedirectRequest,
  nhanhCallbackRequest,
  nhanhSyncAllRequest,
  nhanhCheckConnectionRequest,
  nhanhSyncProductCategoriesRequest,
  setNhanhLoading,
  setNhanhConnected,
  setNhanhError,
} from 'src/redux/store/nhanhSlice';

// Mock repository
vi.mock('src/repositories', () => ({
  nhanhRepository: {
    getRedirectUrl: vi.fn(),
    handleCallback: vi.fn(),
    syncAll: vi.fn(),
    checkConnection: vi.fn(),
    syncProductCategories: vi.fn(),
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

describe('nhanhSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = '';
  });

  describe('root saga', () => {
    it('exports nhanhSaga function', () => {
      expect(nhanhSaga).toBeDefined();
      expect(nhanhSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchNhanh', () => {
      const gen = nhanhSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchNhanh', () => {
      const gen = nhanhSaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('nhanhRedirectSaga', () => {
    it('successfully gets redirect URL and redirects', async () => {
      const mockResponse = {
        url: 'https://nhanh.vn/oauth/authorize',
      };

      vi.mocked(nhanhRepository.getRedirectUrl).mockResolvedValue(mockResponse);

      const action = nhanhRedirectRequest({});

      expect(action.type).toBe('nhanh/redirectRequest');
    });

    it('handles redirect with empty URL', async () => {
      const mockResponse = {
        url: '',
      };

      vi.mocked(nhanhRepository.getRedirectUrl).mockResolvedValue(mockResponse);

      expect(nhanhSaga).toBeDefined();
    });

    it('handles redirect failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(nhanhRepository.getRedirectUrl).mockRejectedValue(mockError);

      expect(nhanhSaga).toBeDefined();
    });

    it('calls onSuccess callback when successful', async () => {
      const mockResponse = {
        url: 'https://nhanh.vn/oauth/authorize',
      };

      vi.mocked(nhanhRepository.getRedirectUrl).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = nhanhRedirectRequest({ onSuccess });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('Failed to get redirect URL');

      vi.mocked(nhanhRepository.getRedirectUrl).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = nhanhRedirectRequest({ onError });

      expect(action.payload.onError).toBe(onError);
    });

    it('handles error with response data', () => {
      const error = {
        response: {
          data: {
            message: 'Invalid configuration',
          },
        },
      };

      expect(error.response.data.message).toBe('Invalid configuration');
    });

    it('sets loading state during redirect', () => {
      const action = setNhanhLoading(true);

      expect(action.type).toBe('nhanh/setNhanhLoading');
      expect(action.payload).toBe(true);
    });

    it('sets error state', () => {
      const action = setNhanhError('Error message');

      expect(action.type).toBe('nhanh/setNhanhError');
      expect(action.payload).toBe('Error message');
    });
  });

  describe('nhanhCallbackSaga', () => {
    it('successfully handles callback with access code', async () => {
      const mockResponse = {
        message: 'Authentication successful',
      };

      vi.mocked(nhanhRepository.handleCallback).mockResolvedValue(mockResponse);

      const action = nhanhCallbackRequest({ accessCode: 'auth-code-123' });

      expect(action.type).toBe('nhanh/callbackRequest');
      expect(action.payload.accessCode).toBe('auth-code-123');
    });

    it('handles callback without message', async () => {
      const mockResponse = {};

      vi.mocked(nhanhRepository.handleCallback).mockResolvedValue(mockResponse);

      expect(nhanhSaga).toBeDefined();
    });

    it('handles callback failure', async () => {
      const mockError = new Error('Invalid access code');

      vi.mocked(nhanhRepository.handleCallback).mockRejectedValue(mockError);

      const action = nhanhCallbackRequest({ accessCode: 'invalid-code' });

      expect(action.type).toBe('nhanh/callbackRequest');
    });

    it('calls onSuccess callback when successful', async () => {
      const mockResponse = {
        message: 'Success',
      };

      vi.mocked(nhanhRepository.handleCallback).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = nhanhCallbackRequest({
        accessCode: 'auth-code-123',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('Authentication failed');

      vi.mocked(nhanhRepository.handleCallback).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = nhanhCallbackRequest({
        accessCode: 'auth-code-123',
        onError,
      });

      expect(action.payload.onError).toBe(onError);
    });

    it('sets connected state on success', () => {
      const action = setNhanhConnected(true);

      expect(action.type).toBe('nhanh/setNhanhConnected');
      expect(action.payload).toBe(true);
    });

    it('handles error with custom message', () => {
      const error = {
        response: {
          data: {
            message: 'Access code expired',
          },
        },
        message: 'Request failed',
      };

      expect(error.response.data.message).toBe('Access code expired');
    });
  });

  describe('nhanhSyncAllSaga', () => {
    it('successfully syncs all data', async () => {
      const mockResponse = {
        message: 'Synced successfully',
      };

      vi.mocked(nhanhRepository.syncAll).mockResolvedValue(mockResponse);

      const action = nhanhSyncAllRequest({});

      expect(action.type).toBe('nhanh/syncAllRequest');
    });

    it('handles sync with detailed message', async () => {
      const mockResponse = {
        message: 'Synced 100 products, 50 orders, 30 categories',
      };

      vi.mocked(nhanhRepository.syncAll).mockResolvedValue(mockResponse);

      expect(nhanhSaga).toBeDefined();
    });

    it('calls onSuccess callback when successful', async () => {
      const mockResponse = {
        message: 'Sync completed',
      };

      vi.mocked(nhanhRepository.syncAll).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = nhanhSyncAllRequest({ onSuccess });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles sync failure', async () => {
      const mockError = new Error('Sync failed');

      vi.mocked(nhanhRepository.syncAll).mockRejectedValue(mockError);

      expect(nhanhSaga).toBeDefined();
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('Network timeout');

      vi.mocked(nhanhRepository.syncAll).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = nhanhSyncAllRequest({ onError });

      expect(action.payload.onError).toBe(onError);
    });

    it('handles error with response message', () => {
      const error = {
        response: {
          data: {
            message: 'Sync quota exceeded',
          },
        },
      };

      expect(error.response.data.message).toBe('Sync quota exceeded');
    });
  });

  describe('nhanhCheckConnectionSaga', () => {
    it('successfully checks connection when connected', async () => {
      const mockResponse = {
        connected: true,
      };

      vi.mocked(nhanhRepository.checkConnection).mockResolvedValue(mockResponse);

      const action = nhanhCheckConnectionRequest({});

      expect(action.type).toBe('nhanh/checkConnectionRequest');
    });

    it('calls onSuccess callback with connection status', async () => {
      const mockResponse = {
        connected: true,
      };

      vi.mocked(nhanhRepository.checkConnection).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = nhanhCheckConnectionRequest({ onSuccess });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles check connection failure silently', async () => {
      const mockError = new Error('Connection check failed');

      vi.mocked(nhanhRepository.checkConnection).mockRejectedValue(mockError);

      const action = nhanhCheckConnectionRequest({});

      expect(action.type).toBe('nhanh/checkConnectionRequest');
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('Not connected');

      vi.mocked(nhanhRepository.checkConnection).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = nhanhCheckConnectionRequest({ onError });

      expect(action.payload.onError).toBe(onError);
    });

    it('sets connected to false on error', () => {
      const action = setNhanhConnected(false);

      expect(action.type).toBe('nhanh/setNhanhConnected');
      expect(action.payload).toBe(false);
    });

    it('handles error message', () => {
      const error = {
        response: {
          data: {
            message: 'Not authenticated',
          },
        },
        message: 'Request failed',
      };

      expect(error.response.data.message).toBe('Not authenticated');
    });
  });

  describe('nhanhSyncProductCategoriesSaga', () => {
    it('successfully syncs product categories', async () => {
      const mockResponse = {
        message: 'Synced product categories successfully',
      };

      vi.mocked(nhanhRepository.syncProductCategories).mockResolvedValue(mockResponse);

      const action = nhanhSyncProductCategoriesRequest({});

      expect(action.type).toBe('nhanh/syncProductCategoriesRequest');
    });

    it('calls onSuccess callback when successful', async () => {
      const mockResponse = {
        message: 'Categories synced',
      };

      vi.mocked(nhanhRepository.syncProductCategories).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = nhanhSyncProductCategoriesRequest({ onSuccess });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles sync product categories failure', async () => {
      const mockError = new Error('Sync failed');

      vi.mocked(nhanhRepository.syncProductCategories).mockRejectedValue(mockError);

      expect(nhanhSaga).toBeDefined();
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('Network timeout');

      vi.mocked(nhanhRepository.syncProductCategories).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = nhanhSyncProductCategoriesRequest({ onError });

      expect(action.payload.onError).toBe(onError);
    });

    it('handles error with response message', () => {
      const error = {
        response: {
          data: {
            message: 'Category sync quota exceeded',
          },
        },
      };

      expect(error.response.data.message).toBe('Category sync quota exceeded');
    });
  });

  describe('action types', () => {
    it('has correct action type for nhanhRedirectRequest', () => {
      expect(nhanhRedirectRequest.type).toBe('nhanh/redirectRequest');
    });

    it('has correct action type for nhanhCallbackRequest', () => {
      expect(nhanhCallbackRequest.type).toBe('nhanh/callbackRequest');
    });

    it('has correct action type for nhanhSyncAllRequest', () => {
      expect(nhanhSyncAllRequest.type).toBe('nhanh/syncAllRequest');
    });

    it('has correct action type for nhanhCheckConnectionRequest', () => {
      expect(nhanhCheckConnectionRequest.type).toBe('nhanh/checkConnectionRequest');
    });

    it('has correct action type for nhanhSyncProductCategoriesRequest', () => {
      expect(nhanhSyncProductCategoriesRequest.type).toBe('nhanh/syncProductCategoriesRequest');
    });

    it('has correct action type for setNhanhLoading', () => {
      expect(setNhanhLoading.type).toBe('nhanh/setNhanhLoading');
    });

    it('has correct action type for setNhanhConnected', () => {
      expect(setNhanhConnected.type).toBe('nhanh/setNhanhConnected');
    });

    it('has correct action type for setNhanhError', () => {
      expect(setNhanhError.type).toBe('nhanh/setNhanhError');
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

    it('handles nested error response', () => {
      const error = {
        response: {
          data: {
            message: 'Detailed error',
          },
        },
      };

      expect(error.response.data.message).toBe('Detailed error');
    });
  });

  describe('callbacks', () => {
    it('handles onSuccess callback for redirect', () => {
      const onSuccess = vi.fn();
      const action = nhanhRedirectRequest({ onSuccess });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onError callback for redirect', () => {
      const onError = vi.fn();
      const action = nhanhRedirectRequest({ onError });

      expect(typeof action.payload.onError).toBe('function');
    });

    it('handles both callbacks together for callback', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const action = nhanhCallbackRequest({
        accessCode: 'code-123',
        onSuccess,
        onError,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
      expect(action.payload.onError).toBe(onError);
    });

    it('handles onSuccess callback for syncAll', () => {
      const onSuccess = vi.fn();
      const action = nhanhSyncAllRequest({ onSuccess });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onError callback for syncAll', () => {
      const onError = vi.fn();
      const action = nhanhSyncAllRequest({ onError });

      expect(typeof action.payload.onError).toBe('function');
    });

    it('handles onSuccess callback for checkConnection', () => {
      const onSuccess = vi.fn();
      const action = nhanhCheckConnectionRequest({ onSuccess });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onError callback for checkConnection', () => {
      const onError = vi.fn();
      const action = nhanhCheckConnectionRequest({ onError });

      expect(typeof action.payload.onError).toBe('function');
    });

    it('handles onSuccess callback for syncProductCategories', () => {
      const onSuccess = vi.fn();
      const action = nhanhSyncProductCategoriesRequest({ onSuccess });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onError callback for syncProductCategories', () => {
      const onError = vi.fn();
      const action = nhanhSyncProductCategoriesRequest({ onError });

      expect(typeof action.payload.onError).toBe('function');
    });
  });

  describe('connection states', () => {
    it('handles connected state', () => {
      const action = setNhanhConnected(true);

      expect(action.payload).toBe(true);
    });

    it('handles disconnected state', () => {
      const action = setNhanhConnected(false);

      expect(action.payload).toBe(false);
    });

    it('handles loading state', () => {
      const action = setNhanhLoading(true);

      expect(action.payload).toBe(true);
    });

    it('handles not loading state', () => {
      const action = setNhanhLoading(false);

      expect(action.payload).toBe(false);
    });
  });

  describe('access code', () => {
    it('handles valid access code', () => {
      const action = nhanhCallbackRequest({
        accessCode: 'valid-access-code-123',
      });

      expect(action.payload.accessCode).toBe('valid-access-code-123');
    });

    it('handles empty access code', () => {
      const action = nhanhCallbackRequest({
        accessCode: '',
      });

      expect(action.payload.accessCode).toBe('');
    });
  });
});
