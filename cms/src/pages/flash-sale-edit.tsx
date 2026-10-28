import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { FlashSaleEditView } from 'src/sections/flash-sale';

// ----------------------------------------------------------------------

export default function FlashSaleEditPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('updateFlashSale'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('updateFlashSale')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <FlashSaleEditView />
    </>
  );
}
