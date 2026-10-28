import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type {
  CmsProductReview,
  GetReviewsRequest,
  ReviewFilters,
  CreateCmsReviewRequest,
} from 'src/types/reviews';

interface ReviewState {
  reviews: CmsProductReview[];
  loading: boolean;
  creating: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: ReviewFilters;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  creating: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  filters: {
    sortBy: 'newest',
  },
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    // Get reviews
    getReviewsRequest: (state, _action: PayloadAction<GetReviewsRequest>) => {
      state.loading = true;
      state.error = null;
    },
    getReviewsSuccess: (
      state,
      action: PayloadAction<{
        data: CmsProductReview[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    ) => {
      state.loading = false;
      state.reviews = action.payload.data;
      state.pagination = {
        total: action.payload.total,
        page: action.payload.page,
        limit: action.payload.limit,
        totalPages: action.payload.totalPages,
      };
    },
    getReviewsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Toggle visibility
    toggleVisibilityRequest: (
      state,
      _action: PayloadAction<{
        reviewId: string;
        productId: string;
        visible?: boolean;
      }>
    ) => {
      state.loading = true;
    },
    toggleVisibilitySuccess: (
      state,
      action: PayloadAction<{ reviewId: string; productId: string; newStatus: string }>
    ) => {
      state.loading = false;
      // Update local state
      const review = state.reviews.find(
        (r) => r.reviewId === action.payload.reviewId && r.productId === action.payload.productId
      );
      if (review) {
        review.status = action.payload.newStatus;
      }
    },
    toggleVisibilityFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Set filters
    setFilters: (state, action: PayloadAction<ReviewFilters>) => {
      state.filters = action.payload;
    },

    // Create review (seeding)
    createReviewRequest: (state, _action: PayloadAction<CreateCmsReviewRequest>) => {
      state.creating = true;
      state.error = null;
    },
    createReviewSuccess: (state) => {
      state.creating = false;
    },
    createReviewFailure: (state, action: PayloadAction<string>) => {
      state.creating = false;
      state.error = action.payload;
    },

    // Reset
    resetReviewState: () => initialState,
  },
});

export const {
  getReviewsRequest,
  getReviewsSuccess,
  getReviewsFailure,
  toggleVisibilityRequest,
  toggleVisibilitySuccess,
  toggleVisibilityFailure,
  createReviewRequest,
  createReviewSuccess,
  createReviewFailure,
  setFilters,
  resetReviewState,
} = reviewSlice.actions;

// Selectors
export const selectReviews = (state: RootState) => state.review.reviews;
export const selectReviewLoading = (state: RootState) => state.review.loading;
export const selectReviewCreating = (state: RootState) => state.review.creating;
export const selectReviewPagination = (state: RootState) => state.review.pagination;
export const selectReviewFilters = (state: RootState) => state.review.filters;

export default reviewSlice.reducer;
