"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Flex, Text, Button, Box, Separator } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import {
  ReloadIcon,
  CrossCircledIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";
import { orderRepository } from "@/lib/repositories/order.repository";
import { formatPrice } from "@/lib/utils/format";
import { paymentMethodToJSON } from "@/types/gen/shop/shared/orders/order";
import type { Order } from "@/types/gen/shop/shared/orders/order";
import type { AppLocale } from "@/lib/locale";
import Image from "next/image";

interface ConfirmOrderByTokenContentProps {
  locale: AppLocale;
}

export function ConfirmOrderByTokenContent({
  locale,
}: ConfirmOrderByTokenContentProps) {
  const t = useTranslations("orderConfirm");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) {
        setError("invalidToken");
        setIsLoading(false);
        return;
      }

      try {
        const orderData = await orderRepository.getOrderByToken(token);
        setOrder(orderData);
      } catch {
        setError("orderNotFound");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  const handleBackToHome = () => {
    router.push(`/${locale}`);
  };

  // Get payment method display text
  const getPaymentMethodText = (method: number | string): string => {
    const methodKey =
      typeof method === "number" ? paymentMethodToJSON(method) : method;
    return t(`paymentMethods.${methodKey}`);
  };

  // Format shipping address
  const formatAddress = (address: Order["shippingAddress"]): string => {
    if (!address) return "";
    const parts = [
      address.street,
      address.ward,
      address.district,
      address.city,
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Loading state
  if (isLoading) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        className="min-h-[calc(100vh-400px)] px-4 md:px-5 py-10 md:py-[60px]"
      >
        <ReloadIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#9CA3AF] animate-spin" />
        <Text className="text-sm sm:text-base text-[#6B7280] text-center mt-4">
          {t("loading")}
        </Text>
      </Flex>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        className="min-h-[calc(100vh-400px)] px-4 md:px-5 py-10 md:py-[60px]"
      >
        <Flex
          align="center"
          justify="center"
          className="mb-6 md:mb-8 w-[100px] h-[100px] md:w-[140px] md:h-[140px] rounded-full bg-red-50"
        >
          <CrossCircledIcon className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] text-red-500" />
        </Flex>

        <Text
          weight="bold"
          className="text-black mb-3 md:mb-4 text-center text-xl md:text-2xl"
        >
          {t(error || "orderNotFound")}
        </Text>

        <Button
          size="4"
          onClick={handleBackToHome}
          className="text-white rounded-full px-6 md:px-8 py-3 md:py-4 font-semibold text-sm md:text-base cursor-pointer w-full max-w-[317px] h-12 md:h-14 transition-all hover:opacity-90 mt-6"
          style={{
            background:
              "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
          }}
        >
          {tCommon("buttons.backToHome")}
        </Button>
      </Flex>
    );
  }

  // Success state - order confirmed
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      className="min-h-[calc(100vh-400px)] px-4 md:px-5 py-10 md:py-[60px]"
    >
      {/* Success Illustration */}
      <Flex
        align="center"
        justify="center"
        className="mb-6 md:mb-8 w-[100px] h-[100px] md:w-[140px] md:h-[140px] rounded-full bg-[#E8F5E9]"
      >
        <CheckCircledIcon className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] text-[#4CAF50]" />
      </Flex>

      {/* Title */}
      <Text
        weight="bold"
        className="text-black mb-3 md:mb-4 text-center text-xl md:text-2xl"
      >
        {t("title")}
      </Text>

      {/* Message */}
      <Text className="text-[#4a4a4a] mb-6 md:mb-8 text-center max-w-[500px] text-sm md:text-base px-2">
        {t("message")}
      </Text>

      {/* Order Info Card */}
      <Box className="w-full max-w-[450px] mb-6 md:mb-8 p-4 bg-gray-50 rounded-lg">
        <Flex direction="column" gap="3">
          {/* Order Number */}
          <Flex justify="between" align="center">
            <Text className="text-[#4a4a4a] text-sm">{tCommon("order.orderNumber")}</Text>
            <Text weight="bold" className="text-black text-sm">
              {order.orderNumber}
            </Text>
          </Flex>

          <Separator size="4" />

          {/* Customer Name */}
          {order.customer?.name && (
            <Flex justify="between" align="center">
              <Text className="text-[#4a4a4a] text-sm">{t("customer")}</Text>
              <Text weight="medium" className="text-black text-sm">
                {order.customer.name}
              </Text>
            </Flex>
          )}

          {/* Phone */}
          {order.customer?.phone && (
            <Flex justify="between" align="center">
              <Text className="text-[#4a4a4a] text-sm">{t("phone")}</Text>
              <Text weight="medium" className="text-black text-sm">
                {order.customer.phone}
              </Text>
            </Flex>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Flex justify="between" align="start" gap="4">
              <Text className="text-[#4a4a4a] text-sm flex-shrink-0">
                {tCommon("order.shippingAddress")}
              </Text>
              <Text
                weight="medium"
                className="text-black text-sm text-right max-w-[250px]"
              >
                {formatAddress(order.shippingAddress)}
              </Text>
            </Flex>
          )}

          <Separator size="4" />

          {/* Collapsible Order Items */}
          {order.items && order.items.length > 0 && (
            <>
              <Flex
                justify="between"
                align="center"
                className="cursor-pointer"
                onClick={() => setIsItemsExpanded(!isItemsExpanded)}
              >
                <Text className="text-[#4a4a4a] text-sm">
                  {t("orderItems")} ({order.items.length})
                </Text>
                <Flex align="center" gap="1">
                  <Text className="text-[#4a4a4a] text-sm">
                    {isItemsExpanded ? t("collapse") : t("expand")}
                  </Text>
                  {isItemsExpanded ? (
                    <ChevronUpIcon className="w-4 h-4 text-[#4a4a4a]" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-[#4a4a4a]" />
                  )}
                </Flex>
              </Flex>

              {isItemsExpanded && (
                <Box className="mt-2 space-y-3">
                  {order.items.map((item, index) => (
                    <Flex
                      key={`${item.productId}-${index}`}
                      gap="3"
                      align="start"
                      className="p-2 bg-white rounded-md"
                    >
                      {item.image && (
                        <Box className="relative w-14 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </Box>
                      )}
                      <Flex direction="column" className="flex-1 min-w-0">
                        <Text
                          weight="medium"
                          className="text-black text-sm line-clamp-2"
                        >
                          {item.name}
                        </Text>
                        <Flex justify="between" align="center" className="mt-1">
                          <Text className="text-[#6B7280] text-xs">
                            x{item.quantity}
                          </Text>
                          <Text
                            weight="medium"
                            className="text-[#FAA63E] text-sm"
                          >
                            {formatPrice(item.subtotal)}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  ))}
                </Box>
              )}

              <Separator size="4" />
            </>
          )}

          {/* Payment Method */}
          <Flex justify="between" align="center">
            <Text className="text-[#4a4a4a] text-sm">{tCommon("order.paymentMethod")}</Text>
            <Text weight="medium" className="text-black text-sm">
              {getPaymentMethodText(order.paymentMethod)}
            </Text>
          </Flex>

          {/* Total */}
          <Flex justify="between" align="center">
            <Text className="text-[#4a4a4a] text-sm">{tCommon("order.total")}</Text>
            <Text weight="bold" className="text-[#FAA63E] text-base">
              {formatPrice(order.total)}
            </Text>
          </Flex>
        </Flex>
      </Box>

      {/* Back to Home Button */}
      <Button
        size="4"
        onClick={handleBackToHome}
        className="text-white rounded-full px-6 md:px-8 py-3 md:py-4 font-semibold text-sm md:text-base cursor-pointer w-full max-w-[317px] h-12 md:h-14 transition-all hover:opacity-90"
        style={{
          background:
            "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
        }}
      >
        {tCommon("buttons.backToHome")}
      </Button>
    </Flex>
  );
}
