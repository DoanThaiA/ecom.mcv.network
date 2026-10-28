import { describe, it, expect, beforeEach } from 'vitest';
import {
  returnSlice,
  setReturnLoading,
  setReturnsSuccess,
  setReturnError,
  setCurrentReturnLoading,
  setCurrentReturnSuccess,
  setCurrentReturnError,
  clearCurrentReturn,
  clearReturnError,
  setReturnFilters,
  setReturnSort,
  setReturnActiveTab,
  setReturnTabCounts,
  resetReturnState,
  getReturnsRequest,
  getReturnByIdRequest,
  updateReturnStatusRequest,
  getReturnTabCountsRequest,
  selectReturns,
  selectCurrentReturn,
  selectReturnLoading,
  selectCurrentReturnLoading,
  selectReturnError,
  selectReturnPagination,
  selectReturnFilters,
  selectReturnSort,
  selectReturnActiveTab,
  selectReturnTabCounts,
  type ReturnState,
} from 'src/redux/store/returnSlice';
import type { ReturnRequest } from 'src/types/returns';

describe('returnSlice', () => {
  const returnReducer = returnSlice.reducer;

  const initialState: ReturnState = {
    returns: [],
    currentReturn: null,
    loading: false,
    currentReturnLoading: false,
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
    tabCounts: {
      all: 0,
      pending: 0,
      confirmed: 0,
      refunded: 0,
      rejected: 0,
    },
  };

  const mockReturn: ReturnRequest = {
    _id: 'ret1',
    orderCode: 'ORDER001',
    customerName: 'John Doe',
    status: 'pending',
    type: 'refund',
    reason: 'Defective product',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  } as ReturnRequest;

  const mockReturnList: ReturnRequest[] = [
    mockReturn,
    {
      _id: 'ret2',
      orderCode: 'ORDER002',
      customerName: 'Jane Smith',
      status: 'confirmed',
      type: 'exchange',
      reason: 'Wrong size',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    } as ReturnRequest,
  ];

  beforeEach(() => {
    // Reset to initial state before each test
  });

  describe('reducers', () => {
    describe('setReturnLoading', () => {
      it('sets loading to true and clears error', () => {
        const stateWithError: ReturnState = {
          ...initialState,
          error: 'Previous error',
        };
        const state = returnReducer(stateWithError, setReturnLoading(true));
        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
      });

      it('sets loading to false without clearing error', () => {
        const stateWithError: ReturnState = {
          ...initialState,
          loading: true,
          error: 'Some error',
        };
        const state = returnReducer(stateWithError, setReturnLoading(false));
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Some error');
      });
    });

    describe('setReturnsSuccess', () => {
      it('sets returns, pagination and clears loading and error', () => {
        const stateWithLoading: ReturnState = {
          ...initialState,
          loading: true,
          error: 'Some error',
        };
        const state = returnReducer(
          stateWithLoading,
          setReturnsSuccess({
            returns: mockReturnList,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
          })
        );
        expect(state.returns).toEqual(mockReturnList);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
      });
    });

    describe('setReturnError', () => {
      it('sets error and stops loading', () => {
        const stateWithLoading: ReturnState = {
          ...initialState,
          loading: true,
        };
        const state = returnReducer(stateWithLoading, setReturnError('Failed to load'));
        expect(state.error).toBe('Failed to load');
        expect(state.loading).toBe(false);
      });
    });

    describe('setCurrentReturnLoading', () => {
      it('sets current loading to true and clears error', () => {
        const stateWithError: ReturnState = {
          ...initialState,
          error: 'Previous error',
        };
        const state = returnReducer(stateWithError, setCurrentReturnLoading(true));
        expect(state.currentReturnLoading).toBe(true);
        expect(state.error).toBe(null);
      });

      it('sets current loading to false without clearing error', () => {
        const stateWithError: ReturnState = {
          ...initialState,
          currentReturnLoading: true,
          error: 'Some error',
        };
        const state = returnReducer(stateWithError, setCurrentReturnLoading(false));
        expect(state.currentReturnLoading).toBe(false);
        expect(state.error).toBe('Some error');
      });
    });

    describe('setCurrentReturnSuccess', () => {
      it('sets current return and clears loading and error', () => {
        const stateWithLoading: ReturnState = {
          ...initialState,
          currentReturnLoading: true,
          error: 'Some error',
        };
        const state = returnReducer(stateWithLoading, setCurrentReturnSuccess(mockReturn));
        expect(state.currentReturn).toEqual(mockReturn);
        expect(state.currentReturnLoading).toBe(false);
        expect(state.error).toBe(null);
      });
    });

    describe('setCurrentReturnError', () => {
      it('sets error and stops current loading', () => {
        const stateWithLoading: ReturnState = {
          ...initialState,
          currentReturnLoading: true,
        };
        const state = returnReducer(stateWithLoading, setCurrentReturnError('Failed to load'));
        expect(state.error).toBe('Failed to load');
        expect(state.currentReturnLoading).toBe(false);
      });
    });

    describe('clearCurrentReturn', () => {
      it('clears current return', () => {
        const stateWithReturn: ReturnState = {
          ...initialState,
          currentReturn: mockReturn,
        };
        const state = returnReducer(stateWithReturn, clearCurrentReturn());
        expect(state.currentReturn).toBe(null);
      });
    });

    describe('clearReturnError', () => {
      it('clears error', () => {
        const stateWithError: ReturnState = {
          ...initialState,
          error: 'Some error',
        };
        const state = returnReducer(stateWithError, clearReturnError());
        expect(state.error).toBe(null);
      });
    });

    describe('setReturnFilters', () => {
      it('sets filter values', () => {
        const state = returnReducer(
          initialState,
          setReturnFilters({ status: 'pending', type: 'refund' })
        );
        expect(state.filters).toEqual({ status: 'pending', type: 'refund' });
      });

      it('replaces existing filters', () => {
        const stateWithFilters: ReturnState = {
          ...initialState,
          filters: { status: 'pending' },
        };
        const state = returnReducer(stateWithFilters, setReturnFilters({ type: 'exchange' }));
        expect(state.filters).toEqual({ type: 'exchange' });
      });
    });

    describe('setReturnSort', () => {
      it('sets sort values', () => {
        const state = returnReducer(
          initialState,
          setReturnSort({ field: 'createdAt', order: -1 })
        );
        expect(state.sort).toEqual({ field: 'createdAt', order: -1 });
      });

      it('sets sort to undefined', () => {
        const stateWithSort: ReturnState = {
          ...initialState,
          sort: { field: 'createdAt', order: -1 },
        };
        const state = returnReducer(stateWithSort, setReturnSort(undefined));
        expect(state.sort).toBeUndefined();
      });
    });

    describe('setReturnActiveTab', () => {
      it('sets active tab', () => {
        const state = returnReducer(initialState, setReturnActiveTab('confirmed'));
        expect(state.activeTab).toBe('confirmed');
      });

      it('resets page to 1 when tab changes', () => {
        const stateWithPage: ReturnState = {
          ...initialState,
          pagination: { page: 5, limit: 10, total: 100, totalPages: 10 },
        };
        const state = returnReducer(stateWithPage, setReturnActiveTab('confirmed'));
        expect(state.activeTab).toBe('confirmed');
        expect(state.pagination.page).toBe(1);
      });

      it('does not affect other pagination properties', () => {
        const stateWithPage: ReturnState = {
          ...initialState,
          pagination: { page: 5, limit: 20, total: 100, totalPages: 5 },
        };
        const state = returnReducer(stateWithPage, setReturnActiveTab('pending'));
        expect(state.pagination.limit).toBe(20);
        expect(state.pagination.total).toBe(100);
        expect(state.pagination.totalPages).toBe(5);
      });
    });

    describe('setReturnTabCounts', () => {
      it('sets tab counts', () => {
        const state = returnReducer(
          initialState,
          setReturnTabCounts({ all: 10, pending: 5, confirmed: 3, refunded: 1, rejected: 1 })
        );
        expect(state.tabCounts).toEqual({
          all: 10,
          pending: 5,
          confirmed: 3,
          refunded: 1,
          rejected: 1,
        });
      });

      it('replaces existing tab counts', () => {
        const stateWithCounts: ReturnState = {
          ...initialState,
          tabCounts: { all: 5, pending: 2, confirmed: 1, refunded: 1, rejected: 1 },
        };
        const state = returnReducer(
          stateWithCounts,
          setReturnTabCounts({ all: 10, pending: 6, confirmed: 2, refunded: 1, rejected: 1 })
        );
        expect(state.tabCounts).toEqual({
          all: 10,
          pending: 6,
          confirmed: 2,
          refunded: 1,
          rejected: 1,
        });
      });
    });

    describe('resetReturnState', () => {
      it('resets returns, loading, error, pagination, filters, sort, and activeTab', () => {
        const stateWithData: ReturnState = {
          ...initialState,
          returns: mockReturnList,
          loading: true,
          error: 'Some error',
          pagination: { page: 5, limit: 20, total: 100, totalPages: 5 },
          filters: { status: 'pending' },
          sort: { field: 'createdAt', order: -1 },
          activeTab: 'confirmed',
          currentReturn: mockReturn,
          tabCounts: { all: 10, pending: 5, confirmed: 3, refunded: 1, rejected: 1 },
        };
        const state = returnReducer(stateWithData, resetReturnState());
        expect(state.returns).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
        expect(state.filters).toEqual({});
        expect(state.sort).toBeUndefined();
        expect(state.activeTab).toBe('all');
      });

      it('does not reset current return and tab counts', () => {
        const stateWithData: ReturnState = {
          ...initialState,
          currentReturn: mockReturn,
          tabCounts: { all: 10, pending: 5, confirmed: 3, refunded: 1, rejected: 1 },
        };
        const state = returnReducer(stateWithData, resetReturnState());
        expect(state.currentReturn).toEqual(mockReturn);
        expect(state.tabCounts).toEqual({
          all: 10,
          pending: 5,
          confirmed: 3,
          refunded: 1,
          rejected: 1,
        });
      });
    });
  });

  describe('saga actions', () => {
    describe('getReturnsRequest', () => {
      it('creates correct action type', () => {
        const action = getReturnsRequest({
          page: 1,
          limit: 10,
        });
        expect(action.type).toBe('return/getReturnsRequest');
      });

      it('includes pagination in payload', () => {
        const action = getReturnsRequest({
          page: 2,
          limit: 20,
        });
        expect(action.payload.page).toBe(2);
        expect(action.payload.limit).toBe(20);
      });

      it('includes filters in payload', () => {
        const action = getReturnsRequest({
          filters: { status: 'pending', type: 'refund' },
        });
        expect(action.payload.filters).toEqual({ status: 'pending', type: 'refund' });
      });

      it('includes sort in payload', () => {
        const action = getReturnsRequest({
          sort: { field: 'createdAt', order: -1 },
        });
        expect(action.payload.sort).toEqual({ field: 'createdAt', order: -1 });
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = getReturnsRequest({ onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('getReturnByIdRequest', () => {
      it('creates correct action type', () => {
        const action = getReturnByIdRequest({ id: 'ret1' });
        expect(action.type).toBe('return/getReturnByIdRequest');
      });

      it('includes id in payload', () => {
        const action = getReturnByIdRequest({ id: 'ret1' });
        expect(action.payload.id).toBe('ret1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = getReturnByIdRequest({ id: 'ret1', onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('updateReturnStatusRequest', () => {
      it('creates correct action type', () => {
        const action = updateReturnStatusRequest({
          returnId: 'ret1',
          status: 'confirmed',
        });
        expect(action.type).toBe('return/updateReturnStatusRequest');
      });

      it('includes returnId and status in payload', () => {
        const action = updateReturnStatusRequest({
          returnId: 'ret1',
          status: 'confirmed',
        });
        expect(action.payload.returnId).toBe('ret1');
        expect(action.payload.status).toBe('confirmed');
      });

      it('includes adminNote in payload', () => {
        const action = updateReturnStatusRequest({
          returnId: 'ret1',
          status: 'rejected',
          adminNote: 'Invalid request',
        });
        expect(action.payload.adminNote).toBe('Invalid request');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = updateReturnStatusRequest({
          returnId: 'ret1',
          status: 'confirmed',
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('getReturnTabCountsRequest', () => {
      it('creates correct action type', () => {
        const action = getReturnTabCountsRequest({ type: 'refund' });
        expect(action.type).toBe('return/getReturnTabCountsRequest');
      });

      it('includes type in payload', () => {
        const action = getReturnTabCountsRequest({ type: 'exchange' });
        expect(action.payload.type).toBe('exchange');
      });

      it('handles empty payload', () => {
        const action = getReturnTabCountsRequest({});
        expect(action.payload).toEqual({});
      });
    });
  });

  describe('selectors', () => {
    describe('selectReturns', () => {
      it('returns empty array for initial state', () => {
        expect(selectReturns({ return: initialState })).toEqual([]);
      });

      it('returns returns when present', () => {
        const state: ReturnState = { ...initialState, returns: mockReturnList };
        expect(selectReturns({ return: state })).toEqual(mockReturnList);
      });
    });

    describe('selectCurrentReturn', () => {
      it('returns null for initial state', () => {
        expect(selectCurrentReturn({ return: initialState })).toBe(null);
      });

      it('returns current return when present', () => {
        const state: ReturnState = { ...initialState, currentReturn: mockReturn };
        expect(selectCurrentReturn({ return: state })).toEqual(mockReturn);
      });
    });

    describe('selectReturnLoading', () => {
      it('returns false for initial state', () => {
        expect(selectReturnLoading({ return: initialState })).toBe(false);
      });

      it('returns true when loading', () => {
        const state: ReturnState = { ...initialState, loading: true };
        expect(selectReturnLoading({ return: state })).toBe(true);
      });
    });

    describe('selectCurrentReturnLoading', () => {
      it('returns false for initial state', () => {
        expect(selectCurrentReturnLoading({ return: initialState })).toBe(false);
      });

      it('returns true when loading current', () => {
        const state: ReturnState = { ...initialState, currentReturnLoading: true };
        expect(selectCurrentReturnLoading({ return: state })).toBe(true);
      });
    });

    describe('selectReturnError', () => {
      it('returns null for initial state', () => {
        expect(selectReturnError({ return: initialState })).toBe(null);
      });

      it('returns error when present', () => {
        const state: ReturnState = { ...initialState, error: 'Some error' };
        expect(selectReturnError({ return: state })).toBe('Some error');
      });
    });

    describe('selectReturnPagination', () => {
      it('returns initial pagination for initial state', () => {
        expect(selectReturnPagination({ return: initialState })).toEqual({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      });

      it('returns current pagination', () => {
        const state: ReturnState = {
          ...initialState,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        };
        expect(selectReturnPagination({ return: state })).toEqual({
          page: 2,
          limit: 20,
          total: 100,
          totalPages: 5,
        });
      });
    });

    describe('selectReturnFilters', () => {
      it('returns empty object for initial state', () => {
        expect(selectReturnFilters({ return: initialState })).toEqual({});
      });

      it('returns current filters', () => {
        const state: ReturnState = {
          ...initialState,
          filters: { status: 'pending', type: 'refund' },
        };
        expect(selectReturnFilters({ return: state })).toEqual({
          status: 'pending',
          type: 'refund',
        });
      });
    });

    describe('selectReturnSort', () => {
      it('returns undefined for initial state', () => {
        expect(selectReturnSort({ return: initialState })).toBeUndefined();
      });

      it('returns current sort', () => {
        const state: ReturnState = {
          ...initialState,
          sort: { field: 'createdAt', order: -1 },
        };
        expect(selectReturnSort({ return: state })).toEqual({ field: 'createdAt', order: -1 });
      });
    });

    describe('selectReturnActiveTab', () => {
      it('returns "all" for initial state', () => {
        expect(selectReturnActiveTab({ return: initialState })).toBe('all');
      });

      it('returns current active tab', () => {
        const state: ReturnState = { ...initialState, activeTab: 'confirmed' };
        expect(selectReturnActiveTab({ return: state })).toBe('confirmed');
      });
    });

    describe('selectReturnTabCounts', () => {
      it('returns initial tab counts for initial state', () => {
        expect(selectReturnTabCounts({ return: initialState })).toEqual({
          all: 0,
          pending: 0,
          confirmed: 0,
          refunded: 0,
          rejected: 0,
        });
      });

      it('returns current tab counts', () => {
        const state: ReturnState = {
          ...initialState,
          tabCounts: { all: 10, pending: 5, confirmed: 3, refunded: 1, rejected: 1 },
        };
        expect(selectReturnTabCounts({ return: state })).toEqual({
          all: 10,
          pending: 5,
          confirmed: 3,
          refunded: 1,
          rejected: 1,
        });
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete return list fetch flow', () => {
      // Start loading
      let state = returnReducer(initialState, setReturnLoading(true));
      expect(selectReturnLoading({ return: state })).toBe(true);
      expect(selectReturnError({ return: state })).toBe(null);

      // Success with data
      state = returnReducer(
        state,
        setReturnsSuccess({
          returns: mockReturnList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );
      expect(selectReturns({ return: state })).toEqual(mockReturnList);
      expect(selectReturnPagination({ return: state })).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
      expect(selectReturnLoading({ return: state })).toBe(false);
    });

    it('handles tab switching flow', () => {
      // Set tab counts
      let state = returnReducer(
        initialState,
        setReturnTabCounts({ all: 10, pending: 5, confirmed: 3, refunded: 1, rejected: 1 })
      );

      // Switch tab
      state = returnReducer(state, setReturnActiveTab('pending'));
      expect(selectReturnActiveTab({ return: state })).toBe('pending');
      expect(selectReturnPagination({ return: state }).page).toBe(1);

      // Fetch data for new tab
      state = returnReducer(state, setReturnLoading(true));
      state = returnReducer(
        state,
        setReturnsSuccess({
          returns: mockReturnList,
          pagination: { page: 1, limit: 10, total: 5, totalPages: 1 },
        })
      );
      expect(selectReturns({ return: state })).toEqual(mockReturnList);
    });

    it('handles error flow', () => {
      // Start loading
      let state = returnReducer(initialState, setReturnLoading(true));
      expect(selectReturnLoading({ return: state })).toBe(true);

      // Error occurs
      state = returnReducer(state, setReturnError('Failed to load'));
      expect(selectReturnError({ return: state })).toBe('Failed to load');
      expect(selectReturnLoading({ return: state })).toBe(false);

      // Clear error
      state = returnReducer(state, clearReturnError());
      expect(selectReturnError({ return: state })).toBe(null);
    });

    it('handles filter and sort flow', () => {
      // Set filters
      let state = returnReducer(initialState, setReturnFilters({ status: 'pending' }));
      expect(selectReturnFilters({ return: state }).status).toBe('pending');

      // Set sort
      state = returnReducer(state, setReturnSort({ field: 'createdAt', order: -1 }));
      expect(selectReturnSort({ return: state })?.field).toBe('createdAt');

      // Reload with filters and sort
      state = returnReducer(state, setReturnLoading(true));
      state = returnReducer(
        state,
        setReturnsSuccess({
          returns: mockReturnList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );
      expect(selectReturns({ return: state })).toEqual(mockReturnList);
      expect(selectReturnFilters({ return: state }).status).toBe('pending');
      expect(selectReturnSort({ return: state })?.field).toBe('createdAt');
    });

    it('handles reset flow', () => {
      // Add some data
      let state = returnReducer(
        initialState,
        setReturnsSuccess({
          returns: mockReturnList,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        })
      );
      state = returnReducer(state, setReturnFilters({ status: 'pending' }));
      state = returnReducer(state, setReturnActiveTab('confirmed'));

      // Reset
      state = returnReducer(state, resetReturnState());
      expect(selectReturns({ return: state })).toEqual([]);
      expect(selectReturnPagination({ return: state })).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      expect(selectReturnFilters({ return: state })).toEqual({});
      expect(selectReturnActiveTab({ return: state })).toBe('all');
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = returnReducer(initialState, { type: 'UNKNOWN_ACTION' } as any);
      expect(state).toEqual(initialState);
    });

    it('clears error when starting new loading', () => {
      const stateWithError: ReturnState = {
        ...initialState,
        error: 'Previous error',
      };
      const state = returnReducer(stateWithError, setReturnLoading(true));
      expect(state.error).toBe(null);
    });

    it('handles independent loading states', () => {
      let state = returnReducer(initialState, setReturnLoading(true));
      state = returnReducer(state, setCurrentReturnLoading(true));

      expect(state.loading).toBe(true);
      expect(state.currentReturnLoading).toBe(true);

      state = returnReducer(state, setReturnLoading(false));
      expect(state.loading).toBe(false);
      expect(state.currentReturnLoading).toBe(true);
    });

    it('handles tab switching with different page numbers', () => {
      let state = returnReducer(
        initialState,
        setReturnsSuccess({
          returns: mockReturnList,
          pagination: { page: 5, limit: 10, total: 100, totalPages: 10 },
        })
      );

      // Switch tab resets page
      state = returnReducer(state, setReturnActiveTab('pending'));
      expect(state.pagination.page).toBe(1);

      // But other pagination values remain
      expect(state.pagination.limit).toBe(10);
      expect(state.pagination.total).toBe(100);
      expect(state.pagination.totalPages).toBe(10);
    });
  });
});
