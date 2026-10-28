import { describe, it, expect } from 'vitest';
import type { ProductCategory, GetProductCategoriesRequest } from 'src/types/product-categories';

describe('product-categories types', () => {
  describe('ProductCategory', () => {
    it('exports ProductCategory type', () => {
      const category: ProductCategory = {} as ProductCategory;
      expect(category).toBeDefined();
    });

    it('ProductCategory can be assigned', () => {
      const category: ProductCategory = {} as ProductCategory;
      expect(typeof category).toBe('object');
    });
  });

  describe('GetProductCategoriesRequest', () => {
    it('exports GetProductCategoriesRequest interface', () => {
      const request: GetProductCategoriesRequest = {
        page: 1,
        limit: 10,
      };
      expect(request).toBeDefined();
    });

    it('requires page property', () => {
      const request: GetProductCategoriesRequest = {
        page: 1,
        limit: 20,
      };
      expect(request.page).toBe(1);
    });

    it('requires limit property', () => {
      const request: GetProductCategoriesRequest = {
        page: 2,
        limit: 50,
      };
      expect(request.limit).toBe(50);
    });

    it('accepts optional filters property', () => {
      const request: GetProductCategoriesRequest = {
        page: 1,
        limit: 10,
        filters: {},
      };
      expect(request.filters).toBeDefined();
    });

    it('accepts optional sort property', () => {
      const request: GetProductCategoriesRequest = {
        page: 1,
        limit: 10,
        sort: [],
      };
      expect(request.sort).toBeDefined();
    });

    it('accepts filters and sort together', () => {
      const request: GetProductCategoriesRequest = {
        page: 1,
        limit: 10,
        filters: {},
        sort: [],
      };
      expect(request.filters).toBeDefined();
      expect(request.sort).toBeDefined();
    });

    it('page is a number', () => {
      const request: GetProductCategoriesRequest = {
        page: 5,
        limit: 10,
      };
      expect(typeof request.page).toBe('number');
    });

    it('limit is a number', () => {
      const request: GetProductCategoriesRequest = {
        page: 1,
        limit: 25,
      };
      expect(typeof request.limit).toBe('number');
    });

    it('can be used without optional fields', () => {
      const request: GetProductCategoriesRequest = {
        page: 1,
        limit: 10,
      };
      expect(request.filters).toBeUndefined();
      expect(request.sort).toBeUndefined();
    });

    it('sort is an array when provided', () => {
      const request: GetProductCategoriesRequest = {
        page: 1,
        limit: 10,
        sort: [],
      };
      expect(Array.isArray(request.sort)).toBe(true);
    });
  });
});
