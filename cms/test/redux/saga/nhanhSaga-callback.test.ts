import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { nhanhRepository } from 'src/repositories';
import { nhanhSaga } from 'src/redux/saga/nhanhSaga';
import nhanhReducer, { nhanhCallbackRequest } from 'src/redux/store/nhanhSlice';

vi.mock('src/repositories', () => ({
  nhanhRepository: {
    handleCallback: vi.fn(),
  },
}));

vi.mock('src/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

const createStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: { nhanh: nhanhReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(sagaMiddleware),
  });
  sagaMiddleware.run(nhanhSaga);
  return store;
};

describe('nhanh callback saga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('forwards the verifyCode to the repository and marks Nhanh as connected', async () => {
    vi.mocked(nhanhRepository.handleCallback).mockResolvedValue({
      success: true,
      message: 'Connected',
    });
    const onSuccess = vi.fn();
    const store = createStore();

    store.dispatch(nhanhCallbackRequest({ accessCode: 'ac-1', verifyCode: 'vc-1', onSuccess }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(nhanhRepository.handleCallback).toHaveBeenCalledWith({
      accessCode: 'ac-1',
      verifyCode: 'vc-1',
    });
    expect(store.getState().nhanh.isConnected).toBe(true);
  });

  it('reports the backend message and stays disconnected when the exchange fails', async () => {
    vi.mocked(nhanhRepository.handleCallback).mockRejectedValue({
      response: { data: { message: 'Verification code does not match' } },
    });
    const onError = vi.fn();
    const store = createStore();

    store.dispatch(nhanhCallbackRequest({ accessCode: 'ac-1', verifyCode: 'forged', onError }));

    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError).toHaveBeenCalledWith('Verification code does not match');
    expect(store.getState().nhanh.isConnected).toBe(false);
  });
});
