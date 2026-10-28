import { showErrorToast, showSuccessToast } from '@/lib/helpers/toastHelper';
import { authRepository } from '@/lib/repositories/auth.repository';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  forgotPasswordRequest,
  phoneForgotPasswordCompleteRequest,
  phoneForgotPasswordRequestOtpRequest,
  phoneForgotPasswordVerifyOtpRequest,
  setOtpSent,
  setOtpVerified,
  setPasswordRecoveryError,
  setPasswordRecoveryLoading,
  setPasswordRecoverySuccess,
} from '../slices/passwordRecoverySlice';

/**
 * Forgot Password Saga (Email)
 * Sends password reset link to email
 */
function* forgotPasswordSaga(action: ReturnType<typeof forgotPasswordRequest>) {
  try {
    yield put(setPasswordRecoveryLoading());

    const { email, onSuccess } = action.payload;

    // Call forgot password API
    yield call(() => authRepository.forgotPassword({ email }));

    // Set success state
    yield put(setPasswordRecoverySuccess());

    // Call success callback (dialog will show the success message)
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setPasswordRecoveryError());
    showErrorToast(error);
  }
}

/**
 * Phone Forgot Password - Request OTP Saga
 * Step 1: Send OTP to phone number for password reset
 */
function* phoneForgotPasswordRequestOtpSaga(
  action: ReturnType<typeof phoneForgotPasswordRequestOtpRequest>
) {
  try {
    yield put(setPasswordRecoveryLoading());

    const { phone, otpMethod, onSuccess } = action.payload;

    // Call request OTP API
    const response: { message: string } = yield call(() =>
      authRepository.phoneForgotPasswordRequestOtp({ phone, otpMethod })
    );

    // Set OTP sent state
    yield put(setOtpSent());

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }

    showSuccessToast(response.message);
  } catch (error) {
    yield put(setPasswordRecoveryError());
    if (action.payload.onError) {
      action.payload.onError();
    }
    showErrorToast(error);
  }
}

/**
 * Phone Forgot Password - Verify OTP Saga
 * Step 2: Verify OTP code for password reset
 */
function* phoneForgotPasswordVerifyOtpSaga(
  action: ReturnType<typeof phoneForgotPasswordVerifyOtpRequest>
) {
  try {
    yield put(setPasswordRecoveryLoading());

    const { phone, otp, onSuccess } = action.payload;

    // Call verify OTP API
    const response: { message: string; resetToken: string } = yield call(() =>
      authRepository.phoneForgotPasswordVerifyOtp({ phone, otp })
    );

    // Set OTP verified state and store reset token
    yield put(setOtpVerified(response.resetToken));

    // Call success callback with resetToken
    if (onSuccess) {
      onSuccess(response.resetToken);
    }

    showSuccessToast(response.message);
  } catch (error: any) {
    yield put(setPasswordRecoveryError());
    // Only call onError for 422 status (invalid OTP)
    if (action.payload.onError && error?.response?.status === 422) {
      action.payload.onError();
    }
    showErrorToast(error);
  }
}

/**
 * Phone Forgot Password - Complete Saga
 * Step 3: Complete password reset with new password
 */
function* phoneForgotPasswordCompleteSaga(
  action: ReturnType<typeof phoneForgotPasswordCompleteRequest>
) {
  const { phone, resetToken, password, onSuccess, onError } = action.payload;
  try {
    yield put(setPasswordRecoveryLoading());

    // Call complete password reset API
    const response: { message: string } = yield call(() =>
      authRepository.phoneForgotPasswordComplete({
        phone,
        resetToken,
        password,
        retypePassword: password,
      })
    );

    // Set success state and clear reset token
    yield put(setPasswordRecoverySuccess());

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }

    showSuccessToast(response.message);
  } catch (error) {
    yield put(setPasswordRecoveryError());
    showErrorToast(error);

    // Call error callback (to clear token and redirect)
    if (onError) {
      onError();
    }
  }
}

// Saga watchers
export function* watchPasswordRecovery() {
  yield takeLatest(forgotPasswordRequest.type, forgotPasswordSaga);
  yield takeLatest(
    phoneForgotPasswordRequestOtpRequest.type,
    phoneForgotPasswordRequestOtpSaga
  );
  yield takeLatest(
    phoneForgotPasswordVerifyOtpRequest.type,
    phoneForgotPasswordVerifyOtpSaga
  );
  yield takeLatest(
    phoneForgotPasswordCompleteRequest.type,
    phoneForgotPasswordCompleteSaga
  );
}

/**
 * Root Password Recovery Saga
 */
export function* passwordRecoverySaga() {
  yield call(watchPasswordRecovery);
}
