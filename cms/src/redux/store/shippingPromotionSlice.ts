import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';

import type {
  ShippingPromotion,
  ShippingPromotionListItem,
} from 'src/types/gen/shared/shared/shipping/shipping-promotion';
import type {
  FilterShippingPromotion,
  CreateShippingPromotionRequest,
  UpdateShippingPromotionRequest,
} from 'src/types/gen/cms/cms/shipping/shipping-promotion';
import { calculateShippingPromotionStatus } from 'src/types/shipping-promotion';

/**
 * Pagination state
 */
export interface ShippingPromotionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Shipping Promotion State
 */
export interface ShippingPromotionState {
  promotions: ShippingPromotionListItem[];
  currentPromotion: ShippingPromotion | null;
  loading: boolean;
  currentLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  toggleLoading: boolean;
  pagination: ShippingPromotionPagination;
  filters: FilterShippingPromotion;
}

const initialState: ShippingPromotionState = {
  promotions: [],
  currentPromotion: null,
  loading: false,
  currentLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  toggleLoading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
};

/**
 * Saga Action Payload Types
 */
export type GetShippingPromotionsPayload = {
  page?: number;
  limit?: number;
  filters?: FilterShippingPromotion;
  onSuccess?: () => void;
};

export type GetShippingPromotionByIdPayload = {
  id: string;
  onSuccess?: (promotion: ShippingPromotion) => void;
};

export type CreateShippingPromotionPayload = {
  data: CreateShippingPromotionRequest;
  onSuccess?: (promotion: ShippingPromotion) => void;
};

export type UpdateShippingPromotionPayload = {
  id: string;
  data: Omit<UpdateShippingPromotionRequest, 'id'>;
  onSuccess?: (promotion: ShippingPromotion) => void;
};

export type DeleteShippingPromotionPayload = {
  id: string;
  onSuccess?: () => void;
};

export type ToggleShippingPromotionPayload = {
  id: string;
  onSuccess?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getShippingPromotionsRequest = createAction<GetShippingPromotionsPayload>(
  'shippingPromotion/getShippingPromotionsRequest'
);
export const getShippingPromotionByIdRequest = createAction<GetShippingPromotionByIdPayload>(
  'shippingPromotion/getShippingPromotionByIdRequest'
);
export const createShippingPromotionRequest = createAction<CreateShippingPromotionPayload>(
  'shippingPromotion/createShippingPromotionRequest'
);
export const updateShippingPromotionRequest = createAction<UpdateShippingPromotionPayload>(
  'shippingPromotion/updateShippingPromotionRequest'
);
export const deleteShippingPromotionRequest = createAction<DeleteShippingPromotionPayload>(
  'shippingPromotion/deleteShippingPromotionRequest'
);
export const toggleShippingPromotionRequest = createAction<ToggleShippingPromotionPayload>(
  'shippingPromotion/toggleShippingPromotionRequest'
);

/**
 * Shipping Promotion Slice
 */
export const shippingPromotionSlice = createSlice({
  name: 'shippingPromotion',
  initialState,
  reducers: {
    // List promotions
    setShippingPromotionLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setShippingPromotionsSuccess: (
      state,
      action: PayloadAction<{
        promotions: ShippingPromotionListItem[];
        pagination: ShippingPromotionPagination;
      }>
    ) => {
      state.promotions = action.payload.promotions;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },

    setShippingPromotionError: (state) => {
      state.loading = false;
    },

    // Get single promotion by ID
    setCurrentShippingPromotionLoading: (state, action: PayloadAction<boolean>) => {
      state.currentLoading = action.payload;
    },

    setCurrentShippingPromotionSuccess: (state, action: PayloadAction<ShippingPromotion>) => {
      state.currentPromotion = action.payload;
      state.currentLoading = false;
    },

    setCurrentShippingPromotionError: (state) => {
      state.currentLoading = false;
    },

    clearCurrentShippingPromotion: (state) => {
      state.currentPromotion = null;
    },

    // Create promotion
    setCreateShippingPromotionLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },

    setCreateShippingPromotionSuccess: (state) => {
      state.createLoading = false;
    },

    setCreateShippingPromotionError: (state) => {
      state.createLoading = false;
    },

    // Update promotion
    setUpdateShippingPromotionLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },

    setUpdateShippingPromotionSuccess: (state, action: PayloadAction<ShippingPromotion>) => {
      if (state.currentPromotion?.id === action.payload.id) {
        state.currentPromotion = action.payload;
      }
      state.updateLoading = false;
    },

    setUpdateShippingPromotionError: (state) => {
      state.updateLoading = false;
    },

    // Delete promotion
    setDeleteShippingPromotionLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },

    setDeleteShippingPromotionSuccess: (state, action: PayloadAction<string>) => {
      state.promotions = state.promotions.filter((p) => p.id !== action.payload);
      if (state.currentPromotion?.id === action.payload) {
        state.currentPromotion = null;
      }
      state.deleteLoading = false;
    },

    setDeleteShippingPromotionError: (state) => {
      state.deleteLoading = false;
    },

    // Toggle promotion
    setToggleShippingPromotionLoading: (state, action: PayloadAction<boolean>) => {
      state.toggleLoading = action.payload;
    },

    setToggleShippingPromotionSuccess: (state, action: PayloadAction<ShippingPromotion>) => {
      const index = state.promotions.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.promotions[index] = {
          ...state.promotions[index],
          isEnabled: action.payload.isEnabled,
          status: calculateShippingPromotionStatus(
            action.payload.startTime,
            action.payload.endTime,
            action.payload.isEnabled
          ),
        };
      }
      if (state.currentPromotion?.id === action.payload.id) {
        state.currentPromotion = action.payload;
      }
      state.toggleLoading = false;
    },

    setToggleShippingPromotionError: (state) => {
      state.toggleLoading = false;
    },

    // Filters
    setFilters: (state, action: PayloadAction<FilterShippingPromotion>) => {
      state.filters = action.payload;
    },

    // Reset state
    resetShippingPromotionState: (state) => {
      state.promotions = [];
      state.loading = false;
      state.pagination = initialState.pagination;
      state.filters = {};
    },
  },
});

export const {
  setShippingPromotionLoading,
  setShippingPromotionsSuccess,
  setShippingPromotionError,
  setCurrentShippingPromotionLoading,
  setCurrentShippingPromotionSuccess,
  setCurrentShippingPromotionError,
  clearCurrentShippingPromotion,
  setCreateShippingPromotionLoading,
  setCreateShippingPromotionSuccess,
  setCreateShippingPromotionError,
  setUpdateShippingPromotionLoading,
  setUpdateShippingPromotionSuccess,
  setUpdateShippingPromotionError,
  setDeleteShippingPromotionLoading,
  setDeleteShippingPromotionSuccess,
  setDeleteShippingPromotionError,
  setToggleShippingPromotionLoading,
  setToggleShippingPromotionSuccess,
  setToggleShippingPromotionError,
  setFilters,
  resetShippingPromotionState,
} = shippingPromotionSlice.actions;

/**
 * Selectors
 */
export const selectShippingPromotions = (state: { shippingPromotion: ShippingPromotionState }) =>
  state.shippingPromotion.promotions;

export const selectCurrentShippingPromotion = (state: {
  shippingPromotion: ShippingPromotionState;
}) => state.shippingPromotion.currentPromotion;

export const selectShippingPromotionLoading = (state: {
  shippingPromotion: ShippingPromotionState;
}) => state.shippingPromotion.loading;

export const selectCurrentShippingPromotionLoading = (state: {
  shippingPromotion: ShippingPromotionState;
}) => state.shippingPromotion.currentLoading;

export const selectCreateShippingPromotionLoading = (state: {
  shippingPromotion: ShippingPromotionState;
}) => state.shippingPromotion.createLoading;

export const selectUpdateShippingPromotionLoading = (state: {
  shippingPromotion: ShippingPromotionState;
}) => state.shippingPromotion.updateLoading;

export const selectDeleteShippingPromotionLoading = (state: {
  shippingPromotion: ShippingPromotionState;
}) => state.shippingPromotion.deleteLoading;

export const selectToggleShippingPromotionLoading = (state: {
  shippingPromotion: ShippingPromotionState;
}) => state.shippingPromotion.toggleLoading;

export const selectShippingPromotionPagination = (state: {
  shippingPromotion: ShippingPromotionState;
}) => state.shippingPromotion.pagination;

export const selectShippingPromotionFilters = (state: {
  shippingPromotion: ShippingPromotionState;
}) => state.shippingPromotion.filters;

export default shippingPromotionSlice.reducer;
