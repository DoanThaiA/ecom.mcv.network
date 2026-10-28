import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { NewsEditView } from 'src/sections/news';

// ----------------------------------------------------------------------

export default function NewsEditPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('editArticle'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('editArticle')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <NewsEditView />
    </>
  );
}
