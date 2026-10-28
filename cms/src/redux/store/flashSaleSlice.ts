import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';

import type {
  FlashSaleResponse as FlashSale,
  FlashSaleListItem,
} from 'src/types/gen/shared/shared/flash-sales/flash-sale';
import type {
  FilterFlashSale,
  SortFlashSale,
  FilterFlashSaleProduct,
  SortFlashSaleProduct,
  AddFlashSaleProductRequest,
  UpdateFlashSaleProductRequest,
  BulkAddFlashSaleProductsRequest,
  BulkUpdateFlashSaleProductsRequest,
  BulkAddFlashSaleProductItem,
  BulkUpdateFlashSaleProductItem,
  UpsertFlashSaleProductsRequest,
} from 'src/types/gen/cms/cms/flash-sales/flash-sale';
import { FlashSaleStatus } from 'src/types/gen/shared/shared/common/enums';
import type {
  BulkUpsertFlashSaleProductsResponse,
  FailedProduct,
  FlashSaleProductIdResponse,
} from 'src/repositories/flash-sale.repository';

/**
 * Flash Sale Pagination
 */
export interface FlashSalePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Bulk add progress tracking
 */
export interface BulkAddProgress {
  current: number;
  total: number;
}

/**
 * Bulk add final result (shown in dialog after completion)
 */
export interface BulkAddResult {
  addedCount: number;
  failedCount: number;
  failedProducts: FailedProduct[];
}

/**
 * Flash Sale State
 */
export interface FlashSaleState {
  flashSales: FlashSaleListItem[];
  currentFlashSale: FlashSale | null;
  loading: boolean;
  currentLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  toggleLoading: boolean;
  addProductLoading: boolean;
  updateProductLoading: boolean;
  removeProductLoading: boolean;
  toggleProductLoading: boolean;
  bulkAddProgress: BulkAddProgress | null;
  bulkAddResult: BulkAddResult | null;
  flashSaleProductIds: FlashSaleProductIdResponse[] | null;
  productIdsLoading: boolean;
  productIdsError: string | null;
  pagination: FlashSalePagination;
  filters: FilterFlashSale;
  sort: SortFlashSale[];
}

const initialState: FlashSaleState = {
  flashSales: [],
  currentFlashSale: null,
  loading: false,
  currentLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  toggleLoading: false,
  addProductLoading: false,
  updateProductLoading: false,
  removeProductLoading: false,
  toggleProductLoading: false,
  bulkAddProgress: null,
  bulkAddResult: null,
  flashSaleProductIds: null,
  productIdsLoading: false,
  productIdsError: null,
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
export type GetFlashSalesPayload = {
  page?: number;
  limit?: number;
  filters?: FilterFlashSale;
  sort?: SortFlashSale[];
  onSuccess?: () => void;
};

export type GetFlashSaleByIdPayload = {
  id: string;
  page?: number;
  limit?: number;
  filters?: FilterFlashSaleProduct;
  sort?: SortFlashSaleProduct[];
  onSuccess?: (flashSale: FlashSale) => void;
};

export type CreateFlashSalePayload = {
  name: string;
  startTime: Date;
  endTime: Date;
  isEnabled?: boolean;
  onSuccess?: (flashSale: FlashSale) => void;
};

export type UpdateFlashSalePayload = {
  flashSaleId: string;
  name?: string;
  startTime?: Date;
  endTime?: Date;
  isEnabled?: boolean;
  onSuccess?: (flashSale: FlashSale) => void;
};

export type DeleteFlashSalePayload = {
  id: string;
  onSuccess?: () => void;
};

export type ToggleFlashSalePayload = {
  id: string;
  onSuccess?: () => void;
};

export type AddFlashSaleProductPayload = {
  data: Omit<AddFlashSaleProductRequest, 'flashSaleId'> & { flashSaleId: string };
  onSuccess?: () => void;
};

export type UpdateFlashSaleProductPayload = {
  data: Omit<UpdateFlashSaleProductRequest, 'flashSaleId' | 'productId'> & {
    flashSaleId: string;
    productId: string;
  };
  onSuccess?: () => void;
};

export type BulkAddFlashSaleProductsPayload = {
  data: BulkAddFlashSaleProductsRequest;
  onSuccess?: (flashSale: FlashSale) => void;
};

export type BulkUpdateFlashSaleProductsPayload = {
  data: BulkUpdateFlashSaleProductsRequest;
  onSuccess?: (flashSale: FlashSale) => void;
};

export type RemoveFlashSaleProductPayload = {
  flashSaleId: string;
  productId: string;
  onSuccess?: () => void;
};

export type BulkRemoveFlashSaleProductsPayload = {
  flashSaleId: string;
  productIds: string[];
  onSuccess?: (flashSale: FlashSale) => void;
};

export type ToggleFlashSaleProductPayload = {
  flashSaleId: string;
  productId: string;
  onSuccess?: () => void;
};

export type CoordinatedBulkUpdateFlashSalePayload = {
  flashSaleId: string;
  toAdd: BulkAddFlashSaleProductItem[];
  toUpdate: BulkUpdateFlashSaleProductItem[];
  toRemove: string[];
  onSuccess?: (flashSale: FlashSale) => void;
  onError?: (errors: any) => void;
};

export type GetFlashSaleProductIdsPayload = {
  flashSaleId: string;
};

export type UpsertFlashSaleProductsPayload = {
  flashSaleId: string;
  data: UpsertFlashSaleProductsRequest;
  onSuccess?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getFlashSalesRequest = createAction<GetFlashSalesPayload>(
  'flashSale/getFlashSalesRequest'
);
export const getFlashSaleByIdRequest = createAction<GetFlashSaleByIdPayload>(
  'flashSale/getFlashSaleByIdRequest'
);
export const createFlashSaleRequest = createAction<CreateFlashSalePayload>(
  'flashSale/createFlashSaleRequest'
);
export const updateFlashSaleRequest = createAction<UpdateFlashSalePayload>(
  'flashSale/updateFlashSaleRequest'
);
export const deleteFlashSaleRequest = createAction<DeleteFlashSalePayload>(
  'flashSale/deleteFlashSaleRequest'
);
export const toggleFlashSaleRequest = createAction<ToggleFlashSalePayload>(
  'flashSale/toggleFlashSaleRequest'
);

// Product actions
export const addFlashSaleProductRequest = createAction<AddFlashSaleProductPayload>(
  'flashSale/addFlashSaleProductRequest'
);
export const updateFlashSaleProductRequest = createAction<UpdateFlashSaleProductPayload>(
  'flashSale/updateFlashSaleProductRequest'
);
export const bulkAddFlashSaleProductsRequest = createAction<BulkAddFlashSaleProductsPayload>(
  'flashSale/bulkAddFlashSaleProductsRequest'
);
export const bulkUpdateFlashSaleProductsRequest = createAction<BulkUpdateFlashSaleProductsPayload>(
  'flashSale/bulkUpdateFlashSaleProductsRequest'
);
export const removeFlashSaleProductRequest = createAction<RemoveFlashSaleProductPayload>(
  'flashSale/removeFlashSaleProductRequest'
);
export const bulkRemoveFlashSaleProductsRequest = createAction<BulkRemoveFlashSaleProductsPayload>(
  'flashSale/bulkRemoveFlashSaleProductsRequest'
);
export const toggleFlashSaleProductRequest = createAction<ToggleFlashSaleProductPayload>(
  'flashSale/toggleFlashSaleProductRequest'
);
export const coordinatedBulkUpdateFlashSaleRequest =
  createAction<CoordinatedBulkUpdateFlashSalePayload>(
    'flashSale/coordinatedBulkUpdateFlashSaleRequest'
  );

export const getFlashSaleProductIdsRequest = createAction<GetFlashSaleProductIdsPayload>(
  'flashSale/getFlashSaleProductIdsRequest'
);

export const upsertFlashSaleProductsRequest = createAction<UpsertFlashSaleProductsPayload>(
  'flashSale/upsertFlashSaleProductsRequest'
);

/**
 * Flash Sale Slice
 */
export const flashSaleSlice = createSlice({
  name: 'flashSale',
  initialState,
  reducers: {
    // List flash sales
    setFlashSaleLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setFlashSalesSuccess: (
      state,
      action: PayloadAction<{
        flashSales: FlashSaleListItem[];
        pagination: FlashSalePagination;
      }>
    ) => {
      state.flashSales = action.payload.flashSales;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },

    setFlashSaleError: (state) => {
      state.loading = false;
    },

    // Get single flash sale by ID
    setCurrentFlashSaleLoading: (state, action: PayloadAction<boolean>) => {
      state.currentLoading = action.payload;
    },

    setCurrentFlashSaleSuccess: (state, action: PayloadAction<FlashSale>) => {
      state.currentFlashSale = action.payload;
      state.currentLoading = false;
    },

    setCurrentFlashSaleError: (state) => {
      state.currentLoading = false;
    },

    clearCurrentFlashSale: (state) => {
      state.currentFlashSale = null;
    },

    // Create flash sale
    setCreateFlashSaleLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },

    setCreateFlashSaleSuccess: (state) => {
      state.createLoading = false;
    },

    setCreateFlashSaleError: (state) => {
      state.createLoading = false;
    },

    // Update flash sale
    setUpdateFlashSaleLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },

    setUpdateFlashSaleSuccess: (state, action: PayloadAction<FlashSale>) => {
      if (state.currentFlashSale?.id === action.payload.id) {
        state.currentFlashSale = action.payload;
      }
      state.updateLoading = false;
    },

    setUpdateFlashSaleError: (state) => {
      state.updateLoading = false;
    },

    // Delete flash sale
    setDeleteFlashSaleLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },

    setDeleteFlashSaleSuccess: (state, action: PayloadAction<string>) => {
      state.flashSales = state.flashSales.filter((fs) => fs.id !== action.payload);
      if (state.currentFlashSale?.id === action.payload) {
        state.currentFlashSale = null;
      }
      state.deleteLoading = false;
    },

    setDeleteFlashSaleError: (state) => {
      state.deleteLoading = false;
    },

    // Toggle flash sale
    setToggleFlashSaleLoading: (state, action: PayloadAction<boolean>) => {
      state.toggleLoading = action.payload;
    },

    setToggleFlashSaleSuccess: (state, action: PayloadAction<FlashSale>) => {
      const index = state.flashSales.findIndex((fs) => fs.id === action.payload.id);
      if (index !== -1) {
        state.flashSales[index] = {
          ...state.flashSales[index],
          isEnabled: action.payload.isEnabled,
          status: action.payload.status,
        };
      }
      if (state.currentFlashSale?.id === action.payload.id) {
        state.currentFlashSale = action.payload;
      }
      state.toggleLoading = false;
    },

    setToggleFlashSaleError: (state) => {
      state.toggleLoading = false;
    },

    // Add product
    setAddProductLoading: (state, action: PayloadAction<boolean>) => {
      state.addProductLoading = action.payload;
      if (action.payload) {
        state.bulkAddProgress = null;
      }
    },

    setAddProductSuccess: (state, action: PayloadAction<FlashSale>) => {
      if (state.currentFlashSale?.id === action.payload.id) {
        state.currentFlashSale = action.payload;
      }
      state.addProductLoading = false;
      state.bulkAddProgress = null;
    },

    setAddProductError: (state) => {
      state.addProductLoading = false;
      state.bulkAddProgress = null;
    },

    // Bulk add progress
    setBulkAddProgress: (state, action: PayloadAction<BulkAddProgress | null>) => {
      state.bulkAddProgress = action.payload;
    },

    // Bulk add result (shown in dialog after completion)
    setBulkAddResult: (state, action: PayloadAction<BulkAddResult | null>) => {
      state.bulkAddResult = action.payload;
    },

    // Upsert products (add or update)
    upsertFlashSaleProductsRequest: (
      state,
      _action: PayloadAction<UpsertFlashSaleProductsPayload>
    ) => {
      state.addProductLoading = true;
      state.bulkAddProgress = null;
      state.bulkAddResult = null;
    },

    upsertFlashSaleProductsSuccess: (
      state,
      action: PayloadAction<BulkUpsertFlashSaleProductsResponse>
    ) => {
      state.addProductLoading = false;
      state.bulkAddResult = {
        addedCount: action.payload.addedCount,
        failedCount: action.payload.failedCount,
        failedProducts: action.payload.failedProducts,
      };
    },

    upsertFlashSaleProductsFailure: (state) => {
      state.addProductLoading = false;
      state.bulkAddProgress = null;
    },

    // Update product
    setUpdateProductLoading: (state, action: PayloadAction<boolean>) => {
      state.updateProductLoading = action.payload;
    },

    setUpdateProductSuccess: (state, action: PayloadAction<FlashSale>) => {
      if (state.currentFlashSale?.id === action.payload.id) {
        state.currentFlashSale = action.payload;
      }
      state.updateProductLoading = false;
    },

    setUpdateProductError: (state) => {
      state.updateProductLoading = false;
    },

    // Remove product
    setRemoveProductLoading: (state, action: PayloadAction<boolean>) => {
      state.removeProductLoading = action.payload;
    },

    setRemoveProductSuccess: (state, action: PayloadAction<FlashSale>) => {
      if (state.currentFlashSale?.id === action.payload.id) {
        state.currentFlashSale = action.payload;
      }
      state.removeProductLoading = false;
    },

    setRemoveProductError: (state) => {
      state.removeProductLoading = false;
    },

    // Toggle product
    setToggleProductLoading: (state, action: PayloadAction<boolean>) => {
      state.toggleProductLoading = action.payload;
    },

    setToggleProductSuccess: (state, action: PayloadAction<FlashSale>) => {
      if (state.currentFlashSale?.id === action.payload.id) {
        state.currentFlashSale = action.payload;
      }
      state.toggleProductLoading = false;
    },

    setToggleProductError: (state) => {
      state.toggleProductLoading = false;
    },

    // Get product IDs with order numbers
    setProductIdsLoading: (state, action: PayloadAction<boolean>) => {
      state.productIdsLoading = action.payload;
      if (action.payload) {
        state.productIdsError = null;
      }
    },

    setFlashSaleProductIdsSuccess: (state, action: PayloadAction<FlashSaleProductIdResponse[]>) => {
      state.flashSaleProductIds = action.payload;
      state.productIdsLoading = false;
      state.productIdsError = null;
    },

    setFlashSaleProductIdsError: (state, action: PayloadAction<string>) => {
      state.productIdsLoading = false;
      state.productIdsError = action.payload;
    },

    clearFlashSaleProductIds: (state) => {
      state.flashSaleProductIds = null;
      state.productIdsLoading = false;
      state.productIdsError = null;
    },

    // Filters
    setFilters: (state, action: PayloadAction<FilterFlashSale>) => {
      state.filters = action.payload;
    },

    setSort: (state, action: PayloadAction<SortFlashSale[]>) => {
      state.sort = action.payload;
    },

    // Reset state
    resetFlashSaleState: (state) => {
      state.flashSales = [];
      state.loading = false;
      state.pagination = initialState.pagination;
      state.filters = {};
      state.sort = [];
    },
  },
});

export const {
  setFlashSaleLoading,
  setFlashSalesSuccess,
  setFlashSaleError,
  setCurrentFlashSaleLoading,
  setCurrentFlashSaleSuccess,
  setCurrentFlashSaleError,
  clearCurrentFlashSale,
  setCreateFlashSaleLoading,
  setCreateFlashSaleSuccess,
  setCreateFlashSaleError,
  setUpdateFlashSaleLoading,
  setUpdateFlashSaleSuccess,
  setUpdateFlashSaleError,
  setDeleteFlashSaleLoading,
  setDeleteFlashSaleSuccess,
  setDeleteFlashSaleError,
  setToggleFlashSaleLoading,
  setToggleFlashSaleSuccess,
  setToggleFlashSaleError,
  setAddProductLoading,
  setAddProductSuccess,
  setAddProductError,
  setBulkAddProgress,
  setBulkAddResult,
  upsertFlashSaleProductsSuccess,
  upsertFlashSaleProductsFailure,
  setUpdateProductLoading,
  setUpdateProductSuccess,
  setUpdateProductError,
  setRemoveProductLoading,
  setRemoveProductSuccess,
  setRemoveProductError,
  setToggleProductLoading,
  setToggleProductSuccess,
  setToggleProductError,
  setProductIdsLoading,
  setFlashSaleProductIdsSuccess,
  setFlashSaleProductIdsError,
  clearFlashSaleProductIds,
  setFilters,
  setSort,
  resetFlashSaleState,
} = flashSaleSlice.actions;

/**
 * Selectors
 */
export const selectFlashSales = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.flashSales;

export const selectCurrentFlashSale = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.currentFlashSale;

export const selectFlashSaleLoading = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.loading;

export const selectCurrentFlashSaleLoading = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.currentLoading;

export const selectCreateFlashSaleLoading = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.createLoading;

export const selectUpdateFlashSaleLoading = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.updateLoading;

export const selectDeleteFlashSaleLoading = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.deleteLoading;

export const selectToggleFlashSaleLoading = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.toggleLoading;

export const selectAddProductLoading = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.addProductLoading;

export const selectUpdateProductLoading = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.updateProductLoading;

export const selectRemoveProductLoading = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.removeProductLoading;

export const selectToggleProductLoading = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.toggleProductLoading;

export const selectBulkAddProgress = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.bulkAddProgress;

export const selectBulkAddResult = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.bulkAddResult;

export const selectFlashSalePagination = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.pagination;

export const selectFlashSaleFilters = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.filters;

export const selectFlashSaleSort = (state: { flashSale: FlashSaleState }) => state.flashSale.sort;

// Helper to get status filter from filters
export const selectFlashSaleStatusFilter = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.filters.status;

// Helper to get search query from filters
export const selectFlashSaleSearchQuery = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.filters.search;

// Product IDs selectors
export const selectFlashSaleProductIds = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.flashSaleProductIds;

export const selectProductIdsLoading = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.productIdsLoading;

export const selectProductIdsError = (state: { flashSale: FlashSaleState }) =>
  state.flashSale.productIdsError;

export default flashSaleSlice.reducer;

// Re-export FlashSaleStatus for convenience
export { FlashSaleStatus };
