import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { AccountView } from 'src/sections/account';

// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('accountInfo'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('accountInfo')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <AccountView />
    </>
  );
}
