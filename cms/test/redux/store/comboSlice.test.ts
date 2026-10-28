import { describe, it, expect, beforeEach } from 'vitest';
import {
  comboSlice,
  setComboLoading,
  setCombosSuccess,
  setComboError,
  setCurrentComboLoading,
  setCurrentComboSuccess,
  setCurrentComboError,
  clearCurrentCombo,
  setCreateComboLoading,
  setCreateComboSuccess,
  setCreateComboError,
  setUpdateComboLoading,
  setUpdateComboSuccess,
  setUpdateComboError,
  setDeleteComboLoading,
  setDeleteComboSuccess,
  setDeleteComboError,
  setComboFilters,
  setComboSort,
  resetComboState,
  getCombosRequest,
  getComboByIdRequest,
  createComboRequest,
  updateComboRequest,
  deleteComboRequest,
  selectCombos,
  selectCurrentCombo,
  selectComboLoading,
  selectCurrentComboLoading,
  selectCreateComboLoading,
  selectUpdateComboLoading,
  selectDeleteComboLoading,
  selectComboPagination,
  selectComboFilters,
  selectComboSort,
  type ComboState,
} from 'src/redux/store/comboSlice';
import type { ComboResponse as Combo } from 'src/types/gen/shared/shared/combos/combo';

describe('comboSlice', () => {
  const comboReducer = comboSlice.reducer;

  const initialState: ComboState = {
    combos: [],
    currentCombo: null,
    loading: false,
    currentComboLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: {},
    sort: [],
  };

  const mockCombo: Combo = {
    id: 'combo1',
    name: 'Combo A',
    description: 'Test combo',
    price: 100,
    isActive: true,
  } as Combo;

  const mockComboList: Combo[] = [
    mockCombo,
    {
      id: 'combo2',
      name: 'Combo B',
      description: 'Another combo',
      price: 200,
      isActive: false,
    } as Combo,
  ];

  beforeEach(() => {
    // Reset to initial state before each test
  });

  describe('reducers', () => {
    describe('setComboLoading', () => {
      it('sets loading to true', () => {
        const state = comboReducer(initialState, setComboLoading(true));
        expect(state.loading).toBe(true);
      });

      it('sets loading to false', () => {
        const stateWithLoading: ComboState = {
          ...initialState,
          loading: true,
        };
        const state = comboReducer(stateWithLoading, setComboLoading(false));
        expect(state.loading).toBe(false);
      });
    });

    describe('setCombosSuccess', () => {
      it('sets combos and pagination and stops loading', () => {
        const stateWithLoading: ComboState = {
          ...initialState,
          loading: true,
        };
        const state = comboReducer(
          stateWithLoading,
          setCombosSuccess({
            combos: mockComboList,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
          })
        );
        expect(state.combos).toEqual(mockComboList);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
        expect(state.loading).toBe(false);
      });
    });

    describe('setComboError', () => {
      it('stops loading', () => {
        const stateWithLoading: ComboState = {
          ...initialState,
          loading: true,
        };
        const state = comboReducer(stateWithLoading, setComboError());
        expect(state.loading).toBe(false);
      });
    });

    describe('setCurrentComboLoading', () => {
      it('sets current loading to true', () => {
        const state = comboReducer(initialState, setCurrentComboLoading(true));
        expect(state.currentComboLoading).toBe(true);
      });

      it('sets current loading to false', () => {
        const stateWithLoading: ComboState = {
          ...initialState,
          currentComboLoading: true,
        };
        const state = comboReducer(stateWithLoading, setCurrentComboLoading(false));
        expect(state.currentComboLoading).toBe(false);
      });
    });

    describe('setCurrentComboSuccess', () => {
      it('sets current combo and stops loading', () => {
        const stateWithLoading: ComboState = {
          ...initialState,
          currentComboLoading: true,
        };
        const state = comboReducer(stateWithLoading, setCurrentComboSuccess(mockCombo));
        expect(state.currentCombo).toEqual(mockCombo);
        expect(state.currentComboLoading).toBe(false);
      });
    });

    describe('setCurrentComboError', () => {
      it('stops current loading', () => {
        const stateWithLoading: ComboState = {
          ...initialState,
          currentComboLoading: true,
        };
        const state = comboReducer(stateWithLoading, setCurrentComboError());
        expect(state.currentComboLoading).toBe(false);
      });
    });

    describe('clearCurrentCombo', () => {
      it('clears current combo', () => {
        const stateWithCombo: ComboState = {
          ...initialState,
          currentCombo: mockCombo,
        };
        const state = comboReducer(stateWithCombo, clearCurrentCombo());
        expect(state.currentCombo).toBe(null);
      });
    });

    describe('setCreateComboLoading', () => {
      it('sets create loading to true', () => {
        const state = comboReducer(initialState, setCreateComboLoading(true));
        expect(state.createLoading).toBe(true);
      });

      it('sets create loading to false', () => {
        const stateWithLoading: ComboState = {
          ...initialState,
          createLoading: true,
        };
        const state = comboReducer(stateWithLoading, setCreateComboLoading(false));
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setCreateComboSuccess', () => {
      it('adds new combo to start of list and stops loading', () => {
        const stateWithCombo: ComboState = {
          ...initialState,
          combos: [mockComboList[1]],
          createLoading: true,
        };
        const state = comboReducer(stateWithCombo, setCreateComboSuccess(mockCombo));
        expect(state.combos).toEqual([mockCombo, mockComboList[1]]);
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setCreateComboError', () => {
      it('stops create loading', () => {
        const stateWithLoading: ComboState = {
          ...initialState,
          createLoading: true,
        };
        const state = comboReducer(stateWithLoading, setCreateComboError());
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setUpdateComboLoading', () => {
      it('sets update loading to true', () => {
        const state = comboReducer(initialState, setUpdateComboLoading(true));
        expect(state.updateLoading).toBe(true);
      });

      it('sets update loading to false', () => {
        const stateWithLoading: ComboState = {
          ...initialState,
          updateLoading: true,
        };
        const state = comboReducer(stateWithLoading, setUpdateComboLoading(false));
        expect(state.updateLoading).toBe(false);
      });
    });

    describe('setUpdateComboSuccess', () => {
      it('updates combo in list and stops loading', () => {
        const stateWithCombos: ComboState = {
          ...initialState,
          combos: mockComboList,
          updateLoading: true,
        };
        const updatedCombo: Combo = { ...mockCombo, name: 'Updated Combo' };
        const state = comboReducer(stateWithCombos, setUpdateComboSuccess(updatedCombo));
        expect(state.combos[0].name).toBe('Updated Combo');
        expect(state.updateLoading).toBe(false);
      });

      it('updates current combo if id matches', () => {
        const stateWithCurrent: ComboState = {
          ...initialState,
          combos: mockComboList,
          currentCombo: mockCombo,
          updateLoading: true,
        };
        const updatedCombo: Combo = { ...mockCombo, name: 'Updated Combo' };
        const state = comboReducer(stateWithCurrent, setUpdateComboSuccess(updatedCombo));
        expect(state.currentCombo?.name).toBe('Updated Combo');
      });

      it('does not update current combo if id does not match', () => {
        const stateWithCurrent: ComboState = {
          ...initialState,
          combos: mockComboList,
          currentCombo: mockComboList[1],
          updateLoading: true,
        };
        const updatedCombo: Combo = { ...mockCombo, name: 'Updated Combo' };
        const state = comboReducer(stateWithCurrent, setUpdateComboSuccess(updatedCombo));
        expect(state.currentCombo?.id).toBe('combo2');
        expect(state.currentCombo?.name).toBe('Combo B');
      });
    });

    describe('setUpdateComboError', () => {
      it('stops update loading', () => {
        const stateWithLoading: ComboState = {
          ...initialState,
          updateLoading: true,
        };
        const state = comboReducer(stateWithLoading, setUpdateComboError());
        expect(state.updateLoading).toBe(false);
      });
    });

    describe('setDeleteComboLoading', () => {
      it('sets delete loading to true', () => {
        const state = comboReducer(initialState, setDeleteComboLoading(true));
        expect(state.deleteLoading).toBe(true);
      });

      it('sets delete loading to false', () => {
        const stateWithLoading: ComboState = {
          ...initialState,
          deleteLoading: true,
        };
        const state = comboReducer(stateWithLoading, setDeleteComboLoading(false));
        expect(state.deleteLoading).toBe(false);
      });
    });

    describe('setDeleteComboSuccess', () => {
      it('removes combo from list and stops loading', () => {
        const stateWithCombos: ComboState = {
          ...initialState,
          combos: mockComboList,
          deleteLoading: true,
        };
        const state = comboReducer(stateWithCombos, setDeleteComboSuccess('combo1'));
        expect(state.combos).toEqual([mockComboList[1]]);
        expect(state.deleteLoading).toBe(false);
      });

      it('clears current combo if id matches', () => {
        const stateWithCurrent: ComboState = {
          ...initialState,
          combos: mockComboList,
          currentCombo: mockCombo,
          deleteLoading: true,
        };
        const state = comboReducer(stateWithCurrent, setDeleteComboSuccess('combo1'));
        expect(state.currentCombo).toBe(null);
      });

      it('does not clear current combo if id does not match', () => {
        const stateWithCurrent: ComboState = {
          ...initialState,
          combos: mockComboList,
          currentCombo: mockComboList[1],
          deleteLoading: true,
        };
        const state = comboReducer(stateWithCurrent, setDeleteComboSuccess('combo1'));
        expect(state.currentCombo?.id).toBe('combo2');
      });
    });

    describe('setDeleteComboError', () => {
      it('stops delete loading', () => {
        const stateWithLoading: ComboState = {
          ...initialState,
          deleteLoading: true,
        };
        const state = comboReducer(stateWithLoading, setDeleteComboError());
        expect(state.deleteLoading).toBe(false);
      });
    });

    describe('setComboFilters', () => {
      it('sets filter values', () => {
        const state = comboReducer(initialState, setComboFilters({ isActive: true }));
        expect(state.filters).toEqual({ isActive: true });
      });

      it('replaces existing filters', () => {
        const stateWithFilters: ComboState = {
          ...initialState,
          filters: { isActive: true },
        };
        const state = comboReducer(stateWithFilters, setComboFilters({ name: 'Test' }));
        expect(state.filters).toEqual({ name: 'Test' });
      });
    });

    describe('setComboSort', () => {
      it('sets sort values', () => {
        const state = comboReducer(initialState, setComboSort([{ field: 'name', order: 1 }]));
        expect(state.sort).toEqual([{ field: 'name', order: 1 }]);
      });

      it('replaces existing sort', () => {
        const stateWithSort: ComboState = {
          ...initialState,
          sort: [{ field: 'name', order: 1 }],
        };
        const state = comboReducer(stateWithSort, setComboSort([{ field: 'price', order: -1 }]));
        expect(state.sort).toEqual([{ field: 'price', order: -1 }]);
      });

      it('sets sort to empty array', () => {
        const stateWithSort: ComboState = {
          ...initialState,
          sort: [{ field: 'name', order: 1 }],
        };
        const state = comboReducer(stateWithSort, setComboSort([]));
        expect(state.sort).toEqual([]);
      });
    });

    describe('resetComboState', () => {
      it('resets combos, loading, pagination, filters, and sort', () => {
        const stateWithData: ComboState = {
          ...initialState,
          combos: mockComboList,
          loading: true,
          pagination: { page: 5, limit: 20, total: 100, totalPages: 5 },
          filters: { isActive: true },
          sort: [{ field: 'name', order: 1 }],
          currentCombo: mockCombo,
        };
        const state = comboReducer(stateWithData, resetComboState());
        expect(state.combos).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
        expect(state.filters).toEqual({});
        expect(state.sort).toEqual([]);
      });

      it('does not reset current combo and loading states', () => {
        const stateWithData: ComboState = {
          ...initialState,
          currentCombo: mockCombo,
          currentComboLoading: true,
          createLoading: true,
          updateLoading: true,
          deleteLoading: true,
        };
        const state = comboReducer(stateWithData, resetComboState());
        expect(state.currentCombo).toEqual(mockCombo);
        expect(state.currentComboLoading).toBe(true);
        expect(state.createLoading).toBe(true);
        expect(state.updateLoading).toBe(true);
        expect(state.deleteLoading).toBe(true);
      });
    });
  });

  describe('saga actions', () => {
    describe('getCombosRequest', () => {
      it('creates correct action type', () => {
        const action = getCombosRequest({
          page: 1,
          limit: 10,
        });
        expect(action.type).toBe('combo/getCombosRequest');
      });

      it('includes pagination in payload', () => {
        const action = getCombosRequest({
          page: 2,
          limit: 20,
        });
        expect(action.payload.page).toBe(2);
        expect(action.payload.limit).toBe(20);
      });

      it('includes filters in payload', () => {
        const action = getCombosRequest({
          filters: { isActive: true },
        });
        expect(action.payload.filters).toEqual({ isActive: true });
      });

      it('includes sort in payload', () => {
        const action = getCombosRequest({
          sort: [{ field: 'name', order: 1 }],
        });
        expect(action.payload.sort).toEqual([{ field: 'name', order: 1 }]);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = getCombosRequest({ onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('getComboByIdRequest', () => {
      it('creates correct action type', () => {
        const action = getComboByIdRequest({ id: 'combo1' });
        expect(action.type).toBe('combo/getComboByIdRequest');
      });

      it('includes id in payload', () => {
        const action = getComboByIdRequest({ id: 'combo1' });
        expect(action.payload.id).toBe('combo1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = getComboByIdRequest({ id: 'combo1', onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('createComboRequest', () => {
      it('creates correct action type', () => {
        const action = createComboRequest({
          data: { name: 'New Combo', price: 150 } as any,
        });
        expect(action.type).toBe('combo/createComboRequest');
      });

      it('includes data in payload', () => {
        const data = { name: 'New Combo', price: 150 } as any;
        const action = createComboRequest({ data });
        expect(action.payload.data).toEqual(data);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = createComboRequest({
          data: { name: 'New Combo' } as any,
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('updateComboRequest', () => {
      it('creates correct action type', () => {
        const action = updateComboRequest({
          id: 'combo1',
          data: { name: 'Updated Combo' },
        });
        expect(action.type).toBe('combo/updateComboRequest');
      });

      it('includes id and data in payload', () => {
        const action = updateComboRequest({
          id: 'combo1',
          data: { name: 'Updated Combo' },
        });
        expect(action.payload.id).toBe('combo1');
        expect(action.payload.data).toEqual({ name: 'Updated Combo' });
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = updateComboRequest({
          id: 'combo1',
          data: { name: 'Updated' },
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('deleteComboRequest', () => {
      it('creates correct action type', () => {
        const action = deleteComboRequest({ id: 'combo1' });
        expect(action.type).toBe('combo/deleteComboRequest');
      });

      it('includes id in payload', () => {
        const action = deleteComboRequest({ id: 'combo1' });
        expect(action.payload.id).toBe('combo1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = deleteComboRequest({ id: 'combo1', onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });
  });

  describe('selectors', () => {
    describe('selectCombos', () => {
      it('returns empty array for initial state', () => {
        expect(selectCombos({ combo: initialState })).toEqual([]);
      });

      it('returns combos when present', () => {
        const state: ComboState = { ...initialState, combos: mockComboList };
        expect(selectCombos({ combo: state })).toEqual(mockComboList);
      });
    });

    describe('selectCurrentCombo', () => {
      it('returns null for initial state', () => {
        expect(selectCurrentCombo({ combo: initialState })).toBe(null);
      });

      it('returns current combo when present', () => {
        const state: ComboState = { ...initialState, currentCombo: mockCombo };
        expect(selectCurrentCombo({ combo: state })).toEqual(mockCombo);
      });
    });

    describe('selectComboLoading', () => {
      it('returns false for initial state', () => {
        expect(selectComboLoading({ combo: initialState })).toBe(false);
      });

      it('returns true when loading', () => {
        const state: ComboState = { ...initialState, loading: true };
        expect(selectComboLoading({ combo: state })).toBe(true);
      });
    });

    describe('selectCurrentComboLoading', () => {
      it('returns false for initial state', () => {
        expect(selectCurrentComboLoading({ combo: initialState })).toBe(false);
      });

      it('returns true when loading current', () => {
        const state: ComboState = { ...initialState, currentComboLoading: true };
        expect(selectCurrentComboLoading({ combo: state })).toBe(true);
      });
    });

    describe('selectCreateComboLoading', () => {
      it('returns false for initial state', () => {
        expect(selectCreateComboLoading({ combo: initialState })).toBe(false);
      });

      it('returns true when creating', () => {
        const state: ComboState = { ...initialState, createLoading: true };
        expect(selectCreateComboLoading({ combo: state })).toBe(true);
      });
    });

    describe('selectUpdateComboLoading', () => {
      it('returns false for initial state', () => {
        expect(selectUpdateComboLoading({ combo: initialState })).toBe(false);
      });

      it('returns true when updating', () => {
        const state: ComboState = { ...initialState, updateLoading: true };
        expect(selectUpdateComboLoading({ combo: state })).toBe(true);
      });
    });

    describe('selectDeleteComboLoading', () => {
      it('returns false for initial state', () => {
        expect(selectDeleteComboLoading({ combo: initialState })).toBe(false);
      });

      it('returns true when deleting', () => {
        const state: ComboState = { ...initialState, deleteLoading: true };
        expect(selectDeleteComboLoading({ combo: state })).toBe(true);
      });
    });

    describe('selectComboPagination', () => {
      it('returns initial pagination for initial state', () => {
        expect(selectComboPagination({ combo: initialState })).toEqual({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      });

      it('returns current pagination', () => {
        const state: ComboState = {
          ...initialState,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        };
        expect(selectComboPagination({ combo: state })).toEqual({
          page: 2,
          limit: 20,
          total: 100,
          totalPages: 5,
        });
      });
    });

    describe('selectComboFilters', () => {
      it('returns empty object for initial state', () => {
        expect(selectComboFilters({ combo: initialState })).toEqual({});
      });

      it('returns current filters', () => {
        const state: ComboState = {
          ...initialState,
          filters: { isActive: true },
        };
        expect(selectComboFilters({ combo: state })).toEqual({ isActive: true });
      });
    });

    describe('selectComboSort', () => {
      it('returns empty array for initial state', () => {
        expect(selectComboSort({ combo: initialState })).toEqual([]);
      });

      it('returns current sort', () => {
        const state: ComboState = {
          ...initialState,
          sort: [{ field: 'name', order: 1 }],
        };
        expect(selectComboSort({ combo: state })).toEqual([{ field: 'name', order: 1 }]);
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete CRUD flow', () => {
      // Create
      let state = comboReducer(initialState, setCreateComboLoading(true));
      state = comboReducer(state, setCreateComboSuccess(mockCombo));
      expect(selectCombos({ combo: state })).toEqual([mockCombo]);
      expect(selectCreateComboLoading({ combo: state })).toBe(false);

      // Read
      state = comboReducer(state, setComboLoading(true));
      state = comboReducer(
        state,
        setCombosSuccess({
          combos: mockComboList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );
      expect(selectCombos({ combo: state })).toEqual(mockComboList);

      // Update
      state = comboReducer(state, setUpdateComboLoading(true));
      const updatedCombo: Combo = { ...mockCombo, name: 'Updated Combo' };
      state = comboReducer(state, setUpdateComboSuccess(updatedCombo));
      expect(selectCombos({ combo: state })[0].name).toBe('Updated Combo');
      expect(selectUpdateComboLoading({ combo: state })).toBe(false);

      // Delete
      state = comboReducer(state, setDeleteComboLoading(true));
      state = comboReducer(state, setDeleteComboSuccess('combo1'));
      expect(selectCombos({ combo: state })).toEqual([mockComboList[1]]);
      expect(selectDeleteComboLoading({ combo: state })).toBe(false);
    });

    it('handles independent loading states', () => {
      let state = comboReducer(initialState, setComboLoading(true));
      state = comboReducer(state, setCurrentComboLoading(true));
      state = comboReducer(state, setCreateComboLoading(true));
      state = comboReducer(state, setUpdateComboLoading(true));
      state = comboReducer(state, setDeleteComboLoading(true));

      expect(state.loading).toBe(true);
      expect(state.currentComboLoading).toBe(true);
      expect(state.createLoading).toBe(true);
      expect(state.updateLoading).toBe(true);
      expect(state.deleteLoading).toBe(true);

      // Each can be stopped independently
      state = comboReducer(state, setComboLoading(false));
      expect(state.loading).toBe(false);
      expect(state.currentComboLoading).toBe(true);
    });

    it('handles filter and sort flow', () => {
      // Set filters and sort
      let state = comboReducer(initialState, setComboFilters({ isActive: true }));
      state = comboReducer(state, setComboSort([{ field: 'name', order: 1 }]));

      // Fetch with filters
      state = comboReducer(state, setComboLoading(true));
      state = comboReducer(
        state,
        setCombosSuccess({
          combos: mockComboList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );

      expect(selectComboFilters({ combo: state })).toEqual({ isActive: true });
      expect(selectComboSort({ combo: state })).toEqual([{ field: 'name', order: 1 }]);
    });

    it('handles reset flow', () => {
      // Add data
      let state = comboReducer(
        initialState,
        setCombosSuccess({
          combos: mockComboList,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        })
      );
      state = comboReducer(state, setComboFilters({ isActive: true }));
      state = comboReducer(state, setComboSort([{ field: 'name', order: 1 }]));

      // Reset
      state = comboReducer(state, resetComboState());
      expect(selectCombos({ combo: state })).toEqual([]);
      expect(selectComboPagination({ combo: state })).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      expect(selectComboFilters({ combo: state })).toEqual({});
      expect(selectComboSort({ combo: state })).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = comboReducer(initialState, { type: 'UNKNOWN_ACTION' } as any);
      expect(state).toEqual(initialState);
    });

    it('handles update when combo not in list', () => {
      const stateWithCombos: ComboState = {
        ...initialState,
        combos: [mockComboList[1]],
      };
      const updatedCombo: Combo = { ...mockCombo, name: 'Updated Combo' };
      const state = comboReducer(stateWithCombos, setUpdateComboSuccess(updatedCombo));
      expect(state.combos).toEqual([mockComboList[1]]);
    });

    it('handles delete when combo not in list', () => {
      const stateWithCombos: ComboState = {
        ...initialState,
        combos: [mockComboList[1]],
      };
      const state = comboReducer(stateWithCombos, setDeleteComboSuccess('combo1'));
      expect(state.combos).toEqual([mockComboList[1]]);
    });

    it('handles create with empty list', () => {
      const state = comboReducer(initialState, setCreateComboSuccess(mockCombo));
      expect(state.combos).toEqual([mockCombo]);
    });
  });
});
