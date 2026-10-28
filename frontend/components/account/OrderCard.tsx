'use client';

import { useEffect } from 'react';
import { Box, Flex, Text } from '@radix-ui/themes';
import { CheckIcon } from '@radix-ui/react-icons';
import { ProductImage } from '@/components/common/ProductImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { checkOrderReviewedRequest } from '@/lib/store/slices/reviewSlice';
import { Order, ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '@/types/order';
import { AppLocale } from '@/lib/locale';
import { formatPrice } from '@/lib/utils/format';
import { getProductUrl } from '@/lib/utils/seoUrl';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants/images';

interface OrderCardProps {
  order: Order;
  locale: AppLocale;
}

export function OrderCard({ order, locale }: OrderCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations('orderHistory');
  const statusColor = ORDER_STATUS_COLORS[order.status];
  const paymentStatusColor = order.paymentStatus
    ? PAYMENT_STATUS_COLORS[order.paymentStatus]
    : undefined;

  // Subscribe to review state from Redux
  const isOrderReviewed = useAppSelector(
    (state) => state.review.reviewedOrders?.[order.orderNumber] ?? false
  );
  const isCheckingOrderReviewed = useAppSelector(
    (state) => state.review.checkingOrders?.[order.orderNumber] ?? false
  );

  // Check if order has been reviewed when component mounts (only for delivered orders)
  useEffect(() => {
    if (order.status === 'delivered' && order.orderNumber) {
      dispatch(checkOrderReviewedRequest(order.orderNumber));
    }
  }, [dispatch, order.orderNumber, order.status]);

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/${locale}/account/order-history/${order.id}`);
  };

  // Show only first item
  const firstItem = order.items[0];
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <Box className="bg-white rounded-2xl border border-[#F0F0F0] p-4">
      {/* Status Section */}
      <Flex className="mb-4 gap-4 flex-wrap">
        {/* Order Status */}
        <Flex align="center" gap="2">
          <Text className="text-xs text-[#606060]">{t('orderStatusLabel')}:</Text>
          <Text className="text-sm font-medium" style={{ color: statusColor }}>
            {t(`status.${order.status}`)}
          </Text>
        </Flex>

        {/* Payment Status */}
        {order.paymentStatus && paymentStatusColor && (
          <Flex align="center" gap="2">
            <Text className="text-xs text-[#606060]">
              {t('paymentStatusLabel')}:
            </Text>
            <Text
              className="text-sm font-medium"
              style={{ color: paymentStatusColor }}
            >
              {t(`paymentStatus.${order.paymentStatus}`)}
            </Text>
          </Flex>
        )}
      </Flex>

      {/* First Product Item */}
      {firstItem && (
        <Box className="flex gap-3 mb-4">
          {/* Product Image */}
          <Link
            href={getProductUrl({ id: firstItem.productId, slug: undefined }, locale)}
            className="block w-[120px] h-[120px] flex-shrink-0 rounded-lg bg-[#E8E8E8] overflow-hidden relative group"
          >
            <ProductImage
              src={firstItem.image || DEFAULT_PRODUCT_IMAGE}
              alt={firstItem.name}
              fill
              className={`${firstItem.image ? "object-cover" : "object-contain"} cursor-pointer group-hover:opacity-80 transition-opacity`}
            />
          </Link>

          {/* Product Info */}
          <Box className="flex-1 min-w-0 flex flex-col justify-between">
            <Box>
              <Link
                href={getProductUrl({ id: firstItem.productId, slug: undefined }, locale)}
              >
                <Text className="text-sm font-medium text-black cursor-pointer hover:text-[#9B5526] transition-colors">
                  {firstItem.name}
                </Text>
              </Link>
              {(firstItem.color || firstItem.size) && (
                <Text className="text-sm text-[#999999] mt-1">
                  {[firstItem.color, firstItem.size, `(x${firstItem.quantity})`]
                    .filter(Boolean)
                    .join(" - ")}
                </Text>
              )}
            </Box>
          </Box>

          {/* Price */}
          <Box className="flex flex-col items-end justify-between">
            <Text className="text-sm font-bold text-black">
              {formatPrice(firstItem.price)}
            </Text>
            {firstItem.originalPrice &&
              firstItem.originalPrice > firstItem.price && (
                <Text className="text-sm text-[#999999] line-through">
                  {formatPrice(firstItem.originalPrice)}
                </Text>
              )}
          </Box>
        </Box>
      )}

      {/* View More Button */}
      <Box className="flex justify-center mb-4">
        <button
          onClick={handleViewDetail}
          className="text-sm text-[#235AFF] hover:underline"
        >
          {t("viewMore")}
        </button>
      </Box>

      {/* Footer - Product Count & Total */}
      <Box className="flex items-center justify-between">
        <Text className="text-sm text-black">
          {totalQuantity} {t("products")}
        </Text>
        <Text className="text-sm font-bold text-black">
          {t("total")}: {formatPrice(order.total)}
        </Text>
      </Box>

      {/* Write Review Button - Only show for delivered orders */}
      {order.status === "delivered" && (
        <Box className="mt-4 pt-4 border-t border-[#F0F0F0]">
          {isOrderReviewed ? (
            // Already reviewed - show disabled state with checkmark
            <Flex align="center" justify="center" gap="2" className="text-[#999999] py-2">
              <CheckIcon className="w-5 h-5" />
              <Text size="2" weight="medium">
                {t("reviewed")}
              </Text>
            </Flex>
          ) : (
            // Not reviewed yet - show active button
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/${locale}/account/write-review/${order.id}`);
              }}
              disabled={isCheckingOrderReviewed}
              className="w-full bg-gradient-to-r from-[#FAA63E] via-[#EA9839] to-[#C0752F] text-white py-2 px-4 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOrderReviewed ? t("checking") : t("writeReview")}
            </button>
          )}
        </Box>
      )}
    </Box>
  );
}
