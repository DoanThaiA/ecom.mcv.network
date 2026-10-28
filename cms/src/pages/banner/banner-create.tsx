import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { BannerForm } from 'src/sections/banner';

export default function BannerCreatePage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('createBanner'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('createBanner')} - ${CONFIG.appName}`}</title>
      </Helmet>
      <BannerForm />
    </>
  );
}
