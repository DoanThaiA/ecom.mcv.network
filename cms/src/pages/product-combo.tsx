import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ProductComboView } from 'src/sections/product-combo';

// ----------------------------------------------------------------------

export default function ProductComboPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('combo_products'));
  }, []);

  return (
    <>
      <Helmet>
        <title>{`${t('combo_products')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Product Combo Management" />
        <meta name="keywords" content="cchat,cms,product,combo" />
      </Helmet>

      <ProductComboView />
    </>
  );
}
