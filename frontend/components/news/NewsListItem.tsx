'use client';

import { getLocalizedText, type NewsArticle } from '@/types/news';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Box, Flex, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useState } from 'react';

interface NewsListItemProps {
  article: NewsArticle;
  locale?: string;
}

export function NewsListItem({ article, locale = 'vi' }: NewsListItemProps) {
  const [imageError, setImageError] = useState(false);

  const localizedTitle = getLocalizedText(article.titleLocalization, locale, article.title);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Link
      href={`/${locale}/news/${article.id}`}
      className="no-underline text-inherit block group"
    >
      <Flex
        gap="3"
        className="py-3 border-b border-gray-100 last:border-b-0 transition-colors duration-200 cursor-pointer"
      >
        {/* Thumbnail */}
        <Box className="w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
          {imageError ? (
            <Box className="w-full h-full flex items-center justify-center bg-gray-100">
              <Text className="text-gray-400 text-xs">No img</Text>
            </Box>
          ) : (
            <img
              src={article.thumbnail}
              alt={localizedTitle}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          )}
        </Box>

        {/* Content */}
        <Box className="flex-1 min-w-0 flex flex-col justify-between">
          <Text className="font-semibold text-xs sm:text-sm text-black line-clamp-2 leading-snug group-hover:text-[#FAA63E] transition-colors duration-200">
            {localizedTitle}
          </Text>

          <Flex align="center" gap="1" className="mt-1">
            <CalendarIcon width="11" height="11" className="text-gray-400 flex-shrink-0" />
            <Text className="text-[11px] text-gray-400">
              {formatDate(article.publishedAt)}
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Link>
  );
}
