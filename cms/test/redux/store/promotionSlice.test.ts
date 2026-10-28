import { describe, it, expect, beforeEach } from 'vitest';
import {
  promotionSlice,
  setPromotionLoading,
  setPromotionsSuccess,
  setPromotionError,
  setCurrentPromotionLoading,
  setCurrentPromotionSuccess,
  setCurrentPromotionError,
  clearCurrentPromotion,
  setCreatePromotionLoading,
  setCreatePromotionSuccess,
  setCreatePromotionError,
  setUpdatePromotionLoading,
  setUpdatePromotionSuccess,
  setUpdatePromotionError,
  setDeletePromotionLoading,
  setDeletePromotionSuccess,
  setDeletePromotionError,
  setPausePromotionLoading,
  setPausePromotionSuccess,
  setPausePromotionError,
  setResumePromotionSuccess,
  setResumePromotionError,
  setPromotionFilters,
  setPromotionSort,
  resetPromotionState,
  getPromotionsRequest,
  getPromotionByIdRequest,
  createPromotionRequest,
  updatePromotionRequest,
  deletePromotionRequest,
  pausePromotionRequest,
  resumePromotionRequest,
  selectPromotions,
  selectCurrentPromotion,
  selectPromotionLoading,
  selectCurrentPromotionLoading,
  selectCreatePromotionLoading,
  selectUpdatePromotionLoading,
  selectDeletePromotionLoading,
  selectPausePromotionLoading,
  selectPromotionPagination,
  selectPromotionFilters,
  selectPromotionSort,
  selectPromotionStatusFilter,
  selectPromotionSearchQuery,
  selectPromotionTypeFilter,
  type PromotionState,
} from 'src/redux/store/promotionSlice';
import type { Promotion, PromotionListItem } from 'src/types/promotion';

describe('promotionSlice', () => {
  const promotionReducer = promotionSlice.reducer;

  const initialState: PromotionState = {
    promotions: [],
    currentPromotion: null,
    loading: false,
    currentLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    pauseLoading: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: {},
    sort: [],
  };

  const mockPromotion: Promotion = {
    id: 'promo1',
    name: 'Promotion 1',
    status: 'active',
  } as Promotion;

  const mockPromotionListItem: PromotionListItem = {
    id: 'promo1',
    name: 'Promotion 1',
    status: 'active',
  } as PromotionListItem;

  const mockPromotionList: PromotionListItem[] = [
    mockPromotionListItem,
    {
      id: 'promo2',
      name: 'Promotion 2',
      status: 'paused',
    } as PromotionListItem,
  ];

  beforeEach(() => {
    // Reset to initial state before each test
  });

  describe('reducers', () => {
    describe('setPromotionLoading', () => {
      it('sets loading to true', () => {
        const state = promotionReducer(initialState, setPromotionLoading(true));
        expect(state.loading).toBe(true);
      });

      it('sets loading to false', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          loading: true,
        };
        const state = promotionReducer(stateWithLoading, setPromotionLoading(false));
        expect(state.loading).toBe(false);
      });
    });

    describe('setPromotionsSuccess', () => {
      it('sets promotions and pagination and stops loading', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          loading: true,
        };
        const state = promotionReducer(
          stateWithLoading,
          setPromotionsSuccess({
            promotions: mockPromotionList,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
          })
        );
        expect(state.promotions).toEqual(mockPromotionList);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
        expect(state.loading).toBe(false);
      });
    });

    describe('setPromotionError', () => {
      it('stops loading', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          loading: true,
        };
        const state = promotionReducer(stateWithLoading, setPromotionError());
        expect(state.loading).toBe(false);
      });
    });

    describe('setCurrentPromotionLoading', () => {
      it('sets current loading to true', () => {
        const state = promotionReducer(initialState, setCurrentPromotionLoading(true));
        expect(state.currentLoading).toBe(true);
      });

      it('sets current loading to false', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          currentLoading: true,
        };
        const state = promotionReducer(stateWithLoading, setCurrentPromotionLoading(false));
        expect(state.currentLoading).toBe(false);
      });
    });

    describe('setCurrentPromotionSuccess', () => {
      it('sets current promotion and stops loading', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          currentLoading: true,
        };
        const state = promotionReducer(stateWithLoading, setCurrentPromotionSuccess(mockPromotion));
        expect(state.currentPromotion).toEqual(mockPromotion);
        expect(state.currentLoading).toBe(false);
      });
    });

    describe('setCurrentPromotionError', () => {
      it('stops current loading', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          currentLoading: true,
        };
        const state = promotionReducer(stateWithLoading, setCurrentPromotionError());
        expect(state.currentLoading).toBe(false);
      });
    });

    describe('clearCurrentPromotion', () => {
      it('clears current promotion', () => {
        const stateWithPromotion: PromotionState = {
          ...initialState,
          currentPromotion: mockPromotion,
        };
        const state = promotionReducer(stateWithPromotion, clearCurrentPromotion());
        expect(state.currentPromotion).toBe(null);
      });
    });

    describe('setCreatePromotionLoading', () => {
      it('sets create loading to true', () => {
        const state = promotionReducer(initialState, setCreatePromotionLoading(true));
        expect(state.createLoading).toBe(true);
      });

      it('sets create loading to false', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          createLoading: true,
        };
        const state = promotionReducer(stateWithLoading, setCreatePromotionLoading(false));
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setCreatePromotionSuccess', () => {
      it('stops create loading', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          createLoading: true,
        };
        const state = promotionReducer(stateWithLoading, setCreatePromotionSuccess());
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setCreatePromotionError', () => {
      it('stops create loading', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          createLoading: true,
        };
        const state = promotionReducer(stateWithLoading, setCreatePromotionError());
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setUpdatePromotionLoading', () => {
      it('sets update loading to true', () => {
        const state = promotionReducer(initialState, setUpdatePromotionLoading(true));
        expect(state.updateLoading).toBe(true);
      });

      it('sets update loading to false', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          updateLoading: true,
        };
        const state = promotionReducer(stateWithLoading, setUpdatePromotionLoading(false));
        expect(state.updateLoading).toBe(false);
      });
    });

    describe('setUpdatePromotionSuccess', () => {
      it('updates current promotion if id matches and stops loading', () => {
        const stateWithPromotion: PromotionState = {
          ...initialState,
          currentPromotion: mockPromotion,
          updateLoading: true,
        };
        const updatedPromotion: Promotion = { ...mockPromotion, name: 'Updated Promotion' };
        const state = promotionReducer(stateWithPromotion, setUpdatePromotionSuccess(updatedPromotion));
        expect(state.currentPromotion?.name).toBe('Updated Promotion');
        expect(state.updateLoading).toBe(false);
      });

      it('does not update current promotion if id does not match', () => {
        const otherPromotion: Promotion = { ...mockPromotion, id: 'promo2' };
        const stateWithPromotion: PromotionState = {
          ...initialState,
          currentPromotion: mockPromotion,
          updateLoading: true,
        };
        const updatedPromotion: Promotion = { ...otherPromotion, name: 'Updated' };
        const state = promotionReducer(stateWithPromotion, setUpdatePromotionSuccess(updatedPromotion));
        expect(state.currentPromotion?.id).toBe('promo1');
        expect(state.currentPromotion?.name).toBe('Promotion 1');
      });
    });

    describe('setUpdatePromotionError', () => {
      it('stops update loading', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          updateLoading: true,
        };
        const state = promotionReducer(stateWithLoading, setUpdatePromotionError());
        expect(state.updateLoading).toBe(false);
      });
    });

    describe('setDeletePromotionLoading', () => {
      it('sets delete loading to true', () => {
        const state = promotionReducer(initialState, setDeletePromotionLoading(true));
        expect(state.deleteLoading).toBe(true);
      });

      it('sets delete loading to false', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          deleteLoading: true,
        };
        const state = promotionReducer(stateWithLoading, setDeletePromotionLoading(false));
        expect(state.deleteLoading).toBe(false);
      });
    });

    describe('setDeletePromotionSuccess', () => {
      it('removes promotion from list and stops loading', () => {
        const stateWithPromotions: PromotionState = {
          ...initialState,
          promotions: mockPromotionList,
          deleteLoading: true,
        };
        const state = promotionReducer(stateWithPromotions, setDeletePromotionSuccess('promo1'));
        expect(state.promotions).toEqual([mockPromotionList[1]]);
        expect(state.deleteLoading).toBe(false);
      });

      it('clears current promotion if id matches', () => {
        const stateWithCurrent: PromotionState = {
          ...initialState,
          promotions: mockPromotionList,
          currentPromotion: mockPromotion,
          deleteLoading: true,
        };
        const state = promotionReducer(stateWithCurrent, setDeletePromotionSuccess('promo1'));
        expect(state.currentPromotion).toBe(null);
      });

      it('does not clear current promotion if id does not match', () => {
        const stateWithCurrent: PromotionState = {
          ...initialState,
          promotions: mockPromotionList,
          currentPromotion: mockPromotion,
          deleteLoading: true,
        };
        const state = promotionReducer(stateWithCurrent, setDeletePromotionSuccess('promo2'));
        expect(state.currentPromotion?.id).toBe('promo1');
      });
    });

    describe('setDeletePromotionError', () => {
      it('stops delete loading', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          deleteLoading: true,
        };
        const state = promotionReducer(stateWithLoading, setDeletePromotionError());
        expect(state.deleteLoading).toBe(false);
      });
    });

    describe('setPausePromotionLoading', () => {
      it('sets pause loading to true', () => {
        const state = promotionReducer(initialState, setPausePromotionLoading(true));
        expect(state.pauseLoading).toBe(true);
      });

      it('sets pause loading to false', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          pauseLoading: true,
        };
        const state = promotionReducer(stateWithLoading, setPausePromotionLoading(false));
        expect(state.pauseLoading).toBe(false);
      });
    });

    describe('setPausePromotionSuccess', () => {
      it('updates promotion status in list and stops loading', () => {
        const stateWithPromotions: PromotionState = {
          ...initialState,
          promotions: mockPromotionList,
          pauseLoading: true,
        };
        const pausedPromotion: Promotion = { ...mockPromotion, status: 'paused' };
        const state = promotionReducer(stateWithPromotions, setPausePromotionSuccess(pausedPromotion));
        expect(state.promotions[0].status).toBe('paused');
        expect(state.pauseLoading).toBe(false);
      });

      it('updates current promotion if id matches', () => {
        const stateWithCurrent: PromotionState = {
          ...initialState,
          promotions: mockPromotionList,
          currentPromotion: mockPromotion,
          pauseLoading: true,
        };
        const pausedPromotion: Promotion = { ...mockPromotion, status: 'paused' };
        const state = promotionReducer(stateWithCurrent, setPausePromotionSuccess(pausedPromotion));
        expect(state.currentPromotion?.status).toBe('paused');
      });

      it('does not update current promotion if id does not match', () => {
        const otherPromotion: Promotion = { ...mockPromotion, id: 'promo2', status: 'paused' };
        const stateWithCurrent: PromotionState = {
          ...initialState,
          promotions: mockPromotionList,
          currentPromotion: mockPromotion,
          pauseLoading: true,
        };
        const state = promotionReducer(stateWithCurrent, setPausePromotionSuccess(otherPromotion));
        expect(state.currentPromotion?.id).toBe('promo1');
        expect(state.currentPromotion?.status).toBe('active');
      });
    });

    describe('setPausePromotionError', () => {
      it('stops pause loading', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          pauseLoading: true,
        };
        const state = promotionReducer(stateWithLoading, setPausePromotionError());
        expect(state.pauseLoading).toBe(false);
      });
    });

    describe('setResumePromotionSuccess', () => {
      it('updates promotion status in list and stops loading', () => {
        const stateWithPromotions: PromotionState = {
          ...initialState,
          promotions: mockPromotionList,
          pauseLoading: true,
        };
        const resumedPromotion: Promotion = { ...mockPromotion, status: 'active' };
        const state = promotionReducer(stateWithPromotions, setResumePromotionSuccess(resumedPromotion));
        expect(state.promotions[0].status).toBe('active');
        expect(state.pauseLoading).toBe(false);
      });

      it('updates current promotion if id matches', () => {
        const pausedPromotion: Promotion = { ...mockPromotion, status: 'paused' };
        const stateWithCurrent: PromotionState = {
          ...initialState,
          promotions: mockPromotionList,
          currentPromotion: pausedPromotion,
          pauseLoading: true,
        };
        const resumedPromotion: Promotion = { ...mockPromotion, status: 'active' };
        const state = promotionReducer(stateWithCurrent, setResumePromotionSuccess(resumedPromotion));
        expect(state.currentPromotion?.status).toBe('active');
      });

      it('does not update current promotion if id does not match', () => {
        const otherPromotion: Promotion = { ...mockPromotion, id: 'promo2', status: 'active' };
        const stateWithCurrent: PromotionState = {
          ...initialState,
          promotions: mockPromotionList,
          currentPromotion: mockPromotion,
          pauseLoading: true,
        };
        const state = promotionReducer(stateWithCurrent, setResumePromotionSuccess(otherPromotion));
        expect(state.currentPromotion?.id).toBe('promo1');
      });
    });

    describe('setResumePromotionError', () => {
      it('stops pause loading', () => {
        const stateWithLoading: PromotionState = {
          ...initialState,
          pauseLoading: true,
        };
        const state = promotionReducer(stateWithLoading, setResumePromotionError());
        expect(state.pauseLoading).toBe(false);
      });
    });

    describe('setPromotionFilters', () => {
      it('sets filter values', () => {
        const state = promotionReducer(
          initialState,
          setPromotionFilters({ status: 'active', keyword: 'test' })
        );
        expect(state.filters).toEqual({ status: 'active', keyword: 'test' });
      });

      it('replaces existing filters', () => {
        const stateWithFilters: PromotionState = {
          ...initialState,
          filters: { status: 'active' },
        };
        const state = promotionReducer(
          stateWithFilters,
          setPromotionFilters({ keyword: 'new' })
        );
        expect(state.filters).toEqual({ keyword: 'new' });
      });
    });

    describe('setPromotionSort', () => {
      it('sets sort values', () => {
        const state = promotionReducer(
          initialState,
          setPromotionSort([{ field: 'name', order: 'asc' }])
        );
        expect(state.sort).toEqual([{ field: 'name', order: 'asc' }]);
      });

      it('replaces existing sort', () => {
        const stateWithSort: PromotionState = {
          ...initialState,
          sort: [{ field: 'name', order: 'asc' }],
        };
        const state = promotionReducer(
          stateWithSort,
          setPromotionSort([{ field: 'status', order: 'desc' }])
        );
        expect(state.sort).toEqual([{ field: 'status', order: 'desc' }]);
      });

      it('sets sort to empty array', () => {
        const stateWithSort: PromotionState = {
          ...initialState,
          sort: [{ field: 'name', order: 'asc' }],
        };
        const state = promotionReducer(stateWithSort, setPromotionSort([]));
        expect(state.sort).toEqual([]);
      });
    });

    describe('resetPromotionState', () => {
      it('resets promotions, loading, pagination, filters, and sort', () => {
        const stateWithData: PromotionState = {
          ...initialState,
          promotions: mockPromotionList,
          loading: true,
          pagination: { page: 5, limit: 20, total: 100, totalPages: 5 },
          filters: { status: 'active' },
          sort: [{ field: 'name', order: 'asc' }],
          currentPromotion: mockPromotion,
        };
        const state = promotionReducer(stateWithData, resetPromotionState());
        expect(state.promotions).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
        expect(state.filters).toEqual({});
        expect(state.sort).toEqual([]);
      });

      it('does not reset current promotion and other loading states', () => {
        const stateWithData: PromotionState = {
          ...initialState,
          currentPromotion: mockPromotion,
          currentLoading: true,
          createLoading: true,
          updateLoading: true,
          deleteLoading: true,
          pauseLoading: true,
        };
        const state = promotionReducer(stateWithData, resetPromotionState());
        expect(state.currentPromotion).toEqual(mockPromotion);
        expect(state.currentLoading).toBe(true);
        expect(state.createLoading).toBe(true);
        expect(state.updateLoading).toBe(true);
        expect(state.deleteLoading).toBe(true);
        expect(state.pauseLoading).toBe(true);
      });
    });
  });

  describe('saga actions', () => {
    describe('getPromotionsRequest', () => {
      it('creates correct action type', () => {
        const action = getPromotionsRequest({
          page: 1,
          limit: 10,
        });
        expect(action.type).toBe('promotion/getPromotionsRequest');
      });

      it('includes pagination in payload', () => {
        const action = getPromotionsRequest({
          page: 2,
          limit: 20,
        });
        expect(action.payload.page).toBe(2);
        expect(action.payload.limit).toBe(20);
      });

      it('includes filters in payload', () => {
        const action = getPromotionsRequest({
          filters: { status: 'active' },
        });
        expect(action.payload.filters).toEqual({ status: 'active' });
      });

      it('includes sort in payload', () => {
        const action = getPromotionsRequest({
          sort: [{ field: 'name', order: 'asc' }],
        });
        expect(action.payload.sort).toEqual([{ field: 'name', order: 'asc' }]);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = getPromotionsRequest({ onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('getPromotionByIdRequest', () => {
      it('creates correct action type', () => {
        const action = getPromotionByIdRequest({ id: 'promo1' });
        expect(action.type).toBe('promotion/getPromotionByIdRequest');
      });

      it('includes id in payload', () => {
        const action = getPromotionByIdRequest({ id: 'promo1' });
        expect(action.payload.id).toBe('promo1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = getPromotionByIdRequest({ id: 'promo1', onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('createPromotionRequest', () => {
      it('creates correct action type', () => {
        const action = createPromotionRequest({
          data: { name: 'New Promotion' } as any,
        });
        expect(action.type).toBe('promotion/createPromotionRequest');
      });

      it('includes data in payload', () => {
        const data = { name: 'New Promotion' } as any;
        const action = createPromotionRequest({ data });
        expect(action.payload.data).toEqual(data);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = createPromotionRequest({
          data: { name: 'New Promotion' } as any,
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('updatePromotionRequest', () => {
      it('creates correct action type', () => {
        const action = updatePromotionRequest({
          id: 'promo1',
          data: { name: 'Updated Promotion' } as any,
        });
        expect(action.type).toBe('promotion/updatePromotionRequest');
      });

      it('includes id and data in payload', () => {
        const action = updatePromotionRequest({
          id: 'promo1',
          data: { name: 'Updated Promotion' } as any,
        });
        expect(action.payload.id).toBe('promo1');
        expect(action.payload.data).toEqual({ name: 'Updated Promotion' });
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = updatePromotionRequest({
          id: 'promo1',
          data: { name: 'Updated' } as any,
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('deletePromotionRequest', () => {
      it('creates correct action type', () => {
        const action = deletePromotionRequest({ id: 'promo1' });
        expect(action.type).toBe('promotion/deletePromotionRequest');
      });

      it('includes id in payload', () => {
        const action = deletePromotionRequest({ id: 'promo1' });
        expect(action.payload.id).toBe('promo1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = deletePromotionRequest({ id: 'promo1', onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('pausePromotionRequest', () => {
      it('creates correct action type', () => {
        const action = pausePromotionRequest({ id: 'promo1' });
        expect(action.type).toBe('promotion/pausePromotionRequest');
      });

      it('includes id in payload', () => {
        const action = pausePromotionRequest({ id: 'promo1' });
        expect(action.payload.id).toBe('promo1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = pausePromotionRequest({ id: 'promo1', onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('resumePromotionRequest', () => {
      it('creates correct action type', () => {
        const action = resumePromotionRequest({ id: 'promo1' });
        expect(action.type).toBe('promotion/resumePromotionRequest');
      });

      it('includes id in payload', () => {
        const action = resumePromotionRequest({ id: 'promo1' });
        expect(action.payload.id).toBe('promo1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = resumePromotionRequest({ id: 'promo1', onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });
  });

  describe('selectors', () => {
    describe('selectPromotions', () => {
      it('returns empty array for initial state', () => {
        expect(selectPromotions({ promotion: initialState })).toEqual([]);
      });

      it('returns promotions when present', () => {
        const state: PromotionState = { ...initialState, promotions: mockPromotionList };
        expect(selectPromotions({ promotion: state })).toEqual(mockPromotionList);
      });
    });

    describe('selectCurrentPromotion', () => {
      it('returns null for initial state', () => {
        expect(selectCurrentPromotion({ promotion: initialState })).toBe(null);
      });

      it('returns current promotion when present', () => {
        const state: PromotionState = { ...initialState, currentPromotion: mockPromotion };
        expect(selectCurrentPromotion({ promotion: state })).toEqual(mockPromotion);
      });
    });

    describe('selectPromotionLoading', () => {
      it('returns false for initial state', () => {
        expect(selectPromotionLoading({ promotion: initialState })).toBe(false);
      });

      it('returns true when loading', () => {
        const state: PromotionState = { ...initialState, loading: true };
        expect(selectPromotionLoading({ promotion: state })).toBe(true);
      });
    });

    describe('selectCurrentPromotionLoading', () => {
      it('returns false for initial state', () => {
        expect(selectCurrentPromotionLoading({ promotion: initialState })).toBe(false);
      });

      it('returns true when loading current', () => {
        const state: PromotionState = { ...initialState, currentLoading: true };
        expect(selectCurrentPromotionLoading({ promotion: state })).toBe(true);
      });
    });

    describe('selectCreatePromotionLoading', () => {
      it('returns false for initial state', () => {
        expect(selectCreatePromotionLoading({ promotion: initialState })).toBe(false);
      });

      it('returns true when creating', () => {
        const state: PromotionState = { ...initialState, createLoading: true };
        expect(selectCreatePromotionLoading({ promotion: state })).toBe(true);
      });
    });

    describe('selectUpdatePromotionLoading', () => {
      it('returns false for initial state', () => {
        expect(selectUpdatePromotionLoading({ promotion: initialState })).toBe(false);
      });

      it('returns true when updating', () => {
        const state: PromotionState = { ...initialState, updateLoading: true };
        expect(selectUpdatePromotionLoading({ promotion: state })).toBe(true);
      });
    });

    describe('selectDeletePromotionLoading', () => {
      it('returns false for initial state', () => {
        expect(selectDeletePromotionLoading({ promotion: initialState })).toBe(false);
      });

      it('returns true when deleting', () => {
        const state: PromotionState = { ...initialState, deleteLoading: true };
        expect(selectDeletePromotionLoading({ promotion: state })).toBe(true);
      });
    });

    describe('selectPausePromotionLoading', () => {
      it('returns false for initial state', () => {
        expect(selectPausePromotionLoading({ promotion: initialState })).toBe(false);
      });

      it('returns true when pausing or resuming', () => {
        const state: PromotionState = { ...initialState, pauseLoading: true };
        expect(selectPausePromotionLoading({ promotion: state })).toBe(true);
      });
    });

    describe('selectPromotionPagination', () => {
      it('returns initial pagination for initial state', () => {
        expect(selectPromotionPagination({ promotion: initialState })).toEqual({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      });

      it('returns current pagination', () => {
        const state: PromotionState = {
          ...initialState,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        };
        expect(selectPromotionPagination({ promotion: state })).toEqual({
          page: 2,
          limit: 20,
          total: 100,
          totalPages: 5,
        });
      });
    });

    describe('selectPromotionFilters', () => {
      it('returns empty object for initial state', () => {
        expect(selectPromotionFilters({ promotion: initialState })).toEqual({});
      });

      it('returns current filters', () => {
        const state: PromotionState = {
          ...initialState,
          filters: { status: 'active', keyword: 'test' },
        };
        expect(selectPromotionFilters({ promotion: state })).toEqual({
          status: 'active',
          keyword: 'test',
        });
      });
    });

    describe('selectPromotionSort', () => {
      it('returns empty array for initial state', () => {
        expect(selectPromotionSort({ promotion: initialState })).toEqual([]);
      });

      it('returns current sort', () => {
        const state: PromotionState = {
          ...initialState,
          sort: [{ field: 'name', order: 'asc' }],
        };
        expect(selectPromotionSort({ promotion: state })).toEqual([{ field: 'name', order: 'asc' }]);
      });
    });

    describe('selectPromotionStatusFilter', () => {
      it('returns undefined for initial state', () => {
        expect(selectPromotionStatusFilter({ promotion: initialState })).toBeUndefined();
      });

      it('returns current status filter', () => {
        const state: PromotionState = {
          ...initialState,
          filters: { status: 'active' },
        };
        expect(selectPromotionStatusFilter({ promotion: state })).toBe('active');
      });
    });

    describe('selectPromotionSearchQuery', () => {
      it('returns undefined for initial state', () => {
        expect(selectPromotionSearchQuery({ promotion: initialState })).toBeUndefined();
      });

      it('returns current search query', () => {
        const state: PromotionState = {
          ...initialState,
          filters: { keyword: 'test' },
        };
        expect(selectPromotionSearchQuery({ promotion: state })).toBe('test');
      });
    });

    describe('selectPromotionTypeFilter', () => {
      it('returns undefined for initial state', () => {
        expect(selectPromotionTypeFilter({ promotion: initialState })).toBeUndefined();
      });

      it('returns current type filter', () => {
        const state: PromotionState = {
          ...initialState,
          filters: { type: 'percentage' as any },
        };
        expect(selectPromotionTypeFilter({ promotion: state })).toBe('percentage');
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete CRUD flow', () => {
      // Create
      let state = promotionReducer(initialState, setCreatePromotionLoading(true));
      state = promotionReducer(state, setCreatePromotionSuccess());
      expect(selectCreatePromotionLoading({ promotion: state })).toBe(false);

      // Read
      state = promotionReducer(state, setPromotionLoading(true));
      state = promotionReducer(
        state,
        setPromotionsSuccess({
          promotions: mockPromotionList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );
      expect(selectPromotions({ promotion: state })).toEqual(mockPromotionList);

      // Update
      state = promotionReducer(state, setUpdatePromotionLoading(true));
      state = promotionReducer(state, setCurrentPromotionSuccess(mockPromotion));
      const updatedPromotion: Promotion = { ...mockPromotion, name: 'Updated Promotion' };
      state = promotionReducer(state, setUpdatePromotionSuccess(updatedPromotion));
      expect(selectCurrentPromotion({ promotion: state })?.name).toBe('Updated Promotion');

      // Delete
      state = promotionReducer(state, setDeletePromotionLoading(true));
      state = promotionReducer(state, setDeletePromotionSuccess('promo1'));
      expect(selectPromotions({ promotion: state })).toEqual([mockPromotionList[1]]);
    });

    it('handles pause and resume flow', () => {
      let state = promotionReducer(
        initialState,
        setPromotionsSuccess({
          promotions: mockPromotionList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );
      state = promotionReducer(state, setCurrentPromotionSuccess(mockPromotion));

      // Pause
      state = promotionReducer(state, setPausePromotionLoading(true));
      const pausedPromotion: Promotion = { ...mockPromotion, status: 'paused' };
      state = promotionReducer(state, setPausePromotionSuccess(pausedPromotion));
      expect(selectPromotions({ promotion: state })[0].status).toBe('paused');
      expect(selectCurrentPromotion({ promotion: state })?.status).toBe('paused');
      expect(selectPausePromotionLoading({ promotion: state })).toBe(false);

      // Resume
      state = promotionReducer(state, setPausePromotionLoading(true));
      const resumedPromotion: Promotion = { ...mockPromotion, status: 'active' };
      state = promotionReducer(state, setResumePromotionSuccess(resumedPromotion));
      expect(selectPromotions({ promotion: state })[0].status).toBe('active');
      expect(selectCurrentPromotion({ promotion: state })?.status).toBe('active');
      expect(selectPausePromotionLoading({ promotion: state })).toBe(false);
    });

    it('handles independent loading states', () => {
      let state = promotionReducer(initialState, setPromotionLoading(true));
      state = promotionReducer(state, setCurrentPromotionLoading(true));
      state = promotionReducer(state, setCreatePromotionLoading(true));
      state = promotionReducer(state, setUpdatePromotionLoading(true));
      state = promotionReducer(state, setDeletePromotionLoading(true));
      state = promotionReducer(state, setPausePromotionLoading(true));

      expect(state.loading).toBe(true);
      expect(state.currentLoading).toBe(true);
      expect(state.createLoading).toBe(true);
      expect(state.updateLoading).toBe(true);
      expect(state.deleteLoading).toBe(true);
      expect(state.pauseLoading).toBe(true);

      // Each can be stopped independently
      state = promotionReducer(state, setPromotionLoading(false));
      expect(state.loading).toBe(false);
      expect(state.currentLoading).toBe(true);
    });

    it('handles filter and sort flow', () => {
      let state = promotionReducer(
        initialState,
        setPromotionFilters({ status: 'active', keyword: 'test' })
      );
      state = promotionReducer(state, setPromotionSort([{ field: 'name', order: 'asc' }]));

      state = promotionReducer(state, setPromotionLoading(true));
      state = promotionReducer(
        state,
        setPromotionsSuccess({
          promotions: mockPromotionList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );

      expect(selectPromotionStatusFilter({ promotion: state })).toBe('active');
      expect(selectPromotionSearchQuery({ promotion: state })).toBe('test');
      expect(selectPromotionSort({ promotion: state })).toEqual([{ field: 'name', order: 'asc' }]);
    });

    it('handles reset flow', () => {
      let state = promotionReducer(
        initialState,
        setPromotionsSuccess({
          promotions: mockPromotionList,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        })
      );
      state = promotionReducer(state, setPromotionFilters({ status: 'active' }));
      state = promotionReducer(state, setPromotionSort([{ field: 'name', order: 'asc' }]));

      state = promotionReducer(state, resetPromotionState());
      expect(selectPromotions({ promotion: state })).toEqual([]);
      expect(selectPromotionPagination({ promotion: state })).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      expect(selectPromotionFilters({ promotion: state })).toEqual({});
      expect(selectPromotionSort({ promotion: state })).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = promotionReducer(initialState, { type: 'UNKNOWN_ACTION' } as any);
      expect(state).toEqual(initialState);
    });

    it('handles pause when promotion not in list', () => {
      const stateWithPromotions: PromotionState = {
        ...initialState,
        promotions: [mockPromotionList[1]],
      };
      const pausedPromotion: Promotion = { ...mockPromotion, status: 'paused' };
      const state = promotionReducer(stateWithPromotions, setPausePromotionSuccess(pausedPromotion));
      expect(state.promotions).toEqual([mockPromotionList[1]]);
    });

    it('handles delete when promotion not in list', () => {
      const stateWithPromotions: PromotionState = {
        ...initialState,
        promotions: [mockPromotionList[1]],
      };
      const state = promotionReducer(stateWithPromotions, setDeletePromotionSuccess('promo1'));
      expect(state.promotions).toEqual([mockPromotionList[1]]);
    });

    it('handles create success with no promotions added', () => {
      const state = promotionReducer(initialState, setCreatePromotionSuccess());
      expect(state.promotions).toEqual([]);
      expect(state.createLoading).toBe(false);
    });
  });
});
