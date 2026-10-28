import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { generateStaticMetadata } from '@/lib/utils/seo';
import { TermsContent } from '@/components/policy/terms';

interface TermsPolicyPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: TermsPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateStaticMetadata('policy/terms', locale as AppLocale);
}

export default async function TermsPolicyPage({
  params,
}: TermsPolicyPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <TermsContent />
    </PageLayout>
  );
}
