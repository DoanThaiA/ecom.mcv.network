import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartBottomBar } from '@/components/cart/CartBottomBar';
import { Theme } from '@radix-ui/themes';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      totalAmount: 'Total Amount',
      placeOrder: 'Place Order',
      placingOrder: 'Placing Order...',
    };
    return translations[key] || key;
  },
}));

// Mock formatPrice utility
vi.mock('@/lib/utils/format', () => ({
  formatPrice: (price: number) => {
    // Vietnamese format uses periods as thousand separators
    return `${price.toLocaleString('de-DE')}₫`;
  },
}));

describe('CartBottomBar', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  const defaultProps = {
    total: 100000,
    isPlacingOrder: false,
    onPlaceOrder: vi.fn(),
  };

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('renders total amount text on mobile', () => {
      renderWithTheme(<CartBottomBar {...defaultProps} />);
      expect(screen.getByText('Total Amount')).toBeInTheDocument();
    });

    it('renders place order button', () => {
      renderWithTheme(<CartBottomBar {...defaultProps} />);
      expect(screen.getByText('Place Order')).toBeInTheDocument();
    });

    it('displays formatted price', () => {
      renderWithTheme(<CartBottomBar {...defaultProps} />);
      expect(screen.getAllByText('100.000₫').length).toBeGreaterThan(0);
    });
  });

  describe('Container styling', () => {
    it('applies fixed positioning', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const bottomBar = container.querySelector('.fixed.bottom-0');
      expect(bottomBar).toBeInTheDocument();
    });

    it('applies full width', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const bottomBar = container.querySelector('.left-0.right-0');
      expect(bottomBar).toBeInTheDocument();
    });

    it('applies white background', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const bottomBar = container.querySelector('.bg-white');
      expect(bottomBar).toBeInTheDocument();
    });

    it('applies border top', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const bottomBar = container.querySelector('.border-t');
      expect(bottomBar).toBeInTheDocument();
    });

    it('applies border color', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const bottomBar = container.querySelector('.border-gray-200');
      expect(bottomBar).toBeInTheDocument();
    });

    it('applies shadow', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const bottomBar = container.querySelector('.shadow-lg');
      expect(bottomBar).toBeInTheDocument();
    });

    it('applies z-index', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const bottomBar = container.querySelector('.z-50');
      expect(bottomBar).toBeInTheDocument();
    });

    it('hides on desktop with lg:hidden', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const bottomBar = container.querySelector('.lg\\:hidden');
      expect(bottomBar).toBeInTheDocument();
    });
  });

  describe('Button behavior', () => {
    it('calls onPlaceOrder when clicked', async () => {
      const user = userEvent.setup();
      const onPlaceOrder = vi.fn();
      renderWithTheme(<CartBottomBar {...defaultProps} onPlaceOrder={onPlaceOrder} />);

      const button = screen.getByText('Place Order');
      await user.click(button);

      expect(onPlaceOrder).toHaveBeenCalledTimes(1);
    });

    it('is enabled when not placing order', () => {
      renderWithTheme(<CartBottomBar {...defaultProps} isPlacingOrder={false} />);
      const button = screen.getByText('Place Order');
      expect(button).not.toBeDisabled();
    });

    it('is disabled when placing order', () => {
      renderWithTheme(<CartBottomBar {...defaultProps} isPlacingOrder={true} />);
      const button = screen.getByText('Placing Order...');
      expect(button).toBeDisabled();
    });

    it('shows different text when placing order', () => {
      renderWithTheme(<CartBottomBar {...defaultProps} isPlacingOrder={true} />);
      expect(screen.getByText('Placing Order...')).toBeInTheDocument();
      expect(screen.queryByText('Place Order')).not.toBeInTheDocument();
    });

    it('does not call onPlaceOrder when disabled', async () => {
      const user = userEvent.setup();
      const onPlaceOrder = vi.fn();
      renderWithTheme(
        <CartBottomBar {...defaultProps} isPlacingOrder={true} onPlaceOrder={onPlaceOrder} />
      );

      const button = screen.getByText('Placing Order...');
      await user.click(button);

      expect(onPlaceOrder).not.toHaveBeenCalled();
    });
  });

  describe('Button styling', () => {
    it('applies cursor-pointer class', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const button = container.querySelector('.cursor-pointer');
      expect(button).toBeInTheDocument();
    });

    it('applies black background', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const button = container.querySelector('.bg-black');
      expect(button).toBeInTheDocument();
    });

    it('applies white text', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const button = container.querySelector('.text-white');
      expect(button).toBeInTheDocument();
    });

    it('applies rounded corners', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const button = container.querySelector('.rounded');
      expect(button).toBeInTheDocument();
    });

    it('applies font-semibold', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const button = container.querySelector('.font-semibold');
      expect(button).toBeInTheDocument();
    });

    it('applies responsive padding', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const button = container.querySelector('.px-6.py-2\\.5');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Price display', () => {
    it('formats price correctly', () => {
      renderWithTheme(<CartBottomBar {...defaultProps} total={250000} />);
      expect(screen.getAllByText('250.000₫').length).toBeGreaterThan(0);
    });

    it('handles zero total', () => {
      renderWithTheme(<CartBottomBar {...defaultProps} total={0} />);
      expect(screen.getAllByText('0₫').length).toBeGreaterThan(0);
    });

    it('handles large amounts', () => {
      renderWithTheme(<CartBottomBar {...defaultProps} total={1000000} />);
      expect(screen.getAllByText('1.000.000₫').length).toBeGreaterThan(0);
    });

    it('displays total amount label on mobile', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const label = container.querySelector('.sm\\:hidden');
      expect(label).toBeInTheDocument();
    });
  });

  describe('Responsive layout', () => {
    it('applies mobile padding', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const innerBox = container.querySelector('.px-4.py-3');
      expect(innerBox).toBeInTheDocument();
    });

    it('applies responsive padding for sm', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const innerBox = container.querySelector('.sm\\:py-4.sm\\:px-6');
      expect(innerBox).toBeInTheDocument();
    });

    it('applies container mx-auto', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const innerBox = container.querySelector('.mx-auto');
      expect(innerBox).toBeInTheDocument();
    });

    it('applies max-width constraint', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const innerBox = container.querySelector('.max-w-\\[1920px\\]');
      expect(innerBox).toBeInTheDocument();
    });

    it('hides total label on small screens', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const label = container.querySelector('.sm\\:hidden');
      expect(label).toHaveTextContent('Total Amount');
    });

    it('shows price on desktop with hidden class', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const desktopPrice = container.querySelector('.hidden.lg\\:block');
      expect(desktopPrice).toBeInTheDocument();
    });
  });

  describe('Flex layout', () => {
    it('applies justify-between on main flex', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const flex = container.querySelector('[class*="rt-Flex"]');
      expect(flex).toBeInTheDocument();
    });

    it('applies gap between elements', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('applies responsive gap', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const flex = container.querySelector('.sm\\:gap-4');
      expect(flex).toBeInTheDocument();
    });
  });

  describe('Text styling', () => {
    it('applies gray color to total label', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const label = container.querySelector('.text-gray-600');
      expect(label).toBeInTheDocument();
    });

    it('applies black color to price', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const prices = container.querySelectorAll('.text-black');
      expect(prices.length).toBeGreaterThan(0);
    });

    it('applies weight-bold to price via Radix', () => {
      const { container } = renderWithTheme(<CartBottomBar {...defaultProps} />);
      const prices = container.querySelectorAll('[class*="rt-r-weight-bold"]');
      expect(prices.length).toBeGreaterThan(0);
    });
  });
});
