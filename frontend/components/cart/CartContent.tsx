"use client";

import { showErrorToast } from "@/lib/helpers/toastHelper";
import { AppLocale } from "@/lib/locale";
import { formatPrice } from "@/lib/utils/format";
import type { CheckoutSession } from "@/types/gen/shop/shared/checkout-sessions/checkout-session";
import { Box, Button, Flex, Text, AlertDialog } from "@radix-ui/themes";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartItem } from "./CartItem";
import { EmptyCart } from "./EmptyCart";
import { PaymentDetails } from "./PaymentDetails";
import { GiftOfferSection } from "./GiftOfferSection";
import { VoucherSection } from "./VoucherSection";
import { useConfirmOrder } from "./hooks/useConfirmOrder";
import { useCartContent } from "./hooks/useCartContent";

interface CartContentProps {
  locale: AppLocale;
  checkoutSession: CheckoutSession | null;
  onCheckoutSessionUpdate: (_session: CheckoutSession | null) => void;
  isActive: boolean;
}

export function CartContent({
  locale,
  checkoutSession,
  onCheckoutSessionUpdate,
  isActive,
}: CartContentProps) {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Use shared cart content hook
  const {
    cart,
    isLoading,
    isInitialized,
    isCalculatingCheckout,
    giftEligibility,
    isLoadingGiftEligibility,
    isClearDialogOpen,
    setIsClearDialogOpen,
    isClearingCart,
    isUpdatingQuantity,
    isAllSelected,
    selectedGiftProductIds,
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
    getItemKey,
    getSelectionKey,
    getComboInstance,
    isItemSelected,
  } = useCartContent({
    checkoutSession,
    onCheckoutSessionUpdate,
    isActive,
    t,
  });

  // Mobile-specific: keep the confirm-order hook mounted for its side effects
  // (address loading). Its auth flag is no longer read here — promotions and
  // gifts are available to guests too.
  useConfirmOrder({
    locale,
    checkoutSessionId: checkoutSession?.id || "",
  });

  // Mobile-specific: Determine if place order button should be disabled
  const isPlaceOrderDisabled = isPlacingOrder || isEmpty(cart.items);

  // Mobile-specific: Handle place order navigation
  const handlePlaceOrder = async () => {
    if (!checkoutSession?.id) {
      showErrorToast(t("cannotPlaceOrder") || "Cannot place order");
      return;
    }

    // Disable button immediately to prevent duplicate clicks
    setIsPlacingOrder(true);
    router.push(
      `/${locale}/cart/confirm?checkoutSessionId=${checkoutSession.id}&source=cart`,
    );
  };

  // Early return for loading state (also show loading when not initialized yet)
  if (!isInitialized || isLoading) {
    return (
      <Box className="min-h-screen bg-[#FEF8F1]">
        <Box className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
          <Flex justify="center" align="center" className="min-h-[500px]">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black" />
          </Flex>
        </Box>
      </Box>
    );
  }

  // Early return for empty cart
  if (isEmpty(cart.items)) {
    return (
      <Box className="min-h-screen bg-[#FEF8F1]">
        <Box className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
          <EmptyCart />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="bg-[#FEF8F1] overflow-x-hidden">
      <Box className="container mx-auto mt-6 lg:mt-24 max-w-7xl pb-10">
        {/* Main Content - Two Columns */}
        <Flex
          direction={{ initial: "column", lg: "row" }}
          className="items-start relative gap-4 lg:gap-8"
        >
          {/* Left Column - Cart Items */}
          <Box className="w-full lg:w-1/2 px-4 sm:px-6 lg:px-8">
            {/* Cart Title and Header */}
            <Box>
              <Flex justify="between" align="center" className="mb-2">
                <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-bold text-black">
                  {t("pageTitle")}
                </h2>
              </Flex>
            </Box>
            <Flex justify="between" align="center" className="mb-4">
              {/* Select All Box */}
              <Box onClick={handleSelectAll}>
                <Flex align="center" gap="2">
                  <Box className="flex items-center justify-center flex-shrink-0">
                    {isAllSelected ? (
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
                        alt="Selected"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                    )}
                  </Box>
                  <Text size="3" weight="medium" className="text-black">
                    {t("selectAll")}
                  </Text>
                </Flex>
              </Box>
              <AlertDialog.Root
                open={isClearDialogOpen}
                onOpenChange={setIsClearDialogOpen}
              >
                <AlertDialog.Trigger>
                  <Button
                    variant="ghost"
                    className="text-orange-500 hover:text-orange-600 cursor-pointer"
                  >
                    <Text size="3" weight="medium" className="text-[#1564DA]">
                      {t("clearAll")}
                    </Text>
                  </Button>
                </AlertDialog.Trigger>
                <AlertDialog.Content maxWidth="450px" className="text-center">
                  <AlertDialog.Title className="text-center">
                    {tCommon("buttons.confirm")}
                  </AlertDialog.Title>
                  <AlertDialog.Description size="2" className="text-center">
                    {t("clearCartMessage")}
                  </AlertDialog.Description>

                  <Flex gap="3" mt="4" justify="center">
                    <AlertDialog.Cancel>
                      <button
                        disabled={isClearingCart}
                        className="w-[133px] h-[48px] rounded-[40px] px-4 py-3 border border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {tCommon("buttons.cancel").toUpperCase()}
                      </button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                      <button
                        onClick={handleClearCart}
                        disabled={isClearingCart}
                        className="w-[133px] h-[48px] rounded-[40px] px-4 py-3 border text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        style={{
                          background:
                            "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
                        }}
                      >
                        {isClearingCart
                          ? "..."
                          : tCommon("buttons.confirm").toUpperCase()}
                      </button>
                    </AlertDialog.Action>
                  </Flex>
                </AlertDialog.Content>
              </AlertDialog.Root>
            </Flex>
            {/* Cart Items List */}
            <Box className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              {map(cart.items, (item, index) => {
                const isGiftItem = item.isGift === true;
                const isUnavailable =
                  checkoutSession?.items?.find(
                    (si) =>
                      si.productId === item.productId &&
                      si.variantId === item.variantId,
                  )?.isAvailable === false;

                return (
                  <Box
                    key={getItemKey(item, index)}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CartItem
                      item={item}
                      isSelected={isItemSelected(item)}
                      onSelectChange={() => {
                        if (!isGiftItem) {
                          handleItemSelect(getSelectionKey(item));
                        }
                      }}
                      originalPrice={item.flashSale?.originalPrice}
                      flashSalePrice={item.flashSale?.flashSalePrice}
                      flashSaleId={item.flashSale?.flashSaleId}
                      comboName={getComboInstance(item)?.comboName}
                      isUnavailable={isUnavailable}
                      onChangeGift={
                        isGiftItem
                          ? () => {
                              if (giftEligibility && item.promotionTierId) {
                                const promotion = giftEligibility.find(
                                  (p) => p.promotionId === item.promotionId,
                                );
                                if (promotion) {
                                  fetchGiftEligibility();
                                }
                              }
                            }
                          : undefined
                      }
                      onRemoveGift={
                        isGiftItem
                          ? () =>
                              handleRemoveGift(
                                item.productId,
                                item.variantId || undefined,
                              )
                          : undefined
                      }
                      onQuantityChange={handleQuantityChange}
                      onRemoveItem={handleRemoveItem}
                      isUpdatingQuantity={isUpdatingQuantity}
                    />
                  </Box>
                );
              })}
            </Box>

            {/* Gift Promotion Section */}
            {giftEligibility && giftEligibility.length > 0 && (
              <GiftOfferSection
                eligibilityDataList={giftEligibility}
                onSelectGift={handleSelectGift}
                onSetBuyXGetYGifts={handleSetBuyXGetYGifts}
                isLoading={isLoadingGiftEligibility}
                selectedGiftProductIds={selectedGiftProductIds}
              />
            )}
          </Box>

          {/* Right Column - Shipping Information & Payment */}
          <Box className="w-full lg:hidden">
            {/* Voucher Section - Mobile */}
            <VoucherSection
              checkoutSession={checkoutSession}
              onVoucherApplied={handleVoucherApplied}
            />

            {/* Payment Details Section - Shown on mobile/tablet, hidden on desktop (no button) */}
            <Box className="mt-4">
              <PaymentDetails
                checkoutSession={checkoutSession}
                isCalculating={isCalculatingCheckout}
              />

              {/* Total and Order Button - Mobile */}
              <Box className="p-4">
                <Flex direction="row" justify="between" gap="2">
                  <Flex direction="column">
                    <Text
                      weight="bold"
                      className="text-black"
                      style={{ fontSize: "24px" }}
                    >
                      {formatPrice(checkoutSession?.total || 0)}
                    </Text>
                    <Text
                      className="text-gray-500"
                      style={{ fontSize: "12px" }}
                    >
                      {t("saved")} {formatPrice(checkoutSession?.discount || 0)}
                    </Text>
                  </Flex>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isPlaceOrderDisabled}
                    className="cursor-pointer text-white rounded-full text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      width: "180px",
                      height: "48px",
                      background:
                        "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
                    }}
                  >
                    {isPlacingOrder ? t("placingOrder") : t("placeOrder")}
                  </Button>
                </Flex>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
