/* eslint-disable no-console */
import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { cartRepository } from '@/lib/repositories/cart.repository';
import { showErrorToast, showSuccessToast } from '@/lib/helpers/toastHelper';
import type {
  Cart,
  CartItem,
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveFromCartPayload,
  AddComboToCartPayload,
} from '@/types/cart';
import {
  loadCartRequest,
  loadCartSuccess,
  loadCartFailure,
  addToCartRequest,
  addToCartSuccess,
  addToCartFailure,
  addComboToCartRequest,
  addComboToCartSuccess,
  addComboToCartFailure,
  removeFromCartRequest,
  removeFromCartSuccess,
  removeFromCartFailure,
  updateCartItemRequest,
  updateCartItemSuccess,
  updateCartItemFailure,
  clearCartRequest,
  clearCartSuccess,
  clearCartFailure,
  refreshCartRequest,
  refreshCartSuccess,
  refreshCartFailure,
  mergeCartRequest,
  mergeCartSuccess,
  mergeCartFailure,
  openSuccessPopover,
} from '../slices/cartSlice';

// Load cart saga - sync with API
function* loadCartSaga() {
  try {
    const cart: Cart = yield call(() => cartRepository.syncCart());
    yield put(loadCartSuccess(cart));
  } catch (error) {
    console.error('Load cart error:', error);
    showErrorToast(error);
    yield put(loadCartFailure('Failed to load cart'));
  }
}

// Add to cart saga
function* addToCartSaga(action: PayloadAction<AddToCartPayload>) {
  try {
    const cart: Cart = yield call(() => cartRepository.addToCart(action.payload));
    yield put(addToCartSuccess(cart));

    // Open success popover via Redux action
    // Cast to include originalPrice for popover display
    const addedItem = {
      productId: action.payload.productId,
      variantId: action.payload.variantId || '',
      code: action.payload.productId,
      name: action.payload.name || '',
      image: action.payload.image || action.payload.imageUrl || '',
      price: action.payload.price || 0,
      effectivePrice: action.payload.price || 0,
      quantity: action.payload.quantity,
      subtotal: (action.payload.price || 0) * action.payload.quantity,
      attributes: [],
      // Include originalPrice for CartSuccessPopover display
      originalPrice: action.payload.originalPrice,
      isGift: false,
      color: action.payload.color,
      size: action.payload.size,
    } as CartItem & { originalPrice?: number; color?: string; size?: string };
    yield put(openSuccessPopover(addedItem as CartItem));
  } catch (error) {
    console.error('Add to cart error:', error);
    showErrorToast(error);
    yield put(addToCartFailure('Failed to add item to cart'));
  }
}

// Add combo to cart saga
function* addComboToCartSaga(
  action: PayloadAction<AddComboToCartPayload & { successMessage?: string }>
) {
  // The message is localised by the caller and must not reach the API.
  const { successMessage, ...payload } = action.payload;

  try {
    const cart: Cart = yield call(() => cartRepository.addComboToCart(payload));
    yield put(addComboToCartSuccess(cart));
    showSuccessToast(successMessage);
  } catch (error) {
    console.error('Add combo to cart error:', error);
    showErrorToast(error);
    yield put(addComboToCartFailure('Failed to add combo to cart'));
  }
}

// Remove from cart saga
function* removeFromCartSaga(action: PayloadAction<RemoveFromCartPayload>) {
  try {
    const cart: Cart = yield call(() => cartRepository.removeFromCart(action.payload));
    yield put(removeFromCartSuccess(cart));
  } catch (error) {
    console.error('Remove from cart error:', error);
    showErrorToast(error);
    yield put(removeFromCartFailure('Failed to remove item from cart'));
  }
}

// Update cart item saga
function* updateCartItemSaga(action: PayloadAction<UpdateCartItemPayload>) {
  try {
    const cart: Cart = yield call(() => cartRepository.updateCartItem(action.payload));
    yield put(updateCartItemSuccess(cart));
  } catch (error) {
    console.error('Update cart item error:', error);
    showErrorToast(error);
    yield put(updateCartItemFailure('Failed to update cart item'));
  }
}

// Clear cart saga
function* clearCartSaga() {
  try {
    yield call(() => cartRepository.clearCart());
    yield put(clearCartSuccess());
  } catch (error) {
    console.error('Clear cart error:', error);
    showErrorToast(error);
    yield put(clearCartFailure('Failed to clear cart'));
  }
}

// Refresh cart saga - sync with API only
function* refreshCartSaga() {
  try {
    const cart: Cart = yield call(() => cartRepository.syncCart());
    yield put(refreshCartSuccess(cart));
  } catch (error) {
    console.error('Refresh cart error:', error);
    showErrorToast(error);
    yield put(refreshCartFailure('Failed to refresh cart'));
  }
}

// Merge guest cart saga - call after login to merge anonymous cart
function* mergeCartSaga() {
  try {
    const cart: Cart = yield call(() => cartRepository.mergeCart());
    yield put(mergeCartSuccess(cart));
    // Refresh cart UI after merge
    yield put(loadCartRequest());
  } catch (error) {
    console.error('Merge cart error:', error);
    // Silent fail - don't show error toast since user just logged in
    yield put(mergeCartFailure('Failed to merge cart'));
  }
}

// Root cart saga
export function* watchCart() {
  yield takeLatest(loadCartRequest.type, loadCartSaga);
  yield takeLatest(addToCartRequest.type, addToCartSaga);
  yield takeLatest(addComboToCartRequest.type, addComboToCartSaga);
  yield takeLatest(removeFromCartRequest.type, removeFromCartSaga);
  yield takeLatest(updateCartItemRequest.type, updateCartItemSaga);
  yield takeLatest(clearCartRequest.type, clearCartSaga);
  yield takeLatest(refreshCartRequest.type, refreshCartSaga);
  yield takeLatest(mergeCartRequest.type, mergeCartSaga);
}
