/* eslint-disable no-console */
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  setUser,
  updateUser,
  setAccountLoading,
  setAccountError,
  setAccountIdle,
  getCurrentUserRequest,
  updateUserRequest,
  changePasswordRequest,
} from '../slices/accountSlice';
import { authRepository } from '@/lib/repositories/auth.repository';
import type { User } from '@/types/gen/shared/shared/users/user';
import { showErrorToast } from '@/lib/helpers/toastHelper';

// Saga workers
function* getCurrentUserSaga() {
  try {
    yield put(setAccountLoading());

    // Call get current user API
    const user: User = yield call(() => authRepository.getCurrentUser());

    // Set user to state
    yield put(setUser(user));
  } catch (error) {
    yield put(setAccountError());
    console.error('Get current user failed:', error);
  }
}

function* updateUserSaga(action: ReturnType<typeof updateUserRequest>) {
  try {
    yield put(setAccountLoading());

    const { updates, onSuccess } = action.payload;

    // Call update profile API
    const updatedUser: User = yield call(() =>
      authRepository.updateProfile(updates)
    );

    // Update user in state
    yield put(updateUser(updatedUser));

    // Reset loading state
    yield put(setAccountIdle());

    // Call success callback - component will show localized success toast
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setAccountError());
    showErrorToast(error);
    console.error('Update user failed:', error);
  }
}

/**
 * Change Password Saga
 * Changes user password using old password and new password
 */
function* changePasswordSaga(action: ReturnType<typeof changePasswordRequest>) {
  try {
    yield put(setAccountLoading());

    const { password, oldPassword, onSuccess } = action.payload;

    // Call update profile API with password
    yield call(() =>
      authRepository.updateProfile({
        password,
        oldPassword,
      })
    );

    // Reset loading state
    yield put(setAccountIdle());

    // Call success callback - component will show localized success toast
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setAccountError());
    showErrorToast(error);
    console.error('Change password failed:', error);
  }
}

// Saga watchers
export function* watchAccount() {
  yield takeLatest(getCurrentUserRequest.type, getCurrentUserSaga);
  yield takeLatest(updateUserRequest.type, updateUserSaga);
  yield takeLatest(changePasswordRequest.type, changePasswordSaga);
}

/**
 * Root Account Saga
 * Starts all account watchers
 */
export function* accountSaga() {
  yield call(watchAccount);
}
