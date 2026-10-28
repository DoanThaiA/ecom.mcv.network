import { describe, it, expect, beforeEach } from 'vitest';
import {
  productSlice,
  setProductLoading,
  setProductsSuccess,
  setProductError,
  setCurrentProductLoading,
  setCurrentProductSuccess,
  setCurrentProductError,
  clearCurrentProduct,
  setInventoryLoading,
  setInventorySuccess,
  setInventoryError,
  setUpdateProductLoading,
  updateProductSuccess,
  clearProductError,
  setProductFilters,
  setProductSort,
  resetProductState,
  updateProductInList,
  updateProductsHiddenStatus,
  setToggleStatusLoading,
  getProductsRequest,
  getProductByIdRequest,
  getProductInventoryRequest,
  updateProductRequest,
  toggleProductStatusRequest,
  selectProducts,
  selectCurrentProduct,
  selectProductLoading,
  selectCurrentProductLoading,
  selectProductError,
  selectProductPagination,
  selectProductFilters,
  selectProductSort,
  selectProductInventory,
  selectInventoryLoading,
  selectUpdateProductLoading,
  selectToggleStatusLoading,
  type ProductState,
} from 'src/redux/store/productSlice';
import type { Product } from 'src/types/gen/shared/shared/products/product';
import type { GetInventoriesResponse } from 'src/types';

describe('productSlice', () => {
  const productReducer = productSlice.reducer;

  const initialState: ProductState = {
    products: [],
    currentProduct: null,
    currentProductInventory: null,
    loading: false,
    currentProductLoading: false,
    inventoryLoading: false,
    updateProductLoading: false,
    toggleStatusLoading: {},
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: { categoryIds: [], productIds: [] },
    sort: [],
  };

  const mockProduct: Product = {
    id: 'prod1',
    name: 'Product 1',
    price: 100,
    hide: false,
  } as Product;

  const mockProductList: Product[] = [
    mockProduct,
    {
      id: 'prod2',
      name: 'Product 2',
      price: 200,
      hide: true,
    } as Product,
  ];

  const mockInventory: GetInventoriesResponse = {
    items: [{ variantId: 'var1', quantity: 10 }],
  } as GetInventoriesResponse;

  beforeEach(() => {
    // Reset to initial state before each test
  });

  describe('reducers', () => {
    describe('setProductLoading', () => {
      it('sets loading to true and clears error', () => {
        const stateWithError: ProductState = {
          ...initialState,
          error: 'Previous error',
        };
        const state = productReducer(stateWithError, setProductLoading(true));
        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
      });

      it('sets loading to false without clearing error', () => {
        const stateWithError: ProductState = {
          ...initialState,
          loading: true,
          error: 'Some error',
        };
        const state = productReducer(stateWithError, setProductLoading(false));
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Some error');
      });
    });

    describe('setProductsSuccess', () => {
      it('sets products, pagination and clears loading and error', () => {
        const stateWithLoading: ProductState = {
          ...initialState,
          loading: true,
          error: 'Some error',
        };
        const state = productReducer(
          stateWithLoading,
          setProductsSuccess({
            products: mockProductList,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
          })
        );
        expect(state.products).toEqual(mockProductList);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
      });
    });

    describe('setProductError', () => {
      it('sets error and stops loading', () => {
        const stateWithLoading: ProductState = {
          ...initialState,
          loading: true,
        };
        const state = productReducer(stateWithLoading, setProductError('Failed to load'));
        expect(state.error).toBe('Failed to load');
        expect(state.loading).toBe(false);
      });
    });

    describe('setCurrentProductLoading', () => {
      it('sets current loading to true and clears error', () => {
        const stateWithError: ProductState = {
          ...initialState,
          error: 'Previous error',
        };
        const state = productReducer(stateWithError, setCurrentProductLoading(true));
        expect(state.currentProductLoading).toBe(true);
        expect(state.error).toBe(null);
      });

      it('sets current loading to false without clearing error', () => {
        const stateWithError: ProductState = {
          ...initialState,
          currentProductLoading: true,
          error: 'Some error',
        };
        const state = productReducer(stateWithError, setCurrentProductLoading(false));
        expect(state.currentProductLoading).toBe(false);
        expect(state.error).toBe('Some error');
      });
    });

    describe('setCurrentProductSuccess', () => {
      it('sets current product and clears loading and error', () => {
        const stateWithLoading: ProductState = {
          ...initialState,
          currentProductLoading: true,
          error: 'Some error',
        };
        const state = productReducer(stateWithLoading, setCurrentProductSuccess(mockProduct));
        expect(state.currentProduct).toEqual(mockProduct);
        expect(state.currentProductLoading).toBe(false);
        expect(state.error).toBe(null);
      });
    });

    describe('setCurrentProductError', () => {
      it('sets error and stops current loading', () => {
        const stateWithLoading: ProductState = {
          ...initialState,
          currentProductLoading: true,
        };
        const state = productReducer(stateWithLoading, setCurrentProductError('Failed to load'));
        expect(state.error).toBe('Failed to load');
        expect(state.currentProductLoading).toBe(false);
      });
    });

    describe('clearCurrentProduct', () => {
      it('clears current product and inventory', () => {
        const stateWithProduct: ProductState = {
          ...initialState,
          currentProduct: mockProduct,
          currentProductInventory: mockInventory,
        };
        const state = productReducer(stateWithProduct, clearCurrentProduct());
        expect(state.currentProduct).toBe(null);
        expect(state.currentProductInventory).toBe(null);
      });
    });

    describe('setInventoryLoading', () => {
      it('sets inventory loading to true and clears error', () => {
        const stateWithError: ProductState = {
          ...initialState,
          error: 'Previous error',
        };
        const state = productReducer(stateWithError, setInventoryLoading(true));
        expect(state.inventoryLoading).toBe(true);
        expect(state.error).toBe(null);
      });

      it('sets inventory loading to false without clearing error', () => {
        const stateWithError: ProductState = {
          ...initialState,
          inventoryLoading: true,
          error: 'Some error',
        };
        const state = productReducer(stateWithError, setInventoryLoading(false));
        expect(state.inventoryLoading).toBe(false);
        expect(state.error).toBe('Some error');
      });
    });

    describe('setInventorySuccess', () => {
      it('sets inventory and clears loading and error', () => {
        const stateWithLoading: ProductState = {
          ...initialState,
          inventoryLoading: true,
          error: 'Some error',
        };
        const state = productReducer(stateWithLoading, setInventorySuccess(mockInventory));
        expect(state.currentProductInventory).toEqual(mockInventory);
        expect(state.inventoryLoading).toBe(false);
        expect(state.error).toBe(null);
      });
    });

    describe('setInventoryError', () => {
      it('sets error and stops inventory loading', () => {
        const stateWithLoading: ProductState = {
          ...initialState,
          inventoryLoading: true,
        };
        const state = productReducer(stateWithLoading, setInventoryError('Failed to load'));
        expect(state.error).toBe('Failed to load');
        expect(state.inventoryLoading).toBe(false);
      });
    });

    describe('setUpdateProductLoading', () => {
      it('sets update loading to true', () => {
        const state = productReducer(initialState, setUpdateProductLoading(true));
        expect(state.updateProductLoading).toBe(true);
      });

      it('sets update loading to false', () => {
        const stateWithLoading: ProductState = {
          ...initialState,
          updateProductLoading: true,
        };
        const state = productReducer(stateWithLoading, setUpdateProductLoading(false));
        expect(state.updateProductLoading).toBe(false);
      });
    });

    describe('updateProductSuccess', () => {
      it('updates current product and stops loading', () => {
        const stateWithProduct: ProductState = {
          ...initialState,
          currentProduct: mockProduct,
          updateProductLoading: true,
        };
        const updatedProduct: Product = { ...mockProduct, name: 'Updated Product' };
        const state = productReducer(stateWithProduct, updateProductSuccess(updatedProduct));
        expect(state.currentProduct?.name).toBe('Updated Product');
        expect(state.updateProductLoading).toBe(false);
      });
    });

    describe('clearProductError', () => {
      it('clears error', () => {
        const stateWithError: ProductState = {
          ...initialState,
          error: 'Some error',
        };
        const state = productReducer(stateWithError, clearProductError());
        expect(state.error).toBe(null);
      });
    });

    describe('setProductFilters', () => {
      it('sets filter values', () => {
        const state = productReducer(
          initialState,
          setProductFilters({ categoryIds: ['cat1'], productIds: [] })
        );
        expect(state.filters).toEqual({ categoryIds: ['cat1'], productIds: [] });
      });

      it('replaces existing filters', () => {
        const stateWithFilters: ProductState = {
          ...initialState,
          filters: { categoryIds: ['cat1'], productIds: [] },
        };
        const state = productReducer(
          stateWithFilters,
          setProductFilters({ categoryIds: [], productIds: ['prod1'] })
        );
        expect(state.filters).toEqual({ categoryIds: [], productIds: ['prod1'] });
      });
    });

    describe('setProductSort', () => {
      it('sets sort values', () => {
        const state = productReducer(initialState, setProductSort([{ field: 'name', order: 1 }]));
        expect(state.sort).toEqual([{ field: 'name', order: 1 }]);
      });

      it('replaces existing sort', () => {
        const stateWithSort: ProductState = {
          ...initialState,
          sort: [{ field: 'name', order: 1 }],
        };
        const state = productReducer(
          stateWithSort,
          setProductSort([{ field: 'price', order: -1 }])
        );
        expect(state.sort).toEqual([{ field: 'price', order: -1 }]);
      });

      it('sets sort to empty array', () => {
        const stateWithSort: ProductState = {
          ...initialState,
          sort: [{ field: 'name', order: 1 }],
        };
        const state = productReducer(stateWithSort, setProductSort([]));
        expect(state.sort).toEqual([]);
      });
    });

    describe('resetProductState', () => {
      it('resets products, loading, error, pagination, filters, and sort', () => {
        const stateWithData: ProductState = {
          ...initialState,
          products: mockProductList,
          loading: true,
          error: 'Some error',
          pagination: { page: 5, limit: 20, total: 100, totalPages: 5 },
          filters: { categoryIds: ['cat1'], productIds: [] },
          sort: [{ field: 'name', order: 1 }],
          currentProduct: mockProduct,
        };
        const state = productReducer(stateWithData, resetProductState());
        expect(state.products).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
        expect(state.filters).toEqual({ categoryIds: [], productIds: [] });
        expect(state.sort).toEqual([]);
      });

      it('does not reset current product and other loading states', () => {
        const stateWithData: ProductState = {
          ...initialState,
          currentProduct: mockProduct,
          currentProductInventory: mockInventory,
          currentProductLoading: true,
          inventoryLoading: true,
          updateProductLoading: true,
        };
        const state = productReducer(stateWithData, resetProductState());
        expect(state.currentProduct).toEqual(mockProduct);
        expect(state.currentProductInventory).toEqual(mockInventory);
        expect(state.currentProductLoading).toBe(true);
        expect(state.inventoryLoading).toBe(true);
        expect(state.updateProductLoading).toBe(true);
      });
    });

    describe('updateProductInList', () => {
      it('updates product in list', () => {
        const stateWithProducts: ProductState = {
          ...initialState,
          products: mockProductList,
        };
        const updatedProduct: Product = { ...mockProduct, name: 'Updated Product' };
        const state = productReducer(stateWithProducts, updateProductInList(updatedProduct));
        expect(state.products[0].name).toBe('Updated Product');
      });

      it('does not update if product not in list', () => {
        const stateWithProducts: ProductState = {
          ...initialState,
          products: [mockProductList[1]],
        };
        const updatedProduct: Product = { ...mockProduct, name: 'Updated Product' };
        const state = productReducer(stateWithProducts, updateProductInList(updatedProduct));
        expect(state.products).toEqual([mockProductList[1]]);
      });
    });

    describe('updateProductsHiddenStatus', () => {
      it('updates multiple products hidden status', () => {
        const stateWithProducts: ProductState = {
          ...initialState,
          products: mockProductList,
        };
        const state = productReducer(
          stateWithProducts,
          updateProductsHiddenStatus([
            { productId: 'prod1', hide: true },
            { productId: 'prod2', hide: false },
          ])
        );
        expect(state.products[0].hide).toBe(true);
        expect(state.products[1].hide).toBe(false);
      });

      it('updates only matching products', () => {
        const stateWithProducts: ProductState = {
          ...initialState,
          products: mockProductList,
        };
        const state = productReducer(
          stateWithProducts,
          updateProductsHiddenStatus([{ productId: 'prod1', hide: true }])
        );
        expect(state.products[0].hide).toBe(true);
        expect(state.products[1].hide).toBe(true); // unchanged
      });

      it('does not update if product not in list', () => {
        const stateWithProducts: ProductState = {
          ...initialState,
          products: mockProductList,
        };
        const state = productReducer(
          stateWithProducts,
          updateProductsHiddenStatus([{ productId: 'prod3', hide: true }])
        );
        expect(state.products).toEqual(mockProductList);
      });
    });

    describe('setToggleStatusLoading', () => {
      it('adds loading state for product', () => {
        const state = productReducer(
          initialState,
          setToggleStatusLoading({ id: 'prod1', loading: true })
        );
        expect(state.toggleStatusLoading['prod1']).toBe(true);
      });

      it('removes loading state for product', () => {
        const stateWithLoading: ProductState = {
          ...initialState,
          toggleStatusLoading: { prod1: true },
        };
        const state = productReducer(
          stateWithLoading,
          setToggleStatusLoading({ id: 'prod1', loading: false })
        );
        expect(state.toggleStatusLoading['prod1']).toBeUndefined();
      });

      it('tracks multiple products independently', () => {
        let state = productReducer(
          initialState,
          setToggleStatusLoading({ id: 'prod1', loading: true })
        );
        state = productReducer(state, setToggleStatusLoading({ id: 'prod2', loading: true }));
        expect(state.toggleStatusLoading['prod1']).toBe(true);
        expect(state.toggleStatusLoading['prod2']).toBe(true);

        state = productReducer(state, setToggleStatusLoading({ id: 'prod1', loading: false }));
        expect(state.toggleStatusLoading['prod1']).toBeUndefined();
        expect(state.toggleStatusLoading['prod2']).toBe(true);
      });
    });
  });

  describe('saga actions', () => {
    describe('getProductsRequest', () => {
      it('creates correct action type', () => {
        const action = getProductsRequest({
          page: 1,
          limit: 10,
        });
        expect(action.type).toBe('product/getProductsRequest');
      });

      it('includes pagination in payload', () => {
        const action = getProductsRequest({
          page: 2,
          limit: 20,
        });
        expect(action.payload.page).toBe(2);
        expect(action.payload.limit).toBe(20);
      });

      it('includes filters in payload', () => {
        const action = getProductsRequest({
          filters: { categoryIds: ['cat1'], productIds: [] },
        });
        expect(action.payload.filters).toEqual({ categoryIds: ['cat1'], productIds: [] });
      });

      it('includes sort in payload', () => {
        const action = getProductsRequest({
          sort: [{ field: 'name', order: 1 }],
        });
        expect(action.payload.sort).toEqual([{ field: 'name', order: 1 }]);
      });

      it('includes callbacks', () => {
        const onSuccess = () => {};
        const onError = () => {};
        const action = getProductsRequest({ onSuccess, onError });
        expect(action.payload.onSuccess).toBe(onSuccess);
        expect(action.payload.onError).toBe(onError);
      });
    });

    describe('getProductByIdRequest', () => {
      it('creates correct action type', () => {
        const action = getProductByIdRequest({ id: 'prod1' });
        expect(action.type).toBe('product/getProductByIdRequest');
      });

      it('includes id in payload', () => {
        const action = getProductByIdRequest({ id: 'prod1' });
        expect(action.payload.id).toBe('prod1');
      });

      it('includes callbacks', () => {
        const onSuccess = () => {};
        const onError = () => {};
        const action = getProductByIdRequest({ id: 'prod1', onSuccess, onError });
        expect(action.payload.onSuccess).toBe(onSuccess);
        expect(action.payload.onError).toBe(onError);
      });
    });

    describe('getProductInventoryRequest', () => {
      it('creates correct action type', () => {
        const action = getProductInventoryRequest({ id: 'prod1' });
        expect(action.type).toBe('product/getProductInventoryRequest');
      });

      it('includes id in payload', () => {
        const action = getProductInventoryRequest({ id: 'prod1' });
        expect(action.payload.id).toBe('prod1');
      });

      it('includes callbacks', () => {
        const onSuccess = () => {};
        const onError = () => {};
        const action = getProductInventoryRequest({ id: 'prod1', onSuccess, onError });
        expect(action.payload.onSuccess).toBe(onSuccess);
        expect(action.payload.onError).toBe(onError);
      });
    });

    describe('updateProductRequest', () => {
      it('creates correct action type', () => {
        const action = updateProductRequest({
          productId: 'prod1',
          data: { name: 'Updated' },
        } as any);
        expect(action.type).toBe('product/updateProductRequest');
      });

      it('includes data in payload', () => {
        const payload = { productId: 'prod1', data: { name: 'Updated' } } as any;
        const action = updateProductRequest(payload);
        expect(action.payload).toEqual(payload);
      });
    });

    describe('toggleProductStatusRequest', () => {
      it('creates correct action type', () => {
        const action = toggleProductStatusRequest({
          items: [{ productId: 'prod1', hide: true }],
        });
        expect(action.type).toBe('product/toggleProductStatusRequest');
      });

      it('includes items in payload', () => {
        const items = [
          { productId: 'prod1', hide: true },
          { productId: 'prod2', hide: false },
        ];
        const action = toggleProductStatusRequest({ items });
        expect(action.payload.items).toEqual(items);
      });
    });
  });

  describe('selectors', () => {
    describe('selectProducts', () => {
      it('returns empty array for initial state', () => {
        expect(selectProducts({ product: initialState })).toEqual([]);
      });

      it('returns products when present', () => {
        const state: ProductState = { ...initialState, products: mockProductList };
        expect(selectProducts({ product: state })).toEqual(mockProductList);
      });
    });

    describe('selectCurrentProduct', () => {
      it('returns null for initial state', () => {
        expect(selectCurrentProduct({ product: initialState })).toBe(null);
      });

      it('returns current product when present', () => {
        const state: ProductState = { ...initialState, currentProduct: mockProduct };
        expect(selectCurrentProduct({ product: state })).toEqual(mockProduct);
      });
    });

    describe('selectProductLoading', () => {
      it('returns false for initial state', () => {
        expect(selectProductLoading({ product: initialState })).toBe(false);
      });

      it('returns true when loading', () => {
        const state: ProductState = { ...initialState, loading: true };
        expect(selectProductLoading({ product: state })).toBe(true);
      });
    });

    describe('selectCurrentProductLoading', () => {
      it('returns false for initial state', () => {
        expect(selectCurrentProductLoading({ product: initialState })).toBe(false);
      });

      it('returns true when loading current', () => {
        const state: ProductState = { ...initialState, currentProductLoading: true };
        expect(selectCurrentProductLoading({ product: state })).toBe(true);
      });
    });

    describe('selectProductError', () => {
      it('returns null for initial state', () => {
        expect(selectProductError({ product: initialState })).toBe(null);
      });

      it('returns error when present', () => {
        const state: ProductState = { ...initialState, error: 'Some error' };
        expect(selectProductError({ product: state })).toBe('Some error');
      });
    });

    describe('selectProductPagination', () => {
      it('returns initial pagination for initial state', () => {
        expect(selectProductPagination({ product: initialState })).toEqual({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      });

      it('returns current pagination', () => {
        const state: ProductState = {
          ...initialState,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        };
        expect(selectProductPagination({ product: state })).toEqual({
          page: 2,
          limit: 20,
          total: 100,
          totalPages: 5,
        });
      });
    });

    describe('selectProductFilters', () => {
      it('returns default filters for initial state', () => {
        expect(selectProductFilters({ product: initialState })).toEqual({
          categoryIds: [],
          productIds: [],
        });
      });

      it('returns current filters', () => {
        const state: ProductState = {
          ...initialState,
          filters: { categoryIds: ['cat1'], productIds: [] },
        };
        expect(selectProductFilters({ product: state })).toEqual({
          categoryIds: ['cat1'],
          productIds: [],
        });
      });
    });

    describe('selectProductSort', () => {
      it('returns empty array for initial state', () => {
        expect(selectProductSort({ product: initialState })).toEqual([]);
      });

      it('returns current sort', () => {
        const state: ProductState = {
          ...initialState,
          sort: [{ field: 'name', order: 1 }],
        };
        expect(selectProductSort({ product: state })).toEqual([{ field: 'name', order: 1 }]);
      });
    });

    describe('selectProductInventory', () => {
      it('returns null for initial state', () => {
        expect(selectProductInventory({ product: initialState })).toBe(null);
      });

      it('returns current inventory when present', () => {
        const state: ProductState = { ...initialState, currentProductInventory: mockInventory };
        expect(selectProductInventory({ product: state })).toEqual(mockInventory);
      });
    });

    describe('selectInventoryLoading', () => {
      it('returns false for initial state', () => {
        expect(selectInventoryLoading({ product: initialState })).toBe(false);
      });

      it('returns true when loading inventory', () => {
        const state: ProductState = { ...initialState, inventoryLoading: true };
        expect(selectInventoryLoading({ product: state })).toBe(true);
      });
    });

    describe('selectUpdateProductLoading', () => {
      it('returns false for initial state', () => {
        expect(selectUpdateProductLoading({ product: initialState })).toBe(false);
      });

      it('returns true when updating', () => {
        const state: ProductState = { ...initialState, updateProductLoading: true };
        expect(selectUpdateProductLoading({ product: state })).toBe(true);
      });
    });

    describe('selectToggleStatusLoading', () => {
      it('returns empty object for initial state', () => {
        expect(selectToggleStatusLoading({ product: initialState })).toEqual({});
      });

      it('returns current toggle status loading', () => {
        const state: ProductState = {
          ...initialState,
          toggleStatusLoading: { prod1: true, prod2: true },
        };
        expect(selectToggleStatusLoading({ product: state })).toEqual({
          prod1: true,
          prod2: true,
        });
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete product fetch with inventory flow', () => {
      // Fetch product list
      let state = productReducer(initialState, setProductLoading(true));
      state = productReducer(
        state,
        setProductsSuccess({
          products: mockProductList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );
      expect(selectProducts({ product: state })).toEqual(mockProductList);
      expect(selectProductLoading({ product: state })).toBe(false);

      // Fetch single product
      state = productReducer(state, setCurrentProductLoading(true));
      state = productReducer(state, setCurrentProductSuccess(mockProduct));
      expect(selectCurrentProduct({ product: state })).toEqual(mockProduct);

      // Fetch inventory
      state = productReducer(state, setInventoryLoading(true));
      state = productReducer(state, setInventorySuccess(mockInventory));
      expect(selectProductInventory({ product: state })).toEqual(mockInventory);
      expect(selectInventoryLoading({ product: state })).toBe(false);
    });

    it('handles bulk status toggle flow', () => {
      let state = productReducer(
        initialState,
        setProductsSuccess({
          products: mockProductList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );

      // Start toggle for multiple products
      state = productReducer(state, setToggleStatusLoading({ id: 'prod1', loading: true }));
      state = productReducer(state, setToggleStatusLoading({ id: 'prod2', loading: true }));
      expect(selectToggleStatusLoading({ product: state })).toEqual({ prod1: true, prod2: true });

      // Update status
      state = productReducer(
        state,
        updateProductsHiddenStatus([
          { productId: 'prod1', hide: true },
          { productId: 'prod2', hide: false },
        ])
      );
      expect(selectProducts({ product: state })[0].hide).toBe(true);
      expect(selectProducts({ product: state })[1].hide).toBe(false);

      // Stop toggle loading
      state = productReducer(state, setToggleStatusLoading({ id: 'prod1', loading: false }));
      state = productReducer(state, setToggleStatusLoading({ id: 'prod2', loading: false }));
      expect(selectToggleStatusLoading({ product: state })).toEqual({});
    });

    it('handles independent loading states', () => {
      let state = productReducer(initialState, setProductLoading(true));
      state = productReducer(state, setCurrentProductLoading(true));
      state = productReducer(state, setInventoryLoading(true));
      state = productReducer(state, setUpdateProductLoading(true));

      expect(state.loading).toBe(true);
      expect(state.currentProductLoading).toBe(true);
      expect(state.inventoryLoading).toBe(true);
      expect(state.updateProductLoading).toBe(true);

      // Each can be stopped independently
      state = productReducer(state, setProductLoading(false));
      expect(state.loading).toBe(false);
      expect(state.currentProductLoading).toBe(true);
    });

    it('handles error clearing flow', () => {
      let state = productReducer(initialState, setProductLoading(true));
      state = productReducer(state, setProductError('Failed to load'));
      expect(selectProductError({ product: state })).toBe('Failed to load');

      // Error cleared when starting new loading
      state = productReducer(state, setProductLoading(true));
      expect(selectProductError({ product: state })).toBe(null);
    });

    it('handles reset flow', () => {
      let state = productReducer(
        initialState,
        setProductsSuccess({
          products: mockProductList,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        })
      );
      state = productReducer(state, setProductFilters({ categoryIds: ['cat1'], productIds: [] }));
      state = productReducer(state, setProductSort([{ field: 'name', order: 1 }]));

      state = productReducer(state, resetProductState());
      expect(selectProducts({ product: state })).toEqual([]);
      expect(selectProductPagination({ product: state })).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      expect(selectProductFilters({ product: state })).toEqual({ categoryIds: [], productIds: [] });
      expect(selectProductSort({ product: state })).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = productReducer(initialState, { type: 'UNKNOWN_ACTION' } as any);
      expect(state).toEqual(initialState);
    });

    it('clears both product and inventory when clearing current product', () => {
      const state = productReducer(
        {
          ...initialState,
          currentProduct: mockProduct,
          currentProductInventory: mockInventory,
        },
        clearCurrentProduct()
      );
      expect(state.currentProduct).toBe(null);
      expect(state.currentProductInventory).toBe(null);
    });

    it('handles empty bulk status update', () => {
      const state = productReducer(
        { ...initialState, products: mockProductList },
        updateProductsHiddenStatus([])
      );
      expect(state.products).toEqual(mockProductList);
    });

    it('handles update product in empty list', () => {
      const state = productReducer(
        initialState,
        updateProductInList({ ...mockProduct, name: 'Updated' })
      );
      expect(state.products).toEqual([]);
    });
  });
});
