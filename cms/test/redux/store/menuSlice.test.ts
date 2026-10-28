import { describe, it, expect, beforeEach } from 'vitest';
import {
  menuSlice,
  setMenuLoading,
  setMenusSuccess,
  setMenuError,
  setAllMenusLoading,
  setAllMenusSuccess,
  setAllMenusError,
  setCurrentMenuLoading,
  setCurrentMenuSuccess,
  setCurrentMenuError,
  clearCurrentMenu,
  setCreateMenuLoading,
  setCreateMenuSuccess,
  setCreateMenuError,
  setUpdateMenuLoading,
  setUpdateMenuSuccess,
  setUpdateMenuError,
  setDeleteMenuLoading,
  setDeleteMenuSuccess,
  setDeleteMenuError,
  setSearchQuery,
  setStatusFilter,
  resetMenuState,
  getMenusRequest,
  getAllMenusRequest,
  getMenuByIdRequest,
  createMenuRequest,
  updateMenuRequest,
  deleteMenuRequest,
  reorderMenusRequest,
  selectMenus,
  selectAllMenus,
  selectCurrentMenu,
  selectMenuLoading,
  selectAllMenusLoading,
  selectCurrentMenuLoading,
  selectCreateMenuLoading,
  selectUpdateMenuLoading,
  selectDeleteMenuLoading,
  selectMenuPagination,
  selectMenuSearchQuery,
  selectMenuStatusFilter,
  type MenuState,
} from 'src/redux/store/menuSlice';
import type { Menu } from 'src/types/gen/shared/shared/menus/menu';

describe('menuSlice', () => {
  const menuReducer = menuSlice.reducer;

  const initialState: MenuState = {
    menus: [],
    allMenus: [],
    currentMenu: null,
    loading: false,
    allMenusLoading: false,
    currentLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    searchQuery: '',
    statusFilter: 'all',
  };

  const mockMenu: Menu = {
    id: 'menu1',
    name: 'Menu 1',
    order: 1,
  } as Menu;

  const mockMenuList: Menu[] = [
    mockMenu,
    {
      id: 'menu2',
      name: 'Menu 2',
      order: 2,
    } as Menu,
  ];

  beforeEach(() => {
    // Reset to initial state before each test
  });

  describe('reducers', () => {
    describe('setMenuLoading', () => {
      it('sets loading to true', () => {
        const state = menuReducer(initialState, setMenuLoading(true));
        expect(state.loading).toBe(true);
      });

      it('sets loading to false', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          loading: true,
        };
        const state = menuReducer(stateWithLoading, setMenuLoading(false));
        expect(state.loading).toBe(false);
      });
    });

    describe('setMenusSuccess', () => {
      it('sets menus and pagination and stops loading', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          loading: true,
        };
        const state = menuReducer(
          stateWithLoading,
          setMenusSuccess({
            menus: mockMenuList,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
          })
        );
        expect(state.menus).toEqual(mockMenuList);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
        expect(state.loading).toBe(false);
      });
    });

    describe('setMenuError', () => {
      it('stops loading', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          loading: true,
        };
        const state = menuReducer(stateWithLoading, setMenuError());
        expect(state.loading).toBe(false);
      });
    });

    describe('setAllMenusLoading', () => {
      it('sets all menus loading to true', () => {
        const state = menuReducer(initialState, setAllMenusLoading(true));
        expect(state.allMenusLoading).toBe(true);
      });

      it('sets all menus loading to false', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          allMenusLoading: true,
        };
        const state = menuReducer(stateWithLoading, setAllMenusLoading(false));
        expect(state.allMenusLoading).toBe(false);
      });
    });

    describe('setAllMenusSuccess', () => {
      it('sets all menus and stops loading', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          allMenusLoading: true,
        };
        const state = menuReducer(stateWithLoading, setAllMenusSuccess(mockMenuList));
        expect(state.allMenus).toEqual(mockMenuList);
        expect(state.allMenusLoading).toBe(false);
      });
    });

    describe('setAllMenusError', () => {
      it('stops all menus loading', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          allMenusLoading: true,
        };
        const state = menuReducer(stateWithLoading, setAllMenusError());
        expect(state.allMenusLoading).toBe(false);
      });
    });

    describe('setCurrentMenuLoading', () => {
      it('sets current loading to true', () => {
        const state = menuReducer(initialState, setCurrentMenuLoading(true));
        expect(state.currentLoading).toBe(true);
      });

      it('sets current loading to false', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          currentLoading: true,
        };
        const state = menuReducer(stateWithLoading, setCurrentMenuLoading(false));
        expect(state.currentLoading).toBe(false);
      });
    });

    describe('setCurrentMenuSuccess', () => {
      it('sets current menu and stops loading', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          currentLoading: true,
        };
        const state = menuReducer(stateWithLoading, setCurrentMenuSuccess(mockMenu));
        expect(state.currentMenu).toEqual(mockMenu);
        expect(state.currentLoading).toBe(false);
      });
    });

    describe('setCurrentMenuError', () => {
      it('stops current loading', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          currentLoading: true,
        };
        const state = menuReducer(stateWithLoading, setCurrentMenuError());
        expect(state.currentLoading).toBe(false);
      });
    });

    describe('clearCurrentMenu', () => {
      it('clears current menu', () => {
        const stateWithMenu: MenuState = {
          ...initialState,
          currentMenu: mockMenu,
        };
        const state = menuReducer(stateWithMenu, clearCurrentMenu());
        expect(state.currentMenu).toBe(null);
      });
    });

    describe('setCreateMenuLoading', () => {
      it('sets create loading to true', () => {
        const state = menuReducer(initialState, setCreateMenuLoading(true));
        expect(state.createLoading).toBe(true);
      });

      it('sets create loading to false', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          createLoading: true,
        };
        const state = menuReducer(stateWithLoading, setCreateMenuLoading(false));
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setCreateMenuSuccess', () => {
      it('adds new menu to start of menus list and end of allMenus list', () => {
        const stateWithMenus: MenuState = {
          ...initialState,
          menus: [mockMenuList[1]],
          allMenus: [mockMenuList[1]],
          createLoading: true,
        };
        const state = menuReducer(stateWithMenus, setCreateMenuSuccess(mockMenu));
        expect(state.menus).toEqual([mockMenu, mockMenuList[1]]);
        expect(state.allMenus).toEqual([mockMenuList[1], mockMenu]);
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setCreateMenuError', () => {
      it('stops create loading', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          createLoading: true,
        };
        const state = menuReducer(stateWithLoading, setCreateMenuError());
        expect(state.createLoading).toBe(false);
      });
    });

    describe('setUpdateMenuLoading', () => {
      it('sets update loading to true', () => {
        const state = menuReducer(initialState, setUpdateMenuLoading(true));
        expect(state.updateLoading).toBe(true);
      });

      it('sets update loading to false', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          updateLoading: true,
        };
        const state = menuReducer(stateWithLoading, setUpdateMenuLoading(false));
        expect(state.updateLoading).toBe(false);
      });
    });

    describe('setUpdateMenuSuccess', () => {
      it('updates menu in both menus and allMenus lists', () => {
        const stateWithMenus: MenuState = {
          ...initialState,
          menus: mockMenuList,
          allMenus: mockMenuList,
          updateLoading: true,
        };
        const updatedMenu: Menu = { ...mockMenu, name: 'Updated Menu' };
        const state = menuReducer(stateWithMenus, setUpdateMenuSuccess(updatedMenu));
        expect(state.menus[0].name).toBe('Updated Menu');
        expect(state.allMenus[0].name).toBe('Updated Menu');
        expect(state.updateLoading).toBe(false);
      });

      it('updates current menu if id matches', () => {
        const stateWithCurrent: MenuState = {
          ...initialState,
          menus: mockMenuList,
          allMenus: mockMenuList,
          currentMenu: mockMenu,
          updateLoading: true,
        };
        const updatedMenu: Menu = { ...mockMenu, name: 'Updated Menu' };
        const state = menuReducer(stateWithCurrent, setUpdateMenuSuccess(updatedMenu));
        expect(state.currentMenu?.name).toBe('Updated Menu');
      });

      it('does not update current menu if id does not match', () => {
        const stateWithCurrent: MenuState = {
          ...initialState,
          menus: mockMenuList,
          allMenus: mockMenuList,
          currentMenu: mockMenuList[1],
          updateLoading: true,
        };
        const updatedMenu: Menu = { ...mockMenu, name: 'Updated Menu' };
        const state = menuReducer(stateWithCurrent, setUpdateMenuSuccess(updatedMenu));
        expect(state.currentMenu?.id).toBe('menu2');
        expect(state.currentMenu?.name).toBe('Menu 2');
      });
    });

    describe('setUpdateMenuError', () => {
      it('stops update loading', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          updateLoading: true,
        };
        const state = menuReducer(stateWithLoading, setUpdateMenuError());
        expect(state.updateLoading).toBe(false);
      });
    });

    describe('setDeleteMenuLoading', () => {
      it('sets delete loading to true', () => {
        const state = menuReducer(initialState, setDeleteMenuLoading(true));
        expect(state.deleteLoading).toBe(true);
      });

      it('sets delete loading to false', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          deleteLoading: true,
        };
        const state = menuReducer(stateWithLoading, setDeleteMenuLoading(false));
        expect(state.deleteLoading).toBe(false);
      });
    });

    describe('setDeleteMenuSuccess', () => {
      it('removes menu from both menus and allMenus lists', () => {
        const stateWithMenus: MenuState = {
          ...initialState,
          menus: mockMenuList,
          allMenus: mockMenuList,
          deleteLoading: true,
        };
        const state = menuReducer(stateWithMenus, setDeleteMenuSuccess('menu1'));
        expect(state.menus).toEqual([mockMenuList[1]]);
        expect(state.allMenus).toEqual([mockMenuList[1]]);
        expect(state.deleteLoading).toBe(false);
      });

      it('clears current menu if id matches', () => {
        const stateWithCurrent: MenuState = {
          ...initialState,
          menus: mockMenuList,
          allMenus: mockMenuList,
          currentMenu: mockMenu,
          deleteLoading: true,
        };
        const state = menuReducer(stateWithCurrent, setDeleteMenuSuccess('menu1'));
        expect(state.currentMenu).toBe(null);
      });

      it('does not clear current menu if id does not match', () => {
        const stateWithCurrent: MenuState = {
          ...initialState,
          menus: mockMenuList,
          allMenus: mockMenuList,
          currentMenu: mockMenuList[1],
          deleteLoading: true,
        };
        const state = menuReducer(stateWithCurrent, setDeleteMenuSuccess('menu1'));
        expect(state.currentMenu?.id).toBe('menu2');
      });
    });

    describe('setDeleteMenuError', () => {
      it('stops delete loading', () => {
        const stateWithLoading: MenuState = {
          ...initialState,
          deleteLoading: true,
        };
        const state = menuReducer(stateWithLoading, setDeleteMenuError());
        expect(state.deleteLoading).toBe(false);
      });
    });

    describe('setSearchQuery', () => {
      it('sets search query', () => {
        const state = menuReducer(initialState, setSearchQuery('test'));
        expect(state.searchQuery).toBe('test');
      });

      it('replaces existing search query', () => {
        const stateWithQuery: MenuState = {
          ...initialState,
          searchQuery: 'old',
        };
        const state = menuReducer(stateWithQuery, setSearchQuery('new'));
        expect(state.searchQuery).toBe('new');
      });
    });

    describe('setStatusFilter', () => {
      it('sets status filter to active', () => {
        const state = menuReducer(initialState, setStatusFilter('active'));
        expect(state.statusFilter).toBe('active');
      });

      it('sets status filter to inactive', () => {
        const state = menuReducer(initialState, setStatusFilter('inactive'));
        expect(state.statusFilter).toBe('inactive');
      });

      it('sets status filter to all', () => {
        const stateWithFilter: MenuState = {
          ...initialState,
          statusFilter: 'active',
        };
        const state = menuReducer(stateWithFilter, setStatusFilter('all'));
        expect(state.statusFilter).toBe('all');
      });
    });

    describe('resetMenuState', () => {
      it('resets menus, loading, pagination, searchQuery, and statusFilter', () => {
        const stateWithData: MenuState = {
          ...initialState,
          menus: mockMenuList,
          loading: true,
          pagination: { page: 5, limit: 20, total: 100, totalPages: 5 },
          searchQuery: 'test',
          statusFilter: 'active',
          allMenus: mockMenuList,
          currentMenu: mockMenu,
        };
        const state = menuReducer(stateWithData, resetMenuState());
        expect(state.menus).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
        expect(state.searchQuery).toBe('');
        expect(state.statusFilter).toBe('all');
      });

      it('does not reset allMenus, currentMenu, and other loading states', () => {
        const stateWithData: MenuState = {
          ...initialState,
          allMenus: mockMenuList,
          currentMenu: mockMenu,
          allMenusLoading: true,
          currentLoading: true,
          createLoading: true,
          updateLoading: true,
          deleteLoading: true,
        };
        const state = menuReducer(stateWithData, resetMenuState());
        expect(state.allMenus).toEqual(mockMenuList);
        expect(state.currentMenu).toEqual(mockMenu);
        expect(state.allMenusLoading).toBe(true);
        expect(state.currentLoading).toBe(true);
        expect(state.createLoading).toBe(true);
        expect(state.updateLoading).toBe(true);
        expect(state.deleteLoading).toBe(true);
      });
    });
  });

  describe('saga actions', () => {
    describe('getMenusRequest', () => {
      it('creates correct action type', () => {
        const action = getMenusRequest({
          page: 1,
          limit: 10,
        });
        expect(action.type).toBe('menu/getMenusRequest');
      });

      it('includes pagination in payload', () => {
        const action = getMenusRequest({
          page: 2,
          limit: 20,
        });
        expect(action.payload.page).toBe(2);
        expect(action.payload.limit).toBe(20);
      });

      it('includes search in payload', () => {
        const action = getMenusRequest({
          search: 'test',
        });
        expect(action.payload.search).toBe('test');
      });

      it('includes status in payload', () => {
        const action = getMenusRequest({
          status: 'active' as any,
        });
        expect(action.payload.status).toBe('active');
      });
    });

    describe('getAllMenusRequest', () => {
      it('creates correct action type', () => {
        const action = getAllMenusRequest({});
        expect(action.type).toBe('menu/getAllMenusRequest');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = getAllMenusRequest({ onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('getMenuByIdRequest', () => {
      it('creates correct action type', () => {
        const action = getMenuByIdRequest({ id: 'menu1' });
        expect(action.type).toBe('menu/getMenuByIdRequest');
      });

      it('includes id in payload', () => {
        const action = getMenuByIdRequest({ id: 'menu1' });
        expect(action.payload.id).toBe('menu1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = getMenuByIdRequest({ id: 'menu1', onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('createMenuRequest', () => {
      it('creates correct action type', () => {
        const action = createMenuRequest({
          data: { name: 'New Menu' } as any,
        });
        expect(action.type).toBe('menu/createMenuRequest');
      });

      it('includes data in payload', () => {
        const data = { name: 'New Menu' } as any;
        const action = createMenuRequest({ data });
        expect(action.payload.data).toEqual(data);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = createMenuRequest({
          data: { name: 'New Menu' } as any,
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('updateMenuRequest', () => {
      it('creates correct action type', () => {
        const action = updateMenuRequest({
          id: 'menu1',
          data: { name: 'Updated Menu' },
        });
        expect(action.type).toBe('menu/updateMenuRequest');
      });

      it('includes id and data in payload', () => {
        const action = updateMenuRequest({
          id: 'menu1',
          data: { name: 'Updated Menu' },
        });
        expect(action.payload.id).toBe('menu1');
        expect(action.payload.data).toEqual({ name: 'Updated Menu' });
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = updateMenuRequest({
          id: 'menu1',
          data: { name: 'Updated' },
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('deleteMenuRequest', () => {
      it('creates correct action type', () => {
        const action = deleteMenuRequest({ id: 'menu1' });
        expect(action.type).toBe('menu/deleteMenuRequest');
      });

      it('includes id in payload', () => {
        const action = deleteMenuRequest({ id: 'menu1' });
        expect(action.payload.id).toBe('menu1');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = deleteMenuRequest({ id: 'menu1', onSuccess });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('reorderMenusRequest', () => {
      it('creates correct action type', () => {
        const action = reorderMenusRequest({
          menus: [{ menuId: 'menu1', order: 1 }],
        });
        expect(action.type).toBe('menu/reorderMenusRequest');
      });

      it('includes menus in payload', () => {
        const menus = [
          { menuId: 'menu1', order: 1 },
          { menuId: 'menu2', order: 2 },
        ];
        const action = reorderMenusRequest({ menus });
        expect(action.payload.menus).toEqual(menus);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = () => {};
        const action = reorderMenusRequest({
          menus: [{ menuId: 'menu1', order: 1 }],
          onSuccess,
        });
        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });
  });

  describe('selectors', () => {
    describe('selectMenus', () => {
      it('returns empty array for initial state', () => {
        expect(selectMenus({ menu: initialState })).toEqual([]);
      });

      it('returns menus when present', () => {
        const state: MenuState = { ...initialState, menus: mockMenuList };
        expect(selectMenus({ menu: state })).toEqual(mockMenuList);
      });
    });

    describe('selectAllMenus', () => {
      it('returns empty array for initial state', () => {
        expect(selectAllMenus({ menu: initialState })).toEqual([]);
      });

      it('returns all menus when present', () => {
        const state: MenuState = { ...initialState, allMenus: mockMenuList };
        expect(selectAllMenus({ menu: state })).toEqual(mockMenuList);
      });
    });

    describe('selectCurrentMenu', () => {
      it('returns null for initial state', () => {
        expect(selectCurrentMenu({ menu: initialState })).toBe(null);
      });

      it('returns current menu when present', () => {
        const state: MenuState = { ...initialState, currentMenu: mockMenu };
        expect(selectCurrentMenu({ menu: state })).toEqual(mockMenu);
      });
    });

    describe('selectMenuLoading', () => {
      it('returns false for initial state', () => {
        expect(selectMenuLoading({ menu: initialState })).toBe(false);
      });

      it('returns true when loading', () => {
        const state: MenuState = { ...initialState, loading: true };
        expect(selectMenuLoading({ menu: state })).toBe(true);
      });
    });

    describe('selectAllMenusLoading', () => {
      it('returns false for initial state', () => {
        expect(selectAllMenusLoading({ menu: initialState })).toBe(false);
      });

      it('returns true when loading all menus', () => {
        const state: MenuState = { ...initialState, allMenusLoading: true };
        expect(selectAllMenusLoading({ menu: state })).toBe(true);
      });
    });

    describe('selectCurrentMenuLoading', () => {
      it('returns false for initial state', () => {
        expect(selectCurrentMenuLoading({ menu: initialState })).toBe(false);
      });

      it('returns true when loading current', () => {
        const state: MenuState = { ...initialState, currentLoading: true };
        expect(selectCurrentMenuLoading({ menu: state })).toBe(true);
      });
    });

    describe('selectCreateMenuLoading', () => {
      it('returns false for initial state', () => {
        expect(selectCreateMenuLoading({ menu: initialState })).toBe(false);
      });

      it('returns true when creating', () => {
        const state: MenuState = { ...initialState, createLoading: true };
        expect(selectCreateMenuLoading({ menu: state })).toBe(true);
      });
    });

    describe('selectUpdateMenuLoading', () => {
      it('returns false for initial state', () => {
        expect(selectUpdateMenuLoading({ menu: initialState })).toBe(false);
      });

      it('returns true when updating', () => {
        const state: MenuState = { ...initialState, updateLoading: true };
        expect(selectUpdateMenuLoading({ menu: state })).toBe(true);
      });
    });

    describe('selectDeleteMenuLoading', () => {
      it('returns false for initial state', () => {
        expect(selectDeleteMenuLoading({ menu: initialState })).toBe(false);
      });

      it('returns true when deleting', () => {
        const state: MenuState = { ...initialState, deleteLoading: true };
        expect(selectDeleteMenuLoading({ menu: state })).toBe(true);
      });
    });

    describe('selectMenuPagination', () => {
      it('returns initial pagination for initial state', () => {
        expect(selectMenuPagination({ menu: initialState })).toEqual({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      });

      it('returns current pagination', () => {
        const state: MenuState = {
          ...initialState,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        };
        expect(selectMenuPagination({ menu: state })).toEqual({
          page: 2,
          limit: 20,
          total: 100,
          totalPages: 5,
        });
      });
    });

    describe('selectMenuSearchQuery', () => {
      it('returns empty string for initial state', () => {
        expect(selectMenuSearchQuery({ menu: initialState })).toBe('');
      });

      it('returns current search query', () => {
        const state: MenuState = { ...initialState, searchQuery: 'test' };
        expect(selectMenuSearchQuery({ menu: state })).toBe('test');
      });
    });

    describe('selectMenuStatusFilter', () => {
      it('returns "all" for initial state', () => {
        expect(selectMenuStatusFilter({ menu: initialState })).toBe('all');
      });

      it('returns current status filter', () => {
        const state: MenuState = { ...initialState, statusFilter: 'active' };
        expect(selectMenuStatusFilter({ menu: state })).toBe('active');
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete CRUD flow', () => {
      // Create
      let state = menuReducer(initialState, setCreateMenuLoading(true));
      state = menuReducer(state, setCreateMenuSuccess(mockMenu));
      expect(selectMenus({ menu: state })).toEqual([mockMenu]);
      expect(selectAllMenus({ menu: state })).toEqual([mockMenu]);
      expect(selectCreateMenuLoading({ menu: state })).toBe(false);

      // Read
      state = menuReducer(state, setMenuLoading(true));
      state = menuReducer(
        state,
        setMenusSuccess({
          menus: mockMenuList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );
      expect(selectMenus({ menu: state })).toEqual(mockMenuList);

      // Update
      state = menuReducer(state, setUpdateMenuLoading(true));
      const updatedMenu: Menu = { ...mockMenu, name: 'Updated Menu' };
      state = menuReducer(state, setUpdateMenuSuccess(updatedMenu));
      expect(selectMenus({ menu: state })[0].name).toBe('Updated Menu');
      expect(selectUpdateMenuLoading({ menu: state })).toBe(false);

      // Delete
      state = menuReducer(state, setDeleteMenuLoading(true));
      state = menuReducer(state, setDeleteMenuSuccess('menu1'));
      expect(selectMenus({ menu: state })).toEqual([mockMenuList[1]]);
      expect(selectDeleteMenuLoading({ menu: state })).toBe(false);
    });

    it('handles dual list management', () => {
      // Create adds to both lists
      let state = menuReducer(initialState, setCreateMenuSuccess(mockMenu));
      expect(state.menus).toEqual([mockMenu]);
      expect(state.allMenus).toEqual([mockMenu]);

      // Update modifies both lists
      const updatedMenu: Menu = { ...mockMenu, name: 'Updated' };
      state = menuReducer(state, setUpdateMenuSuccess(updatedMenu));
      expect(state.menus[0].name).toBe('Updated');
      expect(state.allMenus[0].name).toBe('Updated');

      // Delete removes from both lists
      state = menuReducer(state, setDeleteMenuSuccess('menu1'));
      expect(state.menus).toEqual([]);
      expect(state.allMenus).toEqual([]);
    });

    it('handles independent loading states', () => {
      let state = menuReducer(initialState, setMenuLoading(true));
      state = menuReducer(state, setAllMenusLoading(true));
      state = menuReducer(state, setCurrentMenuLoading(true));
      state = menuReducer(state, setCreateMenuLoading(true));
      state = menuReducer(state, setUpdateMenuLoading(true));
      state = menuReducer(state, setDeleteMenuLoading(true));

      expect(state.loading).toBe(true);
      expect(state.allMenusLoading).toBe(true);
      expect(state.currentLoading).toBe(true);
      expect(state.createLoading).toBe(true);
      expect(state.updateLoading).toBe(true);
      expect(state.deleteLoading).toBe(true);

      // Each can be stopped independently
      state = menuReducer(state, setMenuLoading(false));
      expect(state.loading).toBe(false);
      expect(state.allMenusLoading).toBe(true);
    });

    it('handles search and filter flow', () => {
      let state = menuReducer(initialState, setSearchQuery('test'));
      state = menuReducer(state, setStatusFilter('active'));

      state = menuReducer(state, setMenuLoading(true));
      state = menuReducer(
        state,
        setMenusSuccess({
          menus: mockMenuList,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
        })
      );

      expect(selectMenuSearchQuery({ menu: state })).toBe('test');
      expect(selectMenuStatusFilter({ menu: state })).toBe('active');
      expect(selectMenus({ menu: state })).toEqual(mockMenuList);
    });

    it('handles reset flow', () => {
      let state = menuReducer(
        initialState,
        setMenusSuccess({
          menus: mockMenuList,
          pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
        })
      );
      state = menuReducer(state, setSearchQuery('test'));
      state = menuReducer(state, setStatusFilter('active'));

      state = menuReducer(state, resetMenuState());
      expect(selectMenus({ menu: state })).toEqual([]);
      expect(selectMenuPagination({ menu: state })).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      expect(selectMenuSearchQuery({ menu: state })).toBe('');
      expect(selectMenuStatusFilter({ menu: state })).toBe('all');
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = menuReducer(initialState, { type: 'UNKNOWN_ACTION' } as any);
      expect(state).toEqual(initialState);
    });

    it('handles update when menu not in lists', () => {
      const stateWithMenus: MenuState = {
        ...initialState,
        menus: [mockMenuList[1]],
        allMenus: [mockMenuList[1]],
      };
      const updatedMenu: Menu = { ...mockMenu, name: 'Updated Menu' };
      const state = menuReducer(stateWithMenus, setUpdateMenuSuccess(updatedMenu));
      expect(state.menus).toEqual([mockMenuList[1]]);
      expect(state.allMenus).toEqual([mockMenuList[1]]);
    });

    it('handles delete when menu not in lists', () => {
      const stateWithMenus: MenuState = {
        ...initialState,
        menus: [mockMenuList[1]],
        allMenus: [mockMenuList[1]],
      };
      const state = menuReducer(stateWithMenus, setDeleteMenuSuccess('menu1'));
      expect(state.menus).toEqual([mockMenuList[1]]);
      expect(state.allMenus).toEqual([mockMenuList[1]]);
    });

    it('handles create with empty lists', () => {
      const state = menuReducer(initialState, setCreateMenuSuccess(mockMenu));
      expect(state.menus).toEqual([mockMenu]);
      expect(state.allMenus).toEqual([mockMenu]);
    });

    it('creates adds to different positions in menus vs allMenus', () => {
      const stateWithMenus: MenuState = {
        ...initialState,
        menus: [mockMenuList[1]],
        allMenus: [mockMenuList[1]],
      };
      const state = menuReducer(stateWithMenus, setCreateMenuSuccess(mockMenu));
      // Added to start of menus
      expect(state.menus[0].id).toBe('menu1');
      // Added to end of allMenus
      expect(state.allMenus[1].id).toBe('menu1');
    });
  });
});
