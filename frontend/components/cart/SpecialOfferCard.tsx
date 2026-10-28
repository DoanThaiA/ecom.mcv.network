'use client';

import { Box, Button, Flex, Text } from '@radix-ui/themes';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils/format';

export interface SpecialOffer {
  id: string;
  productName: string;
  imageUrl: string;
  promotionInfo: string;
  discountedPrice: number;
  originalPrice: number;
}

interface SpecialOfferCardProps {
  offer?: SpecialOffer;
  onGetOffer?: (offer: SpecialOffer) => void;
}

export function SpecialOfferCard({ offer, onGetOffer }: SpecialOfferCardProps) {
  const t = useTranslations('cart');

  // Early return if no offer data
  if (!offer) return null;

  const handleGetNow = () => {
    if (onGetOffer && offer) {
      onGetOffer(offer);
    }
  };

  return (
    <Box className="bg-white rounded-lg border border-gray-200 p-4 relative">
      {/* Top corner label */}
      <Box className="absolute top-0 left-4 bg-red-500 text-white px-3 py-1.5 rounded-b-md z-10">
        <Text size="2" weight="bold">
          {t('specialOffers')}
        </Text>
      </Box>

      {/* Content - Horizontal layout */}
      <Flex gap="4" align="center" className="mt-6">
        {/* Product Image */}
        <Box className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          {offer.imageUrl ? (
            <Image
              src={offer.imageUrl}
              alt={offer.productName}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <Box className="w-full h-full flex items-center justify-center bg-gray-200">
              <Text size="1" color="gray">
                No Image
              </Text>
            </Box>
          )}
        </Box>

        {/* Product Info Column */}
        <Flex direction="column" gap="2" className="flex-1">
          {/* Product Name */}
          <Text size="2" weight="medium" className="text-black line-clamp-2">
            {offer.productName}
          </Text>

          {/* Promotion Info */}
          <Text size="2" className="text-orange-600">
            {offer.promotionInfo}
          </Text>

          {/* Price Row */}
          <Flex align="center" gap="2">
            <Text size="3" weight="bold" className="text-red-600">
              {formatPrice(offer.discountedPrice)}
            </Text>
            <Text size="2" className="line-through text-gray-400">
              {formatPrice(offer.originalPrice)}
            </Text>
          </Flex>
        </Flex>

        {/* Get Now Button */}
        <Button
          onClick={handleGetNow}
          size="2"
          className="cursor-pointer bg-black text-white hover:bg-gray-800 px-6"
        >
          {t('get')}
        </Button>
      </Flex>
    </Box>
  );
}
