import type { Product } from '@/types/gen/shared/shared/products/product';
import type { ShopFilterProduct as FilterProduct, ShopSortProduct as SortProduct } from '@/types/gen/shop/shop/products/product';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';

/**
 * Product State
 */
export interface ProductState {
  // Products by section
  flashSaleProducts: Product[];
  topProducts: Product[];
  comboProducts: Product[];
  comboDealProducts: Product[];
  newProducts: Product[];

  // Loading states
  flashSaleLoading: boolean;
  topProductsLoading: boolean;
  comboProductsLoading: boolean;
  comboDealProductsLoading: boolean;
  newProductsLoading: boolean;

  // Pagination (optional - for future use)
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  filters: FilterProduct;
  sort?: SortProduct;
}

const initialState: ProductState = {
  flashSaleProducts: [],
  topProducts: [],
  comboProducts: [],
  comboDealProducts: [],
  newProducts: [],
  flashSaleLoading: false,
  topProductsLoading: false,
  comboProductsLoading: false,
  comboDealProductsLoading: false,
  newProductsLoading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: { categoryIds: [] },
  sort: undefined,
};

/**
 * Saga Action Payload Types
 */
export type GetProductsPayload = {
  page?: number;
  limit?: number;
  filters?: FilterProduct;
  sort?: SortProduct;
  section?:
    | 'flashSale'
    | 'topProducts'
    | 'comboProducts'
    | 'comboDeals'
    | 'newProducts';
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getProductsRequest = createAction<GetProductsPayload>(
  'product/getProductsRequest'
);

/**
 * Product Slice
 */
export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Flash Sale
    setFlashSaleLoading: (state, action: PayloadAction<boolean>) => {
      state.flashSaleLoading = action.payload;
    },
    setFlashSaleSuccess: (state, action: PayloadAction<Product[]>) => {
      state.flashSaleProducts = action.payload;
      state.flashSaleLoading = false;
    },

    // Top Products
    setTopProductsLoading: (state, action: PayloadAction<boolean>) => {
      state.topProductsLoading = action.payload;
    },
    setTopProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.topProducts = action.payload;
      state.topProductsLoading = false;
    },

    // Combo Products
    setComboProductsLoading: (state, action: PayloadAction<boolean>) => {
      state.comboProductsLoading = action.payload;
    },
    setComboProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.comboProducts = action.payload;
      state.comboProductsLoading = false;
    },

    // Combo Deal Products
    setComboDealProductsLoading: (state, action: PayloadAction<boolean>) => {
      state.comboDealProductsLoading = action.payload;
    },
    setComboDealProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.comboDealProducts = action.payload;
      state.comboDealProductsLoading = false;
    },

    // New Products
    setNewProductsLoading: (state, action: PayloadAction<boolean>) => {
      state.newProductsLoading = action.payload;
    },
    setNewProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.newProducts = action.payload;
      state.newProductsLoading = false;
    },

    setProductFilters: (state, action: PayloadAction<FilterProduct>) => {
      state.filters = action.payload;
    },

    setProductSort: (state, action: PayloadAction<SortProduct | undefined>) => {
      state.sort = action.payload;
    },

    resetProductState: (state) => {
      state.flashSaleProducts = [];
      state.topProducts = [];
      state.comboProducts = [];
      state.comboDealProducts = [];
      state.newProducts = [];
      state.flashSaleLoading = false;
      state.topProductsLoading = false;
      state.comboProductsLoading = false;
      state.comboDealProductsLoading = false;
      state.newProductsLoading = false;
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
      state.sort = undefined;
    },
  },
});

export const {
  setFlashSaleLoading,
  setFlashSaleSuccess,
  setTopProductsLoading,
  setTopProductsSuccess,
  setComboProductsLoading,
  setComboProductsSuccess,
  setComboDealProductsLoading,
  setComboDealProductsSuccess,
  setNewProductsLoading,
  setNewProductsSuccess,
  setProductFilters,
  setProductSort,
  resetProductState,
} = productSlice.actions;

/**
 * Selectors
 */
export const selectFlashSaleProducts = (state: { product: ProductState }) =>
  state.product.flashSaleProducts;
export const selectTopProducts = (state: { product: ProductState }) =>
  state.product.topProducts;
export const selectComboProducts = (state: { product: ProductState }) =>
  state.product.comboProducts;
export const selectComboDealProducts = (state: { product: ProductState }) =>
  state.product.comboDealProducts;
export const selectNewProducts = (state: { product: ProductState }) =>
  state.product.newProducts;

export const selectFlashSaleLoading = (state: { product: ProductState }) =>
  state.product.flashSaleLoading;
export const selectTopProductsLoading = (state: { product: ProductState }) =>
  state.product.topProductsLoading;
export const selectComboProductsLoading = (state: { product: ProductState }) =>
  state.product.comboProductsLoading;
export const selectComboDealProductsLoading = (state: {
  product: ProductState;
}) => state.product.comboDealProductsLoading;
export const selectNewProductsLoading = (state: { product: ProductState }) =>
  state.product.newProductsLoading;

export const selectProductPagination = (state: { product: ProductState }) =>
  state.product.pagination;

export const selectProductFilters = (state: { product: ProductState }) =>
  state.product.filters;

export const selectProductSort = (state: { product: ProductState }) =>
  state.product.sort;

export default productSlice.reducer;
