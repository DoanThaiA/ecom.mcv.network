"use client";

import { useCallback, useEffect, useState } from "react";
import { AppLocale } from "@/lib/locale";
import type { CheckoutSession } from "@/types/gen/shop/shared/checkout-sessions/checkout-session";
import { Box, Button, Flex, Text, AlertDialog } from "@radix-ui/themes";
import isEmpty from "lodash/isEmpty";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useAppSelector } from "@/lib/store/hooks";
import { selectIsAuthenticated } from "@/lib/store/slices/authSlice";
import { CartItem } from "./CartItem";
import { EmptyCart } from "./EmptyCart";
import { PaymentDetails } from "./PaymentDetails";
import { GiftOfferSection } from "./GiftOfferSection";
import { CartDesktopCheckout } from "./CartDesktopCheckout";
import { VoucherSection } from "./VoucherSection";
import { useCartContent } from "./hooks/useCartContent";

interface CartContentDesktopProps {
  locale: AppLocale;
  checkoutSession: CheckoutSession | null;
  onCheckoutSessionUpdate: (session: CheckoutSession | null) => void;
  isActive: boolean;
}

export function CartContentDesktop({
  locale,
  checkoutSession,
  onCheckoutSessionUpdate,
  isActive,
}: CartContentDesktopProps) {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isAddressLoaded, setIsAddressLoaded] = useState(false);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Log when checkoutSession prop changes
  useEffect(() => {
    console.log('[CartContentDesktop] Received new checkoutSession from parent:', {
      id: checkoutSession?.id,
      canPlaceOrder: checkoutSession?.canPlaceOrder,
    });
  }, [checkoutSession]);

  // Callback to receive address loaded state from CartDesktopCheckout
  const handleAddressLoadedChange = useCallback((isLoaded: boolean) => {
    console.log('[CartContentDesktop] handleAddressLoadedChange called with:', isLoaded);
    setIsAddressLoaded(isLoaded);
    console.log('[CartContentDesktop] Set isAddressLoaded state to:', isLoaded);
  }, []);

  // Reset isAddressLoaded when auth changes to prevent race condition
  // This ensures addresses are re-fetched after login/logout
  useEffect(() => {
    console.log('[CartContentDesktop] Auth changed, resetting isAddressLoaded to false');
    setIsAddressLoaded(false);
  }, [isAuthenticated]);

  // Log address state before passing to useCartContent
  const addressDataReady = isAddressLoaded || !isAuthenticated;
  console.log('[CartContentDesktop] Rendering with:', {
    isAuthenticated,
    isAddressLoaded,
    addressDataReady,
  });

  const {
    cart,
    isLoading,
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
    waitForAddressLoad: isAuthenticated,
    addressDataReady,
  });

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center min-h-[400px]">
        <Text>{t("loading")}</Text>
      </Box>
    );
  }

  if (isEmpty(cart.items)) {
    return <EmptyCart />;
  }

  return (
    <Box className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 ">
      <Flex direction="row" className="items-start gap-6">
        {/* Left Column - Cart Items + Payment Details */}
        <Box className="w-1/2 pt-[65px] pb-0 bg-[#FEF8F1]">
          {/* Cart Header */}
          <Box className="mb-4 mx-[32px]">
            <Text size="6" weight="bold" className="text-black">
              {t("pageTitle")}
            </Text>
          </Box>
          <Flex justify="between" align="center" className="mb-4 mx-[32px]">
            {/* Select All Box */}
            <Box
              onClick={() => !isPaymentProcessing && handleSelectAll()}
              className={
                isPaymentProcessing
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }
            >
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
              <AlertDialog.Trigger disabled={isPaymentProcessing}>
                <Button
                  variant="ghost"
                  disabled={isPaymentProcessing}
                  className={`text-orange-500 hover:text-orange-600 ${
                    isPaymentProcessing
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                  }`}
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

          {/* Cart Items */}
          <Box className="space-y-3 mx-[32px]">
            {cart.items.map((item, index) => {
              const isGiftItem = item.isGift === true;
              const isUnavailable =
                checkoutSession?.items?.find(
                  (si) =>
                    si.productId === item.productId &&
                    si.variantId === item.variantId
                )?.isAvailable === false;

              return (
                <CartItem
                  key={getItemKey(item, index)}
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
                              (p) => p.promotionId === item.promotionId
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
                            item.variantId || undefined
                          )
                      : undefined
                  }
                  onQuantityChange={handleQuantityChange}
                  onRemoveItem={handleRemoveItem}
                  isPaymentProcessing={isPaymentProcessing}
                  isUpdatingQuantity={isUpdatingQuantity}
                />
              );
            })}
          </Box>

          {/* Gift Promotion Section - Single block with all promotions merged */}
          {giftEligibility && giftEligibility.length > 0 && (
            <GiftOfferSection
              eligibilityDataList={giftEligibility}
              onSelectGift={handleSelectGift}
              onSetBuyXGetYGifts={handleSetBuyXGetYGifts}
              isLoading={isLoadingGiftEligibility}
              selectedGiftProductIds={selectedGiftProductIds}
              isPaymentProcessing={isPaymentProcessing}
            />
          )}

          {/* Voucher Section - Input voucher code */}
          <Box className="mt-6 mx-[32px]">
            <VoucherSection
              checkoutSession={checkoutSession}
              onVoucherApplied={handleVoucherApplied}
              isPaymentProcessing={isPaymentProcessing}
            />
          </Box>

          {/* Payment Details Section */}
          <Box className="mt-6">
            <PaymentDetails
              checkoutSession={checkoutSession}
              isCalculating={isCalculatingCheckout}
            />
          </Box>
        </Box>

        {/* Right Column - Checkout Section */}
        <Box
          className="w-1/2 pt-10"
          style={{ alignSelf: "flex-start", flex: "0 0 auto" }}
        >
          <Box className="sticky top-4">
            <CartDesktopCheckout
              checkoutSessionId={checkoutSession?.id ?? ""}
              checkoutSession={checkoutSession}
              locale={locale}
              onPaymentProcessingChange={setIsPaymentProcessing}
              onCheckoutSessionUpdate={onCheckoutSessionUpdate}
              onAddressLoadedChange={handleAddressLoadedChange}
            />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
