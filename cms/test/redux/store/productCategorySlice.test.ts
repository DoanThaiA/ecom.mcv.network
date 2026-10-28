import { describe, it, expect } from 'vitest';

import productCategoryReducer, {
  setProductCategoryLoading,
  setProductCategoriesSuccess,
  setProductCategoryFailure,
  setCurrentProductCategoryLoading,
  setCurrentProductCategorySuccess,
  setCurrentProductCategoryFailure,
  clearCurrentProductCategory,
  setProductCategoryFilters,
  setProductCategorySort,
  resetProductCategoryState,
  getProductCategoriesRequest,
  getProductCategoryByIdRequest,
  selectProductCategories,
  selectCurrentProductCategory,
  selectProductCategoryLoading,
  selectCurrentProductCategoryLoading,
  selectProductCategoryFilters,
  selectProductCategorySort,
  type ProductCategoryState,
} from 'src/redux/store/productCategorySlice';
import type { ProductCategory } from 'src/types/gen/shared/shared/product-categories/product-category';

describe('productCategorySlice', () => {
  const initialState: ProductCategoryState = {
    productCategories: [],
    currentProductCategory: null,
    loading: false,
    currentProductCategoryLoading: false,
    filters: {},
    sort: [],
  };

  const mockCategory: ProductCategory = {
    id: 'cat-1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices',
    image: 'https://example.com/electronics.jpg',
    parentId: null,
    order: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockCategories: ProductCategory[] = [
    mockCategory,
    {
      id: 'cat-2',
      name: 'Clothing',
      slug: 'clothing',
      description: 'Apparel and accessories',
      image: 'https://example.com/clothing.jpg',
      parentId: null,
      order: 2,
      isActive: true,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 'cat-3',
      name: 'Books',
      slug: 'books',
      description: 'Books and magazines',
      image: 'https://example.com/books.jpg',
      parentId: null,
      order: 3,
      isActive: false,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    },
  ];

  describe('reducers', () => {
    describe('setProductCategoryLoading', () => {
      it('sets loading to true', () => {
        const state = productCategoryReducer(initialState, setProductCategoryLoading(true));

        expect(state.loading).toBe(true);
      });

      it('sets loading to false', () => {
        const loadingState: ProductCategoryState = {
          ...initialState,
          loading: true,
        };

        const state = productCategoryReducer(loadingState, setProductCategoryLoading(false));

        expect(state.loading).toBe(false);
      });

      it('does not affect other state properties', () => {
        const stateWithData: ProductCategoryState = {
          ...initialState,
          productCategories: mockCategories,
          currentProductCategory: mockCategory,
        };

        const state = productCategoryReducer(stateWithData, setProductCategoryLoading(true));

        expect(state.productCategories).toEqual(mockCategories);
        expect(state.currentProductCategory).toEqual(mockCategory);
      });
    });

    describe('setProductCategoriesSuccess', () => {
      it('sets categories and stops loading', () => {
        const loadingState: ProductCategoryState = {
          ...initialState,
          loading: true,
        };

        const state = productCategoryReducer(
          loadingState,
          setProductCategoriesSuccess({ productCategories: mockCategories })
        );

        expect(state.productCategories).toEqual(mockCategories);
        expect(state.loading).toBe(false);
      });

      it('replaces existing categories', () => {
        const stateWithData: ProductCategoryState = {
          ...initialState,
          productCategories: mockCategories,
        };

        const newCategories: ProductCategory[] = [
          {
            id: 'cat-4',
            name: 'Sports',
            slug: 'sports',
            description: 'Sports equipment',
            image: 'https://example.com/sports.jpg',
            parentId: null,
            order: 4,
            isActive: true,
            createdAt: '2024-01-04T00:00:00Z',
            updatedAt: '2024-01-04T00:00:00Z',
          },
        ];

        const state = productCategoryReducer(
          stateWithData,
          setProductCategoriesSuccess({ productCategories: newCategories })
        );

        expect(state.productCategories).toEqual(newCategories);
        expect(state.productCategories).not.toEqual(mockCategories);
      });

      it('handles empty categories array', () => {
        const state = productCategoryReducer(
          initialState,
          setProductCategoriesSuccess({ productCategories: [] })
        );

        expect(state.productCategories).toEqual([]);
        expect(state.loading).toBe(false);
      });
    });

    describe('setProductCategoryFailure', () => {
      it('stops loading', () => {
        const loadingState: ProductCategoryState = {
          ...initialState,
          loading: true,
        };

        const state = productCategoryReducer(loadingState, setProductCategoryFailure());

        expect(state.loading).toBe(false);
      });

      it('does not affect categories', () => {
        const stateWithData: ProductCategoryState = {
          ...initialState,
          loading: true,
          productCategories: mockCategories,
        };

        const state = productCategoryReducer(stateWithData, setProductCategoryFailure());

        expect(state.productCategories).toEqual(mockCategories);
      });
    });

    describe('setCurrentProductCategoryLoading', () => {
      it('sets current loading to true', () => {
        const state = productCategoryReducer(
          initialState,
          setCurrentProductCategoryLoading(true)
        );

        expect(state.currentProductCategoryLoading).toBe(true);
      });

      it('sets current loading to false', () => {
        const loadingState: ProductCategoryState = {
          ...initialState,
          currentProductCategoryLoading: true,
        };

        const state = productCategoryReducer(
          loadingState,
          setCurrentProductCategoryLoading(false)
        );

        expect(state.currentProductCategoryLoading).toBe(false);
      });

      it('does not affect list loading', () => {
        const state = productCategoryReducer(
          initialState,
          setCurrentProductCategoryLoading(true)
        );

        expect(state.loading).toBe(false);
      });
    });

    describe('setCurrentProductCategorySuccess', () => {
      it('sets current category and stops loading', () => {
        const loadingState: ProductCategoryState = {
          ...initialState,
          currentProductCategoryLoading: true,
        };

        const state = productCategoryReducer(
          loadingState,
          setCurrentProductCategorySuccess(mockCategory)
        );

        expect(state.currentProductCategory).toEqual(mockCategory);
        expect(state.currentProductCategoryLoading).toBe(false);
      });

      it('replaces existing current category', () => {
        const stateWithCurrent: ProductCategoryState = {
          ...initialState,
          currentProductCategory: mockCategory,
        };

        const newCategory: ProductCategory = {
          ...mockCategory,
          id: 'cat-2',
          name: 'New Category',
        };

        const state = productCategoryReducer(
          stateWithCurrent,
          setCurrentProductCategorySuccess(newCategory)
        );

        expect(state.currentProductCategory).toEqual(newCategory);
        expect(state.currentProductCategory).not.toEqual(mockCategory);
      });
    });

    describe('setCurrentProductCategoryFailure', () => {
      it('stops current loading', () => {
        const loadingState: ProductCategoryState = {
          ...initialState,
          currentProductCategoryLoading: true,
        };

        const state = productCategoryReducer(
          loadingState,
          setCurrentProductCategoryFailure()
        );

        expect(state.currentProductCategoryLoading).toBe(false);
      });

      it('does not affect current category', () => {
        const stateWithCurrent: ProductCategoryState = {
          ...initialState,
          currentProductCategoryLoading: true,
          currentProductCategory: mockCategory,
        };

        const state = productCategoryReducer(
          stateWithCurrent,
          setCurrentProductCategoryFailure()
        );

        expect(state.currentProductCategory).toEqual(mockCategory);
      });
    });

    describe('clearCurrentProductCategory', () => {
      it('clears current category', () => {
        const stateWithCurrent: ProductCategoryState = {
          ...initialState,
          currentProductCategory: mockCategory,
        };

        const state = productCategoryReducer(stateWithCurrent, clearCurrentProductCategory());

        expect(state.currentProductCategory).toBe(null);
      });

      it('does not affect other state', () => {
        const stateWithData: ProductCategoryState = {
          ...initialState,
          productCategories: mockCategories,
          currentProductCategory: mockCategory,
          loading: true,
        };

        const state = productCategoryReducer(stateWithData, clearCurrentProductCategory());

        expect(state.productCategories).toEqual(mockCategories);
        expect(state.loading).toBe(true);
      });

      it('works when current category is already null', () => {
        const state = productCategoryReducer(initialState, clearCurrentProductCategory());

        expect(state.currentProductCategory).toBe(null);
      });
    });

    describe('setProductCategoryFilters', () => {
      it('sets filter values', () => {
        const filters = {
          isActive: true,
          parentId: 'parent-1',
        };

        const state = productCategoryReducer(
          initialState,
          setProductCategoryFilters(filters)
        );

        expect(state.filters).toEqual(filters);
      });

      it('replaces existing filters', () => {
        const stateWithFilters: ProductCategoryState = {
          ...initialState,
          filters: {
            isActive: true,
          },
        };

        const newFilters = {
          parentId: 'parent-2',
        };

        const state = productCategoryReducer(
          stateWithFilters,
          setProductCategoryFilters(newFilters)
        );

        expect(state.filters).toEqual(newFilters);
      });

      it('handles empty filters', () => {
        const state = productCategoryReducer(initialState, setProductCategoryFilters({}));

        expect(state.filters).toEqual({});
      });
    });

    describe('setProductCategorySort', () => {
      it('sets sort values', () => {
        const sort = [{ field: 'name', order: 1 }];

        const state = productCategoryReducer(initialState, setProductCategorySort(sort));

        expect(state.sort).toEqual(sort);
      });

      it('replaces existing sort', () => {
        const stateWithSort: ProductCategoryState = {
          ...initialState,
          sort: [{ field: 'createdAt', order: -1 }],
        };

        const newSort = [{ field: 'order', order: 1 }];

        const state = productCategoryReducer(stateWithSort, setProductCategorySort(newSort));

        expect(state.sort).toEqual(newSort);
      });

      it('handles empty sort array', () => {
        const state = productCategoryReducer(initialState, setProductCategorySort([]));

        expect(state.sort).toEqual([]);
      });

      it('handles multiple sort fields', () => {
        const sort = [
          { field: 'order', order: 1 },
          { field: 'name', order: 1 },
        ];

        const state = productCategoryReducer(initialState, setProductCategorySort(sort));

        expect(state.sort).toHaveLength(2);
        expect(state.sort).toEqual(sort);
      });
    });

    describe('resetProductCategoryState', () => {
      it('resets categories, loading, filters, and sort', () => {
        const activeState: ProductCategoryState = {
          productCategories: mockCategories,
          currentProductCategory: mockCategory,
          loading: true,
          currentProductCategoryLoading: true,
          filters: { isActive: true },
          sort: [{ field: 'name', order: 1 }],
        };

        const state = productCategoryReducer(activeState, resetProductCategoryState());

        expect(state.productCategories).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.filters).toEqual({});
        expect(state.sort).toEqual([]);
      });

      it('does not reset current category', () => {
        const activeState: ProductCategoryState = {
          ...initialState,
          productCategories: mockCategories,
          currentProductCategory: mockCategory,
        };

        const state = productCategoryReducer(activeState, resetProductCategoryState());

        expect(state.currentProductCategory).toEqual(mockCategory);
      });

      it('does not reset current loading', () => {
        const activeState: ProductCategoryState = {
          ...initialState,
          currentProductCategoryLoading: true,
        };

        const state = productCategoryReducer(activeState, resetProductCategoryState());

        expect(state.currentProductCategoryLoading).toBe(true);
      });
    });
  });

  describe('saga actions', () => {
    describe('getProductCategoriesRequest', () => {
      it('creates correct action type', () => {
        const action = getProductCategoriesRequest({});

        expect(action.type).toBe('productCategory/getProductCategoriesRequest');
      });

      it('includes pagination in payload', () => {
        const payload = {
          page: 2,
          limit: 20,
        };

        const action = getProductCategoriesRequest(payload);

        expect(action.payload).toEqual(payload);
      });

      it('includes filters in payload', () => {
        const payload = {
          filters: {
            isActive: true,
            parentId: 'parent-1',
          },
        };

        const action = getProductCategoriesRequest(payload);

        expect(action.payload.filters).toEqual(payload.filters);
      });

      it('includes sort in payload', () => {
        const payload = {
          sort: [{ field: 'name', order: 1 }],
        };

        const action = getProductCategoriesRequest(payload);

        expect(action.payload.sort).toEqual(payload.sort);
      });

      it('handles empty payload', () => {
        const action = getProductCategoriesRequest({});

        expect(action.payload).toEqual({});
      });
    });

    describe('getProductCategoryByIdRequest', () => {
      it('creates correct action type', () => {
        const action = getProductCategoryByIdRequest({ id: 'cat-1' });

        expect(action.type).toBe('productCategory/getProductCategoryByIdRequest');
      });

      it('includes id in payload', () => {
        const action = getProductCategoryByIdRequest({ id: 'cat-123' });

        expect(action.payload.id).toBe('cat-123');
      });
    });
  });

  describe('selectors', () => {
    describe('selectProductCategories', () => {
      it('returns empty array for initial state', () => {
        const state = { productCategory: initialState };

        const categories = selectProductCategories(state);

        expect(categories).toEqual([]);
      });

      it('returns categories when present', () => {
        const state = {
          productCategory: {
            ...initialState,
            productCategories: mockCategories,
          },
        };

        const categories = selectProductCategories(state);

        expect(categories).toEqual(mockCategories);
        expect(categories).toHaveLength(3);
      });
    });

    describe('selectCurrentProductCategory', () => {
      it('returns null for initial state', () => {
        const state = { productCategory: initialState };

        const current = selectCurrentProductCategory(state);

        expect(current).toBe(null);
      });

      it('returns current category when present', () => {
        const state = {
          productCategory: {
            ...initialState,
            currentProductCategory: mockCategory,
          },
        };

        const current = selectCurrentProductCategory(state);

        expect(current).toEqual(mockCategory);
      });
    });

    describe('selectProductCategoryLoading', () => {
      it('returns false for initial state', () => {
        const state = { productCategory: initialState };

        const loading = selectProductCategoryLoading(state);

        expect(loading).toBe(false);
      });

      it('returns true when loading', () => {
        const state = {
          productCategory: {
            ...initialState,
            loading: true,
          },
        };

        const loading = selectProductCategoryLoading(state);

        expect(loading).toBe(true);
      });
    });

    describe('selectCurrentProductCategoryLoading', () => {
      it('returns false for initial state', () => {
        const state = { productCategory: initialState };

        const loading = selectCurrentProductCategoryLoading(state);

        expect(loading).toBe(false);
      });

      it('returns true when loading current', () => {
        const state = {
          productCategory: {
            ...initialState,
            currentProductCategoryLoading: true,
          },
        };

        const loading = selectCurrentProductCategoryLoading(state);

        expect(loading).toBe(true);
      });
    });

    describe('selectProductCategoryFilters', () => {
      it('returns empty object for initial state', () => {
        const state = { productCategory: initialState };

        const filters = selectProductCategoryFilters(state);

        expect(filters).toEqual({});
      });

      it('returns current filters', () => {
        const customFilters = {
          isActive: true,
          parentId: 'parent-1',
        };

        const state = {
          productCategory: {
            ...initialState,
            filters: customFilters,
          },
        };

        const filters = selectProductCategoryFilters(state);

        expect(filters).toEqual(customFilters);
      });
    });

    describe('selectProductCategorySort', () => {
      it('returns empty array for initial state', () => {
        const state = { productCategory: initialState };

        const sort = selectProductCategorySort(state);

        expect(sort).toEqual([]);
      });

      it('returns current sort', () => {
        const customSort = [
          { field: 'name', order: 1 },
          { field: 'order', order: 1 },
        ];

        const state = {
          productCategory: {
            ...initialState,
            sort: customSort,
          },
        };

        const sort = selectProductCategorySort(state);

        expect(sort).toEqual(customSort);
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete category list fetch flow', () => {
      // Start: Initial state
      let state = initialState;
      expect(selectProductCategories({ productCategory: state })).toEqual([]);
      expect(selectProductCategoryLoading({ productCategory: state })).toBe(false);

      // Step 1: Start loading
      state = productCategoryReducer(state, setProductCategoryLoading(true));
      expect(selectProductCategoryLoading({ productCategory: state })).toBe(true);

      // Step 2: Receive data
      state = productCategoryReducer(
        state,
        setProductCategoriesSuccess({ productCategories: mockCategories })
      );
      expect(selectProductCategories({ productCategory: state })).toEqual(mockCategories);
      expect(selectProductCategoryLoading({ productCategory: state })).toBe(false);
    });

    it('handles category detail fetch flow', () => {
      // Start loading current
      let state = productCategoryReducer(
        initialState,
        setCurrentProductCategoryLoading(true)
      );
      expect(selectCurrentProductCategoryLoading({ productCategory: state })).toBe(true);

      // Receive current category
      state = productCategoryReducer(state, setCurrentProductCategorySuccess(mockCategory));
      expect(selectCurrentProductCategory({ productCategory: state })).toEqual(mockCategory);
      expect(selectCurrentProductCategoryLoading({ productCategory: state })).toBe(false);
    });

    it('handles filter and sort flow', () => {
      // Set filters
      let state = productCategoryReducer(
        initialState,
        setProductCategoryFilters({ isActive: true })
      );
      expect(selectProductCategoryFilters({ productCategory: state }).isActive).toBe(true);

      // Set sort
      state = productCategoryReducer(
        state,
        setProductCategorySort([{ field: 'name', order: 1 }])
      );
      expect(selectProductCategorySort({ productCategory: state })).toHaveLength(1);

      // Reload with filters and sort
      state = productCategoryReducer(state, setProductCategoryLoading(true));
      state = productCategoryReducer(
        state,
        setProductCategoriesSuccess({
          productCategories: mockCategories.filter((c) => c.isActive),
        })
      );

      expect(selectProductCategories({ productCategory: state })).toHaveLength(2);
    });

    it('handles category navigation flow', () => {
      // View first category
      let state = productCategoryReducer(
        initialState,
        setCurrentProductCategorySuccess(mockCategories[0])
      );
      expect(selectCurrentProductCategory({ productCategory: state })?.id).toBe('cat-1');

      // View second category
      state = productCategoryReducer(
        state,
        setCurrentProductCategorySuccess(mockCategories[1])
      );
      expect(selectCurrentProductCategory({ productCategory: state })?.id).toBe('cat-2');

      // Clear current
      state = productCategoryReducer(state, clearCurrentProductCategory());
      expect(selectCurrentProductCategory({ productCategory: state })).toBe(null);
    });

    it('handles reset flow', () => {
      // Setup: Active state
      let state: ProductCategoryState = {
        productCategories: mockCategories,
        currentProductCategory: mockCategory,
        loading: false,
        currentProductCategoryLoading: false,
        filters: { isActive: true },
        sort: [{ field: 'name', order: 1 }],
      };

      // Reset
      state = productCategoryReducer(state, resetProductCategoryState());
      expect(selectProductCategories({ productCategory: state })).toEqual([]);
      expect(selectProductCategoryFilters({ productCategory: state })).toEqual({});
      expect(selectProductCategorySort({ productCategory: state })).toEqual([]);
      expect(selectCurrentProductCategory({ productCategory: state })).toEqual(mockCategory);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = productCategoryReducer(initialState, { type: 'unknown' } as any);

      expect(state).toEqual(initialState);
    });

    it('handles multiple consecutive loading toggles', () => {
      let state = initialState;

      state = productCategoryReducer(state, setProductCategoryLoading(true));
      expect(state.loading).toBe(true);

      state = productCategoryReducer(state, setProductCategoryLoading(false));
      expect(state.loading).toBe(false);

      state = productCategoryReducer(state, setProductCategoryLoading(true));
      expect(state.loading).toBe(true);
    });

    it('preserves categories through loading states', () => {
      let state = productCategoryReducer(
        initialState,
        setProductCategoriesSuccess({ productCategories: mockCategories })
      );

      const originalCategories = state.productCategories;

      state = productCategoryReducer(state, setProductCategoryLoading(true));
      expect(state.productCategories).toEqual(originalCategories);

      state = productCategoryReducer(state, setProductCategoryLoading(false));
      expect(state.productCategories).toEqual(originalCategories);
    });

    it('handles independent loading states', () => {
      let state = productCategoryReducer(initialState, setProductCategoryLoading(true));
      expect(state.loading).toBe(true);
      expect(state.currentProductCategoryLoading).toBe(false);

      state = productCategoryReducer(state, setCurrentProductCategoryLoading(true));
      expect(state.loading).toBe(true);
      expect(state.currentProductCategoryLoading).toBe(true);

      state = productCategoryReducer(state, setProductCategoryLoading(false));
      expect(state.loading).toBe(false);
      expect(state.currentProductCategoryLoading).toBe(true);
    });
  });
});
