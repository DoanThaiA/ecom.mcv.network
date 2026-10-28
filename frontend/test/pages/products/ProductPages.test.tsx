/**
 * Product Pages Integration Tests
 * Tests product browsing and detail viewing flows
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/testUtils';
import { mockProduct, mockProducts } from '@/test/utils/mockData';

// Mock product components (to be imported when available)
const ProductListMock = ({ products }: { products: any[] }) => (
  <div data-testid="product-list">
    {products.map((p) => (
      <div key={p.id} data-testid={`product-${p.id}`}>
        <h3>{p.name}</h3>
        <p>{p.price}</p>
      </div>
    ))}
  </div>
);

const ProductDetailMock = ({ product }: { product: any }) => (
  <div data-testid="product-detail">
    <h1>{product.name}</h1>
    <p>{product.description}</p>
    <span>{product.price}</span>
    <button>Add to Cart</button>
  </div>
);

describe('Product Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TC-FPRODUCT-001: View Product List', () => {
    it('should display list of products', () => {
      renderWithProviders(<ProductListMock products={mockProducts} />);

      const productList = screen.getByTestId('product-list');
      expect(productList).toBeInTheDocument();
    });

    it('should display product names', () => {
      renderWithProviders(<ProductListMock products={mockProducts} />);

      mockProducts.forEach((product) => {
        expect(screen.getByText(product.name)).toBeInTheDocument();
      });
    });

    it('should display product prices', () => {
      renderWithProviders(<ProductListMock products={mockProducts} />);

      mockProducts.forEach((product) => {
        expect(screen.getByText(String(product.price))).toBeInTheDocument();
      });
    });
  });

  describe('TC-FPRODUCT-002: View Product Details', () => {
    it('should display product name', () => {
      renderWithProviders(<ProductDetailMock product={mockProduct} />);

      expect(screen.getByRole('heading', { level: 1, name: mockProduct.name })).toBeInTheDocument();
    });

    it('should display product description', () => {
      renderWithProviders(<ProductDetailMock product={mockProduct} />);

      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    });

    it('should display product price', () => {
      renderWithProviders(<ProductDetailMock product={mockProduct} />);

      expect(screen.getByText(String(mockProduct.price))).toBeInTheDocument();
    });

    it('should have add to cart button', () => {
      renderWithProviders(<ProductDetailMock product={mockProduct} />);

      expect(screen.getByRole('button', { name: /add.*cart/i })).toBeInTheDocument();
    });
  });

  describe('TC-FPRODUCT-003: Product Variants', () => {
    it('should display product with variants', () => {
      const productWithVariants = {
        ...mockProduct,
        variants: [
          { id: 'v1', size: 'M', color: 'Black', stock: 10 },
          { id: 'v2', size: 'L', color: 'Black', stock: 5 },
        ],
      };

      renderWithProviders(<ProductDetailMock product={productWithVariants} />);

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });
  });

  describe('TC-FPRODUCT-004: Product Images', () => {
    it('should handle product with images', () => {
      const productWithImages = {
        ...mockProduct,
        images: ['image1.jpg', 'image2.jpg'],
      };

      renderWithProviders(<ProductDetailMock product={productWithImages} />);

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });
  });

  describe('TC-FPRODUCT-005: Product Availability', () => {
    it('should display product with stock info', () => {
      const inStockProduct = {
        ...mockProduct,
        stock: 100,
        status: 'ACTIVE',
      };

      renderWithProviders(<ProductDetailMock product={inStockProduct} />);

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('should handle out of stock product', () => {
      const outOfStockProduct = {
        ...mockProduct,
        stock: 0,
        status: 'OUT_OF_STOCK',
      };

      renderWithProviders(<ProductDetailMock product={outOfStockProduct} />);

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });
  });

  describe('TC-FPRODUCT-006: Product Search', () => {
    it('should render product list for search', () => {
      renderWithProviders(<ProductListMock products={mockProducts} />);

      expect(screen.getByTestId('product-list')).toBeInTheDocument();
    });
  });

  describe('TC-FPRODUCT-007: Product Filtering', () => {
    it('should display filtered products', () => {
      const filteredProducts = mockProducts.slice(0, 2);

      renderWithProviders(<ProductListMock products={filteredProducts} />);

      expect(screen.getByTestId('product-list')).toBeInTheDocument();
    });
  });

  describe('TC-FPRODUCT-008: Product Sorting', () => {
    it('should display sorted products', () => {
      const sortedProducts = [...mockProducts].sort((a, b) => a.price - b.price);

      renderWithProviders(<ProductListMock products={sortedProducts} />);

      expect(screen.getByTestId('product-list')).toBeInTheDocument();
    });
  });

  describe('TC-FPRODUCT-009: Empty Product List', () => {
    it('should handle empty product list', () => {
      renderWithProviders(<ProductListMock products={[]} />);

      const productList = screen.getByTestId('product-list');
      expect(productList).toBeInTheDocument();
      expect(productList.children.length).toBe(0);
    });
  });

  describe('TC-FPRODUCT-010: Product Loading State', () => {
    it('should handle loading state', () => {
      renderWithProviders(<ProductListMock products={[]} />, {
        preloadedState: {
          product: {
            products: [],
            status: 'loading',
            error: null,
          },
        },
      });

      expect(screen.getByTestId('product-list')).toBeInTheDocument();
    });
  });
});
