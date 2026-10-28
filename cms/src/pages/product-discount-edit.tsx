import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ProductDiscountEditView } from 'src/sections/product-discount';

// ----------------------------------------------------------------------

export default function ProductDiscountEditPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('editProductDiscount'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('editProductDiscount')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <ProductDiscountEditView />
    </>
  );
}
