import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ProductDiscountDetailView } from 'src/sections/product-discount';

// ----------------------------------------------------------------------

export default function ProductDiscountDetailPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('productDiscountDetail'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('productDiscountDetail')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <ProductDiscountDetailView />
    </>
  );
}
