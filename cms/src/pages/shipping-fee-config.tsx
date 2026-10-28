import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ShippingFeeConfigView } from 'src/sections/shipping-fee-config';

// ----------------------------------------------------------------------

export default function ShippingFeeConfigPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('shippingFeeConfigManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('shippingFeeConfigManagement')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Shipping Fee Configuration Management" />
        <meta name="keywords" content="cchat,cms,shipping,fee,config" />
      </Helmet>

      <ShippingFeeConfigView />
    </>
  );
}
