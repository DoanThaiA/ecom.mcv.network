'use client';

import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants/images';
import { formatPrice } from '@/lib/utils/format';
import { CheckoutSession } from '@/types/gen/shop/shared/checkout-sessions/checkout-session';
import { Box, Flex, Text } from '@radix-ui/themes';
import { PlusIcon, MinusIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { ProductImage } from '@/components/common/ProductImage';
import { useRef, useEffect, useState } from 'react';

interface ConfirmOrderItemsProps {
  checkoutSession: CheckoutSession;
  onQuantityChange?: (
    _productId: string,
    _variantId: string | undefined,
    _newQuantity: number,
    _comboInstanceId?: string
  ) => Promise<void>;
  isUpdating?: boolean;
  isPaymentProcessing?: boolean;
}

export function ConfirmOrderItems({
  checkoutSession,
  onQuantityChange,
  isUpdating,
  isPaymentProcessing
}: ConfirmOrderItemsProps) {
  const t = useTranslations('orderDetail');
  const tProduct = useTranslations('productDetail');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Record<string, number>>({});
  const [pendingQuantityChanges, setPendingQuantityChanges] = useState<Record<string, number>>({});

  const getItemKey = (item: typeof checkoutSession.items[0]): string => {
    return `${item.productId}-${item.variantId || 'no-variant'}-${item.comboInstanceId || 'no-combo'}`;
  };

  const handleIncrement = (item: typeof checkoutSession.items[0]) => {
    if (!onQuantityChange) return;

    const itemKey = getItemKey(item);

    // Update pending change immediately
    pendingChangesRef.current[itemKey] = (pendingChangesRef.current[itemKey] || 0) + 1;
    setPendingQuantityChanges({ ...pendingChangesRef.current });

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer with 500ms delay
    debounceTimerRef.current = setTimeout(async () => {
      const pendingChange = pendingChangesRef.current[itemKey] || 0;
      const finalQuantity = item.quantity + pendingChange;

      try {
        await onQuantityChange(
          item.productId,
          item.variantId,
          finalQuantity,
          item.comboInstanceId
        );

        // Clear pending after success
        delete pendingChangesRef.current[itemKey];
        setPendingQuantityChanges({ ...pendingChangesRef.current });
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    }, 500);
  };

  const handleDecrement = (item: typeof checkoutSession.items[0]) => {
    if (!onQuantityChange) return;

    const itemKey = getItemKey(item);
    const currentPending = pendingChangesRef.current[itemKey] || 0;
    const wouldBeQuantity = item.quantity + currentPending - 1;

    // Don't allow decrement below 1
    if (wouldBeQuantity < 1) return;

    // Update pending change immediately
    pendingChangesRef.current[itemKey] = currentPending - 1;
    setPendingQuantityChanges({ ...pendingChangesRef.current });

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer with 500ms delay
    debounceTimerRef.current = setTimeout(async () => {
      const pendingChange = pendingChangesRef.current[itemKey] || 0;
      const finalQuantity = item.quantity + pendingChange;

      if (finalQuantity < 1) return;

      try {
        await onQuantityChange(
          item.productId,
          item.variantId,
          finalQuantity,
          item.comboInstanceId
        );

        // Clear pending after success
        delete pendingChangesRef.current[itemKey];
        setPendingQuantityChanges({ ...pendingChangesRef.current });
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    }, 700);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <Box className="bg-white p-4 sm:p-6 mb-4">
      <Box className="mb-4">
        <Text className="text-base sm:text-lg font-bold text-black">
          {t('pageTitle')}
        </Text>
      </Box>

      <Box className="space-y-3 mb-4">
        {checkoutSession.items?.map((item, index) => (
          <Box
            key={`${item.productId}-${item.variantId || 'no-variant'}-${index}`}
            className="flex gap-3 pb-3 border-b border-gray-100 last:border-0"
          >
            {/* Product Image */}
            <Box className="w-20 h-20 flex-shrink-0 rounded-lg bg-[#E8E8E8] overflow-hidden relative">
              <ProductImage
                src={item.image || DEFAULT_PRODUCT_IMAGE}
                alt={item.name}
                fill
                className={item.image ? 'object-cover' : 'object-contain'}
              />
              {!item.isAvailable && (
                <Box className="absolute inset-0 flex items-center justify-center">
                  <Box className="rounded-full flex items-center justify-center w-14 h-14 bg-black/60">
                    <Text className="text-white text-xs font-medium text-center">
                      {tProduct('soldOut')}
                    </Text>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Product Info */}
            <Box className="flex-1 min-w-0">
              <Text className="text-sm font-medium text-black line-clamp-2">
                {item.name}
              </Text>
            </Box>

            {/* Price and Quantity */}
            <Box className="flex flex-col items-end justify-center gap-1">
              {item.effectivePrice !== undefined &&
              item.effectivePrice !== null &&
              item.effectivePrice < item.originalPrice ? (
                <>
                  <Text className="text-s font-bold text-black">
                    {formatPrice(item.effectivePrice)}
                  </Text>
                  {onQuantityChange ? (
                    <Flex
                      align="center"
                      className="bg-[#FEF8F1] rounded-full p-1 gap-3 mt-1"
                    >
                      <button
                        onClick={() => handleDecrement(item)}
                        disabled={item.quantity <= 1 || isUpdating || isPaymentProcessing}
                        className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
                      >
                        <MinusIcon width="16" height="16" className="text-white" />
                      </button>

                      <Box className="min-w-[24px] flex items-center justify-center">
                        <Text weight="medium" className="text-black text-sm">
                          {isUpdating ? '...' : item.quantity + (pendingQuantityChanges[getItemKey(item)] || 0)}
                        </Text>
                      </Box>

                      <button
                        onClick={() => handleIncrement(item)}
                        disabled={!item.isAvailable || isUpdating || isPaymentProcessing}
                        className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
                      >
                        <PlusIcon width="16" height="16" className="text-white" />
                      </button>
                    </Flex>
                  ) : (
                    <Text className="text-sm text-gray-500 mt-1">
                      x{item.quantity}
                    </Text>
                  )}
                  <Text className="text-sm text-gray-400 line-through">
                    {formatPrice(item.originalPrice)}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-sm font-bold text-black">
                    {formatPrice(item.originalPrice)}
                  </Text>
                  {onQuantityChange ? (
                    <Flex
                      align="center"
                      className="bg-[#FEF8F1] rounded-full p-1 gap-3 mt-1"
                    >
                      <button
                        onClick={() => handleDecrement(item)}
                        disabled={item.quantity <= 1 || isUpdating || isPaymentProcessing}
                        className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
                      >
                        <MinusIcon width="16" height="16" className="text-white" />
                      </button>

                      <Box className="min-w-[24px] flex items-center justify-center">
                        <Text weight="medium" className="text-black text-sm">
                          {isUpdating ? '...' : item.quantity + (pendingQuantityChanges[getItemKey(item)] || 0)}
                        </Text>
                      </Box>

                      <button
                        onClick={() => handleIncrement(item)}
                        disabled={!item.isAvailable || isUpdating || isPaymentProcessing}
                        className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
                      >
                        <PlusIcon width="16" height="16" className="text-white" />
                      </button>
                    </Flex>
                  ) : (
                    <Text className="text-sm text-gray-500 mt-1">
                      x{item.quantity}
                    </Text>
                  )}
                </>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
