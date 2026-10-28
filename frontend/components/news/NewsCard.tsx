'use client';

import { IMAGE_SIZES } from '@/lib/constants';
import { getLocalizedText, type NewsArticle } from '@/types/news';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Box, Card, Flex, Text } from '@radix-ui/themes';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface NewsCardProps {
  article: NewsArticle;
  locale?: string;
  variant?: 'default' | 'small';
}

export function NewsCard({ article, locale = 'vi', variant = 'default' }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const localizedTitle = getLocalizedText(article.titleLocalization, locale, article.title);
  const isSmall = variant === 'small';

  return (
    <Link
      href={`/${locale}/news/${article.id}`}
      className="no-underline text-inherit block h-full group"
    >
      <Card className="p-0 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg h-full flex flex-col bg-white border border-gray-100 group-hover:border-t-2 group-hover:border-t-[#FAA63E]">
        {/* Thumbnail */}
        <Box className="w-full bg-gray-200 relative overflow-hidden aspect-[16/9]">
          {imageError ? (
            <Box className="w-full h-full flex items-center justify-center bg-gray-100">
              <Text className="text-gray-400">No image</Text>
            </Box>
          ) : (
            <Image
              src={article.thumbnail}
              alt={localizedTitle}
              fill
              sizes={IMAGE_SIZES.newsCard}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          )}
        </Box>

        {/* Content */}
        <Box className={`flex-1 flex flex-col ${isSmall ? 'p-3' : 'p-3 sm:p-4'}`}>
          <Text
            className={`font-semibold text-black line-clamp-2 mb-3 leading-snug ${
              isSmall ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
            }`}
          >
            {localizedTitle}
          </Text>

          <Flex align="center" gap="1" className="mt-auto">
            <CalendarIcon width="12" height="12" className="text-gray-400 flex-shrink-0" />
            <Text className="text-xs text-gray-400">
              {formatDate(article.publishedAt)}
            </Text>
          </Flex>
        </Box>
      </Card>
    </Link>
  );
}
