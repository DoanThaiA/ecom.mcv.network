import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  FrontendReview,
  ReviewStatus,
  CreateReviewPayload,
} from '@/lib/utils/reviewConverter';
import type { ReviewStats } from '@/types/gen/shared/shared/reviews/review';
import type { PaginatedReviews } from '@/lib/repositories/review.repository';

export interface FetchProductReviewsPayload {
  productId: string;
  page?: number;
  sortBy?: string;
}

interface ReviewState {
  // Submit review
  isSubmitting: boolean;
  submitError: string | null;

  // Product reviews (for product detail page)
  productReviews: PaginatedReviews | null;
  productReviewsLoading: boolean;
  productReviewsError: string | null;

  // Review stats (for product detail page)
  reviewStats: ReviewStats | null;
  reviewStatsLoading: boolean;

  // User reviews (for My Reviews page)
  userReviews: FrontendReview[];
  userReviewsLoading: boolean;
  userReviewsError: string | null;

  // Review status tracking (which products reviewed)
  reviewStatuses: ReviewStatus[];
  reviewStatusesLoading: boolean;

  // Order review (for checking if order has been reviewed)
  orderReview: FrontendReview[] | null;
  orderReviewLoading: boolean;

  // Check if order has been reviewed (for disabling write review button)
  reviewedOrders: Record<string, boolean>;
  checkingOrders: Record<string, boolean>;
}

const initialState: ReviewState = {
  isSubmitting: false,
  submitError: null,

  productReviews: null,
  productReviewsLoading: false,
  productReviewsError: null,

  reviewStats: null,
  reviewStatsLoading: false,

  userReviews: [],
  userReviewsLoading: false,
  userReviewsError: null,

  reviewStatuses: [],
  reviewStatusesLoading: false,

  orderReview: null,
  orderReviewLoading: false,

  reviewedOrders: {},
  checkingOrders: {},
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    // Submit review actions
    submitReviewRequest: (
      state,
      _action: PayloadAction<CreateReviewPayload>
    ) => {
      state.isSubmitting = true;
      state.submitError = null;
    },
    submitReviewSuccess: (state, action: PayloadAction<FrontendReview>) => {
      state.isSubmitting = false;
      state.submitError = null;
      // Add new review to user reviews if loaded
      if (state.userReviews.length > 0) {
        state.userReviews.unshift(action.payload);
      }
    },
    submitReviewFailure: (state, action: PayloadAction<string>) => {
      state.isSubmitting = false;
      state.submitError = action.payload;
    },

    // Fetch product reviews actions
    fetchProductReviewsRequest: (
      state,
      _action: PayloadAction<FetchProductReviewsPayload>
    ) => {
      state.productReviewsLoading = true;
      state.productReviewsError = null;
    },
    fetchProductReviewsSuccess: (
      state,
      action: PayloadAction<PaginatedReviews>
    ) => {
      state.productReviews = action.payload;
      state.productReviewsLoading = false;
      state.productReviewsError = null;
    },
    fetchProductReviewsFailure: (state, action: PayloadAction<string>) => {
      state.productReviewsLoading = false;
      state.productReviewsError = action.payload;
    },

    // Load more reviews (pagination)
    loadMoreReviewsSuccess: (state, action: PayloadAction<PaginatedReviews>) => {
      if (state.productReviews) {
        state.productReviews = {
          ...action.payload,
          reviews: [
            ...state.productReviews.reviews,
            ...action.payload.reviews,
          ],
        };
      } else {
        state.productReviews = action.payload;
      }
    },

    // Fetch review stats actions
    fetchReviewStatsRequest: (state, _action: PayloadAction<string>) => {
      state.reviewStatsLoading = true;
    },
    fetchReviewStatsSuccess: (state, action: PayloadAction<ReviewStats>) => {
      state.reviewStats = action.payload;
      state.reviewStatsLoading = false;
    },

    // Fetch user reviews actions
    fetchUserReviewsRequest: (state) => {
      state.userReviewsLoading = true;
      state.userReviewsError = null;
    },
    fetchUserReviewsSuccess: (state, action: PayloadAction<FrontendReview[]>) => {
      state.userReviews = action.payload;
      state.userReviewsLoading = false;
      state.userReviewsError = null;
    },
    fetchUserReviewsFailure: (state, action: PayloadAction<string>) => {
      state.userReviewsLoading = false;
      state.userReviewsError = action.payload;
    },

    // Fetch review statuses actions
    fetchReviewStatusesRequest: (state, _action: PayloadAction<string>) => {
      state.reviewStatusesLoading = true;
    },
    fetchReviewStatusesSuccess: (
      state,
      action: PayloadAction<ReviewStatus[]>
    ) => {
      state.reviewStatuses = action.payload;
      state.reviewStatusesLoading = false;
    },

    // Fetch order review actions
    fetchOrderReviewRequest: (state, _action: PayloadAction<string>) => {
      state.orderReviewLoading = true;
      state.orderReview = null;
    },
    fetchOrderReviewSuccess: (state, action: PayloadAction<FrontendReview[] | null>) => {
      state.orderReview = action.payload;
      state.orderReviewLoading = false;
    },

    // Check if order has been reviewed actions
    checkOrderReviewedRequest: (state, action: PayloadAction<string>) => {
      // Ensure checkingOrders exists (for state migration)
      if (!state.checkingOrders) {
        state.checkingOrders = {};
      }
      state.checkingOrders[action.payload] = true;
    },
    checkOrderReviewedSuccess: (state, action: PayloadAction<{ orderNumber: string; reviewed: boolean }>) => {
      // Ensure reviewedOrders and checkingOrders exist (for state migration)
      if (!state.reviewedOrders) {
        state.reviewedOrders = {};
      }
      if (!state.checkingOrders) {
        state.checkingOrders = {};
      }
      state.reviewedOrders[action.payload.orderNumber] = action.payload.reviewed;
      state.checkingOrders[action.payload.orderNumber] = false;
    },

    // Clear review state
    clearReviewState: (state) => {
      state.productReviews = null;
      state.reviewStats = null;
      state.productReviewsError = null;
      state.orderReview = null;
      state.reviewedOrders = {};
      state.checkingOrders = {};
    },
  },
});

export const {
  submitReviewRequest,
  submitReviewSuccess,
  submitReviewFailure,
  fetchProductReviewsRequest,
  fetchProductReviewsSuccess,
  fetchProductReviewsFailure,
  loadMoreReviewsSuccess,
  fetchReviewStatsRequest,
  fetchReviewStatsSuccess,
  fetchUserReviewsRequest,
  fetchUserReviewsSuccess,
  fetchUserReviewsFailure,
  fetchReviewStatusesRequest,
  fetchReviewStatusesSuccess,
  fetchOrderReviewRequest,
  fetchOrderReviewSuccess,
  checkOrderReviewedRequest,
  checkOrderReviewedSuccess,
  clearReviewState,
} = reviewSlice.actions;

export default reviewSlice.reducer;
