'use client';

import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils/format';
import { CheckoutSession } from '@/types/gen/shop/shared/checkout-sessions/checkout-session';

interface PaymentDetailsProps {
  checkoutSession: CheckoutSession | null;
  isPlacingOrder?: boolean;
  onPlaceOrder?: () => void;
  isCalculating?: boolean;
}

export function PaymentDetails({
  checkoutSession,
  isPlacingOrder = false,
  onPlaceOrder,
}: PaymentDetailsProps) {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');

  return (
    <Box className="bg-white p-4 sm:p-5 lg:p-6 lg:bg-[#FEF8F1]">
      <Heading size="3" weight="medium" className="mb-3 sm:mb-4 text-black">
        {t("paymentDetailsTitle")}
      </Heading>

      <Box className="space-y-2 sm:space-y-3">
        <Flex justify="between" align="center">
          <Text size={{ initial: "2", sm: "3" }} className="text-gray-500">
            {tCommon("order.subtotal")}
          </Text>
          <Text size={{ initial: "2", sm: "3" }} className="text-gray-500">
            {formatPrice(checkoutSession?.subtotal || 0)}
          </Text>
        </Flex>

        {/* Shipping Fee */}
        <Flex justify="between" align="center">
          <Text size={{ initial: "2", sm: "3" }} className="text-gray-500">
            {t("totalShippingFee")}
          </Text>
          <Text size={{ initial: "2", sm: "3" }} className="text-gray-500">
            {formatPrice(checkoutSession?.shippingFee || 0)}
          </Text>
        </Flex>

        {/* Shipping Discount - show when shippingPromotion exists with discountAmount > 0 */}
        {checkoutSession?.shippingPromotion?.id &&
          checkoutSession.shippingPromotion.discountAmount > 0 && (
          <Flex justify="between" align="center">
            <Text size={{ initial: "2", sm: "3" }} className="text-gray-500">
              {t("shippingPromotion.shippingFeeDiscount")}
            </Text>
            <Text size={{ initial: "2", sm: "3" }} className="text-red-500">
              -{formatPrice(checkoutSession.shippingPromotion.discountAmount)}
            </Text>
          </Flex>
        )}

        {/* Discount */}
        {checkoutSession && checkoutSession.discount > 0 && (
          <Flex justify="between" align="center">
            <Text size={{ initial: "2", sm: "3" }} className="text-gray-500">
              {t("discount")}
            </Text>
            <Text size={{ initial: "2", sm: "3" }} className="text-red-500">
              -{formatPrice(checkoutSession.discount)}
            </Text>
          </Flex>
        )}

        <Box
          className="hidden lg:block lg:py-1 sm:py-[16px]"
        >
          <Flex justify="between" align="center">
            <Text
              size={{ initial: "4", sm: "5" }}
              weight="bold"
              className="text-black uppercase"
            >
              {t("totalPayment")}
            </Text>
            <Text
              size={{ initial: "4", sm: "5" }}
              weight="bold"
              className="text-black"
            >
              {formatPrice(checkoutSession?.total || 0)}
            </Text>
          </Flex>
        </Box>

        {/* Place Order Button - Only show on desktop when callback is provided */}
        {onPlaceOrder && (
          <Box className="pt-3 sm:pt-4">
            <Button
              onClick={onPlaceOrder}
              disabled={isPlacingOrder}
              className="w-full cursor-pointer bg-black text-white px-6 py-3 sm:py-4 rounded text-base sm:text-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? t("placingOrder") : t("placeOrder")}
            </Button>
          </Box>
        )}
      </Box>

      {/* Horizontal Divider */}
      {/* <Box className="w-full h-[1px] bg-[#E5E5E5]" /> */}

      {/* Payment Method Icons */}
      {/* <Flex
        align="center"
        justify={{ initial: "between", md: "center" }}
        gap={{ initial: "0", md: "3" }}
        className="max-w-[370px] w-full py-4"
      >
        <Image
          src="/assets/svg/payment/master_card.svg"
          alt="Master Card"
          width={50}
          height={32}
          className="h-8"
        />
        <Image
          src="/assets/svg/payment/visa.svg"
          alt="Visa"
          width={50}
          height={32}
          className="h-8"
        />
        <Image
          src="/assets/svg/payment/bank_transfer.svg"
          alt="Bank Transfer"
          width={50}
          height={32}
          className="h-8"
        />
        <Image
          src="/assets/svg/payment/vn_pay.svg"
          alt="VNPay"
          width={50}
          height={32}
          className="h-8"
        />
      </Flex> */}
    </Box>
  );
}
