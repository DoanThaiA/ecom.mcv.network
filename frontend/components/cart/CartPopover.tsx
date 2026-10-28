'use client';

import { Box, Text, Popover } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { ProductImage } from '@/components/common/ProductImage';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { removeFromCartRequest } from '@/lib/store/slices/cartSlice';
import { CartItem } from '@/types/cart';
import { AppLocale } from '@/lib/locale';
import { formatPrice } from '@/lib/utils/format';
import { RootState } from '@/lib/store';

type ExtendedCartItem = CartItem & {
  id?: string;
  imageUrl?: string;
  color?: string;
  size?: string;
  originalPrice?: number;
};

interface CartPopoverProps {
  locale: AppLocale;
  children: React.ReactNode;
}

/**
 * CartPopover - Preview popover for cart icon click
 * Uses Radix Popover's internal open state (uncontrolled)
 * Success popover is handled separately by CartSuccessPopover
 */
export function CartPopover({ locale, children }: CartPopoverProps) {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state: RootState) => state.cart);

  // Safety check: ensure cart and cart.items are defined
  const cartItems = cart?.items || [];
  const itemCount = cart?.itemCount || 0;
  const subtotal = cart?.subtotal || 0;

  const handleRemoveItem = (item: ExtendedCartItem) => {
    dispatch(
      removeFromCartRequest({
        productId: item.productId,
        variantId: item.variantId,
      })
    );
  };

  const getItemKey = (item: ExtendedCartItem): string => {
    if (item.variantId) return `${item.productId}-${item.variantId}`;
    if (item.id) return item.id;
    return item.productId;
  };

  return (
    <Popover.Root>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content
        align="end"
        sideOffset={8}
        className="p-0 bg-white rounded-xl shadow-lg border border-[#E5E7EB] z-[9999] w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px]"
      >
        {/* Header */}
        <Box className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#F3F4F6]">
          <Box className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Text className="text-xs sm:text-sm text-[#6B7280]">
              {t('subtotalLabel')}:
            </Text>
            <Text className="text-sm sm:text-base font-bold text-black">
              {formatPrice(subtotal)}
            </Text>
            <Text className="text-xs sm:text-sm text-[#6B7280]">
              ({itemCount} {t('products')})
            </Text>
          </Box>
          <Popover.Close>
            <Link
              href={`/${locale}/cart`}
              className="text-xs sm:text-sm font-medium text-[#2563EB] hover:underline no-underline whitespace-nowrap"
            >
              {tCommon('buttons.viewAll')}
            </Link>
          </Popover.Close>
        </Box>

        {/* Cart Items */}
        {cartItems.length > 0 ? (
          <Box className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
            {(cartItems as ExtendedCartItem[]).map((item) => (
              <Box
                key={getItemKey(item)}
                className="flex gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#F3F4F6] last:border-b-0"
              >
                {/* Product Image */}
                <Box className="w-[56px] h-[56px] sm:w-[70px] sm:h-[70px] flex-shrink-0 rounded-lg bg-[#F3F4F6] overflow-hidden relative">
                  {item.imageUrl || item.image ? (
                    <ProductImage
                      src={item.imageUrl || item.image || ''}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Box className="w-full h-full bg-[#F3F4F6]" />
                  )}
                </Box>

                {/* Product Details */}
                <Box className="flex-1 min-w-0">
                  {/* Product Name */}
                  <Text className="text-xs sm:text-sm font-medium text-black line-clamp-1 mb-0.5">
                    {item.name}
                  </Text>

                  {/* Color & Size */}
                  {(item.color || item.size) && (
                    <Text className="text-[10px] sm:text-xs text-[#6B7280] mb-0.5">
                      {[item.color, item.size].filter(Boolean).join(', ')}
                    </Text>
                  )}

                  {/* Quantity */}
                  <Text className="text-[10px] sm:text-xs text-[#6B7280] mb-1">
                    x{item.quantity}
                  </Text>

                  {/* Price */}
                  <Box className="flex items-center gap-1.5 sm:gap-2">
                    <Text className="text-xs sm:text-sm font-bold text-black">
                      {formatPrice(item.effectivePrice || item.price)}
                    </Text>
                    {/* Show flash sale original price if flash sale exists */}
                    {item.flashSale && item.flashSale.originalPrice > item.effectivePrice ? (
                      <Text className="text-[10px] sm:text-xs text-[#9CA3AF] line-through">
                        {formatPrice(item.flashSale.originalPrice)}
                      </Text>
                    ) : (
                      /* Otherwise show regular original price if exists */
                      item.originalPrice && item.originalPrice > (item.effectivePrice || item.price) && (
                        <Text className="text-[10px] sm:text-xs text-[#9CA3AF] line-through">
                          {formatPrice(item.originalPrice)}
                        </Text>
                      )
                    )}
                  </Box>
                </Box>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors self-start"
                >
                  <Cross2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9CA3AF]" />
                </button>
              </Box>
            ))}
          </Box>
        ) : (
          <Box className="py-6 sm:py-8 text-center">
            <Text className="text-xs sm:text-sm text-[#6B7280]">
              {t('emptyCart')}
            </Text>
          </Box>
        )}
      </Popover.Content>
    </Popover.Root>
  );
}
