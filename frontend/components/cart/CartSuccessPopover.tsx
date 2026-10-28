'use client';

import { useEffect } from 'react';
import { Box, Text, Button } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { ProductImage } from '@/components/common/ProductImage';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { closePopover } from '@/lib/store/slices/cartSlice';
import { CartItem } from '@/types/cart';
import { formatPrice } from '@/lib/utils/format';

const AUTO_CLOSE_DELAY = 3000;

type ExtendedCartItem = CartItem & {
  imageUrl?: string;
  color?: string;
  size?: string;
  originalPrice?: number;
};

export function CartSuccessPopover() {
  const t = useTranslations('cart');
  const dispatch = useAppDispatch();
  const params = useParams();
  const locale = params.locale as string;

  const { popoverType, popoverOpen, successItem } = useAppSelector(
    (state) => state.cart
  );

  const isOpen = popoverType === 'success' && popoverOpen && successItem;

  // Auto-close after delay
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        dispatch(closePopover());
      }, AUTO_CLOSE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [isOpen, dispatch]);

  if (!isOpen || !successItem) return null;

  const item = successItem as ExtendedCartItem;
  const itemImage = item.image || item.imageUrl;

  return (
    <Box className="fixed top-16 right-4 z-[9999] w-[calc(100vw-32px)] sm:w-[360px] max-w-[360px] bg-white rounded-xl shadow-lg border border-[#E5E7EB] animate-in slide-in-from-top-2 fade-in duration-200">
      {/* Header */}
      <Box className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#F3F4F6]">
        <Text className="text-xs sm:text-sm font-semibold text-black">
          {t('addedToCartSuccess')}
        </Text>
        <Box
          onClick={() => dispatch(closePopover())}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <Cross2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B7280]" />
        </Box>
      </Box>

      {/* Product Info */}
      <Box className="p-3 sm:p-4">
        <Box className="flex gap-2.5 sm:gap-3">
          {/* Product Image */}
          <Box className="w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] flex-shrink-0 rounded-lg bg-[#F3F4F6] overflow-hidden relative">
            {itemImage ? (
              <ProductImage
                src={itemImage}
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
            <Text className="text-xs sm:text-sm font-medium text-black line-clamp-2 mb-0.5 sm:mb-1">
              {item.name}
            </Text>

            {/* Color & Size */}
            {(item.color || item.size) && (
              <Text className="text-[10px] sm:text-xs text-[#6B7280] mb-0.5 sm:mb-1">
                {[item.color, item.size].filter(Boolean).join(', ')}
              </Text>
            )}

            {/* Quantity */}
            <Text className="text-[10px] sm:text-xs text-[#6B7280] mb-1.5 sm:mb-2">
              x{item.quantity}
            </Text>

            {/* Price */}
            <Box className="flex items-center gap-1.5 sm:gap-2">
              <Text className="text-xs sm:text-sm font-semibold text-black">
                {formatPrice(item.price)}
              </Text>
              {item.originalPrice && item.originalPrice > item.price && (
                <Text className="text-[10px] sm:text-xs text-[#9CA3AF] line-through">
                  {formatPrice(item.originalPrice)}
                </Text>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* View Cart Button */}
      <Box className="px-3 sm:px-4 pb-3 sm:pb-4">
        <Link href={`/${locale}/cart`} onClick={() => dispatch(closePopover())}>
          <Button
            className="w-full h-10 sm:h-[44px] text-white text-xs sm:text-sm font-medium rounded-lg transition-all hover:opacity-90 cursor-pointer"
            style={{
              background:
                "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
            }}
          >
            {t('viewCart')}
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
