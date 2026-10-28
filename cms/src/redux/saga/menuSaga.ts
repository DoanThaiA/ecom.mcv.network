import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { menuRepository } from 'src/repositories/menu.repository';
import type { Menu } from 'src/types/gen/shared/shared/menus/menu';
import type { QueryMenusResponse } from 'src/types/gen/cms/cms/menus/menu';
import { showError, showSuccess } from 'src/utils/toast';
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
  type GetMenusPayload,
  type GetAllMenusPayload,
  type GetMenuByIdPayload,
  type CreateMenuPayload,
  type UpdateMenuPayload,
  type DeleteMenuPayload,
  type ReorderMenusPayload,
} from '../store/menuSlice';

/**
 * Get Menus Saga
 * Fetches menus with filters (no pagination)
 */
function* getMenusSaga(action: PayloadAction<GetMenusPayload>) {
  const { search, status } = action.payload;

  try {
    yield put(setMenuLoading(true));

    // Build filters
    const filters: { search?: string; status?: typeof status } = {};
    if (search) {
      filters.search = search;
    }
    if (status) {
      filters.status = status;
    }

    // Call API to get menus
    const response: QueryMenusResponse = yield call(menuRepository.getMenus, {
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      sort: [{ orderBy: 'order', order: 'asc' }],
    });

    // Update state with menus (no pagination)
    yield put(
      setMenusSuccess({
        menus: response.data,
      })
    );
  } catch (error) {
    yield put(setMenuError());
    showError(error);
  }
}

/**
 * Get All Menus Saga
 * Fetches all menus for parent dropdown
 */
function* getAllMenusSaga(action: PayloadAction<GetAllMenusPayload>) {
  const { onSuccess } = action.payload;

  try {
    yield put(setAllMenusLoading(true));

    // Call API to get all menus
    const menus: Menu[] = yield call(menuRepository.getAllMenus);

    // Update state with menus
    yield put(setAllMenusSuccess(menus));

    if (onSuccess) {
      onSuccess(menus);
    }
  } catch (error) {
    yield put(setAllMenusError());
    showError(error);
  }
}

/**
 * Get Menu By ID Saga
 * Fetches a single menu by ID
 */
function* getMenuByIdSaga(action: PayloadAction<GetMenuByIdPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setCurrentMenuLoading(true));

    // Call API to get menu by ID
    const menu: Menu = yield call(menuRepository.getMenuById, id);

    // Update state with menu
    yield put(setCurrentMenuSuccess(menu));

    if (onSuccess) {
      onSuccess(menu);
    }
  } catch (error) {
    yield put(setCurrentMenuError());
    showError(error);
  }
}

/**
 * Create Menu Saga
 * Creates a new menu
 */
function* createMenuSaga(action: PayloadAction<CreateMenuPayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setCreateMenuLoading(true));

    // Call API to create menu
    const menu: Menu = yield call(menuRepository.createMenu, data);

    // Update state with new menu
    yield put(setCreateMenuSuccess(menu));
    showSuccess(i18next.t('createMenuSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess(menu);
    }
  } catch (error) {
    yield put(setCreateMenuError());
    showError(error);
  }
}

/**
 * Update Menu Saga
 * Updates an existing menu
 */
function* updateMenuSaga(action: PayloadAction<UpdateMenuPayload>) {
  const { id, data, onSuccess } = action.payload;

  try {
    yield put(setUpdateMenuLoading(true));

    // Call API to update menu
    const menu: Menu = yield call(menuRepository.updateMenu, id, data);

    // Update state with updated menu
    yield put(setUpdateMenuSuccess(menu));
    showSuccess(i18next.t('updateMenuSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess(menu);
    }
  } catch (error) {
    yield put(setUpdateMenuError());
    showError(error);
  }
}

/**
 * Delete Menu Saga
 * Deletes a menu
 */
function* deleteMenuSaga(action: PayloadAction<DeleteMenuPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setDeleteMenuLoading(true));

    // Call API to delete menu
    yield call(menuRepository.deleteMenu, id);

    // Update state - remove deleted menu
    yield put(setDeleteMenuSuccess(id));
    showSuccess(i18next.t('deleteMenuSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setDeleteMenuError());
    showError(error);
  }
}

/**
 * Reorder Menus Saga
 * Bulk reorder menus
 */
function* reorderMenusSaga(action: PayloadAction<ReorderMenusPayload>) {
  const { menus, onSuccess } = action.payload;

  try {
    yield put(setUpdateMenuLoading(true));

    // Call API to reorder menus
    yield call(menuRepository.reorderMenus, menus);

    showSuccess(i18next.t('reorderMenusSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setUpdateMenuError());
    showError(error);
  }
}

/**
 * Root Menu Saga Watcher
 */
function* watchMenu() {
  yield takeLatest(getMenusRequest.type, getMenusSaga);
  yield takeLatest(getAllMenusRequest.type, getAllMenusSaga);
  yield takeLatest(getMenuByIdRequest.type, getMenuByIdSaga);
  yield takeLatest(createMenuRequest.type, createMenuSaga);
  yield takeLatest(updateMenuRequest.type, updateMenuSaga);
  yield takeLatest(deleteMenuRequest.type, deleteMenuSaga);
  yield takeLatest(reorderMenusRequest.type, reorderMenusSaga);
}

/**
 * Root Menu Saga
 */
export function* menuSaga() {
  yield call(watchMenu);
}
