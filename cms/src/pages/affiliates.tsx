import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { AffiliatesView } from 'src/sections/affiliates';

export default function AffiliatesPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('affiliateManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('affiliateManagement')} - ${CONFIG.appName}`}</title>
      </Helmet>
      <AffiliatesView />
    </>
  );
}
