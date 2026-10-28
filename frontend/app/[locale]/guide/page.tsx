import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { generateStaticMetadata } from '@/lib/utils/seo';
import { ShoppingGuideContent } from './ShoppingGuideContent';

interface GuidePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateStaticMetadata('guide', locale as AppLocale);
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <ShoppingGuideContent />
    </PageLayout>
  );
}
