"use client";

import { formatPrice } from "@/lib/utils/format";
import type { ProductDiscountEligibility } from "@/types/productDiscount";
import { ProductDiscountSubType, DiscountType } from "@/types/productDiscount";
import type { CheckoutSession } from "@/types/gen/shop/shared/checkout-sessions/checkout-session";
import { Box, Flex, Text, Heading } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ProductDiscountSectionProps {
  eligibilityList: ProductDiscountEligibility[];
  checkoutSession: CheckoutSession | null;
  onApply: (_promotionId: string) => Promise<void>;
  onRemove: (_promotionId: string) => Promise<void>;
  isLoading?: boolean;
  isPaymentProcessing?: boolean;
}

/**
 * Product discount section component - shows "Ưu đãi khả dụng"
 * Displays ONLY eligible product discount promotions (AUTO_APPLY subtype) - CTKM
 * Vouchers are handled separately by VoucherSection
 * UI matches the design with orange/brown gradient colors
 */
export function ProductDiscountSection({
  eligibilityList,
  checkoutSession,
  onApply,
  onRemove,
  isLoading = false,
  isPaymentProcessing = false,
}: ProductDiscountSectionProps) {
  const t = useTranslations("cart");
  const [applyingPromotionId, setApplyingPromotionId] = useState<string | null>(null);

  // Helper to check if subType is AUTO_APPLY
  // Backend returns number (1 = AUTO_APPLY), proto enum has prefix
  const isAutoApplySubType = (subType: unknown): boolean => {
    if (typeof subType === "number") {
      return subType === 1; // Backend enum: AUTO_APPLY = 1
    }
    return subType === ProductDiscountSubType.PRODUCT_DISCOUNT_SUB_TYPE_AUTO_APPLY;
  };

  // Filter only AUTO_APPLY type promotions (CTKM)
  const autoApplyPromotions = eligibilityList.filter((p) =>
    isAutoApplySubType(p.subType)
  );

  // Check if any Product Discount (AUTO_APPLY) is already applied
  const appliedProductDiscountId = checkoutSession?.discountDetails?.find(
    (d) => String(d.type) === "product_discount"
  )?.referenceId;

  // Split into eligible and not eligible promotions
  const eligiblePromotions = autoApplyPromotions.filter((p) => p.isEligible);
  const notEligiblePromotions = autoApplyPromotions.filter((p) => !p.isEligible);

  // Sort eligible: applied first, then by potential discount (highest first)
  const sortedEligible = [...eligiblePromotions].sort((a, b) => {
    if (a.promotionId === appliedProductDiscountId) return -1;
    if (b.promotionId === appliedProductDiscountId) return 1;
    return b.potentialDiscount - a.potentialDiscount;
  });

  // Sort not eligible: by amount needed (lowest first - closest to eligible)
  const sortedNotEligible = [...notEligiblePromotions].sort(
    (a, b) => (a.amountNeededForEligibility ?? 0) - (b.amountNeededForEligibility ?? 0)
  );

  // Check if there's anything to show
  const hasEligiblePromotions = sortedEligible.length > 0;
  const hasNotEligiblePromotions = sortedNotEligible.length > 0;

  if (!hasEligiblePromotions && !hasNotEligiblePromotions) {
    return null;
  }

  const handleToggle = async (promotionId: string) => {
    if (isPaymentProcessing || applyingPromotionId) return;

    const isApplied = appliedProductDiscountId === promotionId;
    setApplyingPromotionId(promotionId);

    try {
      if (isApplied) {
        await onRemove(promotionId);
      } else {
        await onApply(promotionId);
      }
    } finally {
      setApplyingPromotionId(null);
    }
  };

  // Helper to check if discount type is percentage
  // Backend returns string "percentage" or "fixed", proto enum is number
  const isPercentageDiscount = (discountType: unknown): boolean => {
    if (typeof discountType === "string") {
      return discountType.toLowerCase() === "percentage";
    }
    return discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE;
  };

  // Helper to format price in short form (50000 -> "50K", 1000000 -> "1TR")
  const formatShortPrice = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}TR`;
    }
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K`;
    }
    return formatPrice(value);
  };

  // Helper to format the main discount title (e.g., "GIẢM 50K", "GIẢM 30%")
  const getDiscountTitle = (promotion: ProductDiscountEligibility): string => {
    if (isPercentageDiscount(promotion.discountType)) {
      // For percentage: show "GIẢM 10%" and optionally max discount
      if (promotion.maxDiscountValue) {
        return `GIẢM ${promotion.discountValue}% (tối đa ${formatShortPrice(promotion.maxDiscountValue)})`;
      }
      return `GIẢM ${promotion.discountValue}%`;
    }
    // Format fixed amount (e.g., 50000 -> "GIẢM 50K")
    return `GIẢM ${formatShortPrice(promotion.discountValue)}`;
  };

  // Helper to get discount description for AUTO_APPLY promotions
  const getDiscountDescription = (promotion: ProductDiscountEligibility): string => {
    return `Đơn tối thiểu ${formatPrice(promotion.minimumOrderValue)}`;
  };

  return (
    <Box className="mt-4">
      {/* Eligible promotions section - "Ưu đãi khả dụng" */}
      {hasEligiblePromotions && (
        <Box className="mb-4 px-4 lg:px-0">
          <Heading size="3" className="mb-3 text-black">
            {t("productDiscount.availableTitle")}
          </Heading>

          <Flex direction="column" gap="3">
            {sortedEligible.map((promotion) => {
              const isApplied = appliedProductDiscountId === promotion.promotionId;
              const isProcessing = applyingPromotionId === promotion.promotionId;
              const isDisabled = isPaymentProcessing || (applyingPromotionId !== null && !isProcessing);

              return (
                <Box
                  key={promotion.promotionId}
                  onClick={() => !isDisabled && handleToggle(promotion.promotionId)}
                  className={`relative rounded-[8px] w-full min-h-[80px] overflow-hidden ${
                    isDisabled && !isProcessing ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  }`}
                  style={isApplied ? {
                    background: "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
                  } : {
                    border: "1px solid #FAA63E",
                    background: "white",
                  }}
                >
                  {/* Main card container */}
                  <Flex direction="row" align="stretch" className="h-full min-h-[80px]">
                    {/* Content area */}
                    <Box className={`flex-1 bg-white p-3 pl-4 ${isApplied ? "m-[2px] mr-0 rounded-l-[6px]" : "rounded-l-[8px]"}`}>
                      <Flex direction="column" gap="1">
                        {/* Title: e.g., "GIẢM 50K" */}
                        <Text className="text-[#C0752F] font-bold text-base">
                          {getDiscountTitle(promotion)}
                        </Text>

                        {/* Description: conditions */}
                        <Text className="text-sm text-gray-600 line-clamp-1">
                          {getDiscountDescription(promotion)}
                        </Text>

                        {/* HSD (Expiry) - placeholder */}
                        <Text className="text-gray-400 text-xs">
                          Hạn sử dụng 30.11.2025
                        </Text>
                      </Flex>
                    </Box>

                    {/* Right section with checkmark */}
                    <Flex
                      align="center"
                      justify="center"
                      className={`w-14 ${isApplied ? "" : "bg-white rounded-r-[8px] border-l border-[#FAA63E]"}`}
                      style={isApplied ? {
                        background: "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
                      } : undefined}
                    >
                      {isProcessing ? (
                        <Box className={`w-6 h-6 border-2 ${isApplied ? "border-white" : "border-[#C0752F]"} border-t-transparent rounded-full animate-spin`} />
                      ) : isApplied ? (
                        <Box className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5L5 9L13 1" stroke="#C0752F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Box>
                      ) : (
                        <Box className="w-6 h-6 rounded-full border-2 border-[#C0752F]" />
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
      {hasNotEligiblePromotions && (
        <Box className="px-4 lg:px-0">
          <Heading size="3" className="mb-3 text-gray-400">
            {t("productDiscount.unavailableTitle")}
          </Heading>

          <Flex direction="column" gap="3">
            {sortedNotEligible.map((promotion) => (
              <Box
                key={promotion.promotionId}
                className="relative rounded-[8px] border w-full min-h-[80px] bg-white border-gray-200 opacity-60"
              >
                {/* Main card container */}
                <Flex direction="row" align="stretch" className="h-full min-h-[80px]">
                  {/* Content area */}
                  <Box className="flex-1 bg-white p-3 pl-4 rounded-l-[8px]">
                    <Flex direction="column" gap="1">
                      {/* Title: e.g., "GIẢM 30%" */}
                      <Text className="text-gray-500 font-bold text-base">
                        {getDiscountTitle(promotion)}
                      </Text>

                      {/* Description: conditions */}
                      <Text className="text-sm text-gray-400 line-clamp-1">
                        {getDiscountDescription(promotion)}
                      </Text>

                      {/* HSD (Expiry) - placeholder */}
                      <Text className="text-gray-400 text-xs">
                        Hạn sử dụng 30.11.2025
                      </Text>
                    </Flex>
                  </Box>

                  {/* Right section with disabled checkmark */}
                  <Flex
                    align="center"
                    justify="center"
                    className="w-14 bg-white rounded-r-[8px] border-l border-gray-200"
                  >
                    <Box className="w-6 h-6 rounded-full border-2 border-gray-300" />
                  </Flex>
                </Flex>
              </Box>
            ))}
          </Flex>
        </Box>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <Flex justify="center" className="py-4">
          <Box className="w-6 h-6 border-2 border-[#FAA63E] border-t-transparent rounded-full animate-spin" />
        </Flex>
      )}
    </Box>
  );
}
