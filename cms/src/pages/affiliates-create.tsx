import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';

import { AffiliatesCreateView } from 'src/sections/affiliates';

// ----------------------------------------------------------------------

export default function AffiliatesCreatePage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('createAffiliate'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('createAffiliate')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <AffiliatesCreateView />
    </>
  );
}
