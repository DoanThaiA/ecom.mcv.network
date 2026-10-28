import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type { ProductInventory } from 'src/types/product-inventories';
import type {
  FilterProductInventory,
  SortProductInventory,
} from 'src/types/gen/shared/shared/product-inventories/product-inventory';

// Type aliases for cleaner code
type InventoryItem = ProductInventory;
type InventoryFilters = FilterProductInventory;
type InventorySort = SortProductInventory;

/**
 * Inventory State
 */
export interface InventoryState {
  inventories: InventoryItem[];
  currentInventory: InventoryItem | null;
  loading: boolean;
  currentInventoryLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: InventoryFilters;
  sort: InventorySort[];
}

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

/**
 * Saga Action Payload Types
 */
export type GetInventoriesPayload = {
  page?: number;
  limit?: number;
  filters?: InventoryFilters;
  sort?: InventorySort[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export type GetInventoryByIdPayload = {
  id: string;
  onSuccess?: (inventory: InventoryItem) => void;
  onError?: (error: string) => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getInventoriesRequest = createAction<GetInventoriesPayload>(
  'inventory/getInventoriesRequest'
);
export const getInventoryByIdRequest = createAction<GetInventoryByIdPayload>(
  'inventory/getInventoryByIdRequest'
);

/**
 * Inventory Slice
 */
export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventoryLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setInventoriesSuccess: (
      state,
      action: PayloadAction<{
        inventories: InventoryItem[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    ) => {
      state.inventories = action.payload.inventories;
      state.pagination = action.payload.pagination;
      state.loading = false;
      state.error = null;
    },

    setInventoryError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    setCurrentInventoryLoading: (state, action: PayloadAction<boolean>) => {
      state.currentInventoryLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setCurrentInventorySuccess: (state, action: PayloadAction<InventoryItem>) => {
      state.currentInventory = action.payload;
      state.currentInventoryLoading = false;
      state.error = null;
    },

    setCurrentInventoryError: (state, action: PayloadAction<string>) => {
      state.currentInventoryLoading = false;
      state.error = action.payload;
    },

    clearCurrentInventory: (state) => {
      state.currentInventory = null;
    },

    clearInventoryError: (state) => {
      state.error = null;
    },

    setInventoryFilters: (state, action: PayloadAction<InventoryFilters>) => {
      state.filters = action.payload;
    },

    setInventorySort: (state, action: PayloadAction<InventorySort[]>) => {
      state.sort = action.payload;
    },

    resetInventoryState: (state) => {
      state.inventories = [];
      state.loading = false;
      state.error = null;
      state.pagination = initialState.pagination;
      state.filters = {};
      state.sort = [];
    },
  },
});

export const {
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
} = inventorySlice.actions;

/**
 * Selectors
 */
export const selectInventories = (state: { inventory: InventoryState }) =>
  state.inventory.inventories;

export const selectCurrentInventory = (state: { inventory: InventoryState }) =>
  state.inventory.currentInventory;

export const selectInventoryLoading = (state: { inventory: InventoryState }) =>
  state.inventory.loading;

export const selectCurrentInventoryLoading = (state: { inventory: InventoryState }) =>
  state.inventory.currentInventoryLoading;

export const selectInventoryError = (state: { inventory: InventoryState }) => state.inventory.error;

export const selectInventoryPagination = (state: { inventory: InventoryState }) =>
  state.inventory.pagination;

export const selectInventoryFilters = (state: { inventory: InventoryState }) =>
  state.inventory.filters;

export const selectInventorySort = (state: { inventory: InventoryState }) => state.inventory.sort;

export default inventorySlice.reducer;
