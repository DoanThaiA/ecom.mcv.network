import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type { Product } from '@/types/gen/shared/shared/products/product';
import type { ShopQueryProduct } from '@/types/gen/shop/shop/products/product';
import type { GetProductsResponse } from '@/types/product';

/**
 * Payload type for fetch products request
 */
export type FetchProductsByCategoryPayload = ShopQueryProduct & {
  append?: boolean;
};

/**
 * Payload type for set success action
 */
export type SetSuccessPayload = {
  response: GetProductsResponse;
  append: boolean;
};

/**
 * Products By Category State
 */
export interface ProductsByCategoryState {
  products: Product[];
  loading: boolean;
  query: ShopQueryProduct;
  pagination: Omit<GetProductsResponse, 'data'>;
}

const initialState: ProductsByCategoryState = {
  products: [],
  loading: false,
  query: {
    page: 1,
    limit: 12,
    filters: undefined,
    sort: undefined,
  },
  pagination: {
    hasNextPage: false,
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  },
};

/**
 * Saga Actions
 */
export const fetchProductsByCategoryRequest = createAction<FetchProductsByCategoryPayload>(
  'productsByCategory/fetchProductsByCategoryRequest'
);

/**
 * Slice
 */
export const productsByCategorySlice = createSlice({
  name: 'productsByCategory',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setSuccess: (state, action: PayloadAction<SetSuccessPayload>) => {
      const { response, append } = action.payload;

      if (append) {
        state.products = [...state.products, ...response.data];
      } else {
        state.products = response.data;
      }

      state.pagination = {
        hasNextPage: response.hasNextPage,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      };
      state.loading = false;
    },

    setQuery: (state, action: PayloadAction<ShopQueryProduct>) => {
      state.query = action.payload;
    },

    resetState: () => initialState,
  },
});

export const {
  setLoading,
  setSuccess,
  setQuery,
  resetState,
} = productsByCategorySlice.actions;

/**
 * Selectors
 */
export const selectProductsByCategoryItems = (state: { productsByCategory: ProductsByCategoryState }) =>
  state.productsByCategory.products;

export const selectProductsByCategoryLoading = (state: { productsByCategory: ProductsByCategoryState }) =>
  state.productsByCategory.loading;

export const selectProductsByCategoryQuery = (state: { productsByCategory: ProductsByCategoryState }) =>
  state.productsByCategory.query;

export const selectProductsByCategoryPagination = (state: { productsByCategory: ProductsByCategoryState }) =>
  state.productsByCategory.pagination;

export default productsByCategorySlice.reducer;
