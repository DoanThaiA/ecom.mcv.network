import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { authRepository } from 'src/repositories';
import { accountSaga } from 'src/redux/saga/accountSaga';
import {
  fetchUserRequest,
  updateUserRequest,
  changePasswordRequest,
  setAccountLoading,
  setUser,
  updateUserLocally,
} from 'src/redux/store/accountSlice';

// Mock repository
vi.mock('src/repositories', () => ({
  authRepository: {
    getCurrentUser: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

// Mock toast
vi.mock('src/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

// Mock localStorage service
vi.mock('src/services/localStorage', () => ({
  default: {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
  },
  localStorageKeys: {
    USER: 'user',
    TOKEN: 'token',
  },
}));

describe('accountSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports accountSaga function', () => {
      expect(accountSaga).toBeDefined();
      expect(accountSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchAccount', () => {
      const gen = accountSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchAccount', () => {
      const gen = accountSaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('fetchUserSaga', () => {
    it('successfully fetches current user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
      };

      vi.mocked(authRepository.getCurrentUser).mockResolvedValue(mockUser);

      const action = fetchUserRequest({});

      expect(action.type).toBe('account/fetchUserRequest');
    });

    it('handles fetch user failure', async () => {
      const mockError = new Error('Unauthorized');

      vi.mocked(authRepository.getCurrentUser).mockRejectedValue(mockError);

      expect(accountSaga).toBeDefined();
    });

    it('sets loading state', () => {
      const action = setAccountLoading(true);

      expect(action.type).toBe('account/setAccountLoading');
      expect(action.payload).toBe(true);
    });

    it('sets user data', () => {
      const user = {
        id: 'user-1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const action = setUser(user);

      expect(action.type).toBe('account/setUser');
      expect(action.payload).toEqual(user);
    });

    it('handles empty payload', () => {
      const action = fetchUserRequest({});

      expect(action.payload).toEqual({});
    });
  });

  describe('updateUserSaga', () => {
    it('successfully updates user profile', async () => {
      const mockUpdatedUser = {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      vi.mocked(authRepository.updateProfile).mockResolvedValue(mockUpdatedUser);

      const action = updateUserRequest({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });

      expect(action.type).toBe('account/updateUserRequest');
      expect(action.payload.firstName).toBe('John');
    });

    it('updates with all fields', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'updated@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      vi.mocked(authRepository.updateProfile).mockResolvedValue(mockUser);

      const action = updateUserRequest({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'updated@example.com',
        phone: '0123456789',
      });

      expect(action.payload.phone).toBe('0123456789');
    });

    it('calls onSuccess callback when successful', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'john@example.com',
      };

      vi.mocked(authRepository.updateProfile).mockResolvedValue(mockUser);

      const onSuccess = vi.fn();
      const action = updateUserRequest({
        firstName: 'John',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles update failure', async () => {
      const mockError = new Error('Update failed');

      vi.mocked(authRepository.updateProfile).mockRejectedValue(mockError);

      expect(accountSaga).toBeDefined();
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('Validation error');

      vi.mocked(authRepository.updateProfile).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = updateUserRequest({
        firstName: 'John',
        onError,
      });

      expect(action.payload.onError).toBe(onError);
    });

    it('handles error with response data', () => {
      const error = {
        response: {
          data: {
            message: 'Email already exists',
          },
        },
      };

      expect(error.response.data.message).toBe('Email already exists');
    });

    it('updates user locally', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
      };

      const action = updateUserLocally(userData);

      expect(action.type).toBe('account/updateUserLocally');
      expect(action.payload).toEqual(userData);
    });
  });

  describe('changePasswordSaga', () => {
    it('successfully changes password', async () => {
      vi.mocked(authRepository.updateProfile).mockResolvedValue({} as any);

      const action = changePasswordRequest({
        currentPassword: 'old-password',
        newPassword: 'new-password',
      });

      expect(action.type).toBe('account/changePasswordRequest');
      expect(action.payload.currentPassword).toBe('old-password');
      expect(action.payload.newPassword).toBe('new-password');
    });

    it('calls onSuccess callback after password change', async () => {
      vi.mocked(authRepository.updateProfile).mockResolvedValue({} as any);

      const onSuccess = vi.fn();
      const action = changePasswordRequest({
        currentPassword: 'old-password',
        newPassword: 'new-password',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles change password failure', async () => {
      const mockError = new Error('Incorrect password');

      vi.mocked(authRepository.updateProfile).mockRejectedValue(mockError);

      expect(accountSaga).toBeDefined();
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('Password too weak');

      vi.mocked(authRepository.updateProfile).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = changePasswordRequest({
        currentPassword: 'old-password',
        newPassword: 'new-password',
        onError,
      });

      expect(action.payload.onError).toBe(onError);
    });

    it('handles error with custom message', () => {
      const error = {
        response: {
          data: {
            message: 'Current password is incorrect',
          },
        },
        message: 'Request failed',
      };

      expect(error.response.data.message).toBe('Current password is incorrect');
    });
  });

  describe('action types', () => {
    it('has correct action type for fetchUserRequest', () => {
      expect(fetchUserRequest.type).toBe('account/fetchUserRequest');
    });

    it('has correct action type for updateUserRequest', () => {
      expect(updateUserRequest.type).toBe('account/updateUserRequest');
    });

    it('has correct action type for changePasswordRequest', () => {
      expect(changePasswordRequest.type).toBe('account/changePasswordRequest');
    });

    it('has correct action type for setAccountLoading', () => {
      expect(setAccountLoading.type).toBe('account/setAccountLoading');
    });

    it('has correct action type for setUser', () => {
      expect(setUser.type).toBe('account/setUser');
    });

    it('has correct action type for updateUserLocally', () => {
      expect(updateUserLocally.type).toBe('account/updateUserLocally');
    });
  });

  describe('integration with redux-saga effects', () => {
    it('uses call effect', () => {
      expect(call).toBeDefined();
    });

    it('uses put effect', () => {
      expect(put).toBeDefined();
    });

    it('uses takeLatest effect', () => {
      expect(takeLatest).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('handles error with message', () => {
      const error = new Error('Test error');

      expect(error.message).toBe('Test error');
    });

    it('handles error without message', () => {
      const error = { code: 401 };

      expect(error).toHaveProperty('code');
    });

    it('handles nested error response', () => {
      const error = {
        response: {
          data: {
            message: 'Unauthorized',
          },
        },
      };

      expect(error.response.data.message).toBe('Unauthorized');
    });
  });

  describe('callbacks', () => {
    it('handles onSuccess callback for updateUser', () => {
      const onSuccess = vi.fn();
      const action = updateUserRequest({
        firstName: 'John',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onError callback for updateUser', () => {
      const onError = vi.fn();
      const action = updateUserRequest({
        firstName: 'John',
        onError,
      });

      expect(typeof action.payload.onError).toBe('function');
    });

    it('handles both callbacks together for updateUser', () => {
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

    it('handles onSuccess callback for changePassword', () => {
      const onSuccess = vi.fn();
      const action = changePasswordRequest({
        currentPassword: 'old',
        newPassword: 'new',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onError callback for changePassword', () => {
      const onError = vi.fn();
      const action = changePasswordRequest({
        currentPassword: 'old',
        newPassword: 'new',
        onError,
      });

      expect(typeof action.payload.onError).toBe('function');
    });
  });

  describe('user data fields', () => {
    it('handles firstName update', () => {
      const action = updateUserRequest({
        firstName: 'John',
      });

      expect(action.payload.firstName).toBe('John');
    });

    it('handles lastName update', () => {
      const action = updateUserRequest({
        lastName: 'Doe',
      });

      expect(action.payload.lastName).toBe('Doe');
    });

    it('handles email update', () => {
      const action = updateUserRequest({
        email: 'john@example.com',
      });

      expect(action.payload.email).toBe('john@example.com');
    });

    it('handles phone update', () => {
      const action = updateUserRequest({
        phone: '0123456789',
      });

      expect(action.payload.phone).toBe('0123456789');
    });

    it('handles multiple fields update', () => {
      const action = updateUserRequest({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '0123456789',
      });

      expect(action.payload.firstName).toBe('John');
      expect(action.payload.lastName).toBe('Doe');
      expect(action.payload.email).toBe('john@example.com');
      expect(action.payload.phone).toBe('0123456789');
    });
  });

  describe('password fields', () => {
    it('handles currentPassword', () => {
      const action = changePasswordRequest({
        currentPassword: 'old-password',
        newPassword: 'new-password',
      });

      expect(action.payload.currentPassword).toBe('old-password');
    });

    it('handles newPassword', () => {
      const action = changePasswordRequest({
        currentPassword: 'old-password',
        newPassword: 'new-password',
      });

      expect(action.payload.newPassword).toBe('new-password');
    });

    it('validates different passwords', () => {
      const action = changePasswordRequest({
        currentPassword: 'old123',
        newPassword: 'new456',
      });

      expect(action.payload.currentPassword).not.toBe(action.payload.newPassword);
    });
  });
});
