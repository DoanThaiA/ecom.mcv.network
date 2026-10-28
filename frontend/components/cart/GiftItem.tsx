'use client';

import { Box, Flex, Select, Text } from '@radix-ui/themes';
import Image from 'next/image';
import { useState } from 'react';
import map from 'lodash/map';
import { formatPrice } from '@/lib/utils/format';
import { useTranslations } from 'next-intl';
import { GiftItem as GiftItemType } from '@/types/cart';

interface GiftItemProps {
  gift: GiftItemType;
}

export function GiftItem({ gift }: GiftItemProps) {
  const t = useTranslations('cart');
  const [selectedColor, setSelectedColor] = useState('Đen');
  const availableColors = ['Đen', 'Trắng', 'Xám', 'Xanh Navy', 'Be'];

  return (
    <Box className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 p-2 sm:p-3 ml-6 sm:ml-8">
      <Flex gap="2" align="start">
        {/* Gift Badge */}
        <Box className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-md h-fit flex-shrink-0">
          <Text size="1" weight="bold" className="text-white">
            🎁
          </Text>
        </Box>

        {/* Gift Image */}
        <Box className="w-12 h-12 sm:w-20 sm:h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-pink-100">
          {gift.imageUrl ? (
            <Image
              src={gift.imageUrl}
              alt={gift.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <Box className="w-full h-full flex items-center justify-center bg-pink-100">
              <Text size="2">🎁</Text>
            </Box>
          )}
        </Box>

        {/* Gift Details */}
        <Flex direction="column" gap="1" className="flex-1 min-w-0" justify="between">
          {/* Gift Label and Name */}
          <Box>
            <Text size="1" weight="bold" className="text-pink-600">
              {t('gift')}
            </Text>
            <Text size="1" weight="medium" className="line-clamp-1 text-gray-800 sm:text-sm">
              {gift.name}
            </Text>
          </Box>

          {/* Color Dropdown and Quantity */}
          <Flex align="center" gap="1" className="flex-wrap sm:gap-2">
            <Select.Root
              value={selectedColor}
              onValueChange={setSelectedColor}
              size="1"
            >
              <Select.Trigger
                className="w-[60px] sm:w-[100px]"
                placeholder={t('color')}
              />
              <Select.Content>
                {map(availableColors, (color) => (
                  <Select.Item key={color} value={color}>
                    {color}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Text size="1" className="text-gray-600 flex-shrink-0">
              x1
            </Text>
          </Flex>

          {/* Gift Price */}
          <Flex align="center" gap="1">
            <Text size="1" weight="bold" className="text-pink-600">
              FREE
            </Text>
            {gift.originalPrice && (
              <Text size="1" className="line-through text-gray-400">
                {formatPrice(gift.originalPrice)}
              </Text>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
