import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { topicRepository } from 'src/repositories/topic.repository';
import type { Topic } from 'src/types/gen/shared/shared/topics/topic';
import type { QueryTopicsResponse } from 'src/types/gen/cms/cms/topics/topic';
import { showError, showSuccess } from 'src/utils/toast';
import {
  getTopicsRequest,
  getTopicByIdRequest,
  createTopicRequest,
  updateTopicRequest,
  deleteTopicRequest,
  addProductsToTopicRequest,
  removeProductsFromTopicRequest,
  updateTopicWithProductsRequest,
  reorderTopicProductsRequest,
  setTopicLoading,
  setTopicsSuccess,
  setTopicError,
  setCurrentTopicLoading,
  setCurrentTopicSuccess,
  setCurrentTopicError,
  setCreateTopicLoading,
  setCreateTopicSuccess,
  setCreateTopicError,
  setUpdateTopicLoading,
  setUpdateTopicSuccess,
  setUpdateTopicError,
  setDeleteTopicLoading,
  setDeleteTopicSuccess,
  setDeleteTopicError,
  setAddProductsLoading,
  setAddProductsSuccess,
  setAddProductsError,
  setRemoveProductsLoading,
  setRemoveProductsSuccess,
  setRemoveProductsError,
  type GetTopicsPayload,
  type GetTopicByIdPayload,
  type CreateTopicPayload,
  type UpdateTopicPayload,
  type DeleteTopicPayload,
  type AddProductsToTopicPayload,
  type RemoveProductsFromTopicPayload,
  type UpdateTopicWithProductsPayload,
  type ReorderTopicProductsPayload,
} from '../store/topicSlice';

/**
 * Get Topics Saga
 * Fetches topics with filters and pagination
 */
function* getTopicsSaga(action: PayloadAction<GetTopicsPayload>) {
  const { page = 1, limit = 10, search, status } = action.payload;

  try {
    yield put(setTopicLoading(true));

    // Build filters
    const filters: { search?: string; status?: typeof status } = {};
    if (search) {
      filters.search = search;
    }
    if (status) {
      filters.status = status;
    }

    // Call API to get topics
    const response: QueryTopicsResponse = yield call(topicRepository.getTopics, {
      page,
      limit,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      sort: [{ orderBy: 'order', order: 'asc' }],
    });

    // Update state with topics and pagination
    yield put(
      setTopicsSuccess({
        topics: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
      })
    );
  } catch (error) {
    yield put(setTopicError());
    showError(error);
  }
}

/**
 * Get Topic By ID Saga
 * Fetches a single topic by ID
 */
function* getTopicByIdSaga(action: PayloadAction<GetTopicByIdPayload>) {
  const { id } = action.payload;

  try {
    yield put(setCurrentTopicLoading(true));

    // Call API to get topic by ID
    const topic: Topic = yield call(topicRepository.getTopicById, id);

    // Update state with topic
    yield put(setCurrentTopicSuccess(topic));
  } catch (error) {
    yield put(setCurrentTopicError());
    showError(error);
  }
}

/**
 * Create Topic Saga
 * Creates a new topic
 */
function* createTopicSaga(action: PayloadAction<CreateTopicPayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setCreateTopicLoading(true));

    // Call API to create topic
    const topic: Topic = yield call(topicRepository.createTopic, data);

    // Update state with new topic
    yield put(setCreateTopicSuccess(topic));
    showSuccess(i18next.t('createTopicSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess(topic);
    }
  } catch (error) {
    yield put(setCreateTopicError());
    showError(error);
  }
}

/**
 * Update Topic Saga
 * Updates an existing topic
 */
function* updateTopicSaga(action: PayloadAction<UpdateTopicPayload>) {
  const { id, data, onSuccess } = action.payload;

  try {
    yield put(setUpdateTopicLoading(true));

    // Call API to update topic
    const topic: Topic = yield call(topicRepository.updateTopic, id, data);

    // Update state with updated topic
    yield put(setUpdateTopicSuccess(topic));
    showSuccess(i18next.t('updateTopicSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess(topic);
    }
  } catch (error) {
    yield put(setUpdateTopicError());
    showError(error);
  }
}

/**
 * Delete Topic Saga
 * Deletes a topic
 */
function* deleteTopicSaga(action: PayloadAction<DeleteTopicPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setDeleteTopicLoading(true));

    // Call API to delete topic
    yield call(topicRepository.deleteTopic, id);

    // Update state - remove deleted topic
    yield put(setDeleteTopicSuccess(id));
    showSuccess(i18next.t('deleteTopicSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setDeleteTopicError());
    showError(error);
  }
}

/**
 * Add Products To Topic Saga
 * Adds products to a topic
 */
function* addProductsToTopicSaga(action: PayloadAction<AddProductsToTopicPayload>) {
  const { topicId, products, onSuccess } = action.payload;

  try {
    yield put(setAddProductsLoading(true));

    // Call API to add products
    const topic: Topic = yield call(topicRepository.addProductsToTopic, topicId, products);

    // Update state with updated topic
    yield put(setAddProductsSuccess(topic));
    showSuccess(i18next.t('addToTopic'));

    // Call success callback
    if (onSuccess) {
      onSuccess(topic);
    }
  } catch (error) {
    yield put(setAddProductsError());
    showError(error);
  }
}

/**
 * Remove Products From Topic Saga
 * Removes products from a topic
 */
function* removeProductsFromTopicSaga(action: PayloadAction<RemoveProductsFromTopicPayload>) {
  const { topicId, productIds, onSuccess } = action.payload;

  try {
    yield put(setRemoveProductsLoading(true));

    // Call API to remove products
    const topic: Topic = yield call(topicRepository.removeProductsFromTopic, topicId, productIds);

    // Update state with updated topic
    yield put(setRemoveProductsSuccess(topic));
    showSuccess(i18next.t('removeFromTopic'));

    // Call success callback
    if (onSuccess) {
      onSuccess(topic);
    }
  } catch (error) {
    yield put(setRemoveProductsError());
    showError(error);
  }
}

/**
 * Update Topic With Products Saga
 * Handles sequential API calls: remove -> add -> reorder -> update metadata
 */
function* updateTopicWithProductsSaga(action: PayloadAction<UpdateTopicWithProductsPayload>) {
  const { id, data, productDiff, categoryDiff, bannerDiff, onSuccess } = action.payload;

  try {
    yield put(setUpdateTopicLoading(true));

    // Step 1: Remove products (if any)
    if (productDiff.toRemove.length > 0) {
      yield call(topicRepository.removeProductsFromTopic, id, productDiff.toRemove);
    }

    // Step 2: Add new products (if any)
    if (productDiff.toAdd.length > 0) {
      yield call(topicRepository.addProductsToTopic, id, productDiff.toAdd);
    }

    // Step 3: Reorder products (if order changed)
    if (productDiff.hasOrderChanged && productDiff.reorderList.length > 0) {
      yield call(topicRepository.reorderTopicProducts, id, productDiff.reorderList);
    }

    // Step 4: Remove categories (if any)
    if (categoryDiff.toRemove.length > 0) {
      yield call(topicRepository.removeCategoriesFromTopic, id, categoryDiff.toRemove);
    }

    // Step 5: Add new categories (if any)
    if (categoryDiff.toAdd.length > 0) {
      yield call(topicRepository.addCategoriesToTopic, id, categoryDiff.toAdd);
    }

    // Step 6: Reorder categories (if order changed)
    if (categoryDiff.hasOrderChanged && categoryDiff.reorderList.length > 0) {
      yield call(topicRepository.reorderTopicCategories, id, categoryDiff.reorderList);
    }

    // Step 7: Remove banners (if any)
    if (bannerDiff.toRemove.length > 0) {
      yield call(topicRepository.removeBannersFromTopic, id, bannerDiff.toRemove);
    }

    // Step 8: Add new banners (if any)
    if (bannerDiff.toAdd.length > 0) {
      const bannersToAdd = bannerDiff.toAdd.map((b) => ({
        mediaType: b.mediaType as number,
        media: b.media,
        link: b.link,
        order: b.order,
      }));
      yield call(topicRepository.addBannersToTopic, id, bannersToAdd);
    }

    // Step 9: Update existing banners (if any changed)
    if (bannerDiff.toUpdate.length > 0) {
      for (const banner of bannerDiff.toUpdate) {
        yield call(topicRepository.updateTopicBanner, id, banner.id!, {
          mediaType: banner.mediaType as number,
          media: banner.media,
          link: banner.link,
        });
      }
    }

    // Step 10: Reorder banners (if order changed)
    if (bannerDiff.hasOrderChanged && bannerDiff.reorderList.length > 0) {
      yield call(topicRepository.reorderTopicBanners, id, bannerDiff.reorderList);
    }

    // Step 11: Update topic metadata
    const topic: Topic = yield call(topicRepository.updateTopic, id, data);

    yield put(setUpdateTopicSuccess(topic));
    showSuccess(i18next.t('updateTopicSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setUpdateTopicError());
    showError(error);
  }
}

/**
 * Reorder Topic Products Saga
 */
function* reorderTopicProductsSaga(action: PayloadAction<ReorderTopicProductsPayload>) {
  const { topicId, products, onSuccess } = action.payload;

  try {
    yield put(setUpdateTopicLoading(true));

    const topic: Topic = yield call(topicRepository.reorderTopicProducts, topicId, products);

    yield put(setUpdateTopicSuccess(topic));
    showSuccess(i18next.t('reorderProductsSuccess'));

    if (onSuccess) {
      onSuccess(topic);
    }
  } catch (error) {
    yield put(setUpdateTopicError());
    showError(error);
  }
}

/**
 * Root Topic Saga Watcher
 */
function* watchTopic() {
  yield takeLatest(getTopicsRequest.type, getTopicsSaga);
  yield takeLatest(getTopicByIdRequest.type, getTopicByIdSaga);
  yield takeLatest(createTopicRequest.type, createTopicSaga);
  yield takeLatest(updateTopicRequest.type, updateTopicSaga);
  yield takeLatest(deleteTopicRequest.type, deleteTopicSaga);
  yield takeLatest(addProductsToTopicRequest.type, addProductsToTopicSaga);
  yield takeLatest(removeProductsFromTopicRequest.type, removeProductsFromTopicSaga);
  yield takeLatest(updateTopicWithProductsRequest.type, updateTopicWithProductsSaga);
  yield takeLatest(reorderTopicProductsRequest.type, reorderTopicProductsSaga);
}

/**
 * Root Topic Saga
 */
export function* topicSaga() {
  yield call(watchTopic);
}
