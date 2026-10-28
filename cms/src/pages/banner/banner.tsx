import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { BannerView } from 'src/sections/banner';

export default function BannerPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('bannerManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('bannerManagement')} - ${CONFIG.appName}`}</title>
      </Helmet>
      <BannerView />
    </>
  );
}
