"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { PaymentMethod } from "@/types/gen/shop/shared/orders/order";

interface CartPaymentMethodProps {
  selectedMethod: PaymentMethod;
  onSelect: (_method: PaymentMethod) => void;
  disabled?: boolean;
  isPaymentProcessing?: boolean;
}

const paymentMethods = [
  { id: PaymentMethod.PAYMENT_METHOD_COD, labelKey: "paymentCOD" },
  // TODO: Uncomment when OnePay integration is ready
  // {
  //   id: PaymentMethod.PAYMENT_METHOD_ONEPAY_INTERCARD,
  //   labelKey: "paymentOnePayInternational",
  // },
  // {
  //   id: PaymentMethod.PAYMENT_METHOD_ONEPAY_DOMESTIC,
  //   labelKey: "paymentOnePayDomestic",
  // },
  // {
  //   id: PaymentMethod.PAYMENT_METHOD_INFOCMS_VIETQR,
  //   labelKey: "paymentVietQR",
  // },
];

export function CartPaymentMethod({
  selectedMethod,
  onSelect,
  disabled = false,
  isPaymentProcessing = false,
}: CartPaymentMethodProps) {
  const t = useTranslations("cart");

  return (
    <Box className={`bg-white ${disabled ? "opacity-50" : ""}`}>
      {/* Header */}
      <Flex justify="between" align="center" className="px-4 py-2">
        <Text weight="bold" className="text-base text-black uppercase">
          {t("paymentMethodTitle")}
        </Text>
      </Flex>

      {/* Payment Options */}
      <Box className="p-4 space-y-2">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isDisabled = disabled || (isPaymentProcessing && !isSelected);
          return (
            <Flex
              key={method.id}
              align="center"
              justify="between"
              className={`p-3 bg-white border border-gray-200 rounded-[24px] transition-colors ${
                isDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:bg-gray-50"
              }`}
              onClick={() => !isPaymentProcessing && onSelect(method.id)}
            >
              <Flex align="center" gap="3">
                <Box className="flex items-center justify-center">
                  <Image
                    src={
                      selectedMethod === method.id
                        ? "/assets/svg/payment/approved_icon.svg"
                        : "/assets/svg/payment/unapproved_icon.svg"
                    }
                    alt={
                      selectedMethod === method.id ? "Selected" : "Not selected"
                    }
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </Box>
                <Text className="text-sm text-black">{t(method.labelKey)}</Text>
              </Flex>
            </Flex>
          );
        })}
      </Box>
    </Box>
  );
}
