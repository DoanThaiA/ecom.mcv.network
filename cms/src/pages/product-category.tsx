import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ProductCategoryView } from 'src/sections/product-category';

// ----------------------------------------------------------------------

export default function ProductCategoryPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('productCategory'));
  }, []);

  return (
    <>
      <Helmet>
        <title>{`${t('productCategory')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Product Category Management" />
        <meta name="keywords" content="cchat,cms,product,category" />
      </Helmet>

      <ProductCategoryView />
    </>
  );
}
