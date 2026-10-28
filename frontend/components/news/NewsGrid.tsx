'use client';

import type { NewsArticle } from '@/types/news';
import { NewsCard } from './NewsCard';

interface NewsGridProps {
  articles: NewsArticle[];
  locale?: string;
  columns?: 2 | 3 | 4;
}

export function NewsGrid({ articles, locale = 'vi', columns = 3 }: NewsGridProps) {

  const getColumnsResponsive = () => {
    switch (columns) {
      case 2:
        return 'sm:grid-cols-2';
      case 4:
        return 'sm:grid-cols-2 lg:grid-cols-4';
      case 3:
      default:
        return 'sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className={`grid grid-cols-1 ${getColumnsResponsive()} gap-4 sm:gap-6`}>
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} locale={locale} variant="small" />
      ))}
    </div>
  );
}
