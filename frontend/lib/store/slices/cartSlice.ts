import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  Cart,
  CartItem,
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveFromCartPayload,
  AddComboToCartPayload,
} from '@/types/cart';

export type PopoverType = 'success' | 'preview' | null;

const EMPTY_CART: Cart = {
  id: '',
  items: [],
  comboInstances: [],
  itemCount: 0,
  subtotal: 0,
  comboDiscount: 0,
  flashSaleDiscount: 0,
  total: 0,
};

interface CartState {
  cart: Cart;
  isLoading: boolean;
  isInitialized: boolean;
  isUpdatingItem: boolean;
  error: string | null;
  // Popover state
  popoverType: PopoverType;
  popoverOpen: boolean;
  successItem: CartItem | null;
}

const initialState: CartState = {
  cart: EMPTY_CART,
  isLoading: false,
  isInitialized: false,
  isUpdatingItem: false,
  error: null,
  // Popover initial state
  popoverType: null,
  popoverOpen: false,
  successItem: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Load cart actions
    loadCartRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loadCartSuccess: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
      state.isLoading = false;
      state.isInitialized = true;
      state.error = null;
    },
    loadCartFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isInitialized = true;
      state.error = action.payload;
    },

    // Add to cart actions
    addToCartRequest: (state, _action: PayloadAction<AddToCartPayload>) => {
      state.isLoading = true;
      state.error = null;
    },
    addToCartSuccess: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addToCartFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Add combo to cart actions
    addComboToCartRequest: (
      state,
      _action: PayloadAction<AddComboToCartPayload & { successMessage?: string }>
    ) => {
      state.isLoading = true;
      state.error = null;
    },
    addComboToCartSuccess: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addComboToCartFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Remove from cart actions
    removeFromCartRequest: (state, _action: PayloadAction<RemoveFromCartPayload>) => {
      state.isUpdatingItem = true;
      state.error = null;
    },
    removeFromCartSuccess: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
      state.isUpdatingItem = false;
      state.error = null;
    },
    removeFromCartFailure: (state, action: PayloadAction<string>) => {
      state.isUpdatingItem = false;
      state.error = action.payload;
    },

    // Update cart item actions
    updateCartItemRequest: (state, _action: PayloadAction<UpdateCartItemPayload>) => {
      state.isUpdatingItem = true;
      state.error = null;
    },
    updateCartItemSuccess: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
      state.isUpdatingItem = false;
      state.error = null;
    },
    updateCartItemFailure: (state, action: PayloadAction<string>) => {
      state.isUpdatingItem = false;
      state.error = action.payload;
    },

    // Clear cart actions
    clearCartRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    clearCartSuccess: (state) => {
      state.cart = EMPTY_CART;
      state.isLoading = false;
      state.error = null;
    },
    clearCartFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Refresh cart actions
    refreshCartRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    refreshCartSuccess: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    refreshCartFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Merge guest cart actions (call after login)
    mergeCartRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    mergeCartSuccess: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    mergeCartFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Set cart directly (for sync operations)
    setCart: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
    },

    // Popover actions
    openSuccessPopover: (state, action: PayloadAction<CartItem>) => {
      state.popoverType = 'success';
      state.popoverOpen = true;
      state.successItem = action.payload;
    },
    openPreviewPopover: (state) => {
      state.popoverType = 'preview';
      state.popoverOpen = true;
    },
    closePopover: (state) => {
      state.popoverOpen = false;
      state.popoverType = null;
    },
  },
});

export const {
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
  setCart,
  // Popover actions
  openSuccessPopover,
  openPreviewPopover,
  closePopover,
} = cartSlice.actions;

export default cartSlice.reducer;
