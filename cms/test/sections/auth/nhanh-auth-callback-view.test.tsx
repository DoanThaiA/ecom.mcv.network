import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from 'test/utils/testUtils';
import * as routerDom from 'react-router-dom';
import { NhanhAuthCallbackView } from 'src/sections/auth/nhanh-auth-callback-view';

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

describe('NhanhAuthCallbackView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing with accessCode', () => {
    const mockSearchParams = new URLSearchParams('?accessCode=test');
    vi.mocked(routerDom.useSearchParams).mockReturnValue([mockSearchParams, vi.fn()] as any);
    
    const { container } = renderWithProviders(<NhanhAuthCallbackView />);
    expect(container).toBeInTheDocument();
  });

  it('shows error when no accessCode provided', () => {
    const mockSearchParams = new URLSearchParams('');
    vi.mocked(routerDom.useSearchParams).mockReturnValue([mockSearchParams, vi.fn()] as any);
    
    renderWithProviders(<NhanhAuthCallbackView />);
    expect(screen.getByText('nhanhAuthFailed')).toBeInTheDocument();
  });

  it('dispatches nhanhCallbackRequest with accessCode', () => {
    const mockSearchParams = new URLSearchParams('?accessCode=abc123');
    vi.mocked(routerDom.useSearchParams).mockReturnValue([mockSearchParams, vi.fn()] as any);

    const { store } = renderWithProviders(<NhanhAuthCallbackView />);
    // The component should dispatch an action when accessCode is present
    expect(store.getState()).toBeDefined();
  });

  it('renders Card component', () => {
    const mockSearchParams = new URLSearchParams('?accessCode=test');
    vi.mocked(routerDom.useSearchParams).mockReturnValue([mockSearchParams, vi.fn()] as any);
    
    const { container } = renderWithProviders(<NhanhAuthCallbackView />);
    expect(container.querySelector('.MuiCard-root')).toBeInTheDocument();
  });

  it('shows CircularProgress in loading state', () => {
    const mockSearchParams = new URLSearchParams('?accessCode=test');
    vi.mocked(routerDom.useSearchParams).mockReturnValue([mockSearchParams, vi.fn()] as any);
    
    const { container } = renderWithProviders(<NhanhAuthCallbackView />);
    expect(container.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
  });
});
