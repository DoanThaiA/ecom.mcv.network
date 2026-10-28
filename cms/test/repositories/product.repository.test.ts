import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productRepository } from 'src/repositories/product.repository';
import axiosInstance from 'src/utils/axios';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe('productRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports productRepository instance', () => {
    expect(productRepository).toBeDefined();
    expect(productRepository).toHaveProperty('getProducts');
    expect(productRepository).toHaveProperty('getProductById');
    expect(productRepository).toHaveProperty('getProductInventoryById');
    expect(productRepository).toHaveProperty('updateProduct');
    expect(productRepository).toHaveProperty('bulkHideProducts');
  });

  describe('getProducts', () => {
    it('calls GET /products with page and limit', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await productRepository.getProducts({ page: 1, limit: 10 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/products', {
        params: {
          page: '1',
          limit: '10',
        },
      });
    });

    it('includes filters in query params when provided', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const filters = { name: 'test', category: 'electronics' };
      await productRepository.getProducts({ page: 1, limit: 10, filters });

      expect(axiosInstance.get).toHaveBeenCalledWith('/products', {
        params: {
          page: '1',
          limit: '10',
          filters: JSON.stringify(filters),
        },
      });
    });

    it('includes sort in query params when provided', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const sort = [{ field: 'name', order: 'asc' }];
      await productRepository.getProducts({ page: 1, limit: 10, sort });

      expect(axiosInstance.get).toHaveBeenCalledWith('/products', {
        params: {
          page: '1',
          limit: '10',
          sort: JSON.stringify(sort),
        },
      });
    });

    it('omits filters when empty object', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await productRepository.getProducts({ page: 1, limit: 10, filters: {} });

      expect(axiosInstance.get).toHaveBeenCalledWith('/products', {
        params: {
          page: '1',
          limit: '10',
        },
      });
    });

    it('omits sort when empty array', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await productRepository.getProducts({ page: 1, limit: 10, sort: [] });

      expect(axiosInstance.get).toHaveBeenCalledWith('/products', {
        params: {
          page: '1',
          limit: '10',
        },
      });
    });

    it('returns GetProductsResponse', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 'p1', name: 'Product 1' }],
          total: 1,
          page: 1,
          limit: 10,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await productRepository.getProducts({ page: 1, limit: 10 });

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getProductById', () => {
    it('calls GET /products/:id', async () => {
      const mockResponse = {
        data: {
          id: 'p1',
          name: 'Product 1',
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await productRepository.getProductById('p1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/products/p1');
    });

    it('returns Product', async () => {
      const mockProduct = {
        id: 'p1',
        name: 'Product 1',
        price: 100,
      };
      const mockResponse = { data: mockProduct };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await productRepository.getProductById('p1');

      expect(result).toEqual(mockProduct);
    });
  });

  describe('getProductInventoryById', () => {
    it('calls GET /product-inventories/product/:id', async () => {
      const mockResponse = {
        data: {
          productId: 'p1',
          quantity: 100,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await productRepository.getProductInventoryById('p1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/product-inventories/product/p1');
    });

    it('returns ProductInventory', async () => {
      const mockInventory = {
        productId: 'p1',
        quantity: 100,
        reserved: 10,
      };
      const mockResponse = { data: mockInventory };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await productRepository.getProductInventoryById('p1');

      expect(result).toEqual(mockInventory);
    });
  });

  describe('updateProduct', () => {
    it('calls PATCH /products/:id/details', async () => {
      const mockData = {
        description: 'Updated description',
      };
      const mockResponse = {
        data: {
          id: 'p1',
          ...mockData,
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await productRepository.updateProduct('p1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/products/p1/details', mockData);
    });

    it('returns updated Product', async () => {
      const mockData = {
        description: 'Updated',
      };
      const mockProduct = {
        id: 'p1',
        name: 'Product 1',
        description: 'Updated',
      };
      const mockResponse = { data: mockProduct };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await productRepository.updateProduct('p1', mockData);

      expect(result).toEqual(mockProduct);
    });
  });

  describe('bulkHideProducts', () => {
    it('calls POST /products/bulk/hide', async () => {
      const mockData = {
        productIds: ['p1', 'p2', 'p3'],
        hidden: true,
      };
      const mockResponse = {
        data: {
          success: true,
          count: 3,
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await productRepository.bulkHideProducts(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/products/bulk/hide', mockData);
    });

    it('returns BulkHideProductsResponse', async () => {
      const mockData = {
        productIds: ['p1', 'p2'],
        hidden: false,
      };
      const mockResult = {
        success: true,
        count: 2,
      };
      const mockResponse = { data: mockResult };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await productRepository.bulkHideProducts(mockData);

      expect(result).toEqual(mockResult);
    });

    it('handles hide operation', async () => {
      const mockData = {
        productIds: ['p1'],
        hidden: true,
      };
      const mockResponse = { data: { success: true } };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await productRepository.bulkHideProducts(mockData);

      const callArgs = vi.mocked(axiosInstance.post).mock.calls[0][1];
      expect(callArgs).toHaveProperty('hidden', true);
    });

    it('handles show operation', async () => {
      const mockData = {
        productIds: ['p1'],
        hidden: false,
      };
      const mockResponse = { data: { success: true } };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await productRepository.bulkHideProducts(mockData);

      const callArgs = vi.mocked(axiosInstance.post).mock.calls[0][1];
      expect(callArgs).toHaveProperty('hidden', false);
    });
  });
});
