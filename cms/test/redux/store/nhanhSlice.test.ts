import { describe, it, expect, vi } from 'vitest';

import nhanhReducer, {
  setNhanhLoading,
  setNhanhConnected,
  setNhanhError,
  clearNhanhError,
  resetNhanhState,
  nhanhRedirectRequest,
  nhanhCallbackRequest,
  nhanhSyncAllRequest,
  nhanhCheckConnectionRequest,
  selectNhanhIsConnected,
  selectNhanhLoading,
  selectNhanhError,
  selectNhanhLastSyncTime,
  type NhanhState,
} from 'src/redux/store/nhanhSlice';

describe('nhanhSlice', () => {
  const initialState: NhanhState = {
    isConnected: false,
    loading: false,
    error: null,
    lastSyncTime: null,
  };

  describe('reducers', () => {
    describe('setNhanhLoading', () => {
      it('sets loading to true and clears error', () => {
        const stateWithError: NhanhState = {
          isConnected: false,
          loading: false,
          error: 'Previous error',
          lastSyncTime: null,
        };

        const state = nhanhReducer(stateWithError, setNhanhLoading(true));

        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
      });

      it('sets loading to false without clearing error', () => {
        const loadingState: NhanhState = {
          isConnected: false,
          loading: true,
          error: null,
          lastSyncTime: null,
        };

        const state = nhanhReducer(loadingState, setNhanhLoading(false));

        expect(state.loading).toBe(false);
      });

      it('does not affect connection status', () => {
        const connectedState: NhanhState = {
          isConnected: true,
          loading: false,
          error: null,
          lastSyncTime: Date.now(),
        };

        const state = nhanhReducer(connectedState, setNhanhLoading(true));

        expect(state.loading).toBe(true);
        expect(state.isConnected).toBe(true);
        expect(state.lastSyncTime).toBe(connectedState.lastSyncTime);
      });
    });

    describe('setNhanhConnected', () => {
      it('sets connected to true and clears loading and error', () => {
        const loadingState: NhanhState = {
          isConnected: false,
          loading: true,
          error: 'Connection error',
          lastSyncTime: null,
        };

        const state = nhanhReducer(loadingState, setNhanhConnected(true));

        expect(state.isConnected).toBe(true);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
      });

      it('sets connected to false', () => {
        const connectedState: NhanhState = {
          isConnected: true,
          loading: false,
          error: null,
          lastSyncTime: Date.now(),
        };

        const state = nhanhReducer(connectedState, setNhanhConnected(false));

        expect(state.isConnected).toBe(false);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
      });

      it('always clears loading and error', () => {
        const state = nhanhReducer(initialState, setNhanhConnected(true));

        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
      });

      it('does not affect lastSyncTime', () => {
        const syncTime = Date.now();
        const stateWithSync: NhanhState = {
          isConnected: false,
          loading: false,
          error: null,
          lastSyncTime: syncTime,
        };

        const state = nhanhReducer(stateWithSync, setNhanhConnected(true));

        expect(state.lastSyncTime).toBe(syncTime);
      });
    });

    describe('setNhanhError', () => {
      it('sets error and clears loading', () => {
        const loadingState: NhanhState = {
          isConnected: false,
          loading: true,
          error: null,
          lastSyncTime: null,
        };

        const state = nhanhReducer(loadingState, setNhanhError('Connection failed'));

        expect(state.error).toBe('Connection failed');
        expect(state.loading).toBe(false);
      });

      it('replaces existing error', () => {
        const stateWithError: NhanhState = {
          isConnected: false,
          loading: false,
          error: 'Old error',
          lastSyncTime: null,
        };

        const state = nhanhReducer(stateWithError, setNhanhError('New error'));

        expect(state.error).toBe('New error');
      });

      it('does not affect connection status', () => {
        const connectedState: NhanhState = {
          isConnected: true,
          loading: true,
          error: null,
          lastSyncTime: Date.now(),
        };

        const state = nhanhReducer(connectedState, setNhanhError('Some error'));

        expect(state.isConnected).toBe(true);
        expect(state.lastSyncTime).toBe(connectedState.lastSyncTime);
      });
    });

    describe('clearNhanhError', () => {
      it('clears error', () => {
        const stateWithError: NhanhState = {
          isConnected: false,
          loading: false,
          error: 'Error message',
          lastSyncTime: null,
        };

        const state = nhanhReducer(stateWithError, clearNhanhError());

        expect(state.error).toBe(null);
      });

      it('does not affect other state properties', () => {
        const stateWithError: NhanhState = {
          isConnected: true,
          loading: false,
          error: 'Error message',
          lastSyncTime: Date.now(),
        };

        const state = nhanhReducer(stateWithError, clearNhanhError());

        expect(state.error).toBe(null);
        expect(state.isConnected).toBe(true);
        expect(state.loading).toBe(false);
        expect(state.lastSyncTime).toBe(stateWithError.lastSyncTime);
      });

      it('works when error is already null', () => {
        const state = nhanhReducer(initialState, clearNhanhError());

        expect(state.error).toBe(null);
      });
    });

    describe('resetNhanhState', () => {
      it('resets all state to initial values', () => {
        const activeState: NhanhState = {
          isConnected: true,
          loading: true,
          error: 'Some error',
          lastSyncTime: Date.now(),
        };

        const state = nhanhReducer(activeState, resetNhanhState());

        expect(state.isConnected).toBe(false);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        expect(state.lastSyncTime).toBe(null);
      });

      it('works on already empty state', () => {
        const state = nhanhReducer(initialState, resetNhanhState());

        expect(state).toEqual(initialState);
      });

      it('clears all data including lastSyncTime', () => {
        const connectedState: NhanhState = {
          isConnected: true,
          loading: false,
          error: null,
          lastSyncTime: 1704067200000,
        };

        const state = nhanhReducer(connectedState, resetNhanhState());

        expect(state.lastSyncTime).toBe(null);
      });
    });
  });

  describe('saga actions', () => {
    describe('nhanhRedirectRequest', () => {
      it('creates correct action type', () => {
        const action = nhanhRedirectRequest({});

        expect(action.type).toBe('nhanh/redirectRequest');
      });

      it('includes callback functions', () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const action = nhanhRedirectRequest({ onSuccess, onError });

        expect(action.payload.onSuccess).toBe(onSuccess);
        expect(action.payload.onError).toBe(onError);
      });

      it('handles payload without callbacks', () => {
        const action = nhanhRedirectRequest({});

        expect(action.payload).toEqual({});
      });
    });

    describe('nhanhCallbackRequest', () => {
      it('creates correct action type', () => {
        const action = nhanhCallbackRequest({ accessCode: 'abc123' });

        expect(action.type).toBe('nhanh/callbackRequest');
      });

      it('includes accessCode in payload', () => {
        const action = nhanhCallbackRequest({ accessCode: 'test-code-123' });

        expect(action.payload.accessCode).toBe('test-code-123');
      });

      it('includes callback functions', () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const action = nhanhCallbackRequest({
          accessCode: 'abc123',
          onSuccess,
          onError,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
        expect(action.payload.onError).toBe(onError);
      });

      it('handles different accessCode formats', () => {
        const codes = ['abc123', 'long-access-code-with-dashes', '123456'];

        codes.forEach((code) => {
          const action = nhanhCallbackRequest({ accessCode: code });
          expect(action.payload.accessCode).toBe(code);
        });
      });
    });

    describe('nhanhSyncAllRequest', () => {
      it('creates correct action type', () => {
        const action = nhanhSyncAllRequest({});

        expect(action.type).toBe('nhanh/syncAllRequest');
      });

      it('includes callback functions', () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const action = nhanhSyncAllRequest({ onSuccess, onError });

        expect(action.payload.onSuccess).toBe(onSuccess);
        expect(action.payload.onError).toBe(onError);
      });

      it('handles payload without callbacks', () => {
        const action = nhanhSyncAllRequest({});

        expect(action.payload).toEqual({});
      });
    });

    describe('nhanhCheckConnectionRequest', () => {
      it('creates correct action type', () => {
        const action = nhanhCheckConnectionRequest({});

        expect(action.type).toBe('nhanh/checkConnectionRequest');
      });

      it('includes callback functions', () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const action = nhanhCheckConnectionRequest({ onSuccess, onError });

        expect(action.payload.onSuccess).toBe(onSuccess);
        expect(action.payload.onError).toBe(onError);
      });

      it('handles payload without callbacks', () => {
        const action = nhanhCheckConnectionRequest({});

        expect(action.payload).toEqual({});
      });
    });
  });

  describe('selectors', () => {
    describe('selectNhanhIsConnected', () => {
      it('returns false for initial state', () => {
        const state = { nhanh: initialState };

        const isConnected = selectNhanhIsConnected(state);

        expect(isConnected).toBe(false);
      });

      it('returns true when connected', () => {
        const state = {
          nhanh: {
            isConnected: true,
            loading: false,
            error: null,
            lastSyncTime: Date.now(),
          },
        };

        const isConnected = selectNhanhIsConnected(state);

        expect(isConnected).toBe(true);
      });

      it('returns false after disconnection', () => {
        const connectedState = {
          nhanh: {
            isConnected: true,
            loading: false,
            error: null,
            lastSyncTime: Date.now(),
          },
        };

        const disconnectedState = {
          nhanh: nhanhReducer(connectedState.nhanh, setNhanhConnected(false)),
        };

        const isConnected = selectNhanhIsConnected(disconnectedState);

        expect(isConnected).toBe(false);
      });
    });

    describe('selectNhanhLoading', () => {
      it('returns false for initial state', () => {
        const state = { nhanh: initialState };

        const loading = selectNhanhLoading(state);

        expect(loading).toBe(false);
      });

      it('returns true when loading', () => {
        const state = {
          nhanh: {
            isConnected: false,
            loading: true,
            error: null,
            lastSyncTime: null,
          },
        };

        const loading = selectNhanhLoading(state);

        expect(loading).toBe(true);
      });

      it('returns false after loading completes', () => {
        const state = {
          nhanh: {
            isConnected: true,
            loading: false,
            error: null,
            lastSyncTime: Date.now(),
          },
        };

        const loading = selectNhanhLoading(state);

        expect(loading).toBe(false);
      });
    });

    describe('selectNhanhError', () => {
      it('returns null for initial state', () => {
        const state = { nhanh: initialState };

        const error = selectNhanhError(state);

        expect(error).toBe(null);
      });

      it('returns error message when present', () => {
        const state = {
          nhanh: {
            isConnected: false,
            loading: false,
            error: 'Connection failed',
            lastSyncTime: null,
          },
        };

        const error = selectNhanhError(state);

        expect(error).toBe('Connection failed');
      });

      it('returns null after clearing error', () => {
        const stateWithError = {
          nhanh: {
            isConnected: false,
            loading: false,
            error: 'Error message',
            lastSyncTime: null,
          },
        };

        const clearedState = {
          nhanh: nhanhReducer(stateWithError.nhanh, clearNhanhError()),
        };

        const error = selectNhanhError(clearedState);

        expect(error).toBe(null);
      });
    });

    describe('selectNhanhLastSyncTime', () => {
      it('returns null for initial state', () => {
        const state = { nhanh: initialState };

        const lastSyncTime = selectNhanhLastSyncTime(state);

        expect(lastSyncTime).toBe(null);
      });

      it('returns sync time when present', () => {
        const syncTime = 1704067200000;
        const state = {
          nhanh: {
            isConnected: true,
            loading: false,
            error: null,
            lastSyncTime: syncTime,
          },
        };

        const lastSyncTime = selectNhanhLastSyncTime(state);

        expect(lastSyncTime).toBe(syncTime);
      });

      it('returns null after reset', () => {
        const stateWithSync = {
          nhanh: {
            isConnected: true,
            loading: false,
            error: null,
            lastSyncTime: Date.now(),
          },
        };

        const resetState = {
          nhanh: nhanhReducer(stateWithSync.nhanh, resetNhanhState()),
        };

        const lastSyncTime = selectNhanhLastSyncTime(resetState);

        expect(lastSyncTime).toBe(null);
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete connection flow', () => {
      // Start: Initial state
      let state = initialState;
      expect(selectNhanhIsConnected({ nhanh: state })).toBe(false);
      expect(selectNhanhLoading({ nhanh: state })).toBe(false);

      // Step 1: Start connection
      state = nhanhReducer(state, setNhanhLoading(true));
      expect(selectNhanhLoading({ nhanh: state })).toBe(true);

      // Step 2: Connection successful
      state = nhanhReducer(state, setNhanhConnected(true));
      expect(selectNhanhIsConnected({ nhanh: state })).toBe(true);
      expect(selectNhanhLoading({ nhanh: state })).toBe(false);
    });

    it('handles connection error flow', () => {
      // Start connection
      let state = nhanhReducer(initialState, setNhanhLoading(true));
      expect(selectNhanhLoading({ nhanh: state })).toBe(true);

      // Connection failed
      state = nhanhReducer(state, setNhanhError('Authentication failed'));
      expect(selectNhanhError({ nhanh: state })).toBe('Authentication failed');
      expect(selectNhanhLoading({ nhanh: state })).toBe(false);
      expect(selectNhanhIsConnected({ nhanh: state })).toBe(false);
    });

    it('handles disconnection flow', () => {
      // Start: Connected state
      let state: NhanhState = {
        isConnected: true,
        loading: false,
        error: null,
        lastSyncTime: Date.now(),
      };

      expect(selectNhanhIsConnected({ nhanh: state })).toBe(true);

      // Disconnect
      state = nhanhReducer(state, setNhanhConnected(false));
      expect(selectNhanhIsConnected({ nhanh: state })).toBe(false);
    });

    it('handles retry after error flow', () => {
      // First attempt - error
      let state = nhanhReducer(initialState, setNhanhLoading(true));
      state = nhanhReducer(state, setNhanhError('Connection timeout'));
      expect(selectNhanhError({ nhanh: state })).toBe('Connection timeout');

      // Clear error and retry
      state = nhanhReducer(state, clearNhanhError());
      expect(selectNhanhError({ nhanh: state })).toBe(null);

      state = nhanhReducer(state, setNhanhLoading(true));
      expect(selectNhanhLoading({ nhanh: state })).toBe(true);
      expect(selectNhanhError({ nhanh: state })).toBe(null);

      // Second attempt - success
      state = nhanhReducer(state, setNhanhConnected(true));
      expect(selectNhanhIsConnected({ nhanh: state })).toBe(true);
      expect(selectNhanhError({ nhanh: state })).toBe(null);
    });

    it('handles complete reset flow', () => {
      // Active connected state
      let state: NhanhState = {
        isConnected: true,
        loading: false,
        error: null,
        lastSyncTime: Date.now(),
      };

      // Reset everything
      state = nhanhReducer(state, resetNhanhState());
      expect(selectNhanhIsConnected({ nhanh: state })).toBe(false);
      expect(selectNhanhLoading({ nhanh: state })).toBe(false);
      expect(selectNhanhError({ nhanh: state })).toBe(null);
      expect(selectNhanhLastSyncTime({ nhanh: state })).toBe(null);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = nhanhReducer(initialState, { type: 'unknown' } as any);

      expect(state).toEqual(initialState);
    });

    it('handles multiple consecutive loading toggles', () => {
      let state = initialState;

      state = nhanhReducer(state, setNhanhLoading(true));
      expect(state.loading).toBe(true);

      state = nhanhReducer(state, setNhanhLoading(false));
      expect(state.loading).toBe(false);

      state = nhanhReducer(state, setNhanhLoading(true));
      expect(state.loading).toBe(true);
    });

    it('handles multiple consecutive errors', () => {
      let state = initialState;

      state = nhanhReducer(state, setNhanhError('Error 1'));
      expect(state.error).toBe('Error 1');

      state = nhanhReducer(state, setNhanhError('Error 2'));
      expect(state.error).toBe('Error 2');

      state = nhanhReducer(state, setNhanhError('Error 3'));
      expect(state.error).toBe('Error 3');
    });

    it('preserves lastSyncTime through connection state changes', () => {
      const syncTime = Date.now();
      let state: NhanhState = {
        isConnected: true,
        loading: false,
        error: null,
        lastSyncTime: syncTime,
      };

      state = nhanhReducer(state, setNhanhConnected(false));
      expect(state.lastSyncTime).toBe(syncTime);

      state = nhanhReducer(state, setNhanhConnected(true));
      expect(state.lastSyncTime).toBe(syncTime);
    });

    it('preserves lastSyncTime through error states', () => {
      const syncTime = Date.now();
      let state: NhanhState = {
        isConnected: true,
        loading: false,
        error: null,
        lastSyncTime: syncTime,
      };

      state = nhanhReducer(state, setNhanhError('Some error'));
      expect(state.lastSyncTime).toBe(syncTime);

      state = nhanhReducer(state, clearNhanhError());
      expect(state.lastSyncTime).toBe(syncTime);
    });

    it('clears error when starting new loading', () => {
      let state = nhanhReducer(initialState, setNhanhError('Previous error'));
      expect(state.error).toBe('Previous error');

      state = nhanhReducer(state, setNhanhLoading(true));
      expect(state.error).toBe(null);
    });
  });
});
