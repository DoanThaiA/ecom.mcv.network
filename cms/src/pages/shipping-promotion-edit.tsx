import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ShippingPromotionFormView } from 'src/sections/shipping-promotion';

// ----------------------------------------------------------------------

export default function ShippingPromotionEditPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    setTitle(t('editShippingPromotion'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('editShippingPromotion')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Edit Shipping Promotion" />
        <meta name="keywords" content="cchat,cms,shipping,promotion,edit" />
      </Helmet>

      <ShippingPromotionFormView id={id} />
    </>
  );
}
