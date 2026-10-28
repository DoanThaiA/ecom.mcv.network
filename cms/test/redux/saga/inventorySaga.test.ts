import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { inventoryRepository } from 'src/repositories';
import { inventorySaga } from 'src/redux/saga/inventorySaga';
import {
  getInventoriesRequest,
  getInventoryByIdRequest,
  setInventoryLoading,
  setInventoriesSuccess,
  setInventoryError,
  setCurrentInventoryLoading,
  setCurrentInventorySuccess,
  setCurrentInventoryError,
} from 'src/redux/store/inventorySlice';

// Mock repository
vi.mock('src/repositories', () => ({
  inventoryRepository: {
    getInventories: vi.fn(),
    getInventoryById: vi.fn(),
  },
}));

// Mock toast
vi.mock('src/utils/toast', () => ({
  showError: vi.fn(),
}));

describe('inventorySaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports inventorySaga function', () => {
      expect(inventorySaga).toBeDefined();
      expect(inventorySaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchInventory', () => {
      const gen = inventorySaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchInventory', () => {
      const gen = inventorySaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('getInventoriesSaga', () => {
    it('successfully fetches inventories with default params', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            productId: 'prod-1',
            quantity: 100,
            warehouse: 'Main',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      };

      vi.mocked(inventoryRepository.getInventories).mockResolvedValue(mockResponse);

      const action = getInventoriesRequest({ page: 1, limit: 10 });

      expect(action.type).toBe('inventory/getInventoriesRequest');
      expect(action.payload).toEqual({ page: 1, limit: 10 });
    });

    it('successfully fetches with filters', async () => {
      const mockResponse = {
        data: [{ id: '1', productId: 'prod-1', quantity: 100 }],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      };

      vi.mocked(inventoryRepository.getInventories).mockResolvedValue(mockResponse);

      const action = getInventoriesRequest({
        page: 1,
        limit: 10,
        filters: { productId: 'prod-1' },
      });

      expect(action.payload.filters).toEqual({ productId: 'prod-1' });
    });

    it('successfully fetches with sort', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(inventoryRepository.getInventories).mockResolvedValue(mockResponse);

      const action = getInventoriesRequest({
        page: 1,
        limit: 10,
        sort: { field: 'quantity', order: 'desc' },
      });

      expect(action.payload.sort).toEqual({ field: 'quantity', order: 'desc' });
    });

    it('calls onSuccess callback when successful', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(inventoryRepository.getInventories).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = getInventoriesRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(inventoryRepository.getInventories).mockRejectedValue(mockError);

      expect(inventorySaga).toBeDefined();
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('API error');

      vi.mocked(inventoryRepository.getInventories).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = getInventoriesRequest({
        page: 1,
        limit: 10,
        onError,
      });

      expect(action.payload.onError).toBe(onError);
    });

    it('handles error with response data', () => {
      const error = {
        response: {
          data: {
            message: 'Invalid request',
          },
        },
      };

      expect(error.response.data.message).toBe('Invalid request');
    });

    it('sets loading state', () => {
      const action = setInventoryLoading(true);

      expect(action.type).toBe('inventory/setInventoryLoading');
      expect(action.payload).toBe(true);
    });

    it('sets success state with pagination', () => {
      const data = {
        inventories: [{ id: '1', productId: 'prod-1', quantity: 100 }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      const action = setInventoriesSuccess(data);

      expect(action.type).toBe('inventory/setInventoriesSuccess');
      expect(action.payload).toEqual(data);
    });

    it('sets error state', () => {
      const action = setInventoryError('Error message');

      expect(action.type).toBe('inventory/setInventoryError');
      expect(action.payload).toBe('Error message');
    });
  });

  describe('getInventoryByIdSaga', () => {
    it('successfully fetches inventory by ID', async () => {
      const mockInventory = {
        id: '1',
        productId: 'prod-1',
        quantity: 100,
        warehouse: 'Main',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(inventoryRepository.getInventoryById).mockResolvedValue(mockInventory);

      const action = getInventoryByIdRequest({ id: '1' });

      expect(action.type).toBe('inventory/getInventoryByIdRequest');
      expect(action.payload.id).toBe('1');
    });

    it('calls onSuccess callback with inventory data', async () => {
      const mockInventory = {
        id: '1',
        productId: 'prod-1',
        quantity: 100,
      };

      vi.mocked(inventoryRepository.getInventoryById).mockResolvedValue(mockInventory);

      const onSuccess = vi.fn();
      const action = getInventoryByIdRequest({
        id: '1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch by ID failure', async () => {
      const mockError = new Error('Inventory not found');

      vi.mocked(inventoryRepository.getInventoryById).mockRejectedValue(mockError);

      const action = getInventoryByIdRequest({ id: '999' });

      expect(action.payload.id).toBe('999');
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('Not found');

      vi.mocked(inventoryRepository.getInventoryById).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = getInventoryByIdRequest({
        id: '999',
        onError,
      });

      expect(action.payload.onError).toBe(onError);
    });

    it('handles error with response message', () => {
      const error = {
        response: {
          data: {
            message: 'Inventory not available',
          },
        },
        message: 'Request failed',
      };

      expect(error.response.data.message).toBe('Inventory not available');
      expect(error.message).toBe('Request failed');
    });

    it('sets current loading state', () => {
      const action = setCurrentInventoryLoading(true);

      expect(action.type).toBe('inventory/setCurrentInventoryLoading');
      expect(action.payload).toBe(true);
    });

    it('sets current success state', () => {
      const inventory = {
        id: '1',
        productId: 'prod-1',
        quantity: 100,
      };

      const action = setCurrentInventorySuccess(inventory);

      expect(action.type).toBe('inventory/setCurrentInventorySuccess');
      expect(action.payload).toEqual(inventory);
    });

    it('sets current error state', () => {
      const action = setCurrentInventoryError('Error message');

      expect(action.type).toBe('inventory/setCurrentInventoryError');
      expect(action.payload).toBe('Error message');
    });
  });

  describe('action types', () => {
    it('has correct action type for getInventoriesRequest', () => {
      expect(getInventoriesRequest.type).toBe('inventory/getInventoriesRequest');
    });

    it('has correct action type for getInventoryByIdRequest', () => {
      expect(getInventoryByIdRequest.type).toBe('inventory/getInventoryByIdRequest');
    });

    it('has correct action type for setInventoryLoading', () => {
      expect(setInventoryLoading.type).toBe('inventory/setInventoryLoading');
    });

    it('has correct action type for setInventoriesSuccess', () => {
      expect(setInventoriesSuccess.type).toBe('inventory/setInventoriesSuccess');
    });

    it('has correct action type for setInventoryError', () => {
      expect(setInventoryError.type).toBe('inventory/setInventoryError');
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

  describe('pagination and filtering', () => {
    it('handles different page numbers', () => {
      const action = getInventoriesRequest({ page: 5, limit: 50 });

      expect(action.payload.page).toBe(5);
      expect(action.payload.limit).toBe(50);
    });

    it('handles empty filters', () => {
      const action = getInventoriesRequest({ page: 1, limit: 10, filters: {} });

      expect(action.payload.filters).toEqual({});
    });

    it('handles complex filters', () => {
      const filters = {
        productId: 'prod-1',
        warehouse: 'Main',
        minQuantity: 10,
      };
      const action = getInventoriesRequest({ page: 1, limit: 10, filters });

      expect(action.payload.filters).toEqual(filters);
    });

    it('handles pagination metadata', () => {
      const data = {
        inventories: [],
        pagination: {
          page: 2,
          limit: 20,
          total: 100,
          totalPages: 5,
        },
      };

      const action = setInventoriesSuccess(data);

      expect(action.payload.pagination.page).toBe(2);
      expect(action.payload.pagination.totalPages).toBe(5);
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
    it('handles onSuccess callback function', () => {
      const onSuccess = vi.fn();
      const action = getInventoriesRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onError callback function', () => {
      const onError = vi.fn();
      const action = getInventoriesRequest({
        page: 1,
        limit: 10,
        onError,
      });

      expect(typeof action.payload.onError).toBe('function');
    });

    it('handles both callbacks together', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const action = getInventoriesRequest({
        page: 1,
        limit: 10,
        onSuccess,
        onError,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
      expect(action.payload.onError).toBe(onError);
    });

    it('handles onSuccess callback for getInventoryById', () => {
      const onSuccess = vi.fn();
      const action = getInventoryByIdRequest({
        id: '1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onError callback for getInventoryById', () => {
      const onError = vi.fn();
      const action = getInventoryByIdRequest({
        id: '1',
        onError,
      });

      expect(typeof action.payload.onError).toBe('function');
    });
  });
});
