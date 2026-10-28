"use client";

import { useMemo, useEffect } from "react";
import { Flex, Text, Button, Box, Skeleton } from "@radix-ui/themes";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";
import isNil from "lodash/isNil";
import { formatPrice } from "@/lib/utils/format";
import {
  fetchOrderByNumberRequest,
  clearOrderDetail,
} from "@/lib/store/slices/orderSlice";
import type { RootState } from "@/lib/store";

// OnePay response codes that have specific translations
const KNOWN_ERROR_CODES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "98",
  "99",
  "B",
  "D",
  "F",
  "U",
  "Z",
  "253",
  "invalid_signature",
];

export function PaymentResultContent() {
  const t = useTranslations("paymentSuccess");
  const tCommon = useTranslations("common");
  const tPayment = useTranslations("paymentMethods");
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // Get params from backend redirect (used as fallback only)
  const orderNumberParam = searchParams.get("orderNumber");
  const responseCodeParam = searchParams.get("code");
  const reasonParam = searchParams.get("reason");

  // Redux state for order details
  const order = useSelector((state: RootState) => state.order.orderDetail);
  const isLoadingOrder = useSelector(
    (state: RootState) => state.order.isLoadingOrderDetail,
  );
  const orderFetchError = useSelector(
    (state: RootState) => state.order.orderDetailError,
  );

  // Always fetch order if we have orderNumber param
  useEffect(() => {
    if (orderNumberParam) {
      dispatch(fetchOrderByNumberRequest(orderNumberParam));
    }
    // Cleanup on unmount
    return () => {
      dispatch(clearOrderDetail());
    };
  }, [orderNumberParam, dispatch]);

  // Determine payment status - prioritize order's paymentStatus over URL params
  const paymentStatus = useMemo(() => {
    // If order is loaded, use its paymentStatus as source of truth
    if (!isNil(order)) {
      const status = get(order, "paymentStatus", "") as string;
      if (status === "paid") return "success";
      if (status === "failed") return "failed";
      if (status === "pending") return "pending";
    }
    // If order fetch failed, show error
    if (orderFetchError) return "error";
    // Fallback to URL params if order not loaded
    if (responseCodeParam || reasonParam) return "failed";
    return "success";
  }, [order, orderFetchError, responseCodeParam, reasonParam]);

  // Get error code - from order's payment history or URL params
  const errorCode = useMemo(() => {
    // Try to get from order's payment history first
    if (!isNil(order)) {
      const paymentHistory = get(order, "paymentHistory", []) as Array<{
        code?: string;
      }>;
      const lastFailedEvent = paymentHistory
        .slice()
        .reverse()
        .find((e) => e.code && e.code !== "0");
      if (lastFailedEvent?.code) return lastFailedEvent.code;
    }
    // Fallback to URL params
    return responseCodeParam || reasonParam || null;
  }, [order, responseCodeParam, reasonParam]);

  // Get payment method display text
  const getPaymentMethodText = (method: string): string => {
    switch (method) {
      case "cod":
        return tPayment("cod");
      case "onepay_intercard":
        return tPayment("onepayIntercard");
      case "onepay_domestic":
        return tPayment("onepayDomestic");
      case "infocms_vietqr":
        return tPayment("vietqr");
      default:
        return tPayment("cod");
    }
  };

  // Get error message based on response code
  const getPaymentErrorMessage = (code: string): string => {
    if (KNOWN_ERROR_CODES.includes(code)) {
      return t(`errorCodes.${code}`);
    }
    return t("errorCodes.default");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleViewOrderHistory = () => {
    router.push("/account?tab=orderHistory");
  };

  // Loading state - neutral, no bias towards success or failure
  // Show skeleton if:
  // 1. We're actively loading, OR
  // 2. We have orderNumber param but haven't fetched yet (order is null and no error)
  const shouldShowSkeleton =
    isLoadingOrder || (orderNumberParam && isNil(order) && !orderFetchError);

  if (shouldShowSkeleton) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        className="min-h-[calc(100vh-400px)] px-4 md:px-5 py-10 md:py-[60px]"
      >
        <Skeleton className="h-[100px] w-[100px] md:h-[140px] md:w-[140px] rounded-full mb-6 md:mb-8" />
        <Skeleton className="h-7 w-48 mb-4" />
        <Skeleton className="h-5 w-64 mb-6" />
        <Box className="w-full max-w-[400px] mb-6 md:mb-8 p-4 bg-gray-50 rounded-lg">
          <Flex direction="column" gap="3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </Flex>
        </Box>
      </Flex>
    );
  }

  // Error state - order fetch failed
  if (paymentStatus === "error") {
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
          {t("errorCodes.default")}
        </Text>

        {orderFetchError && (
          <Text className="text-[#4a4a4a] mb-6 md:mb-8 text-center max-w-[400px] text-sm md:text-base px-2">
            {orderFetchError}
          </Text>
        )}

        {orderNumberParam && (
          <Box className="w-full max-w-[400px] mb-6 md:mb-8 p-4 bg-gray-50 rounded-lg">
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Text className="text-[#4a4a4a] text-sm">
                  {tCommon("order.orderNumber")}
                </Text>
                <Text weight="medium" className="text-black text-sm">
                  {orderNumberParam}
                </Text>
              </Flex>
            </Flex>
          </Box>
        )}

        <Flex
          direction="column"
          align="center"
          gap="1"
          className="mb-8 md:mb-10"
        >
          <Text className="text-[#4a4a4a] text-sm md:text-base">
            {t("supportHotline")}:
          </Text>
          <Text weight="bold" className="text-[#FAA63E] text-lg md:text-xl">
            {t("hotlineNumber")}
          </Text>
        </Flex>

        <Flex direction="column" gap="3" className="w-full max-w-[317px]">
          <Button
            size="4"
            onClick={handleViewOrderHistory}
            className="text-white rounded-full px-6 md:px-8 py-3 md:py-4 font-semibold text-sm md:text-base cursor-pointer w-full h-12 md:h-14 transition-all hover:opacity-90"
            style={{
              background:
                "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
            }}
          >
            {t("viewOrderHistory")}
          </Button>

          <Button
            size="4"
            variant="outline"
            onClick={handleBackToHome}
            className="rounded-full px-6 md:px-8 py-3 md:py-4 font-semibold text-sm md:text-base cursor-pointer w-full h-12 md:h-14 transition-all hover:bg-gray-50 border-[#4a4a4a] text-[#4a4a4a]"
          >
            {tCommon("buttons.backToHome").toUpperCase()}
          </Button>
        </Flex>
      </Flex>
    );
  }

  // Payment Failed state - based on order's paymentStatus or URL params
  if (paymentStatus === "failed") {
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
          {t("paymentFailed")}
        </Text>

        <Text className="text-[#4a4a4a] mb-6 md:mb-8 text-center max-w-[400px] text-sm md:text-base px-2">
          {errorCode
            ? getPaymentErrorMessage(errorCode)
            : t("errorCodes.default")}
        </Text>

        {/* Order Info if available */}
        {!isNil(order) && (
          <Box className="w-full max-w-[400px] mb-6 md:mb-8 p-4 bg-gray-50 rounded-lg">
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Text className="text-[#4a4a4a] text-sm">
                  {tCommon("order.orderNumber")}
                </Text>
                <Text weight="medium" className="text-black text-sm">
                  {get(order, "orderNumber", "-")}
                </Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text className="text-[#4a4a4a] text-sm">{tCommon("order.total")}</Text>
                <Text weight="bold" className="text-[#FAA63E] text-base">
                  {formatPrice(get(order, "total", 0))}
                </Text>
              </Flex>
            </Flex>
          </Box>
        )}

        <Flex
          direction="column"
          align="center"
          gap="1"
          className="mb-8 md:mb-10"
        >
          <Text className="text-[#4a4a4a] text-sm md:text-base">
            {t("supportHotline")}:
          </Text>
          <Text weight="bold" className="text-[#FAA63E] text-lg md:text-xl">
            {t("hotlineNumber")}
          </Text>
        </Flex>

        <Flex direction="column" gap="3" className="w-full max-w-[317px]">
          <Button
            size="4"
            onClick={handleViewOrderHistory}
            className="text-white rounded-full px-6 md:px-8 py-3 md:py-4 font-semibold text-sm md:text-base cursor-pointer w-full h-12 md:h-14 transition-all hover:opacity-90"
            style={{
              background:
                "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
            }}
          >
            {t("viewOrderHistory")}
          </Button>

          <Button
            size="4"
            variant="outline"
            onClick={handleBackToHome}
            className="rounded-full px-6 md:px-8 py-3 md:py-4 font-semibold text-sm md:text-base cursor-pointer w-full h-12 md:h-14 transition-all hover:bg-gray-50 border-[#4a4a4a] text-[#4a4a4a]"
          >
            {tCommon("buttons.backToHome").toUpperCase()}
          </Button>
        </Flex>
      </Flex>
    );
  }

  // Success state (paymentStatus === "success" or "pending" for COD/VietQR)
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
        className="text-black mb-4 md:mb-6 text-center text-xl md:text-2xl"
      >
        {t("title")}
      </Text>

      {/* Message */}
      <Text className="text-[#4a4a4a] mb-6 md:mb-8 text-center max-w-[500px] text-sm md:text-base px-2">
        {t("message")}
      </Text>

      {/* Order Info - prioritize fetched order data */}
      {!isNil(order) ? (
        <Box className="w-full max-w-[400px] mb-6 md:mb-8 p-4 bg-gray-50 rounded-lg">
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Text className="text-[#4a4a4a] text-sm">
                {tCommon("order.orderNumber")}
              </Text>
              <Text weight="medium" className="text-black text-sm">
                {get(order, "orderNumber", "-")}
              </Text>
            </Flex>
            <Flex justify="between" align="center">
              <Text className="text-[#4a4a4a] text-sm">{tCommon("order.total")}</Text>
              <Text weight="bold" className="text-[#FAA63E] text-base">
                {formatPrice(get(order, "total", 0))}
              </Text>
            </Flex>
            <Flex justify="between" align="center">
              <Text className="text-[#4a4a4a] text-sm">
                {tCommon("order.paymentMethod")}
              </Text>
              <Text weight="medium" className="text-black text-sm">
                {getPaymentMethodText(
                  get(order, "paymentMethod", "cod") as string,
                )}
              </Text>
            </Flex>
          </Flex>
        </Box>
      ) : orderNumberParam ? (
        // Fallback: show only order number from URL if fetch failed
        <Box className="w-full max-w-[400px] mb-6 md:mb-8 p-4 bg-gray-50 rounded-lg">
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Text className="text-[#4a4a4a] text-sm">
                {tCommon("order.orderNumber")}
              </Text>
              <Text weight="medium" className="text-black text-sm">
                {orderNumberParam}
              </Text>
            </Flex>
          </Flex>
        </Box>
      ) : null}

      {/* Buttons */}
      <Flex direction="column" gap="3" className="w-full max-w-[317px]">
        <Button
          size="4"
          onClick={handleViewOrderHistory}
          className="text-white rounded-full px-6 md:px-8 py-3 md:py-4 font-semibold text-sm md:text-base cursor-pointer w-full h-12 md:h-14 transition-all hover:opacity-90"
          style={{
            background:
              "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
          }}
        >
          {t("viewOrderHistory")}
        </Button>

        <Button
          size="4"
          variant="outline"
          onClick={handleBackToHome}
          className="rounded-full px-6 md:px-8 py-3 md:py-4 font-semibold text-sm md:text-base cursor-pointer w-full h-12 md:h-14 transition-all hover:bg-gray-50 border-[#4a4a4a] text-[#4a4a4a]"
        >
          {tCommon("buttons.backToHome").toUpperCase()}
        </Button>
      </Flex>
    </Flex>
  );
}
