import { describe, it, expect, beforeEach, vi } from 'vitest';
import { productCategoryRepository } from '@/lib/repositories/product-category.repository';
import { ProductCategoryStatus } from '@/types/gen/shared/shared/common/enums';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';

// Mock fetch
global.fetch = vi.fn();

describe('ProductCategoryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProductCategories', () => {
    it('fetches and returns active categories only', async () => {
      const mockCategories: ProductCategory[] = [
        {
          id: '1',
          name: 'Active Category 1',
          status: ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_ACTIVE,
        } as ProductCategory,
        {
          id: '2',
          name: 'Inactive Category',
          status: ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_INACTIVE,
        } as ProductCategory,
        {
          id: '3',
          name: 'Active Category 2',
          status: ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_ACTIVE,
        } as ProductCategory,
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      } as Response);

      const result = await productCategoryRepository.getProductCategories();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/shop/categories',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          next: {
            revalidate: 300,
          },
        })
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
      expect(result.every(cat => cat.status === ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_ACTIVE)).toBe(true);
    });

    it('returns empty array when all categories are inactive', async () => {
      const mockCategories: ProductCategory[] = [
        {
          id: '1',
          name: 'Inactive Category 1',
          status: ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_INACTIVE,
        } as ProductCategory,
        {
          id: '2',
          name: 'Inactive Category 2',
          status: ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_INACTIVE,
        } as ProductCategory,
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      } as Response);

      const result = await productCategoryRepository.getProductCategories();

      expect(result).toEqual([]);
    });

    it('returns empty array when response is empty', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await productCategoryRepository.getProductCategories();

      expect(result).toEqual([]);
    });

    it('returns empty array when fetch fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await productCategoryRepository.getProductCategories();

      expect(result).toEqual([]);
    });

    it('returns empty array when fetch throws error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await productCategoryRepository.getProductCategories();

      expect(result).toEqual([]);
    });

    it('returns empty array when JSON parsing fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      const result = await productCategoryRepository.getProductCategories();

      expect(result).toEqual([]);
    });

    it('uses correct API endpoint', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      await productCategoryRepository.getProductCategories();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/shop/categories'),
        expect.any(Object)
      );
    });

    it('sets revalidate to 300 seconds', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      await productCategoryRepository.getProductCategories();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: {
            revalidate: 300,
          },
        })
      );
    });
  });

  describe('getAllCategories', () => {
    it('calls getProductCategories and returns result', async () => {
      const mockCategories: ProductCategory[] = [
        {
          id: '1',
          name: 'Category 1',
          status: ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_ACTIVE,
        } as ProductCategory,
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      } as Response);

      const result = await productCategoryRepository.getAllCategories();

      expect(result).toEqual([
        expect.objectContaining({
          id: '1',
          name: 'Category 1',
        }),
      ]);
    });

    it('returns empty array when getProductCategories fails', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await productCategoryRepository.getAllCategories();

      expect(result).toEqual([]);
    });

    it('filters inactive categories', async () => {
      const mockCategories: ProductCategory[] = [
        {
          id: '1',
          name: 'Active',
          status: ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_ACTIVE,
        } as ProductCategory,
        {
          id: '2',
          name: 'Inactive',
          status: ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_INACTIVE,
        } as ProductCategory,
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      } as Response);

      const result = await productCategoryRepository.getAllCategories();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });
});
