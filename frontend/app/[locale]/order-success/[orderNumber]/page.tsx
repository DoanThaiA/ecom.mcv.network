import { PageLayout } from '@/components/layout/PageLayout';
import { OrderSuccessContent } from '@/components/order/OrderSuccessContent';
import { AppLocale } from '@/lib/locale';

interface OrderSuccessPageProps {
  params: Promise<{
    locale: string;
    orderNumber: string;
  }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { locale, orderNumber } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <OrderSuccessContent locale={locale as AppLocale} orderNumber={orderNumber} />
    </PageLayout>
  );
}
