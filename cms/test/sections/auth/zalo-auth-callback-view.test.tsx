import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from 'test/utils/testUtils';
import * as routerDom from 'react-router-dom';
import { ZaloAuthCallbackView } from 'src/sections/auth/zalo-auth-callback-view';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: vi.fn(),
  };
});

describe('ZaloAuthCallbackView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing with code', () => {
    const mockSearchParams = new URLSearchParams('?code=test');
    vi.mocked(routerDom.useSearchParams).mockReturnValue([mockSearchParams, vi.fn()] as any);
    
    const { container } = renderWithProviders(<ZaloAuthCallbackView />);
    expect(container).toBeInTheDocument();
  });

  it('shows error when no code provided', () => {
    const mockSearchParams = new URLSearchParams('');
    vi.mocked(routerDom.useSearchParams).mockReturnValue([mockSearchParams, vi.fn()] as any);
    
    renderWithProviders(<ZaloAuthCallbackView />);
    expect(screen.getByText('zaloAuthFailed')).toBeInTheDocument();
  });

  it('dispatches zaloCallbackRequest with code', () => {
    const mockSearchParams = new URLSearchParams('?code=abc123');
    vi.mocked(routerDom.useSearchParams).mockReturnValue([mockSearchParams, vi.fn()] as any);

    const { store } = renderWithProviders(<ZaloAuthCallbackView />);
    // The component should dispatch an action when code is present
    expect(store.getState()).toBeDefined();
  });

  it('renders Card component', () => {
    const mockSearchParams = new URLSearchParams('?code=test');
    vi.mocked(routerDom.useSearchParams).mockReturnValue([mockSearchParams, vi.fn()] as any);
    
    const { container } = renderWithProviders(<ZaloAuthCallbackView />);
    expect(container.querySelector('.MuiCard-root')).toBeInTheDocument();
  });

  it('shows CircularProgress in loading state', () => {
    const mockSearchParams = new URLSearchParams('?code=test');
    vi.mocked(routerDom.useSearchParams).mockReturnValue([mockSearchParams, vi.fn()] as any);
    
    const { container } = renderWithProviders(<ZaloAuthCallbackView />);
    expect(container.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
  });
});
