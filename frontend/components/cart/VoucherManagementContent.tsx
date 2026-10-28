"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { Box, Flex, Text, Heading, Button } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import type { CheckoutSession } from "@/types/gen/shop/shared/checkout-sessions/checkout-session";
import type {
  ProductDiscountEligibilityResponse,
  OrderDiscountEligibilityResponse,
} from "@/types/gen/shop/shop/shop/shop";
import type { ShippingPromotion } from "@/types/gen/shared/shared/shipping/shipping-promotion";
import { promotionRepository } from "@/lib/repositories/promotion.repository";
import { cartRepository } from "@/lib/repositories/cart.repository";
import { showSuccessToast, showErrorToast } from "@/lib/helpers/toastHelper";
import { formatPrice } from "@/lib/utils/format";
import { GradientButton } from "@/components/common/GradientButton";
import {
  DiscountType,
  DiscountDetailType,
  ShippingPromotionType,
} from "@/types/gen/shared/shared/common/enums";

interface VoucherManagementContentProps {
  checkoutSession: CheckoutSession | null;
  onCheckoutSessionUpdate: (_session: CheckoutSession) => void;
  onClose?: () => void;
  mode?: "page" | "dialog";
}

// Unified promotion item type
type PromotionItem = {
  id: string;
  name: string;
  type: "voucher" | "product_discount" | "order_discount" | "shipping_promotion";
  description: string;
  isEligible: boolean;
  isApplied: boolean;
  isExclusive: boolean; // notApplicableWithOtherPromotions flag
  amountNeededForEligibility?: number;
  discountAmount?: number;
  endDate?: Date;
};

export function VoucherManagementContent({
  checkoutSession,
  onCheckoutSessionUpdate,
  onClose,
  mode = "dialog",
}: VoucherManagementContentProps) {
  const t = useTranslations("cart");

  // State
  // selectedIds: purely local UI state — the set of promotions the user has checked in this session.
  // Initialized from appliedPromotions on mount. Confirm diffs this vs appliedPromotions.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [productDiscounts, setProductDiscounts] = useState<
    ProductDiscountEligibilityResponse[]
  >([]);
  const [orderDiscounts, setOrderDiscounts] = useState<
    OrderDiscountEligibilityResponse[]
  >([]);
  const [shippingPromotions, setShippingPromotions] = useState<
    ShippingPromotion[]
  >([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);
  // Track whether the initial selection from applied promotions has been set
  const selectionInitializedRef = useRef(false);
  // Track previous appliedPromotions to detect external changes (e.g., remove via cart page)
  const prevAppliedKeyRef = useRef<string>("");

  // Calculate cart total and product IDs from checkout session (only selected/checked items)
  // NOT from cartItems which includes ALL items in the cart
  const { cartTotal, productIds } = useMemo(() => {
    if (!checkoutSession) {
      return { cartTotal: 0, productIds: [] };
    }
    const total = checkoutSession.subtotal;
    const ids = checkoutSession.items.map((item) => item.productId);
    return { cartTotal: total, productIds: ids };
  }, [checkoutSession]);

  // Get currently applied promotions from checkout session (supports multiple)
  // Returns array of: { id, type, discountAmount }
  const appliedPromotions = useMemo((): Array<{
    id: string;
    type: "voucher" | "product_discount" | "shipping_promotion";
    discountAmount?: number;
  }> => {
    const applied: Array<{
      id: string;
      type: "voucher" | "product_discount" | "shipping_promotion";
      discountAmount?: number;
    }> = [];

    // Add all applied vouchers
    const appliedVouchers = checkoutSession?.appliedVouchers || [];
    appliedVouchers.forEach((voucher) => {
      applied.push({
        id: voucher.code,
        type: "voucher",
        discountAmount: voucher.discountAmount,
      });
    });

    // Add all non-voucher discounts from discountDetails (product discounts + order discounts)
    // Backend may return type as string ("order_discount", "product_discount") or numeric enum
    const discountDetails = checkoutSession?.discountDetails || [];
    const nonVoucherDiscounts = discountDetails.filter((d) => {
      const typeStr = String(d.type);
      return (
        d.type === DiscountDetailType.DISCOUNT_DETAIL_TYPE_PRODUCT_DISCOUNT ||
        typeStr === "product_discount" ||
        typeStr === "order_discount" ||
        d.type === DiscountDetailType.DISCOUNT_DETAIL_TYPE_COUPON ||
        typeStr === "DISCOUNT_DETAIL_TYPE_COUPON"
      );
    });

    nonVoucherDiscounts.forEach((discount) => {
      applied.push({
        id: discount.referenceId,
        type: "product_discount",
        discountAmount: discount.discountAmount,
      });
    });

    // Add applied shipping promotion from shippingPromotion field
    if (checkoutSession?.shippingPromotion?.id) {
      applied.push({
        id: checkoutSession.shippingPromotion.id,
        type: "shipping_promotion",
        discountAmount: checkoutSession.shippingPromotion.discountAmount,
      });
    }

    return applied;
  }, [checkoutSession?.appliedVouchers, checkoutSession?.discountDetails, checkoutSession?.shippingPromotion]);

  // Fetch promotions when component mounts or cart changes
  const fetchPromotions = useCallback(async () => {
    if (cartTotal <= 0) return;

    setIsLoadingPromotions(true);
    try {
      const result = await promotionRepository.checkPromotionEligibility({
        cartTotal,
        productIds,
      });

      if (result) {
        // Filter only AUTO_APPLY type (subType = 1)
        const autoApplyProductDiscounts = (
          result.productDiscounts || []
        ).filter((p) => {
          const subType = p.subType;
          return subType === 1;
        });
        const autoApplyOrderDiscounts = (result.orderDiscounts || []).filter(
          (p) => {
            const subType = p.subType;
            return subType === 1;
          },
        );

        setProductDiscounts(autoApplyProductDiscounts);
        setOrderDiscounts(autoApplyOrderDiscounts);
      }

      // Fetch shipping promotions separately
      if (checkoutSession?.id) {
        const shippingPromos = await promotionRepository.getShippingPromotions(
          checkoutSession.id,
        );
        setShippingPromotions(shippingPromos);
      }
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
    } finally {
      setIsLoadingPromotions(false);
    }
  }, [cartTotal, productIds, checkoutSession?.id]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Initialize selectedIds from currently applied promotions.
  // Re-initialize when appliedPromotions changes externally (e.g., promotion removed via cart page).
  useEffect(() => {
    // Wait until appliedPromotions is ready (session loaded)
    if (!checkoutSession) return;

    // Create a stable key from current applied promotions
    const currentKey = appliedPromotions.map((ap) => ap.id).sort().join(",");

    // Detect if applied promotions changed externally (e.g., removed from cart page)
    if (prevAppliedKeyRef.current !== currentKey) {
      prevAppliedKeyRef.current = currentKey;
      // Reset initialization to allow re-sync
      selectionInitializedRef.current = false;
    }

    if (selectionInitializedRef.current) return;
    selectionInitializedRef.current = true;
    setSelectedIds(new Set(appliedPromotions.map((ap) => ap.id)));
  }, [appliedPromotions, checkoutSession]);

  // Helper: check if discount type is percentage
  // Note: Voucher proto uses 0=Fixed, 1=Percent
  // DiscountType enum uses 1=Fixed, 2=Percent
  const isPercentageDiscount = (discountType: unknown): boolean => {
    if (typeof discountType === "string") {
      return discountType.toLowerCase() === "percentage";
    }
    // Check both Voucher convention (1=Percent) and DiscountType enum (2=Percent)
    return (
      discountType === 1 ||
      discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE
    );
  };

  // Helper: format short price
  const formatShortPrice = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}TR`;
    }
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K`;
    }
    return formatPrice(value);
  };

  // Helper: get discount title
  const getDiscountTitle = (
    discountType: unknown,
    discountValue: number,
  ): string => {
    const discountLabel = t("reduce");
    if (isPercentageDiscount(discountType)) {
      return `${discountLabel} ${discountValue}%`;
    }
    return `${discountLabel} ${formatShortPrice(discountValue)}`;
  };

  // Helper: get discount description
  // isPerItemDiscount: true for product_discount and CMS vouchers (Product Discount VOUCHER)
  const getDiscountDescription = (
    minimumOrderValue: number,
    maxDiscountValue?: number,
    discountType?: unknown,
    isPerItemDiscount?: boolean,
    discountValue?: number,
  ): string => {
    const parts: string[] = [];

    if (isPercentageDiscount(discountType)) {
      // Percentage discount: show max discount if available
      if (maxDiscountValue) {
        if (isPerItemDiscount) {
          parts.push(
            `${t("maxDiscountPerProduct")} ${formatShortPrice(maxDiscountValue)}/${t("perEligibleProduct")}`,
          );
        } else {
          parts.push(
            `${t("maxDiscount")} ${formatShortPrice(maxDiscountValue)}`,
          );
        }
      }
    } else if (discountValue && isPerItemDiscount) {
      // Fixed discount for per-item: show amount per product
      parts.push(
        `${t("discountPerProduct")} ${formatShortPrice(discountValue)}/${t("perEligibleProduct")}`,
      );
    }

    if (minimumOrderValue > 0) {
      parts.push(
        `${t("forOrdersAbove")} ${formatShortPrice(minimumOrderValue)}`,
      );
    }

    return parts.join(", ");
  };

  // Helper: format end date
  const formatEndDate = (endDate?: Date): string => {
    if (!endDate) return "";
    const date = new Date(endDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Build unified promotion list
  const allPromotions: PromotionItem[] = useMemo(() => {
    const items: PromotionItem[] = [];

    // Add applied vouchers first
    const appliedVouchers = checkoutSession?.appliedVouchers || [];
    appliedVouchers.forEach((voucher) => {
      // CMS vouchers (Product Discount VOUCHER) are per-item discounts
      const isCmsVoucher = voucher.source === "CMS";
      items.push({
        id: voucher.code,
        name: getDiscountTitle(
          voucher.discountType,
          voucher.discountValue || 0,
        ),
        type: "voucher",
        description: voucher.minimumOrderValue
          ? getDiscountDescription(
            voucher.minimumOrderValue,
            voucher.maxDiscountValue,
            voucher.discountType,
            isCmsVoucher, // CMS vouchers are per-item
            voucher.discountValue,
          )
          : voucher.name,
        isEligible: true,
        isApplied: true,
        isExclusive: false, // Vouchers are stackable by default
        discountAmount: voucher.discountValue,
      });
    });

    // Add product discounts (always per-item)
    productDiscounts.forEach((p) => {
      // Skip if already applied as voucher
      if (items.some((i) => i.id === p.promotionId)) return;

      items.push({
        id: p.promotionId,
        name: getDiscountTitle(p.discountType, p.discountValue),
        type: "product_discount",
        description: getDiscountDescription(
          p.minimumOrderValue,
          p.maxDiscountValue,
          p.discountType,
          true, // Product discounts are per-item
          p.discountValue,
        ),
        isEligible: p.isEligible,
        isApplied: appliedPromotions.some((ap) => ap.id === p.promotionId),
        isExclusive: p.notApplicableWithOtherPromotions || false,
        amountNeededForEligibility: p.amountNeededForEligibility,
        discountAmount: p.potentialDiscount,
        endDate: p.endDate,
      });
    });

    // Add order discounts (per-order, not per-item)
    orderDiscounts.forEach((p) => {
      // Skip if already applied
      if (items.some((i) => i.id === p.promotionId)) return;

      items.push({
        id: p.promotionId,
        name: getDiscountTitle(p.discountType, p.discountValue),
        type: "order_discount",
        description: getDiscountDescription(
          p.minimumOrderValue,
          p.maxDiscountValue,
          p.discountType,
          false, // Order discounts are per-order
          p.discountValue,
        ),
        isEligible: p.isEligible,
        isApplied: appliedPromotions.some((ap) => ap.id === p.promotionId),
        isExclusive: p.notApplicableWithOtherPromotions || false,
        amountNeededForEligibility: p.amountNeededForEligibility,
        discountAmount: p.potentialDiscount,
        endDate: p.endDate,
      });
    });

    // Add applied order discount promo codes from discountDetails
    // These are not returned by check-eligibility (which only returns AUTO_APPLY)
    const discountDetails = checkoutSession?.discountDetails || [];
    discountDetails.forEach((d) => {
      const typeStr = String(d.type);
      // Skip product discounts (AUTO_APPLY CTKM) — they are already shown via productDiscounts state
      // Keep order discounts (promo codes) — backend returns "order_discount" string or numeric COUPON enum
      const isProductDiscountType =
        d.type === DiscountDetailType.DISCOUNT_DETAIL_TYPE_PRODUCT_DISCOUNT ||
        typeStr === "product_discount" ||
        typeStr === "DISCOUNT_DETAIL_TYPE_PRODUCT_DISCOUNT";
      if (isProductDiscountType) return;

      // Skip shipping promotions - they are handled separately below
      if (typeStr === "shipping_promotion") return;

      // Skip if already in the list (from productDiscounts or orderDiscounts)
      if (items.some((i) => i.id === d.referenceId)) return;

      items.push({
        id: d.referenceId,
        name: d.referenceName || getDiscountTitle(d.discountType, d.discountValue),
        type: "order_discount",
        description: getDiscountDescription(
          0,
          undefined,
          d.discountType,
          false,
          d.discountValue,
        ),
        isEligible: true,
        isApplied: true,
        isExclusive: false,
        discountAmount: d.discountAmount,
      });
    });

    // Note: Shipping promotions are handled separately, not added to allPromotions

    return items;
  }, [
    checkoutSession?.appliedVouchers,
    checkoutSession?.discountDetails,
    productDiscounts,
    orderDiscounts,
    shippingPromotions,
    appliedPromotions,
    cartTotal,
    t,
  ]);

  // Build shipping promotion list with inline eligibility calculation
  const shippingPromotionItems: PromotionItem[] = useMemo(() => {
    const items: PromotionItem[] = [];

    shippingPromotions.forEach((promo) => {
      if (!promo.isEnabled) return;

      // Determine if freeship or tiered discount
      const isFreeship = promo.type === ShippingPromotionType.SHIPPING_PROMOTION_TYPE_FREESHIP;

      let minOrder = 0;

      if (isFreeship && promo.freeshippingConfig) {
        minOrder = promo.freeshippingConfig.minimumOrderValue || 0;
      } else if (promo.shippingDiscountConfig?.tiers?.length) {
        // Find lowest tier for eligibility threshold
        const lowestTier = promo.shippingDiscountConfig.tiers.reduce(
          (min, tier) =>
            tier.minimumOrderValue < min.minimumOrderValue ? tier : min,
          promo.shippingDiscountConfig.tiers[0],
        );
        minOrder = lowestTier.minimumOrderValue;
      }

      const isEligible = cartTotal >= minOrder;
      const appliedPromo = appliedPromotions.find((ap) => ap.id === promo.id);

      items.push({
        id: promo.id,
        name: promo.name || t("shippingPromotion.shippingFeeDiscount"),
        type: "shipping_promotion",
        description:
          minOrder > 0
            ? `${t("forOrdersAbove")} ${formatShortPrice(minOrder)}`
            : "",
        isEligible,
        isApplied: !!appliedPromo,
        isExclusive: false,
        amountNeededForEligibility: isEligible ? undefined : minOrder - cartTotal,
        discountAmount: appliedPromo?.discountAmount,
        endDate: promo.endTime,
      });
    });

    return items;
  }, [shippingPromotions, cartTotal, appliedPromotions, t]);

  // Split shipping promotions into eligible and not eligible
  const eligibleShippingPromotions = shippingPromotionItems.filter((p) => p.isEligible);
  const notEligibleShippingPromotions = shippingPromotionItems.filter((p) => !p.isEligible);

  // Sort shipping: applied first
  const sortedEligibleShipping = [...eligibleShippingPromotions].sort((a, b) => {
    if (a.isApplied) return -1;
    if (b.isApplied) return 1;
    return 0;
  });

  // Sort not eligible shipping: by amount needed (closest first)
  const sortedNotEligibleShipping = [...notEligibleShippingPromotions].sort(
    (a, b) =>
      (a.amountNeededForEligibility ?? 0) - (b.amountNeededForEligibility ?? 0),
  );

  // Split into eligible and not eligible
  const eligiblePromotions = allPromotions.filter((p) => p.isEligible);
  const notEligiblePromotions = allPromotions.filter((p) => !p.isEligible);

  // Sort eligible: applied first
  const sortedEligible = [...eligiblePromotions].sort((a, b) => {
    if (a.isApplied) return -1;
    if (b.isApplied) return 1;
    return 0;
  });

  // Sort not eligible: by amount needed (closest first)
  const sortedNotEligible = [...notEligiblePromotions].sort(
    (a, b) =>
      (a.amountNeededForEligibility ?? 0) - (b.amountNeededForEligibility ?? 0),
  );

  // Toggle a promotion in local UI state only — no API calls here.
  // Single-select: clicking a new promotion replaces the current selection;
  // clicking the already-selected promotion deselects it (no promotion).
  // For shipping promotions, they are handled separately and don't affect regular promotions.
  const handleTogglePromotion = (promotionId: string, isShippingPromotion = false) => {
    const promoList = isShippingPromotion ? shippingPromotionItems : allPromotions;
    const promo = promoList.find((p) => p.id === promotionId);
    if (!promo || !promo.isEligible) return;

    if (selectedIds.has(promotionId)) {
      // Deselect — remove this promotion from selection
      const newIds = new Set(selectedIds);
      newIds.delete(promotionId);
      setSelectedIds(newIds);
    } else {
      if (isShippingPromotion) {
        // For shipping promotions: remove any existing shipping promotion and add this one
        const otherShippingIds = shippingPromotionItems.map((p) => p.id);
        const newIds = new Set([...selectedIds].filter((id) => !otherShippingIds.includes(id)));
        newIds.add(promotionId);
        setSelectedIds(newIds);
      } else {
        // For regular promotions: single-select behavior
        // Remove other regular promotions but keep shipping promotions
        const shippingIds = shippingPromotionItems.map((p) => p.id);
        const newIds = new Set([...selectedIds].filter((id) => shippingIds.includes(id)));
        newIds.add(promotionId);
        setSelectedIds(newIds);
      }
    }
  };

  // Apply voucher code immediately (hits backend) then sync local selectedIds.
  // Vouchers/promo-codes are applied on the spot because the backend validates the code.
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      showErrorToast(t("voucherCodeRequired"));
      return;
    }

    if (!checkoutSession?.id) {
      showErrorToast(t("checkoutSessionNotFound"));
      return;
    }

    setIsApplying(true);
    const existingDetailIds = new Set(
      (checkoutSession.discountDetails || []).map((d) => d.referenceId),
    );
    try {
      const updatedSession = await promotionRepository.applyVoucher(
        voucherCode.trim(),
        checkoutSession.id,
      );
      showSuccessToast(t("voucherAppliedSuccess"));
      setVoucherCode("");
      onCheckoutSessionUpdate(updatedSession);

      // Sync selectedIds: find the single newly applied ID
      const appliedVoucherCodes = (updatedSession.appliedVouchers || []).map(
        (v) => v.code,
      );
      if (appliedVoucherCodes.includes(voucherCode.trim())) {
        // It was a CDP/CMS voucher — use the code as the ID
        setSelectedIds(new Set([voucherCode.trim()]));
      } else {
        // It was an order-discount promo code — find the new discountDetail by diffing
        const newDetail = (updatedSession.discountDetails || []).find(
          (d) => !existingDetailIds.has(d.referenceId),
        );
        if (newDetail) {
          setSelectedIds(new Set([newDetail.referenceId]));
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || t("voucherApplyError");
      showErrorToast(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  // Confirm: diff selectedIds vs appliedPromotions and make the minimum API calls.
  // Special case: shipping promotions ALWAYS call apply API (to force recalculation on backend)
  const handleConfirm = async () => {
    if (!checkoutSession?.id) {
      showErrorToast(t("checkoutSessionNotFound"));
      return;
    }

    // Get IDs of all shipping promotions for special handling
    const shippingPromoIds = new Set(shippingPromotionItems.map((p) => p.id));

    // For appliedIds, exclude shipping promotions (they need to always re-apply)
    const appliedIdsExcludingShipping = new Set(
      appliedPromotions.filter((ap) => ap.type !== "shipping_promotion").map((ap) => ap.id)
    );

    // Promotions to remove: currently applied but not in selectedIds
    const toRemove = appliedPromotions.filter((ap) => !selectedIds.has(ap.id));

    // Promotions to add: in selectedIds but not currently applied
    // For shipping promotions: always include if selected (force re-apply)
    const toAdd = [...selectedIds].filter((id) => {
      if (shippingPromoIds.has(id)) {
        // Shipping promotion: always add (force API call for recalculation)
        return true;
      }
      // Other promotions: only add if not already applied
      return !appliedIdsExcludingShipping.has(id);
    });

    // Nothing changed — just close (but only if no shipping promotion is selected)
    const hasSelectedShipping = [...selectedIds].some((id) => shippingPromoIds.has(id));
    if (toRemove.length === 0 && toAdd.length === 0 && !hasSelectedShipping) {
      onClose?.();
      return;
    }

    setIsProcessing(true);
    try {
      let latestSession: CheckoutSession = checkoutSession;

      // Step 1: Remove deselected promotions
      for (const applied of toRemove) {
        if (applied.type === "voucher") {
          latestSession = await promotionRepository.removeVoucher(
            latestSession.id,
            applied.id,
          );
        } else if (applied.type === "shipping_promotion") {
          latestSession = await promotionRepository.removeShippingPromotion(
            latestSession.id,
          );
        } else {
          latestSession = await promotionRepository.removeProductDiscount(
            latestSession.id,
            applied.id,
          );
        }
        onCheckoutSessionUpdate(latestSession);
      }

      // Step 2: Apply newly selected promotions
      for (const id of toAdd) {
        // Search in both regular promotions and shipping promotions
        let promo = allPromotions.find((p) => p.id === id);
        if (!promo) {
          promo = shippingPromotionItems.find((p) => p.id === id);
        }
        if (!promo) continue;

        if (promo.type === "voucher") {
          // Vouchers entered via code input are already applied — skip
          continue;
        } else if (promo.type === "shipping_promotion") {
          // Shipping promotion - always call apply API
          latestSession = await promotionRepository.applyShippingPromotion(
            latestSession.id,
            id,
          );
          onCheckoutSessionUpdate(latestSession);
        } else {
          // product_discount or order_discount
          latestSession = await promotionRepository.applyProductDiscount({
            promotionId: id,
            checkoutSessionId: latestSession.id,
          });
          onCheckoutSessionUpdate(latestSession);
        }
      }

      // Step 3: Sync cart once after all changes
      if (toRemove.length > 0 || toAdd.length > 0) {
        await cartRepository.syncCart();
      }

      if (toRemove.length > 0 && toAdd.length === 0) {
        showSuccessToast(t("promotionPicker.removeSuccess"));
      } else if (toAdd.length > 0) {
        showSuccessToast(t("promotionPicker.applySuccess"));
      }

      onClose?.();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || t("promotionPicker.applyError");
      showErrorToast(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const containerClassName =
    mode === "page" ? "bg-[#FEF8F1] min-h-screen py-4" : "bg-white";
  const innerClassName =
    mode === "page" ? "max-w-2xl mx-auto px-4 lg:px-8" : "px-4";

  return (
    <Box className={containerClassName}>
      <Box className={innerClassName}>
        {/* Header: Apply voucher input */}
        <Box className="mb-6">
          <Flex
            align="center"
            justify="center"
            className={`gap-1 p-4 rounded-lg ${mode === "page" ? "bg-white shadow" : ""
              }`}
          >
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder={t("enterDiscountCodePlaceholder")}
              className="flex-1 h-[38px] rounded-l-full px-4 py-2 bg-white border border-[#F0F0F0] text-black placeholder-gray-400 focus:outline-none focus:border-[#FAA63E]"
              disabled={isApplying}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApplyVoucher();
                }
              }}
            />
            <Button
              onClick={handleApplyVoucher}
              disabled={isApplying || !voucherCode.trim()}
              className="w-[89px] h-[40px] rounded-r-full cursor-pointer bg-gradient-to-r from-[#FAA63E] via-[#EA9839] to-[#9B5526] text-white font-medium text-xs p-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? t("applying") : t("apply")}
            </Button>
          </Flex>
        </Box>

        {/* Loading */}
        {isLoadingPromotions && (
          <Flex justify="center" className="py-8">
            <Box className="w-6 h-6 border-2 border-[#FAA63E] border-t-transparent rounded-full animate-spin" />
          </Flex>
        )}

        {/* Available promotions section - "Ưu đãi khả dụng" */}
        {!isLoadingPromotions && sortedEligible.length > 0 && (
          <Box className="mb-6">
            <Heading size="4" className="mb-4 text-black">
              {t("availableVouchers")}
            </Heading>

            <Flex direction="column" gap="3">
              {sortedEligible.map((promo) => {
                const isHighlighted = selectedIds.has(promo.id);
                return (
                  <Box
                    key={promo.id}
                    onClick={() => handleTogglePromotion(promo.id)}
                    className={`relative cursor-pointer rounded-[8px] w-full min-h-[88px] overflow-hidden ${isHighlighted
                        ? "border-2 border-[#FAA63E]"
                        : "border border-gray-200"
                      }`}
                  >
                    <Flex
                      direction="row"
                      align="stretch"
                      className="h-full min-h-[88px]"
                    >
                      {/* Content area */}
                      <Box className="flex-1 bg-white p-4 pl-5">
                        <Flex direction="column" gap="1">
                          <Text className="text-[#C0752F] font-bold text-base">
                            {promo.name}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            {promo.description}
                          </Text>
                          {promo.endDate && (
                            <Text className="text-gray-400 text-xs">
                              {t("validUntil")}: {formatEndDate(promo.endDate)}
                            </Text>
                          )}
                        </Flex>
                      </Box>

                      {/* Right section with checkmark */}
                      <Flex
                        align="center"
                        justify="center"
                        className={`w-16 ${isHighlighted
                            ? "bg-[#FAA63E]"
                            : "bg-white border-l border-gray-200"
                          }`}
                      >
                        {isHighlighted ? (
                          <Image
                            src="/assets/svg/product/selected_icon.svg"
                            alt="Selected"
                            width={24}
                            height={24}
                            className="w-6 h-6"
                          />
                        ) : (
                          <Image
                            src="/assets/svg/product/unselected_icon.svg"
                            alt="Not selected"
                            width={24}
                            height={24}
                            className="w-6 h-6"
                          />
                        )}
                      </Flex>
                    </Flex>
                  </Box>
                );
              })}
            </Flex>
          </Box>
        )}

        {/* Not eligible promotions section - "Ưu đãi không khả dụng" */}
        {!isLoadingPromotions && sortedNotEligible.length > 0 && (
          <Box className="mb-6">
            <Heading size="4" className="mb-4 text-gray-400">
              {t("unavailableVouchers")}
            </Heading>

            <Flex direction="column" gap="3">
              {sortedNotEligible.map((promo) => (
                <Box
                  key={promo.id}
                  className="relative rounded-[8px] w-full min-h-[88px] overflow-hidden border border-gray-200 opacity-60"
                >
                  <Flex
                    direction="row"
                    align="stretch"
                    className="h-full min-h-[88px]"
                  >
                    {/* Content area */}
                    <Box className="flex-1 bg-white p-4 pl-5">
                      <Flex direction="column" gap="1">
                        <Text className="text-gray-500 font-bold text-base">
                          {promo.name}
                        </Text>
                        <Text className="text-sm text-gray-400">
                          {promo.description}
                        </Text>
                        {promo.endDate && (
                          <Text className="text-gray-400 text-xs">
                            {t("validUntil")}: {formatEndDate(promo.endDate)}
                          </Text>
                        )}
                      </Flex>
                    </Box>

                    {/* Right section */}
                    <Flex
                      align="center"
                      justify="center"
                      className="w-16 bg-white border-l border-gray-200"
                    >
                      <Image
                        src="/assets/svg/product/unselected_icon.svg"
                        alt="Not available"
                        width={24}
                        height={24}
                        className="w-6 h-6 opacity-50"
                      />
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Flex>
          </Box>
        )}

        {/* Shipping Promotions Section - "Ưu đãi vận chuyển" */}
        {!isLoadingPromotions && shippingPromotionItems.length > 0 && (
          <Box className="mb-6">
            <Heading size="4" className="mb-4 text-black">
              {t("shippingPromotion.title")}
            </Heading>

            <Flex direction="column" gap="3">
              {/* Eligible shipping promotions */}
              {sortedEligibleShipping.map((promo) => {
                const isHighlighted = selectedIds.has(promo.id);
                return (
                  <Box
                    key={promo.id}
                    onClick={() => handleTogglePromotion(promo.id, true)}
                    className={`relative cursor-pointer rounded-[8px] w-full min-h-[88px] overflow-hidden ${isHighlighted
                        ? "border-2 border-[#FAA63E]"
                        : "border border-gray-200"
                      }`}
                  >
                    <Flex
                      direction="row"
                      align="stretch"
                      className="h-full min-h-[88px]"
                    >
                      {/* Content area */}
                      <Box className="flex-1 bg-white p-4 pl-5">
                        <Flex direction="column" gap="1">
                          <Text className="text-[#C0752F] font-bold text-base">
                            {promo.name}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            {promo.description}
                          </Text>
                          {promo.endDate && (
                            <Text className="text-gray-400 text-xs">
                              {t("validUntil")}: {formatEndDate(promo.endDate)}
                            </Text>
                          )}
                        </Flex>
                      </Box>

                      {/* Right section with checkmark */}
                      <Flex
                        align="center"
                        justify="center"
                        className={`w-16 ${isHighlighted
                            ? "bg-[#FAA63E]"
                            : "bg-white border-l border-gray-200"
                          }`}
                      >
                        {isHighlighted ? (
                          <Image
                            src="/assets/svg/product/selected_icon.svg"
                            alt="Selected"
                            width={24}
                            height={24}
                            className="w-6 h-6"
                          />
                        ) : (
                          <Image
                            src="/assets/svg/product/unselected_icon.svg"
                            alt="Not selected"
                            width={24}
                            height={24}
                            className="w-6 h-6"
                          />
                        )}
                      </Flex>
                    </Flex>
                  </Box>
                );
              })}

              {/* Not eligible shipping promotions */}
              {sortedNotEligibleShipping.map((promo) => (
                <Box
                  key={promo.id}
                  className="relative rounded-[8px] w-full min-h-[88px] overflow-hidden border border-gray-200 opacity-60"
                >
                  <Flex
                    direction="row"
                    align="stretch"
                    className="h-full min-h-[88px]"
                  >
                    {/* Content area */}
                    <Box className="flex-1 bg-white p-4 pl-5">
                      <Flex direction="column" gap="1">
                        <Text className="text-gray-500 font-bold text-base">
                          {promo.name}
                        </Text>
                        <Text className="text-sm text-gray-400">
                          {promo.description}
                        </Text>
                        {promo.endDate && (
                          <Text className="text-gray-400 text-xs">
                            {t("validUntil")}: {formatEndDate(promo.endDate)}
                          </Text>
                        )}
                      </Flex>
                    </Box>

                    {/* Right section */}
                    <Flex
                      align="center"
                      justify="center"
                      className="w-16 bg-white border-l border-gray-200"
                    >
                      <Image
                        src="/assets/svg/product/unselected_icon.svg"
                        alt="Not available"
                        width={24}
                        height={24}
                        className="w-6 h-6 opacity-50"
                      />
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Flex>
          </Box>
        )}

        {/* Empty state */}
        {!isLoadingPromotions && allPromotions.length === 0 && shippingPromotionItems.length === 0 && (
          <Box
            className={`rounded-lg p-6 text-center mb-6 ${mode === "page" ? "bg-white shadow" : "bg-gray-50"}`}
          >
            <Text className="text-gray-500">
              {t("promotionPicker.noPromotions")}
            </Text>
          </Box>
        )}

        {/* Footer: Confirm button */}
        <Box className="mt-6">
          <GradientButton
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full h-12"
          >
            {isProcessing ? t("confirmingRemoval") : t("confirmButton")}
          </GradientButton>
        </Box>
      </Box>
    </Box>
  );
}
