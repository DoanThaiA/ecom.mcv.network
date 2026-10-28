import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockStatusBadge } from '@/components/product/StockStatusBadge';
import { Theme } from '@radix-ui/themes';

describe('StockStatusBadge', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      soldOut: 'Sold Out',
      almostSoldOut: 'Almost Sold Out',
    };
    return translations[key] || key;
  });

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  beforeEach(() => {
    mockT.mockClear();
  });

  describe('Sold out badge (available = 0)', () => {
    it('renders sold out badge when available is 0', () => {
      renderWithTheme(<StockStatusBadge available={0} t={mockT} />);
      expect(screen.getByText('Sold Out')).toBeInTheDocument();
    });

    it('calls translation function with soldOut key', () => {
      renderWithTheme(<StockStatusBadge available={0} t={mockT} />);
      expect(mockT).toHaveBeenCalledWith('soldOut');
    });

    it('applies red border color to sold out badge', () => {
      const { container } = renderWithTheme(<StockStatusBadge available={0} t={mockT} />);
      const badge = container.querySelector('.rounded-full.border');
      expect(badge).toHaveStyle({ borderColor: '#DC2626' });
    });

    it('applies red text color to sold out text', () => {
      renderWithTheme(<StockStatusBadge available={0} t={mockT} />);
      const text = screen.getByText('Sold Out');
      expect(text).toHaveStyle({ color: '#DC2626' });
    });

    it('applies correct dimensions to sold out badge', () => {
      const { container } = renderWithTheme(<StockStatusBadge available={0} t={mockT} />);
      const badge = container.querySelector('.rounded-full.border');
      expect(badge).toHaveStyle({ width: '116px', height: '40px' });
    });

    it('applies default className when not provided for sold out', () => {
      const { container } = renderWithTheme(<StockStatusBadge available={0} t={mockT} />);
      const flex = container.querySelector('.my-2');
      expect(flex).toBeInTheDocument();
    });

    it('applies custom className when provided for sold out', () => {
      const { container } = renderWithTheme(
        <StockStatusBadge available={0} t={mockT} className="custom-class" />
      );
      const flex = container.querySelector('.custom-class');
      expect(flex).toBeInTheDocument();
    });
  });

  describe('Almost sold out badge (available <= 5)', () => {
    it('renders almost sold out badge when available is 1', () => {
      renderWithTheme(<StockStatusBadge available={1} t={mockT} />);
      expect(screen.getByText('Almost Sold Out')).toBeInTheDocument();
    });

    it('renders almost sold out badge when available is 5', () => {
      renderWithTheme(<StockStatusBadge available={5} t={mockT} />);
      expect(screen.getByText('Almost Sold Out')).toBeInTheDocument();
    });

    it('calls translation function with almostSoldOut key', () => {
      renderWithTheme(<StockStatusBadge available={3} t={mockT} />);
      expect(mockT).toHaveBeenCalledWith('almostSoldOut');
    });

    it('applies amber border color to almost sold out badge', () => {
      const { container } = renderWithTheme(<StockStatusBadge available={3} t={mockT} />);
      const badge = container.querySelector('.rounded-full.border');
      expect(badge).toHaveStyle({ borderColor: '#F59E0B' });
    });

    it('applies amber text color to almost sold out text', () => {
      renderWithTheme(<StockStatusBadge available={3} t={mockT} />);
      const text = screen.getByText('Almost Sold Out');
      expect(text).toHaveStyle({ color: '#F59E0B' });
    });

    it('applies correct dimensions to almost sold out badge', () => {
      const { container } = renderWithTheme(<StockStatusBadge available={2} t={mockT} />);
      const badge = container.querySelector('.rounded-full.border');
      expect(badge).toHaveStyle({ width: '116px', height: '40px' });
    });

    it('applies default className when not provided for almost sold out', () => {
      const { container } = renderWithTheme(<StockStatusBadge available={4} t={mockT} />);
      const flex = container.querySelector('.my-2');
      expect(flex).toBeInTheDocument();
    });

    it('applies custom className when provided for almost sold out', () => {
      const { container } = renderWithTheme(
        <StockStatusBadge available={2} t={mockT} className="custom-class" />
      );
      const flex = container.querySelector('.custom-class');
      expect(flex).toBeInTheDocument();
    });
  });

  describe('In stock (available > 5)', () => {
    const expectEmptyInStockPlaceholder = (container: HTMLElement) => {
      const placeholder = container.querySelector('.rounded-full');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toBeEmptyDOMElement();
      expect(screen.queryByText('Sold Out')).not.toBeInTheDocument();
      expect(screen.queryByText('Almost Sold Out')).not.toBeInTheDocument();
    };

    it('renders an empty placeholder when available is 6', () => {
      const { container } = renderWithTheme(<StockStatusBadge available={6} t={mockT} />);
      expectEmptyInStockPlaceholder(container);
    });

    it('renders an empty placeholder when available is 10', () => {
      const { container } = renderWithTheme(<StockStatusBadge available={10} t={mockT} />);
      expectEmptyInStockPlaceholder(container);
    });

    it('renders an empty placeholder when available is 100', () => {
      const { container } = renderWithTheme(<StockStatusBadge available={100} t={mockT} />);
      expectEmptyInStockPlaceholder(container);
    });

    it('does not call translation function when in stock', () => {
      renderWithTheme(<StockStatusBadge available={10} t={mockT} />);
      expect(mockT).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('handles boundary case at available = 5', () => {
      renderWithTheme(<StockStatusBadge available={5} t={mockT} />);
      expect(screen.getByText('Almost Sold Out')).toBeInTheDocument();
    });

    it('handles boundary case at available = 6', () => {
      const { container } = renderWithTheme(<StockStatusBadge available={6} t={mockT} />);
      const placeholder = container.querySelector('.rounded-full');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toBeEmptyDOMElement();
      expect(screen.queryByText('Sold Out')).not.toBeInTheDocument();
      expect(screen.queryByText('Almost Sold Out')).not.toBeInTheDocument();
      expect(mockT).not.toHaveBeenCalled();
    });

    it('applies correct font weight to badge text', () => {
      renderWithTheme(<StockStatusBadge available={0} t={mockT} />);
      const text = screen.getByText('Sold Out');
      expect(text).toHaveStyle({ fontWeight: 600 });
    });

    it('applies correct font size to badge text', () => {
      renderWithTheme(<StockStatusBadge available={1} t={mockT} />);
      const text = screen.getByText('Almost Sold Out');
      expect(text).toHaveStyle({ fontSize: '14px' });
    });

    it('applies correct line height to badge text', () => {
      renderWithTheme(<StockStatusBadge available={0} t={mockT} />);
      const text = screen.getByText('Sold Out');
      expect(text).toHaveStyle({ lineHeight: '24px' });
    });

    it('centers text in badge', () => {
      renderWithTheme(<StockStatusBadge available={0} t={mockT} />);
      const text = screen.getByText('Sold Out');
      expect(text).toHaveStyle({ textAlign: 'center' });
    });
  });

  describe('Responsive classes', () => {
    it('applies justify-center class for mobile', () => {
      const { container } = renderWithTheme(<StockStatusBadge available={0} t={mockT} />);
      const flex = container.querySelector('.justify-center');
      expect(flex).toBeInTheDocument();
    });

    it('applies lg:justify-start class for desktop', () => {
      const { container } = renderWithTheme(<StockStatusBadge available={0} t={mockT} />);
      const flex = container.querySelector('.lg\\:justify-start');
      expect(flex).toBeInTheDocument();
    });
  });
});
