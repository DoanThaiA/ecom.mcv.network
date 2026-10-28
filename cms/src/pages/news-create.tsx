import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { usePageTitle } from 'src/contexts/page-title-context';
import { NewsCreateView } from 'src/sections/news';

// ----------------------------------------------------------------------

export default function NewsCreatePage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t('addArticle'));
  }, [t, setTitle]);

  return (
    <>
      <Helmet>
        <title>{`${t('addArticle')} - ${CONFIG.appName}`}</title>
      </Helmet>

      <NewsCreateView />
    </>
  );
}
