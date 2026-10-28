import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type {
  ProductBanner,
  ProductBannerListItem,
} from 'src/types/gen/shared/shared/product-banners/product-banner';
import type {
  FilterProductBanner,
  SortProductBanner,
  CreateProductBannerRequest,
  UpdateProductBannerRequest,
} from 'src/types/gen/cms/cms/product-banners/product-banner';

/**
 * Product Banner State
 */
export interface ProductBannerState {
  banners: ProductBannerListItem[];
  currentBanner: ProductBanner | null;
  loading: boolean;
  currentBannerLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: FilterProductBanner;
  sort: SortProductBanner[];
}

const initialState: ProductBannerState = {
  banners: [],
  currentBanner: null,
  loading: false,
  currentBannerLoading: false,
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
export type GetProductBannersPayload = {
  page?: number;
  limit?: number;
  filters?: FilterProductBanner;
  sort?: SortProductBanner[];
  onSuccess?: () => void;
};

export type GetProductBannerByIdPayload = {
  id: string;
  onSuccess?: (banner: ProductBanner) => void;
};

export type CreateProductBannerPayload = {
  data: CreateProductBannerRequest;
  onSuccess?: (banner: ProductBanner) => void;
};

export type UpdateProductBannerPayload = {
  id: string;
  data: Omit<UpdateProductBannerRequest, 'bannerId'>;
  onSuccess?: (banner: ProductBanner) => void;
};

export type DeleteProductBannerPayload = {
  id: string;
  onSuccess?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getProductBannersRequest = createAction<GetProductBannersPayload>(
  'productBanner/getProductBannersRequest'
);
export const getProductBannerByIdRequest = createAction<GetProductBannerByIdPayload>(
  'productBanner/getProductBannerByIdRequest'
);
export const createProductBannerRequest = createAction<CreateProductBannerPayload>(
  'productBanner/createProductBannerRequest'
);
export const updateProductBannerRequest = createAction<UpdateProductBannerPayload>(
  'productBanner/updateProductBannerRequest'
);
export const deleteProductBannerRequest = createAction<DeleteProductBannerPayload>(
  'productBanner/deleteProductBannerRequest'
);

/**
 * Product Banner Slice
 */
export const productBannerSlice = createSlice({
  name: 'productBanner',
  initialState,
  reducers: {
    // List product banners
    setProductBannerLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setProductBannersSuccess: (
      state,
      action: PayloadAction<{
        banners: ProductBannerListItem[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    ) => {
      state.banners = action.payload.banners;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },

    setProductBannerError: (state) => {
      state.loading = false;
    },

    // Get single product banner by ID
    setCurrentProductBannerLoading: (state, action: PayloadAction<boolean>) => {
      state.currentBannerLoading = action.payload;
    },

    setCurrentProductBannerSuccess: (state, action: PayloadAction<ProductBanner>) => {
      state.currentBanner = action.payload;
      state.currentBannerLoading = false;
    },

    setCurrentProductBannerError: (state) => {
      state.currentBannerLoading = false;
    },

    clearCurrentProductBanner: (state) => {
      state.currentBanner = null;
    },

    // Create product banner
    setCreateProductBannerLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },

    setCreateProductBannerSuccess: (state, action: PayloadAction<ProductBanner>) => {
      // Add to beginning of list
      const newBannerListItem: ProductBannerListItem = {
        id: action.payload.id,
        name: action.payload.name,
        image: action.payload.image,
        position: action.payload.position,
        ratio: action.payload.ratio,
        isActive: action.payload.isActive,
        productCount: action.payload.products?.length || 0,
        createdAt: action.payload.createdAt,
        updatedAt: action.payload.updatedAt,
      };
      state.banners.unshift(newBannerListItem);
      state.createLoading = false;
    },

    setCreateProductBannerError: (state) => {
      state.createLoading = false;
    },

    // Update product banner
    setUpdateProductBannerLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },

    setUpdateProductBannerSuccess: (state, action: PayloadAction<ProductBanner>) => {
      const index = state.banners.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        // Update the list item
        state.banners[index] = {
          id: action.payload.id,
          name: action.payload.name,
          image: action.payload.image,
          position: action.payload.position,
          ratio: action.payload.ratio,
          isActive: action.payload.isActive,
          productCount: action.payload.products?.length || 0,
          createdAt: action.payload.createdAt,
          updatedAt: action.payload.updatedAt,
        };
      }
      if (state.currentBanner?.id === action.payload.id) {
        state.currentBanner = action.payload;
      }
      state.updateLoading = false;
    },

    setUpdateProductBannerError: (state) => {
      state.updateLoading = false;
    },

    // Delete product banner
    setDeleteProductBannerLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },

    setDeleteProductBannerSuccess: (state, action: PayloadAction<string>) => {
      state.banners = state.banners.filter((b) => b.id !== action.payload);
      if (state.currentBanner?.id === action.payload) {
        state.currentBanner = null;
      }
      state.deleteLoading = false;
    },

    setDeleteProductBannerError: (state) => {
      state.deleteLoading = false;
    },

    // Filters and sort
    setProductBannerFilters: (state, action: PayloadAction<FilterProductBanner>) => {
      state.filters = action.payload;
    },

    setProductBannerSort: (state, action: PayloadAction<SortProductBanner[]>) => {
      state.sort = action.payload;
    },

    // Reset state
    resetProductBannerState: (state) => {
      state.banners = [];
      state.loading = false;
      state.pagination = initialState.pagination;
      state.filters = {};
      state.sort = [];
    },
  },
});

export const {
  setProductBannerLoading,
  setProductBannersSuccess,
  setProductBannerError,
  setCurrentProductBannerLoading,
  setCurrentProductBannerSuccess,
  setCurrentProductBannerError,
  clearCurrentProductBanner,
  setCreateProductBannerLoading,
  setCreateProductBannerSuccess,
  setCreateProductBannerError,
  setUpdateProductBannerLoading,
  setUpdateProductBannerSuccess,
  setUpdateProductBannerError,
  setDeleteProductBannerLoading,
  setDeleteProductBannerSuccess,
  setDeleteProductBannerError,
  setProductBannerFilters,
  setProductBannerSort,
  resetProductBannerState,
} = productBannerSlice.actions;

/**
 * Selectors
 */
export const selectProductBanners = (state: { productBanner: ProductBannerState }) =>
  state.productBanner.banners;

export const selectCurrentProductBanner = (state: { productBanner: ProductBannerState }) =>
  state.productBanner.currentBanner;

export const selectProductBannerLoading = (state: { productBanner: ProductBannerState }) =>
  state.productBanner.loading;

export const selectCurrentProductBannerLoading = (state: { productBanner: ProductBannerState }) =>
  state.productBanner.currentBannerLoading;

export const selectCreateProductBannerLoading = (state: { productBanner: ProductBannerState }) =>
  state.productBanner.createLoading;

export const selectUpdateProductBannerLoading = (state: { productBanner: ProductBannerState }) =>
  state.productBanner.updateLoading;

export const selectDeleteProductBannerLoading = (state: { productBanner: ProductBannerState }) =>
  state.productBanner.deleteLoading;

export const selectProductBannerPagination = (state: { productBanner: ProductBannerState }) =>
  state.productBanner.pagination;

export const selectProductBannerFilters = (state: { productBanner: ProductBannerState }) =>
  state.productBanner.filters;

export const selectProductBannerSort = (state: { productBanner: ProductBannerState }) =>
  state.productBanner.sort;

export default productBannerSlice.reducer;
