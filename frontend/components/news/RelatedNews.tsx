'use client';

import type { NewsArticle } from '@/types/news';
import { Box } from '@radix-ui/themes';
import { NewsGrid } from './NewsGrid';

interface RelatedNewsProps {
  articles: NewsArticle[];
  locale?: string;
  title?: string;
}

export function RelatedNews({
  articles,
  locale = 'vi',
  title = 'BÀI VIẾT LIÊN QUAN',
}: RelatedNewsProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <Box className="mt-10 sm:mt-14 border-t border-gray-200 pt-8 sm:pt-10">
      <Box className="border-l-4 border-[#FAA63E] pl-3 mb-6 sm:mb-8">
        <span className="text-lg sm:text-xl font-bold text-black uppercase tracking-wide">
          {title}
        </span>
      </Box>
      <NewsGrid articles={articles} locale={locale} columns={3} />
    </Box>
  );
}
