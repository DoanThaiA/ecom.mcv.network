import { createAction, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from 'src/types/gen/shared/shared/users/user';

// Account state for Redux
export interface AccountState {
  user: User | null;
  loading: boolean;
}

const initialState: AccountState = {
  user: null,
  loading: false,
};

// Payload types
export type FetchUserPayload = {};

export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const fetchUserRequest = createAction<FetchUserPayload>('account/fetchUserRequest');
export const updateUserRequest = createAction<UpdateUserPayload>('account/updateUserRequest');
export const changePasswordRequest = createAction<ChangePasswordPayload>(
  'account/changePasswordRequest'
);

/**
 * Account Slice
 */
export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccountLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
    },

    updateUserLocally: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
      state.loading = false;
    },

    clearAccount: (state) => {
      state.user = null;
      state.loading = false;
    },
  },
});

export const { setAccountLoading, setUser, updateUserLocally, clearAccount } = accountSlice.actions;

/**
 * Selectors
 */
export const selectAccountUser = (state: { account: AccountState }) => state.account.user;
export const selectAccountLoading = (state: { account: AccountState }) => state.account.loading;

export default accountSlice.reducer;
