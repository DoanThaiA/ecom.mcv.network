import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { PopupAdsView } from 'src/sections/popup-ads';

export default function PopupAdsPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('popupAdsManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('popupAdsManagement')} - ${CONFIG.appName}`}</title>
      </Helmet>
      <PopupAdsView />
    </>
  );
}
