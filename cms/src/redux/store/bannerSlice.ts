import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';

import type { BannerListItem, ResponsiveMedia } from 'src/types/gen/shared/shared/banners/banner';
import type {
  FilterBanner,
  SortBanner,
  ReorderBannerItem,
} from 'src/types/gen/cms/cms/banners/banner';
import { BannerPosition, BannerMediaType } from 'src/types/gen/shared/shared/common/enums';

/**
 * Banner Pagination
 */
export interface BannerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Banner State
 */
export interface BannerState {
  banners: BannerListItem[];
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  reorderLoading: boolean;
  pagination: BannerPagination;
  filters: FilterBanner;
  sort: SortBanner[];
}

const initialState: BannerState = {
  banners: [],
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  reorderLoading: false,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  sort: [],
};

/**
 * Saga Action Payload Types
 */
export type GetBannersPayload = {
  page?: number;
  limit?: number;
  filters?: FilterBanner;
  sort?: SortBanner[];
  onSuccess?: () => void;
};

export type GetBannerByIdPayload = {
  id: string;
  onSuccess?: (banner: BannerListItem) => void;
};

export type CreateBannerPayload = {
  position: BannerPosition;
  mediaType: BannerMediaType;
  media: ResponsiveMedia;
  link?: string;
  order: number;
  isActive?: boolean;
  onSuccess?: (banner: BannerListItem) => void;
};

export type UpdateBannerPayload = {
  bannerId: string;
  position?: BannerPosition;
  mediaType?: BannerMediaType;
  media?: ResponsiveMedia;
  link?: string;
  order?: number;
  isActive?: boolean;
  onSuccess?: (banner: BannerListItem) => void;
};

export type DeleteBannerPayload = {
  id: string;
  onSuccess?: () => void;
};

export type ReorderBannersPayload = {
  banners: ReorderBannerItem[];
  onSuccess?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getBannersRequest = createAction<GetBannersPayload>('banner/getBannersRequest');
export const getBannerByIdRequest = createAction<GetBannerByIdPayload>(
  'banner/getBannerByIdRequest'
);
export const createBannerRequest = createAction<CreateBannerPayload>('banner/createBannerRequest');
export const updateBannerRequest = createAction<UpdateBannerPayload>('banner/updateBannerRequest');
export const deleteBannerRequest = createAction<DeleteBannerPayload>('banner/deleteBannerRequest');
export const reorderBannersRequest = createAction<ReorderBannersPayload>(
  'banner/reorderBannersRequest'
);

/**
 * Banner Slice
 */
export const bannerSlice = createSlice({
  name: 'banner',
  initialState,
  reducers: {
    // List banners
    setBannerLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setBannersSuccess: (
      state,
      action: PayloadAction<{
        banners: BannerListItem[];
        pagination: BannerPagination;
      }>
    ) => {
      state.banners = action.payload.banners;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },

    setBannerError: (state) => {
      state.loading = false;
    },

    // Create banner
    setCreateBannerLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },

    setCreateBannerSuccess: (state) => {
      state.createLoading = false;
    },

    setCreateBannerError: (state) => {
      state.createLoading = false;
    },

    // Update banner
    setUpdateBannerLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },

    setUpdateBannerSuccess: (state, action: PayloadAction<BannerListItem>) => {
      const index = state.banners.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.banners[index] = action.payload;
      }
      state.updateLoading = false;
    },

    setUpdateBannerError: (state) => {
      state.updateLoading = false;
    },

    // Delete banner
    setDeleteBannerLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },

    setDeleteBannerSuccess: (state, action: PayloadAction<string>) => {
      state.banners = state.banners.filter((b) => b.id !== action.payload);
      state.deleteLoading = false;
    },

    setDeleteBannerError: (state) => {
      state.deleteLoading = false;
    },

    // Reorder banners
    setReorderBannersLoading: (state, action: PayloadAction<boolean>) => {
      state.reorderLoading = action.payload;
    },

    setReorderBannersSuccess: (state) => {
      state.reorderLoading = false;
    },

    setReorderBannersError: (state) => {
      state.reorderLoading = false;
    },

    // Filters
    setFilters: (state, action: PayloadAction<FilterBanner>) => {
      state.filters = action.payload;
    },

    setSort: (state, action: PayloadAction<SortBanner[]>) => {
      state.sort = action.payload;
    },

    // Reset state
    resetBannerState: (state) => {
      state.banners = [];
      state.loading = false;
      state.pagination = initialState.pagination;
      state.filters = {};
      state.sort = [];
    },
  },
});

export const {
  setBannerLoading,
  setBannersSuccess,
  setBannerError,
  setCreateBannerLoading,
  setCreateBannerSuccess,
  setCreateBannerError,
  setUpdateBannerLoading,
  setUpdateBannerSuccess,
  setUpdateBannerError,
  setDeleteBannerLoading,
  setDeleteBannerSuccess,
  setDeleteBannerError,
  setReorderBannersLoading,
  setReorderBannersSuccess,
  setReorderBannersError,
  setFilters,
  setSort,
  resetBannerState,
} = bannerSlice.actions;

/**
 * Selectors
 */
export const selectBanners = (state: { banner: BannerState }) => state.banner.banners;

export const selectBannerLoading = (state: { banner: BannerState }) => state.banner.loading;

export const selectCreateBannerLoading = (state: { banner: BannerState }) =>
  state.banner.createLoading;

export const selectUpdateBannerLoading = (state: { banner: BannerState }) =>
  state.banner.updateLoading;

export const selectDeleteBannerLoading = (state: { banner: BannerState }) =>
  state.banner.deleteLoading;

export const selectReorderBannersLoading = (state: { banner: BannerState }) =>
  state.banner.reorderLoading;

export const selectBannerPagination = (state: { banner: BannerState }) => state.banner.pagination;

export const selectBannerFilters = (state: { banner: BannerState }) => state.banner.filters;

export const selectBannerSort = (state: { banner: BannerState }) => state.banner.sort;

export default bannerSlice.reducer;

// Re-export BannerPosition and BannerMediaType for convenience
export { BannerPosition, BannerMediaType };
