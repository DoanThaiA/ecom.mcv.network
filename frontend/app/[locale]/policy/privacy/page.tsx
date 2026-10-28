import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { generateStaticMetadata } from '@/lib/utils/seo';
import { PrivacyPolicyContent } from './PrivacyPolicyContent';

interface PrivacyPolicyPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: PrivacyPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateStaticMetadata('policy/privacy', locale as AppLocale);
}

export default async function PrivacyPolicyPage({
  params,
}: PrivacyPolicyPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <PrivacyPolicyContent />
    </PageLayout>
  );
}
