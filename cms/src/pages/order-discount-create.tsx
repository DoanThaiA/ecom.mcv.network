import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { OrderDiscountCreateView } from 'src/sections/order-discount';

// ----------------------------------------------------------------------

export default function OrderDiscountCreatePage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('createOrderDiscount'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('createOrderDiscount')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <OrderDiscountCreateView />
    </>
  );
}
