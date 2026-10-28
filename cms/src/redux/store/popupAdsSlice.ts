import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';

import type { PopupAdsListItem } from 'src/types/gen/shared/shared/popup-ads/popup-ads';
import type { FilterPopupAds, SortPopupAds } from 'src/types/gen/cms/cms/popup-ads/popup-ads';

/**
 * PopupAds Pagination
 */
export interface PopupAdsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * PopupAds State
 */
export interface PopupAdsState {
  popupAds: PopupAdsListItem[];
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  pagination: PopupAdsPagination;
  filters: FilterPopupAds;
  sort: SortPopupAds[];
}

const initialState: PopupAdsState = {
  popupAds: [],
  loading: false,
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
export type GetPopupAdsListPayload = {
  page?: number;
  limit?: number;
  filters?: FilterPopupAds;
  sort?: SortPopupAds[];
  onSuccess?: () => void;
};

export type GetPopupAdsByIdPayload = {
  id: string;
  onSuccess?: (popupAds: PopupAdsListItem) => void;
};

export type CreatePopupAdsPayload = {
  image: string;
  startAt: string;
  endAt: string;
  name: string;
  link?: string;
  order?: number;
  isActive?: boolean;
  onSuccess?: (popupAds: PopupAdsListItem) => void;
};

export type UpdatePopupAdsPayload = {
  popupAdsId: string;
  image?: string;
  startAt?: string;
  endAt?: string;
  name?: string;
  link?: string | null;
  order?: number;
  isActive?: boolean;
  onSuccess?: (popupAds: PopupAdsListItem) => void;
};

export type DeletePopupAdsPayload = {
  id: string;
  onSuccess?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getPopupAdsListRequest = createAction<GetPopupAdsListPayload>(
  'popupAds/getPopupAdsListRequest'
);
export const getPopupAdsByIdRequest = createAction<GetPopupAdsByIdPayload>(
  'popupAds/getPopupAdsByIdRequest'
);
export const createPopupAdsRequest = createAction<CreatePopupAdsPayload>(
  'popupAds/createPopupAdsRequest'
);
export const updatePopupAdsRequest = createAction<UpdatePopupAdsPayload>(
  'popupAds/updatePopupAdsRequest'
);
export const deletePopupAdsRequest = createAction<DeletePopupAdsPayload>(
  'popupAds/deletePopupAdsRequest'
);

/**
 * PopupAds Slice
 */
export const popupAdsSlice = createSlice({
  name: 'popupAds',
  initialState,
  reducers: {
    // List
    setPopupAdsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setPopupAdsListSuccess: (
      state,
      action: PayloadAction<{
        popupAds: PopupAdsListItem[];
        pagination: PopupAdsPagination;
      }>
    ) => {
      state.popupAds = action.payload.popupAds;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },

    setPopupAdsListError: (state) => {
      state.loading = false;
    },

    // Create
    setCreatePopupAdsLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },

    setCreatePopupAdsSuccess: (state) => {
      state.createLoading = false;
    },

    setCreatePopupAdsError: (state) => {
      state.createLoading = false;
    },

    // Update
    setUpdatePopupAdsLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },

    setUpdatePopupAdsSuccess: (state, action: PayloadAction<PopupAdsListItem>) => {
      const index = state.popupAds.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.popupAds[index] = action.payload;
      }
      state.updateLoading = false;
    },

    setUpdatePopupAdsError: (state) => {
      state.updateLoading = false;
    },

    // Delete
    setDeletePopupAdsLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },

    setDeletePopupAdsSuccess: (state, action: PayloadAction<string>) => {
      state.popupAds = state.popupAds.filter((p) => p.id !== action.payload);
      state.deleteLoading = false;
    },

    setDeletePopupAdsError: (state) => {
      state.deleteLoading = false;
    },

    // Filters
    setPopupAdsFilters: (state, action: PayloadAction<FilterPopupAds>) => {
      state.filters = action.payload;
    },

    setPopupAdsSort: (state, action: PayloadAction<SortPopupAds[]>) => {
      state.sort = action.payload;
    },

    // Reset
    resetPopupAdsState: (state) => {
      state.popupAds = [];
      state.loading = false;
      state.pagination = initialState.pagination;
      state.filters = {};
      state.sort = [];
    },
  },
});

export const {
  setPopupAdsLoading,
  setPopupAdsListSuccess,
  setPopupAdsListError,
  setCreatePopupAdsLoading,
  setCreatePopupAdsSuccess,
  setCreatePopupAdsError,
  setUpdatePopupAdsLoading,
  setUpdatePopupAdsSuccess,
  setUpdatePopupAdsError,
  setDeletePopupAdsLoading,
  setDeletePopupAdsSuccess,
  setDeletePopupAdsError,
  setPopupAdsFilters,
  setPopupAdsSort,
  resetPopupAdsState,
} = popupAdsSlice.actions;

/**
 * Selectors
 */
export const selectPopupAdsList = (state: { popupAds: PopupAdsState }) => state.popupAds.popupAds;

export const selectPopupAdsLoading = (state: { popupAds: PopupAdsState }) => state.popupAds.loading;

export const selectCreatePopupAdsLoading = (state: { popupAds: PopupAdsState }) =>
  state.popupAds.createLoading;

export const selectUpdatePopupAdsLoading = (state: { popupAds: PopupAdsState }) =>
  state.popupAds.updateLoading;

export const selectDeletePopupAdsLoading = (state: { popupAds: PopupAdsState }) =>
  state.popupAds.deleteLoading;

export const selectPopupAdsPagination = (state: { popupAds: PopupAdsState }) =>
  state.popupAds.pagination;

export const selectPopupAdsFilters = (state: { popupAds: PopupAdsState }) => state.popupAds.filters;

export default popupAdsSlice.reducer;
