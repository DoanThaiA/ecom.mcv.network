import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types/gen/shared/shared/products/product';

export interface FlashSaleState {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;

  loading: boolean;
  error: string | null;
}

const initialState: FlashSaleState = {
  items: [],
  total: 0,
  page: 1,
  limit: 0,
  totalPages: 0,
  hasNextPage: false,

  loading: false,
  error: null,
};

// Define payload types
export type GetFlashSaleDataPayload = {
  page?: number;
  limit?: number;
  topicId?: string;
  categoryId?: string; // Backward compatible - single category ID
  categoryIds?: string[]; // Multiple category IDs
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[]; // For client-side filtering (API doesn't support)
  colors?: string[]; // For client-side filtering (API doesn't support)
  append?: boolean; // Append products instead of replacing
};

export type GetFlashSaleDataSuccessPayload = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  append?: boolean; // Whether to append or replace products
};

// Create actions
export const getFlashSaleDataRequest = createAction<GetFlashSaleDataPayload>(
  'flashSale/getDataRequest'
);

const flashSaleSlice = createSlice({
  name: 'flashSale',
  initialState,
  reducers: {
    getFlashSaleDataSuccess: (
      state,
      action: PayloadAction<GetFlashSaleDataSuccessPayload>
    ) => {
      state.loading = false;
      // Append products if append flag is true, otherwise replace
      if (action.payload.append) {
        // Dedupe by product ID to avoid duplicates
        const existingIds = new Set(state.items.map((p) => p.id));
        const newProducts = action.payload.products.filter(
          (p) => !existingIds.has(p.id)
        );
        state.items = [...state.items, ...newProducts];
      } else {
        state.items = action.payload.products;
      }
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.totalPages = action.payload.totalPages;
      state.hasNextPage = action.payload.hasNextPage;
      state.error = null;
    },
    getFlashSaleDataFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getFlashSaleDataRequest, (state) => {
      state.loading = true;
      state.error = null;
    });
  },
});

export const { getFlashSaleDataSuccess, getFlashSaleDataFailure } =
  flashSaleSlice.actions;

// Selectors
export const selectFlashSaleItems = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.items;
export const selectFlashSaleTotal = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.total;

export const selectFlashSaleLoading = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.loading;
export const selectFlashSaleError = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.error;
export const selectFlashSalePagination = (state: {
  flashSale: FlashSaleState;
}) => ({
  page: state.flashSale.page,
  limit: state.flashSale.limit,
  totalPages: state.flashSale.totalPages,
  hasNextPage: state.flashSale.hasNextPage,
  total: state.flashSale.total,
});

export default flashSaleSlice.reducer;
