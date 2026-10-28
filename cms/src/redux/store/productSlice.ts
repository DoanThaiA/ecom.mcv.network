import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import { GetInventoriesResponse, UpdateProductPayload, BulkHideProductItem } from 'src/types';
import { Product } from 'src/types/gen/shared/shared/products/product';
import { FilterProduct, SortProduct } from 'src/types/gen/cms/cms/products/product-query';

/**
 * Product State
 */
export interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  currentProductInventory: GetInventoriesResponse | null;
  loading: boolean;
  currentProductLoading: boolean;
  inventoryLoading: boolean;
  updateProductLoading: boolean;
  toggleStatusLoading: Record<string, boolean>;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: FilterProduct;
  sort: SortProduct[];
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  currentProductInventory: null,
  loading: false,
  currentProductLoading: false,
  inventoryLoading: false,
  updateProductLoading: false,
  toggleStatusLoading: {},
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: { categoryIds: [], productIds: [] },
  sort: [],
};

/**
 * Saga Action Payload Types
 */
export type GetProductsPayload = {
  page?: number;
  limit?: number;
  filters?: FilterProduct;
  sort?: SortProduct[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export type GetProductByIdPayload = {
  id: string;
  onSuccess?: (product: Product) => void;
  onError?: (error: string) => void;
};

export type GetProductInventoryPayload = {
  id: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export type ToggleProductStatusPayload = {
  items: BulkHideProductItem[];
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getProductsRequest = createAction<GetProductsPayload>('product/getProductsRequest');
export const getProductByIdRequest = createAction<GetProductByIdPayload>(
  'product/getProductByIdRequest'
);
export const getProductInventoryRequest = createAction<GetProductInventoryPayload>(
  'product/getProductInventoryRequest'
);
export const updateProductRequest = createAction<UpdateProductPayload>(
  'product/updateProductRequest'
);
export const toggleProductStatusRequest = createAction<ToggleProductStatusPayload>(
  'product/toggleProductStatusRequest'
);

/**
 * Product Slice
 */
export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProductLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setProductsSuccess: (
      state,
      action: PayloadAction<{
        products: Product[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    ) => {
      state.products = action.payload.products;
      state.pagination = action.payload.pagination;
      state.loading = false;
      state.error = null;
    },

    setProductError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    setCurrentProductLoading: (state, action: PayloadAction<boolean>) => {
      state.currentProductLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setCurrentProductSuccess: (state, action: PayloadAction<Product>) => {
      state.currentProduct = action.payload;
      state.currentProductLoading = false;
      state.error = null;
    },

    setCurrentProductError: (state, action: PayloadAction<string>) => {
      state.currentProductLoading = false;
      state.error = action.payload;
    },

    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.currentProductInventory = null;
    },

    setInventoryLoading: (state, action: PayloadAction<boolean>) => {
      state.inventoryLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setInventorySuccess: (state, action: PayloadAction<GetInventoriesResponse>) => {
      state.currentProductInventory = action.payload;
      state.inventoryLoading = false;
      state.error = null;
    },

    setInventoryError: (state, action: PayloadAction<string>) => {
      state.inventoryLoading = false;
      state.error = action.payload;
    },

    setUpdateProductLoading: (state, action: PayloadAction<boolean>) => {
      state.updateProductLoading = action.payload;
    },

    updateProductSuccess: (state, action: PayloadAction<Product>) => {
      state.currentProduct = action.payload;
      state.updateProductLoading = false;
    },

    clearProductError: (state) => {
      state.error = null;
    },

    setProductFilters: (state, action: PayloadAction<FilterProduct>) => {
      state.filters = action.payload;
    },

    setProductSort: (state, action: PayloadAction<SortProduct[]>) => {
      state.sort = action.payload;
    },

    resetProductState: (state) => {
      state.products = [];
      state.loading = false;
      state.error = null;
      state.pagination = initialState.pagination;
      state.filters = { categoryIds: [], productIds: [] };
      state.sort = [];
    },

    updateProductInList: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },

    updateProductsHiddenStatus: (state, action: PayloadAction<BulkHideProductItem[]>) => {
      for (const item of action.payload) {
        const index = state.products.findIndex((p) => p.id === item.productId);
        if (index !== -1) {
          state.products[index] = { ...state.products[index], hide: item.hide };
        }
      }
    },

    setToggleStatusLoading: (state, action: PayloadAction<{ id: string; loading: boolean }>) => {
      if (action.payload.loading) {
        state.toggleStatusLoading[action.payload.id] = true;
      } else {
        delete state.toggleStatusLoading[action.payload.id];
      }
    },
  },
});

export const {
  setProductLoading,
  setProductsSuccess,
  setProductError,
  setCurrentProductLoading,
  setCurrentProductSuccess,
  setCurrentProductError,
  clearCurrentProduct,
  setInventoryLoading,
  setInventorySuccess,
  setInventoryError,
  setUpdateProductLoading,
  updateProductSuccess,
  clearProductError,
  setProductFilters,
  setProductSort,
  resetProductState,
  updateProductInList,
  updateProductsHiddenStatus,
  setToggleStatusLoading,
} = productSlice.actions;

/**
 * Selectors
 */
export const selectProducts = (state: { product: ProductState }) => state.product.products;

export const selectCurrentProduct = (state: { product: ProductState }) =>
  state.product.currentProduct;

export const selectProductLoading = (state: { product: ProductState }) => state.product.loading;

export const selectCurrentProductLoading = (state: { product: ProductState }) =>
  state.product.currentProductLoading;

export const selectProductError = (state: { product: ProductState }) => state.product.error;

export const selectProductPagination = (state: { product: ProductState }) =>
  state.product.pagination;

export const selectProductFilters = (state: { product: ProductState }) => state.product.filters;

export const selectProductSort = (state: { product: ProductState }) => state.product.sort;

export const selectProductInventory = (state: { product: ProductState }) =>
  state.product.currentProductInventory;

export const selectInventoryLoading = (state: { product: ProductState }) =>
  state.product.inventoryLoading;

export const selectUpdateProductLoading = (state: { product: ProductState }) =>
  state.product.updateProductLoading;

export const selectToggleStatusLoading = (state: { product: ProductState }) =>
  state.product.toggleStatusLoading;

export default productSlice.reducer;
