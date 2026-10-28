/* eslint-disable no-unused-vars */
import { storageService } from '@/lib/services/storage.service';
import type { User } from '@/types/gen/shared/shared/users/user';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum AccountStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

interface AccountState {
  user: User | null;
  status: AccountStatus;
}

// Load initial state from storageService
const loadInitialState = (): AccountState => {
  const user = storageService.getUser();

  return {
    user,
    status: AccountStatus.IDLE,
  };
};

const initialState: AccountState = loadInitialState();

// ============================================
// Saga Actions (for triggering side effects)
// ============================================

/**
 * Get current user action for saga
 */
export const getCurrentUserRequest = createAction('account/getCurrentUserRequest');

/**
 * Update User Payload
 */
export type UpdateUserPayload = {
  updates: Partial<User>;
  onSuccess?: () => void;
};

/**
 * Update user action for saga
 */
export const updateUserRequest = createAction<UpdateUserPayload>('account/updateUserRequest');

/**
 * Change Password Payload
 */
export type ChangePasswordPayload = {
  oldPassword: string;
  password: string;
  onSuccess?: () => void;
};

/**
 * Change password action for saga
 */
export const changePasswordRequest = createAction<ChangePasswordPayload>('account/changePasswordRequest');

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.status = AccountStatus.SUCCESS;

      // Save to storageService
      storageService.setUser(action.payload);
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update user in storageService
        storageService.setUser(state.user);
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.status = AccountStatus.IDLE;

      // Remove user from storageService
      storageService.removeUser();
    },
    setAccountLoading: (state) => {
      state.status = AccountStatus.LOADING;
    },
    setAccountError: (state) => {
      state.status = AccountStatus.ERROR;
    },
    setAccountIdle: (state) => {
      state.status = AccountStatus.IDLE;
    },
  },
});

export const {
  setUser,
  updateUser,
  clearUser,
  setAccountLoading,
  setAccountError,
  setAccountIdle,
} = accountSlice.actions;

// ============================================
// Selectors
// ============================================

/**
 * Selector to get user
 */
export const selectUser = (state: { account: AccountState }) => state.account.user;

/**
 * Selector to get account status
 */
export const selectAccountStatus = (state: { account: AccountState }) =>
  state.account.status;

/**
 * Selector to check if loading
 */
export const selectIsAccountLoading = (state: { account: AccountState }) =>
  state.account.status === AccountStatus.LOADING;

export default accountSlice.reducer;
