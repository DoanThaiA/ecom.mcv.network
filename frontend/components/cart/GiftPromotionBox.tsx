'use client';

import { Box, Button, Checkbox, Flex, Text } from '@radix-ui/themes';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string;
  expiryDate: string;
  isEligible: boolean;
}

interface GiftPromotionBoxProps {
  vouchers?: Voucher[];
  onSelectVoucher?: (_voucherId: string) => void;
  onApplyDiscountCode?: (_code: string) => void;
  selectedVoucherId?: string;
}

export function GiftPromotionBox({
  vouchers = [],
  onSelectVoucher,
  onApplyDiscountCode,
  selectedVoucherId,
}: GiftPromotionBoxProps) {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const [discountCode, setDiscountCode] = useState('');

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) return;

    if (onApplyDiscountCode) {
      onApplyDiscountCode(discountCode);
    }
  };

  const handleSelectVoucher = (voucherId: string) => {
    if (onSelectVoucher) {
      onSelectVoucher(voucherId);
    }
  };

  return (
    <Box className="bg-white rounded-lg border mb-2 border-gray-200 p-4 space-y-2">
      {/* 1. Danh sách các card khuyến mãi - scroll ngang */}
      {!isEmpty(vouchers) && (
        <Box>
          <Box className="flex gap-3 overflow-x-auto  scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {map(vouchers, (voucher) => (
              <Box
                key={voucher.id}
                className="flex-shrink-0 w-[280px] border border-gray-200 rounded-lg p-3 relative"
              >
                {/* Voucher Card Content */}
                <Flex direction="column" gap="2">
                  {/* Checkbox và Tên khuyến mãi */}
                  <Flex align="center" gap="2">
                    <Checkbox
                      checked={selectedVoucherId === voucher.id}
                      onCheckedChange={() => handleSelectVoucher(voucher.id)}
                      disabled={!voucher.isEligible}
                      size="2"
                    />
                    <Box className="flex-1">
                      <Text size="2" weight="bold" className="text-black">
                        {voucher.name}
                      </Text>
                    </Box>
                  </Flex>

                  {/* Mã voucher */}
                  <Box className="bg-gray-100 px-2 py-1 rounded w-fit">
                    <Text size="1" weight="bold" className="text-blue-600">
                      {voucher.code}
                    </Text>
                  </Box>

                  {/* Mô tả khuyến mãi */}
                  <Text size="1" className="text-gray-600 line-clamp-2">
                    {voucher.description}
                  </Text>

                  {/* HSD và Button điều kiện */}
                  <Flex justify="between" align="center" className="mt-1">
                    <Text size="1" className="text-gray-500">
                      {t('voucherExpiry')}: {voucher.expiryDate}
                    </Text>
                    <Button
                      size="1"
                      variant="ghost"
                      className="cursor-pointer text-blue-600"
                    >
                      {t('voucherConditions')}
                    </Button>
                  </Flex>

                  {/* Tag điều kiện chưa đạt */}
                  {!voucher.isEligible && (
                    <Box className="bg-orange-100 px-2 py-1 rounded mt-1">
                      <Text size="1" className="text-orange-700">
                        {t('orderNotEligible')}
                      </Text>
                    </Box>
                  )}
                </Flex>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* 2. Button "Ví Voucher" */}
      <Button
        size="2"
        variant="outline"
        className="cursor-pointer border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
      >
        🎫 {t('voucherWallet')}
      </Button>

      {/* 3. TextField nhập mã giảm giá và button Áp dụng */}
      <Flex gap="2">
        <input
          type="text"
          placeholder={t('enterDiscountCode')}
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
        />
        <Button
          onClick={handleApplyDiscount}
          disabled={!discountCode.trim()}
          className="cursor-pointer bg-black text-white px-6 hover:bg-gray-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {tCommon('buttons.apply')}
        </Button>
      </Flex>
    </Box>
  );
}
