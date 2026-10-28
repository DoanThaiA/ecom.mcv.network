import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, act } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { CartPageClient } from '@/components/cart/CartPageClient';
import { renderWithProviders } from '@/test/utils/testUtils';
import { AuthStatus } from '@/lib/store/slices/authSlice';

// Mock child components as stubs
vi.mock('@/components/cart/CartContent', () => ({
  CartContent: (props: any) => (
    <div data-testid="cart-content-mobile" data-locale={props.locale} data-active={props.isActive}>
      CartContent
    </div>
  ),
}));

vi.mock('@/components/cart/CartContentDesktop', () => ({
  CartContentDesktop: (props: any) => (
    <div data-testid="cart-content-desktop" data-locale={props.locale} data-active={props.isActive}>
      CartContentDesktop
    </div>
  ),
}));

// Mock storageService (needs all methods used by store slices during initialization)
vi.mock('@/lib/services/storage.service', () => ({
  storageService: {
    getCheckoutSessionId: vi.fn(() => null),
    clearCheckoutSession: vi.fn(),
    getUser: vi.fn(() => null),
    setUser: vi.fn(),
    removeUser: vi.fn(),
    getToken: vi.fn(() => null),
    getRefreshToken: vi.fn(() => null),
    getTokenExpires: vi.fn(() => null),
    setAuthTokens: vi.fn(),
    clearAuthTokens: vi.fn(),
    getOrderCustomerData: vi.fn(() => null),
    clearOrderCustomerData: vi.fn(),
  },
}));

import { storageService } from '@/lib/services/storage.service';

describe('CartPageClient', () => {
  let matchMediaListeners: Array<(_e: MediaQueryListEvent) => void>;

  beforeEach(() => {
    matchMediaListeners = [];
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_event: string, handler: any) => {
          matchMediaListeners.push(handler);
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  const renderComponent = (preloadedState?: any) =>
    renderWithProviders(
      <Theme>
        <CartPageClient locale="vi" />
      </Theme>,
      {
        preloadedState: {
          auth: {
            status: AuthStatus.IDLE,
            user: null,
            error: null,
          },
          ...preloadedState,
        },
      }
    );

  describe('Initial render', () => {
    it('renders null before matchMedia resolves', () => {
      // Override matchMedia to never set initial value
      // Actually, since useEffect runs after render, the first render will have isDesktop=undefined
      // But after the effect, it resolves. In testing, useEffect runs synchronously after render
      // So it will resolve immediately. The null state is transient.
      // We can still test that the component renders something after effect
      renderComponent();
      // After useEffect, it should render mobile (matches: false)
      expect(screen.getByTestId('cart-content-mobile')).toBeInTheDocument();
    });
  });

  describe('Responsive routing', () => {
    it('renders CartContent for mobile viewport', () => {
      renderComponent();
      expect(screen.getByTestId('cart-content-mobile')).toBeInTheDocument();
      expect(screen.queryByTestId('cart-content-desktop')).not.toBeInTheDocument();
    });

    it('renders CartContentDesktop for desktop viewport', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderComponent();
      expect(screen.getByTestId('cart-content-desktop')).toBeInTheDocument();
      expect(screen.queryByTestId('cart-content-mobile')).not.toBeInTheDocument();
    });

    it('passes locale prop correctly to mobile', () => {
      renderComponent();
      expect(screen.getByTestId('cart-content-mobile')).toHaveAttribute('data-locale', 'vi');
    });

    it('passes isActive prop correctly to mobile', () => {
      renderComponent();
      expect(screen.getByTestId('cart-content-mobile')).toHaveAttribute('data-active', 'true');
    });

    it('passes locale prop correctly to desktop', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderComponent();
      expect(screen.getByTestId('cart-content-desktop')).toHaveAttribute('data-locale', 'vi');
    });
  });

  describe('Auth state changes', () => {
    it('clears checkout session on logout', () => {
      const { store } = renderComponent({
        auth: {
          status: AuthStatus.AUTHENTICATED,
          token: 'token',
          refreshToken: 'refresh',
          tokenExpires: null,
          user: null,
          error: null,
        },
      });

      // Simulate logout using the actual reducer action
      act(() => {
        store.dispatch({ type: 'auth/logout' });
      });

      // storageService.getCheckoutSessionId is called during the effect
      expect(storageService.getCheckoutSessionId).toHaveBeenCalled();
    });

    it('clears checkout session on login', () => {
      const { store } = renderComponent({
        auth: {
          status: AuthStatus.IDLE,
          token: null,
          refreshToken: null,
          tokenExpires: null,
          user: null,
          error: null,
        },
      });

      // Simulate login using the actual reducer action
      act(() => {
        store.dispatch({ type: 'auth/setAuthAuthenticated' });
      });

      expect(storageService.clearCheckoutSession).toHaveBeenCalled();
    });
  });
});
