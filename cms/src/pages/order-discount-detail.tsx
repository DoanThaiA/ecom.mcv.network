import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { OrderDiscountDetailView } from 'src/sections/order-discount';

// ----------------------------------------------------------------------

export default function OrderDiscountDetailPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('orderDiscountDetail'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('orderDiscountDetail')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <OrderDiscountDetailView />
    </>
  );
}
