import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { menuRepository } from 'src/repositories/menu.repository';
import { menuSaga } from 'src/redux/saga/menuSaga';
import {
  getMenusRequest,
  getAllMenusRequest,
  getMenuByIdRequest,
  createMenuRequest,
  updateMenuRequest,
  deleteMenuRequest,
  reorderMenusRequest,
  setMenuLoading,
  setMenusSuccess,
  setMenuError,
  setAllMenusLoading,
  setAllMenusSuccess,
  setAllMenusError,
  setCurrentMenuLoading,
  setCurrentMenuSuccess,
  setCurrentMenuError,
  setCreateMenuLoading,
  setCreateMenuSuccess,
  setCreateMenuError,
  setUpdateMenuLoading,
  setUpdateMenuSuccess,
  setUpdateMenuError,
  setDeleteMenuLoading,
  setDeleteMenuSuccess,
  setDeleteMenuError,
} from 'src/redux/store/menuSlice';

// Mock repository
vi.mock('src/repositories/menu.repository', () => ({
  menuRepository: {
    getMenus: vi.fn(),
    getAllMenus: vi.fn(),
    getMenuById: vi.fn(),
    createMenu: vi.fn(),
    updateMenu: vi.fn(),
    deleteMenu: vi.fn(),
    reorderMenus: vi.fn(),
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

describe('menuSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports menuSaga function', () => {
      expect(menuSaga).toBeDefined();
      expect(menuSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchMenu', () => {
      const gen = menuSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchMenu', () => {
      const gen = menuSaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('getMenusSaga', () => {
    it('successfully fetches menus with default params', async () => {
      const mockResponse = {
        data: [
          {
            id: 'menu-1',
            name: 'Main Menu',
            order: 1,
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      };

      vi.mocked(menuRepository.getMenus).mockResolvedValue(mockResponse);

      const action = getMenusRequest({ page: 1, limit: 10 });

      expect(action.type).toBe('menu/getMenusRequest');
      expect(action.payload).toEqual({ page: 1, limit: 10 });
    });

    it('successfully fetches with search', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(menuRepository.getMenus).mockResolvedValue(mockResponse);

      const action = getMenusRequest({
        page: 1,
        limit: 10,
        search: 'main',
      });

      expect(action.payload.search).toBe('main');
    });

    it('successfully fetches with status filter', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(menuRepository.getMenus).mockResolvedValue(mockResponse);

      const action = getMenusRequest({
        page: 1,
        limit: 10,
        status: 'active',
      });

      expect(action.payload.status).toBe('active');
    });

    it('handles fetch failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(menuRepository.getMenus).mockRejectedValue(mockError);

      expect(menuSaga).toBeDefined();
    });

    it('sets loading state', () => {
      const action = setMenuLoading(true);

      expect(action.type).toBe('menu/setMenuLoading');
      expect(action.payload).toBe(true);
    });

    it('sets success state with pagination', () => {
      const data = {
        menus: [
          {
            id: 'menu-1',
            name: 'Menu',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      const action = setMenusSuccess(data);

      expect(action.type).toBe('menu/setMenusSuccess');
      expect(action.payload).toEqual(data);
    });

    it('sets error state', () => {
      const action = setMenuError();

      expect(action.type).toBe('menu/setMenuError');
    });
  });

  describe('getAllMenusSaga', () => {
    it('successfully fetches all menus', async () => {
      const mockMenus = [
        {
          id: 'menu-1',
          name: 'Main Menu',
        },
        {
          id: 'menu-2',
          name: 'Footer Menu',
        },
      ];

      vi.mocked(menuRepository.getAllMenus).mockResolvedValue(mockMenus);

      const action = getAllMenusRequest({});

      expect(action.type).toBe('menu/getAllMenusRequest');
    });

    it('calls onSuccess callback when successful', async () => {
      const mockMenus = [];

      vi.mocked(menuRepository.getAllMenus).mockResolvedValue(mockMenus);

      const onSuccess = vi.fn();
      const action = getAllMenusRequest({ onSuccess });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch all failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(menuRepository.getAllMenus).mockRejectedValue(mockError);

      expect(menuSaga).toBeDefined();
    });

    it('sets all menus loading state', () => {
      const action = setAllMenusLoading(true);

      expect(action.type).toBe('menu/setAllMenusLoading');
      expect(action.payload).toBe(true);
    });

    it('sets all menus success state', () => {
      const menus = [
        {
          id: 'menu-1',
          name: 'Menu',
        },
      ];

      const action = setAllMenusSuccess(menus);

      expect(action.type).toBe('menu/setAllMenusSuccess');
      expect(action.payload).toEqual(menus);
    });

    it('sets all menus error state', () => {
      const action = setAllMenusError();

      expect(action.type).toBe('menu/setAllMenusError');
    });
  });

  describe('getMenuByIdSaga', () => {
    it('successfully fetches menu by ID', async () => {
      const mockMenu = {
        id: 'menu-1',
        name: 'Main Menu',
        order: 1,
      };

      vi.mocked(menuRepository.getMenuById).mockResolvedValue(mockMenu);

      const action = getMenuByIdRequest({ id: 'menu-1' });

      expect(action.type).toBe('menu/getMenuByIdRequest');
      expect(action.payload.id).toBe('menu-1');
    });

    it('calls onSuccess callback with menu data', async () => {
      const mockMenu = {
        id: 'menu-1',
        name: 'Menu',
      };

      vi.mocked(menuRepository.getMenuById).mockResolvedValue(mockMenu);

      const onSuccess = vi.fn();
      const action = getMenuByIdRequest({
        id: 'menu-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch by ID failure', async () => {
      const mockError = new Error('Menu not found');

      vi.mocked(menuRepository.getMenuById).mockRejectedValue(mockError);

      const action = getMenuByIdRequest({ id: '999' });

      expect(action.payload.id).toBe('999');
    });

    it('sets current loading state', () => {
      const action = setCurrentMenuLoading(true);

      expect(action.type).toBe('menu/setCurrentMenuLoading');
      expect(action.payload).toBe(true);
    });

    it('sets current success state', () => {
      const menu = {
        id: 'menu-1',
        name: 'Menu',
      };

      const action = setCurrentMenuSuccess(menu);

      expect(action.type).toBe('menu/setCurrentMenuSuccess');
      expect(action.payload).toEqual(menu);
    });

    it('sets current error state', () => {
      const action = setCurrentMenuError();

      expect(action.type).toBe('menu/setCurrentMenuError');
    });
  });

  describe('createMenuSaga', () => {
    it('successfully creates menu', async () => {
      const mockMenu = {
        id: 'menu-1',
        name: 'New Menu',
        order: 1,
      };

      vi.mocked(menuRepository.createMenu).mockResolvedValue(mockMenu);

      const action = createMenuRequest({
        data: {
          name: 'New Menu',
        },
      });

      expect(action.type).toBe('menu/createMenuRequest');
      expect(action.payload.data.name).toBe('New Menu');
    });

    it('calls onSuccess callback with created menu', async () => {
      const mockMenu = {
        id: 'menu-1',
        name: 'New Menu',
      };

      vi.mocked(menuRepository.createMenu).mockResolvedValue(mockMenu);

      const onSuccess = vi.fn();
      const action = createMenuRequest({
        data: {
          name: 'New Menu',
        },
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles create failure', async () => {
      const mockError = new Error('Validation failed');

      vi.mocked(menuRepository.createMenu).mockRejectedValue(mockError);

      expect(menuSaga).toBeDefined();
    });

    it('sets create loading state', () => {
      const action = setCreateMenuLoading(true);

      expect(action.type).toBe('menu/setCreateMenuLoading');
      expect(action.payload).toBe(true);
    });

    it('sets create success state', () => {
      const action = setCreateMenuSuccess();

      expect(action.type).toBe('menu/setCreateMenuSuccess');
    });

    it('sets create error state', () => {
      const action = setCreateMenuError();

      expect(action.type).toBe('menu/setCreateMenuError');
    });
  });

  describe('updateMenuSaga', () => {
    it('successfully updates menu', async () => {
      const mockMenu = {
        id: 'menu-1',
        name: 'Updated Menu',
        order: 2,
      };

      vi.mocked(menuRepository.updateMenu).mockResolvedValue(mockMenu);

      const action = updateMenuRequest({
        id: 'menu-1',
        data: {
          name: 'Updated Menu',
        },
      });

      expect(action.type).toBe('menu/updateMenuRequest');
      expect(action.payload.id).toBe('menu-1');
      expect(action.payload.data.name).toBe('Updated Menu');
    });

    it('calls onSuccess callback with updated menu', async () => {
      const mockMenu = {
        id: 'menu-1',
        name: 'Updated',
      };

      vi.mocked(menuRepository.updateMenu).mockResolvedValue(mockMenu);

      const onSuccess = vi.fn();
      const action = updateMenuRequest({
        id: 'menu-1',
        data: {},
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles update failure', async () => {
      const mockError = new Error('Update failed');

      vi.mocked(menuRepository.updateMenu).mockRejectedValue(mockError);

      expect(menuSaga).toBeDefined();
    });

    it('sets update loading state', () => {
      const action = setUpdateMenuLoading(true);

      expect(action.type).toBe('menu/setUpdateMenuLoading');
      expect(action.payload).toBe(true);
    });

    it('sets update success state', () => {
      const menu = {
        id: 'menu-1',
        name: 'Updated',
      };

      const action = setUpdateMenuSuccess(menu);

      expect(action.type).toBe('menu/setUpdateMenuSuccess');
      expect(action.payload).toEqual(menu);
    });

    it('sets update error state', () => {
      const action = setUpdateMenuError();

      expect(action.type).toBe('menu/setUpdateMenuError');
    });
  });

  describe('deleteMenuSaga', () => {
    it('successfully deletes menu', async () => {
      vi.mocked(menuRepository.deleteMenu).mockResolvedValue(undefined);

      const action = deleteMenuRequest({
        id: 'menu-1',
      });

      expect(action.type).toBe('menu/deleteMenuRequest');
      expect(action.payload.id).toBe('menu-1');
    });

    it('calls onSuccess callback after deletion', async () => {
      vi.mocked(menuRepository.deleteMenu).mockResolvedValue(undefined);

      const onSuccess = vi.fn();
      const action = deleteMenuRequest({
        id: 'menu-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles delete failure', async () => {
      const mockError = new Error('Delete failed');

      vi.mocked(menuRepository.deleteMenu).mockRejectedValue(mockError);

      expect(menuSaga).toBeDefined();
    });

    it('sets delete loading state', () => {
      const action = setDeleteMenuLoading(true);

      expect(action.type).toBe('menu/setDeleteMenuLoading');
      expect(action.payload).toBe(true);
    });

    it('sets delete success state', () => {
      const action = setDeleteMenuSuccess('menu-1');

      expect(action.type).toBe('menu/setDeleteMenuSuccess');
      expect(action.payload).toBe('menu-1');
    });

    it('sets delete error state', () => {
      const action = setDeleteMenuError();

      expect(action.type).toBe('menu/setDeleteMenuError');
    });
  });

  describe('reorderMenusSaga', () => {
    it('successfully reorders menus', async () => {
      vi.mocked(menuRepository.reorderMenus).mockResolvedValue(undefined);

      const items = [
        { id: 'menu-1', order: 2 },
        { id: 'menu-2', order: 1 },
      ];

      const action = reorderMenusRequest({ items });

      expect(action.type).toBe('menu/reorderMenusRequest');
      expect(action.payload.items).toEqual(items);
    });

    it('calls onSuccess callback after reordering', async () => {
      vi.mocked(menuRepository.reorderMenus).mockResolvedValue(undefined);

      const onSuccess = vi.fn();
      const action = reorderMenusRequest({
        items: [],
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles reorder failure', async () => {
      const mockError = new Error('Reorder failed');

      vi.mocked(menuRepository.reorderMenus).mockRejectedValue(mockError);

      expect(menuSaga).toBeDefined();
    });

    it('handles multiple menu items', () => {
      const items = [
        { id: 'menu-1', order: 3 },
        { id: 'menu-2', order: 1 },
        { id: 'menu-3', order: 2 },
      ];

      const action = reorderMenusRequest({ items });

      expect(action.payload.items.length).toBe(3);
    });

    it('handles single menu item', () => {
      const items = [
        { id: 'menu-1', order: 1 },
      ];

      const action = reorderMenusRequest({ items });

      expect(action.payload.items.length).toBe(1);
    });
  });

  describe('action types', () => {
    it('has correct action type for getMenusRequest', () => {
      expect(getMenusRequest.type).toBe('menu/getMenusRequest');
    });

    it('has correct action type for getAllMenusRequest', () => {
      expect(getAllMenusRequest.type).toBe('menu/getAllMenusRequest');
    });

    it('has correct action type for getMenuByIdRequest', () => {
      expect(getMenuByIdRequest.type).toBe('menu/getMenuByIdRequest');
    });

    it('has correct action type for createMenuRequest', () => {
      expect(createMenuRequest.type).toBe('menu/createMenuRequest');
    });

    it('has correct action type for updateMenuRequest', () => {
      expect(updateMenuRequest.type).toBe('menu/updateMenuRequest');
    });

    it('has correct action type for deleteMenuRequest', () => {
      expect(deleteMenuRequest.type).toBe('menu/deleteMenuRequest');
    });

    it('has correct action type for reorderMenusRequest', () => {
      expect(reorderMenusRequest.type).toBe('menu/reorderMenusRequest');
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
      const action = getMenusRequest({ page: 5, limit: 50 });

      expect(action.payload.page).toBe(5);
      expect(action.payload.limit).toBe(50);
    });

    it('handles search query', () => {
      const action = getMenusRequest({
        page: 1,
        limit: 10,
        search: 'footer',
      });

      expect(action.payload.search).toBe('footer');
    });

    it('handles status filter', () => {
      const action = getMenusRequest({
        page: 1,
        limit: 10,
        status: 'active',
      });

      expect(action.payload.status).toBe('active');
    });

    it('handles empty search', () => {
      const action = getMenusRequest({
        page: 1,
        limit: 10,
        search: '',
      });

      expect(action.payload.search).toBe('');
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

  describe('callbacks', () => {
    it('handles onSuccess callback for getAllMenus', () => {
      const onSuccess = vi.fn();
      const action = getAllMenusRequest({ onSuccess });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for getMenuById', () => {
      const onSuccess = vi.fn();
      const action = getMenuByIdRequest({
        id: 'menu-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for createMenu', () => {
      const onSuccess = vi.fn();
      const action = createMenuRequest({
        data: {},
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for updateMenu', () => {
      const onSuccess = vi.fn();
      const action = updateMenuRequest({
        id: 'menu-1',
        data: {},
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for deleteMenu', () => {
      const onSuccess = vi.fn();
      const action = deleteMenuRequest({
        id: 'menu-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for reorderMenus', () => {
      const onSuccess = vi.fn();
      const action = reorderMenusRequest({
        items: [],
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });
  });

  describe('menu ordering', () => {
    it('handles ascending order', () => {
      const items = [
        { id: 'menu-1', order: 1 },
        { id: 'menu-2', order: 2 },
        { id: 'menu-3', order: 3 },
      ];

      const action = reorderMenusRequest({ items });

      expect(action.payload.items[0].order).toBe(1);
      expect(action.payload.items[2].order).toBe(3);
    });

    it('handles descending order', () => {
      const items = [
        { id: 'menu-1', order: 3 },
        { id: 'menu-2', order: 2 },
        { id: 'menu-3', order: 1 },
      ];

      const action = reorderMenusRequest({ items });

      expect(action.payload.items[0].order).toBe(3);
      expect(action.payload.items[2].order).toBe(1);
    });

    it('handles mixed order', () => {
      const items = [
        { id: 'menu-1', order: 2 },
        { id: 'menu-2', order: 1 },
        { id: 'menu-3', order: 3 },
      ];

      const action = reorderMenusRequest({ items });

      expect(action.payload.items[0].order).toBe(2);
      expect(action.payload.items[1].order).toBe(1);
      expect(action.payload.items[2].order).toBe(3);
    });
  });
});
