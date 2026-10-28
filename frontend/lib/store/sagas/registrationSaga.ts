import { showErrorToast, showSuccessToast } from '@/lib/helpers/toastHelper';
import { authRepository } from '@/lib/repositories/auth.repository';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  confirmEmailRequest,
  confirmNewEmailRequest,
  registerRequest,
  resendCodeRequest,
  resetRegistration,
  setRegistrationError,
  setRegistrationLoading,
  setRegistrationSuccess,
} from '../slices/registrationSlice';

/**
 * Register Saga
 * Handles email and phone registration
 */
function* registerSaga(action: ReturnType<typeof registerRequest>) {
  try {
    yield put(setRegistrationLoading());

    const {
      onSuccess,
      email,
      phoneNumber,
      firstName,
      lastName,
      password,
      otpMethod,
    } = action.payload;

    // Determine registration type
    if (email && password) {
      // Email registration (requires password)
      yield call(() =>
        authRepository.emailRegister({
          email,
          password,
          firstName,
          lastName,
        })
      );

      // Set success state
      yield put(setRegistrationSuccess());

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } else if (phoneNumber && password) {
      yield call(() =>
        authRepository.phonePasswordRegister({
          phone: phoneNumber,
          password,
          firstName,
          lastName,
          otpMethod,
        })
      );

      // Set success state
      yield put(setRegistrationSuccess());

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    }
  } catch (error) {
    yield put(setRegistrationError());
    if (action.payload.onError) {
      action.payload.onError();
    }
    showErrorToast(error);
  }
}

/**
 * Resend Code Saga
 * Resends OTP for phone registration verification
 */
function* resendCodeSaga(action: ReturnType<typeof resendCodeRequest>) {
  try {
    yield put(setRegistrationLoading());

    const { onSuccess, phoneNumber, firstName, lastName, password, otpMethod } =
      action.payload;

    if (phoneNumber && password) {
      yield call(() =>
        authRepository.phonePasswordRegister({
          phone: phoneNumber,
          password,
          firstName,
          lastName,
          otpMethod,
        })
      );

      // Reset to idle state after resend
      yield put(resetRegistration());

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    }
  } catch (error) {
    yield put(setRegistrationError());
    showErrorToast(error);
  }
}

/**
 * Confirm Email Saga
 * Confirms user email using hash token from verification link
 */
function* confirmEmailSaga(action: ReturnType<typeof confirmEmailRequest>) {
  try {
    yield put(setRegistrationLoading());

    const { hash, onSuccess } = action.payload;

    // Call confirm email API
    const response: { message: string } = yield call(() =>
      authRepository.confirmEmail({ hash })
    );

    // Set success state
    yield put(setRegistrationSuccess());

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }

    showSuccessToast(response.message);
  } catch (error) {
    yield put(setRegistrationError());

    // Call error callback
    if (action.payload.onError) {
      action.payload.onError(error);
    }

    showErrorToast(error);
  }
}

/**
 * Confirm New Email Saga
 * Confirms email change using hash token from verification link
 */
function* confirmNewEmailSaga(action: ReturnType<typeof confirmNewEmailRequest>) {
  try {
    yield put(setRegistrationLoading());

    const { hash, onSuccess } = action.payload;

    // Call confirm new email API
    const response: { message: string } = yield call(() =>
      authRepository.confirmNewEmail({ hash })
    );

    // Set success state
    yield put(setRegistrationSuccess());

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }

    showSuccessToast(response.message);
  } catch (error) {
    yield put(setRegistrationError());

    // Call error callback
    if (action.payload.onError) {
      action.payload.onError(error);
    }

    showErrorToast(error);
  }
}

// Saga watchers
export function* watchRegistration() {
  yield takeLatest(registerRequest.type, registerSaga);
  yield takeLatest(resendCodeRequest.type, resendCodeSaga);
  yield takeLatest(confirmEmailRequest.type, confirmEmailSaga);
  yield takeLatest(confirmNewEmailRequest.type, confirmNewEmailSaga);
}

/**
 * Root Registration Saga
 */
export function* registrationSaga() {
  yield call(watchRegistration);
}
