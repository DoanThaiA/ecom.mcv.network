import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { generateStaticMetadata } from '@/lib/utils/seo';
import { ReturnPolicyContent } from '@/components/policy/return/ReturnPolicyContent';

interface ReturnPolicyPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: ReturnPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateStaticMetadata('policy/return', locale as AppLocale);
}

export default async function ReturnPolicyPage({
  params,
}: ReturnPolicyPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <ReturnPolicyContent />
    </PageLayout>
  );
}
