import { describe, it, expect, beforeEach } from 'vitest';
import {
  flashSaleSlice,
  setFlashSaleLoading,
  setFlashSalesSuccess,
  setFlashSaleError,
  setCurrentFlashSaleLoading,
  setCurrentFlashSaleSuccess,
  setCurrentFlashSaleError,
  clearCurrentFlashSale,
  setCreateFlashSaleLoading,
  setCreateFlashSaleSuccess,
  setCreateFlashSaleError,
  setUpdateFlashSaleLoading,
  setUpdateFlashSaleSuccess,
  setUpdateFlashSaleError,
  setDeleteFlashSaleLoading,
  setDeleteFlashSaleSuccess,
  setDeleteFlashSaleError,
  setToggleFlashSaleLoading,
  setToggleFlashSaleSuccess,
  setToggleFlashSaleError,
  setAddProductLoading,
  setAddProductSuccess,
  setAddProductError,
  setUpdateProductLoading,
  setUpdateProductSuccess,
  setUpdateProductError,
  setRemoveProductLoading,
  setRemoveProductSuccess,
  setRemoveProductError,
  setToggleProductLoading,
  setToggleProductSuccess,
  setToggleProductError,
  setFilters,
  setSort,
  resetFlashSaleState,
  getFlashSalesRequest,
  getFlashSaleByIdRequest,
  createFlashSaleRequest,
  updateFlashSaleRequest,
  deleteFlashSaleRequest,
  toggleFlashSaleRequest,
  addFlashSaleProductRequest,
  updateFlashSaleProductRequest,
  bulkAddFlashSaleProductsRequest,
  bulkUpdateFlashSaleProductsRequest,
  removeFlashSaleProductRequest,
  toggleFlashSaleProductRequest,
  selectFlashSales,
  selectCurrentFlashSale,
  selectFlashSaleLoading,
  selectCurrentFlashSaleLoading,
  selectCreateFlashSaleLoading,
  selectUpdateFlashSaleLoading,
  selectDeleteFlashSaleLoading,
  selectToggleFlashSaleLoading,
  selectAddProductLoading,
  selectUpdateProductLoading,
  selectRemoveProductLoading,
  selectToggleProductLoading,
  selectFlashSalePagination,
  selectFlashSaleFilters,
  selectFlashSaleSort,
  selectFlashSaleStatusFilter,
  selectFlashSaleSearchQuery,
  type FlashSaleState,
} from 'src/redux/store/flashSaleSlice';
import type {
  FlashSaleResponse as FlashSale,
  FlashSaleListItem,
} from 'src/types/gen/shared/shared/flash-sales/flash-sale';

describe('flashSaleSlice', () => {
  const flashSaleReducer = flashSaleSlice.reducer;

  const initialState: FlashSaleState = {
    flashSales: [],
    currentFlashSale: null,
    loading: false,
    currentLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    toggleLoading: false,
    addProductLoading: false,
    updateProductLoading: false,
    removeProductLoading: false,
    toggleProductLoading: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: {},
    sort: [],
  };

  const mockFlashSale: FlashSale = {
    id: 'fs1',
    name: 'Flash Sale 1',
    isEnabled: true,
    status: 'active',
  } as FlashSale;

  const mockFlashSaleListItem: FlashSaleListItem = {
    id: 'fs1',
    name: 'Flash Sale 1',
    isEnabled: true,
    status: 'active',
  } as FlashSaleListItem;

  const mockFlashSaleList: FlashSaleListItem[] = [
    mockFlashSaleListItem,
    {
      id: 'fs2',
      name: 'Flash Sale 2',
      isEnabled: false,
      status: 'inactive',
    } as FlashSaleListItem,
  ];

  beforeEach(() => {
    // Reset to initial state before each test
  });

  describe('reducers', () => {
    describe('setFlashSaleLoading', () => {
      it('sets loading to true', () => {
        const state = flashSaleReducer(initialState, setFlashSaleLoading(true));
        expect(state.loading).toBe(true);
      });

      it('sets loading to false', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          loading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setFlashSaleLoading(false));
        expect(state.loading).toBe(false);
      });
    });

    describe('setFlashSalesSuccess', () => {
      it('sets flash sales and pagination and stops loading', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          loading: true,
        };
        const state = flashSaleReducer(
          stateWithLoading,
          setFlashSalesSuccess({
            flashSales: mockFlashSaleList,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
          })
        );
        expect(state.flashSales).toEqual(mockFlashSaleList);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
        expect(state.loading).toBe(false);
      });
    });

    describe('setFlashSaleError', () => {
      it('stops loading', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          loading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setFlashSaleError());
        expect(state.loading).toBe(false);
      });
    });

    describe('setCurrentFlashSaleLoading', () => {
      it('sets current loading to true', () => {
        const state = flashSaleReducer(initialState, setCurrentFlashSaleLoading(true));
        expect(state.currentLoading).toBe(true);
      });

      it('sets current loading to false', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          currentLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setCurrentFlashSaleLoading(false));
        expect(state.currentLoading).toBe(false);
      });
    });

    describe('setCurrentFlashSaleSuccess', () => {
      it('sets current flash sale and stops loading', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          currentLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setCurrentFlashSaleSuccess(mockFlashSale));
        expect(state.currentFlashSale).toEqual(mockFlashSale);
        expect(state.currentLoading).toBe(false);
      });
    });

    describe('setCurrentFlashSaleError', () => {
      it('stops current loading', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          currentLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setCurrentFlashSaleError());
        expect(state.currentLoading).toBe(false);
      });
    });

    describe('clearCurrentFlashSale', () => {
      it('clears current flash sale', () => {
        const stateWithFlashSale: FlashSaleState = {
          ...initialState,
          currentFlashSale: mockFlashSale,
        };
        const state = flashSaleReducer(stateWithFlashSale, clearCurrentFlashSale());
        expect(state.currentFlashSale).toBe(null);
      });
    });

    describe('setCreateFlashSaleLoading', () => {
      it('sets create loading to true', () => {
        const state = flashSaleReducer(initialState, setCreateFlashSaleLoading(true));
        expect(state.createLoading).toBe(true);
      });

      it('sets create loading to false', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          createLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setCreateFlashSaleLoading(false));
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setCreateFlashSaleSuccess', () => {
      it('stops create loading', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          createLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setCreateFlashSaleSuccess());
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setCreateFlashSaleError', () => {
      it('stops create loading', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          createLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setCreateFlashSaleError());
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setUpdateFlashSaleLoading', () => {
      it('sets update loading to true', () => {
        const state = flashSaleReducer(initialState, setUpdateFlashSaleLoading(true));
        expect(state.updateLoading).toBe(true);
      });

      it('sets update loading to false', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          updateLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setUpdateFlashSaleLoading(false));
        expect(state.updateLoading).toBe(false);
      });
    });

    describe('setUpdateFlashSaleSuccess', () => {
      it('updates current flash sale if id matches and stops loading', () => {
        const stateWithFlashSale: FlashSaleState = {
          ...initialState,
          currentFlashSale: mockFlashSale,
          updateLoading: true,
        };
        const updatedFlashSale: FlashSale = { ...mockFlashSale, name: 'Updated Flash Sale' };
        const state = flashSaleReducer(stateWithFlashSale, setUpdateFlashSaleSuccess(updatedFlashSale));
        expect(state.currentFlashSale?.name).toBe('Updated Flash Sale');
        expect(state.updateLoading).toBe(false);
      });

      it('does not update current flash sale if id does not match', () => {
        const otherFlashSale: FlashSale = { ...mockFlashSale, id: 'fs2' };
        const stateWithFlashSale: FlashSaleState = {
          ...initialState,
          currentFlashSale: mockFlashSale,
          updateLoading: true,
        };
        const updatedFlashSale: FlashSale = { ...otherFlashSale, name: 'Updated' };
        const state = flashSaleReducer(stateWithFlashSale, setUpdateFlashSaleSuccess(updatedFlashSale));
        expect(state.currentFlashSale?.id).toBe('fs1');
        expect(state.currentFlashSale?.name).toBe('Flash Sale 1');
      });
    });

    describe('setUpdateFlashSaleError', () => {
      it('stops update loading', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          updateLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setUpdateFlashSaleError());
        expect(state.updateLoading).toBe(false);
      });
    });

    describe('setDeleteFlashSaleLoading', () => {
      it('sets delete loading to true', () => {
        const state = flashSaleReducer(initialState, setDeleteFlashSaleLoading(true));
        expect(state.deleteLoading).toBe(true);
      });

      it('sets delete loading to false', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          deleteLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setDeleteFlashSaleLoading(false));
        expect(state.deleteLoading).toBe(false);
      });
    });

    describe('setDeleteFlashSaleSuccess', () => {
      it('removes flash sale from list and stops loading', () => {
        const stateWithFlashSales: FlashSaleState = {
          ...initialState,
          flashSales: mockFlashSaleList,
          deleteLoading: true,
        };
        const state = flashSaleReducer(stateWithFlashSales, setDeleteFlashSaleSuccess('fs1'));
        expect(state.flashSales).toEqual([mockFlashSaleList[1]]);
        expect(state.deleteLoading).toBe(false);
      });

      it('clears current flash sale if id matches', () => {
        const stateWithCurrent: FlashSaleState = {
          ...initialState,
          flashSales: mockFlashSaleList,
          currentFlashSale: mockFlashSale,
          deleteLoading: true,
        };
        const state = flashSaleReducer(stateWithCurrent, setDeleteFlashSaleSuccess('fs1'));
        expect(state.currentFlashSale).toBe(null);
      });

      it('does not clear current flash sale if id does not match', () => {
        const stateWithCurrent: FlashSaleState = {
          ...initialState,
          flashSales: mockFlashSaleList,
          currentFlashSale: mockFlashSale,
          deleteLoading: true,
        };
        const state = flashSaleReducer(stateWithCurrent, setDeleteFlashSaleSuccess('fs2'));
        expect(state.currentFlashSale?.id).toBe('fs1');
      });
    });

    describe('setDeleteFlashSaleError', () => {
      it('stops delete loading', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          deleteLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setDeleteFlashSaleError());
        expect(state.deleteLoading).toBe(false);
      });
    });

    describe('setToggleFlashSaleLoading', () => {
      it('sets toggle loading to true', () => {
        const state = flashSaleReducer(initialState, setToggleFlashSaleLoading(true));
        expect(state.toggleLoading).toBe(true);
      });

      it('sets toggle loading to false', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          toggleLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setToggleFlashSaleLoading(false));
        expect(state.toggleLoading).toBe(false);
      });
    });

    describe('setToggleFlashSaleSuccess', () => {
      it('updates flash sale isEnabled and status in list and stops loading', () => {
        const stateWithFlashSales: FlashSaleState = {
          ...initialState,
          flashSales: mockFlashSaleList,
          toggleLoading: true,
        };
        const toggledFlashSale: FlashSale = { ...mockFlashSale, isEnabled: false, status: 'inactive' };
        const state = flashSaleReducer(stateWithFlashSales, setToggleFlashSaleSuccess(toggledFlashSale));
        expect(state.flashSales[0].isEnabled).toBe(false);
        expect(state.flashSales[0].status).toBe('inactive');
        expect(state.toggleLoading).toBe(false);
      });

      it('updates current flash sale if id matches', () => {
        const stateWithCurrent: FlashSaleState = {
          ...initialState,
          flashSales: mockFlashSaleList,
          currentFlashSale: mockFlashSale,
          toggleLoading: true,
        };
        const toggledFlashSale: FlashSale = { ...mockFlashSale, isEnabled: false };
        const state = flashSaleReducer(stateWithCurrent, setToggleFlashSaleSuccess(toggledFlashSale));
        expect(state.currentFlashSale?.isEnabled).toBe(false);
      });

      it('does not update current flash sale if id does not match', () => {
        const otherFlashSale: FlashSale = { ...mockFlashSale, id: 'fs2', isEnabled: false };
        const stateWithCurrent: FlashSaleState = {
          ...initialState,
          flashSales: mockFlashSaleList,
          currentFlashSale: mockFlashSale,
          toggleLoading: true,
        };
        const state = flashSaleReducer(stateWithCurrent, setToggleFlashSaleSuccess(otherFlashSale));
        expect(state.currentFlashSale?.id).toBe('fs1');
        expect(state.currentFlashSale?.isEnabled).toBe(true);
      });
    });

    describe('setToggleFlashSaleError', () => {
      it('stops toggle loading', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          toggleLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setToggleFlashSaleError());
        expect(state.toggleLoading).toBe(false);
      });
    });

    describe('setAddProductLoading', () => {
      it('sets add product loading to true', () => {
        const state = flashSaleReducer(initialState, setAddProductLoading(true));
        expect(state.addProductLoading).toBe(true);
      });

      it('sets add product loading to false', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          addProductLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setAddProductLoading(false));
        expect(state.addProductLoading).toBe(false);
      });
    });

    describe('setAddProductSuccess', () => {
      it('updates current flash sale if id matches and stops loading', () => {
        const stateWithFlashSale: FlashSaleState = {
          ...initialState,
          currentFlashSale: mockFlashSale,
          addProductLoading: true,
        };
        const updatedFlashSale: FlashSale = { ...mockFlashSale, name: 'Updated' };
        const state = flashSaleReducer(stateWithFlashSale, setAddProductSuccess(updatedFlashSale));
        expect(state.currentFlashSale?.name).toBe('Updated');
        expect(state.addProductLoading).toBe(false);
      });

      it('does not update current flash sale if id does not match', () => {
        const otherFlashSale: FlashSale = { ...mockFlashSale, id: 'fs2', name: 'Other' };
        const stateWithFlashSale: FlashSaleState = {
          ...initialState,
          currentFlashSale: mockFlashSale,
          addProductLoading: true,
        };
        const state = flashSaleReducer(stateWithFlashSale, setAddProductSuccess(otherFlashSale));
        expect(state.currentFlashSale?.id).toBe('fs1');
        expect(state.currentFlashSale?.name).toBe('Flash Sale 1');
      });
    });

    describe('setAddProductError', () => {
      it('stops add product loading', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          addProductLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setAddProductError());
        expect(state.addProductLoading).toBe(false);
      });
    });

    describe('setUpdateProductLoading', () => {
      it('sets update product loading to true', () => {
        const state = flashSaleReducer(initialState, setUpdateProductLoading(true));
        expect(state.updateProductLoading).toBe(true);
      });

      it('sets update product loading to false', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          updateProductLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setUpdateProductLoading(false));
        expect(state.updateProductLoading).toBe(false);
      });
    });

    describe('setUpdateProductSuccess', () => {
      it('updates current flash sale if id matches and stops loading', () => {
        const stateWithFlashSale: FlashSaleState = {
          ...initialState,
          currentFlashSale: mockFlashSale,
          updateProductLoading: true,
        };
        const updatedFlashSale: FlashSale = { ...mockFlashSale, name: 'Updated' };
        const state = flashSaleReducer(stateWithFlashSale, setUpdateProductSuccess(updatedFlashSale));
        expect(state.currentFlashSale?.name).toBe('Updated');
        expect(state.updateProductLoading).toBe(false);
      });

      it('does not update current flash sale if id does not match', () => {
        const otherFlashSale: FlashSale = { ...mockFlashSale, id: 'fs2', name: 'Other' };
        const stateWithFlashSale: FlashSaleState = {
          ...initialState,
          currentFlashSale: mockFlashSale,
          updateProductLoading: true,
        };
        const state = flashSaleReducer(stateWithFlashSale, setUpdateProductSuccess(otherFlashSale));
        expect(state.currentFlashSale?.id).toBe('fs1');
        expect(state.currentFlashSale?.name).toBe('Flash Sale 1');
      });
    });

    describe('setUpdateProductError', () => {
      it('stops update product loading', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          updateProductLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setUpdateProductError());
        expect(state.updateProductLoading).toBe(false);
      });
    });

    describe('setRemoveProductLoading', () => {
      it('sets remove product loading to true', () => {
        const state = flashSaleReducer(initialState, setRemoveProductLoading(true));
        expect(state.removeProductLoading).toBe(true);
      });

      it('sets remove product loading to false', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          removeProductLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setRemoveProductLoading(false));
        expect(state.removeProductLoading).toBe(false);
      });
    });

    describe('setRemoveProductSuccess', () => {
      it('updates current flash sale if id matches and stops loading', () => {
        const stateWithFlashSale: FlashSaleState = {
          ...initialState,
          currentFlashSale: mockFlashSale,
          removeProductLoading: true,
        };
        const updatedFlashSale: FlashSale = { ...mockFlashSale, name: 'Updated' };
        const state = flashSaleReducer(stateWithFlashSale, setRemoveProductSuccess(updatedFlashSale));
        expect(state.currentFlashSale?.name).toBe('Updated');
        expect(state.removeProductLoading).toBe(false);
      });

      it('does not update current flash sale if id does not match', () => {
        const otherFlashSale: FlashSale = { ...mockFlashSale, id: 'fs2', name: 'Other' };
        const stateWithFlashSale: FlashSaleState = {
          ...initialState,
          currentFlashSale: mockFlashSale,
          removeProductLoading: true,
        };
        const state = flashSaleReducer(stateWithFlashSale, setRemoveProductSuccess(otherFlashSale));
        expect(state.currentFlashSale?.id).toBe('fs1');
        expect(state.currentFlashSale?.name).toBe('Flash Sale 1');
      });
    });

    describe('setRemoveProductError', () => {
      it('stops remove product loading', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          removeProductLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setRemoveProductError());
        expect(state.removeProductLoading).toBe(false);
      });
    });

    describe('setToggleProductLoading', () => {
      it('sets toggle product loading to true', () => {
        const state = flashSaleReducer(initialState, setToggleProductLoading(true));
        expect(state.toggleProductLoading).toBe(true);
      });

      it('sets toggle product loading to false', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          toggleProductLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setToggleProductLoading(false));
        expect(state.toggleProductLoading).toBe(false);
      });
    });

    describe('setToggleProductSuccess', () => {
      it('updates current flash sale if id matches and stops loading', () => {
        const stateWithFlashSale: FlashSaleState = {
          ...initialState,
          currentFlashSale: mockFlashSale,
          toggleProductLoading: true,
        };
        const updatedFlashSale: FlashSale = { ...mockFlashSale, name: 'Updated' };
        const state = flashSaleReducer(stateWithFlashSale, setToggleProductSuccess(updatedFlashSale));
        expect(state.currentFlashSale?.name).toBe('Updated');
        expect(state.toggleProductLoading).toBe(false);
      });

      it('does not update current flash sale if id does not match', () => {
        const otherFlashSale: FlashSale = { ...mockFlashSale, id: 'fs2', name: 'Other' };
        const stateWithFlashSale: FlashSaleState = {
          ...initialState,
          currentFlashSale: mockFlashSale,
          toggleProductLoading: true,
        };
        const state = flashSaleReducer(stateWithFlashSale, setToggleProductSuccess(otherFlashSale));
        expect(state.currentFlashSale?.id).toBe('fs1');
        expect(state.currentFlashSale?.name).toBe('Flash Sale 1');
      });
    });

    describe('setToggleProductError', () => {
      it('stops toggle product loading', () => {
        const stateWithLoading: FlashSaleState = {
          ...initialState,
          toggleProductLoading: true,
        };
        const state = flashSaleReducer(stateWithLoading, setToggleProductError());
        expect(state.toggleProductLoading).toBe(false);
      });
    });

    describe('setFilters', () => {
      it('sets filter values', () => {
        const state = flashSaleReducer(initialState, setFilters({ status: 'active', search: 'test' }));
        expect(state.filters).toEqual({ status: 'active', search: 'test' });
      });

      it('replaces existing filters', () => {
        const stateWithFilters: FlashSaleState = {
          ...initialState,
          filters: { status: 'active' },
        };
        const state = flashSaleReducer(stateWithFilters, setFilters({ search: 'new' }));
        expect(state.filters).toEqual({ search: 'new' });
      });
    });

    describe('setSort', () => {
      it('sets sort values', () => {
        const state = flashSaleReducer(initialState, setSort([{ field: 'name', order: 'asc' }]));
        expect(state.sort).toEqual([{ field: 'name', order: 'asc' }]);
      });

      it('replaces existing sort', () => {
        const stateWithSort: FlashSaleState = {
          ...initialState,
          sort: [{ field: 'name', order: 'asc' }],
        };
        const state = flashSaleReducer(stateWithSort, setSort([{ field: 'status', order: 'desc' }]));
        expect(state.sort).toEqual([{ field: 'status', order: 'desc' }]);
      });

      it('sets sort to empty array', () => {
        const stateWithSort: FlashSaleState = {
          ...initialState,
          sort: [{ field: 'name', order: 'asc' }],
        };
        const state = flashSaleReducer(stateWithSort, setSort([]));
        expect(state.sort).toEqual([]);
      });
    });

    describe('resetFlashSaleState', () => {
      it('resets flash sales, loading, pagination, filters, and sort', () => {
        const stateWithData: FlashSaleState = {
          ...initialState,
          flashSales: mockFlashSaleList,
          loading: true,
          pagination: { page: 5, limit: 20, total: 100, totalPages: 5 },
          filters: { status: 'active' },
          sort: [{ field: 'name', order: 'asc' }],
          currentFlashSale: mockFlashSale,
        };
        const state = flashSaleReducer(stateWithData, resetFlashSaleState());
        expect(state.flashSales).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
        expect(state.filters).toEqual({});
        expect(state.sort).toEqual([]);
      });

      it('does not reset current flash sale and other loading states', () => {
        const stateWithData: FlashSaleState = {
          ...initialState,
          currentFlashSale: mockFlashSale,
          currentLoading: true,
          createLoading: true,
          updateLoading: true,
          deleteLoading: true,
          toggleLoading: true,
          addProductLoading: true,
          updateProductLoading: true,
          removeProductLoading: true,
          toggleProductLoading: true,
        };
        const state = flashSaleReducer(stateWithData, resetFlashSaleState());
        expect(state.currentFlashSale).toEqual(mockFlashSale);
        expect(state.currentLoading).toBe(true);
        expect(state.createLoading).toBe(true);
        expect(state.updateLoading).toBe(true);
        expect(state.deleteLoading).toBe(true);
        expect(state.toggleLoading).toBe(true);
        expect(state.addProductLoading).toBe(true);
        expect(state.updateProductLoading).toBe(true);
        expect(state.removeProductLoading).toBe(true);
        expect(state.toggleProductLoading).toBe(true);
      });
    });
  });

  describe('saga actions', () => {
    describe('getFlashSalesRequest', () => {
      it('creates correct action type', () => {
        const action = getFlashSalesRequest({
          page: 1,
          limit: 10,
        });
        expect(action.type).toBe('flashSale/getFlashSalesRequest');
      });

      it('includes pagination in payload', () => {
        const action = getFlashSalesRequest({
          page: 2,
          limit: 20,
        });
        expect(action.payload.page).toBe(2);
        expect(action.payload.limit).toBe(20);
      });

      it('includes filters in payload', () => {
        const action = getFlashSalesRequest({
          filters: { status: 'active' },
        });
        expect(action.payload.filters).toEqual({ status: 'active' });
      });

      it('includes sort in payload', () => {
        const action = getFlashSalesRequest({
          sort: [{ field: 'name', order: 'asc' }],
        });
        expect(action.payload.sort).toEqual([{ field: 'name', order: 'asc' }]);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = getFlashSalesRequest({ onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('getFlashSaleByIdRequest', () => {
      it('creates correct action type', () => {
        const action = getFlashSaleByIdRequest({ id: 'fs1' });
        expect(action.type).toBe('flashSale/getFlashSaleByIdRequest');
      });

      it('includes id in payload', () => {
        const action = getFlashSaleByIdRequest({ id: 'fs1' });
        expect(action.payload.id).toBe('fs1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = getFlashSaleByIdRequest({ id: 'fs1', onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('createFlashSaleRequest', () => {
      it('creates correct action type', () => {
        const action = createFlashSaleRequest({
          name: 'New Flash Sale',
          startTime: new Date(),
          endTime: new Date(),
        });
        expect(action.type).toBe('flashSale/createFlashSaleRequest');
      });

      it('includes data in payload', () => {
        const startTime = new Date();
        const endTime = new Date();
        const action = createFlashSaleRequest({
          name: 'New Flash Sale',
          startTime,
          endTime,
        });
        expect(action.payload.name).toBe('New Flash Sale');
        expect(action.payload.startTime).toBe(startTime);
        expect(action.payload.endTime).toBe(endTime);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = createFlashSaleRequest({
          name: 'New Flash Sale',
          startTime: new Date(),
          endTime: new Date(),
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('updateFlashSaleRequest', () => {
      it('creates correct action type', () => {
        const action = updateFlashSaleRequest({
          flashSaleId: 'fs1',
          name: 'Updated Flash Sale',
        });
        expect(action.type).toBe('flashSale/updateFlashSaleRequest');
      });

      it('includes flashSaleId and data in payload', () => {
        const action = updateFlashSaleRequest({
          flashSaleId: 'fs1',
          name: 'Updated Flash Sale',
        });
        expect(action.payload.flashSaleId).toBe('fs1');
        expect(action.payload.name).toBe('Updated Flash Sale');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = updateFlashSaleRequest({
          flashSaleId: 'fs1',
          name: 'Updated',
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('deleteFlashSaleRequest', () => {
      it('creates correct action type', () => {
        const action = deleteFlashSaleRequest({ id: 'fs1' });
        expect(action.type).toBe('flashSale/deleteFlashSaleRequest');
      });

      it('includes id in payload', () => {
        const action = deleteFlashSaleRequest({ id: 'fs1' });
        expect(action.payload.id).toBe('fs1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = deleteFlashSaleRequest({ id: 'fs1', onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('toggleFlashSaleRequest', () => {
      it('creates correct action type', () => {
        const action = toggleFlashSaleRequest({ id: 'fs1' });
        expect(action.type).toBe('flashSale/toggleFlashSaleRequest');
      });

      it('includes id in payload', () => {
        const action = toggleFlashSaleRequest({ id: 'fs1' });
        expect(action.payload.id).toBe('fs1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = toggleFlashSaleRequest({ id: 'fs1', onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('addFlashSaleProductRequest', () => {
      it('creates correct action type', () => {
        const action = addFlashSaleProductRequest({
          data: { flashSaleId: 'fs1', productId: 'prod1' } as any,
        });
        expect(action.type).toBe('flashSale/addFlashSaleProductRequest');
      });

      it('includes data in payload', () => {
        const data = { flashSaleId: 'fs1', productId: 'prod1' } as any;
        const action = addFlashSaleProductRequest({ data });
        expect(action.payload.data).toEqual(data);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = addFlashSaleProductRequest({
          data: { flashSaleId: 'fs1', productId: 'prod1' } as any,
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('updateFlashSaleProductRequest', () => {
      it('creates correct action type', () => {
        const action = updateFlashSaleProductRequest({
          data: { flashSaleId: 'fs1', productId: 'prod1' } as any,
        });
        expect(action.type).toBe('flashSale/updateFlashSaleProductRequest');
      });

      it('includes data in payload', () => {
        const data = { flashSaleId: 'fs1', productId: 'prod1' } as any;
        const action = updateFlashSaleProductRequest({ data });
        expect(action.payload.data).toEqual(data);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = updateFlashSaleProductRequest({
          data: { flashSaleId: 'fs1', productId: 'prod1' } as any,
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('bulkAddFlashSaleProductsRequest', () => {
      it('creates correct action type', () => {
        const action = bulkAddFlashSaleProductsRequest({
          data: { flashSaleId: 'fs1', products: [] } as any,
        });
        expect(action.type).toBe('flashSale/bulkAddFlashSaleProductsRequest');
      });

      it('includes data in payload', () => {
        const data = { flashSaleId: 'fs1', products: [] } as any;
        const action = bulkAddFlashSaleProductsRequest({ data });
        expect(action.payload.data).toEqual(data);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = bulkAddFlashSaleProductsRequest({
          data: { flashSaleId: 'fs1', products: [] } as any,
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('bulkUpdateFlashSaleProductsRequest', () => {
      it('creates correct action type', () => {
        const action = bulkUpdateFlashSaleProductsRequest({
          data: { flashSaleId: 'fs1', products: [] } as any,
        });
        expect(action.type).toBe('flashSale/bulkUpdateFlashSaleProductsRequest');
      });

      it('includes data in payload', () => {
        const data = { flashSaleId: 'fs1', products: [] } as any;
        const action = bulkUpdateFlashSaleProductsRequest({ data });
        expect(action.payload.data).toEqual(data);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = bulkUpdateFlashSaleProductsRequest({
          data: { flashSaleId: 'fs1', products: [] } as any,
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('removeFlashSaleProductRequest', () => {
      it('creates correct action type', () => {
        const action = removeFlashSaleProductRequest({
          flashSaleId: 'fs1',
          productId: 'prod1',
        });
        expect(action.type).toBe('flashSale/removeFlashSaleProductRequest');
      });

      it('includes flashSaleId and productId in payload', () => {
        const action = removeFlashSaleProductRequest({
          flashSaleId: 'fs1',
          productId: 'prod1',
        });
        expect(action.payload.flashSaleId).toBe('fs1');
        expect(action.payload.productId).toBe('prod1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = removeFlashSaleProductRequest({
          flashSaleId: 'fs1',
          productId: 'prod1',
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('toggleFlashSaleProductRequest', () => {
      it('creates correct action type', () => {
        const action = toggleFlashSaleProductRequest({
          flashSaleId: 'fs1',
          productId: 'prod1',
        });
        expect(action.type).toBe('flashSale/toggleFlashSaleProductRequest');
      });

      it('includes flashSaleId and productId in payload', () => {
        const action = toggleFlashSaleProductRequest({
          flashSaleId: 'fs1',
          productId: 'prod1',
        });
        expect(action.payload.flashSaleId).toBe('fs1');
        expect(action.payload.productId).toBe('prod1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = toggleFlashSaleProductRequest({
          flashSaleId: 'fs1',
          productId: 'prod1',
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });
  });

  describe('selectors', () => {
    describe('selectFlashSales', () => {
      it('returns empty array for initial state', () => {
        expect(selectFlashSales({ flashSale: initialState })).toEqual([]);
      });

      it('returns flash sales when present', () => {
        const state: FlashSaleState = { ...initialState, flashSales: mockFlashSaleList };
        expect(selectFlashSales({ flashSale: state })).toEqual(mockFlashSaleList);
      });
    });

    describe('selectCurrentFlashSale', () => {
      it('returns null for initial state', () => {
        expect(selectCurrentFlashSale({ flashSale: initialState })).toBe(null);
      });

      it('returns current flash sale when present', () => {
        const state: FlashSaleState = { ...initialState, currentFlashSale: mockFlashSale };
        expect(selectCurrentFlashSale({ flashSale: state })).toEqual(mockFlashSale);
      });
    });

    describe('selectFlashSaleLoading', () => {
      it('returns false for initial state', () => {
        expect(selectFlashSaleLoading({ flashSale: initialState })).toBe(false);
      });

      it('returns true when loading', () => {
        const state: FlashSaleState = { ...initialState, loading: true };
        expect(selectFlashSaleLoading({ flashSale: state })).toBe(true);
      });
    });

    describe('selectCurrentFlashSaleLoading', () => {
      it('returns false for initial state', () => {
        expect(selectCurrentFlashSaleLoading({ flashSale: initialState })).toBe(false);
      });

      it('returns true when loading current', () => {
        const state: FlashSaleState = { ...initialState, currentLoading: true };
        expect(selectCurrentFlashSaleLoading({ flashSale: state })).toBe(true);
      });
    });

    describe('selectCreateFlashSaleLoading', () => {
      it('returns false for initial state', () => {
        expect(selectCreateFlashSaleLoading({ flashSale: initialState })).toBe(false);
      });

      it('returns true when creating', () => {
        const state: FlashSaleState = { ...initialState, createLoading: true };
        expect(selectCreateFlashSaleLoading({ flashSale: state })).toBe(true);
      });
    });

    describe('selectUpdateFlashSaleLoading', () => {
      it('returns false for initial state', () => {
        expect(selectUpdateFlashSaleLoading({ flashSale: initialState })).toBe(false);
      });

      it('returns true when updating', () => {
        const state: FlashSaleState = { ...initialState, updateLoading: true };
        expect(selectUpdateFlashSaleLoading({ flashSale: state })).toBe(true);
      });
    });

    describe('selectDeleteFlashSaleLoading', () => {
      it('returns false for initial state', () => {
        expect(selectDeleteFlashSaleLoading({ flashSale: initialState })).toBe(false);
      });

      it('returns true when deleting', () => {
        const state: FlashSaleState = { ...initialState, deleteLoading: true };
        expect(selectDeleteFlashSaleLoading({ flashSale: state })).toBe(true);
      });
    });

    describe('selectToggleFlashSaleLoading', () => {
      it('returns false for initial state', () => {
        expect(selectToggleFlashSaleLoading({ flashSale: initialState })).toBe(false);
      });

      it('returns true when toggling', () => {
        const state: FlashSaleState = { ...initialState, toggleLoading: true };
        expect(selectToggleFlashSaleLoading({ flashSale: state })).toBe(true);
      });
    });

    describe('selectAddProductLoading', () => {
      it('returns false for initial state', () => {
        expect(selectAddProductLoading({ flashSale: initialState })).toBe(false);
      });

      it('returns true when adding product', () => {
        const state: FlashSaleState = { ...initialState, addProductLoading: true };
        expect(selectAddProductLoading({ flashSale: state })).toBe(true);
      });
    });

    describe('selectUpdateProductLoading', () => {
      it('returns false for initial state', () => {
        expect(selectUpdateProductLoading({ flashSale: initialState })).toBe(false);
      });

      it('returns true when updating product', () => {
        const state: FlashSaleState = { ...initialState, updateProductLoading: true };
        expect(selectUpdateProductLoading({ flashSale: state })).toBe(true);
      });
    });

    describe('selectRemoveProductLoading', () => {
      it('returns false for initial state', () => {
        expect(selectRemoveProductLoading({ flashSale: initialState })).toBe(false);
      });

      it('returns true when removing product', () => {
        const state: FlashSaleState = { ...initialState, removeProductLoading: true };
        expect(selectRemoveProductLoading({ flashSale: state })).toBe(true);
      });
    });

    describe('selectToggleProductLoading', () => {
      it('returns false for initial state', () => {
        expect(selectToggleProductLoading({ flashSale: initialState })).toBe(false);
      });

      it('returns true when toggling product', () => {
        const state: FlashSaleState = { ...initialState, toggleProductLoading: true };
        expect(selectToggleProductLoading({ flashSale: state })).toBe(true);
      });
    });

    describe('selectFlashSalePagination', () => {
      it('returns initial pagination for initial state', () => {
        expect(selectFlashSalePagination({ flashSale: initialState })).toEqual({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      });

      it('returns current pagination', () => {
        const state: FlashSaleState = {
          ...initialState,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        };
        expect(selectFlashSalePagination({ flashSale: state })).toEqual({
          page: 2,
          limit: 20,
          total: 100,
          totalPages: 5,
        });
      });
    });

    describe('selectFlashSaleFilters', () => {
      it('returns empty object for initial state', () => {
        expect(selectFlashSaleFilters({ flashSale: initialState })).toEqual({});
      });

      it('returns current filters', () => {
        const state: FlashSaleState = {
          ...initialState,
          filters: { status: 'active', search: 'test' },
        };
        expect(selectFlashSaleFilters({ flashSale: state })).toEqual({
          status: 'active',
          search: 'test',
        });
      });
    });

    describe('selectFlashSaleSort', () => {
      it('returns empty array for initial state', () => {
        expect(selectFlashSaleSort({ flashSale: initialState })).toEqual([]);
      });

      it('returns current sort', () => {
        const state: FlashSaleState = {
          ...initialState,
          sort: [{ field: 'name', order: 'asc' }],
        };
        expect(selectFlashSaleSort({ flashSale: state })).toEqual([{ field: 'name', order: 'asc' }]);
      });
    });

    describe('selectFlashSaleStatusFilter', () => {
      it('returns undefined for initial state', () => {
        expect(selectFlashSaleStatusFilter({ flashSale: initialState })).toBeUndefined();
      });

      it('returns current status filter', () => {
        const state: FlashSaleState = {
          ...initialState,
          filters: { status: 'active' },
        };
        expect(selectFlashSaleStatusFilter({ flashSale: state })).toBe('active');
      });
    });

    describe('selectFlashSaleSearchQuery', () => {
      it('returns undefined for initial state', () => {
        expect(selectFlashSaleSearchQuery({ flashSale: initialState })).toBeUndefined();
      });

      it('returns current search query', () => {
        const state: FlashSaleState = {
          ...initialState,
          filters: { search: 'test' },
        };
        expect(selectFlashSaleSearchQuery({ flashSale: state })).toBe('test');
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete CRUD flow', () => {
      // Create
      let state = flashSaleReducer(initialState, setCreateFlashSaleLoading(true));
      state = flashSaleReducer(state, setCreateFlashSaleSuccess());
      expect(selectCreateFlashSaleLoading({ flashSale: state })).toBe(false);

      // Read
      state = flashSaleReducer(state, setFlashSaleLoading(true));
      state = flashSaleReducer(
        state,
        setFlashSalesSuccess({
          flashSales: mockFlashSaleList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );
      expect(selectFlashSales({ flashSale: state })).toEqual(mockFlashSaleList);

      // Update
      state = flashSaleReducer(state, setUpdateFlashSaleLoading(true));
      state = flashSaleReducer(state, setCurrentFlashSaleSuccess(mockFlashSale));
      const updatedFlashSale: FlashSale = { ...mockFlashSale, name: 'Updated Flash Sale' };
      state = flashSaleReducer(state, setUpdateFlashSaleSuccess(updatedFlashSale));
      expect(selectCurrentFlashSale({ flashSale: state })?.name).toBe('Updated Flash Sale');

      // Delete
      state = flashSaleReducer(state, setDeleteFlashSaleLoading(true));
      state = flashSaleReducer(state, setDeleteFlashSaleSuccess('fs1'));
      expect(selectFlashSales({ flashSale: state })).toEqual([mockFlashSaleList[1]]);
    });

    it('handles toggle flow', () => {
      let state = flashSaleReducer(
        initialState,
        setFlashSalesSuccess({
          flashSales: mockFlashSaleList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );
      state = flashSaleReducer(state, setCurrentFlashSaleSuccess(mockFlashSale));

      // Toggle
      state = flashSaleReducer(state, setToggleFlashSaleLoading(true));
      const toggledFlashSale: FlashSale = { ...mockFlashSale, isEnabled: false, status: 'inactive' };
      state = flashSaleReducer(state, setToggleFlashSaleSuccess(toggledFlashSale));
      expect(selectFlashSales({ flashSale: state })[0].isEnabled).toBe(false);
      expect(selectCurrentFlashSale({ flashSale: state })?.isEnabled).toBe(false);
      expect(selectToggleFlashSaleLoading({ flashSale: state })).toBe(false);
    });

    it('handles product management flow', () => {
      let state = flashSaleReducer(initialState, setCurrentFlashSaleSuccess(mockFlashSale));

      // Add product
      state = flashSaleReducer(state, setAddProductLoading(true));
      const flashSaleWithProduct: FlashSale = { ...mockFlashSale, name: 'Flash Sale with Product' };
      state = flashSaleReducer(state, setAddProductSuccess(flashSaleWithProduct));
      expect(selectCurrentFlashSale({ flashSale: state })?.name).toBe('Flash Sale with Product');
      expect(selectAddProductLoading({ flashSale: state })).toBe(false);

      // Update product
      state = flashSaleReducer(state, setUpdateProductLoading(true));
      const flashSaleUpdatedProduct: FlashSale = { ...mockFlashSale, name: 'Flash Sale Updated Product' };
      state = flashSaleReducer(state, setUpdateProductSuccess(flashSaleUpdatedProduct));
      expect(selectCurrentFlashSale({ flashSale: state })?.name).toBe('Flash Sale Updated Product');
      expect(selectUpdateProductLoading({ flashSale: state })).toBe(false);

      // Toggle product
      state = flashSaleReducer(state, setToggleProductLoading(true));
      const flashSaleToggledProduct: FlashSale = { ...mockFlashSale, name: 'Flash Sale Toggled Product' };
      state = flashSaleReducer(state, setToggleProductSuccess(flashSaleToggledProduct));
      expect(selectCurrentFlashSale({ flashSale: state })?.name).toBe('Flash Sale Toggled Product');
      expect(selectToggleProductLoading({ flashSale: state })).toBe(false);

      // Remove product
      state = flashSaleReducer(state, setRemoveProductLoading(true));
      const flashSaleWithoutProduct: FlashSale = { ...mockFlashSale, name: 'Flash Sale without Product' };
      state = flashSaleReducer(state, setRemoveProductSuccess(flashSaleWithoutProduct));
      expect(selectCurrentFlashSale({ flashSale: state })?.name).toBe('Flash Sale without Product');
      expect(selectRemoveProductLoading({ flashSale: state })).toBe(false);
    });

    it('handles independent loading states', () => {
      let state = flashSaleReducer(initialState, setFlashSaleLoading(true));
      state = flashSaleReducer(state, setCurrentFlashSaleLoading(true));
      state = flashSaleReducer(state, setCreateFlashSaleLoading(true));
      state = flashSaleReducer(state, setUpdateFlashSaleLoading(true));
      state = flashSaleReducer(state, setDeleteFlashSaleLoading(true));
      state = flashSaleReducer(state, setToggleFlashSaleLoading(true));
      state = flashSaleReducer(state, setAddProductLoading(true));
      state = flashSaleReducer(state, setUpdateProductLoading(true));
      state = flashSaleReducer(state, setRemoveProductLoading(true));
      state = flashSaleReducer(state, setToggleProductLoading(true));

      expect(state.loading).toBe(true);
      expect(state.currentLoading).toBe(true);
      expect(state.createLoading).toBe(true);
      expect(state.updateLoading).toBe(true);
      expect(state.deleteLoading).toBe(true);
      expect(state.toggleLoading).toBe(true);
      expect(state.addProductLoading).toBe(true);
      expect(state.updateProductLoading).toBe(true);
      expect(state.removeProductLoading).toBe(true);
      expect(state.toggleProductLoading).toBe(true);

      // Each can be stopped independently
      state = flashSaleReducer(state, setFlashSaleLoading(false));
      expect(state.loading).toBe(false);
      expect(state.currentLoading).toBe(true);
    });

    it('handles filter and sort flow', () => {
      let state = flashSaleReducer(initialState, setFilters({ status: 'active', search: 'test' }));
      state = flashSaleReducer(state, setSort([{ field: 'name', order: 'asc' }]));

      state = flashSaleReducer(state, setFlashSaleLoading(true));
      state = flashSaleReducer(
        state,
        setFlashSalesSuccess({
          flashSales: mockFlashSaleList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );

      expect(selectFlashSaleStatusFilter({ flashSale: state })).toBe('active');
      expect(selectFlashSaleSearchQuery({ flashSale: state })).toBe('test');
      expect(selectFlashSaleSort({ flashSale: state })).toEqual([{ field: 'name', order: 'asc' }]);
    });

    it('handles reset flow', () => {
      let state = flashSaleReducer(
        initialState,
        setFlashSalesSuccess({
          flashSales: mockFlashSaleList,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        })
      );
      state = flashSaleReducer(state, setFilters({ status: 'active' }));
      state = flashSaleReducer(state, setSort([{ field: 'name', order: 'asc' }]));

      state = flashSaleReducer(state, resetFlashSaleState());
      expect(selectFlashSales({ flashSale: state })).toEqual([]);
      expect(selectFlashSalePagination({ flashSale: state })).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      expect(selectFlashSaleFilters({ flashSale: state })).toEqual({});
      expect(selectFlashSaleSort({ flashSale: state })).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = flashSaleReducer(initialState, { type: 'UNKNOWN_ACTION' } as any);
      expect(state).toEqual(initialState);
    });

    it('handles toggle when flash sale not in list', () => {
      const stateWithFlashSales: FlashSaleState = {
        ...initialState,
        flashSales: [mockFlashSaleList[1]],
      };
      const toggledFlashSale: FlashSale = { ...mockFlashSale, isEnabled: false };
      const state = flashSaleReducer(stateWithFlashSales, setToggleFlashSaleSuccess(toggledFlashSale));
      expect(state.flashSales).toEqual([mockFlashSaleList[1]]);
    });

    it('handles delete when flash sale not in list', () => {
      const stateWithFlashSales: FlashSaleState = {
        ...initialState,
        flashSales: [mockFlashSaleList[1]],
      };
      const state = flashSaleReducer(stateWithFlashSales, setDeleteFlashSaleSuccess('fs1'));
      expect(state.flashSales).toEqual([mockFlashSaleList[1]]);
    });

    it('handles create success with no flash sales added', () => {
      const state = flashSaleReducer(initialState, setCreateFlashSaleSuccess());
      expect(state.flashSales).toEqual([]);
      expect(state.createLoading).toBe(false);
    });
  });
});
