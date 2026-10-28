import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { CmsUserListView } from 'src/sections/cms-user';

// ----------------------------------------------------------------------

export default function CmsUserPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('accountManagement'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('accountManagement')} - ${CONFIG.appName}`}</title>
        <meta name="description" content="CMS Account Management" />
        <meta name="keywords" content="cchat,cms,account,management" />
      </Helmet>

      <CmsUserListView />
    </>
  );
}
