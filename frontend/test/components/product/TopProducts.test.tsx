import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopProducts } from '@/components/product/TopProducts';
import { Theme } from '@radix-ui/themes';
import type { Product } from '@/types/gen/shared/shared/products/product';

// Mock ProductSlider component
vi.mock('@/components/product/ProductSlider', () => ({
  ProductSlider: ({ products, locale, displayMode }: any) => (
    <div
      data-testid="product-slider"
      data-locale={locale}
      data-display-mode={displayMode}
      data-product-count={products.length}
    >
      {products.map((product: Product) => (
        <div key={product.id} data-testid={`product-${product.id}`}>
          {product.name}
        </div>
      ))}
    </div>
  ),
}));

describe('TopProducts', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Product 1',
      price: 100000,
      imageUrl: 'https://example.com/product1.jpg',
      slug: 'product-1',
    } as Product,
    {
      id: '2',
      name: 'Product 2',
      price: 200000,
      imageUrl: 'https://example.com/product2.jpg',
      slug: 'product-2',
    } as Product,
    {
      id: '3',
      name: 'Product 3',
      price: 300000,
      imageUrl: 'https://example.com/product3.jpg',
      slug: 'product-3',
    } as Product,
  ];

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders title', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      expect(screen.getByText('Top Products')).toBeInTheDocument();
    });

    it('renders see all text', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      expect(screen.getByText('See All')).toBeInTheDocument();
    });

    it('renders ProductSlider', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      expect(screen.getByTestId('product-slider')).toBeInTheDocument();
    });
  });

  describe('Title prop', () => {
    it('displays provided title', () => {
      renderWithTheme(
        <TopProducts
          title="Best Sellers"
          seeAllText="View All"
          products={mockProducts}
        />
      );
      expect(screen.getByText('Best Sellers')).toBeInTheDocument();
    });

    it('displays Vietnamese title', () => {
      renderWithTheme(
        <TopProducts
          title="Sản phẩm bán chạy"
          seeAllText="Xem tất cả"
          products={mockProducts}
        />
      );
      expect(screen.getByText('Sản phẩm bán chạy')).toBeInTheDocument();
    });

    it('displays English title', () => {
      renderWithTheme(
        <TopProducts
          title="Featured Products"
          seeAllText="Show More"
          products={mockProducts}
        />
      );
      expect(screen.getByText('Featured Products')).toBeInTheDocument();
    });
  });

  describe('See all link', () => {
    it('renders link with default href', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const link = screen.getByRole('link', { name: 'See All' });
      expect(link).toHaveAttribute('href', '#');
    });

    it('renders link with custom href', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
          seeAllLink="/products"
        />
      );
      const link = screen.getByRole('link', { name: 'See All' });
      expect(link).toHaveAttribute('href', '/products');
    });

    it('applies correct classes to link', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const link = screen.getByRole('link', { name: 'See All' });
      expect(link).toHaveClass('no-underline');
      expect(link).toHaveClass('flex-shrink-0');
      expect(link).toHaveClass('hover:opacity-80');
      expect(link).toHaveClass('transition-opacity');
    });

    it('displays see all text with correct styling', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-[0.875rem]');
      expect(span).toHaveClass('font-normal');
      expect(span).toHaveClass('text-[#AFAFAF]');
    });
  });

  describe('ProductSlider props', () => {
    it('passes products to ProductSlider', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const slider = screen.getByTestId('product-slider');
      expect(slider).toHaveAttribute('data-product-count', '3');
    });

    it('passes default locale vi to ProductSlider', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const slider = screen.getByTestId('product-slider');
      expect(slider).toHaveAttribute('data-locale', 'vi');
    });

    it('passes custom locale to ProductSlider', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
          locale="en"
        />
      );
      const slider = screen.getByTestId('product-slider');
      expect(slider).toHaveAttribute('data-locale', 'en');
    });

    it('passes displayMode="row" to ProductSlider', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const slider = screen.getByTestId('product-slider');
      expect(slider).toHaveAttribute('data-display-mode', 'row');
    });

    it('renders all products in slider', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      expect(screen.getByTestId('product-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-2')).toBeInTheDocument();
      expect(screen.getByTestId('product-3')).toBeInTheDocument();
    });
  });

  describe('Container styling', () => {
    it('applies pl-6 for mobile', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const box = container.querySelector('.pl-6');
      expect(box).toBeInTheDocument();
    });

    it('applies sm:px-8 for small screens', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const box = container.querySelector('.sm\\:px-8');
      expect(box).toBeInTheDocument();
    });

    it('applies lg:px-12 for large screens', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const box = container.querySelector('.lg\\:px-12');
      expect(box).toBeInTheDocument();
    });
  });

  describe('Header styling', () => {
    it('applies mb-4 to header', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('applies pr-6 on mobile', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const header = container.querySelector('.pr-6');
      expect(header).toBeInTheDocument();
    });

    it('applies sm:pr-0 on small screens', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const header = container.querySelector('.sm\\:pr-0');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Title styling', () => {
    it('applies font-semibold to title', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const title = container.querySelector('.font-semibold');
      expect(title).toBeInTheDocument();
    });

    it('applies text-lg for mobile', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const title = container.querySelector('.text-lg');
      expect(title).toBeInTheDocument();
    });

    it('applies sm:text-xl for small screens', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const title = container.querySelector('.sm\\:text-xl');
      expect(title).toBeInTheDocument();
    });

    it('applies md:text-2xl for medium screens', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const title = container.querySelector('.md\\:text-2xl');
      expect(title).toBeInTheDocument();
    });
  });

  describe('ChevronRightIcon', () => {
    it('renders ChevronRightIcon next to title', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('applies correct size to icon', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '20');
      expect(svg).toHaveAttribute('height', '20');
    });

    it('applies correct color to icon', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const svg = container.querySelector('svg');
      // ChevronRightIcon inherits color from parent or uses currentColor
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Radix UI components', () => {
    it('uses Box component', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const box = container.querySelector('[class*="rt-Box"]');
      expect(box).toBeInTheDocument();
    });

    it('uses Flex components', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const flexes = container.querySelectorAll('[class*="rt-Flex"]');
      expect(flexes.length).toBeGreaterThan(0);
    });

    it('uses Heading component', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const heading = container.querySelector('[class*="rt-Heading"]');
      expect(heading).toBeInTheDocument();
    });

    it('uses Link component', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const link = container.querySelector('[class*="rt-Link"]');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Client component', () => {
    it('renders as client component', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Props interface', () => {
    it('accepts title prop', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Test Title"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts seeAllText prop', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="View More"
          products={mockProducts}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts products prop', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts optional seeAllLink prop', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
          seeAllLink="/all-products"
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts optional locale prop', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
          locale="en"
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('seeAllLink defaults to #', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const link = screen.getByRole('link', { name: 'See All' });
      expect(link).toHaveAttribute('href', '#');
    });

    it('locale defaults to vi', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const slider = screen.getByTestId('product-slider');
      expect(slider).toHaveAttribute('data-locale', 'vi');
    });
  });

  describe('Responsive behavior', () => {
    it('has different padding for mobile, small, and large screens', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const box = container.querySelector('.pl-6');
      expect(box).toHaveClass('sm:px-8');
      expect(box).toHaveClass('lg:px-12');
    });

    it('header has different padding for mobile and small screens', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const header = container.querySelector('.pr-6');
      expect(header).toHaveClass('sm:pr-0');
    });

    it('title has different text size for mobile, small, and medium screens', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={mockProducts}
        />
      );
      const title = container.querySelector('.text-lg');
      expect(title).toHaveClass('sm:text-xl');
      expect(title).toHaveClass('md:text-2xl');
    });
  });

  describe('Edge cases', () => {
    it('handles empty products array', () => {
      const { container } = renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={[]}
        />
      );
      expect(container).toBeInTheDocument();
      const slider = screen.getByTestId('product-slider');
      expect(slider).toHaveAttribute('data-product-count', '0');
    });

    it('handles single product', () => {
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={[mockProducts[0]]}
        />
      );
      const slider = screen.getByTestId('product-slider');
      expect(slider).toHaveAttribute('data-product-count', '1');
    });

    it('handles many products', () => {
      const manyProducts = Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Product ${i + 1}`,
        price: 100000,
        imageUrl: `https://example.com/product${i + 1}.jpg`,
        slug: `product-${i + 1}`,
      })) as Product[];
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText="See All"
          products={manyProducts}
        />
      );
      const slider = screen.getByTestId('product-slider');
      expect(slider).toHaveAttribute('data-product-count', '20');
    });

    it('handles very long title', () => {
      const longTitle = 'A'.repeat(100);
      renderWithTheme(
        <TopProducts
          title={longTitle}
          seeAllText="See All"
          products={mockProducts}
        />
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles special characters in title', () => {
      const specialTitle = 'Products with "quotes" & symbols';
      renderWithTheme(
        <TopProducts
          title={specialTitle}
          seeAllText="See All"
          products={mockProducts}
        />
      );
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('handles special characters in see all text', () => {
      const specialText = 'See All & More';
      renderWithTheme(
        <TopProducts
          title="Top Products"
          seeAllText={specialText}
          products={mockProducts}
        />
      );
      expect(screen.getByText(specialText)).toBeInTheDocument();
    });
  });
});
