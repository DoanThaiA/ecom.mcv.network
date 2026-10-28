import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productCategoryRepository } from 'src/repositories/product-category.repository';
import axiosInstance from 'src/utils/axios';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('ProductCategoryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProductCategories', () => {
    it('calls GET /product-categories with page and limit', async () => {
      const params = { page: 1, limit: 10 };
      const mockResponse = { data: [] };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await productCategoryRepository.getProductCategories(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/product-categories', {
        params: { page: '1', limit: '10' },
      });
    });

    it('converts page to string', async () => {
      const params = { page: 2, limit: 20 };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });

      await productCategoryRepository.getProductCategories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.page).toBe('2');
    });

    it('converts limit to string', async () => {
      const params = { page: 1, limit: 50 };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });

      await productCategoryRepository.getProductCategories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.limit).toBe('50');
    });

    it('includes filters when provided', async () => {
      const params = { page: 1, limit: 10, filters: { status: 'active' } };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });

      await productCategoryRepository.getProductCategories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.filters).toBe(JSON.stringify({ status: 'active' }));
    });

    it('includes sort when provided', async () => {
      const params = { page: 1, limit: 10, sort: [{ field: 'name', order: 'asc' }] };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });

      await productCategoryRepository.getProductCategories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.sort).toBe(JSON.stringify([{ field: 'name', order: 'asc' }]));
    });

    it('omits filters when not provided', async () => {
      const params = { page: 1, limit: 10 };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });

      await productCategoryRepository.getProductCategories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.filters).toBeUndefined();
    });

    it('omits filters when empty object', async () => {
      const params = { page: 1, limit: 10, filters: {} };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });

      await productCategoryRepository.getProductCategories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.filters).toBeUndefined();
    });

    it('omits sort when not provided', async () => {
      const params = { page: 1, limit: 10 };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });

      await productCategoryRepository.getProductCategories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.sort).toBeUndefined();
    });

    it('omits sort when empty array', async () => {
      const params = { page: 1, limit: 10, sort: [] };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });

      await productCategoryRepository.getProductCategories(params);

      const call = vi.mocked(axiosInstance.get).mock.calls[0];
      expect(call[1]?.params.sort).toBeUndefined();
    });

    it('returns response data', async () => {
      const params = { page: 1, limit: 10 };
      const mockData = [{ id: '1', name: 'Category 1' }];
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await productCategoryRepository.getProductCategories(params);

      expect(result).toEqual(mockData);
    });

    it('handles API errors', async () => {
      const params = { page: 1, limit: 10 };
      vi.mocked(axiosInstance.get).mockRejectedValue(new Error('API Error'));

      await expect(productCategoryRepository.getProductCategories(params)).rejects.toThrow('API Error');
    });

    it('is an async function', () => {
      expect(productCategoryRepository.getProductCategories).toBeInstanceOf(Function);
    });
  });

  describe('getProductCategoryById', () => {
    it('calls GET /product-categories/:id', async () => {
      const id = 'category-123';
      const mockResponse = { data: { id, name: 'Test Category' } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await productCategoryRepository.getProductCategoryById(id);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/product-categories/${id}`);
    });

    it('passes id to URL', async () => {
      const id = 'test-id';
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { id } });

      await productCategoryRepository.getProductCategoryById(id);

      expect(axiosInstance.get).toHaveBeenCalledWith('/product-categories/test-id');
    });

    it('returns category data', async () => {
      const id = 'category-1';
      const mockData = { id, name: 'Category', description: 'Test' };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await productCategoryRepository.getProductCategoryById(id);

      expect(result).toEqual(mockData);
    });

    it('handles API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Not Found'));

      await expect(productCategoryRepository.getProductCategoryById('invalid')).rejects.toThrow('Not Found');
    });

    it('is an async function', () => {
      expect(productCategoryRepository.getProductCategoryById).toBeInstanceOf(Function);
    });
  });

  describe('ProductCategoryRepository class', () => {
    it('exports singleton instance', () => {
      expect(productCategoryRepository).toBeDefined();
      expect(productCategoryRepository).toBeInstanceOf(Object);
    });

    it('has getProductCategories method', () => {
      expect(productCategoryRepository.getProductCategories).toBeDefined();
    });

    it('has getProductCategoryById method', () => {
      expect(productCategoryRepository.getProductCategoryById).toBeDefined();
    });

    it('uses axiosInstance for API calls', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });
      await productCategoryRepository.getProductCategories({ page: 1, limit: 10 });
      expect(axiosInstance.get).toHaveBeenCalled();
    });
  });
});
