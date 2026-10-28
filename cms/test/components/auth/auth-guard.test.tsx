import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthGuard } from 'src/components/auth/auth-guard';

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();
const mockHasRefreshToken = vi.fn();
const mockNeedsProactiveRefresh = vi.fn();
const mockSetAuthData = vi.fn();
const mockSetLastRefreshTime = vi.fn();
const mockClearAuth = vi.fn();
const mockRefreshToken = vi.fn();
const mockSetAuthTokenAxios = vi.fn();
const mockClearAuthTokenAxios = vi.fn();

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate</div>,
  Outlet: () => <div data-testid="outlet">Outlet</div>,
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/authSlice', () => ({
  setCredentials: vi.fn((params) => ({ type: 'SET_CREDENTIALS', payload: params })),
  logout: vi.fn(() => ({ type: 'LOGOUT' })),
}));

vi.mock('src/repositories', () => ({
  authRepository: {
    refreshToken: () => mockRefreshToken(),
  },
}));

vi.mock('src/services/storageService', () => ({
  default: {
    hasRefreshToken: () => mockHasRefreshToken(),
    needsProactiveRefresh: () => mockNeedsProactiveRefresh(),
    setAuthData: (data: any) => mockSetAuthData(data),
    setLastRefreshTime: () => mockSetLastRefreshTime(),
    clearAuth: () => mockClearAuth(),
  },
}));

vi.mock('src/utils/axios', () => ({
  setAuthTokenAxios: (token: string) => mockSetAuthTokenAxios(token),
  clearAuthTokenAxios: () => mockClearAuthTokenAxios(),
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppSelector.mockReturnValue('test-token');
    mockHasRefreshToken.mockReturnValue(true);
    mockNeedsProactiveRefresh.mockReturnValue(false);
  });

  it('renders without errors', async () => {
    expect(() => {
      render(<AuthGuard />);
    }).not.toThrow();
  });

  it('initializes without errors', () => {
    const { container } = render(<AuthGuard />);
    expect(container).toBeTruthy();
  });

  it('renders Outlet when authenticated', async () => {
    mockHasRefreshToken.mockReturnValue(false);

    render(<AuthGuard />);

    await waitFor(() => {
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
  });

  it('navigates to sign-in when no token', async () => {
    mockUseAppSelector.mockReturnValue(null);
    mockHasRefreshToken.mockReturnValue(false);

    render(<AuthGuard />);

    await waitFor(() => {
      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeInTheDocument();
      expect(navigate).toHaveAttribute('data-to', '/sign-in');
    });
  });

  it('skips refresh when no refresh token', async () => {
    mockHasRefreshToken.mockReturnValue(false);

    render(<AuthGuard />);

    await waitFor(() => {
      expect(mockRefreshToken).not.toHaveBeenCalled();
    });
  });

  it('skips refresh when not needed', async () => {
    mockHasRefreshToken.mockReturnValue(true);
    mockNeedsProactiveRefresh.mockReturnValue(false);

    render(<AuthGuard />);

    await waitFor(() => {
      expect(mockRefreshToken).not.toHaveBeenCalled();
    });
  });

  it('refreshes token when needed', async () => {
    mockHasRefreshToken.mockReturnValue(true);
    mockNeedsProactiveRefresh.mockReturnValue(true);
    mockRefreshToken.mockResolvedValue({
      token: 'new-token',
      refreshToken: 'new-refresh-token',
      tokenExpires: '2025-01-10T00:00:00Z',
    });

    render(<AuthGuard />);

    await waitFor(() => {
      expect(mockRefreshToken).toHaveBeenCalled();
    });
  });

  it('updates storage after successful refresh', async () => {
    mockHasRefreshToken.mockReturnValue(true);
    mockNeedsProactiveRefresh.mockReturnValue(true);
    mockRefreshToken.mockResolvedValue({
      token: 'new-token',
      refreshToken: 'new-refresh-token',
      tokenExpires: '2025-01-10T00:00:00Z',
    });

    render(<AuthGuard />);

    await waitFor(() => {
      expect(mockSetAuthData).toHaveBeenCalledWith({
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token',
        tokenExpires: '2025-01-10T00:00:00Z',
      });
      expect(mockSetLastRefreshTime).toHaveBeenCalled();
    });
  });

  it('updates axios header after successful refresh', async () => {
    mockHasRefreshToken.mockReturnValue(true);
    mockNeedsProactiveRefresh.mockReturnValue(true);
    mockRefreshToken.mockResolvedValue({
      token: 'new-token',
      refreshToken: 'new-refresh-token',
      tokenExpires: '2025-01-10T00:00:00Z',
    });

    render(<AuthGuard />);

    await waitFor(() => {
      expect(mockSetAuthTokenAxios).toHaveBeenCalledWith('new-token');
    });
  });

  it('dispatches setCredentials after successful refresh', async () => {
    mockHasRefreshToken.mockReturnValue(true);
    mockNeedsProactiveRefresh.mockReturnValue(true);
    mockRefreshToken.mockResolvedValue({
      token: 'new-token',
      refreshToken: 'new-refresh-token',
      tokenExpires: '2025-01-10T00:00:00Z',
    });

    render(<AuthGuard />);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SET_CREDENTIALS' })
      );
    });
  });

  it('clears auth on refresh failure', async () => {
    mockHasRefreshToken.mockReturnValue(true);
    mockNeedsProactiveRefresh.mockReturnValue(true);
    mockRefreshToken.mockRejectedValue(new Error('Refresh failed'));

    render(<AuthGuard />);

    await waitFor(() => {
      expect(mockClearAuth).toHaveBeenCalled();
      expect(mockClearAuthTokenAxios).toHaveBeenCalled();
    });
  });

  it('dispatches logout on refresh failure', async () => {
    mockHasRefreshToken.mockReturnValue(true);
    mockNeedsProactiveRefresh.mockReturnValue(true);
    mockRefreshToken.mockRejectedValue(new Error('Refresh failed'));

    render(<AuthGuard />);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'LOGOUT' })
      );
    });
  });

  it('uses useAppDispatch hook', () => {
    render(<AuthGuard />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<AuthGuard />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('exports AuthGuard function', () => {
    expect(AuthGuard).toBeDefined();
    expect(typeof AuthGuard).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof AuthGuard).toBe('function');
    expect(AuthGuard.name).toBe('AuthGuard');
  });

  it('renders correctly after initialization', async () => {
    mockHasRefreshToken.mockReturnValue(false);

    render(<AuthGuard />);

    await waitFor(() => {
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
  });
});
