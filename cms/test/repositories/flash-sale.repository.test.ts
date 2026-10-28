import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flashSaleRepository } from 'src/repositories/flash-sale.repository';
import axiosInstance from 'src/utils/axios';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('flashSaleRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports flashSaleRepository instance', () => {
    expect(flashSaleRepository).toBeDefined();
    expect(flashSaleRepository).toHaveProperty('queryFlashSales');
    expect(flashSaleRepository).toHaveProperty('getFlashSale');
    expect(flashSaleRepository).toHaveProperty('createFlashSale');
    expect(flashSaleRepository).toHaveProperty('updateFlashSale');
    expect(flashSaleRepository).toHaveProperty('deleteFlashSale');
    expect(flashSaleRepository).toHaveProperty('toggleFlashSale');
    expect(flashSaleRepository).toHaveProperty('addFlashSaleProduct');
    expect(flashSaleRepository).toHaveProperty('updateFlashSaleProduct');
    expect(flashSaleRepository).toHaveProperty('removeFlashSaleProduct');
    expect(flashSaleRepository).toHaveProperty('toggleFlashSaleProduct');
    expect(flashSaleRepository).toHaveProperty('bulkAddFlashSaleProducts');
    expect(flashSaleRepository).toHaveProperty('bulkUpdateFlashSaleProducts');
  });

  describe('queryFlashSales', () => {
    it('calls GET /flash-sales with page', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await flashSaleRepository.queryFlashSales({ page: 2 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/flash-sales', {
        params: {
          page: '2',
        },
      });
    });

    it('calls GET /flash-sales with limit', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await flashSaleRepository.queryFlashSales({ limit: 20 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/flash-sales', {
        params: {
          limit: '20',
        },
      });
    });

    it('includes filters when provided', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const filters = { name: 'test', active: true };
      await flashSaleRepository.queryFlashSales({ filters });

      expect(axiosInstance.get).toHaveBeenCalledWith('/flash-sales', {
        params: {
          filters: JSON.stringify(filters),
        },
      });
    });

    it('omits filters when not provided', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await flashSaleRepository.queryFlashSales({});

      expect(axiosInstance.get).toHaveBeenCalledWith('/flash-sales', {
        params: {},
      });
    });

    it('includes sort when provided and non-empty', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const sort = [{ field: 'createdAt', order: 'desc' }];
      await flashSaleRepository.queryFlashSales({ sort });

      expect(axiosInstance.get).toHaveBeenCalledWith('/flash-sales', {
        params: {
          sort: JSON.stringify(sort),
        },
      });
    });

    it('omits sort when empty array', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await flashSaleRepository.queryFlashSales({ sort: [] });

      expect(axiosInstance.get).toHaveBeenCalledWith('/flash-sales', {
        params: {},
      });
    });

    it('returns QueryFlashSalesResponse', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 'fs1', name: 'Flash Sale 1' }],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await flashSaleRepository.queryFlashSales({});

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getFlashSale', () => {
    it('calls GET /flash-sales/:id', async () => {
      const mockResponse = {
        data: {
          id: 'fs1',
          name: 'Flash Sale 1',
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await flashSaleRepository.getFlashSale('fs1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/flash-sales/fs1');
    });

    it('returns FlashSale', async () => {
      const mockFlashSale = {
        id: 'fs1',
        name: 'Test Flash Sale',
      };
      const mockResponse = { data: mockFlashSale };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await flashSaleRepository.getFlashSale('fs1');

      expect(result).toEqual(mockFlashSale);
    });
  });

  describe('createFlashSale', () => {
    it('calls POST /flash-sales', async () => {
      const mockData = {
        name: 'New Flash Sale',
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-02T00:00:00Z',
      };
      const mockResponse = {
        data: {
          id: 'fs1',
          ...mockData,
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await flashSaleRepository.createFlashSale(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/flash-sales', mockData);
    });

    it('returns created FlashSale', async () => {
      const mockData = {
        name: 'New Flash Sale',
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-02T00:00:00Z',
      };
      const mockFlashSale = {
        id: 'fs1',
        name: 'New Flash Sale',
      };
      const mockResponse = { data: mockFlashSale };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await flashSaleRepository.createFlashSale(mockData);

      expect(result).toEqual(mockFlashSale);
    });
  });

  describe('updateFlashSale', () => {
    it('calls PATCH /flash-sales/:id without flashSaleId in body', async () => {
      const mockData = {
        flashSaleId: 'fs1',
        name: 'Updated Flash Sale',
      };
      const mockResponse = {
        data: {
          id: 'fs1',
          name: 'Updated Flash Sale',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await flashSaleRepository.updateFlashSale(mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/flash-sales/fs1', {
        name: 'Updated Flash Sale',
      });
    });

    it('returns updated FlashSale', async () => {
      const mockData = {
        flashSaleId: 'fs1',
        name: 'Updated',
      };
      const mockFlashSale = {
        id: 'fs1',
        name: 'Updated',
      };
      const mockResponse = { data: mockFlashSale };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await flashSaleRepository.updateFlashSale(mockData);

      expect(result).toEqual(mockFlashSale);
    });
  });

  describe('deleteFlashSale', () => {
    it('calls DELETE /flash-sales/:id', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({});

      await flashSaleRepository.deleteFlashSale('fs1');

      expect(axiosInstance.delete).toHaveBeenCalledWith('/flash-sales/fs1');
    });

    it('returns void', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({});

      const result = await flashSaleRepository.deleteFlashSale('fs1');

      expect(result).toBeUndefined();
    });
  });

  describe('toggleFlashSale', () => {
    it('calls PATCH /flash-sales/:id/toggle', async () => {
      const mockResponse = {
        data: {
          id: 'fs1',
          enabled: false,
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await flashSaleRepository.toggleFlashSale('fs1');

      expect(axiosInstance.patch).toHaveBeenCalledWith('/flash-sales/fs1/toggle');
    });

    it('returns updated FlashSale', async () => {
      const mockFlashSale = {
        id: 'fs1',
        enabled: true,
      };
      const mockResponse = { data: mockFlashSale };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await flashSaleRepository.toggleFlashSale('fs1');

      expect(result).toEqual(mockFlashSale);
    });
  });

  describe('addFlashSaleProduct', () => {
    it('calls POST /flash-sales/:id/products without flashSaleId in body', async () => {
      const mockData = {
        flashSaleId: 'fs1',
        productId: 'p1',
        discountPrice: 100,
      };
      const mockResponse = {
        data: {
          id: 'fs1',
          products: [],
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await flashSaleRepository.addFlashSaleProduct(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/flash-sales/fs1/products', {
        productId: 'p1',
        discountPrice: 100,
      });
    });

    it('returns updated FlashSale', async () => {
      const mockData = {
        flashSaleId: 'fs1',
        productId: 'p1',
        discountPrice: 100,
      };
      const mockFlashSale = {
        id: 'fs1',
        products: [{ productId: 'p1' }],
      };
      const mockResponse = { data: mockFlashSale };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await flashSaleRepository.addFlashSaleProduct(mockData);

      expect(result).toEqual(mockFlashSale);
    });
  });

  describe('updateFlashSaleProduct', () => {
    it('calls PATCH /flash-sales/:id/products/:productId without ids in body', async () => {
      const mockData = {
        flashSaleId: 'fs1',
        productId: 'p1',
        discountPrice: 150,
      };
      const mockResponse = {
        data: {
          id: 'fs1',
          products: [],
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await flashSaleRepository.updateFlashSaleProduct(mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/flash-sales/fs1/products/p1', {
        discountPrice: 150,
      });
    });

    it('returns updated FlashSale', async () => {
      const mockData = {
        flashSaleId: 'fs1',
        productId: 'p1',
        discountPrice: 150,
      };
      const mockFlashSale = {
        id: 'fs1',
        products: [{ productId: 'p1', discountPrice: 150 }],
      };
      const mockResponse = { data: mockFlashSale };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await flashSaleRepository.updateFlashSaleProduct(mockData);

      expect(result).toEqual(mockFlashSale);
    });
  });

  describe('removeFlashSaleProduct', () => {
    it('calls DELETE /flash-sales/:id/products/:productId', async () => {
      const mockResponse = {
        data: {
          id: 'fs1',
          products: [],
        },
      };
      vi.mocked(axiosInstance.delete).mockResolvedValue(mockResponse);

      await flashSaleRepository.removeFlashSaleProduct('fs1', 'p1');

      expect(axiosInstance.delete).toHaveBeenCalledWith('/flash-sales/fs1/products/p1');
    });

    it('returns updated FlashSale', async () => {
      const mockFlashSale = {
        id: 'fs1',
        products: [],
      };
      const mockResponse = { data: mockFlashSale };
      vi.mocked(axiosInstance.delete).mockResolvedValue(mockResponse);

      const result = await flashSaleRepository.removeFlashSaleProduct('fs1', 'p1');

      expect(result).toEqual(mockFlashSale);
    });
  });

  describe('toggleFlashSaleProduct', () => {
    it('calls PATCH /flash-sales/:id/products/:productId/toggle', async () => {
      const mockResponse = {
        data: {
          id: 'fs1',
          products: [],
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await flashSaleRepository.toggleFlashSaleProduct('fs1', 'p1');

      expect(axiosInstance.patch).toHaveBeenCalledWith('/flash-sales/fs1/products/p1/toggle');
    });

    it('returns updated FlashSale', async () => {
      const mockFlashSale = {
        id: 'fs1',
        products: [{ productId: 'p1', enabled: false }],
      };
      const mockResponse = { data: mockFlashSale };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await flashSaleRepository.toggleFlashSaleProduct('fs1', 'p1');

      expect(result).toEqual(mockFlashSale);
    });
  });

  describe('bulkAddFlashSaleProducts', () => {
    it('calls POST /flash-sales/:id/products/bulk with flashSaleId and products', async () => {
      const mockData = {
        flashSaleId: 'fs1',
        products: [
          { productId: 'p1', discountPrice: 100 },
          { productId: 'p2', discountPrice: 200 },
        ],
      };
      const mockResponse = {
        data: {
          id: 'fs1',
          products: [],
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await flashSaleRepository.bulkAddFlashSaleProducts(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/flash-sales/fs1/products/bulk', {
        flashSaleId: 'fs1',
        products: mockData.products,
      });
    });

    it('returns updated FlashSale', async () => {
      const mockData = {
        flashSaleId: 'fs1',
        products: [{ productId: 'p1', discountPrice: 100 }],
      };
      const mockFlashSale = {
        id: 'fs1',
        products: [{ productId: 'p1' }],
      };
      const mockResponse = { data: mockFlashSale };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await flashSaleRepository.bulkAddFlashSaleProducts(mockData);

      expect(result).toEqual(mockFlashSale);
    });
  });

  describe('bulkUpdateFlashSaleProducts', () => {
    it('calls PATCH /flash-sales/:id/products with flashSaleId and products', async () => {
      const mockData = {
        flashSaleId: 'fs1',
        products: [
          { productId: 'p1', discountPrice: 150 },
          { productId: 'p2', discountPrice: 250 },
        ],
      };
      const mockResponse = {
        data: {
          id: 'fs1',
          products: [],
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await flashSaleRepository.bulkUpdateFlashSaleProducts(mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/flash-sales/fs1/products', {
        flashSaleId: 'fs1',
        products: mockData.products,
      });
    });

    it('returns updated FlashSale', async () => {
      const mockData = {
        flashSaleId: 'fs1',
        products: [{ productId: 'p1', discountPrice: 150 }],
      };
      const mockFlashSale = {
        id: 'fs1',
        products: [{ productId: 'p1', discountPrice: 150 }],
      };
      const mockResponse = { data: mockFlashSale };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await flashSaleRepository.bulkUpdateFlashSaleProducts(mockData);

      expect(result).toEqual(mockFlashSale);
    });
  });
});
