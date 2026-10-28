import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { pushNotificationRepository } from 'src/repositories/push-notification.repository';
import type {
  PushNotification,
  GetPushNotificationListResponse,
} from 'src/types/push-notification';
import { showError, showSuccess } from 'src/utils/toast';
import {
  getPushNotificationListRequest,
  getPushNotificationByIdRequest,
  createPushNotificationRequest,
  updatePushNotificationRequest,
  deletePushNotificationRequest,
  sendPushNotificationRequest,
  recallPushNotificationRequest,
  setLoading,
  setListSuccess,
  setListError,
  setCurrentLoading,
  setCurrentSuccess,
  setCurrentError,
  setCreateLoading,
  setCreateSuccess,
  setCreateError,
  setUpdateLoading,
  setUpdateSuccess,
  setUpdateError,
  setDeleteLoading,
  setDeleteSuccess,
  setDeleteError,
  setSendLoading,
  setSendSuccess,
  setSendError,
  setRecallLoading,
  setRecallSuccess,
  setRecallError,
  type GetPushNotificationListPayload,
  type GetPushNotificationByIdPayload,
  type CreatePushNotificationPayload,
  type UpdatePushNotificationPayload,
  type DeletePushNotificationPayload,
  type SendPushNotificationPayload,
  type RecallPushNotificationPayload,
} from '../store/pushNotificationSlice';

function* getListSaga(action: PayloadAction<GetPushNotificationListPayload>) {
  const { page = 1, limit = 10, search, onSuccess } = action.payload;
  try {
    yield put(setLoading(true));
    const response: GetPushNotificationListResponse = yield call(
      pushNotificationRepository.getList,
      { page, limit, search }
    );
    yield put(
      setListSuccess({
        list: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
      })
    );
    if (onSuccess) onSuccess();
  } catch (error) {
    yield put(setListError());
    showError(error);
  }
}

function* getByIdSaga(action: PayloadAction<GetPushNotificationByIdPayload>) {
  const { id, onSuccess } = action.payload;
  try {
    yield put(setCurrentLoading(true));
    const item: PushNotification | null = yield call(pushNotificationRepository.getById, id);
    if (!item) throw new Error('Not found');
    yield put(setCurrentSuccess(item));
    if (onSuccess) onSuccess(item);
  } catch (error) {
    yield put(setCurrentError());
    showError(error);
  }
}

function* createSaga(action: PayloadAction<CreatePushNotificationPayload>) {
  const { data, onSuccess } = action.payload;
  try {
    yield put(setCreateLoading(true));
    const item: PushNotification = yield call(pushNotificationRepository.create, data);
    yield put(setCreateSuccess(item));
    showSuccess(i18next.t('createPushNotificationSuccess'));
    if (onSuccess) onSuccess(item);
  } catch (error) {
    yield put(setCreateError());
    showError(error);
  }
}

function* updateSaga(action: PayloadAction<UpdatePushNotificationPayload>) {
  const { id, data, silent, onSuccess } = action.payload;
  try {
    yield put(setUpdateLoading(true));
    const item: PushNotification = yield call(pushNotificationRepository.update, id, data);
    yield put(setUpdateSuccess(item));
    if (!silent) showSuccess(i18next.t('updatePushNotificationSuccess'));
    if (onSuccess) onSuccess(item);
  } catch (error) {
    yield put(setUpdateError());
    showError(error);
  }
}

function* deleteSaga(action: PayloadAction<DeletePushNotificationPayload>) {
  const { id, onSuccess } = action.payload;
  try {
    yield put(setDeleteLoading(true));
    yield call(pushNotificationRepository.delete, id);
    yield put(setDeleteSuccess(id));
    showSuccess(i18next.t('deletePushNotificationSuccess'));
    if (onSuccess) onSuccess();
  } catch (error) {
    yield put(setDeleteError());
    showError(error);
  }
}

function* sendSaga(action: PayloadAction<SendPushNotificationPayload>) {
  const { id, onSuccess } = action.payload;
  try {
    yield put(setSendLoading(true));
    const item: PushNotification = yield call(pushNotificationRepository.send, id);
    yield put(setSendSuccess(item));
    showSuccess(i18next.t('sendPushNotificationSuccess'));
    if (onSuccess) onSuccess(item);
  } catch (error) {
    yield put(setSendError());
    showError(error);
  }
}

function* recallSaga(action: PayloadAction<RecallPushNotificationPayload>) {
  const { id, onSuccess } = action.payload;
  try {
    yield put(setRecallLoading(true));
    const item: PushNotification = yield call(pushNotificationRepository.recall, id);
    yield put(setRecallSuccess(item));
    showSuccess(i18next.t('recallPushNotificationSuccess'));
    if (onSuccess) onSuccess(item);
  } catch (error) {
    yield put(setRecallError());
    showError(error);
  }
}

function* watchPushNotification() {
  yield takeLatest(getPushNotificationListRequest.type, getListSaga);
  yield takeLatest(getPushNotificationByIdRequest.type, getByIdSaga);
  yield takeLatest(createPushNotificationRequest.type, createSaga);
  yield takeLatest(updatePushNotificationRequest.type, updateSaga);
  yield takeLatest(deletePushNotificationRequest.type, deleteSaga);
  yield takeLatest(sendPushNotificationRequest.type, sendSaga);
  yield takeLatest(recallPushNotificationRequest.type, recallSaga);
}

export function* pushNotificationSaga() {
  yield call(watchPushNotification);
}
