'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { clearCartRequest } from '@/lib/store/slices/cartSlice';
import {
  AlertDialog,
  Button,
  Flex,
  Heading,
  VisuallyHidden,
} from '@radix-ui/themes';
import { useTranslations } from 'next-intl';

export function CartHeader() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.cart);
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');

  const handleClearCart = () => {
    dispatch(clearCartRequest());
  };

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button
          variant="ghost"
          className="cursor-pointer hover:opacity-80"
          style={{
            color: "#FAA63E",
            fontSize: "14px",
          }}
        >
          {t('clearAll')}
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content className="max-w-md">
        <VisuallyHidden>
          <AlertDialog.Title>{t('clearCartConfirm')}</AlertDialog.Title>
        </VisuallyHidden>
        <Heading size="5" weight="bold" className="mb-3">
          {t('clearCartConfirm')}
        </Heading>
        <AlertDialog.Description className="text-gray-600 mt-2">
          {t('clearCartMessage')}
        </AlertDialog.Description>
        <Flex gap="3" mt="5" justify="end">
          <AlertDialog.Cancel>
            <Button
              variant="soft"
              color="gray"
              className="cursor-pointer"
            >
              {tCommon('buttons.cancel')}
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              variant="solid"
              color="red"
              onClick={handleClearCart}
              disabled={isLoading}
              className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('clearingCart') : tCommon('buttons.confirm')}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
