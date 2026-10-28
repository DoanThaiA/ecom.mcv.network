import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as storeModule from 'src/redux/store/store';
import GuestGuard from 'src/components/auth/guest-guard';

// Mock useAppSelector
vi.mock('src/redux/store/store', () => ({
  useAppSelector: vi.fn(),
}));

// Mock Navigate and Outlet
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{`Navigate to ${to}`}</div>,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});

describe('GuestGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <GuestGuard />
      </BrowserRouter>
    );
  };

  it('renders without crashing when no token', () => {
    vi.mocked(storeModule.useAppSelector).mockReturnValue(null);
    const { container } = renderComponent();
    expect(container).toBeInTheDocument();
  });

  it('renders Outlet when token is null', () => {
    vi.mocked(storeModule.useAppSelector).mockReturnValue(null);
    const { getByTestId } = renderComponent();
    expect(getByTestId('outlet')).toBeInTheDocument();
  });

  it('renders Navigate when token exists', () => {
    vi.mocked(storeModule.useAppSelector).mockReturnValue('test-token');
    const { getByTestId } = renderComponent();
    expect(getByTestId('navigate')).toBeInTheDocument();
  });

  it('navigates to home "/" when token exists', () => {
    vi.mocked(storeModule.useAppSelector).mockReturnValue('valid-token');
    const { getByText } = renderComponent();
    expect(getByText('Navigate to /')).toBeInTheDocument();
  });

  it('logs token in useEffect', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    vi.mocked(storeModule.useAppSelector).mockReturnValue('test-token');
    renderComponent();
    expect(consoleSpy).toHaveBeenCalledWith('Guest guard', 'test-token');
    consoleSpy.mockRestore();
  });

  it('logs null token in useEffect', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    vi.mocked(storeModule.useAppSelector).mockReturnValue(null);
    renderComponent();
    expect(consoleSpy).toHaveBeenCalledWith('Guest guard', null);
    consoleSpy.mockRestore();
  });

  it('reads token from auth state via useAppSelector', () => {
    vi.mocked(storeModule.useAppSelector).mockImplementation((selector: any) =>
      selector({ auth: { token: 'my-token' } })
    );
    renderComponent();
    expect(storeModule.useAppSelector).toHaveBeenCalled();
  });

  it('renders outlet when token is undefined', () => {
    vi.mocked(storeModule.useAppSelector).mockReturnValue(undefined);
    const { getByTestId } = renderComponent();
    expect(getByTestId('outlet')).toBeInTheDocument();
  });

  it('renders outlet when token is empty string', () => {
    vi.mocked(storeModule.useAppSelector).mockReturnValue('');
    const { queryByTestId } = renderComponent();
    // Empty string is falsy, should show outlet
    expect(queryByTestId('outlet')).toBeInTheDocument();
  });

  it('renders navigate when token is non-empty string', () => {
    vi.mocked(storeModule.useAppSelector).mockReturnValue('abc123');
    const { getByTestId } = renderComponent();
    expect(getByTestId('navigate')).toBeInTheDocument();
  });
});
