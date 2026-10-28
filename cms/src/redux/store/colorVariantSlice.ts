import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type {
  ColorVariant,
  ColorVariantDisplayType,
  CreateColorVariantRequest,
  UpdateColorVariantRequest,
} from 'src/types/color-variant';

/**
 * Color Variant Pagination
 */
export interface ColorVariantPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Color Variant State
 */
export interface ColorVariantState {
  colorVariants: ColorVariant[];
  currentColorVariant: ColorVariant | null;
  loading: boolean;
  currentLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  pagination: ColorVariantPagination;
  searchQuery: string;
}

const initialState: ColorVariantState = {
  colorVariants: [],
  currentColorVariant: null,
  loading: false,
  currentLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  searchQuery: '',
};

/**
 * Saga Action Payload Types
 */
export type GetColorVariantsPayload = {
  page?: number;
  limit?: number;
  search?: string;
  displayType?: ColorVariantDisplayType;
};

export type GetColorVariantByIdPayload = {
  id: string;
};

export type CreateColorVariantPayload = {
  data: CreateColorVariantRequest;
  onSuccess?: (colorVariant: ColorVariant) => void;
};

export type UpdateColorVariantPayload = {
  id: string;
  data: UpdateColorVariantRequest;
  onSuccess?: (colorVariant: ColorVariant) => void;
};

export type DeleteColorVariantPayload = {
  id: string;
  onSuccess?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getColorVariantsRequest = createAction<GetColorVariantsPayload>(
  'colorVariant/getColorVariantsRequest'
);
export const getColorVariantByIdRequest = createAction<GetColorVariantByIdPayload>(
  'colorVariant/getColorVariantByIdRequest'
);
export const createColorVariantRequest = createAction<CreateColorVariantPayload>(
  'colorVariant/createColorVariantRequest'
);
export const updateColorVariantRequest = createAction<UpdateColorVariantPayload>(
  'colorVariant/updateColorVariantRequest'
);
export const deleteColorVariantRequest = createAction<DeleteColorVariantPayload>(
  'colorVariant/deleteColorVariantRequest'
);

/**
 * Color Variant Slice
 */
export const colorVariantSlice = createSlice({
  name: 'colorVariant',
  initialState,
  reducers: {
    // List color variants
    setColorVariantLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setColorVariantsSuccess: (
      state,
      action: PayloadAction<{
        colorVariants: ColorVariant[];
        pagination: ColorVariantPagination;
      }>
    ) => {
      state.colorVariants = action.payload.colorVariants;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },

    setColorVariantError: (state) => {
      state.loading = false;
    },

    // Get single color variant by ID
    setCurrentColorVariantLoading: (state, action: PayloadAction<boolean>) => {
      state.currentLoading = action.payload;
    },

    setCurrentColorVariantSuccess: (state, action: PayloadAction<ColorVariant>) => {
      state.currentColorVariant = action.payload;
      state.currentLoading = false;
    },

    setCurrentColorVariantError: (state) => {
      state.currentLoading = false;
    },

    clearCurrentColorVariant: (state) => {
      state.currentColorVariant = null;
    },

    // Create color variant
    setCreateColorVariantLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },

    setCreateColorVariantSuccess: (state, action: PayloadAction<ColorVariant>) => {
      state.colorVariants.unshift(action.payload);
      state.createLoading = false;
    },

    setCreateColorVariantError: (state) => {
      state.createLoading = false;
    },

    // Update color variant
    setUpdateColorVariantLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },

    setUpdateColorVariantSuccess: (state, action: PayloadAction<ColorVariant>) => {
      const index = state.colorVariants.findIndex((cv) => cv.id === action.payload.id);
      if (index !== -1) {
        state.colorVariants[index] = action.payload;
      }
      if (state.currentColorVariant?.id === action.payload.id) {
        state.currentColorVariant = action.payload;
      }
      state.updateLoading = false;
    },

    setUpdateColorVariantError: (state) => {
      state.updateLoading = false;
    },

    // Delete color variant
    setDeleteColorVariantLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },

    setDeleteColorVariantSuccess: (state, action: PayloadAction<string>) => {
      state.colorVariants = state.colorVariants.filter((cv) => cv.id !== action.payload);
      if (state.currentColorVariant?.id === action.payload) {
        state.currentColorVariant = null;
      }
      state.deleteLoading = false;
    },

    setDeleteColorVariantError: (state) => {
      state.deleteLoading = false;
    },

    // Filters
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Reset state
    resetColorVariantState: (state) => {
      state.colorVariants = [];
      state.loading = false;
      state.pagination = initialState.pagination;
      state.searchQuery = '';
    },
  },
});

export const {
  setColorVariantLoading,
  setColorVariantsSuccess,
  setColorVariantError,
  setCurrentColorVariantLoading,
  setCurrentColorVariantSuccess,
  setCurrentColorVariantError,
  clearCurrentColorVariant,
  setCreateColorVariantLoading,
  setCreateColorVariantSuccess,
  setCreateColorVariantError,
  setUpdateColorVariantLoading,
  setUpdateColorVariantSuccess,
  setUpdateColorVariantError,
  setDeleteColorVariantLoading,
  setDeleteColorVariantSuccess,
  setDeleteColorVariantError,
  setSearchQuery,
  resetColorVariantState,
} = colorVariantSlice.actions;

/**
 * Selectors
 */
export const selectColorVariants = (state: { colorVariant: ColorVariantState }) =>
  state.colorVariant.colorVariants;

export const selectCurrentColorVariant = (state: { colorVariant: ColorVariantState }) =>
  state.colorVariant.currentColorVariant;

export const selectColorVariantLoading = (state: { colorVariant: ColorVariantState }) =>
  state.colorVariant.loading;

export const selectCurrentColorVariantLoading = (state: { colorVariant: ColorVariantState }) =>
  state.colorVariant.currentLoading;

export const selectCreateColorVariantLoading = (state: { colorVariant: ColorVariantState }) =>
  state.colorVariant.createLoading;

export const selectUpdateColorVariantLoading = (state: { colorVariant: ColorVariantState }) =>
  state.colorVariant.updateLoading;

export const selectDeleteColorVariantLoading = (state: { colorVariant: ColorVariantState }) =>
  state.colorVariant.deleteLoading;

export const selectColorVariantPagination = (state: { colorVariant: ColorVariantState }) =>
  state.colorVariant.pagination;

export const selectColorVariantSearchQuery = (state: { colorVariant: ColorVariantState }) =>
  state.colorVariant.searchQuery;

export default colorVariantSlice.reducer;
