import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { EmptyCart } from '@/components/cart/EmptyCart';

// Mock useParams to return locale
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useParams: () => ({ locale: 'vi' }),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  };
});

const renderWithTheme = (ui: React.ReactElement) => render(<Theme>{ui}</Theme>);

describe('EmptyCart', () => {
  describe('Content rendering', () => {
    it('renders empty cart title', () => {
      renderWithTheme(<EmptyCart />);
      expect(screen.getByText('emptyCart')).toBeInTheDocument();
    });

    it('renders empty cart message', () => {
      renderWithTheme(<EmptyCart />);
      expect(screen.getByText('emptyCartMessage')).toBeInTheDocument();
    });

    it('renders continue shopping button text', () => {
      renderWithTheme(<EmptyCart />);
      expect(screen.getByText('continueShopping')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('has link to home page with locale', () => {
      renderWithTheme(<EmptyCart />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/vi');
    });
  });

  describe('Layout', () => {
    it('renders cart icon SVG', () => {
      const { container } = renderWithTheme(<EmptyCart />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders with centered layout', () => {
      const { container } = renderWithTheme(<EmptyCart />);
      const minHeightEl = container.querySelector('.min-h-\\[500px\\]');
      expect(minHeightEl).toBeInTheDocument();
    });

    it('renders MagnifyingGlassIcon in button', () => {
      renderWithTheme(<EmptyCart />);
      // MagnifyingGlassIcon renders as an svg inside the button
      const button = screen.getByText('continueShopping').closest('button');
      expect(button).toBeInTheDocument();
      const svgInButton = button?.querySelector('svg');
      expect(svgInButton).toBeInTheDocument();
    });
  });
});
