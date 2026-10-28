import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';

import type {
  CmsUserData,
  FilterCmsUserDto,
  SortCmsUserDto,
  CreateCmsUserData,
  UpdateCmsUserData,
} from 'src/repositories/cms-user.repository';

// ─── State Types ──────────────────────────────────────────────────────────

export interface CmsUserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CmsUserState {
  cmsUsers: CmsUserData[];
  currentCmsUser: CmsUserData | null;
  loading: boolean;
  currentLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  pagination: CmsUserPagination;
  filters: FilterCmsUserDto;
  sort: SortCmsUserDto[];
}

const initialState: CmsUserState = {
  cmsUsers: [],
  currentCmsUser: null,
  loading: false,
  currentLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  filters: {},
  sort: [],
};

// ─── Saga Action Payload Types ────────────────────────────────────────────

export type GetCmsUsersPayload = {
  page?: number;
  limit?: number;
  filters?: FilterCmsUserDto;
  sort?: SortCmsUserDto[];
  onSuccess?: () => void;
};

export type GetCmsUserByIdPayload = {
  id: string;
  onSuccess?: (cmsUser: CmsUserData) => void;
};

export type CreateCmsUserPayload = {
  data: CreateCmsUserData;
  onSuccess?: (cmsUser: CmsUserData) => void;
};

export type UpdateCmsUserPayload = {
  id: string;
  data: UpdateCmsUserData;
  onSuccess?: (cmsUser: CmsUserData) => void;
};

export type DeleteCmsUserPayload = {
  id: string;
  onSuccess?: () => void;
};

// ─── Saga Actions ─────────────────────────────────────────────────────────

export const getCmsUsersRequest = createAction<GetCmsUsersPayload>('cmsUser/getCmsUsersRequest');
export const getCmsUserByIdRequest = createAction<GetCmsUserByIdPayload>(
  'cmsUser/getCmsUserByIdRequest'
);
export const createCmsUserRequest = createAction<CreateCmsUserPayload>(
  'cmsUser/createCmsUserRequest'
);
export const updateCmsUserRequest = createAction<UpdateCmsUserPayload>(
  'cmsUser/updateCmsUserRequest'
);
export const deleteCmsUserRequest = createAction<DeleteCmsUserPayload>(
  'cmsUser/deleteCmsUserRequest'
);

// ─── Slice ────────────────────────────────────────────────────────────────

export const cmsUserSlice = createSlice({
  name: 'cmsUser',
  initialState,
  reducers: {
    setCmsUserLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCmsUsersSuccess: (
      state,
      action: PayloadAction<{ cmsUsers: CmsUserData[]; pagination: CmsUserPagination }>
    ) => {
      state.cmsUsers = action.payload.cmsUsers;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },
    setCmsUserError: (state) => {
      state.loading = false;
    },
    setCurrentCmsUserLoading: (state, action: PayloadAction<boolean>) => {
      state.currentLoading = action.payload;
    },
    setCurrentCmsUserSuccess: (state, action: PayloadAction<CmsUserData>) => {
      state.currentCmsUser = action.payload;
      state.currentLoading = false;
    },
    setCurrentCmsUserError: (state) => {
      state.currentLoading = false;
    },
    clearCurrentCmsUser: (state) => {
      state.currentCmsUser = null;
    },
    setCreateCmsUserLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },
    setCreateCmsUserSuccess: (state) => {
      state.createLoading = false;
    },
    setCreateCmsUserError: (state) => {
      state.createLoading = false;
    },
    setUpdateCmsUserLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },
    setUpdateCmsUserSuccess: (state, action: PayloadAction<CmsUserData>) => {
      if (state.currentCmsUser?.id === action.payload.id) {
        state.currentCmsUser = action.payload;
      }
      state.updateLoading = false;
    },
    setUpdateCmsUserError: (state) => {
      state.updateLoading = false;
    },
    setDeleteCmsUserLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },
    setDeleteCmsUserSuccess: (state, action: PayloadAction<string>) => {
      state.cmsUsers = state.cmsUsers.filter((u) => u.id !== action.payload);
      if (state.currentCmsUser?.id === action.payload) {
        state.currentCmsUser = null;
      }
      state.deleteLoading = false;
    },
    setDeleteCmsUserError: (state) => {
      state.deleteLoading = false;
    },
    setFilters: (state, action: PayloadAction<FilterCmsUserDto>) => {
      state.filters = action.payload;
    },
    setSort: (state, action: PayloadAction<SortCmsUserDto[]>) => {
      state.sort = action.payload;
    },
    resetCmsUserState: (state) => {
      state.cmsUsers = [];
      state.loading = false;
      state.pagination = initialState.pagination;
      state.filters = {};
      state.sort = [];
    },
  },
});

export const {
  setCmsUserLoading,
  setCmsUsersSuccess,
  setCmsUserError,
  setCurrentCmsUserLoading,
  setCurrentCmsUserSuccess,
  setCurrentCmsUserError,
  clearCurrentCmsUser,
  setCreateCmsUserLoading,
  setCreateCmsUserSuccess,
  setCreateCmsUserError,
  setUpdateCmsUserLoading,
  setUpdateCmsUserSuccess,
  setUpdateCmsUserError,
  setDeleteCmsUserLoading,
  setDeleteCmsUserSuccess,
  setDeleteCmsUserError,
  setFilters,
  setSort,
  resetCmsUserState,
} = cmsUserSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────

export const selectCmsUsers = (state: { cmsUser: CmsUserState }) => state.cmsUser.cmsUsers;
export const selectCurrentCmsUser = (state: { cmsUser: CmsUserState }) =>
  state.cmsUser.currentCmsUser;
export const selectCmsUserLoading = (state: { cmsUser: CmsUserState }) => state.cmsUser.loading;
export const selectCurrentCmsUserLoading = (state: { cmsUser: CmsUserState }) =>
  state.cmsUser.currentLoading;
export const selectCreateCmsUserLoading = (state: { cmsUser: CmsUserState }) =>
  state.cmsUser.createLoading;
export const selectUpdateCmsUserLoading = (state: { cmsUser: CmsUserState }) =>
  state.cmsUser.updateLoading;
export const selectDeleteCmsUserLoading = (state: { cmsUser: CmsUserState }) =>
  state.cmsUser.deleteLoading;
export const selectCmsUserPagination = (state: { cmsUser: CmsUserState }) =>
  state.cmsUser.pagination;
export const selectCmsUserFilters = (state: { cmsUser: CmsUserState }) => state.cmsUser.filters;

export default cmsUserSlice.reducer;
