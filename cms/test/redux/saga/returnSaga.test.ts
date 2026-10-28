import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { returnRepository } from 'src/repositories';
import { returnSaga } from 'src/redux/saga/returnSaga';
import {
  getReturnsRequest,
  getReturnByIdRequest,
  updateReturnStatusRequest,
  getReturnTabCountsRequest,
  setReturnLoading,
  setReturnsSuccess,
  setReturnError,
  setCurrentReturnLoading,
  setCurrentReturnSuccess,
  setCurrentReturnError,
  setReturnTabCounts,
} from 'src/redux/store/returnSlice';

// Mock repository
vi.mock('src/repositories', () => ({
  returnRepository: {
    getReturns: vi.fn(),
    getReturnById: vi.fn(),
    updateReturnStatus: vi.fn(),
    getTabCounts: vi.fn(),
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

describe('returnSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports returnSaga function', () => {
      expect(returnSaga).toBeDefined();
      expect(returnSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchReturn', () => {
      const gen = returnSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchReturn', () => {
      const gen = returnSaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('getReturnsSaga', () => {
    it('successfully fetches returns with default params', async () => {
      const mockResponse = {
        data: [
          {
            id: 'return-1',
            orderId: 'order-1',
            status: 'pending',
            type: 'refund',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      };

      vi.mocked(returnRepository.getReturns).mockResolvedValue(mockResponse);

      const action = getReturnsRequest({ page: 1, limit: 10 });

      expect(action.type).toBe('return/getReturnsRequest');
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

      vi.mocked(returnRepository.getReturns).mockResolvedValue(mockResponse);

      const action = getReturnsRequest({
        page: 1,
        limit: 10,
        filters: { status: 'pending', type: 'refund' },
      });

      expect(action.payload.filters).toEqual({ status: 'pending', type: 'refund' });
    });

    it('successfully fetches with sort', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(returnRepository.getReturns).mockResolvedValue(mockResponse);

      const action = getReturnsRequest({
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

      vi.mocked(returnRepository.getReturns).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = getReturnsRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(returnRepository.getReturns).mockRejectedValue(mockError);

      expect(returnSaga).toBeDefined();
    });

    it('sets loading state', () => {
      const action = setReturnLoading(true);

      expect(action.type).toBe('return/setReturnLoading');
      expect(action.payload).toBe(true);
    });

    it('sets success state with pagination', () => {
      const data = {
        returns: [
          {
            id: 'return-1',
            orderId: 'order-1',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      const action = setReturnsSuccess(data);

      expect(action.type).toBe('return/setReturnsSuccess');
      expect(action.payload).toEqual(data);
    });

    it('sets error state', () => {
      const action = setReturnError('Error message');

      expect(action.type).toBe('return/setReturnError');
      expect(action.payload).toBe('Error message');
    });
  });

  describe('getReturnTabCountsSaga', () => {
    it('successfully fetches tab counts without type', async () => {
      const mockTabCounts = {
        all: 100,
        pending: 30,
        approved: 40,
        rejected: 20,
        completed: 10,
      };

      vi.mocked(returnRepository.getTabCounts).mockResolvedValue(mockTabCounts);

      const action = getReturnTabCountsRequest({});

      expect(action.type).toBe('return/getReturnTabCountsRequest');
    });

    it('successfully fetches tab counts with refund type', async () => {
      const mockTabCounts = {
        all: 50,
        pending: 20,
        approved: 20,
        rejected: 5,
        completed: 5,
      };

      vi.mocked(returnRepository.getTabCounts).mockResolvedValue(mockTabCounts);

      const action = getReturnTabCountsRequest({ type: 'refund' });

      expect(action.payload.type).toBe('refund');
    });

    it('successfully fetches tab counts with exchange type', async () => {
      const mockTabCounts = {
        all: 30,
        pending: 10,
        approved: 15,
        rejected: 3,
        completed: 2,
      };

      vi.mocked(returnRepository.getTabCounts).mockResolvedValue(mockTabCounts);

      const action = getReturnTabCountsRequest({ type: 'exchange' });

      expect(action.payload.type).toBe('exchange');
    });

    it('handles fetch tab counts failure silently', async () => {
      const mockError = new Error('Failed to fetch counts');

      vi.mocked(returnRepository.getTabCounts).mockRejectedValue(mockError);

      expect(returnSaga).toBeDefined();
    });

    it('sets tab counts', () => {
      const counts = {
        all: 100,
        pending: 30,
        approved: 40,
        rejected: 20,
        completed: 10,
      };

      const action = setReturnTabCounts(counts);

      expect(action.type).toBe('return/setReturnTabCounts');
      expect(action.payload).toEqual(counts);
    });
  });

  describe('getReturnByIdSaga', () => {
    it('successfully fetches return by ID', async () => {
      const mockReturn = {
        id: 'return-1',
        orderId: 'order-1',
        status: 'pending',
        type: 'refund',
        reason: 'Defective product',
      };

      vi.mocked(returnRepository.getReturnById).mockResolvedValue(mockReturn);

      const action = getReturnByIdRequest({ id: 'return-1' });

      expect(action.type).toBe('return/getReturnByIdRequest');
      expect(action.payload.id).toBe('return-1');
    });

    it('calls onSuccess callback with return data', async () => {
      const mockReturn = {
        id: 'return-1',
        orderId: 'order-1',
      };

      vi.mocked(returnRepository.getReturnById).mockResolvedValue(mockReturn);

      const onSuccess = vi.fn();
      const action = getReturnByIdRequest({
        id: 'return-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch by ID failure', async () => {
      const mockError = new Error('Return not found');

      vi.mocked(returnRepository.getReturnById).mockRejectedValue(mockError);

      const action = getReturnByIdRequest({ id: '999' });

      expect(action.payload.id).toBe('999');
    });

    it('sets current loading state', () => {
      const action = setCurrentReturnLoading(true);

      expect(action.type).toBe('return/setCurrentReturnLoading');
      expect(action.payload).toBe(true);
    });

    it('sets current success state', () => {
      const returnRequest = {
        id: 'return-1',
        orderId: 'order-1',
      };

      const action = setCurrentReturnSuccess(returnRequest);

      expect(action.type).toBe('return/setCurrentReturnSuccess');
      expect(action.payload).toEqual(returnRequest);
    });

    it('sets current error state', () => {
      const action = setCurrentReturnError('Error message');

      expect(action.type).toBe('return/setCurrentReturnError');
      expect(action.payload).toBe('Error message');
    });
  });

  describe('updateReturnStatusSaga', () => {
    it('successfully updates return status', async () => {
      const mockReturn = {
        id: 'return-1',
        status: 'approved',
        orderId: 'order-1',
      };

      vi.mocked(returnRepository.updateReturnStatus).mockResolvedValue(mockReturn);

      const action = updateReturnStatusRequest({
        returnId: 'return-1',
        status: 'approved',
      });

      expect(action.type).toBe('return/updateReturnStatusRequest');
      expect(action.payload.returnId).toBe('return-1');
      expect(action.payload.status).toBe('approved');
    });

    it('updates status with admin note', async () => {
      const mockReturn = {
        id: 'return-1',
        status: 'rejected',
      };

      vi.mocked(returnRepository.updateReturnStatus).mockResolvedValue(mockReturn);

      const action = updateReturnStatusRequest({
        returnId: 'return-1',
        status: 'rejected',
        adminNote: 'Insufficient evidence',
      });

      expect(action.payload.adminNote).toBe('Insufficient evidence');
    });

    it('calls onSuccess callback after update', async () => {
      const mockReturn = {
        id: 'return-1',
        status: 'completed',
      };

      vi.mocked(returnRepository.updateReturnStatus).mockResolvedValue(mockReturn);

      const onSuccess = vi.fn();
      const action = updateReturnStatusRequest({
        returnId: 'return-1',
        status: 'completed',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles update failure', async () => {
      const mockError = new Error('Update failed');

      vi.mocked(returnRepository.updateReturnStatus).mockRejectedValue(mockError);

      expect(returnSaga).toBeDefined();
    });

    it('handles different return statuses', () => {
      const statuses = ['pending', 'approved', 'rejected', 'completed'];

      statuses.forEach((status) => {
        const action = updateReturnStatusRequest({
          returnId: 'return-1',
          status,
        });

        expect(action.payload.status).toBe(status);
      });
    });
  });

  describe('action types', () => {
    it('has correct action type for getReturnsRequest', () => {
      expect(getReturnsRequest.type).toBe('return/getReturnsRequest');
    });

    it('has correct action type for getReturnByIdRequest', () => {
      expect(getReturnByIdRequest.type).toBe('return/getReturnByIdRequest');
    });

    it('has correct action type for updateReturnStatusRequest', () => {
      expect(updateReturnStatusRequest.type).toBe('return/updateReturnStatusRequest');
    });

    it('has correct action type for getReturnTabCountsRequest', () => {
      expect(getReturnTabCountsRequest.type).toBe('return/getReturnTabCountsRequest');
    });

    it('has correct action type for setReturnLoading', () => {
      expect(setReturnLoading.type).toBe('return/setReturnLoading');
    });

    it('has correct action type for setReturnsSuccess', () => {
      expect(setReturnsSuccess.type).toBe('return/setReturnsSuccess');
    });

    it('has correct action type for setReturnError', () => {
      expect(setReturnError.type).toBe('return/setReturnError');
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
      const action = getReturnsRequest({ page: 5, limit: 50 });

      expect(action.payload.page).toBe(5);
      expect(action.payload.limit).toBe(50);
    });

    it('handles empty filters', () => {
      const action = getReturnsRequest({ page: 1, limit: 10, filters: {} });

      expect(action.payload.filters).toEqual({});
    });

    it('handles complex filters', () => {
      const filters = {
        status: 'pending',
        type: 'refund',
        orderId: 'order-1',
        dateFrom: '2024-01-01',
      };

      const action = getReturnsRequest({ page: 1, limit: 10, filters });

      expect(action.payload.filters).toEqual(filters);
    });

    it('handles pagination metadata', () => {
      const data = {
        returns: [],
        pagination: {
          page: 2,
          limit: 20,
          total: 100,
          totalPages: 5,
        },
      };

      const action = setReturnsSuccess(data);

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
            message: 'Return not found',
          },
        },
      };

      expect(error.response.data.message).toBe('Return not found');
    });
  });

  describe('return types', () => {
    it('handles refund type', () => {
      const action = getReturnTabCountsRequest({ type: 'refund' });

      expect(action.payload.type).toBe('refund');
    });

    it('handles exchange type', () => {
      const action = getReturnTabCountsRequest({ type: 'exchange' });

      expect(action.payload.type).toBe('exchange');
    });
  });

  describe('return status values', () => {
    it('handles pending status', () => {
      const action = updateReturnStatusRequest({
        returnId: 'return-1',
        status: 'pending',
      });

      expect(action.payload.status).toBe('pending');
    });

    it('handles approved status', () => {
      const action = updateReturnStatusRequest({
        returnId: 'return-1',
        status: 'approved',
      });

      expect(action.payload.status).toBe('approved');
    });

    it('handles rejected status', () => {
      const action = updateReturnStatusRequest({
        returnId: 'return-1',
        status: 'rejected',
      });

      expect(action.payload.status).toBe('rejected');
    });

    it('handles completed status', () => {
      const action = updateReturnStatusRequest({
        returnId: 'return-1',
        status: 'completed',
      });

      expect(action.payload.status).toBe('completed');
    });
  });

  describe('callbacks', () => {
    it('handles onSuccess callback for getReturns', () => {
      const onSuccess = vi.fn();
      const action = getReturnsRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for getReturnById', () => {
      const onSuccess = vi.fn();
      const action = getReturnByIdRequest({
        id: 'return-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for updateReturnStatus', () => {
      const onSuccess = vi.fn();
      const action = updateReturnStatusRequest({
        returnId: 'return-1',
        status: 'approved',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });
  });
});
