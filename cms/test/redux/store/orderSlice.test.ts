import { describe, it, expect, vi } from 'vitest';

import orderReducer, {
  setOrderLoading,
  setOrdersSuccess,
  setOrderError,
  setCurrentOrderLoading,
  setCurrentOrderSuccess,
  setCurrentOrderError,
  clearCurrentOrder,
  clearOrderError,
  setOrderFilters,
  setOrderSort,
  setActiveTab,
  setTabCounts,
  resetOrderState,
  getOrdersRequest,
  getOrderByIdRequest,
  updateOrderStatusRequest,
  selectOrders,
  selectCurrentOrder,
  selectOrderLoading,
  selectCurrentOrderLoading,
  selectOrderError,
  selectOrderPagination,
  selectOrderFilters,
  selectOrderSort,
  selectActiveTab,
  selectTabCounts,
  type OrderState,
} from 'src/redux/store/orderSlice';
import type { Order, OrderTabCounts } from 'src/types/orders';

describe('orderSlice', () => {
  const initialTabCounts: OrderTabCounts = {
    all: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  const initialState: OrderState = {
    orders: [],
    currentOrder: null,
    loading: false,
    currentOrderLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: {},
    sort: undefined,
    activeTab: 'all',
    tabCounts: initialTabCounts,
  };

  const mockOrder: Order = {
    id: 'order-1',
    orderNumber: 'ORD-001',
    customerId: 'customer-1',
    customerName: 'John Doe',
    status: 'pending',
    total: 100.5,
    items: [],
    shippingAddress: '123 Main St',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockOrders: Order[] = [
    mockOrder,
    {
      id: 'order-2',
      orderNumber: 'ORD-002',
      customerId: 'customer-2',
      customerName: 'Jane Smith',
      status: 'confirmed',
      total: 200.75,
      items: [],
      shippingAddress: '456 Oak Ave',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  describe('reducers', () => {
    describe('setOrderLoading', () => {
      it('sets loading to true and clears error', () => {
        const stateWithError: OrderState = {
          ...initialState,
          error: 'Previous error',
        };

        const state = orderReducer(stateWithError, setOrderLoading(true));

        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
      });

      it('sets loading to false without clearing error', () => {
        const loadingState: OrderState = {
          ...initialState,
          loading: true,
          error: 'Some error',
        };

        const state = orderReducer(loadingState, setOrderLoading(false));

        expect(state.loading).toBe(false);
        expect(state.error).toBe('Some error');
      });
    });

    describe('setOrdersSuccess', () => {
      it('sets orders, pagination and clears loading and error', () => {
        const loadingState: OrderState = {
          ...initialState,
          loading: true,
          error: 'Error',
        };

        const payload = {
          orders: mockOrders,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
          },
        };

        const state = orderReducer(loadingState, setOrdersSuccess(payload));

        expect(state.orders).toEqual(mockOrders);
        expect(state.pagination).toEqual(payload.pagination);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
      });
    });

    describe('setOrderError', () => {
      it('sets error and stops loading', () => {
        const loadingState: OrderState = {
          ...initialState,
          loading: true,
        };

        const state = orderReducer(loadingState, setOrderError('Failed to load'));

        expect(state.error).toBe('Failed to load');
        expect(state.loading).toBe(false);
      });
    });

    describe('setCurrentOrderLoading', () => {
      it('sets current loading to true and clears error', () => {
        const stateWithError: OrderState = {
          ...initialState,
          error: 'Previous error',
        };

        const state = orderReducer(stateWithError, setCurrentOrderLoading(true));

        expect(state.currentOrderLoading).toBe(true);
        expect(state.error).toBe(null);
      });

      it('sets current loading to false without clearing error', () => {
        const loadingState: OrderState = {
          ...initialState,
          currentOrderLoading: true,
          error: 'Some error',
        };

        const state = orderReducer(loadingState, setCurrentOrderLoading(false));

        expect(state.currentOrderLoading).toBe(false);
        expect(state.error).toBe('Some error');
      });
    });

    describe('setCurrentOrderSuccess', () => {
      it('sets current order and clears loading and error', () => {
        const loadingState: OrderState = {
          ...initialState,
          currentOrderLoading: true,
          error: 'Error',
        };

        const state = orderReducer(loadingState, setCurrentOrderSuccess(mockOrder));

        expect(state.currentOrder).toEqual(mockOrder);
        expect(state.currentOrderLoading).toBe(false);
        expect(state.error).toBe(null);
      });
    });

    describe('setCurrentOrderError', () => {
      it('sets error and stops current loading', () => {
        const loadingState: OrderState = {
          ...initialState,
          currentOrderLoading: true,
        };

        const state = orderReducer(loadingState, setCurrentOrderError('Failed to load'));

        expect(state.error).toBe('Failed to load');
        expect(state.currentOrderLoading).toBe(false);
      });
    });

    describe('clearCurrentOrder', () => {
      it('clears current order', () => {
        const stateWithCurrent: OrderState = {
          ...initialState,
          currentOrder: mockOrder,
        };

        const state = orderReducer(stateWithCurrent, clearCurrentOrder());

        expect(state.currentOrder).toBe(null);
      });
    });

    describe('clearOrderError', () => {
      it('clears error', () => {
        const stateWithError: OrderState = {
          ...initialState,
          error: 'Error message',
        };

        const state = orderReducer(stateWithError, clearOrderError());

        expect(state.error).toBe(null);
      });
    });

    describe('setOrderFilters', () => {
      it('sets filter values', () => {
        const filters = {
          status: 'pending' as const,
          customerId: 'customer-1',
        };

        const state = orderReducer(initialState, setOrderFilters(filters));

        expect(state.filters).toEqual(filters);
      });

      it('replaces existing filters', () => {
        const stateWithFilters: OrderState = {
          ...initialState,
          filters: { status: 'pending' },
        };

        const newFilters = { customerId: 'customer-2' };

        const state = orderReducer(stateWithFilters, setOrderFilters(newFilters));

        expect(state.filters).toEqual(newFilters);
      });
    });

    describe('setOrderSort', () => {
      it('sets sort values', () => {
        const sort = { field: 'createdAt' as const, order: -1 as const };

        const state = orderReducer(initialState, setOrderSort(sort));

        expect(state.sort).toEqual(sort);
      });

      it('sets sort to undefined', () => {
        const stateWithSort: OrderState = {
          ...initialState,
          sort: { field: 'total', order: 1 },
        };

        const state = orderReducer(stateWithSort, setOrderSort(undefined));

        expect(state.sort).toBeUndefined();
      });
    });

    describe('setActiveTab', () => {
      it('sets active tab', () => {
        const state = orderReducer(initialState, setActiveTab('pending'));

        expect(state.activeTab).toBe('pending');
      });

      it('resets page to 1 when tab changes', () => {
        const stateWithPage: OrderState = {
          ...initialState,
          pagination: {
            page: 5,
            limit: 10,
            total: 100,
            totalPages: 10,
          },
        };

        const state = orderReducer(stateWithPage, setActiveTab('confirmed'));

        expect(state.activeTab).toBe('confirmed');
        expect(state.pagination.page).toBe(1);
      });

      it('does not affect other pagination properties', () => {
        const stateWithPage: OrderState = {
          ...initialState,
          pagination: {
            page: 5,
            limit: 20,
            total: 100,
            totalPages: 5,
          },
        };

        const state = orderReducer(stateWithPage, setActiveTab('shipped'));

        expect(state.pagination.limit).toBe(20);
        expect(state.pagination.total).toBe(100);
        expect(state.pagination.totalPages).toBe(5);
      });
    });

    describe('setTabCounts', () => {
      it('sets tab counts', () => {
        const counts: OrderTabCounts = {
          all: 100,
          pending: 20,
          confirmed: 15,
          processing: 25,
          shipped: 20,
          delivered: 10,
          cancelled: 10,
        };

        const state = orderReducer(initialState, setTabCounts(counts));

        expect(state.tabCounts).toEqual(counts);
      });

      it('replaces existing tab counts', () => {
        const stateWithCounts: OrderState = {
          ...initialState,
          tabCounts: {
            all: 50,
            pending: 10,
            confirmed: 5,
            processing: 10,
            shipped: 10,
            delivered: 10,
            cancelled: 5,
          },
        };

        const newCounts: OrderTabCounts = {
          all: 0,
          pending: 0,
          confirmed: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        };

        const state = orderReducer(stateWithCounts, setTabCounts(newCounts));

        expect(state.tabCounts).toEqual(newCounts);
      });
    });

    describe('resetOrderState', () => {
      it('resets orders, loading, error, pagination, filters, sort, and activeTab', () => {
        const activeState: OrderState = {
          orders: mockOrders,
          currentOrder: mockOrder,
          loading: true,
          currentOrderLoading: true,
          error: 'Error',
          pagination: {
            page: 2,
            limit: 20,
            total: 50,
            totalPages: 3,
          },
          filters: { status: 'pending' },
          sort: { field: 'total', order: -1 },
          activeTab: 'confirmed',
          tabCounts: {
            all: 100,
            pending: 20,
            confirmed: 15,
            processing: 25,
            shipped: 20,
            delivered: 10,
            cancelled: 10,
          },
        };

        const state = orderReducer(activeState, resetOrderState());

        expect(state.orders).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        expect(state.pagination).toEqual(initialState.pagination);
        expect(state.filters).toEqual({});
        expect(state.sort).toBeUndefined();
        expect(state.activeTab).toBe('all');
      });

      it('does not reset current order and tab counts', () => {
        const activeState: OrderState = {
          ...initialState,
          currentOrder: mockOrder,
          tabCounts: {
            all: 100,
            pending: 20,
            confirmed: 15,
            processing: 25,
            shipped: 20,
            delivered: 10,
            cancelled: 10,
          },
        };

        const state = orderReducer(activeState, resetOrderState());

        expect(state.currentOrder).toEqual(mockOrder);
        expect(state.tabCounts.all).toBe(100);
      });
    });
  });

  describe('saga actions', () => {
    describe('getOrdersRequest', () => {
      it('creates correct action type', () => {
        const action = getOrdersRequest({});

        expect(action.type).toBe('order/getOrdersRequest');
      });

      it('includes pagination in payload', () => {
        const payload = {
          page: 2,
          limit: 20,
        };

        const action = getOrdersRequest(payload);

        expect(action.payload).toEqual(payload);
      });

      it('includes filters in payload', () => {
        const payload = {
          filters: {
            status: 'pending' as const,
            customerId: 'customer-1',
          },
        };

        const action = getOrdersRequest(payload);

        expect(action.payload.filters).toEqual(payload.filters);
      });

      it('includes sort in payload', () => {
        const payload = {
          sort: { field: 'createdAt' as const, order: -1 as const },
        };

        const action = getOrdersRequest(payload);

        expect(action.payload.sort).toEqual(payload.sort);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = vi.fn();
        const action = getOrdersRequest({ onSuccess });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('getOrderByIdRequest', () => {
      it('creates correct action type', () => {
        const action = getOrderByIdRequest({ id: 'order-1' });

        expect(action.type).toBe('order/getOrderByIdRequest');
      });

      it('includes id in payload', () => {
        const action = getOrderByIdRequest({ id: 'order-123' });

        expect(action.payload.id).toBe('order-123');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = vi.fn();
        const action = getOrderByIdRequest({ id: 'order-1', onSuccess });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('updateOrderStatusRequest', () => {
      it('creates correct action type', () => {
        const action = updateOrderStatusRequest({
          orderId: 'order-1',
          status: 'confirmed',
        });

        expect(action.type).toBe('order/updateOrderStatusRequest');
      });

      it('includes orderId and status in payload', () => {
        const action = updateOrderStatusRequest({
          orderId: 'order-1',
          status: 'shipped',
        });

        expect(action.payload.orderId).toBe('order-1');
        expect(action.payload.status).toBe('shipped');
      });

      it('includes reason in payload', () => {
        const action = updateOrderStatusRequest({
          orderId: 'order-1',
          status: 'cancelled',
          reason: 'Customer request',
        });

        expect(action.payload.reason).toBe('Customer request');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = vi.fn();
        const action = updateOrderStatusRequest({
          orderId: 'order-1',
          status: 'confirmed',
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });
  });

  describe('selectors', () => {
    describe('selectOrders', () => {
      it('returns empty array for initial state', () => {
        const state = { order: initialState };

        const orders = selectOrders(state);

        expect(orders).toEqual([]);
      });

      it('returns orders when present', () => {
        const state = {
          order: {
            ...initialState,
            orders: mockOrders,
          },
        };

        const orders = selectOrders(state);

        expect(orders).toEqual(mockOrders);
      });
    });

    describe('selectCurrentOrder', () => {
      it('returns null for initial state', () => {
        const state = { order: initialState };

        const current = selectCurrentOrder(state);

        expect(current).toBe(null);
      });

      it('returns current order when present', () => {
        const state = {
          order: {
            ...initialState,
            currentOrder: mockOrder,
          },
        };

        const current = selectCurrentOrder(state);

        expect(current).toEqual(mockOrder);
      });
    });

    describe('selectOrderLoading', () => {
      it('returns false for initial state', () => {
        const state = { order: initialState };

        const loading = selectOrderLoading(state);

        expect(loading).toBe(false);
      });

      it('returns true when loading', () => {
        const state = {
          order: {
            ...initialState,
            loading: true,
          },
        };

        const loading = selectOrderLoading(state);

        expect(loading).toBe(true);
      });
    });

    describe('selectCurrentOrderLoading', () => {
      it('returns false for initial state', () => {
        const state = { order: initialState };

        const loading = selectCurrentOrderLoading(state);

        expect(loading).toBe(false);
      });

      it('returns true when loading current', () => {
        const state = {
          order: {
            ...initialState,
            currentOrderLoading: true,
          },
        };

        const loading = selectCurrentOrderLoading(state);

        expect(loading).toBe(true);
      });
    });

    describe('selectOrderError', () => {
      it('returns null for initial state', () => {
        const state = { order: initialState };

        const error = selectOrderError(state);

        expect(error).toBe(null);
      });

      it('returns error when present', () => {
        const state = {
          order: {
            ...initialState,
            error: 'Error message',
          },
        };

        const error = selectOrderError(state);

        expect(error).toBe('Error message');
      });
    });

    describe('selectOrderPagination', () => {
      it('returns initial pagination for initial state', () => {
        const state = { order: initialState };

        const pagination = selectOrderPagination(state);

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
          order: {
            ...initialState,
            pagination: customPagination,
          },
        };

        const pagination = selectOrderPagination(state);

        expect(pagination).toEqual(customPagination);
      });
    });

    describe('selectOrderFilters', () => {
      it('returns empty object for initial state', () => {
        const state = { order: initialState };

        const filters = selectOrderFilters(state);

        expect(filters).toEqual({});
      });

      it('returns current filters', () => {
        const customFilters = {
          status: 'pending' as const,
          customerId: 'customer-1',
        };

        const state = {
          order: {
            ...initialState,
            filters: customFilters,
          },
        };

        const filters = selectOrderFilters(state);

        expect(filters).toEqual(customFilters);
      });
    });

    describe('selectOrderSort', () => {
      it('returns undefined for initial state', () => {
        const state = { order: initialState };

        const sort = selectOrderSort(state);

        expect(sort).toBeUndefined();
      });

      it('returns current sort', () => {
        const customSort = { field: 'total' as const, order: -1 as const };

        const state = {
          order: {
            ...initialState,
            sort: customSort,
          },
        };

        const sort = selectOrderSort(state);

        expect(sort).toEqual(customSort);
      });
    });

    describe('selectActiveTab', () => {
      it('returns "all" for initial state', () => {
        const state = { order: initialState };

        const activeTab = selectActiveTab(state);

        expect(activeTab).toBe('all');
      });

      it('returns current active tab', () => {
        const state = {
          order: {
            ...initialState,
            activeTab: 'pending' as const,
          },
        };

        const activeTab = selectActiveTab(state);

        expect(activeTab).toBe('pending');
      });
    });

    describe('selectTabCounts', () => {
      it('returns initial tab counts for initial state', () => {
        const state = { order: initialState };

        const tabCounts = selectTabCounts(state);

        expect(tabCounts).toEqual(initialTabCounts);
      });

      it('returns current tab counts', () => {
        const customCounts: OrderTabCounts = {
          all: 100,
          pending: 20,
          confirmed: 15,
          processing: 25,
          shipped: 20,
          delivered: 10,
          cancelled: 10,
        };

        const state = {
          order: {
            ...initialState,
            tabCounts: customCounts,
          },
        };

        const tabCounts = selectTabCounts(state);

        expect(tabCounts).toEqual(customCounts);
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete order list fetch flow', () => {
      // Start: Initial state
      let state = initialState;
      expect(selectOrders({ order: state })).toEqual([]);
      expect(selectOrderLoading({ order: state })).toBe(false);

      // Step 1: Start loading
      state = orderReducer(state, setOrderLoading(true));
      expect(selectOrderLoading({ order: state })).toBe(true);

      // Step 2: Receive data
      const payload = {
        orders: mockOrders,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };
      state = orderReducer(state, setOrdersSuccess(payload));
      expect(selectOrders({ order: state })).toEqual(mockOrders);
      expect(selectOrderLoading({ order: state })).toBe(false);
      expect(selectOrderPagination({ order: state }).total).toBe(2);
    });

    it('handles tab switching flow', () => {
      // Start with 'all' tab
      let state = initialState;
      state = orderReducer(
        state,
        setTabCounts({
          all: 100,
          pending: 20,
          confirmed: 15,
          processing: 25,
          shipped: 20,
          delivered: 10,
          cancelled: 10,
        })
      );

      expect(selectActiveTab({ order: state })).toBe('all');
      expect(selectTabCounts({ order: state }).pending).toBe(20);

      // Switch to 'pending' tab
      state = orderReducer(state, setActiveTab('pending'));
      expect(selectActiveTab({ order: state })).toBe('pending');
      expect(selectOrderPagination({ order: state }).page).toBe(1);

      // Load pending orders
      state = orderReducer(state, setOrderLoading(true));
      state = orderReducer(
        state,
        setOrdersSuccess({
          orders: [mockOrder],
          pagination: {
            page: 1,
            limit: 10,
            total: 20,
            totalPages: 2,
          },
        })
      );

      expect(selectOrders({ order: state })).toHaveLength(1);
    });

    it('handles error flow', () => {
      // Start loading
      let state = orderReducer(initialState, setOrderLoading(true));
      expect(selectOrderLoading({ order: state })).toBe(true);

      // Error occurred
      state = orderReducer(state, setOrderError('Network error'));
      expect(selectOrderError({ order: state })).toBe('Network error');
      expect(selectOrderLoading({ order: state })).toBe(false);

      // Clear error
      state = orderReducer(state, clearOrderError());
      expect(selectOrderError({ order: state })).toBe(null);
    });

    it('handles filter and sort flow', () => {
      // Set filters
      let state = orderReducer(initialState, setOrderFilters({ status: 'pending' }));
      expect(selectOrderFilters({ order: state }).status).toBe('pending');

      // Set sort
      state = orderReducer(state, setOrderSort({ field: 'total', order: -1 }));
      expect(selectOrderSort({ order: state })?.field).toBe('total');

      // Reload with filters and sort
      state = orderReducer(state, setOrderLoading(true));
      state = orderReducer(
        state,
        setOrdersSuccess({
          orders: [mockOrder],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        })
      );

      expect(selectOrders({ order: state })).toHaveLength(1);
    });

    it('handles reset flow', () => {
      // Setup: Active state
      let state: OrderState = {
        orders: mockOrders,
        currentOrder: mockOrder,
        loading: false,
        currentOrderLoading: false,
        error: null,
        pagination: {
          page: 2,
          limit: 20,
          total: 50,
          totalPages: 3,
        },
        filters: { status: 'pending' },
        sort: { field: 'total', order: -1 },
        activeTab: 'confirmed',
        tabCounts: {
          all: 100,
          pending: 20,
          confirmed: 15,
          processing: 25,
          shipped: 20,
          delivered: 10,
          cancelled: 10,
        },
      };

      // Reset
      state = orderReducer(state, resetOrderState());
      expect(selectOrders({ order: state })).toEqual([]);
      expect(selectOrderPagination({ order: state })).toEqual(initialState.pagination);
      expect(selectOrderFilters({ order: state })).toEqual({});
      expect(selectOrderSort({ order: state })).toBeUndefined();
      expect(selectActiveTab({ order: state })).toBe('all');
      expect(selectCurrentOrder({ order: state })).toEqual(mockOrder);
      expect(selectTabCounts({ order: state }).all).toBe(100);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = orderReducer(initialState, { type: 'unknown' } as any);

      expect(state).toEqual(initialState);
    });

    it('clears error when starting new loading', () => {
      let state = orderReducer(initialState, setOrderError('Previous error'));
      expect(state.error).toBe('Previous error');

      state = orderReducer(state, setOrderLoading(true));
      expect(state.error).toBe(null);
    });

    it('handles independent loading states', () => {
      let state = orderReducer(initialState, setOrderLoading(true));
      expect(state.loading).toBe(true);
      expect(state.currentOrderLoading).toBe(false);

      state = orderReducer(state, setCurrentOrderLoading(true));
      expect(state.loading).toBe(true);
      expect(state.currentOrderLoading).toBe(true);

      state = orderReducer(state, setOrderLoading(false));
      expect(state.loading).toBe(false);
      expect(state.currentOrderLoading).toBe(true);
    });

    it('handles tab switching with different page numbers', () => {
      let state: OrderState = {
        ...initialState,
        pagination: {
          page: 5,
          limit: 10,
          total: 100,
          totalPages: 10,
        },
      };

      // Switch tab - should reset to page 1
      state = orderReducer(state, setActiveTab('pending'));
      expect(state.pagination.page).toBe(1);

      // Navigate to page 3
      state = {
        ...state,
        pagination: {
          ...state.pagination,
          page: 3,
        },
      };

      // Switch tab again - should reset to page 1
      state = orderReducer(state, setActiveTab('confirmed'));
      expect(state.pagination.page).toBe(1);
    });
  });
});
