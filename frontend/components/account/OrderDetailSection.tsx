'use client';

import { useShopWebSocket } from '@/hooks/useShopWebSocket';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants/images';
import { safeLength } from '@/lib/helpers/arrayHelper';
import { showErrorToast } from '@/lib/helpers/toastHelper';
import { AppLocale } from '@/lib/locale';
import { orderRepository } from '@/lib/repositories/order.repository';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  clearOrderDetail,
  fetchOrderDetailRequest,
} from '@/lib/store/slices/orderSlice';
import {
  checkOrderReviewedRequest,
} from '@/lib/store/slices/reviewSlice';
import { formatPrice } from '@/lib/utils/format';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/types/gen/shop/shared/orders/order';
import { ArrowLeftIcon, CheckIcon, ReloadIcon } from '@radix-ui/react-icons';

// Extended Order type with shipping promotion fields from API
interface OrderWithShippingPromotion extends Order {
  shippingDiscount?: number;
  shippingPromotionId?: string;
  shippingPromotionName?: string;
}
import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { ProductImage } from '@/components/common/ProductImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProductUrl } from '@/lib/utils/seoUrl';

interface OrderDetailSectionProps {
  orderId: string;
  locale: AppLocale;
}

export function OrderDetailSection({
  orderId,
  locale,
}: OrderDetailSectionProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations('orderDetail');
  const tOrderHistory = useTranslations('orderHistory');
  const tCommon = useTranslations('common');

  const { orderDetail, isLoadingOrderDetail, orderDetailError } =
    useAppSelector((state) => state.order);
  const reviewStatuses = useAppSelector((state) => state.review.reviewStatuses);
  const isOrderReviewed = useAppSelector(
    (state) => state.review.reviewedOrders?.[orderDetail?.orderNumber ?? ""] ?? false
  );

  // Payment processing state
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);

  // Check if order needs payment polling (pending payment status, not COD)
  const isPendingPayment =
    orderDetail &&
    orderDetail.status === OrderStatus.ORDER_STATUS_PENDING &&
    orderDetail.paymentMethod !== PaymentMethod.PAYMENT_METHOD_COD &&
    orderDetail.paymentStatus !== PaymentStatus.PAYMENT_STATUS_PAID;

  // WebSocket for real-time updates - poll when order is pending payment
  useShopWebSocket({
    enabled: true,
    pendingOrderId: isPendingPayment ? orderId : undefined,
    onOrderRefetch: () => dispatch(fetchOrderDetailRequest(orderId)),
  });

  useEffect(() => {
    dispatch(fetchOrderDetailRequest(orderId));
    return () => {
      dispatch(clearOrderDetail());
    };
  }, [dispatch, orderId]);

  // Update payment processing state when order payment status changes
  useEffect(() => {
    if (orderDetail?.paymentStatus === PaymentStatus.PAYMENT_STATUS_PAID) {
      setIsPaymentProcessing(false);
    }
  }, [orderDetail?.paymentStatus]);

  useEffect(() => {
    if (orderDetail?.orderNumber) {
      // Check if order has been reviewed - for showing/hiding read review button
      dispatch(checkOrderReviewedRequest(orderDetail.orderNumber));
    }
  }, [dispatch, orderDetail?.orderNumber]);

  const handleBack = () => {
    router.push(`/${locale}/account/order-history`);
  };

  const handleReadReview = () => {
    if (orderDetail?.orderNumber) {
      router.push(`/${locale}/account/order-history/${orderDetail.orderNumber}/review`);
    }
  };

  const isProductReviewed = (productId: string, variantId?: string | null) => {
    return reviewStatuses.some(
      (status) =>
        status.productId === productId &&
        status.variantId === variantId &&
        status.hasReview
    );
  };

  // Check if payment UI should be shown (reuse isPendingPayment)
  const showPaymentUI = isPendingPayment;

  // Handle retry payment for OnePay
  const handleRetryPayment = async () => {
    if (!orderDetail?.id) return;

    setIsRetryingPayment(true);
    try {
      const paymentMethod =
        typeof orderDetail.paymentMethod === 'string'
          ? (orderDetail.paymentMethod as unknown as PaymentMethod)
          : orderDetail.paymentMethod;

      const response = await orderRepository.updateOrderPayment(
        orderDetail.id,
        paymentMethod
      );
      if (response.success && response.paymentUrl) {
        window.open(response.paymentUrl, '_blank');
        setIsPaymentProcessing(true);
      } else {
        showErrorToast(t('paymentRetryFailed'));
      }
    } catch {
      showErrorToast(t('paymentRetryFailed'));
    } finally {
      setIsRetryingPayment(false);
    }
  };

  // Loading state
  if (isLoadingOrderDetail) {
    return (
      <Box className="flex-1 bg-white rounded-2xl border border-[#F0F0F0] min-h-[400px]">
        <Box className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#F0F0F0]">
          <Box className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
              aria-label={t('backToOrderHistory')}
            >
              <ArrowLeftIcon className="w-5 h-5 text-black" />
            </button>
            <Heading className="text-base sm:text-lg font-bold text-black">
              {t('pageTitle')}
            </Heading>
          </Box>
        </Box>
        <Box className="flex flex-col items-center justify-center py-16 sm:py-20">
          <ReloadIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#9CA3AF] animate-spin" />
          <Text className="text-sm sm:text-base text-[#6B7280] text-center mt-4">
            {t('loading')}
          </Text>
        </Box>
      </Box>
    );
  }

  // Error or not found
  if (orderDetailError || !orderDetail) {
    return (
      <Box className="flex-1 bg-white rounded-2xl border border-[#F0F0F0]">
        <Box className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#F0F0F0]">
          <Box className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
              aria-label={t('backToOrderHistory')}
            >
              <ArrowLeftIcon className="w-5 h-5 text-black" />
            </button>
            <Heading className="text-base sm:text-lg font-bold text-black">
              {t('pageTitle')}
            </Heading>
          </Box>
        </Box>
        <Box className="px-4 sm:px-6 lg:px-8 py-6">
          <Text className="text-sm text-[#606060]">{t('orderNotFound')}</Text>
        </Box>
      </Box>
    );
  }

  // Map OrderStatus enum to color
  const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
    [OrderStatus.ORDER_STATUS_UNSPECIFIED]: '#9CA3AF',
    [OrderStatus.ORDER_STATUS_PENDING]: '#FAA63E',
    [OrderStatus.ORDER_STATUS_CONFIRMED]: '#235AFF',
    [OrderStatus.ORDER_STATUS_PROCESSING]: '#235AFF',
    [OrderStatus.ORDER_STATUS_SHIPPED]: '#235AFF',
    [OrderStatus.ORDER_STATUS_DELIVERED]: '#00B207',
    [OrderStatus.ORDER_STATUS_CANCELLED]: '#EF4444',
    [OrderStatus.ORDER_STATUS_REFUNDED]: '#6B7280',
    [OrderStatus.UNRECOGNIZED]: '#9CA3AF',
  };

  // Map PaymentStatus enum to color
  const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
    [PaymentStatus.PAYMENT_STATUS_UNSPECIFIED]: '#9CA3AF',
    [PaymentStatus.PAYMENT_STATUS_PENDING]: '#FAA63E',
    [PaymentStatus.PAYMENT_STATUS_PAID]: '#00B207',
    [PaymentStatus.PAYMENT_STATUS_FAILED]: '#EF4444',
    [PaymentStatus.PAYMENT_STATUS_REFUNDED]: '#6B7280',
    [PaymentStatus.UNRECOGNIZED]: '#9CA3AF',
  };

  // Map status text to OrderStatus enum for color
  const getStatusEnum = (status: OrderStatus | string): OrderStatus => {
    // If status is already a number (enum), return it directly
    if (typeof status === 'number') {
      return status as OrderStatus;
    }

    // Map text status to enum
    const statusMap: Record<string, OrderStatus> = {
      unspecified: OrderStatus.ORDER_STATUS_UNSPECIFIED,
      pending: OrderStatus.ORDER_STATUS_PENDING,
      confirmed: OrderStatus.ORDER_STATUS_CONFIRMED,
      processing: OrderStatus.ORDER_STATUS_PROCESSING,
      shipped: OrderStatus.ORDER_STATUS_SHIPPED,
      delivered: OrderStatus.ORDER_STATUS_DELIVERED,
      cancelled: OrderStatus.ORDER_STATUS_CANCELLED,
      refunded: OrderStatus.ORDER_STATUS_REFUNDED,
    };
    return (
      statusMap[status.toLowerCase()] || OrderStatus.ORDER_STATUS_UNSPECIFIED
    );
  };

  const statusEnum = getStatusEnum(orderDetail.status);
  const statusColor = ORDER_STATUS_COLORS[statusEnum];

  // Map payment status text to PaymentStatus enum for color
  const getPaymentStatusEnum = (
    status: PaymentStatus | string
  ): PaymentStatus => {
    if (typeof status === 'number') {
      return status as PaymentStatus;
    }

    const statusMap: Record<string, PaymentStatus> = {
      unspecified: PaymentStatus.PAYMENT_STATUS_UNSPECIFIED,
      pending: PaymentStatus.PAYMENT_STATUS_PENDING,
      paid: PaymentStatus.PAYMENT_STATUS_PAID,
      failed: PaymentStatus.PAYMENT_STATUS_FAILED,
      refunded: PaymentStatus.PAYMENT_STATUS_REFUNDED,
    };
    return (
      statusMap[status.toLowerCase()] ||
      PaymentStatus.PAYMENT_STATUS_UNSPECIFIED
    );
  };

  // Get payment status as string for translation key
  const getPaymentStatusString = (status: PaymentStatus | string): string => {
    if (typeof status === 'string') {
      return status.toLowerCase();
    }

    const statusMap: Record<PaymentStatus, string> = {
      [PaymentStatus.PAYMENT_STATUS_UNSPECIFIED]: 'pending',
      [PaymentStatus.PAYMENT_STATUS_PENDING]: 'pending',
      [PaymentStatus.PAYMENT_STATUS_PAID]: 'paid',
      [PaymentStatus.PAYMENT_STATUS_FAILED]: 'failed',
      [PaymentStatus.PAYMENT_STATUS_REFUNDED]: 'refunded',
      [PaymentStatus.UNRECOGNIZED]: 'pending',
    };
    return statusMap[status] || 'pending';
  };

  const paymentStatusEnum = orderDetail.paymentStatus
    ? getPaymentStatusEnum(orderDetail.paymentStatus)
    : PaymentStatus.PAYMENT_STATUS_UNSPECIFIED;
  const paymentStatusColor = PAYMENT_STATUS_COLORS[paymentStatusEnum];
  const paymentStatusString = orderDetail.paymentStatus
    ? getPaymentStatusString(orderDetail.paymentStatus)
    : 'pending';

  return (
    <Box className="px-2 sm:px-2 py-4 sm:py-5 space-y-4">
      {/* Back Button */}
      <Box className="flex items-center gap-2 mb-2">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={t("backToOrderHistory")}
        >
          <ArrowLeftIcon className="w-5 h-5 text-black" />
          <Text className="text-sm text-black font-medium">
            {t("backToOrderHistory")}
          </Text>
        </button>
      </Box>

      {/* Shipping Information Card */}
      <Box className="bg-white border border-[#F0F0F0] rounded-2xl p-4">
        <Box className="mb-2">
          <Text className="text-sm font-bold text-black">
            {t("orderInformation")}
          </Text>
        </Box>

        {/* Order Number */}
        <Box className="mb-1">
          <Text className="text-sm text-black">
            <Text as="span" className="font-normal">
              {tCommon("order.orderNumber")}:{" "}
            </Text>
            <Text as="span" className="font-semibold">
              {orderDetail.orderNumber}
            </Text>
          </Text>
        </Box>

        {/* Status Section */}
        <Flex className="mb-3 gap-4 flex-wrap">
          {/* Order Status */}
          <Flex align="center" gap="2">
            <Text className="text-xs text-[#606060]">
              {t("orderStatusLabel")}:
            </Text>
            <Text
              className="text-sm font-medium"
              style={{ color: statusColor }}
            >
              {t(`status.${orderDetail.status}`)}
            </Text>
          </Flex>

          {/* Payment Status */}
          <Flex align="center" gap="2">
            <Text className="text-xs text-[#606060]">
              {t("paymentStatusLabel")}:
            </Text>
            <Text
              className="text-sm font-medium"
              style={{ color: paymentStatusColor }}
            >
              {t(`paymentStatus.${paymentStatusString}`)}
            </Text>
          </Flex>
        </Flex>

        {/* Customer Name */}
        {orderDetail.customer && (
          <Box className="mb-3">
            <Text className="text-sm text-black">
              {orderDetail.customer.name}
            </Text>
          </Box>
        )}

        {/* Customer Phone */}
        {orderDetail.customer && (
          <Box className="mb-3">
            <Text className="text-sm text-black">
              {orderDetail.customer.phone}
            </Text>
          </Box>
        )}

        {/* Shipping Address */}
        {orderDetail.shippingAddress && (
          <Box className="space-y-1">
            {/* Street Address - check both 'street' and 'address' field names */}
            {(orderDetail.shippingAddress.street ||
              (orderDetail.shippingAddress as { address?: string })
                .address) && (
              <Text className="text-sm text-black leading-relaxed">
                <Text as="span" className="font-medium">
                  {t("street")}:{" "}
                </Text>
                {orderDetail.shippingAddress.street ||
                  (orderDetail.shippingAddress as { address?: string }).address}
                  {' '}
              </Text>
            )}
            {/* Ward, District, City */}
            <Text className="text-sm text-black leading-relaxed">
              {[
                orderDetail.shippingAddress.ward,
                orderDetail.shippingAddress.district,
                orderDetail.shippingAddress.city,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </Box>
        )}

        {/* Note */}
        {orderDetail.note && (
          <Box className="mt-3">
            <Text className="text-sm text-black leading-relaxed">
              <Text as="span" className="font-medium">
                {t("note")}:{" "}
              </Text>
              {orderDetail.note}
            </Text>
          </Box>
        )}
      </Box>

      {/* Order Information Card */}
      <Box className="bg-white border border-[#F0F0F0] rounded-2xl px-4">
        {/* Title */}
        <Box className="my-3">
          <Text className="text-sm font-bold text-black">
            {t("productInfo")}
          </Text>
        </Box>

        {/* Product List */}
        <Box className="space-y-4 mb-4">
          {orderDetail.items.map((item, index) => (
            <Box key={`${item.productId}-${item.variantId || "no-variant"}`}>
              <Box className="flex gap-3">
                {/* Product Image */}
                <Link
                  href={getProductUrl({ id: item.productId, slug: undefined }, locale)}
                  className="block w-20 h-20 flex-shrink-0 rounded-lg bg-[#E8E8E8] overflow-hidden relative group"
                >
                  <ProductImage
                    src={item.image || DEFAULT_PRODUCT_IMAGE}
                    alt={item.name}
                    fill
                    className={`${item.image ? "object-cover" : "object-contain"} cursor-pointer group-hover:opacity-80 transition-opacity`}
                  />
                </Link>

                {/* Product Info */}
                <Box className="flex-1 min-w-0 flex flex-col justify-between">
                  <Box>
                    <Link
                      href={getProductUrl({ id: item.productId, slug: undefined }, locale)}
                    >
                      <Text className="text-sm font-medium text-black cursor-pointer hover:text-[#9B5526] transition-colors">
                        {item.name}
                      </Text>
                    </Link>
                    {/* {item.variantName && (
                      <Text className="text-sm text-[#999999] mt-1">
                        {item.variantName}
                      </Text>
                    )} */}
                  </Box>
                </Box>

                {/* Price and Quantity */}
                <Box className="flex flex-col items-end justify-between text-right">
                  <Box>
                    <Text className="text-sm font-bold text-black">
                      {formatPrice(item.price)}
                    </Text>
                    {/* {item.originalPrice && item.originalPrice > item.price && (
                      <Text className="text-sm text-[#999999] line-through">
                        {formatPrice(item.originalPrice)}
                      </Text>
                    )} */}
                  </Box>
                  <Text className="text-sm text-[#999999]">
                    x{item.quantity}
                  </Text>
                </Box>
              </Box>
              {index < safeLength(orderDetail.items) - 1 && (
                <Box className="border-b border-[#F0F0F0] mt-4" />
              )}
              {orderDetail.status === OrderStatus.ORDER_STATUS_DELIVERED && (
                <Box className="mt-3">
                  {isProductReviewed(item.productId, item.variantId) ? (
                    <Button variant="soft" disabled className="text-sm">
                      <CheckIcon /> {t("reviewed")}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="2"
                      onClick={() => {
                        router.push(
                          `/${locale}/account/write-review/${orderDetail.id}`
                        );
                      }}
                      className="text-sm"
                    >
                      {t("writeReview")}
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* Payment Summary */}
        <Box className="space-y-3 py-4 border-t border-[#F0F0F0]">
          <Box className="flex items-center justify-between">
            <Text className="text-sm text-black">{tCommon("order.subtotal")}:</Text>
            <Text className="text-sm font-bold text-black">
              {formatPrice(orderDetail.subtotal)}
            </Text>
          </Box>

          <Box className="flex items-center justify-between">
            <Text className="text-sm text-black">{tCommon("order.shippingFee")}:</Text>
            <Text className="text-sm font-bold text-black">
              {formatPrice(orderDetail.shippingFee)}
            </Text>
          </Box>

          {/* Shipping Discount */}
          {(orderDetail as OrderWithShippingPromotion).shippingDiscount &&
            (orderDetail as OrderWithShippingPromotion).shippingDiscount! > 0 ? (
            <Box className="flex items-center justify-between">
              <Text className="text-sm text-black">
                {(orderDetail as OrderWithShippingPromotion).shippingPromotionName ||
                  tCommon("order.shippingFeeDiscount")}:
              </Text>
              <Text className="text-sm font-bold text-black">
                -{formatPrice((orderDetail as OrderWithShippingPromotion).shippingDiscount!)}
              </Text>
            </Box>
          ):<Box></Box>}

          {safeLength(orderDetail.discountDetails) > 0 &&
            orderDetail.discountDetails.map((detail, index) => (
              <Box
                key={`discount-${index}`}
                className="flex items-center justify-between"
              >
                <Text className="text-sm text-black">
                  {detail.referenceName || t("discount")}:
                </Text>
                <Text className="text-sm font-bold text-black">
                  -{formatPrice(detail.discountAmount)}
                </Text>
              </Box>
            ))}

          {/* {orderDetail.voucherDiscount && orderDetail.voucherDiscount > 0 && (
            <Box className="flex items-center justify-between">
              <Text className="text-sm text-black">Voucher:</Text>
              <Text className="text-sm font-bold text-black">
                -{formatPrice(orderDetail.voucherDiscount)}
              </Text>
            </Box>
          )} */}

          <Box className="flex items-center justify-between">
            <Text className="text-sm font-bold text-black">{tCommon("order.total")}:</Text>
            <Text className="text-sm font-bold text-black">
              {formatPrice(orderDetail.total)}
            </Text>
          </Box>

          {orderDetail.paymentMethod && (
            <Box className="flex items-center justify-between">
              <Text className="text-sm text-black">{tCommon("order.paymentMethod")}:</Text>
              <Text className="text-sm text-black">
                {t(`paymentMethods.${orderDetail.paymentMethod}`)}
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* Payment Pending UI - For OnePay orders that haven't been paid */}
      {showPaymentUI && (
        <Box className="bg-[#FEF3CD] border border-[#FFEEBA] rounded-2xl p-4">
          <Flex align="center" gap="3">
            {isPaymentProcessing && (
              <Box className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-[#FAA63E]" />
            )}
            <Text className="text-sm text-[#856404] font-medium flex-1">
              {isPaymentProcessing
                ? t("processingPayment")
                : t("paymentPending")}
            </Text>
            <Button
              onClick={handleRetryPayment}
              disabled={isRetryingPayment}
              className="cursor-pointer text-[#FAA63E] bg-white border border-[#FAA63E] rounded-full text-sm font-medium hover:bg-[#FEF8F1] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                height: "36px",
                padding: "0 16px",
              }}
            >
              {isRetryingPayment ? tCommon("status.processing") : t("payNow")}
            </Button>
          </Flex>
        </Box>
      )}

      {/* Write Review Button - Only show for delivered orders that haven't been reviewed */}
      {statusEnum === OrderStatus.ORDER_STATUS_DELIVERED &&
        !isOrderReviewed && (
          <Flex justify="center" className="mt-2 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  `/${locale}/account/write-review/${orderDetail.id}`
                );
              }}
              className="w-[150px] h-[40px] bg-gradient-to-r from-[#FAA63E] via-[#EA9839] to-[#C0752F] text-white py-2 px-4 rounded-full text-[16px] font-bold hover:opacity-90 transition-opacity"
            >
              {tOrderHistory("writeReview").toUpperCase()}
            </button>
          </Flex>
        )}
      {/* Read Review Button - Only show for delivered orders that haven been reviewed */}
      {isOrderReviewed && (
        <Flex justify="center" className="mt-2 pt-1">
          <button
            onClick={handleReadReview}
            className="w-[190px] h-[40px] bg-gradient-to-r from-[#FAA63E] via-[#EA9839] to-[#C0752F] text-white py-2 px-4 rounded-full text-[16px] font-bold hover:opacity-90 transition-opacity"
          >
            {tOrderHistory("readReview").toUpperCase()}
          </button>
        </Flex>
      )}
      {/* Delivery Tracking Card */}
      {/* <Box className="bg-white border border-[#F0F0F0] rounded-2xl p-4">
        <Text className="text-base font-bold text-black mb-4">
          {t("deliveryInformation")}
        </Text> */}
      {/* TODO: Add delivery tracking timeline here */}
      {/* </Box> */}
    </Box>
  );
}
