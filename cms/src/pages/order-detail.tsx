import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { OrderDetailView } from 'src/sections/order';

// ----------------------------------------------------------------------

export default function OrderDetailPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    setTitle(`${t('order_detail')} #${id?.slice(-4) || ''}`);
  }, [t, setTitle, id]);

  return (
    <>
      <Helmet>
        <title>{`${t('order_detail')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Order Detail" />
        <meta name="keywords" content="cchat,cms,order,detail" />
      </Helmet>

      <OrderDetailView />
    </>
  );
}
