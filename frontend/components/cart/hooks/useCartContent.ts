/* eslint-disable no-console */
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toastHelper";
import { cartRepository } from "@/lib/repositories/cart.repository";
import { promotionRepository } from "@/lib/repositories/promotion.repository";
import { storageService } from "@/lib/services/storage.service";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectIsAuthenticated } from "@/lib/store/slices/authSlice";
import {
  loadCartRequest,
  removeFromCartRequest,
  setCart,
} from "@/lib/store/slices/cartSlice";
import type {
  BundleDealEligibilityResponse,
  Cart,
  CartComboInstance,
  CartItem,
} from "@/types/cart";
import type { CheckoutSession } from "@/types/gen/shop/shared/checkout-sessions/checkout-session";
import { PaymentMethod } from "@/types/gen/shop/shared/orders/order";
import type {
  CheckoutSessionComboInput,
  CheckoutSessionItemInput,
} from "@/types/gen/shop/shop/shop/shop";
// Note: ProductDiscountEligibility is now loaded in VoucherManagementContent (vouchers page), not in useCartContent
import groupBy from "lodash/groupBy";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import { useCallback, useEffect, useRef, useState } from "react";

// ==================== CONSTANTS ====================
const STANDALONE_COMBO_ID = "standalone";

// Module-level tracking to prevent duplicate API calls from React Strict Mode
// This persists across component remounts
let lastProcessingTimestamp = 0;
const DEBOUNCE_MS = 100; // Minimum time between API calls

// ==================== HELPER FUNCTIONS ====================

/**
 * Tạo selection key cho cart item
 * Format: productId-variantId-comboInstanceId
 */
const getCartItemSelectionKey = (item: CartItem): string => {
  return `${item.productId}-${item.variantId || ""}-${item.comboInstanceId || STANDALONE_COMBO_ID}`;
};

/**
 * Lọc các items không phải gift
 */
const filterNonGiftItems = (items: CartItem[]): CartItem[] => {
  return items.filter((item) => !item.isGift);
};

/**
 * Lọc các items được chọn (không bao gồm gift)
 */
const filterSelectedNonGiftItems = (
  items: CartItem[],
  selectedKeys: string[],
): CartItem[] => {
  return items.filter(
    (item) =>
      selectedKeys.includes(getCartItemSelectionKey(item)) && !item.isGift,
  );
};

/**
 * Build input cho checkout session từ selected items
 */
interface CheckoutSessionInput {
  items: CheckoutSessionItemInput[];
  combos: CheckoutSessionComboInput[];
}

const buildCheckoutSessionInput = (
  selectedItems: CartItem[],
  comboInstances: CartComboInstance[] | undefined,
): CheckoutSessionInput => {
  // Build standalone items (không thuộc combo và không phải gift)
  const items: CheckoutSessionItemInput[] = selectedItems
    .filter((item) => !item.comboInstanceId && !item.isGift)
    .map((item) => ({
      productId: item.productId,
      variantId: item.variantId || undefined,
      quantity: item.quantity,
    }));

  // Group combo items by comboInstanceId
  const comboItemsMap = groupBy(
    selectedItems.filter((item) => item.comboInstanceId),
    "comboInstanceId",
  );

  // Build combo inputs
  const combos: CheckoutSessionComboInput[] = Object.entries(comboItemsMap).map(
    ([comboInstanceId, comboItems]) => {
      const comboInstance = comboInstances?.find(
        (ci) => ci.comboInstanceId === comboInstanceId,
      );
      return {
        comboId: comboInstance?.comboId || "",
        comboInstanceId,
        items: comboItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
        })),
      };
    },
  );

  return { items, combos };
};

/**
 * Tính tổng giá trị cart từ selected items
 */
const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce(
    (sum, item) => sum + (item.effectivePrice || item.price) * item.quantity,
    0,
  );
};

// ==================== INTERFACES ====================

interface UseCartContentProps {
  checkoutSession: CheckoutSession | null;
  onCheckoutSessionUpdate: (_session: CheckoutSession | null) => void;
  isActive: boolean;
  /** Translation function for cart namespace */
  t: (_key: string) => string;
  /** Wait for address to load before creating initial checkout session */
  waitForAddressLoad?: boolean;
  /** Signal that address data is ready (only relevant if waitForAddressLoad=true) */
  addressDataReady?: boolean;
}

interface UseCartContentReturn {
  // Redux state
  cart: Cart;
  isLoading: boolean;
  isInitialized: boolean;

  // Local state
  selectedItems: string[];
  isCalculatingCheckout: boolean;
  giftEligibility: BundleDealEligibilityResponse[] | null;
  isLoadingGiftEligibility: boolean;
  isClearDialogOpen: boolean;
  setIsClearDialogOpen: (_open: boolean) => void;
  isClearingCart: boolean;
  isUpdatingQuantity: boolean;

  // Computed
  isAllSelected: boolean;
  nonGiftItems: CartItem[];
  selectedGiftProductIds: string[];

  // Handlers
  handleItemSelect: (_itemId: string) => void;
  handleSelectAll: () => void;
  handleClearCart: () => Promise<void>;
  handleSelectGift: (
    _promotionId: string,
    _tierId: string,
    _productId: string,
    _variantId?: string,
  ) => Promise<void>;
  handleSetBuyXGetYGifts: (
    _promotionId: string,
    _gifts: Array<{ productId: string; variantId?: string; quantity: number }>,
  ) => Promise<void>;
  handleRemoveGift: (_productId: string, _variantId?: string) => Promise<void>;
  handleQuantityChange: (
    _productId: string,
    _variantId: string | undefined,
    _quantity: number,
    _comboInstanceId?: string,
  ) => Promise<void>;
  handleRemoveItem: (
    _productId: string,
    _variantId?: string,
    _comboInstanceId?: string,
  ) => Promise<void>;
  fetchGiftEligibility: () => Promise<void>;
  handleVoucherApplied: (_updatedSession: CheckoutSession) => Promise<void>;
  handleRemoveVoucher: (_voucherCode: string) => Promise<void>;

  // Helpers
  getItemKey: (_item: CartItem, _index: number) => string;
  getSelectionKey: (_item: CartItem) => string;
  getComboInstance: (_item: CartItem) => CartComboInstance | undefined;
  isItemSelected: (_item: CartItem) => boolean;
}

/**
 * Custom hook chứa shared logic giữa CartContent (mobile) và CartContentDesktop
 * @param props - Props bao gồm checkoutSession, callbacks, và translation function
 * @returns Object chứa state, handlers, và helpers cho cart content
 */
export function useCartContent({
  checkoutSession,
  onCheckoutSessionUpdate,
  isActive,
  t,
  waitForAddressLoad = false,
  addressDataReady = true,
}: UseCartContentProps): UseCartContentReturn {
  const dispatch = useAppDispatch();

  // ==================== REDUX STATE ====================
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const {
    cart,
    isLoading,
    isInitialized,
  }: { cart: Cart; isLoading: boolean; isInitialized: boolean } =
    useAppSelector((state) => state.cart);

  // ==================== LOCAL STATE ====================
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isCalculatingCheckout, setIsCalculatingCheckout] = useState(false);
  const [giftEligibility, setGiftEligibility] = useState<
    BundleDealEligibilityResponse[] | null
  >(null);
  const [isLoadingGiftEligibility, setIsLoadingGiftEligibility] =
    useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  // Track if existing session fetch has completed (to prevent race condition with auto-select)
  const [existingSessionFetched, setExistingSessionFetched] = useState(false);

  // ==================== REF ====================
  // Flag to prevent re-initializing selection (persists across Strict Mode remounts)
  const selectionInitializedRef = useRef(false);
  // Flag to track if processSelectionChange is currently running
  const isProcessingRef = useRef(false);
  // Flag to track if initial checkout session has been created (prevents duplicate creation)
  const initialSessionCreatedRef = useRef(false);
  // Track pending selection changes during debounce/processing window
  const pendingSelectionRef = useRef<string[] | null>(null);

  // ==================== HELPER FUNCTIONS (EXPOSED) ====================
  const getItemKey = useCallback((item: CartItem, index: number) => {
    return `${item.productId}-${item.variantId || ""}-${index}`;
  }, []);

  const getSelectionKey = useCallback((item: CartItem) => {
    return getCartItemSelectionKey(item);
  }, []);

  const getComboInstance = useCallback(
    (item: CartItem): CartComboInstance | undefined => {
      if (!item.comboInstanceId) return undefined;
      return cart.comboInstances?.find(
        (ci) => ci.comboInstanceId === item.comboInstanceId,
      );
    },
    [cart.comboInstances],
  );

  const isItemSelected = useCallback(
    (item: CartItem): boolean => {
      if (item.isGift) return true;
      return selectedItems.includes(getCartItemSelectionKey(item));
    },
    [selectedItems],
  );

  // ==================== CORE PROCESSING ====================
  /**
   * Xử lý tuần tự khi selection thay đổi:
   * 1. Gọi upsertCheckoutSession API
   * 2. Đợi response, gọi syncCart API
   * 3. Đợi response, gọi checkBundleDealEligibility API
   */
  const processSelectionChange = useCallback(
    async (
      newSelectedItems: string[],
      cartItemsOverride?: CartItem[],
      comboInstancesOverride?: CartComboInstance[],
    ) => {
      // Prevent duplicate API calls (e.g., from React Strict Mode)
      const now = Date.now();
      if (
        now - lastProcessingTimestamp < DEBOUNCE_MS ||
        isProcessingRef.current
      ) {
        // Queue this selection change to process after current operation completes
        pendingSelectionRef.current = newSelectedItems;
        return;
      }
      lastProcessingTimestamp = now;

      // Clear pending since we're processing this selection now
      pendingSelectionRef.current = null;

      // Nếu không có item nào được chọn, gọi API với empty items để lấy response với giá trị 0
      if (isEmpty(newSelectedItems)) {
        isProcessingRef.current = true;
        setIsCalculatingCheckout(true);
        try {
          // Call API with empty items array to get proper zero response from backend
          const session = await cartRepository.upsertCheckoutSession({
            id: storageService.getCheckoutSessionId() || undefined,
            items: [],
            combos: [],
            clearCartAfterOrder: true,
            paymentMethod: PaymentMethod.PAYMENT_METHOD_COD,
          });

          // Update with proper session object containing zeros
          onCheckoutSessionUpdate(session);
          setGiftEligibility(null);
        } catch (error) {
          console.error("Failed to create empty checkout session:", error);
          // Fallback to null on error
          onCheckoutSessionUpdate(null);
          setGiftEligibility(null);
        } finally {
          setIsCalculatingCheckout(false);
          isProcessingRef.current = false;

          // Process pending selection if one was queued during this operation
          if (pendingSelectionRef.current !== null) {
            const pending = pendingSelectionRef.current;
            pendingSelectionRef.current = null;
            // Recursively call to process the pending selection
            processSelectionChange(pending, cartItemsOverride, comboInstancesOverride);
          }
        }
        return;
      }

      // Use override if provided, otherwise use closure value
      const cartItems = cartItemsOverride ?? cart.items;
      const comboInstances = comboInstancesOverride ?? cart.comboInstances;

      const selectedCartItems = filterSelectedNonGiftItems(
        cartItems,
        newSelectedItems,
      );

      // Nếu không có cart items nào match với selected IDs, gọi API với empty items
      if (isEmpty(selectedCartItems)) {
        isProcessingRef.current = true;
        setIsCalculatingCheckout(true);
        try {
          // Call API with empty items array to get proper zero response from backend
          const session = await cartRepository.upsertCheckoutSession({
            id: storageService.getCheckoutSessionId() || undefined,
            items: [],
            combos: [],
            clearCartAfterOrder: true,
            paymentMethod: PaymentMethod.PAYMENT_METHOD_COD,
          });

          // Update with proper session object containing zeros
          onCheckoutSessionUpdate(session);
          setGiftEligibility(null);
        } catch (error) {
          console.error("Failed to create empty checkout session:", error);
          // Fallback to null on error
          onCheckoutSessionUpdate(null);
          setGiftEligibility(null);
        } finally {
          setIsCalculatingCheckout(false);
          isProcessingRef.current = false;

          // Process pending selection if one was queued during this operation
          if (pendingSelectionRef.current !== null) {
            const pending = pendingSelectionRef.current;
            pendingSelectionRef.current = null;
            // Recursively call to process the pending selection
            processSelectionChange(pending, cartItemsOverride, comboInstancesOverride);
          }
        }
        return;
      }

      isProcessingRef.current = true;
      setIsCalculatingCheckout(true);
      try {
        // Step 1: Build checkout input và gọi checkout API
        const { items, combos } = buildCheckoutSessionInput(
          selectedCartItems,
          comboInstances,
        );

        const session = await cartRepository.upsertCheckoutSession({
          id: storageService.getCheckoutSessionId() || undefined,
          items: items.length > 0 ? items : [],
          combos: combos.length > 0 ? combos : [],
          clearCartAfterOrder: true,
          paymentMethod: PaymentMethod.PAYMENT_METHOD_COD,
        });
        onCheckoutSessionUpdate(session);

        // Step 2: Sync cart sau khi checkout thành công
        const updatedCart = await cartRepository.syncCart();
        dispatch(setCart(updatedCart));

        // Step 3: Check all promotion eligibility using unified API
        // Re-filter selected items from updatedCart to get post-sync prices (avoids stale price mismatch)
        const updatedSelectedItems = filterSelectedNonGiftItems(
          updatedCart.items,
          newSelectedItems,
        );
        const cartTotal = calculateCartTotal(
          updatedSelectedItems.length > 0
            ? updatedSelectedItems
            : selectedCartItems,
        );

        // Only check bundle deal (gift) eligibility here — guests included.
        // Product/Order discounts are loaded in PromotionPickerModal when user clicks "Chọn ưu đãi"
        if (cartTotal > 0) {
          setIsLoadingGiftEligibility(true);

          // Pass selectedItems so backend counts only ticked items for BUY_X_GET_Y
          // Use productId+variantId+quantity to correctly handle multiple variants of same product
          const selectedItemsForEligibility = (
            updatedSelectedItems.length > 0
              ? updatedSelectedItems
              : selectedCartItems
          ).map((item) => ({
            productId: item.productId,
            variantId: item.variantId || undefined,
            quantity: item.quantity,
          }));

          // Only fetch bundle deal eligibility for cart page
          const bundleDeals =
            await promotionRepository.checkBundleDealEligibility(
              cartTotal,
              selectedItemsForEligibility,
            );

          if (bundleDeals) {
            setGiftEligibility(bundleDeals);
          } else {
            console.error("Failed to fetch bundle deal eligibility");
            setGiftEligibility(null);
          }

          setIsLoadingGiftEligibility(false);
        } else {
          setGiftEligibility(null);
        }
      } catch (error) {
        console.error("Failed to process selection change:", error);
        showErrorToast(t("failedToCalculateCheckout"));
      } finally {
        setIsCalculatingCheckout(false);
        isProcessingRef.current = false;

        // Process pending selection if one was queued during this operation
        if (pendingSelectionRef.current !== null) {
          const pending = pendingSelectionRef.current;
          pendingSelectionRef.current = null;
          // Recursively call to process the pending selection
          processSelectionChange(pending, cartItemsOverride, comboInstancesOverride);
        }
      }
    },
    [cart.items, cart.comboInstances, dispatch, onCheckoutSessionUpdate, t],
  );

  // ==================== EFFECTS ====================
  // Effect 0: Fetch existing checkout session on mount (for returning from vouchers page)
  // Must complete before Effect 2 (auto-select) runs to prevent race condition
  useEffect(() => {
    if (!isActive) return;

    const fetchExistingSession = async () => {
      const existingSessionId = storageService.getCheckoutSessionId();
      if (existingSessionId) {
        try {
          const session =
            await cartRepository.getCheckoutSession(existingSessionId);
          if (session) {
            onCheckoutSessionUpdate(session);
          }
        } catch (error) {
          // Session might be expired or invalid, clear it
          console.error("Failed to fetch existing checkout session:", error);
        }
      }
      // Mark fetch as complete (success or error) to unblock Effect 2
      setExistingSessionFetched(true);
    };

    fetchExistingSession();
  }, [isActive, onCheckoutSessionUpdate]);

  // Effect 1: Load cart khi vào trang
  useEffect(() => {
    if (isActive && !isLoading && !isInitialized) {
      dispatch(loadCartRequest());
    }
  }, [isActive, dispatch]);

  // Effect: Reset selection initialization when auth status changes
  // This ensures auto-selection re-runs when switching between guest and authenticated contexts
  useEffect(() => {
    console.log('[Auth Change] Resetting refs, isAuthenticated:', isAuthenticated);
    // Reset the flags when auth status changes to allow re-initialization
    selectionInitializedRef.current = false;
    initialSessionCreatedRef.current = false;
    pendingSelectionRef.current = null;
  }, [isAuthenticated]);

  // Effect 2: Auto-select tất cả items khi cart load lần đầu
  // Wait for address data if authenticated on desktop
  useEffect(() => {
   

    if (!isActive || selectionInitializedRef.current) {
      return;
    }

    const shouldWait = waitForAddressLoad && !addressDataReady;
  

    if (!isEmpty(cart.items)) {
      const nonGiftItems = filterNonGiftItems(cart.items);
      const initialSelection = map(nonGiftItems, getCartItemSelectionKey);


      // Always set selection immediately (for UI)
      setSelectedItems(initialSelection);
      selectionInitializedRef.current = true;

      // Only create session if address ready (or not waiting)
      if (!shouldWait && !initialSessionCreatedRef.current) {
      
        initialSessionCreatedRef.current = true;
        processSelectionChange(initialSelection);
      }
    }
  }, [isActive, cart.items, processSelectionChange, waitForAddressLoad, addressDataReady]);

  // Effect 3: Create checkout session when address becomes ready
  // Handles case where cart loads before addresses
  useEffect(() => {
   
    if (
      waitForAddressLoad &&
      addressDataReady &&
      !isEmpty(selectedItems) &&
      !initialSessionCreatedRef.current
    ) {
     
      initialSessionCreatedRef.current = true;
      processSelectionChange(selectedItems);
    } else {
   
    }
  }, [waitForAddressLoad, addressDataReady, selectedItems, processSelectionChange]);

  // ==================== SELECTION HANDLERS ====================
  const handleItemSelect = useCallback(
    async (itemId: string) => {
      const clickedItem = cart.items.find(
        (item) => getCartItemSelectionKey(item) === itemId,
      );

      if (!clickedItem) return;

      let newSelectedItems: string[];

      if (clickedItem.comboInstanceId) {
        // Select/deselect all items in the same combo
        const comboItemKeys = cart.items
          .filter(
            (item) => item.comboInstanceId === clickedItem.comboInstanceId,
          )
          .map(getCartItemSelectionKey);

        const isCurrentlySelected = selectedItems.includes(itemId);

        if (isCurrentlySelected) {
          newSelectedItems = selectedItems.filter(
            (id) => !comboItemKeys.includes(id),
          );
        } else {
          newSelectedItems = [
            ...selectedItems,
            ...comboItemKeys.filter((key) => !selectedItems.includes(key)),
          ];
        }
      } else {
        // Toggle single item
        if (selectedItems.includes(itemId)) {
          newSelectedItems = selectedItems.filter((id) => id !== itemId);
        } else {
          newSelectedItems = [...selectedItems, itemId];
        }
      }

      // Update state
      setSelectedItems(newSelectedItems);

      // Process immediately
      await processSelectionChange(newSelectedItems);
    },
    [cart.items, selectedItems, processSelectionChange],
  );

  const handleSelectAll = useCallback(async () => {
    const nonGiftItems = filterNonGiftItems(cart.items);
    const allSelected =
      nonGiftItems.length > 0 && selectedItems.length === nonGiftItems.length;

    const newSelectedItems = allSelected
      ? []
      : map(nonGiftItems, getCartItemSelectionKey);

    // Update state
    setSelectedItems(newSelectedItems);

    // Process immediately
    await processSelectionChange(newSelectedItems);
  }, [cart.items, selectedItems, processSelectionChange]);

  // ==================== GIFT HANDLERS ====================
  const handleSelectGift = useCallback(
    async (
      promotionId: string,
      tierId: string,
      productId: string,
      variantId?: string,
    ) => {
      try {
        const updatedCart = await promotionRepository.addGiftToCart({
          promotionId,
          tierId,
          productId,
          variantId,
        });
        dispatch(setCart(updatedCart));

        // Re-process selection để update checkout và gift eligibility
        await processSelectionChange(selectedItems);
        showSuccessToast(t("giftOffer.addSuccess"));
      } catch (error: any) {
        console.error("Failed to add gift:", error);
        const errorMessage =
          error?.response?.data?.message || t("giftOffer.addError");
        showErrorToast(errorMessage);
      }
    },
    [dispatch, t, selectedItems, processSelectionChange],
  );

  const handleSetBuyXGetYGifts = useCallback(
    async (
      promotionId: string,
      gifts: Array<{
        productId: string;
        variantId?: string;
        quantity: number;
      }>,
    ) => {
      try {
        const updatedCart = await promotionRepository.setBuyXGetYGifts({
          promotionId,
          gifts,
        });
        dispatch(setCart(updatedCart));

        // Re-process selection to update checkout and gift eligibility
        await processSelectionChange(selectedItems);
        showSuccessToast(t("giftOffer.addSuccess"));
      } catch (error: any) {
        console.error("Failed to set BUY_X_GET_Y gifts:", error);
        const errorMessage =
          error?.response?.data?.message || t("giftOffer.addError");
        showErrorToast(errorMessage);
      }
    },
    [dispatch, t, selectedItems, processSelectionChange],
  );

  const handleRemoveGift = useCallback(
    async (productId: string, variantId?: string) => {
      try {
        const updatedCart = await promotionRepository.removeGiftFromCart({
          productId,
          variantId,
        });
        dispatch(setCart(updatedCart));

        // Re-process selection để update checkout và gift eligibility
        await processSelectionChange(selectedItems);
      } catch (error) {
        console.error("Failed to remove gift:", error);
        showErrorToast(t("giftOffer.removeError"));
      }
    },
    [dispatch, t, selectedItems, processSelectionChange],
  );

  // ==================== QUANTITY CHANGE ====================
  /**
   * Handle quantity change for cart items
   * Updates cart via API and triggers checkout/gift recalculation
   */
  const handleQuantityChange = useCallback(
    async (
      productId: string,
      variantId: string | undefined,
      quantity: number,
      comboInstanceId?: string,
    ) => {
      if (quantity < 1) return;

      setIsUpdatingQuantity(true);
      try {
        const updatedCart = await cartRepository.updateCartItem({
          productId,
          variantId,
          quantity,
          comboInstanceId,
        });
        dispatch(setCart(updatedCart));

        // Remove shipping promotion when quantity changes (tier may change with new total)
        const checkoutSessionId = storageService.getCheckoutSessionId();
        if (checkoutSessionId && checkoutSession?.shippingPromotion?.id) {
          try {
            const updatedSession =
              await promotionRepository.removeShippingPromotion(
                checkoutSessionId,
              );
            onCheckoutSessionUpdate(updatedSession);
            showSuccessToast(t("shippingPromotion.removedDueToQuantityChange"));
          } catch (error) {
            console.error("Failed to remove shipping promotion:", error);
          }
        }

        // Trigger recalculation of checkout session and gift eligibility
        // Pass fresh cart data to avoid stale closure issue
        if (!isEmpty(selectedItems)) {
          await processSelectionChange(
            selectedItems,
            updatedCart.items,
            updatedCart.comboInstances,
          );
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
        showErrorToast(t("failedToUpdateQuantity"));
      } finally {
        setIsUpdatingQuantity(false);
      }
    },
    [
      dispatch,
      t,
      selectedItems,
      processSelectionChange,
      checkoutSession,
      onCheckoutSessionUpdate,
    ],
  );

  // ==================== REMOVE ITEM ====================
  /**
   * Handle removal of cart item
   * Removes item via Redux saga and triggers checkout/gift recalculation
   */
  const handleRemoveItem = useCallback(
    async (productId: string, variantId?: string, comboInstanceId?: string) => {
      try {
        // Dispatch Redux action to remove item
        dispatch(
          removeFromCartRequest({
            productId,
            variantId,
            comboInstanceId,
          }),
        );

        // Wait for saga to complete and get updated cart
        // Note: Using a small delay to ensure Redux state updates
        // Better solution would be to use a saga listener or thunk
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Remove shipping promotion when item is removed (tier may change with new total)
        const checkoutSessionId = storageService.getCheckoutSessionId();
        if (checkoutSessionId && checkoutSession?.shippingPromotion?.id) {
          try {
            const updatedSession =
              await promotionRepository.removeShippingPromotion(
                checkoutSessionId,
              );
            onCheckoutSessionUpdate(updatedSession);
            showSuccessToast(t("shippingPromotion.removedDueToQuantityChange"));
          } catch (error) {
            console.error("Failed to remove shipping promotion:", error);
          }
        }

        // Re-process selection to update checkout and gift eligibility
        if (!isEmpty(selectedItems)) {
          await processSelectionChange(selectedItems);
        }

        showSuccessToast(t("itemRemoved"));
      } catch (error) {
        console.error("Failed to remove item:", error);
        showErrorToast(t("failedToRemoveItem"));
      }
    },
    [
      dispatch,
      t,
      selectedItems,
      processSelectionChange,
      checkoutSession,
      onCheckoutSessionUpdate,
    ],
  );

  // ==================== CLEAR CART ====================
  const handleClearCart = useCallback(async () => {
    setIsClearingCart(true);
    try {
      const clearedCart = await cartRepository.clearCart();
      dispatch(setCart(clearedCart));
      setSelectedItems([]);
      setGiftEligibility(null);
      storageService.clearCheckoutSession();
      onCheckoutSessionUpdate(null);
      setIsClearDialogOpen(false);
    } catch (error) {
      console.error("Failed to clear cart:", error);
      showErrorToast(t("failedToClearCart"));
    } finally {
      setIsClearingCart(false);
    }
  }, [dispatch, t, onCheckoutSessionUpdate]);

  // ==================== FETCH GIFT ELIGIBILITY (exposed for external use) ====================
  const fetchGiftEligibility = useCallback(async () => {
    const selectedNonGiftItems = filterSelectedNonGiftItems(
      cart.items,
      selectedItems,
    );
    const cartTotal = calculateCartTotal(selectedNonGiftItems);

    if (cartTotal <= 0) {
      setGiftEligibility(null);
      return;
    }

    setIsLoadingGiftEligibility(true);
    try {
      // Use unified API - only need bundleDeals here
      const productIds = selectedNonGiftItems.map((item) => item.productId);
      const eligibilityResult =
        await promotionRepository.checkPromotionEligibility({
          cartTotal,
          productIds,
        });

      if (eligibilityResult) {
        setGiftEligibility(eligibilityResult.bundleDeals || []);
      } else {
        setGiftEligibility(null);
      }
    } catch (error) {
      console.error("Failed to fetch gift eligibility:", error);
      setGiftEligibility(null);
    } finally {
      setIsLoadingGiftEligibility(false);
    }
  }, [cart.items, selectedItems]);

  // ==================== PRODUCT DISCOUNT HANDLERS ====================
  // ==================== VOUCHER HANDLERS ====================
  /**
   * Handle voucher applied - sync cart to remove auto-cleared gifts
   * Called after VoucherSection successfully applies a voucher
   */
  const handleVoucherApplied = useCallback(
    async (updatedSession: CheckoutSession) => {
      // Update checkout session first
      onCheckoutSessionUpdate(updatedSession);

      // Sync cart to reflect any changes (e.g., auto-removed gifts by backend)
      const updatedCart = await cartRepository.syncCart();
      dispatch(setCart(updatedCart));

      // Re-fetch promotion eligibility to update UI
      const nonGiftItems = updatedCart.items.filter((item) => !item.isGift);
      const cartTotal = nonGiftItems.reduce(
        (sum, item) =>
          sum + (item.effectivePrice || item.price) * item.quantity,
        0,
      );
      if (cartTotal > 0) {
        const productIds = nonGiftItems.map((item) => item.productId);
        const eligibilityResult =
          await promotionRepository.checkPromotionEligibility({
            cartTotal,
            productIds,
          });
        if (eligibilityResult) {
          setGiftEligibility(eligibilityResult.bundleDeals || []);
        } else {
          setGiftEligibility(null);
        }
      }
    },
    [dispatch, onCheckoutSessionUpdate],
  );

  /**
   * Handle remove voucher from checkout session
   * Called when user clicks on applied voucher badge
   */
  const handleRemoveVoucher = useCallback(
    async (voucherCode: string) => {
      const checkoutSessionId = storageService.getCheckoutSessionId();
      if (!checkoutSessionId) {
        showErrorToast(t("checkoutSessionNotFound"));
        return;
      }

      try {
        const updatedSession = await promotionRepository.removeVoucher(
          checkoutSessionId,
          voucherCode,
        );
        onCheckoutSessionUpdate(updatedSession);
        showSuccessToast(t("voucherRemovedSuccess"));

        // Re-fetch promotion eligibility so user can select gifts again
        const nonGiftItems = cart.items.filter((item) => !item.isGift);
        const cartTotal = nonGiftItems.reduce(
          (sum, item) =>
            sum + (item.effectivePrice || item.price) * item.quantity,
          0,
        );
        if (cartTotal > 0) {
          const productIds = nonGiftItems.map((item) => item.productId);
          const eligibilityResult =
            await promotionRepository.checkPromotionEligibility({
              cartTotal,
              productIds,
            });
          if (eligibilityResult) {
            setGiftEligibility(eligibilityResult.bundleDeals || []);
          }
        }
      } catch (error: any) {
        console.error("Failed to remove voucher:", error);
        const errorMessage =
          error?.response?.data?.message || t("voucherRemoveError");
        showErrorToast(errorMessage);
      }
    },
    [t, onCheckoutSessionUpdate, cart.items],
  );

  // ==================== COMPUTED VALUES ====================
  const nonGiftItems = filterNonGiftItems(cart.items);
  const isAllSelected =
    nonGiftItems.length > 0 && selectedItems.length === nonGiftItems.length;
  const selectedGiftProductIds = cart.items
    .filter((item) => item.isGift)
    .map((item) => item.productId);

  // ==================== RETURN ====================
  return {
    // Redux state
    cart,
    isLoading,
    isInitialized,

    // Local state
    selectedItems,
    isCalculatingCheckout,
    giftEligibility,
    isLoadingGiftEligibility,
    isClearDialogOpen,
    setIsClearDialogOpen,
    isClearingCart,
    isUpdatingQuantity,

    // Computed
    isAllSelected,
    nonGiftItems,
    selectedGiftProductIds,

    // Handlers
    handleItemSelect,
    handleSelectAll,
    handleClearCart,
    handleSelectGift,
    handleSetBuyXGetYGifts,
    handleRemoveGift,
    handleQuantityChange,
    handleRemoveItem,
    fetchGiftEligibility,
    handleVoucherApplied,
    handleRemoveVoucher,

    // Helpers
    getItemKey,
    getSelectionKey,
    getComboInstance,
    isItemSelected,
  };
}
