import { call, put, takeLatest, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { reviewRepository } from 'src/repositories/review.repository';
import type { GetReviewsRequest, CreateCmsReviewRequest } from 'src/types/reviews';
import {
  getReviewsRequest,
  getReviewsSuccess,
  getReviewsFailure,
  toggleVisibilityRequest,
  toggleVisibilitySuccess,
  toggleVisibilityFailure,
  createReviewRequest,
  createReviewSuccess,
  createReviewFailure,
  selectReviewPagination,
  selectReviewFilters,
} from '../store/reviewSlice';

function* getReviewsSaga(action: PayloadAction<GetReviewsRequest>) {
  try {
    const response: Awaited<ReturnType<typeof reviewRepository.getReviews>> = yield call(
      reviewRepository.getReviews,
      action.payload
    );
    yield put(getReviewsSuccess(response));
  } catch (error: any) {
    yield put(getReviewsFailure(error.message || 'Failed to fetch reviews'));
  }
}

function* toggleVisibilitySaga(
  action: PayloadAction<{ reviewId: string; productId: string; visible?: boolean }>
) {
  try {
    const { reviewId, productId, visible } = action.payload;
    yield call(reviewRepository.toggleVisibility, reviewId, productId, { visible });

    // Determine new status based on visible param or toggle
    const newStatus = visible !== undefined ? (visible ? 'visible' : 'hidden') : 'visible';

    yield put(toggleVisibilitySuccess({ reviewId, productId, newStatus }));
  } catch (error: any) {
    yield put(toggleVisibilityFailure(error.message || 'Failed to toggle visibility'));
  }
}

function* createReviewSaga(action: PayloadAction<CreateCmsReviewRequest>) {
  try {
    yield call(reviewRepository.createReview, action.payload);
    yield put(createReviewSuccess());

    // Refresh reviews list after create
    const pagination: ReturnType<typeof selectReviewPagination> =
      yield select(selectReviewPagination);
    const filters: ReturnType<typeof selectReviewFilters> = yield select(selectReviewFilters);
    yield put(getReviewsRequest({ page: pagination.page, limit: pagination.limit, filters }));
  } catch (error: any) {
    yield put(createReviewFailure(error.message || 'Failed to create review'));
  }
}

export default function* reviewSaga() {
  yield takeLatest(getReviewsRequest.type, getReviewsSaga);
  yield takeLatest(toggleVisibilityRequest.type, toggleVisibilitySaga);
  yield takeLatest(createReviewRequest.type, createReviewSaga);
}
