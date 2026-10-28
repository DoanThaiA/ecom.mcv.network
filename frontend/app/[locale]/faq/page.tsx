import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { generateStaticMetadata } from '@/lib/utils/seo';
import { FAQContent } from '@/components/faq';

interface FAQPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: FAQPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateStaticMetadata('faq', locale as AppLocale);
}

export default async function FAQPage({ params }: FAQPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <FAQContent />
    </PageLayout>
  );
}
