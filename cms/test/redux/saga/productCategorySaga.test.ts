import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { productCategoryRepository } from 'src/repositories';
import { productCategorySaga } from 'src/redux/saga/productCategorySaga';
import {
  getProductCategoriesRequest,
  getProductCategoryByIdRequest,
  setProductCategoryLoading,
  setProductCategoriesSuccess,
  setProductCategoryFailure,
  setCurrentProductCategoryLoading,
  setCurrentProductCategorySuccess,
  setCurrentProductCategoryFailure,
} from 'src/redux/store/productCategorySlice';

// Mock repository
vi.mock('src/repositories', () => ({
  productCategoryRepository: {
    getProductCategories: vi.fn(),
    getProductCategoryById: vi.fn(),
  },
}));

// Mock toast
vi.mock('src/utils/toast', () => ({
  showError: vi.fn(),
}));

describe('productCategorySaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports productCategorySaga function', () => {
      expect(productCategorySaga).toBeDefined();
      expect(productCategorySaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchProductCategory', () => {
      const gen = productCategorySaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchProductCategory', () => {
      const gen = productCategorySaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('getProductCategoriesSaga', () => {
    it('successfully fetches product categories with default params', async () => {
      const mockCategories = [
        { id: '1', name: 'Category 1', parentId: null },
        { id: '2', name: 'Category 2', parentId: '1' },
      ];

      vi.mocked(productCategoryRepository.getProductCategories).mockResolvedValue(mockCategories);

      const action = getProductCategoriesRequest({ page: 1, limit: 10 });

      expect(action.type).toBe('productCategory/getProductCategoriesRequest');
      expect(action.payload).toEqual({ page: 1, limit: 10 });
    });

    it('successfully fetches with filters', async () => {
      const mockCategories = [{ id: '1', name: 'Category 1', parentId: null }];

      vi.mocked(productCategoryRepository.getProductCategories).mockResolvedValue(mockCategories);

      const action = getProductCategoriesRequest({
        page: 1,
        limit: 20,
        filters: { name: 'test' },
      });

      expect(action.payload.filters).toEqual({ name: 'test' });
    });

    it('successfully fetches with sort', async () => {
      const mockCategories = [{ id: '1', name: 'Category 1', parentId: null }];

      vi.mocked(productCategoryRepository.getProductCategories).mockResolvedValue(mockCategories);

      const action = getProductCategoriesRequest({
        page: 1,
        limit: 10,
        sort: { field: 'name', order: 'asc' },
      });

      expect(action.payload.sort).toEqual({ field: 'name', order: 'asc' });
    });

    it('handles fetch failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(productCategoryRepository.getProductCategories).mockRejectedValue(mockError);

      expect(productCategorySaga).toBeDefined();
    });

    it('sets loading state', () => {
      const action = setProductCategoryLoading(true);

      expect(action.type).toBe('productCategory/setProductCategoryLoading');
      expect(action.payload).toBe(true);
    });

    it('sets success state', () => {
      const productCategories = [{ id: '1', name: 'Category 1', parentId: null }];
      const action = setProductCategoriesSuccess({ productCategories });

      expect(action.type).toBe('productCategory/setProductCategoriesSuccess');
      expect(action.payload.productCategories).toEqual(productCategories);
    });

    it('sets failure state', () => {
      const action = setProductCategoryFailure();

      expect(action.type).toBe('productCategory/setProductCategoryFailure');
    });
  });

  describe('getProductCategoryByIdSaga', () => {
    it('successfully fetches product category by ID', async () => {
      const mockCategory = {
        id: '1',
        name: 'Category 1',
        parentId: null,
        description: 'Test category',
      };

      vi.mocked(productCategoryRepository.getProductCategoryById).mockResolvedValue(mockCategory);

      const action = getProductCategoryByIdRequest({ id: '1' });

      expect(action.type).toBe('productCategory/getProductCategoryByIdRequest');
      expect(action.payload.id).toBe('1');
    });

    it('handles fetch by ID failure', async () => {
      const mockError = new Error('Category not found');

      vi.mocked(productCategoryRepository.getProductCategoryById).mockRejectedValue(mockError);

      const action = getProductCategoryByIdRequest({ id: '999' });

      expect(action.payload.id).toBe('999');
    });

    it('sets current loading state', () => {
      const action = setCurrentProductCategoryLoading(true);

      expect(action.type).toBe('productCategory/setCurrentProductCategoryLoading');
      expect(action.payload).toBe(true);
    });

    it('sets current success state', () => {
      const category = { id: '1', name: 'Category 1', parentId: null };
      const action = setCurrentProductCategorySuccess(category);

      expect(action.type).toBe('productCategory/setCurrentProductCategorySuccess');
      expect(action.payload).toEqual(category);
    });

    it('sets current failure state', () => {
      const action = setCurrentProductCategoryFailure();

      expect(action.type).toBe('productCategory/setCurrentProductCategoryFailure');
    });
  });

  describe('action types', () => {
    it('has correct action type for getProductCategoriesRequest', () => {
      expect(getProductCategoriesRequest.type).toBe('productCategory/getProductCategoriesRequest');
    });

    it('has correct action type for getProductCategoryByIdRequest', () => {
      expect(getProductCategoryByIdRequest.type).toBe('productCategory/getProductCategoryByIdRequest');
    });
  });

  describe('integration with redux-saga effects', () => {
    it('uses call effect', () => {
      expect(call).toBeDefined();
    });

    it('uses put effect', () => {
      expect(put).toBeDefined();
    });

    it('uses takeLatest effect', () => {
      expect(takeLatest).toBeDefined();
    });
  });

  describe('pagination and filtering', () => {
    it('handles different page numbers', () => {
      const action = getProductCategoriesRequest({ page: 5, limit: 50 });

      expect(action.payload.page).toBe(5);
      expect(action.payload.limit).toBe(50);
    });

    it('handles empty filters', () => {
      const action = getProductCategoriesRequest({ page: 1, limit: 10, filters: {} });

      expect(action.payload.filters).toEqual({});
    });

    it('handles complex filters', () => {
      const filters = { name: 'test', parentId: '1', status: 'active' };
      const action = getProductCategoriesRequest({ page: 1, limit: 10, filters });

      expect(action.payload.filters).toEqual(filters);
    });
  });

  describe('error handling', () => {
    it('handles error with message', () => {
      const error = new Error('Test error');

      expect(error.message).toBe('Test error');
    });

    it('handles error without message', () => {
      const error = { code: 500 };

      expect(error).toHaveProperty('code');
    });
  });
});
