import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type { ComboResponse as Combo } from 'src/types/gen/shared/shared/combos/combo';
import type {
  FilterCombo,
  SortCombo,
  CreateComboRequest,
  UpdateComboRequest,
} from 'src/types/gen/cms/cms/combos/combo';

/**
 * Combo State
 */
export interface ComboState {
  combos: Combo[];
  currentCombo: Combo | null;
  loading: boolean;
  currentComboLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: FilterCombo;
  sort: SortCombo[];
}

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

/**
 * Saga Action Payload Types
 */
export type GetCombosPayload = {
  page?: number;
  limit?: number;
  filters?: FilterCombo;
  sort?: SortCombo[];
  onSuccess?: () => void;
};

export type GetComboByIdPayload = {
  id: string;
  onSuccess?: (combo: Combo) => void;
};

export type CreateComboPayload = {
  data: CreateComboRequest;
  onSuccess?: (combo: Combo) => void;
};

export type UpdateComboPayload = {
  id: string;
  data: Omit<UpdateComboRequest, 'comboId'>;
  onSuccess?: (combo: Combo) => void;
};

export type DeleteComboPayload = {
  id: string;
  onSuccess?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getCombosRequest = createAction<GetCombosPayload>('combo/getCombosRequest');
export const getComboByIdRequest = createAction<GetComboByIdPayload>('combo/getComboByIdRequest');
export const createComboRequest = createAction<CreateComboPayload>('combo/createComboRequest');
export const updateComboRequest = createAction<UpdateComboPayload>('combo/updateComboRequest');
export const deleteComboRequest = createAction<DeleteComboPayload>('combo/deleteComboRequest');

/**
 * Combo Slice
 */
export const comboSlice = createSlice({
  name: 'combo',
  initialState,
  reducers: {
    // List combos
    setComboLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setCombosSuccess: (
      state,
      action: PayloadAction<{
        combos: Combo[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    ) => {
      state.combos = action.payload.combos;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },

    setComboError: (state) => {
      state.loading = false;
    },

    // Get single combo by ID
    setCurrentComboLoading: (state, action: PayloadAction<boolean>) => {
      state.currentComboLoading = action.payload;
    },

    setCurrentComboSuccess: (state, action: PayloadAction<Combo>) => {
      state.currentCombo = action.payload;
      state.currentComboLoading = false;
    },

    setCurrentComboError: (state) => {
      state.currentComboLoading = false;
    },

    clearCurrentCombo: (state) => {
      state.currentCombo = null;
    },

    // Create combo
    setCreateComboLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },

    setCreateComboSuccess: (state, action: PayloadAction<Combo>) => {
      state.combos.unshift(action.payload);
      state.createLoading = false;
    },

    setCreateComboError: (state) => {
      state.createLoading = false;
    },

    // Update combo
    setUpdateComboLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },

    setUpdateComboSuccess: (state, action: PayloadAction<Combo>) => {
      const index = state.combos.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.combos[index] = action.payload;
      }
      if (state.currentCombo?.id === action.payload.id) {
        state.currentCombo = action.payload;
      }
      state.updateLoading = false;
    },

    setUpdateComboError: (state) => {
      state.updateLoading = false;
    },

    // Delete combo
    setDeleteComboLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },

    setDeleteComboSuccess: (state, action: PayloadAction<string>) => {
      state.combos = state.combos.filter((c) => c.id !== action.payload);
      if (state.currentCombo?.id === action.payload) {
        state.currentCombo = null;
      }
      state.deleteLoading = false;
    },

    setDeleteComboError: (state) => {
      state.deleteLoading = false;
    },

    // Filters and sort
    setComboFilters: (state, action: PayloadAction<FilterCombo>) => {
      state.filters = action.payload;
    },

    setComboSort: (state, action: PayloadAction<SortCombo[]>) => {
      state.sort = action.payload;
    },

    // Reset state
    resetComboState: (state) => {
      state.combos = [];
      state.loading = false;
      state.pagination = initialState.pagination;
      state.filters = {};
      state.sort = [];
    },
  },
});

export const {
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
} = comboSlice.actions;

/**
 * Selectors
 */
export const selectCombos = (state: { combo: ComboState }) => state.combo.combos;

export const selectCurrentCombo = (state: { combo: ComboState }) => state.combo.currentCombo;

export const selectComboLoading = (state: { combo: ComboState }) => state.combo.loading;

export const selectCurrentComboLoading = (state: { combo: ComboState }) =>
  state.combo.currentComboLoading;

export const selectCreateComboLoading = (state: { combo: ComboState }) => state.combo.createLoading;

export const selectUpdateComboLoading = (state: { combo: ComboState }) => state.combo.updateLoading;

export const selectDeleteComboLoading = (state: { combo: ComboState }) => state.combo.deleteLoading;

export const selectComboPagination = (state: { combo: ComboState }) => state.combo.pagination;

export const selectComboFilters = (state: { combo: ComboState }) => state.combo.filters;

export const selectComboSort = (state: { combo: ComboState }) => state.combo.sort;

export default comboSlice.reducer;
