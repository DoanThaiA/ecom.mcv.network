/* eslint-disable no-console */
import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { reviewRepository } from '@/lib/repositories/review.repository';
import type { PaginatedReviews } from '@/lib/repositories/review.repository';
import { showErrorToast, showSuccessToast } from '@/lib/helpers/toastHelper';
import type {
  FrontendReview,
  ReviewStatus,
  CreateReviewPayload,
} from '@/lib/utils/reviewConverter';
import type { ReviewStats } from '@/types/gen/shared/shared/reviews/review';
import type { FetchProductReviewsPayload } from '../slices/reviewSlice';
import {
  submitReviewRequest,
  submitReviewSuccess,
  submitReviewFailure,
  fetchProductReviewsRequest,
  fetchProductReviewsSuccess,
  fetchProductReviewsFailure,
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
} from '../slices/reviewSlice';

// Submit review saga
function* submitReviewSaga(action: PayloadAction<CreateReviewPayload>) {
  try {
    const { onSuccess, ...reviewData } = action.payload;

    const review: FrontendReview = yield call(() =>
      reviewRepository.createReview(reviewData)
    );

    yield put(submitReviewSuccess(review));
    showSuccessToast('reviews.submitSuccess', { duration: 5000 });

    // Call success callback (close dialog, reset form)
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    console.error('Submit review error:', error);
    showErrorToast(error);
    yield put(submitReviewFailure('reviews.submitError'));
  }
}

// Fetch product reviews saga
function* fetchProductReviewsSaga(
  action: PayloadAction<FetchProductReviewsPayload>
) {
  try {
    const { productId, page = 1, sortBy } = action.payload;

    const reviews: PaginatedReviews = yield call(() =>
      reviewRepository.getProductReviews(productId, page, undefined, sortBy)
    );

    // Always replace reviews for pagination (not accumulate)
    yield put(fetchProductReviewsSuccess(reviews));
  } catch (error) {
    console.error('Fetch product reviews error:', error);
    showErrorToast(error);
    yield put(fetchProductReviewsFailure('Failed to fetch reviews'));
  }
}

// Fetch review stats saga
function* fetchReviewStatsSaga(action: PayloadAction<string>) {
  try {
    const productId = action.payload;

    const stats: ReviewStats = yield call(() =>
      reviewRepository.getReviewStats(productId)
    );

    yield put(fetchReviewStatsSuccess(stats));
  } catch (error) {
    console.error('Fetch review stats error:', error);
    // Don't show error toast for stats - fail silently
  }
}

// Fetch user reviews saga
function* fetchUserReviewsSaga() {
  try {
    const reviews: FrontendReview[] = yield call(() =>
      reviewRepository.getUserReviews()
    );

    yield put(fetchUserReviewsSuccess(reviews));
  } catch (error) {
    console.error('Fetch user reviews error:', error);
    showErrorToast(error);
    yield put(fetchUserReviewsFailure('Failed to fetch your reviews'));
  }
}

// Fetch review statuses saga
function* fetchReviewStatusesSaga(action: PayloadAction<string>) {
  try {
    const orderNumber = action.payload;

    const statuses: ReviewStatus[] = yield call(() =>
      reviewRepository.getReviewStatuses(orderNumber)
    );

    yield put(fetchReviewStatusesSuccess(statuses));
  } catch (error) {
    console.error('Fetch review statuses error:', error);
    // Don't show error toast - fail silently, buttons just won't update
  }
}

// Fetch order review saga
function* fetchOrderReviewSaga(action: PayloadAction<string>) {
  try {
    const orderNumber = action.payload;

    const reviews: FrontendReview[] | null = yield call(() =>
      reviewRepository.getOrderReview(orderNumber)
    );

    yield put(fetchOrderReviewSuccess(reviews));

    // Also update review statuses based on the review data
    if (reviews && reviews.length > 0) {
      const statuses: ReviewStatus[] = reviews.map((review) => ({
        productId: review.productId,
        variantId: review.variantId,
        hasReview: true,
        reviewId: review.id,
      }));
      yield put(fetchReviewStatusesSuccess(statuses));
    } else {
      // No review found - clear statuses
      yield put(fetchReviewStatusesSuccess([]));
    }
  } catch (error) {
    console.error('Fetch order review error:', error);
    // Don't show error toast - fail silently
    yield put(fetchOrderReviewSuccess(null));
    yield put(fetchReviewStatusesSuccess([]));
  }
}

// Check if order has been reviewed saga
function* checkOrderReviewedSaga(action: PayloadAction<string>) {
  const orderNumber = action.payload;
  try {
    const reviewed: boolean = yield call(() =>
      reviewRepository.checkOrderReviewed(orderNumber)
    );

    // Include orderNumber in success payload
    yield put(checkOrderReviewedSuccess({ orderNumber, reviewed }));
  } catch (error) {
    console.error('Check order reviewed error:', error);
    // Default to false on error - allow reviewing
    yield put(checkOrderReviewedSuccess({ orderNumber, reviewed: false }));
  }
}

// Root review saga
export function* watchReview() {
  yield takeLatest(submitReviewRequest.type, submitReviewSaga);
  yield takeLatest(fetchProductReviewsRequest.type, fetchProductReviewsSaga);
  yield takeLatest(fetchReviewStatsRequest.type, fetchReviewStatsSaga);
  yield takeLatest(fetchUserReviewsRequest.type, fetchUserReviewsSaga);
  yield takeLatest(fetchReviewStatusesRequest.type, fetchReviewStatusesSaga);
  yield takeLatest(fetchOrderReviewRequest.type, fetchOrderReviewSaga);
  // Use takeEvery instead of takeLatest to allow multiple concurrent checks
  // This prevents race conditions where one order check cancels another
  yield takeEvery(checkOrderReviewedRequest.type, checkOrderReviewedSaga);
}
