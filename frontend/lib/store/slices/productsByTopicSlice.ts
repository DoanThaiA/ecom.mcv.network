import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type { Product } from '@/types/gen/shared/shared/products/product';
import type { ShopQueryProduct } from '@/types/gen/shop/shop/products/product';
import type { GetProductsResponse } from '@/types/product';

/**
 * Payload type for fetch products request
 */
export type FetchProductsByTopicPayload = ShopQueryProduct & {
  append?: boolean;
};

/**
 * Payload type for set success action
 */
export type SetProductsByTopicSuccessPayload = {
  response: GetProductsResponse;
  append: boolean;
};

/**
 * Products By Topic State
 */
export interface ProductsByTopicState {
  products: Product[];
  loading: boolean;
  query: ShopQueryProduct;
  pagination: Omit<GetProductsResponse, 'data'>;
}

const initialState: ProductsByTopicState = {
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
export const fetchProductsByTopicRequest = createAction<FetchProductsByTopicPayload>(
  'productsByTopic/fetchProductsByTopicRequest'
);

/**
 * Slice
 */
export const productsByTopicSlice = createSlice({
  name: 'productsByTopic',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setSuccess: (state, action: PayloadAction<SetProductsByTopicSuccessPayload>) => {
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
} = productsByTopicSlice.actions;

/**
 * Selectors
 */
export const selectProductsByTopicItems = (state: { productsByTopic: ProductsByTopicState }) =>
  state.productsByTopic.products;

export const selectProductsByTopicLoading = (state: { productsByTopic: ProductsByTopicState }) =>
  state.productsByTopic.loading;

export const selectProductsByTopicQuery = (state: { productsByTopic: ProductsByTopicState }) =>
  state.productsByTopic.query;

export const selectProductsByTopicPagination = (state: { productsByTopic: ProductsByTopicState }) =>
  state.productsByTopic.pagination;

export default productsByTopicSlice.reducer;
