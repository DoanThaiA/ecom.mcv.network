import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { newsRepository } from '@/lib/repositories';
import { generateNewsMetadata } from '@/lib/utils/seo';
import { NewsDetailContent } from './NewsDetailContent';

interface NewsDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;

  try {
    const news = await newsRepository.getNewsById(id);

    if (!news) {
      return {
        title: 'News Not Found | CChat Shop',
      };
    }

    return generateNewsMetadata({
      id: news.id,
      title: news.title,
      excerpt: news.excerpt,
      thumbnail: news.thumbnail,
      publishedAt: news.publishedAt,
      locale: locale as AppLocale,
    });
  } catch {
    return {
      title: 'News | CChat Shop',
    };
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { locale, id } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <NewsDetailContent locale={locale as AppLocale} newsId={id} />
    </PageLayout>
  );
}
