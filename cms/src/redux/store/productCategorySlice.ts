import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type {
  ProductCategory,
  FilterProductCategory,
  SortProductCategory,
} from 'src/types/gen/shared/shared/product-categories/product-category';
import type { UpdateProductCategoryLocalizationRequest } from 'src/types/gen/cms/cms/product-categories/product-category';

/**
 * Product Category State
 */
export interface ProductCategoryState {
  productCategories: ProductCategory[];
  currentProductCategory: ProductCategory | null;
  loading: boolean;
  currentProductCategoryLoading: boolean;
  updateLoading: boolean;
  filters: FilterProductCategory;
  sort: SortProductCategory[];
}

const initialState: ProductCategoryState = {
  productCategories: [],
  currentProductCategory: null,
  loading: false,
  currentProductCategoryLoading: false,
  updateLoading: false,
  filters: {},
  sort: [],
};

/**
 * Saga Action Payload Types
 */
export type GetProductCategoriesPayload = {
  page?: number;
  limit?: number;
  filters?: FilterProductCategory;
  sort?: SortProductCategory[];
};

export type GetProductCategoryByIdPayload = {
  id: string;
};

export type UpdateProductCategoryLocalizationPayload = {
  data: UpdateProductCategoryLocalizationRequest;
  onSuccess?: (category: ProductCategory) => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getProductCategoriesRequest = createAction<GetProductCategoriesPayload>(
  'productCategory/getProductCategoriesRequest'
);
export const getProductCategoryByIdRequest = createAction<GetProductCategoryByIdPayload>(
  'productCategory/getProductCategoryByIdRequest'
);
export const updateProductCategoryLocalizationRequest =
  createAction<UpdateProductCategoryLocalizationPayload>(
    'productCategory/updateProductCategoryLocalizationRequest'
  );

/**
 * Product Category Slice
 */
export const productCategorySlice = createSlice({
  name: 'productCategory',
  initialState,
  reducers: {
    setProductCategoryLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setProductCategoriesSuccess: (
      state,
      action: PayloadAction<{
        productCategories: ProductCategory[];
      }>
    ) => {
      state.productCategories = action.payload.productCategories;
      state.loading = false;
    },

    setProductCategoryFailure: (state) => {
      state.loading = false;
    },

    setCurrentProductCategoryLoading: (state, action: PayloadAction<boolean>) => {
      state.currentProductCategoryLoading = action.payload;
    },

    setCurrentProductCategorySuccess: (state, action: PayloadAction<ProductCategory>) => {
      state.currentProductCategory = action.payload;
      state.currentProductCategoryLoading = false;
    },

    setCurrentProductCategoryFailure: (state) => {
      state.currentProductCategoryLoading = false;
    },

    clearCurrentProductCategory: (state) => {
      state.currentProductCategory = null;
    },

    setUpdateProductCategoryLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },

    setUpdateProductCategorySuccess: (state, action: PayloadAction<ProductCategory>) => {
      // Update the category in the list
      const index = state.productCategories.findIndex((cat) => cat.id === action.payload.id);
      if (index !== -1) {
        state.productCategories[index] = action.payload;
      }
      state.updateLoading = false;
    },

    setUpdateProductCategoryFailure: (state) => {
      state.updateLoading = false;
    },

    setProductCategoryFilters: (state, action: PayloadAction<FilterProductCategory>) => {
      state.filters = action.payload;
    },

    setProductCategorySort: (state, action: PayloadAction<SortProductCategory[]>) => {
      state.sort = action.payload;
    },

    resetProductCategoryState: (state) => {
      state.productCategories = [];
      state.loading = false;
      state.filters = {};
      state.sort = [];
    },
  },
});

export const {
  setProductCategoryLoading,
  setProductCategoriesSuccess,
  setProductCategoryFailure,
  setCurrentProductCategoryLoading,
  setCurrentProductCategorySuccess,
  setCurrentProductCategoryFailure,
  clearCurrentProductCategory,
  setUpdateProductCategoryLoading,
  setUpdateProductCategorySuccess,
  setUpdateProductCategoryFailure,
  setProductCategoryFilters,
  setProductCategorySort,
  resetProductCategoryState,
} = productCategorySlice.actions;

/**
 * Selectors
 */
export const selectProductCategories = (state: { productCategory: ProductCategoryState }) =>
  state.productCategory.productCategories;

export const selectCurrentProductCategory = (state: { productCategory: ProductCategoryState }) =>
  state.productCategory.currentProductCategory;

export const selectProductCategoryLoading = (state: { productCategory: ProductCategoryState }) =>
  state.productCategory.loading;

export const selectCurrentProductCategoryLoading = (state: {
  productCategory: ProductCategoryState;
}) => state.productCategory.currentProductCategoryLoading;

export const selectUpdateProductCategoryLoading = (state: {
  productCategory: ProductCategoryState;
}) => state.productCategory.updateLoading;

export const selectProductCategoryFilters = (state: { productCategory: ProductCategoryState }) =>
  state.productCategory.filters;

export const selectProductCategorySort = (state: { productCategory: ProductCategoryState }) =>
  state.productCategory.sort;

export default productCategorySlice.reducer;
