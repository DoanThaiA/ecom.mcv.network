import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductInfoTab } from 'src/sections/product-detail/product-info-tab';
import type { ProductExtended } from 'src/types/products';

const mockProduct: ProductExtended = {
  id: 'product1',
  name: 'Test Product',
  code: 'TEST001',
  status: 2, // selling
  barcode: 'BAR001',
  vat: 10,
  createdAt: new Date('2024-01-01'),
  category: { id: 'cat1', name: 'Category 1' },
  brand: { id: 'brand1', name: 'Brand 1' },
  suppliers: { id: 'sup1', name: 'Supplier 1' },
  internalCategory: { id: 'int1', name: 'Internal Category' },
  type: 'Type A',
  prices: {
    import: 100000,
    retail: 150000,
    wholesale: 120000,
    avgCost: 110000,
  },
  attributes: [
    { name: 'Kích cỡ', value: 'L' },
    { name: 'Màu sắc', value: 'Red' },
    { name: 'Chất liệu', value: 'Cotton' },
    { name: 'Kiểu dáng', value: 'Classic' },
  ],
  images: {
    avatar: 'https://example.com/avatar.jpg',
    others: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  },
} as ProductExtended;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/utils/format', () => ({
  formatPrice: (price?: number) => (price ? `${price.toLocaleString()}đ` : '0đ'),
}));

describe('ProductInfoTab', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProductInfoTab product={mockProduct} />);
    expect(container).toBeInTheDocument();
  });

  it('displays product name', () => {
    const { container } = render(<ProductInfoTab product={mockProduct} />);
    const text = container.textContent || '';
    expect(text).toContain('Test Product');
  });

  it('displays product code', () => {
    const { container } = render(<ProductInfoTab product={mockProduct} />);
    const text = container.textContent || '';
    expect(text).toContain('TEST001');
  });

  it('displays category name', () => {
    const { container } = render(<ProductInfoTab product={mockProduct} />);
    const text = container.textContent || '';
    expect(text).toContain('Category 1');
  });

  it('displays brand name', () => {
    const { container } = render(<ProductInfoTab product={mockProduct} />);
    const text = container.textContent || '';
    expect(text).toContain('Brand 1');
  });

  it('displays supplier name', () => {
    const { container } = render(<ProductInfoTab product={mockProduct} />);
    const text = container.textContent || '';
    expect(text).toContain('Supplier 1');
  });

  it('displays formatted prices', () => {
    const { container } = render(<ProductInfoTab product={mockProduct} />);
    const text = container.textContent || '';
    expect(text).toContain('100,000đ');
    expect(text).toContain('150,000đ');
    expect(text).toContain('120,000đ');
  });

  it('displays status chip', () => {
    render(<ProductInfoTab product={mockProduct} />);
    expect(screen.getByText('selling')).toBeInTheDocument();
  });

  it('displays product attributes', () => {
    const { container } = render(<ProductInfoTab product={mockProduct} />);
    const text = container.textContent || '';
    expect(text).toContain('Red'); // Color
    expect(text).toContain('Cotton'); // Material
  });

  it('renders product avatar image', () => {
    const { container } = render(<ProductInfoTab product={mockProduct} />);
    const images = container.querySelectorAll('img');
    const avatarImg = Array.from(images).find(
      (img) => (img as HTMLImageElement).src === 'https://example.com/avatar.jpg'
    );
    expect(avatarImg).toBeDefined();
  });

  it('exports ProductInfoTab function', () => {
    expect(ProductInfoTab).toBeDefined();
    expect(typeof ProductInfoTab).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ProductInfoTab).toBe('function');
    expect(ProductInfoTab.name).toBe('ProductInfoTab');
  });

  it('renders Box container', () => {
    const { container } = render(<ProductInfoTab product={mockProduct} />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Typography components', () => {
    const { container } = render(<ProductInfoTab product={mockProduct} />);
    const typographies = container.querySelectorAll('.MuiTypography-root');
    expect(typographies.length).toBeGreaterThan(0);
  });

  it('handles missing optional fields gracefully', () => {
    const minimalProduct: ProductExtended = {
      id: 'product2',
      name: 'Minimal Product',
      code: 'MIN001',
      status: 1,
      prices: {
        import: 50000,
        retail: 75000,
        wholesale: 60000,
        avgCost: 55000,
      },
    } as ProductExtended;

    const { container } = render(<ProductInfoTab product={minimalProduct} />);
    expect(container).toBeInTheDocument();
    expect(container.textContent).toContain('Minimal Product');
  });

  it('displays VAT percentage', () => {
    const { container } = render(<ProductInfoTab product={mockProduct} />);
    const text = container.textContent || '';
    expect(text).toContain('10%');
  });

  it('calculates price with VAT correctly', () => {
    const { container } = render(<ProductInfoTab product={mockProduct} />);
    const text = container.textContent || '';
    // import price with VAT: 100000 * 1.1 = 110000
    expect(text).toContain('110,000đ');
    // retail price with VAT: 150000 * 1.1 = 165000
    expect(text).toContain('165,000đ');
  });

  it('maintains state across renders', () => {
    const { rerender } = render(<ProductInfoTab product={mockProduct} />);
    rerender(<ProductInfoTab product={mockProduct} />);
    expect(screen.getByText('selling')).toBeInTheDocument();
  });
});
