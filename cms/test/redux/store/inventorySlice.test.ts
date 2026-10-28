import { describe, it, expect, vi } from 'vitest';

import inventoryReducer, {
  setInventoryLoading,
  setInventoriesSuccess,
  setInventoryError,
  setCurrentInventoryLoading,
  setCurrentInventorySuccess,
  setCurrentInventoryError,
  clearCurrentInventory,
  clearInventoryError,
  setInventoryFilters,
  setInventorySort,
  resetInventoryState,
  getInventoriesRequest,
  getInventoryByIdRequest,
  selectInventories,
  selectCurrentInventory,
  selectInventoryLoading,
  selectCurrentInventoryLoading,
  selectInventoryError,
  selectInventoryPagination,
  selectInventoryFilters,
  selectInventorySort,
  type InventoryState,
} from 'src/redux/store/inventorySlice';
import type { ProductInventory } from 'src/types/product-inventories';

describe('inventorySlice', () => {
  const initialState: InventoryState = {
    inventories: [],
    currentInventory: null,
    loading: false,
    currentInventoryLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: {},
    sort: [],
  };

  const mockInventory: ProductInventory = {
    id: 'inv-1',
    productId: 'product-1',
    productName: 'Test Product',
    sku: 'SKU-001',
    quantity: 100,
    reserved: 10,
    available: 90,
    warehouse: 'Main Warehouse',
    location: 'A1-B2',
    lastUpdated: '2024-01-01T00:00:00Z',
  };

  const mockInventories: ProductInventory[] = [
    mockInventory,
    {
      id: 'inv-2',
      productId: 'product-2',
      productName: 'Another Product',
      sku: 'SKU-002',
      quantity: 50,
      reserved: 5,
      available: 45,
      warehouse: 'Secondary Warehouse',
      location: 'C3-D4',
      lastUpdated: '2024-01-02T00:00:00Z',
    },
  ];

  describe('reducers', () => {
    describe('setInventoryLoading', () => {
      it('sets loading to true and clears error', () => {
        const stateWithError: InventoryState = {
          ...initialState,
          error: 'Previous error',
        };

        const state = inventoryReducer(stateWithError, setInventoryLoading(true));

        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
      });

      it('sets loading to false without clearing error', () => {
        const loadingState: InventoryState = {
          ...initialState,
          loading: true,
          error: 'Some error',
        };

        const state = inventoryReducer(loadingState, setInventoryLoading(false));

        expect(state.loading).toBe(false);
        expect(state.error).toBe('Some error');
      });

      it('does not affect other state', () => {
        const stateWithData: InventoryState = {
          ...initialState,
          inventories: mockInventories,
          currentInventory: mockInventory,
        };

        const state = inventoryReducer(stateWithData, setInventoryLoading(true));

        expect(state.inventories).toEqual(mockInventories);
        expect(state.currentInventory).toEqual(mockInventory);
      });
    });

    describe('setInventoriesSuccess', () => {
      it('sets inventories, pagination and clears loading and error', () => {
        const loadingState: InventoryState = {
          ...initialState,
          loading: true,
          error: 'Error',
        };

        const payload = {
          inventories: mockInventories,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
          },
        };

        const state = inventoryReducer(loadingState, setInventoriesSuccess(payload));

        expect(state.inventories).toEqual(mockInventories);
        expect(state.pagination).toEqual(payload.pagination);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
      });

      it('replaces existing inventories', () => {
        const stateWithData: InventoryState = {
          ...initialState,
          inventories: mockInventories,
        };

        const newInventories: ProductInventory[] = [
          {
            id: 'inv-3',
            productId: 'product-3',
            productName: 'New Product',
            sku: 'SKU-003',
            quantity: 200,
            reserved: 20,
            available: 180,
            warehouse: 'Main Warehouse',
            location: 'E5-F6',
            lastUpdated: '2024-01-03T00:00:00Z',
          },
        ];

        const payload = {
          inventories: newInventories,
          pagination: {
            page: 2,
            limit: 10,
            total: 3,
            totalPages: 1,
          },
        };

        const state = inventoryReducer(stateWithData, setInventoriesSuccess(payload));

        expect(state.inventories).toEqual(newInventories);
        expect(state.inventories).not.toEqual(mockInventories);
      });

      it('handles empty inventories', () => {
        const payload = {
          inventories: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        };

        const state = inventoryReducer(initialState, setInventoriesSuccess(payload));

        expect(state.inventories).toEqual([]);
        expect(state.pagination.total).toBe(0);
      });
    });

    describe('setInventoryError', () => {
      it('sets error and stops loading', () => {
        const loadingState: InventoryState = {
          ...initialState,
          loading: true,
        };

        const state = inventoryReducer(loadingState, setInventoryError('Failed to load'));

        expect(state.error).toBe('Failed to load');
        expect(state.loading).toBe(false);
      });

      it('does not affect inventories', () => {
        const stateWithData: InventoryState = {
          ...initialState,
          loading: true,
          inventories: mockInventories,
        };

        const state = inventoryReducer(stateWithData, setInventoryError('Error'));

        expect(state.inventories).toEqual(mockInventories);
      });
    });

    describe('setCurrentInventoryLoading', () => {
      it('sets current loading to true and clears error', () => {
        const stateWithError: InventoryState = {
          ...initialState,
          error: 'Previous error',
        };

        const state = inventoryReducer(stateWithError, setCurrentInventoryLoading(true));

        expect(state.currentInventoryLoading).toBe(true);
        expect(state.error).toBe(null);
      });

      it('sets current loading to false without clearing error', () => {
        const loadingState: InventoryState = {
          ...initialState,
          currentInventoryLoading: true,
          error: 'Some error',
        };

        const state = inventoryReducer(loadingState, setCurrentInventoryLoading(false));

        expect(state.currentInventoryLoading).toBe(false);
        expect(state.error).toBe('Some error');
      });

      it('does not affect list loading', () => {
        const state = inventoryReducer(initialState, setCurrentInventoryLoading(true));

        expect(state.loading).toBe(false);
      });
    });

    describe('setCurrentInventorySuccess', () => {
      it('sets current inventory and clears loading and error', () => {
        const loadingState: InventoryState = {
          ...initialState,
          currentInventoryLoading: true,
          error: 'Error',
        };

        const state = inventoryReducer(loadingState, setCurrentInventorySuccess(mockInventory));

        expect(state.currentInventory).toEqual(mockInventory);
        expect(state.currentInventoryLoading).toBe(false);
        expect(state.error).toBe(null);
      });

      it('replaces existing current inventory', () => {
        const stateWithCurrent: InventoryState = {
          ...initialState,
          currentInventory: mockInventory,
        };

        const newInventory: ProductInventory = {
          ...mockInventory,
          id: 'inv-2',
          quantity: 200,
        };

        const state = inventoryReducer(stateWithCurrent, setCurrentInventorySuccess(newInventory));

        expect(state.currentInventory).toEqual(newInventory);
        expect(state.currentInventory).not.toEqual(mockInventory);
      });
    });

    describe('setCurrentInventoryError', () => {
      it('sets error and stops current loading', () => {
        const loadingState: InventoryState = {
          ...initialState,
          currentInventoryLoading: true,
        };

        const state = inventoryReducer(
          loadingState,
          setCurrentInventoryError('Failed to load')
        );

        expect(state.error).toBe('Failed to load');
        expect(state.currentInventoryLoading).toBe(false);
      });

      it('does not affect current inventory', () => {
        const stateWithCurrent: InventoryState = {
          ...initialState,
          currentInventoryLoading: true,
          currentInventory: mockInventory,
        };

        const state = inventoryReducer(stateWithCurrent, setCurrentInventoryError('Error'));

        expect(state.currentInventory).toEqual(mockInventory);
      });
    });

    describe('clearCurrentInventory', () => {
      it('clears current inventory', () => {
        const stateWithCurrent: InventoryState = {
          ...initialState,
          currentInventory: mockInventory,
        };

        const state = inventoryReducer(stateWithCurrent, clearCurrentInventory());

        expect(state.currentInventory).toBe(null);
      });

      it('does not affect other state', () => {
        const stateWithData: InventoryState = {
          ...initialState,
          inventories: mockInventories,
          currentInventory: mockInventory,
          error: 'Some error',
        };

        const state = inventoryReducer(stateWithData, clearCurrentInventory());

        expect(state.inventories).toEqual(mockInventories);
        expect(state.error).toBe('Some error');
      });
    });

    describe('clearInventoryError', () => {
      it('clears error', () => {
        const stateWithError: InventoryState = {
          ...initialState,
          error: 'Error message',
        };

        const state = inventoryReducer(stateWithError, clearInventoryError());

        expect(state.error).toBe(null);
      });

      it('does not affect other state', () => {
        const stateWithData: InventoryState = {
          ...initialState,
          inventories: mockInventories,
          loading: true,
          error: 'Error',
        };

        const state = inventoryReducer(stateWithData, clearInventoryError());

        expect(state.inventories).toEqual(mockInventories);
        expect(state.loading).toBe(true);
      });
    });

    describe('setInventoryFilters', () => {
      it('sets filter values', () => {
        const filters = {
          productId: 'product-1',
          warehouse: 'Main Warehouse',
        };

        const state = inventoryReducer(initialState, setInventoryFilters(filters));

        expect(state.filters).toEqual(filters);
      });

      it('replaces existing filters', () => {
        const stateWithFilters: InventoryState = {
          ...initialState,
          filters: { productId: 'product-1' },
        };

        const newFilters = { warehouse: 'Secondary Warehouse' };

        const state = inventoryReducer(stateWithFilters, setInventoryFilters(newFilters));

        expect(state.filters).toEqual(newFilters);
      });

      it('handles empty filters', () => {
        const state = inventoryReducer(initialState, setInventoryFilters({}));

        expect(state.filters).toEqual({});
      });
    });

    describe('setInventorySort', () => {
      it('sets sort values', () => {
        const sort = [{ field: 'quantity', order: -1 }];

        const state = inventoryReducer(initialState, setInventorySort(sort));

        expect(state.sort).toEqual(sort);
      });

      it('replaces existing sort', () => {
        const stateWithSort: InventoryState = {
          ...initialState,
          sort: [{ field: 'productName', order: 1 }],
        };

        const newSort = [{ field: 'lastUpdated', order: -1 }];

        const state = inventoryReducer(stateWithSort, setInventorySort(newSort));

        expect(state.sort).toEqual(newSort);
      });

      it('handles empty sort array', () => {
        const state = inventoryReducer(initialState, setInventorySort([]));

        expect(state.sort).toEqual([]);
      });

      it('handles multiple sort fields', () => {
        const sort = [
          { field: 'warehouse', order: 1 },
          { field: 'quantity', order: -1 },
        ];

        const state = inventoryReducer(initialState, setInventorySort(sort));

        expect(state.sort).toHaveLength(2);
        expect(state.sort).toEqual(sort);
      });
    });

    describe('resetInventoryState', () => {
      it('resets inventories, loading, error, pagination, filters, and sort', () => {
        const activeState: InventoryState = {
          inventories: mockInventories,
          currentInventory: mockInventory,
          loading: true,
          currentInventoryLoading: true,
          error: 'Error',
          pagination: {
            page: 2,
            limit: 20,
            total: 50,
            totalPages: 3,
          },
          filters: { productId: 'product-1' },
          sort: [{ field: 'quantity', order: -1 }],
        };

        const state = inventoryReducer(activeState, resetInventoryState());

        expect(state.inventories).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        expect(state.pagination).toEqual(initialState.pagination);
        expect(state.filters).toEqual({});
        expect(state.sort).toEqual([]);
      });

      it('does not reset current inventory', () => {
        const activeState: InventoryState = {
          ...initialState,
          inventories: mockInventories,
          currentInventory: mockInventory,
        };

        const state = inventoryReducer(activeState, resetInventoryState());

        expect(state.currentInventory).toEqual(mockInventory);
      });

      it('does not reset current loading', () => {
        const activeState: InventoryState = {
          ...initialState,
          currentInventoryLoading: true,
        };

        const state = inventoryReducer(activeState, resetInventoryState());

        expect(state.currentInventoryLoading).toBe(true);
      });
    });
  });

  describe('saga actions', () => {
    describe('getInventoriesRequest', () => {
      it('creates correct action type', () => {
        const action = getInventoriesRequest({});

        expect(action.type).toBe('inventory/getInventoriesRequest');
      });

      it('includes pagination in payload', () => {
        const payload = {
          page: 2,
          limit: 20,
        };

        const action = getInventoriesRequest(payload);

        expect(action.payload).toEqual(payload);
      });

      it('includes filters in payload', () => {
        const payload = {
          filters: {
            productId: 'product-1',
            warehouse: 'Main Warehouse',
          },
        };

        const action = getInventoriesRequest(payload);

        expect(action.payload.filters).toEqual(payload.filters);
      });

      it('includes sort in payload', () => {
        const payload = {
          sort: [{ field: 'quantity', order: -1 }],
        };

        const action = getInventoriesRequest(payload);

        expect(action.payload.sort).toEqual(payload.sort);
      });

      it('includes callbacks in payload', () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const action = getInventoriesRequest({ onSuccess, onError });

        expect(action.payload.onSuccess).toBe(onSuccess);
        expect(action.payload.onError).toBe(onError);
      });
    });

    describe('getInventoryByIdRequest', () => {
      it('creates correct action type', () => {
        const action = getInventoryByIdRequest({ id: 'inv-1' });

        expect(action.type).toBe('inventory/getInventoryByIdRequest');
      });

      it('includes id in payload', () => {
        const action = getInventoryByIdRequest({ id: 'inv-123' });

        expect(action.payload.id).toBe('inv-123');
      });

      it('includes callbacks in payload', () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const action = getInventoryByIdRequest({ id: 'inv-1', onSuccess, onError });

        expect(action.payload.onSuccess).toBe(onSuccess);
        expect(action.payload.onError).toBe(onError);
      });
    });
  });

  describe('selectors', () => {
    describe('selectInventories', () => {
      it('returns empty array for initial state', () => {
        const state = { inventory: initialState };

        const inventories = selectInventories(state);

        expect(inventories).toEqual([]);
      });

      it('returns inventories when present', () => {
        const state = {
          inventory: {
            ...initialState,
            inventories: mockInventories,
          },
        };

        const inventories = selectInventories(state);

        expect(inventories).toEqual(mockInventories);
        expect(inventories).toHaveLength(2);
      });
    });

    describe('selectCurrentInventory', () => {
      it('returns null for initial state', () => {
        const state = { inventory: initialState };

        const current = selectCurrentInventory(state);

        expect(current).toBe(null);
      });

      it('returns current inventory when present', () => {
        const state = {
          inventory: {
            ...initialState,
            currentInventory: mockInventory,
          },
        };

        const current = selectCurrentInventory(state);

        expect(current).toEqual(mockInventory);
      });
    });

    describe('selectInventoryLoading', () => {
      it('returns false for initial state', () => {
        const state = { inventory: initialState };

        const loading = selectInventoryLoading(state);

        expect(loading).toBe(false);
      });

      it('returns true when loading', () => {
        const state = {
          inventory: {
            ...initialState,
            loading: true,
          },
        };

        const loading = selectInventoryLoading(state);

        expect(loading).toBe(true);
      });
    });

    describe('selectCurrentInventoryLoading', () => {
      it('returns false for initial state', () => {
        const state = { inventory: initialState };

        const loading = selectCurrentInventoryLoading(state);

        expect(loading).toBe(false);
      });

      it('returns true when loading current', () => {
        const state = {
          inventory: {
            ...initialState,
            currentInventoryLoading: true,
          },
        };

        const loading = selectCurrentInventoryLoading(state);

        expect(loading).toBe(true);
      });
    });

    describe('selectInventoryError', () => {
      it('returns null for initial state', () => {
        const state = { inventory: initialState };

        const error = selectInventoryError(state);

        expect(error).toBe(null);
      });

      it('returns error when present', () => {
        const state = {
          inventory: {
            ...initialState,
            error: 'Error message',
          },
        };

        const error = selectInventoryError(state);

        expect(error).toBe('Error message');
      });
    });

    describe('selectInventoryPagination', () => {
      it('returns initial pagination for initial state', () => {
        const state = { inventory: initialState };

        const pagination = selectInventoryPagination(state);

        expect(pagination).toEqual(initialState.pagination);
      });

      it('returns current pagination', () => {
        const customPagination = {
          page: 2,
          limit: 20,
          total: 50,
          totalPages: 3,
        };

        const state = {
          inventory: {
            ...initialState,
            pagination: customPagination,
          },
        };

        const pagination = selectInventoryPagination(state);

        expect(pagination).toEqual(customPagination);
      });
    });

    describe('selectInventoryFilters', () => {
      it('returns empty object for initial state', () => {
        const state = { inventory: initialState };

        const filters = selectInventoryFilters(state);

        expect(filters).toEqual({});
      });

      it('returns current filters', () => {
        const customFilters = {
          productId: 'product-1',
          warehouse: 'Main Warehouse',
        };

        const state = {
          inventory: {
            ...initialState,
            filters: customFilters,
          },
        };

        const filters = selectInventoryFilters(state);

        expect(filters).toEqual(customFilters);
      });
    });

    describe('selectInventorySort', () => {
      it('returns empty array for initial state', () => {
        const state = { inventory: initialState };

        const sort = selectInventorySort(state);

        expect(sort).toEqual([]);
      });

      it('returns current sort', () => {
        const customSort = [
          { field: 'quantity', order: -1 },
          { field: 'productName', order: 1 },
        ];

        const state = {
          inventory: {
            ...initialState,
            sort: customSort,
          },
        };

        const sort = selectInventorySort(state);

        expect(sort).toEqual(customSort);
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete inventory list fetch flow', () => {
      // Start: Initial state
      let state = initialState;
      expect(selectInventories({ inventory: state })).toEqual([]);
      expect(selectInventoryLoading({ inventory: state })).toBe(false);

      // Step 1: Start loading
      state = inventoryReducer(state, setInventoryLoading(true));
      expect(selectInventoryLoading({ inventory: state })).toBe(true);

      // Step 2: Receive data
      const payload = {
        inventories: mockInventories,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };
      state = inventoryReducer(state, setInventoriesSuccess(payload));
      expect(selectInventories({ inventory: state })).toEqual(mockInventories);
      expect(selectInventoryLoading({ inventory: state })).toBe(false);
      expect(selectInventoryPagination({ inventory: state }).total).toBe(2);
    });

    it('handles inventory detail fetch flow', () => {
      // Start loading current
      let state = inventoryReducer(initialState, setCurrentInventoryLoading(true));
      expect(selectCurrentInventoryLoading({ inventory: state })).toBe(true);

      // Receive current inventory
      state = inventoryReducer(state, setCurrentInventorySuccess(mockInventory));
      expect(selectCurrentInventory({ inventory: state })).toEqual(mockInventory);
      expect(selectCurrentInventoryLoading({ inventory: state })).toBe(false);
    });

    it('handles error flow', () => {
      // Start loading
      let state = inventoryReducer(initialState, setInventoryLoading(true));
      expect(selectInventoryLoading({ inventory: state })).toBe(true);

      // Error occurred
      state = inventoryReducer(state, setInventoryError('Network error'));
      expect(selectInventoryError({ inventory: state })).toBe('Network error');
      expect(selectInventoryLoading({ inventory: state })).toBe(false);

      // Clear error
      state = inventoryReducer(state, clearInventoryError());
      expect(selectInventoryError({ inventory: state })).toBe(null);
    });

    it('handles filter and sort flow', () => {
      // Set filters
      let state = inventoryReducer(
        initialState,
        setInventoryFilters({ productId: 'product-1' })
      );
      expect(selectInventoryFilters({ inventory: state }).productId).toBe('product-1');

      // Set sort
      state = inventoryReducer(state, setInventorySort([{ field: 'quantity', order: -1 }]));
      expect(selectInventorySort({ inventory: state })).toHaveLength(1);

      // Reload with filters and sort
      state = inventoryReducer(state, setInventoryLoading(true));
      state = inventoryReducer(state, setInventoriesSuccess({
        inventories: mockInventories.filter((i) => i.productId === 'product-1'),
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      }));

      expect(selectInventories({ inventory: state })).toHaveLength(1);
    });

    it('handles reset flow', () => {
      // Setup: Active state
      let state: InventoryState = {
        inventories: mockInventories,
        currentInventory: mockInventory,
        loading: false,
        currentInventoryLoading: false,
        error: null,
        pagination: {
          page: 2,
          limit: 20,
          total: 50,
          totalPages: 3,
        },
        filters: { productId: 'product-1' },
        sort: [{ field: 'quantity', order: -1 }],
      };

      // Reset
      state = inventoryReducer(state, resetInventoryState());
      expect(selectInventories({ inventory: state })).toEqual([]);
      expect(selectInventoryPagination({ inventory: state })).toEqual(initialState.pagination);
      expect(selectInventoryFilters({ inventory: state })).toEqual({});
      expect(selectInventorySort({ inventory: state })).toEqual([]);
      expect(selectCurrentInventory({ inventory: state })).toEqual(mockInventory);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = inventoryReducer(initialState, { type: 'unknown' } as any);

      expect(state).toEqual(initialState);
    });

    it('clears error when starting new loading', () => {
      let state = inventoryReducer(initialState, setInventoryError('Previous error'));
      expect(state.error).toBe('Previous error');

      state = inventoryReducer(state, setInventoryLoading(true));
      expect(state.error).toBe(null);
    });

    it('handles independent loading states', () => {
      let state = inventoryReducer(initialState, setInventoryLoading(true));
      expect(state.loading).toBe(true);
      expect(state.currentInventoryLoading).toBe(false);

      state = inventoryReducer(state, setCurrentInventoryLoading(true));
      expect(state.loading).toBe(true);
      expect(state.currentInventoryLoading).toBe(true);

      state = inventoryReducer(state, setInventoryLoading(false));
      expect(state.loading).toBe(false);
      expect(state.currentInventoryLoading).toBe(true);
    });

    it('preserves inventories through loading states', () => {
      let state = inventoryReducer(
        initialState,
        setInventoriesSuccess({
          inventories: mockInventories,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
          },
        })
      );

      const originalInventories = state.inventories;

      state = inventoryReducer(state, setInventoryLoading(true));
      expect(state.inventories).toEqual(originalInventories);

      state = inventoryReducer(state, setInventoryLoading(false));
      expect(state.inventories).toEqual(originalInventories);
    });
  });
});
