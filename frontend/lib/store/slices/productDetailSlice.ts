import type { Product } from '@/types/gen/shared/shared/products/product';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';

/**
 * Product Detail State
 */
export interface ProductDetailState {
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductDetailState = {
  currentProduct: null,
  loading: false,
  error: null,
};

/**
 * Saga Action Payload Types
 */
export type GetProductByIdPayload = {
  id: string;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getProductByIdRequest = createAction<GetProductByIdPayload>(
  'productDetail/getProductByIdRequest'
);

/**
 * Product Detail Slice
 */
export const productDetailSlice = createSlice({
  name: 'productDetail',
  initialState,
  reducers: {
    setCurrentProductLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setCurrentProductSuccess: (state, action: PayloadAction<Product>) => {
      state.currentProduct = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentProductError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.error = null;
    },
    resetProductDetailState: () => initialState,
  },
});

export const {
  setCurrentProductLoading,
  setCurrentProductSuccess,
  setCurrentProductError,
  clearCurrentProduct,
  resetProductDetailState,
} = productDetailSlice.actions;

/**
 * Selectors
 */
export const selectCurrentProduct = (state: {
  productDetail: ProductDetailState;
}) => state.productDetail.currentProduct;

export const selectCurrentProductLoading = (state: {
  productDetail: ProductDetailState;
}) => state.productDetail.loading;

export const selectCurrentProductError = (state: {
  productDetail: ProductDetailState;
}) => state.productDetail.error;

export default productDetailSlice.reducer;
