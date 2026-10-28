import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import { usePageTitle } from 'src/contexts/page-title-context';
import { ProductBannerView } from 'src/sections/product-banner';
import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export default function ProductBannerPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('productBannerManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('productBannerManagement')} - ${CONFIG.appName}`}</title>
      </Helmet>
      <ProductBannerView />
    </>
  );
}
