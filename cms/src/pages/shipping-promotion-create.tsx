import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ShippingPromotionFormView } from 'src/sections/shipping-promotion';

// ----------------------------------------------------------------------

export default function ShippingPromotionCreatePage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('createShippingPromotion'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('createShippingPromotion')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Create Shipping Promotion" />
        <meta name="keywords" content="cchat,cms,shipping,promotion,create" />
      </Helmet>

      <ShippingPromotionFormView />
    </>
  );
}
