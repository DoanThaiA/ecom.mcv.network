import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type { Menu } from 'src/types/gen/shared/shared/menus/menu';
import type { CreateMenuRequest, UpdateMenuRequest } from 'src/types/gen/cms/cms/menus/menu';
import type { MenuStatus } from 'src/types/gen/shared/shared/common/enums';

/**
 * Menu Pagination
 */
export interface MenuPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Menu State
 */
export interface MenuState {
  menus: Menu[];
  allMenus: Menu[]; // For parent select dropdown
  currentMenu: Menu | null;
  loading: boolean;
  allMenusLoading: boolean;
  currentLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  pagination: MenuPagination;
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'inactive';
}

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

/**
 * Saga Action Payload Types
 */
export type GetMenusPayload = {
  search?: string;
  status?: MenuStatus;
};

export type GetAllMenusPayload = {
  onSuccess?: (menus: Menu[]) => void;
};

export type GetMenuByIdPayload = {
  id: string;
  onSuccess?: (menu: Menu) => void;
};

export type CreateMenuPayload = {
  data: CreateMenuRequest;
  onSuccess?: (menu: Menu) => void;
};

export type UpdateMenuPayload = {
  id: string;
  data: Omit<UpdateMenuRequest, 'menuId'>;
  onSuccess?: (menu: Menu) => void;
};

export type DeleteMenuPayload = {
  id: string;
  onSuccess?: () => void;
};

export type ReorderMenusPayload = {
  menus: { menuId: string; order: number }[];
  onSuccess?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getMenusRequest = createAction<GetMenusPayload>('menu/getMenusRequest');
export const getAllMenusRequest = createAction<GetAllMenusPayload>('menu/getAllMenusRequest');
export const getMenuByIdRequest = createAction<GetMenuByIdPayload>('menu/getMenuByIdRequest');
export const createMenuRequest = createAction<CreateMenuPayload>('menu/createMenuRequest');
export const updateMenuRequest = createAction<UpdateMenuPayload>('menu/updateMenuRequest');
export const deleteMenuRequest = createAction<DeleteMenuPayload>('menu/deleteMenuRequest');
export const reorderMenusRequest = createAction<ReorderMenusPayload>('menu/reorderMenusRequest');

/**
 * Menu Slice
 */
export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    // List menus
    setMenuLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setMenusSuccess: (
      state,
      action: PayloadAction<{
        menus: Menu[];
      }>
    ) => {
      state.menus = action.payload.menus;
      state.loading = false;
    },

    setMenuError: (state) => {
      state.loading = false;
    },

    // All menus (for dropdown)
    setAllMenusLoading: (state, action: PayloadAction<boolean>) => {
      state.allMenusLoading = action.payload;
    },

    setAllMenusSuccess: (state, action: PayloadAction<Menu[]>) => {
      state.allMenus = action.payload;
      state.allMenusLoading = false;
    },

    setAllMenusError: (state) => {
      state.allMenusLoading = false;
    },

    // Get single menu by ID
    setCurrentMenuLoading: (state, action: PayloadAction<boolean>) => {
      state.currentLoading = action.payload;
    },

    setCurrentMenuSuccess: (state, action: PayloadAction<Menu>) => {
      state.currentMenu = action.payload;
      state.currentLoading = false;
    },

    setCurrentMenuError: (state) => {
      state.currentLoading = false;
    },

    clearCurrentMenu: (state) => {
      state.currentMenu = null;
    },

    // Create menu
    setCreateMenuLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },

    setCreateMenuSuccess: (state, action: PayloadAction<Menu>) => {
      state.menus.unshift(action.payload);
      state.allMenus.push(action.payload);
      state.createLoading = false;
    },

    setCreateMenuError: (state) => {
      state.createLoading = false;
    },

    // Update menu
    setUpdateMenuLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },

    setUpdateMenuSuccess: (state, action: PayloadAction<Menu>) => {
      const index = state.menus.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.menus[index] = action.payload;
      }
      const allIndex = state.allMenus.findIndex((m) => m.id === action.payload.id);
      if (allIndex !== -1) {
        state.allMenus[allIndex] = action.payload;
      }
      if (state.currentMenu?.id === action.payload.id) {
        state.currentMenu = action.payload;
      }
      state.updateLoading = false;
    },

    setUpdateMenuError: (state) => {
      state.updateLoading = false;
    },

    // Delete menu
    setDeleteMenuLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },

    setDeleteMenuSuccess: (state, action: PayloadAction<string>) => {
      state.menus = state.menus.filter((m) => m.id !== action.payload);
      state.allMenus = state.allMenus.filter((m) => m.id !== action.payload);
      if (state.currentMenu?.id === action.payload) {
        state.currentMenu = null;
      }
      state.deleteLoading = false;
    },

    setDeleteMenuError: (state) => {
      state.deleteLoading = false;
    },

    // Filters
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setStatusFilter: (state, action: PayloadAction<'all' | 'active' | 'inactive'>) => {
      state.statusFilter = action.payload;
    },

    // Reset state
    resetMenuState: (state) => {
      state.menus = [];
      state.loading = false;
      state.pagination = initialState.pagination;
      state.searchQuery = '';
      state.statusFilter = 'all';
    },
  },
});

export const {
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
} = menuSlice.actions;

/**
 * Selectors
 */
export const selectMenus = (state: { menu: MenuState }) => state.menu.menus;

export const selectAllMenus = (state: { menu: MenuState }) => state.menu.allMenus;

export const selectCurrentMenu = (state: { menu: MenuState }) => state.menu.currentMenu;

export const selectMenuLoading = (state: { menu: MenuState }) => state.menu.loading;

export const selectAllMenusLoading = (state: { menu: MenuState }) => state.menu.allMenusLoading;

export const selectCurrentMenuLoading = (state: { menu: MenuState }) => state.menu.currentLoading;

export const selectCreateMenuLoading = (state: { menu: MenuState }) => state.menu.createLoading;

export const selectUpdateMenuLoading = (state: { menu: MenuState }) => state.menu.updateLoading;

export const selectDeleteMenuLoading = (state: { menu: MenuState }) => state.menu.deleteLoading;

export const selectMenuPagination = (state: { menu: MenuState }) => state.menu.pagination;

export const selectMenuSearchQuery = (state: { menu: MenuState }) => state.menu.searchQuery;

export const selectMenuStatusFilter = (state: { menu: MenuState }) => state.menu.statusFilter;

export default menuSlice.reducer;
