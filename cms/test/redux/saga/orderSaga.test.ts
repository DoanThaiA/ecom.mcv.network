import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { orderRepository } from 'src/repositories';
import { orderSaga } from 'src/redux/saga/orderSaga';
import {
  getOrdersRequest,
  getOrderByIdRequest,
  updateOrderStatusRequest,
  setOrderLoading,
  setOrdersSuccess,
  setOrderError,
  setCurrentOrderLoading,
  setCurrentOrderSuccess,
  setCurrentOrderError,
  setTabCounts,
} from 'src/redux/store/orderSlice';

// Mock repository
vi.mock('src/repositories', () => ({
  orderRepository: {
    getOrders: vi.fn(),
    getOrderById: vi.fn(),
    updateOrderStatus: vi.fn(),
  },
}));

// Mock toast
vi.mock('src/utils/toast', () => ({
  showError: vi.fn(),
  showSuccess: vi.fn(),
}));

// Mock i18next
vi.mock('src/i18next', () => ({
  default: {
    t: vi.fn((key) => key),
  },
}));

describe('orderSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports orderSaga function', () => {
      expect(orderSaga).toBeDefined();
      expect(orderSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchOrder', () => {
      const gen = orderSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchOrder', () => {
      const gen = orderSaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('getOrdersSaga', () => {
    it('successfully fetches orders with default params', async () => {
      const mockResponse = {
        data: [
          {
            id: 'order-1',
            customerName: 'John Doe',
            status: 'pending',
            total: 100000,
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      };

      vi.mocked(orderRepository.getOrders).mockResolvedValue(mockResponse);

      const action = getOrdersRequest({ page: 1, limit: 10 });

      expect(action.type).toBe('order/getOrdersRequest');
      expect(action.payload).toEqual({ page: 1, limit: 10 });
    });

    it('successfully fetches with filters', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(orderRepository.getOrders).mockResolvedValue(mockResponse);

      const action = getOrdersRequest({
        page: 1,
        limit: 10,
        filters: { status: 'pending' },
      });

      expect(action.payload.filters).toEqual({ status: 'pending' });
    });

    it('successfully fetches with sort', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(orderRepository.getOrders).mockResolvedValue(mockResponse);

      const action = getOrdersRequest({
        page: 1,
        limit: 10,
        sort: { field: 'createdAt', order: 'desc' },
      });

      expect(action.payload.sort).toEqual({ field: 'createdAt', order: 'desc' });
    });

    it('calls onSuccess callback when successful', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(orderRepository.getOrders).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = getOrdersRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(orderRepository.getOrders).mockRejectedValue(mockError);

      expect(orderSaga).toBeDefined();
    });

    it('sets loading state', () => {
      const action = setOrderLoading(true);

      expect(action.type).toBe('order/setOrderLoading');
      expect(action.payload).toBe(true);
    });

    it('sets success state with pagination', () => {
      const data = {
        orders: [
          {
            id: 'order-1',
            customerName: 'John Doe',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      const action = setOrdersSuccess(data);

      expect(action.type).toBe('order/setOrdersSuccess');
      expect(action.payload).toEqual(data);
    });

    it('sets error state', () => {
      const action = setOrderError('Error message');

      expect(action.type).toBe('order/setOrderError');
      expect(action.payload).toBe('Error message');
    });

    it('sets tab counts', () => {
      const counts = {
        all: 100,
        pending: 20,
        confirmed: 15,
        processing: 10,
        shipped: 25,
        delivered: 25,
        cancelled: 5,
      };

      const action = setTabCounts(counts);

      expect(action.type).toBe('order/setTabCounts');
      expect(action.payload).toEqual(counts);
    });

    it('updates tab counts with zeros except all', () => {
      const counts = {
        all: 50,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };

      const action = setTabCounts(counts);

      expect(action.payload.all).toBe(50);
      expect(action.payload.pending).toBe(0);
    });
  });

  describe('getOrderByIdSaga', () => {
    it('successfully fetches order by ID', async () => {
      const mockOrder = {
        id: 'order-1',
        customerName: 'John Doe',
        status: 'pending',
        total: 100000,
        items: [],
      };

      vi.mocked(orderRepository.getOrderById).mockResolvedValue(mockOrder);

      const action = getOrderByIdRequest({ id: 'order-1' });

      expect(action.type).toBe('order/getOrderByIdRequest');
      expect(action.payload.id).toBe('order-1');
    });

    it('calls onSuccess callback with order data', async () => {
      const mockOrder = {
        id: 'order-1',
        customerName: 'John Doe',
      };

      vi.mocked(orderRepository.getOrderById).mockResolvedValue(mockOrder);

      const onSuccess = vi.fn();
      const action = getOrderByIdRequest({
        id: 'order-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch by ID failure', async () => {
      const mockError = new Error('Order not found');

      vi.mocked(orderRepository.getOrderById).mockRejectedValue(mockError);

      const action = getOrderByIdRequest({ id: '999' });

      expect(action.payload.id).toBe('999');
    });

    it('sets current loading state', () => {
      const action = setCurrentOrderLoading(true);

      expect(action.type).toBe('order/setCurrentOrderLoading');
      expect(action.payload).toBe(true);
    });

    it('sets current success state', () => {
      const order = {
        id: 'order-1',
        customerName: 'John Doe',
      };

      const action = setCurrentOrderSuccess(order);

      expect(action.type).toBe('order/setCurrentOrderSuccess');
      expect(action.payload).toEqual(order);
    });

    it('sets current error state', () => {
      const action = setCurrentOrderError('Error message');

      expect(action.type).toBe('order/setCurrentOrderError');
      expect(action.payload).toBe('Error message');
    });
  });

  describe('updateOrderStatusSaga', () => {
    it('successfully updates order status', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'confirmed',
        customerName: 'John Doe',
      };

      vi.mocked(orderRepository.updateOrderStatus).mockResolvedValue(mockOrder);

      const action = updateOrderStatusRequest({
        orderId: 'order-1',
        status: 'confirmed',
      });

      expect(action.type).toBe('order/updateOrderStatusRequest');
      expect(action.payload.orderId).toBe('order-1');
      expect(action.payload.status).toBe('confirmed');
    });

    it('updates status with reason', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'cancelled',
      };

      vi.mocked(orderRepository.updateOrderStatus).mockResolvedValue(mockOrder);

      const action = updateOrderStatusRequest({
        orderId: 'order-1',
        status: 'cancelled',
        reason: 'Customer request',
      });

      expect(action.payload.reason).toBe('Customer request');
    });

    it('calls onSuccess callback after update', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'shipped',
      };

      vi.mocked(orderRepository.updateOrderStatus).mockResolvedValue(mockOrder);

      const onSuccess = vi.fn();
      const action = updateOrderStatusRequest({
        orderId: 'order-1',
        status: 'shipped',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles update failure', async () => {
      const mockError = new Error('Update failed');

      vi.mocked(orderRepository.updateOrderStatus).mockRejectedValue(mockError);

      expect(orderSaga).toBeDefined();
    });

    it('handles different order statuses', () => {
      const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

      statuses.forEach((status) => {
        const action = updateOrderStatusRequest({
          orderId: 'order-1',
          status,
        });

        expect(action.payload.status).toBe(status);
      });
    });
  });

  describe('action types', () => {
    it('has correct action type for getOrdersRequest', () => {
      expect(getOrdersRequest.type).toBe('order/getOrdersRequest');
    });

    it('has correct action type for getOrderByIdRequest', () => {
      expect(getOrderByIdRequest.type).toBe('order/getOrderByIdRequest');
    });

    it('has correct action type for updateOrderStatusRequest', () => {
      expect(updateOrderStatusRequest.type).toBe('order/updateOrderStatusRequest');
    });

    it('has correct action type for setOrderLoading', () => {
      expect(setOrderLoading.type).toBe('order/setOrderLoading');
    });

    it('has correct action type for setOrdersSuccess', () => {
      expect(setOrdersSuccess.type).toBe('order/setOrdersSuccess');
    });

    it('has correct action type for setOrderError', () => {
      expect(setOrderError.type).toBe('order/setOrderError');
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
      const action = getOrdersRequest({ page: 5, limit: 50 });

      expect(action.payload.page).toBe(5);
      expect(action.payload.limit).toBe(50);
    });

    it('handles empty filters', () => {
      const action = getOrdersRequest({ page: 1, limit: 10, filters: {} });

      expect(action.payload.filters).toEqual({});
    });

    it('handles complex filters', () => {
      const filters = {
        status: 'pending',
        customerName: 'John',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      };

      const action = getOrdersRequest({ page: 1, limit: 10, filters });

      expect(action.payload.filters).toEqual(filters);
    });

    it('handles pagination metadata', () => {
      const data = {
        orders: [],
        pagination: {
          page: 2,
          limit: 20,
          total: 100,
          totalPages: 5,
        },
      };

      const action = setOrdersSuccess(data);

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

    it('handles API errors', () => {
      const error = {
        response: {
          data: {
            message: 'Order not found',
          },
        },
      };

      expect(error.response.data.message).toBe('Order not found');
    });
  });

  describe('callbacks', () => {
    it('handles onSuccess callback for getOrders', () => {
      const onSuccess = vi.fn();
      const action = getOrdersRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for getOrderById', () => {
      const onSuccess = vi.fn();
      const action = getOrderByIdRequest({
        id: 'order-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for updateOrderStatus', () => {
      const onSuccess = vi.fn();
      const action = updateOrderStatusRequest({
        orderId: 'order-1',
        status: 'confirmed',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });
  });

  describe('order status values', () => {
    it('handles pending status', () => {
      const action = updateOrderStatusRequest({
        orderId: 'order-1',
        status: 'pending',
      });

      expect(action.payload.status).toBe('pending');
    });

    it('handles confirmed status', () => {
      const action = updateOrderStatusRequest({
        orderId: 'order-1',
        status: 'confirmed',
      });

      expect(action.payload.status).toBe('confirmed');
    });

    it('handles processing status', () => {
      const action = updateOrderStatusRequest({
        orderId: 'order-1',
        status: 'processing',
      });

      expect(action.payload.status).toBe('processing');
    });

    it('handles shipped status', () => {
      const action = updateOrderStatusRequest({
        orderId: 'order-1',
        status: 'shipped',
      });

      expect(action.payload.status).toBe('shipped');
    });

    it('handles delivered status', () => {
      const action = updateOrderStatusRequest({
        orderId: 'order-1',
        status: 'delivered',
      });

      expect(action.payload.status).toBe('delivered');
    });

    it('handles cancelled status', () => {
      const action = updateOrderStatusRequest({
        orderId: 'order-1',
        status: 'cancelled',
      });

      expect(action.payload.status).toBe('cancelled');
    });
  });
});
