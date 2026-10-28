import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryRepository } from 'src/repositories/inventory.repository';
import axiosInstance from 'src/utils/axios';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('InventoryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInventories', () => {
    it('calls GET /product-inventories with page and limit', async () => {
      const params = { page: 1, limit: 10 };
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await inventoryRepository.getInventories(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/product-inventories', {
        params: { page: '1', limit: '10' },
      });
    });

    it('converts page to string', async () => {
      const params = { page: 2, limit: 20 };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { data: [], total: 0 } });

      await inventoryRepository.getInventories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.page).toBe('2');
    });

    it('converts limit to string', async () => {
      const params = { page: 1, limit: 50 };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { data: [], total: 0 } });

      await inventoryRepository.getInventories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.limit).toBe('50');
    });

    it('includes filters when provided', async () => {
      const params = { page: 1, limit: 10, filters: { status: 'active' } };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { data: [], total: 0 } });

      await inventoryRepository.getInventories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.filters).toBe(JSON.stringify({ status: 'active' }));
    });

    it('includes sort when provided', async () => {
      const params = { page: 1, limit: 10, sort: [{ field: 'name', order: 'asc' }] };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { data: [], total: 0 } });

      await inventoryRepository.getInventories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.sort).toBe(JSON.stringify([{ field: 'name', order: 'asc' }]));
    });

    it('omits filters when not provided', async () => {
      const params = { page: 1, limit: 10 };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { data: [], total: 0 } });

      await inventoryRepository.getInventories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.filters).toBeUndefined();
    });

    it('omits filters when empty object', async () => {
      const params = { page: 1, limit: 10, filters: {} };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { data: [], total: 0 } });

      await inventoryRepository.getInventories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.filters).toBeUndefined();
    });

    it('omits sort when not provided', async () => {
      const params = { page: 1, limit: 10 };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { data: [], total: 0 } });

      await inventoryRepository.getInventories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.sort).toBeUndefined();
    });

    it('omits sort when empty array', async () => {
      const params = { page: 1, limit: 10, sort: [] };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { data: [], total: 0 } });

      await inventoryRepository.getInventories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.sort).toBeUndefined();
    });

    it('returns response data', async () => {
      const params = { page: 1, limit: 10 };
      const mockData = { data: [{ id: '1' }], total: 1 };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await inventoryRepository.getInventories(params);

      expect(result).toEqual(mockData);
    });

    it('handles API errors', async () => {
      const params = { page: 1, limit: 10 };
      vi.mocked(axiosInstance.get).mockRejectedValue(new Error('API Error'));

      await expect(inventoryRepository.getInventories(params)).rejects.toThrow('API Error');
    });

    it('is an async function', () => {
      expect(inventoryRepository.getInventories).toBeInstanceOf(Function);
    });
  });

  describe('getInventoryById', () => {
    it('calls GET /product-inventories/product/:id', async () => {
      const id = 'product-123';
      const mockResponse = { data: { id, name: 'Test Product' } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await inventoryRepository.getInventoryById(id);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/product-inventories/product/${id}`);
    });

    it('passes id to URL', async () => {
      const id = 'test-id';
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { id } });

      await inventoryRepository.getInventoryById(id);

      expect(axiosInstance.get).toHaveBeenCalledWith('/product-inventories/product/test-id');
    });

    it('returns inventory data', async () => {
      const id = 'product-1';
      const mockData = { id, name: 'Product', quantity: 10 };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await inventoryRepository.getInventoryById(id);

      expect(result).toEqual(mockData);
    });

    it('handles API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Not Found'));

      await expect(inventoryRepository.getInventoryById('invalid')).rejects.toThrow('Not Found');
    });

    it('is an async function', () => {
      expect(inventoryRepository.getInventoryById).toBeInstanceOf(Function);
    });
  });

  describe('InventoryRepository class', () => {
    it('exports singleton instance', () => {
      expect(inventoryRepository).toBeDefined();
      expect(inventoryRepository).toBeInstanceOf(Object);
    });

    it('has getInventories method', () => {
      expect(inventoryRepository.getInventories).toBeDefined();
    });

    it('has getInventoryById method', () => {
      expect(inventoryRepository.getInventoryById).toBeDefined();
    });

    it('uses axiosInstance for API calls', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { data: [], total: 0 } });
      await inventoryRepository.getInventories({ page: 1, limit: 10 });
      expect(axiosInstance.get).toHaveBeenCalled();
    });
  });
});
