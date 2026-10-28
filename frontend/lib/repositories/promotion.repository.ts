import axiosInstance from "@/lib/axios";
import type { Cart } from "@/types/gen/shop/shared/carts/cart";
import type { CheckoutSession } from "@/types/gen/shop/shared/checkout-sessions/checkout-session";
import type {
  BundleDealEligibilityResponse,
  AddGiftToCartRequest,
  RemoveGiftFromCartRequest,
  ProductDiscountEligibilityResponse,
  CheckProductDiscountEligibilityRequest,
  ApplyProductDiscountRequest,
  CheckPromotionEligibilityRequest,
  PromotionEligibilityResponse,
} from "@/types/gen/shop/shop/shop/shop";
import type { SetBuyXGetYGiftsRequest } from "@/types/cart";
import type { ShippingPromotion } from "@/types/gen/shared/shared/shipping/shipping-promotion";

/**
 * Repository for shop promotion operations
 * Handles gift promotion API calls (Mua để nhận quà)
 */
class PromotionRepository {
  // ==================== Unified Promotion Eligibility ====================

  /**
   * Check all promotion eligibility in a single call (unified API)
   * Returns eligibility for bundle deals and product discounts
   * Recommended over individual endpoints for better performance
   * @param data - Cart total and optional product IDs
   * @returns Unified promotion eligibility response
   */
  checkPromotionEligibility = async (
    data: CheckPromotionEligibilityRequest,
  ): Promise<PromotionEligibilityResponse | null> => {
    try {
      const response = await axiosInstance.post<PromotionEligibilityResponse>(
        "/shop/promotions/check-eligibility",
        data,
      );
      return response.data;
    } catch (error) {
      console.error(
        "[PromotionRepository] checkPromotionEligibility error:",
        error,
      );
      return null;
    }
  };

  // ==================== Legacy Bundle Deal Methods (use checkPromotionEligibility instead) ====================

  /**
   * Check bundle deal eligibility based on cart total
   * @deprecated Use checkPromotionEligibility() instead for better performance
   */
  checkBundleDealEligibility = async (
    cartTotal: number,
    selectedItems?: {
      productId: string;
      variantId?: string;
      quantity: number;
    }[],
  ): Promise<BundleDealEligibilityResponse[] | null> => {
    try {
      const response = await axiosInstance.post<
        BundleDealEligibilityResponse[]
      >("/shop/promotions/bundle-deals/check-eligibility", {
        cartTotal,
        selectedItems,
      });
      return response.data;
    } catch (error) {
      console.error(
        "[PromotionRepository] checkBundleDealEligibility error:",
        error,
      );
      return null;
    }
  };

  /**
   * Add gift item to cart
   */
  addGiftToCart = async (data: AddGiftToCartRequest): Promise<Cart> => {
    const response = await axiosInstance.post<Cart>(
      "/shop/promotions/gift/buy-to-get-gift",
      data,
    );
    return response.data;
  };

  /**
   * Set BUY_X_GET_Y gifts in batch (replace-all approach)
   * @param data - Promotion ID and array of gift selections
   * @returns Updated cart with gift items
   */
  setBuyXGetYGifts = async (data: SetBuyXGetYGiftsRequest): Promise<Cart> => {
    const response = await axiosInstance.post<Cart>(
      "/shop/promotions/gift/buy-x-get-y",
      data,
    );
    return response.data;
  };

  /**
   * Remove gift item from cart
   */
  removeGiftFromCart = async (
    data: RemoveGiftFromCartRequest,
  ): Promise<Cart> => {
    const response = await axiosInstance.delete<Cart>(
      `/shop/promotions/gift/${data.productId}`,
      {
        params: {
          variantId: data.variantId,
        },
      },
    );
    return response.data;
  };

  /**
   * Apply voucher to checkout session
   * @param code - Voucher code to apply
   * @param checkoutSessionId - Checkout session ID (from checkoutSession.id, not sessionId)
   * @returns Updated checkout session with applied voucher
   */
  applyVoucher = async (
    code: string,
    checkoutSessionId: string,
  ): Promise<CheckoutSession> => {
    const response = await axiosInstance.post<CheckoutSession>(
      "/shop/promotions/voucher/apply",
      {
        code,
        checkoutSessionId,
      },
    );
    return response.data;
  };

  /**
   * Remove voucher from checkout session
   * @param id - Checkout session ID (from checkoutSession.id, not sessionId)
   * @param code - Voucher code to remove
   * @returns Updated checkout session with voucher removed
   */
  removeVoucher = async (
    id: string,
    code: string,
  ): Promise<CheckoutSession> => {
    const response = await axiosInstance.delete<CheckoutSession>(
      `/shop/promotions/voucher/${id}/${code}`,
    );
    return response.data;
  };

  // ==================== Legacy Product Discount Methods (use checkPromotionEligibility instead) ====================

  /**
   * Check product discount eligibility (AUTO_APPLY type)
   * @deprecated Use checkPromotionEligibility() instead for better performance
   */
  checkProductDiscountEligibility = async (
    data: CheckProductDiscountEligibilityRequest,
  ): Promise<ProductDiscountEligibilityResponse[] | null> => {
    try {
      const response = await axiosInstance.post<
        ProductDiscountEligibilityResponse[]
      >("/shop/promotions/product-discounts/check-eligibility", data);
      return response.data;
    } catch (error) {
      console.error(
        "[PromotionRepository] checkProductDiscountEligibility error:",
        error,
      );
      return null;
    }
  };

  /**
   * Apply product discount to checkout session
   * Auto-replaces any existing promotions (gift, voucher, or other product discount)
   * @param data - Promotion ID and checkout session ID
   * @returns Updated checkout session with applied product discount
   */
  applyProductDiscount = async (
    data: ApplyProductDiscountRequest,
  ): Promise<CheckoutSession> => {
    const response = await axiosInstance.post<CheckoutSession>(
      "/shop/promotions/product-discounts/apply",
      data,
    );
    return response.data;
  };

  /**
   * Remove product discount from checkout session
   * @param checkoutSessionId - Checkout session ID
   * @param promotionId - Promotion ID to remove
   * @returns Updated checkout session with product discount removed
   */
  removeProductDiscount = async (
    checkoutSessionId: string,
    promotionId: string,
  ): Promise<CheckoutSession> => {
    const response = await axiosInstance.delete<CheckoutSession>(
      `/shop/promotions/product-discounts/${checkoutSessionId}/${promotionId}`,
    );
    return response.data;
  };

  // ==================== Shipping Promotion Methods ====================

  /**
   * Get available shipping promotions for checkout session
   * @param checkoutSessionId - Checkout session ID
   * @returns List of available shipping promotions
   */
  getShippingPromotions = async (
    checkoutSessionId: string,
  ): Promise<ShippingPromotion[]> => {
    try {
      const response = await axiosInstance.get<ShippingPromotion[]>(
        `/shop/checkout/sessions/${checkoutSessionId}/shipping-promotions`,
      );
      return response.data;
    } catch (error) {
      console.error(
        "[PromotionRepository] getShippingPromotions error:",
        error,
      );
      return [];
    }
  };

  /**
   * Apply shipping promotion to checkout session
   * @param checkoutSessionId - Checkout session ID
   * @param promotionId - Shipping promotion ID to apply
   * @returns Updated checkout session with applied shipping promotion
   */
  applyShippingPromotion = async (
    checkoutSessionId: string,
    promotionId: string,
  ): Promise<CheckoutSession> => {
    const response = await axiosInstance.post<CheckoutSession>(
      `/shop/checkout/sessions/${checkoutSessionId}/apply-shipping-promotion`,
      { promotionId },
    );
    return response.data;
  };

  /**
   * Remove shipping promotion from checkout session
   * DELETE /shop/checkout/sessions/{id}/shipping-promotion
   * @param checkoutSessionId - Checkout session ID
   * @returns Updated checkout session with shipping promotion removed
   */
  removeShippingPromotion = async (
    checkoutSessionId: string,
  ): Promise<CheckoutSession> => {
    const response = await axiosInstance.delete<CheckoutSession>(
      `/shop/checkout/sessions/${checkoutSessionId}/shipping-promotion`,
    );
    return response.data;
  };
}

export const promotionRepository = new PromotionRepository();
