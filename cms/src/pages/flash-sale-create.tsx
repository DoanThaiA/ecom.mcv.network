import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { FlashSaleCreateView } from 'src/sections/flash-sale';

// ----------------------------------------------------------------------

export default function FlashSaleCreatePage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('createFlashSale'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('createFlashSale')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <FlashSaleCreateView />
    </>
  );
}
