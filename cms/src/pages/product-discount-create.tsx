import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ProductDiscountCreateView } from 'src/sections/product-discount';

// ----------------------------------------------------------------------

export default function ProductDiscountCreatePage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('createProductDiscount'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('createProductDiscount')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <ProductDiscountCreateView />
    </>
  );
}
