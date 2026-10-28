import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { ReturnView } from 'src/sections/return';

// ----------------------------------------------------------------------

export default function ReturnPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('returnManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('returnManagement')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Return Management" />
        <meta name="keywords" content="cchat,cms,return" />
      </Helmet>

      <ReturnView />
    </>
  );
}
