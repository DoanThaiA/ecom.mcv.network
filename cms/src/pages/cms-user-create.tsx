import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { CmsUserCreateView } from 'src/sections/cms-user';

// ----------------------------------------------------------------------

export default function CmsUserCreatePage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('createAccount'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('createAccount')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <CmsUserCreateView />
    </>
  );
}
