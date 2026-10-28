import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { topicRepository } from '@/lib/repositories';
import { parseTopicSlug, findTopicById } from '@/lib/utils/seoUrl';
import { generateTopicMetadata } from '@/lib/utils/seo';
import { TopicContent } from './TopicContent';

interface TopicPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { locale, id } = await params;

  // Parse the URL segment to extract ID
  const parsed = parseTopicSlug(id);

  // Handle slug-only URLs
  if (parsed.isSlugOnly) {
    return {
      title: 'Collection | CChat Shop',
    };
  }

  // Extract the actual topic ID
  const topicId = parsed.id || id;

  try {
    const topicsResponse = await topicRepository.getShopTopics();
    const topic = findTopicById(topicsResponse.topics, topicId);

    if (!topic) {
      return {
        title: 'Collection Not Found | CChat Shop',
      };
    }

    return generateTopicMetadata({
      id: topic.id,
      name: topic.name,
      description: undefined,
      image: topic.image,
      slug: topic.slug,
      locale: locale as AppLocale,
    });
  } catch {
    return {
      title: 'Collection | CChat Shop',
    };
  }
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { locale, id } = await params;

  // Parse the URL segment to extract ID
  const parsed = parseTopicSlug(id);

  // Handle slug-only URLs - redirect to home page to avoid performance hit
  if (parsed.isSlugOnly) {
    redirect(`/${locale}`);
  }

  // Extract the actual topic ID
  const topicId = parsed.id || id;

  const topicsResponse = await topicRepository.getShopTopics();

  return (
    <PageLayout locale={locale as AppLocale}>
      {({ categories }) => (
        <TopicContent
          locale={locale as AppLocale}
          topicId={topicId}
          topics={topicsResponse.topics}
          categories={categories}
        />
      )}
    </PageLayout>
  );
}
