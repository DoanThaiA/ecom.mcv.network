import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ProductComboEditView } from 'src/sections/product-combo';

// ----------------------------------------------------------------------

export default function ProductComboEditPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('updateComboProduct'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('updateComboProduct')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <ProductComboEditView />
    </>
  );
}
