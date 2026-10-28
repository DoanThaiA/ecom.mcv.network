import { describe, it, expect, beforeEach, vi } from 'vitest';
import { productRepository } from '@/lib/repositories/product.repository';
import axiosInstance from '@/lib/axios';
import type { GetProductsResponse } from '@/types/product';
import type { Product } from '@/types/gen/shared/shared/products/product';
import type { ShopQueryProduct } from '@/types/gen/shop/shop/products/product-service';
import type { GetCombosForProductResponse } from '@/types/gen/shop/shop/combos/combo-service';

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('ProductRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getShopProducts', () => {
    it('fetches shop products with page and limit', async () => {
      const mockResponse: GetProductsResponse = {
        products: [
          { id: '1', name: 'Product 1' } as Product,
          { id: '2', name: 'Product 2' } as Product,
        ],
        total: 2,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const params: ShopQueryProduct = {
        page: 1,
        limit: 20,
      };

      const result = await productRepository.getShopProducts(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {
          page: '1',
          limit: '20',
        },
      });

      expect(result).toEqual(mockResponse);
    });

    it('includes filters in query params as JSON string', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      const params: ShopQueryProduct = {
        page: 1,
        limit: 10,
        filters: {
          categoryIds: ['cat-1', 'cat-2'],
          minPrice: 100000,
          maxPrice: 500000,
        },
      };

      await productRepository.getShopProducts(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {
          page: '1',
          limit: '10',
          filters: JSON.stringify({
            categoryIds: ['cat-1', 'cat-2'],
            minPrice: 100000,
            maxPrice: 500000,
          }),
        },
      });
    });

    it('includes sort in query params as JSON string', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      const params: ShopQueryProduct = {
        page: 1,
        limit: 10,
        sort: {
          field: 'price',
          order: 'asc',
        },
      };

      await productRepository.getShopProducts(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {
          page: '1',
          limit: '10',
          sort: JSON.stringify({
            field: 'price',
            order: 'asc',
          }),
        },
      });
    });

    it('handles undefined page and limit', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      const params: ShopQueryProduct = {};

      await productRepository.getShopProducts(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {},
      });
    });

    it('includes all params when provided', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      const params: ShopQueryProduct = {
        page: 2,
        limit: 50,
        filters: { search: 'laptop' },
        sort: { field: 'createdAt', order: 'desc' },
      };

      await productRepository.getShopProducts(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {
          page: '2',
          limit: '50',
          filters: JSON.stringify({ search: 'laptop' }),
          sort: JSON.stringify({ field: 'createdAt', order: 'desc' }),
        },
      });
    });

    it('handles page 0', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      await productRepository.getShopProducts({ page: 0, limit: 10 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {
          page: '0',
          limit: '10',
        },
      });
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        productRepository.getShopProducts({ page: 1, limit: 10 })
      ).rejects.toThrow('Network error');
    });

    it('handles empty filters object', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      await productRepository.getShopProducts({
        page: 1,
        limit: 10,
        filters: {},
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {
          page: '1',
          limit: '10',
          filters: JSON.stringify({}),
        },
      });
    });

    it('handles complex filter objects', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      await productRepository.getShopProducts({
        filters: {
          categoryIds: ['1', '2', '3'],
          search: 'phone',
          minPrice: 1000000,
          maxPrice: 5000000,
          inStock: true,
        },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/products',
        expect.objectContaining({
          params: expect.objectContaining({
            filters: expect.stringContaining('categoryIds'),
          }),
        })
      );
    });
  });

  describe('getProducts', () => {
    it('fetches products with page and limit', async () => {
      const mockResponse: GetProductsResponse = {
        products: [{ id: '1', name: 'Product 1' } as Product],
        total: 1,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const params: ShopQueryProduct = {
        page: 1,
        limit: 10,
      };

      const result = await productRepository.getProducts(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {
          page: '1',
          limit: '10',
        },
      });

      expect(result).toEqual(mockResponse);
    });

    it('includes filters only if object has keys', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      const params: ShopQueryProduct = {
        page: 1,
        limit: 10,
        filters: {
          categoryId: 'cat-123',
          status: 'active',
        },
      };

      await productRepository.getProducts(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {
          page: '1',
          limit: '10',
          filters: JSON.stringify({
            categoryId: 'cat-123',
            status: 'active',
          }),
        },
      });
    });

    it('excludes filters if empty object', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      const params: ShopQueryProduct = {
        page: 1,
        limit: 10,
        filters: {},
      };

      await productRepository.getProducts(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {
          page: '1',
          limit: '10',
        },
      });
    });

    it('includes sort in query params', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      const params: ShopQueryProduct = {
        page: 1,
        limit: 10,
        sort: {
          field: 'name',
          order: 'asc',
        },
      };

      await productRepository.getProducts(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {
          page: '1',
          limit: '10',
          sort: JSON.stringify({
            field: 'name',
            order: 'asc',
          }),
        },
      });
    });

    it('handles undefined page and limit', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      await productRepository.getProducts({});

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {},
      });
    });

    it('includes all params when provided', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      const params: ShopQueryProduct = {
        page: 3,
        limit: 30,
        filters: { businessId: 'biz-123' },
        sort: { field: 'updatedAt', order: 'desc' },
      };

      await productRepository.getProducts(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {
          page: '3',
          limit: '30',
          filters: JSON.stringify({ businessId: 'biz-123' }),
          sort: JSON.stringify({ field: 'updatedAt', order: 'desc' }),
        },
      });
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Server error')
      );

      await expect(
        productRepository.getProducts({ page: 1, limit: 10 })
      ).rejects.toThrow('Server error');
    });

    it('handles undefined filters', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      await productRepository.getProducts({
        page: 1,
        limit: 10,
        filters: undefined,
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products', {
        params: {
          page: '1',
          limit: '10',
        },
      });
    });
  });

  describe('getProductById', () => {
    it('fetches product by ID successfully', async () => {
      const mockProduct: Product = {
        id: 'prod-123',
        name: 'Test Product',
        price: 100000,
      } as Product;

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockProduct,
      });

      const result = await productRepository.getProductById('prod-123');

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products/prod-123');
      expect(result).toEqual(mockProduct);
    });

    it('handles different product IDs', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { id: 'prod-456' } as Product,
      });

      await productRepository.getProductById('prod-456');

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products/prod-456');
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Product not found')
      );

      await expect(
        productRepository.getProductById('invalid-id')
      ).rejects.toThrow('Product not found');
    });

    it('handles IDs with special characters', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { id: 'prod-123-abc' } as Product,
      });

      await productRepository.getProductById('prod-123-abc');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/products/prod-123-abc'
      );
    });
  });

  describe('getCombosForProduct', () => {
    it('fetches combos for product successfully', async () => {
      const mockResponse: GetCombosForProductResponse = {
        combos: [
          { id: 'combo-1', name: 'Combo 1' },
          { id: 'combo-2', name: 'Combo 2' },
        ],
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await productRepository.getCombosForProduct('prod-123');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/combos/product/prod-123'
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles different product IDs', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { combos: [] },
      });

      await productRepository.getCombosForProduct('prod-789');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/combos/product/prod-789'
      );
    });

    it('handles empty combos response', async () => {
      const mockResponse: GetCombosForProductResponse = {
        combos: [],
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await productRepository.getCombosForProduct('prod-123');

      expect(result.combos).toEqual([]);
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Failed to fetch combos')
      );

      await expect(
        productRepository.getCombosForProduct('prod-123')
      ).rejects.toThrow('Failed to fetch combos');
    });

    it('handles product IDs with special format', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { combos: [] },
      });

      await productRepository.getCombosForProduct('PROD-2024-001');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/combos/product/PROD-2024-001'
      );
    });
  });
});
