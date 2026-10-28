import { describe, it, expect } from 'vitest';
import type {
  ProductInventory,
  GetInventoriesRequest,
  GetInventoriesResponse,
} from 'src/types/product-inventories';

describe('Product Inventories Types', () => {
  describe('GetInventoriesRequest', () => {
    it('has required page property', () => {
      const request: GetInventoriesRequest = {
        page: 1,
        limit: 10,
      };
      expect(request.page).toBe(1);
    });

    it('has required limit property', () => {
      const request: GetInventoriesRequest = {
        page: 1,
        limit: 20,
      };
      expect(request.limit).toBe(20);
    });

    it('has optional filters property', () => {
      const request: GetInventoriesRequest = {
        page: 1,
        limit: 10,
        filters: {},
      };
      expect(request.filters).toEqual({});
    });

    it('has optional sort property', () => {
      const request: GetInventoriesRequest = {
        page: 1,
        limit: 10,
        sort: [],
      };
      expect(request.sort).toEqual([]);
    });

    it('works without optional properties', () => {
      const request: GetInventoriesRequest = {
        page: 1,
        limit: 10,
      };
      expect(request.filters).toBeUndefined();
      expect(request.sort).toBeUndefined();
    });

    it('accepts all properties', () => {
      const request: GetInventoriesRequest = {
        page: 2,
        limit: 50,
        filters: { field: 'value' },
        sort: [{ field: 'name', order: 'asc' }],
      };
      expect(request.page).toBe(2);
      expect(request.limit).toBe(50);
      expect(request.filters).toEqual({ field: 'value' });
      expect(request.sort).toHaveLength(1);
    });

    it('page can be any number', () => {
      const request: GetInventoriesRequest = {
        page: 100,
        limit: 10,
      };
      expect(request.page).toBe(100);
    });

    it('limit can be any number', () => {
      const request: GetInventoriesRequest = {
        page: 1,
        limit: 100,
      };
      expect(request.limit).toBe(100);
    });

    it('filters can be undefined', () => {
      const request: GetInventoriesRequest = {
        page: 1,
        limit: 10,
        filters: undefined,
      };
      expect(request.filters).toBeUndefined();
    });

    it('sort can be undefined', () => {
      const request: GetInventoriesRequest = {
        page: 1,
        limit: 10,
        sort: undefined,
      };
      expect(request.sort).toBeUndefined();
    });
  });

  describe('GetInventoriesResponse', () => {
    it('has data property with array', () => {
      const response: GetInventoriesResponse = {
        data: [],
        hasNextPage: false,
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      expect(response.data).toEqual([]);
    });

    it('has hasNextPage property', () => {
      const response: GetInventoriesResponse = {
        data: [],
        hasNextPage: true,
        total: 20,
        page: 1,
        limit: 10,
        totalPages: 2,
      };
      expect(response.hasNextPage).toBe(true);
    });

    it('has total property', () => {
      const response: GetInventoriesResponse = {
        data: [],
        hasNextPage: false,
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
      };
      expect(response.total).toBe(100);
    });

    it('has page property', () => {
      const response: GetInventoriesResponse = {
        data: [],
        hasNextPage: false,
        total: 0,
        page: 5,
        limit: 10,
        totalPages: 0,
      };
      expect(response.page).toBe(5);
    });

    it('has limit property', () => {
      const response: GetInventoriesResponse = {
        data: [],
        hasNextPage: false,
        total: 0,
        page: 1,
        limit: 25,
        totalPages: 0,
      };
      expect(response.limit).toBe(25);
    });

    it('has totalPages property', () => {
      const response: GetInventoriesResponse = {
        data: [],
        hasNextPage: false,
        total: 50,
        page: 1,
        limit: 10,
        totalPages: 5,
      };
      expect(response.totalPages).toBe(5);
    });

    it('data can contain inventory items', () => {
      const mockInventory: any = { id: '1', productId: 'p1', quantity: 10 };
      const response: GetInventoriesResponse = {
        data: [mockInventory],
        hasNextPage: false,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      expect(response.data).toHaveLength(1);
      expect(response.data[0]).toEqual(mockInventory);
    });

    it('hasNextPage can be false', () => {
      const response: GetInventoriesResponse = {
        data: [],
        hasNextPage: false,
        total: 5,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      expect(response.hasNextPage).toBe(false);
    });

    it('total can be zero', () => {
      const response: GetInventoriesResponse = {
        data: [],
        hasNextPage: false,
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      expect(response.total).toBe(0);
    });

    it('totalPages can be zero', () => {
      const response: GetInventoriesResponse = {
        data: [],
        hasNextPage: false,
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      expect(response.totalPages).toBe(0);
    });

    it('calculates correct pagination info', () => {
      const response: GetInventoriesResponse = {
        data: [],
        hasNextPage: true,
        total: 45,
        page: 2,
        limit: 20,
        totalPages: 3,
      };
      expect(response.page).toBe(2);
      expect(response.limit).toBe(20);
      expect(response.total).toBe(45);
      expect(response.totalPages).toBe(3);
      expect(response.hasNextPage).toBe(true);
    });
  });

  describe('Type exports', () => {
    it('exports ProductInventory type', () => {
      const inventory: ProductInventory = {} as ProductInventory;
      expect(inventory).toBeDefined();
    });

    it('exports GetInventoriesRequest type', () => {
      const request: GetInventoriesRequest = { page: 1, limit: 10 };
      expect(request).toBeDefined();
    });

    it('exports GetInventoriesResponse type', () => {
      const response: GetInventoriesResponse = {
        data: [],
        hasNextPage: false,
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      expect(response).toBeDefined();
    });
  });
});
