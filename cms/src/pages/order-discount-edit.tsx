import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { OrderDiscountEditView } from 'src/sections/order-discount';

// ----------------------------------------------------------------------

export default function OrderDiscountEditPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('editOrderDiscount'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('editOrderDiscount')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <OrderDiscountEditView />
    </>
  );
}
