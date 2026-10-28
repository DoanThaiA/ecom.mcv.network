'use client';

import { getLocalizedText, type NewsArticle } from '@/types/news';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

interface NewsFeaturedProps {
  article: NewsArticle;
  locale?: string;
}

export function NewsFeatured({ article, locale = 'vi' }: NewsFeaturedProps) {
  const [imageError, setImageError] = useState(false);
  const t = useTranslations('news');

  const localizedTitle = getLocalizedText(article.titleLocalization, locale, article.title);
  const localizedExcerpt = article.contentLocalization
    ? getLocalizedText(
        {
          vi: article.contentLocalization.vi
            ? article.contentLocalization.vi.replace(/<[^>]*>/g, '').trim().substring(0, 200)
            : undefined,
          en: article.contentLocalization.en
            ? article.contentLocalization.en.replace(/<[^>]*>/g, '').trim().substring(0, 200)
            : undefined,
        },
        locale,
        article.excerpt || '',
      )
    : article.excerpt;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Link href={`/${locale}/news/${article.id}`} className="no-underline text-inherit block group">
      {/* Image — fixed 16/9 ratio, full width */}
      <Box className="relative w-full aspect-[16/9] overflow-hidden rounded-xl bg-gray-200">
        {/* Featured badge */}
        <Box className="absolute top-3 left-3 z-10 bg-[#FAA63E] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
          {t('featured')}
        </Box>

        {imageError ? (
          <Box className="w-full h-full flex items-center justify-center bg-gray-100">
            <Text className="text-gray-400">No image</Text>
          </Box>
        ) : (
          <img
            src={article.thumbnail}
            alt={localizedTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        )}
      </Box>

      {/* Content below image */}
      <Box className="pt-3">
        <Text className="text-base sm:text-lg font-bold text-black line-clamp-2 leading-snug group-hover:text-[#FAA63E] transition-colors duration-200 mb-2">
          {localizedTitle}
        </Text>

        {localizedExcerpt && (
          <Text className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-2">
            {localizedExcerpt}
          </Text>
        )}

        <Flex align="center" gap="1">
          <CalendarIcon width="12" height="12" className="text-gray-400" />
          <Text className="text-xs text-gray-400">{formatDate(article.publishedAt)}</Text>
        </Flex>
      </Box>
    </Link>
  );
}
