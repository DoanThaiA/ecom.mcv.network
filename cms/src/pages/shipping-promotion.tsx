import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ShippingPromotionListView } from 'src/sections/shipping-promotion';

// ----------------------------------------------------------------------

export default function ShippingPromotionPage() {
  // ----------------------------------------------------------------------

  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('shippingPromotion'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('shippingPromotion')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Shipping Promotion Management" />
        <meta name="keywords" content="cchat,cms,shipping,promotion" />
      </Helmet>

      <ShippingPromotionListView />
    </>
  );
}
