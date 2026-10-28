import { Footer } from '@/components/layout/Footer';
import { PaymentResultContent } from '@/components/payment/PaymentResultContent';
import { AppLocale } from '@/lib/locale';

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <>
      <PaymentResultContent />
      <Footer locale={locale as AppLocale} />
    </>
  );
}
