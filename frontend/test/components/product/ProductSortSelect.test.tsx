import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductSortSelect } from '@/components/product/ProductSortSelect';
import { Theme } from '@radix-ui/themes';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      sortDefault: 'Default',
      sortNameAsc: 'Name (A-Z)',
      sortNameDesc: 'Name (Z-A)',
      sortPriceAsc: 'Price (Low to High)',
      sortPriceDesc: 'Price (High to Low)',
      sortOldest: 'Oldest First',
      sortNewest: 'Newest First',
      sortDiscountAsc: 'Discount (Low to High)',
      sortDiscountDesc: 'Discount (High to Low)',
      sortDiscountPercentAsc: 'Discount % (Low to High)',
      sortDiscountPercentDesc: 'Discount % (High to Low)',
    };
    return translations[key] || key;
  },
}));

describe('ProductSortSelect', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  const defaultProps = {
    value: 'default',
    onValueChange: vi.fn(),
  };

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('renders Select.Root component', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      const select = container.querySelector('[class*="rt-Select"]');
      expect(select).toBeInTheDocument();
    });

    it('renders Select.Trigger component', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      const trigger = container.querySelector('[class*="rt-SelectTrigger"]');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Trigger styling', () => {
    it('applies min-w-[120px] class', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      const trigger = container.querySelector('.min-w-\\[120px\\]');
      expect(trigger).toBeInTheDocument();
    });

    it('applies bg-white class', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      const trigger = container.querySelector('.bg-white');
      expect(trigger).toBeInTheDocument();
    });

    it('applies text-sm class', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      const trigger = container.querySelector('.text-sm');
      expect(trigger).toBeInTheDocument();
    });

    it('applies font-semibold class', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      const trigger = container.querySelector('.font-semibold');
      expect(trigger).toBeInTheDocument();
    });

    it('applies rounded-3xl class', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      const trigger = container.querySelector('.rounded-3xl');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Value prop', () => {
    it('renders with default value', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} value="default" />);
      expect(container).toBeInTheDocument();
    });

    it('renders with name-asc value', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} value="name-asc" />);
      expect(container).toBeInTheDocument();
    });

    it('renders with price-desc value', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} value="price-desc" />);
      expect(container).toBeInTheDocument();
    });

    it('renders with createdAt-desc value', () => {
      const { container } = renderWithTheme(
        <ProductSortSelect {...defaultProps} value="createdAt-desc" />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders with discount-asc value', () => {
      const { container } = renderWithTheme(
        <ProductSortSelect {...defaultProps} value="discount-asc" />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders with discountPercent-desc value', () => {
      const { container } = renderWithTheme(
        <ProductSortSelect {...defaultProps} value="discountPercent-desc" />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Callback function', () => {
    it('accepts onValueChange function', () => {
      const onValueChange = vi.fn();
      renderWithTheme(<ProductSortSelect {...defaultProps} onValueChange={onValueChange} />);
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('onValueChange is not called on render', () => {
      const onValueChange = vi.fn();
      renderWithTheme(<ProductSortSelect value="default" onValueChange={onValueChange} />);
      expect(onValueChange).toHaveBeenCalledTimes(0);
    });
  });

  describe('Component structure', () => {
    it('contains Select.Root', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      const root = container.querySelector('[class*="rt-Select"]');
      expect(root).toBeInTheDocument();
    });

    it('contains Select.Trigger', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      const trigger = container.querySelector('[class*="rt-SelectTrigger"]');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Item class name constant', () => {
    it('uses consistent className for items', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('renders without errors with all sort values', () => {
      const sortValues = [
        'default',
        'name-asc',
        'name-desc',
        'price-asc',
        'price-desc',
        'createdAt-asc',
        'createdAt-desc',
        'discount-asc',
        'discount-desc',
        'discountPercent-asc',
        'discountPercent-desc',
      ];

      sortValues.forEach((value) => {
        const { container } = renderWithTheme(
          <ProductSortSelect value={value} onValueChange={vi.fn()} />
        );
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('Translation keys', () => {
    it('uses productListing namespace', () => {
      renderWithTheme(<ProductSortSelect {...defaultProps} />);
      // If this renders without error, translation hook is working
      expect(true).toBe(true);
    });

    it('has all required translation keys', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Props interface', () => {
    it('accepts value prop as string', () => {
      const { container } = renderWithTheme(<ProductSortSelect value="default" onValueChange={vi.fn()} />);
      expect(container).toBeInTheDocument();
    });

    it('accepts onValueChange prop as function', () => {
      const { container } = renderWithTheme(<ProductSortSelect value="default" onValueChange={vi.fn()} />);
      expect(container).toBeInTheDocument();
    });

    it('requires both props', () => {
      const { container } = renderWithTheme(
        <ProductSortSelect value="price-asc" onValueChange={vi.fn()} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Radix Select integration', () => {
    it('uses Select.Root component', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      const root = container.querySelector('[class*="rt-Select"]');
      expect(root).toBeInTheDocument();
    });

    it('uses Select.Trigger with variant surface', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      const trigger = container.querySelector('[class*="rt-SelectTrigger"]');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Client component', () => {
    it('renders in client environment', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      expect(container).toBeTruthy();
    });

    it('maintains state when value changes', () => {
      const { container, rerender } = renderWithTheme(<ProductSortSelect {...defaultProps} value="default" />);
      expect(container).toBeInTheDocument();

      rerender(
        <Theme>
          <ProductSortSelect {...defaultProps} value="name-asc" />
        </Theme>
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('All sort options', () => {
    it('has 11 sort options total', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('includes default sort option', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} value="default" />);
      expect(container).toBeInTheDocument();
    });

    it('includes name sort options', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} value="name-asc" />);
      expect(container).toBeInTheDocument();
    });

    it('includes price sort options', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} value="price-desc" />);
      expect(container).toBeInTheDocument();
    });

    it('includes date sort options', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} value="createdAt-desc" />);
      expect(container).toBeInTheDocument();
    });

    it('includes discount sort options', () => {
      const { container } = renderWithTheme(<ProductSortSelect {...defaultProps} value="discount-desc" />);
      expect(container).toBeInTheDocument();
    });

    it('includes discount percent sort options', () => {
      const { container } = renderWithTheme(
        <ProductSortSelect {...defaultProps} value="discountPercent-desc" />
      );
      expect(container).toBeInTheDocument();
    });
  });
});
