'use client';

import { Box, Heading, Text, Button, Flex } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function NotFound() {
  const t = useTranslations('notFound');
  const tCommon = useTranslations('common');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <Flex direction="column" align="center" gap="6" className="max-w-md text-center">
        {/* 404 Number */}
        <Heading
          size="9"
          className="text-[120px] font-bold text-gray-900 leading-none"
        >
          {t('title')}
        </Heading>

        {/* Heading */}
        <Heading size="6" className="text-2xl font-bold text-gray-900">
          {t('heading')}
        </Heading>

        {/* Description */}
        <Text size="3" className="text-gray-600">
          {t('description')}
        </Text>

        {/* Actions */}
        <Flex gap="3" className="mt-4">
          <Link href={`/${locale}`}>
            <Button
              size="3"
              className="bg-[#1a1a1a] text-white px-6 hover:bg-[#333] transition-colors cursor-pointer"
            >
              {tCommon('buttons.backToHome').toUpperCase()}
            </Button>
          </Link>
        </Flex>

        {/* Additional link */}
        <Text size="2" className="text-gray-500">
          {t('or')}{' '}
          <Link
            href={`/${locale}/products`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {t('continueShopping')}
          </Link>
        </Text>
      </Flex>
    </Box>
  );
}
