import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';

import type {
  Promotion,
  PromotionListItem,
  FilterPromotion,
  PromotionPagination,
  CreatePromotionDto,
  UpdatePromotionDto,
} from 'src/types/promotion';
import { PromotionStatus, PromotionType } from 'src/types/promotion';

/**
 * Sort configuration for promotions
 */
export interface SortPromotion {
  field: string;
  order: 'asc' | 'desc';
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
  failedProducts: Array<{ productId: string; productCode: string; reason: string }>;
}

/**
 * Promotion State
 */
export interface PromotionState {
  promotions: PromotionListItem[];
  currentPromotion: Promotion | null;
  loading: boolean;
  currentLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  pauseLoading: boolean;
  addProductLoading: boolean;
  bulkAddProgress: BulkAddProgress | null;
  bulkAddResult: BulkAddResult | null;
  pagination: PromotionPagination;
  filters: FilterPromotion;
  sort: SortPromotion[];
}

const initialState: PromotionState = {
  promotions: [],
  currentPromotion: null,
  loading: false,
  currentLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  pauseLoading: false,
  addProductLoading: false,
  bulkAddProgress: null,
  bulkAddResult: null,
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
export type GetPromotionsPayload = {
  page?: number;
  limit?: number;
  filters?: FilterPromotion;
  sort?: SortPromotion[];
  onSuccess?: () => void;
};

export type GetPromotionByIdPayload = {
  id: string;
  onSuccess?: (promotion: Promotion) => void;
};

export type CreatePromotionPayload = {
  data: CreatePromotionDto;
  onSuccess?: (promotion: Promotion) => void;
};

export type UpdatePromotionPayload = {
  id: string;
  data: UpdatePromotionDto;
  onSuccess?: (promotion: Promotion) => void;
};

export type DeletePromotionPayload = {
  id: string;
  onSuccess?: () => void;
};

export type PausePromotionPayload = {
  id: string;
  onSuccess?: () => void;
};

export type ResumePromotionPayload = {
  id: string;
  onSuccess?: () => void;
};

export type BulkAddPromotionProductsPayload = {
  promotionId: string;
  products: Array<{
    productId: string;
    isEnabled?: boolean;
    discountType?: string;
    discountValue?: number;
  }>;
  onSuccess?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getPromotionsRequest = createAction<GetPromotionsPayload>(
  'promotion/getPromotionsRequest'
);
export const getPromotionByIdRequest = createAction<GetPromotionByIdPayload>(
  'promotion/getPromotionByIdRequest'
);
export const createPromotionRequest = createAction<CreatePromotionPayload>(
  'promotion/createPromotionRequest'
);
export const updatePromotionRequest = createAction<UpdatePromotionPayload>(
  'promotion/updatePromotionRequest'
);
export const deletePromotionRequest = createAction<DeletePromotionPayload>(
  'promotion/deletePromotionRequest'
);
export const pausePromotionRequest = createAction<PausePromotionPayload>(
  'promotion/pausePromotionRequest'
);
export const resumePromotionRequest = createAction<ResumePromotionPayload>(
  'promotion/resumePromotionRequest'
);
export const bulkAddPromotionProductsRequest = createAction<BulkAddPromotionProductsPayload>(
  'promotion/bulkAddPromotionProductsRequest'
);

/**
 * Promotion Slice
 */
export const promotionSlice = createSlice({
  name: 'promotion',
  initialState,
  reducers: {
    // List promotions
    setPromotionLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setPromotionsSuccess: (
      state,
      action: PayloadAction<{
        promotions: PromotionListItem[];
        pagination: PromotionPagination;
      }>
    ) => {
      state.promotions = action.payload.promotions;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },

    setPromotionError: (state) => {
      state.loading = false;
    },

    // Get single promotion by ID
    setCurrentPromotionLoading: (state, action: PayloadAction<boolean>) => {
      state.currentLoading = action.payload;
    },

    setCurrentPromotionSuccess: (state, action: PayloadAction<Promotion>) => {
      state.currentPromotion = action.payload;
      state.currentLoading = false;
    },

    setCurrentPromotionError: (state) => {
      state.currentLoading = false;
    },

    clearCurrentPromotion: (state) => {
      state.currentPromotion = null;
    },

    // Create promotion
    setCreatePromotionLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },

    setCreatePromotionSuccess: (state) => {
      state.createLoading = false;
    },

    setCreatePromotionError: (state) => {
      state.createLoading = false;
    },

    // Update promotion
    setUpdatePromotionLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },

    setUpdatePromotionSuccess: (state, action: PayloadAction<Promotion>) => {
      if (state.currentPromotion?.id === action.payload.id) {
        state.currentPromotion = action.payload;
      }
      state.updateLoading = false;
    },

    setUpdatePromotionError: (state) => {
      state.updateLoading = false;
    },

    // Delete promotion
    setDeletePromotionLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },

    setDeletePromotionSuccess: (state, action: PayloadAction<string>) => {
      state.promotions = state.promotions.filter((p) => p.id !== action.payload);
      if (state.currentPromotion?.id === action.payload) {
        state.currentPromotion = null;
      }
      state.deleteLoading = false;
    },

    setDeletePromotionError: (state) => {
      state.deleteLoading = false;
    },

    // Pause promotion
    setPausePromotionLoading: (state, action: PayloadAction<boolean>) => {
      state.pauseLoading = action.payload;
    },

    setPausePromotionSuccess: (state, action: PayloadAction<Promotion>) => {
      const index = state.promotions.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.promotions[index] = {
          ...state.promotions[index],
          status: action.payload.status,
          isEnabled: action.payload.isEnabled,
        };
      }
      if (state.currentPromotion?.id === action.payload.id) {
        state.currentPromotion = action.payload;
      }
      state.pauseLoading = false;
    },

    setPausePromotionError: (state) => {
      state.pauseLoading = false;
    },

    // Resume promotion (reuse pause loading)
    setResumePromotionSuccess: (state, action: PayloadAction<Promotion>) => {
      const index = state.promotions.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.promotions[index] = {
          ...state.promotions[index],
          status: action.payload.status,
          isEnabled: action.payload.isEnabled,
        };
      }
      if (state.currentPromotion?.id === action.payload.id) {
        state.currentPromotion = action.payload;
      }
      state.pauseLoading = false;
    },

    setResumePromotionError: (state) => {
      state.pauseLoading = false;
    },

    // Bulk add products
    setAddProductLoading: (state, action: PayloadAction<boolean>) => {
      state.addProductLoading = action.payload;
    },

    setAddProductSuccess: (state) => {
      state.addProductLoading = false;
    },

    setAddProductError: (state) => {
      state.addProductLoading = false;
    },

    setBulkAddProgress: (state, action: PayloadAction<BulkAddProgress | null>) => {
      state.bulkAddProgress = action.payload;
    },

    setBulkAddResult: (state, action: PayloadAction<BulkAddResult | null>) => {
      state.bulkAddResult = action.payload;
    },

    // Filters
    setPromotionFilters: (state, action: PayloadAction<FilterPromotion>) => {
      state.filters = action.payload;
    },

    setPromotionSort: (state, action: PayloadAction<SortPromotion[]>) => {
      state.sort = action.payload;
    },

    // Reset state
    resetPromotionState: (state) => {
      state.promotions = [];
      state.loading = false;
      state.pagination = initialState.pagination;
      state.filters = {};
      state.sort = [];
    },
  },
});

export const {
  setPromotionLoading,
  setPromotionsSuccess,
  setPromotionError,
  setCurrentPromotionLoading,
  setCurrentPromotionSuccess,
  setCurrentPromotionError,
  clearCurrentPromotion,
  setCreatePromotionLoading,
  setCreatePromotionSuccess,
  setCreatePromotionError,
  setUpdatePromotionLoading,
  setUpdatePromotionSuccess,
  setUpdatePromotionError,
  setDeletePromotionLoading,
  setDeletePromotionSuccess,
  setDeletePromotionError,
  setPausePromotionLoading,
  setPausePromotionSuccess,
  setPausePromotionError,
  setResumePromotionSuccess,
  setResumePromotionError,
  setAddProductLoading,
  setAddProductSuccess,
  setAddProductError,
  setBulkAddProgress,
  setBulkAddResult,
  setPromotionFilters,
  setPromotionSort,
  resetPromotionState,
} = promotionSlice.actions;

/**
 * Selectors
 */
export const selectPromotions = (state: { promotion: PromotionState }) =>
  state.promotion.promotions;

export const selectCurrentPromotion = (state: { promotion: PromotionState }) =>
  state.promotion.currentPromotion;

export const selectPromotionLoading = (state: { promotion: PromotionState }) =>
  state.promotion.loading;

export const selectCurrentPromotionLoading = (state: { promotion: PromotionState }) =>
  state.promotion.currentLoading;

export const selectCreatePromotionLoading = (state: { promotion: PromotionState }) =>
  state.promotion.createLoading;

export const selectUpdatePromotionLoading = (state: { promotion: PromotionState }) =>
  state.promotion.updateLoading;

export const selectDeletePromotionLoading = (state: { promotion: PromotionState }) =>
  state.promotion.deleteLoading;

export const selectPausePromotionLoading = (state: { promotion: PromotionState }) =>
  state.promotion.pauseLoading;

export const selectAddProductLoading = (state: { promotion: PromotionState }) =>
  state.promotion.addProductLoading;

export const selectBulkAddProgress = (state: { promotion: PromotionState }) =>
  state.promotion.bulkAddProgress;

export const selectBulkAddResult = (state: { promotion: PromotionState }) =>
  state.promotion.bulkAddResult;

export const selectPromotionPagination = (state: { promotion: PromotionState }) =>
  state.promotion.pagination;

export const selectPromotionFilters = (state: { promotion: PromotionState }) =>
  state.promotion.filters;

export const selectPromotionSort = (state: { promotion: PromotionState }) => state.promotion.sort;

// Helper to get status filter from filters
export const selectPromotionStatusFilter = (state: { promotion: PromotionState }) =>
  state.promotion.filters.status;

// Helper to get search query from filters
export const selectPromotionSearchQuery = (state: { promotion: PromotionState }) =>
  state.promotion.filters.keyword;

// Helper to get type filter from filters
export const selectPromotionTypeFilter = (state: { promotion: PromotionState }) =>
  state.promotion.filters.type;

export default promotionSlice.reducer;

// Re-export enums for convenience
export { PromotionStatus, PromotionType };
