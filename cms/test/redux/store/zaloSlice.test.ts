import { describe, it, expect } from 'vitest';

import zaloReducer, {
  setZaloLoading,
  setZaloOAInfo,
  zaloRedirectRequest,
  zaloCallbackRequest,
  zaloCheckConnectionRequest,
  selectZaloIsConnected,
  selectZaloLoading,
  selectZaloOAInfo,
  type ZaloState,
} from 'src/redux/store/zaloSlice';
import type { ZaloOAInfo } from 'src/types/zalo';

describe('zaloSlice', () => {
  const initialState: ZaloState = {
    loading: false,
    oaInfo: null,
  };

  const mockZaloOAInfo: ZaloOAInfo = {
    oaId: 'oa-123',
    name: 'Test OA',
    description: 'Test Zalo OA',
    avatar: 'https://example.com/avatar.jpg',
  };

  describe('reducers', () => {
    describe('setZaloLoading', () => {
      it('sets loading to true', () => {
        const state = zaloReducer(initialState, setZaloLoading(true));

        expect(state.loading).toBe(true);
        expect(state.oaInfo).toBe(null);
      });

      it('sets loading to false', () => {
        const loadingState: ZaloState = {
          loading: true,
          oaInfo: null,
        };

        const state = zaloReducer(loadingState, setZaloLoading(false));

        expect(state.loading).toBe(false);
      });

      it('does not affect oaInfo when setting loading', () => {
        const stateWithInfo: ZaloState = {
          loading: false,
          oaInfo: mockZaloOAInfo,
        };

        const state = zaloReducer(stateWithInfo, setZaloLoading(true));

        expect(state.loading).toBe(true);
        expect(state.oaInfo).toEqual(mockZaloOAInfo);
      });
    });

    describe('setZaloOAInfo', () => {
      it('sets oaInfo and sets loading to false', () => {
        const loadingState: ZaloState = {
          loading: true,
          oaInfo: null,
        };

        const state = zaloReducer(loadingState, setZaloOAInfo(mockZaloOAInfo));

        expect(state.oaInfo).toEqual(mockZaloOAInfo);
        expect(state.loading).toBe(false);
      });

      it('clears oaInfo when setting to null', () => {
        const stateWithInfo: ZaloState = {
          loading: false,
          oaInfo: mockZaloOAInfo,
        };

        const state = zaloReducer(stateWithInfo, setZaloOAInfo(null));

        expect(state.oaInfo).toBe(null);
        expect(state.loading).toBe(false);
      });

      it('updates oaInfo when replacing existing info', () => {
        const stateWithInfo: ZaloState = {
          loading: false,
          oaInfo: mockZaloOAInfo,
        };

        const newOAInfo: ZaloOAInfo = {
          oaId: 'oa-456',
          name: 'New OA',
          description: 'New Zalo OA',
          avatar: 'https://example.com/new-avatar.jpg',
        };

        const state = zaloReducer(stateWithInfo, setZaloOAInfo(newOAInfo));

        expect(state.oaInfo).toEqual(newOAInfo);
        expect(state.oaInfo).not.toEqual(mockZaloOAInfo);
      });

      it('always sets loading to false when setting oaInfo', () => {
        const loadingState: ZaloState = {
          loading: true,
          oaInfo: null,
        };

        const state = zaloReducer(loadingState, setZaloOAInfo(null));

        expect(state.loading).toBe(false);
      });
    });
  });

  describe('saga actions', () => {
    describe('zaloRedirectRequest', () => {
      it('creates correct action type', () => {
        const action = zaloRedirectRequest({});

        expect(action.type).toBe('zalo/redirectRequest');
      });

      it('includes empty payload', () => {
        const action = zaloRedirectRequest({});

        expect(action.payload).toEqual({});
      });
    });

    describe('zaloCallbackRequest', () => {
      it('creates correct action type', () => {
        const action = zaloCallbackRequest({ code: 'auth-code-123' });

        expect(action.type).toBe('zalo/callbackRequest');
      });

      it('includes code in payload', () => {
        const action = zaloCallbackRequest({ code: 'auth-code-123' });

        expect(action.payload.code).toBe('auth-code-123');
      });

      it('handles different code formats', () => {
        const codes = ['abc123', '123456', 'long-auth-code-with-dashes'];

        codes.forEach((code) => {
          const action = zaloCallbackRequest({ code });
          expect(action.payload.code).toBe(code);
        });
      });
    });

    describe('zaloCheckConnectionRequest', () => {
      it('creates correct action type', () => {
        const action = zaloCheckConnectionRequest({});

        expect(action.type).toBe('zalo/checkConnectionRequest');
      });

      it('includes empty payload', () => {
        const action = zaloCheckConnectionRequest({});

        expect(action.payload).toEqual({});
      });
    });
  });

  describe('selectors', () => {
    describe('selectZaloIsConnected', () => {
      it('returns false when oaInfo is null', () => {
        const state = { zalo: initialState };

        const isConnected = selectZaloIsConnected(state);

        expect(isConnected).toBe(false);
      });

      it('returns true when oaInfo is present', () => {
        const state = {
          zalo: {
            loading: false,
            oaInfo: mockZaloOAInfo,
          },
        };

        const isConnected = selectZaloIsConnected(state);

        expect(isConnected).toBe(true);
      });

      it('returns false even when loading is true but oaInfo is null', () => {
        const state = {
          zalo: {
            loading: true,
            oaInfo: null,
          },
        };

        const isConnected = selectZaloIsConnected(state);

        expect(isConnected).toBe(false);
      });

      it('returns true when loading is true and oaInfo is present', () => {
        const state = {
          zalo: {
            loading: true,
            oaInfo: mockZaloOAInfo,
          },
        };

        const isConnected = selectZaloIsConnected(state);

        expect(isConnected).toBe(true);
      });
    });

    describe('selectZaloLoading', () => {
      it('returns false for initial state', () => {
        const state = { zalo: initialState };

        const loading = selectZaloLoading(state);

        expect(loading).toBe(false);
      });

      it('returns true when loading', () => {
        const state = {
          zalo: {
            loading: true,
            oaInfo: null,
          },
        };

        const loading = selectZaloLoading(state);

        expect(loading).toBe(true);
      });

      it('returns false when not loading', () => {
        const state = {
          zalo: {
            loading: false,
            oaInfo: mockZaloOAInfo,
          },
        };

        const loading = selectZaloLoading(state);

        expect(loading).toBe(false);
      });
    });

    describe('selectZaloOAInfo', () => {
      it('returns null for initial state', () => {
        const state = { zalo: initialState };

        const oaInfo = selectZaloOAInfo(state);

        expect(oaInfo).toBe(null);
      });

      it('returns oaInfo when present', () => {
        const state = {
          zalo: {
            loading: false,
            oaInfo: mockZaloOAInfo,
          },
        };

        const oaInfo = selectZaloOAInfo(state);

        expect(oaInfo).toEqual(mockZaloOAInfo);
      });

      it('returns null after clearing oaInfo', () => {
        const stateWithInfo = {
          zalo: {
            loading: false,
            oaInfo: mockZaloOAInfo,
          },
        };

        const clearedState = {
          zalo: zaloReducer(stateWithInfo.zalo, setZaloOAInfo(null)),
        };

        const oaInfo = selectZaloOAInfo(clearedState);

        expect(oaInfo).toBe(null);
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete authentication flow', () => {
      // Start: Initial state
      let state = initialState;
      expect(selectZaloIsConnected({ zalo: state })).toBe(false);
      expect(selectZaloLoading({ zalo: state })).toBe(false);

      // Step 1: Start loading (redirect request)
      state = zaloReducer(state, setZaloLoading(true));
      expect(selectZaloLoading({ zalo: state })).toBe(true);
      expect(selectZaloIsConnected({ zalo: state })).toBe(false);

      // Step 2: Receive OA info (callback success)
      state = zaloReducer(state, setZaloOAInfo(mockZaloOAInfo));
      expect(selectZaloLoading({ zalo: state })).toBe(false);
      expect(selectZaloIsConnected({ zalo: state })).toBe(true);
      expect(selectZaloOAInfo({ zalo: state })).toEqual(mockZaloOAInfo);
    });

    it('handles disconnection flow', () => {
      // Start: Connected state
      let state: ZaloState = {
        loading: false,
        oaInfo: mockZaloOAInfo,
      };
      expect(selectZaloIsConnected({ zalo: state })).toBe(true);

      // Disconnect
      state = zaloReducer(state, setZaloOAInfo(null));
      expect(selectZaloIsConnected({ zalo: state })).toBe(false);
      expect(selectZaloOAInfo({ zalo: state })).toBe(null);
    });

    it('handles reconnection flow', () => {
      // Start: Connected state
      let state: ZaloState = {
        loading: false,
        oaInfo: mockZaloOAInfo,
      };

      // Disconnect
      state = zaloReducer(state, setZaloOAInfo(null));
      expect(selectZaloIsConnected({ zalo: state })).toBe(false);

      // Reconnect - start loading
      state = zaloReducer(state, setZaloLoading(true));
      expect(selectZaloLoading({ zalo: state })).toBe(true);

      // Reconnect - receive new info
      const newOAInfo: ZaloOAInfo = {
        oaId: 'oa-new',
        name: 'Reconnected OA',
        description: 'Reconnected',
        avatar: 'https://example.com/reconnect.jpg',
      };
      state = zaloReducer(state, setZaloOAInfo(newOAInfo));
      expect(selectZaloIsConnected({ zalo: state })).toBe(true);
      expect(selectZaloOAInfo({ zalo: state })).toEqual(newOAInfo);
    });

    it('handles failed authentication flow', () => {
      // Start loading
      let state = zaloReducer(initialState, setZaloLoading(true));
      expect(selectZaloLoading({ zalo: state })).toBe(true);

      // Failed - clear oaInfo and stop loading
      state = zaloReducer(state, setZaloOAInfo(null));
      expect(selectZaloLoading({ zalo: state })).toBe(false);
      expect(selectZaloIsConnected({ zalo: state })).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = zaloReducer(initialState, { type: 'unknown' } as any);

      expect(state).toEqual(initialState);
    });

    it('handles multiple consecutive loading toggles', () => {
      let state = initialState;

      state = zaloReducer(state, setZaloLoading(true));
      expect(state.loading).toBe(true);

      state = zaloReducer(state, setZaloLoading(false));
      expect(state.loading).toBe(false);

      state = zaloReducer(state, setZaloLoading(true));
      expect(state.loading).toBe(true);

      state = zaloReducer(state, setZaloLoading(true));
      expect(state.loading).toBe(true);
    });

    it('handles setting same oaInfo multiple times', () => {
      let state = initialState;

      state = zaloReducer(state, setZaloOAInfo(mockZaloOAInfo));
      const firstState = state;

      state = zaloReducer(state, setZaloOAInfo(mockZaloOAInfo));
      const secondState = state;

      expect(firstState.oaInfo).toEqual(secondState.oaInfo);
    });

    it('preserves oaInfo through loading state changes', () => {
      let state = zaloReducer(initialState, setZaloOAInfo(mockZaloOAInfo));
      const originalOAInfo = state.oaInfo;

      state = zaloReducer(state, setZaloLoading(true));
      expect(state.oaInfo).toEqual(originalOAInfo);

      state = zaloReducer(state, setZaloLoading(false));
      expect(state.oaInfo).toEqual(originalOAInfo);
    });
  });
});
