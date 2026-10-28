import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { ProductReviews } from '@/components/product/ProductReviews';

const { reviewSummaryPropsSpy, reviewListPropsSpy } = vi.hoisted(() => ({
  reviewSummaryPropsSpy: vi.fn(),
  reviewListPropsSpy: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Customer Reviews',
    };
    return translations[key] || key;
  },
}));

vi.mock('@/components/review/ReviewSummary', () => ({
  ReviewSummary: (props: { productId: string }) => {
    reviewSummaryPropsSpy(props);
    return null;
  },
}));

vi.mock('@/components/review/ReviewList', () => ({
  ReviewList: (props: {
    productId: string;
    containerRef: { current: HTMLDivElement | null };
  }) => {
    reviewListPropsSpy(props);
    return null;
  },
}));

describe('ProductReviews', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the translated title', () => {
    renderWithTheme(<ProductReviews productId="product-123" />);

    expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
  });

  it('renders ReviewSummary', () => {
    renderWithTheme(<ProductReviews productId="product-123" />);

    expect(reviewSummaryPropsSpy).toHaveBeenCalledOnce();
  });

  it('renders ReviewList', () => {
    renderWithTheme(<ProductReviews productId="product-123" />);

    expect(reviewListPropsSpy).toHaveBeenCalledOnce();
  });

  it('passes productId to ReviewSummary', () => {
    renderWithTheme(<ProductReviews productId="summary-product" />);

    expect(reviewSummaryPropsSpy).toHaveBeenLastCalledWith({
      productId: 'summary-product',
    });
  });

  it('passes productId and containerRef to ReviewList', () => {
    const { container } = renderWithTheme(
      <ProductReviews productId="list-product" />
    );
    const receivedProps = reviewListPropsSpy.mock.calls.at(-1)?.[0];
    const reviewsContainer = container.querySelector('.bg-\\[\\#EAEAEA\\]');

    expect(receivedProps.productId).toBe('list-product');
    expect(receivedProps.containerRef.current).toBe(reviewsContainer);
  });

  it('propagates a new productId after rerender', () => {
    const { rerender } = renderWithTheme(
      <ProductReviews productId="product-1" />
    );

    rerender(
      <Theme>
        <ProductReviews productId="product-2" />
      </Theme>
    );

    expect(reviewSummaryPropsSpy).toHaveBeenLastCalledWith({
      productId: 'product-2',
    });
    expect(reviewListPropsSpy.mock.calls.at(-1)?.[0].productId).toBe(
      'product-2'
    );
  });

  it('applies the current responsive outer-container classes', () => {
    const { container } = renderWithTheme(
      <ProductReviews productId="product-123" />
    );
    const outer = container.querySelector('.bg-\\[\\#EAEAEA\\]');

    expect(outer).toHaveClass(
      'xl:w-[65%]',
      'xl:mx-auto',
      'lg:w-[80%]',
      'lg:mx-auto',
      'lg:px-0',
      'bg-[#EAEAEA]'
    );
  });

  it('applies the current inner-container classes', () => {
    const { container } = renderWithTheme(
      <ProductReviews productId="product-123" />
    );
    const inner = container.querySelector('.my-8');

    expect(inner).toHaveClass('my-8', 'p-6', 'mx-auto');
  });

  it('applies the current title classes', () => {
    renderWithTheme(<ProductReviews productId="product-123" />);
    const title = screen.getByText('Customer Reviews');

    expect(title).toHaveClass(
      'text-[20px]',
      'font-bold',
      'text-black',
      'mb-6',
      'block'
    );
  });
});
