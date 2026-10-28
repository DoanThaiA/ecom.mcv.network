import { PageLayout } from '@/components/layout/PageLayout';
import { CartPageClient } from '@/components/cart/CartPageClient';
import { AppLocale } from '@/lib/locale';

interface CartPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <CartPageClient locale={locale as AppLocale} />
    </PageLayout>
  );
}
