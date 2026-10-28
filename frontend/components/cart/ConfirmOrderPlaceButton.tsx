'use client';

import { useEffect } from 'react';
import { formatPrice } from '@/lib/utils/format';
import { CheckoutSession } from '@/types/gen/shop/shared/checkout-sessions/checkout-session';
import { Button, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

interface ConfirmOrderPlaceButtonProps {
  checkoutSession: CheckoutSession;
  isPlacingOrder: boolean;
  isPaymentProcessing: boolean;
  onPlaceOrder: () => void;
  fieldErrors?: Record<string, string>;
}

export function ConfirmOrderPlaceButton({
  checkoutSession,
  isPlacingOrder,
  isPaymentProcessing,
  onPlaceOrder,
  fieldErrors,
}: ConfirmOrderPlaceButtonProps) {
  const tCart = useTranslations('cart');

  const hasUnavailableItems = checkoutSession.hasUnavailableItems;

  // Log when props change to debug button state
  useEffect(() => {
    console.log('[ConfirmOrderPlaceButton] Props updated:', {
      canPlaceOrder: checkoutSession.canPlaceOrder,
      isPlacingOrder,
      isPaymentProcessing,
      fieldErrorsCount: Object.keys(fieldErrors || {}).length,
      isDisabled: isPlacingOrder ||
        isPaymentProcessing ||
        !checkoutSession.canPlaceOrder ||
        Object.keys(fieldErrors || {}).length > 0,
    });
  }, [checkoutSession, isPlacingOrder, isPaymentProcessing, fieldErrors]);

  return (
    <Flex direction="column" gap="4" className="p-4">
      {/* Unavailable items warning banner */}
      {hasUnavailableItems && (
        <Flex
          align="start"
          gap="2"
          className="bg-red-50 border border-red-200 rounded-lg px-3 py-2"
        >
          <Text className="text-red-500 flex-shrink-0 mt-0.5">⚠</Text>
          <Text className="text-red-600 text-sm">
            {tCart('unavailableItemsWarning')}
          </Text>
        </Flex>
      )}

      {/* Total Section */}
      <Flex direction="row" justify="between" align="center">
        <Text
          className="text-base font-medium text-black lg:text-2xl lg:font-semibold lg:uppercase"
          style={{
            fontFamily: 'Google Sans Flex, sans-serif',
            lineHeight: '32px',
            letterSpacing: '0%',
          }}
        >
          {tCart('totalPayment')}
        </Text>
        <Text className="text-2xl font-bold text-black">
          {formatPrice(checkoutSession.total || 0)}
        </Text>
      </Flex>

      {/* Place Order Button - Full Width */}
      <Button
        onClick={onPlaceOrder}
        disabled={
          isPlacingOrder ||
          isPaymentProcessing ||
          !checkoutSession.canPlaceOrder ||
          Object.keys(fieldErrors || {}).length > 0
        }
        className="w-full cursor-pointer text-white rounded-full text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          height: '56px',
          fontSize: '16px',
          background:
            'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)',
        }}
      >
        {tCart('placeOrder')}
      </Button>
    </Flex>
  );
}
