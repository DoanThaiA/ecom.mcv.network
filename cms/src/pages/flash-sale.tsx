import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { FlashSaleView } from 'src/sections/flash-sale';

// ----------------------------------------------------------------------

export default function FlashSalePage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('flashSaleManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('flashSaleManagement')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Flash Sale Management" />
        <meta name="keywords" content="cchat,cms,flash,sale" />
      </Helmet>

      <FlashSaleView />
    </>
  );
}
