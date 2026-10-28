'use client';

import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function ProductPolicy() {
  const t = useTranslations('productDetail');

  return (
    <Box className="bg-gray-100 w-full mb-6 border-0">
      <Flex direction="column" gap="3" className="p-4">
        {/* Sản phẩm chính hãng */}
        <Flex align="center" gap="3">
          <Box className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <Image
              src="/assets/svg/approve_icon.svg"
              alt="Check"
              width={24}
              height={24}
            />
          </Box>
          <Text className="text-black" style={{ fontSize: "14px" }}>
            {t("policyAuthentic")}
          </Text>
        </Flex>

        {/* Hotline */}
        <Flex align="center" gap="3">
          <Box className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <Image
              src="/assets/svg/product/support.svg"
              alt="Support"
              width={24}
              height={24}
            />
          </Box>
          <Flex direction="column">
            <Text className="text-black" style={{ fontSize: "14px" }}>
              {t("policyHotline")}
            </Text>
            <Text className="text-gray-600" style={{ fontSize: "12px" }}>
              {t("policyHotlineDesc")}
            </Text>
          </Flex>
        </Flex>

        {/* Đổi trả trong 7 ngày */}
        <Flex align="center" gap="3">
          <Box className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <Image
              src="/assets/svg/product/return_product.svg"
              alt="Return"
              width={24}
              height={24}
            />
          </Box>
          <Text className="text-black" style={{ fontSize: "14px" }}>
            {t("policyReturn7Days")}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
