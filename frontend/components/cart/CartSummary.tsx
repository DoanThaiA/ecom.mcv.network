'use client';

import { Box, Flex, Text, Button, Separator } from '@radix-ui/themes';
import { Cart } from '@/types/cart';
import { formatPrice } from '@/lib/utils/format';
import { CheckCircledIcon, RocketIcon } from '@radix-ui/react-icons';

interface CartSummaryProps {
  cart: Cart;
  translations: {
    cartSummary: string;
    subtotal: string;
    discount: string;
    totalAmount: string;
    checkout: string;
    freeShipping: string;
  };
  onCheckout?: () => void;
}

export function CartSummary({ cart, translations, onCheckout }: CartSummaryProps) {
  return (
    <Box className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <Box className="bg-gradient-to-r from-black to-gray-800 px-6 py-4">
        <Text size="5" weight="bold" className="text-white">
          {translations.cartSummary}
        </Text>
      </Box>

      {/* Content */}
      <Box className="p-6">
        <Flex direction="column" gap="4">
          {/* Subtotal */}
          <Flex justify="between" align="center">
            <Text size="3" className="text-gray-600">
              {translations.subtotal}
            </Text>
            <Text size="3" weight="medium" className="text-gray-900">
              {formatPrice(cart.subtotal)}
            </Text>
          </Flex>

          {/* Discount */}
          {cart.comboDiscount > 0 && (
            <Flex justify="between" align="center" className="bg-red-50 -mx-6 px-6 py-3">
              <Flex align="center" gap="2">
                <CheckCircledIcon className="text-red-600" width="18" height="18" />
                <Text size="3" className="text-red-600 font-medium">
                  {translations.discount}
                </Text>
              </Flex>
              <Text size="3" weight="bold" className="text-red-600">
                -{formatPrice(cart.comboDiscount)}
              </Text>
            </Flex>
          )}

          <Separator size="4" className="my-1" />

          {/* Total */}
          <Flex justify="between" align="center" className="bg-gray-50 -mx-6 px-6 py-4">
            <Text size="4" weight="bold" className="text-gray-900">
              {translations.totalAmount}
            </Text>
            <Text size="6" weight="bold" className="text-black">
              {formatPrice(cart.total)}
            </Text>
          </Flex>
        </Flex>

        {/* Checkout Button */}
        <Button
          size="4"
          className="w-full mt-6 bg-black hover:bg-gray-900 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
          onClick={onCheckout}
        >
          <RocketIcon width="18" height="18" />
          {translations.checkout}
        </Button>

        {/* Free Shipping Banner */}
        <Box className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <Flex align="center" gap="2">
            <CheckCircledIcon className="text-green-600 flex-shrink-0" width="20" height="20" />
            <Text size="2" weight="medium" className="text-green-800">
              {translations.freeShipping}
            </Text>
          </Flex>
        </Box>

        {/* Additional Info */}
        <Box className="mt-4 pt-4 border-t border-gray-200">
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <Box className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <Text size="1" className="text-gray-600">
                Secure checkout
              </Text>
            </Flex>
            <Flex align="center" gap="2">
              <Box className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <Text size="1" className="text-gray-600">
                Easy returns within 30 days
              </Text>
            </Flex>
            <Flex align="center" gap="2">
              <Box className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <Text size="1" className="text-gray-600">
                Customer support 24/7
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
