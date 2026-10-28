import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { OrderView } from 'src/sections/order';

// ----------------------------------------------------------------------

export default function OrderPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('order_management'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('order_management')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Order Management" />
        <meta name="keywords" content="cchat,cms,order" />
      </Helmet>

      <OrderView />
    </>
  );
}
