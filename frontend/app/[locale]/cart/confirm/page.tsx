import { ConfirmOrderContent } from '@/components/cart/ConfirmOrderContent';
import { AppLocale } from '@/lib/locale';

interface PageProps {
  params: Promise<{
    locale: AppLocale;
  }>;
  searchParams: Promise<{
    checkoutSessionId?: string;
    source?: string;
    productId?: string;
  }>;
}

export default async function ConfirmOrderPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const { checkoutSessionId, source, productId } = await searchParams;

  return (
    <ConfirmOrderContent
      locale={locale}
      checkoutSessionId={checkoutSessionId}
      navigationSource={source as 'product' | 'cart' | undefined}
      productId={productId}
    />
  );
}
