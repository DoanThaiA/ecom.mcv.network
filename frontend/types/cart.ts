// Cart types - Export directly from proto

// Re-export cart types from new location
export type {
  Cart,
  CartItem,
  CartComboInstance,
} from "./gen/shop/shared/carts/cart";

// Re-export request types from shop
export type {
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveFromCartRequest,
  ComboItemVariantInput,
  AddComboToCartRequest,
  MergeGuestCartRequest,
  // Gift promotion types
  BundleDealEligibilityResponse,
  EligibleGiftTierResponse,
  GiftProductDetailResponse,
  GiftProductVariantResponse,
  CartGiftInfoResponse,
  AddGiftToCartRequest,
  RemoveGiftFromCartRequest,
} from "./gen/shop/shop/shop/shop";

// UI payload types for Redux actions (with optional UI fields for optimistic update)
export interface AddToCartPayload {
  productId: string;
  variantId?: string;
  quantity: number;
  // UI fields for optimistic update display
  name?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  imageUrl?: string;
  size?: string;
  color?: string;
}

// ComboItemVariant payload with optional variantId for UI
export interface ComboItemVariantPayload {
  productId: string;
  variantId?: string;
}

export interface AddComboToCartPayload {
  comboId: string;
  items: ComboItemVariantPayload[];
}

export interface UpdateCartItemPayload {
  productId: string;
  variantId?: string;
  quantity: number;
  comboInstanceId?: string;
}

export interface RemoveFromCartPayload {
  productId: string;
  variantId?: string;
  comboInstanceId?: string;
}

export interface GiftItem {
  id: string;
  name: string;
  imageUrl?: string;
  originalPrice?: number;
}

/** Request for setting BUY_X_GET_Y gifts in batch */
export interface SetBuyXGetYGiftsRequest {
  promotionId: string;
  gifts: Array<{ productId: string; variantId?: string; quantity: number }>;
}
