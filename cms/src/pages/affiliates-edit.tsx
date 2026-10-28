import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';

import { AffiliatesEditView } from 'src/sections/affiliates';

// ----------------------------------------------------------------------

export default function AffiliatesEditPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('updateAffiliate'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('updateAffiliate')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <AffiliatesEditView />
    </>
  );
}
