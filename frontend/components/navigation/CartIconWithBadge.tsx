'use client';

import { useEffect, useState } from 'react';
import { Box } from '@radix-ui/themes';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { loadCartRequest } from '@/lib/store/slices/cartSlice';
import { CartPopover } from '@/components/cart/CartPopover';
import { AppLocale } from '@/lib/locale';

interface CartIconWithBadgeProps {
  locale: AppLocale;
}

export function CartIconWithBadge({ locale }: CartIconWithBadgeProps) {
  const [isMounted, setIsMounted] = useState(false);
  const dispatch = useAppDispatch();
  const { cart, isLoading, isInitialized } = useAppSelector((state) => state.cart);

  // Load cart data on mount (only if not already loaded or loading)
  useEffect(() => {
    setIsMounted(true);
    if (!isLoading && !isInitialized) {
      dispatch(loadCartRequest());
    }
  }, [dispatch, isLoading, isInitialized]);

  const CartBadge = isMounted && cart.itemCount > 0 && (
    <Box className="absolute -top-1 -left-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none z-10">
      {cart.itemCount > 99 ? '99+' : cart.itemCount}
    </Box>
  );

  const CartIcon = (
    <Box
      className="cursor-pointer relative w-6 h-6"
      style={{ overflow: 'visible' }}
    >
      <Image
        src="/assets/svg/shopping-bag.svg"
        alt="Cart"
        width={24}
        height={24}
      />
      {CartBadge}
    </Box>
  );

  return <CartPopover locale={locale}>{CartIcon}</CartPopover>;
}
