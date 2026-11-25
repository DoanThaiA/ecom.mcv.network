import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import * as routerDom from 'react-router-dom';
import { NhanhAuthCallbackView } from 'src/sections/auth/nhanh-auth-callback-view';

const mockDispatch = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: vi.fn(),
}));

const setSearch = (search: string) => {
  vi.mocked(routerDom.useSearchParams).mockReturnValue([
    new URLSearchParams(search),
    vi.fn(),
  ] as never);
};

describe('NhanhAuthCallbackView verifyCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the accessCode and the verifyCode from the redirect', () => {
    setSearch('?accessCode=abc123&verifyCode=f3a9c1d27b8e4d0a');

    render(<NhanhAuthCallbackView />);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch.mock.calls[0][0]).toMatchObject({
      type: 'nhanh/callbackRequest',
      payload: { accessCode: 'abc123', verifyCode: 'f3a9c1d27b8e4d0a' },
    });
  });

  it('still sends the accessCode when the redirect has no verifyCode', () => {
    setSearch('?accessCode=abc123');

    render(<NhanhAuthCallbackView />);

    const { payload } = mockDispatch.mock.calls[0][0];
    expect(payload.accessCode).toBe('abc123');
    expect(payload.verifyCode).toBeUndefined();
  });

  it('does not call the backend without an accessCode', () => {
    setSearch('?verifyCode=f3a9c1d27b8e4d0a');

    render(<NhanhAuthCallbackView />);

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
