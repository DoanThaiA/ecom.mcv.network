import { describe, it, expect } from 'vitest';

import accountReducer, {
  setAccountLoading,
  setUser,
  updateUserLocally,
  clearAccount,
  fetchUserRequest,
  updateUserRequest,
  changePasswordRequest,
  selectAccountUser,
  selectAccountLoading,
  type AccountState,
} from 'src/redux/store/accountSlice';
import type { User } from 'src/types/gen/shared/shared/users/user';

describe('accountSlice', () => {
  const initialState: AccountState = {
    user: null,
    loading: false,
  };

  const mockUser: User = {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  describe('reducers', () => {
    describe('setAccountLoading', () => {
      it('sets loading to true', () => {
        const state = accountReducer(initialState, setAccountLoading(true));

        expect(state.loading).toBe(true);
        expect(state.user).toBe(null);
      });

      it('sets loading to false', () => {
        const loadingState: AccountState = {
          user: null,
          loading: true,
        };

        const state = accountReducer(loadingState, setAccountLoading(false));

        expect(state.loading).toBe(false);
      });

      it('does not affect user when setting loading', () => {
        const stateWithUser: AccountState = {
          user: mockUser,
          loading: false,
        };

        const state = accountReducer(stateWithUser, setAccountLoading(true));

        expect(state.loading).toBe(true);
        expect(state.user).toEqual(mockUser);
      });
    });

    describe('setUser', () => {
      it('sets user and sets loading to false', () => {
        const loadingState: AccountState = {
          user: null,
          loading: true,
        };

        const state = accountReducer(loadingState, setUser(mockUser));

        expect(state.user).toEqual(mockUser);
        expect(state.loading).toBe(false);
      });

      it('replaces existing user', () => {
        const stateWithUser: AccountState = {
          user: mockUser,
          loading: false,
        };

        const newUser: User = {
          id: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+0987654321',
          role: 'user',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        };

        const state = accountReducer(stateWithUser, setUser(newUser));

        expect(state.user).toEqual(newUser);
        expect(state.user).not.toEqual(mockUser);
      });

      it('always sets loading to false', () => {
        const loadingState: AccountState = {
          user: null,
          loading: true,
        };

        const state = accountReducer(loadingState, setUser(mockUser));

        expect(state.loading).toBe(false);
      });
    });

    describe('updateUserLocally', () => {
      it('updates user properties when user exists', () => {
        const stateWithUser: AccountState = {
          user: mockUser,
          loading: false,
        };

        const updates = {
          firstName: 'Johnny',
          phone: '+9999999999',
        };

        const state = accountReducer(stateWithUser, updateUserLocally(updates));

        expect(state.user?.firstName).toBe('Johnny');
        expect(state.user?.phone).toBe('+9999999999');
        expect(state.user?.lastName).toBe('Doe');
        expect(state.user?.email).toBe('john.doe@example.com');
      });

      it('does not create user if user is null', () => {
        const state = accountReducer(initialState, updateUserLocally({ firstName: 'John' }));

        expect(state.user).toBe(null);
      });

      it('sets loading to false', () => {
        const stateWithUser: AccountState = {
          user: mockUser,
          loading: true,
        };

        const state = accountReducer(stateWithUser, updateUserLocally({ firstName: 'Johnny' }));

        expect(state.loading).toBe(false);
      });

      it('handles partial updates with single field', () => {
        const stateWithUser: AccountState = {
          user: mockUser,
          loading: false,
        };

        const state = accountReducer(stateWithUser, updateUserLocally({ email: 'new@example.com' }));

        expect(state.user?.email).toBe('new@example.com');
        expect(state.user?.firstName).toBe('John');
        expect(state.user?.lastName).toBe('Doe');
      });

      it('handles partial updates with multiple fields', () => {
        const stateWithUser: AccountState = {
          user: mockUser,
          loading: false,
        };

        const updates = {
          firstName: 'Johnny',
          lastName: 'Doe Jr.',
          email: 'johnny@example.com',
        };

        const state = accountReducer(stateWithUser, updateUserLocally(updates));

        expect(state.user?.firstName).toBe('Johnny');
        expect(state.user?.lastName).toBe('Doe Jr.');
        expect(state.user?.email).toBe('johnny@example.com');
        expect(state.user?.phone).toBe('+1234567890');
      });

      it('handles empty updates object', () => {
        const stateWithUser: AccountState = {
          user: mockUser,
          loading: false,
        };

        const state = accountReducer(stateWithUser, updateUserLocally({}));

        expect(state.user).toEqual(mockUser);
      });
    });

    describe('clearAccount', () => {
      it('clears user and sets loading to false', () => {
        const stateWithUser: AccountState = {
          user: mockUser,
          loading: true,
        };

        const state = accountReducer(stateWithUser, clearAccount());

        expect(state.user).toBe(null);
        expect(state.loading).toBe(false);
      });

      it('works on already empty state', () => {
        const state = accountReducer(initialState, clearAccount());

        expect(state.user).toBe(null);
        expect(state.loading).toBe(false);
      });

      it('clears user when not loading', () => {
        const stateWithUser: AccountState = {
          user: mockUser,
          loading: false,
        };

        const state = accountReducer(stateWithUser, clearAccount());

        expect(state.user).toBe(null);
        expect(state.loading).toBe(false);
      });
    });
  });

  describe('saga actions', () => {
    describe('fetchUserRequest', () => {
      it('creates correct action type', () => {
        const action = fetchUserRequest({});

        expect(action.type).toBe('account/fetchUserRequest');
      });

      it('includes empty payload', () => {
        const action = fetchUserRequest({});

        expect(action.payload).toEqual({});
      });
    });

    describe('updateUserRequest', () => {
      it('creates correct action type', () => {
        const action = updateUserRequest({
          firstName: 'John',
        });

        expect(action.type).toBe('account/updateUserRequest');
      });

      it('includes all update fields', () => {
        const payload = {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          email: 'john@example.com',
        };

        const action = updateUserRequest(payload);

        expect(action.payload).toEqual(payload);
      });

      it('includes callback functions', () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const action = updateUserRequest({
          firstName: 'John',
          onSuccess,
          onError,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
        expect(action.payload.onError).toBe(onError);
      });

      it('handles partial updates', () => {
        const action = updateUserRequest({
          firstName: 'John',
        });

        expect(action.payload.firstName).toBe('John');
        expect(action.payload.lastName).toBeUndefined();
      });
    });

    describe('changePasswordRequest', () => {
      it('creates correct action type', () => {
        const action = changePasswordRequest({
          currentPassword: 'old123',
          newPassword: 'new456',
        });

        expect(action.type).toBe('account/changePasswordRequest');
      });

      it('includes password fields', () => {
        const payload = {
          currentPassword: 'old123',
          newPassword: 'new456',
        };

        const action = changePasswordRequest(payload);

        expect(action.payload.currentPassword).toBe('old123');
        expect(action.payload.newPassword).toBe('new456');
      });

      it('includes callback functions', () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const action = changePasswordRequest({
          currentPassword: 'old123',
          newPassword: 'new456',
          onSuccess,
          onError,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
        expect(action.payload.onError).toBe(onError);
      });
    });
  });

  describe('selectors', () => {
    describe('selectAccountUser', () => {
      it('returns null for initial state', () => {
        const state = { account: initialState };

        const user = selectAccountUser(state);

        expect(user).toBe(null);
      });

      it('returns user when present', () => {
        const state = {
          account: {
            user: mockUser,
            loading: false,
          },
        };

        const user = selectAccountUser(state);

        expect(user).toEqual(mockUser);
      });

      it('returns null after clearing account', () => {
        const stateWithUser = {
          account: {
            user: mockUser,
            loading: false,
          },
        };

        const clearedState = {
          account: accountReducer(stateWithUser.account, clearAccount()),
        };

        const user = selectAccountUser(clearedState);

        expect(user).toBe(null);
      });
    });

    describe('selectAccountLoading', () => {
      it('returns false for initial state', () => {
        const state = { account: initialState };

        const loading = selectAccountLoading(state);

        expect(loading).toBe(false);
      });

      it('returns true when loading', () => {
        const state = {
          account: {
            user: null,
            loading: true,
          },
        };

        const loading = selectAccountLoading(state);

        expect(loading).toBe(true);
      });

      it('returns false when not loading', () => {
        const state = {
          account: {
            user: mockUser,
            loading: false,
          },
        };

        const loading = selectAccountLoading(state);

        expect(loading).toBe(false);
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete user fetch flow', () => {
      // Start: Initial state
      let state = initialState;
      expect(selectAccountUser({ account: state })).toBe(null);
      expect(selectAccountLoading({ account: state })).toBe(false);

      // Step 1: Start loading
      state = accountReducer(state, setAccountLoading(true));
      expect(selectAccountLoading({ account: state })).toBe(true);

      // Step 2: Receive user data
      state = accountReducer(state, setUser(mockUser));
      expect(selectAccountUser({ account: state })).toEqual(mockUser);
      expect(selectAccountLoading({ account: state })).toBe(false);
    });

    it('handles user update flow', () => {
      // Start: User logged in
      let state: AccountState = {
        user: mockUser,
        loading: false,
      };

      // Start loading for update
      state = accountReducer(state, setAccountLoading(true));
      expect(selectAccountLoading({ account: state })).toBe(true);

      // Update user locally
      state = accountReducer(state, updateUserLocally({
        firstName: 'Johnny',
        phone: '+9999999999',
      }));

      expect(selectAccountUser({ account: state })?.firstName).toBe('Johnny');
      expect(selectAccountUser({ account: state })?.phone).toBe('+9999999999');
      expect(selectAccountLoading({ account: state })).toBe(false);
    });

    it('handles logout flow', () => {
      // Start: User logged in
      let state: AccountState = {
        user: mockUser,
        loading: false,
      };

      expect(selectAccountUser({ account: state })).toEqual(mockUser);

      // Logout
      state = accountReducer(state, clearAccount());
      expect(selectAccountUser({ account: state })).toBe(null);
      expect(selectAccountLoading({ account: state })).toBe(false);
    });

    it('handles password change flow', () => {
      // Start: User logged in
      let state: AccountState = {
        user: mockUser,
        loading: false,
      };

      // Start loading for password change
      state = accountReducer(state, setAccountLoading(true));
      expect(selectAccountLoading({ account: state })).toBe(true);

      // Password changed successfully - user data unchanged
      state = accountReducer(state, setAccountLoading(false));
      expect(selectAccountUser({ account: state })).toEqual(mockUser);
      expect(selectAccountLoading({ account: state })).toBe(false);
    });

    it('handles re-login flow', () => {
      // Start: User logged in
      let state: AccountState = {
        user: mockUser,
        loading: false,
      };

      // Logout
      state = accountReducer(state, clearAccount());
      expect(selectAccountUser({ account: state })).toBe(null);

      // Re-login
      state = accountReducer(state, setAccountLoading(true));
      const newUser: User = {
        ...mockUser,
        id: 'user-2',
      };
      state = accountReducer(state, setUser(newUser));

      expect(selectAccountUser({ account: state })).toEqual(newUser);
      expect(selectAccountLoading({ account: state })).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = accountReducer(initialState, { type: 'unknown' } as any);

      expect(state).toEqual(initialState);
    });

    it('handles multiple consecutive loading toggles', () => {
      let state = initialState;

      state = accountReducer(state, setAccountLoading(true));
      expect(state.loading).toBe(true);

      state = accountReducer(state, setAccountLoading(false));
      expect(state.loading).toBe(false);

      state = accountReducer(state, setAccountLoading(true));
      expect(state.loading).toBe(true);

      state = accountReducer(state, setAccountLoading(true));
      expect(state.loading).toBe(true);
    });

    it('handles setting same user multiple times', () => {
      let state = initialState;

      state = accountReducer(state, setUser(mockUser));
      const firstState = state;

      state = accountReducer(state, setUser(mockUser));
      const secondState = state;

      expect(firstState.user).toEqual(secondState.user);
    });

    it('preserves user through loading state changes', () => {
      let state = accountReducer(initialState, setUser(mockUser));
      const originalUser = state.user;

      state = accountReducer(state, setAccountLoading(true));
      expect(state.user).toEqual(originalUser);

      state = accountReducer(state, setAccountLoading(false));
      expect(state.user).toEqual(originalUser);
    });

    it('handles updateUserLocally when user is null', () => {
      const state = accountReducer(initialState, updateUserLocally({
        firstName: 'John',
        lastName: 'Doe',
      }));

      expect(state.user).toBe(null);
      expect(state.loading).toBe(false);
    });

    it('handles multiple consecutive updates', () => {
      let state: AccountState = {
        user: mockUser,
        loading: false,
      };

      state = accountReducer(state, updateUserLocally({ firstName: 'Johnny' }));
      expect(state.user?.firstName).toBe('Johnny');

      state = accountReducer(state, updateUserLocally({ lastName: 'Doe Jr.' }));
      expect(state.user?.firstName).toBe('Johnny');
      expect(state.user?.lastName).toBe('Doe Jr.');

      state = accountReducer(state, updateUserLocally({ email: 'new@example.com' }));
      expect(state.user?.firstName).toBe('Johnny');
      expect(state.user?.lastName).toBe('Doe Jr.');
      expect(state.user?.email).toBe('new@example.com');
    });
  });
});
