import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { CartIconWithBadge } from '@/components/navigation/CartIconWithBadge';
import { Theme } from '@radix-ui/themes';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock Next Image
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} />
  ),
}));

// Mock CartPopover
vi.mock('@/components/cart/CartPopover', () => ({
  CartPopover: ({ children, locale }: { children: React.ReactNode; locale: string }) => (
    <div data-testid="cart-popover" data-locale={locale}>
      {children}
    </div>
  ),
}));

describe('CartIconWithBadge', () => {
  const createMockStore = (cartState: any = {}) => {
    const defaultState = {
      cart: { itemCount: 0 },
      isLoading: false,
      isInitialized: false,
      ...cartState,
    };

    return configureStore({
      reducer: {
        cart: (state = defaultState) => state,
      },
    });
  };

  const renderWithProviders = (ui: React.ReactElement, store: any) => {
    return render(
      <Provider store={store}>
        <Theme>{ui}</Theme>
      </Provider>
    );
  };

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const store = createMockStore();
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      expect(container).toBeInTheDocument();
    });

    it('renders CartPopover component', () => {
      const store = createMockStore();
      const { getByTestId } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      expect(getByTestId('cart-popover')).toBeInTheDocument();
    });

    it('passes locale to CartPopover', () => {
      const store = createMockStore();
      const { getByTestId } = renderWithProviders(<CartIconWithBadge locale="en" />, store);
      expect(getByTestId('cart-popover')).toHaveAttribute('data-locale', 'en');
    });
  });

  describe('Cart icon rendering', () => {
    it('renders cart icon image', () => {
      const store = createMockStore();
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const img = container.querySelector('img[alt="Cart"]');
      expect(img).toBeInTheDocument();
    });

    it('cart icon has correct src', () => {
      const store = createMockStore();
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const img = container.querySelector('img[alt="Cart"]');
      expect(img).toHaveAttribute('src', '/assets/svg/shopping-bag.svg');
    });

    it('cart icon has correct dimensions', () => {
      const store = createMockStore();
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const img = container.querySelector('img[alt="Cart"]');
      expect(img).toHaveAttribute('width', '24');
      expect(img).toHaveAttribute('height', '24');
    });

    it('applies cursor-pointer class to icon container', () => {
      const store = createMockStore();
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const iconBox = container.querySelector('.cursor-pointer');
      expect(iconBox).toBeInTheDocument();
    });

    it('applies relative positioning to icon container', () => {
      const store = createMockStore();
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const iconBox = container.querySelector('.relative');
      expect(iconBox).toBeInTheDocument();
    });

    it('applies correct size classes to icon container', () => {
      const store = createMockStore();
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const iconBox = container.querySelector('.w-6.h-6');
      expect(iconBox).toBeInTheDocument();
    });
  });

  describe('Badge rendering with no items', () => {
    it('does not show badge when cart is empty', () => {
      const store = createMockStore({ cart: { itemCount: 0 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.bg-red-500');
      expect(badge).not.toBeInTheDocument();
    });

    it('does not show badge before component mounts', () => {
      const store = createMockStore({ cart: { itemCount: 5 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      // Badge should appear after mount
      const badge = container.querySelector('.bg-red-500');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Badge rendering with items', () => {
    it('shows badge when cart has items', () => {
      const store = createMockStore({ cart: { itemCount: 3 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.bg-red-500');
      expect(badge).toBeInTheDocument();
    });

    it('displays correct count for small numbers', () => {
      const store = createMockStore({ cart: { itemCount: 5 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.bg-red-500');
      expect(badge?.textContent).toBe('5');
    });

    it('displays correct count for double digits', () => {
      const store = createMockStore({ cart: { itemCount: 42 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.bg-red-500');
      expect(badge?.textContent).toBe('42');
    });

    it('displays 99+ for counts over 99', () => {
      const store = createMockStore({ cart: { itemCount: 100 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.bg-red-500');
      expect(badge?.textContent).toBe('99+');
    });

    it('displays 99+ for very large counts', () => {
      const store = createMockStore({ cart: { itemCount: 999 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.bg-red-500');
      expect(badge?.textContent).toBe('99+');
    });

    it('displays count for exactly 99 items', () => {
      const store = createMockStore({ cart: { itemCount: 99 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.bg-red-500');
      expect(badge?.textContent).toBe('99');
    });
  });

  describe('Badge styling', () => {
    it('applies red background color', () => {
      const store = createMockStore({ cart: { itemCount: 1 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.bg-red-500');
      expect(badge).toBeInTheDocument();
    });

    it('applies white text color', () => {
      const store = createMockStore({ cart: { itemCount: 1 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.text-white');
      expect(badge).toBeInTheDocument();
    });

    it('applies absolute positioning', () => {
      const store = createMockStore({ cart: { itemCount: 1 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.absolute');
      expect(badge).toBeInTheDocument();
    });

    it('applies top and left offset', () => {
      const store = createMockStore({ cart: { itemCount: 1 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.-top-1.-left-1');
      expect(badge).toBeInTheDocument();
    });

    it('applies rounded-full class', () => {
      const store = createMockStore({ cart: { itemCount: 1 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.rounded-full');
      expect(badge).toBeInTheDocument();
    });

    it('applies font-bold class', () => {
      const store = createMockStore({ cart: { itemCount: 1 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.font-bold');
      expect(badge).toBeInTheDocument();
    });

    it('applies flex centering classes', () => {
      const store = createMockStore({ cart: { itemCount: 1 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.flex.items-center.justify-center');
      expect(badge).toBeInTheDocument();
    });

    it('applies z-10 for stacking', () => {
      const store = createMockStore({ cart: { itemCount: 1 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.z-10');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Redux integration', () => {
    it('reads cart state from Redux store', () => {
      const store = createMockStore({ cart: { itemCount: 7 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      const badge = container.querySelector('.bg-red-500');
      expect(badge?.textContent).toBe('7');
    });

    it('handles isLoading state', () => {
      const store = createMockStore({ isLoading: true, cart: { itemCount: 0 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      expect(container).toBeInTheDocument();
    });

    it('handles isInitialized state', () => {
      const store = createMockStore({ isInitialized: true, cart: { itemCount: 0 } });
      const { container } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Locale variants', () => {
    it('renders with vi locale', () => {
      const store = createMockStore();
      const { getByTestId } = renderWithProviders(<CartIconWithBadge locale="vi" />, store);
      expect(getByTestId('cart-popover')).toHaveAttribute('data-locale', 'vi');
    });

    it('renders with en locale', () => {
      const store = createMockStore();
      const { getByTestId } = renderWithProviders(<CartIconWithBadge locale="en" />, store);
      expect(getByTestId('cart-popover')).toHaveAttribute('data-locale', 'en');
    });
  });
});
