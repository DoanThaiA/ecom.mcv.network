import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type {
  CreateAffiliateRequest,
  UpdateAffiliateRequest,
  QueryAffiliatesRequest,
  QueryAffiliatesResponse,
} from 'src/types/gen/cms/cms/affiliates/affiliate';
import type {
  Affiliate,
  AffiliateListItem,
} from 'src/types/gen/shared/shared/affiliates/affiliate';

/**
 * Affiliates Pagination
 */
export interface AffiliatesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

/**
 * Affiliates State
 */
export interface AffiliatesState {
  affiliates: AffiliateListItem[];
  currentAffiliate: Affiliate | null;
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  pagination: AffiliatesPagination;
}

const initialState: AffiliatesState = {
  affiliates: [],
  currentAffiliate: null,
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
  },
};

/**
 * Saga Action Payload Types
 * Using Type Parameter Pattern (AGENTS.md Rule #14)
 */
export type QueryAffiliatesPayload = QueryAffiliatesRequest;

export type CreateAffiliatePayload = {
  data: CreateAffiliateRequest;
  onSuccess?: (createdAffiliate: Affiliate) => void;
};

export type UpdateAffiliatePayload = {
  data: UpdateAffiliateRequest;
  onSuccess?: () => void;
};

export type DeleteAffiliatePayload = {
  affiliateId: string;
  onSuccess?: () => void;
};

export type BulkDeleteAffiliatesPayload = {
  affiliateIds: string[];
  onSuccess?: () => void;
};

export type GetAffiliatePayload = {
  affiliateId: string;
  onSuccess?: (affiliate: Affiliate) => void;
};

/**
 * Saga Actions
 * Using Type Parameter Pattern (createAction<PayloadType>)
 */
export const queryAffiliatesRequest =
  createAction<QueryAffiliatesPayload>('affiliates/queryRequest');
export const createAffiliateRequest = createAction<CreateAffiliatePayload>(
  'affiliates/createRequest'
);
export const updateAffiliateRequest = createAction<UpdateAffiliatePayload>(
  'affiliates/updateRequest'
);
export const deleteAffiliateRequest = createAction<DeleteAffiliatePayload>(
  'affiliates/deleteRequest'
);
export const bulkDeleteAffiliatesRequest = createAction<BulkDeleteAffiliatesPayload>(
  'affiliates/bulkDeleteRequest'
);
export const getAffiliateRequest = createAction<GetAffiliatePayload>('affiliates/getRequest');

/**
 * Affiliates Slice
 */
const affiliatesSlice = createSlice({
  name: 'affiliates',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setQuerySuccess: (state, action: PayloadAction<QueryAffiliatesResponse>) => {
      state.affiliates = action.payload.data;
      state.pagination = {
        page: action.payload.page,
        limit: action.payload.limit,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
        hasNextPage: action.payload.hasNextPage,
      };
      state.loading = false;
    },
    setCurrentAffiliate: (state, action: PayloadAction<Affiliate | null>) => {
      state.currentAffiliate = action.payload;
    },
    setCreateLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },
    setUpdateLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },
    setDeleteLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },
  },
});

// Export actions
export const {
  setLoading,
  setQuerySuccess,
  setCurrentAffiliate,
  setCreateLoading,
  setUpdateLoading,
  setDeleteLoading,
} = affiliatesSlice.actions;

// Export selectors
export const selectAffiliates = (state: any) => state.affiliates.affiliates;
export const selectLoading = (state: any) => state.affiliates.loading;
export const selectPagination = (state: any) => state.affiliates.pagination;
export const selectCurrentAffiliate = (state: any) => state.affiliates.currentAffiliate;
export const selectCreateLoading = (state: any) => state.affiliates.createLoading;
export const selectUpdateLoading = (state: any) => state.affiliates.updateLoading;
export const selectDeleteLoading = (state: any) => state.affiliates.deleteLoading;

// Export reducer
export default affiliatesSlice.reducer;
