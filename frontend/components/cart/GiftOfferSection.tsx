"use client";

import { formatPrice } from "@/lib/utils/format";
import type {
  BundleDealEligibilityResponse,
  EligibleGiftTierResponse,
  GiftProductDetailResponse,
} from "@/types/cart";
import { Box, Button, Flex, Text, Progress } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { GiftSelectionPopup } from "./GiftSelectionPopup";
import { BuyXGetYGiftSelectionPopup } from "./BuyXGetYGiftSelectionPopup";
import useEmblaCarousel from "embla-carousel-react";

interface GiftOfferSectionProps {
  eligibilityDataList: BundleDealEligibilityResponse[];
  onSelectGift: (
    _promotionId: string,
    _tierId: string,
    _productId: string,
    _variantId?: string,
  ) => Promise<void>;
  onSetBuyXGetYGifts?: (
    _promotionId: string,
    _gifts: Array<{ productId: string; variantId?: string; quantity: number }>,
  ) => Promise<void>;
  isLoading?: boolean;
  selectedGiftProductIds?: string[];
  isPaymentProcessing?: boolean;
}

interface TierWithPromotion {
  tier: EligibleGiftTierResponse;
  promotionId: string;
}

interface NextTierWithPromotion extends TierWithPromotion {
  amountNeeded: number;
}

interface GiftTierSliderProps {
  tiersWithPromotion: TierWithPromotion[];
  nextTiersWithPromotion: NextTierWithPromotion[];
  isLoading: boolean;
  isSelecting: boolean;
  onDirectClaim: (
    _tierWithPromotion: TierWithPromotion,
    _product: GiftProductDetailResponse,
  ) => void;
  onChangeGift: (_tierWithPromotion: TierWithPromotion) => void;
  selectedGiftProductIds: string[];
  isPaymentProcessing: boolean;
}

/**
 * Gift tier slider component using Embla Carousel
 * Combines all products from all tiers into a single horizontal slider
 */
function GiftTierSlider({
  tiersWithPromotion,
  nextTiersWithPromotion,
  isLoading,
  isSelecting,
  onDirectClaim,
  onChangeGift,
  selectedGiftProductIds,
  isPaymentProcessing,
}: GiftTierSliderProps) {
  const t = useTranslations("cart");
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  // Helper function to check if a product is selected
  // Matches against both base productId AND variant IDs
  const isProductSelected = (product: GiftProductDetailResponse): boolean => {
    // Check base product ID
    if (selectedGiftProductIds.includes(product.productId)) {
      return true;
    }
    // Check variant IDs (cart stores variant ID as productId when variant is selected)
    if (product.variants && product.variants.length > 0) {
      return product.variants.some((variant) =>
        selectedGiftProductIds.includes(variant.variantId),
      );
    }
    return false;
  };

  // Flatten all products from eligible tiers (claimable)
  const eligibleProducts = tiersWithPromotion.flatMap(({ tier, promotionId }) =>
    tier.giftProducts.map((product) => ({
      product,
      tier,
      promotionId,
      isProductSelected: isProductSelected(product),
      isLocked: false,
      amountNeeded: 0,
    })),
  );

  // Flatten all products from next tiers (locked/preview)
  const lockedProducts = nextTiersWithPromotion.flatMap(
    ({ tier, promotionId, amountNeeded }) =>
      tier.giftProducts.map((product) => ({
        product,
        tier,
        promotionId,
        isProductSelected: false,
        isLocked: true,
        amountNeeded,
      })),
  );

  // Combine and sort: eligible first, then locked; within group sort by value
  const sortedProducts = [...eligibleProducts, ...lockedProducts].sort(
    (a, b) => {
      if (a.isLocked !== b.isLocked) return a.isLocked ? 1 : -1;
      if (a.isLocked && b.isLocked) return a.amountNeeded - b.amountNeeded;
      if (a.tier.minOrderValue !== b.tier.minOrderValue)
        return b.tier.minOrderValue - a.tier.minOrderValue;
      return b.product.price - a.product.price;
    },
  );

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-3 pb-2">
        {sortedProducts.map(
          ({
            product,
            tier,
            promotionId,
            isProductSelected,
            isLocked,
            amountNeeded,
          }) => {
            // Show all products, but highlight the selected one, and show locked state for next tier products
            return (
              <div
                key={`${promotionId}-${tier.tierId}-${product.productId}`}
                className={`bg-white rounded-lg p-3 border flex-[0_0_160px] min-w-0 flex flex-col ${
                  isProductSelected
                    ? "border-[#FAA63E]"
                    : isLocked
                      ? "border-gray-300"
                      : "border-gray-200"
                } ${isLocked ? "opacity-80" : ""}`}
              >
                <Flex direction="column" gap="2" className="h-full">
                  {/* Gift product image - centered */}
                  <Box
                    className="bg-gray-100 overflow-hidden rounded-lg mx-auto"
                    style={{ width: "100px", height: "100px" }}
                  >
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Box className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Text size="1" color="gray">
                          {t("giftOffer.noImage")}
                        </Text>
                      </Box>
                    )}
                  </Box>

                  {/* Gift info - stacked vertically, grows to push button to bottom */}
                  <Flex direction="column" gap="1" className="flex-grow">
                    {/* Gift badge */}
                    <Box className="inline-flex">
                      <Text className="bg-[#FAA63E] text-white px-2 py-0.5 rounded text-xs font-medium">
                        {t("giftOffer.giftBadge")}
                      </Text>
                    </Box>

                    {/* Product name */}
                    <Text
                      className="text-black font-medium line-clamp-2"
                      style={{ fontSize: "13px" }}
                    >
                      {product.name || t("giftOffer.giftBadge")}
                    </Text>

                    {/* Min order value hint - gray text */}
                    {tier.minOrderValue > 0 && (
                      <Text
                        className="text-gray-500"
                        style={{ fontSize: "11px" }}
                      >
                        {t("giftOffer.minOrderLabel", {
                          amount: formatPrice(tier.minOrderValue),
                        })}
                      </Text>
                    )}

                    {/* Price info with -100% badge */}
                    <Flex align="center" gap="2">
                      <Text
                        weight="bold"
                        className="text-[#FAA63E]"
                        style={{ fontSize: "14px" }}
                      >
                        0đ
                      </Text>
                      {product.price > 0 && (
                        <Text
                          className="text-gray-400 line-through"
                          style={{ fontSize: "12px" }}
                        >
                          {formatPrice(product.price)}
                        </Text>
                      )}
                      {/* Red -100% badge */}
                      <Box className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                        -100%
                      </Box>
                    </Flex>
                  </Flex>

                  {/* Action button - full width at bottom */}
                  <Box className="mt-auto">
                    {isLocked ? (
                      // Locked state - show hint to buy more
                      <Text
                        className="text-center text-gray-500 w-full"
                        style={{ fontSize: "12px" }}
                      >
                        {amountNeeded > 0
                          ? t("giftOffer.buyMoreToUnlock", {
                              amount: formatPrice(amountNeeded),
                            })
                          : t("giftOffer.buyMoreProductsToUnlock", {
                              count: Math.abs(amountNeeded) || 1,
                            })}
                      </Text>
                    ) : isProductSelected ? (
                      <Button
                        variant="ghost"
                        size="1"
                        className={`text-[#FAA63E] hover:bg-[#FAA63E]/10 w-full ${isPaymentProcessing ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                        onClick={() => onChangeGift({ tier, promotionId })}
                        disabled={
                          isLoading || isSelecting || isPaymentProcessing
                        }
                      >
                        {t("giftOffer.changeButton")}
                      </Button>
                    ) : (
                      <Button
                        size="1"
                        className={`w-full ${isPaymentProcessing ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                        style={{
                          background:
                            "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)",
                          color: "white",
                          borderRadius: "20px",
                          padding: "4px 12px",
                        }}
                        onClick={() =>
                          onDirectClaim({ tier, promotionId }, product)
                        }
                        disabled={
                          isLoading || isSelecting || isPaymentProcessing
                        }
                      >
                        {t("giftOffer.claimButton")}
                      </Button>
                    )}
                  </Box>
                </Flex>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

/**
 * Gift offer section component - shows "Ưu đãi dành riêng cho bạn"
 * Displays eligible gift tiers and hint for next tier
 * Merges all tiers from all promotions into a single block
 */
export function GiftOfferSection({
  eligibilityDataList,
  onSelectGift,
  onSetBuyXGetYGifts,
  isLoading = false,
  selectedGiftProductIds = [],
  isPaymentProcessing = false,
}: GiftOfferSectionProps) {
  const t = useTranslations("cart");
  const [selectedTierWithPromotion, setSelectedTierWithPromotion] =
    useState<TierWithPromotion | null>(null);
  const [buyXGetYPopupEligibility, setBuyXGetYPopupEligibility] =
    useState<BundleDealEligibilityResponse | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  if (!eligibilityDataList || eligibilityDataList.length === 0) {
    return null;
  }

  // Separate BUY_TO_GET_GIFT (subType=1) and BUY_X_GET_Y (subType=2)
  const buyToGetGiftList = eligibilityDataList.filter((e) => e.subType === 1);
  const buyXGetYList = eligibilityDataList.filter((e) => e.subType === 2);

  // Merge all eligible tiers from BUY_TO_GET_GIFT promotions
  const allTiersWithPromotion: TierWithPromotion[] = buyToGetGiftList.flatMap(
    (eligibility) =>
      eligibility.eligibleTiers.map((tier) => ({
        tier,
        promotionId: eligibility.promotionId,
      })),
  );

  // For BUY_X_GET_Y: convert root-level giftProducts into synthetic tiers
  // Show when required quantity is met AND minimumOrderValue is satisfied
  buyXGetYList.forEach((eligibility) => {
    const hasGiftProducts =
      eligibility.giftProducts && eligibility.giftProducts.length > 0;
    const meetsRequiredQty =
      (eligibility.currentRequiredQuantity ?? 0) >=
      (eligibility.requiredQuantity ?? 1);
    const meetsMinOrderValue =
      eligibility.minimumOrderValue == null ||
      (eligibility.cartTotal ?? 0) >= eligibility.minimumOrderValue;
    const canClaimOrChange =
      (eligibility.remainingGiftQuantity ?? 0) > 0 ||
      eligibility.currentGifts.length > 0;

    if (
      hasGiftProducts &&
      meetsRequiredQty &&
      meetsMinOrderValue &&
      canClaimOrChange
    ) {
      allTiersWithPromotion.push({
        tier: {
          tierId: "",
          minOrderValue: eligibility.minimumOrderValue ?? 0,
          giftProducts: eligibility.giftProducts,
          isClaimed: eligibility.currentGifts.length > 0,
        },
        promotionId: eligibility.promotionId,
      });
    }
  });

  // Collect next tier products from BUY_TO_GET_GIFT promotions (tiers not yet unlocked but close)
  const nextTiersWithPromotion: NextTierWithPromotion[] = buyToGetGiftList
    .filter(
      (e) =>
        e.nextTier &&
        e.amountNeededForNextTier &&
        e.amountNeededForNextTier > 0,
    )
    .map((e) => ({
      tier: e.nextTier!,
      promotionId: e.promotionId,
      amountNeeded: e.amountNeededForNextTier!,
    }));

  // For BUY_X_GET_Y: show as "next tier" when not yet eligible
  buyXGetYList.forEach((eligibility) => {
    const required = eligibility.requiredQuantity ?? 1;
    const current = eligibility.currentRequiredQuantity ?? 0;
    const meetsMinOrderValue =
      eligibility.minimumOrderValue == null ||
      (eligibility.cartTotal ?? 0) >= eligibility.minimumOrderValue;
    const isEligible =
      (eligibility.remainingGiftQuantity ?? 0) > 0 &&
      current >= required &&
      meetsMinOrderValue;

    if (
      !isEligible &&
      eligibility.giftProducts &&
      eligibility.giftProducts.length > 0
    ) {
      // Determine what's still needed: quantity gap or order value gap
      const qtyGap = Math.max(0, required - current);
      const orderValueGap =
        eligibility.minimumOrderValue != null && !meetsMinOrderValue
          ? eligibility.minimumOrderValue - (eligibility.cartTotal ?? 0)
          : 0;

      // Only show as locked if there's actually something to unlock (avoid showing already-claimed items as locked)
      if (qtyGap > 0 || orderValueGap > 0) {
        nextTiersWithPromotion.push({
          tier: {
            tierId: "",
            minOrderValue: eligibility.minimumOrderValue ?? 0,
            giftProducts: eligibility.giftProducts,
            isClaimed: false,
          },
          promotionId: eligibility.promotionId,
          // Negative = quantity-based, positive = money-based
          amountNeeded: orderValueGap > 0 ? orderValueGap : -qtyGap,
        });
      }
    }
  });

  // If no eligible tiers AND no next tiers, don't render
  if (
    allTiersWithPromotion.length === 0 &&
    nextTiersWithPromotion.length === 0
  ) {
    return null;
  }

  // Find BUY_X_GET_Y progress info (for progress bar)
  const buyXGetYProgress = buyXGetYList.find(
    (e) => (e.requiredQuantity ?? 0) > 0,
  );

  // Find the closest next tier (smallest amountNeededForNextTier) for progress bar
  const nextTierInfo = buyToGetGiftList
    .filter(
      (e) =>
        e.nextTier &&
        e.amountNeededForNextTier &&
        e.amountNeededForNextTier > 0,
    )
    .sort(
      (a, b) =>
        (a.amountNeededForNextTier ?? 0) - (b.amountNeededForNextTier ?? 0),
    )[0];

  const nextTier = nextTierInfo?.nextTier;
  const amountNeededForNextTier = nextTierInfo?.amountNeededForNextTier;
  const cartTotal = nextTierInfo?.cartTotal ?? eligibilityDataList[0].cartTotal;

  // Calculate progress to next tier
  const progressPercent =
    nextTier && amountNeededForNextTier
      ? Math.min(100, (cartTotal / (cartTotal + amountNeededForNextTier)) * 100)
      : buyXGetYProgress
        ? Math.min(
            100,
            ((buyXGetYProgress.currentRequiredQuantity ?? 0) /
              (buyXGetYProgress.requiredQuantity ?? 1)) *
              100,
          )
        : 100;

  // Build a set of BUY_X_GET_Y promotion IDs for quick lookup
  const buyXGetYPromotionIds = new Set(buyXGetYList.map((e) => e.promotionId));

  /**
   * Handle direct claim when user clicks on a specific product
   * For BUY_X_GET_Y: open multi-select popup
   * For BUY_TO_GET_GIFT: open single-select popup or claim directly
   */
  const handleDirectClaim = async (
    tierWithPromotion: TierWithPromotion,
    product: GiftProductDetailResponse,
  ) => {
    // BUY_X_GET_Y -> open multi-select popup
    if (
      buyXGetYPromotionIds.has(tierWithPromotion.promotionId) &&
      onSetBuyXGetYGifts
    ) {
      const eligibility = buyXGetYList.find(
        (e) => e.promotionId === tierWithPromotion.promotionId,
      );
      if (eligibility) {
        setBuyXGetYPopupEligibility(eligibility);
      }
      return;
    }

    // BUY_TO_GET_GIFT -> existing behavior
    if (product.hasVariants) {
      setSelectedTierWithPromotion(tierWithPromotion);
    } else {
      await handleSelectGiftProduct(tierWithPromotion, product);
    }
  };

  /**
   * Handle change gift - opens popup with all products
   */
  const handleChangeGift = (tierWithPromotion: TierWithPromotion) => {
    // BUY_X_GET_Y -> open multi-select popup
    if (
      buyXGetYPromotionIds.has(tierWithPromotion.promotionId) &&
      onSetBuyXGetYGifts
    ) {
      const eligibility = buyXGetYList.find(
        (e) => e.promotionId === tierWithPromotion.promotionId,
      );
      if (eligibility) {
        setBuyXGetYPopupEligibility(eligibility);
      }
      return;
    }

    // BUY_TO_GET_GIFT -> existing behavior
    setSelectedTierWithPromotion(tierWithPromotion);
  };

  const handleSelectGiftProduct = async (
    tierWithPromotion: TierWithPromotion,
    product: GiftProductDetailResponse,
    variantId?: string,
  ) => {
    setIsSelecting(true);
    try {
      await onSelectGift(
        tierWithPromotion.promotionId,
        tierWithPromotion.tier.tierId,
        product.productId,
        variantId,
      );
      setSelectedTierWithPromotion(null);
    } finally {
      setIsSelecting(false);
    }
  };

  const handleClosePopup = () => {
    setSelectedTierWithPromotion(null);
  };

  return (
    <Box className="bg-gradient-to-r from-[#FFF5E6] to-[#FFF9F0] rounded-lg p-4 mb-4 border lg:mt-5 border-[#FAA63E]/30">
      {/* Header */}
      <Flex align="center" gap="2" className="mb-3">
        <Text
          weight="bold"
          className="text-[#C0752F]"
          style={{ fontSize: "16px" }}
        >
          {t("giftOffer.title")}
        </Text>
      </Flex>

      {/* Progress bar */}
      {progressPercent < 100 && (
        <Box className="mb-4">
          <Flex justify="between" align="center" className="mb-2">
            <Text className="text-gray-600" style={{ fontSize: "13px" }}>
              {nextTier && amountNeededForNextTier
                ? t("giftOffer.buyMoreHint", {
                    amount: formatPrice(amountNeededForNextTier),
                  })
                : buyXGetYProgress
                  ? t("giftOffer.buyXGetYHint", {
                      current: buyXGetYProgress.currentRequiredQuantity ?? 0,
                      required: buyXGetYProgress.requiredQuantity ?? 1,
                    })
                  : null}
            </Text>
            <Text
              className="text-[#FAA63E]"
              weight="medium"
              style={{ fontSize: "13px" }}
            >
              {Math.round(progressPercent)}%
            </Text>
          </Flex>
          <Progress value={progressPercent} className="h-2" color="orange" />
        </Box>
      )}

      {/* Eligible gift tiers - show all products in a single horizontal slider */}
      <GiftTierSlider
        tiersWithPromotion={allTiersWithPromotion}
        nextTiersWithPromotion={nextTiersWithPromotion}
        isLoading={isLoading}
        isSelecting={isSelecting}
        onDirectClaim={handleDirectClaim}
        onChangeGift={handleChangeGift}
        selectedGiftProductIds={selectedGiftProductIds}
        isPaymentProcessing={isPaymentProcessing}
      />

      {/* Gift Selection Popup - BUY_TO_GET_GIFT (single select) */}
      {selectedTierWithPromotion && (
        <GiftSelectionPopup
          tier={selectedTierWithPromotion.tier}
          promotionId={selectedTierWithPromotion.promotionId}
          onSelectGift={(productId: string, variantId?: string) =>
            handleSelectGiftProduct(
              selectedTierWithPromotion,
              selectedTierWithPromotion.tier.giftProducts.find(
                (p) => p.productId === productId,
              )!,
              variantId,
            )
          }
          onClose={handleClosePopup}
          isLoading={isSelecting}
        />
      )}

      {/* Gift Selection Popup - BUY_X_GET_Y (multi select) */}
      {buyXGetYPopupEligibility && onSetBuyXGetYGifts && (
        <BuyXGetYGiftSelectionPopup
          eligibility={buyXGetYPopupEligibility}
          onConfirm={async (promotionId, gifts) => {
            setIsSelecting(true);
            try {
              await onSetBuyXGetYGifts(promotionId, gifts);
              setBuyXGetYPopupEligibility(null);
            } finally {
              setIsSelecting(false);
            }
          }}
          onClose={() => setBuyXGetYPopupEligibility(null)}
          isLoading={isSelecting}
        />
      )}
    </Box>
  );
}
