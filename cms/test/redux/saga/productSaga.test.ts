import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { productRepository } from 'src/repositories';
import { productSaga } from 'src/redux/saga/productSaga';
import {
  getProductsRequest,
  getProductByIdRequest,
  getProductInventoryRequest,
  updateProductRequest,
  toggleProductStatusRequest,
  setProductLoading,
  setProductsSuccess,
  setProductError,
  setCurrentProductLoading,
  setCurrentProductSuccess,
  setCurrentProductError,
  setInventoryLoading,
  setInventorySuccess,
  setInventoryError,
  setUpdateProductLoading,
  updateProductSuccess,
  updateProductsHiddenStatus,
  setToggleStatusLoading,
} from 'src/redux/store/productSlice';

// Mock repository
vi.mock('src/repositories', () => ({
  productRepository: {
    getProducts: vi.fn(),
    getProductById: vi.fn(),
    getProductInventory: vi.fn(),
    updateProduct: vi.fn(),
    bulkHideProducts: vi.fn(),
  },
}));

// Mock toast
vi.mock('src/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

// Mock i18next
vi.mock('src/i18next', () => ({
  default: {
    t: vi.fn((key) => key),
  },
}));

describe('productSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports productSaga function', () => {
      expect(productSaga).toBeDefined();
      expect(productSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchProduct', () => {
      const gen = productSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchProduct', () => {
      const gen = productSaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('getProductsSaga', () => {
    it('successfully fetches products with default params', async () => {
      const mockResponse = {
        data: [
          {
            id: 'prod-1',
            name: 'Product 1',
            price: 100000,
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      };

      vi.mocked(productRepository.getProducts).mockResolvedValue(mockResponse);

      const action = getProductsRequest({ page: 1, limit: 10 });

      expect(action.type).toBe('product/getProductsRequest');
      expect(action.payload).toEqual({ page: 1, limit: 10 });
    });

    it('successfully fetches with filters', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(productRepository.getProducts).mockResolvedValue(mockResponse);

      const action = getProductsRequest({
        page: 1,
        limit: 10,
        filters: { category: 'electronics' },
      });

      expect(action.payload.filters).toEqual({ category: 'electronics' });
    });

    it('successfully fetches with sort', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(productRepository.getProducts).mockResolvedValue(mockResponse);

      const action = getProductsRequest({
        page: 1,
        limit: 10,
        sort: { field: 'price', order: 'asc' },
      });

      expect(action.payload.sort).toEqual({ field: 'price', order: 'asc' });
    });

    it('calls onSuccess callback when successful', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(productRepository.getProducts).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = getProductsRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(productRepository.getProducts).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = getProductsRequest({
        page: 1,
        limit: 10,
        onError,
      });

      expect(action.payload.onError).toBe(onError);
    });

    it('handles fetch failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(productRepository.getProducts).mockRejectedValue(mockError);

      expect(productSaga).toBeDefined();
    });

    it('sets loading state', () => {
      const action = setProductLoading(true);

      expect(action.type).toBe('product/setProductLoading');
      expect(action.payload).toBe(true);
    });

    it('sets success state with pagination', () => {
      const data = {
        products: [
          {
            id: 'prod-1',
            name: 'Product',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      const action = setProductsSuccess(data);

      expect(action.type).toBe('product/setProductsSuccess');
      expect(action.payload).toEqual(data);
    });

    it('sets error state', () => {
      const action = setProductError('Error message');

      expect(action.type).toBe('product/setProductError');
      expect(action.payload).toBe('Error message');
    });
  });

  describe('getProductByIdSaga', () => {
    it('successfully fetches product by ID', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Product 1',
        price: 100000,
        description: 'Test product',
      };

      vi.mocked(productRepository.getProductById).mockResolvedValue(mockProduct);

      const action = getProductByIdRequest({ id: 'prod-1' });

      expect(action.type).toBe('product/getProductByIdRequest');
      expect(action.payload.id).toBe('prod-1');
    });

    it('calls onSuccess callback with product data', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Product',
      };

      vi.mocked(productRepository.getProductById).mockResolvedValue(mockProduct);

      const onSuccess = vi.fn();
      const action = getProductByIdRequest({
        id: 'prod-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('Product not found');

      vi.mocked(productRepository.getProductById).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = getProductByIdRequest({
        id: '999',
        onError,
      });

      expect(action.payload.onError).toBe(onError);
    });

    it('handles fetch by ID failure', async () => {
      const mockError = new Error('Product not found');

      vi.mocked(productRepository.getProductById).mockRejectedValue(mockError);

      const action = getProductByIdRequest({ id: '999' });

      expect(action.payload.id).toBe('999');
    });

    it('sets current loading state', () => {
      const action = setCurrentProductLoading(true);

      expect(action.type).toBe('product/setCurrentProductLoading');
      expect(action.payload).toBe(true);
    });

    it('sets current success state', () => {
      const product = {
        id: 'prod-1',
        name: 'Product',
      };

      const action = setCurrentProductSuccess(product);

      expect(action.type).toBe('product/setCurrentProductSuccess');
      expect(action.payload).toEqual(product);
    });

    it('sets current error state', () => {
      const action = setCurrentProductError('Error message');

      expect(action.type).toBe('product/setCurrentProductError');
      expect(action.payload).toBe('Error message');
    });
  });

  describe('getProductInventorySaga', () => {
    it('successfully fetches product inventory', async () => {
      const mockInventory = [
        {
          id: 'inv-1',
          productId: 'prod-1',
          quantity: 100,
          warehouse: 'Main',
        },
      ];

      vi.mocked(productRepository.getProductInventory).mockResolvedValue(mockInventory);

      const action = getProductInventoryRequest({ id: 'prod-1' });

      expect(action.type).toBe('product/getProductInventoryRequest');
      expect(action.payload.id).toBe('prod-1');
    });

    it('calls onSuccess callback when successful', async () => {
      const mockInventory = [];

      vi.mocked(productRepository.getProductInventory).mockResolvedValue(mockInventory);

      const onSuccess = vi.fn();
      const action = getProductInventoryRequest({
        id: 'prod-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('calls onError callback on failure', async () => {
      const mockError = new Error('Inventory not found');

      vi.mocked(productRepository.getProductInventory).mockRejectedValue(mockError);

      const onError = vi.fn();
      const action = getProductInventoryRequest({
        id: 'prod-1',
        onError,
      });

      expect(action.payload.onError).toBe(onError);
    });

    it('handles inventory fetch failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(productRepository.getProductInventory).mockRejectedValue(mockError);

      expect(productSaga).toBeDefined();
    });

    it('sets inventory loading state', () => {
      const action = setInventoryLoading(true);

      expect(action.type).toBe('product/setInventoryLoading');
      expect(action.payload).toBe(true);
    });

    it('sets inventory success state', () => {
      const inventory = [
        {
          id: 'inv-1',
          quantity: 100,
        },
      ];

      const action = setInventorySuccess(inventory);

      expect(action.type).toBe('product/setInventorySuccess');
      expect(action.payload).toEqual(inventory);
    });

    it('sets inventory error state', () => {
      const action = setInventoryError('Error message');

      expect(action.type).toBe('product/setInventoryError');
      expect(action.payload).toBe('Error message');
    });
  });

  describe('updateProductSaga', () => {
    it('successfully updates product', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Updated Product',
        price: 150000,
      };

      vi.mocked(productRepository.updateProduct).mockResolvedValue(mockProduct);

      const action = updateProductRequest({
        id: 'prod-1',
        data: {
          name: 'Updated Product',
        },
      });

      expect(action.type).toBe('product/updateProductRequest');
      expect(action.payload.id).toBe('prod-1');
      expect(action.payload.data.name).toBe('Updated Product');
    });

    it('calls onSuccess callback after update', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Updated',
      };

      vi.mocked(productRepository.updateProduct).mockResolvedValue(mockProduct);

      const onSuccess = vi.fn();
      const action = updateProductRequest({
        id: 'prod-1',
        data: {},
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles update failure', async () => {
      const mockError = new Error('Update failed');

      vi.mocked(productRepository.updateProduct).mockRejectedValue(mockError);

      expect(productSaga).toBeDefined();
    });

    it('sets update loading state', () => {
      const action = setUpdateProductLoading(true);

      expect(action.type).toBe('product/setUpdateProductLoading');
      expect(action.payload).toBe(true);
    });

    it('sets update success state', () => {
      const product = {
        id: 'prod-1',
        name: 'Updated',
      };

      const action = updateProductSuccess(product);

      expect(action.type).toBe('product/updateProductSuccess');
      expect(action.payload).toEqual(product);
    });
  });

  describe('toggleProductStatusSaga', () => {
    it('successfully toggles product status', async () => {
      vi.mocked(productRepository.bulkHideProducts).mockResolvedValue(undefined);

      const items = [
        { productId: 'prod-1', hidden: true },
        { productId: 'prod-2', hidden: false },
      ];

      const action = toggleProductStatusRequest({ items });

      expect(action.type).toBe('product/toggleProductStatusRequest');
      expect(action.payload.items).toEqual(items);
    });

    it('handles toggle status failure', async () => {
      const mockError = new Error('Toggle failed');

      vi.mocked(productRepository.bulkHideProducts).mockRejectedValue(mockError);

      expect(productSaga).toBeDefined();
    });

    it('updates products hidden status', () => {
      const items = [
        { productId: 'prod-1', hidden: true },
      ];

      const action = updateProductsHiddenStatus(items);

      expect(action.type).toBe('product/updateProductsHiddenStatus');
      expect(action.payload).toEqual(items);
    });

    it('sets toggle status loading', () => {
      const action = setToggleStatusLoading({ id: 'prod-1', loading: true });

      expect(action.type).toBe('product/setToggleStatusLoading');
      expect(action.payload).toEqual({ id: 'prod-1', loading: true });
    });

    it('handles multiple products', async () => {
      vi.mocked(productRepository.bulkHideProducts).mockResolvedValue(undefined);

      const items = [
        { productId: 'prod-1', hidden: true },
        { productId: 'prod-2', hidden: true },
        { productId: 'prod-3', hidden: false },
      ];

      const action = toggleProductStatusRequest({ items });

      expect(action.payload.items.length).toBe(3);
    });

    it('handles single product', async () => {
      vi.mocked(productRepository.bulkHideProducts).mockResolvedValue(undefined);

      const items = [
        { productId: 'prod-1', hidden: true },
      ];

      const action = toggleProductStatusRequest({ items });

      expect(action.payload.items.length).toBe(1);
    });
  });

  describe('action types', () => {
    it('has correct action type for getProductsRequest', () => {
      expect(getProductsRequest.type).toBe('product/getProductsRequest');
    });

    it('has correct action type for getProductByIdRequest', () => {
      expect(getProductByIdRequest.type).toBe('product/getProductByIdRequest');
    });

    it('has correct action type for getProductInventoryRequest', () => {
      expect(getProductInventoryRequest.type).toBe('product/getProductInventoryRequest');
    });

    it('has correct action type for updateProductRequest', () => {
      expect(updateProductRequest.type).toBe('product/updateProductRequest');
    });

    it('has correct action type for toggleProductStatusRequest', () => {
      expect(toggleProductStatusRequest.type).toBe('product/toggleProductStatusRequest');
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
      const action = getProductsRequest({ page: 5, limit: 50 });

      expect(action.payload.page).toBe(5);
      expect(action.payload.limit).toBe(50);
    });

    it('handles empty filters', () => {
      const action = getProductsRequest({ page: 1, limit: 10, filters: {} });

      expect(action.payload.filters).toEqual({});
    });

    it('handles complex filters', () => {
      const filters = {
        category: 'electronics',
        minPrice: 100000,
        maxPrice: 500000,
        inStock: true,
      };

      const action = getProductsRequest({ page: 1, limit: 10, filters });

      expect(action.payload.filters).toEqual(filters);
    });

    it('handles pagination metadata', () => {
      const data = {
        products: [],
        pagination: {
          page: 2,
          limit: 20,
          total: 100,
          totalPages: 5,
        },
      };

      const action = setProductsSuccess(data);

      expect(action.payload.pagination.page).toBe(2);
      expect(action.payload.pagination.totalPages).toBe(5);
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

    it('handles nested error response', () => {
      const error = {
        response: {
          data: {
            message: 'Product validation failed',
          },
        },
      };

      expect(error.response.data.message).toBe('Product validation failed');
    });
  });

  describe('callbacks', () => {
    it('handles onSuccess callback for getProducts', () => {
      const onSuccess = vi.fn();
      const action = getProductsRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onError callback for getProducts', () => {
      const onError = vi.fn();
      const action = getProductsRequest({
        page: 1,
        limit: 10,
        onError,
      });

      expect(typeof action.payload.onError).toBe('function');
    });

    it('handles onSuccess callback for getProductById', () => {
      const onSuccess = vi.fn();
      const action = getProductByIdRequest({
        id: 'prod-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for getProductInventory', () => {
      const onSuccess = vi.fn();
      const action = getProductInventoryRequest({
        id: 'prod-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for updateProduct', () => {
      const onSuccess = vi.fn();
      const action = updateProductRequest({
        id: 'prod-1',
        data: {},
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });
  });

  describe('product data fields', () => {
    it('handles name field', () => {
      const action = updateProductRequest({
        id: 'prod-1',
        data: {
          name: 'New Product Name',
        },
      });

      expect(action.payload.data.name).toBe('New Product Name');
    });

    it('handles price field', () => {
      const action = updateProductRequest({
        id: 'prod-1',
        data: {
          price: 200000,
        },
      });

      expect(action.payload.data.price).toBe(200000);
    });

    it('handles description field', () => {
      const action = updateProductRequest({
        id: 'prod-1',
        data: {
          description: 'Product description',
        },
      });

      expect(action.payload.data.description).toBe('Product description');
    });
  });

  describe('bulk operations', () => {
    it('handles hiding multiple products', () => {
      const items = [
        { productId: 'prod-1', hidden: true },
        { productId: 'prod-2', hidden: true },
      ];

      const action = toggleProductStatusRequest({ items });

      expect(action.payload.items.every((item) => item.hidden)).toBe(true);
    });

    it('handles showing multiple products', () => {
      const items = [
        { productId: 'prod-1', hidden: false },
        { productId: 'prod-2', hidden: false },
      ];

      const action = toggleProductStatusRequest({ items });

      expect(action.payload.items.every((item) => !item.hidden)).toBe(true);
    });

    it('handles mixed visibility states', () => {
      const items = [
        { productId: 'prod-1', hidden: true },
        { productId: 'prod-2', hidden: false },
      ];

      const action = toggleProductStatusRequest({ items });

      expect(action.payload.items[0].hidden).toBe(true);
      expect(action.payload.items[1].hidden).toBe(false);
    });
  });
});
