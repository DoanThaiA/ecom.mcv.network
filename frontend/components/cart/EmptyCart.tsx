'use client';

import { Box, Flex, Text, Button } from '@radix-ui/themes';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { AppLocale } from '@/lib/locale';

export function EmptyCart() {
  const t = useTranslations('cart');
  const params = useParams();
  const locale = params.locale as AppLocale;
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      className="min-h-[500px] py-12 px-4"
    >
      {/* Animated Cart Icon */}
      <Box className="relative mb-8 animate-fadeIn">
        <Box className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </Box>
        {/* Floating decorative elements */}
        <Box className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full opacity-60 animate-bounce" />
        <Box
          className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-400 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: '0.2s' }}
        />
      </Box>

      {/* Main Message */}
      <Box className="text-center max-w-md mb-8 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <Text size="7" weight="bold" className="mb-3 text-gray-900 block">
          {t('emptyCart')}
        </Text>

        <Text size="3" className="text-gray-600 leading-relaxed">
          {t('emptyCartMessage')}
        </Text>
      </Box>

      {/* Call to Action */}
      <Box className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        <Link href={`/${locale}`}>
          <Button
            size="4"
            className="bg-black hover:bg-gray-900 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl px-8"
          >
            <MagnifyingGlassIcon width="18" height="18" />
            {t('continueShopping')}
          </Button>
        </Link>
      </Box>

      {/* Suggested Actions */}
      <Flex
        gap="6"
        className="mt-12 flex-wrap justify-center animate-fadeIn"
        style={{ animationDelay: '0.3s' }}
      >
        <Box className="text-center">
          <Box className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          </Box>
          <Text size="2" weight="medium" className="text-gray-700">
            New Arrivals
          </Text>
        </Box>

        <Box className="text-center">
          <Box className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </Box>
          <Text size="2" weight="medium" className="text-gray-700">
            Best Deals
          </Text>
        </Box>

        <Box className="text-center">
          <Box className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </Box>
          <Text size="2" weight="medium" className="text-gray-700">
            Popular Items
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}
