import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { generateStaticMetadata } from '@/lib/utils/seo';
import { DeliveryPolicyContent } from '@/components/policy/delivery/DeliveryPolicyContent';

interface DeliveryPolicyPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: DeliveryPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateStaticMetadata('policy/delivery', locale as AppLocale);
}

export default async function DeliveryPolicyPage({
  params,
}: DeliveryPolicyPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <DeliveryPolicyContent />
    </PageLayout>
  );
}
