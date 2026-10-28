import { call, put, takeLatest } from 'redux-saga/effects';
import { showSuccess, showError } from 'src/utils/toast';
import { authRepository } from 'src/repositories';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  fetchUserRequest,
  updateUserRequest,
  changePasswordRequest,
  setAccountLoading,
  setUser,
  updateUserLocally,
  type FetchUserPayload,
  type UpdateUserPayload,
  type ChangePasswordPayload,
} from '../store/accountSlice';
import type { User } from 'src/types/gen/shared/shared/users/user';
import appLocalStorage, { localStorageKeys } from 'src/services/localStorage';

/**
 * Fetch User Saga
 * Fetches current user data from /api/v1/auth/me
 */
function* fetchUserSaga(action: PayloadAction<FetchUserPayload>) {
  try {
    yield put(setAccountLoading(true));

    // Call API to get current user
    const userData: User = yield call(authRepository.getCurrentUser);

    // Update Redux state
    yield put(setUser(userData));

    // Update localStorage
    appLocalStorage.setItem(localStorageKeys.USER, userData);
  } catch (error: any) {
    console.error('Fetch user error:', error);
    yield put(setAccountLoading(false));

    // Show error toast - không cần lưu vào state
    showError(error);
  }
}

/**
 * Update User Saga
 * Updates user profile information
 */
function* updateUserSaga(action: PayloadAction<UpdateUserPayload>) {
  const { firstName, lastName, phone, email, onSuccess, onError } = action.payload;

  try {
    yield put(setAccountLoading(true));

    // Call API to update user profile
    const response: User = yield call(authRepository.updateProfile, {
      firstName,
      lastName,
      email,
      // Note: phone is not in AuthUpdate type from protobuf
      // Will be handled by backend if included in PATCH request body
    });

    // Update Redux state with response
    yield put(setUser(response));

    // Update localStorage
    appLocalStorage.setItem(localStorageKeys.USER, response);

    // Show success message
    showSuccess('Cập nhật thông tin thành công');

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }

    yield put(setAccountLoading(false));
  } catch (error: any) {
    console.error('Update user error:', error);
    yield put(setAccountLoading(false));

    // Show error toast - không cần lưu vào state
    showError(error);

    // Call error callback
    if (onError) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Không thể cập nhật thông tin';
      onError(errorMessage);
    }
  }
}

/**
 * Change Password Saga
 * Changes user password
 */
function* changePasswordSaga(action: PayloadAction<ChangePasswordPayload>) {
  const { currentPassword, newPassword, onSuccess, onError } = action.payload;

  try {
    yield put(setAccountLoading(true));

    // Call API to change password using updateProfile
    yield call(authRepository.updateProfile, {
      password: newPassword,
      oldPassword: currentPassword,
    });

    yield put(setAccountLoading(false));

    // Show success message
    showSuccess('Đổi mật khẩu thành công');

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    console.error('Change password error:', error);
    yield put(setAccountLoading(false));

    // Show error toast - không cần lưu vào state
    showError(error);

    // Call error callback
    if (onError) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Không thể đổi mật khẩu';
      onError(errorMessage);
    }
  }
}

/**
 * Root Account Saga Watcher
 */
function* watchAccount() {
  yield takeLatest(fetchUserRequest.type, fetchUserSaga);
  yield takeLatest(updateUserRequest.type, updateUserSaga);
  yield takeLatest(changePasswordRequest.type, changePasswordSaga);
}

/**
 * Root Account Saga
 */
export function* accountSaga() {
  yield call(watchAccount);
}
