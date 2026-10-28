import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';

import i18next from 'src/i18next';
import { cmsUserRepository } from 'src/repositories/cms-user.repository';
import type { CmsUserData, QueryCmsUsersResponse } from 'src/repositories/cms-user.repository';
import { showError, showSuccess } from 'src/utils/toast';

import {
  getCmsUsersRequest,
  getCmsUserByIdRequest,
  createCmsUserRequest,
  updateCmsUserRequest,
  deleteCmsUserRequest,
  setCmsUserLoading,
  setCmsUsersSuccess,
  setCmsUserError,
  setCurrentCmsUserLoading,
  setCurrentCmsUserSuccess,
  setCurrentCmsUserError,
  setCreateCmsUserLoading,
  setCreateCmsUserSuccess,
  setCreateCmsUserError,
  setUpdateCmsUserLoading,
  setUpdateCmsUserSuccess,
  setUpdateCmsUserError,
  setDeleteCmsUserLoading,
  setDeleteCmsUserSuccess,
  setDeleteCmsUserError,
  type GetCmsUsersPayload,
  type GetCmsUserByIdPayload,
  type CreateCmsUserPayload,
  type UpdateCmsUserPayload,
  type DeleteCmsUserPayload,
} from '../store/cmsUserSlice';

/**
 * Get CMS Users Saga
 */
function* getCmsUsersSaga(action: PayloadAction<GetCmsUsersPayload>) {
  const { page = 1, limit = 10, filters, sort, onSuccess } = action.payload;

  try {
    yield put(setCmsUserLoading(true));

    const response: QueryCmsUsersResponse = yield call(cmsUserRepository.queryCmsUsers, {
      page,
      limit,
      filters,
      sort,
    });

    yield put(
      setCmsUsersSuccess({
        cmsUsers: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
      })
    );

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setCmsUserError());
    showError(error);
  }
}

/**
 * Get CMS User By ID Saga
 */
function* getCmsUserByIdSaga(action: PayloadAction<GetCmsUserByIdPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setCurrentCmsUserLoading(true));

    const cmsUser: CmsUserData = yield call(cmsUserRepository.getCmsUser, id);

    yield put(setCurrentCmsUserSuccess(cmsUser));

    if (onSuccess) {
      onSuccess(cmsUser);
    }
  } catch (error) {
    yield put(setCurrentCmsUserError());
    showError(error);
  }
}

/**
 * Create CMS User Saga
 */
function* createCmsUserSaga(action: PayloadAction<CreateCmsUserPayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setCreateCmsUserLoading(true));

    const cmsUser: CmsUserData = yield call(cmsUserRepository.createCmsUser, data);

    yield put(setCreateCmsUserSuccess());
    showSuccess(i18next.t('createAccountSuccess'));

    if (onSuccess) {
      onSuccess(cmsUser);
    }
  } catch (error) {
    yield put(setCreateCmsUserError());
    showError(error);
  }
}

/**
 * Update CMS User Saga
 */
function* updateCmsUserSaga(action: PayloadAction<UpdateCmsUserPayload>) {
  const { id, data, onSuccess } = action.payload;

  try {
    yield put(setUpdateCmsUserLoading(true));

    const cmsUser: CmsUserData = yield call(cmsUserRepository.updateCmsUser, id, data);

    yield put(setUpdateCmsUserSuccess(cmsUser));
    showSuccess(i18next.t('updateAccountSuccess'));

    if (onSuccess) {
      onSuccess(cmsUser);
    }
  } catch (error) {
    yield put(setUpdateCmsUserError());
    showError(error);
  }
}

/**
 * Delete CMS User Saga
 */
function* deleteCmsUserSaga(action: PayloadAction<DeleteCmsUserPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setDeleteCmsUserLoading(true));

    yield call(cmsUserRepository.deleteCmsUser, id);

    yield put(setDeleteCmsUserSuccess(id));
    showSuccess(i18next.t('deleteAccountSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setDeleteCmsUserError());
    showError(error);
  }
}

/**
 * Root CMS User Saga Watcher
 */
function* watchCmsUser() {
  yield takeLatest(getCmsUsersRequest.type, getCmsUsersSaga);
  yield takeLatest(getCmsUserByIdRequest.type, getCmsUserByIdSaga);
  yield takeLatest(createCmsUserRequest.type, createCmsUserSaga);
  yield takeLatest(updateCmsUserRequest.type, updateCmsUserSaga);
  yield takeLatest(deleteCmsUserRequest.type, deleteCmsUserSaga);
}

export function* cmsUserSaga() {
  yield call(watchCmsUser);
}
