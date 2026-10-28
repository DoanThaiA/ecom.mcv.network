import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { CmsUserEditView } from 'src/sections/cms-user';

// ----------------------------------------------------------------------

export default function CmsUserEditPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('editAccount'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('editAccount')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <CmsUserEditView />
    </>
  );
}
